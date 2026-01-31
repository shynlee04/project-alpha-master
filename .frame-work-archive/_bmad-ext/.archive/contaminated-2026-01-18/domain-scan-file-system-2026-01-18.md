# Complete Domain Architecture Map
## File System & Project Management Domain Scan

**Generated**: 2026-01-22T14:30:00+07:00  
**Context**: Fix 2 major issues with project file system and project creation/selection  
**Scope**: Complete mapping of 8 core domains to identify conflicts, duplications, and architectural issues

---

## Executive Summary

**Critical Findings**:
1. **Duplicate Platform Detection** - TWO different implementations causing conflicts
2. **Complex Project Creation Wizard** - 536+ lines, 5-step wizard when simple 2-step flow needed
3. **Route Guard Conflicts** - Platform contract vs screen-width detection mismatch
4. **No "Allow Open Folder" Feature** - Missing UI/UX for random folder access
5. **Dual Store Sources of Truth** - Dexie vs Zustand conflicts for project data
6. **Workspace Binding Confusion** - Three different formats (bindings, workspaceBindings, storageType)
7. **Missing Workspace Entry Guard** - No protection when no project exists for workspace access

**Root Cause**: ADR-033 architectural decisions are partially implemented but not fully enforced across codebase.

---

## 1. Project ID Generation

### Architecture Overview

```
Project ID Formats Found:
├── Standard Format (ARC-D01): proj_{timestamp}_{random}
│   └── Example: proj_1705927800000_abc123xyz
│
├── Browser Mode: proj_browser-default
│   └── File: src/lib/workspace/browser-mode.ts
│
├── Temp Project: alpha-temp-{timestamp}-{random}
│   └── File: src/lib/workspace/temp-project.ts
│
└── Domain Namespaced (deprecated): {workspace}:proj_{timestamp}_{random}
    └── Example: ide:proj_1705927800000_xyz
```

### ID Generation Functions

| Location | Function | Format | Notes |
|----------|----------|--------|-------|
| `project-crud-slice.ts:47` | `generateProjectId()` | Standard `proj_{ts}_{random}` |
| `temp-project.ts:143` | `generateTempProjectId()` | `alpha-temp-{ts}-{random}` (deprecated) |
| `dexie-db-session-types.ts` | Auto-increment for sessions | Session snapshots |
| `dexie-db-core-types.ts` | String IDs | Manually assigned IDs |

### ID Conflicts Identified

```typescript
// CONFLICT 1: Workspace prefixes in ID generation
// Some code expects: ide:proj_123 (ARC-D01 violation)
// But current generator returns: proj_123 (correct per ARC-D01)

// CONFLICT 2: ProjectId vs string
// Domain types: ProjectId = `proj_${number}_${string}`
// Runtime uses: string projectId
// Type safety lost at boundaries

// CONFLICT 3: Browser mode project ID
// Hardcoded: 'proj_browser-default'
// Not following same format as standard projects
```

### ID Flow Diagram

```
User Action (New Project)
    ↓
1. FolderPickerDialog.pickFolder()
    ↓
2. FSA showDirectoryPicker() → handle
    ↓
3. createProjectFromFolder(handle, name)
    ↓
4. useProjectStore.getState().createProject(input)
    ↓
5. project-crud-slice.createProject() → generateProjectId()
    ↓
6. ID = proj_{timestamp}_{random}
    ↓
7. db.projects.put(toRecord(project))
    ↓
8. handlePersistenceService.persistHandle(projectId, handle)
    ↓
9. FSAGateway.initializeViagentFolder(gateway)
    ↓
10. Navigate to /ide/$projectId
```

### Files Using Project IDs

**Dexie Database (Single Source of Truth)**:
- `dexie-db-core-types.ts`: ProjectRecord.id (string primary key)
- `dexie-db.ts`: Projects table with string IDs
- `dexie-db-session-types.ts`: SessionSnapshotRecord.id (string)

**Zustand Store (Transient Cache)**:
- `project-crud-slice.ts`: Project.id (string)
- `project-types.ts`: Project interface extends DomainProject
- `useProjectStore.ts`: Composed from 5 slices

**Domain Layer**:
- `domain/types/project-ids.ts`: ProjectId type, extractWorkspaceType()

**Router**:
- `routes/ide.$projectId.tsx`: Uses projectId as route param
- `routes/notes.$projectId.tsx`: Uses projectId as route param

---

## 2. Database Connection & Types

### Dexie Database Schema

```typescript
ViaGentDatabase extends Dexie {
  // Core Tables
  projects: Table<ProjectRecord, string, ProjectRecord>;
  ideState: Table<IDEStateRecord, string, IDEStateRecord>;
  conversations: Table<ConversationRecord, string, ConversationRecord>;
  
  // Session & Sync Tables
  syncStatus: Table<SyncStatusRecord, string, SyncStatusRecord>;
  fileMetadata: Table<FileMetadataRecord, string, FileMetadataRecord>;
  toolExecutionLogs: Table<ToolExecutionLogRecord, string, ToolExecutionLogRecord>;
  fsaHandles: Table<FSAHandleRecord, string, FSAHandleRecord>;
  sessionSnapshots: Table<SessionSnapshotRecord, string, SessionSnapshotRecord>;
  
  // Knowledge Tables
  sources: Table<SourceRecord, string, SourceRecord>;
  collections: Table<CollectionRecord, string, CollectionRecord>;
  notes: Table<NoteRecord, string, NoteRecord>;
  
  // 25+ more tables...
}
```

### Type Mapping: Dexie ↔ Domain ↔ Store

```typescript
// DEXIE LAYER (Persistence)
interface ProjectRecord {
  id: string;                          // Primary key
  name: string;
  path: string;
  folderPath?: string;
  workspaceId: WorkspaceId;             // PERSIST-S002
  storageType?: StorageType;             // 'fsa' | 'indexeddb'
  workspaceBindings?: WorkspaceBindings;       // ARC-D03 (new)
  bindings?: WorkspaceBindings;             // LEGACY (fallback)
  lastOpened: Date;
  createdAt: Date;
  // ... 20+ more fields
}

// DOMAIN LAYER
interface DomainProject {
  id: ProjectId;                      // Type-safe ID
  name: string;
  folderPath: string;
  // Domain-specific fields...
}

// ZUSTAND STORE LAYER (Transient Cache)
interface Project extends DomainProject {
  storageType: StorageType;
  storageMetadata?: StorageHandleMetadata | null;  // PS-04
  workspaceBindings: WorkspaceBindings;
  tags?: string[];
  // ... store-specific fields
}
```

### Database Initialization Flow

```
App Startup
    ↓
1. dexie-db.ts:getDb()
    ↓
2. ViaGentDatabase constructor
    ↓
3. db.open() → Schema versioning
    ↓
4. initializeDatabaseWithRecovery() (migration handling)
    ↓
5. Database ready
    ↓
6. useProjectStore hydration
    ↓
7. db.projects.toArray() → Zustand store populate
    ↓
8. Ready for use
```

### Connection Management Issues

**Issue 1: Hydration Race Conditions**
```typescript
// PROBLEM: Loader runs before Zustand hydration completes
// File: routes/ide.$projectId.tsx:62-81

await waitForHydration(); // INF-03 FIX
const record = await db.projects.get(projectId);
```

**Issue 2: Dual Storage Sources**
```typescript
// PROBLEM: Zustand store persists to Dexie in project-crud-slice.ts
// BUT Dexie is also accessed directly from hub
// File: HubHomePage.tsx:65

const projects = useLiveQuery(() => db.projects.toArray());
// AND
const project = useProjectStore.getState().getProject(projectId);
```

**Issue 3: Type Conflicts**
```typescript
// PROBLEM: Three different ProjectRecord/Project types

// 1. dexie-db-core-types.ts: ProjectRecord
interface ProjectRecord { id: string; workspaceBindings?: WorkspaceBindings; }

// 2. project-types.ts: Project
interface Project extends DomainProject { storageMetadata?: StorageHandleMetadata; }

// 3. domain/entities/project.ts: DomainProject
interface DomainProject { id: ProjectId; workspaceBindings?: WorkspaceBindings; }

// Which one is the truth?
```

---

## 3. Routing & Navigation

### Route Structure

```
TanStack Router Routes:
├── /                              → HubHomePage
├── /hub                            → HubHomePage (same as /)
├── /ide/$projectId                  → IDEWorkspace
├── /notes/$projectId                → Notes workspace
├── /knowledge/$projectId            → Knowledge workspace
├── /study/$projectId                 → Study workspace
├── /settings                        → Settings
├── /about                          → About
└── /workspace                       → (deprecated)
```

### Navigation Patterns

```typescript
// PATTERN 1: Direct navigation
navigate({ 
  to: '/ide/$projectId', 
  params: { projectId } 
});

// PATTERN 2: Route guard with redirect
// File: ide.$projectId.tsx:42-54
throw redirect({ 
  to: '/notes/$projectId',
  params: { projectId },
  search: { reason: 'mobile-not-supported' }
});

// PATTERN 3: Query param driven navigation
// File: HubHomePage.tsx:82-96
const routerState = useRouterState();
const searchParams = routerState.location.search as {
  workspace?: 'ide' | 'notes' | 'knowledge' | 'study';
  action?: string;
};
// Opens project picker based on workspace param
```

### Route Guards Implemented

```typescript
// GUARD 1: IDE platform contract (ide.$projectId.tsx:42-55)
beforeLoad: async ({ params }) => {
  const platform = getPlatformContract();
  if (!platform.canAccessIDE) {
    console.warn('[IDERoute] Mobile/tablet access denied');
    throw redirect({
      to: '/notes/$projectId',  // Redirect mobile to Notes
      params: { projectId },
      search: { reason: 'mobile-not-supported' }
    });
  }
}

// GUARD 2: Project existence check (ide.$projectId.tsx:69-75)
const record = await db.projects.get(projectId);
if (!record) {
  console.error('[IDERoute.loader] Project not found');
  throw redirect({ to: '/hub' });
}

// MISSING: No guard for workspace access without project!
// Users can click Notes/Knowledge/Study button with no project selected
```

### Window.location vs TanStack Router

```typescript
// OBSERVED: No window.location usage for navigation found
// GOOD: All navigation uses TanStack Router

// However, route params used for side effects:
// File: HubHomePage.tsx:43-50
const searchParams = routerState.location.search as {
  workspace?: string;  // Used to trigger project picker
  action?: string;     // Used to trigger wizard
  message?: string;     // Used for toast messages
};
```

### Workspace Navigation Flow

```typescript
// File: HubHomePage.tsx:105-142

navigateToWorkspace = async (workspace: 'ide' | 'notes' | 'knowledge' | 'study') => {
  // Filter projects by workspace binding
  const workspaceProjects = projects.filter(p => {
    const isIdeWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'ide');
    const isNotesWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'notes');
    // ... check all 4 workspace bindings
  });

  if (workspaceProjects.length === 1) {
    // Single project → navigate directly
    navigate({ to: `/${workspace}/$projectId`, params: { projectId: workspaceProjects[0].id } });
  } else {
    // Multiple projects → show ProjectPickerDialog
    openProjectPicker(workspace);
  }
};
```

---

## 4. Recent Projects System

### Component Architecture

```
HubHomePage.tsx (486 lines)
├── BootSequence (boot animation)
├── HubHero (welcome section)
├── SummaryCardsGrid (dashboard metrics)
├── ChartsGrid (activity charts)
├── BentoGrid (quick action cards)
├── RecentProjectsSection (project list)
├── WorkspaceBindingDialog (workspace config)
├── ProjectPickerDialog (project selection)
├── ProjectCreationWizard (536-line complex wizard)
└── AdvancedSearchDialog (search feature)
```

### RecentProjectsSection Component

```typescript
// File: presentation/components/hub/RecentProjectsSection.tsx (127 lines)

interface RecentProjectsSectionProps {
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  recentProjects: Project[];           // Pre-sorted, top 5
  isLoading: boolean;
}

export const RecentProjectsSection: React.FC<RecentProjectsSectionProps> = ({
  recentProjects,
  isLoading,
  onNewProject,
  onOpenProject,
}) => {
  // Displays:
  // - Section header with "View All" link → /workspace
  // - File directory style table (Name, Status, Last Modified, Size)
  // - Loading skeleton state
  // - Empty state with CTA
  // - Workspace badges on each project (IDE, Notes, Knowledge, Study)
  // ...
};
```

### Recent Projects Data Flow

```
Data Source:
    ↓
db.projects.toArray() → useLiveQuery (dexie-react-hooks)
    ↓
HubHomePage:65 → const projects = useLiveQuery(() => db.projects.toArray())
    ↓
HubHomePage:71-78 → const recentProjects = useMemo(() => {
  return (projects || [])
    .sort((a, b) => {
      const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
      const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
      return timeB - timeA;  // Most recent first
    })
    .slice(0, 5);  // Top 5 only
}, [projects]);
```

### Project Opening Flow

```typescript
// File: HubHomePage.tsx:246-275

const handleOpenRecentProject = (projectId: string) => {
  const project = (projects || []).find(p => p.id === projectId);
  if (!project) return;
  
  // Navigate directly to first available workspace (priority order)
  // Priority: ide > knowledge > notes > study
  const bindings = project.workspaceBindings || project.bindings;
  
  const isEnabled = (value: boolean | string | undefined): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return false;
  };
  
  // Check workspaces in priority order
  if (isEnabled(bindings?.ide)) {
    navigate({ to: '/ide/$projectId', params: { projectId } });
  } else if (isEnabled(bindings?.knowledge)) {
    navigate({ to: '/knowledge/$projectId', params: { projectId } });
  } else if (isEnabled(bindings?.notes)) {
    navigate({ to: '/notes/$projectId', params: { projectId } });
  } else if (isEnabled(bindings?.study)) {
    navigate({ to: '/study/$projectId', params: { projectId } });
  } else {
    // No workspaces enabled → show WorkspaceBindingDialog
    setSelectedProject(project);
    setDialogOpen(true);  // User needs to configure workspaces
  }
};
```

---

## 5. Folder/Open Picker

### Folder Picker Architecture

```
FolderPickerDialog (329 lines)
├── Main Folder Picker Dialog
│   ├── pickFolder() → window.showDirectoryPicker()
│   ├── Folder overlap detection (ARC-B07)
│   ├── handle: FileSystemDirectoryHandle
│   └── folderName: string
│
├── Folder Overlap Warning Dialog
│   ├── Same path → BLOCK
│   ├── Parent/child → WARN with confirm/cancel
│   └── checkFolderOverlap() service
│
├── Compact Folder Picker (mobile screens)
│   ├── Pick Folder button
│   └── Use Temp Project Instead button
│
└── Fallback: onFallbackToTemp() → getOrCreateTempProject()
```

### "Allow Open Folder" Feature Status

**CRITICAL FINDING**: This feature is MISSING

User Requirement: "allow for open folder → load random folder → do not register to project + no hot load"

Current Implementation:
```typescript
// File: FolderPickerDialog.tsx:76-108

const handlePickFolder = async () => {
  setIsPicking(true);
  
  try {
    const result = await pickFolder();  // Opens directory picker
    
    if (result.success && result.handle && result.folderName) {
      // Overlap check
      const overlapResult = await checkFolderOverlap(result.handle.name);
      
      if (overlapResult.shouldBlock) {
        // Block same path
        setOverlapCheck({ result: overlapResult, folderPath: result.handle.name, handle: result.handle });
        return;
      }
      
      if (overlapResult.hasOverlap) {
        // Warn on parent/child overlap
        setOverlapCheck({ result: overlapResult, folderPath: result.handle.name, handle: result.handle });
        return;
      }
      
      // NO OVERLAP → ALWAYS CREATES PROJECT
      await finishProjectCreation(result.handle, result.folderName);
    }
  }
};
```

**What's Missing**:
1. "Open Folder (Don't Create Project)" button/option
2. Read-only folder access without project registration
3. "Load Random Folder" capability
4. No hot-load (file watching disabled)
5. No temp workspace or "view mode" for random folders

### Folder Picker API Usage

```typescript
// File: lib/workspace/fsa-persistence.ts:76-114

export async function pickFolder(): Promise<FolderPickResult> {
  // Check FSA support
  if (!isFSASupported()) {
    return { success: false, reason: 'not_supported' };
  }
  
  try {
    // Open system directory picker
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      id: undefined,  // NO persistent ID - user picks fresh each time
    });
    
    return {
      success: true,
      handle,
      folderName: handle.name,
    };
  } catch (error) {
    const err = error as Error;
    
    if (err.name === 'AbortError') {
      return { success: false, reason: 'aborted' };
    }
    
    return {
      success: false,
      reason: 'error',
      error: err,
    };
  }
}
```

---

## 6. Workspace Navigation

### Workspace Entry Points

```
HubHomePage Bento Grid:
├── CREATE PROJECT (new-project)
│   └── Opens ProjectCreationWizard (536-line complex wizard)
│
├── NOTES (notes)
│   └── navigateToWorkspace('notes') → Check workspace bindings
│
├── KNOWLEDGE (knowledge)
│   └── navigateToWorkspace('knowledge') → Check workspace bindings
│
├── STUDY (study)
│   └── navigateToWorkspace('study') → Check workspace bindings
│
├── TERMINAL (terminal)
│   └── Toast: "Please access terminal via an active Workspace"
│
├── SETTINGS (settings)
│   └── navigate({ to: '/settings' })
│
└── ABOUT (about)
    └── navigate({ to: '/about' })
```

### Workspace Guard Status

```typescript
// File: HubHomePage.tsx:105-142

navigateToWorkspace = async (workspace: 'ide' | 'notes' | 'knowledge' | 'study') => {
  if (!projects || projects.length === 0) {
    // ✅ GOOD: Toast with message
    toast.info(`No projects yet`, {
      description: `Create or mount a project first to access to ${workspace} workspace.`,
      duration: 5000,
    });
    
    // ❌ MISSING: No navigation guard or redirect
    // User stays on hub page, can click workspace buttons infinitely
    return;  // NO NAVIGATION BLOCKING
  }
  
  // Filter projects by workspace binding
  const workspaceProjects = projects.filter(p => {
    const bindings = p.workspaceBindings || p.bindings;
    return isWorkspaceEnabled(bindings, workspace);  // Check if project has this workspace enabled
  });
  
  if (workspaceProjects.length === 0) {
    // No projects with this workspace enabled
    toast.info(`No ${workspace} projects found`, {
      description: `Create a project or enable ${workspace} binding in existing project.`,
      duration: 5000,
    });
    return;  // ❌ NO FALLBACK TO CREATE PROJECT
  }
  
  // Navigate or show picker
  if (workspaceProjects.length === 1) {
    navigate({ to: `/${workspace}/$projectId`, params: { projectId: workspaceProjects[0].id } });
  } else {
    openProjectPicker(workspace);  // Multiple projects → show dialog
  }
};
```

### Workspace Binding Storage

```typescript
// THREE DIFFERENT FORMATS FOUND:

// FORMAT 1: workspaceBindings (ARC-D03 - New Canonical)
interface WorkspaceBindings {
  ide: boolean;
  knowledge: boolean;
  notes: boolean;
  study: boolean;
}

// FORMAT 2: bindings (Legacy Fallback)
type LegacyBindings = Record<string, string | boolean>;

// FORMAT 3: storageType (Storage Selection)
type StorageType = 'fsa' | 'indexeddb';

// USAGE IN ProjectRecord:
interface ProjectRecord {
  workspaceBindings?: WorkspaceBindings;  // Preferred (ARC-D03)
  bindings?: WorkspaceBindings;          // Legacy (backward compatibility)
  storageType?: StorageType;             // 'fsa' | 'indexeddb'
  folderPath?: string;                   // Physical path (for FSA)
  path?: string;                         // Generic path
}

// CONFLICT: Which one to use?
// Code falls back: bindings || workspaceBindings
```

---

## 7. File System Adapters

### Storage Adapter Architecture

```typescript
// DOMAIN INTERFACE (contracts)
interface StorageAdapter {
  name: string;                    // 'fsa' | 'indexeddb'
  requestAccess(): Promise<FileSystemDirectoryHandle | void>;
  setDirectoryHandle(handle: FileSystemDirectoryHandle): void;
  getDirectoryHandle(): FileSystemDirectoryHandle | null;
  isAvailable(): boolean;
  readFile(path: string): Promise<FileContent>;
  writeFile(path: string, content: Uint8Array): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listFiles(pattern: string): Promise<string[]>;
  getMetadata(path: string): Promise<FileMetadata>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
  dispose(): void;
}
```

### Adapter Implementations

```
File System Layer:
├── FSAStorageAdapter (667 lines)
│   ├── Uses: window.showDirectoryPicker()
│   ├── Implements: StorageAdapter interface
│   ├── File watching: Polling-based (2s interval)
│   ├── Hashing: SHA-256 for change detection
│   └── Singleton: getFSAStorageAdapter()
│
├── IndexedDBStorageAdapter (NOT FOUND)
│   └── Should exist but not in codebase
│
└── StorageAdapterFactory
    ├── File: Not found in expected location
    └── Should route to FSA or IndexedDB based on platform
```

### File Watching Implementation

```typescript
// File: infrastructure/filesystem/fsa-storage-adapter.ts:390-533

// PROBLEM: No native file watching API available
// SOLUTION: Polling-based file watching

watch(callback: FileChangeCallback): () => void {
  this.watchCallbacks.add(callback);
  
  // Start polling if not already running
  if (!this.watchInterval) {
    this.startPolling();
  }
  
  // Return unsubscribe function
  return () => {
    this.watchCallbacks.delete(callback);
    if (this.watchCallbacks.size === 0) {
      this.stopPolling();  // Stop polling when no callbacks
    }
  };
}

private startPolling(): void {
  this.watchInterval = setInterval(async () => {
    await this.checkForChanges();  // Poll every 2s
  }, this.watchOptions.pollInterval);  // Default: 2000ms
  
  // Do initial hash scan
  this.scanAllFiles().catch(console.error);
}

private checkForChanges(): Promise<void> {
  // 1. Scan all files
  const currentFiles = await this.getAllFiles(this.directoryHandle, '');
  
  // 2. Check for modified/deleted/created files
  // 3. Emit change events
}
```

### Storage Gateway Routing

```typescript
// File: lib/workspace/fsa-persistence.ts (uses FSAGateway)
// File: infrastructure/filesystem/fsa-gateway.ts (NOT FOUND in current codebase)

// CURRENT IMPLEMENTATION:
export async function createProjectFromFolder(...) {
  const gateway = new FSAGateway(handle);  // Used in v1, may be archived
  await initializeViagentFolder(gateway, {
    projectId,
    projectName: folderName,
    storageType: 'fsa',
    workspaceBindings: requiredBindings,
  });
}

// MISSING: StorageAdapterFactory for runtime adapter selection
// Should route to:
// - FSAStorageAdapter if platform.storageType === 'fsa'
// - IndexedDBStorageAdapter if platform.storageType === 'indexeddb'
```

---

## 8. State Management

### Zustand Store Architecture

```
Project Store (Canonical Location):
├── useProjectStore.ts (148 lines)
│   ├── State: projects, activeProjectId, _hasHydrated
│   └── Methods: Composed from 5 slices
│
Slices:
├── project-crud-slice.ts (302 lines)
│   ├── createProject(), updateProject(), deleteProject()
│   ├── setActiveProject(), getProject(), getAllProjects()
│   └── restoreProjectHandle()
│
├── project-bindings-slice.ts (111 lines)
│   ├── updateProjectBindings(), getProjectBindings()
│   ├── validateBindings(), getEnabledWorkspaces()
│   └── getDefaultWorkspace()
│
├── project-permissions-slice.ts (87 lines)
│   ├── updateProjectPermission(), getProjectPermission()
│   ├── getProjectsWithPermission(), checkProjectPermission()
│   └── invalidateProjectPermission()
│
├── project-layout-slice.ts (62 lines)
│   ├── saveProjectLayout(), getProjectLayout()
│   └── clearProjectLayout()
│
└── project-utils-slice.ts (168 lines)
    ├── updateLastOpened(), hydrateProjects()
    ├── getRecentProjects(), searchProjects()
    ├── getProjectsByWorkspace(), getDefaultProjectForWorkspace()
    └── getProjectStats()
```

### Store Persistence Strategy

```typescript
// File: infrastructure/persistence/stores/project/useProjectStore.ts

// ❌ OBSOLETE PATTERN (Lines 50-53):
// FIX-2026-01-06: REMOVED localStorage persist
// Dexie is the SINGLE SOURCE OF TRUTH for projects

export const useProjectStore = create<CombinedProjectState>()(
  (set, get, api) => ({
    projects: {},
    activeProjectId: null,
    _hasHydrated: false,
    
    ...createProjectCrudSlice(set, get, api),
    ...createProjectBindingsSlice(set, get, api),
    ...createProjectPermissionsSlice(set, get, api),
    ...createProjectLayoutSlice(set, get, api),
    ...createProjectUtilsSlice(set, get, api),
  })
);

// ⚠️ ISSUE: Store is now a transient in-memory cache
// ⚠️ ISSUE: No persist middleware (intentionally removed)
// ⚠️ ISSUE: Components must read from Dexie directly
```

### Store Usage Patterns

```typescript
// PATTERN 1: Direct Dexie Access (Hub)
// File: HubHomePage.tsx:65

const projects = useLiveQuery(() => db.projects.toArray());
// ✅ GOOD: Reads directly from Dexie (source of truth)

// PATTERN 2: Store Access (Route Loader)
// File: routes/ide.$projectId.tsx:69-74

const record = await db.projects.get(projectId);
// ✅ GOOD: Reads directly from Dexie (not store facade)

// PATTERN 3: Store Access (UI Components)
// File: HubHomePage.tsx:20

import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
// ❌ PROBLEM: Using store which is now just cache
// Should use useLiveQuery(db.projects.toArray()) instead
```

---

## 9. Conflict Analysis

### Critical Conflicts Summary

#### Conflict 1: Duplicate Platform Detection
**Severity**: HIGH  
**Impact**: Wrong platform detection causes UI failures

| Location | Method | Detection Logic | Problem |
|----------|--------|----------------|---------|
| `lib/utils/platform-detection.ts` | `isDesktopPlatform()` | Screen width + touch + UA | Uses screen size (wrong!) |
| `infrastructure/filesystem/platform-detection.ts` | `detectDeviceType()` | UA + screen size | Uses screen size (wrong!) |

**Root Cause**: Both use `window.screen.width >= 1024` to determine desktop vs mobile/tablet. This is incorrect per ADR-033.

**User Issue 1**: Desktop user with 800px wide window → Detected as mobile → Wrong UI
**User Issue 2**: Device detection logic scattered across files (violates DRY)

#### Conflict 2: Complex Project Creation Wizard
**Severity**: MEDIUM  
**Impact**: User frustration, 536-line wizard when 2-step flow needed

```
Current State (User Report):
- "Failed to create project. Please try again."
- 536-line ProjectCreationWizard.tsx
- 5 steps with optional substeps
- 5 different form sections

User Requirement:
- Simplified 2-step wizard
- "Turn 1 - New User - Desktop Project Creation"
- Should be: Pick folder → Navigate to IDE
```

**Why Complex?**
- ProjectCreationWizard has 5 steps with optional substeps
- WorkspaceSetupStep, AgentSelectionStep, FileSetupStep, ReviewStep
- 513+ lines of wizard logic
- Multiple state management files
- Complex form validation

**What's Actually Needed?**
- File: `FolderPickerDialog.tsx` (329 lines) provides simplified flow
- Pick folder → Create project → Navigate
- BUT: Not integrated with "Create Project" button on hub

#### Conflict 3: Route Guard Platform Mismatch
**Severity**: HIGH  
**Impact**: Wrong routing decisions, mobile blocked from IDE incorrectly

```typescript
// File: routes/ide.$projectId.tsx:47-48

beforeLoad: async ({ params }) => {
  const platform = getPlatformContract();  // Uses platform-contract.ts
  if (!platform.canAccessIDE) {
    // Mobile/tablet → redirect to Notes
    throw redirect({ to: '/notes/$projectId', ... });
  }
};
```

**Problem**:
- `platform-contract.ts` uses `detectDeviceType()` which checks screen width >= 1024
- Desktop user with 800px window → `deviceType: 'mobile'` → `canAccessIDE: false`
- Mobile user with 1200px screen → `deviceType: 'desktop'` → `canAccessIDE: true` (but no FSA on mobile!)

#### Conflict 4: No "Allow Open Folder" Feature
**Severity**: MEDIUM  
**Impact**: Missing user requirement, cannot access folders without project

```
User Requirement: "allow for open folder → load random folder → do not register to project + no hot load"

Current Implementation:
- FolderPickerDialog only creates projects
- No "open folder (read-only)" mode
- No "random folder load" without project
- No way to disable file watching (hot-load)
```

**What's Needed**:
1. Add "Open Folder (View Only)" button to FolderPickerDialog
2. Add `isReadOnly` parameter to createProjectFromFolder()
3. Skip FSA handle persistence for read-only mode
4. Disable file watching for read-only mode
5. Navigate to IDE without creating project

#### Conflict 5: Workspace Binding Field Confusion
**Severity**: MEDIUM  
**Impact**: Confusing code, multiple formats for same data

```typescript
// THREE DIFFERENT WAYS TO ACCESS WORKSPACE BINDINGS:

// METHOD 1: workspaceBindings (ARC-D03 - new canonical)
project.workspaceBindings?.ide

// METHOD 2: bindings (legacy fallback)
project.bindings?.ide

// METHOD 3: Direct workspaceId check
project.workspaceId === 'ide'
```

**Problem**: Code has to handle all three formats:
- Backward compatibility with legacy `bindings` field
- New canonical `workspaceBindings` field (ARC-D03)
- Direct `workspaceId` field from ProjectRecord

**Where Used**:
- HubHomePage:252-273 handles both `workspaceBindings` and `bindings`
- project-crud-slice.ts:97 handles both formats
- Multiple fallback checks throughout codebase

#### Conflict 6: Store Synchronization Issues
**Severity**: HIGH  
**Impact**: Data inconsistency between Dexie and Zustand

```typescript
// SCENARIO: New project creation

// Step 1: FolderPickerDialog.pickFolder()
await window.showDirectoryPicker();
const handle = ...;

// Step 2: createProjectFromFolder()
const projectId = useProjectStore.getState().createProject({
  name: handle.name,
  folderPath: handle.name,
  // Updates Zustand store immediately
  // Also calls db.projects.put() (async, non-blocking)
});

// Step 3: Navigation
navigate({ to: '/ide/$projectId', params: { projectId } });

// Step 4: Route loader loads
const record = await db.projects.get(projectId);
// ⚠️ RISK: Zustand may not have persisted yet!

// Step 5: IDE route component
const project = record as unknown as Project;
// ⚠️ RISK: Data from Dexie may not match Zustand cache
```

**Problem**: Async non-blocking persistence creates race conditions where Zustand state is stale.

#### Conflict 7: Missing Workspace Entry Guards
**Severity**: MEDIUM  
**Impact**: "Search keywords: to space → to space no project (ux ui callapse) → no hot load nothing load"

```
User Report: "Icon connected to space → to space no project (ux ui callapse) → no hot load nothing load (monaco nor filetree)"

Current Implementation:
// File: HubHomePage.tsx:105-142

navigateToWorkspace = async (workspace: 'ide' | 'notes' | 'knowledge' | 'study') => {
  if (!projects || projects.length === 0) {
    // ✅ Toast message shown
    // ❌ NO GUARD: Returns immediately
    toast.info(`No projects yet`, ...);
    return;  // User can still click workspace buttons infinitely
  }
  
  // Filter projects by workspace
  const workspaceProjects = projects.filter(p => {
    return isWorkspaceEnabled(p.workspaceBindings, workspace);
  });
  
  if (workspaceProjects.length === 0) {
    // ✅ Toast message shown
    // ❌ NO FALLBACK: Returns immediately
    toast.info(`No ${workspace} projects found`, ...);
    return;  // User stuck with no way to create project
  }
  
  // Navigate or show picker
};
```

**Problem**: When no project exists with workspace enabled:
- User sees toast
- No navigation guard blocking further action
- Can click same workspace button infinitely
- UX collapse (as user reported)

**Missing**:
- Guard to prevent re-triggering workspace navigation
- Auto-open ProjectCreationWizard when no project found
- Or redirect to /hub with query param to trigger project creation

#### Conflict 8: File Watching vs "No Hot Load"
**Severity**: MEDIUM  
**Impact**: User requirement for "no hot load" but file watching always enabled

```typescript
// File: infrastructure/filesystem/fsa-storage-adapter.ts

// CURRENT: File watching always enabled
watch(callback: FileChangeCallback): () => void {
  this.watchCallbacks.add(callback);
  
  if (!this.watchInterval) {
    this.startPolling();  // Always starts watching
  }
}

// USER REQUIREMENT: "do not register to project + no hot load"
// Means: Read-only folder access without project registration
// AND: No file watching/polling
```

**Problem**: No way to disable file watching:
- `isWatchFiles` in PlatformContract is read-only (from FSA support check)
- No parameter to `FSAStorageAdapter` constructor to disable watching
- No `readWriteMode` option in StorageAdapter interface

---

## 10. Recommendations

### Recommendation 1: Consolidate Platform Detection
**Priority**: CRITICAL  
**Effort**: 2-3 hours

**Actions**:
1. Archive `lib/utils/platform-detection.ts` (legacy, wrong logic)
2. Use only `infrastructure/filesystem/platform-contract.ts`
3. Update all imports to use `getPlatformContract()`
4. Add browser capability detection (not just UA + screen size)
5. Ensure `canAccessIDE` is computed correctly:
   - Desktop with FSA support → `true`
   - Desktop without FSA → `false` (corrects current bug!)
   - Mobile/tablet → `false`

**Testing**:
- Test on desktop Chrome with FSA: `canAccessIDE: true`
- Test on desktop Chrome without FSA: `canAccessIDE: false`
- Test on mobile Safari: `canAccessIDE: false`
- Test on desktop with 800px width: Should still be `desktop` (not `mobile`!)

### Recommendation 2: Simplify Project Creation Flow
**Priority**: HIGH  
**Effort**: 4-6 hours

**Actions**:
1. Keep `FolderPickerDialog.tsx` (329 lines) as primary flow
2. Archive `ProjectCreationWizard.tsx` (536 lines) to `_bmad-ext/.archive/`
3. Update HubHomePage to use FolderPickerDialog directly
4. Add "Create Project" button to open FolderPickerDialog
5. Flow: Click "Create Project" → FolderPickerDialog → Pick folder → Navigate to IDE

**Simplified Flow**:
```
HubHomePage
  └── "Create Project" button
       └── onClick → setFolderPickerOpen(true)
       
FolderPickerDialog
  ├── Pick folder
  ├── Create project
  └── Navigate to /ide/$projectId
```

### Recommendation 3: Add "Allow Open Folder" Feature
**Priority**: MEDIUM  
**Effort**: 3-4 hours

**Actions**:
1. Add "Open Folder (View Only)" button to FolderPickerDialog
2. Add `isReadOnly: boolean` parameter to `createProjectFromFolder()`
3. Skip FSA handle persistence when `isReadOnly === true`
4. Disable file watching when read-only mode
5. Update route guards to allow read-only mode without project
6. Add UI to indicate "View Mode" in IDE

**Implementation**:
```typescript
// Update interface
interface FolderPickResult {
  success: boolean;
  reason?: 'aborted' | 'not_supported' | 'error';
  handle?: FileSystemDirectoryHandle;
  folderName?: string;
  isReadOnly?: boolean;  // NEW PARAMETER
}

// Update createProjectFromFolder
export async function createProjectFromFolder(
  handle: FileSystemDirectoryHandle,
  folderName: string,
  options?: CreateFromFolderOptions & { isReadOnly?: boolean }
): Promise<string> {
  const isReadOnly = options?.isReadOnly ?? false;
  
  const projectInput: CreateProjectInput = {
    name: folderName,
    folderPath: handle.name,
    storageMetadata: serializeHandle(handle, 'ide'),
    storageType: isReadOnly ? 'indexeddb' : 'fsa',  // No FSA if read-only
    // ... rest of fields
  };
  
  if (!isReadOnly) {
    // Skip project persistence and handle storage for read-only
    const projectId = useProjectStore.getState().createProject(projectInput);
    await handlePersistenceService.persistHandle(projectId, handle, 'ide');
  }
  
  return projectId;
}
```

### Recommendation 4: Consolidate Workspace Binding Fields
**Priority**: MEDIUM  
**Effort**: 2-3 hours

**Actions**:
1. Phase 1: Add migration to convert all `bindings` to `workspaceBindings` in Dexie
2. Phase 2: Update all code to only check `workspaceBindings`
3. Phase 3: Remove fallback `bindings` checks from codebase
4. Update type definitions to remove `bindings?: WorkspaceBindings`
5. Add validation to ensure consistency

**Migration Script**:
```typescript
// One-time migration
export async function migrateBindingsToWorkspaceBindings() {
  const projects = await db.projects.toArray();
  
  for (const project of projects) {
    if (project.bindings && !project.workspaceBindings) {
      await db.projects.update(project.id, {
        workspaceBindings: {
          ide: project.bindings.ide === 'true' || project.bindings.ide === true,
          knowledge: project.bindings.knowledge === 'true' || project.bindings.knowledge === true,
          notes: project.bindings.notes === 'true' || project.bindings.notes === true,
          study: project.bindings.study === 'true' || project.bindings.study === true,
        },
        bindings: undefined,  // Clear legacy field
      });
    }
  }
}
```

### Recommendation 5: Add Workspace Entry Guards
**Priority**: HIGH  
**Effort**: 1-2 hours

**Actions**:
1. Add guard in `navigateToWorkspace` to prevent re-triggering
2. When no projects, show ProjectCreationWizard instead of toast
3. Or redirect to `/hub?action=create-project` to trigger wizard
4. Add loading state to prevent double-clicking
5. Show clear CTA: "Create a project to access this workspace"

**Implementation**:
```typescript
// File: HubHomePage.tsx:105-142

let isNavigatingToWorkspace = false;  // Guard flag

const navigateToWorkspace = async (workspace: 'ide' | 'notes' | 'knowledge' | 'study') => {
  // Prevent double-trigger
  if (isNavigatingToWorkspace) {
    console.warn('[HubHomePage] Workspace navigation already in progress');
    return;
  }
  
  isNavigatingToWorkspace = true;
  
  try {
    if (!projects || projects.length === 0) {
      // Show project creation wizard instead of toast
      setProjectCreationWizardOpen(true);
      
      toast.info(`No projects yet. Create a project to access ${workspace} workspace.`, {
        description: "Click 'Create Project' to get started",
        duration: 5000,
      });
      
      return;  // Block navigation
    }
    
    if (workspaceProjects.length === 0) {
      // No projects with this workspace
      setProjectPickerWorkspace(workspace);
      setProjectPickerOpen(true);  // Open picker to create project
      
      toast.info(`No ${workspace} projects found.`, {
        description: "Select 'Create Project' in the picker to create one with this workspace enabled.",
        duration: 5000,
      });
      
      return;
    }
    
    // Continue with navigation...
  } finally {
    isNavigatingToWorkspace = false;  // Release guard
  }
};
```

### Recommendation 6: Fix Store Synchronization
**Priority**: HIGH  
**Effort**: 4-6 hours

**Actions**:
1. Remove async non-blocking from `project-crud-slice.ts:149-154`
2. Make `createProject()` await Dexie persistence before returning
3. Update all store mutation methods to be synchronous-then-persist
4. Add loading states to indicate persistence in progress
5. Use `await waitForHydration()` in all route loaders
6. Add retry logic for failed persistence

**Implementation**:
```typescript
// File: infrastructure/persistence/stores/project/project-crud-slice.ts

createProject: (input: CreateProjectInput) => {
  const projectId = generateProjectId();
  const now = new Date();
  
  const project: Project = {
    id: projectId,
    name: input.name,
    folderPath: input.folderPath,
    // ...
  };
  
  // Update Zustand store
  set((state) => ({
    projects: { ...state.projects, [projectId]: project },
    activeProjectId: projectId,
  }));
  
  // ✅ FIX: Await Dexie persistence
  try {
    await db.projects.put(toRecord(project, workspaceType));
    console.log('[ProjectStore] Project persisted to Dexie:', projectId);
  } catch (error) {
    console.error('[ProjectStore] Failed to persist project:', error);
    throw error;  // Surface error to caller
  }
  
  // ✅ FIX: Only return after persistence succeeds
  return projectId;
}
```

### Recommendation 7: Implement Storage Gateway
**Priority**: MEDIUM  
**Effort**: 2-3 hours

**Actions**:
1. Create `StorageAdapterFactory.ts` in `infrastructure/filesystem/`
2. Implement `IndexedDBStorageAdapter` (currently missing)
3. Route to correct adapter based on `PlatformContract.storageType`
4. Add fallback logic when primary adapter unavailable
5. Export singleton `getStorageAdapter()` function

**Implementation**:
```typescript
// NEW FILE: infrastructure/filesystem/storage-gateway-factory.ts

export function getStorageAdapter(storageType: StorageType): StorageAdapter {
  switch (storageType) {
    case 'fsa':
      return getFSAStorageAdapter();
    case 'indexeddb':
      return getIndexedDBStorageAdapter();  // Need to implement
    default:
      throw new Error(`Unsupported storage type: ${storageType}`);
  }
}

export function getAutoStorageAdapter(): StorageAdapter {
  const platform = getPlatformContract();
  return getStorageAdapter(platform.storageType);
}
```

### Recommendation 8: Add Read-Only Mode to Storage Adapter
**Priority**: MEDIUM  
**Effort**: 2-3 hours

**Actions**:
1. Add `watchEnabled` parameter to `StorageAdapter` interface
2. Pass `watchEnabled` from project metadata
3. Skip `watch()` call if `watchEnabled === false`
4. Add `setWatchEnabled()` method to `FSAStorageAdapter`
5. Persist `watchEnabled` in project settings

**Implementation**:
```typescript
// Update StorageAdapter interface
interface StorageAdapter {
  watchEnabled: boolean;  // NEW
  setWatchEnabled(enabled: boolean): void;  // NEW
  watch(callback: FileChangeCallback): () => void;
  // ... rest of methods
}

// Update FSAStorageAdapter
class FSAStorageAdapter implements StorageAdapter {
  private watchEnabled: boolean = true;  // Default enabled
  
  setWatchEnabled(enabled: boolean): void {
    this.watchEnabled = enabled;
    if (!enabled && this.watchInterval) {
      this.stopPolling();  // Stop watching
    }
  }
  
  watch(callback: FileChangeCallback): () => void {
    if (!this.watchEnabled) {
      console.log('[FSAStorageAdapter] File watching disabled, skipping watch setup');
      return () => {};  // Return no-op unsubscribe
    }
    
    // Normal watch setup...
  }
}
```

---

## Appendix: File Inventory

### Key Files by Domain

**Project ID Generation**:
- `src/infrastructure/persistence/stores/project/project-crud-slice.ts` (302 lines)
- `src/infrastructure/persistence/stores/project/project-types.ts`
- `src/domain/types/project-ids.ts`
- `src/lib/workspace/browser-mode.ts`
- `src/lib/workspace/temp-project.ts`

**Database & Types**:
- `src/infrastructure/persistence/dexie-db.ts` (1165 lines)
- `src/infrastructure/persistence/dexie-db-class.ts`
- `src/infrastructure/persistence/dexie-db-core-types.ts` (164 lines)
- `src/infrastructure/persistence/dexie-db-session-types.ts`
- `src/infrastructure/persistence/dexie-db-helpers.ts`

**Routing**:
- `src/routes/index.tsx`
- `src/routes/ide.$projectId.tsx` (118 lines)
- `src/routes/notes.$projectId.tsx`
- `src/routes/knowledge.$projectId.tsx`
- `src/routes/study.$projectId.tsx`

**Platform Detection** (DUPLICATE):
- `src/infrastructure/filesystem/platform-contract.ts` (340 lines) ✅ CORRECT
- `src/lib/utils/platform-detection.ts` (149 lines) ❌ WRONG (uses screen width)
- `src/lib/utils/platform-detection.ts` should be archived

**Recent Projects**:
- `src/presentation/components/hub/RecentProjectsSection.tsx` (127 lines)
- `src/presentation/components/hub/ProjectCard.tsx`
- `src/presentation/components/hub/HubHomePage.tsx` (486 lines)
- `src/presentation/components/hub/ProjectCreationWizard.tsx` (536+ lines) ❌ TOO COMPLEX

**Folder Picker**:
- `src/presentation/components/workspace/FolderPickerDialog.tsx` (329 lines)
- `src/lib/workspace/fsa-persistence.ts` (210 lines)

**File System Adapters**:
- `src/infrastructure/filesystem/fsa-storage-adapter.ts` (667 lines)
- `src/infrastructure/filesystem/platform-detection.ts` (318 lines) ✅ CORRECT
- `src/infrastructure/filesystem/storage-types.ts`

**State Management**:
- `src/infrastructure/persistence/stores/project/useProjectStore.ts` (148 lines)
- `src/infrastructure/persistence/stores/project/project-crud-slice.ts` (302 lines)
- `src/infrastructure/persistence/stores/project/project-bindings-slice.ts` (111 lines)
- `src/infrastructure/persistence/stores/project/project-permissions-slice.ts` (87 lines)
- `src/infrastructure/persistence/stores/project/project-layout-slice.ts` (62 lines)
- `src/infrastructure/persistence/stores/project/project-utils-slice.ts` (168 lines)

---

## Implementation Priority Matrix

| Recommendation | Priority | Effort | Impact | Dependencies |
|--------------|----------|---------|--------|--------------|
| 1. Consolidate Platform Detection | CRITICAL | 2-3h | Fixes "device detection wrong" | None |
| 2. Simplify Project Creation Flow | HIGH | 4-6h | Fixes "536-line wizard" | FolderPickerDialog |
| 3. Add Workspace Entry Guards | HIGH | 1-2h | Fixes "to space no project" | None |
| 4. Fix Store Synchronization | HIGH | 4-6h | Fixes data inconsistency | Dexie, store slices |
| 5. Consolidate Workspace Binding Fields | MEDIUM | 2-3h | Reduces code complexity | None |
| 6. Add "Allow Open Folder" Feature | MEDIUM | 3-4h | User requirement | Storage adapter |
| 7. Implement Storage Gateway | MEDIUM | 2-3h | Architectural cleanup | Storage adapters |
| 8. Add Read-Only Mode | MEDIUM | 2-3h | User requirement | Storage adapter |

**Total Estimated Effort**: 20-36 hours (2-4 days for 1 developer)

---

## Conclusion

This domain scan reveals **significant architectural debt** in the file system and project management domain:

1. **Duplicate implementations** of core services (platform detection, workspace bindings)
2. **Complex flows** where simple flows are needed (project creation wizard)
3. **Missing features** that users explicitly requested ("allow open folder")
4. **Race conditions** between different storage layers (Dexie vs Zustand)
5. **Inadequate guards** for workspace navigation
6. **Type confusion** from multiple formats for the same data

**Root Cause**: ADR-033 decisions are partially implemented but not consistently enforced. The codebase shows evidence of multiple development waves with inconsistent patterns.

**Recommended Approach**: 
1. Fix CRITICAL issues first (platform detection, store synchronization)
2. Then address user-facing issues (simplified project creation, workspace guards)
3. Finally consolidate architectural debt (workspace bindings, storage gateway)

**Next Steps**: Implement fixes in priority order, with proper testing and validation at each step.

---

**End of Domain Scan**

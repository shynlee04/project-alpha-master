# Spike Entry Page Architecture Investigation

**Date:** 2026-01-17
**Investigator:** analyst-ext
**Scope:** `src/spike/` directory

---

## Executive Summary

The spike directory contains significant infrastructure for platform detection, project management, and workspace switching, but is **missing critical routing infrastructure** for an entry page. The spike was designed as an "isolated testing environment for routing and user journey validation" but lacks the TanStack Router file-based routes that would enable this.

---

## 1. File Listing: `src/spike/`

### Directory Structure

```
src/spike/
├── README.md                              # Spike documentation (36 lines)
├── components/
│   ├── common/
│   │   ├── MainLayout.tsx                 # ✅ EXISTS - Responsive layout wrapper
│   │   ├── WorkspaceSwitcher.tsx          # ✅ EXISTS - Workspace dropdown
│   │   ├── ProjectPickerDialog.tsx        # ✅ EXISTS - Project selection
│   │   ├── FolderPickerDialog.tsx         # ✅ EXISTS - Project creation
│   │   ├── FolderPickerCompact.tsx        # ✅ EXISTS - Mobile variant
│   │   ├── ErrorBoundary.tsx              # ✅ EXISTS - Error handling
│   │   └── UnsavedChangesDialog.tsx       # ✅ EXISTS - Unsaved changes guard
│   ├── ide/
│   │   ├── IDELayout.tsx                  # ✅ EXISTS - IDE workspace layout
│   │   ├── MonacoEditor.tsx               # ✅ EXISTS - Code editor
│   │   ├── FileTree/                      # ✅ EXISTS - Full file tree impl
│   │   └── SyncStatusPanel.tsx            # ✅ EXISTS - Sync indicator
│   ├── notes/
│   │   ├── NotesPage.tsx                  # ✅ EXISTS - Notes workspace
│   │   ├── NoteSidebar.tsx                # ✅ EXISTS - Note navigation
│   │   ├── NoteEditor.tsx                 # ✅ EXISTS - Note editing
│   │   ├── NoteTree.tsx                   # ✅ EXISTS - Tree view
│   │   └── NoteContextMenu.tsx            # ✅ EXISTS - Context menu
│   └── ui/
│       └── Toast/                         # ✅ EXISTS - Toast notifications
├── infrastructure/
│   ├── filesystem/
│   │   ├── platform-detection.ts          # ✅ EXISTS - Platform detection
│   │   ├── platform-contract.ts           # ✅ EXISTS - Platform contract
│   │   ├── fsa-storage-adapter.ts         # ✅ EXISTS - FSA adapter
│   │   ├── fsa-gateway.ts                 # ✅ EXISTS - FSA gateway
│   │   ├── idb-gateway.ts                 # ✅ EXISTS - IndexedDB gateway
│   │   ├── handle-persistence.ts          # ✅ EXISTS - Handle persistence
│   │   └── storage-gateway-factory.ts     # ✅ EXISTS - Gateway factory
│   └── persistence/
│       └── dexie-db.ts                    # ✅ EXISTS - Dexie database
│       └── stores/project/                # ✅ EXISTS - Project Zustand store
├── lib/
│   ├── workspace/
│   │   └── ProjectContext.tsx             # ✅ EXISTS - Project context
│   ├── notes/
│   │   └── note-store.ts                  # ✅ EXISTS - Notes store
│   └── utils.ts                           # ✅ EXISTS - Utilities
└── stores/                                # ⚠️ DEPRECATED - Legacy stores
    └── [multiple store files]
```

### CRITICAL: Missing Routes Directory

**Location:** `src/spike/routes/`

The README.md (lines 11-12) explicitly documents:
```markdown
src/spike/
├── routes/                          ← Spike routes (already exist, update imports)
```

**FINDING:** This directory **DOES NOT EXIST**. This is the primary gap preventing the spike from functioning as a standalone routing test environment.

---

## 2. Routing Structure Analysis

### TanStack Router Files

| File | Status | Notes |
|------|--------|-------|
| `src/spike/routes/__root.tsx` | ❌ MISSING | Root layout for routes |
| `src/spike/routes/index.tsx` | ❌ MISSING | Entry page (Hub) |
| `src/spike/routes/ide.$projectId.tsx` | ❌ MISSING | IDE workspace route |
| `src/spike/routes/notes.$projectId.tsx` | ❌ MISSING | Notes workspace route |
| `src/spike/routes/knowledge.$projectId.tsx` | ❌ MISSING | Knowledge workspace route |
| `src/spike/routes/study.$projectId.tsx` | ❌ MISSING | Study workspace route |

### TanStack Router Imports Found in Code

The codebase references TanStack Router but has no router setup:

- `src/spike/components/common/MainLayout.tsx:19` - Uses `<Outlet />`
- `src/spike/lib/workspace/ProjectContext.tsx:17` - Uses `useNavigate()`
- `src/spike/components/common/WorkspaceSwitcher.tsx:21` - Uses `workspaceTransitionManager`

**Line References:**
- `MainLayout.tsx:79` - `<Outlet />` without route context

---

## 3. Platform Detection Code

### ✅ COMPLETE: Platform Contract Implementation

**Primary File:** `src/spike/infrastructure/filesystem/platform-contract.ts`

**Lines:** 1-340

**Key Exports:**
```typescript
// Line 263: Main entry point
export function getPlatformContract(): PlatformContract

// Line 74-95: PlatformContract interface
export interface PlatformContract {
  readonly deviceType: DeviceType;           // 'desktop' | 'mobile' | 'tablet'
  readonly storageType: StorageType;         // 'fsa' | 'indexeddb'
  readonly canAccessFSA: boolean;            // FSA support
  readonly canWatchFiles: boolean;           // File watching
  readonly canRunTerminal: boolean;          // WebContainer
  readonly canDoAgenticCoding: boolean;      // FSA + Terminal
  readonly canAccessIDE: boolean;            // Desktop with FSA + Terminal
}
```

**Detection Logic:**

| Device Type | storageType | canAccessFSA | canAccessIDE |
|-------------|-------------|--------------|--------------|
| Desktop (FSA) | 'fsa' | true | true |
| Desktop (no FSA) | 'indexeddb' | false | false |
| Tablet | 'indexeddb' | false | false |
| Mobile | 'indexeddb' | false | false |

**Secondary File:** `src/spike/infrastructure/filesystem/platform-detection.ts` (lines 1-318)

### Usage Throughout Spike

| File | Line | Usage |
|------|------|-------|
| `WorkspaceSwitcher.tsx` | 127-136 | Blocks IDE on mobile/tablet |
| `ProjectContext.tsx` | 310-316 | Platform validation for auto-switch |
| `FolderPickerDialog.tsx` | 256-260 | FSA support hint |
| `use-fsa-projects.ts` | 19, 26 | FSA project filtering |
| `MonacoEditor.tsx` | 99 | Mobile editor constraints |

**VERDICT:** Platform detection is **FULLY IMPLEMENTED** and well-integrated.

---

## 4. Project Creation Flow

### ✅ EXISTS: FolderPickerDialog

**Location:** `src/spike/components/common/FolderPickerDialog.tsx`

**Lines:** 1-329

**Features:**
- Desktop folder picker using `window.showDirectoryPicker()`
- Folder overlap detection and warning
- Fallback to temp project on cancel
- Toast notifications for errors/success

**Key Methods:**
```typescript
// Line 63-145: Main dialog handler
handlePickFolder(): Promise<void>

// Line 147-166: Project creation
finishProjectCreation(handle, folderName): Promise<void>
```

### ❌ CRITICAL GAP: Missing fsa-persistence.ts

**Import Reference:** `src/spike/components/common/FolderPickerDialog.tsx:21-25`

```typescript
import {
  pickFolder,
  createProjectFromFolder,
  isFSASupported,
  isDesktopPlatform,
} from '@/lib/workspace/fsa-persistence';
```

**FINDING:** The file `src/spike/lib/workspace/fsa-persistence.ts` **DOES NOT EXIST**.

**Impact:** Project creation via folder picker will **FAIL** at runtime with module not found error.

### Project CRUD Slice

**Location:** `src/spike/infrastructure/persistence/stores/project/project-crud-slice.ts`

**Lines:** 1-302

**Key Methods:**
```typescript
// Line 116-170: Create project
createProject(input: CreateProjectInput): string

// Line 173-202: Update project
updateProject(projectId, updates): void

// Line 205-228: Delete project
deleteProject(projectId): void

// Line 267-300: Restore FSA handle
restoreProjectHandle(projectId): Promise<HandleRestoreResult>
```

---

## 5. Project Selection UI

### ✅ COMPLETE: ProjectPickerDialog

**Location:** `src/spike/components/common/ProjectPickerDialog.tsx`

**Lines:** 1-337

**Features:**
- Filters projects by workspace binding (IDE, Notes, Knowledge, Study)
- Displays project name, folder path, last opened time
- Empty state with "Create Project" button
- Route navigation on selection

**Key Props:**
```typescript
// Line 35-44
interface ProjectPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetWorkspace: PickerWorkspace;  // 'ide' | 'notes' | 'knowledge' | 'study' | 'agents'
  onCreateNew?: () => void;
}
```

**Workspace Configuration (lines 58-89):**
```typescript
const WORKSPACE_CONFIG = {
  ide: { icon: '💻', labelKey: 'hub.workspaceBinding.workspaces.ide' },
  notes: { icon: '📝', labelKey: 'hub.workspaceBinding.workspaces.notes' },
  knowledge: { icon: '📚', labelKey: 'hub.workspaceBinding.workspaces.knowledge' },
  study: { icon: '🎓', labelKey: 'hub.workspaceBinding.workspaces.study' },
  agents: { icon: '🤖', labelKey: 'hub.workspaceBinding.workspaces.agents' },
};
```

**Navigation (lines 165-174):**
```typescript
const routeMap = {
  ide: '/ide',
  notes: '/notes',
  knowledge: '/knowledge',
  study: '/study',
  agents: '/agents',
};
// Uses window.location.href for direct navigation
```

---

## 6. Workspace Switching

### ✅ COMPLETE: WorkspaceSwitcher

**Location:** `src/spike/components/common/WorkspaceSwitcher.tsx`

**Lines:** 1-267

**Features:**
- Dropdown menu for workspace switching
- Platform validation (blocks IDE on mobile/tablet)
- Single workspace display when only one enabled
- 8-bit styling compliance

**Platform Validation (lines 125-136):**
```typescript
const handleWorkspaceSwitch = async (workspace: WorkspaceType) => {
  if (workspace === 'ide') {
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      console.warn('[WorkspaceSwitcher] IDE access denied on mobile/tablet');
      return; // Block switch
    }
  }
  // ... proceed with switch
};
```

---

## 7. Entry Page / Main Layout

### ✅ EXISTS: MainLayout

**Location:** `src/spike/components/common/MainLayout.tsx`

**Lines:** 1-85

**Responsive Design:**
```typescript
// Line 40: Mobile-first responsive layout
className="flex flex-col md:flex-row h-dvh w-full..."
```

**Structure:**
- Mobile: Column layout (header → main content)
- Desktop: Row layout (sidebar + content)
- Uses `<Outlet />` for nested routes
- TanStack Router integration ready

---

## 8. Project Context

### ✅ EXISTS: ProjectProvider

**Location:** `src/spike/lib/workspace/ProjectContext.tsx`

**Lines:** 1-466

**Features:**
- Cross-workspace project state sharing
- Current workspace tracking
- Workspace switcher function (navigate without re-load)
- Last workspace persistence (localStorage)
- Auto-select last workspace on return

**Platform Blocking (lines 374-383):**
```typescript
const switchWorkspace = React.useCallback((newWorkspace: WorkspaceId) => {
  const platform = getPlatformContract();
  if (newWorkspace === 'ide' && !platform.canAccessIDE) {
    console.warn('[ProjectProvider] Cannot switch to IDE on mobile/tablet');
    return; // Block IDE on mobile
  }
  // ... navigate
}, [project?.id, workspace, enabledWorkspaces, navigate]);
```

---

## 9. Gap Summary

### Critical Gaps (Blocking)

| Gap | File Path | Impact | Priority |
|-----|-----------|--------|----------|
| Missing routes directory | `src/spike/routes/` | No routing at all | P0 |
| Missing fsa-persistence.ts | `src/spike/lib/workspace/fsa-persistence.ts` | Project creation fails | P0 |
| Missing __root.tsx | `src/spike/routes/__root.tsx` | No route hierarchy | P0 |
| Missing index.tsx | `src/spike/routes/index.tsx` | No entry page | P0 |
| Missing workspace routes | `src/spike/routes/ide.$projectId.tsx` etc. | No workspace navigation | P0 |

### Missing Files to Create

```yaml
files_to_create:
  - path: "src/spike/routes/__root.tsx"
    purpose: "Root route with MainLayout wrapper"
    lines_est: 50
  
  - path: "src/spike/routes/index.tsx"
    purpose: "Entry page (Hub) with project picker"
    lines_est: 100
  
  - path: "src/spike/routes/ide.$projectId.tsx"
    purpose: "IDE workspace route with ProjectProvider"
    lines_est: 80
  
  - path: "src/spike/routes/notes.$projectId.tsx"
    purpose: "Notes workspace route with ProjectProvider"
    lines_est: 80
  
  - path: "src/spike/lib/workspace/fsa-persistence.ts"
    purpose: "FSA folder picking and project creation"
    lines_est: 150
```

### Existing Components (Ready to Use)

| Component | Location | Lines | Status |
|-----------|----------|-------|--------|
| MainLayout | `components/common/MainLayout.tsx` | 85 | ✅ Ready |
| WorkspaceSwitcher | `components/common/WorkspaceSwitcher.tsx` | 267 | ✅ Ready |
| ProjectPickerDialog | `components/common/ProjectPickerDialog.tsx` | 337 | ✅ Ready |
| FolderPickerDialog | `components/common/FolderPickerDialog.tsx` | 329 | ⚠️ Needs fsa-persistence |
| ProjectContext | `lib/workspace/ProjectContext.tsx` | 466 | ✅ Ready |
| getPlatformContract | `infrastructure/filesystem/platform-contract.ts` | 340 | ✅ Ready |
| FSAStorageAdapter | `infrastructure/filesystem/fsa-storage-adapter.ts` | 667 | ✅ Ready |

---

## 10. Recommendations

### Priority 1: Routing Infrastructure (Blocker)

1. Create `src/spike/routes/` directory
2. Create `__root.tsx` with MainLayout and route tree
3. Create `index.tsx` for Hub/entry page
4. Create workspace routes for IDE, Notes, Knowledge, Study

### Priority 2: Project Creation (Blocker)

1. Create `src/spike/lib/workspace/fsa-persistence.ts`
2. Export `pickFolder()` function
3. Export `createProjectFromFolder()` function
4. Integrate with project-crud-slice

### Priority 3: Integration Testing

1. Test platform detection on mobile vs desktop
2. Test workspace blocking on mobile
3. Test project creation flow
4. Test project selection and navigation

---

## 11. File References

| File | Lines | Purpose |
|------|-------|---------|
| `README.md` | 36 | Spike documentation |
| `platform-contract.ts` | 340 | Platform detection |
| `platform-detection.ts` | 318 | Feature detection |
| `fsa-storage-adapter.ts` | 667 | FSA storage impl |
| `ProjectContext.tsx` | 466 | Project context |
| `ProjectPickerDialog.tsx` | 337 | Project selection |
| `FolderPickerDialog.tsx` | 329 | Project creation |
| `WorkspaceSwitcher.tsx` | 267 | Workspace switching |
| `MainLayout.tsx` | 85 | Layout wrapper |
| `project-crud-slice.ts` | 302 | Project CRUD |

---

*Generated: 2026-01-17 | analyst-ext*

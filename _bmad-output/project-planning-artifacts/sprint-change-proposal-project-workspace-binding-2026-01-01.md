---
title: "Sprint Change Proposal - Project Space Workspace Binding"
document_type: "sprint-change-proposal"
version: "2.0.0"
created: "2026-01-01T01:48:19+07:00"
author: "BMAD Master Orchestrator"
status: "PENDING_APPROVAL"
scope: "MAJOR"
phase: "Course Correction"
team: "A"
agent_mode: "@bmad-core-bmad-master"
---

# Sprint Change Proposal: Project Space → Workspace Binding & Persistent Sync

## Executive Summary

This Sprint Change Proposal addresses the fundamental architectural gap in how **Projects** relate to **Workspaces**. Currently, Project Management exists in isolation - when a user opens a project from the Hub, there is no mechanism to:

1. **Select which workspaces** the project syncs into (IDE, Notes, Knowledge, Study)
2. **Persist file state** so reloading doesn't require re-reading all files from FSA
3. **Share project context** across bound workspaces

This proposal defines a **Project-Centric Architecture** where the Project is the hub that binds to one or more workspaces with persistent state.

### Change Scope: **MAJOR**

---

## Section 1: Issue Summary

### 1.1 Problem Statement

**Current State:**
```
┌──────────────┐     ┌─────────────┐
│     Hub      │────►│   Project   │ (stored in IndexedDB, FSA handle)
└──────────────┘     └──────┬──────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ IDE Workspace │ (ONLY destination)
                     └──────────────┘
```

- Projects only open in IDE workspace
- No workspace selection on project entry
- Files read from FSA on every reload (slow)
- No cross-workspace project context

**Required State:**
```
┌──────────────┐     ┌─────────────────────────────────────────────┐
│     Hub      │────►│           PROJECT BINDING DIALOG            │
└──────────────┘     │  ┌─────────────────────────────────────────┐│
                     │  │ Select Workspaces:                      ││
                     │  │ ☑ IDE      ☑ Notes    ☑ Knowledge      ││
                     │  │ ☐ Study    ☐ Canvas                    ││
                     │  └─────────────────────────────────────────┘│
                     └─────────────────────────────────────────────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
    ┌──────────────┐             ┌──────────────┐             ┌──────────────┐
    │IDE Workspace │◄────────────│ SHARED STATE │────────────►│Notes Workspace│
    └──────────────┘             │  IndexedDB   │             └──────────────┘
                                 │  Snapshots   │
                                 │  File Cache  │
                                 └──────────────┘
```

### 1.2 Key Requirements

| Requirement | Description |
|-------------|-------------|
| **R1: Workspace Selection** | From Hub, when opening a project, user chooses which workspaces to bind |
| **R2: Permission Persistence** | FSA permission granted once, stored handle reused across sessions |
| **R3: File Snapshot** | IndexedDB stores file metadata + content cache so reload is instant |
| **R4: Cross-Workspace Context** | All bound workspaces share the same project file tree |
| **R5: Lazy File Loading** | Only load file content when needed, use snapshot for tree |

### 1.3 Current Component Analysis

#### ProjectStore (`src/lib/workspace/project-store.ts`)
```typescript
export interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;  // ✅ Handle stored
    lastOpened: Date;
    autoSync?: boolean;
    layoutState?: LayoutConfig;            // ✅ IDE layout only
    exclusionPatterns?: string[];
    // ❌ MISSING: workspaceBindings
    // ❌ MISSING: fileSnapshot
    // ❌ MISSING: lastSyncTimestamp
}
```

#### Hub Components
- `Hub` page shows projects but only routes to `/ide`
- No workspace selection dialog
- No binding configuration

#### Workspace Routes
- Each workspace is isolated (`/ide`, `/notes`, `/knowledge`, `/study`)
- No shared project context
- No way to navigate between workspaces with same project

---

## Section 2: Impact Analysis

### 2.1 Architectural Impact

| Layer | Current | Required |
|-------|---------|----------|
| **Hub** | Routes to `/ide` only | Routes to workspace selection → bound workspace |
| **Project Store** | IDE-only metadata | Workspace bindings + snapshot |
| **Workspace Context** | Isolated per route | Shared project context provider |
| **File Loading** | FSA read on every mount | Snapshot + lazy content load |
| **Navigation** | Hard separation | Cross-workspace navigation with project context |

### 2.2 Story Impact

**Stories Requiring Modification:**

| Story | Change |
|-------|--------|
| 3-1 (FSA Permission Lifecycle) | Add persistence across workspaces |
| 3-2 (WebContainer Boot) | Use snapshot for initial tree |
| 3-7 (Project Metadata Persistence) | Add workspace bindings + file snapshot |

**New Stories Required:**

| Story ID | Name | Priority |
|----------|------|----------|
| WB-1 | Workspace Binding Dialog | P0 |
| WB-2 | Workspace Selection from Hub | P0 |
| WB-3 | File Snapshot Store | P0 |
| WB-4 | Shared Project Context Provider | P0 |
| WB-5 | Cross-Workspace Navigation | P1 |
| WB-6 | Lazy File Content Loading | P1 |
| WB-7 | Sync Status Persistence | P2 |

---

## Section 3: Detailed Gap Analysis

### Gap 1: No Workspace Binding Model

**Current:**
```typescript
// Project stored with no workspace information
interface ProjectMetadata {
    id: string;
    fsaHandle: FileSystemDirectoryHandle;
    // ... other fields
}
```

**Required:**
```typescript
interface ProjectMetadata {
    id: string;
    fsaHandle: FileSystemDirectoryHandle;
    
    // NEW: Workspace Binding Configuration
    workspaceBindings: {
        ide: boolean;
        notes: boolean;
        knowledge: boolean;
        study: boolean;
        canvas: boolean;
    };
    
    // NEW: Workspace-specific settings
    workspaceSettings: {
        ide?: {
            defaultFile?: string;
            panelLayout?: number[];
        };
        notes?: {
            syncFolder?: string;
            autoImport?: boolean;
        };
        knowledge?: {
            ragEnabled?: boolean;
            chunkingStrategy?: 'sentence' | 'paragraph' | 'semantic';
        };
    };
    
    // NEW: File Snapshot for instant reload
    fileSnapshot?: FileTreeSnapshot;
    snapshotTimestamp?: number;
}
```

### Gap 2: No File Snapshot Persistence

**Current Flow (Slow):**
```
User Opens Project → Request FSA Permission → Read ALL files from disk → Build tree
                                              ↑
                                    SLOW: 2-10 seconds for large projects
```

**Required Flow (Fast):**
```
User Opens Project → Check IndexedDB snapshot
                            │
                            ├─ Snapshot exists & fresh → Use snapshot instantly
                            │
                            └─ Snapshot stale/missing → Request FSA → Read files → Save snapshot
```

**Snapshot Schema:**
```typescript
interface FileTreeSnapshot {
    projectId: string;
    timestamp: number;
    
    // Tree structure only (no content)
    tree: {
        path: string;
        isDirectory: boolean;
        size?: number;
        lastModified?: number;
        children?: FileTreeNode[];
    };
    
    // Content cache (lazy loaded)
    contentCache: Map<string, {
        content: string;
        hash: string;
        cachedAt: number;
    }>;
}
```

### Gap 3: No Cross-Workspace Project Context

**Current:**
- Each workspace route is completely isolated
- Opening `/notes` loses IDE project context
- No way to navigate between workspaces with same project

**Required:**
```typescript
// Project Context Provider wraps all workspace routes
<ProjectContextProvider>
    <Outlet /> {/* Renders /ide, /notes, /knowledge, etc. */}
</ProjectContextProvider>

// Any workspace can access:
const { 
    activeProject,      // Current project metadata
    fileTree,           // Shared file tree from snapshot
    boundWorkspaces,    // Which workspaces are bound
    switchWorkspace,    // Navigate while preserving context
} = useProjectContext();
```

### Gap 4: Hub Doesn't Offer Workspace Selection

**Current Hub Project Card:**
```tsx
<ProjectCard onClick={() => navigate('/ide')}>
    {project.name}
</ProjectCard>
```

**Required Hub Project Card:**
```tsx
<ProjectCard onClick={() => openWorkspaceDialog(project)}>
    {project.name}
    <WorkspaceBadges bindings={project.workspaceBindings} />
</ProjectCard>

// Dialog allows:
// - Select which workspace to enter
// - Configure workspace bindings
// - View sync status
```

---

## Section 4: Recommended Approach

### 4.1 Architecture Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION SHELL                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        ProjectContextProvider                           │ │
│  │  ┌─────────────┐  ┌────────────────┐  ┌────────────────────────────┐  │ │
│  │  │activeProject│  │ fileSnapshot   │  │ workspaceBindings          │  │ │
│  │  │ (Zustand)   │  │ (IndexedDB)    │  │ (persisted per project)    │  │ │
│  │  └─────────────┘  └────────────────┘  └────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │                   useProjectContext() Hook                       │   │ │
│  │  │  - activeProject     - switchWorkspace(workspace)               │   │ │
│  │  │  - fileTree          - updateSnapshot()                         │   │ │
│  │  │  - boundWorkspaces   - getFileContent(path)                     │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│        ┌─────────────────────────────┼─────────────────────────────┐        │
│        ▼                             ▼                             ▼        │
│  ┌──────────────┐            ┌──────────────┐            ┌──────────────┐   │
│  │ /ide         │            │ /notes       │            │ /knowledge   │   │
│  │              │◄──────────►│              │◄──────────►│              │   │
│  │ Uses shared  │   Cross    │ Uses shared  │   Cross    │ Uses shared  │   │
│  │ file tree    │  Workspace │ file tree    │  Workspace │ file tree    │   │
│  └──────────────┘  Navigation└──────────────┘  Navigation└──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow

#### Initial Project Open (Cold Start)
```
1. User clicks project card on Hub
2. Check IndexedDB for fileSnapshot
   └─ NOT FOUND: Request FSA permission
                 └─ Read file tree from disk
                 └─ Save snapshot to IndexedDB
                 └─ Show workspace selection dialog
   └─ FOUND: Check snapshotTimestamp
             └─ FRESH (<5 min): Use snapshot directly, show dialog
             └─ STALE: Background refresh, use snapshot for instant UI
3. User selects workspace
4. Navigate to workspace route with project context
```

#### Subsequent Workspace Switch
```
1. User in /ide clicks "Open in Notes" 
2. ProjectContext already has fileSnapshot
3. Navigate to /notes (instant, no reload)
4. Notes workspace uses same fileSnapshot
```

#### File Content Loading (Lazy)
```
1. User clicks file in tree
2. Check contentCache in IndexedDB
   └─ CACHED: Return immediately
   └─ NOT CACHED: Read from FSA, cache, return
3. Content displayed in editor
```

### 4.3 Implementation Phases

#### Phase 1: Core Infrastructure (3 days)
- `useProjectStore` enhancement with workspace bindings
- `FileSnapshotStore` for IndexedDB snapshot persistence
- `ProjectContextProvider` wrapping workspace routes

#### Phase 2: Hub Integration (2 days)
- Workspace Selection Dialog on project open
- Project card shows bound workspaces
- Quick-switch buttons for bound workspaces

#### Phase 3: Cross-Workspace Navigation (2 days)
- `switchWorkspace()` function in context
- Workspace selector in all workspace headers
- State preservation during switch

#### Phase 4: Lazy Loading & Caching (2 days)
- Content cache in IndexedDB
- Background snapshot refresh
- Stale-while-revalidate pattern

---

## Section 5: Detailed Change Proposals

### 5.1 ProjectMetadata Enhancement

**File:** `src/lib/workspace/project-store.ts`

**OLD:**
```typescript
export interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;
    lastOpened: Date;
    autoSync?: boolean;
    layoutState?: LayoutConfig;
    exclusionPatterns?: string[];
    lastKnownPermissionState?: FsaPermissionState;
}
```

**NEW:**
```typescript
export interface WorkspaceBinding {
    enabled: boolean;
    lastAccessed?: Date;
    settings?: Record<string, unknown>;
}

export interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;
    lastOpened: Date;
    autoSync?: boolean;
    layoutState?: LayoutConfig;
    exclusionPatterns?: string[];
    lastKnownPermissionState?: FsaPermissionState;
    
    // NEW: Workspace Bindings
    workspaceBindings: {
        ide: WorkspaceBinding;
        notes: WorkspaceBinding;
        knowledge: WorkspaceBinding;
        study: WorkspaceBinding;
        canvas: WorkspaceBinding;
    };
    
    // NEW: Snapshot Reference
    snapshotId?: string;
    snapshotTimestamp?: number;
}
```

---

### 5.2 FileSnapshot Store

**File:** `src/lib/workspace/file-snapshot-store.ts` (NEW)

```typescript
/**
 * FileSnapshot Store
 * 
 * Persists file tree structure and content cache to IndexedDB
 * for instant project reload without re-reading from FSA.
 */

import { getPersistenceDB } from '../persistence';

export interface FileNode {
    path: string;
    name: string;
    isDirectory: boolean;
    size?: number;
    lastModified?: number;
    children?: FileNode[];
}

export interface FileSnapshot {
    id: string;              // projectId
    timestamp: number;
    tree: FileNode;
    totalFiles: number;
    totalSize: number;
}

export interface FileContentCache {
    projectId: string;
    path: string;
    content: string;
    hash: string;
    cachedAt: number;
}

const SNAPSHOT_STORE = 'fileSnapshots' as const;
const CONTENT_CACHE_STORE = 'fileContentCache' as const;

// Save snapshot
export async function saveSnapshot(snapshot: FileSnapshot): Promise<boolean>;

// Get snapshot
export async function getSnapshot(projectId: string): Promise<FileSnapshot | null>;

// Check if snapshot is fresh (< maxAge ms)
export async function isSnapshotFresh(projectId: string, maxAge = 300000): Promise<boolean>;

// Get cached content
export async function getCachedContent(projectId: string, path: string): Promise<string | null>;

// Cache content
export async function cacheContent(projectId: string, path: string, content: string): Promise<void>;

// Invalidate snapshot (on file change)
export async function invalidateSnapshot(projectId: string): Promise<void>;
```

---

### 5.3 Project Context Provider

**File:** `src/lib/workspace/ProjectContext.tsx` (NEW)

```typescript
/**
 * Project Context Provider
 * 
 * Wraps all workspace routes to provide shared project state.
 * Handles workspace binding, snapshot management, and cross-workspace navigation.
 */

interface ProjectContextValue {
    // Current project
    activeProject: ProjectMetadata | null;
    isLoading: boolean;
    error: string | null;
    
    // File tree from snapshot
    fileTree: FileNode | null;
    
    // Workspace bindings
    boundWorkspaces: ('ide' | 'notes' | 'knowledge' | 'study' | 'canvas')[];
    
    // Actions
    openProject(projectId: string, targetWorkspace?: string): Promise<void>;
    closeProject(): void;
    switchWorkspace(workspace: string): void;
    updateBinding(workspace: string, enabled: boolean): void;
    
    // File operations
    getFileContent(path: string): Promise<string>;
    refreshSnapshot(): Promise<void>;
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectContextProvider({ children }: { children: React.ReactNode }) {
    // Implementation...
}

export function useProjectContext() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectContext must be used within ProjectContextProvider');
    }
    return context;
}
```

---

### 5.4 Workspace Binding Dialog

**File:** `src/presentation/components/hub/WorkspaceBindingDialog.tsx` (NEW)

```typescript
/**
 * Workspace Binding Dialog
 * 
 * Shown when opening a project from Hub.
 * Allows user to select which workspaces to bind the project to.
 */

interface WorkspaceBindingDialogProps {
    project: ProjectMetadata;
    onConfirm: (bindings: ProjectMetadata['workspaceBindings'], targetWorkspace: string) => void;
    onCancel: () => void;
}

export function WorkspaceBindingDialog({ project, onConfirm, onCancel }: Props) {
    return (
        <Dialog>
            <DialogHeader>
                <h2>Open Project: {project.name}</h2>
            </DialogHeader>
            
            <DialogContent>
                <h3>Sync to Workspaces:</h3>
                <div className="grid grid-cols-2 gap-4">
                    <WorkspaceOption 
                        workspace="ide" 
                        label="IDE" 
                        icon={<CodeIcon />}
                        description="Code editor, terminal, file tree"
                    />
                    <WorkspaceOption 
                        workspace="notes" 
                        label="Notes" 
                        icon={<NotesIcon />}
                        description="Markdown notes synced to project"
                    />
                    <WorkspaceOption 
                        workspace="knowledge" 
                        label="Knowledge" 
                        icon={<BrainIcon />}
                        description="RAG-indexed documents"
                    />
                    <WorkspaceOption 
                        workspace="study" 
                        label="Study" 
                        icon={<BookIcon />}
                        description="Flashcards and quizzes"
                    />
                </div>
                
                <h3>Open In:</h3>
                <WorkspaceSelector defaultSelection={lastUsedWorkspace} />
            </DialogContent>
            
            <DialogFooter>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={handleConfirm}>Open Project</Button>
            </DialogFooter>
        </Dialog>
    );
}
```

---

### 5.5 Hub Project Card Enhancement

**File:** `src/presentation/components/hub/ProjectCard.tsx` (UPDATE)

**OLD:**
```tsx
<Card onClick={() => navigate('/ide')}>
    <h3>{project.name}</h3>
    <p>{project.folderPath}</p>
</Card>
```

**NEW:**
```tsx
<Card onClick={() => openWorkspaceDialog(project)}>
    <h3>{project.name}</h3>
    <p>{project.folderPath}</p>
    
    {/* Show bound workspaces */}
    <div className="flex gap-2 mt-2">
        {project.workspaceBindings.ide.enabled && <Badge>IDE</Badge>}
        {project.workspaceBindings.notes.enabled && <Badge>Notes</Badge>}
        {project.workspaceBindings.knowledge.enabled && <Badge>Knowledge</Badge>}
    </div>
    
    {/* Quick open buttons */}
    <div className="flex gap-2 mt-2">
        {Object.entries(project.workspaceBindings)
            .filter(([_, binding]) => binding.enabled)
            .map(([workspace]) => (
                <IconButton 
                    key={workspace}
                    onClick={(e) => {
                        e.stopPropagation();
                        openProject(project.id, workspace);
                    }}
                >
                    <WorkspaceIcon workspace={workspace} />
                </IconButton>
            ))
        }
    </div>
</Card>
```

---

## Section 6: Story Breakdown

### Epic WB: Workspace Binding & Project Persistence

| Story | Name | Priority | Effort | Description |
|-------|------|----------|--------|-------------|
| WB-1 | Project Metadata Enhancement | P0 | 4h | Add workspaceBindings and snapshotId to ProjectMetadata |
| WB-2 | File Snapshot Store | P0 | 6h | IndexedDB persistence for file tree snapshots |
| WB-3 | Project Context Provider | P0 | 8h | Shared context wrapping all workspace routes |
| WB-4 | Workspace Binding Dialog | P0 | 6h | UI for selecting workspace bindings on project open |
| WB-5 | Hub Project Card Enhancement | P1 | 4h | Show bindings and quick-open buttons |
| WB-6 | Cross-Workspace Navigation | P1 | 6h | Switch workspace while preserving project context |
| WB-7 | Lazy Content Loading | P1 | 4h | Load file content on demand, cache in IndexedDB |
| WB-8 | Snapshot Refresh Strategy | P2 | 4h | Background refresh, stale-while-revalidate |

**Total Effort:** 42 hours (5.25 days)

---

## Section 7: Implementation Roadmap

### Week 1: Foundation

| Day | Stories | Deliverables |
|-----|---------|--------------|
| Day 1 | WB-1, WB-2 | ProjectMetadata enhanced, FileSnapshotStore implemented |
| Day 2 | WB-3 | ProjectContextProvider wrapping routes |
| Day 3 | WB-4 | Workspace Binding Dialog functional |

### Week 2: Integration

| Day | Stories | Deliverables |
|-----|---------|--------------|
| Day 4 | WB-5 | Hub shows bound workspaces, quick-open works |
| Day 5 | WB-6 | Cross-workspace navigation without reload |
| Day 6 | WB-7, WB-8 | Lazy loading, caching, background refresh |

### Week 2+: Validation

- Full integration testing
- Performance validation (<1s project open with snapshot)
- Cross-browser testing (Chrome, Edge)

---

## Section 8: Success Criteria

- [ ] User can open project from Hub and select workspace bindings
- [ ] Project opens in <1s when snapshot exists
- [ ] Switching between bound workspaces is instant (no FSA re-read)
- [ ] File tree is shared across all bound workspaces
- [ ] Content is loaded lazily and cached in IndexedDB
- [ ] Snapshot refreshes in background without blocking UI
- [ ] All existing tests pass

---

## Section 9: Approval

**Proposal Status:** ⏳ AWAITING APPROVAL

**Required Approvers:**
- [ ] Product Owner - Scope approval
- [ ] Architect - Technical design approval  
- [ ] Dev Lead - Effort estimate approval

Do you approve this Sprint Change Proposal? **(yes/no/revise)**

---

**Document ID:** SCP-PWB-2026-01-01
**Version:** 2.0
**Last Updated:** 2026-01-01T01:48:19+07:00

# Phase 3.2, Iteration 42: Project Management Context
## Cornerstone 4 - Project & File System Integration

**Generated:** 2026-01-02
**Status:** Implementation Planning
**Focus:** Hub UI Architecture, Project CRUD Operations, State Propagation

---

## Executive Summary

This document provides comprehensive context for implementing Cornerstone 4 of Phase 3.2, focusing on **Project Management UI** in the Hub. The primary gap is the absence of "Edit Project" and "Delete Project" user interfaces, despite complete backend CRUD capabilities.

### Current State Assessment

**Backend (COMPLETE):**
- ✅ Full CRUD operations in `project-store.ts` (451 lines)
- ✅ IndexedDB persistence via Dexie.js
- ✅ Workspace bindings support
- ✅ Permission state tracking
- ✅ File snapshot feature flags

**Frontend (PARTIAL):**
- ✅ Project creation via `handleNewProject()` in HubHomePage
- ✅ Project listing via `RecentProjectsSection` → `ProjectCard`
- ✅ Project opening via `WorkspaceBindingDialog`
- ❌ **MISSING:** Edit project UI (rename, update bindings, change settings)
- ❌ **MISSING:** Delete project UI (confirmation dialog, cleanup)
- ❌ **MISSING:** Project actions menu component

---

## 1. Project Management State Architecture

### 1.1 Data Layer (IndexedDB + Dexie.js)

**Location:** `/src/lib/workspace/project-store.ts` (451 lines)

**Core Types:**
```typescript
interface ProjectMetadata {
  id: string;                      // UUID v4
  name: string;                    // Display name (folder name)
  folderPath: string;              // Display path for UI
  fsaHandle: FileSystemDirectoryHandle; // FSA directory handle
  lastOpened: Date;                // Last access timestamp
  autoSync?: boolean;              // Auto-sync flag
  layoutState?: LayoutConfig;      // IDE state restoration
  exclusionPatterns?: string[];    // Sync exclusions
  lastKnownPermissionState?: FsaPermissionState; // Cache
  workspaceBindings?: WorkspaceBindings; // WB-1 feature
  fileSnapshotEnabled?: boolean;   // WB-1 feature
}

interface WorkspaceBindings {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
}
```

**CRUD Operations (All Exported):**
```typescript
// Create/Update
saveProject(project: ProjectMetadata): Promise<boolean>

// Read
getProject(id: string): Promise<ProjectMetadata | null>
listProjects(): Promise<ProjectMetadata[]>
listProjectsWithPermission(): Promise<ProjectWithPermission[]>

// Update
updateProjectLastOpened(id: string): Promise<boolean>
updateProjectBindings(id: string, bindings: WorkspaceBindings): Promise<boolean>

// Delete
deleteProject(id: string): Promise<boolean>

// Helpers
generateProjectId(): string
checkProjectPermission(id: string): Promise<FsaPermissionState>
clearAllProjects(): Promise<boolean>
getProjectCount(): Promise<number>
```

**Storage:**
- Database: `via-gent-persistence` (Dexie.js)
- Store Name: `projects`
- Index: `id` (primary key)
- Legacy Migration: `via-gent-projects` → unified DB (complete)

### 1.2 State Layer (Zustand Slices)

**Location:** `/src/infrastructure/persistence/stores/conversation/slices/create-project-state-slice.ts`

```typescript
interface ProjectStateSlice {
  activeThreadId: string | null;
  currentProjectId: string | null;
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  setCurrentProject: (projectId: string) => void;
}
```

**Note:** This slice manages conversation-scoped project state, not Hub project list state.

### 1.3 Event System (Cross-Workspace Propagation)

**Location:** `/src/lib/events/cross-workspace-event-bus.ts`

**Relevant Events for Project CRUD:**
```typescript
interface ProjectStateChangeEvent {
  workspaceId: WorkspaceId;        // 'ide' | 'notes' | 'knowledge' | 'study'
  projectId: string;
  changeType: 'opened' | 'closed' | 'bindings-changed';
  timestamp: Date;
}

// Usage
crossWorkspaceEventBus.emitProjectStateChange({
  workspaceId: 'ide',
  projectId: 'abc-123',
  changeType: 'bindings-changed'
});
```

**Workspace-Level Events:**
```typescript
// From /src/lib/events/workspace-events.ts
'project:opened': [{ projectId: string; name: string }]
'project:closed': [{ projectId: string }]
'project:switched': [{ fromId: string | null; toId: string }]
```

**Propagation Flow:**
1. User edits/deletes project in Hub
2. `project-store.ts` updates IndexedDB
3. Emit `crossWorkspaceEventBus.emitProjectStateChange()`
4. Workspaces subscribe to events via `useCrossWorkspaceEvents()` hook
5. Components re-render on project list changes

---

## 2. Hub UI Architecture Mapping

### 2.1 Component Hierarchy

```
HubHomePage (250 lines)
├── BootSequence (boot animation)
├── HubHero (hero section)
├── BentoGrid (quick access cards)
│   ├── New Project Card
│   ├── Workspace Cards (Notes, Knowledge, Study, etc.)
│   └── Settings/About
└── RecentProjectsSection (126 lines)
    └── ProjectCard (180 lines) × N
        ├── WorkspaceBadge (direct nav)
        ├── Quick-open buttons (hover)
        └── ❌ MISSING: Actions menu (edit/delete)

WorkspaceBindingDialog (312 lines)
├── Workspace toggle switches
├── Initial workspace selector
└── Confirm/Cancel buttons
```

### 2.2 Current User Journey: Create Project

**Entry Point:** HubHomePage → "NEW PROJECT" bento card

```typescript
// File: HubHomePage.tsx, lines 62-95
const handleNewProject = async () => {
  try {
    // 1. Open Directory Picker (FSA API)
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

    // 2. Create Project Metadata
    const newProjectId = generateProjectId();
    const project: ProjectMetadata = {
      id: newProjectId,
      name: handle.name,
      folderPath: handle.name,
      fsaHandle: handle,
      lastOpened: new Date(),
      autoSync: true,
    };

    // 3. Save to Dexie
    await saveProject(project);

    // 4. Navigate to Workspace
    await navigate({
      to: '/workspace/$projectId',
      params: { projectId: newProjectId }
    });
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to create project:', error);
    }
  }
};
```

**Flow:**
1. User clicks "NEW PROJECT" card
2. Browser shows directory picker
3. System generates UUID, creates metadata
4. Persists to IndexedDB via `saveProject()`
5. Triggers `WorkspaceBindingDialog`
6. User selects workspaces + initial workspace
7. System saves bindings, updates `lastOpened`
8. Navigates to selected workspace route

**State Updates:**
- IndexedDB: `projects` store (new record)
- Zustand: Not directly updated (Hub uses live queries)
- UI: `useLiveQuery(() => db.projects.toArray())` auto-refreshes

### 2.3 Current User Journey: Open Project

**Entry Point:** HubHomePage → RecentProjectsSection → ProjectCard

```typescript
// File: HubHomePage.tsx, lines 97-103
const handleOpenRecentProject = (projectId: string) => {
  const project = (projects || []).find(p => p.id === projectId);
  if (!project) return;

  setSelectedProject(project);
  setDialogOpen(true); // Opens WorkspaceBindingDialog
};
```

**Flow:**
1. User clicks project card
2. `WorkspaceBindingDialog` opens with current bindings
3. User can toggle workspace bindings
4. Select initial workspace
5. System saves bindings + updates `lastOpened`
6. Navigates to workspace

**Alternative Flow:** Click workspace badge → Direct navigation (skips dialog)

```typescript
// File: ProjectCard.tsx, lines 93-101
const handleWorkspaceClick = (workspace: WorkspaceId) => {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: `/${workspace}/$projectId`,
      params: { projectId: project.id },
    });
  };
};
```

---

## 3. Missing CRUD UI: Gap Analysis

### 3.1 Edit Project (GAP)

**Required Features:**
1. **Rename Project** (change display name)
   - Note: Cannot change actual folder name (FSA security)
   - Only updates `project.name` in IndexedDB

2. **Update Workspace Bindings**
   - Re-use `WorkspaceBindingDialog` or create inline editor
   - Save via `updateProjectBindings()`

3. **Project Settings**
   - Auto-sync toggle (`project.autoSync`)
   - Exclusion patterns (`project.exclusionPatterns`)
   - File snapshot toggle (`project.fileSnapshotEnabled`)

**User Journey (Proposed):**
```
Hub → ProjectCard → Click "Edit" button
  ↓
ProjectSettingsDialog (NEW COMPONENT)
  ├── Display Name (editable text input)
  ├── Folder Path (read-only, FSA security)
  ├── Workspace Bindings (toggle switches)
  ├── Auto-Sync Toggle
  ├── Exclusion Patterns (textarea, glob syntax)
  └── File Snapshot Toggle
  ↓
User clicks "Save"
  ↓
Call saveProject() with updated metadata
  ↓
Emit crossWorkspaceEventBus.emitProjectStateChange()
  ↓
UI re-renders with new data
```

**Component Dependencies:**
- Dialog primitives: `/src/presentation/components/ui/dialog.tsx`
- Form components: `input.tsx`, `switch.tsx`, `textarea.tsx`
- Button: `/src/presentation/components/ui/button.tsx`
- Toast: `sonner` (for success/error feedback)

**Files to Create:**
1. `/src/presentation/components/hub/ProjectSettingsDialog.tsx` (new)
2. `/src/presentation/components/hub/ProjectActionsMenu.tsx` (new)

**Files to Modify:**
1. `/src/presentation/components/hub/ProjectCard.tsx` (add actions menu button)

### 3.2 Delete Project (GAP)

**Required Features:**
1. **Delete Confirmation Dialog**
   - Show project name, path
   - Warn about data loss (IndexedDB records only, not local files)
   - List dependent data (conversations, IDE state, RAG indexes)

2. **Cascade Deletion (Optional)**
   - Conversations: `conversation-store.ts`
   - IDE State: `ide-state-store.ts`
   - RAG Indexes: `deleteIndex()` from `/src/lib/rag/`
   - File sync status: `file-sync-status-store.ts`

3. **Post-Delete UX**
   - Navigate back to Hub if deleting current project
   - Show success toast
   - Refresh project list

**User Journey (Proposed):**
```
Hub → ProjectCard → Click "Delete" button
  ↓
ProjectDeleteConfirmDialog (NEW COMPONENT)
  ├── Warning message (destructive variant)
  ├── Project details (name, path)
  ├── Optional: "Also delete associated data" checkbox
  │   - Conversations
  │   - IDE State
  │   - RAG Indexes
  └── Confirm/Cancel buttons
  ↓
User clicks "Confirm"
  ↓
Call deleteProject(id) from project-store.ts
  ↓
(Optional) Call cleanup functions:
  - clearConversation(projectId)
  - clearIdeState(projectId)
  - deleteIndex(projectId)
  ↓
If deleting current project:
  - Navigate({ to: '/hub' })
  ↓
Emit crossWorkspaceEventBus.emitProjectStateChange()
  ↓
Show success toast
```

**Component Dependencies:**
- Dialog: `/src/presentation/components/ui/dialog.tsx`
- Button: `variant="destructive"`
- Icons: `Trash2`, `AlertTriangle` from lucide-react

**Reference Patterns:**
```typescript
// From: /src/presentation/components/agent/ProviderSettings.tsx, lines 169-205
{dependentAgents.length > 0 ? (
  <ProviderDeletionWarningDialog
    providerId={providerToDelete?.id || ''}
    providerName={providerToDelete?.name || ''}
    dependentAgents={dependentAgents}
    onConfirm={handleForceDelete}
    onCancel={() => {
      setProviderToDelete(undefined);
      setDependentAgents([]);
      setIsDeleteOpen(false);
    }}
    open={isDeleteOpen}
    isLoading={isDeleting}
  />
) : (
  <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Delete Provider?
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{providerToDelete?.name}</strong>?
          This action cannot be undone and will remove associated API keys.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
        <Button variant="destructive" onClick={executeDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

**Files to Create:**
1. `/src/presentation/components/hub/ProjectDeleteConfirmDialog.tsx` (new)

---

## 4. Component Dependency Graph

### 4.1 ProjectActionsMenu Component (New)

**Purpose:** Dropdown menu for project actions (edit, delete, open in workspace)

**Location:** `/src/presentation/components/hub/ProjectActionsMenu.tsx`

**Dependencies:**
```typescript
// UI Primitives
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';

// Icons
import { MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react';

// Types
import type { ProjectMetadata } from '@/lib/workspace/project-store';

// Dialog Components
import { ProjectSettingsDialog } from './ProjectSettingsDialog';
import { ProjectDeleteConfirmDialog } from './ProjectDeleteConfirmDialog';
```

**Props Interface:**
```typescript
interface ProjectActionsMenuProps {
  project: ProjectMetadata;
  onEdit: () => void;           // Opens settings dialog
  onDelete: () => void;         // Opens delete confirmation
  onOpenWorkspace?: (workspace: WorkspaceId) => void; // Optional
}
```

**Component Structure:**
```typescript
export const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({
  project,
  onEdit,
  onDelete,
  onOpenWorkspace,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" iconOnly>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Edit Project */}
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Edit className="h-4 w-4" />
            <span>Edit Settings</span>
          </DropdownMenuItem>

          {/* Open in Workspace (if enabled) */}
          {project.workspaceBindings?.ide && (
            <DropdownMenuItem onClick={() => onOpenWorkspace?.('ide')}>
              <FolderOpen className="h-4 w-4" />
              <span>Open in IDE</span>
            </DropdownMenuItem>
          )}

          {/* Delete Project */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {showSettings && (
        <ProjectSettingsDialog
          project={project}
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      )}

      {showDelete && (
        <ProjectDeleteConfirmDialog
          project={project}
          open={showDelete}
          onOpenChange={setShowDelete}
          onConfirm={onDelete}
        />
      )}
    </>
  );
};
```

**Integration Point:**
```typescript
// File: ProjectCard.tsx (MODIFY)
import { ProjectActionsMenu } from './ProjectActionsMenu';

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  className,
}) => {
  // ... existing code ...

  return (
    <div className="...group relative">
      {/* Existing content */}

      {/* Actions Menu (Top Right, Absolute Positioned) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ProjectActionsMenu
          project={project}
          onEdit={() => console.log('Edit project:', project.id)}
          onDelete={() => console.log('Delete project:', project.id)}
          onOpenWorkspace={(ws) => navigate({
            to: `/${ws}/$projectId`,
            params: { projectId: project.id }
          })}
        />
      </div>
    </div>
  );
};
```

### 4.2 ProjectSettingsDialog Component (New)

**Purpose:** Full-featured project settings editor

**Location:** `/src/presentation/components/hub/ProjectSettingsDialog.tsx`

**Estimated Size:** 250-300 lines (based on WorkspaceBindingDialog complexity)

**Component Structure:**
```typescript
interface ProjectSettingsDialogProps {
  project: ProjectMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({
  project,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  // Form state (initialized from project metadata)
  const [name, setName] = useState(project.name);
  const [autoSync, setAutoSync] = useState(project.autoSync ?? true);
  const [bindings, setBindings] = useState<WorkspaceBindings>(
    project.workspaceBindings ?? { ide: true, notes: false, knowledge: false, study: false }
  );
  const [exclusionPatterns, setExclusionPatterns] = useState(
    project.exclusionPatterns?.join('\n') ?? ''
  );
  const [fileSnapshotEnabled, setFileSnapshotEnabled] = useState(
    project.fileSnapshotEnabled ?? false
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated: ProjectMetadata = {
        ...project,
        name,
        autoSync,
        workspaceBindings: bindings,
        exclusionPatterns: exclusionPatterns.split('\n').filter(Boolean),
        fileSnapshotEnabled,
      };

      await saveProject(updated);

      // Emit cross-workspace event
      crossWorkspaceEventBus.emitProjectStateChange({
        workspaceId: 'hub',
        projectId: project.id,
        changeType: 'bindings-changed',
      });

      toast.success(t('hub.project.settingsSaved'));
      onOpenChange(false);
    } catch (error) {
      toast.error(t('hub.project.saveFailed'));
      console.error('[ProjectSettingsDialog] Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Edit Project Settings</DialogTitle>
          <DialogDescription>
            Update project configuration and workspace bindings
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              This name is used for display only. The actual folder name cannot be changed.
            </p>
          </div>

          {/* Folder Path (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Folder Path</label>
            <Input value={project.folderPath} disabled className="bg-muted" />
          </div>

          {/* Workspace Bindings */}
          <WorkspaceBindingEditor
            bindings={bindings}
            onChange={setBindings}
          />

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto-Sync</label>
              <p className="text-xs text-muted-foreground">
                Automatically sync files to WebContainer on change
              </p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>

          {/* File Snapshot Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">File Snapshots</label>
              <p className="text-xs text-muted-foreground">
                Enable file versioning and rollback (experimental)
              </p>
            </div>
            <Switch checked={fileSnapshotEnabled} onCheckedChange={setFileSnapshotEnabled} />
          </div>

          {/* Exclusion Patterns */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exclusion Patterns</label>
            <Textarea
              value={exclusionPatterns}
              onChange={(e) => setExclusionPatterns(e.target.value)}
              placeholder="node_modules&#10;.git&#10;*.log"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Glob patterns for files to exclude from sync (one per line)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

**Dependencies:**
- Dialog: `/src/presentation/components/ui/dialog.tsx`
- Input: `/src/presentation/components/ui/input.tsx`
- Textarea: `/src/presentation/components/ui/textarea.tsx`
- Switch: `/src/presentation/components/ui/switch.tsx`
- Button: `/src/presentation/components/ui/button.tsx`
- `WorkspaceBindingEditor`: Extract from `WorkspaceBindingDialog` (reuse component)

**Reusability:**
- Can extract `WorkspaceBindingEditor` as standalone component
- Can reuse exclusion patterns logic from sync manager

### 4.3 ProjectDeleteConfirmDialog Component (New)

**Purpose:** Safe project deletion with cascade options

**Location:** `/src/presentation/components/hub/ProjectDeleteConfirmDialog.tsx`

**Estimated Size:** 150-200 lines

**Component Structure:**
```typescript
interface ProjectDeleteConfirmDialogProps {
  project: ProjectMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export const ProjectDeleteConfirmDialog: React.FC<ProjectDeleteConfirmDialogProps> = ({
  project,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [deleteData, setDeleteData] = useState(true);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // 1. Delete project metadata
      await deleteProject(project.id);

      // 2. Optionally delete associated data
      if (deleteData) {
        await Promise.all([
          clearConversation(project.id),
          clearIdeState(project.id),
          deleteIndex(project.id),
        ]);
      }

      // 3. Emit event
      crossWorkspaceEventBus.emitProjectStateChange({
        workspaceId: 'hub',
        projectId: project.id,
        changeType: 'closed',
      });

      // 4. Navigate if deleting current project
      const currentProjectId = useAppStore(s => s.currentProjectId);
      if (currentProjectId === project.id) {
        await navigate({ to: '/hub' });
      }

      toast.success(t('hub.project.deleteSuccess'));
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      toast.error(t('hub.project.deleteFailed'));
      console.error('[ProjectDeleteConfirmDialog] Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="error" size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Project?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{project.name}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Project Details */}
        <div className="bg-muted/50 p-3 rounded-none border-2 border-border">
          <div className="text-sm">
            <div className="font-mono">{project.name}</div>
            <div className="text-xs text-muted-foreground">{project.folderPath}</div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-destructive/10 p-3 rounded-none border-2 border-destructive/30">
          <p className="text-sm text-destructive">
            This will remove the project from Via-gent. Your local files will not be deleted.
          </p>
        </div>

        {/* Cascade Deletion Option */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="delete-data"
            checked={deleteData}
            onCheckedChange={(checked) => setDeleteData(checked as boolean)}
          />
          <div className="space-y-0.5">
            <label htmlFor="delete-data" className="text-sm font-medium cursor-pointer">
              Also delete associated data
            </label>
            <p className="text-xs text-muted-foreground">
              Conversations, IDE state, and RAG indexes for this project
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

**Dependencies:**
- Dialog: `/src/presentation/components/ui/dialog.tsx` (variant="error")
- Button: `/src/presentation/components/ui/button.tsx` (variant="destructive")
- Checkbox: `/src/presentation/components/ui/checkbox.tsx`
- Icons: `AlertTriangle` from lucide-react

**Cleanup Functions to Call:**
```typescript
// From: /src/lib/workspace/conversation-store.ts
clearConversation(projectId: string): Promise<void>

// From: /src/lib/workspace/ide-state-store.ts
clearIdeState(projectId: string): Promise<void>

// From: /src/lib/rag/orama-index.ts
deleteIndex(projectId: string): Promise<void>
```

---

## 5. State Management Flow

### 5.1 Project List State (Hub)

**Current Implementation:** Live Query via Dexie React Hooks

```typescript
// File: HubHomePage.tsx, lines 47-48
const projects = useLiveQuery(() => db.projects.toArray());
const isLoading = projects === undefined;
```

**Advantages:**
- ✅ Reactive (auto-updates on IndexedDB changes)
- ✅ No manual refresh logic
- ✅ Scales to 100+ projects

**Disadvantages:**
- ❌ Requires Dexie.js (not framework-agnostic)
- ❌ No loading state control (loading = undefined)

**Alternative:** Zustand Store with IndexedDB Persistence

```typescript
// Proposed: /src/infrastructure/persistence/stores/project-list-store.ts
interface ProjectListState {
  projects: ProjectMetadata[];
  isLoading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export const useProjectListStore = create<ProjectListState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      error: null,

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await listProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      refreshProjects: async () => {
        await get().loadProjects();
      },
    }),
    {
      name: 'project-list-state',
      // No persistence (reload from IndexedDB each time)
      partialize: () => ({}),
    }
  )
);
```

**Recommendation:** Keep `useLiveQuery()` for Hub (simpler, already working)

### 5.2 Edit/Delete State Flow

```
User Action (Click "Edit" or "Delete")
  ↓
Local Component State (useState)
  ↓
Dialog Open (controlled component)
  ↓
User Confirms Changes
  ↓
Call Backend API (saveProject/deleteProject)
  ↓
IndexedDB Updated (Dexie.js)
  ↓
Emit Cross-Workspace Event
  ↓
useLiveQuery Auto-Refreshes (Hub)
  ↓
Component Re-Renders (New Data Visible)
```

**Event Propagation:**
```typescript
// 1. Edit/Delete Handler
const handleEditProject = async (updatedProject: ProjectMetadata) => {
  await saveProject(updatedProject);

  // 2. Emit Event
  crossWorkspaceEventBus.emitProjectStateChange({
    workspaceId: 'hub',
    projectId: updatedProject.id,
    changeType: 'bindings-changed',
  });

  // 3. Show Toast
  toast.success('Project settings saved');
};

// 4. Workspace Components Listen
useEffect(() => {
  const unsubscribe = crossWorkspaceEventBus.onProjectStateChange((event) => {
    if (event.projectId === currentProjectId) {
      // Refresh workspace-specific state
      reloadProjectContext();
    }
  });

  return unsubscribe;
}, []);
```

### 5.3 Navigation State Flow

**Scenario:** User deletes current project (workspace is open)

```
User Deletes Current Project
  ↓
Delete Confirmation Dialog
  ↓
User Confirms Deletion
  ↓
call deleteProject(projectId)
  ↓
Check: Is this the current project?
  ↓
YES → Navigate({ to: '/hub' })
  ↓
Workspace unmounts, context clears
  ↓
Hub loads, project list refreshed
```

**Implementation:**
```typescript
// File: ProjectDeleteConfirmDialog.tsx
const navigate = useNavigate();
const currentProjectId = useAppStore(s => s.currentProjectId);

const handleDelete = async () => {
  await deleteProject(project.id);

  // Navigate if deleting current project
  if (currentProjectId === project.id) {
    await navigate({ to: '/hub' });
  }

  // ... rest of cleanup
};
```

---

## 6. User Journey Maps

### 6.1 Edit Project Journey

**Preconditions:**
- User is on Hub page (`/hub`)
- Project exists in IndexedDB
- User can see project in Recent Projects list

**Step-by-Step Flow:**

```
STEP 1: User Hovers Over Project Card
  ↓
ProjectActionsMenu button appears (top-right, 3-dot icon)
  ↓
STEP 2: User Clicks Actions Menu
  ↓
Dropdown menu appears with:
  - Edit Settings (pencil icon)
  - Open in IDE (folder icon, if IDE enabled)
  - Delete Project (trash icon, destructive)
  ↓
STEP 3: User Clicks "Edit Settings"
  ↓
ProjectSettingsDialog opens (modal)
  ↓
STEP 4: User Modifies Settings
  ├─ Display Name: "My Cool Project" → "Awesome Project"
  ├─ Workspace Bindings: Toggle Knowledge ON
  ├─ Auto-Sync: Toggle OFF
  ├─ File Snapshots: Toggle ON
  └─ Exclusion Patterns: Add "*.test.ts"
  ↓
STEP 5: User Clicks "Save Changes"
  ↓
Backend Processing:
  ├─ Call saveProject() with updated metadata
  ├─ IndexedDB record updated
  ├─ Emit crossWorkspaceEventBus event
  └─ Show success toast
  ↓
STEP 6: UI Updates
  ├─ Dialog closes
  ├─ ProjectCard re-renders with new name
  ├─ WorkspaceBadge shows "Knowledge" badge
  └─ useLiveQuery auto-refreshes project list
  ↓
STEP 7: User Opens Project in Knowledge Workspace
  ↓
Knowledge workspace sees new binding (via event or reload)
  ↓
Project accessible in Knowledge workspace ✅
```

**Error Handling:**
- **IndexedDB Write Failure:** Show error toast, keep dialog open
- **Network Error (N/A):** All data local, no network calls
- **Permission Denied:** FSA handle expired, show re-grant permission dialog

**Edge Cases:**
- **Project Name Empty:** Validation error, show "Name is required"
- **All Workspaces Disabled:** Validation warning, show "Enable at least one workspace"
- **Invalid Exclusion Patterns:** Show "Invalid glob pattern: ..."

### 6.2 Delete Project Journey

**Preconditions:**
- User is on Hub page
- Project exists in IndexedDB
- No active sessions in any workspace for this project

**Step-by-Step Flow:**

```
STEP 1: User Hovers Over Project Card
  ↓
ProjectActionsMenu button appears
  ↓
STEP 2: User Clicks Actions Menu → "Delete Project"
  ↓
ProjectDeleteConfirmDialog opens (error variant)
  ↓
STEP 3: User Sees Warning Message
  ├─ "Are you sure you want to delete [project name]?"
  ├─ "This action cannot be undone."
  ├─ "Your local files will not be deleted."
  └─ Checkbox: "Also delete associated data"
  ↓
STEP 4: User Reviews Project Details
  ├─ Display Name: "My Cool Project"
  └─ Folder Path: "/Users/john/projects/my-cool-project"
  ↓
STEP 5: User Toggles "Also Delete Associated Data" (optional)
  ↓
Backend will cascade delete:
  ├─ Conversations (conversation-store.ts)
  ├─ IDE State (ide-state-store.ts)
  └─ RAG Indexes (orama-index.ts)
  ↓
STEP 6: User Clicks "Delete Project" Button
  ↓
Backend Processing:
  ├─ Call deleteProject(id) from project-store.ts
  ├─ IndexedDB record deleted
  ├─ If cascade enabled: call cleanup functions
  ├─ Emit crossWorkspaceEventBus event
  └─ Show success toast
  ↓
STEP 7: UI Updates
  ├─ Dialog closes
  ├─ ProjectCard removed from list (useLiveQuery auto-refresh)
  └─ Recent Projects count decreases
  ↓
STEP 8: Post-Delete Cleanup
  ├─ If project was open in any workspace → Navigate to /hub
  ├─ Clear workspace context (ProjectProvider, WorkspaceProvider)
  └─ Reset local state (active thread, file tree, etc.)
  ↓
STEP 9: User Returns to Hub
  ↓
Deleted project no longer appears in Recent Projects ✅
```

**Error Handling:**
- **IndexedDB Delete Failure:** Show error toast, keep dialog open
- **Cascade Cleanup Failure:** Log error, delete project anyway (best effort)
- **Navigation Failure:** Force reload (window.location.href = '/hub')

**Edge Cases:**
- **Project Open in Workspace:** Auto-navigate to Hub, show toast "Project deleted, workspace closed"
- **Dependent Data Exists:** Show "Also delete N conversations, M indexes"
- **FSA Handle Expired:** Still delete from IndexedDB (metadata only)
- **Concurrent Delete:** Two users delete same project (unlikely, local-only app)

---

## 7. Component Dependencies Summary

### 7.1 New Components Required

| Component | File | Estimated Lines | Dependencies |
|-----------|------|----------------|--------------|
| `ProjectActionsMenu` | `/src/presentation/components/hub/ProjectActionsMenu.tsx` | 80-100 | DropdownMenu, Icons, Dialogs |
| `ProjectSettingsDialog` | `/src/presentation/components/hub/ProjectSettingsDialog.tsx` | 250-300 | Dialog, Input, Textarea, Switch, WorkspaceBindingEditor |
| `ProjectDeleteConfirmDialog` | `/src/presentation/components/hub/ProjectDeleteConfirmDialog.tsx` | 150-200 | Dialog, Button, Checkbox, Icons |

**Total New Code:** ~500-600 lines

### 7.2 Modified Components

| Component | Changes | Lines Added |
|-----------|---------|-------------|
| `ProjectCard` | Add ProjectActionsMenu trigger, handlers | 20-30 |
| `HubHomePage` | Add event handlers for edit/delete | 10-15 |

**Total Modified Code:** ~30-45 lines

### 7.3 UI Primitives (Already Exist)

| Component | Location | Usage |
|-----------|----------|-------|
| `Dialog` | `/src/presentation/components/ui/dialog.tsx` | Settings/Delete dialogs |
| `Button` | `/src/presentation/components/ui/button.tsx` | Save/Cancel/Delete buttons |
| `Input` | `/src/presentation/components/ui/input.tsx` | Display name edit |
| `Textarea` | `/src/presentation/components/ui/textarea.tsx` | Exclusion patterns |
| `Switch` | `/src/presentation/components/ui/switch.tsx` | Auto-sync, snapshot toggles |
| `Checkbox` | `/src/presentation/components/ui/checkbox.tsx` | Cascade deletion option |
| `DropdownMenu` | `/src/presentation/components/ui/dropdown-menu.tsx` | Actions menu |

### 7.4 Backend Functions (Already Exist)

| Function | Location | Usage |
|----------|----------|-------|
| `saveProject()` | `/src/lib/workspace/project-store.ts` | Update project metadata |
| `deleteProject()` | `/src/lib/workspace/project-store.ts` | Remove project record |
| `updateProjectBindings()` | `/src/lib/workspace/project-store.ts` | Update workspace bindings |
| `clearConversation()` | `/src/lib/workspace/conversation-store.ts` | Cascade delete conversations |
| `clearIdeState()` | `/src/lib/workspace/ide-state-store.ts` | Cascade delete IDE state |
| `deleteIndex()` | `/src/lib/rag/orama-index.ts` | Cascade delete RAG indexes |

### 7.5 Event System (Already Exist)

| Event | Emitter | Listener |
|-------|---------|----------|
| `project:state:change` | `crossWorkspaceEventBus` | Workspaces, Hub |
| `project:opened` | Workspace event bus | Workspace components |
| `project:closed` | Workspace event bus | Workspace components |

---

## 8. Implementation Recommendations

### 8.1 Phased Approach

**Phase 1: ProjectActionsMenu (2-3 hours)**
- Create `ProjectActionsMenu.tsx` with dropdown
- Add to `ProjectCard.tsx` (hover to show)
- Stub handlers (console.log only)
- Test UI rendering, positioning, z-index

**Phase 2: ProjectSettingsDialog (4-5 hours)**
- Create `ProjectSettingsDialog.tsx` with form fields
- Implement `saveProject()` integration
- Add cross-workspace event emission
- Test edit flow, validation, error handling

**Phase 3: ProjectDeleteConfirmDialog (3-4 hours)**
- Create `ProjectDeleteConfirmDialog.tsx` with cascade option
- Implement `deleteProject()` + cleanup functions
- Add navigation logic (if deleting current project)
- Test delete flow, error handling, edge cases

**Phase 4: Integration & Polish (2-3 hours)**
- Wire up all handlers in `HubHomePage.tsx`
- Add toasts for success/error feedback
- Test state propagation (Hub → Workspaces)
- Add keyboard shortcuts (Esc to close dialogs)
- Add loading states (saving/deleting spinners)

**Total Estimated Time:** 11-15 hours

### 8.2 Code Reuse Opportunities

**Reuse `WorkspaceBindingDialog` Logic:**
- Extract `WorkspaceBindingEditor` component
- Reuse in `ProjectSettingsDialog`
- Avoid duplicate binding toggle UI

**Reuse `ProviderSettings` Pattern:**
- Copy delete confirmation dialog structure
- Adapt for project-specific warnings
- Follow same visual style (error variant, destructive button)

**Reuse `SourceCard` Pattern:**
- Copy delete dialog state management
- Adapt `showDeleteDialog`, `setShowDeleteDialog` pattern
- Follow same loading/error handling

### 8.3 Testing Strategy

**Unit Tests:**
- `ProjectActionsMenu.test.tsx`: Dropdown interaction, menu item clicks
- `ProjectSettingsDialog.test.tsx`: Form validation, save handler
- `ProjectDeleteConfirmDialog.test.tsx`: Cascade option, delete handler

**Integration Tests:**
- Edit project → Verify IndexedDB updated
- Delete project → Verify record removed
- Delete current project → Verify navigation to Hub
- Edit bindings → Verify cross-workspace event emitted

**E2E Tests (Playwright):**
- User creates project, edits settings, verifies changes
- User deletes project, verifies removed from Hub
- User deletes open project, verifies workspace closed

### 8.4 Accessibility Checklist

**ProjectActionsMenu:**
- [ ] Dropdown button has `aria-label="Project actions"`
- [ ] Menu items have accessible names
- [ ] Keyboard navigation (Enter to open, Arrow keys to navigate)
- [ ] Escape closes menu

**ProjectSettingsDialog:**
- [ ] Dialog has `role="dialog"`
- [ ] Form inputs have associated `<label>` elements
- [ ] Required fields marked with `aria-required`
- [ ] Error messages announced to screen readers
- [ ] Focus trapped in dialog (Tab cycles through controls)
- [ ] Escape closes dialog

**ProjectDeleteConfirmDialog:**
- [ ] Warning message has `role="alert"`
- [ ] Destructive button has `aria-label="Delete project permanently"`
- [ ] Checkbox has accessible label
- [ ] Focus management (Confirm button focused on open)

### 8.5 Internationalization (i18n)

**Translation Keys to Add:**

```json
{
  "hub": {
    "project": {
      "actions": "Project Actions",
      "editSettings": "Edit Settings",
      "deleteProject": "Delete Project",
      "deleteConfirm": "Are you sure you want to delete {{name}}?",
      "deleteWarning": "This action cannot be undone. Your local files will not be deleted.",
      "deleteSuccess": "Project deleted successfully",
      "deleteFailed": "Failed to delete project",
      "settingsSaved": "Project settings saved",
      "saveFailed": "Failed to save project settings",
      "displayName": "Display Name",
      "displayNameHint": "This name is used for display only. The actual folder name cannot be changed.",
      "folderPath": "Folder Path",
      "autoSync": "Auto-Sync",
      "autoSyncHint": "Automatically sync files to WebContainer on change",
      "fileSnapshots": "File Snapshots",
      "fileSnapshotsHint": "Enable file versioning and rollback (experimental)",
      "exclusionPatterns": "Exclusion Patterns",
      "exclusionPatternsHint": "Glob patterns for files to exclude from sync (one per line)",
      "deleteData": "Also delete associated data",
      "deleteDataHint": "Conversations, IDE state, and RAG indexes for this project",
      "deleting": "Deleting...",
      "saving": "Saving..."
    }
  }
}
```

**Languages:**
- `en.json` (English, already exists)
- `vi.json` (Vietnamese, needs translation)

---

## 9. Risk Assessment & Mitigation

### 9.1 Critical Risks

**Risk 1: FSA Handle Expiration**
- **Impact:** User cannot open project after edit (handle lost)
- **Probability:** Medium (FSA handles expire on browser restart)
- **Mitigation:**
  - Check permission state before showing edit dialog
  - If expired, show re-grant permission flow
  - Fallback: Keep original handle if permission check fails

**Risk 2: Race Condition (Edit + Delete Simultaneously)**
- **Impact:** User edits project while deleting from another tab
- **Probability:** Low (single-window app, no multi-tab sync)
- **Mitigation:**
  - Optimistic UI updates (disable edit button while deleting)
  - IndexedDB transactions (atomic writes)
  - Cross-window event listener (for future multi-tab support)

**Risk 3: Cascade Delete Failure**
- **Impact:** Partial cleanup (orphaned data in IndexedDB)
- **Probability:** Medium (individual cleanup functions may fail)
- **Mitigation:**
  - Wrap cleanup in try/catch (log errors, continue)
  - Show warning toast: "Project deleted, but some data cleanup failed"
  - Provide manual cleanup tool (future enhancement)

### 9.2 Edge Cases

**Edge Case 1: Project with No Workspaces Enabled**
- **Scenario:** User disables all workspace bindings
- **Behavior:** Show validation warning "Enable at least one workspace"
- **Alternative:** Allow, but hide project from Hub until workspace enabled

**Edge Case 2: Delete Last Project**
- **Scenario:** User deletes only project in Hub
- **Behavior:** Show empty state "No projects. Create your first project."
- **CTA:** Navigate to "New Project" flow

**Edge Case 3: Invalid Exclusion Patterns**
- **Scenario:** User enters "node_modules/**/*" (invalid glob)
- **Behavior:** Validate patterns before save, show error "Invalid glob pattern"
- **Validation:** Use `glob-to-regexp` or `minimatch` to test patterns

**Edge Case 4: Very Long Project Name**
- **Scenario:** User enters 200-character name
- **Behavior:** Truncate in ProjectCard (CSS `text-overflow: ellipsis`)
- **Validation:** Max 100 characters in input (HTML `maxLength`)

**Edge Case 5: Rapid Edit/Delete Clicks**
- **Scenario:** User clicks "Edit" then "Delete" quickly
- **Behavior:** Close edit dialog, show delete dialog
- **Implementation:** Use `open` state control (only one dialog open at a time)

---

## 10. Success Criteria

### 10.1 Functional Requirements

**FR-1: Edit Project**
- [ ] User can edit project display name
- [ ] User can toggle workspace bindings
- [ ] User can change auto-sync setting
- [ ] User can toggle file snapshot feature
- [ ] User can update exclusion patterns
- [ ] Changes persist to IndexedDB
- [ ] UI reflects changes immediately

**FR-2: Delete Project**
- [ ] User can delete project from Hub
- [ ] Confirmation dialog shows project details
- [ ] User can cascade delete associated data (optional)
- [ ] Project removed from IndexedDB
- [ ] UI updates immediately (project card disappears)
- [ ] If deleting current project, navigate to Hub

**FR-3: State Propagation**
- [ ] Edit/delete events broadcast to all workspaces
- [ ] Workspaces reload project context on event
- [ ] No stale data after edit/delete

### 10.2 Non-Functional Requirements

**NFR-1: Performance**
- [ ] Dialog opens in <100ms (no lag)
- [ ] Save operation completes in <500ms
- [ ] Delete operation completes in <1s (including cascade)
- [ ] Hub UI updates immediately (no manual refresh)

**NFR-2: Accessibility**
- [ ] All dialogs are keyboard accessible
- [ ] Screen reader announces all actions
- [ ] Focus management follows ARIA guidelines
- [ ] Error messages are announced

**NFR-3: User Experience**
- [ ] Clear visual feedback for all actions
- [ ] Loading states for save/delete operations
- [ ] Error messages are actionable
- [ ] Undo functionality (optional, future enhancement)

**NFR-4: Code Quality**
- [ ] Components <300 lines (modular)
- [ ] TypeScript strict mode (no errors)
- [ ] Unit test coverage >80%
- [ ] Follows 8-bit design system

---

## 11. Reference Implementations

### 11.1 Similar Patterns in Codebase

**Example 1: SourceCard Edit/Delete (Knowledge)**
- File: `/src/presentation/components/knowledge/SourceCard.tsx`
- Lines: 87-109 (delete dialog state management)
- Pattern: `showDeleteDialog` + `setShowDeleteDialog`

**Example 2: ProviderSettings Delete Confirmation (Agents)**
- File: `/src/presentation/components/agent/ProviderSettings.tsx`
- Lines: 169-205 (delete dialog with destructive variant)
- Pattern: `isDeleteOpen` + `providerToDelete` + `dependentAgents` check

**Example 3: WorkspaceBindingDialog (Hub)**
- File: `/src/presentation/components/hub/WorkspaceBindingDialog.tsx`
- Lines: 1-312 (full dialog with form state)
- Pattern: `bindings` state + `handleConfirm` + `onOpenChange`

### 11.2 External References

**Radix UI Dialog Patterns:**
- Docs: https://www.radix-ui.com/primitives/docs/components/dialog
- Used for: Dialog header, footer, content structure

**Radix UI Dropdown Menu:**
- Docs: https://www.radix-ui.com/primitives/docs/components/dropdown-menu
- Used for: ProjectActionsMenu trigger and content

**Zustand Persist Middleware:**
- Docs: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
- Used for: Project list state (optional, not required)

**Dexie React Hooks:**
- Docs: https://dexie.org/docs/Dexie-react-hooks
- Used for: `useLiveQuery(() => db.projects.toArray())`

---

## 12. Next Steps for Iteration 42

### 12.1 Immediate Actions (Day 1)

1. **Create Base Components** (4 hours)
   - `ProjectActionsMenu.tsx` (stub handlers)
   - `ProjectSettingsDialog.tsx` (form layout, no backend)
   - `ProjectDeleteConfirmDialog.tsx` (static UI)

2. **Integrate with ProjectCard** (1 hour)
   - Add actions menu button to top-right corner
   - Show on hover (desktop), always visible (mobile)
   - Test positioning, z-index, dropdown alignment

3. **Add Backend Integration** (2 hours)
   - Wire `saveProject()` to settings dialog
   - Wire `deleteProject()` to delete dialog
   - Add toast notifications (success/error)
   - Test IndexedDB writes

### 12.2 Secondary Actions (Day 2)

4. **Implement State Propagation** (2 hours)
   - Emit `crossWorkspaceEventBus.emitProjectStateChange()`
   - Test workspace re-renders on edit/delete
   - Verify `useLiveQuery()` auto-refreshes

5. **Add Cascade Deletion** (2 hours)
   - Call `clearConversation()`, `clearIdeState()`, `deleteIndex()`
   - Add loading state for cleanup operations
   - Test partial cleanup failure (error handling)

6. **Polish & Edge Cases** (2 hours)
   - Add validation (name required, at least one workspace)
   - Handle FSA handle expiration
   - Navigate to Hub if deleting current project
   - Test rapid edit/delete clicks

### 12.3 Final Actions (Day 3)

7. **Testing & Documentation** (3 hours)
   - Write unit tests (Jest + Testing Library)
   - Write integration tests (Edit → IndexedDB → Verify)
   - Update i18n translation keys (en.json, vi.json)
   - Document component props, handlers, events

8. **Code Review & Refinement** (2 hours)
   - Review with team for 8-bit design compliance
   - Check accessibility (keyboard nav, screen reader)
   - Verify TypeScript strict mode (no errors)
   - Ensure <300 line component limit

**Total Estimated Time:** 18 hours (3 days)

---

## 13. Questions & Open Issues

### 13.1 Design Decisions Needed

1. **Project Name Editing:**
   - Q: Should we allow editing the display name?
   - A: Yes, but clarify that folder name cannot change (FSA security)
   - UI: Show tooltip/hint explaining the limitation

2. **Cascade Deletion Default:**
   - Q: Should "Also delete associated data" be checked by default?
   - A: No, default to unchecked (safer, explicit user intent)
   - UI: Show data counts (e.g., "3 conversations, 1 index")

3. **Delete Confirmation Wording:**
   - Q: Should we mention "Your local files will not be deleted"?
   - A: Yes, critical for user trust (clarify data scope)
   - UI: Use warning banner with destructive styling

4. **Actions Menu Position:**
   - Q: Top-right corner (absolute) or inline with badges?
   - A: Top-right, hover-only (matches SourceCard pattern)
   - Mobile: Always visible (no hover on touch devices)

### 13.2 Technical Questions

1. **IndexedDB Transaction Safety:**
   - Q: Can `saveProject()` and `deleteProject()` be called simultaneously?
   - A: Dexie.js handles transactions automatically (serializes writes)
   - Test: Rapid edit/delete clicks (should queue, not conflict)

2. **Cross-Workspace Event Ordering:**
   - Q: Do workspaces receive project state change events before IndexedDB commits?
   - A: No, emit event after IndexedDB write completes (await promise)
   - Code: `await saveProject()` → `emitEvent()` → `toast.success()`

3. **Cleanup Function Failure Handling:**
   - Q: If `clearConversation()` fails, should we abort delete?
   - A: No, best-effort cleanup (log error, continue with project delete)
   - UI: Show warning toast "Project deleted, but some cleanup failed"

### 13.3 Future Enhancements (Out of Scope)

1. **Undo Delete:**
   - Implement soft delete (mark as deleted, purge after 30 days)
   - Add "Restore" button to Hub trash view
   - Complexity: Low (add `deleted` flag to `ProjectMetadata`)

2. **Project Cloning:**
   - Add "Clone Project" action to menu
   - Copy metadata, generate new UUID
   - Reuse workspace bindings, exclusion patterns
   - Complexity: Medium (FSA handle requires re-prompt for directory)

3. **Batch Operations:**
   - Select multiple projects (checkboxes)
   - Batch delete, batch edit bindings
   - Complexity: High (new UI pattern, bulk updates)

4. **Project Export/Import:**
   - Export project metadata as JSON
   - Import on another device (migrate projects)
   - Complexity: Medium (FSA handles cannot transfer, need re-grant)

---

## 14. Glossary

**CRUD:** Create, Read, Update, Delete (standard data operations)

**Dexie.js:** IndexedDB wrapper library (simplifies database operations)

**FSA:** File System Access API (browser native file system access)

**IndexedDB:** Browser-based persistent storage (NoSQL database)

**useLiveQuery:** Dexie React Hooks pattern (reactive queries, auto-refresh)

**Workspace Binding:** Association between project and workspace (IDE, Notes, etc.)

**Cross-Workspace Event:** Event broadcasted across all workspaces (state synchronization)

**Cascade Delete:** Delete project + associated data (conversations, indexes, etc.)

**8-bit Design System:** Visual design language (pixel art, dark theme, hard shadows)

**ProjectCard:** Hub component displaying project in Recent Projects list

**ProjectActionsMenu:** Dropdown menu for project actions (edit, delete, open)

**ProjectSettingsDialog:** Modal dialog for editing project configuration

**ProjectDeleteConfirmDialog:** Confirmation dialog for project deletion

**WB-1, WB-4, WB-5:** Workspace Binding epic stories (multi-workspace support)

**Story WB-5:** Epic story for Hub Project Card Enhancement

**Story WB-6:** Epic story for Cross-Workspace Navigation

**Story WB-8:** Epic story for Cross-Workspace Event System

---

## 15. Appendix: Component File Structure

```
src/presentation/components/hub/
├── BootSequence.tsx (107 lines)
├── HubHero.tsx (133 lines)
├── HubHomePage.tsx (250 lines)
├── MobileProjectSelector.tsx (195 lines)
├── NavigationBreadcrumbs.tsx (111 lines)
├── ProjectCard.tsx (180 lines) ← MODIFY
├── RecentProjectsSection.tsx (126 lines)
├── TopicCard.tsx (133 lines)
├── TopicPortalCard.tsx (107 lines)
├── WorkspaceBadge.tsx (133 lines)
├── WorkspaceBindingDialog.tsx (312 lines)
├── ProjectActionsMenu.tsx ← NEW (80-100 lines)
├── ProjectSettingsDialog.tsx ← NEW (250-300 lines)
└── ProjectDeleteConfirmDialog.tsx ← NEW (150-200 lines)
```

**Total Hub Component Lines:** 1,697 → 2,177 (+480 lines, ~28% increase)

---

**End of Context Document**

---

**Document Metadata:**
- **Version:** 1.0.0
- **Last Updated:** 2026-01-02
- **Maintained By:** BMAD Framework (Platform Unification Initiative)
- **Related Artifacts:**
  - `/src/lib/workspace/project-store.ts` (backend reference)
  - `/src/lib/events/cross-workspace-event-bus.ts` (event system)
  - `/src/presentation/components/hub/HubHomePage.tsx` (UI entry point)
  - `_bmad-output/platform-unification-phase-3-iteration-42-codebase-snapshot.xml` (snapshot)

**Feedback Loop:**
After implementing Iteration 42, update this document with:
- Actual component line counts
- Real-world performance metrics
- Edge cases discovered during testing
- User feedback on UX flows

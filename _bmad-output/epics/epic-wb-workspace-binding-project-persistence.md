---
epic_id: "WB"
title: "Workspace Binding & Project Persistence"
status: PROPOSED
created: "2026-01-01T01:48:19+07:00"
priority: P0
effort_hours: 42
trigger: "NRM Course Correction - Project Space Analysis"
document: "_bmad-output/project-planning-artifacts/sprint-change-proposal-project-workspace-binding-2026-01-01.md"
---

# Epic WB: 🔗 Workspace Binding & Project Persistence

## Overview

**User Outcome:** When opening a project from the Hub, users can select which workspaces (IDE, Notes, Knowledge, Study) the project syncs into. Once FSA permission is granted, the file tree is snapshotted to IndexedDB for instant reload on subsequent visits. All bound workspaces share the same project context.

**Social Media Appeal:** ⭐⭐⭐⭐⭐ — "One Project, All Workspaces" — instant project switching demo

**Priority:** P0 (Critical for Knowledge Synthesis Station mission)

**Estimated Effort:** 42 hours (5.25 working days)

---

## Problem Statement

Currently:
1. Projects only open in IDE workspace — no workspace choice
2. Every project open requires re-reading files from FSA (slow: 2-10s)
3. No cross-workspace project context — switching workspaces loses state
4. FileTree only available in IDE — not reusable

**This breaks the core value proposition:** A unified Knowledge Synthesis Station where project files are accessible from any workspace.

---

## Architecture

### Before (Current)
```
Hub → Project Card → /ide (ONLY)
     [No workspace choice]
     [FSA read on every load]
     [No snapshot persistence]
```

### After (Target)
```
Hub → Project Card → Workspace Binding Dialog
                            │
                     ┌──────┴──────┐
                     │  Which      │
                     │  workspaces?│
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         ┌────────┐    ┌────────┐    ┌────────┐
         │  IDE   │    │ Notes  │    │Knowledge│
         └────┬───┘    └────┬───┘    └────┬───┘
              │             │             │
              └─────────────┼─────────────┘
                            │
                   ┌────────┴────────┐
                   │ SHARED CONTEXT  │
                   │ - FileSnapshot  │
                   │ - IndexedDB     │
                   │ - Lazy Loading  │
                   └─────────────────┘
```

---

## Data Model Changes

### ProjectMetadata Enhancement

```typescript
// CURRENT
interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;
    lastOpened: Date;
    autoSync?: boolean;
    layoutState?: LayoutConfig;
    exclusionPatterns?: string[];
}

// ENHANCED
interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;
    lastOpened: Date;
    autoSync?: boolean;
    layoutState?: LayoutConfig;
    exclusionPatterns?: string[];
    
    // NEW: Workspace Bindings
    workspaceBindings: {
        ide: WorkspaceBinding;
        notes: WorkspaceBinding;
        knowledge: WorkspaceBinding;
        study: WorkspaceBinding;
        canvas: WorkspaceBinding;
    };
    
    // NEW: Snapshot for instant reload
    snapshotId?: string;
    snapshotTimestamp?: number;
}

interface WorkspaceBinding {
    enabled: boolean;
    lastAccessed?: Date;
    settings?: Record<string, unknown>;
}
```

### FileSnapshot Schema

```typescript
interface FileSnapshot {
    id: string;               // projectId
    timestamp: number;        // Date.now()
    
    tree: FileNode;           // File tree structure (no content)
    
    totalFiles: number;
    totalSize: number;
}

interface FileNode {
    path: string;
    name: string;
    isDirectory: boolean;
    size?: number;
    lastModified?: number;
    children?: FileNode[];
}

// Content cached separately (lazy loaded)
interface FileContentCache {
    projectId: string;
    path: string;
    content: string;
    hash: string;
    cachedAt: number;
}
```

---

## Stories

### Story WB-1: Project Metadata Enhancement

**As a** developer,
**I want** ProjectMetadata to include workspace bindings and snapshot reference,
**So that** I can track which workspaces a project is bound to.

**Acceptance Criteria:**

**Given** the existing ProjectMetadata interface  
**When** this story is complete  
**Then** workspaceBindings field is added with all workspace options  
**And** snapshotId and snapshotTimestamp fields are added  
**And** existing projects are migrated with default bindings (ide: true, others: false)  
**And** all CRUD operations support new fields

**Priority:** P0  
**Effort:** 4 hours

**Files:**
- `src/lib/workspace/project-store.ts` (UPDATE)
- `src/lib/persistence/dexie-db.ts` (UPDATE schema)

---

### Story WB-2: File Snapshot Store

**As a** developer,
**I want** to persist file tree snapshots to IndexedDB,
**So that** project reload is instant without re-reading from FSA.

**Acceptance Criteria:**

**Given** a project with FSA permission granted  
**When** the file tree is read  
**Then** a snapshot is saved to IndexedDB  
**And** the snapshot includes file paths, sizes, and timestamps (no content)

**Given** a user reopens a project  
**When** a valid snapshot exists (< 5 min old)  
**Then** the snapshot is used immediately  
**And** FSA is NOT read until content is requested

**Given** a snapshot is stale (> 5 min)  
**When** the project reopens  
**Then** the stale snapshot is shown immediately  
**And** a background refresh reads FSA and updates snapshot  
**And** UI updates when refresh completes

**Priority:** P0  
**Effort:** 6 hours

**Files:**
- `src/lib/workspace/file-snapshot-store.ts` (NEW)
- `src/lib/persistence/dexie-db.ts` (UPDATE schema)

---

### Story WB-3: Project Context Provider

**As a** developer,
**I want** a shared ProjectContext available across all workspace routes,
**So that** workspaces can access the same project state.

**Acceptance Criteria:**

**Given** a user opens a project  
**When** they navigate to any workspace route  
**Then** useProjectContext() returns the active project  
**And** useProjectContext() returns the file tree from snapshot  
**And** useProjectContext() returns the list of bound workspaces

**Given** a user is in the IDE workspace  
**When** they call switchWorkspace('notes')  
**Then** they navigate to /notes  
**And** the project context is preserved (no reload)

**Priority:** P0  
**Effort:** 8 hours

**Files:**
- `src/lib/workspace/ProjectContext.tsx` (NEW)
- `src/routes/__root.tsx` (UPDATE to wrap with provider)

---

### Story WB-4: Workspace Binding Dialog

**As a** user,
**I want** to choose which workspaces a project syncs to when opening it,
**So that** I can organize my workflow.

**Acceptance Criteria:**

**Given** a user clicks a project card on the Hub  
**When** the dialog opens  
**Then** they see checkboxes for each workspace (IDE, Notes, Knowledge, Study, Canvas)  
**And** previously bound workspaces are pre-checked  
**And** they can select which workspace to open first

**Given** a user confirms the dialog  
**When** they click "Open Project"  
**Then** the workspace bindings are saved to IndexedDB  
**And** they navigate to the selected workspace  
**And** the project context is established

**Given** a project has never been opened before  
**When** the dialog opens  
**Then** IDE is pre-checked by default  
**And** other workspaces are unchecked

**Priority:** P0  
**Effort:** 6 hours

**Files:**
- `src/presentation/components/hub/WorkspaceBindingDialog.tsx` (NEW)
- `src/presentation/components/hub/HubProjectGrid.tsx` (UPDATE)

---

### Story WB-5: Hub Project Card Enhancement

**As a** user,
**I want** to see which workspaces are bound to a project from the Hub,
**So that** I can quickly open the workspace I need.

**Acceptance Criteria:**

**Given** a project has workspace bindings  
**When** the Hub loads  
**Then** each project card shows badges for bound workspaces  
**And** clicking a badge opens the project directly in that workspace

**Given** a user hovers over a project card  
**When** quick-open buttons appear  
**Then** only enabled workspaces show buttons  
**And** clicking a button skips the dialog and opens directly

**Priority:** P1  
**Effort:** 4 hours

**Files:**
- `src/presentation/components/hub/ProjectCard.tsx` (UPDATE)
- `src/presentation/components/hub/WorkspaceBadge.tsx` (NEW)

---

### Story WB-6: Cross-Workspace Navigation

**As a** user,
**I want** to switch between bound workspaces without losing project context,
**So that** I can seamlessly work across different views.

**Acceptance Criteria:**

**Given** a user is in IRC workspace working on a project  
**When** they click "Open in Notes" in the header  
**Then** they navigate to /notes  
**And** the same project remains active  
**And** the file tree is still available (from snapshot)  
**And** no FSA re-read occurs

**Given** a user switches to an unbound workspace  
**When** they attempt the switch  
**Then** a confirmation dialog appears asking to bind the workspace  
**And** if confirmed, the binding is saved and navigation proceeds

**Priority:** P1  
**Effort:** 6 hours

**Files:**
- `src/presentation/components/layout/WorkspaceSelector.tsx` (NEW)
- `src/presentation/components/layout/Header.tsx` (UPDATE)

---

### Story WB-7: Lazy Content Loading

**As a** developer,
**I want** file content loaded on-demand and cached in IndexedDB,
**So that** large projects don't block initial load.

**Acceptance Criteria:**

**Given** a file tree is loaded from snapshot  
**When** no file content is needed yet  
**Then** no FSA content reads occur  
**And** the tree renders instantly

**Given** a user clicks a file to open it  
**When** the file is not in content cache  
**Then** FSA reads the file content  
**And** content is cached to IndexedDB  
**And** subsequent opens use the cache

**Given** a file was modified externally  
**When** the user opens it  
**Then** the cached version shows first  
**And** a background check compares timestamps  
**And** if different, content is refreshed with visual indicator

**Priority:** P1  
**Effort:** 4 hours

**Files:**
- `src/lib/workspace/file-content-cache.ts` (NEW)
- `src/lib/workspace/file-snapshot-store.ts` (UPDATE)

---

### Story WB-8: Snapshot Refresh Strategy

**As a** developer,
**I want** snapshots to refresh in the background without blocking UI,
**So that** users always see instant UI with eventual consistency.

**Acceptance Criteria:**

**Given** a snapshot is older than 5 minutes  
**When** the project opens  
**Then** the stale snapshot shows immediately  
**And** a background task refreshes the snapshot  
**And** when refresh completes, the tree updates smoothly

**Given** files were added/deleted locally  
**When** the refresh detects changes  
**Then** added files appear in tree with "New" badge  
**And** deleted files disappear with animation  
**And** content cache is invalidated for modified files

**Priority:** P2  
**Effort:** 4 hours

**Files:**
- `src/lib/workspace/snapshot-refresh-service.ts` (NEW)
- `src/lib/workspace/file-snapshot-store.ts` (UPDATE)

---

## Dependencies

### Internal
- `project-store.ts` - Must be enhanced first (WB-1)
- `dexie-db.ts` - IndexedDB schema must include new tables

### External
- File System Access API (Chrome 86+, Edge 86+)
- No new external dependencies required

---

## Success Metrics

- [ ] Project opens in <1s when snapshot exists
- [ ] Workspace switching is instant (<200ms navigation)
- [ ] Content cache hit rate >90% after first access
- [ ] No FSA reads on snapshot-backed project open
- [ ] Users can bind projects to multiple workspaces
- [ ] All existing tests pass

---

## Out of Scope

- Real-time file watching (future enhancement)
- Cloud sync of snapshots
- Collaborative editing
- Version history

---

**Epic Owner:** TBD  
**Created:** 2026-01-01T01:48:19+07:00  
**Last Updated:** 2026-01-01T01:48:19+07:00

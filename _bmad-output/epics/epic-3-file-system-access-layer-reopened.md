# Epic 3: File System Access Layer - REOPENED

**Status:** REOPENED (2025-12-12) - Course Correction Required  
**Stories:** 8/8 (4 original + 4 hotfix)  
**Tests:** 60 passing  
**Change Proposal:** [docs/sprint-artifacts/sprint-change-proposal-2025-12-12.md](docs/sprint-artifacts/sprint-change-proposal-2025-12-12.md)

### Original Deliverables (Complete)

| Story | Component | Status |
|-------|-----------|--------|
| 3-1 | LocalFSAdapter | ✅ 42 tests |
| 3-2 | FileTree Component | ✅ Complete |
| 3-3 | SyncManager | ✅ 5 tests |
| 3-4 | Permission Lifecycle | ✅ 5 tests |

### Hotfix Stories (Course Correction 2025-12-12)

> **Root Cause:** Original stories focused on feature completion without adequate UX integration. See [Sprint Change Proposal](docs/sprint-artifacts/sprint-change-proposal-2025-12-12.md) for detailed analysis.

---

### Story 3.5: Implement Folder Switching *(HOTFIX)*

As a **user**,
I want **to switch to a different project folder without closing the app**,
So that **I can work on multiple projects in one session**.

**Priority:** P0  
**Blocked By:** Story 3-7 (ProjectStore)

**Acceptance Criteria:**

- **AC-3-5-1:** Given user is in workspace with folder open, when user clicks "Open Different Folder" button (distinct from sync), then directory picker dialog appears (NOT re-sync of current folder)
- **AC-3-5-2:** Given user selects different folder in picker, when selection confirmed, then:
  - Old handle is released (cleared from state, not revoked)
  - New handle stored in IndexedDB keyed by new projectId
  - FileTree refreshes with new folder contents
  - WebContainer receives new mount (not cumulative)
- **AC-3-5-3:** Given user cancels directory picker, when dialog closes, then current folder remains active (no state change)
- **AC-3-5-4:** Given user is in workspace with no folder open, when clicking "Open Folder", then directory picker appears normally

**Implementation Tasks:**
- [ ] T1: Add explicit "Open Different Folder" button to header
- [ ] T2: Modify `handleOpenFolder` to always show picker when called from new button
- [ ] T3: Clear WebContainer mount before new mount
- [ ] T4: Update `permission-lifecycle.ts` to support multi-workspace keys
- [ ] T5: Write integration tests for folder switch flow

---

### Story 3.6: Implement Sync Status UI *(HOTFIX)*

As a **user**,
I want **to see the current sync status and trigger manual sync**,
So that **I know when my files are saved and can force sync if needed**.

**Priority:** P0  
**Blocked By:** Story 3-8 (WorkspaceContext)

**Acceptance Criteria:**

- **AC-3-6-1:** Given sync is in progress, when viewing FileTree header, then animated sync indicator shows with file count (e.g., "Syncing 45/120 files...")
- **AC-3-6-2:** Given sync is idle, when viewing FileTree header, then static checkmark shows with last sync time
- **AC-3-6-3:** Given sync has errors, when viewing FileTree header, then warning icon shows with error count, clickable to show details
- **AC-3-6-4:** Given user wants to trigger manual sync, when clicking sync button, then full re-sync from LocalFS to WebContainer occurs
- **AC-3-6-5:** Sync status persists across component remounts (stored in WorkspaceContext)

**Implementation Tasks:**
- [ ] T1: Create `SyncStatusIndicator` component with states: idle/syncing/error
- [ ] T2: Add `syncStatus$` observable to SyncManager using EventEmitter
- [ ] T3: Wire SyncStatusIndicator to SyncManager via WorkspaceContext
- [ ] T4: Add "Sync Now" button
- [ ] T5: Store last sync timestamp in IndexedDB
- [ ] T6: Write unit tests for all sync states

---

### Story 3.7: Implement Project Metadata Persistence *(HOTFIX - PRIORITIZED)*

As a **user**,
I want **my recent projects remembered with their access status**,
So that **I can quickly resume work from the dashboard**.

**Priority:** P0 (Must implement first - blocks 3-5, 3-8, 4-0-2)

**Acceptance Criteria:**

- **AC-3-7-1:** Given user opens folder, when folder is synced, then project metadata stored in IndexedDB:
  ```typescript
  interface ProjectMetadata {
    id: string;                              // UUID or derived
    name: string;                            // Folder name
    folderPath: string;                      // Display path
    fsaHandle: FileSystemDirectoryHandle;   // Stored handle
    lastOpened: Date;
    layoutState?: LayoutConfig;             // Future: panel sizes
  }
  ```
- **AC-3-7-2:** Given user visits dashboard, when page loads, then real recent projects load from IndexedDB (not mock)
- **AC-3-7-3:** Given project handle has expired permission, when shown in dashboard, then visual indicator shows "needs re-authorization"
- **AC-3-7-4:** Given user clicks expired project, when clicked, then permission prompt appears
- **AC-3-7-5:** Given user wants to remove project from recents, when clicking remove, then project deleted from IndexedDB

**Implementation Tasks:**
- [ ] T1: Create `src/lib/workspace/project-store.ts` with IndexedDB schema
- [ ] T2: Create CRUD: `saveProject`, `getProject`, `listProjects`, `deleteProject`
- [ ] T3: Add `checkHandlePermission` helper
- [ ] T4: Migrate Dashboard to use `listProjects()`
- [ ] T5: Add permission status indicator to project cards
- [ ] T6: Write integration tests

---

### Story 3.8: Implement Workspace Context *(HOTFIX - ARCHITECTURE)*

As a **developer**,
I want **a centralized WorkspaceContext for IDE-wide state**,
So that **all components access sync status and folder state without prop drilling**.

**Priority:** P0  
**Blocked By:** Story 3-7 (ProjectStore)

**Acceptance Criteria:**

- **AC-3-8-1:** WorkspaceContext provides:
  ```typescript
  interface WorkspaceState {
    projectId: string | null;
    projectMetadata: ProjectMetadata | null;
    directoryHandle: FileSystemDirectoryHandle | null;
    permissionState: FsaPermissionState;
    syncStatus: 'idle' | 'syncing' | 'error';
    syncProgress: SyncProgress | null;
    lastSyncTime: Date | null;
    syncError: string | null;
  }
  
  interface WorkspaceActions {
    openFolder(): Promise<void>;
    switchFolder(): Promise<void>;
    syncNow(): Promise<void>;
    closeProject(): void;
  }
  ```
- **AC-3-8-2:** IDELayout refactored to consume WorkspaceContext instead of local useState
- **AC-3-8-3:** FileTree receives only `onFileSelect` prop, gets handle from context
- **AC-3-8-4:** Header components get sync status from context
- **AC-3-8-5:** Context provider wraps workspace route, not entire app

**Implementation Tasks:**
- [ ] T1: Create `src/lib/workspace/WorkspaceContext.tsx`
- [ ] T2: Implement `WorkspaceProvider` with all state and actions
- [ ] T3: Refactor `IDELayout` to use context
- [ ] T4: Refactor `FileTree` to use context for handle
- [ ] T5: Add `useWorkspace()` hook
- [ ] T6: Write unit tests for state transitions

---

### Implementation Order

```
3-7 (ProjectStore)     ← Foundation
      ↓
3-8 (WorkspaceContext) ← Architecture
      ↓
3-5 (Folder Switching) ← Uses both
      ↓
3-6 (Sync Status UI)   ← Uses Context
```

### Integration Points for Epic 4

- **Monaco Editor**: Use `SyncManager.writeFile()` for save operations
- **FileTree → Editor**: Wire `onFileSelect` callback to open files
- **Save Flow**: `Monaco → SyncManager → LocalFS + WebContainer`

---

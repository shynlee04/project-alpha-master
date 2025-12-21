# Epic 9: Multi-Root Workspace Support *(POST-MVP)*

**Goal:** Implement VS Code-style multi-root workspaces with multiple folder roots, workspace files, and synchronized state across git repositories.

**Requirements Covered:** Multi-project management, permanent state synchronization, VS Code workspace compatibility

**Priority:** Post-MVP (after Epic 8 validation complete)  
**Prerequisites:** Epic 5 (Persistence), Epic 7 (Git Integration), Epic 10 (Event Bus), Epic 11 (Code Splitting)

### Story 9.1: Implement Workspace File Format

As a **user**,
I want **to save and load workspace configurations**,
So that **I can quickly restore my multi-folder setup**.

**Acceptance Criteria:**

- **AC-9-1-1:** Workspace file format (`.via-gent-workspace.json`):
  ```json
  {
    "folders": [
      { "name": "ROOT", "path": "./" },
      { "name": "packages/app1", "path": "./packages/app1" },
      { "name": "external-lib", "path": "/absolute/path/to/lib" }
    ],
    "settings": {
      "excludePatterns": [".git", "node_modules"]
    }
  }
  ```
- **AC-9-1-2:** Save Workspace: File → Save Workspace As → creates `.via-gent-workspace.json`
- **AC-9-1-3:** Open Workspace: File → Open Workspace → loads workspace file
- **AC-9-1-4:** Recent Workspaces: Dashboard shows recent workspaces with "(Workspace)" suffix
- **AC-9-1-5:** Close Workspace: Clears all folder roots, returns to dashboard

---

### Story 9.2: Implement Multi-Root FileTree

As a **user**,
I want **multiple folder roots displayed in the file explorer**,
So that **I can navigate all project folders in one view**.

**Acceptance Criteria:**

- **AC-9-2-1:** FileTree shows collapsible root for each workspace folder
- **AC-9-2-2:** Each root folder has independent FSA handle (separate permission)
- **AC-9-2-3:** Add Folder: Button to add new root folder via directory picker
- **AC-9-2-4:** Remove Folder: Context menu to remove folder from workspace (not delete)
- **AC-9-2-5:** Rename Folder: Context menu to change display name (not filesystem name)
- **AC-9-2-6:** Folder order persists in workspace file

---

### Story 9.3: Implement Multi-Root Sync Manager

As a **developer**,
I want **SyncManager to handle multiple root folders**,
So that **each folder syncs independently to WebContainers**.

**Acceptance Criteria:**

- **AC-9-3-1:** Each root folder mounts to WebContainers at its display name path
- **AC-9-3-2:** Sync status tracked per-root (some syncing, others idle)
- **AC-9-3-3:** Sync errors isolated to affected root (don't block others)
- **AC-9-3-4:** Adding folder triggers sync for new folder only
- **AC-9-3-5:** Removing folder unmounts from WebContainers

---

### Story 9.4: Implement Multi-Git Repository Support

As a **user**,
I want **Git integration for each folder root that contains a `.git` directory**,
So that **I can manage commits across multiple repositories**.

**Acceptance Criteria:**

- **AC-9-4-1:** Source Control panel shows "Source Control Repositories" list
- **AC-9-4-2:** Each folder with `.git` appears as separate repository
- **AC-9-4-3:** Selecting repository shows its status, staged, and unstaged files
- **AC-9-4-4:** Commit, stage, unstage scoped to selected repository
- **AC-9-4-5:** Status badges on FileTree reflect correct repository
- **AC-9-4-6:** Nested `.git` directories detected (submodules)

---

### Story 9.5: Handle Git Submodules

As a **user**,
I want **Git submodules displayed and managed correctly**,
So that **I can work with monorepos using submodules**.

**Acceptance Criteria:**

- **AC-9-5-1:** Submodules detected via `.gitmodules` file parsing
- **AC-9-5-2:** Submodule folders show special icon indicator
- **AC-9-5-3:** Submodule status shows: initialized, uninitialized, modified
- **AC-9-5-4:** Submodule update command available via context menu
- **AC-9-5-5:** Nested submodules recursively detected (up to 3 levels)

---

### Story 9.6: Implement Workspace State Synchronization

As a **user**,
I want **IDE state synchronized across all workspace roots**,
So that **my layout, open files, and preferences persist correctly**.

**Acceptance Criteria:**

- **AC-9-6-1:** Workspace state stored in IndexedDB keyed by workspace file path
- **AC-9-6-2:** Open file tabs show `[folder-name]/path/to/file` for disambiguation
- **AC-9-6-3:** Search scopes to selected root or all roots
- **AC-9-6-4:** Terminal can be opened in any root folder
- **AC-9-6-5:** Per-folder settings override workspace settings

---

### Story 9.7: Implement Workspace-Aware Agent Tools

As a **developer**,
I want **AI agent tools that understand multi-root context**,
So that **the agent operates on the correct folder**.

**Acceptance Criteria:**

- **AC-9-7-1:** File tools accept `root` parameter (optional, defaults to active)
- **AC-9-7-2:** Agent tool `list_workspace_roots()` returns all roots with paths
- **AC-9-7-3:** Git tools accept `repository` parameter for multi-repo workspace
- **AC-9-7-4:** When user mentions "app1", agent resolves to correct root
- **AC-9-7-5:** Tool results show root context: `[packages/app1] Created file...`

---

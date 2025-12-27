# Epic 3: File System Access Layer

**Goal:** Implement local folder access via File System Access API with bidirectional sync to WebContainers.

**Requirements Covered:** FR-FS-01 to FR-FS-05, FR-SYNC-01 to FR-SYNC-03, TECH-FSA-ADAPTER, TECH-SYNC-STRATEGY

### Story 3.1: Implement Local FS Adapter

As a **developer**,
I want **a File System Access API wrapper module**,
So that **I can request and manage access to local folders**.

**Acceptance Criteria:**

**Given** the `src/lib/filesystem/` directory
**When** I implement the local-fs-adapter
**Then** the module provides:
  - `requestDirectoryAccess()` → `showDirectoryPicker()` wrapper
  - `readFile(path)` → reads file content as string
  - `writeFile(path, content)` → writes content to file
  - `listDirectory(path)` → lists directory contents
  - `createFile/createDirectory/deleteFile/deleteDirectory/rename`
**And** permission errors are gracefully handled

---

### Story 3.2: Implement FileTree Component

As a **developer**,
I want **a file tree component that displays project structure**,
So that **users can navigate and manage project files**.

**Acceptance Criteria:**

**Given** a directory handle from FSA
**When** I render the FileTree component
**Then** all files and folders are displayed hierarchically
**And** folders can be expanded/collapsed
**And** files show appropriate icons by extension
**And** right-click shows context menu (create, rename, delete)
**And** keyboard navigation works (arrows, Enter)

---

### Story 3.3: Implement Sync Manager

As a **developer**,
I want **a sync manager that keeps Local FS and WebContainers in sync**,
So that **file changes are reflected in both systems**.

**Acceptance Criteria:**

**Given** both FSA handle and WebContainers instance
**When** project opens
**Then** all files sync from local FS → WebContainers
**And** `.git` and `node_modules` are excluded from sync to disk
**When** a file is saved in Monaco
**Then** file writes to both local FS and WebContainers
**And** sync completes within 500ms for individual files
**And** sync errors surface to the user

---

### Story 3.4: Handle Directory Permission Lifecycle

As a **developer**,
I want **FSA handles persisted and permission re-checks on reload**,
So that **users don't lose access between sessions**.

**Acceptance Criteria:**

**Given** a granted directory handle
**When** page reloads
**Then** handle is restored from IndexedDB
**And** `queryPermission()` is called to check status
**And** if permission is `prompt`, user is asked to re-grant
**And** if permission is `denied`, fallback to virtual FS is offered

---

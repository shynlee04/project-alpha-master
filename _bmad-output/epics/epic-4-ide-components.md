# Epic 4: IDE Components

**Goal:** Implement Monaco editor, preview panel, and foundational chat panel UI.

**Requirements Covered:** FR-IDE-03, FR-IDE-05, FR-IDE-06, UX-COMPONENTS, UX-DESIGN

**Dependencies:** Epic 3 (SyncManager, FileTree) ✅

### Story 4.0.2: Wire Dashboard to ProjectStore *(Course Correction v3)*

As a **returning developer**,  
I want **the dashboard to list and open recent projects backed by ProjectStore with sync-aware status**,  
So that **I can reopen workspaces confidently with FSA + WebContainer parity**.

**Acceptance Criteria (summary):**
- Dashboard lists recent projects with name, last opened, and source (FSA handle vs WebContainer snapshot).
- Open action bootstraps WorkspaceContext + SyncManager before navigation; FileTree/Editor hydrate selected project.
- Stale FSA handles trigger restore prompt with fallback to virtual FS.
- SyncStatus indicator shows idle/syncing/error consistently in dashboard + header during open.
- Emit `dashboard:loaded` hook with project and stale-handle counts for tests/analytics.

**Tasks (summary):** Load ProjectStore recents; wire open flow to WorkspaceContext/SyncManager; permission restore UX; sync status propagation; instrumentation hook; tests.

### Story 4.1: Implement Monaco Editor Component

As a **developer**,
I want **a Monaco editor component integrated with the IDE**,
So that **users can edit code with syntax highlighting and IntelliSense**.

**Acceptance Criteria:**

**Given** the IDE layout
**When** I click a file in the FileTree
**Then** the file opens in Monaco editor
**And** syntax highlighting works for TypeScript/JavaScript/CSS/HTML
**And** auto-save triggers after 2 seconds of inactivity
**And** multiple files can be open as tabs
**And** unsaved changes show indicator

---

### Story 4.2: Wire Editor to Sync Manager

As a **developer**,
I want **editor saves to write to both FS systems**,
So that **changes persist immediately to disk and WebContainers**.

**Acceptance Criteria:**

**Given** a file open in Monaco
**When** I edit and save (Cmd+S or auto-save)
**Then** content writes to local FS via FSA
**And** content writes to WebContainers FS
**And** file tree reflects any new files
**And** save errors display toast notification

---

### Story 4.3: Implement Preview Panel

As a **developer**,
I want **a preview panel showing the dev server output**,
So that **users can see their application running**.

**Acceptance Criteria:**

**Given** a dev server running in WebContainers
**When** I view the preview panel
**Then** an iframe displays the dev server URL
**And** changes trigger hot-reload within 2 seconds
**And** device frame options are available (desktop, tablet, mobile)
**And** refresh button reloads the preview
**And** open in new tab button works

---

### Story 4.4: Implement Chat Panel Shell

As a **developer**,
I want **a chat panel UI shell**,
So that **users can interact with AI agents**.

**Acceptance Criteria:**

**Given** the IDE layout
**When** I view the chat panel
**Then** I see a message list area
**And** I see a text input with send button
**And** messages display with user/agent styling
**And** the panel can be collapsed/expanded
**And** Cmd+K opens the chat panel

---

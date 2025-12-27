# Epic 4.5: Project Fugu Enhancements *(NEW)*

**Goal:** Enhance browser capabilities using Project Fugu APIs for better file system integration, external change detection, and improved UX.

**Status:** Research Complete - Ready for Implementation  
**Prerequisite:** Epic 3 Complete ✅, Epic 4 Complete  
**Reference:** [docs/proposal/project-fugu.md](docs/proposal/project-fugu.md), [docs/agent-instructions/project-fugu-integration-guide.md](docs/agent-instructions/project-fugu-integration-guide.md)

### Story 4.5.1: Enhanced FSA Permission Persistence

As a **user**,
I want **my folder access permissions to persist across browser sessions**,
So that **I don't have to re-grant permissions every time I return**.

**Acceptance Criteria:**

**Given** Chrome 122+ browser
**When** I grant folder access and select "Allow on every visit"
**Then** permission persists across browser sessions
**And** files load automatically on return visit
**And** "Restore Access" button shown only when needed
**And** graceful fallback for older browsers

---

### Story 4.5.2: File Watcher (Polling Implementation)

As a **user**,
I want **Via-Gent to detect when files change outside the IDE**,
So that **I can see external edits without manual refresh**.

**Acceptance Criteria:**

**Given** a project open in Via-Gent
**When** I edit a file in VS Code or another editor
**Then** Via-Gent detects the change within 5 seconds
**And** shows "External Change Detected" notification
**And** offers options: "Keep Mine", "Load External", "Show Diff"
**And** polling can be paused/resumed to save resources

---

### Story 4.5.3: Async Clipboard with Syntax Highlighting

As a **user**,
I want **to copy code with syntax highlighting preserved**,
So that **I can paste styled code into documents and presentations**.

**Acceptance Criteria:**

**Given** code selected in Monaco editor
**When** I use "Copy with Highlighting" (Cmd+Shift+C)
**Then** code copies as both plain text and HTML
**And** syntax highlighting matches current theme
**And** pasting in rich text editors shows styled code
**And** standard Cmd+C still copies plain text

---

### Story 4.5.4: Build Status Badging

As a **user**,
I want **build errors shown in the browser tab badge**,
So that **I can see build status even when the tab is in background**.

**Acceptance Criteria:**

**Given** a build running in terminal
**When** TypeScript or ESLint errors occur
**Then** browser tab shows badge with error count
**And** badge clears when I focus the tab
**And** badge clears when errors are fixed
**And** feature detection skips unsupported browsers

---

### Story 4.5.5: Local Font Selection *(P3)*

As a **user**,
I want **to use my installed system fonts in the editor**,
So that **I can code with my preferred typography**.

**Acceptance Criteria:**

**Given** Chrome 103+ browser with local fonts API
**When** I open editor preferences
**Then** I see a list of installed monospace fonts
**And** selecting a font applies it to Monaco editor
**And** font preference persists across sessions

---

### Story 4.5.6: Project Snippet Sharing *(P3)*

As a **user**,
I want **to share code snippets via the Web Share API**,
So that **I can quickly send code to collaborators**.

**Acceptance Criteria:**

**Given** code selected in the editor
**When** I click "Share" button
**Then** native share sheet opens (on supported platforms)
**And** share includes code, file path, and optional link
**And** fallback to clipboard copy on unsupported browsers

---

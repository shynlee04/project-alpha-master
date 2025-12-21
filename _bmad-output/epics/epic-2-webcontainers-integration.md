# Epic 2: WebContainers Integration

**Goal:** Integrate WebContainers for running Node.js in the browser with terminal access and process management.

**Requirements Covered:** FR-WC-01 to FR-WC-06, FR-IDE-04, NFR-PERF-01

### Story 2.1: Create WebContainers Manager

As a **developer**,
I want **a WebContainers manager module**,
So that **I can boot, mount, and manage WebContainers instances**.

**Acceptance Criteria:**

**Given** the `src/lib/webcontainer/` directory
**When** I implement the manager module
**Then** the module provides:
  - `boot()` → boots WebContainer instance
  - `mount(files)` → mounts virtual file tree
  - `getFileSystem()` → returns fs operations
  - `spawn(cmd, args)` → spawns processes
**And** boot completes within 5 seconds
**And** boot errors are clearly surfaced

---

### Story 2.2: Implement Terminal Adapter

As a **developer**,
I want **an xterm.js terminal bound to WebContainers shell**,
So that **users can interact with the WebContainers environment**.

**Acceptance Criteria:**

**Given** a booted WebContainer
**When** I spawn `jsh` shell
**Then** terminal input is streamed to shell stdin
**And** shell stdout/stderr streams to terminal output
**And** terminal resize events are handled correctly
**And** command history works via up/down arrows

---

### Story 2.3: Create XTerminal Component

As a **developer**,
I want **an xterm.js React component**,
So that **I can embed the terminal in the IDE layout**.

**Acceptance Criteria:**

**Given** the terminal adapter
**When** I render the XTerminal component
**Then** the terminal renders with proper styling
**And** the terminal uses the fit addon for responsive sizing
**And** the terminal cleans up on unmount
**And** multiple terminal tabs are supported

---

### Story 2.4: Implement Process Management

As a **developer**,
I want **process lifecycle tracking for WebContainers**,
So that **I can run npm commands and track their status**.

**Acceptance Criteria:**

**Given** a booted WebContainer with shell
**When** I run `npm install`
**Then** the command executes in WebContainers
**And** stdout/stderr streams to terminal in real-time
**And** exit code is captured when process completes
**And** I can run `npm run dev` after install

---

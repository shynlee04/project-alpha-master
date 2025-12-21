# Epic 12: Agent Tool Interface Layer

**Goal:** Expose stable facade interfaces for AI agent CRUD operations on all IDE subsystems.

**Prerequisites:** Epic 10 (event bus), Epic 3 hotfix stories complete  
**Status:** PROPOSED (Course Correction v3)  
**Priority:** P1 (enables Epic 6 completion)

### Story 12.1: Create AgentFileTools Facade

As a **developer**,
I want **a stable file operations facade for AI agents**,
So that **agents have a clean API that doesn't change with implementation**.

**Acceptance Criteria:**

- **AC-12-1-1:** `AgentFileTools` interface with readFile, writeFile, listDirectory, createFile, delete, searchFiles
- **AC-12-1-2:** Implementation wraps LocalFSAdapter + SyncManager
- **AC-12-1-3:** Operations emit events via event bus
- **AC-12-1-4:** Path validation applied to all operations
- **AC-12-1-5:** Facade ≤150 lines

---

### Story 12.2: Create AgentTerminalTools Facade

As a **developer**,
I want **a stable terminal operations facade for AI agents**,
So that **agents can execute commands consistently**.

**Acceptance Criteria:**

- **AC-12-2-1:** `AgentTerminalTools` interface with runCommand, streamCommand, killProcess, listProcesses
- **AC-12-2-2:** Implementation wraps WebContainer + ProcessManager
- **AC-12-2-3:** Commands emit process events
- **AC-12-2-4:** Timeout handling for long-running commands
- **AC-12-2-5:** Facade ≤120 lines

---

### Story 12.3: Create AgentSyncTools Facade

As a **developer**,
I want **a stable sync operations facade for AI agents**,
So that **agents can query and control sync behavior**.

**Acceptance Criteria:**

- **AC-12-3-1:** `AgentSyncTools` interface with getSyncStatus, triggerSync, setAutoSync, getSyncConfig, updateSyncConfig
- **AC-12-3-2:** Implementation wraps SyncManager + WorkspaceContext
- **AC-12-3-3:** Sync status observable via events
- **AC-12-3-4:** Facade ≤100 lines

---

### Story 12.4: Create AgentGitTools Facade (Stub)

As a **developer**,
I want **a stub Git operations facade for AI agents**,
So that **Epic 7 Git tools have a defined contract**.

**Acceptance Criteria:**

- **AC-12-4-1:** `AgentGitTools` interface with getStatus, stage, unstage, commit, getLog
- **AC-12-4-2:** Stub implementation throws "Not implemented" until Epic 7
- **AC-12-4-3:** Interface matches Epic 7 requirements
- **AC-12-4-4:** Facade ≤50 lines (stub)

---

### Story 12.5: Wire Facades to TanStack AI Tools

As a **developer**,
I want **agent facades wired as TanStack AI client tools**,
So that **AI agents can use them via useChat**.

**Acceptance Criteria:**

- **AC-12-5-1:** `createAgentTools()` function creates all tool definitions
- **AC-12-5-2:** Tools use `toolDefinition().client()` pattern for browser execution
- **AC-12-5-3:** Tool parameters validated with Zod schemas
- **AC-12-5-4:** Tool results include context (file paths, operation type)
- **AC-12-5-5:** Integration tested with mock AI conversation

---

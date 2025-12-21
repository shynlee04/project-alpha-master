# Epic 6: AI Agent Integration

**Goal:** Integrate TanStack AI with Gemini adapter and implement client-side tools for file and terminal operations.

**Requirements Covered:** FR-AGENT-01 to FR-AGENT-04, FR-AGENT-06, FR-AGENT-07

**Prerequisites:** Epic 4 (Chat Panel Shell), Epic 5 (Persistence Layer), Epic 12 (Agent Tool Interface Layer)  
*Note:* Stories 6.1–6.2 can proceed once Epic 4 is ready; Stories 6.3+ require Epic 12 facades.

### Story 6.1: Set Up TanStack AI Chat Endpoint

As a **developer**,
I want **a `/api/chat` endpoint for AI streaming**,
So that **the chat panel can communicate with Gemini**.

**Acceptance Criteria:**

**Given** the API routes structure
**When** I create the chat endpoint
**Then** POST requests stream SSE responses
**And** Gemini adapter uses BYOK pattern
**And** tool definitions are passed to the model
**And** streaming errors are handled gracefully

---

### Story 6.2: Implement useAgentChat Hook

As a **developer**,
I want **a custom hook wrapping TanStack AI useChat**,
So that **the chat panel has a clean interface**.

**Acceptance Criteria:**

**Given** the TanStack AI useChat hook
**When** I create useAgentChat wrapper
**Then** messages stream from `/api/chat`
**And** tool executions are tracked
**And** conversation state syncs with persistence
**And** API key can be set by user

---

### Story 6.3: Implement File Tools

As a **developer**,
I want **client-side tools for file operations**,
So that **the AI agent can read and write files**.

**Acceptance Criteria:**

**Given** the agent tool registry
**When** I implement file tools
**Then** the following tools are available:
  - `read_file(path)` → returns file content
  - `write_file(path, content)` → creates/updates file
  - `list_files(path)` → returns directory contents
  - `create_directory(path)` → creates folder
  - `delete_file(path)` → deletes file/folder
**And** tools use the sync manager
**And** tool results appear in chat

---

### Story 6.4: Implement Terminal Tool

As a **developer**,
I want **a tool for running commands in WebContainers**,
So that **the AI agent can execute npm commands**.

**Acceptance Criteria:**

**Given** the agent tool registry
**When** I implement the run_command tool
**Then** the tool:
  - Accepts command and optional args
  - Executes in WebContainers shell
  - Streams output to terminal
  - Returns exit code and output summary
**And** long-running commands have timeout option

---

### Story 6.5: Wire Tool Execution to UI

As a **developer**,
I want **tool execution visible in the UI**,
So that **users see what the agent is doing**.

**Acceptance Criteria:**

**Given** an agent tool execution
**When** a tool runs
**Then** badge appears in chat: [Tool: read_file]
**And** file tree updates if files change
**And** editor content refreshes if open file changes
**And** terminal shows command output if terminal tool used
**And** success/failure is clearly indicated

---

# Epic 25: AI Foundation Sprint (NEW - 2025-12-21)

**Goal:** Implement core AI agent capabilities with TanStack AI 0.1.0 and 3 essential tools.

**Priority:** 🔴 P0 - CRITICAL | **Stories:** 6 | **Points:** 34 | **Duration:** 2 weeks  
**Source:** tech-debt-architecture-gaps-report-2025-12-21.md

### Rationale

AI integration is the core value proposition and is currently at 0% implementation. TanStack AI 0.1.0 was released December 2025 with stable APIs, making integration straightforward.

### Dependencies

- Epic 10: Event Bus (completed for infrastructure, Stories 10-6/10-7 for wiring)
- Package: `@tanstack/ai@0.1.0` (already installed)

### Stories

| Story | Title | Points |
|-------|-------|--------|
| 25-1 | TanStack AI Integration Setup | 5 |
| 25-2 | Implement File Tools (read, write, list) | 8 |
| 25-3 | Implement Terminal Tool (execute_command) | 5 |
| 25-4 | Wire Tool Execution to Event Bus | 5 |
| 25-5 | Implement Approval Flow UI | 5 |
| 25-6 | Integrate AI DevTools | 3 |

### Story 25-1: TanStack AI Integration Setup

As a **developer**,
I want **TanStack AI configured with Gemini adapter**,
So that **the chat panel can communicate with AI**.

**Acceptance Criteria:**
- Create `/api/chat` endpoint using `AIStream`
- Configure Gemini adapter with BYOK pattern
- Wire `useChat` hook in AgentChatPanel
- Streaming responses working
- Error handling for API failures

**Files to Create:**
- `src/routes/api/chat.ts`
- `src/hooks/useAgentChat.ts`

---

### Story 25-2: Implement File Tools

As a **developer**,
I want **client-side tools for file operations**,
So that **AI can read and write project files**.

**Acceptance Criteria:**
- `read_file(path)` returns file content
- `write_file(path, content)` creates/updates file
- `list_files(path)` returns directory listing
- Tools emit file events via event bus
- Tool results visible in chat

**Files to Create:**
- `src/lib/agent/file-tools.ts`

---

### Story 25-3: Implement Terminal Tool

As a **developer**,
I want **a tool for running commands in WebContainers**,
So that **AI can execute npm commands and scripts**.

**Acceptance Criteria:**
- `execute_command(command, args?)` runs in WebContainer
- Output streams to terminal in real-time
- Returns exit code and output summary
- Timeout option for long-running commands

**Files to Create:**
- `src/lib/agent/terminal-tools.ts`

---

### Story 25-4: Wire Tool Execution to Event Bus

As a **developer**,
I want **tool executions to emit events**,
So that **UI updates automatically when AI makes changes**.

**Acceptance Criteria:**
- File write → `file:modified` event → Monaco refreshes
- File create → `file:created` event → FileTree updates
- Command run → `process:started`/`process:exited` events
- All tools use consistent event emission pattern

---

### Story 25-5: Implement Approval Flow UI

As a **user**,
I want **to approve before AI makes changes**,
So that **I stay in control of my codebase**.

**Acceptance Criteria:**
- AI proposes changes before execution
- UI shows diff preview for file changes
- "Approve", "Modify", "Reject" actions
- Keyboard shortcuts (Enter = approve, Esc = reject)

---

### Story 25-6: Integrate AI DevTools

As a **developer**,
I want **visibility into AI tool execution**,
So that **I can debug agent behavior**.

**Acceptance Criteria:**
- Install `@tanstack/ai-devtools@alpha`
- DevTools panel shows tool calls and results
- Message trace visible in development
- Can be disabled in production

---

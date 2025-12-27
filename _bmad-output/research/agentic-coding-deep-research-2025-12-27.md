# Deep Research: Agentic Coding Pattern Analysis & Course Correction

**Document ID:** `_bmad-output/research/agentic-coding-deep-research-2025-12-27.md`  
**Date:** 2025-12-27T07:45:00+07:00  
**Research Type:** Architecture + Technical + Comparison  
**Depth:** Comprehensive  
**Classification:** Strategic Technical Research - Single Source of Truth  
**Status:** ACTIVE - Course Correction Foundation

---

## Executive Summary

This document synthesizes deep research from **Roo Code/Kilo Code** (VSCode-based agentic coding extension) and compares it against Via-gent's current implementation to identify gaps, validate architectural decisions, and guide MVP completion.

### Key Findings Summary

| Dimension | Roo Code Pattern | Via-gent Current State | Gap Status |
|-----------|------------------|------------------------|------------|
| **Tool Execution Flow** | XML-based tool calls with approval gates | TanStack AI `toolDefinition.client()` with `addToolApprovalResponse` | ✅ ALIGNED |
| **State Management** | ClineProvider (LIFO stack) + EventEmitter | Zustand stores + WorkspaceEventEmitter | ✅ ALIGNED |
| **Message Protocol** | WebviewMessage ↔ ExtensionMessage | SSE streaming + UIMessage parts | ✅ ALIGNED (different paradigm) |
| **Tool Result Rendering** | Streaming via `messageUpdated` | Part-based rendering in `AgentChatPanel` | ⚠️ PARTIAL |
| **Approval UX** | `idleAsk` state → approval dialog | `pendingApprovals` array → ApprovalOverlay | ⚠️ PARTIAL (not wired) |
| **Context Management** | Dual histories (API + UI) | Single `rawMessages` + transformed `messages` | ⚠️ NEEDS WORK |
| **Crash Recovery** | History persistence + resume | Thread persistence in Dexie | ⚠️ PARTIAL |
| **Auto-sync** | FileContextTracker + watchers | SyncManager + EventBus | ✅ ALIGNED |

---

## Part 1: Roo Code/Kilo Code Architecture Analysis

### 1.1 Core Architecture (from Deepwiki Research)

Roo Code operates on a **three-tier architecture**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Roo Code Architecture                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WEBVIEW UI LAYER (React SPA in VSCode webview)                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ App.tsx → ChatView → ChatRow                                            │  │
│  │ ExtensionStateContext (global state management)                         │  │
│  │ vscode.postMessage() → WebviewMessage                                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                              ↑↓ Message Passing                              │
│  EXTENSION HOST LAYER (Node.js in VSCode)                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ClineProvider (Task orchestrator, LIFO stack)                          │  │
│  │   ├── Task (execution loop, dual histories)                            │  │
│  │   │     ├── apiConversationHistory (LLM communication)                 │  │
│  │   │     └── clineMessages (UI display)                                 │  │
│  │   └── webviewMessageHandler (WebviewMessage processor)                 │  │
│  │ postMessageToWebview() → ExtensionMessage                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                              ↑↓ API Calls                                    │
│  LLM PROVIDER LAYER                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Multiple providers (OpenAI, Anthropic, OpenRouter, etc.)               │  │
│  │ Tool execution via XML-formatted tool calls                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Tool Execution Flow (Roo Code)

From the Roo Code system prompt (`roo-code-system-prompt.xml`):

```
User Prompt
    ↓
Agent Analysis & Tool Selection
    ↓
Tool Use Formulation (XML format)
    ↓
User Approval (displayed in UI)
    ↓
Tool Execution
    ↓
Result & Response Rendering
    ↓
Inform Next Agentic Steps
```

**Key Tool Categories:**
| Tool | Risk Level | Approval Required |
|------|------------|-------------------|
| `read_file`, `list_files`, `codebase_search` | Low | No (can be auto-approved) |
| `write_to_file`, `apply_diff` | Medium-High | Yes (shows diff preview) |
| `execute_command` | High | Yes (shows command preview) |
| `use_mcp_tool`, `access_mcp_resource` | Variable | Yes |

### 1.3 State Management Patterns

**ClineProvider Pattern:**
- Maintains LIFO stack of `Task` instances
- Forwards task lifecycle events to subscribers
- Handles subtask management with `finishSubTask()`
- Implements crash recovery via history persistence

**Task Class Pattern:**
```typescript
class Task extends EventEmitter<TaskEvents> {
    // Dual message histories
    apiConversationHistory: Message[];  // For LLM API calls
    clineMessages: Message[];           // For UI display
    
    // State management
    idleAsk: boolean;                   // Waiting for user input
    resumableAsk: boolean;              // Can be resumed after refresh
    interactiveAsk: boolean;            // Tool approval pending
    
    // Main execution loop
    async recursivelyMakeClineRequests() {
        // 1. Call LLM API
        // 2. Parse tool calls from response
        // 3. Request approval if needed
        // 4. Execute approved tools
        // 5. Feed results back to context
        // 6. Loop until task complete
    }
}
```

### 1.4 Tool Result Streaming

1. **Task emits updates** during `recursivelyMakeClineRequests()`
2. **ClineProvider catches and forwards** to webview via `postMessageToWebview({type: "state"})`
3. **ChatView renders** based on `ExtensionStateContext` changes
4. **Streaming responses** use `messageUpdated` events for partial updates

### 1.5 File Operations & Auto-Sync

**Key Insight:** Roo Code does NOT use WebContainer - it operates directly on the local filesystem.

However, the **FileContextTracker** pattern is relevant:
- Sets up file watchers to detect external modifications
- Informs agent to reload stale files
- Tracks which files the agent has read/modified

**Protected Files Pattern:**
- `RooProtectedController` detects critical config files
- Extra confirmation required for `.env`, `package.json`, etc.
- `.rooignore` prevents LLM access to sensitive files

---

## Part 2: Via-gent Current Implementation Analysis

### 2.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Via-gent Architecture                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BROWSER CLIENT (100% client-side React SPA)                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ TanStack Router → IDE Route → ChatPanelWrapper → AgentChatPanel        │  │
│  │                                                                        │  │
│  │ State Management:                                                      │  │
│  │   ├── Zustand stores (agents, threads, openai-compatible, etc.)        │  │
│  │   ├── WorkspaceEventEmitter (event bus)                                │  │
│  │   └── Dexie (IndexedDB for persistence)                                │  │
│  │                                                                        │  │
│  │ Hook Integration:                                                      │  │
│  │   └── useAgentChatWithTools → useChat (TanStack AI)                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                              ↑↓ SSE Streaming                                │
│  API ROUTE (TanStack Start - runs in browser via service worker)             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ /api/chat.ts → streamedJsonResponse() → LLM provider                   │  │
│  │ Uses @tanstack/ai-openai adapter for OpenRouter/OpenAI                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                              ↑↓ Tool Execution                               │
│  WEBCONTAINER SANDBOX                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ FileToolsFacade → SyncManager → WebContainerAdapter                    │  │
│  │ TerminalToolsFacade → XtermAdapter → WebContainer.spawn()              │  │
│  │ LocalFSAdapter → File System Access API → Host filesystem             │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tool Implementation (Current State)

**src/lib/agent/tools/** contains:
- `read-file-tool.ts` - Read file contents
- `write-file-tool.ts` - Create/modify files
- `list-files-tool.ts` - List directory contents
- `execute-command-tool.ts` - Run terminal commands

**Factory Pattern (src/lib/agent/factory.ts):**
```typescript
// Creates client-side tools using TanStack AI pattern
createAgentClientTools(options: ToolFactoryOptions) {
    return {
        getClientTools() {
            return clientTools(
                createClientFileTools(options),
                createClientTerminalTools(options)
            );
        }
    };
}
```

### 2.3 useAgentChatWithTools Hook (Current State)

Key implementation patterns:
- ✅ Uses `fetchServerSentEvents` for streaming connection
- ✅ Integrates `clientTools` for tool definitions
- ✅ Uses `maxIterations(3)` for agentic loop
- ✅ Extracts `pendingApprovals` from message parts
- ✅ Provides `approveToolCall`/`rejectToolCall` functions
- ⚠️ Tool call tracking in local state (not persisted)
- ⚠️ No crash recovery mechanism
- ⚠️ Agent status events emitted but not fully consumed

### 2.4 AgentChatPanel (Current State)

Key features:
- ✅ Integrates with `useAgentChatWithTools`
- ✅ Credential vault for API key retrieval
- ✅ Thread persistence via Dexie
- ✅ System prompt injection via `getCodingAgentSystemPrompt`
- ✅ Tool execution rendering via `extractToolExecutions`
- ⚠️ Approval overlay exists but may not be fully wired
- ⚠️ Prompt enhancement toggle exists
- ❌ No context budget visualization
- ❌ No crash recovery UI

---

## Part 3: Gap Analysis & Recommendations

### 3.1 Critical Gaps (MVP Blocking)

| Gap ID | Description | Impact | Recommendation |
|--------|-------------|--------|----------------|
| **G-01** | MVP-1: Model selection not from provider catalog | Users can't choose models | Wire `agentsStore.agents` to model dropdown |
| **G-02** | MVP-1: Configuration doesn't persist across sessions | UX broken | Verify Dexie persistence in `agent-selection-store` |
| **G-03** | MVP-1: No connection test before saving | Fail silently | Add `testConnection()` before storing credentials |
| **G-04** | MVP-1: Agent status not showing "Ready" | Confusing UX | Wire agent config state to status indicator |
| **G-05** | MVP-2: Chat panel not sending to /api/chat correctly | Core broken | Verify `fetchServerSentEvents` → `chat.ts` flow |
| **G-06** | MVP-3: Tool approval overlay not displaying | Tools need approval | Wire `pendingApprovals` to `ApprovalOverlay` component |
| **G-07** | Context management not implemented | Context overflow risk | Implement token estimation + compaction (Phase 2) |

### 3.2 Architectural Alignment Gaps

| Gap ID | Roo Code Pattern | Via-gent Gap | Resolution |
|--------|------------------|--------------|------------|
| **A-01** | Dual message histories | Single transformed `messages` | Add `rawMessages` for API, `messages` for UI |
| **A-02** | Task LIFO stack | Single thread active | OK for MVP, extend for multi-thread later |
| **A-03** | `resumableAsk` state | Thread persistence exists | Add `resumePoint` to thread schema |
| **A-04** | FileContextTracker | SyncManager exists | Add file watcher integration for external edits |
| **A-05** | XML tool format | JSON tool format | ✅ TanStack AI handles this correctly |

### 3.3 Frontend-Backend Wiring Gaps

From end-to-end analysis, these are the critical wiring issues:

```
User Journey: Configure → Chat → Execute → Approve → Iterate

1️⃣ CONFIGURE (MVP-1)
   ✅ AgentConfigDialog exists
   ⚠️ API key storage works BUT model catalog not populated
   ❌ Connection test not implemented
   ❌ "Ready" status not displayed
   
2️⃣ CHAT (MVP-2)
   ⚠️ AgentChatPanel exists and integrates hook
   ⚠️ SSE streaming configured BUT may have endpoint issues
   ⚠️ Messages render BUT code blocks may not have syntax highlight
   ❌ Chat history persistence not verified
   
3️⃣ EXECUTE (MVP-3 & MVP-4)
   ✅ Tool definitions exist in factory.ts
   ✅ FileToolsFacade integrates with SyncManager
   ⚠️ Tools execute BUT results may not render correctly
   ❌ Terminal tool output streaming not verified
   
4️⃣ APPROVE (MVP-5)
   ✅ pendingApprovals extracted in hook
   ✅ approveToolCall/rejectToolCall implemented
   ⚠️ ApprovalOverlay component may exist but not wired
   ❌ Risk level visualization not implemented
   
5️⃣ ITERATE (MVP-6)
   ✅ EventBus exists for file changes
   ⚠️ FileTree subscribes to events BUT may not refresh
   ❌ Monaco editor not syncing on file changes
   ❌ State survival on browser refresh not verified
```

---

## Part 4: Course Correction Plan

### 4.1 Immediate Actions (Next Sprint Focus)

#### Phase 4.1.1: Complete MVP-1 (Agent Configuration)

**Tasks:**
1. Verify `agentsStore.agents` populates model dropdown in AgentConfigDialog
2. Add `testConnection(providerId, apiKey, modelId)` function
3. Wire agent status indicator to show "Ready" when configured
4. Verify Dexie persistence for selected agent across sessions
5. E2E screenshot verification

**Affected Files:**
- `src/components/settings/AgentConfigDialog.tsx`
- `src/stores/agents-store.ts`
- `src/lib/agent/providers/` (add testConnection)

#### Phase 4.1.2: Complete MVP-2 (Chat Interface)

**Tasks:**
1. Verify `/api/chat.ts` endpoint returns proper SSE stream
2. Test with actual API key → ensure responses stream
3. Verify markdown/code block rendering in ChatMessageList
4. Add syntax highlighting to CodeBlock component
5. Verify chat history persists to thread store
6. E2E screenshot verification

**Affected Files:**
- `src/lib/agent/routes/chat.ts` (the API route)
- `src/components/chat/ChatMessageList.tsx`
- `src/components/renderers/CodeBlock.tsx`
- `src/stores/conversation-threads-store.ts`

#### Phase 4.1.3: Complete MVP-3/4 (Tool Execution)

**Tasks:**
1. Verify tool definitions reach the LLM correctly
2. Test `read_file` tool execution end-to-end
3. Test `write_file` tool with approval flow
4. Test `execute_command` with terminal output capture
5. Wire tool result rendering in message stream
6. E2E screenshot verification

**Affected Files:**
- `src/lib/agent/tools/*.ts`
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- `src/components/chat/ToolExecutionCard.tsx` (may need creation)

#### Phase 4.1.4: Complete MVP-5 (Approval Workflow)

**Tasks:**
1. Wire `pendingApprovals` to ApprovalOverlay component
2. Display tool call details (path, content, command)
3. Show risk level indicator (low/medium/high)
4. Implement approve/reject buttons with visual feedback
5. E2E screenshot verification

**Affected Files:**
- `src/components/ide/AgentChatPanel.tsx`
- `src/components/chat/ApprovalOverlay.tsx` (create if missing)

### 4.2 Recommended BMAD Workflows for Each Phase

| Phase | Primary Workflow | Supporting Workflows |
|-------|------------------|---------------------|
| MVP-1 Completion | `/bmad-bmm-workflows-dev-story` | `/code-review`, `/double-check` |
| MVP-2 Completion | `/bmad-bmm-workflows-dev-story` | `/deep-research` (TanStack AI docs) |
| MVP-3/4 Completion | `/bmad-bmm-workflows-dev-story` | `/error-analysis` if tool failures |
| MVP-5 Completion | `/bmad-bmm-workflows-dev-story` | `/bmad-bmm-workflows-create-ux-design` |
| Integration Testing | `/bmad-bmm-workflows-testarch-automate` | `/bugfix` |
| Audit | `/analyze-codebase` | `/tech-debt` |

### 4.3 Context Engineering (Post-MVP Priority)

Based on `context-engineering-multi-agent-orchestration-2025-12-27.md`:

1. **Token Estimation Utility** - Implement before context issues appear
2. **Observation Masking** - Hide old tool outputs after N turns
3. **History Compaction** - Summarize when context > 70% budget
4. **Silent Reset** - Emergency valve for novice users
5. **Pointer Pattern** - Store large outputs in Dexie, pass summaries

---

## Part 5: Single Source of Truth Artifacts

### 5.1 Sprint Status Update Required

**File:** `_bmad-output/sprint-status.yaml`

```yaml
# COURSE CORRECTION (2025-12-27) - UPDATE
course_correction:
  date: "2025-12-27"
  trigger: "Deep research completed - gap analysis reveals MVP-1 blocking"
  findings:
    - "MVP-1: 5/7 criteria NOT_IMPLEMENTED"
    - "MVP-2-7: Blocked by MVP-1"
    - "Chat API route may have wiring issues"
    - "Tool approval overlay not fully wired"
  next_actions:
    - "Complete MVP-1 criteria sequentially"
    - "Verify E2E flow with screenshots"
    - "Wire approval overlay to pendingApprovals"
    - "Test with real OpenRouter API key"
```

### 5.2 Validation Checklist

Before marking any MVP story as DONE:

- [ ] All acceptance criteria verified in browser
- [ ] Screenshot/recording captured
- [ ] TypeScript build passes (`pnpm build`)
- [ ] No console errors
- [ ] Tool calls execute correctly (if applicable)
- [ ] Approval flow works (if applicable)
- [ ] State persists across refresh (if applicable)

---

## Part 6: Reference Patterns from Roo Code

### 6.1 System Prompt Structure (Recommended Enhancement)

The Roo Code system prompt (`roo-code-system-prompt.xml`) provides excellent patterns:

1. **Tool Definitions Section** - Explicit XML format with examples
2. **Usage Guidelines** - "One tool per message", "Wait for confirmation"
3. **Workflow Pattern** - UNDERSTAND → PLAN → EXECUTE → VERIFY
4. **Output Format Rules** - Markdown with code blocks

**Recommendation:** Enhance `CODING_AGENT_SYSTEM_PROMPT` with more structured tool examples.

### 6.2 TODO List Tool Pattern

Roo Code's `update_todo_list` tool provides task tracking within the agent:

```xml
<update_todo_list>
<todos>
[x] Analyze requirements
[-] Implement core logic
[ ] Write tests
</todos>
</update_todo_list>
```

**Recommendation:** Consider adding a `plan_task` tool for complex multi-step operations.

### 6.3 Mode Switching Pattern

Roo Code supports mode switching (`switch_mode`, `new_task`):
- `code` mode for implementation
- `architect` mode for design
- `ask` mode for clarification

**Recommendation:** For MVP, single mode is sufficient. Post-MVP, consider mode system.

---

## Appendix A: Key File References

| Via-gent File | Purpose | Status |
|---------------|---------|--------|
| `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Main chat hook | ✅ Implemented |
| `src/lib/agent/factory.ts` | Tool creation factory | ✅ Implemented |
| `src/lib/agent/system-prompt.ts` | Agent system prompt | ✅ Implemented |
| `src/lib/agent/tools/*.ts` | Tool implementations | ✅ Implemented |
| `src/components/ide/AgentChatPanel.tsx` | Chat UI component | ⚠️ Needs verification |
| `src/stores/conversation-threads-store.ts` | Thread persistence | ✅ Implemented |
| `src/lib/agent/routes/chat.ts` | API endpoint | ⚠️ Needs verification |

## Appendix B: Deepwiki Research Sources

- **Roo Code Architecture:** https://deepwiki.com/RooVetGit/Roo-Code
  - ClineProvider and Task Orchestration (2.2)
  - Webview Architecture (2.7)
  - Message Communication Protocol (2.8)
  - File Operations and Diff System (4.3)

---

**Document Status:** Research Complete  
**Next Action:** Execute Phase 4.1.1 (MVP-1 Completion)  
**Assigned Agent:** `@bmad-bmm-dev`  
**Reviewer:** `@code-reviewer`

---

*Generated by BMAD Master Orchestrator - 2025-12-27*

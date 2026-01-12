# Feature Group 4: Cascade Chat Flow - Deep Analysis

**Shard ID**: ARCH-SHARD-03-04
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Core Centralized Group #4 - Cascade Chat Flow (Conversation → Thread → Messages → Tools → RAG)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → Chat Flow Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on Chat |
|--------------------|-------|----------------|----------------|
| **A: State & Stores** | `unified-chat-store.ts:447` | ✅ GOOD | Slice pattern working |
| **A: State & Stores** | `useConversationStore.ts:495` | P0 | GOD STORE + FACADE |
| **B: Context & Runtime** | Multiple event subscriptions | P0 | Memory leak in KnowledgePage |
| **D: API & Data Flow** | `context-window-slice.ts` | ✅ GOOD | Working correctly |
| **F: Layers & Boundaries** | Direct store access in UI | P1 | 47 violations, affects chat |

### 1.2 Current Chat Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CASCADE CHAT FLOW (CURRENT - PARTIALLY BROKEN)       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      CONVERSATION LAYER                          │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         useConversationStore (495 lines!)              │    │   │
│  │   │         ⚠️ GOD STORE + FACADE PATTERN                  │    │   │
│  │   │                                                          │    │   │
│  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │   │
│  │   │  │ Conversation│  │ Thread Mgmt │  │ Message CRUD    │  │    │   │
│  │   │  │ CRUD       │  │             │  │                 │  │    │   │
│  │   │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │   │
│  │   │                                                          │    │   │
│  │   │  PROBLEM: Maps unified state → legacy on EVERY change   │    │   │
│  │   │  PROBLEM: Performance degrades with conversation size   │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      THREAD LAYER                               │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         thread-management-slice.ts                     │    │   │
│  │   │                                                          │    │   │
│  │   │  - Create thread                                        │    │   │
│  │   │  - Switch thread                                        │    │   │
│  │   │  - Delete thread                                        │    │   │
│  │   │  - Archive thread                                       │    │   │
│  │   │                                                          │    │   │
│  │   │  ✅ Working correctly - single responsibility           │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     MESSAGE LAYER                               │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         message-crud-slice.ts                          │    │   │
│  │   │                                                          │    │   │
│  │   │  - Add message                                         │    │   │
│  │   │  - Update message (edit)                               │    │   │
│  │   │  - Delete message                                      │    │   │
│  │   │  - Search messages                                     │    │   │
│  │   │                                                          │    │   │
│  │   │  ✅ Working correctly - single responsibility           │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   CONTEXT WINDOW LAYER                          │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         context-window-slice.ts                        │    │   │
│  │   │                                                          │    │   │
│  │   │  - Manage context size (token limit)                   │    │   │
│  │   │  - Prioritize messages                                 │    │   │
│  │   │  - Summarize when needed                               │    │   │
│  │   │                                                          │    │   │
│  │   │  ✅ Working correctly - well-designed                  │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   TOOL EXECUTION LAYER                          │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         tool-execution-slice.ts                        │    │   │
│  │   │                                                          │    │   │
│  │   │  - Log tool calls                                       │    │   │
│  │   │  - Track results                                        │    │   │
│  │   │  - Handle errors                                        │    │   │
│  │   │                                                          │    │   │
│  │   │  ✅ Working correctly                                   │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (Chat Flow Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **Conversation store facade** | `useConversationStore.ts:150-404` | P0 | Mapping on every state change |
| **Direct store access in chat UI** | `ChatHistory.tsx`, `AgentChatPanel.tsx` | P1 | 47 violations, breaks reactivity |
| **Memory leak in event subscriptions** | `KnowledgePage.tsx:207-210` | P0 | No cleanup on unmount |
| **Legacy migration code active** | `conversation-migration.ts:542` | P1 | Dead code not cleaned |

---

## 2. Feature Behavior Analysis

### 2.1 Chat Flow Cascade

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHAT CASCADE FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USER INPUT                                                              │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 1. INPUT HANDLING                                               │     │
│  │    - Text input → MessageStore                                  │     │
│  │    - Voice input → Transcribe → MessageStore                    │     │
│  │    - File attachment → Tool call                                │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 2. CONVERSATION CONTEXT                                         │     │
│  │    - Get current conversation                                   │     │
│  │    - Get current thread                                         │     │
│  │    - Check conversation exists                                  │     │
│  │    - Auto-create if missing ⚠️ (ISSUE: sometimes fails)         │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 3. MESSAGE CREATION                                             │     │
│  │    - Create user message                                        │     │
│  │    - Add to thread                                              │     │
│  │    - Update conversation timestamp                              │     │
│  │    - Trigger UI update                                          │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 4. CONTEXT WINDOW MANAGEMENT                                   │     │
│  │    - Check token count                                          │     │
│  │    - If over limit → Prune old messages                         │     │
│  │    - If still over → Summarize                                  │     │
│  │    - Prepare context for LLM                                    │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 5. LLM EXECUTION                                                │     │
│  │    - Select provider (BYOK vault)                               │     │
│  │    - Compose prompt (system + context + message)                │     │
│  │    - Send request                                               │     │
│  │    - Stream response                                            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 6. TOOL INVOCATION (if needed)                                  │     │
│  │    - Parse tool calls from LLM response                         │     │
│  │    - Execute tools (with permissions)                           │     │
│  │    - Collect results                                            │     │
│  │    - Continue with tool results                                 │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 7. ASSISTANT MESSAGE                                            │     │
│  │    - Create assistant message with response                     │     │
│  │    - Add tool results if any                                    │     │
│  │    - Stream to UI                                               │     │
│  │    - Store in conversation                                      │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Thread Management Flow

```
User Action                    System Response              Current Issue
─────────────────────────────────────────────────────────────────────────
1. Open chat              →   Get/create conversation    ✅ Working
2. Create new thread      →   ThreadManagementSlice      ✅ Working
3. Switch thread          →   Update current thread      ✅ Working
4. Delete thread          →   Remove from store          ✅ Working
5. Archive thread         →   Mark as archived           ✅ Working

Current Issues:
- Thread creation requires valid conversation (P0)
- No validation before thread creation (P1)
```

---

## 3. User Stories - Chat Flow (DETAILED)

### Story CHAT-01: Conversation Auto-Creation

```
As a user
I want a conversation to be created automatically when I open chat
So that I can start messaging immediately

Priority: P0
Estimation: 1 day

Acceptance Criteria:
- [ ] AC1: Opening chat in any workspace creates conversation
- [ ] AC2: Conversation has correct workspaceType
- [ ] AC3: Conversation persists to Dexie
- [ ] AC4: Thread auto-created as root thread
- [ ] AC5: Subsequent chat opens reuse existing conversation

Technical Requirements:
- [ ] TR1: `ChatInterface.tsx` useEffect calls `ensureConversation()`
- [ ] TR2: `chat-metadata-slice.ts` has `getOrCreateConversation()`
- [ ] TR3: Conversation has `workspaceType` set correctly
- [ ] TR4: Root thread created with conversation

Edge Cases:
- [ ] EC1: Multiple chat panels open → Separate conversations?
- [ ] EC2: Conversation creation fails → Clear error, retry option
- [ ] EC3: Corrupted conversation data → Recovery or reset
- [ ] EC4: Workspace switch during creation → Handle gracefully

Combined Uses:
- [ ] CU1: Open IDE chat → Conversation + thread created
- [ ] CU2: Switch project → New conversation for project
- [ ] CU3: Refresh page → Conversation restored

Non-Functional Requirements:
- [ ] NFR1: Creation latency < 100ms
- [ ] NFR2: Zero visible loading for user
- [ ] NFR3: Works offline (conversation saved)

Tests Required:
- [ ] Unit: getOrCreateConversation logic
- [ ] Integration: Chat open → conversation created
- [ ] E2E: Full chat open flow
```

### Story CHAT-02: Thread Management

```
As a user with multiple conversations
I want to organize chats into threads
So that I can keep related messages together and switch contexts

Priority: P0
Estimation: 1 day (verify + fixes)

Acceptance Criteria:
- [ ] AC1: Create new thread from chat header
- [ ] AC2: Switch between threads instantly
- [ ] AC3: Delete thread (with confirmation)
- [ ] AC4: Archive thread (hide from main list)
- [ ] AC5: Rename thread for identification
- [ ] AC6: Thread count visible in header

Technical Requirements:
- [ ] TR1: `ThreadManagementSlice` methods: create, switch, delete, archive
- [ ] TR2: `ThreadSelector` component for navigation
- [ ] TR3: `Thread` type with: id, title, lastMessage, timestamp, archived
- [ ] TR4: Thread persisted to Dexie

Edge Cases:
- [ ] EC1: Delete thread with messages → Confirm dialog, cascade delete
- [ ] EC2: Archive thread with active conversation → What happens?
- [ ] EC3: Too many threads → Pagination or search
- [ ] EC4: Thread state corrupted → Recovery or reset

Combined Uses:
- [ ] CU1: Create thread "Project A", another "Project B" → Switch between
- [ ] CU2: Archive old threads → Clean main list
- [ ] CU3: Delete thread by mistake → Undo option?

Non-Functional Requirements:
- [ ] NFR1: Thread switch < 50ms
- [ ] NFR2: Thread list renders < 100ms
- [ ] NFR3: Clear visual distinction between threads

Tests Required:
- [ ] Unit: Thread CRUD operations
- [ ] Integration: Thread selector works
- [ ] E2E: Full thread management flow
```

### Story CHAT-03: Message History & Search

```
As a user
I want to see and search my message history
So that I can find previous answers and references

Priority: P1
Estimation: 2 days

Acceptance Criteria:
- [ ] AC1: All messages visible in conversation
- [ ] AC2: Scroll to load more (pagination)
- [ ] AC3: Search within conversation
- [ ] AC4: Highlight search results
- [ ] AC5: Jump to message from search
- [ ] AC6: Infinite scroll for long conversations

Technical Requirements:
- [ ] TR1: `MessageCrudSlice` with pagination
- [ ] TR2: `MessageSearch` with fuzzy search
- [ ] TR3: `SearchResult` type with match positions
- [ ] TR4: `ScrollManager` for position restoration

Edge Cases:
- [ ] EC1: Very long conversation (>1000 messages) → Performance?
- [ ] EC2: Search returns no results → Clear message
- [ ] EC3: Message deleted → Still in search index?
- [ ] EC4: Scroll position lost on refresh → Restore from storage

Combined Uses:
- [ ] CU1: Scroll back to yesterday's conversation
- [ ] CU2: Search "API key" → Find previous discussion
- [ ] CU3: Click search result → Jump to message

Non-Functional Requirements:
- [ ] NFR1: Search < 100ms for 1000 messages
- [ ] NFR2: Scroll smooth (60fps)
- [ ] NFR3: Position restored on back navigation

Tests Required:
- [ ] Unit: Search algorithm
- [ ] Unit: Pagination logic
- [ ] Integration: Search + highlight
- [ ] E2E: Search flow complete
```

### Story CHAT-04: Context Window Management

```
As a user having long conversations
I want the AI to manage context window limits gracefully
So that conversation doesn't break when token limit is reached

Priority: P1
Estimation: 2 days

Acceptance Criteria:
- [ ] AC1: Token count visible in UI
- [ ] AC2: Oldest messages pruned when near limit
- [ ] AC3: Pruned messages indicated (not hidden)
- [ ] AC4: Summarization option when pruning not enough
- [ ] AC5: User can customize window size

Technical Requirements:
- [ ] TR1: `ContextWindowSlice` manages size
- [ ] TR2: `TokenEstimator` counts tokens
- [ ] TR3: `PruningStrategy` interface
- [ ] TR4: `Summarizer` creates condensed context

Strategies:
- STRATEGY1: Remove oldest messages
- STRATEGY2: Remove system messages (carefully)
- STRATEGY3: Summarize oldest N messages
- STRATEGY4: Keep most recent + most relevant

Edge Cases:
- [ ] EC1: Single message > token limit → Truncate or error
- [ ] EC2: System prompt too long → Warn user
- [ ] EC3: All messages pruned → Keep last N + summary
- [ ] EC4: User wants full history → Increase limit option

Combined Uses:
- [ ] CU1: Long conversation (>100 messages) → Automatic pruning
- [ ] CU2: Token limit hit → Clear indicator of pruned content
- [ ] CU3: User increases limit → More context available

Non-Functional Requirements:
- [ ] NFR1: Pruning < 50ms
- [ ] NFR2: Summarization < 2s (async)
- [ ] NFR3: No visible UI flicker during pruning

Tests Required:
- [ ] Unit: Token counting
- [ ] Unit: Pruning strategies
- [ ] Integration: Context window management
- [ ] E2E: Long conversation survives token limit
```

### Story CHAT-05: Tool Execution in Chat

```
As a user
I want to see tool executions within the chat flow
So that I understand what the AI is doing and see results

Priority: P0
Estimation: 1 day (verify + fixes)

Acceptance Criteria:
- [ ] AC1: Tool calls visible as progress indicator
- [ ] AC2: Tool results shown in chat
- [ ] AC3: Tool errors handled gracefully
- [ ] AC4: Execution timing visible
- [ ] AC5: Can expand/collapse tool details

Technical Requirements:
- [ ] TR1: `ToolExecutionSlice` tracks execution
- [ ] TR2: `ToolCallMessage` component for display
- [ ] TR3: `ToolResultMessage` component for results
- [ ] TR4: `ExecutionProgress` indicator

Message Types:
- USER_MESSAGE: User input
- ASSISTANT_MESSAGE: AI response
- TOOL_CALL: AI requesting tool
- TOOL_RESULT: Tool execution result
- SYSTEM_MESSAGE: Context/info

Edge Cases:
- [ ] EC1: Long-running tool → Loading indicator, cancel option
- [ ] EC2: Tool error → Error message in chat, not crash
- [ ] EC3: Multiple tools → Sequential or parallel?
- [ ] EC4: Tool timeout → Clear timeout message

Combined Uses:
- [ ] CU1: Ask to list files → Tool call → File list in chat
- [ ] CU2: Ask to create note → Tool call → Note link in chat
- [ ] CU3: Ask to search knowledge → Tool call → Results in chat

Non-Functional Requirements:
- [ ] NFR1: Tool call displayed < 100ms after LLM response
- [ ] NFR2: Progress updates smooth
- [ ] NFR3: Expandable details don't clutter UI

Tests Required:
- [ ] Unit: Tool execution state machine
- [ ] Integration: Tool calls in chat flow
- [ ] E2E: User sees tool execution in chat
```

---

## 4. Chat Flow → Architecture Conflict Matrix

| Chat Story | Architecture Issue | Conflict Severity | Fix Required |
|------------|-------------------|-------------------|--------------|
| CHAT-01 | Conversation facade (P0) | BLOCKING | Replace with unified store |
| CHAT-01 | No auto-creation wired (P0) | BLOCKING | Add ensureConversation() |
| CHAT-02 | Thread management works (✅) | - | - |
| CHAT-03 | Message search works (✅) | - | - |
| CHAT-04 | Context window works (✅) | - | - |
| CHAT-05 | Direct store access (P1) | HIGH | Create hooks |
| ALL | Memory leak in events (P0) | BLOCKING | Fix subscription cleanup |
| ALL | Legacy migration code (P1) | MEDIUM | Remove dead code |

---

## 5. File Change Manifest - Chat Flow

### 5.1 Files to CREATE

| File | Purpose | Lines | Story |
|------|---------|-------|-------|
| `presentation/hooks/use-conversation.ts` | Conversation hook | 50 | CHAT-01 |
| `presentation/hooks/use-thread.ts` | Thread hook | 50 | CHAT-02 |
| `presentation/hooks/use-message-search.ts` | Search hook | 80 | CHAT-03 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `ChatInterface.tsx` | Add ensureConversation() | +30 | CHAT-01 |
| `ThreadSelector.tsx` | Fix thread management | +20 | CHAT-02 |
| `ChatHistory.tsx` | Remove direct getState() | -30 | CHAT-05 |
| `AgentChatPanel.tsx` | Remove direct getState() | -30 | CHAT-05 |
| `conversation-migration.ts` | Remove dead code | -500 | ALL |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `conversation-migration.ts` | Migration complete, dead code | ALL |

---

## 6. Chat Flow Must-Pass Checklist

### Pre-Refactor Verification

- [ ] Current chat flow diagrammed
- [ ] Conversation store facade behavior understood
- [ ] Event subscription points identified
- [ ] Direct store access locations mapped

### During Refactor

- [ ] Conversation facade removed
- [ ] Components use unified-chat-store directly
- [ ] ChatInterface calls ensureConversation()
- [ ] Thread management verified
- [ ] Event subscriptions have cleanup
- [ ] Direct getState() calls converted to hooks

### Post-Refactor Verification

- [ ] useConversationStore.ts < 200 lines
- [ ] Zero direct store access in chat components
- [ ] Conversation auto-created on chat open
- [ ] Thread management works correctly
- [ ] No memory leaks (event subscriptions cleaned)
- [ ] No console errors in chat flow
- [ ] TypeScript compilation succeeds
- [ ] All existing tests pass

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| UnifiedChatStore | ✅ Ready | Core |
| ThreadManagementSlice | ✅ Ready | Core |
| MessageCrudSlice | ✅ Ready | Core |
| ContextWindowSlice | ✅ Ready | Core |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Conversation facade removal breaks UI** | Medium | High | Test each chat component |
| **Memory leak persists** | Low | High | Add test for cleanup |
| **Thread state corrupted** | Low | High | Add validation |

### Deferred (Not MVP)

| Item | Reason | When |
|------|--------|------|
| Thread search | Nice to have | Phase 3 |
| Thread sharing | Feature request | Future |
| Thread merge | Edge case | Future |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-05 - Cross-Workspace Features](./shard-03-05-cross-workspace.md)*

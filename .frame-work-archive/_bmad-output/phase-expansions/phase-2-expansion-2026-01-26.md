# Phase 2: Chat Cascade, Thread Management, and Agents

**Document ID**: `phase-2-expansion-2026-01-26`
**Version**: 1.0.0
**Status**: DRAFT
**Created**: 2026-01-26
**Related Documents**:
- [`the-3-phase-approach.md`](../docs/the-3-phase-approach.md) - Original skeleton
- [`new-fundamental-truths.md`](../new-fundamental-truths.md) - Master architecture (Sections 5, 6)
- [`agent-tool-architecture-analysis-2026-01-26.md`](../_bmad-output/investigation-artifacts/agent-tool-architecture-analysis-2026-01-26.md) - Investigation evidence
- [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md) - Investigation evidence

---

## Executive Summary

Phase 2 implements the Chat Cascade system with thread management and multi-agent orchestration. The investigation reveals **severe implementation gaps** that block Phase 2 execution:

**Current Status: 30% Complete** - Critical blockers prevent Phase 2 from proceeding

**Key Findings**:

1. **Agent System**: 55% readiness - Tool registry complete, but runtime orchestrator, mode switching, and agentic cycle are completely missing. All agent definitions exist only as documentation, not runtime code.

2. **Thread Management**: 70% readiness - Data model and storage complete, but auto-compaction trigger (0%), LLM summarization (0%), and multi-format rendering (10%) are missing.

3. **Total Blockers**: 9 P0 blockers prevent Phase 2 execution:
   - **5 Agent System Blockers** (32-48 hours): Runtime orchestrator, mode switching, tool approval, agentic cycle, sub-agent delegation
   - **4 Thread Management Blockers** (21-30 hours): Auto-compaction trigger, LLM summarization, multi-format rendering, file reference system

4. **Estimated Effort**: 53-78 hours (7-10 days) to resolve all P0 blockers before Phase 2 can begin.

**Critical Insight**: The foundation is solid (tool registry, thread storage, agent entities), but the runtime orchestration layer connecting these components is completely absent. Phase 2 cannot proceed until these gaps are closed.

---

## 2.1 Agent Orchestrator Pattern

### 2.1.1 Orchestrator Architecture

The agent system follows a **hierarchical orchestrator pattern** defined in [`new-fundamental-truths.md`](../new-fundamental-truths.md#51-agent-orchestrator-pattern):

```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

### 2.1.2 Orchestrator Responsibilities

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#orchestrator-responsibilities):**

| Responsibility | Description | Tools Used |
|---------------|-------------|-------------|
| **Conversational Guidance** | Maintain user-centric dialogue, guide through tasks | `question`, `todoread` |
| **Context Detection** | Analyze project state, loaded plugins, conversation history | `read-files`, `grep`, `glob` |
| **Task Decomposition** | Break complex tasks into delegatable sub-tasks | `todowrite`, `delegate-tasks` |
| **Mode Switching** | Switch to domain-specific agents when appropriate | `switch-mode` |
| **Read-Only Operations** | Orchestrator never modifies files, only reads | `read-files`, `grep`, `glob`, `list-files` |

### 2.1.3 Acceptance Criteria

**Given/When/Then Scenarios:**

1. **Mode Switching Flow**:
   - **Given**: User asks "Create a new API endpoint for user authentication"
   - **When**: Orchestrator analyzes task and detects code implementation requirement
   - **Then**: Orchestrator switches to `dev-ext` agent with full context and delegates task

2. **Multi-Delegation Flow**:
   - **Given**: User requests "Research best practices for REST API authentication, then implement in TypeScript"
   - **When**: Orchestrator detects two distinct sub-tasks (research + implementation)
   - **Then**: Orchestrator delegates sequentially to `analyst-ext` then `dev-ext`, each with isolated context

3. **Read-Only Enforcement**:
   - **Given**: Orchestrator mode active
   - **When**: Orchestrator attempts file write operation
   - **Then**: Operation blocked, orchestrator must switch to domain agent or delegate

4. **Context Preservation**:
   - **Given**: Orchestrator switches to `dev-ext` agent
   - **When**: `dev-ext` completes task
   - **Then**: Context (conversation history, file references, decisions) preserved for return to orchestrator

### 2.1.4 Current Implementation Status

**From [`agent-tool-architecture-analysis-2026-01-26.md`](../_bmad-output/investigation-artifacts/agent-tool-architecture-analysis-2026-01-26.md):**

| Component | Status | Completion % | Issues |
|-----------|---------|---------------|---------|
| **Orchestrator Documentation** | ✅ Complete | 100% | [`_bmad-ext/orchestrator/master-orchestrator.md`](../_bmad-ext/orchestrator/master-orchestrator.md) exists |
| **Runtime Orchestrator** | ❌ Missing | 0% | No TypeScript implementation exists |
| **Agent Mode Switching** | ❌ Missing | 0% | No logic to switch between agent modes |
| **Sub-Agent Delegation** | ⚠️ Protocol Only | 30% | Handoff documented, not implemented |
| **Agentic Cycle** | ❌ Missing | 0% | No sequential execution or retry logic |

### 2.1.5 Evidence: Missing Runtime Orchestrator

**Current State** (from investigation):
```typescript
// ❌ PROBLEM: Orchestrator exists as documentation only
// File: _bmad-ext/orchestrator/master-orchestrator.md (796 lines)
// No corresponding TypeScript implementation exists

// ❌ DOES NOT EXIST:
class AgentOrchestratorRuntime {
  selectAgent(task: string, workspace: WorkspaceType): Agent;
  switchMode(currentMode: AgentMode, targetMode: AgentMode): Agent;
  executeTool(agent: Agent, toolId: string, params: any): Promise<any>;
  approveToolExecution(tool: RegisteredTool, params: any): Promise<boolean>;
  executeAgenticCycle(
    agent: Agent,
    initialTask: string,
    maxIterations: number
  ): Promise<CycleResult>;
}
```

**Impact**: Without runtime orchestrator, agents cannot:
- Analyze user input to determine appropriate mode
- Switch between agents seamlessly
- Delegate complex tasks to sub-agents
- Coordinate sequential tool execution
- Maintain context across mode switches

---

## 2.2 Domain-Specific Agents

### 2.2.1 Agent Inventory

**From [`agent-tool-architecture-analysis-2026-01-26.md`](../_bmad-output/investigation-artifacts/agent-tool-architecture-analysis-2026-01-26.md#2-agent-inventory):**

All 9 agents exist as **documentation only**, no runtime implementations:

| Agent Type | Documentation | Runtime | Tools Available | System Instruction | Status |
|------------|---------------|-----------|------------------|-------------------|---------|
| **Orchestrator** | [`_bmad-ext/orchestrator/master-orchestrator.md`](../_bmad-ext/orchestrator/master-orchestrator.md) | ❌ Not Implemented | Read-only (theoretical) | Coordination protocol documented | 0% runtime |
| **dev-ext** | [`_bmad-ext/agents/dev-ext.md`](../_bmad-ext/agents/dev-ext.md) | ❌ Not Implemented | File CRUD, bash, task | Code implementation | 0% runtime |
| **architect-ext** | [`_bmad-ext/agents/architect-ext.md`](../_bmad-ext/agents/architect-ext.md) | ❌ Not Implemented | Design docs, review | Architecture design specialist | 0% runtime |
| **analyst-ext** | [`_bmad-ext/agents/analyst-ext.md`](../_bmad-ext/agents/analyst-ext.md) | ❌ Not Implemented | Research, analysis | Requirements gathering | 0% runtime |
| **ux-designer-ext** | [`_bmad-ext/agents/ux-designer-ext.md`](../_bmad-ext/agents/ux-designer-ext.md) | ❌ Not Implemented | UI/UX design | Interface design | 0% runtime |
| **tech-writer-ext** | [`_bmad-ext/agents/tech-writer-ext.md`](../_bmad-ext/agents/tech-writer-ext.md) | ❌ Not Implemented | Documentation | API docs, guides | 0% runtime |
| **tea-ext** | [`_bmad-ext/agents/tea-ext.md`](../_bmad-ext/agents/tea-ext.md) | ❌ Not Implemented | Testing | Test specifications | 0% runtime |
| **product-management-ext** | [`_bmad-ext/agents/product-management-ext.md`](../_bmad-ext/agents/product-management-ext.md) | ❌ Not Implemented | Sprint planning | Epic management | 0% runtime |

### 2.2.2 Domain Agent Requirements

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#domain-specific-agents):**

Each domain-specific agent requires:

| Requirement | Description | Status |
|-------------|-------------|---------|
| **Focused Tool Groups** | Each agent has specialized tools matching domain | ❌ Not implemented |
| **System Instructions** | Domain-specific behavior rules and guidelines | ⚠️ Documented only |
| **Tool Permission Controls** | Ask/allow/deny per-tool permissions | ❌ Not implemented |
| **Isolated Context** | Sub-agent delegations use isolated thread context | ❌ Not implemented |

### 2.2.3 Agent Use Cases

| Agent | Primary Use Case | Required Tools | Permission Level |
|--------|------------------|----------------|------------------|
| **dev-ext** | Code implementation, file modifications | `write_file`, `delete_file`, `execute_command`, `bash` | Full CRUD + limited bash |
| **architect-ext** | Architecture decisions, design docs | `write_file` (design docs), `read_files` | Design only |
| **analyst-ext** | Research, requirements gathering | `read_files`, `grep`, `glob`, `search_web` | Read-only |
| **ux-designer-ext** | UI/UX design, wireframes | `write_file` (Figma exports), `read_files` | Design only |
| **tech-writer-ext** | Documentation generation | `write_file`, `read_files`, `glob` | Documentation only |

### 2.2.4 Implementation Gap

**Evidence** (from investigation):
```typescript
// ❌ PROBLEM: No runtime agent implementations exist
// All agents are markdown files in _bmad-ext/agents/

// Example: _bmad-ext/agents/dev-ext.md (135 lines)
// Contains:
// - Role boundaries
// - Tool permissions
// - System instructions
// - Integration points
// BUT: No corresponding TypeScript class:
// ❌ DOES NOT EXIST:
class DevExtAgent {
  constructor(
    private tools: ToolRegistry,
    private systemPrompt: string,
    private permissions: AgentPermissions
  ) {}

  async execute(task: string, context: AgentContext): Promise<AgentResult> {
    // Task execution logic
  }
}
```

**Impact**: Without runtime agents:
- Orchestrator cannot switch modes
- No domain-specific task execution
- Tool permission matrix not enforced
- Task delegation impossible

---

## 2.3 Tool Architecture

### 2.3.1 Tool Types

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#52-tool-architecture):**

| Type | Execution Location | Examples | Current Status |
|------|------------------|----------|---------------|
| **Client Tools** | Browser-only | File read, glob, grep | ✅ Implemented |
| **Server Tools** | Server/Edge | LLM calls, database ops | ✅ Implemented |
| **Agent Tools** | Delegated | Complex multi-step tasks | ⚠️ Definitions exist, not connected |

### 2.3.2 Tool Permission Matrix

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#tool-permission-matrix):**

| Agent | write | edit | bash | task | Implementation Status |
|--------|-------|------|------|------|--------------------|
| **real-world-validator** | true | false | browser | true | ⚠️ Design only |
| **dev-ext** | true | true | limited | true | ❌ Runtime missing |
| **architect-ext** | false | design | false | true | ❌ Runtime missing |
| **analyst-ext** | false | false | false | true | ❌ Runtime missing |
| **ux-designer-ext** | false | false | false | true | ❌ Runtime missing |

**Permission Levels**:
- **ask**: Require explicit user approval before execution
- **allow**: Auto-approve for safe operations
- **deny**: Block execution completely

### 2.3.3 Tool Registry Status

**From [`agent-tool-architecture-analysis-2026-01-26.md`](../_bmad-output/investigation-artifacts/agent-tool-architecture-analysis-2026-01-26.md#32-tool-registry-implementation):**

**Status**: ✅ FULLY IMPLEMENTED (100%)

**File**: `src/infrastructure/tools/centralized-tool-registry.ts`

**Capabilities**:
- ✅ Singleton pattern
- ✅ Tool registration (`register`, `registerAll`)
- ✅ Tool retrieval (`get`, `getAll`, `getById`)
- ✅ Tool filtering by mode, workspace, category
- ✅ Server-exposed tool filtering
- ✅ Category and mode grouping

**Registered Tools** (20+ tools):

| Category | Tools | Status |
|----------|--------|--------|
| **Notes** | `create_note`, `read_note`, `update_note`, `delete_note`, `list_notes` | ✅ Implemented |
| **Unified Files** | `read_file`, `write_file`, `list_files`, `delete_file` | ✅ Implemented |
| **Composite/Agent** | `research_tool`, `analyze_tool`, `plan_tool`, `storyboard_tool` | ✅ Implemented |
| **Utility** | `execute_command`, `synthesize`, `process_pdf`, `process_url`, `voice_input` | ✅ Implemented |

### 2.3.4 Tool Approval Mechanism

**Status**: ❌ NOT IMPLEMENTED (0%)

**Required** (from [`new-fundamental-truths.md`](../new-fundamental-truths.md#tool-approval)):

```typescript
// ❌ DOES NOT EXIST - Need to implement:
interface ToolApprovalService {
  approveToolExecution(
    tool: RegisteredTool,
    params: any,
    agent: AgentType
  ): Promise<boolean>;

  getApprovalHistory(): ApprovalRecord[];

  updatePermissionMatrix(
    agent: AgentType,
    toolId: string,
    permission: 'ask' | 'allow' | 'deny'
  ): void;
}
```

**Critical Gap**: Tools execute without permission checks:
- No runtime enforcement of permission matrix
- No UI for user approval prompts
- No audit trail of tool executions
- Dangerous operations (file writes, bash) unchecked

### 2.3.5 Agentic Cycle

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#53-agentic-cycle):**

**Status**: ❌ NOT IMPLEMENTED (0%)

**Required Capabilities**:

| Capability | Description | Status |
|------------|-------------|---------|
| **Sequential Execution** | Tools execute in order with state passing | ❌ Not implemented |
| **Retry Logic** | Exponential backoff on failures | ❌ Not implemented |
| **Conditional Branching** | Decision trees based on tool results | ❌ Not implemented |
| **Error Recovery** | Graceful handling of tool failures | ❌ Not implemented |
| **Context Management** | Update and compact context during cycle | ❌ Not implemented |

**Evidence** (from investigation):
```typescript
// ❌ PROBLEM: No agentic cycle executor exists
// Reference: new-fundamental-truths.md Section 5.3
// TanStack AI SDK supports agentic cycle via `maxIterations()`
// BUT: No wrapper service exists to manage cycle execution

// ❌ DOES NOT EXIST:
class AgenticCycleExecutor {
  async executeCycle(
    agent: Agent,
    initialTask: string,
    maxIterations: number = 3
  ): Promise<CycleResult> {
    // Cycle execution logic
    // - Sequential tool calls
    // - State management
    // - Retry with backoff
    // - Error recovery
  }
}
```

---

## 2.4 Thread Architecture

### 2.4.1 Thread Data Model

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#241-thread-data-model--90):**

**Status**: ✅ IMPLEMENTED (90%)

**File**: `src/domain/entities/chat.ts` (lines 140-169)

```typescript
interface ChatThread {
  id: string;
  conversationId: string;
  projectId: string;  // ✅ Project-scoped
  workspaceType?: WorkspaceType;
  title: string;
  preview: string;
  parentThreadId?: string | null;  // ✅ Hierarchy support
  childThreadIds?: string[];  // ✅ Cascade navigation
  folderPath?: string;  // ✅ Organization support
  contextWindow?: ContextWindowConfig;  // ✅ Token management
  status: 'active' | 'archived' | 'deleted';
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}
```

**Implemented Features**:
- ✅ Thread ID, name, timestamps
- ✅ Parent-child relationships
- ✅ Status management (active/archived/deleted)
- ✅ Folder path organization
- ✅ Context window configuration
- ✅ Workspace scoping

**Missing Fields**:
- ❌ `compactionFromThread`: Track compaction history
- ❌ `recappedContext`: Store compacted conversation summaries
- ❌ `compactionReason`: Audit trail for compactions

### 2.4.2 Thread Storage

**Status**: ✅ IMPLEMENTED (95%)

**File**: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`

**Implemented Operations**:
```typescript
{
  threads: {},
  activeThreadId: null,

  createThread: (conversationId, parentThreadId) => { ... },
  deleteThread: (threadId) => { ... },  // Soft delete
  updateThread: (threadId, updates) => { ... },
  archiveThread: (threadId) => { ... },  // ✅ CHAT-006
  unarchiveThread: (threadId) => { ... },
  setActiveThread: (threadId) => { ... },

  // Selectors
  getRootThread: (conversationId) => ThreadWithId | undefined,
  getChildThreads: (parentThreadId) => ThreadWithId[],
  getThreadHierarchy: (threadId) => ThreadWithId[],
  getThreadsByWorkspace: (workspaceType) => ThreadWithId[],
}
```

**Storage**: ✅ DexieIndexedDB via Zustand persist middleware
- Indexed by conversationId ✅
- Persists across refreshes ✅
- Thread CRUD operations complete ✅

### 2.4.3 Thread Hierarchy

**Status**: ✅ IMPLEMENTED (100%)

**Hierarchy Support**:
- ✅ Parent-child relationships via `parentThreadId` and `childThreadIds`
- ✅ Root thread identification
- ✅ Cascade flow navigation (flattened hierarchy)
- ✅ Workspace-scoped thread filtering

**Thread Types** (from [`new-fundamental-truths.md`](../new-fundamental-truths.md#61-thread-architecture)):

```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

### 2.4.4 Thread Lifecycle

**Status**: ⚠️ PARTIAL (60%)

**Implemented**:
- ✅ Thread creation with parent support
- ✅ Thread soft deletion (status = 'deleted')
- ✅ Thread archiving/unarchiving
- ✅ Active thread switching

**Missing**:
- ❌ **Auto-compaction at 90% threshold** (CRITICAL GAP)
- ❌ Sub-thread creation for compaction results
- ❌ Thread merging after compaction
- ❌ Compaction thread naming convention

---

## 2.5 Context Window Management

### 2.5.1 Token Tracking

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#41-token-tracking--80):**

**Status**: ✅ IMPLEMENTED (80%)

**File**: `src/infrastructure/persistence/stores/chat/slices/context-window-slice.ts`

**Implemented**:
```typescript
getContextUsage: (threadId: string) => {
  const thread = threads[threadId];
  const messages = getMessagesByThread(threadId);
  const maxTokens = thread.contextWindow?.maxTokens ?? DEFAULT_MAX_TOKENS;
  const currentTokens = estimateMessagesTokens(messages);
  const { remaining, used, percentage } = getContextCapacity(currentTokens, maxTokens);

  return { current: used, max: maxTokens, remaining, percentage };
}
```

**Token Estimation**:
```typescript
function estimateTokens(text: string): number {
  if (!text) return 0;
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function countMessageTokens(messages: ThreadMessage[]): number {
  return messages.reduce((total, msg) => {
    const contentTokens = estimateTokens(msg.content);
    const toolCallsTokens = msg.toolCalls
      ? msg.toolCalls.reduce((sum, tc) => {
          const inputTokens = estimateTokens(JSON.stringify(tc.input));
          const outputTokens = estimateTokens(JSON.stringify(tc.output));
          return sum + inputTokens + outputTokens;
        }, 0)
      : 0;
    return total + contentTokens + toolCallsTokens;
  }, 0);
}
```

**Accuracy**: ⚠️ Approximate (4 chars/token)
- Missing: Language-specific tokenizer (tiktoken)
- Missing: Tool call token refinement

### 2.5.2 Context Window Configuration

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#62-context-management):**

| Configuration | Value | Status |
|--------------|-------|--------|
| **Default Limit** | 150K tokens | ⚠️ Not implemented (no DEFAULT_MAX_TOKENS constant) |
| **Auto-Compaction Threshold** | 90% (135K tokens) | ❌ Not implemented |
| **Trigger Mechanism** | Auto-trigger on threshold reach | ❌ Not implemented |
| **Compaction Strategy** | Summarize (LLM-based) | ❌ Falls back to drop_oldest |

### 2.5.3 Compaction Logic

**Status**: ⚠️ PARTIAL (30%)

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#42-compaction-logic--30):**

**Implemented Strategies**:
```typescript
export async function pruneContextWindow(
  messages: ThreadMessage[],
  config: ContextWindowConfig
): Promise<ThreadMessage[]> {
  const { maxTokens, compressionStrategy } = config;
  const currentTokens = countMessageTokens(messages);

  if (currentTokens <= maxTokens) {
    return messages;
  }

  switch (compressionStrategy) {
    case 'drop_oldest':
      return dropOldestMessages(messages, maxTokens);

    case 'summarize':
      return await summarizeMessages(messages, maxTokens);  // ⚠️ Falls back

    case 'truncate':
      return truncateMessages(messages, maxTokens);
  }
}
```

**Strategies Defined**:
- ✅ `drop_oldest`: Remove oldest messages until under limit
- ⚠️ `summarize`: **NOT IMPLEMENTED** - Falls back to drop_oldest
- ✅ `truncate`: Truncate each message proportionally

### 2.5.4 Auto-Compaction Trigger

**Status**: ❌ NOT IMPLEMENTED (0%)

**Required** (from [`new-fundamental-truths.md`](../new-fundamental-truths.md#compaction-process)):

```
1. Trigger when context reaches 90%
2. Run sub-agent to condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread with recapped context
5. Preserve file path references for linking
```

**Critical Gap** (from investigation):
```typescript
// ❌ CRITICAL GAP: No auto-compaction trigger
// THIS DOES NOT EXIST - Need to implement:

export const useAutoCompaction = () => {
  const activeThreadId = useUnifiedChatStore((s) => s.activeThreadId);
  const contextUsage = useUnifiedChatStore((s) =>
    activeThreadId ? s.getContextUsage(activeThreadId) : null
  );

  useEffect(() => {
    if (!activeThreadId || !contextUsage) return;

    // Check 90% threshold (150K * 0.9 = 135K tokens)
    if (contextUsage.percentage >= 90) {
      console.warn('[AutoCompaction] Context at 90%, starting compaction...');

      // 1. Trigger compaction sub-agent
      compactContext(activeThreadId, {
        strategy: 'summarize',
        preserveFileReferences: true,
        filterIrrelevant: true,
      }).then((result) => {
        const parentThread = useUnifiedChatStore.getState().threads[activeThreadId];

        // 2. Create new thread
        const newThreadId = createThread(parentThread.conversationId, activeThreadId);

        // 3. Update with compaction metadata
        updateThread(newThreadId, {
          title: `Compacted from ${new Date().toLocaleTimeString()}`,
          preview: result.summary,
          compactionFromThread: activeThreadId,
          recappedContext: result.filteredContext,
          compactionReason: '90% context limit reached',
        });

        // 4. Switch to new thread
        setActiveThread(newThreadId);
      });
    }
  }, [activeThreadId, contextUsage]);
};
```

### 2.5.5 LLM Summarization Sub-Agent

**Status**: ❌ NOT IMPLEMENTED (0%)

**Required Capabilities** (from [`new-fundamental-truths.md`](../new-fundamental-truths.md#compaction-process)):

| Capability | Description | Status |
|------------|-------------|---------|
| **Conversation Condensation** | Summarize turns into compact context | ❌ Not implemented |
| **Irrelevant Filtering** | Remove poisoned/contextual information | ❌ Not implemented |
| **File Path Preservation** | Keep file references in summary | ❌ Not implemented |
| **Context Reconstruction** | Generate new thread starter with recap | ❌ Not implemented |

**Evidence** (from investigation):
```typescript
// ❌ DOES NOT EXIST - Need to implement:
export async function compactContext(
  threadId: string,
  options: CompactionOptions
): Promise<CompactionResult> {
  const messages = getMessagesByThread(threadId);

  // 1. Filter irrelevant/contextual information
  const filteredMessages = filterIrrelevantContext(messages);

  // 2. Extract file path references
  const fileReferences = extractFileReferences(filteredMessages);

  // 3. Run LLM to condense conversation
  const summary = await runLLMSummarization({
    conversation: filteredMessages,
    preserveFileReferences: true,
    maxSummaryTokens: 10000,
  });

  // 4. Return result
  return {
    summary: summary.text,
    filteredContext: filteredMessages,
    fileReferences: fileReferences,
    originalThreadMessages: messages.length,
    compactedMessages: filteredMessages.length,
  };
}
```

---

## 2.6 Multi-Format Chat Rendering

### 2.6.1 Required Content Types

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#63-multi-format-block-rendering):**

| Content Type | Rendering Requirements | Current Status |
|--------------|----------------------|----------------|
| **Code Blocks** | Syntax highlighted, copyable, Monaco integration | ❌ No syntax highlighting |
| **Rich Text** | Tables, diagrams, markdown | ❌ No rich text rendering |
| **HTML Artifacts** | Embedded components, interactive content | ❌ No HTML rendering |
| **Streaming Tokens** | Real-time display, thinking/reasoning | ⚠️ Partial - basic streaming |
| **Tool Outputs** | Collapsible, status-coded (success/failure) | ⚠️ Partial - basic display |
| **File References** | Clickable paths, `@` mentions with context | ❌ No file reference support |

### 2.6.2 Current Chat Interface

**Status**: ⚠️ PARTIAL (40%)

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#31-chat-interface-components--40):**

**Implemented**:
```typescript
// src/presentation/components/chat/UnifiedChatPanel.tsx
export type ChatMode = 'simple' | 'agent';

export const UnifiedChatPanel = memo(function UnifiedChatPanel(
  props: UnifiedChatPanelProps
) {
  switch (mode) {
    case 'simple':
      return <RAGChatPanel ... />;  // ✅ Citations, simple messages
    case 'agent':
      return <AgentChatPanel ... />;  // ✅ Tool execution, approvals
  }
});
```

**Components Present**:
- ✅ UnifiedChatPanel with mode switching
- ✅ AgentChatPanel (IDE workspace)
- ✅ RAGChatPanel (Knowledge workspace)
- ✅ ChatBubble (mobile floating bubble)
- ✅ ChatHistory (conversation list)
- ✅ AutoApproveSettings (tool permissions)
- ✅ ThreadManager (thread CRUD UI)

**Missing Components**:
- ❌ MessageList for cascade flow display
- ❌ MessageItem for individual messages
- ❌ AgentIndicator for showing which agent responded
- ❌ ToolOutput for collapsible tool results

### 2.6.3 Message Rendering Gap

**Evidence** (from investigation):
```typescript
// ❌ PROBLEM: Basic text-only rendering
// src/presentation/components/chat/UnifiedChatPanel.tsx

const messages = useMemo(() => {
  return rawMessages.map(msg => ({
    role: msg.role,
    content: extractMessageContent(msg.parts),  // Extract plain text only
  }));
}, [rawMessages]);

// ❌ MISSING:
// - No markdown rendering (react-markdown)
// - No syntax highlighting (Prism/Shiki)
// - No rich text tables/diagrams
// - No HTML artifact rendering
// - No collapsible tool outputs
// - No agent indicators
```

### 2.6.4 Streaming Implementation

**Status**: ⚠️ PARTIAL (60%)

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#33-streaming-implementation--60):**

**Implemented**:
```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts
const { useChat } from '@tanstack/ai-react';

const chatResult = useChat({
  connection,
  tools: adaptToolsToClientTools(agentTools.getClientTools()),
  agentLoopStrategy: maxIterations(3),  // ✅ Agentic loop
});

// Streaming messages arrive incrementally
const messages = useMemo(() => {
  return rawMessages.map(msg => ({
    role: msg.role,
    content: extractMessageContent(msg.parts),
  }));
}, [rawMessages]);
```

**Streaming Support**:
- ✅ TanStack AI real-time streaming via `fetchServerSentEvents`
- ✅ Partial message display during generation
- ✅ Loading states and timeout protection (30s timeout)

**Missing**:
- ❌ **Thinking/reasoning token display** (tokens displayed inline during generation)
- ❌ Streaming interruption handling (pause/resume generation)
- ❌ Token-by-token visual feedback (typing animation)

---

## 2.7 File Reference System

### 2.7.1 File-to-Chat References

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#64-bi-directional-references):**

| Syntax | Description | Current Status |
|--------|-------------|----------------|
| **`@filename`** | Include entire file | ❌ Not implemented |
| **`@folder/`** | Include all child files | ❌ Not implemented |
| **Selected Text in Monaco** | Include as context | ❌ Not implemented |

**Required Implementation** (from [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#51-file-references-in-chat--0)):

```typescript
// ❌ DOES NOT EXIST - Need to implement:

// 1. Message parser for @ syntax
function parseFileReferences(message: string): {
  files: string[];
  folders: string[];
  selectedText: string | null;
} {
  const fileMatches = message.matchAll(/@(\S+)/g);
  const folderMatches = message.matchAll(/@(\S+)\/\s*/g);

  return {
    files: fileMatches.map(m => m[1]),
    folders: folderMatches.map(m => m[1]),
    selectedText: null,  // Would come from Monaco selection
  };
}

// 2. File content inclusion
async function includeFileContext(
  projectId: string,
  filePaths: string[]
): Promise<string> {
  const contents = await Promise.all(
    filePaths.map(path => readFile(projectId, path))
  );
  return contents.join('\n\n');
}
```

### 2.7.2 Chat-to-File Operations

**From [`new-fundamental-truths.md`](../new-fundamental-truths.md#chat-to-file-operations):**

| Operation | Description | Current Status |
|-----------|-------------|----------------|
| **Insert as File** | Insert AI output as new file | ❌ Not implemented |
| **Insert at Cursor** | Insert at cursor position | ❌ Not implemented |
| **Copy to Clipboard** | Copy to clipboard | ❌ Not implemented |

**Required Implementation** (from [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#52-chat-to-file-operations--0)):

```typescript
// ❌ DOES NOT EXIST - Need to implement:
interface ChatToFileOperations {
  insertAsFile: (content: string, filePath?: string) => Promise<void>;
  insertAtCursor: (content: string, cursorPosition: number) => void;
  copyToClipboard: (content: string) => Promise<void>;
}

// Usage in chat interface:
<ChatMessageActions
  message={msg}
  actions={[
    {
      icon: <FilePlusIcon />,
      label: 'Insert as File',
      onClick: () => insertAsFile(msg.content),
    },
    {
      icon: <CursorIcon />,
      label: 'Insert at Cursor',
      onClick: () => insertAtCursor(msg.content, monacoCursorPosition),
    },
    {
      icon: <CopyIcon />,
      label: 'Copy to Clipboard',
      onClick: () => copyToClipboard(msg.content),
    },
  ]}
/>
```

### 2.7.3 Bi-Directional References

**Status**: ❌ NOT IMPLEMENTED (0%)

**Required Integration**:
- ❌ No Monaco editor integration with chat input
- ❌ No file watching for referenced file changes
- ❌ No real-time file change indicators in chat
- ❌ No reference link validation or dead link detection

---

## 2.8 Critical Blockers Summary

### 2.8.1 Agent System Blockers

**From [`agent-tool-architecture-analysis-2026-01-26.md`](../_bmad-output/investigation-artifacts/agent-tool-architecture-analysis-2026-01-26.md#7-phase-2-blockers-critical):**

| Blocker | Severity | Effort | Impact | Dependencies |
|----------|----------|---------|--------|--------------|
| **Runtime Orchestrator** | 🔴 P0 | 8-12h | Agents cannot coordinate | None |
| **Agent Mode Switching** | 🔴 P0 | 4-6h | Orchestrator cannot delegate | Runtime Orchestrator |
| **Tool Approval Mechanism** | 🔴 P0 | 6-8h | Dangerous operations unchecked | Runtime Orchestrator |
| **Agentic Cycle** | 🔴 P0 | 8-12h | Sequential execution impossible | Mode Switching, Tool Approval |
| **Sub-Agent Delegation** | 🔴 P0 | 6-10h | Task decomposition impossible | Runtime Orchestrator, Mode Switching |

**Total Agent Effort**: 32-48 hours

### 2.8.2 Thread Management Blockers

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#8-phase-2-blockers-critical):**

| Blocker | Severity | Effort | Impact | Dependencies |
|----------|----------|---------|--------|--------------|
| **Auto-Compaction Trigger** | 🔴 P0 | 4-6h | Thread compaction never runs | LLM Summarization |
| **LLM Summarization** | 🔴 P0 | 6-8h | Always drops oldest messages | Auto-Compaction Trigger |
| **Multi-Format Rendering** | 🔴 P0 | 8-12h | Plain text UI only | None |
| **File Reference System** | 🔴 P0 | 3-4h | No @filename, @folder/ support | None |

**Total Thread Effort**: 21-30 hours

### 2.8.3 Total P0 Effort

**Combined Blocker Summary**:

| Category | Blockers | Effort Range | Total Effort |
|----------|-----------|---------------|---------------|
| **Agent System** | 5 | 32-48h | 32-48 hours |
| **Thread Management** | 4 | 21-30h | 21-30 hours |
| **TOTAL** | 9 | - | **53-78 hours** |

**Time Estimate**: 4-6 days (assuming 8-12 hours/day)

---

## 2.9 Cross-References

### 2.9.1 To Master Documents

| Document | Section | Relevance |
|----------|----------|-----------|
| [`new-fundamental-truths.md`](../new-fundamental-truths.md) | Section 5: Agent and Tool Architecture | Orchestrator pattern, domain agents, tool types, permission matrix |
| [`new-fundamental-truths.md`](../new-fundamental-truths.md) | Section 6: Chat Cascade | Thread architecture, context management, multi-format rendering, file references |

### 2.9.2 To Investigation Reports

| Report | Section | Relevance |
|---------|----------|-----------|
| [`agent-tool-architecture-analysis-2026-01-26.md`](../_bmad-output/investigation-artifacts/agent-tool-architecture-analysis-2026-01-26.md) | Sections 4-7 | Agent inventory, tool registry, P0 blockers, implementation gaps |
| [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md) | Sections 2-8 | Thread data model, context tracking, compaction gaps, multi-format rendering, file references |

### 2.9.3 To Phase 1 Artifacts

| Epic | Status | Relevance to Phase 2 |
|------|--------|---------------------|
| **EPIC-ARCH-01** | ✅ Complete | Foundation architecture established |
| **EPIC-ARCH-02** | ⚠️ 70% true | Feature plugins partially complete (Monaco is POC) |
| **EPIC-ARCH-03** | ⚠️ 45% true | PluginLayout.tsx = 1034 lines (god component) |

---

## 2.10 Common Pitfalls

### 2.10.1 Architecture Pitfalls

**From [`the-3-phase-approach.md`](../docs/the-3-phase-approach.md#common-pitfalls) and investigation reports:**

| Pitfall | Impact | Prevention |
|----------|----------|-------------|
| **Missing orchestrator runtime** | Agents cannot coordinate, mode switching impossible | Implement `AgentOrchestratorRuntime` class before any agent development |
| **No tool approval enforcement** | Dangerous operations (file writes, bash) execute unchecked | Implement `ToolApprovalService` with UI prompts and audit logging |
| **No agentic cycle wrapper** | Sequential tool execution, retry logic, error recovery missing | Implement `AgenticCycleExecutor` following TanStack AI SDK patterns |
| **Documentation-only agents** | System instructions exist but no runtime code | Create TypeScript implementations for all documented agents |

### 2.10.2 Implementation Pitfalls

| Pitfall | Impact | Prevention |
|----------|----------|-------------|
| **Direct LLM provider calls** | Bypass TanStack AI SDK, breaks orchestration | Always use `@tanstack/ai` SDK for LLM interactions |
| **Missing context window logic** | Token overflow, context dropped, no auto-compaction | Implement `useAutoCompaction` hook with 90% trigger |
| **Missing multi-format rendering** | Plain text UI, no syntax highlighting, poor UX | Integrate `react-markdown`, `Prism`/`Shiki` for code blocks |
| **Missing file reference system** | Cannot reference files, chat-to-file operations impossible | Implement `@filename` parser and Monaco integration |

### 2.10.3 Integration Pitfalls

| Pitfall | Impact | Prevention |
|----------|----------|-------------|
| **Agent tool registry disconnected** | Tools defined but not exposed to agents | Connect `CentralizedToolRegistry` to orchestrator via adapter |
| **Thread storage not triggering compaction** | Context overflows, user loses conversation | Add `useEffect` in `auto-compaction-slice.ts` to monitor context usage |
| **No Monaco integration** | Cannot insert AI output at cursor, no selected text context | Add Monaco editor hooks for cursor position and selection context |

---

## 2.11 Success Metrics

### 2.11.1 Agent System Metrics

| Metric | Target | Current | Gap |
|---------|---------|---------|------|
| **Runtime Orchestrator Operational** | 100% | 0% | 100% |
| **All Domain Agents Implemented** | 5 agents | 0 | 5 |
| **Mode Switching Working** | <100ms latency | N/A | N/A |
| **Tool Approval UI Functional** | 100% coverage | 0% | 100% |
| **Agentic Cycle Executor** | 3 iterations max | N/A | N/A |
| **Sub-Agent Delegation** | <1s handoff | N/A | N/A |

### 2.11.2 Thread Management Metrics

| Metric | Target | Current | Gap |
|---------|---------|---------|------|
| **Thread Data Model Complete** | 100% | 90% | 10% |
| **Thread Storage Operational** | 100% | 95% | 5% |
| **Auto-Compaction Trigger** | 90% threshold | 0% | 90% |
| **LLM Summarization** | 100% functional | 0% | 100% |
| **Context Window Limit** | 150K tokens | N/A | N/A |
| **Multi-Format Rendering** | 6 content types | 10% | 90% |
| **File Reference System** | 3 syntax types | 0% | 100% |

### 2.11.3 Overall Phase 2 Metrics

| Metric | Target | Current Status |
|---------|---------|---------------|
| **P0 Blockers Resolved** | 0 | 9 blockers remaining |
| **Agent Readiness** | 100% | 55% (45% gap) |
| **Thread Readiness** | 100% | 70% (30% gap) |
| **Total Phase 2 Readiness** | 100% | **30% (70% gap)** |
| **Estimated Time to Complete** | - | 53-78 hours (4-6 days) |

---

## 2.12 Implementation Priority

### 2.12.1 Critical Path (Must Complete First)

**From both investigation reports:**

```
Week 1: Foundation (32-48h)
├─ Day 1-2: Runtime Orchestrator (8-12h)
│   ├─ Create AgentOrchestratorRuntime class
│   ├─ Connect to TanStack AI SDK
│   ├─ Implement agent selection logic
│   └─ Write unit tests
│
├─ Day 3: Agent Mode Switching (4-6h)
│   ├─ Create AgentModeSwitcher service
│   ├─ Implement delegation protocol
│   └─ Add context preservation
│
├─ Day 4: Tool Approval (6-8h)
│   ├─ Create ToolApprovalService
│   ├─ Implement UI integration
│   ├─ Add audit logging
│   └─ Write integration tests
│
└─ Day 5: Agentic Cycle (8-12h)
    ├─ Create AgenticCycleExecutor
    ├─ Implement retry logic
    ├─ Add error recovery
    └─ Test sequential execution

Week 2: Thread Management (21-30h)
├─ Day 6-7: Auto-Compaction Trigger (4-6h)
│   ├─ Create useAutoCompaction hook
│   ├─ Monitor context usage
│   ├─ Trigger at 90% threshold
│   └─ Test with large conversations
│
├─ Day 8-9: LLM Summarization (6-8h)
│   ├─ Create compaction sub-agent
│   ├─ Implement context filtering
│   ├─ Add file path preservation
│   └─ Test summary generation
│
├─ Day 10-11: Multi-Format Rendering (8-12h)
│   ├─ Integrate react-markdown
│   ├─ Add syntax highlighting (Prism/Shiki)
│   ├─ Create MessageItem component
│   └─ Test rich content rendering
│
└─ Day 12: File Reference System (3-4h)
    ├─ Implement @filename parser
    ├─ Add file content inclusion
    ├─ Create Monaco integration
    └─ Test bi-directional references
```

### 2.12.2 Parallel Development Opportunities

| Task | Can Parallelize With | Rationale |
|-------|-------------------|------------|
| **Multi-Format Rendering** | ✅ Agent Runtime | UI components independent of orchestrator |
| **File Reference Parser** | ✅ LLM Summarization | Both parsing and filtering tasks |
| **MessageList Component** | ✅ Tool Approval UI | Independent component development |
| **Token Counting Accuracy** | ⚠️ Depends | Requires accurate counting before compaction |

---

## 2.13 Testing Strategy

### 2.13.1 Unit Tests Required

**From investigation reports:**

| Component | Test File | Priority |
|-----------|-------------|----------|
| **AgentOrchestratorRuntime** | `agent-orchestrator-runtime.test.ts` | P0 |
| **AgentModeSwitcher** | `agent-mode-switcher.test.ts` | P0 |
| **ToolApprovalService** | `tool-approval-service.test.ts` | P0 |
| **AgenticCycleExecutor** | `agentic-cycle-executor.test.ts` | P0 |
| **AutoCompactionHook** | `auto-compaction-hook.test.ts` | P0 |
| **LLMSummarization** | `llm-summarization.test.ts` | P0 |
| **MessageItem** | `message-item.test.ts` | P0 |
| **FileReferenceParser** | `file-reference-parser.test.ts` | P0 |

### 2.13.2 Integration Tests Required

| Flow | Test File | Priority |
|-------|-------------|----------|
| **Orchestrator Mode Switch** | `orchestrator-mode-switching.spec.ts` | P0 |
| **Tool Approval Flow** | `tool-approval-flow.spec.ts` | P0 |
| **Agentic Cycle Execution** | `agentic-cycle-execution.spec.ts` | P0 |
| **Auto-Compaction E2E** | `auto-compaction-e2e.spec.ts` | P0 |
| **File Reference Flow** | `file-reference-flow.spec.ts` | P0 |
| **Multi-Format Rendering** | `multi-format-rendering.spec.ts` | P0 |

### 2.13.3 E2E Tests Required

**From [`thread-management-gaps-2026-01-26.md`](../_bmad-output/investigation-artifacts/thread-management-gaps-2026-01-26.md#113-e2e-tests-needed):**

| Test | File | Scenario |
|-------|------|----------|
| **Chat Cascade Flow** | `chat-cascade-flow.spec.ts` | User → Orchestrator → Agent delegation → Tool execution |
| **File Reference Usage** | `file-reference.spec.ts` | `@filename` usage, Monaco selection, insertion |
| **Compaction Trigger** | `auto-compaction.spec.ts` | 150K+ tokens → auto-trigger → new thread creation |
| **Multi-Agent Delegation** | `multi-agent-delegation.spec.ts` | Sequential delegation to dev-ext → analyst-ext → dev-ext |

---

## 2.14 Risk Assessment

### 2.14.1 Technical Risks

| Risk | Severity | Mitigation |
|-------|----------|-------------|
| **Underestimating orchestrator complexity** | 🟠 MEDIUM | Start with simple orchestrator, iterate gradually |
| **TanStack AI SDK integration issues** | 🟠 MEDIUM | Use official SDK patterns and examples, test extensively |
| **Token counting inaccuracy** | 🟡 LOW | Replace 4 chars/token with tiktoken after basic implementation |
| **Compaction summary quality** | 🟠 MEDIUM | A/B test compaction strategies, monitor user feedback |
| **Multi-format rendering performance** | 🟡 LOW | Use efficient markdown renderer, lazy load syntax highlighting |

### 2.14.2 Schedule Risks

| Risk | Severity | Mitigation |
|-------|----------|-------------|
| **Blocker count underestimated** | 🟠 MEDIUM | Add buffer time (20% over estimates), monitor progress weekly |
| **Parallel development conflicts** | 🟡 LOW | Carefully coordinate between teams, use feature branches |
| **Testing effort underestimated** | 🟠 MEDIUM | Start testing early in parallel with implementation |

### 2.14.3 User Experience Risks

| Risk | Severity | Mitigation |
|-------|----------|-------------|
| **Tool approval fatigue** | 🟡 LOW | Remember approvals per tool/user session, minimize unnecessary prompts |
| **Compaction context loss** | 🟠 MEDIUM | Preserve file references, allow user to review before compaction |
| **Multi-format rendering glitches** | 🟡 LOW | Extensive cross-browser testing, fallback to plain text if needed |

---

## 2.15 Next Steps

### 2.15.1 Immediate Actions (This Week)

1. **Create Runtime Orchestrator** (P0)
   - Implement `AgentOrchestratorRuntime` class
   - Connect to TanStack AI SDK chat interface
   - Implement agent selection logic based on task analysis

2. **Implement Tool Approval Flow** (P0)
   - Create approval service with UI integration
   - Implement permission checking at execution time
   - Add approval history tracking for audit

3. **Connect Tool Registry to LLM** (P0)
   - Hook `CentralizedToolRegistry` to TanStack AI chat
   - Implement tool filtering by agent mode
   - Add server-exposed tool routing

4. **Implement Auto-Compaction Trigger** (P0)
   - Create `useAutoCompaction` hook
   - Monitor context usage on every message update
   - Trigger sub-agent at 90% threshold

5. **Implement Basic Multi-Format Rendering** (P0)
   - Integrate `react-markdown` for rich text
   - Add syntax highlighting for code blocks (Prism/Shiki)
   - Create collapsible sections for tool output

### 2.15.2 Short-term Actions (Next Week)

6. **Implement Agent Mode Switching** (P0)
   - Create mode switcher service
   - Implement delegation protocol with handoff artifacts
   - Add context preservation across switches

7. **Build Agentic Cycle Executor** (P0)
   - Implement sequential tool execution with state passing
   - Add retry logic with exponential backoff
   - Implement conditional branching based on tool results

8. **Implement LLM Summarization** (P0)
   - Create compaction sub-agent for context condensation
   - Implement context filtering logic to remove irrelevant information
   - Preserve file path references in summary

9. **Create File Reference Parser** (P0)
   - Implement `@filename` and `@folder/` syntax parsing
   - Create file content retrieval logic
   - Add UI indicators for referenced files

### 2.15.3 Medium-term Actions (Week 3-4)

10. **Implement Sub-Agent Delegation** (P0)
    - Create handoff processing service
    - Implement context isolation for sub-agent threads
    - Add delegation tracking and coordination

11. **Add Chat-to-File Operations** (P1)
    - Create message action menu component
    - Implement insert-as-file functionality
    - Add cursor insertion support via Monaco editor

12. **Enhance Token Counting** (P1)
    - Replace 4 chars/token approximation with tiktoken
    - Add tool call token refinement
    - Improve accuracy for different programming languages

13. **Implement Bi-Directional File Links** (P2)
    - Integrate Monaco selection with chat input
    - Add file watching for referenced file changes
    - Show real-time change indicators in chat
    - Validate reference links and detect dead links

---

## 2.16 Conclusion

Phase 2 implementation requires **significant foundational work** before the chat cascade and thread management features can be operational. The investigation reveals:

**Strengths**:
- ✅ Tool registry is 100% complete with 20+ tools
- ✅ Thread data model and storage are 90-95% complete
- ✅ Agent entity and business logic are well-designed
- ✅ TanStack AI SDK integration is 95% complete
- ✅ Basic streaming infrastructure works

**Critical Gaps**:
- ❌ Runtime orchestrator is completely missing (0%)
- ❌ Agent mode switching is not implemented (0%)
- ❌ Tool approval mechanism does not exist (0%)
- ❌ Agentic cycle executor is missing (0%)
- ❌ Auto-compaction trigger is not implemented (0%)
- ❌ LLM summarization sub-agent is not implemented (0%)
- ❌ Multi-format rendering is at 10% (90% gap)
- ❌ File reference system does not exist (0%)

**Overall Readiness**: 30% - 70% of Phase 2 implementation remains

**Critical Path**: Resolve 9 P0 blockers (53-78 hours) → Begin Phase 2 feature development

**Risk**: Underestimating complexity, parallel development conflicts, tool approval fatigue, compaction context loss

**Mitigation**: Add buffer time, start testing early, monitor progress weekly, use official SDK patterns extensively

---

**Document Status**: DRAFT
**Next Review**: After P0 blockers complete
**Estimated Phase 2 Start**: 7-10 days after blocker resolution (February 2-6, 2026)

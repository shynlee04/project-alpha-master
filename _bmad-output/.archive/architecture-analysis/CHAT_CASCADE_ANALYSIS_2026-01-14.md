# Chat Cascade & Agent Orchestration Architecture Analysis
**Date**: 2026-01-14
**Status**: Working with Integration Gaps

---

## Executive Summary

**Current State**: PARTIALLY IMPLEMENTED
- Chat cascade exists with hierarchical threads
- Tool infrastructure is complete
- Agent orchestration has multi-mode support
- RAG infrastructure exists but needs integration

**Primary Gaps**:
1. RAG chat not integrated with unified chat store
2. No thread-aware multi-agent workflows
3. Mode switching works but lacks cascade coordination
4. Multi-agent modes (debate, routing, expansion) disconnected from main chat

---

## 1. CHAT CASCADE (Thread Management)

### Current Implementation: WORKING ✅

**Location**: `src/infrastructure/persistence/stores/chat/unified-chat-store.ts`

**Architecture**:
```
Unified Chat Store (Zustand + Dexie)
├── Conversation CRUD
│   ├── createConversation()
│   ├── updateConversation()
│   ├── deleteConversation()
│   └── loadConversation()
├── Thread Management (Hierarchical)
│   ├── createThread(conversationId, parentThreadId?)
│   ├── deleteThread()
│   ├── updateThread()
│   ├── archiveThread() / unarchiveThread()
│   ├── setActiveThread()
│   ├── getRootThread()
│   ├── getChildThreads()
│   └── getThreadHierarchy()
├── Message CRUD (Thread-scoped)
│   ├── addMessage(threadId, message)
│   ├── updateMessage()
│   └── getMessagesByThread()
├── Tool Execution Tracking
│   ├── createToolCall()
│   ├── updateToolCall()
│   ├── addPendingApproval()
│   ├── approveToolCall()
│   └── denyToolCall()
└── Context Window Management (MM-09)
    ├── getContextUsage()
    ├── updateContextWindow()
    ├── compressContext()
    └── setThreadMaxTokens()
```

**Key Features**:
- ✅ Hierarchical thread structure (root + children)
- ✅ Thread lifecycle (active, archived, deleted)
- ✅ Per-thread message storage
- ✅ Tool call tracking with approvals
- ✅ Context window management with compression
- ✅ Dexie persistence (IndexedDB)
- ✅ Debounced persist (500ms) to prevent excessive writes
- ✅ Workspace-scoped conversations (ide, notes, knowledge, study)

**Type Definitions**: `src/infrastructure/persistence/stores/chat/unified-chat-types.ts`
- `ConversationWithId` - Conversation metadata
- `ThreadWithId` - Thread with parent/child relationships
- `MessageWithId` - Messages with thread references
- `ToolCallWithId` - Tool execution tracking
- `ToolApproval` - Approval workflow state

**Missing Features**:
- ❌ Thread branching/merging UI
- ❌ Thread sharing between conversations
- ❌ Cross-workspace thread references
- ❌ Thread metadata (tags, custom properties)

---

## 2. AGENT ORCHESTRATION (Mode Switching)

### Current Implementation: WORKING ✅

**Location**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

**Architecture**:
```
Chat Hook (useAgentChatWithTools)
├── TanStack AI Integration
│   ├── useChat() with clientTools()
│   ├── agentLoopStrategy: maxIterations(3)
│   └── fetchServerSentEvents for streaming
├── Mode Classification (Story 40-08)
│   ├── classifyMode() using ModeClassifier
│   ├── SystemPromptComposer for 5-layer prompts
│   └── Dynamic mode switching per message
└── Tool Execution
    ├── createAgentClientTools()
    ├── Workspace tool filtering
    └── Pending approvals UI
```

**Mode Types** (from `src/domain/tools/tool-definition.ts`):
```typescript
type AgentMode = 'coding' | 'knowledge' | 'orchestrator'
```

**Mode Classifier**: `src/lib/agent/mode-classifier.ts`
- **Inputs**: Prompt, workspace type, active document, conversation history
- **Weighted Signals**:
  - Workspace: 0.7 weight
  - Prompt: 0.8 weight (keyword matching)
  - Document: 0.5 weight (file extension)
  - Conversation: 0.3 weight (recent modes)
- **Output**: Mode + confidence + reasoning
- **Min Confidence**: 0.5 (default mode if < 0.5)

**System Prompt Architecture**: `src/lib/agent/system-prompt.ts`
```
2-Layer Architecture:
├── Layer 1: Orchestrator (meta-level mode selection)
│   ├── Analyzes 4 context sources
│   ├── Explains mode choice conversationally
│   └── Routes to mode-specific prompts
└── Layer 2: Mode-Specific Prompts
    ├── Coding Mode Prompt
    │   ├── Tools: read_file, write_file, execute_command
    │   ├── Rules: Read before modifying, test changes
    │   └── Style: Direct, focused, technical
    ├── Knowledge Mode Prompt
    │   ├── Tools: read_note, write_note, search_notes, summarize
    │   ├── Rules: Ask before changing, cite sources
    │   └── Style: Conversational, explanatory
    └── Orchestrator Mode Prompt
        ├── Tools: read_file, list_files, search_code (read-only)
        ├── Rules: Plan first, execute later
        └── Style: Analytical, trade-off focused
```

**Mode Mapping**:
```typescript
Workspace → Mode:
  'ide' → 'coding'
  'knowledge' → 'knowledge'
  'study' → 'knowledge'
  'notes' → 'knowledge'
  'research' → 'knowledge'  // implied workspace

File Extensions → Mode:
  Code files (.ts, .tsx, .py, etc.) → 'coding'
  Doc files (.md, .pdf, etc.) → 'knowledge'
```

**Current Limitations**:
- ⚠️ Mode switching happens per message (not thread-aware)
- ⚠️ No mode persistence across threads
- ⚠️ Workspace type hardcoded in routing agent
- ⚠️ Orchestrator mode exists but doesn't have full tool set

---

## 3. TOOLS INFRASTRUCTURE

### Current Implementation: COMPLETE ✅

**Tool Registry**: `src/infrastructure/tools/centralized-tool-registry.ts`
- **Singleton pattern** - Global registry
- **Filtering**: By mode, workspace, category, execution side, server exposure
- **API**:
  - `register(tool)` - Add tool definition
  - `get(id)` - Retrieve tool
  - `getFilteredTools(config)` - Filtered list
  - `getServerExposedTools()` - Server-callable tools only

**Tool Catalog**: `src/infrastructure/tools/tool-catalog.ts`

**Registered Tools**: 27 total

| Category | Tools | Modes | Execution Side |
|----------|-------|-------|----------------|
| Files | read_file, write_file, list_files | coding, orchestrator | both |
| Terminal | execute_command | coding | both |
| Notes | create_note, read_note, update_note, delete_note, list_notes | knowledge, orchestrator | both |
| Search | search_notes | knowledge, coding, orchestrator | server |
| Vision | synthesize, process_pdf, process_image | knowledge, orchestrator | server |
| Web | process_url | knowledge, orchestrator | server |
| Voice | voice_input, voice_output | knowledge, orchestrator | client |
| Unified | read, write, delete, list | coding, knowledge, orchestrator | both |
| Composite | research, storyboard, analyze, plan | knowledge, orchestrator | server |
| Provider | list_providers, execute_provider, test_provider | knowledge, coding, orchestrator | server |

**Tool Metadata** (from `src/domain/tools/tool-definition.ts`):
- `id` - Unique tool identifier
- `category` - files, terminal, knowledge, vision, etc.
- `allowedModes` - Which agent modes can use
- `allowedWorkspaces` - Which workspaces available in
- `executionSide` - 'client' (browser), 'server' (backend), or 'both'
- `serverExposed` - Whether tool callable from server
- `defaultTrustLevel` - 'auto', 'prompt', or 'disabled'
- `riskLevel` - 'low', 'medium', 'high'

**Permission Model**: `src/lib/agent/tool-permission/tool-permission-manager.ts`

**Yolo Mode** (You Only Live Once):
- Tracks per-tool approval history
- User can mark tools as "always approve"
- Permission levels: `auto` (prompt first), `prompt` (always ask), `disabled` (never run)

**Workspace-Specific Tool Filtering**: `src/lib/agent/workspace-tool-filter.ts`
- Filters tool catalog by workspace type
- Applied in `createAgentClientTools()` factory

**Current Limitations**:
- ⚠️ No runtime permission revocation (Yolo is one-way)
- ⚠️ No tool usage analytics
- ⚠️ No tool performance monitoring
- ⚠️ Unified tools (read/write) don't map to file/note operations

---

## 4. MULTI-AGENT ORCHESTRATION

### Current Implementation: PARTIALLY IMPLEMENTED ⚠️

**Location**: `src/lib/agent/hooks/use-multi-agent-chat.ts`

**Available Modes**:
```typescript
type MultiAgentMode = 'debate' | 'routing' | 'expansion' | null
```

**Debate Agent**: `src/lib/workflow/agents/debate-agent.ts`
- **Purpose**: Multiple AI personas discuss topic and synthesize
- **Personas**: OPTIMIST, SKEPTIC, EXPERT
- **Rounds**: 3 rounds of back-and-forth
- **Output**: Synthesis + reasoning

**Routing Agent**: `src/lib/workflow/agents/content-routing-agent.ts`
- **Purpose**: Classify intent and route to specialist
- **Modes**: IDE coding, documentation, general assistance, debugging
- **Confidence Threshold**: 0.5 minimum

**Expansion Agent**: `src/lib/workflow/agents/sequential-expansion-agent.ts`
- **Purpose**: Generate follow-up questions for deeper exploration
- **Question Count**: 3 questions max
- **Coherence Scoring**: Evaluates question relevance

**Integration Status**:
- ✅ Hooks exist (`useDebate`, `useRouting`, `useExpansion`)
- ✅ State management (mode, rounds, results, loading, error)
- ✅ Abort controller for cancellation
- ❌ **NOT INTEGRATED** with main chat hook
- ❌ **NOT CONNECTED** to unified chat store
- ❌ **NO THREAD AWARENESS** - each mode is independent

**Current Limitations**:
- ❌ Multi-agent modes operate in isolation
- ❌ No conversation history sharing between modes
- ❌ Debate/routing/expansion results don't persist to store
- ❌ No UI components for multi-agent workflows
- ❌ Workspace context hardcoded (always 'ide')

---

## 5. RAG INFRASTRUCTURE

### Current Implementation: COMPLETE BUT NOT INTEGRATED ⚠️

**Location**: `src/lib/rag/rag-chat.ts`

**Architecture**:
```
RAGChat Service
├── Hybrid Retriever
│   ├── BM25 keyword search (fallback)
│   ├── Vector semantic search (primary)
│   └── RRF (Reciprocal Rank Fusion) for scoring
├── Embedding Service
│   ├── Device capabilities detection
│   ├── Local model download (if needed)
│   └── Batch embedding support
├── Context Building
│   ├── Chunks with metadata (sourceId, title, position)
│   ├── Window size configuration
│   └── Search mode (keyword/semantic/hybrid)
└── Response Generation
    ├── Citation formatting
    ├── Conversation history
    └── Streaming support (async generator)
```

**Search Modes** (from `src/lib/rag/types.ts`):
- `keyword` - BM25 traditional search
- `semantic` - Vector similarity search
- `hybrid` - RRF combination of both

**Embedding Modes**:
- `local` - On-device model (WebNN, Transformers.js)
- `cloud` - API-based embedding (OpenAI, Gemini)
- `keyword-only` - No embeddings (pure lexical)

**RAG Store**: `src/infrastructure/persistence/stores/rag/rag-store.ts`
- Slice: `rag-search-slice` - Search results and mode
- Slice: `rag-chunking-slice` - Document chunking config
- Slice: `rag-index-slice` - Vector index management
- Slice: `rag-chat-slice` - Chat messages with citations
- Slice: `rag-voice-slice` - Voice mode state

**Key Types**:
```typescript
interface Citation {
  id: number;
  sourceId: string;
  title?: string;
  passage: string;
  contextBefore?: string;
  contextAfter?: string;
  position?: number;
  pageNumber?: number;
  score?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp?: number;
  streaming?: boolean;
}
```

**Integration Status**:
- ✅ RAG service complete with streaming
- ✅ Citation formatting with context windows
- ✅ Hybrid retriever with RRF
- ✅ Voice mode support (transcription/synthesis)
- ❌ **NOT INTEGRATED** with unified chat store
- ❌ **NOT USED** in useAgentChatWithTools hook
- ❌ **NO CONNECTION** to main chat interface

**Current Limitations**:
- ❌ RAG chat is standalone (not wired into main UI)
- ❌ No RAG citations in unified chat message schema
- ❌ No tool for RAG search (search_notes is note-specific)
- ❌ RAG results don't create threads
- ❌ No chunk management UI

---

## 6. PERMISSION MODEL

### Current Implementation: WORKING ✅

**Location**: `src/lib/agent/tool-permission/tool-permission-manager.ts`

**Architecture**:
```
ToolPermissionManager (Singleton)
├── Yolo Mode (You Only Live Once)
│   ├── Track approval history per tool
│   ├── User marks as "always approve"
│   └── Auto-approve on future uses
├── Trust Levels
│   ├── auto - Auto-run (first time)
│   ├── prompt - Always ask user
│   └── disabled - Never run
├── Permission Checking
│   ├── isPermitted(toolId, workspaceType)
│   ├── getPermissionState(toolId)
│   └── clearPermissions()
└── Storage (Dexie)
    └── Persist Yolo state across sessions
```

**Permission Flow**:
```
User sends message
  → LLM requests tool execution
  → Check tool trust level:
    - auto: Execute immediately
    - prompt: Show approval UI
    - disabled: Block tool
  → If user approves
    → Add to Yolo history
    → Execute tool
```

**Current Limitations**:
- ⚠️ No permission revocation (remove from Yolo list)
- ⚠️ No per-workspace Yolo preferences
- ⚠️ No time-based Yolo expiry
- ⚠️ No granular permission scopes (e.g., file paths)

---

## ARCHITECTURE GAPS & INTEGRATION ISSUES

### Critical Gaps

1. **RAG Not Integrated**
   - **Issue**: RAG chat service exists but never called from main chat hook
   - **Impact**: No knowledge retrieval in conversations
   - **Fix**: Add RAG mode to ModeClassifier, integrate into useAgentChatWithTools

2. **Multi-Agent Orchestration Disconnected**
   - **Issue**: Debate/routing/expansion modes exist but don't use unified store
   - **Impact**: Multi-agent results lost, no history persistence
   - **Fix**: Connect multi-agent hooks to unified chat store, create thread-aware workflows

3. **Thread-Aware Multi-Agent Missing**
   - **Issue**: Multi-agent modes don't create or reference threads
   - **Impact**: Can't have debate in a thread, no thread sharing
   - **Fix**: Extend multi-agent to create threads, allow thread selection per mode

4. **Mode Not Thread-Scoped**
   - **Issue**: Mode switching is per-message, not per-thread
   - **Impact**: Can't have coding thread + knowledge thread in same conversation
   - **Fix**: Add mode to thread metadata, allow mode per thread

5. **No Cross-Workspace Thread Sharing**
   - **Issue**: Threads bound to single workspace
   - **Impact**: Can't reference IDE thread from Knowledge workspace
   - **Fix**: Add cross-workspace thread references, permission checks

6. **Unified Tools Not Mapped**
   - **Issue**: `read/write/delete/list` unified tools don't distinguish file vs note
   - **Impact**: Can't use unified tools in knowledge mode for notes
   - **Fix**: Create unified tools with mode-aware routing (read_file vs read_note)

### Architectural Concerns

1. **Dual Chat Interfaces**
   - **Problem**: `useAgentChatWithTools` (main) vs `RAGChat` (standalone)
   - **Risk**: Confusing which to use, duplicated state management
   - **Solution**: Unify through common adapter or deprecate one

2. **Mode Classification Overhead**
   - **Problem**: Mode classification runs on every message
   - **Risk**: Unnecessary processing for consistent conversations
   - **Solution**: Cache mode per thread, manual override option

3. **Tool Registry Size**
   - **Problem**: 27 tools registered globally
   - **Risk**: Cognitive overhead for agent, unused tools shown in UI
   - **Solution**: Workspace-scoped registries, lazy loading

4. **No Cascade Coordination**
   - **Problem**: Multi-agent modes don't cascade between each other
   - **Example**: Can't route → debate → expansion as workflow
   - **Solution**: Implement state machine for multi-agent orchestration

---

## RECOMMENDED FIXES

### Priority 1: Integrate RAG (HIGH)

**File**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

```typescript
// Add to UseAgentChatWithToolsOptions
interface UseAgentChatWithToolsOptions {
  // ... existing
  enableRAG?: boolean;
  ragConfig?: RAGChatConfig;
  conversationId?: string | null;
  threadId?: string | null;
}

// In useAgentChatWithTools hook:
export function useAgentChatWithTools(options: UseAgentChatWithToolsOptions) {
  const { enableRAG, ragConfig } = options;

  // Add RAG mode to ModeClassifier
  const agentMode = classifyCurrentMode(content, rawMessages, {
    enableRAG,
    ragConfig,
  });

  // Integrate RAG chat
  const ragChat = useMemo(() => {
    if (!enableRAG || !ragConfig) return null;
    return getRAGChat(ragConfig);
  }, [enableRAG, ragConfig]);

  // Merge RAG results into messages
  const sendMessage = useCallback(async (content: string) => {
    let finalContent = content;
    
    if (ragChat) {
      // Get RAG results
      const ragMessage = await ragChat.chat(content);
      
      // Add citations to tool calls for display
      if (ragMessage.citations) {
        addToolCall(messageId, {
          type: 'citation',
          name: 'rag_search',
          citations: ragMessage.citations,
        });
      }
      
      finalContent = ragMessage.content;
    }
    
    // Send with context
    rawSendMessage(finalContent);
  }, [ragChat, addToolCall, rawSendMessage]);
}
```

**Add RAG Tools to Catalog**:
```typescript
// In tool-catalog.ts
{
  definition: ragSearchDef,
  metadata: createToolMetadata('rag_search', 'search', 
    ['knowledge'], // Only knowledge mode
    {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'server',
      serverExposed: true,
    }),
}

const ragSearchDef = {
  description: 'Search knowledge base using RAG',
  input: z.object({
    query: z.string(),
    maxChunks: z.number().default(5),
    mode: z.enum(['keyword', 'semantic', 'hybrid']).default('hybrid'),
  }),
  output: z.object({
    chunks: z.array(z.object({
      id: z.string(),
      sourceId: z.string(),
      title: z.string().optional(),
      content: z.string(),
      score: z.number(),
    })),
    citations: z.array(z.object({
      id: z.number(),
      sourceId: z.string(),
      passage: z.string(),
      position: z.number().optional(),
    })),
  }),
};
```

### Priority 2: Thread-Aware Multi-Agent (HIGH)

**File**: `src/lib/agent/hooks/use-multi-agent-chat.ts`

```typescript
// Add to UseMultiAgentChatOptions
interface UseMultiAgentChatOptions {
  config?: MultiAgentConfig;
  conversationId?: string | undefined;
  threadId?: string | undefined; // NEW: Target thread
  messages?: Array<{ role: string; content: string }>;
  onResults?: (results: MultiAgentResults) => void;
}

// Modify debate agent to create thread
const startDebate = useCallback(async (topic?: string, targetThreadId?: string) => {
  const threadId = targetThreadId || createNewThread(conversationId);
  
  const debateResults = await debateTopicWithContext(
    debateTopic,
    undefined, // domain
    conversationHistory,
    {
      threadId, // NEW: Pass to debate agent
    },
  );
  
  // Store results in thread
  addMessage(threadId, {
    role: 'system',
    content: `Debate completed: ${debateResults.synthesis}`,
  });
  
  onResults?.({ debate: debateResults });
}, [messages, config, conversationId]);

// Similarly for routing and expansion
```

**Add Multi-Agent Modes to ModeClassifier**:
```typescript
// Extend AgentMode
type AgentMode = 'coding' | 'knowledge' | 'orchestrator' | 'debate' | 'routing' | 'expansion'

// Add to system-prompt.ts
const MODE_DEBATE_PROMPT = `
# Debate Mode

You are moderating a multi-agent debate.
- Three personas will discuss the topic
- Your role is to synthesize the discussion
- Provide balanced perspectives
- Avoid taking sides
`;

const MODE_ROUTING_PROMPT = `
# Routing Mode

You are classifying the user's request to determine intent.
- Map to: coding, knowledge, orchestrator, or none
- Provide reasoning for your classification
`;

const MODE_EXPANSION_PROMPT = `
# Expansion Mode

You are generating follow-up questions to deepen understanding.
- Ask clarifying questions based on last response
- Prioritize open-ended questions
- Avoid yes/no questions
`;
```

### Priority 3: Unified Tool Resolution (MEDIUM)

**File**: `src/infrastructure/tools/tool-catalog.ts`

```typescript
// Replace separate read_file/read_note with single unified tool
const unifiedReadDef = {
  description: 'Read content from file or note based on context',
  input: z.object({
    path: z.string(),
    targetType: z.enum(['file', 'note']).default('file'),
    workspace: z.enum(['ide', 'knowledge', 'notes']).default('ide'),
  }),
  output: z.union([
    // File output
    z.object({
      type: z.literal('file'),
      path: z.string(),
      content: z.string(),
      encoding: z.enum(['utf-8', 'base64']),
    }),
    // Note output
    z.object({
      type: z.literal('note'),
      noteId: z.string(),
      title: z.string(),
      content: z.string(),
      parentId: z.string().optional(),
    }),
  ]),
};

// In tool implementation
const unifiedReadTool = {
  execute: async ({ path, targetType, workspace }) => {
    if (targetType === 'note' && workspace === 'knowledge') {
      // Use note store
      return noteStore.get(noteId);
    } else {
      // Use file adapter
      return fileAdapter.read(path);
    }
  },
};
```

### Priority 4: Mode Per Thread (MEDIUM)

**File**: `src/infrastructure/persistence/stores/chat/unified-chat-types.ts`

```typescript
// Add to ThreadWithId
export interface ThreadWithId extends ChatThread {
  id: string;
  conversationId: string;
  isRoot?: boolean;
  mode?: AgentMode; // NEW: Thread-scoped mode
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  status: 'active' | 'archived' | 'deleted';
  preview?: string;
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
}

// Add to CombinedUnifiedChatState
export interface CombinedUnifiedChatState {
  // ... existing
  setThreadMode: (threadId: string, mode: AgentMode) => void; // NEW
  getThreadMode: (threadId: string) => AgentMode | undefined; // NEW
}
```

**Mode Resolution Logic**:
```typescript
// In useAgentChatWithTools hook
const threadMode = getThreadMode(activeThreadId);
const effectiveMode = threadMode || classifyCurrentMode(content, rawMessages);

// Use thread mode for all messages in thread
promptComposer.updateConfig({ agentMode: toComposerFormat({
  id: effectiveMode,
  name: MODE_CONFIGS[effectiveMode].name,
  // ...
})});
```

---

## FILE STRUCTURE MAP

### Chat & Agent Files
```
src/
├── infrastructure/persistence/stores/chat/
│   ├── unified-chat-store.ts (448 lines) ✅ WORKING
│   ├── unified-chat-types.ts (216 lines) ✅
│   ├── slices/
│   │   ├── chat-metadata-slice.ts
│   │   ├── thread-management-slice.ts
│   │   ├── message-crud-slice.ts
│   │   ├── tool-execution-slice.ts
│   │   └── context-window-slice/
│   └── chat-settings-store.ts
├── lib/agent/
│   ├── hooks/
│   │   ├── use-agent-chat-with-tools.ts (725 lines) ✅ WORKING
│   │   └── use-multi-agent-chat.ts (435 lines) ⚠️ DISCONNECTED
│   ├── mode-classifier.ts (489 lines) ✅ WORKING
│   ├── system-prompt.ts (441 lines) ✅ WORKING
│   ├── tool-permission/
│   │   ├── tool-permission-manager.ts ✅ WORKING
│   │   └── types.ts
│   ├── tools/
│   │   ├── [Individual tool implementations] ✅
│   └── factory.ts (Creates client tools)
└── workflow/agents/
    ├── debate-agent.ts
    ├── content-routing-agent.ts
    └── sequential-expansion-agent.ts
```

### Tools Files
```
src/infrastructure/tools/
├── centralized-tool-registry.ts (167 lines) ✅ WORKING
└── tool-catalog.ts (367 lines) ✅ COMPLETE

src/lib/agent/tools/
├── unified/ (read, write, delete, list) ✅
├── [Composite tools] (research, storyboard, analyze, plan) ✅
└── [Individual tools] (17 files) ✅
```

### RAG Files
```
src/lib/rag/
├── rag-chat.ts (256 lines) ⚠️ NOT INTEGRATED
├── types.ts (292 lines) ✅
├── embedding-service.ts ✅
├── indexeddb-storage.ts ✅
└── [Search & Chunking slices] ✅

src/infrastructure/persistence/stores/rag/
├── rag-store.ts ✅
├── rag-chat-slice.ts ✅
├── rag-search-slice.ts ✅
├── rag-chunking-slice.ts ✅
├── rag-index-slice.ts ✅
└── rag-voice-slice.ts ✅
```

---

## SUMMARY

### What's Working ✅
1. **Unified Chat Store** - Hierarchical threads with Dexie persistence
2. **Tool Registry** - 27 tools with filtering and permissions
3. **Mode Classifier** - Weighted multi-signal mode selection
4. **System Prompt Architecture** - 2-layer prompts per mode
5. **Permission Manager** - Yolo mode with Dexie persistence
6. **RAG Infrastructure** - Complete with hybrid retrieval

### What's Missing ❌
1. **RAG Integration** - Service exists but not called from main chat
2. **Multi-Agent Connection** - Modes exist but don't use unified store
3. **Thread-Aware Modes** - Mode is per-message, not per-thread
4. **Unified Tool Routing** - Can't distinguish file vs note operations
5. **Cross-Workspace Threads** - No sharing between workspaces
6. **Cascade Coordination** - No state machine for multi-agent workflows

### Recommendations

**Immediate (Week 1)**:
1. Integrate RAG chat into `useAgentChatWithTools`
2. Connect multi-agent modes to unified chat store
3. Add RAG search tool to catalog
4. Create thread creation in multi-agent workflows

**Short-term (Week 2-3)**:
1. Implement mode per thread (override classification)
2. Create unified tool implementation with workspace routing
3. Add multi-agent state machine for cascade workflows
4. Implement cross-workspace thread references

**Long-term (Month 2-3)**:
1. Refactor to single chat interface (merge RAG and main chat)
2. Implement thread branching/merging UI
3. Add tool usage analytics
4. Create workspace-scoped tool registries

---

## END OF ANALYSIS

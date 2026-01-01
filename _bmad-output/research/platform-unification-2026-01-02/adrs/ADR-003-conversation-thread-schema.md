# ADR-003: Conversation Thread Schema

**Status**: PROPOSED
**Date**: 2026-01-02
**Context**: Cornerstone 3 Analysis (Iteration 3)
**Related**: ADR-002 (Agent Vault Architecture)

---

## Context

The current Conversation Management system is **fragmented** with **TWO SEPARATE STORES**:

```typescript
// Store 1: Conversation metadata
src/lib/state/conversation-store.ts (626 lines) - GOD STORE

// Store 2: Thread messages
src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts (726 lines) - GOD STORE

// Total: 1,352 lines of god store code
```

### Problems Identified

1. **Two Separate Stores**:
   - Components must import BOTH stores
   - Unclear which store to use for what operation
   - Potential data inconsistencies
   - Complex synchronization issues

2. **No Slice Pattern**:
   - conversation-store.ts: 20+ methods in single file
   - conversation-threads-store.ts: 30+ methods in single file
   - Both exceed 300-line limit (2.1x and 2.4x respectively)

3. **Health Score**: 3/10 ❌ (Critical technical debt)

---

## Decision

Implement a **Unified Conversation Store with Slice Pattern** following December 2025 Zustand best practices.

### Target Architecture

```
src/infrastructure/persistence/stores/conversations/
├── conversation-store.ts (125 lines) - Single bounded store
└── slices/
    ├── conversation-crud-slice.ts (~150 lines)
    ├── thread-management-slice.ts (~140 lines)
    ├── message-slice.ts (~130 lines)
    ├── context-window-slice.ts (~120 lines)
    └── conversation-utils-slice.ts (~90 lines)
```

**Total Lines**: ~630 lines across 6 focused slices (vs. 1,352 lines in two god stores)

**Reduction**: 1,352 → 630 lines (53% reduction)

---

## Proposed Schema

### Core Entities

```typescript
/**
 * Conversation: Top-level container for chat interactions
 * One conversation per workspace session
 */
interface Conversation {
  id: string;
  workspaceType: 'ide' | 'knowledge' | 'notes' | 'study';
  projectId?: string; // Optional project scoping
  agentId: string; // Which agent is handling this conversation
  status: 'active' | 'archived' | 'deleted';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  metadata: {
    title?: string; // Auto-generated from first message
    tags: string[];
    folderId?: string; // For organization
  };
}

/**
 * Thread: Hierarchical conversation threads
 * Supports branching conversations
 */
interface Thread {
  id: string;
  conversationId: string; // Foreign key to Conversation
  parentThreadId?: string; // For thread hierarchy
  root: boolean; // Is this a top-level thread?
  messages: Message[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Message: Individual message in a thread
 * Supports multimodal content
 */
interface Message {
  id: string;
  threadId: string; // Foreign key to Thread
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: MessageContent[]; // Multimodal support
  toolCalls?: ToolCall[]; // For tool execution
  timestamp: string;
  metadata: {
    tokens?: number; // Token count for context window
    model?: string; // Which model generated this
    cached?: boolean; // For performance optimization
  };
}

/**
 * MessageContent: Multimodal content blocks
 */
type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; mimeType?: string }
  | { type: 'audio'; url: string; transcription?: string }
  | { type: 'file'; url: string; filename: string; mimeType: string }
  | { type: 'code'; code: string; language: string };

/**
 * ToolCall: Agent tool execution
 */
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'success' | 'error';
  error?: string;
}
```

---

## Slice Breakdown

### 1. Conversation CRUD Slice (~150 lines)

**Responsibility**: Conversation lifecycle management

```typescript
interface ConversationCrudState {
  conversations: Record<string, Conversation>;

  // CRUD operations
  createConversation: (workspaceType: WorkspaceType, agentId: string, projectId?: string) => Conversation;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  archiveConversation: (id: string) => void;

  // Queries
  getConversation: (id: string) => Conversation | undefined;
  getConversationsByWorkspace: (workspaceType: WorkspaceType) => Conversation[];
  getConversationsByProject: (projectId: string) => Conversation[];
  getActiveConversation: (workspaceType: WorkspaceType) => Conversation | undefined;

  // Organization
  setConversationFolder: (conversationId: string, folderId: string) => void;
  addConversationTag: (conversationId: string, tag: string) => void;
}
```

**Key Features**:
- Workspace-scoped conversations
- Project-scoped conversations (optional)
- Folder organization (for grouping)
- Tag-based filtering

---

### 2. Thread Management Slice (~140 lines)

**Responsibility**: Thread hierarchy and branching

```typescript
interface ThreadManagementState {
  threads: Record<string, Thread>;

  // Thread operations
  createThread: (conversationId: string, parentThreadId?: string) => Thread;
  deleteThread: (id: string) => void;
  archiveThread: (id: string) => void;

  // Thread hierarchy
  buildThreadHierarchy: (conversationId: string) => ThreadHierarchyNode[];
  getThreadTree: (conversationId: string) => ThreadTree;
  getRootThreads: (conversationId: string) => Thread[];

  // Thread navigation
  setActiveThread: (threadId: string) => void;
  getActiveThread: () => Thread | undefined;

  // Branching support
  forkThread: (threadId: string, messageId: string) => Thread;
  mergeThread: (sourceThreadId: string, targetThreadId: string) => void;
}
```

**Key Features**:
- Hierarchical thread structure (parent-child relationships)
- Thread forking (branch conversation from any message)
- Thread merging (combine branches back)
- Thread tree visualization

---

### 3. Message Slice (~130 lines)

**Responsibility**: Message CRUD and streaming

```typescript
interface MessageState {
  // Messages stored within threads, but indexed for queries
  messagesByThread: Record<string, Message[]>;

  // Message operations
  addMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;

  // Streaming support
  appendToMessage: (messageId: string, content: string) => void; // For streaming responses
  setMessageStreaming: (messageId: string, streaming: boolean) => void;

  // Queries
  getMessages: (threadId: string) => Message[];
  getMessage: (messageId: string) => Message | undefined;
  getMessagesByRole: (threadId: string, role: MessageRole) => Message[];

  // Batch operations
  deleteMessages: (messageIds: string[]) => void;
  moveMessages: (messageIds: string[], targetThreadId: string) => void;
}
```

**Key Features**:
- Real-time streaming support (for AI responses)
- Multimodal content (text, images, audio, files, code)
- Message moving (between threads)
- Batch operations

---

### 4. Context Window Slice (~120 lines)

**Responsibility**: Token counting and context management

```typescript
interface ContextWindowState {
  contextWindows: Record<string, ContextWindowConfig>;

  // Context window management
  getContextWindow: (threadId: string) => ContextWindowConfig;
  setContextWindow: (threadId: string, config: ContextWindowConfig) => void;

  // Token counting
  countTokens: (threadId: string) => Promise<number>;
  countMessageTokens: (message: Message) => number;

  // Context trimming
  trimContext: (threadId: string, maxTokens: number) => Promise<Message[]>;
  getContextSummary: (threadId: string) => Promise<string>;

  // Model-specific limits
  getModelTokenLimit: (modelId: string) => number;
  estimateCost: (threadId: string) => number;
}
```

**Key Features**:
- Per-thread token tracking
- Model-specific token limits
- Context trimming (for long conversations)
- Cost estimation

---

### 5. Conversation Utils Slice (~90 lines)

**Responsibility**: Helper functions and queries

```typescript
interface ConversationUtilsState {
  // Search and filter
  searchConversations: (query: string) => Conversation[];
  filterByTag: (tag: string) => Conversation[];
  filterByDateRange: (start: Date, end: Date) => Conversation[];

  // Statistics
  getConversationStats: (conversationId: string) => ConversationStats;
  getWorkspaceStats: (workspaceType: WorkspaceType) => WorkspaceStats;

  // Export/import
  exportConversation: (conversationId: string, format: 'json' | 'markdown') => string;
  importConversation: (data: string, format: 'json' | 'markdown') => Conversation;

  // Cleanup
  deleteOldConversations: (olderThan: Date) => void;
  clearArchivedConversations: () => void;
}
```

**Key Features**:
- Full-text search
- Tag-based filtering
- Statistics and analytics
- Export/import functionality
- Cleanup utilities

---

## Persistence Strategy

### Dexie Schema

```typescript
// dexie-db-conversations.ts
export class ConversationsDB extends Dexie {
  conversations!: Table<Conversation, string>;
  threads!: Table<Thread, string>;
  messages!: Table<Message, string>;

  constructor() {
    super('via-gent-conversations');

    this.version(1).stores({
      conversations: 'id, workspaceType, projectId, agentId, status, createdAt, folderId',
      threads: 'id, conversationId, parentThreadId, root, status, createdAt',
      messages: 'id, threadId, role, timestamp',
    });
  }
}
```

### Zustand Persistence

```typescript
persist(
  (set, get) => ({ ...slices }),
  {
    name: 'conversation-state',
    storage: createDexieStorage('conversationState'),
    partialize: (state) => ({
      conversations: state.conversations,
      threads: state.threads,
      activeConversationIds: state.activeConversationIds,
      // Don't persist: temporary streaming states
    }),
    onRehydrateStorage: () => (state) => {
      console.log('[ConversationStore] Rehydrated from IndexedDB');
      // Load active conversations per workspace
      state?.loadActiveConversations();
    },
  }
)
```

---

## Migration Path

### Phase 1: Create New Store (Non-Breaking)

1. Create new unified store at `src/infrastructure/persistence/stores/conversations/`
2. Implement all 5 slices
3. Add comprehensive tests
4. **Do not delete old stores yet**

### Phase 2: Component Migration

1. **Start with low-risk components**:
   - Migration order: Study → Notes → Knowledge → IDE

2. **Update imports**:
   ```typescript
   // Before
   import { useConversationStore } from '@/lib/state/conversation-store';
   import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

   // After
   import { useConversationStore } from '@/infrastructure/persistence/stores/conversations/conversation-store';
   ```

3. **Update selectors**:
   ```typescript
   // Before (two stores)
   const conversations = useConversationStore(s => s.conversations)
   const threads = useThreadsStore(s => s.threads)

   // After (unified)
   const conversations = useConversationStore(s => s.conversations)
   const threads = useConversationStore(s => s.threads)
   ```

### Phase 3: Data Migration

1. Create migration script:
   ```typescript
   // scripts/migrate-conversations.ts
   export async function migrateConversations() {
     // Read from old stores
     const oldConversations = await dbOld.conversations.toArray();
     const oldThreads = await dbOld.threads.toArray();

     // Transform to new schema
     const newConversations = transformConversations(oldConversations);
     const newThreads = transformThreads(oldThreads);

     // Write to new store
     await dbNew.conversations.bulkAdd(newConversations);
     await dbNew.threads.bulkAdd(newThreads);
   }
   ```

2. Run migration on app startup (one-time)
3. Verify data integrity

### Phase 4: Cleanup

1. Run full test suite
2. Verify `pnpm dev` works
3. Verify all 4 workspaces functional
4. **Then** delete old stores
5. Remove deprecated imports

---

## Component Updates

### Example: AgentChatPanel Migration

**Before** (Two Stores):
```typescript
import { useConversationStore } from './conversation/conversation-store';
import { useThreadsStore } from './conversation/conversation-threads-store';

const AgentChatPanel = () => {
  // Store 1: Conversation metadata
  const activeConversationId = useConversationStore(s => s.activeConversationId);
  const conversations = useConversationStore(s => s.conversations);

  // Store 2: Thread messages
  const threads = useThreadsStore(s => s.threads);
  const activeThreadId = useThreadsStore(s => s.activeThreadId);

  // PROBLEM: Which store to use? When? Why?
};
```

**After** (Unified Store):
```typescript
import { useConversationStore } from '@/infrastructure/persistence/stores/conversations/conversation-store';

const AgentChatPanel = () => {
  // Single store, clear separation
  const activeConversation = useConversationStore(s => s.getActiveConversation('ide'));
  const activeThread = useConversationStore(s => s.getActiveThread());
  const conversations = useConversationStore(s => s.conversations);
  const threads = useConversationStore(s => s.threads);

  // Clear responsibility separation
};
```

---

## Benefits

### 1. Single Source of Truth ✅

**Before**: Two separate stores, potential data inconsistencies
**After**: One unified store, data integrity guaranteed

### 2. Clear Separation of Concerns ✅

**Before**: 50+ methods scattered across 2 files
**After**: 5 focused slices, each with clear responsibility

### 3. Easier Testing ✅

**Before**: Must mock two stores
**After**: Test slices in isolation

### 4. Better Performance ✅

**Before**: Multiple store subscriptions
**After**: Single store, individual selectors (fewer re-renders)

### 5. Improved Maintainability ✅

**Before**: 1,352 lines across 2 god stores
**After**: 630 lines across 6 focused files

---

## Consequences

### Positive

- **Maintainability**: 53% code reduction
- **Testability**: Focused slices, easy to mock
- **Performance**: Single store, fewer re-renders
- **Type Safety**: Strongly typed schema throughout
- **Data Integrity**: Single source of truth

### Neutral

- **Migration Effort**: 70-90 hours estimated
- **Learning Curve**: Team must learn new structure

### Negative

- **Breaking Change**: Requires component updates (mitigated by phased migration)

---

## Estimated Effort

| Phase | Effort | Description |
|-------|--------|-------------|
| Phase 1: Create Store | 20-25 hours | Implement 5 slices + tests |
| Phase 2: Component Migration | 30-35 hours | Update 25+ components |
| Phase 3: Data Migration | 8-10 hours | Migration script + verification |
| Phase 4: Cleanup | 12-15 hours | Delete old stores + validation |
| **Total** | **70-90 hours** | **Full refactoring** |

---

## Compliance with December 2025 Best Practices

| Practice | Target Status |
|----------|---------------|
| Single Bounded Store | ✅ Unified conversation store |
| Slice Pattern | ✅ 5 focused slices (all <150 lines) |
| Individual Selectors | ✅ Components use `s => s.property` |
| Dexie Persistence | ✅ IndexedDB with schema versioning |
| Domain Services | ✅ ContextWindow utilities separated |
| Zero Circular Deps | ✅ Clean data flow (no cross-store deps) |

---

## Alternatives Considered

### Alternative 1: Keep Two Stores (REJECTED)

**Rationale**: Too complex, data inconsistency risks
**Status**: Current approach is problematic

### Alternative 2: Three Stores (REJECTED)

**Rationale**: Even more complex, no benefit

### Alternative 3: Single Store Without Slices (REJECTED)

**Rationale**: Would create god store >1,000 lines

---

## References

- [Cornerstone 3 Analysis](_bmad-output/research/platform-unification-2026-01-02/cornerstone-3-conversation-analysis.md)
- [December 2025 Zustand Patterns](_bmad-output/zustand-patterns-guide-2026-01-01.md)
- [ADR-002: Agent Vault Architecture](adrs/ADR-002-agent-vault-architecture.md)

---

## Status

**PROPOSED** - Pending Implementation

**Priority**: HIGHEST (Health Score 3/10 - Critical Technical Debt)

**Next**: Execute phased migration (70-90 hours)

---

**END OF ADR-003**

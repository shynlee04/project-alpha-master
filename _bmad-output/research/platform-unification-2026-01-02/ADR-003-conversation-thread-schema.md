---
title: ADR-003: Conversation Thread Schema
status: Accepted ⏳ PENDING IMPLEMENTATION (Phase 3)
date: 2026-01-02
iteration: 8
cornerstone: 3
priority: P0 (CRITICAL - System Stability)
---

# ADR-003: Conversation Thread Schema

**Status:** ✅ **ACCEPTED** - ⏳ **PENDING IMPLEMENTATION** (Phase 3, Iterations 31-150)
**Date:** 2026-01-02
**Iteration:** 8
**Cornerstone:** 3 - Conversation System
**Priority:** P0 (CRITICAL - System Stability)
**Estimated Effort:** 20-30 hours
**Risk Level:** HIGH (potential for data loss if migration fails)
**Target Phase**: Phase 3 - Cornerstone Implementation (Iterations 31-150)

---

## Context

### Current State (CRITICAL FRAGMENTATION - 25% Health)

**Catastrophic Issues:**
- ❌ 5 separate conversation store locations
- ❌ 2 god stores (>600 lines each)
- ❌ 1,800+ total lines of duplicated code
- ❌ No single source of truth for conversations
- ❌ Potential data corruption if stores diverge

**Evidence:**
```
Store Locations:

1. conversation-threads-store.ts (726 lines - GOD STORE)
   Location: src/infrastructure/persistence/stores/conversation/
   Purpose: Thread management + messages combined
   Issues: Monolithic, mixes concerns

2. conversation-store.ts (626 lines - GOD STORE)
   Location: src/lib/state/
   Purpose: Legacy conversation state
   Issues: Duplicates functionality from #1

3. conversation-store.ts (21 lines - STUB)
   Location: src/infrastructure/persistence/stores/conversation/
   Purpose: Thin wrapper (forwards to other store)
   Issues: Confusing, adds indirection

4. threads-store.ts (142 lines)
   Location: src/lib/workspace/
   Purpose: Dexie-backed thread storage
   Issues: Partial overlap with #1

5. conversation-helpers.ts (126 lines)
   Location: src/infrastructure/persistence/stores/conversation/
   Purpose: Sync Zustand ↔ Dexie
   Issues: Should be integrated into store
```

**Type Fragmentation:**
```typescript
// 3 separate type definitions:

// 1. conversation-threads-store.ts
interface Thread {
  id: string;
  projectId: string;
  title: string;
  messages: ThreadMessage[];
  createdAt: number;
  updatedAt: number;
}

// 2. conversation-store.ts (lib/state/)
interface ConversationState {
  conversations: Record<string, UserConversation>;
  activeConversationId: string | null;
}

// 3. conversation-types.ts
interface ConversationMetadata {
  id: string;
  projectId: string | null;
  workspaceType: WorkspaceType;
  title: string;
  preview: string;
  // ... different fields!
}
```

### Current Architecture (BROKEN)

```
┌─────────────────────────────────────────────┐
│ CONVERSATION-THREADS-STORE.TS (726 lines)  │
│                                             │
│ - Thread CRUD (create, update, delete)      │
│ - Message CRUD (add, update, delete)        │
│ - Active thread management                  │
│ - Project filtering                         │
│ - Dexie persistence                         │
│                                             │
│ ❌ GOD STORE: Too many responsibilities   │
└─────────────────────────────────────────────┘
           │
           ▼ (duplicates)
┌─────────────────────────────────────────────┐
│ CONVERSATION-STORE.TS (626 lines)          │
│                                             │
│ - Conversation CRUD                         │
│ - Message CRUD                              │
│ - Active conversation management            │
│                                             │
│ ❌ GOD STORE: Duplicates #1               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ THREADS-STORE.TS (142 lines)               │
│                                             │
│ - Dexie operations                          │
│ - Thread CRUD                               │
│                                             │
│ ⚠️ PARTIAL OVERLAP with #1                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ CONVERSATION-HELPERS.TS (126 lines)        │
│                                             │
│ - Debounced persistence                     │
│ - Zustand ↔ Dexie sync                      │
│                                             │
│ ⚠️ SHOULD BE IN STORE, NOT HELPER         │
└─────────────────────────────────────────────┘
```

**Impact Analysis:**
- **Catastrophic:** No single source of truth for conversations
- **High Risk:** Data corruption if stores diverge
- **Maintenance:** Impossible to maintain (5 locations to update)
- **Performance:** Duplicate state management overhead
- **UX:** Potential for lost messages, inconsistent state

**Gap Analysis:** From `cornerstone-3-conversation-analysis.md`
- Conversation health score: **25%** (CRITICAL)
- God stores: 2 ❌ (726 & 626 lines)
- Store locations: 5 fragmented ❌
- Type definitions: 3 files ❌
- **CRITICAL:** No single source of truth ❌

---

## Decision

**Consolidate 5 fragmented conversation stores into 1 unified store with 4 focused slices.**

### Target State (UNIFIED)

```typescript
// src/infrastructure/persistence/stores/conversation/unified-conversation-store.ts

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get, api) => ({
      // 4 Focused Slices (December 2025 Zustand Pattern)
      ...createConversationThreadSlice(set, get, api),      // ~150 lines
      ...createConversationMessageSlice(set, get, api),     // ~150 lines
      ...createConversationActiveSlice(set, get, api),      // ~100 lines
      ...createConversationUtilsSlice(set, get, api),       // ~100 lines
    }),
    {
      name: 'conversation-state',
      storage: createDexieStorage('conversationState'),
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);
```

### Target Architecture (CLEAN)

```
┌─────────────────────────────────────────────┐
│ UNIFIED CONVERSATION STORE                  │
│                                             │
│ 4 Focused Slices (~500 lines total)        │
│                                             │
│ 1. Thread Slice (~150 lines)               │
│    - createThread(projectId, workspaceType) │
│    - updateThread(id, data)                 │
│    - deleteThread(id)                       │
│    - getThreadsForProject(projectId)        │
│                                             │
│ 2. Message Slice (~150 lines)               │
│    - addMessage(threadId, message)          │
│    - updateMessage(threadId, msgId, data)   │
│    - deleteMessage(threadId, msgId)         │
│    - getMessagesForThread(threadId)         │
│                                             │
│ 3. Active Slice (~100 lines)                │
│    - setActiveThread(id)                    │
│    - clearActiveThread()                    │
│    - getActiveThread()                      │
│                                             │
│ 4. Utils Slice (~100 lines)                 │
│    - getThreadById(id)                      │
│    - searchThreads(query)                   │
│    - exportThread(id)                       │
│    - importThread(data)                     │
└─────────────────────────────────────────────┘
           │
           ▼ (persistence)
┌─────────────────────────────────────────────┐
│ DEXIE DATABASE (IndexedDB)                  │
│                                             │
│ Table: threads                              │
│   - id (primaryKey)                         │
│   - projectId                                │
│   - workspaceType                            │
│   - title                                    │
│   - createdAt                                │
│   - updatedAt                                │
│                                             │
│ Table: messages                              │
│   - id (primaryKey)                         │
│   - threadId (foreignKey → threads.id)      │
│   - role ('user' | 'assistant' | 'system')   │
│   - content                                  │
│   - timestamp                                │
│   - agentId (agent attribution)             │
└─────────────────────────────────────────────┘
```

**Unified Type Definitions:**

```typescript
// src/infrastructure/persistence/stores/conversation/conversation-types.ts

export interface Thread {
  id: string;
  projectId: string;
  workspaceType: WorkspaceType;
  title: string;
  preview: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentId?: string;
  agentName?: string;
  agentModel?: string;
  toolCalls?: ToolCall[];
}

export interface ConversationState {
  // Threads
  threads: Record<string, Thread>;

  // Messages (nested in threads for performance)
  messages: Record<string, Message[]>;

  // Active thread
  activeThreadId: string | null;

  // Actions (from 4 slices)
  createThread: (projectId: string, workspaceType: WorkspaceType) => Thread;
  updateThread: (id: string, data: Partial<Thread>) => void;
  deleteThread: (id: string) => void;
  addMessage: (threadId: string, message: Omit<Message, 'id' | 'threadId' | 'timestamp'>) => void;
  setActiveThread: (id: string | null) => void;
  // ... more actions
}
```

---

## Consequences

### Benefits

1. **Single Source of Truth** ✅
   - 1 unified store instead of 5 fragmented stores
   - No data synchronization issues
   - Clear ownership of conversation data

2. **Maintainability** ✅
   - 500 lines total (down from 1,800+ lines)
   - 4 focused slices (<150 lines each)
   - Easy to understand and modify

3. **Type Safety** ✅
   - Unified type definitions
   - No type mismatches between stores
   - Clear interfaces

4. **Performance** ✅
   - No duplicate state management
   - Efficient Dexie persistence
   - Reduced memory footprint

5. **Data Integrity** ✅
   - Zero risk of stores diverging
   - Atomic transactions for writes
   - Referential integrity (threadId foreign key)

6. **December 2025 Zustand Patterns** ✅
   - Slice pattern (focused responsibilities)
   - Dexie persistence
   - Individual selectors (no destructuring)

### Drawbacks

1. **High Migration Risk** ⚠️
   - Potential for data loss if migration fails
   - Complex migration script required
   - Extensive testing needed

2. **Breaking Changes** ⚠️
   - All components using conversation stores need updates
   - Potential for temporary UX disruption
   - Rollback complexity

3. **Development Effort** ⚠️
   - 20-30 hours estimated
   - Blocks other features during migration
   - Requires coordination across team

### Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **Data loss during migration** | Medium | **Catastrophic** | - **Backup before migration**<br>- **Use transactions (all-or-nothing)**<br>- **Verify record counts**<br>- **Provide rollback mechanism**<br>- **Test with seed data first** |
| **Conversation store corruption** | Low | **Catastrophic** | - **Add schema validation**<br>- **Implement checksums**<br>- **Regular integrity checks**<br>- **Automated rollback on corruption** |
| **Message ordering broken** | Low | High | - **Sort by timestamp always**<br>- **Add index on (threadId, timestamp)**<br>- **Test with 100+ message threads** |
| **Performance degradation** | Low | Medium | - **Benchmark before/after**<br>- **Optimize queries**<br>- **Add pagination for large threads** |
| **Component re-renders increase** | Medium | Medium | - **Use individual selectors**<br>- **Memoize expensive computations**<br>- **Virtual scrolling for long message lists** |

---

## Implementation Plan

### Phase 1: Create Unified Store (4-6 hours)

**Step 1.1:** Create slice files
```typescript
// src/infrastructure/persistence/stores/conversation/slices/conversation-thread-slice.ts

import { State } from '../unified-conversation-store';

export interface ThreadSlice {
  threads: Record<string, Thread>;

  // Actions
  createThread: (projectId: string, workspaceType: WorkspaceType) => Thread;
  updateThread: (id: string, data: Partial<Thread>) => void;
  deleteThread: (id: string) => void;
  getThreadsForProject: (projectId: string) => Thread[];
}

export const createThreadSlice: SliceCreator<ThreadSlice> = (set, get, api) => ({
  threads: {},

  createThread: (projectId, workspaceType) => {
    const id = generateId();
    const thread: Thread = {
      id,
      projectId,
      workspaceType,
      title: 'New Conversation',
      preview: '',
      messageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      threads: {
        ...state.threads,
        [id]: thread,
      },
    }));

    return thread;
  },

  updateThread: (id, data) => {
    set((state) => ({
      threads: {
        ...state.threads,
        [id]: {
          ...state.threads[id],
          ...data,
          updatedAt: Date.now(),
        },
      },
    }));
  },

  deleteThread: (id) => {
    set((state) => {
      const newThreads = { ...state.threads };
      delete newThreads[id];

      const newMessages = { ...state.messages };
      delete newMessages[id];

      return {
        threads: newThreads,
        messages: newMessages,
      };
    });
  },

  getThreadsForProject: (projectId) => {
    const threads = get().threads;
    return Object.values(threads)
      .filter(t => t.projectId === projectId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
```

**Step 1.2:** Create message slice
```typescript
// src/infrastructure/persistence/stores/conversation/slices/conversation-message-slice.ts

export interface MessageSlice {
  messages: Record<string, Message[]>;

  // Actions
  addMessage: (threadId: string, message: Omit<Message, 'id' | 'threadId' | 'timestamp'>) => void;
  updateMessage: (threadId: string, messageId: string, data: Partial<Message>) => void;
  deleteMessage: (threadId: string, messageId: string) => void;
  getMessagesForThread: (threadId: string) => Message[];
}

export const createMessageSlice: SliceCreator<MessageSlice> = (set, get) => ({
  messages: {},

  addMessage: (threadId, message) => {
    const id = generateId();
    const newMessage: Message = {
      ...message,
      id,
      threadId,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: [
          ...(state.messages[threadId] || []),
          newMessage,
        ],
      },
    }));

    // Update thread preview and count
    get().updateThread(threadId, {
      preview: message.content.substring(0, 100),
      messageCount: (get().threads[threadId]?.messageCount || 0) + 1,
    });
  },

  updateMessage: (threadId, messageId, data) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: (state.messages[threadId] || []).map(msg =>
          msg.id === messageId ? { ...msg, ...data } : msg
        ),
      },
    }));
  },

  deleteMessage: (threadId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: (state.messages[threadId] || []).filter(msg => msg.id !== messageId),
      },
    }));
  },

  getMessagesForThread: (threadId) => {
    const messages = get().messages[threadId] || [];
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});
```

**Step 1.3:** Create active thread slice
```typescript
// src/infrastructure/persistence/stores/conversation/slices/conversation-active-slice.ts

export interface ActiveSlice {
  activeThreadId: string | null;

  // Actions
  setActiveThread: (id: string | null) => void;
  clearActiveThread: () => void;
  getActiveThread: () => Thread | null;
}

export const createActiveSlice: SliceCreator<ActiveSlice> = (set, get) => ({
  activeThreadId: null,

  setActiveThread: (id) => {
    set({ activeThreadId: id });
  },

  clearActiveThread: () => {
    set({ activeThreadId: null });
  },

  getActiveThread: () => {
    const activeThreadId = get().activeThreadId;
    if (!activeThreadId) return null;
    return get().threads[activeThreadId] || null;
  },
});
```

**Step 1.4:** Create utils slice
```typescript
// src/infrastructure/persistence/stores/conversation/slices/conversation-utils-slice.ts

export interface UtilsSlice {
  // Actions
  getThreadById: (id: string) => Thread | null;
  searchThreads: (query: string) => Thread[];
  exportThread: (id: string) => ThreadExport;
  importThread: (data: ThreadExport) => Thread;
}

export const createUtilsSlice: SliceCreator<UtilsSlice> = (set, get) => ({
  getThreadById: (id) => {
    return get().threads[id] || null;
  },

  searchThreads: (query) => {
    const threads = Object.values(get().threads);
    const lowerQuery = query.toLowerCase();

    return threads.filter(t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.preview.toLowerCase().includes(lowerQuery)
    );
  },

  exportThread: (id) => {
    const thread = get().threads[id];
    const messages = get().messages[id] || [];

    return {
      thread,
      messages,
      exportedAt: Date.now(),
    };
  },

  importThread: (data) => {
    const { thread, messages } = data;

    // Import thread
    set((state) => ({
      threads: {
        ...state.threads,
        [thread.id]: thread,
      },
      messages: {
        ...state.messages,
        [thread.id]: messages,
      },
    }));

    return thread;
  },
});
```

**Step 1.5:** Combine slices into unified store
```typescript
// src/infrastructure/persistence/stores/conversation/unified-conversation-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDexieStorage } from '../dexie-storage';
import { createThreadSlice, ThreadSlice } from './slices/conversation-thread-slice';
import { createMessageSlice, MessageSlice } from './slices/conversation-message-slice';
import { createActiveSlice, ActiveSlice } from './slices/conversation-active-slice';
import { createUtilsSlice, UtilsSlice } from './slices/conversation-utils-slice';

export interface ConversationState extends ThreadSlice, MessageSlice, ActiveSlice, UtilsSlice {}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get, api) => ({
      ...createThreadSlice(set, get, api),
      ...createMessageSlice(set, get, api),
      ...createActiveSlice(set, get, api),
      ...createUtilsSlice(set, get, api),
    }),
    {
      name: 'conversation-state',
      storage: createDexieStorage('conversationState'),
      partialize: (state) => ({
        threads: state.threads,
        messages: state.messages,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);
```

### Phase 2: Migration Script (8-12 hours)

**Step 2.1:** Create migration script
```typescript
// src/lib/init/migrate-conversation-stores.ts

import { useThreadsStore } from '../stores/conversation-threads-store';
import { useConversationStore } from '../stores/conversation-store';
import { db } from '../dexie-db';

interface MigrationBackup {
  timestamp: number;
  threads: any[];
  conversations: any[];
}

export async function migrateConversationStores(): Promise<void> {
  console.log('[Migration] Starting conversation store migration...');

  try {
    // 1. Backup existing data
    const backup = await backupConversationData();
    console.log('[Migration] ✅ Backup created:', backup);

    // 2. Migrate from conversation-threads-store
    await migrateFromThreadsStore();
    console.log('[Migration] ✅ Migrated from threads store');

    // 3. Migrate from conversation-store (lib/state/)
    await migrateFromConversationStore();
    console.log('[Migration] ✅ Migrated from conversation store');

    // 4. Migrate from Dexie threads table
    await migrateFromDexieThreads();
    console.log('[Migration] ✅ Migrated from Dexie threads');

    // 5. Verify migration
    const verification = await verifyMigration();
    if (!verification.success) {
      throw new Error(`Migration verification failed: ${verification.errors.join(', ')}`);
    }
    console.log('[Migration] ✅ Verification passed');

    // 6. Save backup to localStorage for rollback
    localStorage.setItem('conversation-migration-backup', JSON.stringify(backup));

    console.log('[Migration] ✅ Migration complete');
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);
    throw error;
  }
}

async function backupConversationData(): Promise<MigrationBackup> {
  const threadsStore = useThreadsStore.getState();
  const conversationStore = useConversationStore.getState();

  return {
    timestamp: Date.now(),
    threads: Object.values(threadsStore.threads || {}),
    conversations: Object.values(conversationStore.conversations || {}),
  };
}

async function migrateFromThreadsStore(): Promise<void> {
  const threadsStore = useThreadsStore.getState();
  const conversationStore = useConversationStore.getState();

  const threads = Object.values(threadsStore.threads || {});

  for (const thread of threads) {
    // Create thread in unified store
    conversationStore.createThread(thread.projectId, 'ide' as any);
    conversationStore.updateThread(thread.id, {
      title: thread.title,
      preview: thread.preview || '',
      messageCount: thread.messages?.length || 0,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    });

    // Migrate messages
    if (thread.messages) {
      for (const msg of thread.messages) {
        conversationStore.addMessage(thread.id, {
          role: msg.role,
          content: msg.content,
          agentId: msg.agentId,
          agentName: msg.agentName,
          agentModel: msg.agentModel,
        });
      }
    }
  }
}

async function migrateFromConversationStore(): Promise<void> {
  // Similar migration for conversation-store (lib/state/)
  // ... implementation details
}

async function migrateFromDexieThreads(): Promise<void> {
  const threads = await db.threads.toArray();
  const conversationStore = useConversationStore.getState();

  for (const thread of threads) {
    // Check if already migrated
    if (conversationStore.threads[thread.id]) continue;

    conversationStore.createThread(thread.projectId, 'ide' as any);
    conversationStore.updateThread(thread.id, {
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    });
  }
}

async function verifyMigration(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Verify thread counts match
  const backup = JSON.parse(localStorage.getItem('conversation-migration-backup') || '{}');
  const unifiedStore = useConversationStore.getState();

  const originalThreadCount = backup.threads?.length || 0;
  const migratedThreadCount = Object.keys(unifiedStore.threads).length;

  if (originalThreadCount !== migratedThreadCount) {
    errors.push(`Thread count mismatch: ${originalThreadCount} original vs ${migratedThreadCount} migrated`);
  }

  // Verify message counts match
  let originalMessageCount = 0;
  for (const thread of backup.threads || []) {
    originalMessageCount += thread.messages?.length || 0;
  }

  let migratedMessageCount = 0;
  for (const messages of Object.values(unifiedStore.messages)) {
    migratedMessageCount += messages.length;
  }

  if (originalMessageCount !== migratedMessageCount) {
    errors.push(`Message count mismatch: ${originalMessageCount} original vs ${migratedMessageCount} migrated`);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
```

**Step 2.2:** Add migration to app initialization
```typescript
// src/main.tsx

import { migrateConversationStores } from './lib/init/migrate-conversation-stores';

async function initializeApp() {
  // Show migration screen
  showMigrationScreen();

  try {
    // Run migration
    await migrateConversationStores();

    // Hide migration screen, show app
    hideMigrationScreen();
  } catch (error) {
    console.error('[Init] Migration failed:', error);
    showMigrationError(error);
  }
}
```

### Phase 3: Update Components (6-8 hours)

**Step 3.1:** Update ChatPanel
```typescript
// src/presentation/components/chat/ChatPanel.tsx

// BEFORE
import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

// AFTER
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/unified-conversation-store';

export function ChatPanel({ projectId }: Props) {
  // Use individual selectors (Zustand v5 pattern)
  const threads = useConversationStore(s => s.threads);
  const activeThreadId = useConversationStore(s => s.activeThreadId);
  const activeThread = useConversationStore(s => s.getActiveThread());

  const createThread = useConversationStore(s => s.createThread);
  const setActiveThread = useConversationStore(s => s.setActiveThread);
  const updateThread = useConversationStore(s => s.updateThread);
  const deleteThread = useConversationStore(s => s.deleteThread);
  const addMessage = useConversationStore(s => s.addMessage);

  const getThreadsForProject = useConversationStore(s => s.getThreadsForProject);

  // Get threads for this project
  const projectThreads = useMemo(
    () => getThreadsForProject(projectId),
    [getThreadsForProject, projectId]
  );

  // ... rest of component
}
```

**Step 3.2:** Update AgentChatPanel
```typescript
// src/presentation/components/ide/AgentChatPanel.tsx

// BEFORE
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/conversation-store';
import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

// AFTER
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/unified-conversation-store';

export function AgentChatPanel({ projectId }: Props) {
  // Use unified store
  const conversations = useConversationStore(s => s.threads);
  const activeConversationId = useConversationStore(s => s.activeThreadId);

  const addMessage = useConversationStore(s => s.addMessage);
  const createThread = useConversationStore(s => s.createThread);
  const setActiveThread = useConversationStore(s => s.setActiveThread);

  // ... rest of component
}
```

**Step 3.3:** Update all other components
- [ ] Update ThreadsList.tsx
- [ ] Update ChatConversation.tsx
- [ ] Update ThreadManager.tsx
- [ ] Update KnowledgePage.tsx (if using conversations)
- [ ] Update NotesPage.tsx (if using conversations)
- [ ] Update StudyPage.tsx (if using conversations)

**Step 3.4:** Delete old stores
- [ ] Delete `conversation-threads-store.ts`
- [ ] Delete `conversation-store.ts` (lib/state/)
- [ ] Delete `threads-store.ts`
- [ ] Delete `conversation-helpers.ts`
- [ ] Update all imports

### Phase 4: Testing & Validation (2-4 hours)

**Test Coverage:**

1. **Migration Tests**
   - [ ] Test migration with existing threads
   - [ ] Test migration with no threads
   - [ ] Test migration with corrupted data
   - [ ] Verify zero data loss

2. **Component Tests**
   - [ ] Test ChatPanel with unified store
   - [ ] Test AgentChatPanel with unified store
   - [ ] Test thread creation
   - [ ] Test message addition
   - [ ] Test thread deletion

3. **Integration Tests**
   - [ ] Test cross-workspace conversations
   - [ ] Test agent attribution
   - [ ] Test tool call storage

4. **Performance Tests**
   - [ ] Benchmark thread loading (<100ms)
   - [ ] Benchmark message addition (<10ms)
   - [ ] Test with 100+ message threads
   - [ ] Test with 1000+ threads total

---

## Rollback Strategy

### If Migration Fails

**Step 1:** Restore from backup
```typescript
// src/lib/init/rollback-conversation-migration.ts

export async function rollbackConversationMigration(): Promise<void> {
  const backupJson = localStorage.getItem('conversation-migration-backup');
  if (!backupJson) {
    throw new Error('No backup found');
  }

  const backup: MigrationBackup = JSON.parse(backupJson);

  // Restore threads store
  const threadsStore = useThreadsStore.getState();
  threadsStore.setThreads(Object.fromEntries(
    backup.threads.map(t => [t.id, t])
  ));

  // Restore conversation store
  const conversationStore = useConversationStore.getState();
  conversationStore.setConversations(Object.fromEntries(
    backup.conversations.map(c => [c.id, c])
  ));

  console.log('[Rollback] ✅ Restored from backup');
}
```

**Step 2:** Revert component changes
- Git revert ChatPanel.tsx
- Git revert AgentChatPanel.tsx
- Git revert all other updated components

**Step 3:** Verify rollback
- [ ] Run `pnpm tsc --noEmit` (should pass)
- [ ] Run `pnpm test` (should pass)
- [ ] Manual test: Chat functionality works

### Zero-Downtime Migration

**Approach:** Perform migration during app initialization (before UI renders)

```typescript
// src/main.tsx

export async function initializeApp() {
  // 1. Show loading screen with progress
  showMigrationProgress({ status: 'starting', progress: 0 });

  try {
    // 2. Run migration (idempotent - safe to run multiple times)
    await migrateConversationStores();

    // 3. Verify migration
    const verification = await verifyMigration();
    if (!verification.success) {
      throw new Error(`Verification failed: ${verification.errors.join(', ')}`);
    }

    // 4. Hide loading screen, show app
    hideMigrationProgress();
  } catch (error) {
    console.error('[Init] Migration failed:', error);

    // 5. Show error message with retry option
    showMigrationError({
      error,
      onRetry: () => initializeApp(),
      onRollback: () => rollbackConversationMigration(),
    });
  }
}
```

---

## Migration Checklist

### Pre-Migration

- [ ] Backup IndexedDB (export all data)
- [ ] Backup provider state to localStorage
- [ ] Create migration script
- [ ] Test migration with seed data
- [ ] Document migration steps
- [ ] Create rollback script

### During Migration

- [ ] Run migration script
- [ ] Verify thread counts before/after
- [ ] Verify message counts before/after
- [ ] Verify no duplicate threads/messages
- [ ] Check console for errors
- [ ] Test thread retrieval
- [ ] Test message retrieval

### Post-Migration

- [ ] Verify all threads migrated
- [ ] Verify all messages migrated
- [ ] Verify agent attribution preserved
- [ ] Verify tool calls preserved
- [ ] Test thread creation
- [ ] Test message addition
- [ ] Test thread deletion
- [ ] Test cross-workspace conversations
- [ ] Run full test suite: `pnpm test`
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Manual testing across all 4 workspaces
- [ ] Performance benchmarking

### Sign-Off

- [ ] Zero data loss verified
- [ ] All components updated
- [ ] Old stores deleted
- [ ] Tests passing
- [ ] Performance acceptable
- [ ] Documentation updated

---

## Success Criteria

### Completion Checklist

**Cornerstone 3 Complete When:**
- [ ] 5 fragmented stores consolidated into 1 unified store
- [ ] 2 god stores eliminated (726 & 626 lines → 4 slices <150 lines each)
- [ ] Total code reduced from 1,800+ lines to ~500 lines
- [ ] Unified type definitions (1 file instead of 3)
- [ ] Zero data loss during migration
- [ ] All components using unified store
- [ ] Old stores deleted
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] All tests passing: `pnpm test`
- [ ] Manual test: Create thread → Add messages → Verify persistence
- [ ] Manual test: Switch workspace → Verify conversations available
- [ ] Performance: Thread loading <100ms, message addition <10ms

---

## Related ADRs

- **ADR-001:** Provider Store Consolidation (independent)
- **ADR-002:** Agent Vault Architecture (conversations depend on agents)
- **ADR-004:** Project Workspace Binding (conversations scoped to projects)
- **ADR-005:** RAG Pipeline Design (independent)
- **ADR-006:** Workspace State Sharing (related - event patterns)

---

## References

- **Phase 1 Analysis:** `cornerstone-3-conversation-analysis.md`
- **Current Stores:** `src/infrastructure/persistence/stores/conversation/`
- **Current Types:** `src/infrastructure/persistence/stores/conversation/conversation-types.ts`
- **Model Architecture:** Cornerstone 5 (RAG Pipeline) - December 2025 Zustand patterns

---

## Open Questions

1. **Should we keep old stores for rollback or delete immediately?**
   - **Decision:** Keep for 1 week after migration verified
   - **Reasoning:** Allows time to detect edge cases

2. **Should we implement pagination for large threads (100+ messages)?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Not blocking for MVP, current performance acceptable

3. **Should we compress message content for storage?**
   - **Decision:** NO - keep as-is
   - **Reasoning:** Compression adds complexity, storage is plentiful

---

**Status:** Proposed
**Next Step:** Implementation Phase 1 (Create Unified Store)
**Estimated Completion:** Iterations 31-40 (Sprint 1 - P0 Critical)
**Risk Level:** HIGH (requires rigorous testing and rollback plan)

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 2 - ADR Creation)
**Review Status:** Pending stakeholder approval
**WARNING:** This is the highest-risk migration in the entire platform unification. Extreme caution required.

# Conversation-Threads-Store Slice Implementation Plan

**Date**: 2026-01-02
**Team**: Team A (UI/Foundation)
**Epic**: AC-1.8 - God Component Elimination
**Story**: CT-001 - Split conversation-threads-store into focused slices

## Implementation Strategy

Based on the architecture analysis, this plan provides a detailed roadmap for splitting the 726-line conversation-threads-store into 5 focused slices following December 2025 Zustand patterns.

---

## 1. Slice Architecture Design

### 1.1 Final Slice Structure

```typescript
// New file structure:
src/infrastructure/persistence/stores/conversation/slices/
├── thread-crud-slice.ts          // Thread lifecycle (create, delete, update)
├── message-management-slice.ts   // Message operations (add, update streaming)
├── hierarchy-management-slice.ts // Cascade flow (parent-child, tree)
├── context-window-slice.ts       // Token management & pruning
└── project-scope-slice.ts        // Project & active state

// Updated main store:
src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts
// Now ~50 lines - composes slices and handles persistence
```

### 1.2 Slice Dependencies

```mermaid
graph TD
    A[conversation-threads-store.ts] --> B[thread-crud-slice]
    A --> C[message-management-slice]
    A --> D[hierarchy-management-slice]
    A --> E[context-window-slice]
    A --> F[project-scope-slice]

    B --> G[generateId]
    C --> H[ThreadMessage]
    D --> G
    E --> I[@/lib/chat/context-window-manager]
    F --> J[ConversationThread]

    A --> K[Dexie Sync]
    A --> L[localStorage persistence]
```

---

## 2. Detailed Slice Specifications

### Slice 1: Thread CRUD Slice (~120 lines)

**Purpose**: Pure thread lifecycle operations without business logic

**State Interface**:
```typescript
interface ThreadCrudState {
    threads: Record<string, ConversationThread>;
}
```

**Actions**:
- `createThread(projectId: string): ConversationThread`
- `deleteThread(threadId: string): void`
- `updateThreadTitle(threadId: string, title: string): void`

**Slice Implementation**:
```typescript
// src/infrastructure/persistence/stores/conversation/slices/thread-crud-slice.ts
export const createThreadCrudSlice: StateCreator<...> = (set) => ({
    threads: {},

    createThread: (projectId: string) => {
        // Pure CRUD logic only
        const thread = createNewThread(projectId);
        set(state => ({ threads: { ...state.threads, [thread.id]: thread } }));
        return thread;
    },

    deleteThread: (threadId: string) => {
        set(state => {
            const { [threadId]: deleted, ...remaining } = state.threads;
            return { threads: remaining };
        });
    },

    updateThreadTitle: (threadId: string, title: string) => {
        set(state => ({
            threads: {
                ...state.threads,
                [threadId]: { ...state.threads[threadId], title, updatedAt: Date.now() }
            }
        }));
    }
});
```

### Slice 2: Message Management Slice (~120 lines)

**Purpose**: Message lifecycle with streaming support

**State Interface**:
```typescript
interface MessageManagementState {
    // Messages stored within threads (no separate state)
}
```

**Actions**:
- `addMessage(threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>): void`
- `updateMessage(threadId: string, messageId: string, content: string): void`

**Slice Implementation**:
```typescript
// src/infrastructure/persistence/stores/conversation/slices/message-management-slice.ts
export const createMessageManagementSlice: StateCreator<...> = (set, get) => ({
    addMessage: (threadId: string, messageData) => {
        const thread = get().threads[threadId];
        if (!thread) return;

        const message = createNewMessage(messageData);
        const updatedThread = {
            ...thread,
            messages: [...thread.messages, message],
            title: updateThreadTitle(thread, message),
            preview: message.content.slice(0, 100),
            agentsUsed: trackAgentsUsed(thread.agentsUsed, message),
            messageCount: thread.messages.length + 1,
            updatedAt: message.timestamp
        };

        set(state => ({
            threads: { ...state.threads, [threadId]: updatedThread }
        }));
    },

    updateMessage: (threadId: string, messageId: string, content: string) => {
        set(state => {
            const thread = state.threads[threadId];
            if (!thread) return state;

            const messages = thread.messages.map(msg =>
                msg.id === messageId ? { ...msg, content } : msg
            );

            return {
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...thread,
                        messages,
                        preview: content.slice(0, 100),
                        updatedAt: Date.now()
                    }
                }
            };
        });
    }
});
```

### Slice 3: Hierarchy Management Slice (~120 lines)

**Purpose**: Parent-child relationships and thread organization

**State Interface**:
```typescript
interface HierarchyManagementState {
    // Hierarchy data embedded in thread objects
}
```

**Actions**:
- `createChildThread(parentId: string, title: string): ConversationThread`
- `moveThread(threadId: string, newParentId: string | null): void`
- `getThreadHierarchy(projectId: string): ThreadHierarchyNode[]`
- `updateThreadFolder(threadId: string, folderPath: string): void`

**Slice Implementation**:
```typescript
// src/infrastructure/persistence/stores/conversation/slices/hierarchy-management-slice.ts
export const createHierarchyManagementSlice: StateCreator<...> = (set, get) => ({
    createChildThread: (parentId: string, title: string) => {
        const parent = get().threads[parentId];
        const child = createNewChildThread(parent, title);

        set(state => {
            const newThreads = {
                ...state.threads,
                [child.id]: child,
                [parentId]: {
                    ...parent,
                    children: [...(parent.children || []), child.id],
                    updatedAt: Date.now()
                }
            };
            return { threads: newThreads };
        });

        return child;
    },

    moveThread: (threadId: string, newParentId: string | null) => {
        const thread = get().threads[threadId];
        const oldParentId = thread.parentId;

        set(state => {
            const newThreads = { ...state.threads };

            // Remove from old parent
            if (oldParentId && newThreads[oldParentId]) {
                newThreads[oldParentId] = {
                    ...newThreads[oldParentId],
                    children: newThreads[oldParentId].children?.filter(id => id !== threadId) || [],
                    updatedAt: Date.now()
                };
            }

            // Add to new parent
            if (newParentId && newThreads[newParentId]) {
                newThreads[newParentId] = {
                    ...newThreads[newParentId],
                    children: [...(newThreads[newParentId].children || []), threadId],
                    updatedAt: Date.now()
                };
            }

            // Update thread's parent
            newThreads[threadId] = {
                ...thread,
                parentId: newParentId,
                updatedAt: Date.now()
            };

            return { threads: newThreads };
        });
    },

    getThreadHierarchy: (projectId: string) => {
        const { threads } = get();
        const projectThreads = Object.values(threads).filter(t => t.projectId === projectId);

        const buildTree = (parentId: null | string, depth: number): ThreadHierarchyNode[] => {
            const children = projectThreads.filter(t => t.parentId === parentId);
            return children.map(thread => ({
                thread,
                children: buildTree(thread.id, depth + 1),
                depth
            }));
        };

        return buildTree(null, 0);
    }
});
```

### Slice 4: Context Window Slice (~100 lines)

**Purpose**: Token management and context pruning for long conversations

**State Interface**:
```typescript
interface ContextWindowState {
    // Context window data embedded in thread objects
}
```

**Actions**:
- `pruneContextWindow(threadId: string, targetTokens: number): Promise<void>`

**Slice Implementation**:
```typescript
// src/infrastructure/persistence/stores/conversation/slices/context-window-slice.ts
export const createContextWindowSlice: StateCreator<...> = (set, get) => ({
    pruneContextWindow: async (threadId: string, targetTokens: number) => {
        const thread = get().threads[threadId];
        if (!thread) return;

        // Dynamic import to avoid circular dependencies
        const { pruneContextWindow, countMessageTokens } = await import('@/lib/chat/context-window-manager');

        const currentTokens = countMessageTokens(thread.messages);
        if (currentTokens <= targetTokens) return;

        const strategy = thread.contextWindow?.compressionStrategy || 'drop_oldest';
        const prunedMessages = await pruneContextWindow(thread.messages, {
            maxTokens: targetTokens,
            currentTokens,
            compressionStrategy: strategy
        });

        set(state => ({
            threads: {
                ...state.threads,
                [threadId]: {
                    ...thread,
                    messages: prunedMessages,
                    messageCount: prunedMessages.length,
                    updatedAt: Date.now()
                }
            }
        }));
    }
});
```

### Slice 5: Project & Active State Slice (~100 lines)

**Purpose**: Project scope and UI state management

**State Interface**:
```typescript
interface ProjectScopeState {
    activeThreadId: string | null;
    currentProjectId: string | null;
    _hasHydrated: boolean;
}
```

**Actions**:
- `setCurrentProject(projectId: string): void`
- `setActiveThread(threadId: string | null): void`
- `getThreadsForProject(projectId: string): ConversationThread[]`
- `getThread(threadId: string): ConversationThread | undefined`
- `clearProjectThreads(projectId: string): void`
- `setHasHydrated(state: boolean): void`

**Slice Implementation**:
```typescript
// src/infrastructure/persistence/stores/conversation/slices/project-scope-slice.ts
export const createProjectScopeSlice: StateCreator<...> = (set) => ({
    activeThreadId: null,
    currentProjectId: null,
    _hasHydrated: false,

    setCurrentProject: (projectId: string) => {
        set({ currentProjectId: projectId, activeThreadId: null });
    },

    setActiveThread: (threadId: string | null) => {
        set({ activeThreadId: threadId });
    },

    getThreadsForProject: (projectId: string) => {
        const { threads } = get();
        return Object.values(threads)
            .filter(t => t.projectId === projectId)
            .sort((a, b) => b.updatedAt - a.updatedAt);
    },

    getThread: (threadId: string) => {
        return get().threads[threadId];
    },

    clearProjectThreads: (projectId: string) => {
        set(state => {
            const filtered = Object.fromEntries(
                Object.entries(state.threads).filter(([_, t]) => t.projectId !== projectId)
            );
            return {
                threads: filtered,
                activeThreadId: null
            };
        });
    },

    setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
    }
});
```

---

## 3. Updated Main Store

The main store file becomes a simple composer:

```typescript
// src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts (updated)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

// Import slices
import { createThreadCrudSlice } from './slices/thread-crud-slice';
import { createMessageManagementSlice } from './slices/message-management-slice';
import { createHierarchyManagementSlice } from './slices/hierarchy-management-slice';
import { createContextWindowSlice } from './slices/context-window-slice';
import { createProjectScopeSlice } from './slices/project-scope-slice';

// Export types (maintain backward compatibility)
export type { ConversationThread, ThreadMessage, ThreadHierarchyNode } from './conversation-types';

// Main store - just composes slices
export const useThreadsStore = create<ThreadsState>()(
    persist(
        (set, get, api) => ({
            // Compose all slices
            ...createThreadCrudSlice(set, get, api),
            ...createMessageManagementSlice(set, get, api),
            ...createHierarchyManagementSlice(set, get, api),
            ...createContextWindowSlice(set, get, api),
            ...createProjectScopeSlice(set, get, api),
        }),
        {
            name: 'via-gent-threads',
            version: 1,
            storage: createJSONStorage(() => createDexieStorage('threads')),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
```

---

## 4. Consumer Migration Strategy

### 4.1 Migration Phases

**Phase 1: Import Aliases (Zero Breaking Changes)**
```typescript
// Add to main store export
export const { useThreadsStore, useActiveThread } from './conversation-threads-store';
export const useProjectThreads = (projectId: string) =>
    useThreadsStore((state) => state.getThreadsForProject(projectId));

// All existing imports continue to work
```

**Phase 2: Gradual Migration by Slice**
```typescript
// Example for active thread consumers
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/slices/project-scope-slice';

// Thread hierarchy consumers
import { useThreadHierarchy } from '@/infrastructure/persistence/stores/conversation/slices/hierarchy-management-slice';
```

**Phase 3: Cleanup (Post Migration)**
- Remove old main store
- Update documentation
- Cleanup deprecated exports

### 4.2 Consumer Impact Matrix

| Consumer | Required Changes | Timeline | Risk |
|----------|------------------|----------|------|
| `ChatPanelWrapper.tsx` | None ( Phase 1) | Immediate | 🟢 None |
| `AgentChatPanel.tsx` | migrate to slice imports | Phase 2 | 🟡 Medium |
| `AgentChatConversationManager.tsx` | migrate to slice imports | Phase 2 | 🟡 Medium |
| `ThreadFolderTree.tsx` | migrate to hierarchy slice | Phase 2 | 🟡 Medium |
| `ChatPanel.tsx` | migrate to message slice | Phase 2 | 🟡 Medium |
| `Type-only imports` | update import paths | Phase 3 | 🟢 Low |

---

## 5. Testing Strategy

### 5.1 Unit Tests for Each Slice

```typescript
// Example: thread-crud-slice.test.ts
import { createThreadCrudSlice } from '../slices/thread-crud-slice';

describe('ThreadCrudSlice', () => {
    let store: any;

    beforeEach(() => {
        store = createThreadCrudSlice(
            (set) => ({ set }),
            () => ({}),
            () => ({})
        );
    });

    it('should create thread', () => {
        const thread = store.createThread('project-1');
        expect(thread.id).toMatch(/^thread_\d+_\w+$/);
        expect(thread.projectId).toBe('project-1');
    });
});
```

### 5.2 Integration Tests

```typescript
// conversation-threads-store-integration.test.ts
describe('Conversation Threads Store Integration', () => {
    it('should maintain thread hierarchy across slices', () => {
        // Test parent-child relationships work across slices
    });

    it('should preserve message streaming during context pruning', () => {
        // Test interaction between message and context slices
    });
});
```

---

## 6. Persistence & Migration

### 6.1 Dexie Sync Preservation

The existing Dexie sync logic will remain in the main store to preserve functionality:

```typescript
// Keep existing sync logic in main store
useThreadsStore.subscribe((state) => {
    // Sync changes to Dexie
    syncThreadsToDexie(state.threads);
});
```

### 6.2 Backup Strategy

1. **Pre-migration**: Backup current localStorage state
2. **During migration**: Maintain dual storage during transition
3. **Post-migration**: Verify data integrity

---

## 7. Timeline & Milestones

| Phase | Duration | Deliverables | Success Criteria |
|-------|----------|--------------|------------------|
| **Phase 1** | 2-3 days | Slice implementations | Each slice <120 lines |
| **Phase 2** | 2-3 days | Consumer migration | All consumers updated |
| **Phase 3** | 1-2 days | Testing & cleanup | 100% test coverage |
| **Phase 4** | 1 day | Documentation update | All docs updated |

**Total Estimated Duration**: 6-9 days

---

## 8. Risk Mitigation

### 8.1 Data Loss Prevention
- ✅ Preserve existing persistence mechanisms
- ✅ Maintain backward compatibility during migration
- ✅ Comprehensive test coverage for data operations

### 8.2 Performance Considerations
- ✅ Slice-based selectors for optimized re-renders
- ✅ Async operations handled appropriately
- ✅ Monitor thread operation performance post-migration

### 8.3 Consumer Impact
- ✅ Zero breaking changes during Phase 1
- ✅ Clear migration documentation
- ✅ Gradual rollout strategy

---

## 9. Success Metrics

### 9.1 Technical Metrics
- **Lines of Code**: 726 → ~600 (17% reduction)
- **Component Size**: Max 120 lines per slice (6x → 1x limit)
- **Test Coverage**: 100% slice coverage + integration tests

### 9.2 Functional Metrics
- **API Compatibility**: 100% maintained during migration
- **Performance**: No regression in thread operations
- **Data Integrity**: Zero data loss during migration

### 9.3 Maintenance Metrics
- **Modularity**: 5 focused slices, single responsibility
- **Testability**: Isolated unit tests for each concern
- **Extensibility**: Easy to add new thread features

---

## 10. Next Steps

### 10.1 Immediate Actions (This Week)
1. ✅ **Complete**: Architecture analysis (done)
2. ⏳ **Review**: Slice implementation plan with team
3. ⏳ **Approve**: Plan and allocate resources
4. ⏳ **Setup**: Development environment for slice implementation

### 10.2 Implementation Sequence
1. **Thread CRUD Slice** (simplest, foundational)
2. **Project & Active State Slice** (UI state, low risk)
3. **Message Management Slice** (critical, complex)
4. **Hierarchy Management Slice** (organizational features)
5. **Context Window Slice** (async operations, highest risk)

---

**Ready for Implementation**: This plan provides a clear, low-risk approach to splitting the conversation-threads-store into focused slices following established project patterns and maintaining full backward compatibility.
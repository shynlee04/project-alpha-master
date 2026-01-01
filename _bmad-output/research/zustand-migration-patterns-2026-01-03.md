# Zustand God Store Migration Patterns: Best Practices for 2026

**Date**: 2026-01-03
**Team**: Research Team
**Phase**: Phase 0 - Foundation Stabilization
**Target**: conversation-store.ts (726 lines → 6 slices)

---

## Executive Summary

This research document provides comprehensive guidance for migrating large Zustand "god stores" to the slice pattern, focusing on maintaining backward compatibility while improving code organization. Based on official Zustand documentation, community best practices, and real-world implementation patterns, this guide addresses the specific challenges of migrating monolithic stores like `conversation-store.ts` (726 lines) into modular, maintainable slices.

## 1. Slice Pattern Fundamentals

### 1.1 What is the Slice Pattern?

The slice pattern is Zustand's recommended approach for organizing large applications. It involves dividing a single monolithic store into smaller, focused "slices" that can be combined into a single bounded store.

**Key Benefits**:
- **Modularity**: Each slice handles a single domain
- **Maintainability**: Easier to test and modify individual slices
- **Type Safety**: Better TypeScript support with focused types
- **Performance**: Selective re-renders through focused selectors

### 1.2 Basic Slice Structure

```typescript
// Individual slice factory
export const createFishSlice = (set, get) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
  removeFish: () => set((state) => ({ fishes: state.fishes - 1 })),
});

// Combined bounded store
export const useBoundStore = create((...a) => ({
  ...createFishSlice(...a),
  ...createBearSlice(...a),
}));
```

### 1.3 January 2026 Best Practices

From official Zustand documentation (v5.0.8):

1. **Single Bounded Store**: Create one main store that combines all slices
2. **Middleware Application**: Apply middlewares (persist, devtools) only to the combined store
3. **Cross-Slice Communication**: Use `get()` to access other slices within actions
4. **TypeScript Support**: Properly type `StateCreator` functions with combined types

## 2. Migration Strategy: Zero Breaking Changes

### 2.1 Phase-by-Phase Migration Approach

#### Phase 1: Analysis and Planning (2-3 hours)
1. **Identify Logical Boundaries**
   ```typescript
   // conversation-store.ts analysis:
   - Thread management (createThread, deleteThread, updateThread)
   - Message handling (addMessage, updateMessage, deleteMessage)
   - UI state (selectedThread, loadingStates)
   - Search/filtering (searchQuery, filters)
   - Sync operations (syncStatus, lastSync)
   - Settings (preferences, configurations)
   ```

2. **Create Slice Interface Contracts**
   ```typescript
   interface ThreadSlice {
     // State
     threads: Thread[];
     selectedThreadId: string | null;

     // Actions
     createThread: (title: string) => void;
     deleteThread: (id: string) => void;
     updateThread: (id: string, updates: Partial<Thread>) => void;
   }
   ```

#### Phase 2: Slice Implementation (4-6 hours)
1. **Extract Individual Slices**
   ```typescript
   // src/infrastructure/persistence/stores/slices/thread-slice.ts
   export const createThreadSlice = (set, get) => ({
     threads: [],
     selectedThreadId: null,

     createThread: (title: string) => {
       const newThread: Thread = {
         id: generateId(),
         title,
         messages: [],
         createdAt: new Date(),
         updatedAt: new Date(),
       };

       set((state) => ({
         threads: [...state.threads, newThread],
         selectedThreadId: newThread.id,
       }));
     },

     // ... other actions
   });
   ```

2. **Cross-Slice Communication**
   ```typescript
   // src/infrastructure/persistence/stores/slices/message-slice.ts
   export const createMessageSlice = (set, get) => ({
     messages: [],

     addMessage: (threadId: string, content: string) => {
       // Access other slice via get()
       const { createThread } = get();

       const newMessage: Message = {
         id: generateId(),
         threadId,
         content,
         createdAt: new Date(),
       };

       set((state) => ({
         messages: [...state.messages, newMessage],
       }));
     },
   });
   ```

#### Phase 3: Facade Pattern (2-3 hours)
Implement a facade to maintain backward compatibility:

```typescript
// src/lib/state/conversation-store.ts (Facade)
import { useAppStore } from '../persistence/stores/use-app-store';

// Original interface preserved
export const useConversationStore = () => {
  const appStore = useAppStore();

  // Map old API to new slice-based API
  return {
    // State mapping
    threads: appStore.threads,
    selectedThread: appStore.selectedThreadId,

    // Actions mapping
    createThread: (title: string) => appStore.createThread(title),
    deleteThread: (id: string) => appStore.deleteThread(id),
    // ... all other actions
  };
};
```

### 2.2 Gradual Migration Strategy

1. **Keep Original Store Interface**: Maintain the existing hook name and API
2. **Internal Migration**: Replace implementation with slice calls internally
3. **Deprecation Period**: Keep old store as a facade while encouraging new slice usage
4. **Final Migration**: Remove facade once all consumers are migrated

## 3. Facade Pattern Implementation

### 3.1 Complete Facade Example

```typescript
// src/infrastructure/persistence/stores/facades/conversation-facade.ts
import { useAppStore } from '../use-app-store';
import type { AppState } from '../use-app-store';

// Create a type-safe interface for the conversation store
interface ConversationStore {
  // State
  threads: AppState['threads'];
  selectedThreadId: AppState['selectedThreadId'];
  messages: AppState['messages'];
  isLoading: AppState['isLoading'];

  // Actions
  createThread: (title: string) => void;
  deleteThread: (id: string) => void;
  updateThread: (id: string, updates: Partial<Thread>) => void;
  selectThread: (id: string | null) => void;
  addMessage: (threadId: string, content: string) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
}

export const useConversationStore = (): ConversationStore => {
  const store = useAppStore();

  return {
    // State selectors
    threads: store.threads,
    selectedThreadId: store.selectedThreadId,
    messages: store.messages,
    isLoading: store.isLoading,

    // Action mappings
    createThread: store.createThread,
    deleteThread: store.deleteThread,
    updateThread: store.updateThread,
    selectThread: store.selectThread,
    addMessage: store.addMessage,
    updateMessage: store.updateMessage,
    deleteMessage: store.deleteMessage,
  };
};
```

### 3.2 Legacy Bridge Pattern

For complex scenarios where the facade needs to handle different logic:

```typescript
// src/lib/state/conversation-legacy-bridge.ts
export const useConversationLegacyBridge = () => {
  const appStore = useAppStore();

  // Handle legacy behaviors
  const createThreadWithLegacyBehavior = (title: string) => {
    // New implementation
    appStore.createThread(title);

    // Legacy-specific logic (if any)
    if (title.includes('Legacy')) {
      // Handle legacy-specific behavior
    }
  };

  return {
    createThread: createThreadWithLegacyBehavior,
    // ... other actions
  };
};
```

## 4. Testing Strategies

### 4.1 Test Setup with Mocking

```typescript
// src/__tests__/fixtures/store-mocks.ts
import { create } from 'zustand';
import { createMockStore } from '../utils/mock-store-utils';

// Mock store factory
export const createConversationStoreMock = (initialState = {}) => {
  const store = create(() => ({
    threads: [],
    messages: [],
    ...initialState,
  }));

  return {
    store,
    reset: () => store.setState(initialState),
  };
};

// Usage in tests
describe('ThreadSlice', () => {
  let mockStore: ReturnType<typeof createConversationStoreMock>;

  beforeEach(() => {
    mockStore = createConversationStoreMock();
  });

  afterEach(() => {
    mockStore.reset();
  });

  it('should create a thread', () => {
    const { store } = mockStore;
    store.getState().createThread('Test Thread');

    const state = store.getState();
    expect(state.threads).toHaveLength(1);
    expect(state.threads[0].title).toBe('Test Thread');
  });
});
```

### 4.2 Testing Individual Slices

```typescript
// src/infrastructure/persistence/stores/slices/__tests__/thread-slice.test.ts
import { createThreadSlice } from '../thread-slice';
import { create } from 'zustand';

describe('ThreadSlice', () => {
  it('should create a thread', () => {
    const store = create(() => createThreadSlice());

    store.getState().createThread('Test Thread');

    const state = store.getState();
    expect(state.threads).toHaveLength(1);
    expect(state.selectedThreadId).toBe(state.threads[0].id);
  });

  it('should delete a thread', () => {
    const store = create(() => createThreadSlice());

    const { createThread, deleteThread } = store.getState();
    createThread('Test Thread');
    const threadId = store.getState().threads[0].id;

    deleteThread(threadId);

    const state = store.getState();
    expect(state.threads).toHaveLength(0);
    expect(state.selectedThreadId).toBeNull();
  });
});
```

### 4.3 Integration Testing

```typescript
// src/infrastructure/persistence/stores/__tests__/combined-store.test.ts
import { create } from 'zustand';
import { createThreadSlice } from '../slices/thread-slice';
import { createMessageSlice } from '../slices/message-slice';

describe('Combined Store Integration', () => {
  it('should handle cross-slice interactions', () => {
    const store = create((...a) => ({
      ...createThreadSlice(...a),
      ...createMessageSlice(...a),
    }));

    const { createThread, addMessage } = store.getState();

    // Create thread and add message
    createThread('Test Thread');
    addMessage('thread-1', 'Hello World');

    const state = store.getState();
    expect(state.threads).toHaveLength(1);
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].threadId).toBe('thread-1');
  });
});
```

## 5. Common Pitfalls to Avoid

### 5.1 Critical Anti-Patterns

#### ❌ Middleware on Individual Slices
```typescript
// WRONG - Applying persist to individual slices
export const createThreadSlice = (set) =>
  persist(
    { threads: [] },
    { name: 'threads' }
  );
```

#### ✅ Correct - Middleware on Combined Store
```typescript
// CORRECT - Apply middleware to combined store only
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createThreadSlice(...a),
      ...createMessageSlice(...a),
    }),
    { name: 'app-state' }
  )
);
```

#### ❌ Destructuring Entire Store (Causes Infinite Loops)
```typescript
// WRONG - Causes infinite re-renders in Zustand v5
const { threads, createThread } = useConversationStore();
```

#### ✅ Correct - Individual Selectors
```typescript
// CORRECT - Prevents infinite loops
const threads = useAppStore(s => s.threads);
const createThread = useAppStore(s => s.createThread);
```

#### ❌ Hard-coded Dependencies Between Slices
```typescript
// WRONG - Direct slice dependencies
export const createMessageSlice = (set, get) => ({
  // Direct reference to thread slice
  threads: get().threads, // ❌ Bad
});
```

#### ✅ Correct - Use get() in Actions Only
```typescript
// CORRECT - Cross-slice communication in actions
export const createMessageSlice = (set, get) => ({
  addMessage: (threadId: string, content: string) => {
    const { createThread } = get(); // ✅ Good

    // Use in actions only
    if (!get().threads.find(t => t.id === threadId)) {
      createThread(`Thread ${threadId}`);
    }

    // ... add message logic
  },
});
```

### 5.2 Performance Considerations

1. **Avoid Excessive Re-renders**: Use `useShallow` for multiple selectors
   ```typescript
   import { useShallow } from 'zustand/shallow';

   const { threads, messages } = useAppStore(
     useShallow((s) => ({ threads: s.threads, messages: s.messages }))
   );
   ```

2. **Memoize Expensive Operations**: Use computed values for derived state
   ```typescript
   export const createComputedSlice = (set, get) => ({
     getUnreadCount: () => {
       return get().messages.filter(m => !m.read).length;
     },
   });
   ```

3. **Lazy Load Slices**: For large applications, consider dynamic imports

### 5.3 TypeScript Best Practices

#### Proper Slice Typing
```typescript
// Define the full AppState type
interface AppState {
  threads: Thread[];
  messages: Message[];
  // ... other state
}

// Type slice with full AppState
export const createThreadSlice: StateCreator<AppState> = (set, get) => ({
  // Implementation
});
```

#### Type-safe Actions
```typescript
interface ThreadActions {
  createThread: (title: string) => void;
  deleteThread: (id: string) => void;
  updateThread: (id: string, updates: Partial<Thread>) => void;
}

export const createThreadSlice: StateCreator<AppState, [], [], ThreadActions> = (set) => ({
  // Implementation
});
```

## 6. Migration Checklist

### Pre-Migration Phase
- [ ] Identify all logical domains in the god store
- [ ] Define slice interfaces and contracts
- [ ] Create a migration timeline with milestones
- [ ] Backup existing state and test data

### Implementation Phase
- [ ] Create individual slice factories
- [ ] Implement cross-slice communication
- [ ] Set up combined store with middlewares
- [ ] Create facade layer for backward compatibility
- [ ] Write comprehensive tests for each slice
- [ ] Update TypeScript types and interfaces

### Testing Phase
- [ ] Unit tests for individual slices
- [ ] Integration tests for slice interactions
- [ ] E2E tests with facade layer
- [ ] Performance testing with React components
- [ ] Data migration tests (persist state compatibility)

### Deployment Phase
- [ ] Deploy facade alongside existing store
- [ ] Monitor for breaking changes in logs
- [ ] Gradually migrate consumers to new slices
- [ ] Remove facade after full migration
- [ ] Update documentation and examples

## 7. conversation-store.ts Migration Example

### 7.1 Current State Analysis
```typescript
// src/lib/state/conversation-threads-store.ts (726 lines)
export const useConversationThreadsStore = create<ConversationState>()((set, get) => ({
  // State management
  threads: [],
  messages: [],
  selectedThreadId: null,
  isLoading: false,
  error: null,

  // Complex thread operations (150+ lines)
  createThread: (title: string) => { /* ... */ },
  deleteThread: (id: string) => { /* ... */ },
  updateThread: (id: string, updates: Partial<Thread>) => { /* ... */ },

  // Complex message operations (120+ lines)
  addMessage: (threadId: string, content: string) => { /* ... */ },
  updateMessage: (id: string, updates: Partial<Message>) => { /* ... */ },
  deleteMessage: (id: string) => { /* ... */ },

  // UI state management (80+ lines)
  setSelectedThread: (id: string | null) => { /* ... */ },
  setLoading: (loading: boolean) => { /* ... */ },
  setError: (error: string | null) => { /* ... */ },

  // Search/filtering (100+ lines)
  setSearchQuery: (query: string) => { /* ... */ },
  setFilters: (filters: FilterOptions) => { /* ... */ },

  // Sync operations (120+ lines)
  syncThreads: () => { /* ... */ },
  updateLastSync: (timestamp: Date) => { /* ... */ },

  // Settings (56+ lines)
  updatePreferences: (prefs: ConversationPreferences) => { /* ... */ },
}));
```

### 7.2 Target Slice Structure
```typescript
// Target: 6 slices, each <120 lines

// src/infrastructure/persistence/stores/slices/thread-slice.ts (~100 lines)
export const createThreadSlice = (set, get) => ({
  threads: [],
  selectedThreadId: null,

  createThread: (title: string) => { /* ... */ },
  deleteThread: (id: string) => { /* ... */ },
  updateThread: (id: string, updates: Partial<Thread>) => { /* ... */ },
  setSelectedThread: (id: string | null) => { /* ... */ },
});

// src/infrastructure/persistence/stores/slices/message-slice.ts (~100 lines)
export const createMessageSlice = (set, get) => ({
  messages: [],

  addMessage: (threadId: string, content: string) => { /* ... */ },
  updateMessage: (id: string, updates: Partial<Message>) => { /* ... */ },
  deleteMessage: (id: string) => { /* ... */ },
});

// src/infrastructure/persistence/stores/slices/ui-slice.ts (~80 lines)
export const createUISlice = (set) => ({
  isLoading: false,
  error: null,

  setLoading: (loading: boolean) => { /* ... */ },
  setError: (error: string | null) => { /* ... */ },
});

// src/infrastructure/persistence/stores/slices/search-slice.ts (~80 lines)
export const createSearchSlice = (set) => ({
  searchQuery: '',
  filters: {},

  setSearchQuery: (query: string) => { /* ... */ },
  setFilters: (filters: FilterOptions) => { /* ... */ },
});

// src/infrastructure/persistence/stores/slices/sync-slice.ts (~80 lines)
export const createSyncSlice = (set) => ({
  lastSync: null,
  syncStatus: 'idle',

  updateLastSync: (timestamp: Date) => { /* ... */ },
  syncThreads: () => { /* ... */ },
});

// src/infrastructure/persistence/stores/slices/settings-slice.ts (~80 lines)
export const createSettingsSlice = (set) => ({
  preferences: defaultPreferences,

  updatePreferences: (prefs: ConversationPreferences) => { /* ... */ },
});
```

### 7.3 Combined Store Implementation
```typescript
// src/infrastructure/persistence/stores/use-app-store.ts
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Thread operations
      ...createThreadSlice(...a),
      ...createMessageSlice(...a),

      // UI state
      ...createUISlice(...a),

      // Search and filtering
      ...createSearchSlice(...a),

      // Sync operations
      ...createSyncSlice(...a),

      // Settings
      ...createSettingsSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('appState')),
      partialize: (state) => ({
        threads: state.threads,
        messages: state.messages,
        preferences: state.preferences,
      }),
    }
  )
);
```

### 7.4 Facade Implementation
```typescript
// src/lib/state/conversation-store.ts (Legacy facade)
export const useConversationStore = () => {
  const store = useAppStore();

  return {
    // State
    threads: store.threads,
    messages: store.messages,
    selectedThreadId: store.selectedThreadId,
    isLoading: store.isLoading,
    error: store.error,
    searchQuery: store.searchQuery,
    filters: store.filters,
    syncStatus: store.syncStatus,
    preferences: store.preferences,

    // Actions
    createThread: store.createThread,
    deleteThread: store.deleteThread,
    updateThread: store.updateThread,
    selectThread: store.setSelectedThread,
    addMessage: store.addMessage,
    updateMessage: store.updateMessage,
    deleteMessage: store.deleteMessage,
    setLoading: store.setLoading,
    setError: store.setError,
    setSearchQuery: store.setSearchQuery,
    setFilters: store.setFilters,
    syncThreads: store.syncThreads,
    updatePreferences: store.updatePreferences,
  };
};
```

## 8. Performance Optimization Strategies

### 8.1 Selective Persistence
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({ /* ... */ }),
    {
      name: 'app-state',
      partialize: (state) => ({
        // Only persist essential data
        threads: state.threads,
        preferences: state.preferences,
        // Don't persist UI state or temporary data
      }),
    }
  )
);
```

### 8.2 DevTools Integration
```typescript
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({ /* ... */ }),
      { name: 'app-state' }
    ),
    { name: 'app-store' }
  )
);
```

### 8.3 Middleware Composition
```typescript
import { subscribeWithSelector, redux } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      redux(reducer, initialState),
      { name: 'app-state' }
    )
  )
);
```

## 9. Conclusion

The slice pattern migration offers significant benefits for large Zustand stores:

1. **Maintainability**: Breaking down 726-line god stores into focused slices (<120 lines each)
2. **Testability**: Individual slices can be tested in isolation
3. **Type Safety**: Better TypeScript support with focused interfaces
4. **Performance**: Selective re-renders and optimized selectors
5. **Backward Compatibility**: Facade pattern ensures zero breaking changes

By following the phased approach outlined in this document and avoiding common pitfalls, teams can successfully migrate large Zustand stores while maintaining application stability and improving long-term maintainability.

The conversation-store.ts migration is estimated to take 8-12 hours total and will reduce the store from 726 lines to approximately 6 slices of ~80-100 lines each, with a facade layer maintaining backward compatibility.

---

## References

1. [Zustand Official Documentation - Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern)
2. [Zustand TypeScript Guide](https://zustand.docs.pmnd.rs/guides/beginner-typescript)
3. [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist)
4. [DeepWiki - pmndrs/zustand](https://deepwiki.com/pmndrs/zustand)
5. [React State Management Patterns - 2025](https://michelebertoli.github.io/react-design-patterns-and-best-practices/)
6. [GitHub Discussions - Zustand Best Practices](https://github.com/pmndrs/zustand/discussions/2486)

**Document ID**: zustand-migration-patterns-2026-01-03
**Version**: 1.0
**Status**: Research Complete - Ready for Implementation
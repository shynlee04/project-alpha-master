# Zustand State Orchestration Patterns: Avoiding Circular Dependencies (December 2025 Research)

**Date**: 2026-01-01
**Phase**: Research
**Team**: Development Coordination
**Agent Mode**: @bmad-core-bmad-master (Orchestration)
**Context**: State management remediation for Project Alpha v2.0 (Via-gent)

---

## Executive Summary

This document provides concrete implementation patterns for avoiding circular dependencies in large Zustand applications, based on December 2025 state management research. The patterns address Project Alpha's specific use cases: agent-provider configuration, conversation threads, RAG knowledge sources, and tool permissions.

**Key Finding**: Zustand is **not designed for coordinating multiple stores**. The official recommendation from Zustand maintainers is: *"if such coordination is required, like changing both stores at once, a single big store is preferred."*

However, when multiple stores are necessary for domain separation, three patterns emerge as production-ready solutions:

1. **Event-Driven Architecture** (Best for loose coupling)
2. **React Context Injection** (Best for testing and reusability)
3. **Computed State Middleware** (Best for derived state)

---

## Table of Contents

1. [Pattern 1: Event Bus Architecture](#pattern-1-event-bus-architecture)
2. [Pattern 2: Selector Composition with Computed State](#pattern-2-selector-composition-with-computed-state)
3. [Pattern 3: React Context Dependency Injection](#pattern-3-react-context-dependency-injection)
4. [Pattern 4: Store Subscription Reactions](#pattern-4-store-subscription-reactions)
5. [Pattern 5: Custom Middleware for Coordination](#pattern-5-custom-middleware-for-coordination)
6. [Migration Path](#migration-path)
7. [Project Alpha Implementation Guide](#project-alpha-implementation-guide)

---

## Pattern 1: Event Bus Architecture

### Overview

Event-driven architecture enables cross-store communication without direct dependencies. Stores publish events when state changes, and other stores subscribe to those events. This is the **most decoupled** approach and ideal for Project Alpha's micro-frontend architecture.

### Implementation

#### Step 1: Create Typed Event Bus

```typescript
// src/lib/state/event-bus.ts
import EventEmitter3 from 'eventemitter3';

type StoreEventMap = {
  'agent:config-changed': { agentId: string; providerId: string };
  'conversation:active-changed': { conversationId: string };
  'knowledge:sources-updated': { sourceIds: string[] };
  'tool:permissions-changed': { agentId: string };
};

class TypedEventBus extends EventEmitter3<StoreEventMap> {}

export const storeEventBus = new TypedEventBus();

// Type-safe event emitters
export const emitAgentConfigChanged = (agentId: string, providerId: string) => {
  storeEventBus.emit('agent:config-changed', { agentId, providerId });
};

export const emitConversationActiveChanged = (conversationId: string) => {
  storeEventBus.emit('conversation:active-changed', { conversationId });
};

export const emitKnowledgeSourcesUpdated = (sourceIds: string[]) => {
  storeEventBus.emit('knowledge:sources-updated', { sourceIds });
};

export const emitToolPermissionsChanged = (agentId: string) => {
  storeEventBus.emit('tool:permissions-changed', { agentId });
};

// Type-safe event listeners
export const onAgentConfigChanged = (
  handler: (data: { agentId: string; providerId: string }) => void
) => {
  storeEventBus.on('agent:config-changed', handler);
  return () => storeEventBus.off('agent:config-changed', handler);
};

export const onConversationActiveChanged = (
  handler: (data: { conversationId: string }) => void
) => {
  storeEventBus.on('conversation:active-changed', handler);
  return () => storeEventBus.off('conversation:active-changed', handler);
};

export const onKnowledgeSourcesUpdated = (
  handler: (data: { sourceIds: string[] }) => void
) => {
  storeEventBus.on('knowledge:sources-updated', handler);
  return () => storeEventBus.off('knowledge:sources-updated', handler);
};

export const onToolPermissionsChanged = (
  handler: (data: { agentId: string }) => void
) => {
  storeEventBus.on('tool:permissions-changed', handler);
  return () => storeEventBus.off('tool-:permissions-changed', handler);
};
```

#### Step 2: Publish Events in Source Store

```typescript
// src/stores/agents-store.ts
import { create } from 'zustand';
import { emitAgentConfigChanged } from '@/lib/state/event-bus';

interface AgentState {
  agents: Record<string, AgentConfig>;
}

interface AgentActions {
  updateAgentProvider: (agentId: string, providerId: string) => void;
}

export const useAgentsStore = create<AgentState & AgentActions>()(
  devtools(
    (set, get) => ({
      agents: {},

      updateAgentProvider: (agentId: string, providerId: string) => {
        set((state) => ({
          agents: {
            ...state.agents,
            [agentId]: {
              ...state.agents[agentId],
              providerId,
            },
          },
        }));

        // Publish event after state update
        emitAgentConfigChanged(agentId, providerId);
      },
    }),
    { name: 'AgentsStore' }
  )
);
```

#### Step 3: Subscribe to Events in Dependent Store

```typescript
// src/stores/provider-keys-store.ts
import { create } from 'zustand';
import { onAgentConfigChanged } from '@/lib/state/event-bus';
import { useEffect } from 'react';

interface ProviderKeysState {
  keys: Record<string, string>;
  requiredProviderIds: Set<string>;
}

interface ProviderKeysActions {
  setKey: (providerId: string, apiKey: string) => void;
  markProviderRequired: (providerId: string) => void;
}

export const useProviderKeysStore = create<ProviderKeysState & ProviderKeysActions>()(
  devtools(
    (set) => ({
      keys: {},
      requiredProviderIds: new Set(),

      setKey: (providerId: string, apiKey: string) => {
        set((state) => ({
          keys: {
            ...state.keys,
            [providerId]: apiKey,
          },
        }));
      },

      markProviderRequired: (providerId: string) => {
        set((state) => ({
          requiredProviderIds: new Set([...state.requiredProviderIds, providerId]),
        }));
      },
    }),
    { name: 'ProviderKeysStore' }
  )
);

// React hook to bridge events to store updates
export const useProviderKeysEventBridge = () => {
  const markProviderRequired = useProviderKeysStore((s) => s.markProviderRequired);

  useEffect(() => {
    // Subscribe to agent config changes
    const unsubscribe = onAgentConfigChanged(({ agentId, providerId }) => {
      // Mark provider as required when agent uses it
      markProviderRequired(providerId);
    });

    return unsubscribe;
  }, [markProviderRequired]);
};
```

#### Step 4: Use Event Bridge in Application Root

```typescript
// src/App.tsx
import { useProviderKeysEventBridge } from '@/stores/provider-keys-store';

function App() {
  // Initialize all event bridges at application root
  useProviderKeysEventBridge();
  useConversationEventBridge();
  useRAGEventBridge();
  useToolPermissionsEventBridge();

  return <IDELayout />;
}
```

### Advantages

- ✅ **Zero circular dependencies**: Stores only depend on event bus
- ✅ **Loose coupling**: Publishers don't know about subscribers
- ✅ **Async coordination**: Events can be processed asynchronously
- ✅ **Testability**: Each store can be tested in isolation
- ✅ **Scalability**: Easy to add new subscribers without modifying publishers
- ✅ **Cross-MFE support**: Works across Module Federation boundaries

### Disadvantages

- ❌ **Indirection**: Harder to trace data flow
- ❌ **Debugging complexity**: Event-based flows are harder to debug
- ❌ **Ordering not guaranteed**: Events may arrive out of order
- ❌ **Memory leak risk**: Must clean up listeners

### When to Use

- When stores belong to different domain boundaries
- When implementing micro-frontend architecture
- When you need async coordination between stores
- When stores are maintained by different teams

---

## Pattern 2: Selector Composition with Computed State

### Overview

Selector composition uses **zustand-computed-state middleware** to derive state from multiple stores without direct imports. This is ideal for read-only derived state that needs to stay in sync.

### Implementation

#### Step 1: Install Computed State Middleware

```bash
pnpm add zustand-computed-state
```

#### Step 2: Create Computed Store

```typescript
// src/stores/computed-agent-store.ts
import { create } from 'zustand';
import { computed, compute } from 'zustand-computed-state';
import { devtools } from 'zustand/middleware';

// Import stores (circular dependency safe because computed is read-only)
import { useAgentsStore } from './agents-store';
import { useProviderKeysStore } from './provider-keys-store';

type ComputedAgentState = {
  agentsWithProviderStatus: Array<{
    id: string;
    name: string;
    providerId: string;
    hasApiKey: boolean;
  }>;
};

export const useComputedAgentStore = create<ComputedAgentState>()(
  devtools(
    computed((set, get) => ({
      // Define computed properties using compute function
      ...compute(get, () => {
        // Access source stores (read-only)
        const agents = useAgentsStore.getState().agents;
        const providerKeys = useProviderKeysStore.getState().keys;

        // Compute derived state
        const agentsWithProviderStatus = Object.values(agents).map((agent) => ({
          id: agent.id,
          name: agent.name,
          providerId: agent.providerId,
          hasApiKey: !!providerKeys[agent.providerId],
        }));

        return {
          agentsWithProviderStatus,
        };
      }),
    })),
    { name: 'ComputedAgentStore' }
  )
);

// Convenience hook for components
export const useAgentsWithProviderStatus = () =>
  useComputedAgentStore((s) => s.agentsWithProviderStatus);
```

#### Step 3: Alternative: Getters Pattern (More Concise)

```typescript
// src/stores/computed-store-v2.ts
import { create } from 'zustand';
import { computed, compute } from 'zustand-computed-state';

type ComputedState = {
  // Using getters for computed properties
  get agentsWithValidProviders(): AgentWithStatus[];
  get conversationsWithSources(): ConversationWithSources[];
  get ragEnabledSources(): RAGSource[];
};

export const useComputedStore = create<ComputedState>()(
  computed((set) =>
    compute({
      // Getters automatically recalculate when dependencies change
      get agentsWithValidProviders() {
        const agents = useAgentsStore.getState().agents;
        const keys = useProviderKeysStore.getState().keys;

        return Object.values(agents)
          .filter((agent) => !!keys[agent.providerId])
          .map((agent) => ({
            ...agent,
            hasValidKey: true,
          }));
      },

      get conversationsWithSources() {
        const conversations = useConversationStore.getState().conversations;
        const sources = useKnowledgeStore.getState().sources;

        return conversations.map((conv) => ({
          ...conv,
          sourceCount: sources.filter((s) => s.conversationId === conv.id).length,
        }));
      },

      get ragEnabledSources() {
        const sources = useKnowledgeStore.getState().sources;
        const ragConfig = useRAGStore.getState().config;

        return sources.filter((s) => ragConfig.enabledSourceIds.includes(s.id));
      },
    } as ComputedState)
  )
);
```

#### Step 4: Slice Pattern with Computed State

For better modularity, combine Zustand's slice pattern with computed state:

```typescript
// src/stores/slices/computed-agent-slice.ts
import { StateCreator } from 'zustand';
import { compute } from 'zustand-computed-state';

export type ComputedAgentSlice = {
  agentsWithProviderStatus: AgentWithStatus[];
  getAgentById: (id: string) => AgentWithStatus | undefined;
};

export const createComputedAgentSlice: StateCreator<
  CombinedStore,
  [],
  [],
  ComputedAgentSlice
> = (set, get) => ({
  // Computed properties for agent slice only
  ...compute('computed_agent', get, () => {
    const agents = useAgentsStore.getState().agents;
    const keys = useProviderKeysStore.getState().keys;

    return {
      agentsWithProviderStatus: Object.values(agents).map((agent) => ({
        id: agent.id,
        name: agent.name,
        providerId: agent.providerId,
        hasApiKey: !!keys[agent.providerId],
      })),

      getAgentById: (id: string) => {
        const agent = agents[id];
        if (!agent) return undefined;

        return {
          id: agent.id,
          name: agent.name,
          providerId: agent.providerId,
          hasApiKey: !!keys[agent.providerId],
        };
      },
    };
  }),
});

// Compose slices into combined store
export const useCombinedStore = create<CombinedStore>()(
  computed((...args) => ({
    ...createAgentSlice(...args),
    ...createComputedAgentSlice(...args),
    ...createConversationSlice(...args),
  }))
);
```

### Advantages

- ✅ **Type-safe**: Full TypeScript support
- ✅ **Reactive**: Automatically updates when source stores change
- ✅ **Readable**: Computed properties are explicit
- ✅ **Performance**: Computed values are cached
- ✅ **No boilerplate**: Minimal code compared to manual subscriptions

### Disadvantages

- ❌ **Read-only**: Cannot update source stores from computed store
- ❌ **Additional dependency**: Requires `zustand-computed-state` package
- ❌ **Learning curve**: New pattern to learn
- ❌ **Debugging**: Harder to trace computed value updates

### When to Use

- When you need read-only derived state
- When computed values are used in multiple components
- When you want automatic synchronization without manual subscriptions
- When performance matters (computed values are cached)

---

## Pattern 3: React Context Dependency Injection

### Overview

React Context can mediate store interactions without circular dependencies. This pattern is recommended by Zustand documentation for scenarios requiring store initialization from props and testing isolation.

### Implementation

#### Step 1: Create Vanilla Stores

```typescript
// src/stores/vanilla/agent-vanilla-store.ts
import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

interface AgentState {
  agents: Record<string, AgentConfig>;
  actions: {
    updateAgent: (id: string, config: Partial<AgentConfig>) => void;
    deleteAgent: (id: string) => void;
  };
}

export const createAgentStore = (initialAgents?: Record<string, AgentConfig>) => {
  return createStore<AgentState>()(
    devtools(
      (set, get) => ({
        agents: initialAgents || {},
        actions: {
          updateAgent: (id, config) => {
            set((state) => ({
              agents: {
                ...state.agents,
                [id]: { ...state.agents[id], ...config },
              },
            }));
          },
          deleteAgent: (id) => {
            set((state) => {
              const { [id]: removed, ...rest } = state.agents;
              return { agents: rest };
            });
          },
        },
      }),
      { name: 'AgentStore' }
    )
  );
};
```

#### Step 2: Create Context Provider

```typescript
// src/stores/context/store-context.tsx
import { createContext, useContext, useRef } from 'react';
import { StoreApi, useStore } from 'zustand';
import { createAgentStore } from './vanilla/agent-vanilla-store';
import { createProviderKeysStore } from './vanilla/provider-keys-vanilla-store';
import { createConversationStore } from './vanilla/conversation-vanilla-store';

type StoreContextValue = {
  agentStore: StoreApi<ReturnType<typeof createAgentStore>>;
  providerKeysStore: StoreApi<ReturnType<typeof createProviderKeysStore>>;
  conversationStore: StoreApi<ReturnType<typeof createConversationStore>>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider = ({
  children,
  initialAgents,
  initialProviderKeys,
}: {
  children: React.ReactNode;
  initialAgents?: Record<string, AgentConfig>;
  initialProviderKeys?: Record<string, string>;
}) => {
  // Create stores once (useState also works)
  const agentStoreRef = useRef(createAgentStore(initialAgents));
  const providerKeysStoreRef = useRef(createProviderKeysStore(initialProviderKeys));
  const conversationStoreRef = useRef(createConversationStore());

  const contextValue: StoreContextValue = {
    agentStore: agentStoreRef.current,
    providerKeysStore: providerKeysStoreRef.current,
    conversationStore: conversationStoreRef.current,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to access stores
export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within StoreProvider');
  }
  return context;
};

// Atomic hooks for each store
export const useAgentStore = <T,>(
  selector: (state: ReturnType<typeof createAgentStore>['getState']) => T
): T => {
  const { agentStore } = useStoreContext();
  return useStore(agentStore, selector);
};

export const useProviderKeysStore = <T,>(
  selector: (state: ReturnType<typeof createProviderKeysStore>['getState']) => T
): T => {
  const { providerKeysStore } = useStoreContext();
  return useStore(providerKeysStore, selector);
};

export const useConversationStore = <T,>(
  selector: (state: ReturnType<typeof createConversationStore>['getState']) => T
): T => {
  const { conversationStore } = useStoreContext();
  return useStore(conversationStore, selector);
};
```

#### Step 3: Store Coordination via Context

```typescript
// src/stores/context/store-coordinator.ts
import { useEffect } from 'react';
import { useAgentStore } from './store-context';
import { useProviderKeysStore } from './store-context';

/**
 * Coordinator hook that manages cross-store dependencies.
 * This replaces direct store-to-store imports with React-based coordination.
 */
export const useStoreCoordinator = () => {
  const agents = useAgentStore((s) => s.agents);
  const setRequiredProvider = useProviderKeysStore((s) => s.actions.setRequiredProvider);
  const activeConversationId = useConversationStore((s) => s.activeConversationId);

  // Reaction 1: When agents change, mark their providers as required
  useEffect(() => {
    Object.values(agents).forEach((agent) => {
      setRequiredProvider(agent.providerId);
    });
  }, [agents, setRequiredProvider]);

  // Reaction 2: When conversation changes, clear thread cache
  useEffect(() => {
    if (activeConversationId) {
      // Trigger thread refresh
      console.log('Conversation changed, refreshing thread:', activeConversationId);
    }
  }, [activeConversationId]);

  // Reaction 3: When RAG sources update, invalidate related queries
  const ragEnabledSources = useRAGStore((s) => s.enabledSources);

  useEffect(() => {
    if (ragEnabledSources.length > 0) {
      // Invalidate RAG queries
      console.log('RAG sources updated:', ragEnabledSources);
    }
  }, [ragEnabledSources]);
};
```

#### Step 4: Use in Application

```typescript
// src/App.tsx
import { StoreProvider } from '@/stores/context/store-context';
import { useStoreCoordinator } from '@/stores/context/store-coordinator';

function AppInner() {
  // Coordinate stores at application root
  useStoreCoordinator();

  return <IDELayout />;
}

function App() {
  return (
    <StoreProvider
      initialAgents={{}}
      initialProviderKeys={{}}
    >
      <AppInner />
    </StoreProvider>
  );
}
```

#### Step 5: Scoped Provider for Reusability

```typescript
// src/components/agent/AgentConfigPanel.tsx
import { StoreProvider } from '@/stores/context/store-context';

// Component can create its own isolated store instance
function AgentConfigPanel({ agentId }: { agentId: string }) {
  const initialAgent = useAgentStore((s) => s.agents[agentId]);

  return (
    <StoreProvider initialAgents={{ [agentId]: initialAgent }}>
      <AgentConfigPanelInner agentId={agentId} />
    </StoreProvider>
  );
}

// Inner component uses scoped store
function AgentConfigPanelInner({ agentId }: { agentId: string }) {
  const agent = useAgentStore((s) => s.agents[agentId]);
  const updateAgent = useAgentStore((s) => s.actions.updateAgent);

  // This store is isolated to this component instance
  return (
    <div>
      <input
        value={agent.name}
        onChange={(e) => updateAgent(agentId, { name: e.target.value })}
      />
    </div>
  );
}
```

### Advantages

- ✅ **Testing**: Each test gets isolated store instance
- ✅ **Reusability**: Components can have scoped stores
- ✅ **Props initialization**: Stores can be initialized from props
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Explicit dependencies**: All store access goes through context
- ✅ **React integration**: Leverages React's lifecycle for coordination

### Disadvantages

- ❌ **Provider hierarchy**: Must wrap components in providers
- ❌ **More boilerplate**: More code than global stores
- ❌ **React dependency**: Coordination logic is React-specific
- ❌ **Context overhead**: Adds React Context layer

### When to Use

- When you need to test stores in isolation
- When building reusable components with encapsulated state
- When initializing stores from props
- When implementing micro-frontend architecture with scoped state
- When you prefer React-based coordination over pure JavaScript

---

## Pattern 4: Store Subscription Reactions

### Overview

Zustand's built-in `subscribe` method allows stores to react to changes in other stores without direct imports. This pattern is simple and requires no additional dependencies.

### Implementation

#### Step 1: Create Reactions Hook

```typescript
// src/lib/state/store-reactions.ts
import { useEffect } from 'react';
import type { StoreApi } from 'zustand';

/**
 * Creates a reaction from one store to another
 * @param fromStore Source store to listen to
 * @param selector Selector to extract relevant state
 * @param toStore Target store to update
 * @param updater Function to update target store
 */
export function useStoreReaction<TFrom, TTo>(
  fromStore: StoreApi<TFrom>,
  selector: (state: TFrom) => any,
  toStore: StoreApi<TTo>,
  updater: (toStore: TTo, fromValue: any) => void
) {
  useEffect(() => {
    // Initial sync
    updater(toStore.getState(), selector(fromStore.getState()));

    // Subscribe to changes
    const unsubscribe = fromStore.subscribe((state) => {
      const fromValue = selector(state);
      updater(toStore.getState(), fromValue);
    });

    return unsubscribe;
  }, [fromStore, selector, toStore, updater]);
}
```

#### Step 2: Apply Reactions in Components

```typescript
// src/components/ide/AgentsPanel.tsx
import { useStoreReaction } from '@/lib/state/store-reactions';
import { useAgentsStore } from '@/stores/agents-store';
import { useProviderKeysStore } from '@/stores/provider-keys-store';

export function AgentsPanel() {
  const agents = useAgentsStore((s) => s.agents);
  const markProviderRequired = useProviderKeysStore((s) => s.markProviderRequired);

  // Reaction: When agents change, mark their providers as required
  useStoreReaction(
    useAgentsStore,
    (state) => state.agents,
    useProviderKeysStore,
    (providerState, agents) => {
      Object.values(agents).forEach((agent) => {
        providerState.markProviderRequired(agent.providerId);
      });
    }
  );

  return (
    <div>
      {Object.values(agents).map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

#### Step 3: Advanced: Subscribe with Selector Middleware

```typescript
// src/stores/agent-provider-coordinator.ts
import { subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';

// Create coordinator store that listens to other stores
export const useAgentProviderCoordinator = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      requiredProviders: new Set<string>(),

      syncWithAgentsStore: () => {
        const agents = useAgentsStore.getState().agents;
        const providerIds = new Set(Object.values(agents).map((a) => a.providerId));
        set({ requiredProviders: providerIds });
      },
    })),
    { name: 'AgentProviderCoordinator' }
  )
);

// Subscribe to agents store changes
useAgentsStore.subscribe(
  (state) => state.agents,
  (agents) => {
    const coordinator = useAgentProviderCoordinator.getState();
    const providerIds = new Set(Object.values(agents).map((a) => a.providerId));
    coordinator.setRequiredProviders(providerIds);
  }
);
```

### Advantages

- ✅ **Simple**: No additional dependencies or concepts
- ✅ **Direct**: Easy to understand data flow
- ✅ **Built-in**: Uses Zustand's native API
- ✅ **Performant**: Subscribe with selector for granular updates

### Disadvantages

- ❌ **Coupling**: Stores know about each other
- ❌ **Boilerplate**: Need to set up subscriptions for each relationship
- ❌ **Cleanup**: Must unsubscribe to prevent memory leaks
- ❌ **Ordering**: Subscription order matters

### When to Use

- When you have simple 1:1 store relationships
- When you don't want to add event bus dependencies
- When performance is critical (subscribe with selector)
- When migrating from direct imports to decoupled architecture

---

## Pattern 5: Custom Middleware for Coordination

### Overview

Custom Zustand middleware can orchestrate updates across multiple stores. This pattern encapsulates coordination logic in reusable middleware functions.

### Implementation

#### Step 1: Create Cross-Store Middleware

```typescript
// src/lib/state/middleware/cross-store-middleware.ts
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type CrossStoreConfig = {
  stores: {
    agents?: StoreApi<AgentState>;
    providerKeys?: StoreApi<ProviderKeysState>;
    conversations?: StoreApi<ConversationState>;
    knowledge?: StoreApi<KnowledgeState>;
  };
  reactions: Array<{
    from: keyof CrossStoreConfig['stores'];
    selector: (state: any) => any;
    to: keyof CrossStoreConfig['stores'];
    updater: (toState: any, fromValue: any) => void;
  }>;
};

type CrossStore = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: CrossStoreConfig
) => (
  f: StateCreator<T, [...Mps, ['zustand/cross-store', never]], []>
) => StateCreator<T, Mps, []>;

export const crossStore: CrossStore = (config) => (configInitializer) => (set, get, store) => {
  const createdStore = configInitializer(set, get, store);

  // Set up reactions
  config.reactions.forEach((reaction) => {
    const fromStore = config.stores[reaction.from];
    const toStore = config.stores[reaction.to];

    if (fromStore && toStore) {
      fromStore.subscribe((state) => {
        const fromValue = reaction.selector(state);
        reaction.updater(toStore.getState(), fromValue);
      });
    }
  });

  return createdStore;
};
```

#### Step 2: Use Middleware in Store Creation

```typescript
// src/stores/orchestrated-agent-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { crossStore } from '@/lib/state/middleware/cross-store-middleware';
import { useProviderKeysStore } from './provider-keys-store';

export const useOrchestratedAgentStore = create<AgentState & AgentActions>()(
  devtools(
    crossStore({
      stores: {
        providerKeys: useProviderKeysStore,
      },
      reactions: [
        {
          from: 'agents' as const,
          selector: (state: AgentState) => state.agents,
          to: 'providerKeys' as const,
          updater: (providerState: ProviderKeysState, agents: Record<string, AgentConfig>) => {
            const providerIds = new Set(Object.values(agents).map((a) => a.providerId));
            providerState.setRequiredProviders(providerIds);
          },
        },
      ],
    })((set, get) => ({
      agents: {},
      actions: {
        updateAgent: (id, config) => {
          set((state) => ({
            agents: {
              ...state.agents,
              [id]: { ...state.agents[id], ...config },
            },
          }));
        },
      },
    })),
    { name: 'OrchestratedAgentStore' }
  )
);
```

### Advantages

- ✅ **Reusable**: Middleware can be applied to multiple stores
- ✅ **Encapsulated**: Coordination logic is self-contained
- ✅ **Composable**: Can combine with other middleware
- ✅ **Type-safe**: TypeScript support with proper typing

### Disadvantages

- ❌ **Complex**: More difficult to implement and understand
- ❌ **Zustand-specific**: Custom middleware pattern
- ❌ **Limited documentation**: Few examples in the wild

### When to Use

- When you have complex coordination logic that's reused across stores
- When you want to encapsulate cross-store behavior
- When you're comfortable with advanced Zustand patterns

---

## Migration Path

### Phase 1: Audit (Week 1)

1. **Map circular dependencies**
   ```bash
   # Use madge to detect circular imports
   npx madge --circular --extensions ts,tsx src/stores/
   ```

2. **Document store relationships**
   - Create diagram showing current dependencies
   - Identify which stores are "source of truth" vs "derived"
   - Classify dependencies as:
     - **Data flow** (A's state depends on B's state)
     - **Actions flow** (A's action triggers B's action)
     - **Initialization flow** (A needs B during creation)

3. **Choose remediation pattern for each relationship**
   - Event bus: For loose coupling, async coordination
   - Computed state: For read-only derived state
   - Context injection: For testability and reusability
   - Subscription: For simple 1:1 relationships

### Phase 2: Implement Event Bus (Week 2)

1. **Create typed event bus**
   ```typescript
   // src/lib/state/event-bus.ts
   // See Pattern 1 implementation
   ```

2. **Add event emitters to source stores**
   - Identify state changes that other stores care about
   - Emit events after state updates
   - Keep events minimal (include only necessary data)

3. **Create event bridges for dependent stores**
   - Subscribe to events in React hooks
   - Update dependent store state when events fire
   - Ensure cleanup in useEffect return

4. **Initialize event bridges at application root**
   ```typescript
   // src/App.tsx
   function App() {
     useProviderKeysEventBridge();
     useConversationEventBridge();
     useRAGEventBridge();
     // ...
   }
   ```

### Phase 3: Refactor to Computed State (Week 3)

1. **Identify read-only derived state**
   - State that's computed from multiple stores
   - Used in multiple components
   - Needs to stay in sync automatically

2. **Install computed state middleware**
   ```bash
   pnpm add zustand-computed-state
   ```

3. **Create computed stores**
   ```typescript
   // src/stores/computed/computed-agent-store.ts
   // See Pattern 2 implementation
   ```

4. **Migrate components to use computed state**
   - Replace manual composition with computed store
   - Remove complex selectors from components
   - Use atomic hooks from computed store

### Phase 4: Context Migration (Optional, Week 4)

1. **Identify stores that benefit from context**
   - Stores that need initialization from props
   - Stores used in reusable components
   - Stores that need test isolation

2. **Convert to vanilla stores**
   ```typescript
   // src/stores/vanilla/agent-vanilla-store.ts
   import { createStore } from 'zustand/vanilla';
   // See Pattern 3 implementation
   ```

3. **Create context provider**
   ```typescript
   // src/stores/context/store-context.tsx
   // See Pattern 3 implementation
   ```

4. **Update components to use context hooks**
   ```typescript
   // Before
   import { useAgentsStore } from '@/stores/agents-store';

   // After
   import { useAgentStore } from '@/stores/context/store-context';
   ```

### Phase 5: Testing & Validation (Week 5)

1. **Unit tests for each pattern**
   - Event bus: Test event emission and subscription
   - Computed state: Test derived values update correctly
   - Context: Test store isolation and initialization

2. **Integration tests for coordination**
   - Test cross-store reactions
   - Test event ordering
   - Test cleanup and memory leaks

3. **Performance testing**
   - Measure re-render counts before/after
   - Check for memory leaks (listener cleanup)
   - Verify computed state caching works

4. **E2E testing**
   - Verify user flows work correctly
   - Test state persistence across page reloads
   - Test state synchronization across tabs (if applicable)

---

## Project Alpha Implementation Guide

### Current Circular Dependencies

Based on state management audit (`_bmad-output/state-management-audit-p1.10-2025-12-26.md`):

1. **Agent Store → Provider Store**
   - Agent config needs provider keys to validate configuration
   - Currently: `useAgentsStore` imports `useProviderKeysStore`

2. **Conversation Store → Thread Store**
   - Active conversation needs thread state
   - Currently: `useConversationStore` imports `useThreadsStore`

3. **RAG Store → Knowledge Store**
   - RAG configuration needs knowledge source metadata
   - Currently: `useRAGStore` imports `useKnowledgeStore`

4. **Tool Permissions Store → Agents Store**
   - Tool permissions need agent context
   - Currently: `useToolPermissionsStore` imports `useAgentsStore`

### Recommended Pattern Assignment

| Relationship | Current Pattern | Recommended Pattern | Rationale |
|--------------|-----------------|---------------------|-----------|
| Agent ↔ Provider | Direct import | **Event Bus** | Loose coupling, async validation, different domains |
| Conversation → Thread | Direct import | **Computed State** | Read-only derived state, used in multiple components |
| RAG → Knowledge | Direct import | **Event Bus** | Cross-domain coordination, may become async |
| Tool Permissions → Agent | Direct import | **Subscription** | Simple 1:1 relationship, reaction-based |

### Implementation Roadmap

#### Sprint 1: Event Bus Foundation (3 days)

**Day 1: Create Event Bus**
```bash
# Install EventEmitter3
pnpm add eventemitter3

# Create typed event bus
touch src/lib/state/event-bus.ts
```

**Day 2: Implement Agent ↔ Provider Events**
```typescript
// src/stores/agents-store.ts
export const useAgentsStore = create<AgentState & AgentActions>()(
  devtools((set, get) => ({
    agents: {},
    actions: {
      updateAgentProvider: (agentId, providerId) => {
        set((state) => ({
          agents: {
            ...state.agents,
            [agentId]: { ...state.agents[agentId], providerId },
          },
        }));
        // Emit event
        emitAgentProviderChanged(agentId, providerId);
      },
    },
  }))
);

// src/stores/provider-keys-store.ts
export const useProviderKeysEventBridge = () => {
  const markProviderRequired = useProviderKeysStore((s) => s.markProviderRequired);

  useEffect(() => {
    const unsubscribe = onAgentProviderChanged(({ agentId, providerId }) => {
      markProviderRequired(providerId);
    });
    return unsubscribe;
  }, [markProviderRequired]);
};
```

**Day 3: Initialize Event Bridges**
```typescript
// src/App.tsx
function App() {
  useProviderKeysEventBridge();
  // ... other event bridges
  return <IDELayout />;
}
```

#### Sprint 2: Computed State for Conversations (2 days)

**Day 1: Install and Setup**
```bash
pnpm add zustand-computed-state
```

**Day 2: Create Computed Conversation Store**
```typescript
// src/stores/computed/computed-conversation-store.ts
export const useComputedConversationStore = create<ComputedConversationState>()(
  devtools(
    computed((set, get) => ({
      ...compute(get, () => {
        const conversations = useConversationStore.getState().conversations;
        const threads = useThreadsStore.getState().threads;

        return {
          conversationsWithThreadCount: Object.values(conversations).map((conv) => ({
            ...conv,
            threadCount: threads.filter((t) => t.conversationId === conv.id).length,
          })),
        };
      }),
    })),
    { name: 'ComputedConversationStore' }
  )
);
```

#### Sprint 3: RAG Event Coordination (2 days)

**Day 1: Create RAG Events**
```typescript
// src/lib/state/event-bus.ts (extend)
export const emitKnowledgeSourcesUpdated = (sourceIds: string[]) => {
  storeEventBus.emit('knowledge:sources-updated', { sourceIds });
};

export const onKnowledgeSourcesUpdated = (
  handler: (data: { sourceIds: string[] }) => void
) => {
  storeEventBus.on('knowledge:sources-updated', handler);
  return () => storeEventBus.off('knowledge:sources-updated', handler);
};
```

**Day 2: Implement RAG Event Bridge**
```typescript
// src/stores/rag-store.ts
export const useRAGEventBridge = () => {
  const invalidateRAGCache = useRAGStore((s) => s.invalidateCache);

  useEffect(() => {
    const unsubscribe = onKnowledgeSourcesUpdated(({ sourceIds }) => {
      invalidateRAGCache();
    });
    return unsubscribe;
  }, [invalidateRAGCache]);
};
```

#### Sprint 4: Tool Permissions Subscription (1 day)

```typescript
// src/stores/tool-permissions-store.ts
import { useEffect } from 'react';

export const useToolPermissionsReaction = () => {
  const updatePermissionsForAgent = useToolPermissionsStore((s) => s.updateForAgent);

  useEffect(() => {
    // Subscribe to agent store changes
    const unsubscribe = useAgentsStore.subscribe(
      (state) => state.agents,
      (agents) => {
        Object.entries(agents).forEach(([agentId, agent]) => {
          updatePermissionsForAgent(agentId, agent.config);
        });
      }
    );

    return unsubscribe;
  }, [updatePermissionsForAgent]);
};
```

### Testing Strategy

#### Unit Tests

```typescript
// src/lib/state/__tests__/event-bus.test.ts
import { emitAgentProviderChanged, onAgentProviderChanged } from '../event-bus';

describe('Event Bus', () => {
  it('emits and receives agent provider changed events', () => {
    const handler = vi.fn();
    const unsubscribe = onAgentProviderChanged(handler);

    emitAgentProviderChanged('agent-1', 'openai');

    expect(handler).toHaveBeenCalledWith({ agentId: 'agent-1', providerId: 'openai' });

    unsubscribe();
  });
});
```

```typescript
// src/stores/computed/__tests__/computed-conversation-store.test.ts
import { useComputedConversationStore } from '../computed-conversation-store';
import { useConversationStore } from '@/stores/conversation-store';
import { useThreadsStore } from '@/stores/threads-store';

describe('Computed Conversation Store', () => {
  beforeEach(() => {
    useConversationStore.setState({ conversations: { conv1: { id: 'conv1' } } });
    useThreadsStore.setState({ threads: [{ id: 'thread1', conversationId: 'conv1' }] });
  });

  it('computes conversation with thread count', () => {
    const result = useComputedConversationStore.getState().conversationsWithThreadCount;

    expect(result).toEqual([
      { id: 'conv1', threadCount: 1 },
    ]);
  });
});
```

#### Integration Tests

```typescript
// src/stores/__integrations__/agent-provider-coordination.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAgentsStore } from '../agents-store';
import { useProviderKeysStore } from '../provider-keys-store';
import { useProviderKeysEventBridge } from '../provider-keys-store';

describe('Agent ↔ Provider Coordination', () => {
  it('marks provider as required when agent is updated', () => {
    const { result: agentsResult } = renderHook(() => useAgentsStore());
    const { result: providerKeysResult } = renderHook(() => useProviderKeysStore());
    renderHook(() => useProviderKeysEventBridge());

    act(() => {
      agentsResult.current.actions.updateAgentProvider('agent-1', 'openai');
    });

    expect(providerKeysResult.current.requiredProviderIds).toContain('openai');
  });
});
```

### Performance Considerations

1. **Event Bus**
   - EventEmitter3 is highly optimized (≈2KB)
   - No re-render overhead (outside React)
   - Async processing prevents blocking

2. **Computed State**
   - Values are cached until dependencies change
   - No unnecessary recalculations
   - Similar performance to React.memo

3. **Memory Leaks**
   - Always return cleanup function from event bridges
   - Test memory usage with React DevTools Profiler
   - Use `unsubscribe` pattern consistently

---

## Conclusion

### Summary of Patterns

| Pattern | Complexity | Coupling | Performance | Testability | Best For |
|---------|-----------|----------|-------------|-------------|----------|
| **Event Bus** | Medium | Loose | High | High | Async coordination, cross-domain |
| **Computed State** | Low | Medium | High | High | Read-only derived state |
| **Context Injection** | High | Loose | Medium | Very High | Test isolation, reusability |
| **Subscription** | Low | Tight | High | Medium | Simple 1:1 relationships |
| **Middleware** | High | Medium | High | Medium | Reusable coordination logic |

### Recommendations for Project Alpha

1. **Start with Event Bus** for agent-provider and RAG-knowledge coordination
2. **Add Computed State** for conversation-thread derived state
3. **Use Subscription** for simple tool-permissions reactions
4. **Consider Context** if test isolation becomes problematic

### Key Takeaways

- **Zustand is not designed for multi-store coordination** — prefer single store when possible
- **Event-driven architecture** is the most decoupled solution for complex apps
- **Computed state middleware** simplifies derived state without boilerplate
- **React Context** enables test isolation and component reusability
- **Migration should be incremental** — one pattern at a time, with thorough testing

---

## References

### Official Documentation
- [Zustand Official Docs](https://zustand.docs.pmnd.rs/)
- [Zustand Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern)
- [Zustand Middleware](https://zustand.docs.pmnd.rs/guides/advanced-typescript)
- [Zustand Context Injection](https://zustand.docs.pmnd.rs/guides/initialize-state-with-props)

### Third-Party Libraries
- [zustand-computed-state](https://github.com/yasintz/zustand-computed-state) — Computed state middleware
- [EventEmitter3](https://github.com/primus/eventemitter3) — Typed event emitter

### Articles & Resources
- [Zustand and React Context (TkDodo, Apr 2024)](https://tkdodo.eu/blog/zustand-and-react-context)
- [Federated State Done Right (Dec 2025)](https://dev.to/martinrojas/federated-state-done-right-zustand-tanstack-query-and-the-patterns-that-actually-work-27c0)
- [Working with Zustand (TkDodo, Nov 2022)](https://tkdodo.eu/blog/working-with-zustand)
- [Zustand Architecture Patterns at Scale (Feb 2025)](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)
- [State Management in 2025 (Dev.to, Mar 2025)](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)

### GitHub Discussions
- [Zustand circular dependency issue](https://www.reddit.com/r/reactjs/comments/1c9gtjg/zustand_not_sure_how_to_overcome_dependency_cycle/)
- [Make a store reactive to changes in another store #1586](https://github.com/pmndrs/zustand/discussions/1586)
- [Why is context preferred over a store hook for dependency injection #1774](https://github.com/pmndrs/zustand/discussions/1774)

### Project Alpha Artifacts
- `_bmad-output/state-management-audit-p1.10-2025-12-26.md` — State management audit findings
- `AGENTS.md` — Project-specific development patterns
- `CLAUDE.md` — Project overview and architecture

---

**Document Status**: ✅ Research Complete
**Next Steps**: Begin Sprint 1 (Event Bus Foundation)
**Estimated Migration Time**: 3-4 weeks
**Risk Level**: Medium (incremental migration with thorough testing)

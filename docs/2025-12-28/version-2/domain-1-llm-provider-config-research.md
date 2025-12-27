---
date: 2025-12-27
time: 20:31:00
phase: Research
team: Team-A
agent_mode: bmad-bmm-architect
---

# Domain 1: LLM Provider Configuration (CRUD & State Management)
## Research Artifact

**Research ID:** D1-2025-12-27-001
**Version:** 2.0
**Status:** Complete
**Domain:** Knowledge Synthesis - Agent Infrastructure

---

## Executive Summary

This research artifact documents the current implementation, state propagation patterns, and remediation requirements for LLM provider configuration in the Via-gent browser-based IDE. The investigation reveals critical issues with hot-reloading, CRUD operation gaps, and state synchronization failures that prevent immediate UI updates when users configure AI providers.

**Key Findings:**
- **Hot-Reloading Bug**: Configuration updates only visible after navigation due to lack of reactive state binding
- **CRUD Gaps**: Incomplete CRUD surface across agent configuration components
- **State Sync Failures**: Non-atomic state updates causing data loss and race conditions
- **Multi-Provider Race Conditions**: Concurrent model loading without proper synchronization

**Critical Remediation Priorities:**
1. **P0 - Hot-Reloading Fix**: Implement reactive state binding with immediate UI feedback (<100ms)
2. **P0 - Atomic State Updates**: Implement optimistic UI with rollback capability
3. **P1 - Complete CRUD Surface**: Add missing edit/delete operations across all components
4. **P2 - Dynamic UI Feedback**: Real-time validation and reactive bindings for all parameters

---

## Table of Contents

1. [Current Implementation Analysis](#current-implementation-analysis)
2. [Research Findings](#research-findings)
3. [State Propagation Flow Diagram](#state-propagation-flow-diagram)
4. [Critical Issues Analysis](#critical-issues-analysis)
5. [Remediation Specifications](#remediation-specifications)
6. [Technical Recommendations](#technical-recommendations)
7. [Action Items](#action-items)
8. [References](#references)

---

## Current Implementation Analysis

### 1.1 Provider Infrastructure Architecture

#### File: `src/lib/agent/providers/provider-adapter.ts`

**Purpose:** Factory for creating TanStack AI adapters for different LLM providers

**Key Components:**
- `ProviderAdapterFactory` class with adapter caching
- `createAdapter()` method for creating provider-specific adapters
- `testConnection()` for validating API credentials
- Support for custom OpenAI-compatible providers with baseURL and headers

**Implementation Pattern:**
```typescript
export class ProviderAdapterFactory {
    private adapters = new Map<string, OpenAIAdapter>();
    
    createAdapter(providerId: string, config: CustomAdapterConfig): OpenAIAdapter {
        // Creates adapter based on provider type
        const adapter = this.createOpenAICompatibleAdapter(providerConfig, config);
        this.adapters.set(providerId, adapter);
        return adapter;
    }
}
```

**Strengths:**
- Clean abstraction layer for multi-provider support
- Adapter caching prevents duplicate instances
- Type-safe provider configuration

**Weaknesses:**
- No reactive state management for adapter updates
- Cache invalidation mechanism missing

#### File: `src/lib/agent/providers/model-registry.ts`

**Purpose:** Fetches and caches available AI models from provider APIs

**Key Components:**
- `ModelRegistry` class with 5-minute cache TTL
- `getModels()` for fetching models with fallback to defaults
- `getModelsFromCustomEndpoint()` for OpenAI-compatible providers

**Implementation Pattern:**
```typescript
export class ModelRegistry {
    private cache = new Map<string, CacheEntry>();
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
    
    async getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]> {
        // Check cache first, then fetch from API or fallback to defaults
        const cached = this.cache.get(providerId);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.models;
        }
        // Fetch from API or fallback to defaults
    }
}
```

**Strengths:**
- Efficient caching with TTL-based invalidation
- Fallback to default models when API unavailable
- Support for custom endpoints

**Weaknesses:**
- No reactive cache invalidation triggers
- No error handling for failed model fetches
- Cache doesn't propagate to UI components

#### File: `src/lib/agent/providers/credential-vault.ts`

**Purpose:** Secure storage of API keys using Web Crypto API

**Key Components:**
- `CredentialVault` class with AES-GCM encryption
- Master key stored in localStorage
- Encrypted credentials stored in IndexedDB via Dexie

**Implementation Pattern:**
```typescript
export class CredentialVault {
    private masterKey: CryptoKey | null = null;
    
    async storeCredentials(providerId: string, apiKey: string): Promise<void> {
        // Encrypt API key with random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGORITHM, iv },
            this.masterKey,
            encoder.encode(apiKey)
        );
        // Store in IndexedDB
    }
}
```

**Strengths:**
- Strong encryption with AES-GCM
- Secure credential storage in IndexedDB
- Dexie integration for reliable persistence

**Weaknesses:**
- No reactive state updates when credentials change
- No error handling for encryption failures
- UI components not notified of credential changes

### 1.2 State Management Architecture

#### File: `src/stores/agents-store.ts`

**Purpose:** Zustand store with localStorage persistence for agent configurations

**Key Components:**
- `useAgentsStore` hook with persist middleware
- CRUD operations: `addAgent`, `removeAgent`, `updateAgent`, `updateAgentStatus`
- Hydration tracking with `_hasHydrated` flag

**Implementation Pattern:**
```typescript
export const useAgentsStore = create<AgentsState>()(
    persist(
        (set) => ({
            agents: [DEFAULT_AGENT],
            _hasHydrated: false,
            addAgent: (agentData) => {
                const newAgent: Agent = {
                    ...agentData,
                    id: `agt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    tasksCompleted: 0,
                    successRate: 0,
                    tokensUsed: 0,
                };
                set((state) => ({ agents: [...state.agents, newAgent] }));
                return newAgent;
            },
            updateAgent: (id, updates) => {
                set((state) => ({
                    agents: state.agents.map((a) =>
                        a.id === id
                            ? { ...a, ...updates, lastActive: new Date().toISOString() }
                            : a
                    ),
                }));
            },
        }),
        {
            name: 'via-gent-agents',
            version: 1,
            onRehydrateStorage: () => (state) => {
                console.log('[AgentsStore] Rehydrated from storage:', state?.agents?.length, 'agents');
                state?.setHasHydrated(true);
            },
        }
    )
);
```

**Strengths:**
- Zustand provides reactive state management
- localStorage persistence across sessions
- Type-safe CRUD operations

**Weaknesses:**
- No optimistic UI updates
- No error handling for failed operations
- Hydration not reactive to UI components

#### File: `src/hooks/useAgents.ts`

**Purpose:** React hook wrapping Zustand store with memoized callbacks

**Key Components:**
- `useAgents()` hook returning agents, CRUD functions, loading state
- Memoized callbacks for performance

**Implementation Pattern:**
```typescript
export function useAgents() {
    const agents = useAgentsStore((state) => state.agents);
    const hasHydrated = useAgentsStoreHydration();
    const addAgent = useCallback((agentData) => {
        addAgentStore(agentData);
    }, [addAgentStore]);
    const updateAgent = useCallback((id, updates) => {
        updateAgentStore(id, updates);
    }, [updateAgentStore]);
    return {
        agents,
        isLoading: !hasHydrated,
        error: null,
        addAgent,
        removeAgent,
        updateAgentStatus,
        updateAgent,
        refreshAgents,
    };
}
```

**Strengths:**
- Clean hook API for components
- Memoized callbacks prevent unnecessary re-renders
- Loading state for hydration tracking

**Weaknesses:**
- No error handling in hook
- No retry logic for failed operations
- No optimistic updates with rollback

### 1.3 UI Components

#### File: `src/components/agent/AgentConfigDialog.tsx`

**Purpose:** Extensible agent configuration dialog with multi-provider support

**Key Components:**
- Form validation with Zod schema
- Connection testing before saving
- Model loading from provider API or fallback
- API key storage via credential vault
- Support for custom OpenAI-compatible endpoints

**Implementation Pattern:**
```typescript
const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
    const [formData, setFormData] = useState<AgentFormData>(initialFormData);
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    
    const loadModels = useCallback(async (provider: string, directApiKey?: string) => {
        setIsLoadingModels(true);
        try {
            const apiKeyVal = directApiKey ?? await credentialVault.getCredentials(provider);
            if (!apiKeyVal) {
                // Use fallback models
                const freeModels = modelRegistry.getFreeModels();
                setModels(freeModels);
            } else {
                const fetchedModels = await modelRegistry.getModels(provider, apiKeyVal);
                setModels(fetchedModels);
            }
        } catch (error) {
            // Fallback to default models on error
            const freeModels = modelRegistry.getFreeModels();
            setModels(freeModels);
        } finally {
            setIsLoadingModels(false);
        }
    }, [credentialVault, modelRegistry]);
    
    const handleAgentSubmit = async (data: AgentFormData) => {
        // Test connection before saving
        const testResult = await testConnection(data.provider, data.apiKey, data.model);
        if (!testResult.success) {
            // Show error, don't save
            return;
        }
        
        // Save credentials
        await credentialVault.storeCredentials(data.provider, data.apiKey);
        
        // Update agent in store
        const agent = {
            id: agent?.id || generateId(),
            name: data.name,
            provider: data.provider,
            model: data.model,
            // ... other fields
        };
        updateAgent(agent.id, agent);
        
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Form fields */}
            {/* Connection test button */}
            {/* Save button */}
        </Dialog>
    );
};
```

**Strengths:**
- Comprehensive form validation
- Connection testing before saving
- Model loading with fallback
- Credential vault integration

**Weaknesses:**
- **NO REACTIVE STATE BINDING**: Form state not tied to store
- **NO HOT-RELOADING**: Changes only visible after navigation
- **NO ERROR HANDLING**: Silent failures without user feedback
- **NO OPTIMISTIC UPDATES**: UI doesn't update until operation completes

#### File: `src/components/chat/AgentSelector.tsx`

**Purpose:** Dropdown for selecting AI agents in chat interface

**Key Components:**
- Dropdown with agent list
- Status indicator (online/offline/busy)
- Model name display
- Sorting by status and name

**Implementation Pattern:**
```typescript
export function AgentSelector({ agents, selectedAgent, onSelectAgent }: AgentSelectorProps) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    
    const sortedAgents = [...agents].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (b.status === 'online' && a.status !== 'online') return 1;
        return a.name.localeCompare(b.name);
    });
    
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button>
                    {selectedAgent ? (
                        <>
                            <Circle className={getStatusColor(selectedAgent.status)} />
                            <span>{selectedAgent.name}</span>
                            <span>{selectedAgent.model.split('/').pop()}</span>
                        </>
                    ) : (
                        <>
                            <Bot />
                            <span>{t('chat.selectAgent', 'Select Agent')}</span>
                        </>
                    )}
                    <ChevronDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {sortedAgents.map((agent) => (
                    <DropdownMenuItem key={agent.id} onClick={() => onSelectAgent(agent)}>
                        {/* Agent info */}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
```

**Strengths:**
- Clean component API
- Status indicators
- Sorted agent list

**Weaknesses:**
- **NO REACTIVE STATE BINDING**: Component props only, no store integration
- **NO HOT-RELOADING**: Selection changes not reflected immediately
- **NO STATUS SYNC**: Agent status updates don't trigger re-renders

---

## Research Findings

### 2.1 MCP Research: TanStack AI Dynamic Configuration

**Source:** Context7 MCP - TanStack AI Documentation

**Key Findings:**

1. **Dynamic SSE Adapter Configuration**
   - Use `fetchServerSentEvents` with function returns for dynamic URLs and options
   - Configuration evaluated on each request
   - Supports dynamic user IDs and tokens
   
   ```typescript
   const { messages } = useChat({
       connection: fetchServerSentEvents(
           () => `/api/chat?user=${currentUserId}`,
           () => ({
               headers: { Authorization: `Bearer ${getToken()}` },
           })
       ),
   });
   ```

2. **Multi-Provider Initialization**
   - Tree-shakeable adapters for OpenAI, Anthropic, Gemini, Ollama
   - Provider-agnostic handler for dynamic model selection
   - Type-safe model options per provider
   
   ```typescript
   const adapters = {
       openai: openaiText({ apiKey: process.env.OPENAI_API_KEY! }),
       anthropic: anthropicText({ apiKey: process.env.ANTHROPIC_API_KEY! }),
       gemini: geminiText({ apiKey: process.env.GEMINI_API_KEY! }),
       ollama: ollamaText({ host: "http://localhost:11434" }),
   };
   
   export async function POST(request: Request) {
       const { messages, provider = "openai" } = await request.json();
       const stream = chat({
           adapter: adapters[provider],
           model: models[provider],
           messages,
       });
       return toStreamResponse(stream);
   }
   ```

3. **Provider-Specific Model Options**
   - Anthropic: Extended thinking with token budget
   - OpenAI: Response format, logit bias
   - Ollama: Temperature, top_p, top_k, context window size
   
   ```typescript
   const anthropicStream = chat({
       adapter: anthropicText({ apiKey: process.env.ANTHROPIC_API_KEY! }),
       model: "claude-3-5-sonnet-20241022",
       messages,
       providerOptions: {
           thinking: {
               type: "enabled",
               budget_tokens: 2048,
           },
       },
   });
   
   const openaiStream = chat({
       adapter: openaiText({ apiKey: process.env.OPENAI_API_KEY! }),
       model: "gpt-4o",
       messages,
       modelOptions: {
           responseFormat: { type: "json_object" },
           logitBias: { '123': 1.0 },
       },
   });
   ```

4. **Tools Configuration**
   - Tools array for extending model capabilities
   - Tool schema with Zod validation
   - Execute functions for external systems

**Reference:** https://github.com/TanStack/ai

### 2.2 MCP Research: TanStack Router Reactive State Management

**Source:** Deepwiki - TanStack Router Documentation

**Key Findings:**

1. **Search Parameters as State Manager**
   - Search parameters are global, serializable, bookmarkable, shareable
   - Automatically parsed, serialized, validated, and typed
   - Inherited from parent routes
   - Functional updates with `Link` or `useNavigate`
   
   ```typescript
   <Link to="/search" search={(prev) => ({ ...prev, query: 'new search' })}>
       Search for "new search"
   </Link>
   
   navigate({
       to: '/search',
       search: (prev) => ({ ...prev, page: 1 }),
   });
   ```

2. **Reactive Router State**
   - `router.state` is always up to date but **not reactive**
   - Use `useRouterState` hook for reactive state and re-renders
   - Triggers component re-renders when state changes
   
   ```typescript
   function MyComponent() {
       const routerState = useRouterState();
       
       // routerState will trigger re-renders when state changes
       return <div>Current route: {routerState.location.pathname}</div>;
   }
   ```

3. **Data Loading and Caching**
   - Built-in SWR caching layer for route loaders
   - `staleTime` controls data freshness (default: 0ms = always reload)
   - `loaderDeps` defines dependencies for automatic reloads
   
   ```typescript
   export const Route = createFileRoute('/posts')({
       loaderDeps: ({ search: { offset, limit } }) => ({ offset, limit }),
       loader: ({ deps: { offset, limit } }) => fetchPosts({ offset, limit }),
       staleTime: 10_000, // 10 seconds
   });
   ```

4. **Type Safety**
   - 100% inferred TypeScript support
   - Auto-completion and type hints for path params, search params, context
   - Reduces development time and errors

**Reference:** https://deepwiki.com/search/how-does-tanstack-router-handl_bf19f5e9-7ba1-4f3b-9674-bcf21ec98da4

### 2.3 MCP Research: Zustand Hot-Reloading Best Practices

**Source:** Exa Web Search - Zustand State Management 2025

**Key Findings:**

1. **State Not Updating Immediately Issue**
   - Common issue where state changes don't trigger re-renders
   - Root cause: Components not subscribing to store updates properly
   - Solution: Use `useStore` hook with selectors for reactive subscriptions

2. **Zustand Update Pattern**
   - Call `set` function with new state
   - Shallow merge with existing state
   - Triggers re-renders for subscribed components
   
   ```typescript
   const useStore = create((set) => ({
       count: 0,
       increment: () => set((state) => ({ count: state.count + 1 })),
   }));
   
   // Usage in component
   function Counter() {
       const count = useStore((state) => state.count);
       const increment = useStore((state) => state.increment);
       
       return (
           <div>Count: {count}</div>
           <button onClick={increment}>Increment</button>
       </div>
       );
   }
   ```

3. **Hydration with Persist Middleware**
   - `persist` middleware saves state to localStorage
   - `onRehydrateStorage` callback for post-hydration actions
   - Hydration tracking with `_hasHydrated` flag
   
   ```typescript
   export const useStore = create(
       persist(
           (set) => ({ /* state */ }),
           {
               name: 'my-store',
               version: 1,
               onRehydrateStorage: () => (state) => {
                   console.log('[Store] Rehydrated:', state);
                   // Trigger post-hydration actions
               },
           }
       )
   );
   ```

4. **Best Practices for Hot-Reloading**
   - Ensure all components use `useStore` hook with selectors
   - Avoid direct store access outside React components
   - Use `useStore` in component root, pass selectors to children
   - Test state changes trigger re-renders with React DevTools

**References:**
- https://github.com/pmndrs/zustand/discussions/3132
- https://medium.com/@minduladilthushan/resolving-the-state-not-updating-immediately-issue-in-react-js-febf5959c0cf
- https://ekwoster.dev/post/building-scalable-state-management-with-zustand-in-react/
- https://zustand.docs.pmnd.rs/guides/updating-state

---

## State Propagation Flow Diagram

### 3.1 Current State Propagation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         User Action (Configure Agent)                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  AgentConfigDialog Component (Local State)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useState: formData, models, isLoadingModels                   │   │
│  │ handleAgentSubmit:                                       │   │
│  │   1. testConnection(provider, apiKey, model)            │   │
│  │   2. await credentialVault.storeCredentials()          │   │
│  │   3. updateAgent(id, agent)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAgents() Hook (Zustand Store)                          │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │ │ useAgentsStore:                                       │   │
│  │ │   - agents: [Agent[], ...]                      │   │
│  │ │   - addAgent(agentData)                             │   │
│  │ │   - updateAgent(id, updates)                         │   │
│  │ └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AgentSelector Component (Props Only)                         │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │
│  │ │ Props: agents, selectedAgent, onSelectAgent            │   │
│  │  │ - No store subscription                                │   │
│  │  │ - No reactive updates                                   │   │
│  │ └──────────────────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  UI Update (Only After Navigation)                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AgentSelector Re-renders with new selectedAgent      │   │
│  │ - Other components remain unchanged                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  NOTE: Changes NOT visible until user navigates away and back   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Key Issues Identified:**
1. **Local State in Dialog**: `AgentConfigDialog` uses `useState` instead of Zustand store
2. **No Reactive Binding**: Components don't subscribe to store changes
3. **No Optimistic Updates**: UI doesn't update until operation completes
4. **No Error Feedback**: Silent failures without user notification
5. **Navigation Dependency**: Changes only visible after component unmount/remount

### 3.2 Ideal State Propagation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         User Action (Configure Agent)                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AgentConfigDialog Component (Reactive State)                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAgents() Hook (Zustand Store)                          │   │
│  │  - formData: useStore((s) => s.formData)           │   │
│  │  - models: useStore((s) => s.models)                │   │
│  │  - isLoadingModels: useStore((s) => s.isLoadingModels) │   │
│  │  │                                                          │   │
│  │  handleAgentSubmit:                                      │   │
│  │   1. testConnection(provider, apiKey, model)            │   │
│  │   2. await credentialVault.storeCredentials()          │   │
│  │   3. setFormData({ ... })  ← IMMEDIATE UPDATE    │   │
│  │   4. updateAgent(id, agent) ← IMMEDIATE UPDATE    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AgentSelector Component (Reactive State)                        │
│  │  - selectedAgent: useStore((s) => s.selectedAgent)   │   │
│  │  - agents: useStore((s) => s.agents)              │   │
│  │                                                          │   │
│  │  ← IMMEDIATE RE-RENDER ON STORE UPDATE            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ UI Update (Immediate)                                          │
│  │  - AgentSelector shows new selectedAgent immediately         │
│  │  - All subscribed components re-render simultaneously     │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. **Reactive State Binding**: All state derived from Zustand store
2. **Immediate UI Feedback**: Changes visible within 100ms
3. **Optimistic Updates**: UI updates immediately, with rollback on failure
4. **Error Handling**: User notifications for all operations
5. **No Navigation Dependency**: Changes visible without navigation

---

## Critical Issues Analysis

### 4.1 Hot-Reloading Bug (P0)

**Symptom:** Configuration updates only visible after navigating away and back to the configuration page.

**Root Cause Analysis:**
1. **Local State in Dialog**: [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) uses `useState` for form data and models instead of Zustand store
2. **No Reactive Binding**: Component doesn't subscribe to store changes
3. **State Update Flow**: 
   - User submits form → `updateAgent()` called in store
   - Store updates localStorage
   - [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx) doesn't re-render because it doesn't subscribe to store
   - User must navigate away and back to trigger re-render
4. **No Optimistic UI**: Form doesn't update until operation completes

**Impact:**
- **User Experience**: Poor - changes not visible immediately
- **Confusion**: Users may think operation failed
- **Lost Trust**: Silent failures without feedback erode confidence

**Affected Components:**
- [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)
- [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx)
- [`AgentsPanel.tsx`](src/components/ide/AgentsPanel.tsx)

### 4.2 CRUD Operation Gaps (P1)

**Symptom:** Many components lack full CRUD surface (add/view/edit/delete operations).

**Root Cause Analysis:**
1. **AgentSelector**: Only supports selection, no edit/delete
2. **AgentConfigDialog**: Only supports add, no edit/delete
3. **AgentsPanel**: May have incomplete CRUD operations
4. **No Consistent Pattern**: Each component implements CRUD differently

**Impact:**
- **Limited Functionality**: Users cannot edit or delete agents after creation
- **Poor UX**: Inconsistent patterns across components
- **Maintenance Burden**: Code duplication and inconsistency

**Missing Operations:**
- Edit agent name, model, API key
- Delete agent
- Duplicate agent
- Reorder agents
- Bulk operations

### 4.3 State Synchronization Failures (P0)

**Symptom:** Edits to persistent values lost due to non-atomic state updates.

**Root Cause Analysis:**
1. **No Atomic Updates**: Multiple concurrent state updates can cause race conditions
2. **No Optimistic UI**: UI doesn't update until operation completes
3. **No Rollback**: Failed operations leave UI in inconsistent state
4. **No Error Handling**: Silent failures without user notification or rollback

**Impact:**
- **Data Loss**: User changes can be lost if operation fails
- **Inconsistent State**: Different components show different states
- **Poor UX**: No feedback on operation status
- **Lost Trust**: Users lose confidence in the application

**Affected Scenarios:**
- Connection test fails but credentials saved
- Model loading fails but partial state updated
- Multiple concurrent edits to same agent
- Network interruption during save operation

### 4.4 Dynamic UI Feedback Missing (P2)

**Symptom:** Labels and statistics don't update during user input.

**Root Cause Analysis:**
1. **No Reactive Bindings**: Form fields not bound to store state
2. **No Real-time Validation**: Validation only on form submit
3. **No Progress Indicators**: No loading states for async operations
4. **No Error Feedback**: Silent validation failures

**Impact:**
- **Poor UX**: Users don't know if input is valid
- **Delayed Feedback**: Errors only visible on form submit
- **Confusion**: Users may submit invalid data multiple times
- **Lost Trust**: Unclear what's happening during operations

**Affected Components:**
- [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)
- All form-based configuration components

### 4.5 Multi-Provider Race Conditions (P2)

**Symptom:** Concurrent model loading without proper synchronization.

**Root Cause Analysis:**
1. **No Loading State Tracking**: `isLoadingModels` state not shared across components
2. **No Error Handling**: Failed model loads don't trigger fallback
3. **No Cache Invalidation**: Model cache doesn't invalidate when provider changes
4. **No Concurrent Control**: Multiple components can trigger simultaneous loads

**Impact:**
- **Performance Issues**: Duplicate API calls
- **Inconsistent State**: Different components may have different model lists
- **Poor UX**: Loading states not coordinated
- **API Rate Limiting**: Potential provider API throttling

**Affected Scenarios:**
- User switches provider while models are loading
- Multiple components load models simultaneously
- Provider switch triggers model reload
- Failed API calls without proper retry logic

---

## Remediation Specifications

### 5.1 Hot-Reloading Fix (P0)

**Objective:** Ensure configuration updates are immediately visible in UI without requiring navigation.

**Technical Specification:**

1. **Reactive State Binding for AgentConfigDialog**
   ```typescript
   const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
       // Bind to Zustand store instead of local state
       const formData = useAgentsStore((s) => {
           agents: s.agents.find(a => a.id === agent?.id)
       });
       
       const setFormData = useAgentsStore((s) => s.setFormData);
       
       const models = useAgentsStore((s) => s.models);
       const setModels = useAgentsStore((s) => s.setModels);
       
       const isLoadingModels = useAgentsStore((s) => s.isLoadingModels);
       const setIsLoadingModels = useAgentsStore((s) => s.setIsLoadingModels);
       
       // All state now reactive and immediately updates UI
       return (
           <Dialog open={open} onOpenChange={onOpenChange}>
               {/* Form fields bound to store state */}
           </Dialog>
       );
   };
   ```

2. **Store Schema Extension**
   ```typescript
   interface AgentsState {
       agents: Agent[];
       _hasHydrated: boolean;
       
       // Add form state for dialog
       formData: AgentFormData | null;
       models: ModelInfo[];
       isLoadingModels: boolean;
       
       setFormData: (data: AgentFormData | null) => void;
       setModels: (models: ModelInfo[]) => void;
       setIsLoadingModels: (loading: boolean) => void;
   }
   ```

3. **Acceptance Criteria:**
   - Configuration updates visible within 100ms of user action
   - All components subscribing to store changes re-render simultaneously
   - No navigation required to see changes
   - State persists across sessions via localStorage

### 5.2 Atomic State Updates with Optimistic UI (P0)

**Objective:** Ensure state updates are atomic with immediate UI feedback and rollback capability.

**Technical Specification:**

1. **Optimistic Update Pattern**
   ```typescript
   const updateAgent = async (id: string, updates: Partial<Agent>) => {
       // Create optimistic copy
       const optimisticAgent = {
           ...useAgentsStore.getState().agents.find(a => a.id === id),
           ...updates,
           lastActive: new Date().toISOString(),
       };
       
       // Update store immediately
       useAgentsStore.getState().setAgents(
           useAgentsStore.getState().agents.map(a =>
               a.id === id ? optimisticAgent : a
           )
       );
       
       // Execute operation in background
       try {
           await credentialVault.storeCredentials(provider, apiKey);
           // Update with actual result
           useAgentsStore.getState().updateAgent(id, updates);
       } catch (error) {
           // Rollback to previous state
           useAgentsStore.getState().setAgents(previousAgents);
           // Show error notification
           toast.error('Failed to save credentials');
       }
   };
   ```

2. **Error Handling with Rollback**
   ```typescript
   interface OperationResult {
       success: boolean;
       error?: Error;
       previousState?: Agent[];
   }
   
   const executeWithRollback = async (
       operation: () => Promise<OperationResult>
   ): Promise<OperationResult> => {
       const previousState = useAgentsStore.getState().agents;
       
       try {
           await operation();
           return { success: true };
       } catch (error) {
           // Rollback to previous state
           useAgentsStore.getState().setAgents(previousState);
           return { success: false, error, previousState };
       }
   };
   ```

3. **Acceptance Criteria:**
   - All state updates use optimistic pattern with rollback
   - UI updates immediately (<100ms)
   - Error notifications shown to user
   - State always consistent even on failure
   - No data loss from failed operations

### 5.3 Complete CRUD Surface (P1)

**Objective:** Implement full CRUD operations (add/view/edit/delete) across all agent configuration components.

**Technical Specification:**

1. **Store CRUD Operations**
   ```typescript
   interface AgentsState {
       agents: Agent[];
       
       // Existing operations
       addAgent: (agentData) => Agent;
       removeAgent: (id) => void;
       updateAgent: (id, updates) => void;
       
       // New operations
       editAgent: (id, updates) => void;
       duplicateAgent: (id) => Agent;
       reorderAgents: (ids: string[]) => void;
       bulkDeleteAgents: (ids: string[]) => void;
   }
   ```

2. **AgentSelector with Edit/Delete**
   ```typescript
   export function AgentSelector({ agents, selectedAgent, onSelectAgent, onEditAgent, onDeleteAgent }: AgentSelectorProps) {
       const { t } = useTranslation();
       const [open, setOpen] = useState(false);
       
       const handleEdit = (agent: Agent) => {
           // Open edit dialog
           onEditAgent?.(agent);
           setOpen(false);
       };
       
       const handleDelete = async (agent: Agent) => {
           if (!confirm(`Delete agent ${agent.name}?`)) return;
           await removeAgent(agent.id);
           toast.success(`Deleted ${agent.name}`);
       };
       
       return (
           <DropdownMenu open={open} onOpenChange={setOpen}>
               <DropdownMenuTrigger asChild>
                   <Button>
                       {selectedAgent ? (
                           <>
                               <Circle className={getStatusColor(selectedAgent.status)} />
                               <span>{selectedAgent.name}</span>
                               <span>{selectedAgent.model.split('/').pop()}</span>
                           </>
                       ) : (
                           <>
                               <Bot />
                               <span>{t('chat.selectAgent', 'Select Agent')}</span>
                           </>
                       )}
                   </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                   {sortedAgents.map((agent) => (
                       <DropdownMenuItem key={agent.id} onClick={() => onSelectAgent(agent)}>
                           <div className="flex items-center justify-between">
                               <div>
                                   <Circle className={getStatusColor(agent.status)} />
                                   <span>{agent.name}</span>
                                   <span>{agent.model.split('/').pop()}</span>
                               </div>
                               <div className="flex gap-2">
                                   <Button variant="ghost" size="sm" onClick={() => handleEdit(agent)}>
                                       <Edit />
                                   </Button>
                                   <Button variant="ghost" size="sm" onClick={() => handleDelete(agent)}>
                                       <Trash2 />
                                   </Button>
                               </div>
                           </DropdownMenuItem>
                   ))}
               </DropdownMenuContent>
           </DropdownMenu>
       </DropdownMenu>
   );
   }
   ```

3. **AgentConfigDialog with Edit Mode**
   ```typescript
   const AgentConfigDialog = ({ open, onOpenChange, agent, mode }: AgentConfigDialogProps) => {
       const formData = useAgentsStore((s) => ({
           agents: s.agents.find(a => a.id === agent?.id)
       }));
       
       const handleSubmit = async (data: AgentFormData) => {
           if (mode === 'edit') {
               // Update existing agent
               updateAgent(agent.id, data);
           } else {
               // Create new agent
               addAgent(data);
           }
       };
       
       return (
           <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogHeader>
                   <DialogTitle>
                       {mode === 'edit' ? 'Edit Agent' : 'Add Agent'}
                   </DialogTitle>
                   <DialogContent>
                       {/* Form fields */}
                       <DialogFooter>
                           <Button onClick={handleSubmit}>
                               {mode === 'edit' ? 'Save Changes' : 'Create Agent'}
                           </Button>
                       </DialogFooter>
                   </DialogContent>
           </Dialog>
       );
   };
   ```

4. **Acceptance Criteria:**
   - All components support full CRUD operations
   - Consistent UI patterns across components
   - Delete operations require confirmation
   - Edit operations open configuration dialog
   - State updates are reactive and immediate

### 5.4 Dynamic UI Feedback (P2)

**Objective:** Provide real-time validation and reactive bindings for all form parameters.

**Technical Specification:**

1. **Reactive Form Validation**
   ```typescript
   const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
       const formData = useAgentsStore((s) => => ({
           agents: s.agents.find(a => a.id === agent?.id)
       }));
       
       // Real-time validation
       const [errors, setErrors] = useState<Record<string, string>>({});
       const [isValidating, setIsValidating] = useState(false);
       
       const validateField = async (field: string, value: string) => {
           setIsValidating(true);
           try {
               // Validate against provider API
               const isValid = await testConnection(provider, apiKey, model);
               setErrors(prev => ({ ...prev, [field]: isValid ? '' : 'Invalid' }));
           } catch (error) {
               setErrors(prev => ({ ...prev, [field]: error.message }));
           } finally {
               setIsValidating(false);
           }
       };
       
       return (
           <Dialog>
               <Input
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   onBlur={() => validateField('name', e.target.value)}
                   error={errors.name}
                   helperText={errors.name}
                   isInvalid={!!errors.name}
               />
           </Dialog>
       );
   };
   ```

2. **Progress Indicators**
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
       const [progress, setProgress] = useState(0);
       
   const handleSave = async () => {
           setIsLoading(true);
           setProgress(20); // "Testing connection..."
           
           try {
               await testConnection(provider, apiKey, model);
               setProgress(60); // "Saving..."
               await credentialVault.storeCredentials(provider, apiKey);
               setProgress(80); // "Complete!"
           } catch (error) {
               setProgress(0);
               toast.error(error.message);
           } finally {
               setIsLoading(false);
           }
       };
       
       return (
           <Button onClick={handleSave} disabled={isLoading}>
               {isLoading ? 'Saving...' : 'Save'}
               <Progress value={progress} />
           </Button>
       );
   ```

3. **Acceptance Criteria:**
   - All form fields have real-time validation
   - Progress indicators for async operations
   - Error messages shown immediately
   - Loading states prevent duplicate operations
   - Feedback provided within 100ms

### 5.5 Multi-Provider Synchronization (P2)

**Objective**: Prevent race conditions and ensure consistent model loading across components.

**Technical Specification:**

1. **Shared Loading State**
   ```typescript
   interface AgentsState {
       agents: Agent[];
       
       // Loading state
       isLoadingModels: boolean;
       loadingProvider: string | null;
       loadingError: Error | null;
       
       setLoadingModels: (loading: boolean) => void;
       setLoadingProvider: (provider: string | null) => void;
       setLoadingError: (error: Error | null) => void;
   }
   ```

2. **Coordinated Model Loading**
   ```typescript
   const loadModelsForProvider = async (provider: string) => {
       setLoadingProvider(provider);
       
       try {
           const apiKey = await credentialVault.getCredentials(provider);
           const models = await modelRegistry.getModels(provider, apiKey);
           setModels(models);
       } catch (error) {
           setLoadingError(error);
           setModels(modelRegistry.getFreeModels());
       } finally {
           setLoadingModels(false);
       }
   };
   ```

3. **Cache Invalidation**
   ```typescript
   const handleProviderChange = (newProvider: string) => {
       // Invalidate model cache when provider changes
       setModels([]);
       // Reload models for new provider
       loadModelsForProvider(newProvider);
   };
   ```

4. **Acceptance Criteria:**
   - Single loading state prevents concurrent loads
   - Error handling with fallback to default models
   - Cache invalidation on provider changes
   - Consistent model state across all components
   - User feedback for loading errors

---

## Technical Recommendations

### 6.1 Architecture Recommendations

1. **Implement Reactive State Binding Pattern**
   - All configuration components should derive state from Zustand store
   - Use `useStore` hook with selectors for reactive subscriptions
   - Avoid local state in favor of store state
   - Ensure store updates trigger immediate UI re-renders

2. **Implement Optimistic UI Pattern**
   - All state-changing operations should use optimistic updates
   - Create optimistic copy of state before operation
   - Update store immediately for UI feedback
   - Rollback on failure with error notification
   - Always show loading states during async operations

3. **Implement Complete CRUD Surface**
   - Define consistent CRUD operations in store schema
   - Implement edit, delete, duplicate, reorder operations
   - Add confirmation dialogs for destructive operations
   - Ensure all components support full CRUD operations
   - Use consistent UI patterns across components

4. **Implement Real-Time Validation**
   - Add real-time validation for all form fields
   - Show progress indicators for async operations
   - Display error messages immediately
   - Use debounced validation to prevent excessive API calls
   - Provide clear feedback for validation status

5. **Implement Multi-Provider Synchronization**
   - Add shared loading state to prevent concurrent loads
   - Implement cache invalidation on provider changes
- Coordinate model loading across components
   - Add error handling with fallback to defaults
   - Show loading states consistently

### 6.2 Implementation Priorities

**Priority 1 (P0): Hot-Reloading Fix**
- Implement reactive state binding for all configuration components
- Ensure immediate UI updates (<100ms)
- Test that changes are visible without navigation

**Priority 2 (P0): Atomic State Updates**
- Implement optimistic UI pattern with rollback
- Add error handling and notifications
- Ensure state consistency across all operations

**Priority 3 (P1): Complete CRUD Surface**
- Add edit and delete operations to all components
- Implement confirmation dialogs
- Ensure consistent UI patterns

**Priority 4 (P2): Dynamic UI Feedback**
- Add real-time validation for all form fields
- Implement progress indicators
- Show error messages immediately
- Add loading states for async operations

**Priority 5 (P2): Multi-Provider Synchronization**
- Implement shared loading state
- Add cache invalidation
- Coordinate model loading
- Add error handling with fallback

### 6.3 Testing Strategy

1. **Unit Tests**
   - Test store operations (add, update, remove, edit)
   - Test optimistic updates with rollback
   - Test error handling and notifications
   - Test reactive state binding

2. **Integration Tests**
   - Test hot-reloading with component re-renders
   - Test CRUD operations across components
   - Test multi-provider synchronization
   - Test form validation and feedback

3. **E2E Tests**
   - Test complete configuration workflow
   - Test provider switching
   - Test model loading and caching
   - Test error handling and rollback

---

## Action Items

### 7.1 Immediate Actions (P0)

- [ ] Implement reactive state binding in [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)
- [ ] Add optimistic UI pattern to store operations
- [ ] Implement real-time validation for form fields
- [ ] Add progress indicators for async operations
- [ ] Test hot-reloading with component re-renders

### 7.2 Short-Term Actions (P1)

- [ ] Extend store schema with form state (formData, models, isLoadingModels)
- [ ] Add edit and delete operations to store
- [ ] Implement AgentSelector with edit/delete buttons
- [ ] Add edit mode to AgentConfigDialog
- [ ] Implement confirmation dialogs for destructive operations

### 7.3 Medium-Term Actions (P1)

- [ ] Implement multi-provider loading state synchronization
- [ ] Add cache invalidation on provider changes
- [ ] Coordinate model loading across components
- [ ] Add error handling with fallback for failed loads
- [ ] Test optimistic updates with rollback
- [ ] Test CRUD operations across components
- [ ] Write integration tests for state management

### 7.4 Long-Term Actions (P2)

- [ ] Refactor all configuration components to use reactive state binding
- [ ] Implement complete CRUD surface across all components
- [ ] Add comprehensive error handling and notifications
- [ ] Implement real-time validation for all form fields
- [ ] Write E2E tests for configuration workflow
- [ ] Document state management patterns in AGENTS.md

---

## References

### 8.1 Documentation References

1. **TanStack AI Documentation**
   - https://github.com/TanStack/ai
   - Dynamic SSE adapter configuration
   - Multi-provider initialization
   - Provider-specific model options
   - Tools configuration

2. **TanStack Router Documentation**
   - https://deepwiki.com/search/how-does-tanstack-router-handl_bf19f5e9-7ba1-4f3b-9674-bcf21ec98da4
   - Search parameters as state manager
   - Reactive router state with `useRouterState`
   - Data loading and caching with SWR
   - Type safety and inferred types

3. **Zustand Documentation**
   - https://zustand.docs.pmnd.rs/guides/updating-state
   - State update patterns
   - Hydration with persist middleware
   - Best practices for reactive state management

4. **Project Documentation**
   - [`AGENTS.md`](AGENTS.md) - Project-specific development patterns
   - [`CLAUDE.md`](CLAUDE.md) - Core guidance for Claude Code
   - [`docs/2025-12-23/`](docs/2025-12-23/) - Comprehensive technical documentation

### 8.2 Code References

1. **Provider Infrastructure**
   - [`src/lib/agent/providers/provider-adapter.ts`](src/lib/agent/providers/provider-adapter.ts)
   - [`src/lib/agent/providers/model-registry.ts`](src/lib/agent/providers/model-registry.ts)
   - [`src/lib/agent/providers/credential-vault.ts`](src/lib/agent/providers/credential-vault.ts)

2. **State Management**
   - [`src/stores/agents-store.ts`](src/stores/agents-store.ts)
   - [`src/hooks/useAgents.ts`](src/hooks/useAgents.ts)

3. **UI Components**
   - [`src/components/agent/AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)
   - [`src/components/chat/AgentSelector.tsx`](src/components/chat/AgentSelector.tsx)
   - [`src/components/ide/AgentsPanel.tsx`](src/components/ide/AgentsPanel.tsx)

### 8.3 Research Artifacts

- **TanStack AI Research**: Context7 MCP - Dynamic model fetching and multi-provider support
- **TanStack Router Research**: Deepwiki - Reactive state management patterns
- **Zustand Research**: Exa - Hot-reloading best practices 2025

---

## Appendix A: State Management Patterns

### A.1 Current State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    Persistence Layers                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  localStorage (Agent Configurations)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAgentsStore (Zustand + persist)                     │   │
│  │ - agents: [Agent[], ...]                           │   │
│  │ - _hasHydrated: boolean                             │   │
│  │ - CRUD operations: add, remove, update, updateStatus    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  IndexedDB (Project Metadata)                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ProjectStore (Dexie)                                     │   │
│  │ - Projects: Project[]                                  │   │
│  │ - Conversations: Conversation[]                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ IndexedDB (Credentials)                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CredentialVault (Dexie)                                 │
│  │ - Encrypted API keys per provider                     │   │
│  │ - Master key in localStorage                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### A.2 State Propagation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  User Action → Store Update → Component Re-render             │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Current (Non-Reactive)                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. User submits form                                    │   │
│  │ 2. updateAgent() called in store                      │   │
│  │ 3. Store updates localStorage                            │   │
│  │ 4. Components NOT subscribed → No re-render        │   │
│  │ 5. User must navigate → Component re-renders       │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ Proposed (Reactive)                                        │
│  │ 1. User submits form                                    │   │
│  │ 2. setFormData() called in store ← IMMEDIATE UPDATE   │   │
│  │ 3. Store updates localStorage                            │   │
│ │ 4. Components subscribed → IMMEDIATE re-render    │   │
│  │ 5. User sees changes immediately                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: CRUD Operations Matrix

### B.1 Current CRUD Coverage

| Component | Add | View | Edit | Delete | Notes |
|-----------|-----|------|------|--------|
| [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx) | ✅ | ✅ | ❌ | ❌ | Selection only |
| [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) | ✅ | ❌ | ❌ | ❌ | Add only |
| [`AgentsPanel.tsx`](src/components/ide/AgentsPanel.tsx) | Unknown | ✅ | ❌ | ❌ | Needs investigation |
| [`useAgentsStore`](src/stores/agents-store.ts) | ✅ | ✅ | ✅ | ✅ | Store operations only |

### B.2 Required CRUD Operations

| Operation | Current Status | Required Action | Priority |
|-----------|---------------|----------------|----------|
| Edit Agent | ❌ Missing | Implement in store and UI | P1 |
| Delete Agent | ❌ Missing | Implement in store and UI | P1 |
| Duplicate Agent | ❌ Missing | Implement in store and UI | P2 |
| Reorder Agents | ❌ Missing | Implement in store and UI | P2 |
| Bulk Delete | ❌ Missing | Implement in store and UI | P2 |

---

## Appendix C: Error Scenarios

### C.1 Current Error Handling

| Scenario | Current Behavior | Required Behavior |
|-----------|----------------|----------------|
| Connection test fails | Silent failure | Show error toast |
| Model loading fails | Silent fallback | Show error toast |
| Credential save fails | Silent failure | Show error toast + retry |
| Network interruption | Silent failure | Show error toast + retry |
| Validation fails | No feedback | Show inline error + helper text |
| Delete operation fails | No feedback | Show error toast |

### C.2 Error Recovery Patterns

| Error Type | Recovery Pattern | Implementation Priority |
|-----------|----------------|--------------------------|
| Connection Error | Retry 3x with exponential backoff | P1 |
| Model Load Error | Fallback to default models | P1 |
| Credential Error | Show error + prompt for re-entry | P1 |
| Network Error | Show error + auto-retry | P1 |
| Validation Error | Show inline error + fix suggestions | P2 |

---

## Glossary

- **Agent**: AI configuration entity with provider, model, API key, and metadata
- **Provider Adapter**: TanStack AI adapter factory for different LLM providers
- **Model Registry**: Caching layer for available AI models from provider APIs
- **Credential Vault**: Secure storage for API keys using encryption
- **Zustand Store**: State management library with localStorage persistence
- **Optimistic UI**: Pattern of showing expected state immediately while operation completes in background
- **Hot-Reloading**: Immediate UI updates when state changes without requiring navigation
- **CRUD**: Create, Read, Update, Delete operations on data entities
- **Reactive State**: State that triggers component re-renders when it changes
- **Atomic Update**: State update that completes entirely or not at all

---

## Document Control

**Version:** 2.0
**Last Updated:** 2025-12-27T20:31:00Z
**Author:** BMAD Architect Mode
**Review Status:** Draft
**Next Review:** BMAD Master

---

**End of Document**

# Target Architecture Specification
## Via-gent Agent Configuration & LLM Provider System

**Date**: 2025-12-28
**Version**: 2.0
**Status**: PROPOSED

---

## 1. Overview

This document specifies the target architecture for the Via-gent IDE's LLM provider configuration, agent management, and state persistence systems, addressing critical issues identified in the investigation phase.

---

## 2. Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Single Source of Truth** | Zustand stores as primary state source |
| **Local-First** | All data persisted locally via Dexie.js |
| **Hot-Reload** | Configuration changes reflect immediately |
| **Security** | AES-GCM encryption for credentials |
| **Provider Agnostic** | Unified adapter interface |

---

## 3. LLM Provider System

### 3.1 Provider Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Provider Configuration Layer                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ useProviderStore (Zustand)                                                   │
│   ├── providers: ProviderConfig[]                                            │
│   ├── activeProvider: string                                                 │
│   ├── addProvider(config)                                                    │
│   ├── updateProvider(id, config)                                             │
│   ├── removeProvider(id)                                                     │
│   └── setActiveProvider(id)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ CredentialVault (Secure Storage)                                            │
│   ├── storeCredentials(providerId, apiKey)                                  │
│   ├── getCredentials(providerId)                                            │
│   └── deleteCredentials(providerId)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ModelRegistry (Dynamic Discovery)                                            │
│   ├── getModels(providerId, apiKey?)                                        │
│   ├── getDefaultModels(providerId)                                          │
│   └── clearCache(providerId?)                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ProviderAdapterFactory                                                       │
│   ├── createAdapter(providerId, config)                                     │
│   └── testConnection(providerId)                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Provider Store Schema

```typescript
// src/lib/state/provider-store.ts

interface ProviderState {
    /** Configured providers */
    providers: ProviderConfig[];
    
    /** Currently active provider ID */
    activeProviderId: string | null;
    
    /** Model settings per provider */
    modelSettings: Record<string, ModelSettings>;
    
    /** Loading states */
    isLoading: boolean;
    
    // Actions
    addProvider: (config: ProviderConfig) => Promise<void>;
    updateProvider: (id: string, config: Partial<ProviderConfig>) => Promise<void>;
    removeProvider: (id: string) => Promise<void>;
    setActiveProvider: (id: string) => void;
    updateModelSettings: (providerId: string, settings: ModelSettings) => void;
}

interface ModelSettings {
    model: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;
}

export const useProviderStore = create<ProviderState>()(
    persist(
        (set, get) => ({
            providers: Object.values(PROVIDERS).filter(p => p.enabled),
            activeProviderId: 'openrouter',
            modelSettings: {},
            isLoading: false,
            
            addProvider: async (config) => {
                set((state) => ({
                    providers: [...state.providers, config]
                }));
            },
            
            updateProvider: async (id, config) => {
                set((state) => ({
                    providers: state.providers.map(p => 
                        p.id === id ? { ...p, ...config } : p
                    )
                }));
            },
            
            // ... other actions
        }),
        {
            name: 'via-gent-providers',
            storage: createDexieStorage('providerConfigs')
        }
    )
);
```

### 3.3 Provider Configuration UI Flow

```
User opens Settings → Provider Tab
    ↓
List all configured providers (from useProviderStore)
    ↓
User clicks "Add Provider"
    ↓
ProviderConfigDialog opens
    ↓
User fills form → submits
    ↓
Validate API key (testConnection)
    ↓
Store credentials (CredentialVault)
    ↓
Add to store (useProviderStore.addProvider)
    ↓
UI updates immediately (Zustand subscription)
```

---

## 4. Agent Configuration System

### 4.1 Multi-Layer Agent Architecture

```typescript
interface AgentConfig {
    id: string;
    name: string;
    
    // Layer 1: System Instruction
    systemPrompt: string;
    
    // Layer 2: Domain Instructions
    domainInstructions?: string;
    workflowSteps?: string[];
    
    // Layer 3: Tool Configuration
    tools: {
        enabled: string[];           // Tool IDs
        domainTools?: string[];      // Agent-specific tools
        permissions: ToolPermissions;
    };
    
    // Layer 4: Custom Role
    customRole?: {
        name: string;
        description: string;
        pinnedToRequest: boolean;    // If true, append to every request
    };
    
    // Layer 5: Custom Instructions
    customInstructions?: {
        visible: string;             // Shown in chat
        hidden: string;              // Hidden context injection
    };
    
    // Provider settings
    provider: {
        id: string;
        model: string;
        temperature?: number;
        maxTokens?: number;
    };
    
    // Metadata
    status: 'online' | 'offline' | 'busy';
    createdAt: Date;
    updatedAt: Date;
}
```

### 4.2 Agent Store

```typescript
// src/lib/state/agent-store.ts

interface AgentState {
    agents: AgentConfig[];
    activeAgentId: string | null;
    isLoading: boolean;
    
    // CRUD Operations
    createAgent: (config: AgentConfig) => Promise<void>;
    updateAgent: (id: string, config: Partial<AgentConfig>) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
    
    // Selection
    setActiveAgent: (id: string) => void;
    
    // Tool management
    enableTool: (agentId: string, toolId: string) => void;
    disableTool: (agentId: string, toolId: string) => void;
}

export const useAgentStore = create<AgentState>()(
    persist(
        (set, get) => ({
            agents: [],
            activeAgentId: null,
            isLoading: false,
            
            createAgent: async (config) => {
                const newAgent = {
                    ...config,
                    id: crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                set((state) => ({
                    agents: [...state.agents, newAgent]
                }));
            },
            
            updateAgent: async (id, config) => {
                set((state) => ({
                    agents: state.agents.map(a => 
                        a.id === id 
                            ? { ...a, ...config, updatedAt: new Date() } 
                            : a
                    )
                }));
            },
            
            deleteAgent: async (id) => {
                set((state) => ({
                    agents: state.agents.filter(a => a.id !== id),
                    activeAgentId: state.activeAgentId === id 
                        ? null 
                        : state.activeAgentId
                }));
            },
            
            // ... other actions
        }),
        {
            name: 'via-gent-agents',
            storage: createDexieStorage('agentConfigs')
        }
    )
);
```

### 4.3 Context Assembly Pipeline

```
Agent Request Initiated
    ↓
Build Context (ContextAssembler)
    ├── Layer 1: systemPrompt
    ├── Layer 2: domainInstructions + workflowSteps
    ├── Layer 3: (tools configured separately)
    ├── Layer 4: customRole (if pinnedToRequest)
    └── Layer 5: customInstructions.hidden
    ↓
Assemble messages array
    ↓
Add user message + customInstructions.visible
    ↓
Send to Provider API
```

---

## 5. State Persistence Architecture

### 5.1 Dexie.js Schema

```typescript
// src/lib/state/dexie-db.ts (extended)

class ViaGentDB extends Dexie {
    // Existing tables
    projects!: Table<ProjectRecord>;
    ideStates!: Table<IDEStateRecord>;
    credentials!: Table<CredentialRecord>;
    conversationThreads!: Table<ConversationThreadRecord>;
    
    // New tables
    providerConfigs!: Table<ProviderConfigRecord>;
    agentConfigs!: Table<AgentConfigRecord>;
    modelCache!: Table<ModelCacheRecord>;
    
    constructor() {
        super('via-gent-db');
        this.version(4).stores({
            // ... existing stores
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, providerId, updatedAt',
            modelCache: 'providerId, fetchedAt'
        });
    }
}
```

### 5.2 Storage Adapter

```typescript
// src/lib/state/dexie-storage.ts

export function createDexieStorage<T>(tableName: keyof ViaGentDB): StateStorage {
    return {
        getItem: async (name: string): Promise<string | null> => {
            const record = await db[tableName].get(name);
            return record ? JSON.stringify(record.state) : null;
        },
        
        setItem: async (name: string, value: string): Promise<void> => {
            await db[tableName].put({
                id: name,
                state: JSON.parse(value),
                updatedAt: new Date()
            });
        },
        
        removeItem: async (name: string): Promise<void> => {
            await db[tableName].delete(name);
        }
    };
}
```

---

## 6. Hot-Reload Implementation

### 6.1 Subscription Pattern

```typescript
// Components subscribe to specific slices
function ProviderSelector() {
    // Only re-renders when activeProviderId or providers change
    const { activeProviderId, providers, setActiveProvider } = useProviderStore(
        useShallow((state) => ({
            activeProviderId: state.activeProviderId,
            providers: state.providers,
            setActiveProvider: state.setActiveProvider
        }))
    );
    
    // ...
}
```

### 6.2 Cross-Component Updates

```typescript
// Status bar auto-updates when provider changes
function StatusBarModelIndicator() {
    const activeProviderId = useProviderStore((s) => s.activeProviderId);
    const provider = useProviderStore((s) => 
        s.providers.find(p => p.id === s.activeProviderId)
    );
    
    // Automatically re-renders when provider changes
    return <span>{provider?.name} / {provider?.defaultModel}</span>;
}
```

---

## 7. File Structure

```
src/lib/
├── state/
│   ├── dexie-db.ts              # Extended schema
│   ├── dexie-storage.ts         # Zustand storage adapter
│   ├── provider-store.ts        # NEW: Provider state
│   ├── agent-store.ts           # NEW: Agent state
│   └── ide-store.ts             # Existing, refactored
├── agent/
│   ├── providers/
│   │   ├── types.ts             # Updated types
│   │   ├── credential-vault.ts  # Unchanged
│   │   ├── model-registry.ts    # Unchanged
│   │   └── provider-adapter.ts  # Updated for new providers
│   ├── context/
│   │   └── context-assembler.ts # NEW: Multi-layer context
│   └── hooks/
│       └── use-agent-chat.ts    # Updated to use stores
└── components/
    └── agent/
        ├── AgentConfigDialog.tsx  # Updated for layers
        ├── ProviderSettings.tsx   # NEW: Provider management
        └── ToolConfigurator.tsx   # NEW: Tool selection
```

---

## 8. Migration Strategy

### Phase 1: Store Migration (Day 1-2)
- Create `provider-store.ts` and `agent-store.ts`
- Migrate existing mock data to Zustand stores
- Update Dexie schema

### Phase 2: Component Updates (Day 3-4)
- Update `AgentsPanel.tsx` to use `useAgentStore`
- Update `AgentConfigDialog.tsx` for full CRUD
- Create `ProviderSettings.tsx` component

### Phase 3: Hot-Reload (Day 5)
- Implement subscription patterns
- Update status bar integration
- Test cross-component updates

### Phase 4: Testing (Day 6-7)
- Unit tests for stores
- Integration tests for persistence
- E2E tests for configuration flow

---

## 9. API Contracts

### 9.1 Provider Store API

| Action | Input | Output | Side Effects |
|--------|-------|--------|--------------|
| `addProvider` | `ProviderConfig` | `void` | Persists to IndexedDB |
| `updateProvider` | `id, Partial<Config>` | `void` | Updates IndexedDB |
| `removeProvider` | `id` | `void` | Deletes from IndexedDB, removes credentials |
| `setActiveProvider` | `id` | `void` | Updates active state |

### 9.2 Agent Store API

| Action | Input | Output | Side Effects |
|--------|-------|--------|--------------|
| `createAgent` | `AgentConfig` | `void` | Persists, generates ID |
| `updateAgent` | `id, Partial<Config>` | `void` | Updates IndexedDB |
| `deleteAgent` | `id` | `void` | Deletes, clears active if needed |
| `setActiveAgent` | `id` | `void` | Updates selection |

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Config persistence | 100% | All changes survive page reload |
| Hot-reload latency | <100ms | Time from save to UI update |
| CRUD completeness | 4/4 | All operations functional |
| Provider coverage | 4 | OpenRouter, Gemini, OpenAI, Anthropic |

---

*Generated via BMAD v6 Investigation Cycle - 2025-12-28*

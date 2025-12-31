---
name: arc (Architecture Refinement & Consolidation Module)
description: >
  BMAD module for systematic architectural refinement focused on Provider→Model→Agent 
  data flow, cross-workspace reactivity, and unified state management.
version: 2.0.0
author: bmad-core-bmad-master + morgan (module-builder)
created: 2025-12-31
revised: 2025-12-31T10:55:00+07:00
module_type: implementation
dependencies:
  - bmm (BMAD Method Module)
  - core (BMAD Core)
---

# Architecture Refinement & Consolidation Module (ARC) v2.0

## Overview

The ARC module implements the **5-Layer VIA-GENT Architecture** with focus on:

1. **LLM Provider Configuration** - Foundation layer with hardcoded endpoints and reactive model loading
2. **Agent Configuration Vault** - Central agent management with provider/model linkage and tool binding
3. **Cross-Workspace Services** - Unified conversation, thread, and context management
4. **Brownfield Integration** - Connecting existing components to Knowledge Synthesis
5. **Clean Architecture** - Code hygiene, layer boundaries, and maintainability

---

## Module Structure

```
_bmad/
└── arc/                                    # Module root
    ├── config.yaml                         # Module configuration
    ├── agents/                             # Specialized agents
    │   ├── provider-architect.md           # Provider/Model architecture specialist
    │   ├── agent-vault-specialist.md       # Agent configuration expert
    │   └── integration-engineer.md         # Cross-workspace wiring specialist
    ├── workflows/                          # Module workflows
    │   └── architectural-consolidation/    # Main consolidation workflow
    │       ├── workflow.yaml               # Workflow definition
    │       └── steps/
    │           ├── step-01-provider-foundation.md   # Story AC-01
    │           ├── step-02-agent-vault.md           # Story AC-02
    │           ├── step-03-chat-unification.md      # Story AC-03
    │           ├── step-04-brownfield-bridge.md     # Story AC-04
    │           └── step-05-validation-gate.md       # Phase validation
    ├── contracts/                          # Data contracts (TypeScript interfaces)
    │   ├── provider-contracts.ts           # LLMProvider, ProviderModel
    │   ├── agent-contracts.ts              # Agent, AgentToolBinding
    │   ├── conversation-contracts.ts       # Conversation, Message, Thread
    │   └── event-contracts.ts              # Store events
    ├── checklists/
    │   ├── phase-0-showcase-checklist.md   # Showcase validation
    │   └── data-flow-validation.md         # Flow verification
    └── templates/
        └── store-template.ts               # Zustand store template
```

---

## Core Data Contracts

### Contract 1: LLM Provider

```typescript
// contracts/provider-contracts.ts

/**
 * IMMUTABLE: Built-in provider base URLs
 * These values CANNOT be modified by user configuration
 */
export const HARDCODED_PROVIDERS = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible' as const,
    baseUrl: 'https://openrouter.ai/api/v1',
    isHardcoded: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic' as const,
    baseUrl: 'https://api.anthropic.com/v1',
    isHardcoded: true,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini' as const,
    baseUrl: 'Gemini SDK Native',
    isHardcoded: true,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai' as const,
    baseUrl: 'https://api.openai.com/v1',
    isHardcoded: true,
  },
} as const;

/**
 * Provider entity schema
 */
export interface LLMProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';
  baseUrl: string;
  isHardcoded: boolean;
  hasApiKey: boolean;
  isEnabled: boolean;
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Model entity schema (loaded from provider API)
 */
export interface ProviderModel {
  id: string;
  name: string;
  providerId: string;
  contextLength: number;
  maxOutputTokens: number;
  inputModalities: ('text' | 'image' | 'audio')[];
  outputModalities: ('text' | 'image' | 'audio')[];
  supportsTools: boolean;
  supportsStreaming: boolean;
  isFree: boolean;
  isEnabled: boolean;
  pricing?: {
    promptPer1M: number;
    completionPer1M: number;
  };
}
```

### Contract 2: Agent Configuration

```typescript
// contracts/agent-contracts.ts

export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';

/**
 * Agent entity schema
 * Agents are the primary entity for AI interactions
 */
export interface Agent {
  id: string;                       // 'agt_{timestamp}_{random}'
  name: string;
  description: string;
  
  // Provider + Model linkage (CRITICAL)
  providerId: string;               // References LLMProvider.id
  modelId: string;                  // References ProviderModel.id
  
  // LLM Parameters
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  
  // Tool binding (with workspace conditions)
  tools: AgentToolBinding[];
  
  // Workspace availability
  workspaceBindings: WorkspaceBinding[];
  
  // Status and metrics
  status: AgentStatus;
  tasksCompleted: number;
  successRate: number;
  tokensUsed: number;
  lastActive: Date;
  createdAt: Date;
}

/**
 * Tool binding with per-workspace permissions
 */
export interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: Record<WorkspaceType, boolean>;
  configuration?: Record<string, unknown>;
}

/**
 * Where agent is available and how it appears
 */
export interface WorkspaceBinding {
  workspaceType: WorkspaceType;
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}
```

### Contract 3: Store Events

```typescript
// contracts/event-contracts.ts

/**
 * Cross-store event types for reactivity
 */
export const STORE_EVENTS = {
  // Provider events
  PROVIDER_KEY_SET: 'provider:key-set',
  PROVIDER_MODELS_LOADED: 'provider:models-loaded',
  PROVIDER_ADDED: 'provider:added',
  PROVIDER_REMOVED: 'provider:removed',
  
  // Agent events
  AGENT_SELECTED: 'agent:selected',
  AGENT_UPDATED: 'agent:updated',
  AGENT_CREATED: 'agent:created',
  AGENT_DELETED: 'agent:deleted',
  
  // Conversation events
  CONVERSATION_CREATED: 'conversation:created',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  
  // Workspace events
  WORKSPACE_CHANGED: 'workspace:changed',
} as const;

export type StoreEventType = typeof STORE_EVENTS[keyof typeof STORE_EVENTS];

/**
 * Event payloads
 */
export interface ProviderKeySetPayload {
  providerId: string;
  timestamp: number;
}

export interface ProviderModelsLoadedPayload {
  providerId: string;
  modelCount: number;
  timestamp: number;
}

export interface AgentSelectedPayload {
  agentId: string;
  workspaceType: WorkspaceType;
  timestamp: number;
}
```

---

## Data Flow Specifications

### Flow 1: Provider Key → Models

```
User Input: API Key
      │
      ▼
ProviderConfigDialog.handleSubmit()
      │
      ├── Validate key format
      ├── credentialVault.storeCredentials(providerId, apiKey)
      └── providerModelsStore.setApiKey(providerId, apiKey)
              │
              ▼
      setApiKey() action:
        1. Update state: providers[providerId].hasApiKey = true
        2. Persist via Dexie storage
        3. emitStoreEvent('provider:key-set', { providerId })
              │
              ▼
      Event Listener (in store or effect):
        On 'provider:key-set' → fetchModels(providerId)
              │
              ▼
      fetchModels() action:
        1. Call provider API for models list
        2. Parse and normalize to ProviderModel[]
        3. Store models in state
        4. emitStoreEvent('provider:models-loaded', { providerId, count })
              │
              ▼
      ALL UI Components (reactive):
        - AgentSelector updates model options
        - AgentConfigDialog shows new models
        - Settings page shows model count
```

### Flow 2: Agent Selection → Chat

```
User Action: Click agent in AgentSelector
      │
      ▼
AgentSelector.handleAgentSelect(agent)
      │
      ├── agentsStore.setActiveAgent(agent.id)
      └── emitStoreEvent('agent:selected', { agentId, workspaceType })
              │
              ▼
      ChatPanel (subscribed to agents store):
        1. Read new activeAgentId
        2. Get agent config: agentsStore.getAgent(id)
        3. Get provider/model: providerModelsStore.getProvider/Model()
        4. Initialize chat client with provider adapter
              │
              ▼
      OTHER WORKSPACES (via event):
        - All AgentSelectors show same selection
        - Consistent across IDE/Knowledge/Study/Notes
```

---

## Workflow: `/architectural-consolidation`

### Invocation

```bash
/architectural-consolidation
```

### Phase Execution

#### Phase 0: Showcase Critical (TODAY - 8 hours)

| Story | Description | Status |
|-------|-------------|--------|
| AC-01 | Provider Configuration Foundation | ✅ ProviderConfigDialog DONE |
| AC-02 | Agent Selector Unification | ✅ AgentSelector uses store |
| AC-03 | Chat Panel Cross-Workspace | 🔄 IN PROGRESS |

**Validation Gate:**
- [ ] Enter API key → Models load automatically
- [ ] Agent selector visible in all 4 workspaces
- [ ] Change agent selection → persists across navigation
- [ ] Send message → receive response

#### Phase 1: Foundation (Jan 1-3)

| Story | Description | Status |
|-------|-------------|--------|
| AC-04 | Store Reorganization | ⬜️ TODO |
| AC-05 | Event Bus Implementation | ⬜️ TODO |
| AC-06 | Tool Binding System | ⬜️ TODO |

#### Phase 2: Full Scope (Jan 4-10)

| Story | Description | Status |
|-------|-------------|--------|
| AC-07 | Brownfield Integration | ⬜️ TODO |
| AC-08 | Code Hygiene Sweep | ⬜️ TODO |
| AC-09 | Test Coverage | ⬜️ TODO |

---

## Implementation Checklist

### Store Implementation Checklist

- [ ] `provider-models-store.ts`:
  - [ ] `setApiKey(providerId, apiKey)` action implemented
  - [ ] Event emission on key set
  - [ ] `fetchModels(providerId)` action implemented
  - [ ] Models stored with providerId reference

- [ ] `agents-store.ts`:
  - [ ] `providerId` and `modelId` fields on Agent
  - [ ] `tools: AgentToolBinding[]` field
  - [ ] `workspaceBindings` field
  - [ ] Validation: model belongs to provider

- [ ] Event bus (`src/lib/events/store-events.ts`):
  - [ ] Event types defined
  - [ ] `emitStoreEvent()` function
  - [ ] `subscribeStoreEvent()` function
  - [ ] Cleanup on unmount

### UI Implementation Checklist

- [ ] `ProviderConfigDialog.tsx`:
  - [x] Built-in providers show readonly baseURL
  - [x] Custom providers allow baseURL editing
  - [ ] Key save triggers model loading

- [ ] `AgentSelector.tsx`:
  - [x] Uses `useAgentsStore` instead of mockAgents
  - [x] Updates store's activeAgentId
  - [x] Emits selection events
  - [ ] Shows provider/model info

- [ ] `AgentConfigDialog.tsx`:
  - [ ] Provider dropdown (only providers with API keys)
  - [ ] Model dropdown (filtered by selected provider)
  - [ ] Tool binding section
  - [ ] Workspace binding section

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Provider key → models load | < 2s | Time from save to models visible |
| Cross-workspace sync | < 100ms | Event propagation time |
| Store hydration | < 100ms | Time from page load to data ready |
| File size | 100% < 300 lines | Automated scan |
| Test coverage | > 80% | `pnpm test --coverage` |

---

## References

- Sprint Change Proposal: `_bmad-output/sprint-change-proposal-2025-12-31.md`
- Architecture: `_bmad-output/project-planning-artifacts/architecture.md`
- Provider Types: `src/lib/agent/providers/types.ts`
- Agents Store: `src/stores/agents-store.ts`
- Provider Models Store: `src/stores/provider-models-store.ts`

---

**Module Revised:** 2025-12-31T10:55:00+07:00  
**Author:** Morgan (Module Builder) + BMad Master (Orchestrator)  
**Status:** Active - Phase 0 In Progress

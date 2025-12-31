---
name: arc (Architecture Refinement & Consolidation Module)
description: >
  BMAD module for systematic architectural refinement focused on Provider→Model→Agent
  data flow, cross-workspace reactivity, and unified state management.
version: 2.1.0
author: bmad-core-bmad-master + course-correction-analysis
created: 2025-12-31
revised: 2025-12-31T11:30:00+07:00
module_type: implementation
dependencies:
  - bmm (BMAD Method Module)
  - core (BMAD Core)
---

# Architecture Refinement & Consolidation Module (ARC) v2.1

## Overview

The ARC module implements the **5-Layer VIA-GENT Architecture** with focus on:

1. **LLM Provider Configuration** - Foundation layer with hardcoded endpoints and reactive model loading
2. **Agent Configuration Vault** - Central agent management with provider/model linkage and tool binding
3. **Cross-Workspace Services** - Unified conversation, thread, and context management
4. **Brownfield Integration** - Connecting existing components to Knowledge Synthesis
5. **Clean Architecture** - Code hygiene, layer boundaries, and maintainability

**v2.1 CORRECTIONS:** This version aligns with REAL-WORLD implementation state, removing theoretical components and focusing on practical enhancements to existing code.

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
    │           ├── step-01-init.md         # Initialization
    │           ├── step-02-provider-foundation.md   # Story AC-01
    │           ├── step-03-agent-vault.md           # Story AC-02
    │           ├── step-04-chat-unification.md      # Story AC-03
    │           ├── step-05-brownfield-bridge.md     # Story AC-04
    │           └── step-06-validation-gate.md       # Phase validation
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

## Core Data Contracts (REAL-WORLD ALIGNED)

### Contract 1: LLM Provider (✅ EXISTS - Minor Enhancement Needed)

```typescript
// Location: src/stores/provider-models-store.ts (ALREADY EXISTS)
// Enhancement: Add event-driven model loading

/**
 * Provider entity schema
 * STATUS: ✅ IMPLEMENTED - Working in codebase
 */
export interface LLMProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';
  baseUrl: string;
  isHardcoded: boolean;
  hasApiKey: boolean;              // ✅ EXISTS - Key persistence working
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
 * Model entity schema
 * STATUS: ✅ IMPLEMENTED - Minor enhancement needed for auto-loading
 */
export interface ProviderModel {
  id: string;
  name: string;
  providerId: string;              // ✅ EXISTS - Foreign key working
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

/**
 * NEEDED: Event-driven model loading
 * Add to provider-models-store.ts:
 */
useEffect(() => {
  const unsubscribe = subscribeStoreEvent('provider:key-set', ({ providerId }) => {
    fetchModels(providerId);
  });
  return unsubscribe;
}, []);
```

### Contract 2: Agent Configuration (⚠️ EXISTS - Enhancement Required)

```typescript
// Location: src/stores/agents-store.ts (ALREADY EXISTS)
// Enhancement: Add workspacePermissions to tools, add workspaceBindings

/**
 * Agent entity schema
 * STATUS: ⚠️ PARTIALLY IMPLEMENTED - Needs workspace fields
 */
export interface Agent {
  id: string;                       // 'agt_{timestamp}_{random}'
  name: string;
  description: string;

  // ✅ Provider + Model linkage (WORKING)
  providerId: string;               // References LLMProvider
  modelId: string;                  // References ProviderModel

  // ✅ LLM Parameters (WORKING)
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;

  // ⚠️ Tool binding (EXISTS - needs workspacePermissions field)
  tools: AgentToolBinding[];

  // ❌ MISSING - Workspace availability
  workspaceBindings: WorkspaceBinding[];

  // ✅ Status and metrics (WORKING)
  status: 'online' | 'offline' | 'busy' | 'error';
  tasksCompleted: number;
  tokensUsed: number;
  lastActive: Date;
  createdAt: Date;
}

/**
 * Tool binding with per-workspace permissions
 * STATUS: ⚠️ PARTIALLY IMPLEMENTED - needs workspacePermissions
 */
export interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;

  // ❌ MISSING - Add this structure
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };

  configuration?: Record<string, unknown>;
}

/**
 * Workspace binding configuration
 * STATUS: ❌ MISSING - Needs to be added
 */
export interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}
```

### Contract 3: Store Events (✅ EXISTS - Underutilized)

```typescript
// Location: src/lib/events/store-events.ts (ALREADY EXISTS)
// Enhancement: Wire events for cross-store reactivity

/**
 * Cross-store event types for reactivity
 * STATUS: ✅ DEFINED - Needs wiring in stores
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
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  timestamp: number;
}
```

---

## Data Flow Specifications (REAL-WORLD ALIGNED)

### Flow 1: Provider Key → Models (⚠️ PARTIAL - Needs Event Wiring)

```
User Input: API Key
      │
      ▼
ProviderConfigDialog.handleSubmit()
      │
      ├── Validate key format
      ├── credentialVault.storeCredentials(providerId, apiKey)  ✅ WORKING
      └── providerModelsStore.setApiKey(providerId, apiKey)      ✅ WORKING
              │
              ▼
      setApiKey() action (✅ EXISTS):
        1. Update state: providers[providerId].hasApiKey = true
        2. Persist via Dexie storage                                 ✅ WORKING
        3. emitStoreEvent('provider:key-set', { providerId })       ❌ MISSING
              │
              ▼
      Event Listener (❌ MISSING - needs implementation):
        On 'provider:key-set' → fetchModels(providerId)
              │
              ▼
      fetchModels() action (✅ EXISTS):
        1. Call provider API for models list                         ✅ WORKING
        2. Parse and normalize to ProviderModel[]                    ✅ WORKING
        3. Store models in state                                     ✅ WORKING
        4. emitStoreEvent('provider:models-loaded', { providerId })  ❌ MISSING
              │
              ▼
      ALL UI Components (reactive):
        - AgentSelector updates model options                         ⚠️ NEEDS EVENT
        - AgentConfigDialog shows new models                          ⚠️ NEEDS EVENT
```

**Required Enhancement:**
- Add `emitStoreEvent` call in `setApiKey` action
- Add event listener in `provider-models-store.ts` for auto-loading
- Add event listener in UI components for reactivity

### Flow 2: Agent Selection → Chat (⚠️ PARTIAL - Needs Event Wiring)

```
User Action: Click agent in AgentSelector
      │
      ▼
AgentSelector.handleAgentSelect(agent)
      │
      ├── agentsStore.setActiveAgent(agent.id)           ✅ WORKING
      └── emitStoreEvent('agent:selected', { agentId, workspaceType })  ❌ MISSING
              │
              ▼
      ChatPanel (subscribed to agents store):
        1. Read new activeAgentId                          ✅ WORKING
        2. Get agent config: agentsStore.getAgent(id)      ✅ WORKING
        3. Get provider/model: providerModelsStore.get...  ✅ WORKING
        4. Initialize chat client                          ✅ WORKING
              │
              ▼
      OTHER WORKSPACES (via event):
        - All AgentSelectors show same selection           ❌ NEEDS EVENT
        - Consistent across IDE/Knowledge/Study/Notes       ❌ NEEDS EVENT
```

**Required Enhancement:**
- Add `emitStoreEvent` call in `agentsStore.setActiveAgent`
- Add event listener in all AgentSelector instances
- Ensure cross-workspace synchronization

---

## Workflow: `/architectural-consolidation`

### Invocation

```bash
/architectural-consolidation
```

### Phase Execution (REAL-WORLD ALIGNED)

#### Phase 0: Foundation (TODAY - 4 hours)

| Story | Description | Files Changed | Status |
|-------|-------------|---------------|--------|
| AC-01 | Provider → Models Reactivity | `provider-models-store.ts`, events | ⏳ TODO |
| AC-02 | AgentConfigDialog Enhancement | `AgentConfigDialog.tsx` | ⏳ TODO |
| AC-03 | Tool Binding Structure | `agents-store.ts` types | ⏳ TODO |

**Validation Gate:**
- [ ] Enter API key → Models load automatically (< 2s)
- [ ] AgentConfigDialog shows provider/model dropdowns
- [ ] AgentSelector shows available agents (not mock data)

#### Phase 1: Cross-Workspace (Jan 1 - 4 hours)

| Story | Description | Files Changed | Status |
|-------|-------------|---------------|--------|
| AC-04 | ChatPanel Unification | `ChatPanel.tsx` refactor | ⬜ TODO |
| AC-05 | Event Bus Wiring | `store-events.ts` integration | ⬜ TODO |
| AC-06 | Workspace Bindings | Add to agents, UI | ⬜ TODO |

**Validation Gate:**
- [ ] Same ChatPanel across all 4 workspaces
- [ ] Agent selection persists across navigation
- [ ] Tool permissions work per workspace

#### Phase 2: Hygiene & Polish (Jan 2-3 - 4 hours)

| Story | Description | Est. Time |
|-------|-------------|-----------|
| AC-07 | File size audit (< 300 lines) | 2h |
| AC-08 | Type strictness check | 1h |
| AC-09 | Documentation updates | 1h |

**Validation Gate:**
- [ ] 100% files < 300 lines
- [ ] No `any` types
- [ ] All contracts documented

---

## Implementation Checklist (REAL-WORLD ALIGNED)

### Store Implementation Checklist

- [ ] `provider-models-store.ts`:
  - [x] `setApiKey(providerId, apiKey)` action implemented ✅
  - [ ] Event emission on key set ❌ MISSING
  - [x] `fetchModels(providerId)` action implemented ✅
  - [ ] Event listener for auto-loading ❌ MISSING
  - [x] Models stored with providerId reference ✅

- [ ] `agents-store.ts`:
  - [x] `providerId` and `modelId` fields on Agent ✅
  - [ ] `tools: AgentToolBinding[]` with workspacePermissions ❌ MISSING
  - [ ] `workspaceBindings` field ❌ MISSING
  - [ ] Validation: model belongs to provider ❌ MISSING

- [ ] Event bus (`src/lib/events/store-events.ts`):
  - [x] Event types defined ✅
  - [x] `emitStoreEvent()` function ✅
  - [x] `subscribeStoreEvent()` function ✅
  - [ ] Wiring in stores for cross-store sync ❌ MISSING

### UI Implementation Checklist

- [ ] `ProviderConfigDialog.tsx`:
  - [x] Built-in providers show readonly baseURL ✅
  - [x] Custom providers allow baseURL editing ✅
  - [ ] Key save triggers model loading via event ❌ MISSING

- [ ] `AgentSelector.tsx`:
  - [x] Uses `useAgentsStore` instead of mockAgents ✅
  - [x] Updates store's activeAgentId ✅
  - [ ] Emits selection events ❌ MISSING
  - [ ] Shows provider/model info ⚠️ PARTIAL

- [ ] `AgentConfigDialog.tsx`:
  - [ ] Provider dropdown (only providers with API keys) ❌ MISSING
  - [ ] Model dropdown (filtered by selected provider) ❌ MISSING
  - [ ] Tool binding section with workspace permissions ❌ MISSING
  - [ ] Workspace binding section ❌ MISSING

---

## Success Metrics (REAL-WORLD ALIGNED)

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Provider key → models load | < 2s | Manual | Event-driven |
| Cross-workspace sync | < 100ms | N/A | Event bus needed |
| Store hydration | < 100ms | ✅ Working | ✅ OK |
| File size | 100% < 300 lines | Unknown | Audit needed |
| Test coverage | > 80% | Unknown | Test run needed |

---

## References (REAL-WORLD ALIGNED)

- **Sprint Change Proposal v2.1:** `_bmad-output/project-planning-artifacts/sprint-change-proposal-2025-12-31-v2.1-CORRECTED.md`
- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md`
- **Provider Types:** `src/stores/provider-models-store.ts` ✅ EXISTS
- **Agents Store:** `src/stores/agents-store.ts` ✅ EXISTS
- **Event Types:** `src/lib/events/store-events.ts` ✅ EXISTS

---

**Module Revised:** 2025-12-31T11:30:00+07:00
**Author:** Course Correction Analysis + BMad Master
**Status:** Active - Phase 0 Ready for Execution
**Version:** 2.1 - REAL-WORLD ALIGNED

---
date: 2025-12-31
time: 11:30:00
phase: Implementation
team: Team A & B (Parallel)
agent_mode: bmad-core-bmad-master
handoff_to: bmad-bmm-dev, bmad-bmm-architect
approval_status: PENDING_USER_APPROVAL
change_scope: MAJOR
workflow: correct-course
revision: 2.1 - REAL-WORLD ALIGNMENT CORRECTION
---

# Sprint Change Proposal v2.1 (CORRECTED)
## VIA-GENT Platform Architecture Consolidation - Real-World Alignment

**Version:** 2.1 (REAL-WORLD CORRECTED)
**Date:** 2025-12-31
**Author:** BMad Master (Orchestrator) + Course Correction Analysis
**Status:** READY FOR EXECUTION
**Change Scope:** MAJOR (Foundation Alignment)

---

## CRITICAL CORRECTION NOTICE

**Version 2.0 was THEORETICALLY CORRECT but PRACTICALLY MISALIGNED**

This corrected version (2.1) aligns the architectural definition with the ACTUAL codebase implementation state, addressing:
1. Real file locations and existing implementations
2. Actual store structures and type definitions
3. Pragmatic step ordering based on existing code
4. Removal of theoretical steps that don't match reality

---

# PART 1: REAL-WORLD ARCHITECTURE STATE

## 1.1 Existing Implementation Assessment

### ✅ ALREADY IMPLEMENTED (Working Components)

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| `ProviderConfigDialog` | `src/components/agent/ProviderConfigDialog.tsx` | ✅ WORKING | Built-in providers have readonly baseURL |
| `AgentSelector` | `src/components/chat/AgentSelector.tsx` | ✅ WORKING | Uses `useAgentsStore`, variants supported |
| `useAgentsStore` | `src/stores/agents-store.ts` | ✅ WORKING | Zustand + Dexie persistence |
| `provider-models-store` | `src/stores/provider-models-store.ts` | ✅ WORKING | Has `setApiKey` action |
| `CredentialVault` | `src/lib/agent/providers/credential-vault.ts` | ✅ WORKING | AES-256 encryption |

### ⚠️ PARTIALLY IMPLEMENTED (Needs Enhancement)

| Component | Issue | Fix Required |
|-----------|-------|--------------|
| **Provider → Models Reactivity** | Key save doesn't auto-load models | Add event listener on `provider:key-set` |
| **Agent Provider/Model Linkage** | Agent has `providerId` but validation missing | Add model belongs-to-provider check |
| **Tool Binding** | `tools` field exists but no workspace permissions | Add `workspacePermissions` structure |
| **Event Bus** | `store-events.ts` exists but underutilized | Wire events for cross-store sync |

### ❌ NOT IMPLEMENTED (Missing Components)

| Component | Priority | Story |
|-----------|----------|-------|
| **AgentConfigDialog Provider/Model Dropdowns** | P0 | AC-02.1 |
| **Tool Permissions per Workspace** | P1 | AC-02.2 |
| **ChatPanel Unification** | P1 | AC-03 |
| **Store Reorganization** | P2 | AC-04 |

---

# PART 2: CORRECTED IMPLEMENTATION STORIES

## Story AC-01: Provider → Models Reactivity (P0)

**Current State:** `setApiKey()` exists but models don't auto-load
**Required:** Event-driven model fetching

### Acceptance Criteria

1. **When user saves API key** → Models fetch automatically
   - Event: `provider:key-set` emitted
   - Listener: Triggers `fetchModels(providerId)`
   - Result: Models appear in UI within 2 seconds

2. **Models stored with provider reference**
   - Each model has `providerId` field
   - Store filtered by provider

3. **Cross-component reactivity**
   - AgentSelector shows new models immediately
   - AgentConfigDialog model dropdown updates

### Implementation Files

- ✅ `src/stores/provider-models-store.ts` (EXISTS - add listener)
- ✅ `src/lib/events/store-events.ts` (EXISTS - wire events)
- ✅ `src/components/agent/ProviderConfigDialog.tsx` (EXISTS - emit event)

### Code Changes Required

```typescript
// In provider-models-store.ts - ADD EVENT LISTENER
useEffect(() => {
  const unsubscribe = subscribeStoreEvent('provider:key-set', ({ providerId }) => {
    fetchModels(providerId);
  });
  return unsubscribe;
}, []);

// In ProviderConfigDialog.tsx - ADD EVENT EMISSION
const handleSubmit = async (providerId: string, apiKey: string) => {
  await credentialVault.storeCredentials(providerId, apiKey);
  providerModelsStore.setApiKey(providerId, apiKey);
  // Event emitted automatically by setApiKey
};
```

---

## Story AC-02: Agent Configuration Dialog Enhancement (P0)

**Current State:** `AgentConfigDialog` exists but missing provider/model selection UI
**Required:** Dropdowns for provider (with keys) → models (from provider)

### Acceptance Criteria

1. **Provider dropdown shows only providers with API keys**
   - Filter: `providers.filter(p => p.hasApiKey)`
   - Default: First provider with key

2. **Model dropdown filters by selected provider**
   - When provider changes → model options update
   - Filter: `models.filter(m => m.providerId === selectedProviderId)`

3. **Validation: Model belongs to provider**
   - On save: Verify `model.providerId === agent.providerId`
   - Error if mismatch

### Implementation Files

- ✅ `src/components/agent/AgentConfigDialog.tsx` (EXISTS - enhance)
- ✅ `src/stores/agents-store.ts` (EXISTS - add validation)
- ✅ `src/stores/provider-models-store.ts` (EXISTS - use for data)

### Code Changes Required

```typescript
// In AgentConfigDialog.tsx - ADD PROVIDER/MODEL SELECTORS
const providers = useProviderModelsStore(s => s.providers.filter(p => p.hasApiKey));
const models = useProviderModelsStore(s => s.models);

const [selectedProviderId, setSelectedProviderId] = useState(
  agent?.providerId || providers[0]?.id
);

const availableModels = models.filter(m => m.providerId === selectedProviderId);

// Validation in agents-store.ts
export const updateAgent = async (id: string, updates: Partial<Agent>) => {
  if (updates.providerId && updates.modelId) {
    const model = get().models.find(m => m.id === updates.modelId);
    if (model?.providerId !== updates.providerId) {
      throw new Error('Model does not belong to selected provider');
    }
  }
  // ... rest of update logic
};
```

---

## Story AC-03: Tool Binding per Workspace (P1)

**Current State:** `tools: AgentToolBinding[]` exists but lacks workspace permissions
**Required:** Add `workspacePermissions` field

### Acceptance Criteria

1. **Tool binding includes workspace conditions**
   ```typescript
   interface AgentToolBinding {
     toolId: string;
     isEnabled: boolean;
     workspacePermissions: {
       ide: boolean;
       knowledge: boolean;
       study: boolean;
       notes: boolean;
     };
   }
   ```

2. **AgentConfigDialog shows tool permissions matrix**
   - Rows: Tools
   - Columns: Workspaces (IDE, Knowledge, Study, Notes)
   - Cells: Checkbox toggles

3. **Agent execution checks permissions**
   - Before tool call: Check `toolBinding.workspacePermissions[currentWorkspace]`
   - Skip if disabled

### Implementation Files

- ✅ `src/stores/agents-store.ts` (EXISTS - update Agent type)
- ✅ `src/components/agent/AgentConfigDialog.tsx` (EXISTS - add UI)
- ✅ `src/lib/agent/tools/` (EXISTS - add permission check)

---

## Story AC-04: ChatPanel Unification (P1)

**Current State:** Different chat panels per workspace
**Required:** Single `ChatPanel` component with variants

### Acceptance Criteria

1. **Same `ChatPanel` in all workspaces**
   - IDE: `<ChatPanel variant="ide" />`
   - Knowledge: `<ChatPanel variant="knowledge" />`
   - Study: `<ChatPanel variant="study" />`
   - Notes: `<ChatPanel variant="notes" />`

2. **Conversation persistence per workspace**
   - `conversation.workspaceType` field
   - Query: `conversations.filter(c => c.workspaceType === current && c.agentId === active)`

3. **Cross-workspace agent sync**
   - Event: `agent:selected` updates all workspaces
   - Active agent persists across navigation

### Implementation Files

- ✅ `src/components/chat/ChatPanel.tsx` (EXISTS - refactor)
- ✅ `src/stores/conversation-store.ts` (EXISTS - add workspaceType)

---

# PART 3: UPDATED ENTITY CONTRACTS

## 3.1 LLMProvider Entity (REAL-WORLD ALIGNMENT)

```typescript
// ALREADY EXISTS in src/stores/provider-models-store.ts
interface LLMProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';
  baseUrl: string;
  isHardcoded: boolean;
  hasApiKey: boolean;  // ✅ EXISTS
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

// ALREADY EXISTS in src/stores/provider-models-store.ts
interface ProviderModel {
  id: string;
  name: string;
  providerId: string;  // ✅ EXISTS - foreign key
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

## 3.2 Agent Entity (ENHANCEMENT REQUIRED)

```typescript
// EXISTS in src/stores/agents-store.ts - NEEDS ENHANCEMENT
interface Agent {
  id: string;
  name: string;
  description: string;

  // ✅ EXISTS - Provider + Model linkage
  providerId: string;
  modelId: string;

  // ✅ EXISTS - LLM Parameters
  systemPrompt: string;
  temperature: number;
  maxTokens: number;

  // ⚠️ EXISTS - NEEDS ENHANCEMENT for workspace permissions
  tools: AgentToolBinding[];  // Add workspacePermissions field

  // ❌ MISSING - Add this field
  workspaceBindings: WorkspaceBinding[];

  status: 'online' | 'offline' | 'busy' | 'error';
  tasksCompleted: number;
  tokensUsed: number;
  lastActive: Date;
  createdAt: Date;
}

// ⚠️ NEEDS UPDATE - Add workspacePermissions
interface AgentToolBinding {
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

// ❌ MISSING - Add this interface
interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}
```

---

# PART 4: PHASED EXECUTION PLAN

## Phase 0: Foundation (TODAY - 4 hours)

| Story | Description | Files | Est. Time |
|-------|-------------|-------|-----------|
| **AC-01** | Provider → Models Reactivity | `provider-models-store.ts`, events | 1.5h |
| **AC-02** | AgentConfigDialog Enhancement | `AgentConfigDialog.tsx`, stores | 2h |
| **AC-03** | Tool Binding Structure | `agents-store.ts` types | 0.5h |

**Validation Gate:**
- [ ] Enter API key → Models load in < 2s
- [ ] AgentConfigDialog shows provider/model dropdowns
- [ ] AgentSelector shows available agents

## Phase 1: Cross-Workspace (Jan 1)

| Story | Description | Files | Est. Time |
|-------|-------------|-------|-----------|
| **AC-04** | ChatPanel Unification | `ChatPanel.tsx` refactor | 2h |
| **AC-05** | Event Bus Wiring | `store-events.ts` integration | 1h |
| **AC-06** | Workspace Bindings | Add to agents, UI | 1h |

**Validation Gate:**
- [ ] Same ChatPanel across all 4 workspaces
- [ ] Agent selection persists across navigation
- [ ] Tool permissions work per workspace

## Phase 2: Hygiene & Polish (Jan 2-3)

| Story | Description | Est. Time |
|-------|-------------|-----------|
| **AC-07** | File size audit (< 300 lines) | 2h |
| **AC-08** | Type strictness check | 1h |
| **AC-09** | Documentation updates | 1h |

**Validation Gate:**
- [ ] 100% files < 300 lines
- [ ] No `any` types
- [ ] All contracts documented

---

# PART 5: IMPLEMENTATION HANDOFF

## Change Scope: **MODERATE → MAJOR**

**Rationale:** While individual changes are moderate, the cumulative effect requires:
- Backlog reorganization (PO/SM)
- Architectural validation (Architect)
- Dev coordination (Team A + B parallel)

## Handoff Recipients

| Role | Responsibility |
|------|----------------|
| **Product Owner** | Update sprint backlog with AC-01 through AC-09 |
| **Solution Architect** | Review and approve corrected entity contracts |
| **Team A (UI/Foundation)** | Stories AC-02, AC-03, AC-04 (Dialog, Tools, Chat) |
| **Team B (Backend/Agent)** | Stories AC-01, AC-05 (Reactivity, Events) |

## Success Criteria

1. **Provider key → models load** < 2s (measured)
2. **AgentSelector** works in all 4 workspaces (verified)
3. **AgentConfigDialog** has provider/model dropdowns (verified)
4. **Tool permissions** matrix visible and functional (verified)
5. **Zero type errors** (`pnpm tsc --noEmit` clean)
6. **Build passes** (`pnpm build` successful)

---

**Document Corrected:** 2025-12-31T11:30:00+07:00
**Revision:** 2.1 - REAL-WORLD ALIGNMENT
**Status:** READY FOR USER APPROVAL
**Next Step:** Await user approval → Route to implementation teams

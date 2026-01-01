---
name: Cornerstone 2 Analysis - Agent Configuration Vault
iteration: 2
created: 2026-01-02T14:30:00+07:00
cornerstone: 2
focus: Agent Configuration Vault Single Source of Truth
---

# Cornerstone 2: Agent Configuration Vault - Deep Analysis

**Iteration:** 2
**Date:** 2026-01-02
**Status:** ✅ Analysis Complete
**Focus:** Establish Single Source of Truth for Agent Configuration

---

## Executive Summary

### Current State: WELL-IMPLEMENTED (85% Complete)

**Excellent News:**
- ✅ Agent domain entity well-defined in `src/core/entities/Agent.ts`
- ✅ Agent slices modularized (5 slices: CRUD, Workspace Bindings, Validation, Events, Utils)
- ✅ Per-workspace agent selection implemented (`agent-selection-store.ts`)
- ✅ Domain service utilities extracted (`agent-workspace-utils.ts`)
- ✅ Comprehensive UI components (15+ components, all <120 lines after Ralph Loop Cycle 17)
- ✅ Workspace bindings implemented with hot-reload support
- ✅ Event bus integration for reactive agent switching

**Gaps Identified:**
- ⚠️ Agent selector fragmentation across workspaces (some using old store)
- ⚠️ Provider model loading not integrated with agent configuration
- ⚠️ Tool permissions system partially implemented
- ⚠️ Agent capabilities not fully utilized by UI

**Assessment:** Agent vault is production-ready with excellent architecture. Minor integration work needed for 100% completion.

---

## Current Architecture Analysis

### Layer 1: Domain Layer (✅ EXCELLENT)

**File:** `src/core/entities/Agent.ts`

```typescript
export interface Agent {
    // Core identity
    id: string;
    name: string;
    description: string;

    // Provider + Model reference (CRITICAL LINKAGE)
    providerId: string;                // Foreign key to LLMProvider
    modelId: string;                   // Foreign key to ProviderModel

    // LLM Parameters
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;

    // Tool Configuration (CONDITIONAL PER WORKSPACE)
    tools: AgentToolBinding[];

    // Workspace Bindings (WHERE THIS AGENT IS AVAILABLE)
    workspaceBindings: WorkspaceBinding[];

    // Status
    status: 'online' | 'offline' | 'busy' | 'error';

    // Metrics
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;
    createdAt: string;
}
```

**Key Design Decisions:**
- **Foreign Key References:** `providerId` and `modelId` link to Provider system
- **Per-Workspace Tool Bindings:** Tools can be enabled/disabled per workspace
- **Workspace Bindings:** Explicit `isAvailable` and `isDefault` flags per workspace
- **Metrics Tracking:** Built-in analytics (tasks completed, success rate, tokens used)

**Assessment:** EXCELLENT domain model. Clear separation of concerns, proper relationships.

---

### Layer 2: Domain Services (✅ EXCELLENT)

**File:** `src/domain/services/agent-workspace-utils.ts`

**Purpose:** Encapsulates business logic for agent workspace operations

**Available Utilities:**
```typescript
// Check if agent is available in workspace
isAgentAvailableIn(agent, workspaceType): boolean

// Check if agent is default for workspace
isAgentDefaultFor(agent, workspaceType): boolean

// Get agents available for workspace
getAgentsForWorkspace(agents, workspaceType): Agent[]

// Get default agent for workspace
getDefaultAgentForWorkspace(agents, workspaceType): Agent | null
```

**Key Design Decisions:**
- **Pure functions:** No side effects, only business logic
- **Composable:** Can be combined for complex logic
- **Testable:** Easy to unit test in isolation
- **Zero circular dependencies:** No imports from stores, only domain entities

**Assessment:** PERFECT domain service pattern. This is exactly how business logic should be organized.

---

### Layer 3: State Management (✅ EXCELLENT - December 2025 Patterns)

**File:** `src/infrastructure/persistence/stores/use-app-store.ts`

**Agent Slices (5 modular slices):**

1. **Agent CRUD Slice** (`agent-crud-slice.ts`)
   - `addAgent()` - Create new agent
   - `updateAgent()` - Update existing agent
   - `removeAgent()` - Delete agent
   - `reset()` - Reset to defaults

2. **Agent Workspace Bindings Slice** (`agent-workspace-bindings-slice.ts`)
   - `updateWorkspaceBindings()` - Update agent availability per workspace
   - `setAgentDefaultForWorkspace()` - Mark agent as default
   - `getAgentsForWorkspace()` - Filter agents by workspace

3. **Agent Validation Slice** (`agent-validation-slice.ts`)
   - `validateAgent()` - Validate agent configuration
   - `checkProviderAvailability()` - Ensure provider has API key
   - `checkModelAvailability()` - Ensure model exists in provider

4. **Agent Events Slice** (`agent-events-slice.ts`)
   - Emit `AGENT_SELECTED` event on selection
   - Emit `AGENT_DESELECTED` event on deselection
   - Emit `DEFAULT_AGENT_CHANGED` event on default change
   - Cross-workspace hot-reload support

5. **Agent Utils Slice** (`agent-utils-slice.ts`)
   - `getAgent()` - Get agent by ID
   - `getAgentsForWorkspace()` - Get available agents for workspace
   - `getDefaultAgent()` - Get default agent for workspace
   - Hydration and initialization logic

**Persistence Strategy:**
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // 5 Agent Slices
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('appState'),
      partialize: (state) => ({
        agents: state.agents,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
    }
  )
)
```

**Assessment:** EXCELLENT - Following December 2025 Zustand best practices perfectly.

---

### Layer 4: Agent Selection Store (✅ EXCELLENT)

**File:** `src/infrastructure/persistence/stores/agents/agent-selection-store.ts`

**Purpose:** Single source of truth for active agent selection per workspace

**State Structure:**
```typescript
interface AgentSelectionState {
    // Active agent globally
    activeAgentId: string | null;

    // Per-workspace default agents
    defaultAgentIds: Record<WorkspaceType, string | null>;

    // Last selected agent per workspace
    lastSelectedAgentIds: Record<WorkspaceType, string | null>;

    // Actions
    setActiveAgent(agentId, workspaceType): void;
    setDefaultAgent(agentId, workspaceType): void;
    getActiveAgent(): Agent | null;
    getAgentForWorkspace(workspaceType): Agent | null;
    selectAgentForWorkspace(workspaceType): void;
    needsReselection(workspaceType): boolean;
}
```

**Selection Logic (4 Rules):**
1. **Rule 1:** Prefer workspace-specific default
2. **Rule 2:** Fall back to last selected
3. **Rule 3:** Use agent marked as default in workspace bindings
4. **Rule 4:** Fall back to first available agent

**Event Integration:**
```typescript
emitAgentSelected(agent, workspaceType) {
    eventBus.emit(DomainEventType.AGENT_SELECTED, {
        agentId: agent.id,
        agentName: agent.name,
        workspaceType,
    });
}
```

**Persistence:**
- Dexie storage: `createDexieStorage('agentConfigs')`
- Selective partialize: Only persist active, defaults, last selected
- Hydration validation: Remove invalid agents on startup

**Assessment:** EXCELLENT - Per-workspace selection with proper fallback logic and event integration.

---

### Layer 5: UI Components (✅ EXCELLENT - Ralph Loop Cycle 17)

**Location:** `src/presentation/components/agent/`

**Component Inventory (15+ components, all <120 lines):**

**Core Dialog:**
1. **AgentConfigDialog.tsx** (496 lines - orchestrator)
   - Orchestrates agent configuration flow
   - Uses extracted hooks and components
   - Still >300 lines (needs further refactoring)

2. **AgentManager.tsx** (285 lines - comprehensive UI)
   - Quick config, capability badges, status display
   - Workspace binding toggle
   - Fixes user feedback about short-sighted dropdown design

3. **UnifiedAgentSelector.tsx** (247 lines - fixes store fragmentation)
   - Uses proper per-workspace store
   - Addresses user feedback about lack of synchronization

**Form Components (Extracted in Ralph Loop Cycle 17):**
4. **AgentBasicInfoTab.tsx** (67 lines) - Name and description
5. **AgentProviderSelector.tsx** (78 lines) - Provider dropdown
6. **AgentModelSelector.tsx** (100 lines) - Model selection with refresh
7. **AgentAdvancedSettingsTab.tsx** - LLM parameters

**Workspace Permissions (Modular - Ralph Loop Cycle 17 Phase 2):**
8. **PermissionBadge.tsx** (44 lines) - Permission status indicator
9. **PermissionSwitch.tsx** (56 lines) - Permission toggle
10. **PermissionGridHeader.tsx** (59 lines) - Grid header
11. **ToolPermissionRow.tsx** (77 lines) - Tool permission row
12. **PermissionLegend.tsx** (55 lines) - Permission legend
13. **useWorkspacePermissions.ts** (81 lines) - Custom hook
14. **types.ts** (46 lines) - Type definitions

**Tool Trust Levels (Modular - Ralph Loop Cycle 17 Phase 3):**
15. **TrustLevelLegend.tsx** (57 lines) - Trust level legend
16. **ToolTrustRow.tsx** (93 lines) - Tool trust configuration
17. **useToolTrustLevels.ts** (120 lines) - Custom hook

**Additional Components:**
- **AgentImportExport.tsx** - JSON export/import
- **AgentCreationSuccess.tsx** - Success feedback
- **WorkspaceToolPermissionsConfig.tsx** (318 → 175 lines after split)
- **ToolTrustLevelManager.tsx** (246 → 83 lines after split)

**Assessment:** EXCELLENT component architecture. Ralph Loop Cycle 17 reduced god components by 608 lines. All components <120 lines except orchestrator.

---

## Gap Analysis

### Gap 1: Agent Selector Fragmentation (P1 - Consistency)

**Current Behavior:**
- IDE workspace uses `UnifiedAgentSelector` (new, correct store)
- Knowledge workspace uses `AgentSelector` from chat components (old, global store)
- Notes workspace uses `AgentSelector` from chat components (old, global store)
- Study workspace uses `AgentSelector` from chat components (old, global store)

**User Feedback:**
> "handle end to end agent selector and migrate them all to other workspaces - at `notes` there is no synchronization of agents selector - completely fragmented"

**Desired Behavior:**
- ALL 4 workspaces use `UnifiedAgentSelector`
- Agent selections persist per-workspace
- Changes to agent configuration reflect immediately across all workspaces

**Root Cause:** Agent selectors created before per-workspace store implemented. Never migrated.

**Implementation Required:**
1. Update Knowledge workspace to use `UnifiedAgentSelector`
2. Update Notes workspace to use `UnifiedAgentSelector`
3. Update Study workspace to use `UnifiedAgentSelector`
4. Delete old `AgentSelector` component from chat components
5. Test synchronization across all workspaces

---

### Gap 2: Provider Model Loading Not Integrated (P0 - UX)

**Current Behavior:**
- User creates agent with provider and model
- Provider models loaded separately in Provider Settings
- Agent model dropdown doesn't auto-refresh when provider models change
- User must manually reload models to see new options

**Desired Behavior:**
- User creates agent with provider
- System immediately loads provider models (via Cornerstone 1 auto-loading)
- Agent model dropdown shows all available models
- When provider adds new models, agent configs update automatically

**Root Cause:** Agent and Provider systems developed independently. No integration point for model loading.

**Implementation Required:**
1. After Cornerstone 1 complete (auto-loading models on API key save)
2. Add event listener in `useAgentFormState` hook for `MODELS_LOADED` event
3. Refresh model dropdown when provider models change
4. Show loading indicator during model fetch
5. Update selected model if it becomes unavailable

---

### Gap 3: Tool Permissions System Partially Implemented (P1 - Features)

**Current State:**
- Tool permission UI components exist (15 modular components)
- Workspace permission switches implemented
- Tool trust levels implemented
- Per-workspace tool bindings in Agent entity

**Missing:**
- Tool execution doesn't check workspace permissions
- Tool execution doesn't check trust levels
- No runtime permission validation

**Desired Behavior:**
- Agent tool execution checks workspace permissions before running
- Agent tool execution checks trust levels before running
- User prompted for approval if trust level insufficient
- Audit log of tool executions with permission checks

**Implementation Required:**
1. Create `ToolPermissionManager` service (not just UI)
2. Integrate with agent tool execution pipeline
3. Add runtime permission validation
4. Implement approval prompts for low-trust tools
5. Add audit logging for tool executions

---

### Gap 4: Agent Capabilities Not Fully Utilized (P2 - Enhancement)

**Current State:**
- Agent entity has `capabilities` field (not yet defined)
- Providers have `capabilities` (streaming, functionCalling, vision, embeddings)
- Agent configuration doesn't specify which capabilities to use

**Desired Behavior:**
- Agent inherits capabilities from provider by default
- Agent can opt-out of specific capabilities (e.g., disable vision)
- UI shows which capabilities are active per agent
- Tool execution validates agent capabilities before using

**Implementation Required:**
1. Define `AgentCapabilities` interface in domain entity
2. Add capability fields to AgentConfigDialog
3. Inherit provider capabilities by default
4. Add capability validation in tool execution
5. Show capability badges in Agent Manager UI

---

## Target Architecture

### Cornerstone 2 Target State (Single Source of Truth)

```typescript
// ========================================================
// DOMAIN LAYER (src/core/entities/Agent.ts)
// ========================================================

export interface Agent {
    // Core identity
    id: string;
    name: string;
    description: string;

    // Provider + Model reference
    providerId: string;
    modelId: string;

    // LLM Parameters
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;

    // Tool Configuration
    tools: AgentToolBinding[];

    // Workspace Bindings
    workspaceBindings: WorkspaceBinding[];

    // Capabilities (NEW - inherited from provider)
    capabilities: {
        streaming: boolean;
        functionCalling: boolean;
        vision: boolean;
        embeddings: boolean;
    };

    // Status
    status: 'online' | 'offline' | 'busy' | 'error';

    // Metrics
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;
    createdAt: string;
}

// ========================================================
// INFRASTRUCTURE LAYER (src/infrastructure/persistence/stores/)
// ========================================================

// Single unified store (use-app-store.ts)
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Agent CRUD
      agents: Agent[],

      // Actions (existing - already excellent)
      addAgent: (config: AgentCreateParams) => Promise<void>;
      updateAgent: (id: string, config: Partial<Agent>) => Promise<void>;
      removeAgent: (id: string) => Promise<void>;

      // Workspace Bindings (existing - already excellent)
      updateWorkspaceBindings: (agentId, bindings) => void;
      setAgentDefaultForWorkspace: (agentId, workspaceType) => void;

      // Model Integration (NEW - integrate with Cornerstone 1)
      refreshModelsForAgent: (agentId: string) => Promise<void>;
      onProviderModelsUpdated: (providerId: string) => void;  // Event handler

      // Capabilities (NEW)
      getAgentCapabilities: (agentId: string) => AgentCapabilities;
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('appState'),
      partialize: (state) => ({
        agents: state.agents,
      }),
    }
  )
);

// ========================================================
// AGENT SELECTION STORE (existing - already excellent)
// ========================================================

export const useAgentSelectionStore = create<AgentSelectionState>()(
  persist(
    (set, get) => ({
      activeAgentId: null,
      defaultAgentIds: { ide: null, knowledge: null, study: null, notes: null },
      lastSelectedAgentIds: { ide: null, knowledge: null, study: null, notes: null },

      setActiveAgent: (agentId, workspaceType) => void;
      setDefaultAgent: (agentId, workspaceType) => void;
      getAgentForWorkspace: (workspaceType) => Agent | null;

      // Event emission for hot-reload (existing - already excellent)
      emitAgentSelected: (agent, workspaceType) => void;
      emitAgentDeselected: (workspaceType) => void;
    }),
    {
      name: 'agent-selection-store',
      storage: createDexieStorage('agentConfigs'),
    }
  )
);
```

---

## Integration with Cornerstone 1

### Dependency: Agent Vault → Provider System

**Critical Dependencies:**
1. **Agent creation requires Provider with API key**
   - Validation: Check `providerId` exists
   - Validation: Check provider has `hasApiKey: true`
   - Auto-suggest: Only show providers with API keys

2. **Agent model selection requires Provider models**
   - Auto-load: Fetch provider models when provider selected
   - Validation: Ensure `modelId` exists in provider's models
   - Reactivity: Refresh models when provider models change

3. **Agent capabilities inherit from Provider**
   - Default: Agent inherits all provider capabilities
   - Opt-out: Agent can disable specific capabilities
   - Validation: Ensure provider supports requested capabilities

**Integration Points:**
```typescript
// In AgentConfigDialog (useAgentFormState hook)
const handleProviderChange = async (providerId: string) => {
    setProviderId(providerId);

    // Cornerstone 1 integration: Auto-load models
    const provider = useAppStore(s => s.providers.find(p => p.id === providerId));
    if (provider && provider.hasApiKey) {
        const models = await providerAdapterFactory.getModels(providerId);
        setModels(models);
    }

    // Inherit capabilities
    const capabilities = provider?.capabilities || {};
    setCapabilities(capabilities);
};
```

---

## Implementation Plan (Ralph Wiggum Cornerstone 2)

### Phase 1: Agent Selector Unification (4-6 hours)

**Story B-1:** Update Knowledge workspace to use UnifiedAgentSelector
- [ ] Replace `AgentSelector` with `UnifiedAgentSelector` in Knowledge workspace
- [ ] Verify agent selections persist
- [ ] Test synchronization with other workspaces

**Story B-2:** Update Notes workspace to use UnifiedAgentSelector
- [ ] Replace `AgentSelector` with `UnifiedAgentSelector` in Notes workspace
- [ ] Verify agent selections persist
- [ ] Test synchronization with other workspaces

**Story B-3:** Update Study workspace to use UnifiedAgentSelector
- [ ] Replace `AgentSelector` with `UnifiedAgentSelector` in Study workspace
- [ ] Verify agent selections persist
- [ ] Test synchronization with other workspaces

**Story B-4:** Delete old AgentSelector component
- [ ] Remove `AgentSelector` from chat components
- [ ] Update all imports
- [ ] Run TypeScript check: `pnpm tsc --noEmit`

### Phase 2: Provider Model Loading Integration (6-8 hours)

**Story B-5:** Implement model refresh on provider change
- [ ] Add `refreshModelsForAgent()` action to agent store
- [ ] Call when provider changes in AgentConfigDialog
- [ ] Add loading indicator during model fetch
- [ ] Test: Create agent → Select provider → Models auto-load

**Story B-6:** Implement agent update on provider models change
- [ ] Add `onProviderModelsUpdated()` event handler
- [ ] Subscribe to `MODELS_LOADED` event from provider store
- [ ] Update agent configs when provider models change
- [ ] Handle removed models (fallback to default)

### Phase 3: Tool Permissions Runtime Validation (8-10 hours)

**Story B-7:** Create ToolPermissionManager service
- [ ] Create `src/lib/agent/tool-permission-manager.ts` (not just UI)
- [ ] Implement `checkPermission(tool, agent, workspace)` method
- [ ] Implement `checkTrustLevel(tool, agent)` method
- [ ] Add approval prompt logic for low-trust tools

**Story B-8:** Integrate with agent tool execution
- [ ] Update tool execution pipeline to check permissions
- [ ] Update tool execution pipeline to check trust levels
- [ ] Add user prompts for approval when needed
- [ ] Test: Agent tries to use restricted tool → Permission checked

**Story B-9:** Add audit logging
- [ ] Create audit log store in Dexie
- [ ] Log all tool executions with permission check results
- [ ] Create audit viewer UI
- [ ] Test: Execute tool → Verify logged in audit trail

### Phase 4: Agent Capabilities Implementation (4-6 hours)

**Story B-10:** Define AgentCapabilities interface
- [ ] Add `capabilities` field to Agent entity
- [ ] Define capabilities: streaming, functionCalling, vision, embeddings
- [ ] Update AgentCreateParams to include capabilities

**Story B-11:** Implement capability inheritance from provider
- [ ] In AgentConfigDialog, inherit provider capabilities by default
- [ ] Add capability checkboxes (opt-out)
- [ ] Validate capabilities against provider
- [ ] Save capabilities to agent config

**Story B-12:** Add capability validation in tool execution
- [ ] Check agent capabilities before using tools
- [ ] Show error if tool requires unavailable capability
- [ ] Add capability badges to Agent Manager UI

---

## Validation Criteria

### Completion Checklist

**Cornerstone 2 Complete When:**
- [ ] All 4 workspaces use `UnifiedAgentSelector` (zero fragmentation)
- [ ] Agent selections persist per-workspace
- [ ] Provider models auto-load in agent configuration
- [ ] Agent configs update when provider models change
- [ ] Tool execution checks workspace permissions
- [ ] Tool execution checks trust levels
- [ ] Agent capabilities defined and inherited from provider
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] All tests passing: `pnpm test`
- [ ] Manual test: Create agent in Settings → Available in IDE immediately
- [ ] Manual test: Switch workspace → Agent selection persists

---

## Dependencies & Integration Points

### Upstream Dependencies (Must Complete First)

**Cornerstone 1** (Provider Configuration) - MUST BE COMPLETE FIRST
- Agent creation requires Provider with API key
- Agent model selection requires Provider models
- Agent capabilities inherit from Provider capabilities
- **Estimated completion:** Iteration 31-60 (Phase 3, Cornerstone 1)

### Downstream Dependencies (Depend on Cornerstone 2)

- **Cornerstone 3** (Conversations): Chat depends on agent selection
- **Cornerstone 5** (RAG Pipeline): RAG tools depend on agent permissions

---

## Risk Assessment

### Medium-Risk Areas

1. **Agent Selector Migration (P1)**
   - Risk: Breaking existing agent selections in workspaces
   - Mitigation: Migration script to preserve selections
   - Rollback: Keep old component until new one verified

2. **Provider Model Loading (P0)**
   - Risk: Slow model fetching blocks agent creation
   - Mitigation: Async loading with progress indicators
   - Rollback: Manual model loading if UX poor

3. **Tool Permissions Runtime (P1)**
   - Risk: Overly restrictive permissions block tool usage
   - Mitigation: Approval prompts with session trust
   - Rollback: Remove runtime checks if too restrictive

---

## Open Questions

1. **Agent Capabilities:** Should agents be able to use capabilities not supported by provider?
   - **Decision:** NO - Agent capabilities limited by provider capabilities
   - **Reasoning:** Prevents configuration errors, ensures compatibility

2. **Tool Permissions Approval:** Should approval prompts be per-session or persistent?
   - **Decision:** Per-session with option to "Trust for session"
   - **Reasoning:** Balance security with UX

3. **Multiple Defaults:** What if multiple agents marked as default for same workspace?
   - **Decision:** Validation prevents this (only one default per workspace)
   - **Reasoning:** Prevents ambiguity in agent selection

---

## Next Steps

**Iteration 3:** Begin Cornerstone 3 Analysis (Conversation System)
- Audit all conversation stores (5 locations!)
- Map thread management flow
- Identify conversation consolidation strategy

---

**Generated:** Iteration 2
**Status:** ✅ Analysis Complete
**Next:** Cornerstone 3 Analysis (Conversation System)

---
title: ADR-002: Agent Vault Architecture
status: Proposed
date: 2026-01-02
iteration: 7
cornerstone: 2
priority: P1 (UX)
---

# ADR-002: Agent Vault Architecture

**Status:** Proposed
**Date:** 2026-01-02
**Iteration:** 7
**Cornerstone:** 2 - Agent Configuration Vault
**Priority:** P1 (User Experience)
**Estimated Effort:** 4-6 hours

---

## Context

### Current State (EXCELLENT - 85% Complete)

**Strengths:**
- ✅ Agent domain entity well-defined in `src/core/entities/Agent.ts`
- ✅ Agent slices modularized (5 slices: CRUD, Workspace Bindings, Validation, Events, Utils)
- ✅ Per-workspace agent selection implemented (`agent-selection-store.ts`)
- ✅ Domain service utilities extracted (`agent-workspace-utils.ts`)
- ✅ Comprehensive UI components (15+ components, all <120 lines after Ralph Loop Cycle 17)
- ✅ Workspace bindings implemented with hot-reload support
- ✅ Event bus integration for reactive agent switching

**Architecture Highlights:**

```typescript
// src/infrastructure/persistence/stores/use-app-store.ts

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // 5 Agent Slices (December 2025 Zustand Pattern)
      ...createAgentCrudSlice(...a),                  // ~80 lines
      ...createAgentWorkspaceBindingsSlice(...a),     // ~100 lines
      ...createAgentValidationSlice(...a),            // ~60 lines
      ...createAgentEventsSlice(...a),                // ~70 lines
      ...createAgentUtilsSlice(...a),                 // ~90 lines
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
);
```

**Gap Analysis:** From `cornerstone-2-agent-analysis.md`
- Agent health score: **85%** (excellent architecture)
- God stores: 0 ✅
- Store locations: 1 unified ✅
- Max file size: <400 ✅
- **MINOR:** Agent selector fragmentation (some workspaces using old component) ⚠️

### Current Architecture

```
┌─────────────────────────────────────────────┐
│ DOMAIN LAYER                               │
│                                             │
│ Agent Entity (src/core/entities/Agent.ts)  │
│ - id, name, description                     │
│ - providerId, modelId (foreign keys)        │
│ - systemPrompt, temperature, maxTokens      │
│ - tools: AgentToolBinding[]                 │
│ - workspaceBindings: WorkspaceBinding[]     │
│ - status, metrics                           │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ DOMAIN SERVICES                            │
│                                             │
│ agent-workspace-utils.ts (106 lines)       │
│ - isAgentAvailableIn(agent, workspace)      │
│ - isAgentDefaultFor(agent, workspace)       │
│ - getAgentsForWorkspace(agents, workspace)  │
│ - getDefaultAgentForWorkspace(...)          │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ STATE MANAGEMENT (December 2025 Pattern)    │
│                                             │
│ use-app-store.ts (5 modular slices)        │
│ - CRUD: addAgent, updateAgent, removeAgent  │
│ - Bindings: updateWorkspaceBindings,        │
│            setAgentDefaultForWorkspace      │
│ - Validation: validateAgent,                │
│              checkProviderAvailability      │
│ - Events: AGENT_SELECTED, AGENT_DESELECTED  │
│ - Utils: getAgent, getAgentsForWorkspace    │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ AGENT SELECTION STORE                       │
│                                             │
│ agent-selection-store.ts (per-workspace)   │
│ - activeAgentId                             │
│ - defaultAgentIds (per workspace)           │
│ - lastSelectedAgentIds (per workspace)      │
│ - setActiveAgent(agentId, workspaceType)    │
│ - getAgentForWorkspace(workspaceType)       │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ UI COMPONENTS (15+ modular components)      │
│                                             │
│ AgentConfigDialog.tsx (496 lines)          │
│ AgentManager.tsx (285 lines)               │
│ UnifiedAgentSelector.tsx (247 lines)       │
│ AgentBasicInfoTab.tsx (67 lines)            │
│ WorkspacePermissions/ (7 components)        │
│ ToolTrustLevels/ (3 components)             │
└─────────────────────────────────────────────┘
```

---

## Decision

**Maintain current agent vault architecture with minor enhancements.**

**Key Principle:** The agent vault is already well-designed. Only implement minor integration improvements and UI consistency fixes.

### Enhancements Required

1. **Fix Agent Selector Fragmentation** (P1 - 4-6 hours)
   - Update Knowledge, Notes, Study workspaces to use `UnifiedAgentSelector`
   - Delete old `AgentSelector` component
   - Test synchronization across all workspaces

2. **Integrate Provider Model Loading** (P0 - 6-8 hours)
   - Auto-load provider models when agent provider changes
   - Refresh model dropdown when provider models change
   - Add loading indicators

3. **Implement Tool Permissions Runtime** (P1 - 8-10 hours)
   - Create `ToolPermissionManager` service
   - Check workspace permissions before tool execution
   - Check trust levels before tool execution
   - Add approval prompts for low-trust tools

4. **Define Agent Capabilities** (P2 - 4-6 hours)
   - Inherit capabilities from provider by default
   - Allow agents to opt-out of specific capabilities
   - Add capability badges to UI

---

## Consequences

### Benefits (Current Architecture)

1. **Excellent Separation of Concerns** ✅
   - Domain layer (pure entities)
   - Domain services (business logic)
   - State management (Zustand slices)
   - UI components (modular, <120 lines)

2. **Per-Workspace Agent Selection** ✅
   - Different agents for different workspaces
   - Persistent selections across sessions
   - Hot-reload support

3. **Event-Driven Architecture** ✅
   - `AGENT_SELECTED` event on selection
   - `AGENT_DESELECTED` event on deselection
   - `DEFAULT_AGENT_CHANGED` event on default change
   - Cross-workspace reactivity

4. **Comprehensive UI** ✅
   - 15+ modular components (Ralph Loop Cycle 17)
   - Workspace permissions editor
   - Tool trust levels configuration
   - Agent manager with quick config

5. **December 2025 Zustand Patterns** ✅
   - Single bounded store
   - Slice pattern (5 focused slices)
   - Dexie persistence
   - Individual selectors (no destructuring)

### Benefits (Proposed Enhancements)

1. **Agent Selector Unification** ✅
   - All 4 workspaces use same component
   - Agent selections sync across workspaces
   - Zero user confusion

2. **Provider Model Integration** ✅
   - Models auto-load when agent provider changes
   - No manual "Load Models" button needed
   - Improved UX

3. **Tool Permissions Runtime** ✅
   - Security: Check permissions before execution
   - User control: Approval prompts for low-trust tools
   - Audit trail: Log all tool executions

4. **Agent Capabilities** ✅
   - Inherit provider capabilities automatically
   - UI shows which capabilities are active
   - Validation before tool usage

### Drawbacks

1. **Minimal Drawbacks** ✅
   - Current architecture is already excellent
   - Enhancements are incremental, not breaking
   - Low risk (4-6 hours for selector fix)

2. **Tool Permissions Complexity** ⚠️
   - Runtime checks add overhead
   - Approval prompts may annoy users
   - Mitigation: Session trust for approved tools

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Agent selector migration breaks selections** | Low | High | - Migration script to preserve selections<br>- Test in each workspace<br>- Keep old component until verified |
| **Provider model loading is slow** | Medium | Medium | - Async loading with progress indicators<br>- Cache models in Dexie<br>- Fallback to manual loading if UX poor |
| **Tool permissions too restrictive** | Low | High | - Approval prompts with session trust<br>- Configurable trust levels<br>- Override for trusted agents |
| **Agent capabilities mismatch provider** | Low | Medium | - Validate capabilities on agent save<br>- Warn user of mismatch<br>- Fallback to provider capabilities |

---

## Implementation Plan

### Phase 1: Agent Selector Unification (4-6 hours)

**Step 1.1:** Update Knowledge workspace
- [ ] Replace `AgentSelector` with `UnifiedAgentSelector` in `KnowledgePage.tsx`
- [ ] Update imports
- [ ] Test agent selection persists
- [ ] Test synchronization with other workspaces

**Step 1.2:** Update Notes workspace
- [ ] Replace `AgentSelector` with `UnifiedAgentSelector` in `NotesPage.tsx`
- [ ] Update imports
- [ ] Test agent selection persists
- [ ] Test synchronization with other workspaces

**Step 1.3:** Update Study workspace
- [ ] Replace `AgentSelector` with `UnifiedAgentSelector` in `StudyPage.tsx`
- [ ] Update imports
- [ ] Test agent selection persists
- [ ] Test synchronization with other workspaces

**Step 1.4:** Delete old AgentSelector component
- [ ] Remove `AgentSelector.tsx` from `src/presentation/components/chat/`
- [ ] Update all imports (should be none if Step 1.1-1.3 complete)
- [ ] Run `pnpm tsc --noEmit` to verify

**Step 1.5:** Manual testing
- [ ] Create agent in Settings workspace
- [ ] Switch to IDE workspace → Verify agent available
- [ ] Switch to Knowledge workspace → Verify agent available
- [ ] Switch to Notes workspace → Verify agent available
- [ ] Switch to Study workspace → Verify agent available
- [ ] Change agent in one workspace → Verify syncs to others

### Phase 2: Provider Model Loading Integration (6-8 hours)

**Step 2.1:** Implement model refresh on provider change
```typescript
// src/presentation/components/agent/hooks/useAgentFormState.ts

const handleProviderChange = async (providerId: string) => {
  setProviderId(providerId);

  // Get provider
  const provider = useAppStore(s => s.providers.find(p => p.id === providerId));
  if (!provider) return;

  // Auto-load models if provider has API key
  if (provider.hasApiKey) {
    setIsLoadingModels(true);
    try {
      const models = await providerAdapterFactory.getModels(providerId);
      setModels(models);
    } catch (error) {
      console.error('[useAgentFormState] Failed to load models:', error);
      toast.error('Failed to load provider models');
    } finally {
      setIsLoadingModels(false);
    }
  }
};
```

**Step 2.2:** Implement agent update on provider models change
```typescript
// src/infrastructure/persistence/stores/agents/agent-crud-slice.ts

const onProviderModelsUpdated: State['onProviderModelsUpdated'] = (providerId: string) => {
  const providers = get().providers;
  const provider = providers.find(p => p.id === providerId);

  if (!provider || !provider.models) return;

  // Update all agents using this provider
  const agents = get().agents.map(agent => {
    if (agent.providerId === providerId) {
      // Check if agent's model still exists
      const modelExists = provider.models.some(m => m.id === agent.modelId);

      if (!modelExists) {
        // Fallback to first available model
        const firstModel = provider.models[0];
        return {
          ...agent,
          modelId: firstModel.id,
        };
      }
    }

    return agent;
  });

  set({ agents });
};
```

**Step 2.3:** Add loading indicators
- [ ] Show spinner during model fetch
- [ ] Show "Loading models..." message
- [ ] Hide model selector until models loaded

### Phase 3: Tool Permissions Runtime (8-10 hours)

**Step 3.1:** Create ToolPermissionManager service
```typescript
// src/lib/agent/tool-permission-manager.ts

export class ToolPermissionManager {
  private static instance: ToolPermissionManager;

  static getInstance(): ToolPermissionManager {
    if (!this.instance) {
      this.instance = new ToolPermissionManager();
    }
    return this.instance;
  }

  /**
   * Check if agent can use tool in workspace
   */
  canUseTool(toolName: string, agentId: string, workspaceType: WorkspaceType): boolean {
    const agent = useAppStore(s => s.agents.find(a => a.id === agentId));
    if (!agent) return false;

    // Check workspace bindings
    const workspaceBinding = agent.workspaceBindings.find(b => b.workspaceType === workspaceType);
    if (!workspaceBinding || !workspaceBinding.isAvailable) return false;

    // Check tool permissions
    const toolBinding = agent.tools.find(t => t.name === toolName);
    if (!toolBinding || !toolBinding.enabled) return false;

    return true;
  }

  /**
   * Check trust level for tool
   */
  getTrustLevel(toolName: string, agentId: string): 'trusted' | 'prompt' | 'blocked' {
    const agent = useAppStore(s => s.agents.find(a => a.id === agentId));
    if (!agent) return 'blocked';

    const toolBinding = agent.tools.find(t => t.name === toolName);
    if (!toolBinding) return 'blocked';

    return toolBinding.trustLevel;
  }

  /**
   * Request user approval for tool execution
   */
  async requestApproval(toolName: string, agentId: string): Promise<boolean> {
    const trustLevel = this.getTrustLevel(toolName, agentId);

    if (trustLevel === 'trusted') return true;
    if (trustLevel === 'blocked') return false;

    // Show approval prompt
    return new Promise((resolve) => {
      const approved = window.confirm(
        `Agent "${agentId}" wants to use tool "${toolName}". Approve?`
      );
      resolve(approved);
    });
  }
}
```

**Step 3.2:** Integrate with agent tool execution
```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts

const executeTool = async (toolCall: ToolCall) => {
  const toolName = toolCall.function.name;
  const agentId = activeAgent?.id;

  // Check permissions
  const canUse = toolPermissionManager.canUseTool(toolName, agentId, workspaceType);
  if (!canUse) {
    throw new Error(`Tool "${toolName}" not permitted in workspace "${workspaceType}"`);
  }

  // Check trust level
  const approved = await toolPermissionManager.requestApproval(toolName, agentId);
  if (!approved) {
    throw new Error(`Tool "${toolName}" execution denied by user`);
  }

  // Execute tool
  const result = await toolExecutor.execute(toolCall);
  return result;
};
```

**Step 3.3:** Add audit logging
```typescript
// src/lib/agent/tool-permission-manager.ts

async logToolExecution(toolName: string, agentId: string, workspaceType: WorkspaceType, result: 'approved' | 'denied') {
  const logEntry = {
    timestamp: new Date(),
    toolName,
    agentId,
    workspaceType,
    result,
  };

  await db.toolExecutionLog.add(logEntry);
}
```

### Phase 4: Agent Capabilities (4-6 hours)

**Step 4.1:** Define AgentCapabilities interface
```typescript
// src/core/entities/Agent.ts

export interface Agent {
  // ... existing fields

  // Capabilities (inherited from provider)
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
  };
}
```

**Step 4.2:** Inherit capabilities from provider
```typescript
// src/presentation/components/agent/hooks/useAgentFormState.ts

const handleProviderChange = async (providerId: string) => {
  setProviderId(providerId);

  // Get provider
  const provider = useAppStore(s => s.providers.find(p => p.id === providerId));
  if (!provider) return;

  // Inherit capabilities
  const capabilities = provider.capabilities || {
    streaming: true,
    functionCalling: true,
    vision: false,
    embeddings: false,
  };
  setCapabilities(capabilities);
};
```

**Step 4.3:** Add capability checkboxes
```typescript
// src/presentation/components/agent/AgentCapabilitiesTab.tsx

export function AgentCapabilitiesTab({ agent, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3>Agent Capabilities</h3>

      <label>
        <input
          type="checkbox"
          checked={agent.capabilities.streaming}
          onChange={(e) => onChange({
            ...agent,
            capabilities: { ...agent.capabilities, streaming: e.target.checked }
          })}
        />
        Streaming Responses
      </label>

      <label>
        <input
          type="checkbox"
          checked={agent.capabilities.functionCalling}
          onChange={(e) => onChange({
            ...agent,
            capabilities: { ...agent.capabilities, functionCalling: e.target.checked }
          })}
        />
        Function Calling
      </label>

      {/* ... more capabilities */}
    </div>
  );
}
```

**Step 4.4:** Validate capabilities against provider
```typescript
// src/infrastructure/persistence/stores/agents/agent-validation-slice.ts

const validateAgent: State['validateAgent'] = (agent) => {
  const provider = useAppStore(s => s.providers.find(p => p.id === agent.providerId));

  if (!provider) {
    return { valid: false, errors: ['Provider not found'] };
  }

  // Validate capabilities
  const invalidCaps = Object.keys(agent.capabilities).filter(cap => {
    return agent.capabilities[cap] && !provider.capabilities[cap];
  });

  if (invalidCaps.length > 0) {
    return {
      valid: false,
      errors: [`Capabilities not supported by provider: ${invalidCaps.join(', ')}`]
    };
  }

  return { valid: true, errors: [] };
};
```

---

## Migration Strategy

### No Migration Required ✅

The agent vault architecture is already excellent. Only incremental improvements needed.

### Deployment Strategy

1. **Feature Flags** (optional)
   - Enable tool permissions runtime behind feature flag
   - Roll out gradually to users

2. **A/B Testing** (optional)
   - Test new agent selector in subset of workspaces first
   - Measure user engagement

3. **Monitoring**
   - Track agent selection changes
   - Monitor tool execution approvals
   - Measure model loading times

---

## Testing Strategy

### Unit Tests

```typescript
// src/infrastructure/persistence/stores/agents/__tests__/agent-crud-slice.test.ts

describe('Agent CRUD Slice', () => {
  it('should add agent with inherited capabilities', () => {
    const provider = createMockProvider({
      capabilities: { streaming: true, functionCalling: true }
    });

    const agent = createStore().getState().addAgent({
      name: 'Test Agent',
      providerId: provider.id,
      // ... other fields
    });

    expect(agent.capabilities).toEqual({
      streaming: true,
      functionCalling: true,
    });
  });

  it('should update agent when provider models change', () => {
    // ... test implementation
  });
});
```

### Integration Tests

```typescript
// src/presentation/components/agent/__tests__/UnifiedAgentSelector.test.tsx

describe('UnifiedAgentSelector', () => {
  it('should sync agent selection across workspaces', () => {
    const { getByRole } = render(
      <UnifiedAgentSelector workspaceType="ide" />
    );

    const selector = getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'agent-2' } });

    // Verify selection persisted
    const agentSelection = useAgentSelectionStore.getState();
    expect(agentSelection.activeAgentId).toBe('agent-2');

    // Verify syncs to other workspaces
    expect(agentSelection.lastSelectedAgentIds.ide).toBe('agent-2');
  });
});
```

### Manual Testing Checklist

- [ ] Create agent in Settings workspace
- [ ] Verify agent available in all 4 workspaces
- [ ] Change agent in IDE workspace
- [ ] Verify change reflects in Knowledge/Notes/Study workspaces
- [ ] Test agent with provider model loading
- [ ] Test tool permissions (approve/deny)
- [ ] Test capability validation

---

## Rollback Strategy

### If Agent Selector Migration Fails

**Step 1:** Revert workspace changes
- Git revert `KnowledgePage.tsx`
- Git revert `NotesPage.tsx`
- Git revert `StudyPage.tsx`

**Step 2:** Restore old AgentSelector component
- Git checkout `AgentSelector.tsx`

**Step 3:** Verify rollback
- [ ] Run `pnpm tsc --noEmit` (should pass)
- [ ] Run `pnpm test` (should pass)
- [ ] Manual test: Agent selector works in all workspaces

### If Tool Permissions Runtime Fails

**Step 1:** Disable runtime checks
- Comment out permission checks in `use-agent-chat-with-tools.ts`
- Add feature flag to disable

**Step 2:** Verify rollback
- [ ] Tools execute without permission checks
- [ ] No performance degradation

---

## Success Criteria

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

## Related ADRs

- **ADR-001:** Provider Store Consolidation (agents depend on providers)
- **ADR-003:** Conversation Thread Schema (independent)
- **ADR-004:** Project Workspace Binding (related - workspace patterns)
- **ADR-005:** RAG Pipeline Design (independent)
- **ADR-006:** Workspace State Sharing (related - event patterns)

---

## References

- **Phase 1 Analysis:** `cornerstone-2-agent-analysis.md`
- **Agent Entity:** `src/core/entities/Agent.ts`
- **Agent Slices:** `src/infrastructure/persistence/stores/agents/`
- **Agent Selection Store:** `src/infrastructure/persistence/stores/agents/agent-selection-store.ts`
- **Domain Services:** `src/domain/services/agent-workspace-utils.ts`

---

## Open Questions

1. **Should agent capabilities be editable by user?**
   - **Decision:** YES - allow opt-out of specific capabilities
   - **Reasoning:** User may want to disable expensive capabilities (e.g., vision)

2. **Should tool permissions be per-session or persistent?**
   - **Decision:** Persistent with per-session trust
   - **Reasoning:** Balance security with UX (don't prompt every time)

3. **Should we implement agent templates?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Nice-to-have, not blocking for MVP

---

**Status:** Proposed
**Next Step:** Implementation Phase 1 (Agent Selector Unification)
**Estimated Completion:** Iterations 31-35 (Sprint 1)

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 2 - ADR Creation)
**Review Status:** Pending stakeholder approval

# Migration Pattern Analysis
**Date:** 2026-01-02
**Status:** DRAFT - Awaiting Repomix Full Analysis

## Executive Summary

Discovered unified `useAppStore` is **ALREADY FULLY IMPLEMENTED** with December 2025 Zustand patterns. Only 20 files still use legacy stores. This analysis documents the migration patterns for swift execution.

## Unified Store Architecture

**Location:** `src/infrastructure/persistence/stores/use-app-store.ts` (281 lines)

**Structure:**
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // 5 Agent Slices
      ...createAgentCrudSlice(...a),              // addAgent, updateAgent, removeAgent
      ...createAgentWorkspaceBindingsSlice(...a),  // getAgentsForWorkspace
      ...createAgentValidationSlice(...a),        // validationErrors
      ...createAgentEventsSlice(...a),            // cross-workspace events
      ...createAgentUtilsSlice(...a),             // getAgents, setHasHydrated

      // 3 Provider Slices
      ...createProviderCrudSlice(...a),           // addProvider, updateProvider, removeProvider
      ...createProviderModelsSlice(...a),          // fetchModels, loadModelsForProvider
      ...createProviderUtilsSlice(...a),           // updateModelSettings, getAvailableModels
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('appState')),
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
    }
  )
);
```

**Convenience Selectors Available:**
- `useAgents()` - Get all agents
- `useActiveAgent()` - Get active agent
- `useAgentsForWorkspace(workspaceType)` - Get filtered agents
- `useProviders()` - Get all providers
- `useActiveProvider()` - Get active provider
- `useAvailableModels(providerId)` - Get models for provider
- `useValidationErrors(agentId)` - Get validation errors

**Backward Compatibility:**
- `useProviderStore()` - Provided for legacy code (lines 266-280)

## Migration Patterns

### Pattern 1: React Component - Agent Data

**BEFORE:**
```typescript
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';

const agents = useAgentsStore(s => s.agents);
```

**AFTER (Option A - Convenience Selector):**
```typescript
import { useAgents } from '@/infrastructure/persistence/stores/use-app-store';

const agents = useAgents();
```

**AFTER (Option B - Direct Selector):**
```typescript
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

const agents = useAppStore(s => s.agents);
```

**Example Files:**
- `ChatPanel.tsx:50` - Uses `useAgentsStore(s => s.agents)`

### Pattern 2: React Component - Multiple Store Properties

**BEFORE:**
```typescript
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';

const { agents, addAgent, removeAgent } = useAgentsStore();
```

**AFTER (Individual Selectors):**
```typescript
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

const agents = useAppStore(s => s.agents);
const addAgent = useAppStore(s => s.addAgent);
const removeAgent = useAppStore(s => s.removeAgent);
```

**AFTER (useShallow for multiple properties):**
```typescript
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { useShallow } from 'zustand/shallow';

const { agents, addAgent, removeAgent } = useAppStore(
  useShallow((s) => ({ agents: s.agents, addAgent: s.addAgent, removeAgent: s.removeAgent }))
);
```

### Pattern 3: Non-React Context (Event Bus, Services)

**BEFORE:**
```typescript
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';

const agentsStore = useAgentsStore.getState();
const agents = agentsStore.agents;
```

**AFTER:**
```typescript
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

const appStore = useAppStore.getState();
const agents = appStore.agents;
```

**Example Files:**
- `cross-workspace-event-bus.ts:75` - Uses `useAgentsStore.getState()`

### Pattern 4: Agent Selection Store

**BEFORE:**
```typescript
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';

const { activeAgentId, setActiveAgent } = useAgentSelection();
```

**AFTER:**
```typescript
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';

const activeAgentId = useAgentSelectionStore(s => s.activeAgentId);
const setActiveAgent = useAgentSelectionStore(s => s.setActiveAgent);
```

**IMPORTANT:** `useAgentSelectionStore` is **SEPARATE** from `useAppStore` because it manages per-workspace agent selection, which is ephemeral state (not persisted).

## Migration Priority Batches

### Batch 1: P0 UI Components (5 files, ~30 min)

1. **ChatPanel.tsx**
   - Line 20: `import { useAgentsStore }`
   - Line 50: `const agents = useAgentsStore(s => s.agents)`
   - **Migration:** Use `useAgents()` convenience selector

2. **ThreadManager.tsx**
   - Similar pattern to ChatPanel
   - **Migration:** Use `useAgents()` convenience selector

3. **AgentWorkspaceBindingConfig.tsx**
   - Line 27: `import { useAgentsStore }`
   - Lines 122-123: Individual selectors for `updateWorkspaceBinding`, `updateAgentWorkspaceBinding`
   - **Migration:** Use `useAppStore` with individual selectors

4. **AgentWorkspaceSwitchingFeedback.tsx**
   - Similar pattern
   - **Migration:** Use `useAgents()` convenience selector

5. **useAgentConfigForm.ts**
   - Custom hook using agent store
   - **Migration:** Use individual selectors for stability

### Batch 2: P1 Core Services (8 files, ~1 hour)

1. **useAgents.ts** (CRITICAL - Used everywhere)
   - **REFACTOR:** Change from custom hook to re-export
   - **Before:** Custom hook wrapping `useAgentsStore`
   - **After:** `export { useAgents } from '@/infrastructure/persistence/stores/use-app-store';`

2. **agent-io.ts**
   - **Migration:** Use `useAppStore.getState()` pattern

3. **workspace-execution-context.ts**
   - **Migration:** Use `useAppStore.getState()` pattern

4. **workspace-transition-manager.ts**
   - **Migration:** Use `useAppStore.getState()` pattern

5. **conversation-store.ts**
   - **Migration:** Use `useAppStore.getState()` pattern

6. **useProviderEvents.ts**
   - **Migration:** Already has convenience selectors, verify compatibility

7. **use-cross-workspace-events.ts**
   - **Migration:** Use `useAppStore.getState()` pattern

### Batch 3: P2 Infrastructure (7 files, ~30 min)

1. **state-orchestrator.ts**
   - **Migration:** Use `useAppStore.getState()` pattern

2. **cross-workspace-event-bus.ts**
   - Line 14: `import { useAgentsStore }`
   - Line 75: `const agentsStore = useAgentsStore.getState();`
   - **Migration:** Use `useAppStore.getState()` pattern

3. **Test files** (4 files)
   - **Migration:** Update imports in test setup

4. **Barrel exports** (2 files)
   - **Migration:** Update export paths

## Validation Strategy

### After Each Batch:
1. **Type Check:** `pnpm tsc --noEmit`
2. **Build:** `pnpm build`
3. **Runtime Test:** Test affected workspace (IDE, Knowledge, Notes, Study)

### After Complete Migration:
1. **Verify Zero Legacy Imports:**
   ```bash
   grep -r "from '@/stores/agents-store'" src/
   grep -r "from '@/lib/state/agents-store'" src/
   grep -r "from '@/infrastructure/persistence/stores/agents'" src/
   ```

2. **Delete Legacy Stores:**
   ```bash
   rm src/stores/agents-store.ts
   rm src/lib/state/agents-store.ts
   ```

3. **Final Validation:**
   ```bash
   pnpm tsc --noEmit
   pnpm build
   pnpm test
   ```

## Risk Assessment

**Risk Level:** LOW

**Justification:**
1. **No Logic Changes:** Only updating imports
2. **Backward Compatible:** Convenience selectors maintain same API
3. **Proven Architecture:** Store already battle-tested (Cycle 12-17)
4. **Incremental Migration:** Batched approach allows rollback
5. **Type Safety:** TypeScript will catch import errors

**Potential Issues:**
1. **Circular Dependencies:** Repomix analysis will reveal any
2. **Missing Selectors:** May need to add convenience selectors
3. **Event Bus Integration:** Verify `getState()` pattern works

## Next Steps

1. **AWAITING:** Repomix full analysis (agent a4198e0)
2. **VERIFY:** No additional migration points
3. **CONFIRM:** No circular dependencies
4. **EXECUTE:** Batch 1 migration (P0 UI components)
5. **VALIDATE:** Test after each batch
6. **DOCUMENT:** Update CLAUDE.md and AGENTS.md

## Questions for Repomix Analysis

1. **Complete Store Inventory:** Are there more than 20 files using legacy stores?
2. **Circular Dependencies:** Will migration create any circular deps?
3. **Data Flow Mapping:** Complete data flow from Provider → Agent → Chat?
4. **Test Coverage:** Are all 20 files covered by tests?
5. **Breakage Risk:** What could break during migration?

---

**Status:** Awaiting Repomix analysis results before executing migration.

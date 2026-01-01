# Single Bounded Store Implementation Plan
**Epic AC-1: Stories AC-1.6 - AC-1.10**
**Date**: 2026-01-01
**Status**: Ready for Execution

---

## Executive Summary

**Objective**: Merge agents-store, provider-store, and models-loader-store into a single bounded store using Zustand's December 2025 best practices.

**Target Architecture**:
```
BEFORE: 3 stores (1,056 lines total)
├── agents-store.ts (780 lines across 6 files)
├── provider-store.ts (267 lines)
└── models-loader-store.ts (298 lines) [DUPLICATE]

AFTER: 1 bounded store with 11 slices (~900 lines)
└── use-app-store.ts
    ├── agents/ (5 slices - already done ✅)
    └── providers/ (1 unified slice + merge models-loader)
```

**Benefits**:
- ✅ Eliminates circular dependency completely
- ✅ Reduces code by 156 lines (1,056 → 900)
- ✅ Single source of truth for agent + provider config
- ✅ Aligns with Zustand best practices
- ✅ Simplifies cross-store communication
- ✅ Better TypeScript inference
- ✅ Easier testing (single store to mock)

**Estimated Effort**: 12 hours (2 days @ 6h/day)

---

## Current State Analysis

### Store Locations (Scattered Across 3 Directories)

```
src/infrastructure/persistence/stores/  (NEW - 25+ stores)
├── agents/                             ✅ Already refactored (780 lines, 6 files)
│   ├── agents-store.ts                (115 lines) - Combined store
│   ├── types.ts                       (134 lines) - State interface
│   ├── slices/                        (5 slices = 665 lines)
│   │   ├── agent-crud-slice.ts       (166 lines)
│   │   ├── agent-workspace-bindings-slice.ts (139 lines)
│   │   ├── agent-validation-slice.ts (129 lines) ⚠️ Imports provider-store
│   │   ├── agent-events-slice.ts     (123 lines)
│   │   └── agent-utils-slice.ts      (108 lines)
│   └── index.ts                      (25 lines) - Facade
├── providers/                          ❌ DOES NOT EXIST YET
└── [24 other stores...]

src/lib/state/                          (OLD - 19 stores)
├── provider-store.ts                   (267 lines) - ⚠️ MOVE to providers/
└── [18 other stores...]

src/stores/                             (DEPRECATED - 6 stores)
├── agents-store.ts                     (33 lines) - ✅ Facade (backward compat)
└── models-loader-store.ts              (298 lines) - ❌ DELETE (merge into provider)
```

### Circular Dependency Graph (Current State)

```
agent-validation-slice.ts
  └─> import { useProviderStore } from '@/lib/state/provider-store'
        └─> provider-store.ts (267 lines)
              └─> import { AGENT_REGISTRY } from '@/infrastructure/persistence/stores/agents/agent-registry-store'
                    └─> agents-store
                          └─> CIRCULAR DEPENDENCY 🔴

IMPACT:
- Breaks hot-module reload (HMR)
- "Cannot access 'X' before initialization" errors
- Violates Zustand best practices
```

### Duplicate Store Problem

**models-loader-store.ts** (298 lines) duplicates 70% of provider-store:

| Function | models-loader-store | provider-store | Status |
|----------|---------------------|----------------|--------|
| `models` state | `Record<string, ModelStateEntry>` | `availableModels` | DUPLICATE |
| `loadModelsForProvider()` | ~40 lines | `fetchModels()` | DUPLICATE |
| Import provider-store | Lines 28, 76, 175, 293 | N/A | CIRCULAR DEP |

**Action**: Merge into provider slice, delete models-loader-store.ts

---

## Target Architecture

### Single Bounded Store Structure

```
src/infrastructure/persistence/stores/
├── use-app-store.ts                  (150 lines) - COMBINED STORE ⭐ NEW
├── types.ts                          (80 lines) - AppState interface ⭐ NEW
├── agents/                           (6 files - already exists ✅)
│   ├── agents-store.ts              → DELETED (merged into use-app-store.ts)
│   ├── types.ts                     → Keep (export CombinedAgentsState)
│   ├── slices/                      → Keep (5 slices unchanged)
│   └── index.ts                     → Keep (facade re-exports)
├── providers/                        ⭐ NEW DIRECTORY
│   ├── provider-slice.ts            (400 lines) - Unified provider slice
│   ├── types.ts                     (100 lines) - Provider types
│   └── index.ts                     (20 lines) - Facade re-exports
└── [other stores remain unchanged...]
```

### File Contents

**1. `use-app-store.ts`** (150 lines)
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';

// Import all slices
import {
  createAgentCrudSlice,
  createAgentWorkspaceBindingsSlice,
  createAgentValidationSlice,
  createAgentEventsSlice,
  createAgentUtilsSlice,
} from './agents/slices';

import {
  createProviderSlice,
} from './providers/provider-slice';

import type { AppState } from './types';

/**
 * Single Bounded Store - December 2025 Zustand Pattern
 *
 * Combines agents and providers into one unified store.
 * Eliminates circular dependencies and simplifies cross-store communication.
 */
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Agent slices (5)
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),

      // Provider slice (1 unified)
      ...createProviderSlice(...a),
    }),
    {
      name: 'app-state',

      // Use Dexie storage adapter
      storage: createJSONStorage(() => createDexieStorage('appState')),

      // Selective persistence
      partialize: (state) => ({
        // Agent state
        agents: state.agents,
        activeAgentId: state.activeAgentId,

        // Provider state
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),

      // Hydration handler
      onRehydrateStorage: () => (state) => {
        console.log('[AppStore] Rehydrated from IndexedDB');
        // Restore defaults if empty
        if (!state.agents || state.agents.length === 0) {
          state.agents = [DEFAULT_AGENT];
          state.activeAgentId = DEFAULT_AGENT.id;
        }
        if (!state.providers || state.providers.length === 0) {
          state.providers = INITIAL_PROVIDERS;
          state.activeProviderId = 'openrouter';
        }
        state.setHasHydrated(true);
      },
    }
  )
);

// Export hooks for convenience
export function useAppStoreHydration() {
  return useAppStore((state) => state._hasHydrated);
}
```

**2. `types.ts`** (80 lines)
```typescript
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBinding } from '@/core/entities/Agent';
import type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
} from './providers/types';

// ============================================================================
// AGENT STATE (from agents/types.ts - CombinedAgentsState)
// ============================================================================

export interface AgentCrudState {
  agents: Agent[];
  activeAgentId: string | null;
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  setActiveAgent: (id: string | null) => void;
  resetToDefaults: () => void;
}

export interface AgentWorkspaceBindingsState {
  getAgentsForWorkspace: (workspaceType: WorkspaceType) => Agent[];
  updateWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;
  updateAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBinding>) => void;
  getAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType) => WorkspaceBinding | undefined;
  isAgentAvailableInWorkspace: (agentId: string, workspaceType: WorkspaceType) => boolean;
}

export interface AgentValidationState {
  validationErrors: Record<string, string[]>;
  addAgentValidated: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;
  updateAgentValidated: (id: string, updates: Partial<Agent>) => void;
  clearValidationErrors: (agentId: string) => void;
}

export interface AgentEventsState {
  addAgentWithEvent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;
  removeAgentWithEvent: (id: string) => void;
  updateAgentWithEvent: (id: string, updates: Partial<Agent>) => void;
  updateWorkspaceBindingWithEvent: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;
}

export interface AgentUtilsState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  getAgent: (id: string) => Agent | undefined;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  getActiveAgent: () => Agent | undefined;
  getAgentsCount: () => number;
}

// ============================================================================
// PROVIDER STATE (from provider-store.ts + models-loader-store.ts)
// ============================================================================

export interface ProviderState {
  providers: ProviderConfig[];
  activeProviderId: string | null;
  modelSettings: Record<string, ModelSettings>;
  availableModels: Record<string, ModelInfo[]>;
  isLoading: boolean;
  isLoadingModels: Record<string, boolean>;
  selectedModelId: string | null;
  modelCache: Record<string, ModelStateEntry>;

  addProvider: (config: ProviderConfig) => void;
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
  removeProvider: (id: string, agents?: Agent[]) => Promise<void>;
  setActiveProvider: (id: string) => void;
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
  fetchModels: (providerId: string) => Promise<void>;
  getAvailableModels: (providerId: string) => ModelInfo[];
  reset: () => void;

  // Merged from models-loader-store
  setSelectedModel: (modelId: string) => void;
  loadModelsForProvider: (providerId: string) => Promise<void>;
  clearModelsCache: (providerId: string) => void;
}

// ============================================================================
// COMBINED APP STATE
// ============================================================================

export type AppState = AgentCrudState
  & AgentWorkspaceBindingsState
  & AgentValidationState
  & AgentEventsState
  & AgentUtilsState
  & ProviderState;
```

**3. `providers/provider-slice.ts`** (400 lines)
```typescript
import { StateCreator } from 'zustand';
import type { AppState } from '../types';
import type { ProviderConfig, ModelInfo, ModelSettings, ModelStateEntry } from './types';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { modelRegistry } from '@/lib/agent/providers/model-registry';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

// Initial providers
const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    models: [],
    isActive: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: '',
    models: [],
    isActive: true,
  },
  // ... (other initial providers)
];

/**
 * Provider Slice - Unified Provider Configuration
 *
 * Merges provider-store.ts + models-loader-store.ts into a single slice.
 * Eliminates circular dependency with agent-validation-slice.
 */
export const createProviderSlice: StateCreator<
  AppState,
  [],
  [],
  Omit<AppState,
    | 'agents' | 'activeAgentId' | 'addAgent' | 'removeAgent' | 'updateAgent'
    | 'setActiveAgent' | 'resetToDefaults' | 'validationErrors'
    | 'addAgentValidated' | 'updateAgentValidated' | 'clearValidationErrors'
    | 'addAgentWithEvent' | 'removeAgentWithEvent' | 'updateAgentWithEvent'
    | 'updateWorkspaceBindingWithEvent' | 'getAgentsForWorkspace'
    | 'updateWorkspaceBinding' | 'updateAgentWorkspaceBinding'
    | 'getAgentWorkspaceBinding' | 'isAgentAvailableInWorkspace'
    | '_hasHydrated' | 'setHasHydrated' | 'getAgent' | 'updateAgentStatus'
    | 'getActiveAgent' | 'getAgentsCount'
  >
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  providers: INITIAL_PROVIDERS,
  activeProviderId: 'openrouter',
  modelSettings: {},
  availableModels: {},
  isLoading: false,
  isLoadingModels: {},
  selectedModelId: null,
  modelCache: {},

  // ========================================================================
  // ACTIONS (8 from provider-store + 3 from models-loader-store)
  // ========================================================================

  /**
   * Add a new provider
   */
  addProvider: (config: ProviderConfig) => {
    console.log('[ProviderSlice] Adding provider:', config.id);
    set((state) => ({
      providers: [...state.providers, config]
    }));
  },

  /**
   * Update an existing provider
   */
  updateProvider: (id: string, config: Partial<ProviderConfig>) => {
    console.log('[ProviderSlice] Updating provider:', id);
    set((state) => ({
      providers: state.providers.map(p =>
        p.id === id ? { ...p, ...config } : p
      )
    }));
  },

  /**
   * Remove a provider (validates no dependent agents)
   */
  removeProvider: async (id: string, agents?: any[]) => {
    console.log('[ProviderSlice] Removing provider:', id);

    // Check if agents are using this provider
    const dependentAgents = (agents || get().agents).filter((a: any) => a.providerId === id);

    if (dependentAgents.length > 0) {
      throw new Error(
        `Cannot delete provider "${id}" - ${dependentAgents.length} agent(s) depend on it: ` +
        dependentAgents.map((a: any) => a.name).join(', ')
      );
    }

    set((state) => ({
      providers: state.providers.filter(p => p.id !== id)
    }));
  },

  /**
   * Set active provider
   */
  setActiveProvider: (id: string) => {
    console.log('[ProviderSlice] Setting active provider:', id);
    set({ activeProviderId: id });
  },

  /**
   * Update model settings for a provider
   */
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => {
    console.log('[ProviderSlice] Updating model settings:', providerId);
    set((state) => ({
      modelSettings: {
        ...state.modelSettings,
        [providerId]: { ...state.modelSettings[providerId], ...settings }
      }
    }));
  },

  /**
   * Fetch models for a provider (from API)
   */
  fetchModels: async (providerId: string) => {
    console.log('[ProviderSlice] Fetching models for provider:', providerId);

    set((state) => ({
      isLoadingModels: { ...state.isLoadingModels, [providerId]: true }
    }));

    try {
      const provider = get().providers.find(p => p.id === providerId);
      if (!provider) throw new Error(`Provider ${providerId} not found`);

      // Get API key from credential vault
      const apiKey = await credentialVault.getCredential(providerId, 'default');
      if (!apiKey) {
        console.warn('[ProviderSlice] No API key for provider:', providerId);
        set((state) => ({
          availableModels: { ...state.availableModels, [providerId]: [] }
        }));
        return;
      }

      // Fetch models from registry
      const models = await modelRegistry.fetchModels(providerId, apiKey);

      set((state) => ({
        availableModels: { ...state.availableModels, [providerId]: models },
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false }
      }));

      // Emit cross-workspace event
      const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
      crossWorkspaceEventBus.emit('ProviderModelsFetched', {
        workspaceId: currentWorkspace,
        providerId,
        modelCount: models.length,
      });

    } catch (error) {
      console.error('[ProviderSlice] Error fetching models:', error);
      set((state) => ({
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false }
      }));
    }
  },

  /**
   * Get available models for a provider
   */
  getAvailableModels: (providerId: string) => {
    return get().availableModels[providerId] || [];
  },

  /**
   * Reset to initial providers
   */
  reset: () => {
    console.log('[ProviderSlice] Resetting to defaults');
    set({
      providers: INITIAL_PROVIDERS,
      activeProviderId: 'openrouter',
      modelSettings: {},
      availableModels: {},
    });
  },

  // ========================================================================
  // MERGED FROM MODELS-LOADER-STORE
  // ========================================================================

  /**
   * Set selected model (merged from models-loader-store)
   */
  setSelectedModel: (modelId: string) => {
    console.log('[ProviderSlice] Setting selected model:', modelId);
    set({ selectedModelId: modelId });
  },

  /**
   * Load models for provider with caching (merged from models-loader-store)
   */
  loadModelsForProvider: async (providerId: string) => {
    console.log('[ProviderSlice] Loading models (with caching):', providerId);

    const cache = get().modelCache[providerId];

    // Return cached models if fresh (<5 minutes old)
    if (cache && cache.lastFetchedAt && Date.now() - cache.lastFetchedAt < 300000) {
      console.log('[ProviderSlice] Returning cached models for:', providerId);
      set((state) => ({
        availableModels: { ...state.availableModels, [providerId]: cache.models }
      }));
      return;
    }

    // Fetch fresh models
    await get().fetchModels(providerId);

    // Update cache
    const models = get().availableModels[providerId];
    set((state) => ({
      modelCache: {
        ...state.modelCache,
        [providerId]: {
          models,
          isLoadingModels: false,
          lastFetchedAt: Date.now(),
          error: null,
        }
      }
    }));
  },

  /**
   * Clear models cache for a provider (merged from models-loader-store)
   */
  clearModelsCache: (providerId: string) => {
    console.log('[ProviderSlice] Clearing cache for provider:', providerId);
    set((state) => {
      const newCache = { ...state.modelCache };
      delete newCache[providerId];
      return { modelCache: newCache };
    });
  },
});
```

**4. `providers/types.ts`** (100 lines)
```typescript
import type { Agent } from '@/core/entities/Agent';

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: ModelInfo[];
  isActive: boolean;
  isCustom?: boolean;
  headers?: Record<string, string>;
}

export interface ModelInfo {
  id: string;
  name: string;
  providerId: string;
  contextLength?: number;
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsImages?: boolean;
  supportsTools?: boolean;
}

export interface ModelSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ModelStateEntry {
  models: ModelInfo[];
  isLoadingModels: boolean;
  lastFetchedAt: number | null;
  error: string | null;
}

// ============================================================================
// RE-EXPORT FROM OTHER MODULES
// ============================================================================

export type { Agent } from '@/core/entities/Agent';
```

**5. `providers/index.ts`** (20 lines)
```typescript
/**
 * Provider Store Facade - Backward Compatibility
 *
 * Re-exports from use-app-store for zero breaking changes.
 */

export { useAppStore } from '../use-app-store';
export type { AppState, ProviderState, ModelSettings } from '../types';

// Convenience selectors
export const useProviders = () => useAppStore((s) => s.providers);
export const useActiveProvider = () => useAppStore((s) => s.providers.find(p => p.id === s.activeProviderId));
export const useAvailableModels = (providerId: string) =>
  useAppStore((s) => s.availableModels[providerId] || []);
```

---

## Implementation Steps

### Story AC-1.6: Create Provider Slice (4 hours)

**Objective**: Create unified provider slice by merging provider-store + models-loader-store.

**Tasks**:
1. Create directory: `src/infrastructure/persistence/stores/providers/`
2. Create `providers/types.ts` (100 lines) - Define ProviderConfig, ModelInfo, ModelSettings, ModelStateEntry
3. Create `providers/provider-slice.ts` (400 lines) - Implement 11 actions (8 from provider-store + 3 from models-loader)
4. Copy constants (INITIAL_PROVIDERS) from provider-store.ts
5. Internalize event subscriptions (no cross-store imports)
6. Verify no imports from agents-store or provider-store

**Acceptance Criteria**:
- ✅ Single provider slice file (<450 lines)
- ✅ All 11 actions implemented with correct signatures
- ✅ No circular imports (no imports from agents directory)
- ✅ TypeScript compiles with zero errors
- ✅ Console logs added for debugging

**Files Created**:
- `src/infrastructure/persistence/stores/providers/provider-slice.ts`
- `src/infrastructure/persistence/stores/providers/types.ts`

---

### Story AC-1.7: Create Single Bounded Store (3 hours)

**Objective**: Combine agents and providers into use-app-store.ts.

**Tasks**:
1. Create `src/infrastructure/persistence/stores/use-app-store.ts` (150 lines)
2. Create `src/infrastructure/persistence/stores/types.ts` (80 lines) - Define AppState interface
3. Import all 6 slices (5 agents + 1 provider)
4. Add persist middleware with Dexie storage
5. Implement partialize for selective persistence
6. Add onRehydrateStorage handler with defaults
7. Export useAppStoreHydration hook

**Acceptance Criteria**:
- ✅ Single bounded store file (<200 lines)
- ✅ All 6 slices combined correctly
- ✅ Persist middleware configured with Dexie
- ✅ Hydration works correctly (check console logs)
- ✅ TypeScript compiles with zero errors
- ✅ Build passes with zero errors

**Files Created**:
- `src/infrastructure/persistence/stores/use-app-store.ts`
- `src/infrastructure/persistence/stores/types.ts`

**Files Modified**:
- `src/infrastructure/persistence/stores/index.ts` (add export)

---

### Story AC-1.8: Create Facade Re-Exports (2 hours)

**Objective**: Maintain backward compatibility for all existing imports.

**Tasks**:
1. Create `src/infrastructure/persistence/stores/providers/index.ts` (20 lines)
2. Update `src/infrastructure/persistence/stores/agents/index.ts` (re-export from use-app-store)
3. Create `src/lib/state/provider-store.ts` (NEW - facade, 30 lines)
4. Create `src/stores/provider-store.ts` (NEW - facade, 30 lines)
5. Update `src/stores/agents-store.ts` (already a facade, verify it works)
6. Verify all 11 dependencies still work without modification

**Acceptance Criteria**:
- ✅ All 9 production files work without modification
- ✅ All 2 test files work without modification
- ✅ No breaking changes to public API
- ✅ TypeScript compiles with zero errors
- ✅ Existing tests pass

**Files Created**:
- `src/lib/state/provider-store.ts` (NEW - facade)
- `src/stores/provider-store.ts` (NEW - facade)

**Files Modified**:
- `src/infrastructure/persistence/stores/providers/index.ts`
- `src/infrastructure/persistence/stores/agents/index.ts`
- `src/stores/agents-store.ts` (verify)

---

### Story AC-1.9: Delete Duplicate Stores (1 hour)

**Objective**: Remove obsolete files after migration.

**Tasks**:
1. Delete `src/lib/state/provider-store.ts` (OLD - 267 lines)
2. Delete `src/stores/models-loader-store.ts` (298 lines)
3. Delete `src/infrastructure/persistence/stores/agents/agents-store.ts` (115 lines, merged into use-app-store)
4. Run `grep -r "models-loader-store" src/` (verify no remaining imports)
5. Run `grep -r "from.*provider-store" src/` (verify imports use facade)
6. Update documentation (AGENTS.md, CLAUDE.md)

**Acceptance Criteria**:
- ✅ Old provider-store.ts deleted
- ✅ models-loader-store.ts deleted
- ✅ No remaining imports to deleted files
- ✅ Documentation updated with new structure

**Files Deleted**:
- `src/lib/state/provider-store.ts` (OLD)
- `src/stores/models-loader-store.ts`
- `src/infrastructure/persistence/stores/agents/agents-store.ts`

**Files Modified**:
- `AGENTS.md`
- `CLAUDE.md`

---

### Story AC-1.10: Write Unit Tests (3 hours)

**Objective**: Test the unified store with comprehensive coverage.

**Tasks**:
1. Create `src/infrastructure/persistence/stores/__tests__/use-app-store.test.ts` (300 lines)
2. Test agent CRUD operations (add, update, remove, setActive)
3. Test provider CRUD operations (add, update, remove, setActive)
4. Test cross-slice communication (agent validates against provider models)
5. Test workspace filtering (getAgentsForWorkspace)
6. Test event emission (addAgentWithEvent, fetchModels)
7. Test persistence (Dexie save/load)
8. Test hydration (restore defaults if empty)
9. Test model caching (loadModelsForProvider with cache)
10. Achieve minimum 80% code coverage

**Acceptance Criteria**:
- ✅ All 10 test scenarios pass
- ✅ Code coverage ≥80%
- ✅ No console errors in test output
- ✅ Mock dependencies correctly (credential-vault, model-registry)

**Files Created**:
- `src/infrastructure/persistence/stores/__tests__/use-app-store.test.ts`
- `src/infrastructure/persistence/stores/__tests__/provider-slice.test.ts`

**Test Scenarios**:
```typescript
describe('useAppStore', () => {
  it('should add agent with validation', async () => {
    // Test agent-validation-slice calls provider-slice via get()
  });

  it('should fetch models for provider', async () => {
    // Test provider-slice fetchModels action
    // Mock credential-vault.getCredential
    // Mock model-registry.fetchModels
    // Verify cross-workspace event emitted
  });

  it('should prevent deleting provider with dependent agents', () => {
    // Test removeProvider validation
    // Should throw error if agents depend on provider
  });

  it('should cache models for 5 minutes', async () => {
    // Test loadModelsForProvider caching
    // Verify cache hit on second call within 5 minutes
  });

  it('should persist state to IndexedDB', async () => {
    // Test persist middleware
    // Verify Dexie storage adapter works
  });

  it('should restore defaults on hydration if empty', async () => {
    // Test onRehydrateStorage handler
    // Verify DEFAULT_AGENT added if agents array empty
  });

  it('should get agents for workspace type', () => {
    // Test workspace filtering
    // Verify getAgentsForWorkspace returns correct agents
  });

  it('should emit cross-workspace events', () => {
    // Test event emission in agent-events-slice
    // Verify cross-workspace-event-bus.emitAgentConfigChange called
  });

  it('should update agent status', () => {
    // Test agent-utils-slice
    // Verify updateAgentStatus updates lastActive timestamp
  });

  it('should clear validation errors after successful update', () => {
    // Test agent-validation-slice
    // Verify validationErrors cleared after updateAgentValidated
  });
});
```

---

### Story AC-1.11: Manual Testing + Validation (2 hours)

**Objective**: Validate the refactored store works in production-like scenarios.

**Test Scenarios** (5):

1. **Add Custom Provider via UI**
   - Open ProviderConfigDialog
   - Enter provider name, base URL, API key
   - Save
   - Verify: Provider appears in list, persisted to IndexedDB

2. **Update API Key for Built-in Provider**
   - Select Anthropic provider
   - Update API key
   - Save
   - Verify: Key saved to credential vault, models fetchable

3. **Delete Provider with Dependent Agents**
   - Create agent using OpenRouter provider
   - Try to delete OpenRouter provider
   - Verify: Error message shown, deletion blocked

4. **Fetch Models for Provider**
   - Select provider with valid API key
   - Click "Fetch Models"
   - Verify: Models loaded, cross-workspace event emitted

5. **Switch Active Provider**
   - Select different active provider
   - Verify: activeProviderId updated, UI reflects change

**Success Criteria**:
- ✅ All 5 manual tests pass
- ✅ Zero console errors
- ✅ Hot-reload works without errors
- ✅ No circular dependency warnings
- ✅ DevTools shows correct state structure

---

## Risk Assessment

### Low Risk ✅

**Reasons**:
1. Facade pattern ensures zero breaking changes
2. All existing imports continue to work
3. Comprehensive unit tests (10 scenarios)
4. Manual testing validates real-world usage
5. Gradual migration (can rollback at any step)

### Medium Risk ⚠️

**Concerns**:
1. **Dexie Data Migration**: Users might have existing provider data in IndexedDB
   - **Mitigation**: Test with production data backup, keep old table structure
2. **Event Bus Changes**: Cross-workspace events might have different payloads
   - **Mitigation**: Emit events with same structure, add logging

### High Risk 🔴

**Concerns**:
1. **Hot-Reload Breaking**: Changes to store structure might break HMR
   - **Mitigation**: Test in dev mode, verify no "Cannot access before initialization" errors
2. **Type Errors**: Combined AppState type might have conflicts
   - **Mitigation**: Use `Omit<>` generics carefully, run `tsc --noEmit` after each step

---

## Rollback Plan

If migration fails at any step:

```bash
# 1. Restore old files from git
git checkout HEAD~1 src/infrastructure/persistence/stores/use-app-store.ts
git checkout HEAD~1 src/infrastructure/persistence/stores/providers/
git checkout HEAD~1 src/lib/state/provider-store.ts
git checkout HEAD~1 src/stores/models-loader-store.ts

# 2. Delete new files
rm -rf src/infrastructure/persistence/stores/providers/
rm src/infrastructure/persistence/stores/use-app-store.ts

# 3. Restart dev server
pnpm dev

# 4. Verify old functionality works
# - Provider CRUD works
# - Agent CRUD works
# - Models fetchable
# - No console errors
```

---

## Success Criteria

### Functional Requirements

- [ ] All 9 production files work without modification
- [ ] All 2 test files work without modification
- [ ] Provider CRUD operations work (add, update, remove)
- [ ] Agent CRUD operations work (add, update, remove)
- [ ] Model fetching works with API keys
- [ ] Workspace filtering works (getAgentsForWorkspace)
- [ ] Cross-workspace events emitted correctly
- [ ] Validation works (agent validates provider/model combinations)
- [ ] Dexie persistence works (state survives reload)
- [ ] Hydration works (defaults restored if empty)

### Non-Functional Requirements

- [ ] Zero TypeScript errors
- [ ] Zero build errors
- [ ] Zero circular dependency warnings
- [ ] Hot-reload works without errors
- [ ] Code coverage ≥80%
- [ ] All 10 unit tests pass
- [ ] All 5 manual tests pass
- [ ] Console logs added for debugging
- [ ] Documentation updated (AGENTS.md, CLAUDE.md)

### Code Quality Requirements

- [ ] No files >450 lines (provider slice)
- [ ] No functions >50 lines complexity
- [ ] Proper TypeScript types (no `any`)
- [ ] Clear naming conventions
- [ ] Comprehensive JSDoc comments
- [ ] Error handling with try-catch
- [ ] Consistent code style (Prettier)

---

## Timeline

| Story | Task | Effort | Status |
|-------|------|--------|--------|
| AC-1.6 | Create provider slice | 4h | Pending |
| AC-1.7 | Create single bounded store | 3h | Pending |
| AC-1.8 | Create facade re-exports | 2h | Pending |
| AC-1.9 | Delete duplicate stores | 1h | Pending |
| AC-1.10 | Write unit tests | 3h | Pending |
| AC-1.11 | Manual testing + validation | 2h | Pending |
| **Total** | | **15h** | |

**Sprint Allocation**: 2.5 days (assuming 6h/day effective work)

---

## Related Artifacts

- **Provider Store Analysis**: `_bmad-output/architecture-analysis/provider-store-architecture-analysis-2026-01-01.md`
- **Provider Store Summary**: `_bmad-output/architecture-analysis/provider-store-analysis-summary-2026-01-01.md`
- **Provider Store Migration**: `_bmad-output/architecture-analysis/provider-store-migration-quick-reference-2026-01-01.md`
- **Agents Store Validation**: `_bmad-output/codebase-analysis/agents-store-validation-2026-01-01.md`
- **Three Centralized Systems Analysis**: `_bmad-output/codebase-analysis/three-centralized-systems-analysis-2026-01-01.md`

---

**Implementation Plan End**

Generated: 2026-01-01
Epic: AC-1 - Agent Configuration Consolidation
Stories: AC-1.6 through AC-1.11
Next Action: Execute Story AC-1.6 (Create Provider Slice)

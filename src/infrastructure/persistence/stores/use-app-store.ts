/**
 * App Store - Single Bounded Store
 *
 * Combines agents and providers into a single Zustand store.
 * Follows December 2025 Zustand best practices:
 * - Single bounded store architecture (no multiple stores)
 * - Slice pattern for modularity
 * - Persist middleware on combined store (not individual slices)
 * - Cross-slice communication via get()
 * - Dexie persistence with selective partialize
 *
 * This eliminates the circular dependency between agents and providers.
 *
 * @module stores/use-app-store
 * @story AC-1.7 - Create single bounded store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';

// Import agent slices
import {
  createAgentCrudSlice,
  createAgentWorkspaceBindingsSlice,
  createAgentValidationSlice,
  createAgentEventsSlice,
  createAgentUtilsSlice,
  DEFAULT_AGENT,
} from './agents/slices';

// Import provider slices (split into 3 slices to meet 300-line limit)
import { createProviderCrudSlice } from './providers/provider-crud-slice';
import { createProviderModelsSlice } from './providers/provider-models-slice';
import { createProviderUtilsSlice } from './providers/provider-utils-slice';

// Import types
import type { AppState } from './types';

/**
 * Single Bounded Store - December 2025 Zustand Pattern
 *
 * Combines agents and providers into one unified store.
 * Eliminates circular dependencies and simplifies cross-store communication.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { agents, providers, addAgent, fetchModels } = useAppStore();
 *
 * // Selectors (optimized re-renders)
 * const agents = useAppStore((state) => state.agents);
 * const activeProvider = useAppStore((state) => state.providers.find(p => p.id === state.activeProviderId));
 *
 * // Actions
 * const handleAddAgent = () => {
 *   useAppStore.getState().addAgent({ name: 'My Agent', ... });
 * };
 * ```
 */
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // ========================================================================
      // AGENT SLICES (5 slices)
      // ========================================================================

      // Slice 1: Agent CRUD (pure operations)
      ...createAgentCrudSlice(...a),

      // Slice 2: Agent Workspace Bindings (workspace filtering)
      ...createAgentWorkspaceBindingsSlice(...a),

      // Slice 3: Agent Validation (provider/model validation)
      ...createAgentValidationSlice(...a),

      // Slice 4: Agent Events (cross-workspace event emission)
      ...createAgentEventsSlice(...a),

      // Slice 5: Agent Utils (selectors and hydration)
      ...createAgentUtilsSlice(...a),

      // ========================================================================
      // PROVIDER SLICES (3 slices - split to meet 300-line limit)
      // ========================================================================

      // Provider CRUD Slice (add, update, remove, setActive, reset)
      ...createProviderCrudSlice(...a),

      // Provider Models Slice (fetchModels, loadModelsForProvider, caching)
      ...createProviderModelsSlice(...a),

      // Provider Utils Slice (updateModelSettings, getAvailableModels, setSelectedModel)
      ...createProviderUtilsSlice(...a),
    }),
    {
      name: 'app-state',

      // Use Dexie storage adapter for IndexedDB persistence
      storage: createJSONStorage(() => createDexieStorage('appState')),

      // Selective persistence (only critical data, not ephemeral state)
      partialize: (state) => ({
        // Agent state (persisted)
        agents: state.agents,
        activeAgentId: state.activeAgentId,

        // Provider state (persisted)
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,

        // NOT persisted (ephemeral):
        // - validationErrors (cleared on reload)
        // - _hasHydrated (runtime flag)
        // - availableModels (fetched on demand)
        // - isLoading (ephemeral)
        // - isLoadingModels (ephemeral)
        // - selectedModelId (ephemeral)
        // - modelCache (rebuild on demand)
      }),

      // Hydration handler - restore defaults if empty
      onRehydrateStorage: () => (state) => {
        console.log('[AppStore] Rehydrated from IndexedDB');

        if (!state) {
          console.warn('[AppStore] Hydration failed - state is null');
          return;
        }

        // Ensure at least one agent exists
        if (!state.agents || state.agents.length === 0) {
          console.log('[AppStore] No agents found, restoring defaults');
          state.agents = [DEFAULT_AGENT];
          state.activeAgentId = DEFAULT_AGENT.id;
        }

        // Ensure activeAgentId points to valid agent
        if (state.activeAgentId && !state.agents.find(a => a.id === state.activeAgentId)) {
          console.warn('[AppStore] Active agent ID invalid, resetting to first agent');
          state.activeAgentId = state.agents[0]?.id || null;
        }

        // Ensure at least one provider exists
        if (!state.providers || state.providers.length === 0) {
          console.log('[AppStore] No providers found, this should not happen');
          // Providers are initialized in the slice, so this shouldn't occur
        }

        // Ensure activeProviderId points to valid provider
        if (state.activeProviderId && !state.providers.find(p => p.id === state.activeProviderId)) {
          console.warn('[AppStore] Active provider ID invalid, resetting to first provider');
          state.activeProviderId = state.providers[0]?.id || null;
        }

        // Mark hydration as complete
        state.setHasHydrated(true);

        console.log('[AppStore] Hydration complete:', {
          agentsCount: state.agents.length,
          providersCount: state.providers.length,
          activeAgentId: state.activeAgentId,
          activeProviderId: state.activeProviderId,
        });
      },
    }
  )
);

/**
 * Hook to wait for hydration from IndexedDB
 *
 * Use this to ensure the store has been hydrated before rendering.
 * Components can use this to show a loading state while data is being restored.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasHydrated = useAppStoreHydration();
 *   if (!hasHydrated) return <Loading />;
 *   return <AgentConfig />;
 * }
 * ```
 */
export function useAppStoreHydration() {
  return useAppStore((state) => state._hasHydrated);
}

/**
 * Convenience selectors for common use cases
 *
 * These selectors optimize re-renders by subscribing to specific state slices.
 */

/**
 * Get all agents
 */
export const useAgents = () => useAppStore((state) => state.agents);

/**
 * Get active agent
 */
export const useActiveAgent = () => useAppStore((state) => {
  const { activeAgentId, agents } = state;
  if (!activeAgentId) return undefined;
  return agents.find(a => a.id === activeAgentId);
});

/**
 * Get agents for specific workspace
 */
export const useAgentsForWorkspace = (workspaceType: WorkspaceType) =>
  useAppStore((state) => state.getAgentsForWorkspace(workspaceType));

/**
 * Get all providers
 */
export const useProviders = () => useAppStore((state) => state.providers);

/**
 * Get active provider
 */
export const useActiveProvider = () => useAppStore((state) => {
  const { activeProviderId, providers } = state;
  if (!activeProviderId) return undefined;
  return providers.find(p => p.id === activeProviderId);
});

/**
 * Get available models for a provider
 */
export const useAvailableModels = (providerId: string) =>
  useAppStore((state) => state.availableModels[providerId] || []);

/**
 * Get validation errors for an agent
 */
export const useValidationErrors = (agentId: string) =>
  useAppStore((state) => state.validationErrors[agentId]);

// Import WorkspaceType for selector
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Backward Compatibility Alias: useProviderStore
 * 
 * Some components still import useProviderStore from this module.
 * This hook provides a provider-focused view of the app store.
 * 
 * @deprecated Use useAppStore directly with selectors instead
 */
export const useProviderStore = () => useAppStore((state) => ({
  providers: state.providers,
  availableModels: state.availableModels,
  isLoadingModels: state.isLoadingModels,
  activeProviderId: state.activeProviderId,
  addProvider: state.addProvider,
  updateProvider: state.updateProvider,
  removeProvider: state.removeProvider,
  fetchModels: state.fetchModels,
  setActiveProvider: state.setActiveProvider,
}));


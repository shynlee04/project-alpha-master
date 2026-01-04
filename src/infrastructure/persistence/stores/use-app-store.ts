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
import { useMemo } from 'react';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import { runMigrations, validateMigratedState, CURRENT_SCHEMA_VERSION } from './schema-migrations';

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
      // SCHEMA VERSION (for migrations)
      // ========================================================================

      version: CURRENT_SCHEMA_VERSION,

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
      // Note: Using 'providerConfigs' table as generic storage for app state
      storage: createJSONStorage(() => createDexieStorage('providerConfigs' as keyof typeof import('../dexie-db').db)),

      // Selective persistence (only critical data, not ephemeral state)
      partialize: (state) => ({
        // Schema version (for migrations)
        version: state.version,

        // Agent state (persisted)
        agents: state.agents,

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
      onRehydrateStorage: () => async (state) => {
        console.log('[AppStore] Rehydrated from IndexedDB');

        if (!state) {
          console.warn('[AppStore] Hydration failed - state is null');
          return;
        }

        // ========================================================================
        // PHASE 1: Schema Migrations (runs BEFORE defaults are restored)
        // ========================================================================

        const currentVersion = state.version || 0;
        console.log(`[AppStore] Current schema version: v${currentVersion}`);

        if (currentVersion < CURRENT_SCHEMA_VERSION) {
          console.log(`[AppStore] Schema migration needed: v${currentVersion} → v${CURRENT_SCHEMA_VERSION}`);

          try {
            const migrationResult = await runMigrations(state);

            if (!migrationResult.success) {
              console.error('[AppStore] ❌ Schema migration failed:', migrationResult.error);
              // App may be in inconsistent state, but try to continue
              // Consider showing migration error to user
            } else {
              console.log('[AppStore] ✅ Schema migration complete:', {
                from: migrationResult.fromVersion,
                to: migrationResult.toVersion,
                migrations: migrationResult.migrationsRun,
                duration: `${migrationResult.duration.toFixed(2)}ms`,
              });
            }

            // Validate migrated state
            if (!validateMigratedState(state)) {
              console.error('[AppStore] ❌ State validation failed after migration');
              // This is critical - state may be corrupted
              // Consider resetting to defaults
            }
          } catch (error) {
            console.error('[AppStore] ❌ Migration failed with exception:', error);
            // App should still be functional even if migration fails
          }
        } else {
          console.log('[AppStore] Schema version is current, no migration needed');
        }

        // ========================================================================
        // PHASE 2: Default Values Restoration
        // ========================================================================

        // Ensure at least one agent exists
        if (!state.agents || state.agents.length === 0) {
          console.log('[AppStore] No agents found, restoring defaults');
          state.agents = [DEFAULT_AGENT];
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
          activeProviderId: state.activeProviderId,
        });

        // Phase 3: Migrate API keys to credential vault (ADR-001)
        // This runs after hydration to ensure state is available
        try {
          const { migrateApiKeysToVault, isMigrationNeeded } = await import(
            '@/infrastructure/persistence/stores/providers/migrate-api-keys-to-vault'
          );

          if (isMigrationNeeded(state.providers)) {
            console.log('[AppStore] API key migration needed, starting...');
            const result = await migrateApiKeysToVault(
              state.providers,
              state.activeProviderId,
              (id, config) => {
                // Update provider state
                state.providers = state.providers.map(p =>
                  p.id === id ? { ...p, ...config } : p
                );
              }
            );

            if (result.success) {
              console.log('[AppStore] ✅ API key migration complete:', {
                migratedCount: result.migratedCount,
                duration: result.backupResult.timestamp,
              });
            } else {
              console.error('[AppStore] ❌ API key migration failed:', result.error);
              // Migration failed but rollback was attempted, so app should still work
              if (result.rollbackAttempted) {
                console.log('[AppStore] Rollback completed, app safe to use');
              }
            }
          } else {
            console.log('[AppStore] No API key migration needed');
          }
        } catch (error) {
          console.error('[AppStore] Migration failed with exception:', error);
          // App should still be functional even if migration fails
        }
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
 * Get agents for specific workspace
 */
export const useAgentsForWorkspace = (workspaceType: WorkspaceType) =>
  useAppStore((state) => state.getAgentsForWorkspace(workspaceType));

// NOTE: useActiveAgent is available from agent-selection-store
// AppState doesn't have activeAgentId property - that's in AgentSelectionState

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
 * Individual Provider Hooks - Stable Selectors (for useProviderStore backward compatibility)
 *
 * These hooks use individual selectors to avoid infinite loops.
 * Each hook returns a stable value that won't cause unnecessary re-renders.
 *
 * @deprecated Use useAppStore directly with selectors instead
 */

// Provider data selectors (state only, no functions)
// Note: useProviders and useAvailableModels(providerId) already exist above
export const useAllAvailableModels = () => useAppStore((state) => state.availableModels);
export const useIsLoadingModels = () => useAppStore((state) => state.isLoadingModels);
export const useActiveProviderId = () => useAppStore((state) => state.activeProviderId);

// Provider action selectors (functions only)
export const useProviderActions = () => useAppStore((state) => ({
  addProvider: state.addProvider,
  updateProvider: state.updateProvider,
  removeProvider: state.removeProvider,
  fetchModels: state.fetchModels,
  setActiveProvider: state.setActiveProvider,
}));

// Combined hook for backward compatibility (uses individual selectors + useMemo for stability)
export const useProviderStore = () => {
  const providers = useProviders();
  const availableModels = useAllAvailableModels();
  const isLoadingModels = useIsLoadingModels();
  const activeProviderId = useActiveProviderId();
  const providerActions = useProviderActions();

  return useMemo(() => ({
    providers,
    availableModels,
    isLoadingModels,
    activeProviderId,
    ...providerActions,
  }), [providers, availableModels, isLoadingModels, activeProviderId, providerActions]);
};


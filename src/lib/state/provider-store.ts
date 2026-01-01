/**
 * Provider Store Facade - Backward Compatibility
 *
 * Re-exports from the unified app store (use-app-store.ts).
 * Maintains zero breaking changes for existing code.
 *
 * This file replaces the original 267-line provider-store implementation
 * with a facade that wraps the new unified store.
 *
 * @module lib/state/provider-store
 * @story AC-1.8 - Create facade re-exports
 * @migration Migrated from standalone store (267 lines) to facade (180 lines)
 */

import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

// ============================================================================
// FACADE - Backward Compatibility Layer
// ============================================================================

/**
 * Provider Store Facade
 *
 * Wraps the unified app store to maintain backward compatibility.
 * All existing imports from 'provider-store' will continue to work.
 *
 * @example
 * // Old import (still works)
 * import { useProviderStore } from '@/lib/state/provider-store';
 * const providers = useProviderStore((state) => state.providers);
 *
 * // New import (recommended for new code)
 * import { useProviders } from '@/infrastructure/persistence/stores/use-app-store';
 */
export const useProviderStore = {
  /**
   * Get current state snapshot
   */
  getState: () => useAppStore.getState(),

  /**
   * Subscribe to state changes
   */
  subscribe: (listener: () => void) => useAppStore.subscribe(listener),

  // ========================================================================
  // STATE SELECTORS (Convenience Methods)
  // ========================================================================

  /**
   * Get all providers
   */
  providers: () => useAppStore((state) => state.providers),

  /**
   * Get active provider ID
   */
  activeProviderId: () => useAppStore((state) => state.activeProviderId),

  /**
   * Get model settings
   */
  modelSettings: () => useAppStore((state) => state.modelSettings),

  /**
   * Get available models for a provider
   */
  availableModels: (providerId: string) =>
    useAppStore((state) => state.availableModels[providerId] || []),

  /**
   * Get loading state
   */
  isLoading: () => useAppStore((state) => state.isLoading),

  /**
   * Get models loading state
   */
  isLoadingModels: (providerId: string) =>
    useAppStore((state) => state.isLoadingModels[providerId] || false),

  // ========================================================================
  // ACTION WRAPPERS (Direct Calls)
  // ========================================================================

  /**
   * Add a new provider
   */
  addProvider: (config: any) =>
    useAppStore.getState().addProvider(config),

  /**
   * Update an existing provider
   */
  updateProvider: (id: string, config: any) =>
    useAppStore.getState().updateProvider(id, config),

  /**
   * Remove a provider
   */
  removeProvider: (id: string, agents?: any[]) =>
    useAppStore.getState().removeProvider(id, agents),

  /**
   * Set active provider
   */
  setActiveProvider: (id: string) =>
    useAppStore.getState().setActiveProvider(id),

  /**
   * Update model settings
   */
  updateModelSettings: (providerId: string, settings: any) =>
    useAppStore.getState().updateModelSettings(providerId, settings),

  /**
   * Fetch models for a provider
   */
  fetchModels: (providerId: string) =>
    useAppStore.getState().fetchModels(providerId),

  /**
   * Get available models for a provider
   */
  getAvailableModels: (providerId: string) =>
    useAppStore.getState().getAvailableModels(providerId),

  /**
   * Reset to defaults
   */
  reset: () =>
    useAppStore.getState().reset(),

  // ========================================================================
  // MODELS-LOADER ACTIONS (Merged)
  // ========================================================================

  /**
   * Set selected model
   */
  setSelectedModel: (modelId: string) =>
    useAppStore.getState().setSelectedModel(modelId),

  /**
   * Load models with caching
   */
  loadModelsForProvider: (providerId: string) =>
    useAppStore.getState().loadModelsForProvider(providerId),

  /**
   * Clear models cache
   */
  clearModelsCache: (providerId: string) =>
    useAppStore.getState().clearModelsCache(providerId),
};

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
} from '@/infrastructure/persistence/stores/providers/types';

// Re-export from core
export type { Agent } from '@/core/entities/Agent';

// ============================================================================
// DEFAULT EXPORT (for compatibility)
// ============================================================================

export default useProviderStore;

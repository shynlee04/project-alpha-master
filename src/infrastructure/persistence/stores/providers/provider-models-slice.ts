/**
 * Provider Models Slice - Model Fetching and Caching
 *
 * Handles model-related operations:
 * - Fetch models from provider APIs
 * - Cache models with TTL
 * - Load models with cache freshness check
 *
 * Key Design Decisions:
 * - No imports from agents directory (breaks circular dependency)
 * - Uses cross-slice communication via get() for providers
 * - Internalizes event subscriptions (no cross-store imports)
 * - 5-minute cache TTL to reduce API calls
 *
 * @module providers/provider-models-slice
 * @story AC-1.6 - Split provider slice into smaller slices
 */

import { StateCreator } from 'zustand';
import type { ModelInfo, ModelStateEntry } from './types';

// Import domain services (singletons - no circular deps)
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { modelRegistry } from '@/lib/agent/providers/model-registry';

// Import infrastructure (no circular deps)
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

// ============================================================================
// PROVIDER MODELS SLICE
// ============================================================================

/**
 * Provider Models Slice State Creator
 *
 * This slice handles model fetching and caching operations.
 *
 * Cross-Slice Communication:
 * - get().providers - Access provider configuration for API calls
 *
 * Note: No imports from agents directory to avoid circular dependency.
 */
export const createProviderModelsSlice: StateCreator<
  AppState,
  [],
  [],
  {
    // State
    availableModels: Record<string, ModelInfo[]>;
    isLoadingModels: Record<string, boolean>;
    modelCache: Record<string, ModelStateEntry>;

    // Actions
    fetchModels: (providerId: string) => Promise<void>;
    loadModelsForProvider: (providerId: string) => Promise<void>;
    clearModelsCache: (providerId: string) => void;
  }
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  availableModels: {},
  isLoadingModels: {},
  modelCache: {},

  // ========================================================================
  // ACTIONS - Model Fetching and Caching
  // ========================================================================

  /**
   * Fetch models for a provider from API
   *
   * Fetches available models from the provider's API using credentials
   * from the credential vault. Updates availableModels state.
   *
   * Emits cross-workspace event on success.
   *
   * @param providerId - Provider ID to fetch models for
   */
  fetchModels: async (providerId: string) => {
    console.log('[ProviderModelsSlice] Fetching models for provider:', providerId);

    set((state) => ({
      isLoadingModels: { ...state.isLoadingModels, [providerId]: true }
    }));

    try {
      // Get provider configuration (cross-slice communication)
      const provider = get().providers?.find(p => p.id === providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Get API key from credential vault
      const apiKey = await credentialVault.getCredentials(providerId);
      if (!apiKey) {
        console.warn('[ProviderModelsSlice] No API key for provider:', providerId, '- loading defaults');
        // Load default models as fallback (user-friendly behavior)
        const defaultModels = await modelRegistry.getModels(providerId);
        set((state) => ({
          availableModels: { ...state.availableModels, [providerId]: defaultModels },
          isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
        }));
        return;
      }

      // Fetch models from registry
      const models = await modelRegistry.getModels(providerId, apiKey);

      // Update state with fetched models
      set((state) => ({
        availableModels: { ...state.availableModels, [providerId]: models },
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
      }));

      console.log('[ProviderModelsSlice] Models fetched successfully:', providerId, models.length, 'models');

      // Emit cross-workspace event (for other workspaces to react)
      const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
      crossWorkspaceEventBus.emit('ProviderModelsFetched', {
        workspaceId: currentWorkspace,
        providerId,
        modelCount: models.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('[ProviderModelsSlice] Error fetching models:', providerId, error);
      set((state) => ({
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
      }));

      // Re-throw for UI to handle
      throw error;
    }
  },

  /**
   * Load models for a provider with caching
   *
   * Returns cached models if fresh (<5 minutes old).
   * Otherwise fetches fresh models from API.
   *
   * @param providerId - Provider ID to load models for
   */
  loadModelsForProvider: async (providerId: string) => {
    console.log('[ProviderModelsSlice] Loading models (with caching):', providerId);

    const cache = get().modelCache[providerId];

    // Check cache freshness (5 minutes = 300,000ms)
    const CACHE_TTL = 5 * 60 * 1000;
    if (cache && cache.lastFetchedAt && Date.now() - cache.lastFetchedAt < CACHE_TTL) {
      console.log('[ProviderModelsSlice] Returning cached models for:', providerId);
      set((state) => ({
        availableModels: { ...state.availableModels, [providerId]: cache.models }
      }));
      return;
    }

    // Fetch fresh models (cross-slice communication)
    await get().fetchModels(providerId);

    // Update cache
    const models = get().availableModels[providerId];
    set((state) => ({
      modelCache: {
        ...state.modelCache,
        [providerId]: {
          models: models || [],
          isLoadingModels: false,
          lastFetchedAt: Date.now(),
          error: null,
        }
      }
    }));

    console.log('[ProviderModelsSlice] Cache updated for provider:', providerId);
  },

  /**
   * Clear models cache for a provider
   *
   * Forces next loadModelsForProvider call to fetch fresh models.
   *
   * @param providerId - Provider ID to clear cache for
   */
  clearModelsCache: (providerId: string) => {
    console.log('[ProviderModelsSlice] Clearing cache for provider:', providerId);
    set((state) => {
      const newCache = { ...state.modelCache };
      delete newCache[providerId];
      return { modelCache: newCache };
    });
  },
});

// ============================================================================
// TYPE IMPORTS (for AppState generic)
// ============================================================================

/**
 * AppState Interface (minimal for TypeScript compilation)
 */
interface AppState {
  // Provider state (cross-slice access)
  providers?: any[];

  // Models state (defined in this slice)
  availableModels: Record<string, ModelInfo[]>;
  isLoadingModels: Record<string, boolean>;
  modelCache: Record<string, ModelStateEntry>;

  // Models actions (defined in this slice)
  fetchModels: (providerId: string) => Promise<void>;
}

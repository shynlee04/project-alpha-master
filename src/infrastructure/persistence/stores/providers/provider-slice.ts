/**
 * Provider Slice - Unified Provider Configuration
 *
 * Merges provider-store.ts + models-loader-store.ts into a single slice.
 * Eliminates circular dependency with agent-validation-slice.
 *
 * Key Design Decisions:
 * - No imports from agents directory (breaks circular dependency)
 * - Uses cross-slice communication via get() for agents
 * - Internalizes event subscriptions (no cross-store imports)
 * - Merges duplicate functionality from models-loader-store
 *
 * @module providers/provider-slice
 * @story AC-1.6 - Create unified provider slice
 */

import { StateCreator } from 'zustand';
import type { ProviderConfig, ModelInfo, ModelSettings, ModelStateEntry } from './types';

// Import domain services (singletons - no circular deps)
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { modelRegistry } from '@/lib/agent/providers/model-registry';

// Import infrastructure (no circular deps)
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Initial providers (built-in providers)
 * These are the default providers available on first load.
 */
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
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    models: [],
    isActive: true,
  },
  {
    id: 'google',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: '',
    models: [],
    isActive: true,
  },
];

// ============================================================================
// PROVIDER SLICE
// ============================================================================

/**
 * Provider Slice State Creator
 *
 * This slice is designed to be combined with other slices in a single bounded store.
 * The AppState generic parameter enables cross-slice communication via get().
 *
 * Cross-Slice Communication:
 * - get().agents - Access agents for validation in removeProvider()
 * - get().availableModels - Access models for agent validation
 *
 * Note: No imports from agents directory to avoid circular dependency.
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
  // ACTIONS - Provider CRUD (8 actions from provider-store.ts)
  // ========================================================================

  /**
   * Add a new provider
   *
   * @param config - Provider configuration to add
   */
  addProvider: (config: ProviderConfig) => {
    console.log('[ProviderSlice] Adding provider:', config.id, config.name);
    set((state) => ({
      providers: [...state.providers, config]
    }));
  },

  /**
   * Update an existing provider
   *
   * @param id - Provider ID to update
   * @param config - Partial provider configuration
   */
  updateProvider: (id: string, config: Partial<ProviderConfig>) => {
    console.log('[ProviderSlice] Updating provider:', id, config);
    set((state) => ({
      providers: state.providers.map(p =>
        p.id === id ? { ...p, ...config } : p
      )
    }));
  },

  /**
   * Remove a provider
   *
   * Validates that no agents depend on this provider before deletion.
   * Uses cross-slice communication via get().agents.
   *
   * @param id - Provider ID to remove
   * @param agents - Optional agents array (for backward compatibility)
   * @throws Error if agents depend on this provider
   */
  removeProvider: async (id: string, agents?: any[]) => {
    console.log('[ProviderSlice] Removing provider:', id);

    // Check if agents are using this provider (cross-slice communication)
    const agentsToCheck = agents || get().agents;
    const dependentAgents = agentsToCheck.filter((a: any) => a.providerId === id);

    if (dependentAgents.length > 0) {
      const agentNames = dependentAgents.map((a: any) => a.name).join(', ');
      throw new Error(
        `Cannot delete provider "${id}" - ${dependentAgents.length} agent(s) depend on it: ${agentNames}`
      );
    }

    set((state) => ({
      providers: state.providers.filter(p => p.id !== id)
    }));

    console.log('[ProviderSlice] Provider removed:', id);
  },

  /**
   * Set the active provider
   *
   * @param id - Provider ID to set as active
   */
  setActiveProvider: (id: string) => {
    console.log('[ProviderSlice] Setting active provider:', id);
    set({ activeProviderId: id });
  },

  /**
   * Update model settings for a provider
   *
   * @param providerId - Provider ID
   * @param settings - Partial model settings to update
   */
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => {
    console.log('[ProviderSlice] Updating model settings:', providerId, settings);
    set((state) => ({
      modelSettings: {
        ...state.modelSettings,
        [providerId]: { ...state.modelSettings[providerId], ...settings }
      }
    }));
  },

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
    console.log('[ProviderSlice] Fetching models for provider:', providerId);

    set((state) => ({
      isLoadingModels: { ...state.isLoadingModels, [providerId]: true }
    }));

    try {
      // Get provider configuration
      const provider = get().providers.find(p => p.id === providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Get API key from credential vault
      const apiKey = await credentialVault.getCredential(providerId, 'default');
      if (!apiKey) {
        console.warn('[ProviderSlice] No API key for provider:', providerId);
        set((state) => ({
          availableModels: { ...state.availableModels, [providerId]: [] },
          isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
        }));
        return;
      }

      // Fetch models from registry
      const models = await modelRegistry.fetchModels(providerId, apiKey);

      // Update state with fetched models
      set((state) => ({
        availableModels: { ...state.availableModels, [providerId]: models },
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
      }));

      console.log('[ProviderSlice] Models fetched successfully:', providerId, models.length, 'models');

      // Emit cross-workspace event (for other workspaces to react)
      const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
      crossWorkspaceEventBus.emit('ProviderModelsFetched', {
        workspaceId: currentWorkspace,
        providerId,
        modelCount: models.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('[ProviderSlice] Error fetching models:', providerId, error);
      set((state) => ({
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
      }));

      // Re-throw for UI to handle
      throw error;
    }
  },

  /**
   * Get available models for a provider
   *
   * Convenience selector to get models for a specific provider.
   *
   * @param providerId - Provider ID
   * @returns Array of available models (empty array if none)
   */
  getAvailableModels: (providerId: string) => {
    return get().availableModels[providerId] || [];
  },

  /**
   * Reset to initial providers
   *
   * Clears all custom providers and restores defaults.
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
  // ACTIONS - Model Loader (3 actions from models-loader-store.ts)
  // ========================================================================

  /**
   * Set the selected model
   *
   * @param modelId - Model ID to set as selected
   */
  setSelectedModel: (modelId: string) => {
    console.log('[ProviderSlice] Setting selected model:', modelId);
    set({ selectedModelId: modelId });
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
    console.log('[ProviderSlice] Loading models (with caching):', providerId);

    const cache = get().modelCache[providerId];

    // Check cache freshness (5 minutes = 300,000ms)
    const CACHE_TTL = 5 * 60 * 1000;
    if (cache && cache.lastFetchedAt && Date.now() - cache.lastFetchedAt < CACHE_TTL) {
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
          models: models || [],
          isLoadingModels: false,
          lastFetchedAt: Date.now(),
          error: null,
        }
      }
    }));

    console.log('[ProviderSlice] Cache updated for provider:', providerId);
  },

  /**
   * Clear models cache for a provider
   *
   * Forces next loadModelsForProvider call to fetch fresh models.
   *
   * @param providerId - Provider ID to clear cache for
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

// ============================================================================
// TYPE IMPORTS (for AppState generic)
// ============================================================================

/**
 * AppState Interface
 *
 * This is a placeholder for the actual AppState interface.
 * In the full implementation, this will be imported from '../types'.
 *
 * For now, we use a minimal interface to allow TypeScript compilation.
 */
interface AppState {
  // Agent state (cross-slice access)
  agents?: any[];
  activeAgentId?: string | null;

  // Agent actions (excluded from this slice via Omit<>)
  addAgent?: any;
  removeAgent?: any;
  updateAgent?: any;
  setActiveAgent?: any;
  resetToDefaults?: any;
  validationErrors?: any;
  addAgentValidated?: any;
  updateAgentValidated?: any;
  clearValidationErrors?: any;
  addAgentWithEvent?: any;
  removeAgentWithEvent?: any;
  updateAgentWithEvent?: any;
  updateWorkspaceBindingWithEvent?: any;
  getAgentsForWorkspace?: any;
  updateWorkspaceBinding?: any;
  updateAgentWorkspaceBinding?: any;
  getAgentWorkspaceBinding?: any;
  isAgentAvailableInWorkspace?: any;
  _hasHydrated?: boolean;
  setHasHydrated?: any;
  getAgent?: any;
  updateAgentStatus?: any;
  getActiveAgent?: any;
  getAgentsCount?: any;

  // Provider state (defined in this slice)
  providers: ProviderConfig[];
  activeProviderId: string | null;
  modelSettings: Record<string, ModelSettings>;
  availableModels: Record<string, ModelInfo[]>;
  isLoading: boolean;
  isLoadingModels: Record<string, boolean>;
  selectedModelId: string | null;
  modelCache: Record<string, ModelStateEntry>;

  // Provider actions (defined in this slice)
  addProvider: (config: ProviderConfig) => void;
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
  removeProvider: (id: string, agents?: any[]) => Promise<void>;
  setActiveProvider: (id: string) => void;
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
  fetchModels: (providerId: string) => Promise<void>;
  getAvailableModels: (providerId: string) => ModelInfo[];
  reset: () => void;
  setSelectedModel: (modelId: string) => void;
  loadModelsForProvider: (providerId: string) => Promise<void>;
  clearModelsCache: (providerId: string) => void;
}

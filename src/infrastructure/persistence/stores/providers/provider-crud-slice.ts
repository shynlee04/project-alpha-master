/**
 * Provider CRUD Slice - Provider Configuration Operations
 *
 * Handles basic provider CRUD operations:
 * - Add, update, remove providers
 * - Set active provider
 * - Reset to defaults
 *
 * Key Design Decisions:
 * - Uses cross-slice communication via get().agents for validation
 * - No imports from agents directory (breaks circular dependency)
 * - Single responsibility: provider lifecycle management
 *
 * @module providers/provider-crud-slice
 * @story AC-1.6 - Split provider slice into smaller slices
 */

import { StateCreator } from 'zustand';
import type { ProviderConfig } from './types';

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
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    hasApiKey: false,
    models: [],
    enabled: true,
    lastModelFetchAt: undefined,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    hasApiKey: false,
    models: [],
    enabled: true,
    lastModelFetchAt: undefined,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    hasApiKey: false,
    models: [],
    enabled: true,
    lastModelFetchAt: undefined,
  },
  {
    id: 'google',
    name: 'Google Gemini',
    type: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-3.0-flash',
    hasApiKey: false,
    models: [],
    enabled: true,
    lastModelFetchAt: undefined,
  },
];

// ============================================================================
// PROVIDER CRUD SLICE
// ============================================================================

/**
 * Provider CRUD Slice State Creator
 *
 * This slice handles provider lifecycle operations.
 *
 * Cross-Slice Communication:
 * - get().agents - Access agents for validation in removeProvider()
 *
 * Note: No imports from agents directory to avoid circular dependency.
 */
export const createProviderCrudSlice: StateCreator<
  AppState,
  [],
  [],
  {
    // State
    providers: ProviderConfig[];
    activeProviderId: string | null;

    // Actions
    addProvider: (config: ProviderConfig) => void;
    updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
    removeProvider: (id: string, agents?: any[]) => Promise<void>;
    setActiveProvider: (id: string) => void;
    reset: () => void;
  }
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  providers: INITIAL_PROVIDERS,
  activeProviderId: 'openrouter',

  // ========================================================================
  // ACTIONS - Provider CRUD
  // ========================================================================

  /**
   * Add a new provider
   *
   * @param config - Provider configuration to add
   */
  addProvider: (config: ProviderConfig) => {
    console.log('[ProviderCrudSlice] Adding provider:', config.id, config.name);
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
    console.log('[ProviderCrudSlice] Updating provider:', id, config);
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
    console.log('[ProviderCrudSlice] Removing provider:', id);

    // Check if agents are using this provider (cross-slice communication)
    const agentsToCheck = agents || get().agents || [];
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

    console.log('[ProviderCrudSlice] Provider removed:', id);
  },

  /**
   * Set the active provider
   *
   * @param id - Provider ID to set as active
   */
  setActiveProvider: (id: string) => {
    console.log('[ProviderCrudSlice] Setting active provider:', id);
    set({ activeProviderId: id });
  },

  /**
   * Reset to initial providers
   *
   * Clears all custom providers and restores defaults.
   */
  reset: () => {
    console.log('[ProviderCrudSlice] Resetting to defaults');
    set({
      providers: INITIAL_PROVIDERS,
      activeProviderId: 'openrouter',
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
  // Agent state (cross-slice access)
  agents?: any[];

  // Provider state (defined in this slice)
  providers: ProviderConfig[];
  activeProviderId: string | null;
}

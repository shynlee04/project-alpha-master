/**
 * @fileoverview Centralized Provider Configuration Store
 * @module infrastructure/persistence/stores/agents/provider-config-store
 * @governance Architectural Specification v3.0
 * @ai-observable true
 *
 * Single source of truth for LLM provider configurations.
 * Implements December 2025 Zustand best practices.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';

/**
 * Provider type enumeration
 */
export type ProviderType = 'openai' | 'openrouter' | 'gemini' | 'openai-compatible';

/**
 * Model information structure
 */
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  maxOutputTokens?: number;
  inputModalities?: string[];
  outputModalities?: string[];
  supportsTools?: boolean;
  pricing?: {
    prompt: number;  // per 1M tokens
    completion: number;
  };
}

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  id: ProviderType;
  name: string;
  baseURL: string;
  type: ProviderType;
  description?: string;
  enabled: boolean;
  supportsNativeTools: boolean;
  defaultModel?: string;
  isCustom?: boolean;
  requiresApiKey: boolean;
  headers?: Record<string, string>;
  lastTestResult?: {
    success: boolean;
    latencyMs?: number;
    error?: string;
    testedAt: string;
  };
}

/**
 * Model settings for provider
 */
export interface ModelSettings {
  temperature?: number;
  maxTemperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
}

/**
 * Provider store state
 */
interface ProviderConfigState {
  // Provider configurations
  providers: ProviderConfig[];

  // Currently active provider
  activeProviderId: ProviderType | null;

  // Available models per provider (fetched from APIs)
  availableModels: Record<string, ModelInfo[]>;

  // LLM parameter settings per provider
  modelSettings: Record<string, ModelSettings>;

  // Loading states
  isLoading: boolean;
  isLoadingModels: Record<string, boolean>;

  // Hydration flag
  _hasHydrated: boolean;
}

/**
 * Built-in provider configurations
 */
const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    description: 'OpenAI GPT models',
    enabled: true,
    supportsNativeTools: true,
    defaultModel: 'gpt-4o',
    isCustom: false,
    requiresApiKey: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    description: 'Unified API for multiple LLM providers',
    enabled: true,
    supportsNativeTools: true,
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    isCustom: false,
    requiresApiKey: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Google Gemini models',
    enabled: true,
    supportsNativeTools: false,
    defaultModel: 'gemini-2.0-flash-exp',
    isCustom: false,
    requiresApiKey: false,
  },
];

/**
 * Default model settings for providers
 */
const DEFAULT_MODEL_SETTINGS: Record<string, ModelSettings> = {
  openai: {
    temperature: 0.7,
    maxTemperature: 1.0,
    topP: 1.0,
    maxTokens: 4096,
  },
  openrouter: {
    temperature: 0.7,
    maxTemperature: 2.0,
    topP: 1.0,
    maxTokens: 128000,
  },
  gemini: {
    temperature: 0.0,  // Gemini uses temperature for output randomness
    maxTokens: 8192,
  },
  'openai-compatible': {
    temperature: 0.7,
    maxTokens: 4096,
  },
};

/**
 * Create Dexie storage adapter for provider configs
 */
function createProviderDexieStorage() {
  return createDexieStorage<ProviderConfigState>('provider-configs');
}

/**
 * Provider Configuration Store
 *
 * Single source of truth for LLM provider configurations.
 * Implements December 2025 Zustand best practices:
 * - Slice pattern for store organization
 * - Persist middleware with Dexie storage
 * - Type-safe state and actions
 * - Event emission for hot-reload
 *
 * @example
 * ```ts
 * // Add custom provider
 * const customProvider = await providerStore.addProvider({
 *   id: 'custom-llm',
 *   name: 'Custom LLM',
 *   baseURL: 'https://api.custom-llm.com/v1',
 *   type: 'openai-compatible',
 *   isCustom: true,
 *   requiresApiKey: true
 * });
 *
 * // Set API key
 * await providerStore.setApiKey('custom-llm', 'sk-...');
 *
 * // Fetch models
 * await providerStore.fetchModels('custom-llm');
 *
 * // Update model settings
 * providerStore.updateModelSettings('custom-llm', { temperature: 0.5 });
 *
 * // Set as active
 * providerStore.setActiveProvider('custom-llm');
 * ```
 */
export const useProviderStore = create<ProviderConfigState>()(
  persist(
    (set, get) => ({
      // ========== STATE ==========
      providers: INITIAL_PROVIDERS,
      activeProviderId: 'openai',
      availableModels: {},
      modelSettings: DEFAULT_MODEL_SETTINGS,
      isLoading: false,
      isLoadingModels: {},
      _hasHydrated: false,

      // ========== PROVIDERS ==========

      /**
       * Add new provider configuration
       */
      addProvider: (config: Omit<ProviderConfig, 'id'>) => string => {
        const newProvider: ProviderConfig = {
          ...config,
          id: config.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Validate provider configuration
        if (!newProvider.baseURL) {
          throw new Error('Provider must have a baseURL');
        }

        // Set default model settings
        if (newProvider.defaultModel && !get().modelSettings[newProvider.id]) {
          set((state) => ({
            modelSettings: {
              ...state.modelSettings,
              [newProvider.id]: DEFAULT_MODEL_SETTINGS[newProvider.type] || {},
            },
          }));
        }

        set((state) => ({
          providers: [...state.providers, newProvider],
        }));

        // Emit event for hot-reload
        get().emitProviderAdded(newProvider);

        return newProvider.id;
      },

      /**
       * Update existing provider
       */
      updateProvider: (id: string, updates: Partial<ProviderConfig>) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));

        // Emit event for hot-reload
        const updated = get().providers.find(p => p.id === id);
        if (updated) {
          get().emitProviderUpdated(updated);
        }
      },

      /**
       * Remove provider
       */
      removeProvider: async (id: string) => {
        // Check if provider is active
        if (get().activeProviderId === id) {
          // Select new active provider
          const remainingProviders = get().providers.filter(p => p.id !== id);
          const newActiveId = remainingProviders[0]?.id || null;
          set({ activeProviderId: newActiveId });
        }

        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
        }));

        // Emit event for hot-reload
        get().emitProviderRemoved(id);
      },

      /**
       * Set active provider
       */
      setActiveProvider: (id: ProviderType | string | null) => {
        if (!id) {
          set({ activeProviderId: null });
          return;
        }

        const provider = get().providers.find(p => p.id === id);
        if (!provider) {
          throw new Error(`Provider not found: ${id}`);
        }

        set({ activeProviderId: id });
      },

      // ========== MODELS ==========

      /**
       * Fetch available models from provider
       */
      fetchModels: async (providerId: string) => {
        const provider = get().providers.find(p => p.id === providerId);
        if (!provider) {
          throw new Error(`Provider not found: ${providerId}`);
        }

        // Set loading state
        set((state) => ({
          isLoadingModels: {
            ...state.isLoadingModels,
            [providerId]: true,
          },
        }));

        try {
          // Import provider adapter factory
          const { providerAdapterFactory } = await import('@/lib/agent/providers/provider-adapter');

          // Create adapter to fetch models
          const adapter = providerAdapterFactory.createAdapter(providerId, {
            apiKey: await getCredentialForProvider(providerId),
          });

          // Fetch models
          const models = await adapter.listModels();

          // Update available models
          set((state) => ({
            availableModels: {
              ...state.availableModels,
              [providerId]: models,
            },
            isLoadingModels: {
              ...state.isLoadingModels,
              [providerId]: false,
            },
          }));

        } catch (error) {
          console.error(`[ProviderStore] Failed to fetch models for ${providerId}:`, error);

          // Set loading state to false
          set((state) => ({
            isLoadingModels: {
              ...state.isLoadingModels,
              [providerId]: false,
            },
          }));

          throw error;
        }
      },

      // ========== SETTINGS ==========

      /**
       * Update model settings for provider
       */
      updateModelSettings: (
        providerId: string,
        settings: Partial<ModelSettings>
      ) => {
        set((state) => ({
          modelSettings: {
            ...state.modelSettings,
            [providerId]: {
              ...state.modelSettings[providerId],
              ...settings,
            },
          },
        }));
      },

      /**
       * Reset model settings to defaults
       */
      resetModelSettings: (providerId: string) => {
        set((state) => ({
          modelSettings: {
            ...state.modelSettings,
            [providerId]: DEFAULT_MODEL_SETTINGS[providerId] || {},
          },
        }));
      },

      // ========== EVENTS ==========

      /**
       * Emit provider added event
       */
      emitProviderAdded: (provider: ProviderConfig) => {
        console.log('[ProviderStore] Provider added:', provider);
        // TODO: Emit to global event bus once integrated
      },

      /**
       * Emit provider updated event
       */
      emitProviderUpdated: (provider: ProviderConfig) => {
        console.log('[ProviderStore] Provider updated:', provider);
        // TODO: Emit to global event bus once integrated
      },

      /**
       * Emit provider removed event
       */
      emitProviderRemoved: (id: string) => {
        console.log('[ProviderStore] Provider removed:', id);
        // TODO: Emit to global event bus once integrated
      },

      // ========== HYDRATION ==========

      /**
       * Set hydrated flag
       */
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'provider-config-store',
      storage: createProviderDexieStorage(),
      partialize: (state) => ({
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
      onRehydrateStorage: (state) => {
        // Ensure hydration has default providers
        if (state && (!state.providers || state.providers.length === 0)) {
          console.log('[ProviderStore] Rehydrating with default providers');
          state.providers = INITIAL_PROVIDERS;
        }

        // Ensure active provider exists
        if (state && (!state.activeProviderId || !state.providers.some(p => p.id === state.activeProviderId))) {
          state.activeProviderId = state.providers[0]?.id || 'openai';
        }

        return state;
      },
    }
  )
);

/**
 * Get credential for provider from credential vault
 */
async function getCredentialForProvider(providerId: string): Promise<string | null> {
  // Import credential vault (lazy load to avoid circular dependency)
  const { credentialVault } = await import('@/lib/agent/providers/credential-vault');

  const apiKey = await credentialVault.getCredentials(providerId);
  return apiKey;
}

// Initialize hydration flag on mount
if (typeof window !== 'undefined') {
  useProviderStore.getState().setHasHydrated(true);
}

// Export type for TypeScript
export type { ProviderConfig, ModelInfo, ModelSettings };

/**
 * Helper function to get available models for provider
 */
export function getAvailableModels(providerId: ProviderType): ModelInfo[] {
  const models = useProviderStore.getState().availableModels[providerId];
  return models || [];
}

/**
 * Helper function to get model settings for provider
 */
export function getModelSettings(providerId: ProviderType): ModelSettings {
  const settings = useProviderStore.getState().modelSettings[providerId];
  return settings || {};
}

/**
 * Helper function to get active provider
 */
export function getActiveProvider(): ProviderConfig | null {
  const { activeProviderId, providers } = useProviderStore.getState();
  return providers.find(p => p.id === activeProviderId) || null;
}

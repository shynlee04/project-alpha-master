/**
 * Provider Models Slice
 *
 * Uses model-loader.ts for API-first model loading with fallback chain.
 *
 * @updated 2026-02-02
 * @resolves GAP-A04-001
 */

import type { StateCreator } from 'zustand';
import type { ModelInfo, ModelStateEntry } from '@/domain/types/llm';
import {
  loadModels,
  clearModelCache,
  type ModelLoadSource,
} from '@/infrastructure/ai/model-loader';

interface AppState {
  providers: unknown[];
  availableModels: Record<string, ModelInfo[]>;
  isLoadingModels: Record<string, boolean>;
  modelCache: Record<string, ModelStateEntry>;
  modelLoadingStatus: Record<
    string,
    {
      status: 'idle' | 'loading' | 'loaded' | 'error';
      source?: ModelLoadSource;
      error?: string;
      loadedAt?: number;
    }
  >;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProviderModelsSlice: StateCreator<AppState, [], [], any> = (
  set,
  get
) => ({
  availableModels: {},
  isLoadingModels: {},
  modelCache: {},
  modelLoadingStatus: {},

  fetchModels: async (providerId: string, apiKey?: string) => {
    console.log('[ProviderModelsSlice] Fetching models for:', providerId);

    // Set loading state
    set((state) => ({
      isLoadingModels: { ...state.isLoadingModels, [providerId]: true },
      modelLoadingStatus: {
        ...state.modelLoadingStatus,
        [providerId]: { status: 'loading' },
      },
    }));

    try {
      // Get API key if not provided
      const key = apiKey || (await getApiKeyForProvider(providerId));

      // Use model-loader with full fallback chain
      const result = await loadModels(providerId, key || '');

      set((state) => ({
        availableModels: {
          ...state.availableModels,
          [providerId]: result.models,
        },
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
        modelLoadingStatus: {
          ...state.modelLoadingStatus,
          [providerId]: {
            status: result.models.length > 0 ? 'loaded' : 'error',
            source: result.source,
            error: result.error,
            loadedAt: Date.now(),
          },
        },
      }));

      console.log(
        `[ProviderModelsSlice] Loaded ${result.models.length} models for ${providerId} from ${result.source}`
      );
    } catch (error) {
      console.error('[ProviderModelsSlice] Error loading models:', error);

      set((state) => ({
        isLoadingModels: { ...state.isLoadingModels, [providerId]: false },
        modelLoadingStatus: {
          ...state.modelLoadingStatus,
          [providerId]: {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      }));
    }
  },

  loadModelsForProvider: async (providerId: string) => {
    // Alias for fetchModels
    const state = get() as AppState & {
      fetchModels: (id: string) => Promise<void>;
    };
    await state.fetchModels(providerId);
  },

  clearModelsCache: (providerId: string) => {
    console.log('[ProviderModelsSlice] Clearing cache for:', providerId);
    clearModelCache(providerId);

    set((state) => ({
      availableModels: {
        ...state.availableModels,
        [providerId]: [],
      },
      modelLoadingStatus: {
        ...state.modelLoadingStatus,
        [providerId]: { status: 'idle' },
      },
    }));
  },
});

// Helper to get API key from credential vault
async function getApiKeyForProvider(
  providerId: string
): Promise<string | null> {
  try {
    // Import dynamically to avoid circular dependencies
    const { credentialVault } = await import(
      '@/infrastructure/ai/credential-vault'
    );
    return await credentialVault.getCredentials(providerId);
  } catch (error) {
    console.warn('[ProviderModelsSlice] Could not get API key:', error);
    return null;
  }
}

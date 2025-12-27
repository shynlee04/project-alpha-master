/**
 * @fileoverview Provider State Management (Zustand)
 * @module lib/state/provider-store
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - Migrate provider config to Zustand
 * 
 * Single source of truth for LLM provider configuration.
 * Persists to IndexedDB via Dexie adapter.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';
import { PROVIDERS, type ProviderConfig } from '../agent/providers/types';
import { credentialVault } from '../agent/providers/credential-vault';

/**
 * Settings specific to a provider's model usage
 */
export interface ModelSettings {
    model: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;
}

/**
 * Provider Store State Interface
 */
interface ProviderState {
    /** Configured providers */
    providers: ProviderConfig[];

    /** Currently active provider ID */
    activeProviderId: string | null;

    /** Model settings per provider (keyed by provider ID) */
    modelSettings: Record<string, ModelSettings>;

    /** Loading state */
    isLoading: boolean;

    // Actions

    /** Add a new provider configuration */
    addProvider: (config: ProviderConfig) => void;

    /** Update an existing provider */
    updateProvider: (id: string, config: Partial<ProviderConfig>) => void;

    /** Remove a provider */
    removeProvider: (id: string) => Promise<void>;

    /** Set the active provider */
    setActiveProvider: (id: string) => void;

    /** Update model settings for a provider */
    updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;

    /** Reset to defaults (useful for testing or recovery) */
    reset: () => void;
}

// Initial state derived from default PROVIDERS
const INITIAL_PROVIDERS = Object.values(PROVIDERS);
const INITIAL_ACTIVE_ID = 'openrouter';

const DEFAULT_MODEL_SETTINGS: ModelSettings = {
    model: 'gpt-4o', // Fallback
    temperature: 0.7,
    maxTokens: 4096
};

export const useProviderStore = create<ProviderState>()(
    persist(
        (set, get) => ({
            providers: INITIAL_PROVIDERS,
            activeProviderId: INITIAL_ACTIVE_ID,
            modelSettings: {},
            isLoading: false,

            addProvider: (config) => {
                set((state) => ({
                    providers: [...state.providers, config]
                }));
            },

            updateProvider: (id, config) => {
                set((state) => ({
                    providers: state.providers.map(p =>
                        p.id === id ? { ...p, ...config } : p
                    )
                }));
            },

            removeProvider: async (id) => {
                // First remove credentials from vault
                try {
                    await credentialVault.deleteCredentials(id);
                } catch (error) {
                    console.error(`[ProviderStore] Failed to delete credentials for ${id}:`, error);
                }

                // Then remove from store
                set((state) => ({
                    providers: state.providers.filter(p => p.id !== id),
                    // If active provider was removed, fall back to default or null
                    activeProviderId: state.activeProviderId === id
                        ? (state.providers.find(p => p.id !== id && p.enabled)?.id || null)
                        : state.activeProviderId
                }));
            },

            setActiveProvider: (id) => {
                set({ activeProviderId: id });
            },

            updateModelSettings: (providerId, settings) => {
                set((state) => {
                    const current = state.modelSettings[providerId] || DEFAULT_MODEL_SETTINGS;
                    return {
                        modelSettings: {
                            ...state.modelSettings,
                            [providerId]: { ...current, ...settings }
                        }
                    };
                });
            },

            reset: () => {
                set({
                    providers: INITIAL_PROVIDERS,
                    activeProviderId: INITIAL_ACTIVE_ID,
                    modelSettings: {}
                });
            }
        }),
        {
            name: 'via-gent-providers',
            // Use custom Dexie storage adapter
            storage: createJSONStorage(() => createDexieStorage('providerConfigs')),

            // Only persist specific fields if needed, but here we persist significant state
            partialize: (state) => ({
                providers: state.providers,
                activeProviderId: state.activeProviderId,
                modelSettings: state.modelSettings
            }),

            // Hydration handler
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Ensure defaults exist if state is stale
                    if (!state.providers || state.providers.length === 0) {
                        state.providers = INITIAL_PROVIDERS;
                    }
                }
            }
        }
    )
);

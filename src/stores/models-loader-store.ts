/**
 * @fileoverview Models Store - Model Loading and Management
 *
 * Split from provider-models-store.ts (FC-01: Foundation Consolidation)
 *
 * This store manages:
 * - Model loading per provider
 * - Model caching with TTL
 * - Selected model state
 * - Model loading errors and retry logic
 *
 * @epic Phase 1 - Foundation Consolidation
 * @story fc-01-split-provider-store
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { ModelInfo } from '@/lib/agent/providers/types'
import { modelRegistry } from '@/lib/agent/providers/model-registry'
import { credentialVault } from '@/lib/agent/providers/credential-vault'
import {
    STORE_EVENTS,
    onStoreEvent,
    emitStoreEvent,
    type ProviderKeySetPayload,
    type ModelSelectedPayload,
} from '@/lib/events/store-events'
import { useProviderStore } from '@/lib/state/provider-store'

// ============================================================================
// Types
// ============================================================================

export interface ModelStateEntry {
    models: ModelInfo[]
    isLoadingModels: boolean
    lastFetchedAt: number | null
    error: string | null
}

export interface ModelsState {
    // State
    models: Record<string, ModelStateEntry>
    selectedModelId: string | null

    // Actions
    loadModelsForProvider: (providerId: string) => Promise<void>
    setSelectedModel: (modelId: string) => void
    clearModelsCache: (providerId: string) => void

    // Getters
    getModelsForProvider: (providerId: string) => ModelInfo[]
    isLoadingModels: (providerId: string) => boolean
    getModelError: (providerId: string) => string | null
}

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000

// ============================================================================
// Store
// ============================================================================

export const useModelsStore = create<ModelsState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        models: {},
        selectedModelId: null,

        /**
         * Load models for a provider from API
         * Handles caching, errors, and fallback models
         */
        loadModelsForProvider: async (providerId: string) => {
            const state = get().models[providerId]
            const providerEntry = useProviderStore.getState().providers.find(p => p.id === providerId)

            if (!providerEntry) {
                console.warn(`[ModelsStore] Provider not initialized: ${providerId}`)
                return
            }

            // Check cache - don't re-fetch if less than 5 minutes old
            if (state?.lastFetchedAt && Date.now() - state.lastFetchedAt < CACHE_TTL && state.models.length > 0) {
                console.log(`[ModelsStore] Using cached models for ${providerId}`)
                return
            }

            // Set loading state
            set(prev => ({
                models: {
                    ...prev.models,
                    [providerId]: { ...prev.models[providerId], isLoadingModels: true, error: null }
                }
            }))

            try {
                // Try to get API key from vault
                let apiKey: string | null = null
                let hasKey = false

                try {
                    if (credentialVault.isReady()) {
                        apiKey = await credentialVault.getCredentials(providerId)
                        hasKey = !!apiKey
                    }
                } catch (vaultError) {
                    console.warn(`[ModelsStore] Vault error for ${providerId}:`, vaultError)
                }

                if (!hasKey || !apiKey) {
                    // Use free models for OpenRouter, defaults for others
                    const fallbackModels = providerId === 'openrouter'
                        ? modelRegistry.getFreeModels()
                        : modelRegistry.getDefaultModels(providerId)

                    set(prev => ({
                        models: {
                            ...prev.models,
                            [providerId]: {
                                isLoadingModels: false,
                                models: fallbackModels,
                                lastFetchedAt: Date.now(),
                                error: null
                            }
                        }
                    }))
                    console.log(`[ModelsStore] Loaded ${fallbackModels.length} fallback models for ${providerId}`)
                    return
                }

                // Fetch models from API
                console.log(`[ModelsStore] Fetching models for ${providerId}...`)
                const fetchedModels = await modelRegistry.getModels(providerId, apiKey)
                console.log(`[ModelsStore] Fetched ${fetchedModels.length} models for ${providerId}`)

                set(prev => ({
                    models: {
                        ...prev.models,
                        [providerId]: {
                            isLoadingModels: false,
                            models: fetchedModels,
                            lastFetchedAt: Date.now(),
                            error: null
                        }
                    }
                }))
            } catch (error) {
                console.error(`[ModelsStore] Failed to fetch models for ${providerId}:`, error)

                // Use fallback models on error
                const fallbackModels = providerId === 'openrouter'
                    ? modelRegistry.getFreeModels()
                    : modelRegistry.getDefaultModels(providerId)

                set(prev => ({
                    models: {
                        ...prev.models,
                        [providerId]: {
                            isLoadingModels: false,
                            models: fallbackModels,
                            lastFetchedAt: Date.now(),
                            error: String(error)
                        }
                    }
                }))
            }
        },

        /**
         * Set the selected model with event emission
         */
        setSelectedModel: (modelId: string) => {
            const previousModelId = get().selectedModelId
            const providerId = useProviderStore.getState().activeProviderId
            set({ selectedModelId: modelId })

            // Emit event for cross-workspace sync
            emitStoreEvent<ModelSelectedPayload>(STORE_EVENTS.MODEL_SELECTED, {
                modelId,
                providerId,
                previousModelId,
                timestamp: Date.now()
            })
        },

        /**
         * Clear models cache for a provider
         */
        clearModelsCache: (providerId: string) => {
            set(prev => ({
                models: {
                    ...prev.models,
                    [providerId]: {
                        ...prev.models[providerId],
                        lastFetchedAt: null
                    }
                }
            }))
        },

        /**
         * Get models for a provider
         */
        getModelsForProvider: (providerId: string) => {
            return get().models[providerId]?.models || []
        },

        /**
         * Check if models are loading for a provider
         */
        isLoadingModels: (providerId: string) => {
            return get().models[providerId]?.isLoadingModels || false
        },

        /**
         * Get model loading error for a provider
         */
        getModelError: (providerId: string) => {
            return get().models[providerId]?.error || null
        }
    }))
)

// ============================================================================
// Event Subscriptions - Enable Cross-Store Reactivity
// ============================================================================

/**
 * Subscribe to provider key changes and auto-load models
 * This is the CRITICAL part that enables cross-workspace reactivity
 */
onStoreEvent<ProviderKeySetPayload>(STORE_EVENTS.PROVIDER_KEY_SET, ({ providerId }) => {
    console.log(`[ModelsStore] Provider key set event for ${providerId}, reloading models...`)

    // Clear cache to force fresh fetch with new key
    useModelsStore.getState().clearModelsCache(providerId)

    // Load models with new API key
    useModelsStore.getState().loadModelsForProvider(providerId)
})

/**
 * Subscribe to provider removal and clear models
 */
onStoreEvent<{ providerId: string; timestamp: number }>(
    STORE_EVENTS.PROVIDER_KEY_REMOVED,
    ({ providerId }) => {
        console.log(`[ModelsStore] Provider key removed for ${providerId}, reloading defaults...`)

        // Clear cache and reload with default models
        useModelsStore.getState().clearModelsCache(providerId)
        useModelsStore.getState().loadModelsForProvider(providerId)
    }
)

/**
 * Subscribe to provider selection and auto-load models if needed
 */
onStoreEvent<{ providerId: string; previousProviderId: string; timestamp: number }>(
    STORE_EVENTS.PROVIDER_SELECTED,
    ({ providerId }) => {
        const state = useModelsStore.getState().models[providerId]
        if (!state?.models?.length) {
            console.log(`[ModelsStore] Provider selected, loading models for ${providerId}...`)
            useModelsStore.getState().loadModelsForProvider(providerId)
        }
    }
)

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get models for a provider
 */
export function useProviderModels(providerId: string) {
    const models = useModelsStore(s => s.getModelsForProvider(providerId))
    const isLoading = useModelsStore(s => s.isLoadingModels(providerId))
    const error = useModelsStore(s => s.getModelError(providerId))
    const loadModels = useModelsStore(s => s.loadModelsForProvider)

    return { models, isLoading, error, loadModels }
}

/**
 * Hook to get selected model
 */
export function useSelectedModel() {
    const modelId = useModelsStore(s => s.selectedModelId)
    const setModel = useModelsStore(s => s.setSelectedModel)
    const providerId = useProviderStore(s => s.activeProviderId)
    const models = useModelsStore(s => s.getModelsForProvider(providerId))

    return { modelId, setModel, models, providerId }
}

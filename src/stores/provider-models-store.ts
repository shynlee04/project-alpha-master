/**
 * @fileoverview Provider Models Store - Single Source of Truth
 * 
 * CC-2025-12-29: Central store for provider configurations and models
 * CC-2025-12-30: FIX - Added graceful error handling for vault operations
 *
 * This store is the SINGLE SOURCE OF TRUTH for:
 * - Available providers and their configurations
 * - Loaded models per provider
 * - API key status per provider
 * 
 * All components (AgentConfigDialog, IDE, Chat, etc.) should use this store
 * instead of managing their own state.
 * 
 * @epic Sprint 30 - Agent Configuration Corrections
 */

import { create } from 'zustand'
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import { ModelInfo, PROVIDERS, ProviderConfig } from '@/lib/agent/providers/types'
import { modelRegistry } from '@/lib/agent/providers/model-registry'
import { credentialVault } from '@/lib/agent/providers/credential-vault'
import { createDexieStorage } from '@/lib/state/dexie-storage'
import {
    STORE_EVENTS,
    emitStoreEvent,
    type ProviderKeySetPayload,
    type ProviderSelectedPayload,
    type ModelSelectedPayload,
} from '@/lib/events/store-events'

// ============================================================================
// Types
// ============================================================================

interface ProviderState {
    hasApiKey: boolean
    isLoadingModels: boolean
    models: ModelInfo[]
    lastFetchedAt: number | null
    error: string | null
}

// Custom provider for OpenAI-compatible endpoints
export interface CustomProvider {
    id: string
    name: string
    baseUrl: string
    headers: Record<string, string>
    isHardcoded: false
}

interface ProviderModelsState {
    // State
    providers: Record<string, ProviderState>
    selectedProviderId: string
    selectedModelId: string | null
    isInitialized: boolean
    customProviders: CustomProvider[]

    // Actions
    initialize: () => Promise<void>
    loadModelsForProvider: (providerId: string) => Promise<void>
    setSelectedProvider: (providerId: string) => void
    setSelectedModel: (modelId: string) => void
    refreshProviderStatus: (providerId: string) => Promise<void>

    // AC-01: New actions for cross-workspace reactivity
    setApiKey: (providerId: string, apiKey: string) => Promise<void>
    removeApiKey: (providerId: string) => Promise<void>
    addCustomProvider: (name: string, baseUrl: string, headers?: Record<string, string>) => string
    removeCustomProvider: (id: string) => void

    // Getters
    getModelsForProvider: (providerId: string) => ModelInfo[]
    getProviderConfig: (providerId: string) => ProviderConfig | undefined
    hasApiKeyForProvider: (providerId: string) => boolean
}

// ============================================================================
// Store
// ============================================================================

export const useProviderModelsStore = create<ProviderModelsState>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                // Initial state
                providers: {},
                selectedProviderId: 'openrouter',
                selectedModelId: null,
                isInitialized: false,
                customProviders: [],

                /**
                 * Initialize the store - call on app boot
                 * FIX-2025-12-30: Handle vault initialization failures gracefully
                 */
                initialize: async () => {
                    if (get().isInitialized) return

                    console.log('[ProviderModelsStore] Initializing...')

                    // Initialize vault with try-catch for graceful fallback
                    let vaultReady = false
                    try {
                        await credentialVault.initialize()
                        vaultReady = credentialVault.isReady()
                        console.log('[ProviderModelsStore] Vault initialized:', vaultReady ? 'ready' : 'not ready')
                    } catch (error) {
                        console.error('[ProviderModelsStore] Vault initialization failed:', error)
                        console.log('[ProviderModelsStore] Continuing without encrypted credentials')
                        vaultReady = false
                    }

                    // Check API keys for all known providers
                    const providerIds = ['openrouter', 'gemini', 'anthropic', 'openai']
                    const states: Record<string, ProviderState> = {}

                    for (const id of providerIds) {
                        let hasKey = false
                        if (vaultReady) {
                            try {
                                hasKey = await credentialVault.hasCredentials(id)
                            } catch (error) {
                                console.warn(`[ProviderModelsStore] Failed to check credentials for ${id}:`, error)
                            }
                        }
                        states[id] = {
                            hasApiKey: hasKey,
                            isLoadingModels: false,
                            models: [],
                            lastFetchedAt: null,
                            error: null
                        }
                    }

                    set({ providers: states, isInitialized: true })
                    console.log('[ProviderModelsStore] Initialized with providers:', Object.keys(states))

                    // Auto-load free models for default provider (OpenRouter)
                    const defaultProvider = get().selectedProviderId
                    await get().loadModelsForProvider(defaultProvider)
                },

                /**
                 * Load models for a provider from API
                 * FIX-2025-12-30: Handle vault errors gracefully
                 */
                loadModelsForProvider: async (providerId: string) => {
                    const state = get().providers[providerId]
                    if (!state) {
                        console.warn(`[ProviderModelsStore] Unknown provider: ${providerId}`)
                        return
                    }

                    // Check cache - don't re-fetch if less than 5 minutes old
                    if (state.lastFetchedAt && Date.now() - state.lastFetchedAt < 5 * 60 * 1000 && state.models.length > 0) {
                        console.log(`[ProviderModelsStore] Using cached models for ${providerId}`)
                        return
                    }

                    // Set loading state
                    set(prev => ({
                        providers: {
                            ...prev.providers,
                            [providerId]: { ...prev.providers[providerId], isLoadingModels: true, error: null }
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
                            console.warn(`[ProviderModelsStore] Vault error for ${providerId}:`, vaultError)
                        }

                        if (!hasKey || !apiKey) {
                            // Use free models for OpenRouter, defaults for others
                            const models = providerId === 'openrouter'
                                ? modelRegistry.getFreeModels()
                                : modelRegistry.getDefaultModels(providerId)

                            set(prev => ({
                                providers: {
                                    ...prev.providers,
                                    [providerId]: {
                                        ...prev.providers[providerId],
                                        isLoadingModels: false,
                                        models,
                                        lastFetchedAt: Date.now(),
                                        hasApiKey: false
                                    }
                                }
                            }))
                            return
                        }

                        // Fetch models from API
                        console.log(`[ProviderModelsStore] Fetching models for ${providerId}...`)
                        const models = await modelRegistry.getModels(providerId, apiKey)
                        console.log(`[ProviderModelsStore] Fetched ${models.length} models for ${providerId}`)

                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...prev.providers[providerId],
                                    isLoadingModels: false,
                                    models,
                                    lastFetchedAt: Date.now(),
                                    hasApiKey: true,
                                    error: null
                                }
                            }
                        }))
                    } catch (error) {
                        console.error(`[ProviderModelsStore] Failed to fetch models for ${providerId}:`, error)

                        // Use fallback models
                        const models = providerId === 'openrouter'
                            ? modelRegistry.getFreeModels()
                            : modelRegistry.getDefaultModels(providerId)

                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...prev.providers[providerId],
                                    isLoadingModels: false,
                                    models,
                                    error: String(error)
                                }
                            }
                        }))
                    }
                },

                /**
                 * Set the selected provider with event emission
                 * AC-01: Cross-workspace reactivity
                 */
                setSelectedProvider: (providerId: string) => {
                    const previousProviderId = get().selectedProviderId
                    set({ selectedProviderId: providerId })

                    // Emit event for cross-workspace sync
                    emitStoreEvent<ProviderSelectedPayload>(STORE_EVENTS.PROVIDER_SELECTED, {
                        providerId,
                        previousProviderId,
                        timestamp: Date.now()
                    })

                    // Auto-load models if not loaded
                    const state = get().providers[providerId]
                    if (!state?.models?.length) {
                        get().loadModelsForProvider(providerId)
                    }
                },

                /**
                 * Set the selected model with event emission
                 * AC-01: Cross-workspace reactivity
                 */
                setSelectedModel: (modelId: string) => {
                    const previousModelId = get().selectedModelId
                    const providerId = get().selectedProviderId
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
                 * Set API key for a provider with event emission
                 * AC-01: CRITICAL - This enables cross-workspace reactivity
                 * When API key is set, models are automatically loaded
                 */
                setApiKey: async (providerId: string, apiKey: string) => {
                    console.log(`[ProviderModelsStore] Setting API key for ${providerId}`)

                    try {
                        // Store encrypted key in vault
                        await credentialVault.storeCredentials(providerId, apiKey)

                        // Update store state
                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...prev.providers[providerId] || {
                                        isLoadingModels: false,
                                        models: [],
                                        lastFetchedAt: null,
                                        error: null
                                    },
                                    hasApiKey: true
                                }
                            }
                        }))

                        // CRITICAL: Emit event for cross-workspace reactivity
                        emitStoreEvent<ProviderKeySetPayload>(STORE_EVENTS.PROVIDER_KEY_SET, {
                            providerId,
                            timestamp: Date.now()
                        })

                        // Auto-load models after key is set
                        // Clear cache to force fresh fetch with new key
                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...prev.providers[providerId],
                                    lastFetchedAt: null // Clear cache
                                }
                            }
                        }))
                        await get().loadModelsForProvider(providerId)

                        console.log(`[ProviderModelsStore] API key set and models loaded for ${providerId}`)
                    } catch (error) {
                        console.error(`[ProviderModelsStore] Failed to set API key for ${providerId}:`, error)
                        throw error
                    }
                },

                /**
                 * Remove API key for a provider
                 */
                removeApiKey: async (providerId: string) => {
                    console.log(`[ProviderModelsStore] Removing API key for ${providerId}`)

                    try {
                        await credentialVault.deleteCredentials(providerId)

                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...prev.providers[providerId],
                                    hasApiKey: false,
                                    models: [], // Clear models
                                    lastFetchedAt: null
                                }
                            }
                        }))

                        // Emit event
                        emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_REMOVED, {
                            providerId,
                            timestamp: Date.now()
                        })

                        // Reload default models
                        await get().loadModelsForProvider(providerId)
                    } catch (error) {
                        console.error(`[ProviderModelsStore] Failed to remove API key for ${providerId}:`, error)
                    }
                },

                /**
                 * Add a custom OpenAI-compatible provider
                 * AC-01.3: Custom provider support
                 */
                addCustomProvider: (name: string, baseUrl: string, headers: Record<string, string> = {}) => {
                    const id = `custom-${Date.now()}`
                    const newProvider: CustomProvider = {
                        id,
                        name,
                        baseUrl,
                        headers,
                        isHardcoded: false
                    }

                    set(prev => ({
                        customProviders: [...prev.customProviders, newProvider],
                        providers: {
                            ...prev.providers,
                            [id]: {
                                hasApiKey: false,
                                isLoadingModels: false,
                                models: [],
                                lastFetchedAt: null,
                                error: null
                            }
                        }
                    }))

                    console.log(`[ProviderModelsStore] Added custom provider: ${name} (${id})`)
                    return id
                },

                /**
                 * Remove a custom provider
                 */
                removeCustomProvider: (id: string) => {
                    set(prev => ({
                        customProviders: prev.customProviders.filter(p => p.id !== id),
                        providers: Object.fromEntries(
                            Object.entries(prev.providers).filter(([key]) => key !== id)
                        )
                    }))
                    console.log(`[ProviderModelsStore] Removed custom provider: ${id}`)
                },

                /**
                 * Refresh provider status (check API key, reload models)
                 * FIX-2025-12-30: Handle vault errors gracefully
                 */
                refreshProviderStatus: async (providerId: string) => {
                    let hasKey = false

                    try {
                        if (credentialVault.isReady()) {
                            hasKey = await credentialVault.hasCredentials(providerId)
                        }
                    } catch (error) {
                        console.warn(`[ProviderModelsStore] Failed to check credentials for ${providerId}:`, error)
                    }

                    set(prev => ({
                        providers: {
                            ...prev.providers,
                            [providerId]: {
                                ...prev.providers[providerId] || {
                                    isLoadingModels: false,
                                    models: [],
                                    lastFetchedAt: null,
                                    error: null
                                },
                                hasApiKey: hasKey
                            }
                        }
                    }))

                    // Reload models
                    await get().loadModelsForProvider(providerId)
                },

                /**
                 * Get models for a provider
                 */
                getModelsForProvider: (providerId: string) => {
                    return get().providers[providerId]?.models || []
                },

                /**
                 * Get provider config
                 */
                getProviderConfig: (providerId: string) => {
                    return PROVIDERS[providerId]
                },

                /**
                 * Check if provider has an API key
                 */
                hasApiKeyForProvider: (providerId: string) => {
                    return get().providers[providerId]?.hasApiKey || false
                }
            }),
            {
                name: 'provider-models-state',
                storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
                partialize: (state) => ({
                    selectedProviderId: state.selectedProviderId,
                    selectedModelId: state.selectedModelId,
                    customProviders: state.customProviders,
                    // Don't persist models - they're fetched fresh
                })
            }
        )
    )
)
// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get models for a provider
 */
export function useProviderModels(providerId: string) {
    const models = useProviderModelsStore(s => s.providers[providerId]?.models || []);
    const isLoading = useProviderModelsStore(s => s.providers[providerId]?.isLoadingModels || false);
    const hasApiKey = useProviderModelsStore(s => s.providers[providerId]?.hasApiKey || false);
    const error = useProviderModelsStore(s => s.providers[providerId]?.error);
    const loadModels = useProviderModelsStore(s => s.loadModelsForProvider);

    return { models, isLoading, hasApiKey, error, loadModels };
}

/**
 * Hook to get selected provider and model
 */
export function useSelectedProviderModel() {
    const providerId = useProviderModelsStore(s => s.selectedProviderId)
    const modelId = useProviderModelsStore(s => s.selectedModelId)
    const setProvider = useProviderModelsStore(s => s.setSelectedProvider)
    const setModel = useProviderModelsStore(s => s.setSelectedModel)
    const models = useProviderModelsStore(s => s.providers[providerId]?.models || [])

    return { providerId, modelId, setProvider, setModel, models }
}

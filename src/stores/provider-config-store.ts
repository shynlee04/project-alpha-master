/**
 * @fileoverview Provider Store - Provider Configuration Management
 *
 * Split from provider-models-store.ts (FC-01: Foundation Consolidation)
 *
 * This store manages:
 * - Provider selection
 * - API key management per provider
 * - Custom provider configuration
 * - Provider initialization and status
 *
 * @epic Phase 1 - Foundation Consolidation
 * @story fc-01-split-provider-store
 */

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { ProviderConfig, PROVIDERS } from '@/lib/agent/providers/types'
import { credentialVault } from '@/lib/agent/providers/credential-vault'
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage'
import { createJSONStorage } from 'zustand/middleware'
import {
    STORE_EVENTS,
    emitStoreEvent,
    type ProviderKeySetPayload,
    type ProviderSelectedPayload,
} from '@/lib/events/store-events'

// ============================================================================
// Types
// ============================================================================

interface ProviderStateEntry {
    hasApiKey: boolean
    isInitialized: boolean
    error: string | null
}

export interface CustomProvider {
    id: string
    name: string
    baseUrl: string
    headers: Record<string, string>
    isHardcoded: false
}

interface ProviderState {
    // State
    providers: Record<string, ProviderStateEntry>
    selectedProviderId: string
    customProviders: CustomProvider[]
    isInitialized: boolean

    // Actions
    initialize: () => Promise<void>
    setSelectedProvider: (providerId: string) => void
    setApiKey: (providerId: string, apiKey: string) => Promise<void>
    removeApiKey: (providerId: string) => Promise<void>
    refreshProviderStatus: (providerId: string) => Promise<void>
    addCustomProvider: (name: string, baseUrl: string, headers?: Record<string, string>) => string
    removeCustomProvider: (id: string) => void

    // Getters
    hasApiKeyForProvider: (providerId: string) => boolean
    getProviderConfig: (providerId: string) => ProviderConfig | undefined
}

// ============================================================================
// Store
// ============================================================================

export const useProviderStore = create<ProviderState>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                // Initial state
                providers: {},
                selectedProviderId: 'openrouter',
                customProviders: [],
                isInitialized: false,

                /**
                 * Initialize the provider store
                 */
                initialize: async () => {
                    if (get().isInitialized) return

                    console.log('[ProviderStore] Initializing...')

                    // Initialize vault with graceful error handling
                    let vaultReady = false
                    try {
                        await credentialVault.initialize()
                        vaultReady = credentialVault.isReady()
                        console.log('[ProviderStore] Vault initialized:', vaultReady ? 'ready' : 'not ready')
                    } catch (error) {
                        console.error('[ProviderStore] Vault initialization failed:', error)
                        console.log('[ProviderStore] Continuing without encrypted credentials')
                        vaultReady = false
                    }

                    // Check API keys for all known providers
                    const providerIds = ['openrouter', 'gemini', 'anthropic', 'openai']
                    const states: Record<string, ProviderStateEntry> = {}

                    for (const id of providerIds) {
                        let hasKey = false
                        if (vaultReady) {
                            try {
                                hasKey = await credentialVault.hasCredentials(id)
                            } catch (error) {
                                console.warn(`[ProviderStore] Failed to check credentials for ${id}:`, error)
                            }
                        }
                        states[id] = {
                            hasApiKey: hasKey,
                            isInitialized: true,
                            error: null
                        }
                    }

                    set({ providers: states, isInitialized: true })
                    console.log('[ProviderStore] Initialized with providers:', Object.keys(states))
                },

                /**
                 * Set the selected provider with event emission
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
                },

                /**
                 * Set API key for a provider with event emission
                 * CRITICAL: This enables cross-workspace reactivity
                 * Emits PROVIDER_KEY_SET event that models-store subscribes to
                 */
                setApiKey: async (providerId: string, apiKey: string) => {
                    console.log(`[ProviderStore] Setting API key for ${providerId}`)

                    try {
                        // Store encrypted key in vault
                        await credentialVault.storeCredentials(providerId, apiKey)

                        // Update provider state
                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...(prev.providers[providerId] || {
                                        isInitialized: true,
                                        error: null
                                    }),
                                    hasApiKey: true
                                }
                            }
                        }))

                        // CRITICAL: Emit event for models-store to react and load models
                        emitStoreEvent<ProviderKeySetPayload>(STORE_EVENTS.PROVIDER_KEY_SET, {
                            providerId,
                            timestamp: Date.now()
                        })

                        console.log(`[ProviderStore] API key set for ${providerId}`)
                    } catch (error) {
                        console.error(`[ProviderStore] Failed to set API key for ${providerId}:`, error)
                        throw error
                    }
                },

                /**
                 * Remove API key for a provider
                 */
                removeApiKey: async (providerId: string) => {
                    console.log(`[ProviderStore] Removing API key for ${providerId}`)

                    try {
                        await credentialVault.deleteCredentials(providerId)

                        set(prev => ({
                            providers: {
                                ...prev.providers,
                                [providerId]: {
                                    ...prev.providers[providerId],
                                    hasApiKey: false,
                                    error: null
                                }
                            }
                        }))

                        // Emit event for models-store to react
                        emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_REMOVED, {
                            providerId,
                            timestamp: Date.now()
                        })

                        console.log(`[ProviderStore] API key removed for ${providerId}`)
                    } catch (error) {
                        console.error(`[ProviderStore] Failed to remove API key for ${providerId}:`, error)
                    }
                },

                /**
                 * Refresh provider status (check API key)
                 */
                refreshProviderStatus: async (providerId: string) => {
                    let hasKey = false

                    try {
                        if (credentialVault.isReady()) {
                            hasKey = await credentialVault.hasCredentials(providerId)
                        }
                    } catch (error) {
                        console.warn(`[ProviderStore] Failed to check credentials for ${providerId}:`, error)
                    }

                    set(prev => ({
                        providers: {
                            ...prev.providers,
                            [providerId]: {
                                ...(prev.providers[providerId] || {
                                    isInitialized: true,
                                    error: null
                                }),
                                hasApiKey: hasKey
                            }
                        }
                    }))
                },

                /**
                 * Add a custom OpenAI-compatible provider
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
                                isInitialized: true,
                                error: null
                            }
                        }
                    }))

                    console.log(`[ProviderStore] Added custom provider: ${name} (${id})`)
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
                    console.log(`[ProviderStore] Removed custom provider: ${id}`)
                },

                /**
                 * Check if provider has an API key
                 */
                hasApiKeyForProvider: (providerId: string) => {
                    return get().providers[providerId]?.hasApiKey || false
                },

                /**
                 * Get provider config
                 */
                getProviderConfig: (providerId: string) => {
                    return PROVIDERS[providerId]
                }
            }),
            {
                name: 'provider-state',
                storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
                partialize: (state) => ({
                    selectedProviderId: state.selectedProviderId,
                    customProviders: state.customProviders,
                    // Don't persist provider runtime states
                })
            }
        )
    )
)

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get provider state
 */
export function useProviderState(providerId: string) {
    const hasApiKey = useProviderStore(s => s.providers[providerId]?.hasApiKey || false)
    const error = useProviderStore(s => s.providers[providerId]?.error)
    const refreshStatus = useProviderStore(s => s.refreshProviderStatus)

    return { hasApiKey, error, refreshStatus }
}

/**
 * Hook to get selected provider
 */
export function useSelectedProvider() {
    const providerId = useProviderStore(s => s.selectedProviderId)
    const setProvider = useProviderStore(s => s.setSelectedProvider)

    return { providerId, setProvider }
}

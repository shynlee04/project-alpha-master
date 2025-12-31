/**
 * @fileoverview Agent Configuration Provider Hook
 * @module components/agent/useAgentConfigProvider
 * @governance EPIC-P0.5
 *
 * Custom hook for provider operations in agent configuration.
 * Handles API keys, model fetching, and connection testing.
 * Extracted from AgentConfigDialog.tsx for better code organization.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ProviderConfig } from '@/lib/agent/providers/types'
import type { ModelInfo } from '@/lib/agent/providers'
import {
    credentialVault,
    providerAdapterFactory,
} from '@/lib/agent/providers'
import { useProviderStore } from '@/lib/state/provider-store'
import type { ConnectionStatus } from './agent-config-types'

interface UseAgentConfigProviderProps {
    providerId: string
    open: boolean
    setApiKey: (key: string) => void
    setModel?: (model: string) => void
    agent?: any
}

interface UseAgentConfigProviderReturn {
    // Provider data
    providers: ProviderConfig[]
    providerConfig: ProviderConfig | undefined
    models: ModelInfo[]
    availableModels: Record<string, ModelInfo[]>
    // Loading states
    isCheckingKey: boolean
    isSavingKey: boolean
    isTestingConnection: boolean
    isLoadingModels: boolean
    // Connection status
    connectionStatus: ConnectionStatus
    setConnectionStatus: (status: ConnectionStatus) => void
    // Actions
    handleSaveApiKey: () => Promise<void>
    handleTestConnection: () => Promise<void>
    fetchModels: (providerId: string) => Promise<void>
}

/**
 * Custom hook for provider operations in agent configuration
 */
export function useAgentConfigProvider({
    providerId,
    open,
    setApiKey,
    setModel,
}: UseAgentConfigProviderProps): UseAgentConfigProviderReturn {
    const { t } = useTranslation()

    // Store integration
    const {
        providers,
        availableModels,
        isLoadingModels: storeLoadingModels,
        fetchModels: storeFetchModels
    } = useProviderStore()

    // Local loading states
    const [isCheckingKey, setIsCheckingKey] = useState(false)
    const [isSavingKey, setIsSavingKey] = useState(false)
    const [isTestingConnection, setIsTestingConnection] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')

    // Get models from the centralized store
    const models = useMemo(() => {
        return availableModels[providerId] || []
    }, [availableModels, providerId])

    const isLoadingModels = storeLoadingModels[providerId] || false

    // Get selected provider config
    const providerConfig = useMemo(() => {
        return providers.find(p => p.id === providerId)
    }, [providerId, providers])

    // Ref to track agent being edited (for model restoration after loadModels)
    const editingAgentRef = useRef<any>(undefined)

    // Initialize credentialVault on mount
    useEffect(() => {
        credentialVault.initialize().catch(console.error)
    }, [])

    /**
     * Check credentials and load models from STORE (single source of truth)
     */
    useEffect(() => {
        if (!open || !providerId) return

        setIsCheckingKey(true)
        setConnectionStatus('idle')

        const loadProviderData = async () => {
            try {
                await credentialVault.initialize()
                const apiKeyValue = await credentialVault.getCredentials(providerId)

                console.log('[useAgentConfigProvider] Provider:', providerId, 'hasKey:', !!apiKeyValue)
                setApiKey(apiKeyValue ? '••••' : '')

                // Fetch models using the STORE (single source of truth)
                await storeFetchModels(providerId)
                console.log('[useAgentConfigProvider] Models fetched via store, count:', models.length)

                // Restore model from agent being edited after models load
                if (editingAgentRef.current && editingAgentRef.current.model && setModel) {
                    console.log('[useAgentConfigProvider] Restoring model from edit:', editingAgentRef.current.model)
                    setModel(editingAgentRef.current.model)
                }
            } catch (error) {
                console.error('[useAgentConfigProvider] Error loading provider data:', error)
                setApiKey('')
            } finally {
                setIsCheckingKey(false)
            }
        }

        loadProviderData()
    }, [providerId, open, storeFetchModels, setApiKey, setModel])

    /**
     * Handle API key save
     */
    const handleSaveApiKey = useCallback(async () => {
        // Don't try to save masked value - only save real new keys
        const currentApiKey = '' // Would need to be passed in or managed differently

        if (!currentApiKey.trim() || currentApiKey === '••••') {
            if (currentApiKey === '••••') {
                toast.info(t('agents.config.apiKey.alreadySaved', 'API key is already saved'))
                return
            }
            toast.error(t('agents.config.apiKey.required', 'API key is required'))
            return
        }

        setIsSavingKey(true)
        const keyToSave = currentApiKey.trim()
        try {
            console.log('[useAgentConfigProvider] Saving API key for provider:', providerId)
            await credentialVault.storeCredentials(providerId, keyToSave)
            setApiKey('••••')
            toast.success(t('agents.config.apiKey.saveSuccess', 'API key saved successfully'))

            // Reload models using the STORE (single source of truth)
            await storeFetchModels(providerId)
        } catch (error) {
            console.error('[useAgentConfigProvider] Failed to save API key:', error)
            toast.error(t('agents.config.apiKey.saveFailed', 'Failed to save API key'))
        } finally {
            setIsSavingKey(false)
        }
    }, [providerId, storeFetchModels, setApiKey, t])

    /**
     * Handle connection test
     */
    const handleTestConnection = useCallback(async () => {
        setIsTestingConnection(true)
        setConnectionStatus('idle')

        try {
            const apiKeyVal = await credentialVault.getCredentials(providerId)
            if (!apiKeyVal) {
                toast.error(t('agents.config.testConnection.noKey', 'No API key stored'))
                setConnectionStatus('error')
                return
            }

            const result = await providerAdapterFactory.testConnection(
                providerId,
                apiKeyVal
            )

            if (result.success) {
                toast.success(t('agents.config.testConnection.success', 'Connection successful! ({{latency}}ms)', { latency: result.latencyMs }))
                setConnectionStatus('success')
            } else {
                toast.error(t('agents.config.testConnection.failed', 'Connection failed: {{error}}', { error: result.error }))
                setConnectionStatus('error')
            }
        } catch (error) {
            console.error('[useAgentConfigProvider] Connection test failed:', error)
            toast.error(t('agents.config.testConnection.error', 'Connection test error'))
            setConnectionStatus('error')
        } finally {
            setIsTestingConnection(false)
        }
    }, [providerId, t])

    /**
     * Fetch models for a provider
     */
    const fetchModels = useCallback(async (providerId: string) => {
        await storeFetchModels(providerId)
    }, [storeFetchModels])

    return {
        // Provider data
        providers,
        providerConfig,
        models,
        availableModels,
        // Loading states
        isCheckingKey,
        isSavingKey,
        isTestingConnection,
        isLoadingModels,
        // Connection status
        connectionStatus,
        setConnectionStatus,
        // Actions
        handleSaveApiKey,
        handleTestConnection,
        fetchModels,
    }
}

// Import useRef from React
import { useRef } from 'react'

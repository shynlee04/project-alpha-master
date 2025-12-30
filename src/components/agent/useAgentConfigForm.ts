/**
 * @fileoverview Agent Configuration Form Hook
 * @module components/agent/useAgentConfigForm
 * @governance EPIC-P0.5
 *
 * Custom hook for agent configuration form state management.
 * Extracted from AgentConfigDialog.tsx for better code organization.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Agent } from '@/mocks/agents'
import { useAgentsStore } from '@/stores/agents-store'
import { toast } from 'sonner'
import { safeDebug, sanitizeForLogging } from '@/lib/utils/security'
import type {
    AgentFormData,
    CustomHeader,
    FormErrors,
} from './agent-config-types'
import { validateAgentForm, validateModelSelection, validateOpenAICompatible } from './agent-config-validation'

/**
 * Map provider display name (from Agent interface) to store ID
 * Fixes: Agent edits not reflecting existing values
 */
function mapProviderNameToId(providerName: string): string {
    const nameToIdMap: Record<string, string> = {
        'OpenRouter': 'openrouter',
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Mistral': 'mistral',
        'Google': 'google',
        'OpenAI Compatible': 'openai-compatible',
    }
    return nameToIdMap[providerName] || 'openrouter'
}

interface UseAgentConfigFormProps {
    agent?: Agent
    open: boolean
}

interface UseAgentConfigFormReturn {
    // Form state
    name: string
    setName: (name: string) => void
    role: string
    setRole: (role: string) => void
    providerId: string
    setProviderId: (id: string) => void
    model: string
    setModel: (model: string) => void
    apiKey: string
    setApiKey: (key: string) => void
    customBaseURL: string
    setCustomBaseURL: (url: string) => void
    customModelId: string
    setCustomModelId: (id: string) => void
    customHeaders: CustomHeader[]
    setCustomHeaders: (headers: CustomHeader[]) => void
    enableNativeTools: boolean
    setEnableNativeTools: (enabled: boolean) => void
    // LLM Parameters
    temperature: number
    setTemperature: (temp: number) => void
    maxTokens: number
    setMaxTokens: (tokens: number) => void
    topP: number
    setTopP: (topP: number) => void
    topK: number | undefined
    setTopK: (topK: number | undefined) => void
    systemPrompt: string
    setSystemPrompt: (prompt: string) => void
    showAdvancedParams: boolean
    setShowAdvancedParams: (show: boolean) => void
    // UI state
    errors: FormErrors
    setErrors: (errors: FormErrors) => void
    isSubmitting: boolean
    setIsSubmitting: (submitting: boolean) => void
    // Actions
    validateForm: () => boolean
    handleCancel: () => void
    handleSubmit: (onSuccess?: (agent: Agent) => void, onOpenChange?: (open: boolean) => void) => Promise<void>
    handleProviderChange: (value: string) => void
    handleModelChange: (value: string) => void
    resetForm: () => void
}

/**
 * Custom hook for agent configuration form state and logic
 */
export function useAgentConfigForm({
    agent,
    open,
}: UseAgentConfigFormProps): UseAgentConfigFormReturn {
    const { t } = useTranslation()
    const { addAgent, updateAgent } = useAgentsStore()

    // Ref to track agent being edited (for model restoration after loadModels)
    const editingAgentRef = useRef<Agent | undefined>(undefined)

    // Form state
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [providerId, setProviderId] = useState<string>('openrouter')
    const [model, setModel] = useState('')
    const [apiKey, setApiKey] = useState('')

    // Advanced settings state
    const [customBaseURL, setCustomBaseURL] = useState('')
    const [customModelId, setCustomModelId] = useState('')
    const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([])
    const [enableNativeTools, setEnableNativeTools] = useState(true)

    // LLM Parameters
    const [temperature, setTemperature] = useState(0.7)
    const [maxTokens, setMaxTokens] = useState(4096)
    const [topP, setTopP] = useState(0.95)
    const [topK, setTopK] = useState<number | undefined>(undefined)
    const [systemPrompt, setSystemPrompt] = useState('')
    const [showAdvancedParams, setShowAdvancedParams] = useState(false)

    // UI state
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    /**
     * Populate form when editing an existing agent
     * Fixes: Agent config edits not reflecting existing values (CC-2025-12-29)
     */
    useEffect(() => {
        console.log('[useAgentConfigForm] Form effect triggered - open:', open, 'agent:', agent?.name || 'null')

        if (!open) {
            // Reset ref when dialog closes
            editingAgentRef.current = undefined
            return
        }

        if (agent) {
            // Edit mode: store agent ref for model restoration
            editingAgentRef.current = agent
            console.log('[useAgentConfigForm] Edit mode - populating from agent:', {
                name: agent.name,
                role: agent.role,
                provider: agent.provider,
                model: agent.model
            })

            // Populate form from agent data
            setName(agent.name)
            setRole(agent.role || agent.description || '')
            const mappedProviderId = mapProviderNameToId(agent.provider)
            setProviderId(mappedProviderId)
            setModel(agent.model || '')

            // Custom provider fields
            if (agent.customBaseURL) setCustomBaseURL(agent.customBaseURL)
            if (agent.customHeaders) {
                setCustomHeaders(
                    Object.entries(agent.customHeaders).map(([key, value]) => ({ key, value }))
                )
            }
            if (agent.enableNativeTools !== undefined) setEnableNativeTools(agent.enableNativeTools)

            // LLM Parameters
            if (agent.temperature !== undefined) setTemperature(agent.temperature)
            if (agent.maxTokens !== undefined) setMaxTokens(agent.maxTokens)
            if (agent.topP !== undefined) setTopP(agent.topP)
            if (agent.topK !== undefined) setTopK(agent.topK)
            if (agent.systemPrompt) setSystemPrompt(agent.systemPrompt)

            console.log('[useAgentConfigForm] Populated form for edit:', agent.name, 'mapped provider:', mappedProviderId)
        } else {
            // Create mode: reset to defaults
            editingAgentRef.current = undefined
            resetForm()
        }
    }, [agent, open])

    /**
     * Reset form to default values
     */
    const resetForm = useCallback(() => {
        setName('')
        setRole('')
        setProviderId('openrouter')
        setModel('')
        setApiKey('')
        setCustomBaseURL('')
        setCustomHeaders([])
        setCustomModelId('')
        setEnableNativeTools(true)
        setErrors({})
        // LLM Parameters defaults
        setTemperature(0.7)
        setMaxTokens(4096)
        setTopP(0.95)
        setTopK(undefined)
        setSystemPrompt('')
        setShowAdvancedParams(false)
    }, [])

    /**
     * Validate form using Zod schema
     */
    const validateForm = useCallback((): boolean => {
        const formData: AgentFormData = {
            name,
            role,
            providerId,
            model,
            apiKey,
            customBaseURL,
            customModelId,
            customHeaders,
            enableNativeTools,
            temperature,
            maxTokens,
            topP,
            topK,
            systemPrompt,
        }

        console.log('[useAgentConfigForm] Validating:', sanitizeForLogging(formData))

        // Zod validation
        const { success, errors } = validateAgentForm(formData)
        if (!success) {
            setErrors(errors)
            return false
        }

        // Additional model validation
        const modelError = validateModelSelection(providerId, model)
        if (modelError) {
            setErrors(prev => ({ ...prev, model: t(modelError) }))
            return false
        }

        // OpenAI Compatible validation
        const openAIError = validateOpenAICompatible(providerId, customBaseURL, customModelId)
        if (openAIError) {
            setErrors(prev => ({ ...prev, customBaseURL: t(openAIError) }))
            return false
        }

        setErrors({})
        return true
    }, [name, role, providerId, model, apiKey, customBaseURL, customModelId, customHeaders, enableNativeTools, temperature, maxTokens, topP, topK, systemPrompt, t])

    /**
     * Handle cancel button click
     */
    const handleCancel = useCallback(() => {
        resetForm()
    }, [resetForm])

    /**
     * Handle provider change
     */
    const handleProviderChange = useCallback((value: string) => {
        setProviderId(value)
        setModel('')
        setErrors(prev => ({ ...prev, provider: undefined, model: undefined }))
    }, [])

    /**
     * Handle model change
     */
    const handleModelChange = useCallback((value: string) => {
        setModel(value)
        if (errors.model) setErrors(prev => ({ ...prev, model: undefined }))
    }, [errors.model])

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(async (onSuccess?: (agent: Agent) => void, onOpenChange?: (open: boolean) => void) => {
        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            // Convert custom headers array to object
            const headersObj = customHeaders.reduce((acc, h) => {
                if (h.key.trim() && h.value.trim()) {
                    acc[h.key.trim()] = h.value.trim()
                }
                return acc
            }, {} as Record<string, string>)

            const agentData = {
                name: name.trim(),
                role: role.trim() || 'Assistant',
                status: 'offline' as const,
                provider: providerId, // Will be converted to display name by parent
                model: providerId === 'openai-compatible' ? customModelId : model,
                description: role.trim() || undefined,
                // OpenAI Compatible Provider support
                customBaseURL: providerId === 'openai-compatible' ? customBaseURL.trim() : undefined,
                customHeaders: providerId === 'openai-compatible' && Object.keys(headersObj).length > 0 ? headersObj : undefined,
                enableNativeTools: providerId === 'openai-compatible' ? enableNativeTools : undefined,
                // LLM Parameters
                temperature,
                maxTokens,
                topP,
                topK: topK !== undefined ? topK : undefined,
                systemPrompt: systemPrompt.trim() || undefined,
            }

            safeDebug('[useAgentConfigForm] Saving agent:', sanitizeForLogging(agentData))

            let savedAgent: Agent | undefined

            if (agent) {
                // Update existing
                updateAgent(agent.id, agentData as Partial<Agent>)
                savedAgent = { ...agent, ...agentData }
                toast.success(t('agents.config.updateSuccess', "Agent '{{name}}' updated successfully!", { name: agentData.name }))
            } else {
                // Add new
                savedAgent = addAgent(agentData as Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>)
                toast.success(t('agents.config.successToast', "Agent '{{name}}' created successfully!", { name: agentData.name }))
            }

            // Trigger success callback
            if (onSuccess && savedAgent) {
                onSuccess(savedAgent)
            }

            // Close dialog
            if (onOpenChange) {
                onOpenChange(false)
            }

            // Reset form
            resetForm()

        } catch (error) {
            console.error('[useAgentConfigForm] Save failed:', error)
            toast.error(t('agents.config.error.save', 'Failed to save agent'))
        } finally {
            setIsSubmitting(false)
        }
    }, [name, role, providerId, model, customBaseURL, customHeaders, enableNativeTools, temperature, maxTokens, topP, topK, systemPrompt, validateForm, addAgent, updateAgent, agent, t, resetForm, customModelId])

    return {
        // Form state
        name, setName,
        role, setRole,
        providerId, setProviderId,
        model, setModel,
        apiKey, setApiKey,
        customBaseURL, setCustomBaseURL,
        customModelId, setCustomModelId,
        customHeaders, setCustomHeaders,
        enableNativeTools, setEnableNativeTools,
        temperature, setTemperature,
        maxTokens, setMaxTokens,
        topP, setTopP,
        topK, setTopK,
        systemPrompt, setSystemPrompt,
        showAdvancedParams, setShowAdvancedParams,
        // UI state
        errors, setErrors,
        isSubmitting, setIsSubmitting,
        // Actions
        validateForm,
        handleCancel,
        handleSubmit,
        handleProviderChange,
        handleModelChange,
        resetForm,
    }
}

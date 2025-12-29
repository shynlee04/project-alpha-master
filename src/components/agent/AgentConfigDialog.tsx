/**
 * AgentConfigDialog - Extensible Agent Configuration Dialog
 * 
 * Redesigned agent configuration following information architecture (Step 3)
 * and 8-bit design system. Features:
 * - Multi-provider support with extensible architecture
 * - Form validation with clear error messages
 * - Connection testing before saving
 * - Configuration status indicators
 * - Multiple agent profiles support
 * - Secure localStorage persistence
 * - i18next support (English/Vietnamese)
 * - CVA variants for component variants
 * 
 * @epic P0.5 - Redesign Agent Configuration Flow
 * @story P0.5
 * 
 * @see _bmad-output/information-architecture-2025-12-25.md
 * @see _bmad-output/design-system-8bit-2025-12-25.md
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, Loader2, Key, CheckCircle2, XCircle, RefreshCw, Plus, Settings2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Agent } from '@/mocks/agents'

// Security utilities for safe logging (RC-028-010)
import { safeLog, safeDebug, sanitizeForLogging } from '@/lib/utils/security'

// Epic 25 Provider Infrastructure
import {
    credentialVault,
    modelRegistry,
    providerAdapterFactory,
    PROVIDERS,
    type ModelInfo,
} from '@/lib/agent/providers'

/**
 * Provider configuration interface for extensibility
 */
// Removed local ProviderConfig interface in favor of @/lib/agent/providers type
import { useProviderStore } from '@/lib/state/provider-store'
import { useAgentsStore } from '@/stores/agents-store'
import { ProviderConfig } from '@/lib/agent/providers/types'

/**
 * Map provider display name (from Agent interface) to store ID
 * Fixes: Agent edits not reflecting existing values
 */
const mapProviderNameToId = (providerName: string): string => {
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

/**
 * Extensible provider configurations
 * Can be easily extended without modifying core dialog logic
 */
// Helper to get icon for provider
const getProviderIcon = (id: string, name: string) => {
    if (id.includes('openai')) return <Bot className="w-5 h-5" />
    if (id.includes('anthropic')) return <Bot className="w-5 h-5" />
    if (id.includes('google')) return <Bot className="w-5 h-5" />
    return <Settings2 className="w-5 h-5" />
}

/**
 * Form validation schema using Zod
 */
import { z } from 'zod'

const agentFormSchema = z.object({
    name: z.string().min(1, 'agents.config.validation.nameRequired'),
    role: z.string().optional(),
    providerId: z.string().min(1, 'agents.config.validation.providerRequired'),
    model: z.string().optional(),
    apiKey: z.string().optional(),
    customBaseURL: z.string().url().optional(),
    customModelId: z.string().optional(),
    customHeaders: z.array(
        z.object({
            key: z.string().min(1),
            value: z.string(),
        })
    ).optional(),
    enableNativeTools: z.boolean().optional(),
})

type AgentFormData = z.infer<typeof agentFormSchema>

/**
 * Form validation errors type
 */
type FormErrors = {
    name?: string
    provider?: string
    model?: string
    apiKey?: string
    customBaseURL?: string
}

/**
 * Connection status type
 */
type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

/**
 * Configuration tab type
 */
type ConfigTab = 'basic' | 'advanced'

interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (agent: Agent) => void // Changed from onSubmit to onSuccess
    agent?: Agent
}

export function AgentConfigDialog({
    open,
    onOpenChange,
    onSuccess,
    agent,
}: AgentConfigDialogProps) {
    const { t } = useTranslation()

    // Form state
    const [activeTab, setActiveTab] = useState<ConfigTab>('basic')
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [providerId, setProviderId] = useState<string>('openrouter')
    const [model, setModel] = useState('')
    const [apiKey, setApiKey] = useState('')

    // Advanced settings state
    const [customBaseURL, setCustomBaseURL] = useState('')
    const [customModelId, setCustomModelId] = useState('')
    const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([])
    const [enableNativeTools, setEnableNativeTools] = useState(true)
    const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false)

    // CC-2025-12-29: LLM Parameters State
    const [temperature, setTemperature] = useState(0.7)
    const [maxTokens, setMaxTokens] = useState(4096)
    const [topP, setTopP] = useState(0.95)
    const [topK, setTopK] = useState<number | undefined>(undefined)
    const [systemPrompt, setSystemPrompt] = useState('')
    const [showAdvancedParams, setShowAdvancedParams] = useState(false)

    // Store actions
    const { addAgent, updateAgent, removeAgent } = useAgentsStore()

    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCheckingKey, setIsCheckingKey] = useState(false)
    const [isSavingKey, setIsSavingKey] = useState(false)
    const [isTestingConnection, setIsTestingConnection] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
    const [isLoadingModels, setIsLoadingModels] = useState(false)

    // Validation errors
    const [errors, setErrors] = useState<FormErrors>({})

    // Model list
    const [models, setModels] = useState<ModelInfo[]>([])

    // Get configured providers from store
    const { providers } = useProviderStore()

    // Get selected provider config
    const providerConfig = useMemo(() => {
        return providers.find(p => p.id === providerId)
    }, [providerId, providers])

    // Initialize credentialVault on mount
    useEffect(() => {
        credentialVault.initialize().catch(console.error)
    }, [])

    // Load models from provider API or fallback
    // CC-2025-12-26: Accept optional direct API key to avoid race condition
    // NOTE: This must be defined BEFORE the useEffect that uses it
    const loadModels = useCallback(async (provider: string, directApiKey?: string) => {
        setIsLoadingModels(true)
        try {
            // Use direct API key if provided, otherwise fetch from vault
            const apiKeyVal = directApiKey ?? await credentialVault.getCredentials(provider)
            safeDebug('[AgentConfigDialog] loadModels called for', provider, 'hasKey:', !!apiKeyVal)

            if (!apiKeyVal) {
                console.log('[AgentConfigDialog] No API key, using fallback models')
                if (provider === 'openrouter') {
                    const freeModels = modelRegistry.getFreeModels()
                    setModels(freeModels)
                } else {
                    setModels(modelRegistry.getDefaultModels(provider))
                }
                return
            }

            const fetchedModels = await modelRegistry.getModels(provider, apiKeyVal)
            safeDebug('[AgentConfigDialog] Fetched', fetchedModels.length, 'models from API')
            setModels(fetchedModels)
        } catch (error) {
            console.warn('[AgentConfigDialog] Failed to fetch models, using fallback:', error)
            // Fallback to free models for OpenRouter
            if (provider === 'openrouter') {
                const freeModels = modelRegistry.getFreeModels()
                setModels(freeModels)
            } else {
                setModels(modelRegistry.getDefaultModels(provider))
            }
        } finally {
            setIsLoadingModels(false)
        }
    }, [])

    // Ref to track agent being edited (for model restoration after loadModels)
    const editingAgentRef = useRef<Agent | undefined>(undefined)

    // Check for stored credentials when provider changes
    useEffect(() => {
        if (!open || !providerId) return

        setIsCheckingKey(true)
        setConnectionStatus('idle')

        credentialVault.hasCredentials(providerId)
            .then(async (hasKey) => {
                setApiKey(hasKey ? '••••' : '')

                // Load models if we have a key
                if (hasKey) {
                    await loadModels(providerId)
                } else {
                    // Load free models for OpenRouter
                    if (providerId === 'openrouter') {
                        const freeModels = modelRegistry.getFreeModels()
                        setModels(freeModels)
                    } else {
                        setModels([])
                    }
                }

                // CC-2025-12-29: Restore model from agent being edited after models load
                if (editingAgentRef.current && editingAgentRef.current.model) {
                    console.log('[AgentConfigDialog] Restoring model from edit:', editingAgentRef.current.model)
                    setModel(editingAgentRef.current.model)
                }
            })
            .catch(console.error)
            .finally(() => setIsCheckingKey(false))
    }, [providerId, open, loadModels])

    /**
     * Populate form when editing an existing agent
     * Fixes: Agent config edits not reflecting existing values (CC-2025-12-29)
     */
    useEffect(() => {
        if (!open) {
            // Reset ref when dialog closes
            editingAgentRef.current = undefined
            return
        }

        if (agent) {
            // Edit mode: store agent ref for model restoration
            editingAgentRef.current = agent
            console.log('[AgentConfigDialog] Edit mode - agent:', agent.name, 'model:', agent.model, 'provider:', agent.provider)

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

            // CC-2025-12-29: LLM Parameters
            if (agent.temperature !== undefined) setTemperature(agent.temperature)
            if (agent.maxTokens !== undefined) setMaxTokens(agent.maxTokens)
            if (agent.topP !== undefined) setTopP(agent.topP)
            if (agent.topK !== undefined) setTopK(agent.topK)
            if (agent.systemPrompt) setSystemPrompt(agent.systemPrompt)

            console.log('[AgentConfigDialog] Populated form for edit:', agent.name, 'mapped provider:', mappedProviderId)
        } else {
            // Create mode: reset to defaults
            editingAgentRef.current = undefined
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
            setConnectionStatus('idle')
            // LLM Parameters defaults
            setTemperature(0.7)
            setMaxTokens(4096)
            setTopP(0.95)
            setTopK(undefined)
            setSystemPrompt('')
            setShowAdvancedParams(false)
        }
    }, [agent, open])

    // Validate form using Zod
    const validateForm = useCallback((): boolean => {
        const formData = {
            name,
            role,
            providerId,
            model,
            apiKey,
            customBaseURL,
            customModelId,
            customHeaders,
            enableNativeTools
        }
        console.log('[AgentConfigDialog] Validating:', sanitizeForLogging(formData))

        const result = agentFormSchema.safeParse(formData)

        if (!result.success) {
            const formattedErrors: FormErrors = {}
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof FormErrors
                formattedErrors[path] = issue.message
            })
            setErrors(formattedErrors)
            return false
        }

        // Additional manual check for model strictly if not custom
        if (providerId !== 'openai-compatible' && !model.trim()) {
            setErrors(prev => ({ ...prev, model: t('agents.config.validation.modelRequired') }))
            return false
        }

        // OpenAI compatible checks
        if (providerId === 'openai-compatible') {
            if (!customBaseURL.trim()) {
                setErrors(prev => ({ ...prev, customBaseURL: t('agents.config.validation.baseUrlRequired') }))
                return false
            }
            if (!customModelId.trim()) {
                // If user didn't select or type a model ID, maybe warn? Schema says optional but logic might need it.
                // For now, if customModelId is empty, we fall back to 'model' state which tracks it.
            }
        }

        setErrors({})
        return true
    }, [name, role, providerId, model, apiKey, customBaseURL, customModelId, customHeaders, enableNativeTools, t])

    // Handle API key save
    const handleSaveApiKey = useCallback(async () => {
        if (!apiKey.trim()) {
            setErrors(prev => ({ ...prev, apiKey: t('agents.config.apiKey.required', 'API key is required') }))
            return
        }

        setIsSavingKey(true)
        const keyToSave = apiKey.trim()
        try {
            await credentialVault.storeCredentials(providerId, keyToSave)
            setApiKey('••••')
            toast.success(t('agents.config.apiKey.saveSuccess', 'API key saved successfully'))

            // Reload models with the key we just saved (avoid race condition)
            // CC-2025-12-26: Pass API key directly instead of re-fetching from vault
            await loadModels(providerId, keyToSave)
        } catch (error) {
            console.error('[AgentConfigDialog] Failed to save API key:', error)
            toast.error(t('agents.config.apiKey.saveFailed', 'Failed to save API key'))
            setErrors(prev => ({ ...prev, apiKey: t('agents.config.apiKey.saveFailed', 'Failed to save API key') }))
        } finally {
            setIsSavingKey(false)
        }
    }, [apiKey, providerId, loadModels, t])

    // Handle connection test
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
            console.error('[AgentConfigDialog] Connection test failed:', error)
            toast.error(t('agents.config.testConnection.error', 'Connection test error'))
            setConnectionStatus('error')
        } finally {
            setIsTestingConnection(false)
        }
    }, [providerId, t])

    // Handle provider change
    const handleProviderChange = useCallback((value: string) => {
        setProviderId(value)
        setModel('')
        setErrors(prev => ({ ...prev, provider: undefined, model: undefined }))
        setConnectionStatus('idle')
    }, [])

    // Handle model change
    const handleModelChange = useCallback((value: string) => {
        setModel(value)
        if (errors.model) setErrors(prev => ({ ...prev, model: undefined }))
    }, [errors.model])

    // Handle cancel
    const handleCancel = useCallback(() => {
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
        setConnectionStatus('idle')
        onOpenChange(false)
    }, [onOpenChange])

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            // Auto-save API Key if pending (UX fix)
            if (apiKey.trim() && apiKey !== '••••') {
                safeDebug('[AgentConfigDialog] Auto-saving pending API key...')
                await credentialVault.storeCredentials(providerId, apiKey.trim())
            }

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
                provider: (providerConfig?.name || 'OpenRouter') as Agent['provider'],
                model: providerId === 'openai-compatible' ? customModelId : model,
                description: role.trim() || undefined,
                // OpenAI Compatible Provider support
                customBaseURL: providerId === 'openai-compatible' ? customBaseURL.trim() : undefined,
                customHeaders: providerId === 'openai-compatible' && Object.keys(headersObj).length > 0 ? headersObj : undefined,
                enableNativeTools: providerId === 'openai-compatible' ? enableNativeTools : undefined,
                // CC-2025-12-29: LLM Parameters
                temperature,
                maxTokens,
                topP,
                topK: topK !== undefined ? topK : undefined,
                systemPrompt: systemPrompt.trim() || undefined,
            }

            safeDebug('[AgentConfigDialog] Saving agent:', sanitizeForLogging(agentData))

            let savedAgent: Agent | undefined;

            if (agent) {
                // Update existing
                updateAgent(agent.id, agentData)
                savedAgent = { ...agent, ...agentData }
                toast.success(t('agents.config.updateSuccess', "Agent '{{name}}' updated successfully!", { name: agentData.name }))
            } else {
                // Add new
                savedAgent = addAgent(agentData)
                toast.success(t('agents.config.successToast', "Agent '{{name}}' created successfully!", { name: agentData.name }))
            }

            // Trigger success callback
            if (onSuccess && savedAgent) {
                onSuccess(savedAgent)
            }

            // Close dialog
            onOpenChange(false)

            // Reset form (will happen via handleCancel/useEffect when closed, but good to be explicit)
            handleCancel()

        } catch (error) {
            console.error('[AgentConfigDialog] Save failed:', error)
            toast.error(t('agents.config.error.save', 'Failed to save agent'))
        } finally {
            setIsSubmitting(false)
        }

    }, [name, role, providerConfig?.name, providerId, model, customBaseURL, customHeaders, enableNativeTools, validateForm, addAgent, updateAgent, onSuccess, onOpenChange, agent, t, handleCancel, customModelId])



    // Render configuration status indicator
    const renderConfigStatus = () => {
        if (!providerConfig) return null

        const hasApiKey = apiKey !== '' && apiKey !== '••••'

        return (
            <div className="flex items-center gap-2 text-xs">
                {hasApiKey ? (
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                ) : (
                    <XCircle className="w-3 h-3 text-destructive" />
                )}
                <span className={cn(
                    hasApiKey ? 'text-success' : 'text-muted-foreground'
                )}>
                    {hasApiKey ? t('agents.config.status.configured', 'Configured') : t('agents.config.status.notConfigured', 'Not configured')}
                </span>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] rounded-none border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-pixel text-lg">
                        <Bot className="w-5 h-5 text-primary" />
                        {agent
                            ? t('agents.config.editTitle', 'Edit Agent Configuration')
                            : t('agents.config.title', 'New Agent Configuration')}
                    </DialogTitle>
                    <div className="flex justify-between items-center">
                        <DialogDescription className="text-muted-foreground text-sm">
                            {agent
                                ? t('agents.config.editSubtitle', 'Modify your AI agent settings')
                                : t('agents.config.subtitle', 'Configure a new AI agent for your workflow')}
                        </DialogDescription>
                        {agent && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm(t('agents.config.confirmDelete', 'Are you sure you want to delete this agent?'))) {
                                        // Capture data for undo
                                        const agentToDelete = agent

                                        // Delete immediately (Optimistic UI)
                                        removeAgent(agent.id)
                                        onOpenChange(false)

                                        // Show undo toast
                                        toast.success(t('agents.config.deleted', 'Agent deleted'), {
                                            action: {
                                                label: t('actions.undo', 'Undo'),
                                                onClick: () => {
                                                    // Restore agent (will have new ID unless we force it, but for now addAgent is fine)
                                                    // Actually addAgent generates new ID. This is acceptable for simple restore.
                                                    // If we needed exact ID restore, store needs 'restoreAgent' method.
                                                    // For MVP, recreating is fine.
                                                    const { id, ...restoreData } = agentToDelete
                                                    addAgent(restoreData)
                                                    toast.success(t('agents.config.restored', 'Agent restored'))
                                                }
                                            },
                                            duration: 5000,
                                        })
                                    }
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {t('actions.delete', 'Delete')}
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as ConfigTab)}>
                    <TabsList className="w-full">
                        <TabsTrigger value="basic" className="font-pixel">
                            {t('agents.config.tabs.basic', 'Basic')}
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="font-pixel">
                            {t('agents.config.tabs.advanced', 'Advanced')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="mt-4 space-y-4">
                        {/* Basic Configuration */}
                        <div className="grid gap-4">
                            {/* Agent Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="agent-name">
                                    {t('agents.config.name', 'Agent Name')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="agent-name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                                    }}
                                    placeholder={t('agents.config.namePlaceholder', 'Enter agent name...')}
                                    className="rounded-none"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Role/Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="agent-role">
                                    {t('agents.config.role', 'Role')}
                                </Label>
                                <Input
                                    id="agent-role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder={t('agents.config.rolePlaceholder', 'e.g., Frontend Developer')}
                                    className="rounded-none"
                                />
                            </div>

                            {/* Provider Selection */}
                            <div className="grid gap-2">
                                <Label>
                                    {t('agents.config.provider', 'LLM Provider')} <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Select value={providerId} onValueChange={handleProviderChange}>
                                        <SelectTrigger className="rounded-none">
                                            <SelectValue placeholder={t('agents.config.providerPlaceholder', 'Select provider...')} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            {providers.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    <div className="flex items-center gap-2">
                                                        {getProviderIcon(p.id, p.name)}
                                                        <span>{p.name}</span>
                                                        {p.id === 'openrouter' && (
                                                            <span className="ml-2 text-xs text-success">
                                                                {t('agents.config.freeModels', '(Free models available)')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.provider && (
                                    <p className="text-xs text-destructive">{errors.provider}</p>
                                )}
                            </div>

                            {/* Model Selection */}
                            <div className="grid gap-2">
                                <Label>
                                    {t('agents.config.model', 'Model')} <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={model}
                                    onValueChange={handleModelChange}
                                    disabled={!providerId || isLoadingModels}
                                >
                                    <SelectTrigger className="rounded-none">
                                        <SelectValue placeholder={
                                            isLoadingModels
                                                ? t('agents.config.modelLoading', 'Loading models...')
                                                : t('agents.config.modelPlaceholder', 'Select model...')
                                        } />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none max-h-60">
                                        {models.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.name}
                                                {m.isFree && (
                                                    <span className="ml-2 text-xs text-success">
                                                        {t('agents.config.modelFree', '(Free)')}
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.model && (
                                    <p className="text-xs text-destructive">{errors.model}</p>
                                )}
                                {!providerId && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('agents.config.selectProviderFirst', 'Select a provider first')}
                                    </p>
                                )}
                                {isLoadingModels && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        {t('agents.config.modelLoading', 'Loading models...')}
                                    </div>
                                )}
                            </div>

                            {/* API Key Section */}
                            {providerConfig && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Key className="w-4 h-4" />
                                            {t('agents.config.apiKey.label', 'API Key')}
                                            {providerConfig.id !== 'openrouter' && providerConfig.id !== 'openai-compatible' ? (
                                                <span className="text-destructive">*</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    (optional)
                                                </span>
                                            )}
                                        </Label>
                                        {renderConfigStatus()}
                                    </div>

                                    {isCheckingKey ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('agents.config.apiKey.checking', 'Checking...')}
                                        </div>
                                    ) : apiKey !== '' && apiKey !== '••••' ? (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleTestConnection}
                                                disabled={isTestingConnection}
                                                className="rounded-none gap-1"
                                            >
                                                {isTestingConnection ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : connectionStatus === 'success' ? (
                                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                                ) : connectionStatus === 'error' ? (
                                                    <XCircle className="w-3 h-3 text-destructive" />
                                                ) : (
                                                    <RefreshCw className="w-3 h-3" />
                                                )}
                                                {t('agents.config.testConnection', 'Test Connection')}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setApiKey('')}
                                                className="rounded-none text-xs"
                                            >
                                                {t('agents.config.apiKey.change', 'Change Key')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => {
                                                    setApiKey(e.target.value)
                                                    if (errors.apiKey) setErrors(prev => ({ ...prev, apiKey: undefined }))
                                                }}
                                                placeholder={t('agents.config.apiKey.placeholder', 'Enter API key...')}
                                                className="rounded-none flex-1"
                                            />
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={handleSaveApiKey}
                                                disabled={isSavingKey || !apiKey.trim()}
                                                className="rounded-none gap-1"
                                                type="button"
                                            >
                                                {isSavingKey && <Loader2 className="w-3 h-3 animate-spin" />}
                                                {t('agents.config.apiKey.save', 'Save')}
                                            </Button>
                                        </div>
                                    )}

                                    {errors.apiKey && (
                                        <p className="text-xs text-destructive">{errors.apiKey}</p>
                                    )}

                                    {providerId === 'openrouter' && !apiKey && (
                                        <p className="text-xs text-info mt-2">
                                            {t('agents.config.apiKey.openrouterNote', 'Free models work without API key. Add key for premium models.')}
                                        </p>
                                    )}

                                    {providerId === 'openai-compatible' && !apiKey && (
                                        <p className="text-xs text-info mt-2">
                                            {t('agents.config.apiKey.localProviderNote', 'For local providers like LM Studio or Ollama, API key may not be required.')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-4 space-y-4">
                        {/* Advanced Configuration */}
                        <div className="space-y-4">
                            {/* OpenAI Compatible Configuration */}
                            {providerId === 'openai-compatible' && (
                                <div className="border border-border bg-muted/30 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                                        <span className="text-primary">⚙️</span>
                                        <span>{t('agents.config.openaiCompatible.title', 'OpenAI Compatible Provider')}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('agents.config.openaiCompatible.description', 'Connect to any OpenAI-compatible API endpoint')}
                                    </p>

                                    {/* Base URL */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="custom-base-url">
                                            {t('agents.config.openaiCompatible.baseUrl', 'Base URL')} <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="custom-base-url"
                                            value={customBaseURL}
                                            onChange={(e) => {
                                                setCustomBaseURL(e.target.value)
                                                if (errors.customBaseURL) setErrors(prev => ({ ...prev, customBaseURL: undefined }))
                                            }}
                                            placeholder={t('agents.config.openaiCompatible.baseUrlPlaceholder', 'http://localhost:1234/v1')}
                                            className="rounded-none"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('agents.config.openaiCompatible.baseUrlHint', 'The API endpoint URL (e.g., http://localhost:1234/v1 for LM Studio)')}
                                        </p>
                                    </div>

                                    {/* Model ID */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="custom-model-id">
                                            {t('agents.config.openaiCompatible.modelId', 'Model ID')}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="custom-model-id"
                                                value={customModelId}
                                                onChange={(e) => {
                                                    setCustomModelId(e.target.value)
                                                    setModel(e.target.value)
                                                }}
                                                placeholder={t('agents.config.openaiCompatible.modelIdPlaceholder', 'e.g., llama-3.1-8b or gpt-4o')}
                                                className="rounded-none flex-1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isLoadingCustomModels || !customBaseURL.trim()}
                                                onClick={async () => {
                                                    setIsLoadingCustomModels(true)
                                                    try {
                                                        const models = await modelRegistry.getModelsFromCustomEndpoint(
                                                            customBaseURL,
                                                            apiKey,
                                                            customHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {})
                                                        )
                                                        if (models.length > 0) {
                                                            const modelId = models[0].id
                                                            setCustomModelId(modelId)
                                                            toast.success(t('agents.config.openaiCompatible.modelsLoaded', 'Found {{count}} models', { count: models.length }))
                                                        } else {
                                                            toast.info(t('agents.config.openaiCompatible.noModels', 'No models found'))
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to load models:', err)
                                                        toast.error(t('agents.config.openaiCompatible.loadFailed', 'Failed to load models'))
                                                    } finally {
                                                        setIsLoadingCustomModels(false)
                                                    }
                                                }}
                                                title={t('agents.config.openaiCompatible.loadModels', 'Refresh Models')}
                                            >
                                                <RefreshCw className={cn("w-4 h-4", isLoadingCustomModels && "animate-spin")} />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('agents.config.openaiCompatible.modelIdHint', 'Enter specific model ID (e.g., local-model) or click refresh to auto-detect')}
                                        </p>
                                    </div>

                                    {/* Enable Native Tools Toggle */}
                                    <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">
                                                {t('agents.config.openaiCompatible.enableTools', 'Enable Native Tools')}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {t('agents.config.openaiCompatible.enableToolsDescription', 'Allow agent to use function calling (disable if provider returns 400/404)')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={enableNativeTools}
                                            onCheckedChange={setEnableNativeTools}
                                        />
                                    </div>

                                    {/* Custom Headers */}
                                    <details className="group">
                                        <summary className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                            <span className="text-[10px]">▶</span>
                                            <span className="group-open:hidden">{t('agents.config.openaiCompatible.headers', 'Custom Headers')}</span>
                                            <span className="hidden group-open:inline">{t('agents.config.openaiCompatible.headers', 'Custom Headers')}</span>
                                        </summary>
                                        <div className="mt-2 space-y-2">
                                            {customHeaders.map((header, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <Input
                                                        value={header.key}
                                                        onChange={(e) => {
                                                            const newHeaders = [...customHeaders]
                                                            newHeaders[idx].key = e.target.value
                                                            setCustomHeaders(newHeaders)
                                                        }}
                                                        placeholder={t('agents.config.openaiCompatible.headerKey', 'Key')}
                                                        className="rounded-none flex-1 text-xs"
                                                    />
                                                    <Input
                                                        value={header.value}
                                                        onChange={(e) => {
                                                            const newHeaders = [...customHeaders]
                                                            newHeaders[idx].value = e.target.value
                                                            setCustomHeaders(newHeaders)
                                                        }}
                                                        placeholder={t('agents.config.openaiCompatible.headerValue', 'Value')}
                                                        className="rounded-none flex-1 text-xs"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setCustomHeaders(customHeaders.filter((_, i) => i !== idx))}
                                                        className="rounded-none text-xs text-destructive"
                                                    >
                                                        {t('agents.config.openaiCompatible.removeHeader', 'Remove')}
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCustomHeaders([...customHeaders, { key: '', value: '' }])}
                                                className="rounded-none text-xs"
                                            >
                                                + {t('agents.config.openaiCompatible.addHeader', 'Add Header')}
                                            </Button>
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="rounded-none"
                    >
                        {t('agents.config.cancel', 'Cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {agent
                            ? t('agents.config.update', 'Update Agent')
                            : t('agents.config.save', 'Create Agent')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

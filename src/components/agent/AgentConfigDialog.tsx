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

import { useState, useCallback, useMemo, useEffect } from 'react'
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
import { ProviderConfig } from '@/lib/agent/providers/types'

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
    onSubmit: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => void
    agent?: Agent
}

export function AgentConfigDialog({
    open,
    onOpenChange,
    onSubmit,
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
            console.log('[AgentConfigDialog] loadModels called for', provider, 'hasKey:', !!apiKeyVal)

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
            console.log('[AgentConfigDialog] Fetched', fetchedModels.length, 'models from API')
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
            })
            .catch(console.error)
            .finally(() => setIsCheckingKey(false))
    }, [providerId, open, loadModels])

    // Validate form
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {}

        if (!name.trim()) {
            newErrors.name = t('agents.config.validation.nameRequired', 'Agent name is required')
        }
        if (!providerId) {
            newErrors.provider = t('agents.config.validation.providerRequired', 'Please select a provider')
        }

        // Model validation: Skip for openai-compatible as it uses customModelId logic mapped to model
        // But in handleSubmit we map customModelId to model. Here 'model' state might be empty if using custom logic?
        // Actually, for openai-compatible, we set 'model' when customModelId changes in the UI.
        // So checking !model.trim() is generally valid, unless it's strictly optional.
        if (!model.trim()) {
            newErrors.model = t('agents.config.validation.modelRequired', 'Please select a model')
        }

        if (providerId === 'openai-compatible' && !customBaseURL.trim()) {
            newErrors.customBaseURL = t('agents.config.validation.baseUrlRequired', 'Base URL is required')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [name, providerId, model, customBaseURL, providerConfig, t])

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

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return

        setIsSubmitting(true)

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 300))

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
            status: 'offline',
            provider: providerConfig?.name || 'OpenRouter',
            model: providerId === 'openai-compatible' ? customModelId : model,
            description: role.trim() || undefined,
            // OpenAI Compatible Provider support
            customBaseURL: providerId === 'openai-compatible' ? customBaseURL.trim() : undefined,
            customHeaders: providerId === 'openai-compatible' && Object.keys(headersObj).length > 0 ? headersObj : undefined,
            enableNativeTools: providerId === 'openai-compatible' ? enableNativeTools : undefined,
        }

        console.log('[AgentConfigDialog] handleSubmit calling onSubmit with:', agentData)
        onSubmit(agentData)

        // Show success toast
        toast.success(agent
            ? t('agents.config.updateSuccess', "Agent '{{name}}' updated successfully!", { name: name.trim() })
            : t('agents.config.successToast', "Agent '{{name}}' created successfully!", { name: name.trim() })
        )

        // Reset form and close
        setName('')
        setRole('')
        setProviderId('openrouter')
        setModel('')
        setCustomBaseURL('')
        setCustomHeaders([])
        setCustomModelId('')
        setEnableNativeTools(true)
        setErrors({})
        setIsSubmitting(false)
        setConnectionStatus('idle')
        onOpenChange(false)
    }, [name, role, providerConfig?.display, providerId, model, customBaseURL, customHeaders, enableNativeTools, validateForm, onSubmit, onOpenChange, agent, t])

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
                    <DialogDescription className="text-muted-foreground text-sm">
                        {agent
                            ? t('agents.config.editSubtitle', 'Modify your AI agent settings')
                            : t('agents.config.subtitle', 'Configure a new AI agent for your workflow')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                                                variant="pixel-primary"
                                                size="sm"
                                                onClick={handleSaveApiKey}
                                                disabled={isSavingKey || !apiKey.trim()}
                                                className="rounded-none gap-1"
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
                        variant="pixel-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t('agents.config.save', 'Create Agent')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

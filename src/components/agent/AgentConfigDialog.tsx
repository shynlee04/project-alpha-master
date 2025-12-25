/**
 * AgentConfigDialog - Agent Configuration Form Dialog
 * 
 * Allows users to create new AI agents with provider/model selection.
 * NOW WIRED to Epic 25 provider infrastructure:
 * - credentialVault for encrypted API key storage
 * - modelRegistry for dynamic model discovery
 * - providerAdapter for connection testing
 * 
 * @epic Epic-28 Story 28-16 (UI shell)
 * @epic Epic-25 Story 25-6 (Provider wiring)
 * 
 * @integrates Epic-25 Story 25-1 (TanStack AI Integration)
 *   - Provider selection validates API key connectivity ✅
 *   - Model selection queries available models from provider ✅
 * 
 * @persistence
 *   API Keys: IndexedDB via Dexie (encrypted with AES-GCM)
 *   Agent Config: IndexedDB via Dexie (db.agents)
 * 
 * @see _bmad-output/epics/epic-25-ai-foundation-sprint-new-2025-12-21.md
 * @see _bmad-output/sprint-artifacts/25-6-wire-agent-ui-to-providers.md
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, Loader2, Key, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
 * Provider display configuration for UI
 * Maps to PROVIDERS from types.ts
 * OpenRouter is first (default) as it supports free models
 */
const PROVIDER_OPTIONS: { id: string; display: Agent['provider']; isCustom?: boolean }[] = [
    { id: 'openrouter', display: 'OpenRouter' },
    { id: 'openai', display: 'OpenAI' },
    { id: 'openai-compatible', display: 'OpenAI Compatible' as Agent['provider'], isCustom: true },
    { id: 'anthropic', display: 'Anthropic' },
    { id: 'gemini', display: 'Google' },
]

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
    agent
}: AgentConfigDialogProps) {
    const { t } = useTranslation()

    // Form state
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [providerId, setProviderId] = useState<string>('openrouter') // Default to OpenRouter
    const [model, setModel] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // API Key state (Epic 25 wiring)
    const [apiKey, setApiKey] = useState('')
    const [hasStoredKey, setHasStoredKey] = useState(false)
    const [isCheckingKey, setIsCheckingKey] = useState(false)
    const [isSavingKey, setIsSavingKey] = useState(false)
    const [isTestingConnection, setIsTestingConnection] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // OpenAI Compatible custom endpoint state
    const [customBaseURL, setCustomBaseURL] = useState('')
    const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([])
    const [customModelId, setCustomModelId] = useState('')
    const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false)


    // Model loading state
    const [models, setModels] = useState<ModelInfo[]>([])

    // Initialize/Reset form when dialog opens
    useEffect(() => {
        if (open) {
            if (agent) {
                // Edit mode
                setName(agent.name)
                setRole(agent.role)
                const matchingProvider = PROVIDER_OPTIONS.find(p => p.display === agent.provider)
                const pId = matchingProvider?.id || 'openrouter'
                setProviderId(pId)
                setModel(agent.model)

                // Load OpenAI Compatible settings
                if (pId === 'openai-compatible') {
                    setCustomBaseURL(agent.customBaseURL || '')
                    setCustomModelId(agent.model) // For custom provider, model field is the custom model ID

                    if (agent.customHeaders) {
                        setCustomHeaders(Object.entries(agent.customHeaders).map(([key, value]) => ({ key, value })))
                    } else {
                        setCustomHeaders([])
                    }
                } else {
                    setCustomBaseURL('')
                    setCustomModelId('')
                    setCustomHeaders([])
                }
            } else {
                // Create mode - reset defaults
                setName('')
                setRole('')
                setProviderId('openrouter')
                setModel('')

                // Reset custom provider fields
                setCustomBaseURL('')
                setCustomModelId('')
                setCustomHeaders([])
            }
        }
    }, [open, agent])
    const [isLoadingModels, setIsLoadingModels] = useState(false)

    // Validation state
    const [errors, setErrors] = useState<{
        name?: string
        provider?: string
        model?: string
        apiKey?: string
    }>({})

    // Initialize credentialVault on mount
    useEffect(() => {
        credentialVault.initialize().catch(console.error)
    }, [])

    // Check for stored credentials when provider changes
    useEffect(() => {
        if (!open || !providerId) return

        setIsCheckingKey(true)
        setConnectionStatus('idle')

        credentialVault.hasCredentials(providerId)
            .then(async (hasKey) => {
                setHasStoredKey(hasKey)
                setApiKey('') // Don't expose stored key

                // Load models if we have a key
                if (hasKey) {
                    await loadModels(providerId)
                } else {
                    // Load free models for OpenRouter without key
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
    }, [providerId, open])

    // Load models from provider API or fallback
    const loadModels = useCallback(async (provider: string) => {
        setIsLoadingModels(true)
        try {
            const apiKeyVal = await credentialVault.getCredentials(provider)
            const fetchedModels = await modelRegistry.getModels(provider, apiKeyVal ?? undefined)
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

    // Handle API key save
    const handleSaveApiKey = useCallback(async () => {
        if (!apiKey.trim()) {
            setErrors(prev => ({ ...prev, apiKey: t('agents.config.apiKey.required', 'API key is required') }))
            return
        }

        setIsSavingKey(true)
        try {
            await credentialVault.storeCredentials(providerId, apiKey.trim())
            setHasStoredKey(true)
            setApiKey('')
            toast.success(agent
                ? t('agents.config.updateSuccess', "Agent '{{name}}' updated successfully!", { name: name.trim() })
                : t('agents.config.successToast', "Agent '{{name}}' created successfully!", { name: name.trim() })
            )

            // Notify other components (like AgentChatPanel) that credentials changed
            window.dispatchEvent(new CustomEvent('credentials-updated', { detail: { providerId } }))

            // Reload models with new key
            await loadModels(providerId)
        } catch (error) {
            console.error('[AgentConfigDialog] Failed to save API key:', error)
            toast.error(t('agents.config.apiKey.saveFailed', 'Failed to save API key'))
        } finally {
            setIsSavingKey(false)
        }
    }, [apiKey, providerId, loadModels, t])

    // Handle connection test
    const handleTestConnection = useCallback(async () => {
        setIsTestingConnection(true)
        setConnectionStatus('idle')

        try {
            const config = PROVIDERS[providerId]
            if (!config) {
                throw new Error(`Unknown provider: ${providerId}`)
            }

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

    // Get display provider name from ID
    const providerDisplay = useMemo(() => {
        return PROVIDER_OPTIONS.find(p => p.id === providerId)?.display ?? 'OpenRouter'
    }, [providerId])

    // Handle provider change
    const handleProviderChange = useCallback((value: string) => {
        setProviderId(value)
        setModel('') // Reset model selection
        setErrors(prev => ({ ...prev, provider: undefined }))
        setConnectionStatus('idle')
    }, [])

    // Validation function
    const validate = useCallback(() => {
        const newErrors: typeof errors = {}

        if (!name.trim()) {
            newErrors.name = t('agents.config.validation.nameRequired', 'Agent name is required')
        }
        if (!providerId) {
            newErrors.provider = t('agents.config.validation.providerRequired', 'Please select a provider')
        }
        if (!model) {
            newErrors.model = t('agents.config.validation.modelRequired', 'Please select a model')
        }
        // Validate customBaseURL for openai-compatible provider
        if (providerId === 'openai-compatible' && !customBaseURL.trim()) {
            newErrors.provider = t('agents.config.validation.baseUrlRequired', 'Base URL is required for OpenAI Compatible provider')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [name, providerId, model, customBaseURL, t])

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!validate()) return

        setIsSubmitting(true)

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 300))

        // Convert custom headers array to object for storage
        const headersObj = customHeaders.reduce((acc, h) => {
            if (h.key.trim() && h.value.trim()) {
                acc[h.key.trim()] = h.value.trim()
            }
            return acc
        }, {} as Record<string, string>)

        onSubmit({
            name: name.trim(),
            role: role.trim() || 'Assistant',
            status: 'offline',
            provider: providerDisplay,
            model: providerId === 'openai-compatible' && customModelId ? customModelId : model,
            description: role.trim() || undefined,
            // OpenAI Compatible Provider support
            customBaseURL: providerId === 'openai-compatible' ? customBaseURL.trim() : undefined,
            customHeaders: providerId === 'openai-compatible' && Object.keys(headersObj).length > 0 ? headersObj : undefined,
        })

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
        setErrors({})
        setIsSubmitting(false)
        setConnectionStatus('idle')
        onOpenChange(false)
    }, [name, role, providerDisplay, providerId, model, customBaseURL, customHeaders, customModelId, validate, onSubmit, onOpenChange, agent, t])

    // Handle cancel
    const handleCancel = useCallback(() => {
        setName('')
        setRole('')
        setProviderId('openrouter')
        setModel('')
        setApiKey('')
        setErrors({})
        setConnectionStatus('idle')
        onOpenChange(false)
    }, [onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] rounded-none border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-pixel text-lg">
                        <Bot className="w-5 h-5 text-primary" />
                        {agent
                            ? t('agents.config.editTitle', 'Edit Agent Configuration')
                            : t('agents.config.title', 'New Agent Configuration')
                        }
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        {agent
                            ? t('agents.config.editSubtitle', 'Modify your AI agent settings')
                            : t('agents.config.subtitle', 'Configure a new AI agent for your workflow')
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
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
                        <Select value={providerId} onValueChange={handleProviderChange}>
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder={t('agents.config.providerPlaceholder', 'Select provider...')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                {PROVIDER_OPTIONS.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.display}
                                        {p.id === 'openrouter' && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                {t('agents.config.freeModels', '(Free models available)')}
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.provider && (
                            <p className="text-xs text-destructive">{errors.provider}</p>
                        )}
                    </div>

                    {/* OpenAI Compatible Configuration Form */}
                    {providerId === 'openai-compatible' && (
                        <div className="grid gap-3 p-3 border border-border bg-muted/30 rounded-none">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="text-primary">⚙️</span>
                                {t('agents.config.openaiCompatible.title', 'OpenAI Compatible Provider')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('agents.config.openaiCompatible.description', 'Connect to any OpenAI-compatible API endpoint')}
                            </p>

                            {/* Base URL */}
                            <div className="grid gap-1">
                                <Label htmlFor="custom-base-url">
                                    {t('agents.config.openaiCompatible.baseUrl', 'Base URL')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="custom-base-url"
                                    value={customBaseURL}
                                    onChange={(e) => setCustomBaseURL(e.target.value)}
                                    placeholder={t('agents.config.openaiCompatible.baseUrlPlaceholder', 'http://localhost:1234/v1')}
                                    className="rounded-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('agents.config.openaiCompatible.baseUrlHint', 'The API endpoint URL (e.g., http://localhost:1234/v1 for LM Studio)')}
                                </p>
                            </div>

                            {/* Model ID */}
                            <div className="grid gap-1">
                                <Label htmlFor="custom-model-id">
                                    {t('agents.config.openaiCompatible.modelId', 'Model ID')}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="custom-model-id"
                                        value={customModelId}
                                        onChange={(e) => {
                                            setCustomModelId(e.target.value)
                                            setModel(e.target.value) // Sync with main model state
                                        }}
                                        placeholder={t('agents.config.openaiCompatible.modelIdPlaceholder', 'e.g., llama-3.1-8b or gpt-4o')}
                                        className="rounded-none flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            if (!customBaseURL) return
                                            setIsLoadingCustomModels(true)
                                            try {
                                                const fetchedModels = await modelRegistry.getModelsFromCustomEndpoint(
                                                    customBaseURL,
                                                    apiKey || undefined,
                                                    customHeaders.reduce((acc, h) => {
                                                        if (h.key && h.value) acc[h.key] = h.value
                                                        return acc
                                                    }, {} as Record<string, string>)
                                                )
                                                setModels(fetchedModels)
                                                if (fetchedModels.length > 0) {
                                                    toast.success(`Found ${fetchedModels.length} models`)
                                                } else {
                                                    toast.info(t('agents.config.openaiCompatible.fetchModelsFailed', 'Could not fetch models from endpoint'))
                                                }
                                            } catch {
                                                toast.error(t('agents.config.openaiCompatible.fetchModelsFailed', 'Could not fetch models from endpoint'))
                                            } finally {
                                                setIsLoadingCustomModels(false)
                                            }
                                        }}
                                        disabled={!customBaseURL || isLoadingCustomModels}
                                        className="rounded-none gap-1"
                                    >
                                        {isLoadingCustomModels && <Loader2 className="w-3 h-3 animate-spin" />}
                                        {t('agents.config.openaiCompatible.fetchModels', 'Fetch Models')}
                                    </Button>
                                </div>
                            </div>

                            {/* Custom Headers (collapsed by default) */}
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

                    {/* API Key Section */}
                    {providerId && (
                        <div className="grid gap-2 p-3 border border-border bg-muted/30 rounded-none">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    {t('agents.config.apiKey.label', 'API Key')}
                                    {providerId === 'openai-compatible' && (
                                        <span className="text-xs text-muted-foreground">(optional)</span>
                                    )}
                                </Label>
                                {hasStoredKey && (
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {t('agents.config.apiKey.stored', 'Key stored')}
                                    </span>
                                )}
                            </div>

                            {isCheckingKey ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('agents.config.apiKey.checking', 'Checking...')}
                                </div>
                            ) : hasStoredKey ? (
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
                                        onClick={() => setHasStoredKey(false)}
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

                            {providerId === 'openrouter' && !hasStoredKey && (
                                <p className="text-xs text-muted-foreground">
                                    {t('agents.config.apiKey.openrouterNote', 'Free models work without API key. Add key for premium models.')}
                                </p>
                            )}

                            {providerId === 'openai-compatible' && !hasStoredKey && (
                                <p className="text-xs text-muted-foreground">
                                    {t('agents.config.openaiCompatible.localProviderNote', 'For local providers like LM Studio or Ollama, API key may not be required.')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Model Selection */}
                    <div className="grid gap-2">
                        <Label>
                            {t('agents.config.model', 'Model')} <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={model}
                            onValueChange={(value) => {
                                setModel(value)
                                if (errors.model) setErrors(prev => ({ ...prev, model: undefined }))
                            }}
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
                                            <span className="ml-2 text-xs text-green-600">
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
                </div>

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

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
const PROVIDER_OPTIONS: { id: string; display: Agent['provider'] }[] = [
    { id: 'openrouter', display: 'OpenRouter' },
    { id: 'openai', display: 'OpenAI' },
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
                setProviderId(matchingProvider?.id || 'openrouter')
                setModel(agent.model)
            } else {
                // Create mode - reset defaults
                setName('')
                setRole('')
                setProviderId('openrouter')
                setModel('')
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

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [name, providerId, model, t])

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!validate()) return

        setIsSubmitting(true)

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 300))

        onSubmit({
            name: name.trim(),
            role: role.trim() || 'Assistant',
            status: 'offline',
            provider: providerDisplay,
            model,
            description: role.trim() || undefined,
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
        setErrors({})
        setIsSubmitting(false)
        setConnectionStatus('idle')
        onOpenChange(false)
    }, [name, role, providerDisplay, model, validate, onSubmit, onOpenChange, t])

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

                    {/* API Key Section */}
                    {providerId && (
                        <div className="grid gap-2 p-3 border border-border bg-muted/30 rounded-none">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    {t('agents.config.apiKey.label', 'API Key')}
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

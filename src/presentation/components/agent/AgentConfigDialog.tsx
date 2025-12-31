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
import { Bot, Loader2, Key, CheckCircle2, XCircle, RefreshCw, Settings2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/presentation/components/ui/switch'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/presentation/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/presentation/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select'
import { cn } from '@/lib/utils'
import { WorkspaceToolPermissionsConfig } from './WorkspaceToolPermissionsConfig'
import type { WorkspaceType } from '@/lib/state/workspace-types'
import type { Agent, AgentToolBinding } from '@/core/entities/Agent'

// Security utilities for safe logging (RC-028-010)
import { safeDebug, sanitizeForLogging } from '@/lib/utils/security'

// Epic 25 Provider Infrastructure
import {
    credentialVault,
    providerAdapterFactory,
    modelRegistry,
} from '@/lib/agent/providers'

/**
 * Provider configuration interface for extensibility
 */
// Removed local ProviderConfig interface in favor of @/lib/agent/providers type
import { useProviderStore } from '@/lib/state/provider-store'
import { useAgentsStore } from '@/stores/agents-store'

/**
 * Extensible provider configurations
 * Can be easily extended without modifying core dialog logic
 */
// Helper to get icon for provider
const getProviderIcon = (id: string, _name: string) => {
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
    description: z.string().optional(),
    providerId: z.string().min(1, 'agents.config.validation.providerRequired'),
    modelId: z.string().optional(),
    apiKey: z.string().optional(),
    // CC-2025-12-29: Allow empty string OR valid URL, not just valid URL
    customBaseURL: z.string().optional().refine(
        (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
        { message: 'agents.config.validation.invalidUrl' }
    ),
    customModelId: z.string().optional(),
    customHeaders: z.array(
        z.object({
            key: z.string().min(1),
            value: z.string(),
        })
    ).optional(),
    enableNativeTools: z.boolean().optional(),
})

// type AgentFormData = z.infer<typeof agentFormSchema>

/**
 * Form validation errors type
 */
type FormErrors = {
    name?: string
    description?: string
    provider?: string
    modelId?: string
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
type ConfigTab = 'basic' | 'workspace' | 'advanced'

interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (agentId: string) => void
    agentId: string | null  // BF-01 FIX: Read from store instead of prop
}

export function AgentConfigDialog({
    open,
    onOpenChange,
    onSuccess,
    agentId,
}: AgentConfigDialogProps) {
    const { t } = useTranslation()

    // BF-01 FIX: UI-only state (tabs, loading, errors, API key input)
    const [activeTab, setActiveTab] = useState<ConfigTab>('basic')
    const [apiKey, setApiKey] = useState('') // API key is NOT stored in agent config (credential vault only)

    // Advanced settings state (not in agent config yet)
    const [customBaseURL, setCustomBaseURL] = useState('')
    const [customModelId, setCustomModelId] = useState('')
    const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([])
    const [enableNativeTools, setEnableNativeTools] = useState(true)
    const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false)

    // WB-8.3: Workspace bindings state
    const [workspaceBindings, setWorkspaceBindings] = useState<Agent['workspaceBindings']>([
        { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
        { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
        { workspaceType: 'study', isAvailable: true, uiVariant: 'compact', isDefault: false },
        { workspaceType: 'notes', isAvailable: true, uiVariant: 'minimal', isDefault: false },
    ])

    // WB-8.3: Tools array state (for workspace permissions)
    const [tools, setTools] = useState<AgentToolBinding[]>([
        { toolId: 'read_file', toolName: 'Read File', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
        { toolId: 'write_file', toolName: 'Write File', isEnabled: true, workspacePermissions: { ide: true, knowledge: false, study: false, notes: true } },
        { toolId: 'list_files', toolName: 'List Files', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
        { toolId: 'execute_command', toolName: 'Execute Command', isEnabled: true, workspacePermissions: { ide: true, knowledge: false, study: false, notes: false } },
        { toolId: 'synthesize', toolName: 'Synthesize', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
        { toolId: 'process_pdf', toolName: 'Process PDF', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
        { toolId: 'process_image', toolName: 'Process Image', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
        { toolId: 'process_url', toolName: 'Process URL', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
    ])

    // Store actions
    const { addAgent, updateAgent, removeAgent } = useAgentsStore()

    // BF-01 FIX: Read agent from store (single source of truth)
    const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

    // BF-01 FIX: Derived form values from agent (replaces useState)
    // When agent changes, these values update automatically
    const name = agent?.name || ''
    const description = agent?.description || ''
    const providerId = agent?.providerId || 'openrouter'
    const modelId = agent?.modelId || ''
    const temperature = agent?.temperature ?? 0.7
    const maxTokens = agent?.maxTokens ?? 4096
    const topP = agent?.topP ?? 0.95
    const topK = agent?.topK
    const systemPrompt = agent?.systemPrompt || ''

    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCheckingKey, setIsCheckingKey] = useState(false)
    const [isSavingKey, setIsSavingKey] = useState(false)
    const [isTestingConnection, setIsTestingConnection] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')

    // Validation errors
    const [errors, setErrors] = useState<FormErrors>({})

    // CC-2025-12-29: Subscribe to provider store for SINGLE SOURCE OF TRUTH
    const {
        providers,
        availableModels,
        isLoadingModels: storeLoadingModels,
        fetchModels: storeFetchModels
    } = useProviderStore()

    // Get models from the centralized store
    const models = useMemo(() => {
        return availableModels[providerId] || []
    }, [availableModels, providerId])

    const isLoadingModels = storeLoadingModels[providerId] || false

    // Get selected provider config
    const providerConfig = useMemo(() => {
        return providers.find(p => p.id === providerId)
    }, [providerId, providers])

    // Initialize credentialVault on mount
    useEffect(() => {
        credentialVault.initialize().catch(console.error)
    }, [])

    // NOTE: loadModels is now replaced by storeFetchModels from useProviderStore
    // This ensures single source of truth for models across the entire app

    // CC-2025-12-29: Check credentials and load models from STORE (single source of truth)
    useEffect(() => {
        if (!open || !providerId) return

        setIsCheckingKey(true)
        setConnectionStatus('idle')

        const loadProviderData = async () => {
            try {
                await credentialVault.initialize()
                const apiKeyValue = await credentialVault.getCredentials(providerId)

                console.log('[AgentConfigDialog] Provider:', providerId, 'hasKey:', !!apiKeyValue)
                setApiKey(apiKeyValue ? '••••' : '')

                // Fetch models using the STORE (single source of truth)
                // This populates availableModels[providerId] which is subscribed via useMemo
                await storeFetchModels(providerId)
                console.log('[AgentConfigDialog] Models fetched via store, count:', models.length)

                // BF-01 FIX: modelId now comes from store (derived value), no restoration needed
            } catch (error) {
                console.error('[AgentConfigDialog] Error loading provider data:', error)
                setApiKey('')
            } finally {
                setIsCheckingKey(false)
            }
        }

        loadProviderData()
    }, [providerId, open, storeFetchModels])

    // WB-8.3: Load workspace bindings and tools from agent when editing
    useEffect(() => {
        if (!agent) return

        // Load workspace bindings
        if (agent.workspaceBindings && agent.workspaceBindings.length > 0) {
            setWorkspaceBindings(agent.workspaceBindings)
        }

        // Load tools with workspace permissions
        if (agent.tools && agent.tools.length > 0) {
            setTools(agent.tools)
        }
    }, [agent])

    // Validate form using Zod
    const validateForm = useCallback((): boolean => {
        const formData = {
            name,
            description,
            providerId,
            modelId,
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

        // Additional manual check for modelId strictly if not custom
        if (providerId !== 'openai-compatible' && !modelId.trim()) {
            setErrors(prev => ({ ...prev, modelId: t('agents.config.validation.modelRequired') }))
            return false
        }

        // OpenAI compatible checks
        if (providerId === 'openai-compatible') {
            if (!customBaseURL.trim()) {
                setErrors(prev => ({ ...prev, customBaseURL: t('agents.config.validation.baseUrlRequired') }))
                return false
            }
            if (!customModelId.trim()) {
                // If user didn't select or type a modelId ID, maybe warn? Schema says optional but logic might need it.
                // For now, if customModelId is empty, we fall back to 'modelId' state which tracks it.
            }
        }

        setErrors({})
        return true
    }, [name, description, providerId, modelId, apiKey, customBaseURL, customModelId, customHeaders, enableNativeTools, t])

    // Handle API key save
    const handleSaveApiKey = useCallback(async () => {
        // CC-2025-12-29: Don't try to save masked value - only save real new keys
        if (!apiKey.trim() || apiKey === '••••') {
            if (apiKey === '••••') {
                toast.info(t('agents.config.apiKey.alreadySaved', 'API key is already saved'))
                return
            }
            setErrors(prev => ({ ...prev, apiKey: t('agents.config.apiKey.required', 'API key is required') }))
            return
        }

        setIsSavingKey(true)
        const keyToSave = apiKey.trim()
        try {
            console.log('[AgentConfigDialog] Saving API key for provider:', providerId)
            await credentialVault.storeCredentials(providerId, keyToSave)
            setApiKey('••••')
            toast.success(t('agents.config.apiKey.saveSuccess', 'API key saved successfully'))

            // CC-2025-12-29: Reload models using the STORE (single source of truth)
            await storeFetchModels(providerId)
        } catch (error) {
            console.error('[AgentConfigDialog] Failed to save API key:', error)
            toast.error(t('agents.config.apiKey.saveFailed', 'Failed to save API key'))
            setErrors(prev => ({ ...prev, apiKey: t('agents.config.apiKey.saveFailed', 'Failed to save API key') }))
        } finally {
            setIsSavingKey(false)
        }
    }, [apiKey, providerId, storeFetchModels, t])

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
        // BF-01 FIX: Immediate store update (hot-reload)
        if (agentId) {
            updateAgent(agentId, {
                providerId: value,
                modelId: '' // Reset model when provider changes
            })
        }
        setErrors(prev => ({ ...prev, provider: undefined, modelId: undefined }))
        setConnectionStatus('idle')
    }, [agentId, updateAgent])

    // Handle modelId change
    const handleModelChange = useCallback((value: string) => {
        // BF-01 FIX: Immediate store update (hot-reload)
        if (agentId) {
            updateAgent(agentId, { modelId: value })
        }
        if (errors.modelId) setErrors(prev => ({ ...prev, modelId: undefined }))
    }, [agentId, updateAgent, errors.modelId])

    // WB-8.3: Handle workspace permission change
    const handlePermissionChange = useCallback((toolId: string, workspaceType: WorkspaceType, isEnabled: boolean) => {
        setTools(prevTools =>
            prevTools.map(tool =>
                tool.toolId === toolId
                    ? {
                        ...tool,
                        workspacePermissions: {
                            ...tool.workspacePermissions,
                            [workspaceType]: isEnabled,
                        },
                    }
                    : tool
            )
        )
    }, [])

    // WB-8.3: Handle workspace binding change
    const handleWorkspaceBindingChange = useCallback((workspaceType: WorkspaceType, updates: Partial<Agent['workspaceBindings'][number]>) => {
        setWorkspaceBindings(prev =>
            prev.map(binding =>
                binding.workspaceType === workspaceType
                    ? { ...binding, ...updates }
                    : binding
            )
        )
    }, [])

    // Handle cancel
    // BF-01 FIX: With hot-reload, cancel just closes dialog (changes already saved)
    const handleCancel = useCallback(() => {
        setErrors({})
        setConnectionStatus('idle')
        onOpenChange(false)
    }, [onOpenChange])

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return

        // ============================================================================
        // STORY AC-02: Agent Configuration Vault - P0 VALIDATION
        // Acceptance Criterion: "Validation: model must belong to provider"
        // UI layer validation for better UX (early error detection)
        // ============================================================================
        const effectiveModelId = providerId === 'openai-compatible' ? customModelId : modelId;

        // Get available models from provider store
        const availableModels = useProviderStore.getState().availableModels;
        const providerModels = availableModels[providerId] || [];

        // Validate: modelId must exist in provider's available models
        const modelExists = providerModels.some(m => m.id === effectiveModelId);

        if (!modelExists) {
            toast.error(
                t('agents.config.validation.modelNotAvailable', `Model "${effectiveModelId}" is not available for provider "${providerId}"`)
            );
            return;
        }

        setIsSubmitting(true)

        try {
            // Auto-save API Key if pending (UX fix)
            if (apiKey.trim() && apiKey !== '••••') {
                safeDebug('[AgentConfigDialog] Auto-saving pending API key...')
                await credentialVault.storeCredentials(providerId, apiKey.trim())
            }

            // Prepare agent data following Sprint Change Proposal v2.0 Agent entity
            // NOTE: customBaseURL, customHeaders, enableNativeTools are NOT part of Agent entity
            // They are provider-level configuration, NOT agent-level
            const agentData = {
                name: name.trim(),
                description: description.trim(),
                providerId: providerId,
                modelId: providerId === 'openai-compatible' ? customModelId : modelId,
                // LLM Parameters (required per Sprint Change Proposal v2.0)
                temperature,
                maxTokens,
                topP,
                topK: topK !== undefined ? topK : undefined,
                systemPrompt: systemPrompt.trim() || 'You are a helpful AI assistant.',
                // WB-8.3: Tools with workspace permissions (from state)
                tools,
                // WB-8.3: Workspace bindings (from state)
                workspaceBindings,
                // Status (auto-generated fields)
                status: 'offline' as const,
            }

            safeDebug('[AgentConfigDialog] Saving agent:', sanitizeForLogging(agentData))

            let savedAgentId: string | undefined;

            if (agentId) {
                // BF-01 FIX: Update existing (data already in store via hot-reload)
                updateAgent(agentId, agentData)
                savedAgentId = agentId
                toast.success(t('agents.config.updateSuccess', "Agent '{{name}}' updated successfully!", { name: agentData.name }))
            } else {
                // Add new
                const newAgent = addAgent(agentData)
                savedAgentId = newAgent.id
                toast.success(t('agents.config.successToast', "Agent '{{name}}' created successfully!", { name: agentData.name }))
            }

            // Trigger success callback with agentId
            if (onSuccess && savedAgentId) {
                onSuccess(savedAgentId)
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

    }, [name, description, providerId, modelId, customBaseURL, customHeaders, enableNativeTools, temperature, maxTokens, topP, topK, systemPrompt, validateForm, addAgent, updateAgent, onSuccess, onOpenChange, agentId, t, handleCancel, customModelId, tools, workspaceBindings])



    // Render configuration status indicator
    const renderConfigStatus = () => {
        if (!providerConfig) return null

        // CC-2025-12-29: '••••' means key IS stored, not that it's missing
        const hasApiKey = apiKey === '••••' || (apiKey !== '' && apiKey.length > 0)

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
                        <TabsTrigger value="workspace" className="font-pixel">
                            {t('agents.config.tabs.workspace', 'Workspace')}
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
                                        // BF-01 FIX: Immediate store update (hot-reload)
                                        if (agentId) updateAgent(agentId, { name: e.target.value })
                                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                                    }}
                                    placeholder={t('agents.config.namePlaceholder', 'Enter agent name...')}
                                    className="rounded-none"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="agent-description">
                                    {t('agents.config.description', 'Description')}
                                </Label>
                                <Input
                                    id="agent-description"
                                    value={description}
                                    onChange={(e) => {
                                        // BF-01 FIX: Immediate store update (hot-reload)
                                        if (agentId) updateAgent(agentId, { description: e.target.value })
                                    }}
                                    placeholder={t('agents.config.descriptionPlaceholder', 'e.g., Frontend Developer')}
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
                                <div className="flex items-center justify-between">
                                    <Label>
                                        {t('agents.config.model', 'Model')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        iconOnly
                                        className="h-6 w-6"
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            try {
                                                await storeFetchModels(providerId)
                                                toast.success(t('agents.config.modelsRefreshed', 'Models refreshed'))
                                            } catch (err: any) {
                                                toast.error(t('agents.config.fetchFailed', 'Failed to fetch models: {{error}}', {
                                                    error: err.message || 'Unknown error'
                                                }))
                                            }
                                        }}
                                        disabled={isLoadingModels}
                                        title={t('agents.config.refreshModels', 'Refresh models')}
                                    >
                                        <RefreshCw className={cn("w-3 h-3", isLoadingModels && "animate-spin")} />
                                        <span className="sr-only">Refresh</span>
                                    </Button>
                                </div>
                                <Select
                                    value={modelId}
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
                                        {models.length === 0 ? (
                                            <SelectItem value="none" disabled>
                                                {t('agents.config.noModels', 'No models found')}
                                            </SelectItem>
                                        ) : (
                                            models.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.name}
                                                    {m.isFree && (
                                                        <span className="ml-2 text-xs text-success">
                                                            {t('agents.config.modelFree', '(Free)')}
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.modelId && (
                                    <p className="text-xs text-destructive">{errors.modelId}</p>
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
                                                disabled={isSavingKey || !apiKey.trim() || apiKey === '••••'}
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

                    <TabsContent value="workspace" className="mt-4 space-y-4">
                        {/* WB-8.3: Workspace Configuration */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="text-primary">🌐</span>
                                    {t('agents.config.workspace.title', 'Workspace Permissions')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('agents.config.workspace.description', 'Configure where this agent can be used and what tools it can access in each workspace.')}
                                </p>
                            </div>

                            {/* Workspace Bindings */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    {t('agents.config.workspace.availability', 'Agent Availability by Workspace')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {t('agents.config.workspace.availabilityHint', 'Select which workspaces this agent can be used in.')}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {(['ide', 'knowledge', 'study', 'notes'] as WorkspaceType[]).map((workspace) => {
                                        const binding = workspaceBindings.find(b => b.workspaceType === workspace)
                                        const workspaceLabels: Record<WorkspaceType, string> = {
                                            ide: '💻 IDE',
                                            knowledge: '📚 Knowledge',
                                            study: '🎓 Study',
                                            notes: '📝 Notes',
                                        }

                                        return (
                                            <div
                                                key={workspace}
                                                className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{workspaceLabels[workspace]}</span>
                                                    {binding?.isDefault && (
                                                        <span className="text-xs text-primary">
                                                            ({t('agents.config.workspace.default', 'default')})
                                                        </span>
                                                    )}
                                                </div>
                                                <Switch
                                                    checked={binding?.isAvailable ?? false}
                                                    onCheckedChange={(checked) =>
                                                        handleWorkspaceBindingChange(workspace, { isAvailable: checked })
                                                    }
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Tool Permissions Grid */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    {t('agents.config.workspace.toolPermissions', 'Tool Access by Workspace')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {t('agents.config.workspace.toolPermissionsHint', 'Configure which tools this agent can use in each workspace.')}
                                </p>

                                <WorkspaceToolPermissionsConfig
                                    agent={{
                                        id: agent?.id || '',
                                        name,
                                        description,
                                        providerId,
                                        modelId,
                                        temperature,
                                        maxTokens,
                                        topP,
                                        topK,
                                        systemPrompt,
                                        tools,
                                        workspaceBindings,
                                        status: 'offline',
                                        tasksCompleted: 0,
                                        successRate: 0,
                                        tokensUsed: 0,
                                        lastActive: new Date().toISOString(),
                                        createdAt: agent?.createdAt || new Date().toISOString(),
                                    }}
                                    onPermissionsChange={handlePermissionChange}
                                />
                            </div>

                            {/* Info Box */}
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
                                <p className="text-xs font-medium text-primary">
                                    {t('agents.config.workspace.note', 'Note')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('agents.config.workspace.noteText', 'Workspace permissions help control tool access based on the current workspace. An agent can only use tools that are enabled for the current workspace.')}
                                </p>
                            </div>
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
                                                    // BF-01 FIX: Update modelId in store (hot-reload)
                                                    if (agentId) updateAgent(agentId, { modelId: e.target.value })
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
                                                            // BF-01 FIX: Update modelId in store (hot-reload)
                                                            if (agentId) updateAgent(agentId, { modelId })
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

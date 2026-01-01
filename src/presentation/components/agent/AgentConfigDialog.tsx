/**
 * AgentConfigDialog - Orchestrator for Agent Configuration
 *
 * Refactored in Ralph Loop Cycle 9 (P1-1g) to use extracted components:
 * - AgentBasicConfig: Name, description, provider, model selection
 * - ApiKeyInputSection: API key input with connection testing
 * - AgentImportExport: JSON export/import functionality
 * - useAgentFormValidation: Form validation hook
 * - useUnsavedChangesWarning: Unsaved changes warning hook
 *
 * @responsibility Dialog orchestration and advanced configuration
 * @size ~300 lines (down from 1,256 lines in original)
 *
 * @epic P0.5 - Redesign Agent Configuration Flow
 * @story P1-1g - Refactor to Orchestrator Pattern
 */

import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/presentation/components/ui/button'
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

// P1-1: Import extracted components
import {
    AgentBasicConfig,
    ApiKeyInputSection,
    AgentImportExport,
    useAgentFormValidation,
} from '@/presentation/components/agent'

// P0 Fix: Import unsaved changes warning
import {
    useUnsavedChangesWarning,
    UnsavedChangesDialog,
} from '@/presentation/components/common'

// Advanced configuration components (kept as-is)
import { WorkspaceToolPermissionsConfig } from './WorkspaceToolPermissionsConfig'
import { ToolTrustLevelManager } from './ToolTrustLevelManager'
import type { Agent, AgentToolBinding } from '@/core/entities/Agent'

// Security utilities for safe logging (RC-028-010)
import { safeDebug, sanitizeForLogging } from '@/lib/utils/security'

// Epic 25 Provider Infrastructure
import {
    credentialVault,
} from '@/lib/agent/providers'

// Store imports
import { useAgentsStore } from '@/stores/agents-store'

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

    // Store actions
    const { addAgent, updateAgent, removeAgent } = useAgentsStore()

    // BF-01 FIX: Read agent from store (single source of truth)
    const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

    // BF-01 FIX: Derived form values from agent (replaces useState)
    const name = agent?.name || ''
    const description = agent?.description || ''
    const providerId = agent?.providerId || 'openrouter'
    const modelId = agent?.modelId || ''
    const temperature = agent?.temperature ?? 0.7
    const maxTokens = agent?.maxTokens ?? 4096
    const topP = agent?.topP ?? 0.95
    const topK = agent?.topK
    const systemPrompt = agent?.systemPrompt || ''

    // Advanced settings state (not in agent config yet)
    const [customBaseURL, setCustomBaseURL] = useState('')
    const [customModelId, setCustomModelId] = useState('')
    const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([])
    const [enableNativeTools, setEnableNativeTools] = useState(true)

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

    // UI state
    const [activeTab, setActiveTab] = useState<ConfigTab>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // P1-1: Use extracted validation hook
    const { errors, isValid, validate } = useAgentFormValidation({
        name,
        description,
        providerId,
        modelId,
        apiKey: '', // API key managed by ApiKeyInputSection component
        customBaseURL,
        customModelId,
        customHeaders,
        enableNativeTools,
        temperature,
        maxTokens,
        topP,
        topK,
        systemPrompt,
    })

    // P0 Fix: Use unsaved changes warning
    const hasUnsavedChanges = !isValid
    const { confirmNavigation } = useUnsavedChangesWarning({
        hasUnsavedChanges,
        message: t('agents.config.unsavedChanges', 'You have unsaved changes. Are you sure you want to close?'),
    })

    // Unsaved changes dialog state
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    // Initialize credentialVault on mount
    useEffect(() => {
        credentialVault.initialize().catch(console.error)
    }, [])

    /**
     * Handle field updates with immediate hot-reload
     */
    const handleUpdateField = useCallback((field: string, value: any) => {
        // BF-01 FIX: Immediate store update (hot-reload)
        if (agentId) {
            switch (field) {
                case 'name':
                    updateAgent(agentId, { [field]: value })
                    break
                case 'description':
                    updateAgent(agentId, { [field]: value })
                    break
                case 'providerId':
                    updateAgent(agentId, { [field]: value, modelId: '' })
                    break
                case 'modelId':
                    updateAgent(agentId, { [field]: value })
                    break
            }
        }
    }, [agentId, updateAgent])

    /**
     * Handle dialog close with unsaved changes check
     */
    const handleRequestClose = useCallback((shouldOpen: boolean) => {
        if (!shouldOpen && hasUnsavedChanges) {
            setShowUnsavedDialog(true)
        } else {
            onOpenChange(shouldOpen)
        }
    }, [hasUnsavedChanges, onOpenChange])

    /**
     * Form submission
     */
    const handleSubmit = useCallback(async () => {
        if (!validate()) return

        setIsSubmitting(true)

        try {
            // Prepare agent data following Sprint Change Proposal v2.0 Agent entity
            const effectiveModelId = providerId === 'openai-compatible' ? customModelId : modelId

            const agentData = {
                name: name.trim(),
                description: description.trim(),
                providerId: providerId,
                modelId: effectiveModelId,
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

            let savedAgentId: string | undefined

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

        } catch (error) {
            console.error('[AgentConfigDialog] Save failed:', error)
            toast.error(t('agents.config.error.save', 'Failed to save agent'))
        } finally {
            setIsSubmitting(false)
        }
    }, [name, description, providerId, modelId, customModelId, temperature, maxTokens, topP, topK, systemPrompt, validate, addAgent, updateAgent, onSuccess, onOpenChange, agentId, t, tools, workspaceBindings])

    /**
     * Handle agent delete
     */
    const handleDelete = useCallback(async () => {
        if (!agentId) return

        const agentToDelete = agent
        if (!agentToDelete) return

        // Store copy for undo
        const { id, ...restoreData } = agentToDelete

        // Delete from store
        removeAgent(id)

        // Close dialog
        onOpenChange(false)

        // Show undo toast
        toast.success(t('agents.config.deleted', 'Agent deleted'), {
            action: {
                label: t('actions.undo', 'Undo'),
                onClick: () => {
                    addAgent(restoreData)
                    toast.success(t('agents.config.restored', 'Agent restored'))
                }
            },
            duration: 5000,
        })
    }, [agentId, agent, removeAgent, onOpenChange, addAgent, t])

    /**
     * Handle import/export success callbacks
     */
    const handleImportSuccess = useCallback((count: number) => {
        toast.success(t('agents.config.importSuccess', 'Imported {{count}} agents', { count }))
    }, [t])

    const handleExportSuccess = useCallback(() => {
        toast.success(t('agents.config.exportSuccess', 'Agents exported'))
    }, [t])

    return (
        <>
            <Dialog open={open} onOpenChange={handleRequestClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="font-pixel">
                                {agentId
                                    ? t('agents.config.editAgent', 'Edit Agent')
                                    : t('agents.config.newAgent', 'New Agent')
                                }
                            </DialogTitle>

                            <div className="flex items-center gap-2">
                                {agentId && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        {t('actions.delete', 'Delete')}
                                    </Button>
                                )}

                                {/* P1-1: Use AgentImportExport component */}
                                <AgentImportExport
                                    onImportSuccess={handleImportSuccess}
                                    onExportSuccess={handleExportSuccess}
                                />
                            </div>
                        </div>
                        <DialogDescription>
                            {t('agents.config.description', 'Configure your AI agent settings')}
                        </DialogDescription>
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
                            {/* P1-1: Use AgentBasicConfig component */}
                            <AgentBasicConfig
                                name={name}
                                description={description}
                                providerId={providerId}
                                modelId={modelId}
                                agentId={agentId}
                                errors={errors}
                                onUpdateField={handleUpdateField}
                            />

                            {/* P1-1: Use ApiKeyInputSection component */}
                            <ApiKeyInputSection
                                providerId={providerId}
                                onUpdateField={handleUpdateField}
                                errors={errors}
                            />
                        </TabsContent>

                        <TabsContent value="workspace" className="mt-4 space-y-4">
                            <WorkspaceToolPermissionsConfig
                                workspaceBindings={workspaceBindings}
                                onWorkspaceBindingsChange={setWorkspaceBindings}
                                tools={tools}
                                onToolsChange={setTools}
                            />
                        </TabsContent>

                        <TabsContent value="advanced" className="mt-4 space-y-4">
                            <ToolTrustLevelManager
                                tools={tools}
                                onToolsChange={setTools}
                            />

                            <div className="space-y-4">
                                <Label>{t('agents.config.advancedSettings', 'Advanced Settings')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('agents.config.advancedSettingsDescription', 'Additional configuration options')}
                                </p>
                                {/* TODO: Add advanced settings UI here */}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => handleRequestClose(false)}
                            disabled={isSubmitting}
                            className="rounded-none font-pixel"
                        >
                            {t('actions.cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !isValid}
                            className="rounded-none font-pixel"
                        >
                            {isSubmitting
                                ? t('actions.saving', 'Saving...')
                                : agentId
                                    ? t('actions.save', 'Save')
                                    : t('actions.create', 'Create')
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* P0 Fix: Unsaved changes dialog */}
            <UnsavedChangesDialog
                open={showUnsavedDialog}
                onStay={() => setShowUnsavedDialog(false)}
                onLeave={() => {
                    setShowUnsavedDialog(false)
                    onOpenChange(false)
                }}
                message={t('agents.config.unsavedChangesMessage', 'You have unsaved changes. Are you sure you want to close?')}
            />
        </>
    )
}

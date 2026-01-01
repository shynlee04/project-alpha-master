/**
 * AgentConfigDialog - Orchestrator for Agent Configuration
 *
 * Refactored in Ralph Loop Cycle 9 (P1-1g) to use extracted components:
 * - AgentImportExport: JSON export/import functionality
 * - useAgentFormValidation: Form validation hook
 * - useUnsavedChangesWarning: Unsaved changes warning hook
 *
 * Ralph Loop Cycle 17 (Current): Replaced AgentBasicConfig (302 lines) with split components:
 * - AgentBasicInfoTab: Name and description (67 lines)
 * - AgentProviderSelector: Provider dropdown (78 lines)
 * - AgentModelSelector: Model selection with refresh (100 lines)
 *
 * @responsibility Dialog orchestration and advanced configuration
 * @size 496 lines (target: <120 lines after hook extraction)
 *
 * @epic P0.5 - Redesign Agent Configuration Flow
 * @story P1-1g - Refactor to Orchestrator Pattern
 * @story Cycle 17 - Phase 1: Replace AgentBasicConfig
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
// Ralph Loop Cycle 17: Replace AgentBasicConfig with split components
// Ralph Loop Cycle 17 Phase 5: Import extracted hooks
import { AgentImportExport } from './AgentImportExport'
import { AgentBasicInfoTab } from './AgentConfigForm/AgentBasicInfoTab'
import { AgentProviderSelector } from './AgentConfigForm/AgentProviderSelector'
import { AgentModelSelector } from './AgentConfigForm/AgentModelSelector'
import { AgentAdvancedSettingsTab } from './AgentConfigForm/AgentAdvancedSettingsTab'
import { useAgentFormState } from './hooks/useAgentFormState'
import { useAgentFormSubmission } from './hooks/useAgentFormSubmission'
import { useAgentFormActions } from './hooks/useAgentFormActions'
import { useAgentFormValidation } from './hooks/useAgentFormValidation'

// P0 Fix: Import unsaved changes warning
import {
    useUnsavedChangesWarning,
    UnsavedChangesDialog,
} from '@/presentation/components/common'

// Advanced configuration components (kept as-is)
import { WorkspaceToolPermissionsConfig } from './WorkspaceToolPermissionsConfig'
import { ToolTrustLevelManager } from './ToolTrustLevelManager'
import type { AgentToolBinding } from '@/core/entities/Agent'

// Security utilities for safe logging (RC-028-010)
import { safeDebug, sanitizeForLogging } from '@/lib/utils/security'

// Epic 25 Provider Infrastructure
import {
    credentialVault,
} from '@/lib/agent/providers'

// Store imports
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents'

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

    // Store actions (use individual selectors to avoid infinite loops)
    const removeAgent = useAgentsStore(s => s.removeAgent)

    // Read agent from store for editing mode
    const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

    // Ralph Loop Cycle 17 Phase 5: Use extracted form state hook
    // Updated to match actual hook signature (flat return)
    const {
        // Form state
        name, setName,
        description, setDescription,
        providerId, setProviderId,
        modelId, setModelId,
        customBaseURL, setCustomBaseURL,
        customModelId, setCustomModelId,
        customHeaders, setCustomHeaders,
        enableNativeTools, setEnableNativeTools,
        temperature, setTemperature,
        maxTokens, setMaxTokens,
        topP, setTopP,
        topK, setTopK,
        systemPrompt, setSystemPrompt,
        tools, setTools,
        workspaceBindings, setWorkspaceBindings,
        // Provider data (from hook - no duplicate subscription)
        providers,
        models,
        isLoadingModels,
        fetchModels,
    } = useAgentFormState(agentId)

    // ✅ FIXED: Provider data comes from hook (no duplicate subscription)
    // The hook already returns computed models and isLoadingModels for the current provider
    // No need to recompute - prevents infinite re-render loops

    // UI state
    const [activeTab, setActiveTab] = useState<ConfigTab>('basic')

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
    useUnsavedChangesWarning({
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
     * Handle dialog close with unsaved changes check
     */
    const handleRequestClose = useCallback((shouldOpen: boolean) => {
        if (!shouldOpen && hasUnsavedChanges) {
            setShowUnsavedDialog(true)
        } else {
            onOpenChange(shouldOpen)
        }
    }, [hasUnsavedChanges, onOpenChange])

    // Ralph Loop Cycle 17 Phase 5: Use extracted submission hook
    const { isSubmitting, handleSubmit } = useAgentFormSubmission({
        agentId,
        onSuccess,
        onOpenChange,
        validate,
        formData: {
            name,
            description,
            providerId,
            modelId,
            customModelId,
            temperature,
            maxTokens,
            topP,
            topK,
            systemPrompt,
            tools,
            workspaceBindings,
        },
    })

    // Ralph Loop Cycle 17 Phase 5: Use extracted actions hook
    const { handleDelete, handleImportSuccess, handleExportSuccess } = useAgentFormActions({
        agentId,
        onOpenChange,
    })

    // Helper for field updates (adapter to unify setters)
    const handleUpdateField = useCallback((field: string, value: any) => {
        switch (field) {
            case 'name': setName(value); break
            case 'description': setDescription(value); break
            case 'providerId':
                setProviderId(value)
                setModelId('') // Reset model when provider changes
                break
            case 'modelId': setModelId(value); break
            case 'customBaseURL': setCustomBaseURL(value); break
            case 'customModelId': setCustomModelId(value); break
            case 'customHeaders': setCustomHeaders(value); break
            case 'enableNativeTools': setEnableNativeTools(value); break
            // Add other fields as needed
        }
    }, [setName, setDescription, setProviderId, setModelId, setCustomBaseURL, setCustomModelId, setCustomHeaders, setEnableNativeTools])

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
                            {/* Ralph Loop Cycle 17: Use split components from AgentConfigForm */}
                            <div className="space-y-4">
                                {/* Agent Name and Description */}
                                <AgentBasicInfoTab
                                    name={name}
                                    role={description} // Map: description -> role prop
                                    onNameChange={(value) => handleUpdateField('name', value)}
                                    onRoleChange={(value) => handleUpdateField('description', value)}
                                    errors={errors}
                                />

                                {/* Provider Selection */}
                                <AgentProviderSelector
                                    providers={providers}
                                    selectedProviderId={providerId}
                                    onProviderChange={(value) => handleUpdateField('providerId', value)}
                                    error={errors.provider}
                                />

                                {/* Model Selection */}
                                <AgentModelSelector
                                    models={models}
                                    selectedModel={modelId}
                                    onModelChange={(value) => handleUpdateField('modelId', value)}
                                    onRefresh={async () => {
                                        try {
                                            await fetchModels(providerId)
                                            toast.success(t('agents.config.modelsRefreshed', 'Models refreshed'))
                                        } catch (err: any) {
                                            toast.error(
                                                t('agents.config.fetchFailed', 'Failed to fetch models: {{error}}', {
                                                    error: err.message || 'Unknown error',
                                                })
                                            )
                                        }
                                    }}
                                    isLoading={isLoadingModels}
                                    disabled={!providerId}
                                    error={errors.modelId}
                                />
                            </div>

                            {/* API Key Section - Placeholder until proper hook integration */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {t('agents.config.apiKeyNote', 'API keys are managed in Provider Settings')}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="workspace" className="mt-4 space-y-4">
                            {agent ? (
                                <WorkspaceToolPermissionsConfig
                                    agent={agent}
                                    onPermissionsChange={(toolId, workspaceType, isEnabled) => {
                                        // Update tools state with new permission
                                        setTools((prev: AgentToolBinding[]) => prev.map((t: AgentToolBinding) =>
                                            t.toolId === toolId
                                                ? { ...t, workspacePermissions: { ...t.workspacePermissions, [workspaceType]: isEnabled } }
                                                : t
                                        ))
                                    }}
                                />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>{t('agents.config.saveFirstForWorkspace', 'Save the agent first to configure workspace permissions')}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="advanced" className="mt-4 space-y-4">
                            <AgentAdvancedSettingsTab
                                providerId={providerId}
                                customBaseURL={customBaseURL}
                                customModelId={customModelId}
                                customHeaders={customHeaders}
                                enableNativeTools={enableNativeTools}
                                onCustomBaseURLChange={(val) => handleUpdateField('customBaseURL', val)}
                                onCustomModelIdChange={(val) => handleUpdateField('customModelId', val)}
                                onCustomHeadersChange={(val) => handleUpdateField('customHeaders', val)}
                                onEnableNativeToolsChange={(val) => handleUpdateField('enableNativeTools', val)}
                                onModelChange={(val) => handleUpdateField('modelId', val)}
                                errors={errors}
                            />

                            <div className="space-y-4 border-t pt-4">
                                <Label>{t('agents.config.trustSettings', 'Tool Trust Settings')}</Label>
                                <ToolTrustLevelManager />
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

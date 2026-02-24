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
import { Tabs, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs'
import {
    Dialog,
    DialogContent,
} from '@/presentation/components/ui/dialog'

// P1-1: Import extracted components
// Ralph Loop Cycle 17: Replace AgentBasicConfig with split components
// Ralph Loop Cycle 17 Phase 5: Import extracted hooks
// Iteration 15 Phase 4: Import header, footer, and tab content components
import { AgentConfigDialogHeader } from './AgentConfigDialogHeader'
import { AgentConfigDialogFooter } from './AgentConfigDialogFooter'
import { BasicTabContent, WorkspaceTabContent, AdvancedTabContent } from './AgentConfigTabContents'
import { useAgentFormState } from './hooks/useAgentFormState'
import { useAgentFormSubmission } from './hooks/useAgentFormSubmission'
import { useAgentFormActions } from './hooks/useAgentFormActions'
import { useAgentFormValidation } from './hooks/useAgentFormValidation'
import { useAgentFieldUpdate } from './hooks/useAgentFieldUpdate'

// P0 Fix: Import unsaved changes warning
import {
    useUnsavedChangesWarning,
    UnsavedChangesDialog,
} from '@/presentation/components/common'

// Advanced configuration components (moved to AgentConfigTabContents)

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
        temperature,
        maxTokens,
        topP,
        topK,
        systemPrompt,
        tools, setTools,
        workspaceBindings,
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

    // Iteration 15 Phase 4: Use extracted field update hook
    const handleUpdateFieldBase = useAgentFieldUpdate({
        setName,
        setDescription,
        setProviderId,
        setModelId,
        setCustomBaseURL,
        setCustomModelId,
        setCustomHeaders: (value: string) => setCustomHeaders(JSON.parse(value)),
        setEnableNativeTools,
    })

    // Wrapper for providerId to handle model reset
    const handleUpdateField = useCallback((field: string, value: any) => {
        if (field === 'providerId') {
            setProviderId(value)
            setModelId('') // Reset model when provider changes
        } else {
            handleUpdateFieldBase(field, value)
        }
    }, [setProviderId, setModelId, handleUpdateFieldBase])

    return (
        <>
            <Dialog open={open} onOpenChange={handleRequestClose}>
                <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto rounded-none">
                    {/* Iteration 15 Phase 4: Extracted header component */}
                    <AgentConfigDialogHeader
                        agentId={agentId ?? undefined}
                        onDelete={handleDelete}
                        onImportSuccess={() => handleImportSuccess(0)}
                        onExportSuccess={() => handleExportSuccess()}
                    />

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

                        {/* Iteration 15 Phase 4: Extracted tab content components */}
                        <BasicTabContent
                            name={name}
                            description={description}
                            providerId={providerId}
                            providers={providers}
                            modelId={modelId}
                            models={models}
                            isLoadingModels={isLoadingModels}
                            fetchModels={fetchModels}
                            errors={errors}
                            onFieldUpdate={handleUpdateField}
                        />

                        <WorkspaceTabContent
                            agent={agent ?? null}
                            onPermissionsChange={(toolId, workspaceType, isEnabled) => {
                                setTools((prev: any[]) => prev.map((t: any) =>
                                    t.toolId === toolId
                                        ? { ...t, workspacePermissions: { ...t.workspacePermissions, [workspaceType]: isEnabled } }
                                        : t
                                ))
                            }}
                        />

                        <AdvancedTabContent
                            providerId={providerId}
                            customBaseURL={customBaseURL}
                            customModelId={customModelId}
                            customHeaders={customHeaders}
                            enableNativeTools={enableNativeTools}
                            errors={errors}
                            onFieldUpdate={handleUpdateField}
                        />
                    </Tabs>

                    {/* Iteration 15 Phase 4: Extracted footer component */}
                    <AgentConfigDialogFooter
                        agentId={agentId ?? undefined}
                        isSubmitting={isSubmitting}
                        isValid={isValid}
                        onCancel={() => handleRequestClose(false)}
                        onSubmit={handleSubmit}
                    />
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

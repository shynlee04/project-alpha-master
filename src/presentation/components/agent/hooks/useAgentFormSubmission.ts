/**
 * Agent Form Submission Hook
 *
 * Handles form submission logic for agent creation and updates.
 * Manages loading states, validation, and success/error feedback.
 *
 * @module agent/hooks/useAgentFormSubmission
 * @story AC-1.5 - Extract hooks from AgentConfigDialog (496 → ~200 lines)
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents'
import type { Agent } from '@/core/entities/Agent'
import { safeDebug, sanitizeForLogging } from '@/lib/utils/security'

export interface UseAgentFormSubmissionProps {
    /** Current agent ID (null for new agent) */
    agentId: string | null
    /** Callback when agent is saved successfully */
    onSuccess?: (agentId: string) => void
    /** Callback to close dialog */
    onOpenChange: (open: boolean) => void
    /** Validation function */
    validate: () => boolean
    /** Form data */
    formData: {
        name: string
        description: string
        providerId: string
        modelId: string
        customModelId: string
        temperature: number
        maxTokens: number
        topP: number
        topK: number | undefined
        systemPrompt: string
        tools: Agent['tools']
        workspaceBindings: Agent['workspaceBindings']
    }
}

/**
 * Hook for managing agent form submission
 *
 * Features:
 * - Form submission with validation
 * - Agent creation and update
 * - Success/error toast notifications
 * - Dialog closing on success
 * - Loading state management
 */
export function useAgentFormSubmission({
    agentId,
    onSuccess,
    onOpenChange,
    validate,
    formData,
}: UseAgentFormSubmissionProps) {
    const { t } = useTranslation()
    // Use individual selectors to avoid infinite re-renders
    const addAgent = useAgentsStore(s => s.addAgent)
    const updateAgent = useAgentsStore(s => s.updateAgent)
    const [isSubmitting, setIsSubmitting] = useState(false)

    /**
     * Form submission
     */
    const handleSubmit = useCallback(async () => {
        if (!validate()) return

        setIsSubmitting(true)

        try {
            // Prepare agent data following Sprint Change Proposal v2.0 Agent entity
            const effectiveModelId = formData.providerId === 'openai-compatible' ? formData.customModelId : formData.modelId

            const agentData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                providerId: formData.providerId,
                modelId: effectiveModelId,
                // LLM Parameters (required per Sprint Change Proposal v2.0)
                temperature: formData.temperature,
                maxTokens: formData.maxTokens,
                topP: formData.topP,
                topK: formData.topK !== undefined ? formData.topK : undefined,
                systemPrompt: formData.systemPrompt.trim() || 'You are a helpful AI assistant.',
                // WB-8.3: Tools with workspace permissions (from state)
                tools: formData.tools,
                // WB-8.3: Workspace bindings (from state)
                workspaceBindings: formData.workspaceBindings,
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
    }, [formData, validate, addAgent, updateAgent, onSuccess, onOpenChange, agentId, t])

    return { isSubmitting, handleSubmit }
}

/**
 * Agent Form Actions Hook
 *
 * Handles agent deletion and import/export actions.
 * Provides undo functionality and toast notifications.
 *
 * @module agent/hooks/useAgentFormActions
 * @story AC-1.5 - Extract hooks from AgentConfigDialog (496 → ~200 lines)
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents'

export interface UseAgentFormActionsProps {
    /** Current agent ID (null for new agent) */
    agentId: string | null
    /** Callback to close dialog */
    onOpenChange: (open: boolean) => void
    /** Callback when import succeeds */
    onImportSuccess?: (count: number) => void
    /** Callback when export succeeds */
    onExportSuccess?: () => void
}

/**
 * Hook for managing agent form actions (delete, import, export)
 *
 * Features:
 * - Agent deletion with undo toast
 * - Import/export success callbacks
 * - Dialog closing
 */
export function useAgentFormActions({
    agentId,
    onOpenChange,
    onImportSuccess,
    onExportSuccess,
}: UseAgentFormActionsProps) {
    const { t } = useTranslation()
    // Use individual selectors to avoid infinite re-renders
    const addAgent = useAgentsStore(s => s.addAgent)
    const removeAgent = useAgentsStore(s => s.removeAgent)

    // Read agent from store for delete operation
    const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

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
     * Handle import success callback
     */
    const handleImportSuccess = useCallback((count: number) => {
        toast.success(t('agents.config.importSuccess', 'Imported {{count}} agents', { count }))
        onImportSuccess?.(count)
    }, [t, onImportSuccess])

    /**
     * Handle export success callback
     */
    const handleExportSuccess = useCallback(() => {
        toast.success(t('agents.config.exportSuccess', 'Agents exported'))
        onExportSuccess?.()
    }, [t, onExportSuccess])

    return {
        handleDelete,
        handleImportSuccess,
        handleExportSuccess,
    }
}

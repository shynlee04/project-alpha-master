/**
 * Agent Config Actions Component
 *
 * Renders save, cancel, and delete action buttons for agent configuration dialog.
 *
 * @layer Presentation
 * @component AgentConfigActions
 */

import { Loader2 } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface AgentConfigActionsProps {
    isSubmitting: boolean
    isEditMode: boolean
    onCancel: () => void
    onSubmit: () => void
    onDelete?: () => void
}

/**
 * Agent Config Actions Component
 */
export function AgentConfigActions({
    isSubmitting,
    isEditMode,
    onCancel,
    onSubmit,
    onDelete
}: AgentConfigActionsProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            {isEditMode && onDelete && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none"
                >
                    Delete
                </Button>
            )}
            {!isEditMode && <div />} {/* Spacer for alignment */}

            <div className="flex gap-2 ml-auto">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-none"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="gap-2 rounded-none"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEditMode ? 'Update Agent' : 'Create Agent'}
                </Button>
            </div>
        </div>
    )
}

/**
 * Workspace Transition Step Item - Individual Workspace Transition Step Component
 *
 * Extracted from WorkspaceTransitionIndicator to maintain <120 line limit.
 * Renders individual step with indicator and message.
 *
 * @module presentation/components/ui/event-indicators
 */

import { cn } from '@/lib/utils';
import type { WorkspaceTransitionStep } from './types'

/**
 * Workspace Transition Step Item Component
 *
 * Renders single step with phase indicator and message.
 */
export function WorkspaceTransitionStepItem({
    step,
    isCurrent,
}: {
    step: WorkspaceTransitionStep
    isCurrent: boolean
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 p-2 rounded border',
                isCurrent && 'border-primary bg-primary/5',
                !isCurrent && 'border-transparent opacity-60'
            )}
        >
            <div
                className={cn(
                    'w-2 h-2 rounded-full',
                    step.phase === 'complete' && 'bg-success',
                    step.phase === 'error' && 'bg-destructive',
                    isCurrent && step.phase !== 'complete' && step.phase !== 'error' && 'bg-info animate-pulse',
                    !isCurrent && step.phase !== 'complete' && step.phase !== 'error' && 'bg-muted'
                )}
            />
            <span className="flex-1">{step.message}</span>
        </div>
    )
}

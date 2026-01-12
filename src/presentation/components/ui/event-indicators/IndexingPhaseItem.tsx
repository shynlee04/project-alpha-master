/**
 * Indexing Phase Item - Individual Indexing Phase Component
 *
 * Extracted from IndexingProgressIndicator to maintain <120 line limit.
 * Renders individual phase with indicator, message, and progress.
 *
 * @module presentation/components/ui/event-indicators
 */

import { cn } from '@/lib/utils';
import type { IndexingStep } from './types'

/**
 * Indexing Phase Item Component
 *
 * Renders single phase with indicator, message, and progress percentage.
 */
export function IndexingPhaseItem({
    step,
    isCurrent,
}: {
    step: IndexingStep
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
            {step.progress > 0 && step.progress < 100 && (
                <span className="text-xs opacity-60">{Math.round(step.progress)}%</span>
            )}
        </div>
    )
}

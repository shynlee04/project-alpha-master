/**
 * Indexing Phase Item - Individual Indexing Phase Component
 *
 * Extracted from IndexingProgressIndicator to maintain <120 line limit.
 * Renders individual phase with indicator, message, and progress.
 *
 * @module presentation/components/ui/event-indicators
 */

import { cn } from '@/lib/utils/tw-merge'
import type { IndexingPhase, IndexingStep } from './IndexingProgressIndicator'

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
                    step.phase === 'complete' && 'bg-green-500',
                    step.phase === 'error' && 'bg-red-500',
                    isCurrent && step.phase !== 'complete' && step.phase !== 'error' && 'bg-blue-500 animate-pulse',
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

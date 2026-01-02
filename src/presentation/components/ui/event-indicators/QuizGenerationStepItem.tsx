/**
 * Quiz Generation Step Item - Individual Quiz Generation Step Component
 *
 * Extracted from QuizGenerationIndicator to maintain <120 line limit.
 * Renders individual step with indicator and message.
 *
 * @module presentation/components/ui/event-indicators
 */

import { cn } from 'tailwind-merge'
import type { QuizGenerationStep } from './QuizGenerationIndicator'

/**
 * Quiz Generation Step Item Component
 *
 * Renders single step with phase indicator and message.
 */
export function QuizGenerationStepItem({
    step,
    isCurrent,
}: {
    step: QuizGenerationStep
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
        </div>
    )
}

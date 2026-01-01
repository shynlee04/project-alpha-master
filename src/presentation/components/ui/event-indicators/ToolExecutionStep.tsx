/**
 * Tool Execution Step - Individual Tool Step Component
 *
 * Extracted from ToolExecutionIndicator to maintain <120 line limit.
 * Renders individual step with icon, message, and duration.
 *
 * @module presentation/components/ui/event-indicators
 */

import { Wrench, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/tw-merge'

/**
 * Tool execution step
 */
export interface ToolExecutionStep {
    step: string
    status: 'pending' | 'running' | 'success' | 'error'
    message: string
    duration?: number
}

/**
 * Tool execution state
 */
export interface ToolExecutionState {
    toolName: string
    isExecuting: boolean
    currentStep: number
    totalSteps: number
    steps: ToolExecutionStep[]
    startTime: number | null
    result?: 'success' | 'error'
}

/**
 * Get step icon
 */
function getStepIcon(status: ToolExecutionStep['status']): LucideIcon {
    switch (status) {
        case 'success':
            return CheckCircle2
        case 'error':
            return XCircle
        case 'running':
            return Wrench
        default:
            return () => null
    }
}

/**
 * Tool Execution Step Item Component
 *
 * Renders single step with icon, message, and optional duration.
 */
export function ToolExecutionStepItem({
    step,
    isCurrent,
}: {
    step: ToolExecutionStep
    isCurrent: boolean
}) {
    const StepIcon = getStepIcon(step.status)

    return (
        <div
            className={cn(
                'flex items-center gap-2 p-2 rounded border',
                isCurrent && 'border-primary bg-primary/5',
                !isCurrent && 'border-transparent opacity-60'
            )}
        >
            <StepIcon
                className={cn(
                    'w-3 h-3',
                    step.status === 'running' && 'animate-spin'
                )}
            />
            <span className="flex-1">{step.message}</span>
            {step.duration && (
                <span className="text-xs opacity-60">{step.duration}ms</span>
            )}
        </div>
    )
}

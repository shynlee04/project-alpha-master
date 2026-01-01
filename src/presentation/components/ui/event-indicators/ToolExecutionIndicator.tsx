/**
 * Tool Execution Indicator - Agent Tool Execution Status
 *
 * Displays real-time status of agent tool execution with step progress.
 * Shows which tool is running, current step, and execution time.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @gap G-003 - AgentChatPanel tool execution progress
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/tw-merge'
import { EventIndicator, type EventStatus } from './EventIndicator'
import { ToolExecutionStepItem } from './ToolExecutionStep'
import type { ToolExecutionStep, ToolExecutionState } from './ToolExecutionStep'

/**
 * Tool execution indicator props
 */
export interface ToolExecutionIndicatorProps {
    /** Tool execution state from agent store */
    execution?: ToolExecutionState
    /** Optional CSS class name */
    className?: string
    /** Show compact version */
    compact?: boolean
}

/**
 * Get status from tool execution state
 */
function getToolStatus(execution?: ToolExecutionState): EventStatus {
    if (!execution || !execution.isExecuting) return 'idle'
    if (execution.result === 'error') return 'error'
    if (execution.result === 'success') return 'success'
    return 'loading'
}

/**
 * Get tool execution message
 */
function getToolMessage(execution?: ToolExecutionState): string {
    if (!execution || !execution.isExecuting) return ''

    const currentStep = execution.steps[execution.currentStep]
    if (!currentStep) return `Running ${execution.toolName}...`

    return `${execution.toolName}: ${currentStep.message} (${execution.currentStep + 1}/${execution.totalSteps})`
}

/**
 * Tool Execution Indicator Component
 *
 * Displays multi-step tool execution progress with current step highlight.
 */
export function ToolExecutionIndicator({
    execution,
    className,
    compact = false,
}: ToolExecutionIndicatorProps) {
    const [status, setStatus] = useState<EventStatus>('idle')
    const [message, setMessage] = useState('')

    // Update status when execution state changes
    useEffect(() => {
        setStatus(getToolStatus(execution))
        setMessage(getToolMessage(execution))
    }, [execution])

    if (!execution || compact) {
        return (
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                progress={execution ? ((execution.currentStep + 1) / execution.totalSteps) * 100 : undefined}
                className={className}
                compact={compact}
            />
        )
    }

    // Full version with step breakdown
    const hasError = execution.steps.some((s) => s.status === 'error')

    return (
        <div className={cn('space-y-2', className)}>
            {/* Overall Progress */}
            <EventIndicator
                status={hasError ? 'error' : status}
                activity="general"
                message={message}
                progress={((execution.currentStep + 1) / execution.totalSteps) * 100}
            />

            {/* Step Breakdown */}
            <div className="space-y-1 text-sm">
                {execution.steps.map((step, index) => (
                    <ToolExecutionStepItem key={step.step} step={step} isCurrent={index === execution.currentStep} />
                ))}
            </div>
        </div>
    )
}

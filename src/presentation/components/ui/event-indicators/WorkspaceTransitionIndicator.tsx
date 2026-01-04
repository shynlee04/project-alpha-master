/**
 * Workspace Transition Indicator - Workspace Switcher Loading Status
 *
 * Displays real-time progress of workspace transition operations.
 * Shows state persistence, resource cleanup, and restoration progress.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @gap G-007 - WorkspaceSwitcher workspace transition loading
 */

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react'
import { EventIndicator, type EventStatus } from './EventIndicator'
import { WorkspaceTransitionStepItem } from './WorkspaceTransitionStepItem'
import { getWorkspaceTransitionStatus, getWorkspaceTransitionMessage } from './workspace-transition-utils'
import type { WorkspaceTransitionState, WorkspaceTransitionStep, WorkspaceTransitionIndicatorProps, WorkspaceTransitionPhase } from './types'

// Re-export types for backward compatibility
export type { WorkspaceTransitionPhase, WorkspaceTransitionStep, WorkspaceTransitionState, WorkspaceTransitionIndicatorProps }

/**
 * Workspace Transition Indicator Component
 *
 * Displays multi-phase workspace transition progress with step breakdown.
 */
export function WorkspaceTransitionIndicator({
    transition,
    className,
    compact = false,
}: WorkspaceTransitionIndicatorProps) {
    const [status, setStatus] = useState<EventStatus>('idle')
    const [message, setMessage] = useState('')

    // Update status when transition state changes
    useEffect(() => {
        setStatus(getWorkspaceTransitionStatus(transition))
        setMessage(getWorkspaceTransitionMessage(transition))
    }, [transition])

    if (!transition || compact) {
        return (
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                errorDetail={transition?.error}
                className={className}
                compact={compact}
            />
        )
    }

    // Full version with step breakdown
    return (
        <div className={cn('space-y-2', className)}>
            {/* Overall Progress */}
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                errorDetail={transition.error}
            />

            {/* Step Breakdown */}
            <div className="space-y-1 text-sm">
                {transition.steps.slice(-5).map((step, index) => (
                    <WorkspaceTransitionStepItem
                        key={index}
                        step={step}
                        isCurrent={step.phase === transition.currentPhase}
                    />
                ))}
            </div>
        </div>
    )
}

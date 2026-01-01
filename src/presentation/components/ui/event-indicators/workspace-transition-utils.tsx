/**
 * Workspace Transition Indicator Utilities
 *
 * Helper functions for WorkspaceTransitionIndicator component.
 * Extracted to maintain <120 line component limit.
 *
 * @module presentation/components/ui/event-indicators
 */

import type { EventStatus } from './EventIndicator'
import type { WorkspaceTransitionState } from './WorkspaceTransitionIndicator'

/**
 * Get status from workspace transition state
 */
export function getWorkspaceTransitionStatus(transition?: WorkspaceTransitionState): EventStatus {
    if (!transition || !transition.isTransitioning) return 'idle'
    if (transition.error) return 'error'
    if (transition.currentPhase === 'complete') return 'success'
    return 'loading'
}

/**
 * Get workspace transition message
 */
export function getWorkspaceTransitionMessage(transition?: WorkspaceTransitionState): string {
    if (!transition || !transition.isTransitioning) return ''

    const phase = transition.currentPhase

    switch (phase) {
        case 'persisting':
            return `Saving state for "${transition.fromWorkspace}"...`
        case 'cleanup':
            return `Cleaning up resources...`
        case 'loading':
            return `Loading workspace data for "${transition.toWorkspace}"...`
        case 'restoring':
            return `Restoring "${transition.toWorkspace}" state...`
        case 'complete':
            return `Switched to "${transition.toWorkspace}"`
        case 'error':
            return `Failed to switch to "${transition.toWorkspace}"`
        default:
            return 'Preparing workspace transition...'
    }
}

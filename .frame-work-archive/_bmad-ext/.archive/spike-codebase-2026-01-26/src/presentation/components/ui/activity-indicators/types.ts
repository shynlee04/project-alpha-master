/**
 * Activity Indicator Types
 *
 * Shared types for event activity indicator components.
 *
 * @module ui/activity-indicators/types
 * @layer Presentation
 */

/**
 * Activity status types
 */
export type ActivityStatus = 'idle' | 'running' | 'completed' | 'error'

/**
 * Activity state interface
 */
export interface ActivityState {
    status: ActivityStatus
    progress?: number // 0-100
    current?: number // Current item count
    total?: number // Total item count
    message?: string // Status message
    error?: string // Error message if status is 'error'
}

/**
 * Base activity indicator props
 */
export interface BaseActivityIndicatorProps {
    state: ActivityState
    className?: string
}

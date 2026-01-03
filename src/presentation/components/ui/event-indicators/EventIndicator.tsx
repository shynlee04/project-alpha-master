/**
 * Event Indicator - Reusable Status Display Component
 *
 * Displays real-time status for background operations with visual feedback.
 * Supports loading, success, error, and warning states with optional progress.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @story Create event activity indicator UI components
 */

import { cn } from '@/lib/utils'
import { StatusIcon, getStatusStyles } from './event-indicator-utils'

/**
 * Event status types
 */
export type EventStatus = 'idle' | 'loading' | 'success' | 'error' | 'warning'

/**
 * Activity types
 */
export type ActivityType = 'general' | 'indexing' | 'streaming' | 'sync' | 'quiz-generation' | 'workspace-transition'

/**
 * Event indicator props
 */
export interface EventIndicatorProps {
    /** Current status */
    status: EventStatus
    /** Type of activity */
    activity?: ActivityType
    /** Status message (e.g., "Indexing documents...") */
    message: string
    /** Optional progress percentage (0-100) */
    progress?: number
    /** Optional error/warning message */
    errorDetail?: string
    /** Optional CSS class name */
    className?: string
    /** Show compact version (for inline display) */
    compact?: boolean
}

/**
 * EventIndicator Component
 *
 * Displays status with icon, message, progress bar, and error details.
 * Automatically hides when status is 'idle' (unless compact mode).
 */
export function EventIndicator({
    status,
    activity = 'general',
    message,
    progress,
    errorDetail,
    className,
    compact = false,
}: EventIndicatorProps) {
    // Hide idle indicators in non-compact mode
    if (status === 'idle' && !compact) {
        return null
    }

    const isLoading = status === 'loading'
    const hasProgress = typeof progress === 'number' && progress >= 0 && progress <= 100
    const hasError = status === 'error' || status === 'warning'

    return (
        <div
            className={cn(
                'rounded-lg border p-3 transition-colors',
                getStatusStyles(status),
                compact && 'inline-flex items-center gap-2 py-1 px-2 text-sm',
                className
            )}
            role="status"
            aria-live={isLoading ? 'polite' : 'off'}
            aria-busy={isLoading}
        >
            {/* Status Icon + Message */}
            <div className={cn('flex items-center gap-2', compact && 'flex-row', !compact && 'space-y-2')}>
                <StatusIcon status={status} activity={activity} />
                <span className={cn(compact && 'truncate', !compact && 'text-sm font-medium')}>
                    {message}
                </span>
                {hasProgress && !compact && (
                    <span className="text-sm opacity-75">{Math.round(progress)}%</span>
                )}
            </div>

            {/* Progress Bar (non-compact) */}
            {hasProgress && !compact && (
                <div className="w-full bg-current/10 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-current transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            )}

            {/* Error Detail */}
            {hasError && errorDetail && !compact && (
                <p className="text-xs mt-1 opacity-90">{errorDetail}</p>
            )}
        </div>
    )
}

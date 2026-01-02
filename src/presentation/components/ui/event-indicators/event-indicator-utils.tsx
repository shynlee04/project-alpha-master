/**
 * Event Indicator Utilities
 *
 * Helper functions for EventIndicator component.
 * Extracted to maintain <120 line component limit.
 *
 * @module presentation/components/ui/event-indicators
 */

import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, LucideIcon } from 'lucide-react'
import type { EventStatus, ActivityType } from './EventIndicator'

/**
 * Get status icon for event status
 */
export function getStatusIcon(status: EventStatus, activity?: ActivityType): LucideIcon {
    switch (status) {
        case 'loading':
            return Loader2
        case 'success':
            return CheckCircle2
        case 'error':
            return AlertCircle
        case 'warning':
            return AlertTriangle
        case 'idle':
        default:
            return activity === 'streaming' ? Loader2 : () => null
    }
}

/**
 * Get status styles for event status
 */
export function getStatusStyles(status: EventStatus): string {
    switch (status) {
        case 'loading':
            return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
        case 'success':
            return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300'
        case 'error':
            return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
        case 'warning':
            return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300'
        case 'idle':
        default:
            return 'bg-muted/50 border-muted text-muted-foreground'
    }
}

/**
 * Render status icon component
 */
export function StatusIcon({ status, activity }: { status: EventStatus; activity?: ActivityType }) {
    const Icon = getStatusIcon(status, activity)
    const isLoading = status === 'loading'
    const isStreaming = activity === 'streaming' && status === 'idle'

    return (
        <Icon
            className={cn(
                'w-4 h-4',
                (isLoading || isStreaming) && 'animate-spin',
                isStreaming && 'animate-pulse'
            )}
        />
    )
}

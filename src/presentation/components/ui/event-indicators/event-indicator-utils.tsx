/**
 * Event Indicator Utilities
 *
 * Helper functions for EventIndicator component.
 * Extracted to maintain <120 line component limit.
 *
 * @module presentation/components/ui/event-indicators
 */

import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, Circle, LucideIcon } from 'lucide-react'
import type { EventStatus, ActivityType } from './types'

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
            return activity === 'streaming' ? Loader2 : Circle
    }
}

/**
 * Get status styles for event status
 */
export function getStatusStyles(status: EventStatus): string {
    switch (status) {
        case 'loading':
            return 'bg-info/10 border-info/20 text-info dark:text-info'
        case 'success':
            return 'bg-success/10 border-success/20 text-success dark:text-success'
        case 'error':
            return 'bg-destructive/10 border-destructive/20 text-destructive dark:text-destructive'
        case 'warning':
            return 'bg-warning/10 border-warning/20 text-warning dark:text-warning'
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

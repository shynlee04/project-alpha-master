/**
 * Database Indexing Indicator Component
 *
 * Displays database indexing progress and status.
 *
 * @layer Presentation
 * @component DatabaseIndexingIndicator
 *
 * December 2025 Patterns:
 * - Single responsibility (indexing status only)
 * - Accessible (ARIA labels)
 * - Real-time feedback (progress updates)
 */

import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Progress } from '@/presentation/components/ui/progress'
import { cn } from '@/lib/utils'
import type { BaseActivityIndicatorProps } from './types'

/**
 * Database Indexing Indicator Component
 *
 * Shows visual feedback for database indexing operations.
 * Displays progress bar, document count, and status messages.
 */
export function DatabaseIndexingIndicator({
    state,
    className
}: BaseActivityIndicatorProps) {
    const { status, progress = 0, current = 0, total = 0, message, error } = state

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-4 h-4 animate-spin text-info" />
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-success" />
            case 'error':
                return <XCircle className="w-4 h-4 text-destructive" />
            default:
                return <Database className="w-4 h-4 text-muted-foreground" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'running':
                return message || `Indexing ${current}/${total} documents...`
            case 'completed':
                return message || `Indexed ${total} documents successfully`
            case 'error':
                return error || 'Indexing failed'
            default:
                return 'Ready to index'
        }
    }

    const showProgress = status === 'running' && total > 0

    return (
        <div className={cn('flex items-center gap-3 p-3 rounded-none border bg-card', className)}>
            {getStatusIcon()}

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Database Indexing</span>
                    {showProgress && (
                        <span className="text-muted-foreground">
                            {Math.round(progress)}%
                        </span>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    {getStatusText()}
                </p>

                {showProgress && (
                    <Progress value={progress} className="h-1" />
                )}
            </div>
        </div>
    )
}

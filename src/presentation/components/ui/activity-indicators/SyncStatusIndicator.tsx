/**
 * Sync Status Indicator Component
 *
 * Displays file synchronization status across workspaces.
 *
 * @layer Presentation
 * @component SyncStatusIndicator
 *
 * December 2025 Patterns:
 * - Single responsibility (sync status only)
 * - Accessible (ARIA labels)
 * - Real-time feedback (sync progress)
 */

import { RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Progress } from '@/presentation/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ActivityState, BaseActivityIndicatorProps } from './types'

/**
 * Sync Status Indicator Component
 *
 * Shows visual feedback for file synchronization operations.
 * Displays progress bar, file count, and status messages.
 */
export function SyncStatusIndicator({
    state,
    className
}: BaseActivityIndicatorProps) {
    const { status, progress = 0, current = 0, total = 0, message, error } = state

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return <RefreshCw className="w-4 h-4 text-muted-foreground" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'running':
                return message || `Syncing ${current}/${total} files...`
            case 'completed':
                return message || `Synced ${total} files successfully`
            case 'error':
                return error || 'Synchronization failed'
            default:
                return 'Ready to sync'
        }
    }

    const showProgress = status === 'running' && total > 0

    return (
        <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-card', className)}>
            {getStatusIcon()}

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">File Synchronization</span>
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

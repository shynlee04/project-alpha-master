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

import { RefreshCw, Loader2, CheckCircle2, XCircle, X } from 'lucide-react'
import { Progress } from '@/presentation/components/ui/progress'
import { cn } from '@/lib/utils'
import type { BaseActivityIndicatorProps } from './types'

// UX-02-23: Extended props with optional onDismiss callback
interface SyncStatusIndicatorProps extends BaseActivityIndicatorProps {
    onDismiss?: () => void;
}

/**
 * Sync Status Indicator Component
 *
 * Shows visual feedback for file synchronization operations.
 * Displays progress bar, file count, and status messages.
 * UX-02-23: Added manual close button for user control.
 */
export function SyncStatusIndicator({
    state,
    className,
    onDismiss
}: SyncStatusIndicatorProps) {
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
        <div className={cn('relative flex items-center gap-3 p-3 pr-8 rounded-none border-2 border-border bg-card shadow-[var(--shadow-pixel)]', className)}>
            {/* UX-02-23: Close button */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-1 rounded-none border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Dismiss sync status"
                >
                    <X size={12} />
                </button>
            )}

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


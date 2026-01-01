/**
 * Chunking Status Indicator Component
 *
 * Displays document chunking progress for RAG operations.
 *
 * @layer Presentation
 * @component ChunkingStatusIndicator
 *
 * December 2025 Patterns:
 * - Single responsibility (chunking status only)
 * - Accessible (ARIA labels)
 * - Real-time feedback (progress updates)
 */

import { Scissors, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Progress } from '@/presentation/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ActivityState, BaseActivityIndicatorProps } from './types'

/**
 * Chunking Status Indicator Component
 *
 * Shows visual feedback for document chunking operations.
 * Displays progress bar, chunk count, and status messages.
 */
export function ChunkingStatusIndicator({
    state,
    className
}: BaseActivityIndicatorProps) {
    const { status, progress = 0, current = 0, total = 0, message, error } = state

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return <Scissors className="w-4 h-4 text-muted-foreground" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'running':
                return message || `Chunking ${current}/${total} documents...`
            case 'completed':
                return message || `Created ${total} chunks successfully`
            case 'error':
                return error || 'Chunking failed'
            default:
                return 'Ready to chunk documents'
        }
    }

    const showProgress = status === 'running' && total > 0

    return (
        <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-card', className)}>
            {getStatusIcon()}

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Document Chunking</span>
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

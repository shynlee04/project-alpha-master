/**
 * RAG Auto-Indexing Progress Indicator
 *
 * Displays progress for background RAG indexing triggered by file sync events.
 *
 * ARCH-01.5.6 - Background progress UI for auto-indexing on sync.
 *
 * Shows:
 * - Current file being indexed
 * - Progress percentage
 * - Number of chunks processed
 * - Queue status
 *
 * @layer Presentation
 * @component RAGAutoIndexingIndicator
 */

import { FileText, Loader2, CheckCircle2, XCircle, Layers } from 'lucide-react'
import { Progress } from '@/presentation/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ActivityState, BaseActivityIndicatorProps } from './types'

/**
 * Extended state for RAG auto-indexing
 */
export interface RAGIndexingState extends ActivityState {
    /** Current file being indexed */
    currentFile?: string
    /** Number of files in queue */
    queueSize?: number
    /** Indexing phase */
    phase?: 'chunking' | 'embedding' | 'indexing' | 'removing' | 'idle'
}

/**
 * RAG Auto-Indexing Progress Indicator Component
 *
 * Shows visual feedback for background RAG indexing operations
 * triggered by file sync events.
 */
export function RAGAutoIndexingIndicator({
    state,
    className
}: BaseActivityIndicatorProps & { state: RAGIndexingState }) {
    const {
        status,
        progress = 0,
        current = 0,
        total = 0,
        message,
        error,
        currentFile,
        queueSize = 0,
        phase = 'idle'
    } = state

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-4 h-4 animate-spin text-info" />
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-success" />
            case 'error':
                return <XCircle className="w-4 h-4 text-destructive" />
            default:
                return <FileText className="w-4 h-4 text-muted-foreground" />
        }
    }

    const getPhaseIcon = () => {
        switch (phase) {
            case 'chunking':
                return <Layers className="w-3 h-3 text-muted-foreground" />
            case 'embedding':
                return <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
            case 'indexing':
                return <CheckCircle2 className="w-3 h-3 text-info" />
            case 'removing':
                return <XCircle className="w-3 h-3 text-warning" />
            default:
                return null
        }
    }

    const getStatusText = () => {
        if (error) {
            return error
        }

        if (status === 'completed') {
            return message || `Indexed ${total} chunks successfully`
        }

        if (status === 'running') {
            if (currentFile) {
                return `Indexing: ${currentFile}`
            }
            if (message) {
                return message
            }
            return phase === 'idle'
                ? 'Initializing...'
                : `${phase}: ${current}/${total} chunks`
        }

        return queueSize > 0
            ? `${queueSize} files queued for indexing`
            : 'Auto-indexing idle'
    }

    const showProgress = status === 'running' && total > 0
    const progressPercent = total > 0 ? Math.round((current / total) * 100) : progress

    return (
        <div className={cn('flex items-center gap-3 p-3 rounded-none border bg-card', className)}>
            {getStatusIcon()}

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">RAG Auto-Indexing</span>
                        {getPhaseIcon()}
                    </div>
                    {showProgress && (
                        <span className="text-muted-foreground">
                            {progressPercent}%
                        </span>
                    )}
                </div>

                <p className="text-xs text-muted-foreground truncate">
                    {getStatusText()}
                </p>

                {showProgress && (
                    <Progress value={progressPercent} className="h-1" />
                )}

                {queueSize > 0 && status !== 'running' && (
                    <div className="text-xs text-muted-foreground">
                        {queueSize} file{queueSize > 1 ? 's' : ''} in queue
                    </div>
                )}
            </div>
        </div>
    )
}

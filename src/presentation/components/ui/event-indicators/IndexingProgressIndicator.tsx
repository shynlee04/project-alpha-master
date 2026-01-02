/**
 * Indexing Progress Indicator - RAG Indexing Status
 *
 * Displays real-time progress of RAG indexing operations.
 * Shows chunking, embedding, and vector storage progress.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @gap G-004 - RAGSearchPanel vector search progress
 */

import { useEffect, useState } from 'react'
import { cn } from 'tailwind-merge'
import { EventIndicator, type EventStatus } from './EventIndicator'
import { IndexingPhaseItem } from './IndexingPhaseItem'
import { getIndexingStatus, getIndexingMessage, getIndexingProgress } from './indexing-utils'

/**
 * Indexing operation phase
 */
export type IndexingPhase = 'pending' | 'chunking' | 'embedding' | 'storing' | 'complete' | 'error'

/**
 * Indexing operation step
 */
export interface IndexingStep {
    phase: IndexingPhase
    message: string
    progress: number
    timestamp: number
}

/**
 * Indexing state
 */
export interface IndexingState {
    isIndexing: boolean
    currentPhase: IndexingPhase
    totalDocuments: number
    processedDocuments: number
    totalChunks: number
    processedChunks: number
    steps: IndexingStep[]
    startTime: number | null
    error?: string
}

/**
 * Indexing progress indicator props
 */
export interface IndexingProgressIndicatorProps {
    /** Indexing state from RAG store */
    indexing?: IndexingState
    /** Optional CSS class name */
    className?: string
    /** Show compact version */
    compact?: boolean
}

/**
 * Indexing Progress Indicator Component
 *
 * Displays multi-phase indexing progress with current phase highlight.
 */
export function IndexingProgressIndicator({
    indexing,
    className,
    compact = false,
}: IndexingProgressIndicatorProps) {
    const [status, setStatus] = useState<EventStatus>('idle')
    const [message, setMessage] = useState('')
    const [progress, setProgress] = useState(0)

    // Update status when indexing state changes
    useEffect(() => {
        setStatus(getIndexingStatus(indexing))
        setMessage(getIndexingMessage(indexing))
        setProgress(getIndexingProgress(indexing))
    }, [indexing])

    if (!indexing || compact) {
        return (
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                progress={progress > 0 ? progress : undefined}
                errorDetail={indexing?.error}
                className={className}
                compact={compact}
            />
        )
    }

    // Full version with step breakdown
    return (
        <div className={cn('space-y-2', className)}>
            {/* Overall Progress */}
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                progress={progress > 0 ? progress : undefined}
                errorDetail={indexing.error}
            />

            {/* Phase Breakdown */}
            <div className="space-y-1 text-sm">
                {indexing.steps.slice(-3).map((step, index) => (
                    <IndexingPhaseItem
                        key={index}
                        step={step}
                        isCurrent={step.phase === indexing.currentPhase}
                    />
                ))}
            </div>
        </div>
    )
}

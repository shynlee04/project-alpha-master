/**
 * Note Indexing Indicator - Note Editor Indexing Status
 *
 * Displays real-time progress of note indexing operations.
 * Shows parsing, embedding, and storage progress.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @gap G-005 - NoteEditor note indexing status
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/tw-merge'
import { EventIndicator, type EventStatus } from './EventIndicator'
import { getNoteIndexingStatus, getNoteIndexingMessage, getNoteIndexingProgress } from './note-indexing-utils'

/**
 * Note indexing phase
 */
export type NoteIndexingPhase = 'pending' | 'parsing' | 'embedding' | 'storing' | 'complete' | 'error'

/**
 * Note indexing state
 */
export interface NoteIndexingState {
    isIndexing: boolean
    currentPhase: NoteIndexingPhase
    noteId: string
    noteTitle: string
    totalBlocks: number
    processedBlocks: number
    startTime: number | null
    error?: string
}

/**
 * Note indexing indicator props
 */
export interface NoteIndexingIndicatorProps {
    /** Note indexing state from notes store */
    indexing?: NoteIndexingState
    /** Optional CSS class name */
    className?: string
    /** Show compact version */
    compact?: boolean
}

/**
 * Note Indexing Indicator Component
 *
 * Displays note indexing progress with phase-specific messages.
 */
export function NoteIndexingIndicator({
    indexing,
    className,
    compact = false,
}: NoteIndexingIndicatorProps) {
    const [status, setStatus] = useState<EventStatus>('idle')
    const [message, setMessage] = useState('')
    const [progress, setProgress] = useState(0)

    // Update status when indexing state changes
    useEffect(() => {
        setStatus(getNoteIndexingStatus(indexing))
        setMessage(getNoteIndexingMessage(indexing))
        setProgress(getNoteIndexingProgress(indexing))
    }, [indexing])

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

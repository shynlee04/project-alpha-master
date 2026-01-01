/**
 * Note Indexing Indicator Utilities
 *
 * Helper functions for NoteIndexingIndicator component.
 * Extracted to maintain <120 line component limit.
 *
 * @module presentation/components/ui/event-indicators
 */

import type { EventStatus } from './EventIndicator'
import type { NoteIndexingState } from './NoteIndexingIndicator'

/**
 * Get status from note indexing state
 */
export function getNoteIndexingStatus(indexing?: NoteIndexingState): EventStatus {
    if (!indexing || !indexing.isIndexing) return 'idle'
    if (indexing.error) return 'error'
    if (indexing.currentPhase === 'complete') return 'success'
    return 'loading'
}

/**
 * Get note indexing message
 */
export function getNoteIndexingMessage(indexing?: NoteIndexingState): string {
    if (!indexing || !indexing.isIndexing) return ''

    const phase = indexing.currentPhase
    const progress = indexing.totalBlocks > 0
        ? Math.round((indexing.processedBlocks / indexing.totalBlocks) * 100)
        : 0

    switch (phase) {
        case 'parsing':
            return `Parsing "${indexing.noteTitle}"... ${indexing.processedBlocks}/${indexing.totalBlocks} blocks`
        case 'embedding':
            return `Generating embeddings for "${indexing.noteTitle}"... ${progress}%`
        case 'storing':
            return `Storing indexed note...`
        case 'complete':
            return `Indexing complete for "${indexing.noteTitle}"`
        case 'error':
            return `Failed to index "${indexing.noteTitle}"`
        default:
            return 'Preparing to index note...'
    }
}

/**
 * Get overall progress percentage
 */
export function getNoteIndexingProgress(indexing?: NoteIndexingState): number {
    if (!indexing || !indexing.isIndexing) return 0

    const phaseWeights = {
        parsing: 0.4,
        embedding: 0.5,
        storing: 0.1,
    }

    const blockProgress = indexing.totalBlocks > 0
        ? indexing.processedBlocks / indexing.totalBlocks
        : 0

    switch (indexing.currentPhase) {
        case 'parsing':
            return blockProgress * phaseWeights.parsing * 100
        case 'embedding':
            return phaseWeights.parsing * 100 + (blockProgress * phaseWeights.embedding * 100)
        case 'storing':
            return (phaseWeights.parsing + phaseWeights.embedding) * 100 + (blockProgress * phaseWeights.storing * 100)
        case 'complete':
            return 100
        default:
            return 0
    }
}

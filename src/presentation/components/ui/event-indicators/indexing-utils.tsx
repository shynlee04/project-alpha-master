/**
 * Indexing Indicator Utilities
 *
 * Helper functions for IndexingProgressIndicator component.
 * Extracted to maintain <120 line component limit.
 *
 * @module presentation/components/ui/event-indicators
 */

import type { EventStatus } from './EventIndicator'
import type { IndexingState } from './IndexingProgressIndicator'

/**
 * Get status from indexing state
 */
export function getIndexingStatus(indexing?: IndexingState): EventStatus {
    if (!indexing || !indexing.isIndexing) return 'idle'
    if (indexing.error) return 'error'
    if (indexing.currentPhase === 'complete') return 'success'
    return 'loading'
}

/**
 * Get indexing message
 */
export function getIndexingMessage(indexing?: IndexingState): string {
    if (!indexing || !indexing.isIndexing) return ''

    const phase = indexing.currentPhase
    const docsProgress = indexing.totalDocuments > 0
        ? Math.round((indexing.processedDocuments / indexing.totalDocuments) * 100)
        : 0
    const chunksProgress = indexing.totalChunks > 0
        ? Math.round((indexing.processedChunks / indexing.totalChunks) * 100)
        : 0

    switch (phase) {
        case 'chunking':
            return `Chunking documents... ${indexing.processedDocuments}/${indexing.totalDocuments} (${docsProgress}%)`
        case 'embedding':
            return `Generating embeddings... ${indexing.processedChunks}/${indexing.totalChunks} chunks (${chunksProgress}%)`
        case 'storing':
            return `Storing vectors... ${chunksProgress}% complete`
        case 'complete':
            return `Indexing complete! ${indexing.totalChunks} chunks processed`
        case 'error':
            return 'Indexing failed'
        default:
            return 'Preparing to index...'
    }
}

/**
 * Get overall progress percentage
 */
export function getIndexingProgress(indexing?: IndexingState): number {
    if (!indexing || !indexing.isIndexing) return 0

    const phaseWeights = {
        chunking: 0.3,
        embedding: 0.6,
        storing: 0.1,
    }

    const docsProgress = indexing.totalDocuments > 0
        ? indexing.processedDocuments / indexing.totalDocuments
        : 0
    const chunksProgress = indexing.totalChunks > 0
        ? indexing.processedChunks / indexing.totalChunks
        : 0

    switch (indexing.currentPhase) {
        case 'chunking':
            return docsProgress * phaseWeights.chunking * 100
        case 'embedding':
            return phaseWeights.chunking * 100 + (chunksProgress * phaseWeights.embedding * 100)
        case 'storing':
            return (phaseWeights.chunking + phaseWeights.embedding) * 100 + (chunksProgress * phaseWeights.storing * 100)
        case 'complete':
            return 100
        default:
            return 0
    }
}

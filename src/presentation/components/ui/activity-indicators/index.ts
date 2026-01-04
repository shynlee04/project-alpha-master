/**
 * Activity Indicators Module
 *
 * Event activity indicator components for long-running operations.
 *
 * @module ui/activity-indicators
 * @layer Presentation
 *
 * Ralph Loop Cycle 17 - Event Activity Indicators:
 * - DatabaseIndexingIndicator: Database indexing progress
 * - EmbeddingProgressIndicator: Embedding generation progress
 * - ChunkingStatusIndicator: Document chunking progress
 * - SyncStatusIndicator: File synchronization progress
 * - SyncStatusPanel: Container component (event bus integration)
 *
 * ARCH-01.5.6 - RAG Auto-Indexing:
 * - RAGAutoIndexingIndicator: Background indexing on file sync
 *
 * December 2025 Patterns:
 * - Single responsibility (one status per component)
 * - Accessible (ARIA labels)
 * - Real-time feedback (progress updates)
 * - Reusable (can be used across all workspaces)
 */

export { DatabaseIndexingIndicator } from './DatabaseIndexingIndicator'
export { EmbeddingProgressIndicator } from './EmbeddingProgressIndicator'
export { ChunkingStatusIndicator } from './ChunkingStatusIndicator'
export { SyncStatusIndicator } from './SyncStatusIndicator'
export { SyncStatusPanel } from './SyncStatusPanel'
export { RAGAutoIndexingIndicator } from './RAGAutoIndexingIndicator'
export type { ActivityState, ActivityStatus, BaseActivityIndicatorProps } from './types'
export type { RAGIndexingState } from './RAGAutoIndexingIndicator'

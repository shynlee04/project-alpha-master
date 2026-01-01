/**
 * @fileoverview Hooks Index
 * @module hooks
 *
 * Central exports for all custom React hooks.
 */

// Workspace hooks
export {
    useWorkspaceContext,
    useCurrentWorkspace,
    useIsInWorkspace,
} from './useWorkspaceContext';

// Cross-workspace events hooks (Iteration 15)
export {
    useRAGEmbeddingProgress,
    useRAGChunkingStatus,
    useRAGDatabaseIndexing,
    useRAGSourceProcessing,
    useCrossWorkspaceEvent,
} from './use-cross-workspace-events';

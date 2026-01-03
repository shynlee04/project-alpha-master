/**
 * @fileoverview Dexie Database Main Export
 * @module lib/state/dexie-db
 * @governance EPIC-27-1c
 * @ai-observable true
 *
 * Main export file for Dexie database.
 * Re-exports all types and the database instance.
 *
 * Story ARC-1.1: Split dexie-db.ts (1,267 lines → barrel export pattern)
 * Story ARC-DUP.2: Move dexie type files to infrastructure/persistence
 *
 * **Architecture Change**:
 * - Type files now consolidated in infrastructure/persistence (canonical)
 * - This file re-exports types via dexie-db-types facade for backwards compatibility
 * - Helper modules (dexie-db-helpers/) remain in lib/state
 * - Dashboard-specific types remain in lib/state
 */

// ============================================================================
// Database Types (re-exported from infrastructure/persistence via facade)
// ============================================================================

export * from './dexie-db-types';

// ============================================================================
// Dashboard Types (unique to lib/state)
// ============================================================================

export type * from './dexie-db-dashboard-types';

// ============================================================================
// Synthesis Results Types (lib/state specific - not in infrastructure/persistence)
// ============================================================================
// NOTE: These types are lib/state specific and are not part of the
// infrastructure/persistence consolidation. The synthesisResults table
// does not exist in infrastructure/persistence/dexie-db-class.ts.
//
// TODO: Investigate if synthesis results should be:
// 1. Added to infrastructure/persistence as a new table
// 2. Kept as lib/state specific functionality
// 3. Refactored to use a different storage mechanism

export interface SynthesisResultRecord {
    id: string;
    sourceId: string;
    projectId: string;
    status: 'idle' | 'pending' | 'synthesizing' | 'completed' | 'failed';
    synthesisResult?: string;
    errorMessage?: string;
    createdAt: number;
    updatedAt: number;
}

export type SynthesisResultsTable = Table<SynthesisResultRecord, string>;

// ============================================================================
// Helper Functions - Re-exported from dexie-db-helpers/
// ============================================================================

// IDE State Helpers
export {
    getIDEState,
    saveIDEState,
    deleteIDEState,
} from './dexie-db-helpers/ide-state-helpers';

// Sync Status Helpers
export {
    getSyncStatus,
    setSyncStatus,
    updateSyncStatus,
    deleteSyncStatus,
    getSyncStatusByStatus,
} from './dexie-db-helpers/sync-status-helpers-basic';

export {
    getPendingSyncStatus,
    getErrorSyncStatus,
    clearOldSyncStatus,
    getSyncStatusStats,
} from './dexie-db-helpers/sync-status-helpers-query';

// File Metadata Helpers
export {
    getFileMetadata,
    getAllFileMetadata,
    upsertFileMetadata,
    bulkUpsertFileMetadata,
    deleteFileMetadata,
    clearProjectFileMetadata,
    getFilesNeedingSync,
} from './dexie-db-helpers/file-metadata-helpers';

// Additional File Metadata Helpers
export {
    getChangedFilesSince,
    clearFileMetadataCache,
} from './dexie-db-helpers/additional-file-metadata-helpers';

// Tool Execution Log Helpers
export {
    addToolExecutionLog,
    getToolExecutionLogs,
    getToolExecutionLog,
    updateToolExecutionLog,
    getApprovedTools,
    clearOldToolExecutionLogs,
    clearToolExecutionLogs,
} from './dexie-db-helpers/tool-execution-log-helpers';

// FSA Handle Helpers
export {
    storeFSAHandle,
    getFSAHandle,
    updateFSAHandleStatus,
    deleteFSAHandle,
    updateFSAHandlePermission,
    clearAllFSAHandles,
    getAllValidFSAHandles,
} from './dexie-db-helpers/fsa-handle-helpers';

// Session Snapshot Helpers
export {
    saveSessionSnapshot,
    getLatestSessionSnapshot,
    deleteSessionSnapshot,
    clearExpiredSessionSnapshots,
    clearProjectSessionSnapshots,
} from './dexie-db-helpers/session-snapshot-helpers';

// Conversation Thread Helpers
export {
    getConversationThread,
    saveConversationThread,
    getMostRecentThread,
    getThreadsForProject,
    deleteConversationThread,
    updateThreadScrollPosition,
} from './dexie-db-helpers/conversation-thread-helpers';

// Source Helpers
export {
    getSource,
    saveSource,
    getSourcesForProject,
    getSourcesByType,
    deleteSource,
    clearProjectSources,
} from './dexie-db-helpers/source-helpers-basic';

export {
    searchSources,
    getSourceStats,
} from './dexie-db-helpers/source-helpers-search';

// Collection Helpers
export {
    getCollectionsForProject,
    getCollection,
    saveCollection,
    createCollection,
    deleteCollection,
} from './dexie-db-helpers/collection-helpers-basic';

export {
    addSourceToCollection,
    removeSourceFromCollection,
    getSourcesForCollection,
} from './dexie-db-helpers/collection-helpers-sources';

// Synthesis Result Helpers
export {
    getSynthesisResult,
    getSynthesisResultForSource,
    getSynthesisResultsForProject,
    getSynthesisResultsByStatus,
    saveSynthesisResult,
    deleteSynthesisResult,
    deleteSynthesisResultForSource,
    clearProjectSynthesisResults,
} from './dexie-db-helpers/synthesis-result-helpers-crud';

export {
    createSynthesisResult,
    updateSynthesisResultStatus,
} from './dexie-db-helpers/synthesis-result-helpers-create';

// Legacy Helper (for backwards compatibility)
export { queueItemToSyncStatus } from './dexie-db-helpers';

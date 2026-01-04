/**
 * @fileoverview Dexie Database Main Export - FACADE
 * @module lib/state/dexie-db
 * @governance EPIC-24-SMC (State Management Consolidation)
 * @ai-observable true
 * @deprecated This module is deprecated. Import from '@/infrastructure/persistence/dexie-db' instead.
 *
 * FACADE MODULE - Re-exports from canonical location for backwards compatibility.
 * 
 * CANONICAL LOCATION: src/infrastructure/persistence/dexie-db.ts
 * 
 * Story 24-SMC-1: Consolidate Dexie Database Files
 * ADR-024: State Management Consolidation - Clean Architecture Pattern
 *
 * **Migration Guide**:
 * - OLD: import { db, getDb, SomeType } from '@/lib/state/dexie-db';
 * - NEW: import { db, getDb, SomeType } from '@/infrastructure/persistence/dexie-db';
 *
 * **What this module provides**:
 * - Re-exports from infrastructure/persistence/dexie-db (canonical)
 * - Dashboard-specific types (unique to lib/state)
 * - SynthesisResultRecord type (unique to lib/state)
 * - Helper function re-exports from dexie-db-helpers/
 */

// ============================================================================
// DEPRECATION WARNING (Development Mode Only)
// ============================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(
        '[DEPRECATED] @/lib/state/dexie-db is deprecated.\n' +
        'Please migrate imports to: @/infrastructure/persistence/dexie-db\n' +
        'See ADR-024: State Management Consolidation for migration guide.'
    );
}

import { type Table } from 'dexie';

// ============================================================================
// Database Instance & Class (re-exported from CANONICAL source)
// ============================================================================

export {
    db,
    getDb,
    ViaGentDatabase,
    resetDatabaseForTesting,
    getRecentProjects,
} from '@/infrastructure/persistence/dexie-db';

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
    frontmatter?: Record<string, unknown>; // Frontmatter for synthesis
    createdAt: number;
    updatedAt: number;
}

export type SynthesisResultsTable = Table<SynthesisResultRecord, string>;

// ============================================================================
// Helper Functions - Re-exported from infrastructure/persistence/dexie-db-helpers/
// ============================================================================

// IDE State Helpers
export {
    getIDEState,
    saveIDEState,
    deleteIDEState,
} from '@/infrastructure/persistence/dexie-db-helpers/ide-state-helpers';

// Sync Status Helpers
export {
    getSyncStatus,
    setSyncStatus,
    updateSyncStatus,
    deleteSyncStatus,
    getSyncStatusByStatus,
} from '@/infrastructure/persistence/dexie-db-helpers/sync-status-helpers-basic';

export {
    getPendingSyncStatus,
    getErrorSyncStatus,
    clearOldSyncStatus,
    getSyncStatusStats,
} from '@/infrastructure/persistence/dexie-db-helpers/sync-status-helpers-query';

// File Metadata Helpers
export {
    getFileMetadata,
    getAllFileMetadata,
    upsertFileMetadata,
    bulkUpsertFileMetadata,
    deleteFileMetadata,
    clearProjectFileMetadata,
    getFilesNeedingSync,
} from '@/infrastructure/persistence/dexie-db-helpers/file-metadata-helpers';

// Additional File Metadata Helpers
export {
    getChangedFilesSince,
    clearFileMetadataCache,
} from '@/infrastructure/persistence/dexie-db-helpers/additional-file-metadata-helpers';

// Tool Execution Log Helpers
export {
    addToolExecutionLog,
    getToolExecutionLogs,
    getToolExecutionLog,
    updateToolExecutionLog,
    getApprovedTools,
    clearOldToolExecutionLogs,
    clearToolExecutionLogs,
} from '@/infrastructure/persistence/dexie-db-helpers/tool-execution-log-helpers';

// FSA Handle Helpers
export {
    storeFSAHandle,
    getFSAHandle,
    updateFSAHandleStatus,
    deleteFSAHandle,
    updateFSAHandlePermission,
    clearAllFSAHandles,
    getAllValidFSAHandles,
} from '@/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers';

// Session Snapshot Helpers
export {
    saveSessionSnapshot,
    getLatestSessionSnapshot,
    deleteSessionSnapshot,
    clearExpiredSessionSnapshots,
    clearProjectSessionSnapshots,
} from '@/infrastructure/persistence/dexie-db-helpers/session-snapshot-helpers';

// Conversation Thread Helpers
export {
    getConversationThread,
    saveConversationThread,
    getMostRecentThread,
    getThreadsForProject,
    deleteConversationThread,
    updateThreadScrollPosition,
} from '@/infrastructure/persistence/dexie-db-helpers/conversation-thread-helpers';

// Source Helpers
export {
    getSource,
    saveSource,
    getSourcesForProject,
    getSourcesByType,
    deleteSource,
    clearProjectSources,
} from '@/infrastructure/persistence/dexie-db-helpers/source-helpers-basic';

export {
    searchSources,
    getSourceStats,
} from '@/infrastructure/persistence/dexie-db-helpers/source-helpers-search';

// Collection Helpers
export {
    getCollectionsForProject,
    getCollection,
    saveCollection,
    createCollection,
    deleteCollection,
} from '@/infrastructure/persistence/dexie-db-helpers/collection-helpers-basic';

export {
    addSourceToCollection,
    removeSourceFromCollection,
    getSourcesForCollection,
} from '@/infrastructure/persistence/dexie-db-helpers/collection-helpers-sources';

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
} from '@/infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-crud';

export {
    createSynthesisResult,
    updateSynthesisResultStatus,
} from '@/infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-create';

// Legacy Helper (for backwards compatibility)
export { queueItemToSyncStatus } from '@/infrastructure/persistence/dexie-db-helpers';


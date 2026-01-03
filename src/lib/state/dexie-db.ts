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
 * Part of Story ARC-1.1: Split dexie-db.ts into helper modules
 */

// ============================================================================
// Database Class
// ============================================================================

import { ViaGentDatabase } from './dexie-db-class';
export { ViaGentDatabase } from './dexie-db-class';

// ============================================================================
// Core Types
// ============================================================================

import type { ProjectRecord } from './dexie-db-core-types';

export type {
    ProjectRecord,
    IDEStateRecord,
    ConversationRecord,
    WorkspaceBindings,
} from './dexie-db-core-types';

export type {
    ProjectsTable,
    IDEStateTable,
    ConversationsTable,
} from './dexie-db-core-types';

// ============================================================================
// AI Foundation Types
// ============================================================================

export type {
    TaskContextRecord,
    ToolExecutionRecord,
    CredentialRecord,
    ThreadToolCallRecord,
    ThreadMessageRecord,
    ConversationThreadRecord,
} from './dexie-db-ai-types';

export type {
    TaskContextTable,
    ToolExecutionTable,
    CredentialsTable,
    ConversationThreadsTable,
} from './dexie-db-ai-types';

// ============================================================================
// Session Types
// ============================================================================

export type {
    PersistedStateRecord,
    SyncStatusRecord,
    FileMetadataRecord,
    ToolExecutionLogRecord,
    FSAHandleRecord,
    SessionSnapshotRecord,
} from './dexie-db-session-types';

export type {
    PersistedStateTable,
    SyncStatusTable,
    FileMetadataTable,
    ToolExecutionLogTable,
    FSAHandleTable,
    SessionSnapshotTable,
} from './dexie-db-session-types';

export {
    generateSyncStatusId,
    generateFileMetadataId,
} from './dexie-db-session-types';

// ============================================================================
// Knowledge Types
// ============================================================================

export type {
    SourceRecord,
    SourceMetadata,
    CollectionRecord,
    Collection,
    OramaIndexRecord,
    EmbeddingModelRecord,
    NoteRecord,
    SynthesisResultRecord,
} from './dexie-db-knowledge-types';

export type {
    SourcesTable,
    CollectionsTable,
    OramaIndexesTable,
    EmbeddingModelsTable,
    NotesTable,
    SynthesisResultsTable,
} from './dexie-db-knowledge-types';

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

// ============================================================================
// Migration Functions
// ============================================================================

export {
    logDexieMigration,
    isMigrationApplied,
    markMigrationApplied,
} from './dexie-db-migrations';

// ============================================================================
// Database Instance & Core Project Functions
// ============================================================================

/**
 * Singleton database instance - lazily initialized to avoid SSR issues
 *
 * @example
 * ```tsx
 * import { getDb } from '@/lib/state';
 *
 * // CRUD operations
 * const db = getDb();
 * if (db) {
 *   await db.projects.add({ id: '1', name: 'My Project', ... });
 *   const project = await db.projects.get('1');
 * }
 * ```
 */

// Internal singleton instance
let dbInstance: ViaGentDatabase | null = null;

/**
 * Get the database instance (SSR-safe)
 * Returns null during server-side rendering
 */
export function getDb(): ViaGentDatabase | null {
    // Check for browser or test environment (has IndexedDB)
    if (typeof window === 'undefined' && typeof indexedDB === 'undefined') return null;
    if (!dbInstance) {
        dbInstance = new ViaGentDatabase();
    }
    return dbInstance;
}

/**
 * Legacy export for backwards compatibility
 * @deprecated Use getDb() instead
 */
export const db = new Proxy({} as ViaGentDatabase, {
    get(_target, prop) {
        const instance = getDb();
        if (!instance) {
            throw new Error('[Dexie] Database not available during SSR. Use getDb() and check for null.');
        }
        return instance[prop as keyof ViaGentDatabase];
    }
});

/**
 * Get all projects, sorted by last opened
 *
 * @param limit - Maximum number of projects to return (default: 10)
 * @returns Array of project records
 */
export async function getRecentProjects(limit = 10): Promise<ProjectRecord[]> {
    const instance = getDb();
    if (!instance) return [];
    return instance.projects
        .orderBy('lastOpened')
        .reverse()
        .limit(limit)
        .toArray();
}

/**
 * Reset database for testing (delete all data)
 *
 * @warning This will delete all data from the database
 */
export async function resetDatabaseForTesting(): Promise<void> {
    const instance = getDb();
    if (!instance) return;
    await instance.delete();
    await instance.open();
}

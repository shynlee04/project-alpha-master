/**
 * @fileoverview Dexie Database Main Export
 * @module lib/state/dexie-db
 * @governance EPIC-27-1c
 * @ai-observable true
 *
 * Main export file for Dexie database.
 * Re-exports all types and the database instance.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

// ============================================================================
// Database Class
// ============================================================================

import { ViaGentDatabase } from './dexie-db-class';
export { ViaGentDatabase } from './dexie-db-class';

// ============================================================================
// Core Types
// ============================================================================

import type {
    ProjectRecord,
    IDEStateRecord,
} from './dexie-db-core-types';

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

import type {
    ConversationThreadRecord,
} from './dexie-db-ai-types';

export type {
    TaskStatus,
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

import type {
    SyncStatusRecord,
    FileMetadataRecord,
    ToolExecutionLogRecord,
    FSAHandleRecord,
    SessionSnapshotRecord,
} from './dexie-db-session-types';

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

import type {
    SourceRecord,
    CollectionRecord,
} from './dexie-db-knowledge-types';

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
} from './dexie-db-knowledge-types';

// ============================================================================
// Workflow Builder Types (Epic E4-7)
// ============================================================================

import type {
    WorkflowRecord,
} from './dexie-db-workflow-types';

export type {
    WorkflowRecord,
    WorkflowsTable,
} from './dexie-db-workflow-types';

// ============================================================================
// Helper Functions
// ============================================================================

export { queueItemToSyncStatus } from './dexie-db-helpers';

// ============================================================================
// Migration Functions
// ============================================================================

export {
    logDexieMigration,
    isMigrationApplied,
    markMigrationApplied,
} from './dexie-db-migrations';

// ==========================================================================
// Database Instance & Export Functions
// ==========================================================================


// ============================================================================
// Database Instance
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
 *
 * NOTE: Database is automatically opened on first access to ensure
 * table properties (projects, ideState, etc.) are available.
 */
export function getDb(): ViaGentDatabase | null {
  if (typeof window === 'undefined') return null;
  if (!dbInstance) {
    dbInstance = new ViaGentDatabase();
    // CRITICAL: Open database synchronously to ensure table properties
    // are available immediately. Without this, accessing db.projects
    // returns undefined because Dexie doesn't attach tables until open().
    // We fire-and-forget since useLiveQuery will handle the async state.
    dbInstance.open().catch((err) => {
      console.error('[Dexie] Failed to open database:', err);
    });
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get IDE state for a project, or create default if not exists
 */
export async function getIDEState(projectId: string): Promise<IDEStateRecord | undefined> {
    return db.ideState.get(projectId);
}

/**
 * Save IDE state for a project
 */
export async function saveIDEState(state: IDEStateRecord): Promise<void> {
    await db.ideState.put({
        ...state,
        updatedAt: new Date(),
    });
}

/**
 * Delete old IDE state (cleanup)
 */
export async function deleteIDEState(projectId: string): Promise<void> {
    await db.ideState.delete(projectId);
}

/**
 * Get all projects, sorted by last opened
 */
export async function getRecentProjects(limit = 10): Promise<ProjectRecord[]> {
    return db.projects
        .orderBy('lastOpened')
        .reverse()
        .limit(limit)
        .toArray();
}

/**
 * Reset database for testing
 */
export async function resetDatabaseForTesting(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    await db.delete();
    await db.open();
}

// ============================================================================
// Sync Status Helpers (RC-005 - Sprint 27B)
// ============================================================================

/**
 * Get sync status for a specific file path
 */
export async function getSyncStatus(filePath: string): Promise<SyncStatusRecord | undefined> {
    const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return db.syncStatus.get(id);
}

/**
 * Set sync status for a file
 */
export async function setSyncStatus(record: Omit<SyncStatusRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const id = `sync-${record.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await db.syncStatus.put({
        ...record,
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
}

/**
 * Update sync status by file path
 */
export async function updateSyncStatus(
    filePath: string,
    updates: Partial<Omit<SyncStatusRecord, 'id' | 'path'>>
): Promise<void> {
    const existing = await getSyncStatus(filePath);
    if (existing) {
        const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await db.syncStatus.update(id, { ...updates, updatedAt: Date.now() });
    }
}

/**
 * Delete sync status for a file
 */
export async function deleteSyncStatus(filePath: string): Promise<void> {
    const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await db.syncStatus.delete(id);
}

/**
 * Get all sync status items by status
 */
export async function getSyncStatusByStatus(status: SyncStatusRecord['syncStatus']): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals(status).toArray();
}

/**
 * Get all pending sync status items
 */
export async function getPendingSyncStatus(): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals('pending').toArray();
}

/**
 * Get all error sync status items
 */
export async function getErrorSyncStatus(): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals('error').toArray();
}

/**
 * Clear old sync status entries (older than 7 days)
 */
export async function clearOldSyncStatus(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    const oldEntries = await db.syncStatus
        .where('updatedAt')
        .below(cutoff)
        .toArray();

    for (const entry of oldEntries) {
        await db.syncStatus.delete(entry.id);
    }

    return oldEntries.length;
}

/**
 * Get sync status statistics
 */
export async function getSyncStatusStats(): Promise<{
    total: number;
    pending: number;
    syncing: number;
    synced: number;
    error: number;
    conflict: number;
}> {
    const all = await db.syncStatus.toArray();
    return {
        total: all.length,
        pending: all.filter((s) => s.syncStatus === 'pending').length,
        syncing: all.filter((s) => s.syncStatus === 'syncing').length,
        synced: all.filter((s) => s.syncStatus === 'synced').length,
        error: all.filter((s) => s.syncStatus === 'error').length,
        conflict: all.filter((s) => s.syncStatus === 'conflict').length,
    };
}

// ============================================================================
// Epic 24: File Metadata Helpers (Story 24-1)
// ============================================================================

/**
 * Get file metadata for a specific file in a project
 */
export async function getFileMetadata(
    projectId: string,
    filePath: string
): Promise<FileMetadataRecord | undefined> {
    return db.fileMetadata
        .where('[projectId+path]')
        .equals([projectId, filePath])
        .first();
}

/**
 * Get all file metadata for a project
 */
export async function getAllFileMetadata(
    projectId: string
): Promise<FileMetadataRecord[]> {
    return db.fileMetadata.where('projectId').equals(projectId).toArray();
}

/**
 * Upsert file metadata (insert or update)
 */
export async function upsertFileMetadata(
    record: Omit<FileMetadataRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
    const now = Date.now();
    const existing = await getFileMetadata(record.projectId, record.path);

    await db.fileMetadata.put({
        ...record,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

/**
 * Bulk upsert file metadata for efficient syncing
 */
export async function bulkUpsertFileMetadata(
    records: Omit<FileMetadataRecord, 'createdAt' | 'updatedAt'>[]
): Promise<void> {
    const now = Date.now();
    const enrichedRecords = records.map((record) => ({
        ...record,
        createdAt: now,
        updatedAt: now,
    }));

    await db.fileMetadata.bulkPut(enrichedRecords);
}

/**
 * Delete file metadata
 */
export async function deleteFileMetadata(
    projectId: string,
    filePath: string
): Promise<void> {
    await db.fileMetadata
        .where('[projectId+path]')
        .equals([projectId, filePath])
        .delete();
}

/**
 * Clear all file metadata for a project
 */
export async function clearProjectFileMetadata(projectId: string): Promise<number> {
    return db.fileMetadata.where('projectId').equals(projectId).delete();
}

/**
 * Get files that need syncing (lastModified > syncedAt)
 */
export async function getFilesNeedingSync(projectId: string): Promise<FileMetadataRecord[]> {
    const allFiles = await getAllFileMetadata(projectId);
    return allFiles.filter((f) => f.lastModified > f.syncedAt);
}

// ============================================================================
// Epic 24: Tool Execution Log Helpers (Story 24-4)
// ============================================================================

/**
 * Add a tool execution log entry
 */
export async function addToolExecutionLog(
    record: Omit<ToolExecutionLogRecord, 'createdAt'>
): Promise<string> {
    const enrichedRecord: ToolExecutionLogRecord = {
        ...record,
        createdAt: Date.now(),
    };

    await db.toolExecutionLogs.put(enrichedRecord);
    return record.id;
}

/**
 * Get all tool execution logs for a conversation
 */
export async function getToolExecutionLogs(
    conversationId: string
): Promise<ToolExecutionLogRecord[]> {
    return db.toolExecutionLogs
        .where('conversationId')
        .equals(conversationId)
        .sortBy('timestamp');
}

/**
 * Get tool execution log by ID
 */
export async function getToolExecutionLog(
    id: string
): Promise<ToolExecutionLogRecord | undefined> {
    return db.toolExecutionLogs.get(id);
}

/**
 * Update tool execution log (e.g., after execution completes)
 */
export async function updateToolExecutionLog(
    id: string,
    updates: Partial<Omit<ToolExecutionLogRecord, 'id' | 'createdAt'>>
): Promise<void> {
    await db.toolExecutionLogs.update(id, updates);
}

/**
 * Get approved tools from a conversation (for session trust)
 */
export async function getApprovedTools(
    conversationId: string
): Promise<string[]> {
    const logs = await db.toolExecutionLogs
        .where('conversationId')
        .equals(conversationId)
        .filter((log) => log.approved && log.status === 'executed')
        .toArray();

    return [...new Set(logs.map((log) => log.toolName))];
}

/**
 * Clear old tool execution logs (older than 30 days)
 */
export async function clearOldToolExecutionLogs(
    maxAgeMs = 30 * 24 * 60 * 60 * 1000
): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    return db.toolExecutionLogs.where('timestamp').below(cutoff).delete();
}

/**
 * Clear all tool execution logs for a specific conversation, or all logs if no conversationId provided
 */
export async function clearToolExecutionLogs(
    conversationId?: string
): Promise<void> {
    if (conversationId) {
        await db.toolExecutionLogs
            .where('conversationId')
            .equals(conversationId)
            .delete();
    } else {
        await db.toolExecutionLogs.clear();
    }
}

// ============================================================================
// Epic 24: FSA Handle Helpers (Story 24-2)
// ============================================================================

/**
 * Store FSA handle for a project
 */
export async function storeFSAHandle(
    record: Omit<FSAHandleRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
    const now = Date.now();
    const existing = await db.fsaHandles.get(record.projectId);

    await db.fsaHandles.put({
        ...record,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

/**
 * Get FSA handle for a project
 */
export async function getFSAHandle(
    projectId: string
): Promise<FSAHandleRecord | undefined> {
    return db.fsaHandles.get(projectId);
}

/**
 * Update FSA handle permission status
 */
export async function updateFSAHandleStatus(
    projectId: string,
    status: FSAHandleRecord['permissionStatus']
): Promise<void> {
    await db.fsaHandles.update(projectId, {
        permissionStatus: status,
        lastAccessedAt: Date.now(),
        updatedAt: Date.now(),
    });
}

/**
 * Delete FSA handle (e.g., when revoked)
 */
export async function deleteFSAHandle(projectId: string): Promise<void> {
    await db.fsaHandles.delete(projectId);
}

/**
 * Update FSA handle permission status
 */
export async function updateFSAHandlePermission(
    projectId: string,
    status: FSAHandleRecord['permissionStatus']
): Promise<void> {
    await db.fsaHandles.update(projectId, {
        permissionStatus: status,
        updatedAt: Date.now()
    });
}

/**
 * Clear all FSA handles (privacy operation)
 */
export async function clearAllFSAHandles(): Promise<void> {
    await db.fsaHandles.clear();
}

/**
 * Get all valid FSA handles (for dashboard display)
 */
export async function getAllValidFSAHandles(): Promise<FSAHandleRecord[]> {
    return db.fsaHandles
        .where('permissionStatus')
        .equals('granted')
        .toArray();
}

// ============================================================================
// Epic 24: Session Snapshot Helpers (Story 24-5)
// ============================================================================

/**
 * Save session snapshot
 */
export async function saveSessionSnapshot(
    record: Omit<SessionSnapshotRecord, 'createdAt' | 'expiresAt'>
): Promise<void> {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    await db.sessionSnapshots.put({
        ...record,
        createdAt: now,
        expiresAt: now + sevenDays,
    });
}

/**
 * Get latest session snapshot for a project
 */
export async function getLatestSessionSnapshot(
    projectId: string
): Promise<SessionSnapshotRecord | undefined> {
    const now = Date.now();
    const snapshots = await db.sessionSnapshots
        .where('[projectId+createdAt]')
        .between([projectId, 0], [projectId, now])
        .reverse()
        .limit(1)
        .toArray();

    // Return only if not expired
    const snapshot = snapshots[0];
    if (snapshot && snapshot.expiresAt > now) {
        return snapshot;
    }
    return undefined;
}

/**
 * Delete session snapshot
 */
export async function deleteSessionSnapshot(id: string): Promise<void> {
    await db.sessionSnapshots.delete(id);
}

/**
 * Clear expired session snapshots
 */
export async function clearExpiredSessionSnapshots(): Promise<number> {
    const now = Date.now();
    return db.sessionSnapshots.where('expiresAt').below(now).delete();
}

/**
 * Clear all session snapshots for a project
 */
export async function clearProjectSessionSnapshots(projectId: string): Promise<number> {
    return db.sessionSnapshots.where('projectId').equals(projectId).delete();
}

// ============================================================================
// Epic 24: Additional File Metadata Helpers (Story 24-1)
// Missing exports required by file-metadata-cache.ts
// ============================================================================

/**
 * Get files that have been changed since a given timestamp.
 * Used by FileMetadataCache for incremental sync detection.
 * 
 * @param sinceTimestamp - Unix timestamp to check changes since
 * @returns Array of file metadata records modified after the timestamp
 */
export async function getChangedFilesSince(sinceTimestamp: number): Promise<FileMetadataRecord[]> {
    return db.fileMetadata
        .where('lastModified')
        .above(sinceTimestamp)
        .toArray();
}

/**
 * Clear all file metadata cache entries.
 * Used when resetting sync state or clearing project data.
 */
export async function clearFileMetadataCache(): Promise<void> {
    await db.fileMetadata.clear();
}

// ============================================================================
// Epic 24: Conversation Thread Helpers (Story 24-3)
// ============================================================================

/**
 * Get a conversation thread by ID.
 * 
 * @param threadId - The ID of the thread to retrieve
 * @returns The thread record or undefined if not found
 */
export async function getConversationThread(
    threadId: string
): Promise<ConversationThreadRecord | undefined> {
    return db.threads.get(threadId);
}

/**
 * Save a conversation thread (insert or update).
 * 
 * @param thread - The thread record to save
 */
export async function saveConversationThread(
    thread: ConversationThreadRecord
): Promise<void> {
    await db.threads.put(thread);
}

/**
 * Get the most recent conversation thread for a project.
 * 
 * @param projectId - The project ID to query
 * @returns The most recently updated thread or undefined if none exist
 */
export async function getMostRecentThread(
    projectId: string
): Promise<ConversationThreadRecord | undefined> {
    const threads = await db.threads
        .where('projectId')
        .equals(projectId)
        .sortBy('updatedAt');

    // Return the last element (most recent)
    return threads.length > 0 ? threads[threads.length - 1] : undefined;
}

/**
 * Get all threads for a project sorted by most recently updated.
 * 
 * @param projectId - The project ID to query
 * @returns Array of threads sorted by updatedAt descending
 */
export async function getThreadsForProject(
    projectId: string
): Promise<ConversationThreadRecord[]> {
    const threads = await db.threads
        .where('projectId')
        .equals(projectId)
        .sortBy('updatedAt');

    // Reverse to get most recent first
    return threads.reverse();
}

/**
 * Delete a conversation thread.
 * 
 * @param threadId - The ID of the thread to delete
 */
export async function deleteConversationThread(
    threadId: string
): Promise<void> {
    await db.threads.delete(threadId);
}

/**
 * Update scroll position for a thread.
 *
 * @param threadId - The thread ID
 * @param scrollPosition - The new scroll position
 */
export async function updateThreadScrollPosition(
    threadId: string,
    scrollPosition: number
): Promise<void> {
    await db.threads.update(threadId, {
        scrollPosition,
        updatedAt: Date.now(),
    });
}

// ============================================================================
// Epic 6: Source Ingestion Helpers (Story 6-1)
// ============================================================================

/**
 * Get a source by ID.
 *
 * @param sourceId - The ID of the source to retrieve
 * @returns The source record or undefined if not found
 */
export async function getSource(
    sourceId: string
): Promise<SourceRecord | undefined> {
    return db.sources.get(sourceId);
}

/**
 * Save a source (insert or update).
 *
 * @param source - The source record to save
 */
export async function saveSource(
    source: SourceRecord
): Promise<void> {
    await db.sources.put({
        ...source,
        updatedAt: Date.now(),
    });
}

/**
 * Get all sources for a project sorted by most recently created.
 *
 * @param projectId - The project ID to query
 * @returns Array of sources sorted by createdAt descending
 */
export async function getSourcesForProject(
    projectId: string
): Promise<SourceRecord[]> {
    const sources = await db.sources
        .where('projectId')
        .equals(projectId)
        .sortBy('createdAt');

    // Reverse to get most recent first
    return sources.reverse();
}

/**
 * Get sources by type for a project.
 *
 * @param projectId - The project ID
 * @param type - The source type filter
 * @returns Array of sources matching the type
 */
export async function getSourcesByType(
    projectId: string,
    type: SourceRecord['type']
): Promise<SourceRecord[]> {
    return db.sources
        .where('[projectId+type]')
        .equals([projectId, type])
        .toArray();
}

/**
 * Delete a source.
 *
 * @param sourceId - The ID of the source to delete
 */
export async function deleteSource(
    sourceId: string
): Promise<void> {
    await db.sources.delete(sourceId);
}

/**
 * Clear all sources for a project.
 *
 * @param projectId - The project ID
 * @returns Number of sources deleted
 */
export async function clearProjectSources(projectId: string): Promise<number> {
    return db.sources.where('projectId').equals(projectId).delete();
}

/**
 * Search sources by content (full-text search).
 *
 * @param projectId - The project ID
 * @param query - Search query string
 * @returns Array of sources containing the query in title or content
 */
export async function searchSources(
    projectId: string,
    query: string
): Promise<SourceRecord[]> {
    const allSources = await getSourcesForProject(projectId);
    const lowerQuery = query.toLowerCase();

    return allSources.filter(source =>
        source.title.toLowerCase().includes(lowerQuery) ||
        source.content.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get source statistics for a project.
 *
 * @param projectId - The project ID
 * @returns Object with counts by type and total
 */
export async function getSourceStats(
    projectId: string
): Promise<{
    total: number;
    pdf: number;
    url: number;
    text: number;
}> {
    const allSources = await getSourcesForProject(projectId);

    return {
        total: allSources.length,
        pdf: allSources.filter(s => s.type === 'pdf').length,
        url: allSources.filter(s => s.type === 'url').length,
        text: allSources.filter(s => s.type === 'text').length,
    };
}

// ============================================================================
// Epic 6: Collection Helpers (Story 6-3)
// ============================================================================

/**
 * Get all collections for a project.
 *
 * @param projectId - The project ID
 * @returns Array of collections sorted by name
 */
export async function getCollectionsForProject(
    projectId: string
): Promise<CollectionRecord[]> {
    const collections = await db.collections
        .where('projectId')
        .equals(projectId)
        .sortBy('name');

    return collections;
}

/**
 * Get a collection by ID.
 *
 * @param collectionId - The ID of the collection to retrieve
 * @returns The collection record or undefined if not found
 */
export async function getCollection(
    collectionId: string
): Promise<CollectionRecord | undefined> {
    return db.collections.get(collectionId);
}

/**
 * Save a collection (insert or update).
 *
 * @param collection - The collection record to save
 */
export async function saveCollection(
    collection: CollectionRecord
): Promise<void> {
    await db.collections.put({
        ...collection,
        updatedAt: Date.now(),
    });
}

/**
 * Create a new collection.
 *
 * @param projectId - The project ID
 * @param name - The collection name
 * @returns The created collection ID
 */
export async function createCollection(
    projectId: string,
    name: string
): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();

    await db.collections.add({
        id,
        projectId,
        name,
        sourceIds: [],
        createdAt: now,
        updatedAt: now,
    });

    return id;
}

/**
 * Delete a collection.
 *
 * @param collectionId - The ID of the collection to delete
 */
export async function deleteCollection(
    collectionId: string
): Promise<void> {
    await db.collections.delete(collectionId);
}

/**
 * Add a source to a collection.
 *
 * @param collectionId - The collection ID
 * @param sourceId - The source ID
 */
export async function addSourceToCollection(
    collectionId: string,
    sourceId: string
): Promise<void> {
    const collection = await db.collections.get(collectionId);
    if (!collection) return;

    if (!collection.sourceIds.includes(sourceId)) {
        await db.collections.update(collectionId, {
            sourceIds: [...collection.sourceIds, sourceId],
            updatedAt: Date.now(),
        });
    }
}

/**
 * Remove a source from a collection.
 *
 * @param collectionId - The collection ID
 * @param sourceId - The source ID
 */
export async function removeSourceFromCollection(
    collectionId: string,
    sourceId: string
): Promise<void> {
    const collection = await db.collections.get(collectionId);
    if (!collection) return;

    await db.collections.update(collectionId, {
        sourceIds: collection.sourceIds.filter(id => id !== sourceId),
        updatedAt: Date.now(),
    });
}

/**
 * Get sources for a collection.
 *
 * @param collectionId - The collection ID
 * @returns Array of sources in the collection
 */
export async function getSourcesForCollection(
    collectionId: string
): Promise<SourceRecord[]> {
    const collection = await db.collections.get(collectionId);
    if (!collection || collection.sourceIds.length === 0) return [];

    const sources = await db.sources.bulkGet(collection.sourceIds);
    return sources.filter((s): s is SourceRecord => s !== undefined && !s.deleted);
}

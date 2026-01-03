/**
 * @fileoverview Dexie Database Types Facade
 * @module lib/state/dexie-db-types
 * @epic ARC-DUP - Eliminate Dexie Duplication
 * @story ARC-DUP.2 - Move dexie type files to infrastructure/persistence
 *
 * Facade for backwards compatibility.
 * Re-exports all dexie types from infrastructure/persistence (canonical location).
 *
 * **Why**: After consolidating dexie type files to infrastructure/persistence,
 * this facade maintains backwards compatibility for existing imports.
 *
 * **Canonical Location**: src/infrastructure/persistence/
 * **Facade Location**: src/lib/state/dexie-db-types.ts
 */

// ============================================================================
// Dexie Database Types (re-exported from infrastructure/persistence)
// ============================================================================

export type {
    ProjectRecord,
    IDEStateRecord,
    ConversationRecord,
    WorkspaceBindings,
    FileSnapshotRecord,
    FileContentCacheRecord,
} from '@/infrastructure/persistence/dexie-db-core-types';

export type {
    ProjectsTable,
    IDEStateTable,
    ConversationsTable,
    FileSnapshotsTable,
    FileContentCacheTable,
} from '@/infrastructure/persistence/dexie-db-core-types';

export type {
    TaskContextRecord,
    ToolExecutionRecord,
    CredentialRecord,
    ThreadToolCallRecord,
    ThreadMessageRecord,
    ConversationThreadRecord,
} from '@/infrastructure/persistence/dexie-db-ai-types';

export type {
    TaskContextTable,
    ToolExecutionTable,
    CredentialsTable,
    ConversationThreadsTable,
} from '@/infrastructure/persistence/dexie-db-ai-types';

export type {
    PersistedStateRecord,
    SyncStatusRecord,
    FileMetadataRecord,
    ToolExecutionLogRecord,
    FSAHandleRecord,
    SessionSnapshotRecord,
} from '@/infrastructure/persistence/dexie-db-session-types';

export type {
    PersistedStateTable,
    SyncStatusTable,
    FileMetadataTable,
    ToolExecutionLogTable,
    FSAHandleTable,
    SessionSnapshotTable,
} from '@/infrastructure/persistence/dexie-db-session-types';

export type {
    SourceRecord,
    SourceMetadata,
    CollectionRecord,
    Collection,
    OramaIndexRecord,
    EmbeddingModelRecord,
    NoteRecord,
} from '@/infrastructure/persistence/dexie-db-knowledge-types';

// NOTE: SynthesisResultRecord and SynthesisResultsTable are NOT exported here
// because they don't exist in infrastructure/persistence/dexie-db-knowledge-types
// These types remain lib/state specific and need further investigation
// See: _bmad-output/sprint-artifacts/ARC-DUP.2-synthesis-results-gap.md

export type {
    SourcesTable,
    CollectionsTable,
    OramaIndexesTable,
    EmbeddingModelsTable,
    NotesTable,
} from '@/infrastructure/persistence/dexie-db-knowledge-types';

export { ViaGentDatabase } from '@/infrastructure/persistence/dexie-db-class';

export {
    logDexieMigration,
    isMigrationApplied,
    markMigrationApplied,
} from '@/infrastructure/persistence/dexie-db-migrations';

export { db, getDb, getRecentProjects, resetDatabaseForTesting } from '@/infrastructure/persistence/dexie-db';

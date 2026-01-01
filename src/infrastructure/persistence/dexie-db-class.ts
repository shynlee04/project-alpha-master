/**
 * @fileoverview ViaGent Database Class Definition
 * @module lib/state/dexie-db-class
 * @governance EPIC-27-1c
 * @ai-observable true
 *
 * Main database class definition with table declarations.
 * Migrations are extracted to dexie-db-migrations.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import Dexie, { /* type Table */ } from 'dexie';

// Import table types (Record types not used directly in this file)
import type {
    ProjectsTable,
    IDEStateTable,
    ConversationsTable,
    FileSnapshotsTable,
    FileContentCacheTable,
} from './dexie-db-core-types';

import type {
    TaskContextTable,
    ToolExecutionTable,
    CredentialsTable,
    ConversationThreadsTable,
} from './dexie-db-ai-types';

import type {
    PersistedStateTable,
    SyncStatusTable,
    FileMetadataTable,
    ToolExecutionLogTable,
    FSAHandleTable,
    SessionSnapshotTable,
} from './dexie-db-session-types';

import type {
    SourcesTable,
    CollectionsTable,
    OramaIndexesTable,
    EmbeddingModelsTable,
    NotesTable,
} from './dexie-db-knowledge-types';

// Import migrations
import { registerMigrations } from './dexie-db-migrations';

// ============================================================================
// ViaGent Database Class
// ============================================================================

/**
 * Via-Gent Dexie Database
 *
 * Provides type-safe access to IndexedDB tables with automatic
 * schema versioning and migration support.
 *
 * @ai-observable Database supports AI agent task tracking
 * @governance EPIC-27-1c
 */
export class ViaGentDatabase extends Dexie {
    // ========================================================================
    // Core Tables
    // ========================================================================

    projects!: ProjectsTable;
    ideState!: IDEStateTable;
    conversations!: ConversationsTable;

    // ========================================================================
    // AI Foundation Tables (Epic 25 Prep)
    // ========================================================================

    taskContexts!: TaskContextTable;
    toolExecutions!: ToolExecutionTable;

    // Provider Credentials (Story 25-0)
    credentials!: CredentialsTable;

    // Conversation Threads (MVP-2)
    threads!: ConversationThreadsTable;

    // ========================================================================
    // State Persistence Tables (Epic 25)
    // ========================================================================

    providerConfigs!: PersistedStateTable;
    agentConfigs!: PersistedStateTable;
    conversationState!: PersistedStateTable;

    // ========================================================================
    // Sync Status Tables (RC-005 - Sprint 27B)
    // ========================================================================

    syncStatus!: SyncStatusTable;
    fileSyncStatus!: PersistedStateTable;

    // ========================================================================
    // Epic 24: Performance & UX Optimization Tables
    // ========================================================================

    fileMetadata!: FileMetadataTable;
    toolExecutionLogs!: ToolExecutionLogTable;
    fsaHandles!: FSAHandleTable;
    sessionSnapshots!: SessionSnapshotTable;

    // ========================================================================
    // Story WB-2: File Snapshot Store Tables
    // ========================================================================

    fileSnapshots!: FileSnapshotsTable;
    fileContentCache!: FileContentCacheTable;

    // ========================================================================
    // Epic 6: Source Ingestion & Management Tables
    // ========================================================================

    sources!: SourcesTable;
    collections!: CollectionsTable;

    // ========================================================================
    // Epic 7: RAG Infrastructure Tables
    // ========================================================================

    oramaIndexes!: OramaIndexesTable;
    embedding_models!: EmbeddingModelsTable;

    // ========================================================================
    // Epic 26: Notes Tables
    // ========================================================================

    notes!: NotesTable;

    // ========================================================================
    // Constructor
    // ========================================================================

    constructor() {
        // DB name matches legacy 'via-gent-persistence' for data continuity
        super('via-gent-persistence');

        // Register all migrations
        registerMigrations(this);
    }
}

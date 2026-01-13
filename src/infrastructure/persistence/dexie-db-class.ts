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
    SynthesisResultsTable,
    OramaIndexesTable,
    EmbeddingModelsTable,
    NotesTable,
} from './dexie-db-knowledge-types';

import type {
    WorkflowsTable,
} from './dexie-db-workflow-types';

import type {
    CodeSnippetsTable,
} from './dexie-db-snippet-types';

import type {
    SavedBlocksTable,
} from './dexie-db-block-types';

import type {
    PluginsTable,
    PluginSettingsTable,
    PluginMarketplaceTable,
    PluginStorageTable,
} from './dexie-db-plugin-types';

import type {
    FlashcardsTable,
    FlashcardSetsTable,
    StudySessionsTable,
    StudyCardsTable,
    QuizzesTable,
    QuizQuestionsTable,
} from './dexie-db-study-types';

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
    ragState!: PersistedStateTable;

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
    synthesisResults!: SynthesisResultsTable;

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
    // Epic E4-7: Workflow Builder Tables
    // ========================================================================

    workflows!: WorkflowsTable;

    // ========================================================================
    // Story S-031: Code Snippets Manager Tables
    // ========================================================================

    codeSnippets!: CodeSnippetsTable;

    // ========================================================================
    // Story UX-13: Database Backed Blocks Tables
    // ========================================================================

    savedBlocks!: SavedBlocksTable;

    // ========================================================================
    // Story S-037: Plugin System Tables
    // ========================================================================

    plugins!: PluginsTable;
    pluginSettings!: PluginSettingsTable;
    pluginMarketplace!: PluginMarketplaceTable;
    pluginStorage!: PluginStorageTable;

    // ========================================================================
    // EPIC-CC-01 PS-03: Consolidated Study Tables
    // Migrated from FlashcardDB, StudyDB, QuizDB
    // ========================================================================

    flashcards!: FlashcardsTable;
    flashcardSets!: FlashcardSetsTable;
    studySessions!: StudySessionsTable;
    studyCards!: StudyCardsTable;
    quizzes!: QuizzesTable;
    quizQuestions!: QuizQuestionsTable;

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

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Singleton database instance for application-wide access.
 * Provides a single connection point to the IndexedDB database.
 */
export const dexieDB = new ViaGentDatabase();

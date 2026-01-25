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
    DiagnosticTracesTable,
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

// ============================================================================
// ARC-B03: IDBGateway File Storage Types
// ============================================================================

import type {
    IDBFilesTable,
} from './dexie-db-idb-file-types';

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
    // ROOT CAUSE FIX (2026-01-20): Workspace State Table
    // Creates dedicated workspaceState table for proper project scoping per ADR-033 D6

    providerConfigs!: PersistedStateTable;
    agentConfigs!: PersistedStateTable;
    conversationState!: PersistedStateTable;
    ragState!: PersistedStateTable;
    workspaceState!: PersistedStateTable;

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
    // ARCH-01-06: Diagnostic Traces Table
    // ========================================================================

    diagnosticTraces!: DiagnosticTracesTable;

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
    // ARC-B03: IDBGateway File Storage (Mobile/Tablet)
    // ========================================================================

    idbFiles!: IDBFilesTable;

    // ========================================================================
    // STATE-009 FIX: Terminal State Persistence (2026-01-19)
    // Migrated from localStorage to Dexie
    // ========================================================================

    terminalState!: PersistedStateTable;

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
// ROOT CAUSE FIX (2026-01-20): Migration to move workspace state from providerConfigs to workspaceState table
export const MIGRATION_WORKSPACE_STATE_TO_DEDICATED_TABLE = async (db: ViaGentDatabase) => {
  console.log('[Migration] Moving workspace state from providerConfigs to workspaceState table...');

  try {
    // Step 1: Read all existing workspace state from providerConfigs
    const allStates = await db.providerConfigs.toArray();
    const workspaceStates = allStates.filter((r) => r.id === 'workspace-state');

    if (workspaceStates.length === 0) {
      console.log('[Migration] No workspace state found, migration complete');
      return;
    }

    console.log(`[Migration] Found ${workspaceStates.length} workspace state records to migrate`);

    // Step 2: Create workspaceState table if it doesn't exist
    // The table will be auto-created on first put operation

    // Step 3: Write to workspaceState table
    for (const state of workspaceStates) {
      await db.workspaceState.add({
        id: state.id,  // PersistedStateRecord format: id, state, updatedAt
        state: state.state,  // actual state data
        updatedAt: state.updatedAt || new Date(),
      });
    }

    // Step 4: Verify migration
    const workspaceStatesInDedicated = await db.workspaceState.toArray();
    console.log(`[Migration] Verified ${workspaceStatesInDedicated.length} records in workspaceState table`);

    if (workspaceStatesInDedicated.length !== workspaceStates.length) {
      throw new Error(`Migration verification failed: Expected ${workspaceStates.length}, got ${workspaceStatesInDedicated.length}`);
    }

    console.log('[Migration] ✅ Workspace state migrated successfully from providerConfigs to workspaceState table');
  } catch (error) {
    console.error('[Migration] Failed to migrate workspace state:', error);
    throw error;
  }
};

export const dexieDB = new ViaGentDatabase();

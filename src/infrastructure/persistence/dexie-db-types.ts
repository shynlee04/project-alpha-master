/**
 * @fileoverview Dexie Database Types Barrel Export
 * @module infrastructure/persistence/dexie-db-types
 * @governance Epic 53 Story 53-2
 * 
 * Re-exports all database record types for convenient imports.
 * This barrel file consolidates types from:
 * - dexie-db-core-types.ts
 * - dexie-db-ai-types.ts
 * - dexie-db-session-types.ts
 * - dexie-db-knowledge-types.ts
 */

// Core Types (Projects, IDE State)
export type {
    ProjectRecord,
    IDEStateRecord,
    FileSnapshotRecord,
    FileContentCacheRecord,
} from './dexie-db-core-types';

// Workspace Type (shared across the application)
export type { WorkspaceId } from './dexie-db-core-types';

// AI Types (Conversations, Threads)
export type {
    ConversationThreadRecord,
    ThreadMessageRecord,
} from './dexie-db-ai-types';

// Session Types (Sync, Files, Logs)
export type {
    SyncStatusRecord,
    FileMetadataRecord,
    ToolExecutionLogRecord,
    FSAHandleRecord,
    SessionSnapshotRecord,
} from './dexie-db-session-types';

// Knowledge Types (Sources, Collections, Synthesis)
export type {
    SourceRecord,
    CollectionRecord,
    SynthesisResultRecord,
} from './dexie-db-knowledge-types';

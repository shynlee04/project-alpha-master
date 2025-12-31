/**
 * @fileoverview File Sync Service Module
 * @module lib/filesync
 *
 * Abstract file sync service with workspace-specific implementations.
 *
 * @epic CW-01 - Abstract File Sync Service
 */

// Types
export type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncError,
    SyncOptions,
    WorkspaceType,
    SyncStatus,
    FileSyncConfig
} from './file-sync-service';

// IDE Implementation
export { IDEFileSyncService, createIDEFileSyncService } from './ide-file-sync-service';
export type { IDEFileSyncConfig } from './ide-file-sync-service';

// Knowledge Implementation
export { KnowledgeFileSyncService, createKnowledgeFileSyncService } from './knowledge-file-sync-service';
export type { KnowledgeFileSyncConfig } from './knowledge-file-sync-service';

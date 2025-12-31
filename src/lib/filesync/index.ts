/**
 * @fileoverview File Sync Service Module
 * @module lib/filesync
 *
 * Abstract file sync service with workspace-specific implementations.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @epic CW-02 - Project → Knowledge Sync
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

// Project → Knowledge Sync
export {
    ProjectKnowledgeSync,
    createProjectKnowledgeSync,
    DEFAULT_SYNC_CONFIG
} from './project-knowledge-sync';
export type {
    SyncConfig,
    ProjectKnowledgeSyncResult
} from './project-knowledge-sync';

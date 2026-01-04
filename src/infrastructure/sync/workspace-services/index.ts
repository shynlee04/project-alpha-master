/**
 * @fileoverview File Sync Service Module (MIGRATED)
 * @module infrastructure/sync/workspace-services
 *
 * Abstract file sync service with workspace-specific implementations.
 * MIGRATED from: src/lib/filesync
 *
 * @epic CW-01 - Abstract File Sync Service
 * @epic CW-02 - Project → Knowledge Sync
 * @migration 2026-01-04
 */

// Types
export type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncOptions,
    WorkspaceType,
    SyncStatus,
    FileSyncConfig
} from './file-sync-service';

// Re-export SyncError from canonical location
export type { SyncError } from '@/lib/filesystem/sync-types';

// IDE Implementation
export { IDEFileSyncService, createIDEFileSyncService } from './ide-file-sync-service';
export type { IDEFileSyncConfig } from './ide-file-sync-service';

// Knowledge Implementation
export { KnowledgeFileSyncService, createKnowledgeFileSyncService } from './knowledge-file-sync-service';
export type { KnowledgeFileSyncConfig } from './knowledge-file-sync-service';

// Notes Implementation
export { NotesFileSyncService, createNotesFileSyncService } from './notes-file-sync-service';
export type { NotesFileSyncConfig } from './notes-file-sync-service';

// Study Implementation
export { StudyFileSyncService, createStudyFileSyncService } from './study-file-sync-service';
export type { StudyFileSyncConfig } from './study-file-sync-service';

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

// Cross-workspace file references
export {
    CrossWorkspaceReferenceManager,
    createCrossWorkspaceReferenceManager
} from './cross-workspace-file-references';
export type {
    CrossWorkspaceFileReference,
    ReferenceType,
    BrokenReferenceReason,
    ResolvedReference,
    CreateReferenceOptions
} from './cross-workspace-file-references';

// Hooks
export { useFileSyncService } from './hooks';
export type { UseFileSyncServiceOptions, UseFileSyncServiceResult } from './hooks';

// Dev/test utilities (for backward compatibility)
export { useMockSyncEvents, mockSyncEmit, mockSyncError } from './__tests__/mock-sync-events';

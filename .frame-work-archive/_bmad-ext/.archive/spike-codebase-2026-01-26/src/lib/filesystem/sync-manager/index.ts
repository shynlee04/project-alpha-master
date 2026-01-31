/**
 * @fileoverview Sync Manager Module
 * @module lib/filesystem/sync-manager
 *
 * Provides synchronization between the local file system (via File System Access API)
 * and WebContainers' in-memory file system.
 *
 * **Sync Strategy:**
 * - Local FS is the source of truth
 * - WebContainers mirrors the local file system
 * - Initial sync: Local FS → WebContainers (via mount)
 * - File save: Dual write to both systems
 * - Incremental sync: Uses FileMetadataCache to detect changed files
 *
 * **Exclusions:**
 * - .git directory (not needed in WebContainers, will be regenerated)
 * - node_modules (regenerated via npm install)
 * - System files (.DS_Store, Thumbs.db)
 */

// Types
export type {
    SyncConfig,
    SyncProgress,
    SyncResult,
    SyncStatus,
} from './sync-manager-types';
export { SyncError } from './sync-manager-types';

// Main SyncManager class
export { SyncManager } from './sync-manager';

// Factory function
export { createSyncManager } from './sync-manager-factory';

// Batch operations
export { syncToWebContainer, incrementalSyncToWebContainer } from './sync-batch-sync';

// Individual file operations
export {
    writeFile,
    deleteFile,
    createDirectory,
    deleteDirectory,
} from './sync-file-ops';

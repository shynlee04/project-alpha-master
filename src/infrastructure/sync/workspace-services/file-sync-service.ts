/**
 * @fileoverview Abstract File Sync Service Interface
 * @module lib/filesync/file-sync-service
 *
 * Abstract interface for file synchronization operations across workspaces.
 *
 * @epic CW-01 - Abstract File Sync Service
 */

import type { SyncError } from '@/lib/filesystem/sync-types';

/**
 * File metadata from sync operations
 */
export interface FileMetadata {
    path: string;
    size: number;
    lastModified: number;
    contentType?: string;
}

/**
 * File change event from watcher
 */
export interface FileChangeEvent {
    type: 'created' | 'modified' | 'deleted';
    path: string;
    timestamp: number;
}

/**
 * Sync operation result
 */
export interface SyncResult {
    success: boolean;
    filesProcessed: number;
    errors: SyncError[];
    duration: number;
}

/**
 * Sync options for fine-tuning behavior
 */
export interface SyncOptions {
    exclusions?: string[];
    batchSize?: number;
    debounceMs?: number;
}

/**
 * Workspace type for sync configuration
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Abstract file sync service interface
 *
 * Defines the contract for file synchronization across all workspaces.
 * Each workspace implementation provides workspace-specific behavior
 * while maintaining a consistent API.
 */
export interface FileSyncService {
    /**
     * Read file content
     * @param path - File path relative to project root
     * @returns File content as string
     */
    readFile(path: string): Promise<string>;

    /**
     * Write file content
     * @param path - File path relative to project root
     * @param content - File content to write
     */
    writeFile(path: string, content: string): Promise<void>;

    /**
     * Delete file
     * @param path - File path relative to project root
     */
    deleteFile(path: string): Promise<void>;

    /**
     * List files in directory
     * @param path - Directory path relative to project root
     * @param recursive - Whether to list recursively
     * @returns Array of file paths
     */
    listFiles(path: string, recursive?: boolean): Promise<string[]>;

    /**
     * Get file metadata
     * @param path - File path relative to project root
     * @returns File metadata
     */
    getFileMetadata(path: string): Promise<FileMetadata>;

    /**
     * Write multiple files in batch
     * @param operations - Array of file write operations
     * @returns Sync result with statistics
     */
    writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult>;

    /**
     * Mount directory for sync
     * @param source - Directory handle from File System Access API
     */
    mount(source: FileSystemDirectoryHandle): Promise<void>;

    /**
     * Perform sync operation
     * @param options - Optional sync configuration
     * @returns Sync result with statistics
     */
    sync(options?: SyncOptions): Promise<SyncResult>;

    /**
     * Get current sync status
     * @returns Current sync status information
     */
    getSyncStatus(): SyncStatus;

    /**
     * Subscribe to file change events
     * @param callback - Event handler for file changes
     * @returns Unsubscribe function
     */
    onFileChange(callback: (event: FileChangeEvent) => void): () => void;

    /**
     * Dispose of service and cleanup resources
     */
    dispose?(): Promise<void>;
}

/**
 * Current sync status
 */
export interface SyncStatus {
    syncing: boolean;
    lastSync: number | null;
    filesProcessed: number;
    error: string | null;
}

/**
 * Configuration for file sync service creation
 */
export interface FileSyncConfig {
    workspaceType: WorkspaceType;
    projectId: string;
    syncOptions?: SyncOptions;
}

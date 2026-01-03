/**
 * Sync Manager - Bidirectional file sync between Local FS and WebContainers
 * @module lib/filesystem/sync-manager
 *
 * This module provides synchronization between the local file system (via File System Access API)
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
 *
 * @example
 * ```ts
 * import { SyncManager } from '@/lib/filesystem/sync-manager';
 * import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
 *
 * const adapter = new LocalFSAdapter();
 * await adapter.requestDirectoryAccess();
 *
 * const syncManager = new SyncManager(adapter, {
 *   onProgress: (p) => console.log(`Syncing: ${p.currentFile}`),
 *   onComplete: (r) => console.log(`Synced ${r.syncedFiles} files in ${r.duration}ms`),
 * });
 *
 * await syncManager.syncToWebContainer();
 *
 * // Incremental sync (syncs only changed files)
 * await syncManager.incrementalSyncToWebContainer();
 * ```
 */

import type { LocalFSAdapter } from '../local-fs-adapter';
import type { WorkspaceEventEmitter } from '../../events';
import type { SyncConfig, SyncResult, SyncStatus } from './sync-manager-types';
import { DEFAULT_SYNC_CONFIG } from '../sync-types';
import { syncToWebContainer, incrementalSyncToWebContainer } from './sync-batch-sync';
import { writeFile, deleteFile, createDirectory, deleteDirectory } from './sync-file-ops';

/**
 * SyncManager - Keeps Local FS and WebContainers in sync
 *
 * @example
 * ```ts
 * const syncManager = new SyncManager(localFSAdapter, {
 *   excludePatterns: ['.git', 'node_modules', 'dist'],
 *   onProgress: (p) => setProgress(p.percentage),
 *   onError: (e) => toast.error(e.message),
 *   onComplete: (r) => console.log('Sync complete!'),
 * });
 *
 * // Initial sync
 * await syncManager.syncToWebContainer();
 *
 * // Dual write on save
 * await syncManager.writeFile('src/index.ts', 'console.log("hello")');
 * ```
 */
export class SyncManager {
    private localAdapter: LocalFSAdapter;
    private config: SyncConfig;
    private _status: SyncStatus = 'idle';
    private eventBus?: WorkspaceEventEmitter;

    constructor(
        localAdapter: LocalFSAdapter,
        config: Partial<SyncConfig> = {},
        eventBus?: WorkspaceEventEmitter
    ) {
        this.localAdapter = localAdapter;
        this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
        this.eventBus = eventBus;
    }

    /**
     * Get the current sync status
     */
    get status(): SyncStatus {
        return this._status;
    }

    /**
     * Sync all files from Local FS to WebContainers
     *
     * Recursively traverses the local directory, builds a FileSystemTree,
     * and mounts it to the WebContainer.
     *
     * @returns Promise resolving to SyncResult with sync statistics
     * @throws {SyncError} If sync fails critically (WebContainer not booted, mount fails)
     */
    async syncToWebContainer(): Promise<SyncResult> {
        if (this._status === 'syncing') {
            console.warn('[SyncManager] Sync already in progress, skipping request');
            return {
                success: false,
                totalFiles: 0,
                syncedFiles: 0,
                failedFiles: [],
                duration: 0,
            };
        }

        return syncToWebContainer(
            this.localAdapter,
            this.config,
            this.eventBus,
            (status) => { this._status = status; }
        );
    }

    /**
     * Write a file to both Local FS and WebContainers
     *
     * Performs a dual write to keep both systems in sync.
     * Writes to Local FS first (source of truth), then WebContainers.
     *
     * @param path - Relative path to the file
     * @param content - File content as string
     * @throws {SyncError} If write fails
     */
    async writeFile(path: string, content: string): Promise<void> {
        return writeFile(path, content, this.localAdapter, this.config, this.eventBus);
    }

    /**
     * Delete a file from both Local FS and WebContainers
     *
     * @param path - Relative path to the file
     * @throws {SyncError} If delete fails
     */
    async deleteFile(path: string): Promise<void> {
        return deleteFile(path, this.localAdapter, this.config, this.eventBus);
    }

    /**
     * Create a directory in both Local FS and WebContainers
     *
     * @param path - Relative path to the directory
     * @throws {SyncError} If create fails
     */
    async createDirectory(path: string): Promise<void> {
        return createDirectory(path, this.localAdapter, this.config, this.eventBus);
    }

    /**
     * Delete a directory from both Local FS and WebContainers
     *
     * @param path - Relative path to the directory
     * @throws {SyncError} If delete fails
     */
    async deleteDirectory(path: string): Promise<void> {
        return deleteDirectory(path, this.localAdapter, this.config, this.eventBus);
    }

    /**
     * Incremental sync - only sync changed files since last sync
     *
     * Uses FileMetadataCache to detect changed files.
     *
     * @returns Promise resolving to SyncResult with sync statistics
     * @throws {SyncError} If incremental sync fails
     */
    async incrementalSyncToWebContainer(): Promise<SyncResult> {
        if (this._status === 'syncing') {
            console.warn('[SyncManager] Sync already in progress, skipping incremental request');
            return {
                success: false,
                totalFiles: 0,
                syncedFiles: 0,
                failedFiles: [],
                duration: 0,
            };
        }

        return incrementalSyncToWebContainer(
            this.localAdapter,
            this.config,
            this.eventBus,
            (status) => { this._status = status; }
        );
    }

    /**
     * Update exclusion patterns
     * Merges custom patterns with default patterns to ensure critical exclusions are preserved
     *
     * @param patterns - New array of exclusion patterns to add
     */
    setExcludePatterns(patterns: string[]): void {
        // Merge custom patterns with default patterns to preserve critical exclusions
        const defaults = DEFAULT_SYNC_CONFIG.excludePatterns;
        const uniquePatterns = [...new Set([...defaults, ...patterns])];
        this.config.excludePatterns = uniquePatterns;
    }

    /**
     * Get current exclusion patterns
     */
    getExcludePatterns(): string[] {
        return [...this.config.excludePatterns];
    }
}

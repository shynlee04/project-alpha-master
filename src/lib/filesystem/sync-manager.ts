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

import type { LocalFSAdapter } from './local-fs-adapter';
import { boot, mount, getFileSystem, isBooted } from '../webcontainer';
import type { WorkspaceEventEmitter } from '../events';
import {
    type SyncConfig,
    type SyncResult,
    type SyncStatus,
    SyncError,
    DEFAULT_SYNC_CONFIG,
} from './sync-types';
import { countFilesToSync, buildFileSystemTree } from './sync-operations';
import { validateFileSize, shouldWarnFileSize, formatFileSize } from './validation';
import { showErrorToast } from '../utils/error-handling';
import { fileMetadataCache } from '../sync/file-metadata-cache';
import type { FileMetadataRecord } from '../state/dexie-db';

// Re-export types for convenience
export { SyncError } from './sync-types';
export type { SyncConfig, SyncProgress, SyncResult, SyncStatus } from './sync-types';

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

        this._status = 'syncing';
        const startTime = performance.now();

        const result: SyncResult = {
            success: true,
            totalFiles: 0,
            syncedFiles: 0,
            failedFiles: [],
            duration: 0,
        };

        try {
            // Ensure WebContainer is booted
            if (!isBooted()) {
                await boot();
            }

            const totalFileCount = this.config.preScanFileCount
                ? await countFilesToSync(
                    this.localAdapter,
                    '',
                    this.config.excludePatterns,
                    this.config.onError
                )
                : 0;

            this.eventBus?.emit('sync:started', {
                fileCount: totalFileCount,
                direction: 'to-wc',
            });

            const processedRef = { filesProcessed: 0 };

            // Build file tree from local FS
            const tree = await buildFileSystemTree(
                {
                    adapter: this.localAdapter,
                    config: this.config,
                    eventBus: this.eventBus,
                },
                '',
                result,
                totalFileCount,
                processedRef
            );

            // Mount to WebContainer
            await mount(tree);

            result.duration = Math.round(performance.now() - startTime);

            // Warn if we exceeded performance target
            if (result.totalFiles >= 100 && result.duration > 3000) {
                console.warn(
                    `[SyncManager] Sync exceeded 3s target for ${result.totalFiles} files: ${result.duration}ms`
                );
            }

            this._status = 'idle';

            this.eventBus?.emit('sync:completed', {
                success: result.success,
                timestamp: new Date(),
                filesProcessed: processedRef.filesProcessed,
            });

            this.config.onComplete?.(result);
        } catch (error) {
            result.success = false;
            result.duration = Math.round(performance.now() - startTime);
            this._status = 'error';

            const syncError = new SyncError(
                `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error instanceof SyncError ? error.code : 'SYNC_FAILED',
                undefined,
                error
            );

            console.error('[SyncManager] Sync failed:', syncError);

            this.eventBus?.emit('sync:error', {
                error: syncError,
                file: syncError.filePath,
            });

            this.config.onError?.(syncError);
            this.config.onComplete?.(result);

            throw syncError;
        }

        return result;
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
        const startTime = performance.now();

        // Validate file size before writing
        const contentSize = new Blob([content]).size;
        const sizeValidation = validateFileSize(contentSize);

        if (!sizeValidation.valid) {
            // Show warning toast for large files
            showErrorToast(new Error('File too large'), {
                messageKey: sizeValidation.errorKey!,
                message: `File too large: ${formatFileSize(contentSize)}. Maximum is ${sizeValidation.errorParams?.maxSize}.`,
                action: 'dismiss',
                id: `file-size-warning-${path}`,
            });

            // Emit warning event
            (this.eventBus as any)?.emit('sync:warning', {
                file: path,
                warning: 'FILE_SIZE_EXCEEDED',
                message: sizeValidation.errorKey || 'File size exceeded',
                params: sizeValidation.errorParams,
            });

            // Throw error to prevent the write
            const syncError = new SyncError(
                `File too large: ${formatFileSize(contentSize)}. Maximum is ${sizeValidation.errorParams?.maxSize}.`,
                'FILE_SIZE_EXCEEDED' as any,
                path
            );
            this.eventBus?.emit('sync:error', { error: syncError, file: path });
            throw syncError;
        }

        // Show warning for large files (but allow the operation)
        if (shouldWarnFileSize(contentSize)) {
            showErrorToast(new Error('Large file warning'), {
                message: `Warning: Large file (${formatFileSize(contentSize)}). Consider using smaller files for optimal performance.`,
                duration: 4000,
                id: `file-size-warning-${path}`,
            });
        }

        this.eventBus?.emit('sync:started', {
            fileCount: 1,
            direction: 'to-wc',
        });

        try {
            // Write to local FS first (source of truth)
            await this.localAdapter.writeFile(path, content);

            // Write to WebContainers if booted
            if (isBooted()) {
                const fs = getFileSystem();

                // Ensure parent directories exist in WebContainers
                const segments = path.split('/');
                if (segments.length > 1) {
                    const parentPath = segments.slice(0, -1).join('/');
                    try {
                        await fs.mkdir(parentPath, { recursive: true });
                    } catch {
                        // Directory might already exist, ignore
                    }
                }

                await fs.writeFile(path, content);
            }

            const duration = Math.round(performance.now() - startTime);

            // Warn if we exceeded performance target
            if (duration > 500) {
                console.warn(
                    `[SyncManager] Write exceeded 500ms target: ${path} took ${duration}ms`
                );
            }

            this.eventBus?.emit('sync:progress', {
                current: 1,
                total: 1,
                currentFile: path,
            });

            this.eventBus?.emit('sync:completed', {
                success: true,
                timestamp: new Date(),
                filesProcessed: 1,
            });
        } catch (error) {
            const syncError = new SyncError(
                `Failed to write file: ${path}`,
                'FILE_WRITE_FAILED',
                path,
                error
            );

            this.eventBus?.emit('sync:error', {
                error: syncError,
                file: path,
            });

            this.config.onError?.(syncError);
            throw syncError;
        }
    }

    /**
     * Delete a file from both Local FS and WebContainers
     * 
     * @param path - Relative path to the file
     * @throws {SyncError} If delete fails
     */
    async deleteFile(path: string): Promise<void> {
        this.eventBus?.emit('sync:started', {
            fileCount: 1,
            direction: 'to-wc',
        });

        try {
            // Delete from local FS first
            await this.localAdapter.deleteFile(path);

            // Delete from WebContainers if booted
            if (isBooted()) {
                const fs = getFileSystem();
                try {
                    await fs.rm(path);
                } catch {
                    // File might not exist in WebContainers, ignore
                }
            }

            this.eventBus?.emit('sync:completed', {
                success: true,
                timestamp: new Date(),
                filesProcessed: 1,
            });
        } catch (error) {
            const syncError = new SyncError(
                `Failed to delete file: ${path}`,
                'FILE_WRITE_FAILED',
                path,
                error
            );

            this.eventBus?.emit('sync:error', {
                error: syncError,
                file: path,
            });

            this.config.onError?.(syncError);
            throw syncError;
        }
    }

    /**
     * Create a directory in both Local FS and WebContainers
     * 
     * @param path - Relative path to the directory
     * @throws {SyncError} If create fails
     */
    async createDirectory(path: string): Promise<void> {
        this.eventBus?.emit('sync:started', {
            fileCount: 0,
            direction: 'to-wc',
        });

        try {
            // Create in local FS first
            await this.localAdapter.createDirectory(path);

            // Create in WebContainers if booted
            if (isBooted()) {
                const fs = getFileSystem();
                await fs.mkdir(path, { recursive: true });
            }

            this.eventBus?.emit('sync:completed', {
                success: true,
                timestamp: new Date(),
                filesProcessed: 0,
            });
        } catch (error) {
            const syncError = new SyncError(
                `Failed to create directory: ${path}`,
                'FILE_WRITE_FAILED',
                path,
                error
            );

            this.eventBus?.emit('sync:error', {
                error: syncError,
                file: path,
            });

            this.config.onError?.(syncError);
            throw syncError;
        }
    }

    /**
     * Delete a directory from both Local FS and WebContainers
     * 
     * @param path - Relative path to the directory
     * @throws {SyncError} If delete fails
     */
    async deleteDirectory(path: string): Promise<void> {
        this.eventBus?.emit('sync:started', {
            fileCount: 0,
            direction: 'to-wc',
        });

        try {
            // Delete from local FS first
            await this.localAdapter.deleteDirectory(path);

            // Delete from WebContainers if booted
            if (isBooted()) {
                const fs = getFileSystem();
                try {
                    await fs.rm(path, { recursive: true });
                } catch {
                    // Directory might not exist in WebContainers, ignore
                }
            }

            this.eventBus?.emit('sync:completed', {
                success: true,
                timestamp: new Date(),
                filesProcessed: 0,
            });
        } catch (error) {
            const syncError = new SyncError(
                `Failed to delete directory: ${path}`,
                'FILE_WRITE_FAILED',
                path,
                error
            );

            this.eventBus?.emit('sync:error', {
                error: syncError,
                file: path,
            });

            this.config.onError?.(syncError);
            throw syncError;
        }
    }

    /**
     * Incrementally sync changed files from Local FS to WebContainers
     *
     * Uses FileMetadataCache to detect which files have changed since the last sync
     * and only syncs those files. This is more efficient than full sync for small changes.
     *
     * @returns Promise resolving to SyncResult with sync statistics
     * @throws {SyncError} If sync fails critically
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

        this._status = 'syncing';
        const startTime = performance.now();

        const result: SyncResult = {
            success: true,
            totalFiles: 0,
            syncedFiles: 0,
            failedFiles: [],
            duration: 0,
        };

        try {
            // Ensure WebContainer is booted
            if (!isBooted()) {
                await boot();
            }

            // Get last sync time and changed files
            const lastSyncTime = await fileMetadataCache.getLastSyncTime();
            const changedFiles = await fileMetadataCache.getChangedFiles(lastSyncTime);

            if (changedFiles.length === 0) {
                console.log('[SyncManager] No changed files detected for incremental sync');
                this._status = 'idle';
                result.duration = Math.round(performance.now() - startTime);
                this.config.onComplete?.(result);
                return result;
            }

            (this.eventBus as any)?.emit('sync:started', {
                fileCount: changedFiles.length,
                direction: 'to-wc',
                incremental: true,
                lastSyncTime,
            });

            const fs = getFileSystem();

            for (const fileRecord of changedFiles) {
                try {
                    result.totalFiles++;

                    // Read file content from local FS
                    const content = await this.localAdapter.readFile(fileRecord.path);

                    // Ensure parent directories exist in WebContainers
                    const segments = fileRecord.path.split('/');
                    if (segments.length > 1) {
                        const parentPath = segments.slice(0, -1).join('/');
                        try {
                            await fs.mkdir(parentPath, { recursive: true });
                        } catch {
                            // Directory might already exist, ignore
                        }
                    }

                    // Write to WebContainer
                    await fs.writeFile(fileRecord.path, content as any);
                    result.syncedFiles++;

                    // Emit progress
                    this.eventBus?.emit('sync:progress', {
                        current: result.syncedFiles,
                        total: changedFiles.length,
                        currentFile: fileRecord.path,
                    });
                } catch (error) {
                    const fileError = new SyncError(
                        `Failed to sync file: ${fileRecord.path}`,
                        'FILE_SYNC_FAILED' as any,
                        fileRecord.path,
                        error
                    );
                    console.error(`[SyncManager] Failed to sync ${fileRecord.path}:`, error);
                    result.failedFiles.push(fileRecord.path);
                    this.config.onError?.(fileError);
                }
            }

            // Update the last sync time by updating metadata for synced files
            const now = Date.now();
            const updatedMetadata: FileMetadataRecord[] = changedFiles.map(file => ({
                ...file,
                syncedAt: now,
                updatedAt: now,
            }));
            await fileMetadataCache.updateBatch(updatedMetadata);

            result.duration = Math.round(performance.now() - startTime);

            // Determine overall success
            result.success = result.failedFiles.length === 0;

            this._status = 'idle';

            (this.eventBus as any)?.emit('sync:completed', {
                success: result.success,
                timestamp: new Date(),
                filesProcessed: result.syncedFiles,
                incremental: true,
            });

            this.config.onComplete?.(result);
        } catch (error) {
            result.success = false;
            result.duration = Math.round(performance.now() - startTime);
            this._status = 'error';

            const syncError = new SyncError(
                `Incremental sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error instanceof SyncError ? error.code : 'SYNC_FAILED',
                undefined,
                error
            );

            console.error('[SyncManager] Incremental sync failed:', syncError);

            this.eventBus?.emit('sync:error', {
                error: syncError,
                file: syncError.filePath,
            });

            this.config.onError?.(syncError);
            this.config.onComplete?.(result);

            throw syncError;
        }

        return result;
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

/**
 * Create a SyncManager instance with optional configuration
 * 
 * Convenience factory function for creating SyncManager instances.
 * 
 * @param adapter - LocalFSAdapter instance with directory access
 * @param config - Optional configuration
 * @returns SyncManager instance
 */
export function createSyncManager(
    adapter: LocalFSAdapter,
    config?: Partial<SyncConfig>,
    eventBus?: WorkspaceEventEmitter
): SyncManager {
    return new SyncManager(adapter, config, eventBus);
}

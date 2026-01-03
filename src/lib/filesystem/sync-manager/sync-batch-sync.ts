/**
 * @fileoverview Sync Batch Operations
 * @module lib/filesystem/sync-manager
 *
 * Batch synchronization operations (full sync and incremental sync).
 */

import type { LocalFSAdapter } from '../local-fs-adapter';
import { boot, mount, getFileSystem, isBooted } from '../../webcontainer';
import type { WorkspaceEventEmitter } from '../../events';
import type { SyncConfig, SyncResult } from '../sync-types';
import { countFilesToSync, buildFileSystemTree } from '../sync-operations';
import type { FileMetadataRecord } from '../../state/dexie-db';
import { fileMetadataCache } from '../../sync/file-metadata-cache';
import { SyncError } from '../sync-types';

/**
 * Full sync from Local FS to WebContainer
 *
 * Recursively traverses the local directory, builds a FileSystemTree,
 * and mounts it to the WebContainer.
 *
 * @returns Promise resolving to SyncResult with sync statistics
 * @throws {SyncError} If sync fails critically
 */
export async function syncToWebContainer(
    localAdapter: LocalFSAdapter,
    config: SyncConfig,
    eventBus?: WorkspaceEventEmitter,
    statusCallback?: (status: 'syncing' | 'idle' | 'error') => void
): Promise<SyncResult> {
    statusCallback?.('syncing');
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

        const totalFileCount = config.preScanFileCount
            ? await countFilesToSync(
                localAdapter,
                '',
                config.excludePatterns,
                config.onError
            )
            : 0;

        eventBus?.emit('sync:started', {
            fileCount: totalFileCount,
            direction: 'to-wc',
        });

        const processedRef = { filesProcessed: 0 };

        // Build file tree from local FS
        const tree = await buildFileSystemTree(
            {
                adapter: localAdapter,
                config,
                eventBus,
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

        statusCallback?.('idle');

        eventBus?.emit('sync:completed', {
            success: result.success,
            timestamp: new Date(),
            filesProcessed: processedRef.filesProcessed,
        });

        config.onComplete?.(result);
    } catch (error) {
        result.success = false;
        result.duration = Math.round(performance.now() - startTime);
        statusCallback?.('error');

        const syncError = new SyncError(
            `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error instanceof SyncError ? error.code : 'SYNC_FAILED',
            undefined,
            error
        );

        console.error('[SyncManager] Sync failed:', syncError);

        eventBus?.emit('sync:error', {
            error: syncError,
            file: syncError.filePath,
        });

        config.onError?.(syncError);
        config.onComplete?.(result);

        throw syncError;
    }

    return result;
}

/**
 * Incremental sync - only sync changed files since last sync
 *
 * Uses FileMetadataCache to detect changed files.
 *
 * @returns Promise resolving to SyncResult with sync statistics
 * @throws {SyncError} If incremental sync fails
 */
export async function incrementalSyncToWebContainer(
    localAdapter: LocalFSAdapter,
    config: SyncConfig,
    eventBus?: WorkspaceEventEmitter,
    statusCallback?: (status: 'syncing' | 'idle' | 'error') => void
): Promise<SyncResult> {
    statusCallback?.('syncing');
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
            statusCallback?.('idle');
            result.duration = Math.round(performance.now() - startTime);
            config.onComplete?.(result);
            return result;
        }

        (eventBus as any)?.emit('sync:started', {
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
                const content = await localAdapter.readFile(fileRecord.path);

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
                eventBus?.emit('sync:progress', {
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
                config.onError?.(fileError);
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

        statusCallback?.('idle');

        (eventBus as any)?.emit('sync:completed', {
            success: result.success,
            timestamp: new Date(),
            filesProcessed: result.syncedFiles,
            incremental: true,
        });

        config.onComplete?.(result);
    } catch (error) {
        result.success = false;
        result.duration = Math.round(performance.now() - startTime);
        statusCallback?.('error');

        const syncError = new SyncError(
            `Incremental sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error instanceof SyncError ? error.code : 'SYNC_FAILED',
            undefined,
            error
        );

        console.error('[SyncManager] Incremental sync failed:', syncError);

        eventBus?.emit('sync:error', {
            error: syncError,
            file: syncError.filePath,
        });

        config.onError?.(syncError);
        config.onComplete?.(result);

        throw syncError;
    }

    return result;
}

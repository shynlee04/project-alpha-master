/**
 * @fileoverview Sync File Operations
 * @module lib/filesystem/sync-manager
 *
 * Individual file and directory operations (write, delete, create).
 */

import type { LocalFSAdapter } from '../local-fs-adapter';
import { getFileSystem, isBooted } from '../../webcontainer';
import type { WorkspaceEventEmitter } from '../../events';
import type { SyncConfig } from '../sync-types';
import { SyncError } from '../sync-types';
import { validateFileSize, shouldWarnFileSize, formatFileSize } from '../validation';
import { showErrorToast } from '../../utils/error-handling';
import { emitStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';
import type { FileSavedPayload } from '@/lib/events/store-events';

/**
 * Write a file to both Local FS and WebContainers
 *
 * Performs a dual write to keep both systems in sync.
 * Writes to Local FS first (source of truth), then WebContainers.
 *
 * @param path - Relative path to the file
 * @param content - File content as string
 * @param localAdapter - Local filesystem adapter
 * @param config - Sync configuration
 * @param eventBus - Optional event emitter
 * @throws {SyncError} If write fails
 */
export async function writeFile(
    path: string,
    content: string,
    localAdapter: LocalFSAdapter,
    config: SyncConfig,
    eventBus?: WorkspaceEventEmitter
): Promise<void> {
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
        (eventBus as any)?.emit('sync:warning', {
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
        eventBus?.emit('sync:error', { error: syncError, file: path });
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

    eventBus?.emit('sync:started', {
        fileCount: 1,
        direction: 'to-wc',
    });

    try {
        // Write to local FS first (source of truth)
        await localAdapter.writeFile(path, content);

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

        eventBus?.emit('sync:progress', {
            current: 1,
            total: 1,
            currentFile: path,
        });

        eventBus?.emit('sync:completed', {
            success: true,
            timestamp: new Date(),
            filesProcessed: 1,
        });

        // Emit FILE_SAVED event for cross-workspace reactivity (UJ-004)
        // Note: projectId might not be available in all contexts, using 'default'
        const fileSavedPayload: FileSavedPayload = {
            filePath: path,
            workspaceType: 'ide',
            projectId: (config as any).projectId || 'default',
            timestamp: Date.now(),
        };
        emitStoreEvent<FileSavedPayload>(STORE_EVENTS.FILE_SAVED, fileSavedPayload);
    } catch (error) {
        const syncError = new SyncError(
            `Failed to write file: ${path}`,
            'FILE_WRITE_FAILED',
            path,
            error
        );

        eventBus?.emit('sync:error', {
            error: syncError,
            file: path,
        });

        config.onError?.(syncError);
        throw syncError;
    }
}

/**
 * Delete a file from both Local FS and WebContainers
 *
 * @param path - Relative path to the file
 * @param localAdapter - Local filesystem adapter
 * @param config - Sync configuration
 * @param eventBus - Optional event emitter
 * @throws {SyncError} If delete fails
 */
export async function deleteFile(
    path: string,
    localAdapter: LocalFSAdapter,
    config: SyncConfig,
    eventBus?: WorkspaceEventEmitter
): Promise<void> {
    eventBus?.emit('sync:started', {
        fileCount: 1,
        direction: 'to-wc',
    });

    try {
        // Delete from local FS first
        await localAdapter.deleteFile(path);

        // Delete from WebContainers if booted
        if (isBooted()) {
            const fs = getFileSystem();
            try {
                await fs.rm(path);
            } catch {
                // File might not exist in WebContainers, ignore
            }
        }

        eventBus?.emit('sync:completed', {
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

        eventBus?.emit('sync:error', {
            error: syncError,
            file: path,
        });

        config.onError?.(syncError);
        throw syncError;
    }
}

/**
 * Create a directory in both Local FS and WebContainers
 *
 * @param path - Relative path to the directory
 * @param localAdapter - Local filesystem adapter
 * @param config - Sync configuration
 * @param eventBus - Optional event emitter
 * @throws {SyncError} If create fails
 */
export async function createDirectory(
    path: string,
    localAdapter: LocalFSAdapter,
    config: SyncConfig,
    eventBus?: WorkspaceEventEmitter
): Promise<void> {
    eventBus?.emit('sync:started', {
        fileCount: 0,
        direction: 'to-wc',
    });

    try {
        // Create in local FS first
        await localAdapter.createDirectory(path);

        // Create in WebContainers if booted
        if (isBooted()) {
            const fs = getFileSystem();
            try {
                await fs.mkdir(path, { recursive: true });
            } catch {
                // Directory might already exist, ignore
            }
        }

        eventBus?.emit('sync:completed', {
            success: true,
            timestamp: new Date(),
            filesProcessed: 0,
        });
    } catch (error) {
        const syncError = new SyncError(
            `Failed to create directory: ${path}`,
            'DIR_CREATE_FAILED',
            path,
            error
        );

        eventBus?.emit('sync:error', {
            error: syncError,
            file: path,
        });

        config.onError?.(syncError);
        throw syncError;
    }
}

/**
 * Delete a directory from both Local FS and WebContainers
 *
 * @param path - Relative path to the directory
 * @param localAdapter - Local filesystem adapter
 * @param config - Sync configuration
 * @param eventBus - Optional event emitter
 * @throws {SyncError} If delete fails
 */
export async function deleteDirectory(
    path: string,
    localAdapter: LocalFSAdapter,
    config: SyncConfig,
    eventBus?: WorkspaceEventEmitter
): Promise<void> {
    eventBus?.emit('sync:started', {
        fileCount: 0,
        direction: 'to-wc',
    });

    try {
        // Delete from local FS first
        await localAdapter.deleteDirectory(path);

        // Delete from WebContainers if booted
        if (isBooted()) {
            const fs = getFileSystem();
            try {
                await fs.rm(path, { recursive: true });
            } catch {
                // Directory might not exist in WebContainers, ignore
            }
        }

        eventBus?.emit('sync:completed', {
            success: true,
            timestamp: new Date(),
            filesProcessed: 0,
        });
    } catch (error) {
        const syncError = new SyncError(
            `Failed to delete directory: ${path}`,
            'DIR_DELETE_FAILED',
            path,
            error
        );

        eventBus?.emit('sync:error', {
            error: syncError,
            file: path,
        });

        config.onError?.(syncError);
        throw syncError;
    }
}

/**
 * @fileoverview IDE File Sync Service Implementation
 * @module lib/filesync/ide-file-sync-service
 *
 * File sync service for IDE workspace.
 * Wraps existing LocalFSAdapter and SyncManager.
 *
 * @epic CW-01 - Abstract File Sync Service
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions,
    FileSyncConfig
} from './file-sync-service';
import type { LocalFSAdapter } from '@/infrastructure/filesystem';
import type { SyncManager } from '@/infrastructure/sync';
import { createSyncManager } from '@/infrastructure/sync';
import { SyncError } from '@/infrastructure/sync/types';

/**
 * Configuration for IDE file sync service
 */
export interface IDEFileSyncConfig extends FileSyncConfig {
    localAdapter: LocalFSAdapter;
    syncManager?: SyncManager;
}

/**
 * IDE File Sync Service
 *
 * Wraps existing LocalFSAdapter and SyncManager to provide
 * the FileSyncService interface for the IDE workspace.
 *
 * Features:
 * - Full file system access via File System Access API
 * - WebContainer sync for tool execution
 * - Transaction logging with rollback support
 * - Batch operations for performance
 */
export class IDEFileSyncService implements FileSyncService {
    private localAdapter: LocalFSAdapter;
    private syncManager: SyncManager;
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;

    constructor(config: IDEFileSyncConfig) {
        this.localAdapter = config.localAdapter;
        this.syncManager = config.syncManager || createSyncManager(
            config.localAdapter,
            config.syncOptions ? {
                excludePatterns: config.syncOptions.exclusions || []
            } : undefined
        );
        this.changeListeners = new Set();
        this.disposed = false;
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        const result = await this.localAdapter.readFile(path);
        return result.content;
    }

    async writeFile(path: string, content: string): Promise<void> {
        this.checkDisposed();
        await this.localAdapter.writeFile(path, content);
        // Trigger incremental sync to WebContainer
        await this.syncManager.incrementalSyncToWebContainer();
        this.emitChange({ type: 'modified', path, timestamp: Date.now() });
    }

    async deleteFile(path: string): Promise<void> {
        this.checkDisposed();
        await this.localAdapter.deleteFile(path);
        await this.syncManager.incrementalSyncToWebContainer();
        this.emitChange({ type: 'deleted', path, timestamp: Date.now() });
    }

    async listFiles(path: string): Promise<string[]> {
        this.checkDisposed();
        const entries = await this.localAdapter.listDirectory(path);
        return entries.map((e: { name: string }) => e.name);
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();
        // LocalFSAdapter doesn't provide getFileStats, return basic metadata
        return {
            path,
            size: 0,
            lastModified: Date.now(),
            contentType: undefined
        };
    }

    async writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const errors: SyncError[] = [];
        let processed = 0;

        for (const op of operations) {
            try {
                await this.writeFile(op.path, op.content);
                processed++;
            } catch (error) {
                errors.push(new SyncError(
                    error instanceof Error ? error.message : 'Unknown error',
                    'FILE_WRITE_FAILED',
                    op.path
                ));
            }
        }

        return {
            success: errors.length === 0,
            filesProcessed: processed,
            errors,
            duration: Date.now() - startTime
        };
    }

    async mount(_source: FileSystemDirectoryHandle): Promise<void> {
        this.checkDisposed();
        // LocalFSAdapter is already initialized with directory handle
        // This is a no-op but kept for interface consistency
        console.log('[IDEFileSyncService] Already mounted with directory handle');
    }

    async sync(_options?: SyncOptions): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();

        try {
            // Perform full sync to WebContainer
            const result = await this.syncManager.syncToWebContainer();

            return {
                success: true,
                filesProcessed: result.syncedFiles,
                errors: [],
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                filesProcessed: 0,
                errors: [new SyncError(
                    error instanceof Error ? error.message : 'Sync failed',
                    'SYNC_FAILED',
                    'root'
                )],
                duration: Date.now() - startTime
            };
        }
    }

    getSyncStatus(): SyncStatus {
        return {
            syncing: false,
            lastSync: null,
            filesProcessed: 0,
            error: null
        };
    }

    onFileChange(callback: (event: FileChangeEvent) => void): () => void {
        this.checkDisposed();
        this.changeListeners.add(callback);
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    async dispose(): Promise<void> {
        this.disposed = true;
        this.changeListeners.clear();
    }

    private emitChange(event: FileChangeEvent): void {
        this.changeListeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('[IDEFileSyncService] Error in change listener:', error);
            }
        });
    }

    private checkDisposed(): void {
        if (this.disposed) {
            throw new Error('IDEFileSyncService has been disposed');
        }
    }
}

/**
 * Factory function to create IDE file sync service
 */
export function createIDEFileSyncService(config: IDEFileSyncConfig): IDEFileSyncService {
    return new IDEFileSyncService(config);
}

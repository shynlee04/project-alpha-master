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
import type { LocalFSAdapter } from '../filesystem/local-fs-adapter';
import type { SyncManager } from '../filesystem/sync-manager/sync-manager';
import { createSyncManager } from '../filesystem/sync-manager';

/**
 * Configuration for IDE file sync service
 */
export interface IDEFileSyncConfig extends FileSyncConfig {
    localAdapter: LocalFSAdapter;
    syncManager?: SyncManager;
}

/**
 * Default sync exclusions for IDE workspace
 */
const DEFAULT_EXCLUSIONS = [
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '.next/',
    '.DS_Store',
    'Thumbs.db'
];

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
    private projectId: string;
    private options: SyncOptions;
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;

    constructor(config: IDEFileSyncConfig) {
        this.localAdapter = config.localAdapter;
        this.syncManager = config.syncManager || createSyncManager(
            config.localAdapter,
            config.syncOptions
        );
        this.projectId = config.projectId;
        this.options = config.syncOptions || {};
        this.changeListeners = new Set();
        this.disposed = false;
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        return this.localAdapter.readFile(path);
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

    async listFiles(path: string, recursive = false): Promise<string[]> {
        this.checkDisposed();
        const entries = await this.localAdapter.listDirectory(path, recursive);
        return entries.map(e => e.path);
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();
        const stat = await this.localAdapter.getFileStats(path);
        return {
            path,
            size: stat.size,
            lastModified: stat.mtime,
            contentType: stat.type
        };
    }

    async writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const errors: Array<{ path: string; error: string; code?: string }> = [];
        let processed = 0;

        for (const op of operations) {
            try {
                await this.writeFile(op.path, op.content);
                processed++;
            } catch (error) {
                errors.push({
                    path: op.path,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return {
            success: errors.length === 0,
            filesProcessed: processed,
            errors,
            duration: Date.now() - startTime
        };
    }

    async mount(source: FileSystemDirectoryHandle): Promise<void> {
        this.checkDisposed();
        // LocalFSAdapter is already initialized with directory handle
        // This is a no-op but kept for interface consistency
        console.log('[IDEFileSyncService] Already mounted with directory handle');
    }

    async sync(options?: SyncOptions): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const errors: Array<{ path: string; error: string; code?: string }> = [];

        try {
            // Perform full sync to WebContainer
            const result = await this.syncManager.syncToWebContainer({
                exclusions: [
                    ...DEFAULT_EXCLUSIONS,
                    ...(this.options.exclusions || []),
                    ...(options?.exclusions || [])
                ]
            });

            return {
                success: true,
                filesProcessed: result.filesProcessed,
                errors: [],
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                filesProcessed: 0,
                errors: [{
                    path: 'root',
                    error: error instanceof Error ? error.message : 'Sync failed',
                    code: 'SYNC_ERROR'
                }],
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

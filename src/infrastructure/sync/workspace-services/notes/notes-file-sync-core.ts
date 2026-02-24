/**
 * @fileoverview Notes File Sync Service Core
 * @module infrastructure/sync/workspace-services/notes/notes-file-sync-core
 *
 * FileSyncService interface implementation for Notes workspace.
 * Provides core file system operations and lifecycle management.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult
} from '../file-sync-service';
import type { LocalFSAdapter } from '@/infrastructure/filesystem';
import type { Block } from '@blocknote/core';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import { SyncError } from '@/infrastructure/sync/types';
import type { FileChangeTracker } from './note-file-watcher';

/**
 * Note store interface for file sync operations
 *
 * Uses proper Block[] type for type compatibility with notes store.
 */
export interface NoteSyncStore {
    /** Notes map from store */
    notes: Map<string, NoteRecord>;
    /** Notes array from store */
    notesArray: NoteRecord[];
    /** Update note method */
    updateNote: (params: {
        id: string;
        title?: string;
        blocks?: Block[];
    }) => Promise<void>;
    /** Create note method */
    createNote: (params?: {
        title?: string;
        blocks?: Block[];
    }) => Promise<string>;
    /** Optional load notes method */
    loadNotes?: (projectId: string) => Promise<void>;
}

/**
 * Dependencies required by NotesFileSyncService
 */
export interface NotesFileSyncDependencies {
    localAdapter: LocalFSAdapter;
    noteStore: NoteSyncStore;
}

/**
 * Configuration for Notes file sync service
 */
export interface NotesFileSyncConfig {
    localAdapter: LocalFSAdapter;
    noteStore: NotesFileSyncDependencies['noteStore'];
    targetDirectory?: string;
    autoSync?: boolean;
    syncInterval?: number;
    enableFileWatching?: boolean;
}

/**
 * Notes File Sync Service State
 *
 * Internal state management for the sync service.
 */
export interface NotesFileSyncState {
    changeListeners: Set<(event: FileChangeEvent) => void>;
    disposed: boolean;
    syncInProgress: boolean;
    lastSyncTime: number;
    targetDirectory: string;
    fileChangeTrackers: Map<string, FileChangeTracker>;
    enableFileWatching: boolean;
}

/**
 * Emit change event to all listeners
 *
 * Notifies registered callbacks of file changes.
 * Handles errors in listener callbacks gracefully.
 *
 * @param state - Service state
 * @param event - File change event
 */
export function emitChange(
    state: NotesFileSyncState,
    event: FileChangeEvent
): void {
    state.changeListeners.forEach(callback => {
        try {
            callback(event);
        } catch (error) {
            console.error('[NotesFileSyncService] Error in change listener:', error);
        }
    });
}

/**
 * Check if service has been disposed
 *
 * Throws error if service is disposed.
 * Used to prevent operations after cleanup.
 *
 * @param state - Service state
 * @throws Error if service is disposed
 */
export function checkDisposed(state: NotesFileSyncState): void {
    if (state.disposed) {
        throw new Error('NotesFileSyncService has been disposed');
    }
}

/**
 * Create FileSyncService interface implementation
 *
 * Returns object with all FileSyncService methods bound to dependencies.
 * Handles file operations, batch writes, and mounting.
 *
 * @param state - Service state
 * @param deps - Service dependencies
 * @returns FileSyncService interface implementation
 */
export function createFileSyncServiceImplementation(
    state: NotesFileSyncState,
    deps: NotesFileSyncDependencies
): Pick<FileSyncService,
    | 'readFile'
    | 'writeFile'
    | 'deleteFile'
    | 'listFiles'
    | 'getFileMetadata'
    | 'writeBatch'
    | 'mount'
> {
    const { localAdapter } = deps;

    return {
        async readFile(path: string): Promise<string> {
            checkDisposed(state);
            const result = await localAdapter.readFile(path);
            return result.content;
        },

        async writeFile(path: string, content: string): Promise<void> {
            checkDisposed(state);
            await localAdapter.writeFile(path, content);
            emitChange(state, { type: 'modified', path, timestamp: Date.now() });
        },

        async deleteFile(path: string): Promise<void> {
            checkDisposed(state);
            await localAdapter.deleteFile(path);
            emitChange(state, { type: 'deleted', path, timestamp: Date.now() });
        },

        async listFiles(path: string, recursive = false): Promise<string[]> {
            checkDisposed(state);

            if (!recursive) {
                const entries = await localAdapter.listDirectory(path);
                return entries.map((e: { name: string }) => path ? `${path}/${e.name}` : e.name);
            }

            const results: string[] = [];
            const queue: string[] = [path];

            while (queue.length > 0) {
                const currentPath = queue.shift()!;

                try {
                    const entries = await localAdapter.listDirectory(currentPath);

                    for (const entry of entries) {
                        const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                        results.push(entryPath);

                        if (entry.type === 'directory') {
                            queue.push(entryPath);
                        }
                    }
                } catch (error) {
                    console.warn(`[NotesFileSyncService] Failed to list ${currentPath}:`, error);
                }
            }

            return results;
        },

        async getFileMetadata(path: string): Promise<FileMetadata> {
            checkDisposed(state);

            try {
                const result = await localAdapter.readFile(path);
                return {
                    path,
                    size: result.content.length,
                    lastModified: Date.now(),
                    contentType: 'text/markdown'
                };
            } catch (error) {
                throw new Error(`Failed to get metadata for ${path}: ${error}`);
            }
        },

        async writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
            checkDisposed(state);
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
        },

        async mount(source: FileSystemDirectoryHandle): Promise<void> {
            checkDisposed(state);
            await localAdapter.setDirectoryHandle(source);
            console.log('[NotesFileSyncService] Mounted directory for notes sync');
        }
    };
}

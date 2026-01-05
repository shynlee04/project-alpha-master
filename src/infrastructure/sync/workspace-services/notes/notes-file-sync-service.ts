/**
 * @fileoverview Notes File Sync Service Implementation
 * @module infrastructure/sync/workspace-services/notes/notes-file-sync-service
 *
 * Full FileSyncService implementation for Notes workspace.
 * Provides bidirectional sync between notes and Markdown files.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type {
    FileSyncService,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions,
    FileSyncConfig
} from '../file-sync-service';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { SyncError } from '@/lib/filesystem/sync-types';
import {
    createFileSyncServiceImplementation,
    checkDisposed,
    type NotesFileSyncState,
    type NoteSyncStore
} from './notes-file-sync-core';
// ESM imports for Cloudflare Workers compatibility
import { setupFileWatcher, type FileChangeTracker } from './note-file-watcher';
import { syncNoteChanges } from './note-crud-operations';
import { NoteFolderBridge } from './note-folder-bridge';

/**
 * Configuration for Notes file sync service
 */
export interface NotesFileSyncConfig extends FileSyncConfig {
    localAdapter: LocalFSAdapter;
    noteStore: NoteSyncStore;
    targetDirectory?: string;
    autoSync?: boolean;
    syncInterval?: number;
    enableFileWatching?: boolean;
}

/**
 * Notes File Sync Service
 *
 * Full FileSyncService implementation for Notes workspace.
 * Provides bidirectional sync between notes and Markdown files.
 *
 * Features:
 * - Mount local directory for notes sync
 * - Bidirectional sync (notes ↔ Markdown files)
 * - Auto-sync on note changes
 * - File change watching
 * - Frontmatter support for metadata preservation
 */
export class NotesFileSyncService implements FileSyncService {
    private localAdapter: LocalFSAdapter;
    private noteStore: NoteSyncStore;
    private state: NotesFileSyncState;
    private syncTimer?: ReturnType<typeof setInterval>;
    private cleanupFileWatcher?: () => void;

    // FileSyncService interface methods (bound to state)
    declare readFile: (path: string) => Promise<string>;
    declare writeFile: (path: string, content: string) => Promise<void>;
    declare deleteFile: (path: string) => Promise<void>;
    declare listFiles: (path: string, recursive?: boolean) => Promise<string[]>;
    declare getFileMetadata: (path: string) => Promise<import('../file-sync-service').FileMetadata>;
    declare writeBatch: (operations: Array<{ path: string; content: string }>) => Promise<SyncResult>;
    declare mount: (source: FileSystemDirectoryHandle) => Promise<void>;

    constructor(config: NotesFileSyncConfig) {
        this.localAdapter = config.localAdapter;
        this.noteStore = config.noteStore;

        // Initialize state
        this.state = {
            changeListeners: new Set(),
            disposed: false,
            syncInProgress: false,
            lastSyncTime: 0,
            targetDirectory: config.targetDirectory || '/notes',
            fileChangeTrackers: new Map(),
            enableFileWatching: config.enableFileWatching !== false
        };

        // Bind FileSyncService interface methods
        const impl = createFileSyncServiceImplementation(this.state, { localAdapter: this.localAdapter, noteStore: this.noteStore });
        this.readFile = impl.readFile.bind(this);
        this.writeFile = impl.writeFile.bind(this);
        this.deleteFile = impl.deleteFile.bind(this);
        this.listFiles = impl.listFiles.bind(this);
        this.getFileMetadata = impl.getFileMetadata.bind(this);
        this.writeBatch = impl.writeBatch.bind(this);
        
        // Custom mount implementation to trigger bridge import
        this.mount = async (source: FileSystemDirectoryHandle) => {
            // Mount the directory in the adapter
            await impl.mount(source);
            
            // Trigger initial import via bridge
            console.log('[NotesFileSyncService] Directory mounted, starting initial import...');
            const bridge = new NoteFolderBridge(this.localAdapter, this.noteStore);
            try {
                await bridge.importDirectory();
                this.state.lastSyncTime = Date.now();
                console.log('[NotesFileSyncService] Initial import completed');
            } catch (error) {
                console.error('[NotesFileSyncService] Initial import failed:', error);
                // We don't rethrow here to allow the mount to "succeed" even if import has partial failures
                // The watcher will pick up changes later
            }
        };

        // Setup auto-sync if enabled
        if (config.autoSync !== false) {
            const interval = config.syncInterval || 5000;
            this.syncTimer = setInterval(() => {
                this.syncNoteChanges().catch(error => {
                    console.error('[NotesFileSyncService] Auto-sync failed:', error);
                });
            }, interval);
        }

        // Setup file watching if enabled
        if (this.state.enableFileWatching) {
            this.setupFileWatcher();
        }
    }

    async sync(_options?: SyncOptions): Promise<SyncResult> {
        checkDisposed(this.state);
        const startTime = Date.now();

        try {
            await this.syncNoteChanges();

            return {
                success: true,
                filesProcessed: this.state.fileChangeTrackers.size || this.noteStore.notesArray.length,
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
            syncing: this.state.syncInProgress,
            lastSync: this.state.lastSyncTime > 0 ? this.state.lastSyncTime : null,
            filesProcessed: this.noteStore.notesArray.length,
            error: null
        };
    }

    onFileChange(callback: (event: FileChangeEvent) => void): () => void {
        checkDisposed(this.state);
        this.state.changeListeners.add(callback);
        return () => {
            this.state.changeListeners.delete(callback);
        };
    }

    async dispose(): Promise<void> {
        this.state.disposed = true;
        this.state.changeListeners.clear();
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        if (this.cleanupFileWatcher) {
            this.cleanupFileWatcher();
        }
    }

    /**
     * Setup file watcher for external changes
     */
    private setupFileWatcher(): void {
        this.cleanupFileWatcher = setupFileWatcher(
            {
                targetDirectory: this.state.targetDirectory,
                fileAdapter: {
                    readFile: (path: string) => this.localAdapter.readFile(path)
                },
                noteStore: this.noteStore,
                listFiles: (path: string, recursive?: boolean) => this.listFiles(path, recursive),
                getFileMetadata: (path: string) => this.getFileMetadata(path)
            },
            (trackers: Map<string, FileChangeTracker>) => {
                this.state.fileChangeTrackers = trackers;
            }
        );
    }

    /**
     * Sync note changes to files
     */
    private async syncNoteChanges(): Promise<void> {
        if (this.state.syncInProgress) {
            console.log('[NotesFileSyncService] Sync already in progress, skipping');
            return;
        }

        this.state.syncInProgress = true;

        try {
            await syncNoteChanges(
                this.noteStore,
                {
                    readFile: (path: string) => this.localAdapter.readFile(path),
                    writeFile: (path: string, content: string) => this.writeFile(path, content)
                },
                this.state.targetDirectory
            );

            this.state.lastSyncTime = Date.now();
        } finally {
            this.state.syncInProgress = false;
        }
    }
}

/**
 * Factory function to create Notes file sync service
 */
export function createNotesFileSyncService(config: NotesFileSyncConfig): NotesFileSyncService {
    return new NotesFileSyncService(config);
}

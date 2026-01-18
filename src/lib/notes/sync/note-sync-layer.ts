/**
 * @fileoverview Note Sync Layer
 * @module lib/notes/sync/note-sync-layer
 * @governance CC-DF-02 - DexieDB → FSA Sync Layer
 *
 * Main orchestration layer for bidirectional synchronization.
 * Coordinates FileWatcher and CacheSync for automatic sync.
 */

import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
import type { NoteRecord } from '@/lib/notes/types';
import { FileWatcher } from './file-watcher';
import { CacheSync, BatchSyncResult } from './cache-sync';
import { useNoteStore } from '@/lib/notes/note-store';
import type { FileChangeEvent } from '@/domain/interfaces/storage-adapter.interface';

// ============================================================================
// Types
// ============================================================================

/**
 * Sync options
 */
export interface SyncOptions {
  /** Auto-sync interval in milliseconds */
  autoSyncInterval?: number;
  /** Conflict resolution callback */
  onConflict?: (noteId: string) => Promise<ConflictResolution>;
}

/**
 * Sync statistics
 */
export interface SyncStatistics {
  lastSyncAt: number;
  autoSyncedCount: number;
  externalChangeCount: number;
  totalConflicts: number;
}

// ============================================================================
// Note Sync Layer
// ============================================================================

/**
 * Note Sync Layer
 *
 * Main orchestration layer for bidirectional synchronization between DexieDB and FSA files.
 * Coordinates FileWatcher and CacheSync for automatic sync.
 *
 * @example
 * ```typescript
 * const syncLayer = new NoteSyncLayer(db, adapter);
 * await syncLayer.startWatching(notesDirHandle);
 *
 * // Handle DexieDB changes (auto-sync to FSA)
 * syncLayer.onNoteChange((change) => {
 *   await syncLayer.syncChangeToFSA(change);
 * });
 *
 * // Stop when done
 * syncLayer.stop();
 * ```
 */
export class NoteSyncLayer {
  private fileWatcher: FileWatcher | null = null;
  private cacheSync: CacheSync;
  private autoSyncInterval: ReturnType<typeof setInterval> | null = null;
  private syncStatistics: SyncStatistics;

  constructor(
    private adapter: StorageAdapter,
    private options: SyncOptions = {}
  ) {
    this.cacheSync = new CacheSync(adapter);
    this.syncStatistics = {
      lastSyncAt: 0,
      autoSyncedCount: 0,
      externalChangeCount: 0,
      totalConflicts: 0,
    };
  }

  /**
   * Start watching directory for external changes
   *
   * @param notesDirHandle - Directory handle for notes
   */
  async startWatching(notesDirHandle: FileSystemDirectoryHandle): Promise<void> {
    this.fileWatcher = new FileWatcher();

    const stopCallback = await this.fileWatcher.watch(notesDirHandle, (event) => {
      this.handleExternalChange(event);
    });

    // Start auto-sync
    if (this.options.autoSyncInterval) {
      this.autoSyncInterval = setInterval(() => {
        this.syncDexieToFSA();
      }, this.options.autoSyncInterval);
    }
  }

  /**
   * Handle external file change
   */
  private async handleExternalChange(event: FileChangeEvent): void {
    this.syncStatistics.externalChangeCount++;

    // Read from FSA and update DexieDB
    const store = useNoteStore.getState();
    const note = store.notes.find(n => {
      const filename = event.path.endsWith('.md') ? event.path : `${event.path}.md`;
      return n.id === extractNoteId(filename);
    });

    if (note) {
      // Note exists locally, check for conflict
      // For now, we'll just update to latest from FSA
      // Conflict resolution will be handled by CacheSync
      console.log(`[NoteSyncLayer] External change detected: ${event.path}`);

      // Sync from FSA to DexieDB (update local with external)
      const noteIds = [note.id];
      await this.cacheSync.syncFromFSA(noteIds);
    } else {
      // Note doesn't exist locally, this is new
      console.log(`[NoteSyncLayer] New external note detected: ${event.path}`);
      const noteIds = [extractNoteId(event.path)];
      await this.cacheSync.syncFromFSA(noteIds);
    }
  }

  /**
   * Sync local DexieDB changes to FSA (auto-sync on note update)
   *
   * This should be called when note changes in DexieDB
   */
  onNoteChange(callback: (noteId: string) => void): void {
    // For this story, we'll just log the change
    // In future stories, this could trigger auto-sync
    callback(noteId);
  }

  /**
   * Sync local DexieDB to FSA
   */
  async syncDexieToFSA(): Promise<BatchSyncResult> {
    const store = useNoteStore.getState();
    const notes = store.notes;

    const result = await this.cacheSync.syncToFSA(notes);
    this.syncStatistics.autoSyncedCount++;
    this.syncStatistics.lastSyncAt = Date.now();

    return result;
  }

  /**
   * Sync single note change from DexieDB to FSA
   */
  async syncChangeToFSA(noteId: string): Promise<void> {
    const store = useNoteStore.getState();
    const note = store.notes.find(n => n.id === noteId);

    if (!note) {
      console.warn(`[NoteSyncLayer] Note ${noteId} not found in DexieDB`);
      return;
    }

    await this.cacheSync.syncToFSA([note]);
  }

  /**
   * Stop watching
   */
  stop(): void {
    // Stop file watcher
    if (this.fileWatcher) {
      this.fileWatcher.stop();
      this.fileWatcher = null;
    }

    // Stop auto-sync
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStatistics(): SyncStatistics {
    return this.syncStatistics;
  }
}

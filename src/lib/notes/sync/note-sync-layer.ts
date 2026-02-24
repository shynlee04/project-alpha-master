/**
 * @fileoverview Note Sync Layer
 * @module lib/notes/sync/note-sync-layer
 * @governance CC-DF-02 - DexieDB → FSA Sync Layer
 *
 * Main orchestration layer for bidirectional synchronization.
 * Coordinates FileWatcher and CacheSync for automatic sync.
 */

import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
import { FileWatcher } from './file-watcher';
import { CacheSync, BatchSyncResult } from './cache-sync';
import { useNoteStore } from '@/lib/notes/note-store';
import type { FileChangeEvent } from '@/domain/interfaces/storage-adapter.interface';

// ============================================================================
// Types
// ============================================================================

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'keep-local' | 'keep-remote' | 'merge';

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

/**
 * Extract note ID from filename
 * Format: /notes/{noteId}.md or {noteId}.md
 */
function extractNoteId(filename: string): string {
  // Remove path prefix and .md extension
  const name = filename.split('/').pop()?.replace('.md', '') || '';
  return name;
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
  private changeCallbacks: Set<(noteId: string) => void> = new Set();

  constructor(
    adapter: StorageAdapter,
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

    await this.fileWatcher.watch(notesDirHandle, (event) => {
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
  private async handleExternalChange(event: FileChangeEvent): Promise<void> {
    this.syncStatistics.externalChangeCount++;

    // Read from FSA and update DexieDB
    const store = useNoteStore.getState();
    const notesArray = Array.from(store.notes.values());

    const note = notesArray.find(n => {
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
   * Register callback for note changes (for future auto-sync implementation)
   *
   * @param callback - Function to call when notes change
   */
  onNoteChange(callback: (noteId: string) => void): void {
    this.changeCallbacks.add(callback);
    console.log('[NoteSyncLayer] Note change callback registered');
  }

  /**
   * Notify all registered callbacks of a note change
   *
   * @param noteId - ID of the note that changed
   */
  private notifyNoteChange(noteId: string): void {
    for (const callback of this.changeCallbacks) {
      try {
        callback(noteId);
      } catch (error) {
        console.error('[NoteSyncLayer] Error in note change callback:', error);
      }
    }
  }

  /**
   * Sync local DexieDB to FSA
   */
  async syncDexieToFSA(): Promise<BatchSyncResult> {
    const store = useNoteStore.getState();
    const notes = Array.from(store.notes.values());

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
    const notesArray = Array.from(store.notes.values());
    const note = notesArray.find(n => n.id === noteId);

    if (!note) {
      console.warn(`[NoteSyncLayer] Note ${noteId} not found in DexieDB`);
      return;
    }

    await this.cacheSync.syncToFSA([note]);
    this.notifyNoteChange(noteId);
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

    // Clear callbacks
    this.changeCallbacks.clear();
  }

  /**
   * Get sync statistics
   */
  getSyncStatistics(): SyncStatistics {
    return this.syncStatistics;
  }
}

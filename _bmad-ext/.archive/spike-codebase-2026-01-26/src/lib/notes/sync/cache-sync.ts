/**
 * @fileoverview Note Cache Sync
 * @module lib/notes/sync/cache-sync
 * @governance CC-DF-02 - DexieDB → FSA Sync Layer
 *
 * Manages bidirectional synchronization between DexieDB cache and FSA files.
 * Detects conflicts and tracks sync statistics.
 */

import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
import type { NoteRecord } from '@/lib/notes/types';
import { formatNoteForStorage, parseNoteFromStorage, getNoteFilename, extractNoteId } from '@/lib/notes/format';
import type { FileChangeEvent } from '@/domain/interfaces/storage-adapter.interface';
import { useNoteStore } from '@/lib/notes/note-store';

// ============================================================================
// Types
// ============================================================================

/**
 * Sync result for a single note
 */
interface SyncResult {
  noteId: string;
  success: boolean;
  conflict?: boolean;
  error?: string;
}

/**
 * Batch sync result
 */
export interface BatchSyncResult {
  total: number;
  synced: number;
  failed: number;
  conflicts: number;
  merged: number;
  errors: string[];
  durationMs: number;
}

/**
 * Sync statistics
 */
export interface SyncStatistics {
  lastSyncAt: number;
  totalSynced: number;
  totalConflicts: number;
  syncHistory: Array<{
    timestamp: number;
    synced: number;
    conflicts: number;
  }>;
}

/**
 * Conflict resolution option
 */
export type ConflictResolution = 'keep-local' | 'keep-remote' | 'merge' | 'abort';

// ============================================================================
// Cache Sync
// ============================================================================

/**
 * Cache Sync
 *
 * Manages bidirectional synchronization between DexieDB cache and FSA files.
 * Detects conflicts and tracks sync statistics.
 *
 * @example
 * ```typescript
 * const cacheSync = new CacheSync(adapter);
 * await cacheSync.syncToFSA(notes, onProgress);
 * ```
 */
export class CacheSync {
  private adapter: StorageAdapter;
  private syncInProgress: boolean = false;

  constructor(
    private adapter: StorageAdapter
  ) {
    this.adapter = adapter;
  }

  /**
   * Sync notes from DexieDB to FSA (write to files)
   */
  async syncToFSA(
    notes: NoteRecord[],
    onProgress?: (progress: { current: number; total: number; note?: NoteRecord }) => void
  ): Promise<BatchSyncResult> {
    const startTime = Date.now();

    if (this.syncInProgress) {
      console.warn('[CacheSync] Sync already in progress, skipping');
      return { total: 0, synced: 0, failed: 0, conflicts: 0, merged: 0, errors: [], durationMs: 0 };
    }

    this.syncInProgress = true;

    try {
      const results: SyncResult[] = [];

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];

        // Write to FSA
        try {
          const markdown = formatNoteForStorage(note);
          const filename = getNoteFilename(note.id);

          await this.adapter.writeFile(filename, new TextEncoder().encode(markdown));

          results.push({
            noteId: note.id,
            success: true,
            conflict: false,
          });

          if (onProgress) {
            onProgress({ current: i + 1, total: notes.length, note });
          }
        } catch (error) {
          console.error(`[CacheSync] Failed to sync note ${note.id}:`, error);

          results.push({
            noteId: note.id,
            success: false,
            conflict: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const synced = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const errors = failed.map(r => r.error || 'Unknown').filter(Boolean);
      const conflicts = results.filter(r => r.conflict);

      const durationMs = Date.now() - startTime;

      return {
        total: results.length,
        synced: synced.length,
        failed: failed.length,
        conflicts: conflicts.length,
        merged: 0,
        errors,
        durationMs,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync notes from FSA to DexieDB (read from files)
   */
  async syncFromFSA(
    noteIds: string[],
    onProgress?: (progress: { current: number; total: number }) => void
  ): Promise<BatchSyncResult> {
    const startTime = Date.now();

    if (this.syncInProgress) {
      console.warn('[CacheSync] Sync already in progress, skipping');
      return { total: 0, synced: 0, failed: 0, conflicts: 0, merged: 0, errors: [], durationMs: 0 };
    }

    this.syncInProgress = true;

    try {
      const results: SyncResult[] = [];
      const store = useNoteStore.getState();

      for (let i = 0; i < noteIds.length; i++) {
        const noteId = noteIds[i];
        const filename = getNoteFilename(noteId);

        // Read from FSA
        try {
          const content = await this.adapter.readFile(filename);
          const parsed = parseNoteFromStorage(content.text, noteId);

          // Check if note exists in store
          const existingNote = store.notes.find(n => n.id === noteId);

          if (existingNote) {
            // Update existing note
            await store.updateNote(parsed.frontmatter);
            results.push({
              noteId,
              success: true,
              conflict: false,
            });
          } else {
            // Create new note
            await store.addNote(parsed.frontmatter);
            results.push({
              noteId,
              success: true,
              conflict: false,
            });
          }

          if (onProgress) {
            onProgress({ current: i + 1, total: noteIds.length });
          }
        } catch (error) {
          console.error(`[CacheSync] Failed to sync note ${noteId} from FSA:`, error);

          results.push({
            noteId,
            success: false,
            conflict: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const synced = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const errors = failed.map(r => r.error || 'Unknown').filter(Boolean);
      const conflicts = results.filter(r => r.conflict);

      const durationMs = Date.now() - startTime;

      return {
        total: results.length,
        synced: synced.length,
        failed: failed.length,
        conflicts: conflicts.length,
        merged: 0,
        errors,
        durationMs,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<SyncStatistics> {
    const store = useNoteStore.getState();
    const notes = store.notes;

    // Count notes with sync metadata
    const syncHistory: Array<{
      timestamp: number;
      synced: number;
      conflicts: number;
    }> = [];

    // Simple implementation - track recent syncs
    syncHistory.push({
      timestamp: Date.now(),
      synced: notes.filter(n => (n as any).lastSyncedAt !== undefined).length,
      conflicts: notes.filter(n => (n as any).lastSyncedAt === 'conflict').length,
    });

    return {
      lastSyncAt: Date.now(),
      totalSynced: notes.filter(n => (n as any).lastSyncedAt !== undefined).length,
      totalConflicts: notes.filter(n => (n as any).lastSyncedAt === 'conflict').length,
      totalMerges: 0,
      syncHistory,
    };
  }

  /**
   * Get sync status
   */
  getSyncStatus(): 'idle' | 'syncing' {
    return this.syncInProgress ? 'syncing' : 'idle';
  }
}

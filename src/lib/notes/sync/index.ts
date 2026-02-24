/**
 * @fileoverview Notes Sync Module Exports
 * @module lib/notes/sync
 * @governance CC-DF-02 - DexieDB → FSA Sync Layer
 *
 * Clean exports for the notes synchronization layer.
 */

export { FileWatcher } from './file-watcher';
export { CacheSync } from './cache-sync';
export type { BatchSyncResult, ConflictResolution, SyncStatistics } from './cache-sync';
export { NoteSyncLayer } from './note-sync-layer';
export type { SyncOptions } from './note-sync-layer';

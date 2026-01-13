/**
 * @fileoverview File Watcher Implementation
 * @module infrastructure/sync/core/file-watcher
 *
 * File watcher for detecting local file system changes.
 * Integrates with File System Access API's watcher functionality.
 */

import type { FileChangeCallback } from './sync-types';
import { SyncEventBus } from './sync-event-bus';

// ============================================================================
// File Watcher
// ============================================================================

/**
 * File watcher for detecting local file system changes
 * Integrates with File System Access API's watcher functionality
 */
export class FileWatcher {
  private watchHandles: Map<string, () => void> = new Map();
  private eventBus: SyncEventBus;
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private debounceMs: number;

  constructor(eventBus: SyncEventBus, debounceMs = 300) {
    this.eventBus = eventBus;
    this.debounceMs = debounceMs;
  }

  /**
   * Watch a file for changes
   * @param path - File path to watch
   * @param adapter - Storage adapter with watch capability
   * @param callback - Callback for file changes
   * @returns Unsubscribe function
   */
  watchFile(
    path: string,
    adapter: { watch?: (callback: FileChangeCallback) => () => void },
    callback?: FileChangeCallback
  ): () => void {
    if (!adapter.watch) {
      console.warn(`[FileWatcher] Adapter does not support watching: ${path}`);
      return () => {};
    }

    const handler: FileChangeCallback = (event) => {
      // Debounce rapid changes
      const timer = this.debounceTimers.get(path);
      if (timer) {
        clearTimeout(timer);
      }

      const newTimer = setTimeout(() => {
        // Emit through event bus
        this.eventBus.emit('file:synced', {
          path: event.path,
          direction: event.type === 'deleted' ? 'synced' : 'uploaded',
        });

        // Call callback if provided
        callback?.(event);

        this.debounceTimers.delete(path);
      }, this.debounceMs);

      this.debounceTimers.set(path, newTimer);
    };

    const unsubscribe = adapter.watch(handler);
    this.watchHandles.set(path, unsubscribe);

    return () => {
      unsubscribe();
      this.watchHandles.delete(path);
      const timer = this.debounceTimers.get(path);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(path);
      }
    };
  }

  /**
   * Stop watching all files
   */
  unwatchAll(): void {
    for (const [path, unsubscribe] of this.watchHandles) {
      unsubscribe();
      const timer = this.debounceTimers.get(path);
      if (timer) {
        clearTimeout(timer);
      }
    }
    this.watchHandles.clear();
    this.debounceTimers.clear();
  }

  /**
   * Get count of watched files
   */
  getWatchedFileCount(): number {
    return this.watchHandles.size;
  }
}

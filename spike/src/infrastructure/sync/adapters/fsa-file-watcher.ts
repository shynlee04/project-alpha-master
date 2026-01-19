/**
 * @fileoverview FSA File Watcher - File watching for File System Access API
 * @module infrastructure/sync/adapters/fsa-file-watcher
 *
 * Handles file change detection via experimental File System Access API watch().
 */

import type { FileChangeCallback, FileChangeEvent } from '../core/sync-types';

// ============================================================================
// File Watching
// ============================================================================

export interface FileWatcherConfig {
  directoryHandle: FileSystemDirectoryHandle | null;
  debug?: boolean;
}

/**
 * Watch for file changes using experimental File System Access API
 * @param config - Watcher configuration
 * @param callback - Callback invoked on file changes
 * @returns Unsubscribe function
 */
export function watchFiles(
  config: FileWatcherConfig,
  callback: FileChangeCallback
): () => void {
  if (!config.directoryHandle) {
    return () => {};
  }

  const changeListeners = new Map<string, () => void>();
  let watchHandle: any = null;

  // Start watching the directory
  const watcher = async () => {
    try {
      // Experimental File System Access API watch() method
      watchHandle = await (config.directoryHandle as any).watch({
        recursive: true,
      });

      for await (const entry of (watchHandle as any)) {
        const path = entry.path.join('/');

        for (const listener of changeListeners.values()) {
          listener();
        }

        callback({
          type: entry.type === 'removed' ? 'deleted' :
                 entry.type === 'appeared' ? 'created' : 'modified',
          path,
          timestamp: Date.now(),
          source: 'local',
        } as FileChangeEvent);
      }
    } catch (error) {
      if (config.debug) {
        console.debug('[FSAFileWatcher] Watch error:', error);
      }
    }
  };

  // Start watcher in background
  watcher().catch(() => {});

  // Return unsubscribe function
  return () => {
    changeListeners.clear();
    if (watchHandle) {
      watchHandle.close().catch(() => {});
      watchHandle = null;
    }
  };
}

/**
 * Close a watch handle
 * @param watchHandle - Watch handle to close
 */
export async function closeWatchHandle(watchHandle: any): Promise<void> {
  if (watchHandle) {
    await watchHandle.close();
  }
}

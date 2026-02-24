/**
 * @fileoverview Note File Watcher
 * @module lib/notes/sync/file-watcher
 * @governance CC-DF-02 - DexieDB → FSA Sync Layer
 *
 * Watches FSA files for external changes with native FileSystemObserver
 * API (Chrome 129+) and polling fallback for older browsers.
 */

import type { FileChangeEvent } from '@/domain/interfaces/storage-adapter.interface';

// ============================================================================
// Types
// ============================================================================

/**
 * Experimental FileSystemObserver interface (Chrome 129+)
 * This is a web standard proposal, not yet in TypeScript lib.
 */
interface FileSystemObserver extends Object {
  disconnect(): void;
  observe(handle: FileSystemHandle, options?: { recursive?: boolean }): Promise<void>;
}

declare global {
  interface Window {
    FileSystemObserver: {
      prototype: FileSystemObserver;
      new(callback: (records: unknown[], observer: FileSystemObserver) => void): FileSystemObserver;
    };
  }
}

/**
 * File system observer change record from Chrome's FileSystemObserver API.
 * Native format for Chrome 129+.
 */
interface FileSystemChangeRecord {
  root: FileSystemDirectoryHandle;
  changedHandle: FileSystemHandle | null;
  relativePathComponents: string[];
  type: 'appeared' | 'disappeared' | 'modified' | 'moved' | 'unknown' | 'errored';
  relativePathMovedFrom?: string[];
}

/**
 * File watcher options
 */
export interface WatcherOptions {
  /** Polling interval in milliseconds (fallback only) */
  pollInterval?: number;
  /** Debounce time in milliseconds */
  debounceMs?: number;
  /** Whether to watch recursively (native only) */
  recursive?: boolean;
}

/**
 * Callback for file changes
 */
type WatchCallback = (event: FileChangeEvent) => void;

/**
 * Stop callback return type
 */
type StopWatchingCallback = () => void;

// ============================================================================
// File Watcher
// ============================================================================

/**
 * File Watcher
 *
 * Watches FSA files for external changes using native FileSystemObserver API
 * (Chrome 129+) or polling fallback (Chrome < 129).
 *
 * @example
 * ```typescript
 * const watcher = new FileWatcher();
 * const stop = await watcher.watch(
 *   directoryHandle,
 *   (event) => console.log('Changed:', event.path, event.type)
 * );
 * // Later: stop();
 * ```
 */
export class FileWatcher {
  private observer: FileSystemObserver | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingChanges: Map<string, FileChangeEvent> = new Map();
  private callbacks: Set<WatchCallback> = new Set();
  private isNativeSupported: boolean;

  constructor(private options: WatcherOptions = {}) {
    this.options = {
      pollInterval: options.pollInterval ?? 2000,
      debounceMs: options.debounceMs ?? 500,
      recursive: options.recursive ?? true,
    };

    this.isNativeSupported = this.checkNativeSupport();
  }

  /**
   * Check if FileSystemObserver API is supported
   */
  private checkNativeSupport(): boolean {
    return typeof window !== 'undefined' && 'FileSystemObserver' in self;
  }

  /**
   * Start watching a directory for changes
   *
   * @param directoryHandle - Directory to watch
   * @param callback - Callback for file changes
   * @returns Promise resolving to stop function
   */
  async watch(
    directoryHandle: FileSystemDirectoryHandle,
    callback: WatchCallback
  ): Promise<StopWatchingCallback> {
    this.callbacks.add(callback);

    try {
      if (this.isNativeSupported) {
        const stopCallback = await this.watchNative(directoryHandle);
        return Promise.resolve(stopCallback);
      } else {
        const stopCallback = this.watchPolling(directoryHandle);
        return Promise.resolve(stopCallback);
      }
    } catch (error) {
      console.error('[FileWatcher] Failed to start watching:', error);
      throw error;
    }
  }

  /**
   * Watch using native FileSystemObserver API (Chrome 129+)
   */
  private async watchNative(
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<StopWatchingCallback> {
    const ObserverConstructor = (window as any).FileSystemObserver;
    const observer = new ObserverConstructor(
      (records: unknown[]) => {
        this.handleNativeChanges(records as FileSystemChangeRecord[]);
      }
    );

    this.observer = observer as unknown as FileSystemObserver;

    await (this.observer as any).observe(directoryHandle, {
      recursive: this.options.recursive,
    });

    // Return stop callback
    return () => {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    };
  }

  /**
   * Watch using polling fallback (Chrome < 129)
   */
  private watchPolling(
    directoryHandle: FileSystemDirectoryHandle
  ): StopWatchingCallback {
    const fileMap = new Map<string, { lastModified: number; size: number }>();

    // Initial scan
    this.scanDirectory(directoryHandle, fileMap).catch((error) => {
      console.error('[FileWatcher] Initial scan failed:', error);
    });

    // Start polling
    this.pollInterval = setInterval(async () => {
      await this.checkForChanges(directoryHandle, fileMap);
    }, this.options.pollInterval!);

    // Return stop callback
    return () => {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    };
  }

  /**
   * Handle native change events
   */
  private handleNativeChanges(records: FileSystemChangeRecord[]): void {
    for (const record of records) {
      if (record.changedHandle === null || record.type === 'errored') {
        console.warn('[FileWatcher] Ignoring change:', record.type);
        continue;
      }

      const path = '/' + record.relativePathComponents.join('/');

      const event: FileChangeEvent = {
        path,
        type: record.type === 'appeared'
          ? 'created'
          : record.type === 'disappeared'
          ? 'deleted'
          : 'modified',
        timestamp: Date.now(),
        source: 'platform',
      };

      this.queueEvent(event);
    }
  }

  /**
   * Check for changes via polling
   */
  private async checkForChanges(
    directoryHandle: FileSystemDirectoryHandle,
    fileMap: Map<string, { lastModified: number; size: number }>
  ): Promise<void> {
    const currentMap = new Map<string, { lastModified: number; size: number }>();
    await this.scanDirectory(directoryHandle, currentMap);

    // Detect changes
    for (const [path, current] of currentMap) {
      const previous = fileMap.get(path);

      if (!previous) {
        // File created
        this.queueEvent({ path, type: 'created', timestamp: Date.now(), source: 'platform' });
      } else if (current.lastModified !== previous.lastModified || current.size !== previous.size) {
        // File modified
        this.queueEvent({ path, type: 'modified', timestamp: Date.now(), source: 'platform' });
      }
    }

    // Detect deletions
    for (const path of fileMap.keys()) {
      if (!currentMap.has(path)) {
        this.queueEvent({ path, type: 'deleted', timestamp: Date.now(), source: 'platform' });
      }
    }

    // Update map for next iteration
    fileMap.clear();
    currentMap.forEach((value, key) => {
      fileMap.set(key, value);
    });
  }

  /**
   * Scan directory recursively
   */
  private async scanDirectory(
    directoryHandle: FileSystemDirectoryHandle,
    fileMap: Map<string, { lastModified: number; size: number }>
  ): Promise<void> {
    // Use async iterator to scan directory
    const iterator = (directoryHandle as any).entries();
    try {
      while (true) {
        const result = await iterator.next();
        if (result.done) break;

        const entry = result.value;
        const path = entry.name;

        if (entry.kind === 'file') {
          const file = await (entry as FileSystemFileHandle).getFile();
          fileMap.set(path, {
            lastModified: file.lastModified,
            size: file.size,
          });
        } else if (entry.kind === 'directory' && this.options.recursive) {
          await this.scanDirectory(entry as FileSystemDirectoryHandle, fileMap);
        }
      }
    } catch (error) {
      console.error('[FileWatcher] Scan directory failed:', error);
      throw error;
    }
  }

  /**
   * Queue event with debouncing
   */
  private queueEvent(event: FileChangeEvent): void {
    // Store in pending map
    this.pendingChanges.set(event.path, event);

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      // Fire all pending events
      const events = Array.from(this.pendingChanges.values());
      this.pendingChanges.clear();

      for (const evt of events) {
        for (const callback of this.callbacks) {
          callback(evt);
        }
      }
    }, this.options.debounceMs!);
  }

  /**
   * Stop watching
   */
  stop(): void {
    // Clear timers
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Stop native observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Clear callbacks
    this.callbacks.clear();
  }

  /**
   * Get watcher status
   */
  isActive(): boolean {
    return this.observer !== null || this.pollInterval !== null;
  }

  /**
   * Check if native API is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'FileSystemObserver' in self;
  }
}

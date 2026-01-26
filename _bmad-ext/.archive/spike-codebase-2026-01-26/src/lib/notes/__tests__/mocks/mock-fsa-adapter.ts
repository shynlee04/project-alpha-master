/**
 * @fileoverview Mock FSA Adapter
 * @module lib/notes/__tests__/mocks/mock-fsa-adapter
 *
 * In-memory implementation of StorageGateway for testing.
 * Simulates FSA behavior without actual file system.
 *
 * @epic CC-DESKTOP-FSA
 * @story CC-DF-05 - Migration Verification Tests
 * @created 2026-01-18
 */

// Import types directly to avoid path resolution issues
// ============================================================================
// Types (copied from storage-gateway.interface)
// ============================================================================

/**
 * File entry for list operations
 */
export interface FileEntry {
  path: string;
  size: number;
  modified: number;
}

/**
 * File change event
 */
export interface FileChangeEvent {
  kind: 'created' | 'modified' | 'deleted';
  path: string;
  timestamp: number;
}

/**
 * File change callback type
 */
export type FileChangeCallback = (event: FileChangeEvent) => void;

/**
 * Watch handle for stopping file watching
 */
export interface WatchHandle {
  stop: () => void;
}

/**
 * Storage Gateway Interface
 */
export interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(pattern: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): WatchHandle;
}

/**
 * Mock FSA Gateway - In-memory implementation of StorageGateway
 *
 * Simulates FSA behavior for testing without actual file system.
 * Stores files in a Map and tracks changes for testing watch callbacks.
 */
export class MockFSAGateway implements StorageGateway {
  private files = new Map<string, Uint8Array>();
  private changes: FileChangeEvent[] = [];
  private changeCallback: FileChangeCallback | null = null;
  private watchers = new Set<() => void>();
  private stopped = false;

  /**
   * Create mock FSA gateway
   */
  constructor(private options: { mockDelay?: number } = {}) {}

  /**
   * Read file from in-memory storage
   */
  async read(path: string): Promise<Uint8Array> {
    if (this.options.mockDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.mockDelay));
    }

    const file = this.files.get(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }

    return file;
  }

  /**
   * Write file to in-memory storage
   */
  async write(path: string, data: Uint8Array): Promise<void> {
    if (this.options.mockDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.mockDelay));
    }

    const existing = this.files.has(path);
    this.files.set(path, data);

    // Record change for testing
    const change: FileChangeEvent = {
      kind: existing ? 'modified' : 'created',
      path,
      timestamp: Date.now(),
    };

    this.changes.push(change);

    // Notify watcher if active
    if (this.changeCallback && !this.stopped) {
      this.changeCallback(change);
    }
  }

  /**
   * Delete file from in-memory storage
   */
  async delete(path: string): Promise<void> {
    if (this.options.mockDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.mockDelay));
    }

    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }

    this.files.delete(path);

    // Record change for testing
    const change: FileChangeEvent = {
      kind: 'deleted',
      path,
      timestamp: Date.now(),
    };

    this.changes.push(change);

    // Notify watcher if active
    if (this.changeCallback && !this.stopped) {
      this.changeCallback(change);
    }
  }

  /**
   * List files matching pattern
   */
  async list(pattern: string): Promise<FileEntry[]> {
    if (this.options.mockDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.mockDelay));
    }

    const patternRegex = pattern.replace('**/', '').replace(/\*/g, '.*');
    const files = Array.from(this.files.entries())
      .filter(([path]) => path.match(new RegExp(patternRegex)))
      .map(([path, data]) => ({
        path,
        size: data.length,
        modified: Date.now(),
      }));

    return files;
  }

  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    if (this.options.mockDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.mockDelay));
    }

    return this.files.has(path);
  }

  /**
   * Watch for file changes
   *
   * Returns a cleanup function to stop watching.
   */
  watch(callback: FileChangeCallback): WatchHandle {
    this.changeCallback = callback;
    this.stopped = false;

    const stop = () => {
      this.stopped = true;
      this.changeCallback = null;
      watchers.forEach((w) => w());
    };

    const watchers = this.watchers;
    watchers.add(stop);

    return {
      stop,
    };
  }

  // ==========================================================================
  // Test Helper Methods
  // ==========================================================================

  /**
   * Get all recorded changes (for test assertions)
   */
  getChanges(): FileChangeEvent[] {
    return [...this.changes];
  }

  /**
   * Clear recorded changes (for test setup)
   */
  clearChanges(): void {
    this.changes = [];
  }

  /**
   * Get number of files stored
   */
  getFileCount(): number {
    return this.files.size;
  }

  /**
   * Check if stopped
   */
  isStopped(): boolean {
    return this.stopped;
  }

  /**
   * Simulate external file change (for testing watch callbacks)
   */
  simulateExternalChange(path: string, kind: 'created' | 'modified' | 'deleted'): void {
    if (this.stopped) {
      return;
    }

    const change: FileChangeEvent = {
      kind,
      path,
      timestamp: Date.now(),
    };

    this.changes.push(change);

    if (this.changeCallback) {
      this.changeCallback(change);
    }
  }

  /**
   * Reset to initial state (for test isolation)
   */
  reset(): void {
    this.files.clear();
    this.changes = [];
    this.changeCallback = null;
    this.stopped = false;
    this.watchers.clear();
  }

  /**
   * Populate with mock data (for test setup)
   */
  async seedFiles(files: Record<string, string | Uint8Array>, noteId?: string): Promise<void> {
    for (const [path, content] of Object.entries(files)) {
      const data =
        typeof content === 'string'
          ? new TextEncoder().encode(content)
          : content;

      await this.write(path, data);
    }
  }
}

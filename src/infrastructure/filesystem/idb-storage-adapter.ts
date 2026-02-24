/**
 * @fileoverview IDB Storage Adapter - Implements StorageAdapter interface for IndexedDB
 * @module infrastructure/filesystem/idb-storage-adapter
 *
 * Clean implementation of StorageAdapter interface using Dexie's idbFiles table.
 * This is the PRIMARY storage adapter for mobile/tablet users.
 *
 * Features:
 * - Implements full StorageAdapter interface from domain layer
 * - Uses Dexie idbFiles table for persistence
 * - Polling-based file watching for reactive updates
 * - Binary (Uint8Array) and text support
 * - No workspaceId - only projectId per NO-WORKSPACE-MANDATE
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02 - Platform Storage Implementation
 */

import type {
  StorageAdapter,
  FileContent,
  FileMetadata,
  FileChangeCallback,
  FileChangeEvent,
} from '@/domain/interfaces/storage-adapter.interface';
import { FileSystemError } from './fs-errors';
import { getDb } from '@/infrastructure/persistence/dexie-db';
import type { IDBFileRecord } from '@/infrastructure/persistence/dexie-db-idb-file-types';

// ============================================================================
// Types
// ============================================================================

interface WatchOptions {
  pollInterval?: number;
  debounceMs?: number;
}

interface FileHashEntry {
  path: string;
  size: number;
  lastModified: number;
}

// ============================================================================
// IDB Storage Adapter
// ============================================================================

/**
 * IDB Storage Adapter
 *
 * Implements StorageAdapter interface using IndexedDB (via Dexie).
 * This is the primary storage mechanism for mobile/tablet users.
 *
 * @example
 * ```typescript
 * const adapter = new IDBStorageAdapter('proj_abc123');
 *
 * // Read file
 * const content = await adapter.readFile('src/index.ts');
 * console.log(content.text);
 *
 * // Watch for changes
 * const unwatch = adapter.watch((event) => {
 *   console.log('File changed:', event.path, event.type);
 * });
 * ```
 */
export class IDBStorageAdapter implements StorageAdapter {
  readonly name = 'indexeddb' as const;

  private readonly projectId: string;
  private watchInterval: ReturnType<typeof setInterval> | null = null;
  private fileHashes: Map<string, FileHashEntry> = new Map();
  private watchCallbacks: Set<FileChangeCallback> = new Set();
  private watchOptions: WatchOptions = {
    pollInterval: 2000,
    debounceMs: 300,
  };
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  // ============================================================================
  // StorageAdapter Implementation
  // ============================================================================

  /**
   * Check if adapter is available
   */
  isAvailable(): boolean {
    return getDb() !== null;
  }

  /**
   * Read file content
   */
  async readFile(path: string): Promise<FileContent> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'READ_FAILED');
      }

      const record = await db.idbFiles.get([this.projectId, path]);
      if (!record) {
        throw new FileSystemError(`File not found: ${path}`, 'NOT_FOUND');
      }

      const data = record.content;

      // Also get text representation for text files
      let text: string | undefined;
      if (this.isTextFile(path)) {
        const decoder = new TextDecoder('utf-8');
        text = decoder.decode(data);
      }

      return {
        path,
        data,
        text,
        metadata: {
          path,
          size: record.size,
          lastModified: record.lastModified,
          contentType: this.guessContentType(path),
          syncState: 'synced',
        },
      };
    } catch (error: unknown) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to read file: ${path} - ${err.message || 'Unknown error'}`,
        'READ_FAILED',
        error
      );
    }
  }

  /**
   * Write file content
   */
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'WRITE_FAILED');
      }

      const now = Date.now();
      const existing = await db.idbFiles.get([this.projectId, path]);

      const record: IDBFileRecord = {
        projectId: this.projectId,
        path,
        content,
        kind: 'file',
        size: content.length,
        lastModified: now,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      await db.idbFiles.put(record);

      // Update hash after write
      this.fileHashes.set(path, {
        path,
        size: content.length,
        lastModified: now,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to write file: ${path} - ${err.message || 'Unknown error'}`,
        'WRITE_FAILED',
        error
      );
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'DELETE_FAILED');
      }

      // Delete the exact file
      await db.idbFiles.delete([this.projectId, path]);

      // Delete all files under this path (if it's a directory)
      const allFiles = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .toArray();

      for (const file of allFiles) {
        if (file.path.startsWith(path + '/')) {
          await db.idbFiles.delete([this.projectId, file.path]);
        }
      }

      this.fileHashes.delete(path);
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to delete file: ${path} - ${err.message || 'Unknown error'}`,
        'DELETE_FAILED',
        error
      );
    }
  }

  /**
   * List files matching pattern
   */
  async listFiles(pattern: string): Promise<string[]> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'LIST_FAILED');
      }

      const allFiles = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .toArray();

      // Simple glob matching
      const regex = this.patternToRegex(pattern);
      return allFiles
        .filter((file) => regex.test(file.path))
        .map((file) => file.path);
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to list files: ${err.message || 'Unknown error'}`,
        'LIST_FAILED',
        error
      );
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<FileMetadata> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'METADATA_FAILED');
      }

      const record = await db.idbFiles.get([this.projectId, path]);
      if (!record) {
        throw new FileSystemError(`File not found: ${path}`, 'NOT_FOUND');
      }

      return {
        path,
        size: record.size,
        lastModified: record.lastModified,
        contentType: this.guessContentType(path),
        syncState: 'synced',
      };
    } catch (error: unknown) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to get metadata: ${path} - ${err.message || 'Unknown error'}`,
        'METADATA_FAILED',
        error
      );
    }
  }

  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) return false;

      // Check for exact file match
      const exactMatch = await db.idbFiles.get([this.projectId, path]);
      if (exactMatch) return true;

      // Check for directory (has files under this path)
      const hasChildren = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .filter((file) => file.path.startsWith(path + '/'))
        .first();

      return !!hasChildren;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // File Watching (Polling-based)
  // ============================================================================

  /**
   * Watch for file changes
   * Uses polling since IndexedDB doesn't have native file watching
   */
  watch(callback: FileChangeCallback): () => void {
    this.watchCallbacks.add(callback);

    // Start polling if not already running
    if (!this.watchInterval) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.watchCallbacks.delete(callback);
      if (this.watchCallbacks.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Start polling for file changes
   */
  private startPolling(): void {
    if (this.watchInterval) return;

    console.log('[IDBStorageAdapter] Starting file watch polling');

    this.watchInterval = setInterval(async () => {
      await this.checkForChanges();
    }, this.watchOptions.pollInterval);

    // Do initial hash scan
    this.scanAllFiles().catch(console.error);
  }

  /**
   * Stop polling for file changes
   */
  private stopPolling(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log('[IDBStorageAdapter] Stopped file watch polling');
    }
  }

  /**
   * Scan all files and build hash map
   */
  private async scanAllFiles(): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;

      const files = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .toArray();

      for (const file of files) {
        if (this.shouldWatchFile(file.path)) {
          this.fileHashes.set(file.path, {
            path: file.path,
            size: file.size,
            lastModified: file.lastModified,
          });
        }
      }

      console.log(`[IDBStorageAdapter] Scanned ${this.fileHashes.size} files for watching`);
    } catch (error) {
      console.warn('[IDBStorageAdapter] Failed to scan files:', error);
    }
  }

  /**
   * Check for file changes since last poll
   */
  private async checkForChanges(): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;

      const currentFiles = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .toArray();
      const currentSet = new Set(currentFiles.filter(f => this.shouldWatchFile(f.path)).map(f => f.path));

      // Check for modified and deleted files
      for (const [path, entry] of this.fileHashes) {
        if (!currentSet.has(path)) {
          // File was deleted
          this.emitChange({ type: 'deleted', path, timestamp: Date.now(), source: 'local' });
          this.fileHashes.delete(path);
        } else {
          // Check if modified
          const current = currentFiles.find(f => f.path === path);
          if (current && this.isFileModified(current, entry)) {
            this.emitChange({ type: 'modified', path, timestamp: Date.now(), source: 'local' });
            this.fileHashes.set(path, {
              path,
              size: current.size,
              lastModified: current.lastModified,
            });
          }
        }
      }

      // Check for new files
      for (const file of currentFiles) {
        if (this.shouldWatchFile(file.path) && !this.fileHashes.has(file.path)) {
          this.emitChange({ type: 'created', path: file.path, timestamp: Date.now(), source: 'local' });
          this.fileHashes.set(file.path, {
            path: file.path,
            size: file.size,
            lastModified: file.lastModified,
          });
        }
      }
    } catch (error) {
      console.warn('[IDBStorageAdapter] Error checking for changes:', error);
    }
  }

  /**
   * Check if file was modified since last hash
   */
  private isFileModified(current: IDBFileRecord, entry: FileHashEntry): boolean {
    return current.size !== entry.size || current.lastModified !== entry.lastModified;
  }

  /**
   * Emit change event to all callbacks (debounced)
   */
  private emitChange(event: FileChangeEvent): void {
    // Clear existing timer for this path
    const existingTimer = this.debounceTimers.get(event.path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Debounce the emission
    const timer = setTimeout(() => {
      for (const callback of this.watchCallbacks) {
        try {
          callback(event);
        } catch (error) {
          console.error('[IDBStorageAdapter] Error in watch callback:', error);
        }
      }
      this.debounceTimers.delete(event.path);
    }, this.watchOptions.debounceMs);

    this.debounceTimers.set(event.path, timer);
  }

  /**
   * Check if file should be watched
   */
  private shouldWatchFile(path: string): boolean {
    // Skip binary files
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.woff', '.woff2'];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    if (binaryExtensions.includes(ext)) return false;

    // Skip node_modules and .git
    if (path.includes('node_modules/') || path.includes('.git/')) return false;

    return true;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Convert glob pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '{{DOUBLESTAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/{{DOUBLESTAR}}/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Check if file is a text file based on extension
   */
  private isTextFile(path: string): boolean {
    const textExtensions = [
      '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
      '.json', '.md', '.txt', '.html', '.css', '.scss',
      '.yaml', '.yml', '.xml', '.svg', '.vue', '.svelte',
      '.py', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.h',
    ];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    return textExtensions.includes(ext);
  }

  /**
   * Guess content type from file extension
   */
  private guessContentType(path: string): string {
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    const types: Record<string, string> = {
      '.ts': 'text/typescript',
      '.tsx': 'text/typescript',
      '.js': 'text/javascript',
      '.jsx': 'text/javascript',
      '.json': 'application/json',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.css': 'text/css',
      '.scss': 'text/scss',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Dispose adapter and clean up resources
   */
  dispose(): void {
    this.stopPolling();
    this.watchCallbacks.clear();
    this.fileHashes.clear();
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create IDB Storage Adapter
 */
export function createIDBStorageAdapter(projectId: string): IDBStorageAdapter {
  return new IDBStorageAdapter(projectId);
}

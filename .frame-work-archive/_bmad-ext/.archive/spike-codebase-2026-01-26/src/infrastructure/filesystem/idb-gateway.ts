/**
 * @fileoverview IDB Gateway - IndexedDB implementation of StorageGateway
 * @module infrastructure/filesystem/idb-gateway
 *
 * **ARC-B03**: Implement IDBGateway adapter
 *
 * Per ADR-033 Decision D2:
 * - Mobile/Tablet use IndexedDB for file storage
 * - Files stored as binary data (Uint8Array) in idbFiles table
 * - Watching implemented via polling (no native file watching in IDB)
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B03
 * @author Team B
 * @created 2026-01-17
 */

import type {
  StorageGateway,
  FileEntry,
  FileChangeEvent,
  FileChangeCallback,
  WatchHandle,
} from '@/domain/interfaces/storage-gateway.interface';
import { FileSystemError } from './fs-errors';
import { getDb } from '@/infrastructure/persistence/dexie-db';
import type { IDBFileRecord } from '@/infrastructure/persistence/dexie-db-idb-file-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Watch options for IndexedDB change detection
 */
interface WatchOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Debounce time in milliseconds (default: 300) */
  debounceMs?: number;
}

/**
 * File hash entry for change detection
 */
interface FileHashEntry {
  path: string;
  size: number;
  lastModified: number;
}

// ============================================================================
// IDBGateway Implementation
// ============================================================================

/**
 * IDB Gateway - IndexedDB Storage Gateway
 *
 * @remarks
 * Implements StorageGateway interface using IndexedDB.
 * This is the primary storage mechanism for mobile/tablet users.
 *
 * Per ADR-033 Decision D2:
 * - Mobile/Tablet with IndexedDB → IDBGateway
 * - Files stored as binary data in idbFiles table
 * - Watching via polling fallback (no native file watching)
 *
 * @example
 * ```ts
 * const gateway = new IDBGateway('proj_abc123');
 *
 * // Read file
 * const content = await gateway.read('notes/welcome.md');
 *
 * // Write file
 * await gateway.write('notes/welcome.md', new TextEncoder().encode('# Welcome'));
 *
 * // Watch for changes
 * const watchHandle = gateway.watch((event) => {
 *   console.log('File changed:', event.path, event.kind);
 * });
 *
 * // Cleanup
 * watchHandle.dispose();
 * ```
 */
export class IDBGateway implements StorageGateway {
  private readonly projectId: string;
  private watchInterval: ReturnType<typeof setInterval> | null = null;
  private fileHashes: Map<string, FileHashEntry> = new Map();
  private watchCallbacks: Set<FileChangeCallback> = new Set();
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private watchOptions: WatchOptions = {
    pollInterval: 2000,
    debounceMs: 300,
  };

  /**
   * Create IDBGateway instance
   *
   * @param projectId - The project ID for this gateway
   */
  constructor(projectId: string) {
    this.projectId = projectId;
  }

  // ============================================================================
  // StorageGateway Implementation
  // ============================================================================

  /**
   * Read file content as bytes
   *
   * @param path - Relative path from project root
   * @returns File content as Uint8Array
   * @throws {FileSystemError} if file doesn't exist or can't be read
   */
  async read(path: string): Promise<Uint8Array> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'READ_FAILED');
      }

      const record = await db.idbFiles.get([this.projectId, path]);
      if (!record) {
        throw new FileSystemError(
          `File not found: ${path}`,
          'NOT_FOUND'
        );
      }

      return record.content;
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
   *
   * @param path - Relative path from project root
   * @param data - File content as bytes
   * @throws {FileSystemError} if write fails
   */
  async write(path: string, data: Uint8Array): Promise<void> {
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
        content: data,
        kind: 'file',
        size: data.length,
        lastModified: now,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      await db.idbFiles.put(record);

      // Update hash after write
      this.fileHashes.set(path, {
        path,
        size: data.length,
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
   * Delete a file or directory
   *
   * @param path - Relative path from project root
   * @throws {FileSystemError} if delete fails
   */
  async delete(path: string): Promise<void> {
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
        `Failed to delete: ${path} - ${err.message || 'Unknown error'}`,
        'DELETE_FAILED',
        error
      );
    }
  }

  /**
   * List directory contents
   *
   * @param path - Relative path from project root ("." for root)
   * @returns Array of file entries
   * @throws {FileSystemError} if path is not a directory
   */
  async list(path: string): Promise<FileEntry[]> {
    try {
      const db = getDb();
      if (!db) {
        throw new FileSystemError('Database not available', 'LIST_FAILED');
      }

      const allFiles = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .toArray();

      // Filter files by path
      const prefix = path === '.' || path === '' ? '' : path + '/';
      const entries: FileEntry[] = [];

      // Track unique immediate children (files and directories)
      const seen = new Set<string>();

      for (const file of allFiles) {
        const relativePath = file.path.startsWith(prefix)
          ? file.path.slice(prefix.length)
          : null;

        if (relativePath === null || relativePath === '') continue;

        // Get the immediate child name
        const firstSlash = relativePath.indexOf('/');
        const immediateName = firstSlash === -1
          ? relativePath
          : relativePath.slice(0, firstSlash);

        if (immediateName && !seen.has(immediateName)) {
          seen.add(immediateName);

          const fullPath = prefix + immediateName;
          const isDirectory = firstSlash !== -1 ||
            await this.isDirectory(fullPath, allFiles);

          entries.push({
            path: fullPath,
            kind: isDirectory ? 'directory' : 'file',
            size: isDirectory ? 0 : file.size,
            lastModified: isDirectory ? 0 : file.lastModified,
          });
        }
      }

      return entries;
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to list directory: ${path} - ${err.message || 'Unknown error'}`,
        'LIST_FAILED',
        error
      );
    }
  }

  /**
   * Check if a path is a directory (has children)
   */
  private async isDirectory(
    path: string,
    allFiles?: IDBFileRecord[]
  ): Promise<boolean> {
    if (!allFiles) {
      const db = getDb();
      if (!db) return false;
      allFiles = await db.idbFiles
        .where('projectId')
        .equals(this.projectId)
        .toArray();
    }

    return allFiles.some(file => file.path.startsWith(path + '/'));
  }

  /**
   * Check if file or directory exists
   *
   * @param path - Relative path from project root
   * @returns true if exists, false otherwise
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
        .filter(file => file.path.startsWith(path + '/'))
        .first();

      return !!hasChildren;
    } catch {
      return false;
    }
  }

  /**
   * Watch for file changes
   *
   * @param callback - Function to call when files change
   * @returns Watch handle with dispose() method
   *
   * @remarks
   * IndexedDB doesn't support native file watching.
   * Uses polling-based change detection as fallback.
   */
  watch(callback: FileChangeCallback): WatchHandle {
    this.watchCallbacks.add(callback);

    // Start watching if not already running
    if (!this.watchInterval) {
      this.startPollingWatch();
    }

    // Return dispose handle
    return {
      dispose: () => {
        this.watchCallbacks.delete(callback);
        if (this.watchCallbacks.size === 0) {
          this.stopWatching();
        }
      },
    };
  }

  // ============================================================================
  // File Watching Implementation (Polling only)
  // ============================================================================

  /**
   * Start watching using polling (IndexedDB has no native watching)
   */
  private startPollingWatch(): void {
    console.log('[IDBGateway] Started polling-based watch');

    this.watchInterval = setInterval(async () => {
      await this.checkForChanges();
    }, this.watchOptions.pollInterval);

    // Initial scan
    this.scanAllFiles().catch(console.error);
  }

  /**
   * Stop watching for file changes
   */
  private stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log('[IDBGateway] Stopped polling watch');
    }

    this.watchCallbacks.clear();
    this.fileHashes.clear();
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
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
      const currentSet = new Set(currentFiles.map(f => f.path));

      // Check for deleted and modified files
      for (const [path, entry] of this.fileHashes) {
        if (!currentSet.has(path)) {
          this.emitChange({ path, kind: 'deleted' });
          this.fileHashes.delete(path);
        } else {
          const current = currentFiles.find(f => f.path === path);
          if (current && this.isFileModified(current, entry)) {
            this.emitChange({ path, kind: 'modified' });
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
        if (!this.fileHashes.has(file.path)) {
          this.emitChange({ path: file.path, kind: 'created' });
          this.fileHashes.set(file.path, {
            path: file.path,
            size: file.size,
            lastModified: file.lastModified,
          });
        }
      }
    } catch (error) {
      console.warn('[IDBGateway] Error checking for changes:', error);
    }
  }

  /**
   * Check if file was modified
   */
  private isFileModified(
    current: IDBFileRecord,
    entry: FileHashEntry
  ): boolean {
    return current.size !== entry.size || current.lastModified !== entry.lastModified;
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

      console.log(`[IDBGateway] Scanned ${this.fileHashes.size} files for watching`);
    } catch (error) {
      console.warn('[IDBGateway] Failed to scan files:', error);
    }
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
          console.error('[IDBGateway] Error in watch callback:', error);
        }
      }
      this.debounceTimers.delete(event.path);
    }, this.watchOptions.debounceMs);

    this.debounceTimers.set(event.path, timer);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if file should be watched
   */
  private shouldWatchFile(path: string): boolean {
    // Skip binary files
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip',
      '.woff', '.woff2', '.eot', '.ttf', '.mp4', '.mp3', '.webm',
    ];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    if (binaryExtensions.includes(ext)) return false;

    // Skip excluded directories
    for (const dir of ['node_modules', '.git', '.next', 'dist']) {
      if (path.includes(`${dir}/`)) return false;
    }

    return true;
  }
}

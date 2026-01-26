/**
 * @fileoverview FSA Gateway - File System Access API implementation of StorageGateway
 * @module infrastructure/filesystem/fsa-gateway
 *
 * **ARC-B02**: Implement FSAGateway adapter with handle persistence
 *
 * Per ADR-033 Decision D2:
 * - FSA for desktop projects
 * - Handle persistence via IndexedDB (Chrome DevRel recommended)
 * - File watching via FileSystemObserver (129+) or polling fallback
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B02
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
import * as fileOps from './file-ops';
import * as dirOps from './dir-ops';

// ============================================================================
// Types
// ============================================================================

/**
 * Watch options for file change detection
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
  hash?: string;
}

// ============================================================================
// FileSystemObserver Support (Chrome 129+)
// ============================================================================

/**
 * Check if FileSystemObserver is supported
 *
 * @returns true if FileSystemObserver API is available
 */
function isFileSystemObserverSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  // @ts-ignore - FileSystemObserver is experimental (Chrome 129+)
  return typeof (window as unknown as { FileSystemObserver?: unknown }).FileSystemObserver === 'function';
}

// ============================================================================
// FSAGateway Implementation
// ============================================================================

/**
 * FSA Gateway - File System Access API Storage Gateway
 *
 * @remarks
 * Implements StorageGateway interface using File System Access API.
 * This is the primary storage mechanism for desktop users.
 *
 * Per ADR-033 Decision D2:
 * - Desktop with FSA → FSAGateway
 * - Handle persisted via IndexedDB
 * - File watching via FileSystemObserver or polling fallback
 *
 * @example
 * ```ts
 * const handle = await showDirectoryPicker();
 * const gateway = new FSAGateway(handle);
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
export class FSAGateway implements StorageGateway {
  private readonly directoryHandle: FileSystemDirectoryHandle;
  private watchObserver: unknown | null = null; // FileSystemObserver (Chrome 129+)
  private watchInterval: ReturnType<typeof setInterval> | null = null;
  private fileHashes: Map<string, FileHashEntry> = new Map();
  private watchCallbacks: Set<FileChangeCallback> = new Set();
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private watchOptions: WatchOptions = {
    pollInterval: 2000,
    debounceMs: 300,
  };

  /**
   * Create FSAGateway instance
   *
   * @param directoryHandle - The FSA directory handle for the project root
   */
  constructor(directoryHandle: FileSystemDirectoryHandle) {
    this.directoryHandle = directoryHandle;
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
      const result = await fileOps.readFile(this.directoryHandle, path, {
        encoding: 'binary',
      });
      // Handle both ArrayBuffer and Uint8Array results
      const data = 'data' in result ? result.data : result;
      return data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBufferLike);
    } catch (error: unknown) {
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
      // For text files, decode and write as string
      if (this.isTextFile(path)) {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(data);
        await fileOps.writeFile(this.directoryHandle, path, text);
      } else {
        // For binary files, write as Blob
        await this.writeBinaryFile(path, data);
      }

      // Update hash after write
      await this.updateFileHash(path);
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
   * Write binary file content directly
   *
   * @param path - Relative path from project root
   * @param content - File content as bytes
   */
  private async writeBinaryFile(path: string, content: Uint8Array): Promise<void> {
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop()!;

    // Navigate to parent directory, creating as needed
    let dir = this.directoryHandle;
    for (const segment of segments) {
      dir = await dir.getDirectoryHandle(segment, { create: true });
    }

    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content as unknown as ArrayBuffer);
    await writable.close();
  }

  /**
   * Delete a file or directory
   *
   * @param path - Relative path from project root
   * @throws {FileSystemError} if delete fails
   */
  async delete(path: string): Promise<void> {
    try {
      await fileOps.deleteFile(this.directoryHandle, path);
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
      const targetDir = path === '.' || path === ''
        ? this.directoryHandle
        : await this.getDirectoryHandleForPath(path);

      const entries: FileEntry[] = [];

      // Iterate through directory entries using keys() method
      // @ts-ignore - keys() is the correct method for iterating directory handles
      for await (const name of targetDir.keys()) {
        const entryPath = path === '.' || path === ''
          ? name
          : `${path}/${name}`;

        try {
          // Try to get as directory - if it succeeds, it's a directory
          await targetDir.getDirectoryHandle(name);
          entries.push({
            path: entryPath,
            kind: 'directory',
            size: 0,
            lastModified: 0,
          });
        } catch {
          // Not a directory, must be a file
          try {
            const fileHandle = await targetDir.getFileHandle(name);
            const file = await fileHandle.getFile();
            entries.push({
              path: entryPath,
              kind: 'file',
              size: file.size,
              lastModified: file.lastModified,
            });
          } catch {
            // Skip if we can't access it
            continue;
          }
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
   * Check if file or directory exists
   *
   * @param path - Relative path from project root
   * @returns true if exists, false otherwise
   */
  async exists(path: string): Promise<boolean> {
    try {
      await this.getHandle(path);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // CC-IDE-02: Extended Methods for FileTree Compatibility
  // ============================================================================

  /**
   * Rename a file or directory
   *
   * @param oldPath - Current relative path
   * @param newPath - New relative path
   * @throws {FileSystemError} if rename access denied or path doesn't exist
   *
   * @remarks
   * Uses FSA native move() operation for efficiency.
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      await dirOps.rename(this.directoryHandle, oldPath, newPath);

      // Update hash entries after rename
      const oldEntry = this.fileHashes.get(oldPath);
      if (oldEntry) {
        this.fileHashes.delete(oldPath);
        this.fileHashes.set(newPath, {
          path: newPath,
          size: oldEntry.size,
          lastModified: Date.now(),
          hash: oldEntry.hash,
        });
      }

      // Emit change event
      this.emitChange({ path: newPath, kind: 'modified' });
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to rename: ${oldPath} → ${newPath} - ${err.message || 'Unknown error'}`,
        'RENAME_FAILED',
        error
      );
    }
  }

  /**
   * Create a new directory
   *
   * @param path - Relative path for new directory
   * @throws {FileSystemError} if create access denied or parent doesn't exist
   *
   * @remarks
   * Basic directory creation for FileTree (overlap validation at UI layer).
   */
  async createDirectory(path: string): Promise<void> {
    try {
      // Create directory using dir-ops
      await dirOps.createDirectory(this.directoryHandle, path);

      // Emit change event
      this.emitChange({ path, kind: 'created' });
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to create directory: ${path} - ${err.message || 'Unknown error'}`,
        'CREATE_DIRECTORY_FAILED',
        error
      );
    }
  }

  /**
   * Watch for file changes
   *
   * @param callback - Function to call when files change
   * @returns Watch handle with dispose() method
   *
   * @remarks
   * Uses FileSystemObserver (Chrome 129+) if available,
   * otherwise falls back to polling-based change detection.
   */
  watch(callback: FileChangeCallback): WatchHandle {
    this.watchCallbacks.add(callback);

    // Start watching if not already running
    if (!this.watchObserver && !this.watchInterval) {
      if (isFileSystemObserverSupported()) {
        this.startObserverWatch();
      } else {
        this.startPollingWatch();
      }
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
  // File Watching Implementation
  // ============================================================================

  /**
   * Start watching using FileSystemObserver (Chrome 129+)
   */
  private startObserverWatch(): void {
    try {
      // @ts-ignore - FileSystemObserver is experimental (Chrome 129+)
      const Observer = (window as unknown as { FileSystemObserver?: { new (cb: any): any } }).FileSystemObserver;

      if (!Observer) {
        throw new Error('FileSystemObserver not available');
      }

      // @ts-ignore - FileSystemObserver constructor is experimental
      this.watchObserver = new Observer(async (records: unknown[]) => {
        for (const record of records as { root: FileSystemHandle; changes: unknown[] }[]) {
          const path = await this.handleToPath(record.root);
          if (!path) continue;

          for (const change of record.changes) {
            const entryPath = (change as { path?: string }).path
              ? `${path}/${(change as { path: string }).path}`
              : path;

            const kind = (change as { type?: string }).type === 'deleted'
              ? 'deleted'
              : (change as { type?: string }).type === 'appeared'
                ? 'created'
                : 'modified';

            this.emitChange({ path: entryPath, kind });
          }
        }
      });

      // @ts-ignore - observe() is experimental
      (this.watchObserver as { observe: (handle: FileSystemHandle, options: unknown) => void })
        .observe(this.directoryHandle, { recursive: true });
      console.log('[FSAGateway] Started FileSystemObserver watch');
    } catch (error) {
      console.warn('[FSAGateway] FileSystemObserver failed, falling back to polling:', error);
      this.watchObserver = null;
      this.startPollingWatch();
    }
  }

  /**
   * Start watching using polling fallback
   */
  private startPollingWatch(): void {
    console.log('[FSAGateway] Started polling-based watch');

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
    if (this.watchObserver) {
      // @ts-ignore - disconnect() is experimental
      this.watchObserver.disconnect();
      this.watchObserver = null;
      console.log('[FSAGateway] Stopped FileSystemObserver watch');
    }

    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log('[FSAGateway] Stopped polling watch');
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
      const currentFiles = await this.getAllFiles(this.directoryHandle, '');
      const currentSet = new Set(currentFiles);

      // Check for deleted and modified files
      for (const [path, entry] of this.fileHashes) {
        if (!currentSet.has(path)) {
          this.emitChange({ path, kind: 'deleted' });
          this.fileHashes.delete(path);
        } else {
          const isModified = await this.isFileModified(path, entry);
          if (isModified) {
            this.emitChange({ path, kind: 'modified' });
            await this.updateFileHash(path);
          }
        }
      }

      // Check for new files
      for (const path of currentSet) {
        if (!this.fileHashes.has(path)) {
          this.emitChange({ path, kind: 'created' });
          await this.updateFileHash(path);
        }
      }
    } catch (error) {
      console.warn('[FSAGateway] Error checking for changes:', error);
    }
  }

  /**
   * Scan all files and build hash map
   */
  private async scanAllFiles(): Promise<void> {
    try {
      const files = await this.getAllFiles(this.directoryHandle, '');

      for (const filePath of files) {
        if (this.shouldWatchFile(filePath)) {
          await this.updateFileHash(filePath);
        }
      }

      console.log(`[FSAGateway] Scanned ${this.fileHashes.size} files for watching`);
    } catch (error) {
      console.warn('[FSAGateway] Failed to scan files:', error);
    }
  }

  /**
   * Get all files recursively
   */
  private async getAllFiles(
    dir: FileSystemDirectoryHandle,
    prefix: string
  ): Promise<string[]> {
    const files: string[] = [];

    // Use keys() method to iterate directory entries
    // @ts-expect-error - keys() is the correct method
    for await (const name of dir.keys()) {
      const path = prefix ? `${prefix}/${name}` : name;

      // Check if it's a directory
      try {
        const subDir = await dir.getDirectoryHandle(name);
        // Skip excluded directories
        if (this.isExcludedDirectory(name)) continue;

        const subFiles = await this.getAllFiles(subDir, path);
        files.push(...subFiles);
      } catch {
        // Not a directory, must be a file
        files.push(path);
      }
    }

    return files;
  }

  /**
   * Check if file was modified
   */
  private async isFileModified(path: string, entry: FileHashEntry): Promise<boolean> {
    try {
      const handle = await this.getFileHandle(path);
      const file = await handle.getFile();

      return file.size !== entry.size || file.lastModified !== entry.lastModified;
    } catch {
      return false;
    }
  }

  /**
   * Update file hash entry
   */
  private async updateFileHash(path: string): Promise<void> {
    try {
      const handle = await this.getFileHandle(path);
      const file = await handle.getFile();

      this.fileHashes.set(path, {
        path,
        size: file.size,
        lastModified: file.lastModified,
      });
    } catch (error) {
      console.warn(`[FSAGateway] Failed to update hash for: ${path}`, error);
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
          console.error('[FSAGateway] Error in watch callback:', error);
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
   * Get handle for a path (file or directory)
   */
  private async getHandle(path: string): Promise<FileSystemHandle> {
    const segments = path.split('/').filter(Boolean);
    let handle: FileSystemHandle = this.directoryHandle;

    for (const segment of segments) {
      handle = await (handle as FileSystemDirectoryHandle).getDirectoryHandle(segment);
    }

    return handle;
  }

  /**
   * Get directory handle for a path (internal helper)
   */
  private async getDirectoryHandleForPath(path: string): Promise<FileSystemDirectoryHandle> {
    const segments = path.split('/').filter(Boolean);
    let dir = this.directoryHandle;

    for (const segment of segments) {
      dir = await dir.getDirectoryHandle(segment);
    }

    return dir;
  }

  /**
   * Get file handle for a path
   */
  private async getFileHandle(path: string): Promise<FileSystemFileHandle> {
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop()!;

    let dir = this.directoryHandle;
    for (const segment of segments) {
      dir = await dir.getDirectoryHandle(segment);
    }

    return await dir.getFileHandle(fileName);
  }

  /**
   * Check if directory should be excluded
   */
  private isExcludedDirectory(name: string): boolean {
    return ['.viagent', 'node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(name);
  }

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
    for (const dir of ['.viagent', 'node_modules', '.git', '.next', 'dist']) {
      if (path.includes(`${dir}/`)) return false;
    }

    return true;
  }

  /**
   * Check if file is a text file
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
   * Convert handle to relative path (for FileSystemObserver)
   *
   * @remarks
   * FileSystemObserver provides handles but we need to map them to paths.
   * Since FSA handles don't expose their path directly, we maintain a reverse
   * mapping and resolve paths through the directory tree.
   *
   * For the observer's change records, the changes array contains relative
   * paths from the observed directory, so we use those directly.
   */
  private async handleToPath(handle: FileSystemHandle): Promise<string | null> {
    // If handle is our root directory, return empty string
    if (handle === this.directoryHandle) {
      return '';
    }

    // For nested handles, we need to resolve relative to root
    return this.resolveHandlePath(handle);
  }

  /**
   * Resolve a handle's path relative to the project root
   *
   * @remarks
   * Performs a breadth-first search from the root to find the handle.
   * This is expensive but necessary since FileSystemObserver only gives handles.
   */
  private async resolveHandlePath(targetHandle: FileSystemHandle): Promise<string | null> {
    // For performance, use a queue-based BFS to find the handle
    const queue: Array<{ handle: FileSystemHandle; path: string }> = [
      { handle: this.directoryHandle, path: '' },
    ];
    const visited = new WeakSet<FileSystemHandle>([this.directoryHandle]);
    const maxDepth = 50; // Prevent infinite loops in malformed trees
    let depth = 0;

    while (queue.length > 0 && depth < maxDepth) {
      const current = queue.shift();
      if (!current) break;

      const { handle, path } = current;

      if (handle === targetHandle) {
        return path;
      }

      // Search children if this is a directory
      try {
        const dir = handle as FileSystemDirectoryHandle;
        // @ts-expect-error - keys() is the correct method for iteration
        for await (const name of dir.keys()) {
          try {
            // Try as file first
            const childHandle = await dir.getFileHandle(name);
            if (!visited.has(childHandle)) {
              visited.add(childHandle);
              queue.push({
                handle: childHandle,
                path: path ? `${path}/${name}` : name,
              });
            }
          } catch {
            // Not a file, try as directory
            try {
              const childHandle = await dir.getDirectoryHandle(name);
              if (!visited.has(childHandle)) {
                visited.add(childHandle);
                queue.push({
                  handle: childHandle,
                  path: path ? `${path}/${name}` : name,
                });
              }
            } catch {
              // Skip inaccessible entries
            }
          }
        }
      } catch {
        // Not a directory or inaccessible, skip
      }

      depth++;
    }

    // Handle not found in our tree
    console.warn('[FSAGateway] Could not resolve path for handle in observer callback');
    return null;
  }

  /**
   * Get the directory handle (public accessor)
   */
  getDirectoryHandle(): FileSystemDirectoryHandle {
    return this.directoryHandle;
  }
}

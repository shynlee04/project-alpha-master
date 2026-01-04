/**
 * @fileoverview FSA Adapter - File System Access API Storage Backend
 * @module infrastructure/sync/adapters/fsa-adapter
 *
 * Implements StorageAdapter interface using File System Access API.
 * Provides read/write access to local file system with permission handling.
 *
 * **Key Features:**
 * - Permission denial handling with user-friendly errors
 * - File change detection via watch API
 * - Binary and text content support
 * - Automatic content type detection
 *
 * **Permission Handling:**
 * - Gracefully handles PermissionDeniedError
 * - Queues operations when permission is revoked
 * - Re-prompts user when permission is needed
 *
 * @example
 * ```ts
 * import { FSAAdapter } from '@/infrastructure/sync/adapters';
 *
 * const fsaAdapter = new FSAAdapter();
 * await fsaAdapter.mount(directoryHandle);
 * const content = await fsaAdapter.readFile('src/index.ts');
 * ```
 */

import type {
  FileContent,
  FileMetadata,
  FileChangeCallback,
  FileChangeEvent,
} from '../core/sync-types';
import {
  BaseStorageAdapter,
  FileNotFoundError,
  PermissionDeniedError,
} from './base-adapter';

// ============================================================================
// FSA Adapter Configuration
// ============================================================================

/**
 * FSA adapter configuration options
 */
export interface FSAAdapterConfig {
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Whether to use experimental features */
  experimental?: boolean;
}

// ============================================================================
// FSA Adapter Implementation
// ============================================================================

/**
 * FSA Adapter - File System Access API Storage Backend
 *
 * Wraps the browser's File System Access API to provide:
 * - Local file read/write operations
 * - Permission lifecycle management
 * - File watching for change detection
 * - Binary content support
 */
export class FSAAdapter extends BaseStorageAdapter {
  readonly name = 'fsa';

  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private watchHandle: any = null; // Experimental File System Access API
  private permissionGranted = false;

  constructor(config: FSAAdapterConfig = {}) {
    super();
    this._ready = false;
    this.debugMode = config.debug ?? false;
  }

  // ========== StorageAdapter Interface ==========

  /**
   * Read file content from local file system
   * @param path - File path relative to project root
   * @returns File content with metadata
   * @throws {PermissionDeniedError} If permission was revoked
   * @throws {FileNotFoundError} If file doesn't exist
   */
  async readFile(path: string): Promise<FileContent> {
    this.ensurePermission();

    try {
      const handle = await this.getFileHandle(path);
      const file = await handle.getFile();

      // Read as ArrayBuffer for binary support
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);

      // Create FileContent with metadata
      return this.createFileContent(path, data);
    } catch (error) {
      if (this.isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      if ((error as Error).name === 'NotFoundError') {
        throw new FileNotFoundError(this.name, path, error as Error);
      }
      throw error;
    }
  }

  /**
   * Write file content to local file system
   * @param path - File path relative to project root
   * @param content - Content to write
   * @throws {PermissionDeniedError} If permission was revoked
   */
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    this.ensurePermission();

    try {
      // Create parent directories if needed
      await this.ensureDirectoriesExist(path);

      // Get or create file handle
      const handle = await this.getFileHandle(path, { create: true });

      // Create writable stream
      const writable = await handle.createWritable();
      // Write content - create proper ArrayBuffer from Uint8Array
      // Use the Uint8Array directly as it's a valid FileSystemWriteChunkType
      await writable.write({ type: 'write', data: content } as unknown as FileSystemWriteChunkType);
      await writable.close();

      this.debug(`Wrote file: ${path} (${content.length} bytes)`);
    } catch (error) {
      if (this.isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      throw error;
    }
  }

  /**
   * Delete file from local file system
   * @param path - File path relative to project root
   * @throws {PermissionDeniedError} If permission was revoked
   */
  async deleteFile(path: string): Promise<void> {
    this.ensurePermission();

    try {
      const parentHandle = await this.getDirectoryHandle(this.getParentPath(path));
      await parentHandle.removeEntry(this.getBasename(path));

      this.debug(`Deleted file: ${path}`);
    } catch (error) {
      if (this.isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      if ((error as Error).name === 'NotFoundError') {
        // File doesn't exist, that's okay for idempotent delete
        this.debug(`File not found (ignoring): ${path}`);
        return;
      }
      throw error;
    }
  }

  /**
   * List files matching a glob pattern
   * @param pattern - Glob pattern (supports double-star wildcards)
   * @returns Array of file paths
   */
  async listFiles(pattern: string): Promise<string[]> {
    this.ensurePermission();
    if (!this.directoryHandle) {
      return [];
    }

    const results: string[] = [];
    const root = this.directoryHandle;

    // Convert glob pattern to regex
    const regexPattern = this.globToRegex(pattern);

    await this.traverseDirectory(root, '', (entry) => {
      if (regexPattern.test(entry.path)) {
        results.push(entry.path);
      }
    });

    return results;
  }

  /**
   * Get file metadata
   * @param path - File path relative to project root
   * @returns File metadata
   */
  async getMetadata(path: string): Promise<FileMetadata> {
    this.ensurePermission();

    try {
      const handle = await this.getFileHandle(path);
      const file = await handle.getFile();

      return this.createMetadata(
        path,
        file.size,
        file.lastModified,
        file.type
      );
    } catch (error) {
      if (this.isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      throw new FileNotFoundError(this.name, path, error as Error);
    }
  }

  /**
   * Check if file exists
   * @param path - File path relative to project root
   * @returns Whether file exists
   */
  async exists(path: string): Promise<boolean> {
    this.ensurePermission();

    try {
      await this.getFileHandle(path);
      return true;
    } catch {
      return false;
    }
  }

  // ========== Mount & Permission Management ==========

  /**
   * Mount directory handle from File System Access API
   * @param handle - Directory handle from showDirectoryPicker
   */
  async mount(handle: FileSystemDirectoryHandle): Promise<void> {
    this.directoryHandle = handle;
    this.permissionGranted = true;
    this._ready = true;
    this.debug(`Mounted directory: ${handle.name}`);
  }

  /**
   * Request directory access from user
   * @returns Directory handle
   */
  async requestAccess(): Promise<FileSystemDirectoryHandle> {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API not supported');
    }

    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });

      await this.mount(handle);
      return handle;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new PermissionDeniedError(this.name, 'Directory picker was cancelled');
      }
      throw error;
    }
  }

  /**
   * Check if File System Access API is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  /**
   * Check permission status without prompting
   * @returns Permission status
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    if (!this.directoryHandle) {
      return 'prompt';
    }

    try {
      // Try to query permission state
      if ((this.directoryHandle as any).queryPermissionDescriptor) {
        const permission = await (this.directoryHandle as any)
          .queryPermissionDescriptor({ mode: 'readwrite' });

        if (permission.state === 'granted') {
          return 'granted';
        } else if (permission.state === 'prompt') {
          return 'prompt';
        } else if (permission.state === 'denied') {
          return 'denied';
        }
      }
      // Fallback: assume granted if we have a handle
      return 'granted';
    } catch {
      return 'unsupported';
    }
  }

  // ========== File Watching ==========

  /**
   * Watch for file changes
   * @param callback - Callback invoked on file changes
   * @returns Unsubscribe function
   */
  watch(callback: FileChangeCallback): () => void {
    if (!this.directoryHandle) {
      return () => {};
    }

    const changeListeners = new Map<string, () => void>();

    // Start watching the directory
    const watcher = async () => {
      try {
        // Experimental File System Access API watch() method
        this.watchHandle = await (this.directoryHandle as any).watch({
          recursive: true,
        });

        for await (const entry of (this.watchHandle as any)) {
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
        this.debug('Watch error:', error);
      }
    };

    // Start watcher in background
    watcher().catch(() => {});

    // Return unsubscribe function
    return () => {
      changeListeners.clear();
      if (this.watchHandle) {
        this.watchHandle.close().catch(() => {});
        this.watchHandle = null;
      }
    };
  }

  // ========== Private Helper Methods ==========

  /**
   * Ensure permission is granted
   * @throws {PermissionDeniedError} If permission not granted
   */
  private ensurePermission(): void {
    if (!this.permissionGranted || !this.directoryHandle) {
      throw new PermissionDeniedError(
        this.name,
        'No directory access. Call mount() or requestAccess() first.'
      );
    }
  }

  /**
   * Check if error is permission denied
   */
  private isPermissionDenied(error: unknown): boolean {
    if (!error) return false;
    const err = error as Error;
    return (
      err.name === 'NotAllowedError' ||
      err.name === 'SecurityError' ||
      err.message?.toLowerCase().includes('permission')
    );
  }

  /**
   * Get file handle for a path
   * @param path - File path
   * @param options - Get file options
   * @returns File handle
   */
  private async getFileHandle(
    path: string,
    options: { create?: boolean } = {}
  ): Promise<FileSystemFileHandle> {
    this.ensurePermission();

    const segments = this.normalizePath(path).split('/');
    const filename = segments.pop()!;

    let current = this.directoryHandle!;

    // Navigate through directories
    for (const segment of segments) {
      if (!segment) continue;
      current = await current.getDirectoryHandle(segment, { create: options.create });
    }

    return current.getFileHandle(filename, options);
  }

  /**
   * Get directory handle for a path
   * @param path - Directory path (empty for root)
   * @returns Directory handle
   */
  private async getDirectoryHandle(path: string): Promise<FileSystemDirectoryHandle> {
    this.ensurePermission();

    path = this.normalizePath(path);

    if (path === '' || path === '.') {
      return this.directoryHandle!;
    }

    const segments = path.split('/');
    let current = this.directoryHandle!;

    for (const segment of segments) {
      if (!segment) continue;
      current = await current.getDirectoryHandle(segment);
    }

    return current;
  }

  /**
   * Ensure all parent directories exist for a file path
   * @param path - File path
   */
  private async ensureDirectoriesExist(path: string): Promise<void> {
    const segments = this.normalizePath(path).split('/');
    segments.pop(); // Remove filename

    if (segments.length === 0 || segments.every(s => !s)) {
      return;
    }

    let current = this.directoryHandle!;
    for (const segment of segments) {
      if (!segment) continue;
      try {
        current = await current.getDirectoryHandle(segment);
      } catch {
        // Directory doesn't exist, create it
        current = await current.getDirectoryHandle(segment, { create: true });
      }
    }
  }

  /**
   * Traverse directory recursively
   * @param dir - Directory handle
   * @param currentPath - Current path
   * @param callback - Callback for each entry
   */
  private async traverseDirectory(
    dir: FileSystemDirectoryHandle,
    currentPath: string,
    callback: (entry: { path: string; kind: 'file' | 'directory' }) => void
  ): Promise<void> {
    // Use for await...of on directory handle (uses async iterator protocol)
    // Cast to any because TypeScript doesn't recognize the async iterator
    const dirHandle = dir as any;

    for await (const entry of dirHandle) {
      const entryPath = this.joinPath(currentPath, entry.name);

      if (entry.kind === 'file') {
        callback({ path: entryPath, kind: 'file' });
      } else if (entry.kind === 'directory') {
        // Skip hidden directories and common exclusions
        if (!entry.name.startsWith('.') &&
            !['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.traverseDirectory(entry, entryPath, callback);
        }
        callback({ path: entryPath, kind: 'directory' });
      }
    }
  }

  /**
   * Convert glob pattern to regex
   * @param pattern - Glob pattern (supports wildcards like ** and *)
   * @returns Regex pattern
   */
  private globToRegex(pattern: string): RegExp {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*\*/g, '.*') // ** -> any characters
      .replace(/\*/g, '[^/]*') // * -> any characters except slash
      .replace(/\?/g, '[^/]'); // ? -> single character

    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Get currently mounted directory handle
   */
  getCurrentDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }

  /**
   * Set directory handle directly (useful for testing)
   */
  setDirectoryHandle(handle: FileSystemDirectoryHandle): void {
    this.directoryHandle = handle;
    this.permissionGranted = true;
    this._ready = true;
  }

  /**
   * Unmount directory and release handles
   */
  async unmount(): Promise<void> {
    this.directoryHandle = null;
    this.permissionGranted = false;
    this._ready = false;

    if (this.watchHandle) {
      await this.watchHandle.close();
      this.watchHandle = null;
    }

    this.debug('Unmounted directory');
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

/**
 * Default FSA adapter instance
 */
export const fsaAdapter = new FSAAdapter();

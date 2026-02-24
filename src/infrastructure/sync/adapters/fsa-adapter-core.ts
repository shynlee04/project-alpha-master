/**
 * @fileoverview FSA Adapter - File System Access API Storage Backend
 */

import type {
  FileContent,
  FileMetadata,
  FileChangeCallback,
} from '../core/sync-types';
import {
  BaseStorageAdapter,
  FileNotFoundError,
  PermissionDeniedError,
} from './base-adapter';
import type { FSAAdapterConfig } from './fsa-adapter-types';
import {
  globToRegex,
  traverseDirectory,
  isPermissionDenied,
} from './fsa-adapter-utils';
import {
  requestDirectoryAccess,
  checkPermissionStatus,
  isFSSupported,
  ensurePermissionGranted,
} from './fsa-permission-manager';
import {
  getFileHandle,
  ensureDirectoriesExist,
  deleteFileByPath,
} from './fsa-path-operations';
import {
  watchFiles,
  closeWatchHandle,
} from './fsa-file-watcher';

// ============================================================================
// FSA Adapter Implementation
// ============================================================================

export class FSAAdapter extends BaseStorageAdapter {
  readonly name = 'fsa';

  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private watchHandle: any = null;
  private permissionGranted = false;

  constructor(config: FSAAdapterConfig = {}) {
    super();
    this._ready = false;
    this.debugMode = config.debug ?? false;
  }

  // ========== StorageAdapter Interface ==========

  /** @override */
  async readFile(path: string): Promise<FileContent> {
    this.ensurePermission();

    try {
      const handle = await getFileHandle(path, {
        directoryHandle: this.directoryHandle!,
        ensurePermission: () => this.ensurePermission(),
      });

      const file = await handle.getFile();
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);

      return this.createFileContent(path, data);
    } catch (error) {
      if (isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      if ((error as Error).name === 'NotFoundError') {
        throw new FileNotFoundError(this.name, path, error as Error);
      }
      throw error;
    }
  }

  /** @override */
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    this.ensurePermission();

    try {
      await ensureDirectoriesExist(path, {
        directoryHandle: this.directoryHandle!,
        ensurePermission: () => this.ensurePermission(),
      });

      const handle = await getFileHandle(path, {
        directoryHandle: this.directoryHandle!,
        ensurePermission: () => this.ensurePermission(),
      }, { create: true });

      const writable = await handle.createWritable();
      await writable.write({ type: 'write', data: content } as unknown as FileSystemWriteChunkType);
      await writable.close();

      this.debug(`Wrote file: ${path} (${content.length} bytes)`);
    } catch (error) {
      if (isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      throw error;
    }
  }

  /** @override */
  async deleteFile(path: string): Promise<void> {
    this.ensurePermission();

    try {
      await deleteFileByPath(path, {
        directoryHandle: this.directoryHandle!,
        ensurePermission: () => this.ensurePermission(),
      });
      this.debug(`Deleted file: ${path}`);
    } catch (error) {
      if (isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      if ((error as Error).name === 'NotFoundError') {
        this.debug(`File not found (ignoring): ${path}`);
        return;
      }
      throw error;
    }
  }

  /** @override */
  async listFiles(pattern: string): Promise<string[]> {
    this.ensurePermission();
    if (!this.directoryHandle) {
      return [];
    }

    const results: string[] = [];
    const regexPattern = globToRegex(pattern);

    await traverseDirectory(this.directoryHandle, '', (entry) => {
      if (regexPattern.test(entry.path)) {
        results.push(entry.path);
      }
    });

    return results;
  }

  /** @override */
  async getMetadata(path: string): Promise<FileMetadata> {
    this.ensurePermission();

    try {
      const handle = await getFileHandle(path, {
        directoryHandle: this.directoryHandle!,
        ensurePermission: () => this.ensurePermission(),
      });
      const file = await handle.getFile();

      return this.createMetadata(path, file.size, file.lastModified, file.type);
    } catch (error) {
      if (isPermissionDenied(error)) {
        throw new PermissionDeniedError(this.name, path, error as Error);
      }
      throw new FileNotFoundError(this.name, path, error as Error);
    }
  }

  /** @override */
  async exists(path: string): Promise<boolean> {
    this.ensurePermission();

    try {
      await getFileHandle(path, {
        directoryHandle: this.directoryHandle!,
        ensurePermission: () => this.ensurePermission(),
      });
      return true;
    } catch {
      return false;
    }
  }

  // ========== Mount & Permission Management ==========

  /**
   * Mount directory handle from File System Access API
   */
  async mount(handle: FileSystemDirectoryHandle): Promise<void> {
    this.directoryHandle = handle;
    this.permissionGranted = true;
    this._ready = true;
    this.debug(`Mounted directory: ${handle.name}`);
  }

  /**
   * Request directory access from user
   */
  async requestAccess(): Promise<FileSystemDirectoryHandle> {
    const handle = await requestDirectoryAccess(this.name, {
      onPermissionGranted: (h) => this.mount(h),
    });
    return handle;
  }

  /**
   * Check if File System Access API is supported
   */
  static isSupported(): boolean {
    return isFSSupported();
  }

  /**
   * Check permission status without prompting
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    return checkPermissionStatus(this.directoryHandle);
  }

  // ========== File Watching ==========

  /**
   * Watch for file changes
   */
  watch(callback: FileChangeCallback): () => void {
    const unsubscribe = watchFiles(
      {
        directoryHandle: this.directoryHandle,
        debug: this.debugMode,
      },
      callback
    );

    // Store watch handle for cleanup
    const originalUnsubscribe = unsubscribe;
    return () => {
      originalUnsubscribe();
      this.watchHandle = null;
    };
  }

  // ========== Public Accessor Methods ==========

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

    await closeWatchHandle(this.watchHandle);
    this.watchHandle = null;

    this.debug('Unmounted directory');
  }

  // ========== Private Helper Methods ==========

  /** Ensure permission is granted */
  private ensurePermission(): void {
    ensurePermissionGranted(this.name, this.permissionGranted, this.directoryHandle);
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

/**
 * Default FSA adapter instance
 */
export const fsaAdapter = new FSAAdapter();

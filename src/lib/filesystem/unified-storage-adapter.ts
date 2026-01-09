/**
 * @fileoverview Unified Storage Adapter - LocalFSAdapter Interface with Storage Backend Selection
 * @module lib/filesystem/unified-storage-adapter
 *
 * Provides the LocalFSAdapter interface while internally delegating to
 * either File System Access API (FSA) or IndexedDB based on storageType.
 *
 * This bridges the gap between:
 * - LocalFSAdapter interface (string-based, used by file sync services)
 * - StorageAdapter implementations (FSAAdapter, IDBAdapter)
 *
 * @epic STORAGE-UNIFICATION
 * @story S-001 - Create unified storage adapter
 */

import type { FileReadResult, FileReadBinaryResult, DirectoryEntry } from './fs-types';
import { LocalFSAdapter } from './local-fs-adapter';
import { createStorageAdapter, type StorageType, isStorageTypeSupported } from '@/infrastructure/sync/adapters/adapter-factory';
import type { StorageAdapter } from '@/infrastructure/sync/core/sync-result-types';

/**
 * Configuration for unified storage adapter
 */
export interface UnifiedStorageAdapterConfig {
  /** Storage type to use */
  storageType: StorageType;
  /** Project ID for IndexedDB namespacing */
  projectId: string;
  /** Optional pre-existing FSA directory handle */
  fsaHandle?: FileSystemDirectoryHandle;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Unified Storage Adapter
 *
 * Extends LocalFSAdapter to provide backward compatibility
 * while internally delegating to the appropriate storage backend.
 *
 * - For 'fsa' storage: Uses FSAAdapter with File System Access API
 * - For 'indexeddb' storage: Uses IDBAdapter with IndexedDB
 *
 * @example
 * const adapter = new UnifiedStorageAdapter({
 *   storageType: 'indexeddb',
 *   projectId: 'project-123',
 * });
 * await adapter.writeFile('notes/test.md', 'Hello World');
 */
export class UnifiedStorageAdapter extends LocalFSAdapter {
  private storageType: StorageType;
  private projectId: string;
  private storageAdapter: StorageAdapter | null = null;
  private fsaHandle?: FileSystemDirectoryHandle;
  private debugMode: boolean;

  constructor(config: UnifiedStorageAdapterConfig) {
    // Initialize parent (LocalFSAdapter)
    super();

    this.storageType = config.storageType;
    this.projectId = config.projectId;
    this.fsaHandle = config.fsaHandle;
    this.debugMode = config.debug ?? false;
  }

  // Override initialization to create appropriate backend adapter
  async initialize(): Promise<void> {
    if (this.storageAdapter) {
      return; // Already initialized
    }

    // Create the appropriate storage adapter
    this.storageAdapter = createStorageAdapter({
      storageType: this.storageType,
      projectId: this.projectId,
      fsaHandle: this.fsaHandle,
      debug: this.debugMode,
    });

    // For FSA with existing handle, mount it
    if (this.storageType === 'fsa' && this.fsaHandle) {
      const fsaAdapter = this.storageAdapter as any;
      if ('mount' in fsaAdapter && typeof fsaAdapter.mount === 'function') {
        await fsaAdapter.mount(this.fsaHandle);
      }
    }

    this.debug(`Unified adapter initialized: ${this.storageType}`);
  }

  // ============================================================================
  // LocalFSAdapter Interface Implementation (string-based API)
  // ============================================================================

  /**
   * Read file content as string
   * @override
   */
  async readFile(path: string, options?: { encoding?: 'utf-8' }): Promise<FileReadResult>;
  async readFile(path: string, options: { encoding: 'binary' }): Promise<FileReadBinaryResult>;

  async readFile(path: string, options?: { encoding?: 'utf-8' | 'binary' }): Promise<FileReadResult | FileReadBinaryResult> {
    await this.ensureInitialized();

    const content = await this.storageAdapter!.readFile(path);

    if (options?.encoding === 'binary') {
      // Binary read - convert Uint8Array to ArrayBuffer
      const arrayBuffer = content.data.buffer.slice(
        content.data.byteOffset,
        content.data.byteOffset + content.data.byteLength
      ) as ArrayBuffer;
      return {
        data: arrayBuffer,
        mimeType: undefined,
      };
    }

    // Text read - decode Uint8Array to string
    const text = new TextDecoder().decode(content.data);
    return {
      content: text,
      encoding: 'utf-8',
    };
  }

  /**
   * Write file content (string)
   * @override
   */
  async writeFile(path: string, content: string): Promise<void> {
    await this.ensureInitialized();

    // Encode string to Uint8Array
    const data = new TextEncoder().encode(content);
    await this.storageAdapter!.writeFile(path, data);

    this.debug(`Wrote file: ${path} (${content.length} chars)`);
  }

  /**
   * Delete file
   * @override
   */
  async deleteFile(path: string): Promise<void> {
    await this.ensureInitialized();
    await this.storageAdapter!.deleteFile(path);
    this.debug(`Deleted file: ${path}`);
  }

  /**
   * List directory contents
   * @override
   */
  async listDirectory(path: string = ''): Promise<DirectoryEntry[]> {
    await this.ensureInitialized();

    // Use glob pattern to list files
    const pattern = path ? `${path}/**/*` : '**/*';
    const filePaths = await this.storageAdapter!.listFiles(pattern);

    // Convert to DirectoryEntry format
    // Note: IndexedDB storage doesn't have FileSystemHandle, so we create a minimal mock
    const entries: DirectoryEntry[] = [];
    for (const filePath of filePaths) {
      // Create a minimal mock handle for non-FSA storage
      const mockHandle = {
        name: filePath.split('/').pop() || filePath,
        kind: 'file' as const,
        isSameEntry: () => Promise.resolve(false),
        queryPermission: () => Promise.resolve('granted' as const),
        requestPermission: () => Promise.resolve('granted' as const),
        isDirectory: false,
        isFile: true,
      };

      entries.push({
        name: filePath.split('/').pop() || filePath,
        type: 'file',
        handle: mockHandle as unknown as FileSystemHandle,
      });
    }

    return entries;
  }

  /**
   * Create directory (no-op for adapters that don't support it)
   * @override
   */
  async createDirectory(path: string): Promise<void> {
    this.debug(`createDirectory: ${path} (no-op for ${this.storageType})`);
    // IndexedDB and FSA don't require explicit directory creation
  }

  /**
   * Delete directory (not implemented - use deleteFile for individual files)
   * @override
   */
  async deleteDirectory(path: string): Promise<void> {
    this.debug(`deleteDirectory: ${path} (not implemented)`);
    throw new Error('deleteDirectory not implemented - use deleteFile for individual files');
  }

  /**
   * Rename file (implemented via copy + delete)
   * R5 FIX: Now works for both IndexedDB and FSA storage
   * @override
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    await this.ensureInitialized();

    // Read content from old path
    const content = await this.storageAdapter!.readFile(oldPath);

    // Write to new path
    await this.storageAdapter!.writeFile(newPath, content.data);

    // Delete old path
    await this.storageAdapter!.deleteFile(oldPath);

    this.debug(`Renamed: ${oldPath} -> ${newPath}`);
  }

  // ============================================================================
  // LocalFSAdapter FSA-Specific Methods
  // ============================================================================

  /**
   * Check if File System Access API is supported
   * @override
   */
  static isSupported(): boolean {
    // Unified adapter supports both FSA and IndexedDB
    return typeof window !== 'undefined' &&
           ('showDirectoryPicker' in window || 'indexedDB' in window);
  }

  /**
   * Get the underlying storage type
   */
  getStorageType(): StorageType {
    return this.storageType;
  }

  /**
   * Get the underlying storage adapter (for advanced use)
   */
  getStorageAdapter(): StorageAdapter | null {
    return this.storageAdapter;
  }

  /**
   * Request directory access (FSA mode only)
   * For IndexedDB mode, this throws an error as directory handles are not applicable
   */
  async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
    if (this.storageType === 'indexeddb') {
      throw new Error('Directory access is not applicable for IndexedDB storage type. Use FSA storage type for directory-based file access.');
    }

    // FSA mode - prompt user for directory access
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API not supported in this browser');
    }

    const handle = await window.showDirectoryPicker();
    this.fsaHandle = handle;

    // Mount to the FSA adapter
    if (this.storageAdapter) {
      const fsaAdapter = this.storageAdapter as any;
      if ('mount' in fsaAdapter) {
        await fsaAdapter.mount(handle);
      }
    }

    return handle;
  }

  /**
   * Set directory handle (for FSA mode)
   * @override
   */
  setDirectoryHandle(handle: FileSystemDirectoryHandle): void {
    this.fsaHandle = handle;

    // Mount to the FSA adapter
    if (this.storageAdapter && 'mount' in this.storageAdapter) {
      void (this.storageAdapter as any).mount(handle);
    }
  }

  /**
   * Get directory handle
   * @override
   */
  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.fsaHandle || null;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /** Ensure storage adapter is initialized */
  private async ensureInitialized(): Promise<void> {
    if (!this.storageAdapter) {
      await this.initialize();
    }
  }

  /** Debug logging */
  private debug(message: string): void {
    if (this.debugMode) {
      console.log(`[UnifiedStorageAdapter] ${message}`);
    }
  }
}

/**
 * Create a unified storage adapter with the LocalFSAdapter interface
 *
 * @param config - Adapter configuration
 * @returns Unified storage adapter instance
 *
 * @example
 * const adapter = createUnifiedStorageAdapter({
 *   storageType: 'indexeddb',
 *   projectId: 'project-123',
 * });
 */
export function createUnifiedStorageAdapter(config: UnifiedStorageAdapterConfig): UnifiedStorageAdapter {
  return new UnifiedStorageAdapter(config);
}

/**
 * Check if a specific storage type is supported
 * Re-exported for convenience
 */
export { isStorageTypeSupported, type StorageType };

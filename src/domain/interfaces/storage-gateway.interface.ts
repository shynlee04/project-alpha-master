/**
 * @fileoverview Storage Gateway Interface - Abstraction for file I/O operations
 * @module domain/interfaces/storage-gateway
 *
 * **ARC-B01**: Create StorageGateway abstraction layer
 *
 * Per ADR-033 Decision D2:
 * - StorageGateway abstracts FSA and IndexedDB
 * - Factory returns correct implementation based on platform
 * - All file operations go through gateway
 *
 * This interface provides a unified API for file operations regardless of
 * the underlying storage mechanism (FSA for desktop, IndexedDB for mobile).
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B01
 * @author Team B
 * @created 2026-01-17
 */

// ============================================================================
// Types
// ============================================================================

/**
 * File entry metadata
 *
 * @remarks
 * Represents a file or directory in the virtual file system.
 * Paths are relative from the project root.
 */
export interface FileEntry {
  /** Relative path from project root (e.g., "src/index.ts") */
  path: string;

  /** Entry kind */
  kind: 'file' | 'directory';

  /** File size in bytes (0 for directories) */
  size: number;

  /** Last modified timestamp (epoch milliseconds) */
  lastModified: number;

  /** SHA-256 hash (for files) */
  hash?: string;
}

/**
 * File change event
 *
 * @remarks
 * Emitted when a file is created, modified, or deleted.
 * Used by the watch() mechanism for reactive updates.
 */
export interface FileChangeEvent {
  /** Path of the changed file */
  path: string;

  /** Type of change */
  kind: 'created' | 'modified' | 'deleted';

  /** New file entry (undefined for deleted) */
  entry?: FileEntry;
}

/**
 * Callback type for file change events
 *
 * @param event - The file change event
 */
export type FileChangeCallback = (event: FileChangeEvent) => void;

/**
 * Watch handle
 *
 * @remarks
 * Returned by watch() to allow cleanup.
 * Call dispose() to stop watching for changes.
 */
export interface WatchHandle {
  /** Stop watching for file changes */
  dispose(): void;
}

// ============================================================================
// Storage Gateway Interface
// ============================================================================

/**
 * Storage Gateway Interface
 *
 * @remarks
 * Abstraction layer for file I/O operations.
 *
 * Per ADR-033:
 * - Desktop with FSA → FSAGateway (uses File System Access API)
 * - Mobile/Tablet → IDBGateway (uses IndexedDB via Dexie)
 *
 * **IMPORTANT**: All file operations MUST go through this gateway.
 * Direct FSA or IndexedDB access is forbidden (violates Clean Architecture).
 *
 * @example
 * ```ts
 * // Get gateway from factory
 * const gateway = StorageGatewayFactory.create(project.storageType);
 *
 * // Read file
 * const content = await gateway.read('src/index.ts');
 *
 * // Write file
 * await gateway.write('src/index.ts', new TextEncoder().encode('export {}'));
 *
 * // List directory
 * const entries = await gateway.list('src');
 *
 * // Watch for changes
 * const handle = gateway.watch((event) => {
 *   console.log('File changed:', event.path, event.kind);
 * });
 *
 * // Cleanup
 * handle.dispose();
 * ```
 */
export interface StorageGateway {
  /**
   * Read file content as bytes
   *
   * @param path - Relative path from project root
   * @returns File content as Uint8Array
   * @throws {FileNotFoundError} if file doesn't exist
   */
  read(path: string): Promise<Uint8Array>;

  /**
   * Write file content
   *
   * @param path - Relative path from project root
   * @param data - File content as bytes
   * @throws {PermissionDeniedError} if write access denied
   */
  write(path: string, data: Uint8Array): Promise<void>;

  /**
   * Delete a file or directory
   *
   * @param path - Relative path from project root
   * @throws {PermissionDeniedError} if delete access denied
   */
  delete(path: string): Promise<void>;

  /**
   * List directory contents
   *
   * @param path - Relative path from project root (use "." for root)
   * @returns Array of file entries
   * @throws {NotADirectoryError} if path is not a directory
   */
  list(path: string): Promise<FileEntry[]>;

  /**
   * Check if file or directory exists
   *
   * @param path - Relative path from project root
   * @returns true if exists, false otherwise
   */
  exists(path: string): Promise<boolean>;

  /**
   * Watch for file changes
   *
   * @param callback - Function to call when files change
   * @returns Watch handle with dispose() method
   *
   * @remarks
   * For FSA: Uses FileSystemObserver (Chrome 129+) or polling fallback
   * For IndexedDB: Not applicable (no external changes possible)
   */
  watch(callback: FileChangeCallback): WatchHandle;
}

// ============================================================================
// Factory Interface
// ============================================================================

/**
 * Storage Gateway Factory
 *
 * @remarks
 * Creates the appropriate gateway implementation based on storage type.
 *
 * @example
 * ```ts
 * const gateway = StorageGatewayFactory.create('fsa');
 * // Returns FSAGateway for desktop FSA projects
 *
 * const gateway = StorageGatewayFactory.create('indexeddb');
 * // Returns IDBGateway for mobile/tablet projects
 * ```
 */
export interface StorageGatewayFactory {
  /**
   * Create a storage gateway for the given storage type
   *
   * @param storageType - The storage type ('fsa' or 'indexeddb')
   * @returns A StorageGateway implementation
   * @throws {Error} if storage type is unsupported
   */
  create(storageType: 'fsa' | 'indexeddb'): StorageGateway;
}

// ============================================================================
// No additional exports - types already exported above
// ============================================================================

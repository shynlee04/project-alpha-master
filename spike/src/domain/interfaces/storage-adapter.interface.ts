/**
 * @fileoverview Storage Adapter Interface - Domain Layer
 * @module domain/interfaces/storage-adapter.interface
 *
 * Core storage abstraction for file system operations.
 * This interface lives in the domain layer (Clean Architecture).
 * Infrastructure adapters (FSA, IndexedDB) implement this interface.
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02 - Create StorageAdapter Domain Interface
 */

// ============================================================================
// File Types (Domain-owned)
// ============================================================================

/**
 * File sync state enumeration
 */
export type FileSyncState = 'synced' | 'pending' | 'conflict' | 'error';

/**
 * File metadata for storage operations
 * Used for change detection and conflict resolution
 */
export interface FileMetadata {
  /** File path relative to project root */
  path: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp (milliseconds since epoch) */
  lastModified: number;
  /** Content MIME type (optional) */
  contentType?: string;
  /** Checksum for content comparison (optional, for PS-05) */
  checksum?: string;
  /** Sync state of this file */
  syncState?: FileSyncState;
  /** Last sync timestamp */
  lastSyncedAt?: number;
}

/**
 * File content wrapper for storage operations
 */
export interface FileContent {
  /** File path */
  path: string;
  /** Content as Uint8Array for binary data */
  data: Uint8Array;
  /** Content as string (convenience accessor) */
  text?: string;
  /** Metadata */
  metadata: FileMetadata;
}

/**
 * File change event from watcher or storage operation
 */
export interface FileChangeEvent {
  /** Change type */
  type: 'created' | 'modified' | 'deleted';
  /** File path */
  path: string;
  /** Event timestamp */
  timestamp: number;
  /** Source of the change */
  source: 'local' | 'platform' | 'user';
}

/**
 * File change callback type
 */
export type FileChangeCallback = (event: FileChangeEvent) => void;

// ============================================================================
// Storage Adapter Interface
// ============================================================================

/**
 * Storage Adapter Interface
 *
 * All storage backends (FSA, IndexedDB, WebContainer) must implement this interface.
 * This interface is in the domain layer to enable Clean Architecture dependency inversion:
 * - Domain layer defines the interface
 * - Infrastructure layer implements the interface
 * - Presentation layer uses the interface (not concrete implementations)
 *
 * @example
 * ```typescript
 * // Domain service receives adapter via dependency injection
 * class FileService {
 *   constructor(private readonly adapter: StorageAdapter) {}
 *
 *   async getFile(path: string): Promise<FileContent> {
 *     return this.adapter.readFile(path);
 *   }
 * }
 * ```
 */
export interface StorageAdapter {
  /**
   * Adapter name for debugging/logging
   */
  readonly name: string;

  /**
   * Read file content
   * @param path - File path relative to storage root
   * @returns File content with metadata
   */
  readFile(path: string): Promise<FileContent>;

  /**
   * Write file content
   * @param path - File path relative to storage root
   * @param content - Content to write as binary data
   */
  writeFile(path: string, content: Uint8Array): Promise<void>;

  /**
   * Delete file
   * @param path - File path relative to storage root
   */
  deleteFile(path: string): Promise<void>;

  /**
   * List files matching pattern
   * @param pattern - Glob pattern for matching files
   * @returns Array of file paths
   */
  listFiles(pattern: string): Promise<string[]>;

  /**
   * Get file metadata
   * @param path - File path relative to storage root
   * @returns File metadata
   */
  getMetadata(path: string): Promise<FileMetadata>;

  /**
   * Check if file exists
   * @param path - File path relative to storage root
   * @returns Whether file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Watch for file changes (optional)
   * @param callback - Callback invoked on file changes
   * @returns Unsubscribe function
   */
  watch?(callback: FileChangeCallback): () => void;

  /**
   * Check adapter availability (optional)
   * @returns Whether adapter is ready for use
   */
  isAvailable?(): boolean;
}

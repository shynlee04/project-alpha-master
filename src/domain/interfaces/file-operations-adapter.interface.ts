/**
 * @fileoverview File Operations Adapter Interface - Domain Layer
 * @module domain/interfaces/file-operations-adapter.interface
 *
 * String-based file operations adapter for domain services.
 * This interface provides a simpler API for text file operations,
 * abstracting over the binary-focused StorageAdapter.
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02 - Create StorageAdapter Domain Interface
 */

// ============================================================================
// Directory Entry (Domain-owned)
// ============================================================================

/**
 * Entry in a directory listing
 *
 * Represents a file or subdirectory within a directory.
 * This is a domain type that infrastructure adapters must map to.
 */
export interface DirectoryEntry {
  /** Name of the file or directory (basename, not full path) */
  name: string;
  /** Type of entry: 'file' for files, 'directory' for folders */
  type: 'file' | 'directory';
}

/**
 * Extended directory entry with optional metadata
 * Used when full metadata is available
 */
export interface DirectoryEntryWithMetadata extends DirectoryEntry {
  /** File size in bytes (for files) */
  size?: number;
  /** Last modified date (ISO string) */
  lastModified?: string;
  /** MIME type (for files) */
  mimeType?: string;
}

// ============================================================================
// File Operations Adapter Interface
// ============================================================================

/**
 * File Operations Adapter Interface
 *
 * Provides string-based file operations for domain services.
 * This is a simpler interface than StorageAdapter, focused on
 * text file operations common in CRUD services.
 *
 * Infrastructure implementations adapt from:
 * - LocalFSAdapter (File System Access API)
 * - IndexedDB adapter
 * - WebContainer adapter
 *
 * @example
 * ```typescript
 * // Domain service uses this interface
 * class NotesService {
 *   constructor(private readonly adapter: FileOperationsAdapter) {}
 *
 *   async getNote(path: string): Promise<string> {
 *     const { content } = await this.adapter.readFile(path);
 *     return content;
 *   }
 * }
 * ```
 */
export interface FileOperationsAdapter {
  /**
   * Read file content as text
   * @param path - File path relative to workspace root
   * @returns Object with content string
   */
  readFile(path: string): Promise<{ content: string }>;

  /**
   * Write text content to file
   * @param path - File path relative to workspace root
   * @param content - Text content to write
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Delete file
   * @param path - File path relative to workspace root
   */
  deleteFile(path: string): Promise<void>;

  /**
   * List directory contents
   * @param path - Directory path (optional, defaults to root)
   * @returns Array of directory entries
   */
  listDirectory(path?: string): Promise<DirectoryEntry[]>;

  /**
   * Rename/move file or directory
   * @param oldPath - Current path
   * @param newPath - New path
   */
  rename(oldPath: string, newPath: string): Promise<void>;

  /**
   * Create a new file (optional)
   * @param path - File path to create
   * @param content - Initial content (optional)
   */
  createFile?(path: string, content?: string): Promise<void>;
}

// ============================================================================
// Adapter Factory Types
// ============================================================================

/**
 * Storage type for adapter creation
 * - 'indexeddb': Browser-native storage, works on all platforms including mobile
 * - 'fsa': File System Access API, desktop browsers only
 */
export type StorageType = 'indexeddb' | 'fsa';

/**
 * Options for creating a storage adapter
 */
export interface CreateStorageAdapterOptions {
  /** Storage type to create */
  storageType: StorageType;
  /** Project ID for namespacing (required for IndexedDB) */
  projectId: string;
  /** Optional pre-existing FSA directory handle */
  fsaHandle?: FileSystemDirectoryHandle;
  /** Enable debug logging */
  debug?: boolean;
}

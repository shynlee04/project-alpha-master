/**
 * @fileoverview File CRUD Service Interface
 * @module domain/services/file-crud/file-crud-service
 *
 * Defines the IFileCrudService interface for unified file operations.
 * Both user-initiated and agent-initiated operations use this interface.
 *
 * @epic EPIC-FS - File System & Workspace Architecture
 * @story FS-06 - Unified CRUD interface for users + agents
 */

import type {
  CrudResult,
  FileMetadata,
  FileEntry,
  CreateOptions,
  ReadOptions,
  UpdateOptions,
  DeleteOptions,
  ListOptions,
  MoveOptions,
  CopyOptions,
} from './file-crud-types';

/**
 * IFileCrudService - Unified file CRUD interface
 *
 * Provides consistent file operations for both users and agents.
 * All operations return a CrudResult with success/error status.
 *
 * @example User-initiated operation
 * ```typescript
 * const service = new UnifiedFileCrudService(adapter, lock, eventBus);
 * const result = await service.create('notes/new.md', '# New Note', {
 *   source: 'user',
 *   workspaceType: 'notes'
 * });
 * if (result.success) {
 *   console.log('Created:', result.data.path);
 * }
 * ```
 *
 * @example Agent-initiated operation
 * ```typescript
 * const result = await service.update('src/app.tsx', newContent, {
 *   source: 'agent',
 *   useLock: true,
 *   workspaceType: 'ide'
 * });
 * ```
 */
export interface IFileCrudService {
  // ============================================================================
  // Create
  // ============================================================================

  /**
   * Create a new file with content
   *
   * @param path - File path to create
   * @param content - Initial content
   * @param options - Operation options
   * @returns Result with file metadata on success
   */
  create(
    path: string,
    content: string,
    options: CreateOptions
  ): Promise<CrudResult<FileMetadata>>;

  // ============================================================================
  // Read
  // ============================================================================

  /**
   * Read file content
   *
   * @param path - File path to read
   * @param options - Operation options
   * @returns Result with file content on success
   */
  read(
    path: string,
    options: ReadOptions
  ): Promise<CrudResult<string>>;

  /**
   * Read file with metadata
   *
   * @param path - File path to read
   * @param options - Operation options
   * @returns Result with content and metadata on success
   */
  readWithMetadata(
    path: string,
    options: ReadOptions
  ): Promise<CrudResult<{ content: string; metadata: FileMetadata }>>;

  // ============================================================================
  // Update
  // ============================================================================

  /**
   * Update file content
   *
   * @param path - File path to update
   * @param content - New content
   * @param options - Operation options
   * @returns Result with file metadata on success
   */
  update(
    path: string,
    content: string,
    options: UpdateOptions
  ): Promise<CrudResult<FileMetadata>>;

  // ============================================================================
  // Delete
  // ============================================================================

  /**
   * Delete a file or directory
   *
   * @param path - File path to delete
   * @param options - Operation options
   * @returns Result with void on success
   */
  delete(
    path: string,
    options: DeleteOptions
  ): Promise<CrudResult<void>>;

  // ============================================================================
  // List
  // ============================================================================

  /**
   * List files in a directory
   *
   * @param path - Directory path to list
   * @param options - Operation options
   * @returns Result with file entries on success
   */
  list(
    path: string,
    options: ListOptions
  ): Promise<CrudResult<FileEntry[]>>;

  // ============================================================================
  // Move/Copy
  // ============================================================================

  /**
   * Move/rename a file
   *
   * @param from - Source path
   * @param to - Destination path
   * @param options - Operation options
   * @returns Result with new file metadata on success
   */
  move(
    from: string,
    to: string,
    options: MoveOptions
  ): Promise<CrudResult<FileMetadata>>;

  /**
   * Copy a file
   *
   * @param from - Source path
   * @param to - Destination path
   * @param options - Operation options
   * @returns Result with new file metadata on success
   */
  copy(
    from: string,
    to: string,
    options: CopyOptions
  ): Promise<CrudResult<FileMetadata>>;

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Check if file exists
   *
   * @param path - File path to check
   * @returns true if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file metadata without reading content
   *
   * @param path - File path
   * @param options - Operation options
   * @returns Result with file metadata on success
   */
  getMetadata(
    path: string,
    options: ReadOptions
  ): Promise<CrudResult<FileMetadata>>;
}

/**
 * Default options for user operations
 */
export const DEFAULT_USER_OPTIONS = {
  source: 'user' as const,
  useLock: false,
  timeout: 30000,
};

/**
 * Default options for agent operations
 */
export const DEFAULT_AGENT_OPTIONS = {
  source: 'agent' as const,
  useLock: true,
  timeout: 30000,
};

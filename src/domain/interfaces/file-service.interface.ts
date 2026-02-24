/**
 * @fileoverview FileService Interface
 * @module domain/interfaces/file-service.interface
 *
 * Defines the IFileService interface for unified file operations.
 * This is a simplified interface for Platform Operators that need
 * to perform file CRUD operations.
 *
 * Key differences from IFileCrudService:
 * - Requires projectId for all operations (project-centric model)
 * - Emits domain events on all write operations
 * - Focused on Platform Operator use cases
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import type { CrudResult, FileMetadata } from '../services/file-crud/file-crud-types';

// ============================================================================
// FileService Interface
// ============================================================================

/**
 * IFileService - File operations for Platform Operators
 *
 * All operations are project-scoped using projectId.
 * Write operations emit domain events for cross-operator communication.
 *
 * @example
 * ```typescript
 * // Create a file
 * const result = await fileService.create('proj-123', 'src/app.ts', 'export const app = {}');
 * if (result.success) {
 *   console.log('Created:', result.data.path);
 * }
 *
 * // Read a file
 * const content = await fileService.read('proj-123', 'src/app.ts');
 * if (content.success) {
 *   console.log('Content:', content.data);
 * }
 * ```
 */
export interface IFileService {
  /**
   * Create a new file
   *
   * @param projectId - Project identifier
   * @param path - File path relative to project root
   * @param content - File content
   * @returns Result with file metadata on success
   *
   * Emits: file:created event
   */
  create(
    projectId: string,
    path: string,
    content: string
  ): Promise<CrudResult<FileMetadata>>;

  /**
   * Read file content
   *
   * @param projectId - Project identifier
   * @param path - File path relative to project root
   * @returns Result with file content on success
   */
  read(
    projectId: string,
    path: string
  ): Promise<CrudResult<string>>;

  /**
   * Update file content
   *
   * @param projectId - Project identifier
   * @param path - File path relative to project root
   * @param content - New file content
   * @returns Result with file metadata on success
   *
   * Emits: file:updated event
   */
  update(
    projectId: string,
    path: string,
    content: string
  ): Promise<CrudResult<FileMetadata>>;

  /**
   * Delete a file
   *
   * @param projectId - Project identifier
   * @param path - File path relative to project root
   * @returns Result with void on success
   *
   * Emits: file:deleted event
   */
  delete(
    projectId: string,
    path: string
  ): Promise<CrudResult<void>>;

  /**
   * Read multiple files efficiently
   *
   * @param projectId - Project identifier
   * @param paths - Array of file paths relative to project root
   * @returns Result with Map of path -> content on success
   */
  readMany(
    projectId: string,
    paths: string[]
  ): Promise<CrudResult<Map<string, string>>>;

  /**
   * Check if a file exists
   *
   * @param projectId - Project identifier
   * @param path - File path relative to project root
   * @returns true if file exists
   */
  exists(
    projectId: string,
    path: string
  ): Promise<boolean>;
}

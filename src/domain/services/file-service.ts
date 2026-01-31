/**
 * @fileoverview FileService Implementation
 * @module domain/services/file-service
 *
 * FileService provides unified file operations for Platform Operators.
 * All write operations emit domain events for cross-operator communication.
 *
 * Key features:
 * - Uses StorageAdapterFactory to get appropriate adapter (FSA or IDB)
 * - Emits domain events on every write (create/update/delete)
 * - Returns CrudResult for consistent error handling
 * - All operations are project-scoped using projectId
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import type { IFileService } from '@/domain/interfaces/file-service.interface';
import type { CrudResult, FileMetadata } from './file-crud/file-crud-types';
import {
  success,
  failure,
  createFileMetadata,
} from './file-crud/file-crud-types';
import { storageAdapterFactory } from '@/infrastructure/filesystem/StorageAdapterFactory';
import { domainEventBus } from '@/infrastructure/events/domain-event-bus';
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';

// ============================================================================
// Adapter Cache
// ============================================================================

/**
 * Cache of storage adapters by projectId
 * Prevents creating multiple adapters for the same project
 */
const adapterCache = new Map<string, StorageAdapter>();

/**
 * Get or create a storage adapter for a project
 */
function getAdapter(projectId: string): StorageAdapter {
  let adapter = adapterCache.get(projectId);
  if (!adapter) {
    adapter = storageAdapterFactory.createAdapter({ projectId });
    adapterCache.set(projectId, adapter);
  }
  return adapter;
}

// ============================================================================
// FileService Implementation
// ============================================================================

/**
 * FileService - Unified file operations with domain events
 *
 * All write operations emit events to the DomainEventBus:
 * - create: file:created
 * - update: file:updated
 * - delete: file:deleted
 */
class FileService implements IFileService {
  /**
   * Source identifier for events
   */
  private readonly eventSource = 'FileService';

  /**
   * Create a new file
   */
  async create(
    projectId: string,
    path: string,
    content: string
  ): Promise<CrudResult<FileMetadata>> {
    try {
      const adapter = getAdapter(projectId);

      // Check if file already exists
      const exists = await adapter.exists(path);
      if (exists) {
        return failure({
          code: 'FILE_EXISTS',
          message: `File already exists: ${path}`,
          path,
        });
      }

      // Write file
      const contentBytes = new TextEncoder().encode(content);
      await adapter.writeFile(path, contentBytes);

      // Get metadata
      const adapterMetadata = await adapter.getMetadata(path);
      const metadata = createFileMetadata(path, {
        size: adapterMetadata.size,
        lastModified: new Date(adapterMetadata.lastModified).toISOString(),
      });

      // Emit domain event
      domainEventBus.emit(
        'file:created',
        { projectId, path, content },
        this.eventSource
      );

      return success(metadata);
    } catch (error) {
      return failure({
        code: 'WRITE_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to create file',
        path,
        details: error,
      });
    }
  }

  /**
   * Read file content
   */
  async read(projectId: string, path: string): Promise<CrudResult<string>> {
    try {
      const adapter = getAdapter(projectId);

      // Check if file exists
      const exists = await adapter.exists(path);
      if (!exists) {
        return failure({
          code: 'FILE_NOT_FOUND',
          message: `File not found: ${path}`,
          path,
        });
      }

      // Read file
      const fileContent = await adapter.readFile(path);
      const content =
        fileContent.text ?? new TextDecoder().decode(fileContent.data);

      return success(content);
    } catch (error) {
      return failure({
        code: 'READ_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to read file',
        path,
        details: error,
      });
    }
  }

  /**
   * Update file content
   */
  async update(
    projectId: string,
    path: string,
    content: string
  ): Promise<CrudResult<FileMetadata>> {
    try {
      const adapter = getAdapter(projectId);

      // Check if file exists
      const exists = await adapter.exists(path);
      if (!exists) {
        return failure({
          code: 'FILE_NOT_FOUND',
          message: `File not found: ${path}`,
          path,
        });
      }

      // Write file
      const contentBytes = new TextEncoder().encode(content);
      await adapter.writeFile(path, contentBytes);

      // Get metadata
      const adapterMetadata = await adapter.getMetadata(path);
      const metadata = createFileMetadata(path, {
        size: adapterMetadata.size,
        lastModified: new Date(adapterMetadata.lastModified).toISOString(),
      });

      // Emit domain event
      domainEventBus.emit(
        'file:updated',
        { projectId, path, content },
        this.eventSource
      );

      return success(metadata);
    } catch (error) {
      return failure({
        code: 'WRITE_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to update file',
        path,
        details: error,
      });
    }
  }

  /**
   * Delete a file
   */
  async delete(projectId: string, path: string): Promise<CrudResult<void>> {
    try {
      const adapter = getAdapter(projectId);

      // Check if file exists
      const exists = await adapter.exists(path);
      if (!exists) {
        return failure({
          code: 'FILE_NOT_FOUND',
          message: `File not found: ${path}`,
          path,
        });
      }

      // Delete file
      await adapter.deleteFile(path);

      // Emit domain event
      domainEventBus.emit(
        'file:deleted',
        { projectId, path },
        this.eventSource
      );

      return success(undefined);
    } catch (error) {
      return failure({
        code: 'DELETE_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to delete file',
        path,
        details: error,
      });
    }
  }

  /**
   * Read multiple files efficiently
   */
  async readMany(
    projectId: string,
    paths: string[]
  ): Promise<CrudResult<Map<string, string>>> {
    try {
      const adapter = getAdapter(projectId);
      const results = new Map<string, string>();
      const errors: string[] = [];

      // Read files in parallel
      await Promise.all(
        paths.map(async (path) => {
          try {
            const exists = await adapter.exists(path);
            if (exists) {
              const fileContent = await adapter.readFile(path);
              const content =
                fileContent.text ?? new TextDecoder().decode(fileContent.data);
              results.set(path, content);
            } else {
              errors.push(`File not found: ${path}`);
            }
          } catch (error) {
            errors.push(
              `Error reading ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        })
      );

      // If any errors occurred, return failure
      if (errors.length > 0 && results.size === 0) {
        return failure({
          code: 'READ_ERROR',
          message: `Failed to read files: ${errors.join('; ')}`,
          details: errors,
        });
      }

      // Partial success: return what we got
      return success(results);
    } catch (error) {
      return failure({
        code: 'READ_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to read files',
        details: error,
      });
    }
  }

  /**
   * Check if a file exists
   */
  async exists(projectId: string, path: string): Promise<boolean> {
    try {
      const adapter = getAdapter(projectId);
      return await adapter.exists(path);
    } catch {
      return false;
    }
  }

  /**
   * Clear adapter cache (for testing)
   */
  clearCache(): void {
    adapterCache.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global FileService instance
 *
 * Use this singleton for all file operations.
 * Automatically uses the appropriate storage adapter per project.
 */
export const fileService = new FileService();

/**
 * Export class for testing/extension
 */
export { FileService };

/**
 * @fileoverview Unified File CRUD Service Implementation
 * @module domain/services/file-crud/unified-file-crud
 *
 * Implementation of IFileCrudService for unified file operations.
 * Works for both user-initiated and agent-initiated operations.
 *
 * @epic EPIC-FS - File System & Workspace Architecture
 * @story FS-06 - Unified CRUD interface for users + agents
 */

import type { IFileCrudService } from './file-crud-service';
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
import {
  success,
  failureFrom,
  createFileMetadata,
  detectContentType,
} from './file-crud-types';
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
import type { FileLock } from '@/lib/agent/facades/file-lock';
import { fileLock as defaultFileLock } from '@/lib/agent/facades/file-lock';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

/**
 * Configuration for UnifiedFileCrudService
 */
export interface UnifiedFileCrudConfig {
  /** Storage adapter for file operations */
  adapter: StorageAdapter;
  /** File lock for concurrent access control */
  fileLock?: FileLock;
  /** Event bus for operation events */
  eventBus?: WorkspaceEventEmitter;
  /** Enable logging */
  debug?: boolean;
}

/**
 * UnifiedFileCrudService - Implementation of IFileCrudService
 *
 * Provides consistent file CRUD operations for both users and agents.
 *
 * Features:
 * - Source tracking (user/agent)
 * - Optional file locking for writes
 * - Event emission for operation auditing
 * - Consistent error handling
 *
 * @example
 * ```typescript
 * const service = new UnifiedFileCrudService({
 *   adapter: localFSAdapter,
 *   fileLock: fileLock,
 *   eventBus: eventBus,
 * });
 *
 * // User operation
 * const result = await service.create('notes/new.md', '# New Note', {
 *   source: 'user',
 *   workspaceType: 'notes'
 * });
 *
 * // Agent operation with lock
 * const result = await service.update('src/app.tsx', newContent, {
 *   source: 'agent',
 *   useLock: true,
 *   workspaceType: 'ide'
 * });
 * ```
 */
export class UnifiedFileCrudService implements IFileCrudService {
  private readonly adapter: StorageAdapter;
  private readonly fileLock: FileLock;
  private readonly eventBus?: WorkspaceEventEmitter;
  private readonly debug: boolean;

  constructor(config: UnifiedFileCrudConfig) {
    this.adapter = config.adapter;
    this.fileLock = config.fileLock ?? defaultFileLock;
    this.eventBus = config.eventBus;
    this.debug = config.debug ?? false;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[UnifiedFileCrud] ${message}`, ...args);
    }
  }

  private normalizePath(path: string): string {
    // Remove leading/trailing slashes and normalize
    return path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
  }

  private async withLock<T>(
    path: string,
    options: { useLock?: boolean; timeout?: number },
    operation: () => Promise<T>
  ): Promise<T> {
    const shouldLock = options.useLock !== false;

    if (shouldLock) {
      await this.fileLock.acquire(path, options.timeout ?? 30000);
    }

    try {
      return await operation();
    } finally {
      if (shouldLock) {
        this.fileLock.release(path);
      }
    }
  }

  /**
   * Emit file operation events using existing workspace event types.
   * Maps CRUD operations to existing file events.
   */
  private emitEvent(
    type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy',
    path: string,
    source: 'user' | 'agent',
    success: boolean
  ): void {
    if (!this.eventBus || !success) return;

    // Map source to event source type
    const eventSource = source === 'agent' ? 'agent' as const : 'editor' as const;

    switch (type) {
      case 'create':
        this.eventBus.emit('file:created', { path, source: eventSource });
        break;
      case 'read':
        if (source === 'agent') {
          this.eventBus.emit('file:read', { path, source: 'agent' });
        }
        break;
      case 'update':
        this.eventBus.emit('file:modified', { path, source: eventSource });
        break;
      case 'delete':
        this.eventBus.emit('file:deleted', { path, source: eventSource });
        break;
      case 'move':
      case 'copy':
        // For move/copy, emit created event for destination
        this.eventBus.emit('file:created', { path, source: eventSource });
        break;
    }
  }

  // ============================================================================
  // Create
  // ============================================================================

  async create(
    path: string,
    content: string,
    options: CreateOptions
  ): Promise<CrudResult<FileMetadata>> {
    const normalizedPath = this.normalizePath(path);
    this.log('create', { path: normalizedPath, source: options.source });

    try {
      // Check if file already exists (if not overwriting)
      if (!options.overwrite) {
        const exists = await this.exists(normalizedPath);
        if (exists) {
          return failureFrom(
            'FILE_EXISTS',
            `File already exists: ${normalizedPath}`,
            normalizedPath
          );
        }
      }

      await this.withLock(normalizedPath, options, async () => {
        await this.adapter.writeFile(normalizedPath, new TextEncoder().encode(content));
      });

      const metadata = createFileMetadata(normalizedPath, {
        size: new TextEncoder().encode(content).length,
        lastModified: new Date().toISOString(),
      });

      this.emitEvent('create', normalizedPath, options.source, true);
      return success(metadata);
    } catch (error) {
      this.emitEvent('create', normalizedPath, options.source, false);
      return failureFrom(
        'WRITE_ERROR',
        error instanceof Error ? error.message : 'Failed to create file',
        normalizedPath,
        error
      );
    }
  }

  // ============================================================================
  // Read
  // ============================================================================

  async read(
    path: string,
    options: ReadOptions
  ): Promise<CrudResult<string>> {
    const normalizedPath = this.normalizePath(path);
    this.log('read', { path: normalizedPath, source: options.source });

    try {
      const result = await this.adapter.readFile(normalizedPath);
      const content = result.text ?? new TextDecoder().decode(result.data);
      this.emitEvent('read', normalizedPath, options.source, true);
      return success(content);
    } catch (error) {
      this.emitEvent('read', normalizedPath, options.source, false);

      // Check for not found error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('NotFoundError')) {
        return failureFrom(
          'FILE_NOT_FOUND',
          `File not found: ${normalizedPath}`,
          normalizedPath
        );
      }

      return failureFrom(
        'READ_ERROR',
        errorMessage,
        normalizedPath,
        error
      );
    }
  }

  async readWithMetadata(
    path: string,
    options: ReadOptions
  ): Promise<CrudResult<{ content: string; metadata: FileMetadata }>> {
    const normalizedPath = this.normalizePath(path);
    const readResult = await this.read(normalizedPath, options);

    if (!readResult.success) {
      return readResult as CrudResult<{ content: string; metadata: FileMetadata }>;
    }

    const metadata = createFileMetadata(normalizedPath, {
      size: new TextEncoder().encode(readResult.data).length,
      lastModified: new Date().toISOString(),
    });

    return success({ content: readResult.data, metadata });
  }

  // ============================================================================
  // Update
  // ============================================================================

  async update(
    path: string,
    content: string,
    options: UpdateOptions
  ): Promise<CrudResult<FileMetadata>> {
    const normalizedPath = this.normalizePath(path);
    this.log('update', { path: normalizedPath, source: options.source });

    try {
      // Check if file exists
      const exists = await this.exists(normalizedPath);
      if (!exists && !options.createIfMissing) {
        return failureFrom(
          'FILE_NOT_FOUND',
          `File not found: ${normalizedPath}`,
          normalizedPath
        );
      }

      await this.withLock(normalizedPath, options, async () => {
        await this.adapter.writeFile(normalizedPath, new TextEncoder().encode(content));
      });

      const metadata = createFileMetadata(normalizedPath, {
        size: new TextEncoder().encode(content).length,
        lastModified: new Date().toISOString(),
      });

      this.emitEvent('update', normalizedPath, options.source, true);
      return success(metadata);
    } catch (error) {
      this.emitEvent('update', normalizedPath, options.source, false);
      return failureFrom(
        'WRITE_ERROR',
        error instanceof Error ? error.message : 'Failed to update file',
        normalizedPath,
        error
      );
    }
  }

  // ============================================================================
  // Delete
  // ============================================================================

  async delete(
    path: string,
    options: DeleteOptions
  ): Promise<CrudResult<void>> {
    const normalizedPath = this.normalizePath(path);
    this.log('delete', { path: normalizedPath, source: options.source });

    try {
      // Check if file exists
      const exists = await this.exists(normalizedPath);
      if (!exists) {
        if (options.ignoreNotFound) {
          return success(undefined);
        }
        return failureFrom(
          'FILE_NOT_FOUND',
          `File not found: ${normalizedPath}`,
          normalizedPath
        );
      }

      await this.withLock(normalizedPath, options, async () => {
        await this.adapter.deleteFile(normalizedPath);
      });

      this.emitEvent('delete', normalizedPath, options.source, true);
      return success(undefined);
    } catch (error) {
      this.emitEvent('delete', normalizedPath, options.source, false);
      return failureFrom(
        'DELETE_ERROR',
        error instanceof Error ? error.message : 'Failed to delete file',
        normalizedPath,
        error
      );
    }
  }

  // ============================================================================
  // List
  // ============================================================================

  async list(
    path: string,
    options: ListOptions
  ): Promise<CrudResult<FileEntry[]>> {
    const normalizedPath = this.normalizePath(path) || '.';
    this.log('list', { path: normalizedPath, source: options.source });

    try {
      const pattern = normalizedPath === '.' ? '**/*' : `${normalizedPath}/**/*`;
      const filePaths = await this.adapter.listFiles(pattern);

      const fileEntries: FileEntry[] = [];
      for (const filePath of filePaths) {
        const metadata = await this.adapter.getMetadata(filePath);
        const relativePath = normalizedPath === '.' ? filePath : filePath.replace(`${normalizedPath}/`, '');
        const name = relativePath.split('/').pop() || '';
        const isDirectory = metadata.contentType === undefined;

        const entry: FileEntry = {
          name,
          path: relativePath,
          type: isDirectory ? 'directory' : 'file',
          size: metadata.size,
          lastModified: metadata.lastModified ? new Date(metadata.lastModified).toISOString() : undefined,
          contentType: isDirectory ? undefined : detectContentType(name),
        };
        fileEntries.push(entry);
      }

      let filtered = fileEntries;

      if (options.extensions?.length) {
        const exts = options.extensions.map((e) => e.toLowerCase().replace(/^\./, ''));
        filtered = filtered.filter((entry) => {
          if (entry.type === 'directory') return true;
          const ext = entry.name.split('.').pop()?.toLowerCase() || '';
          return exts.includes(ext);
        });
      }

      if (options.contentTypes?.length) {
        filtered = filtered.filter((entry) => {
          if (entry.type === 'directory') return true;
          return options.contentTypes!.includes(entry.contentType!);
        });
      }

      return success(filtered);
    } catch (error) {
      return failureFrom(
        'LIST_ERROR',
        error instanceof Error ? error.message : 'Failed to list directory',
        normalizedPath,
        error
      );
    }
  }

  // ============================================================================
  // Move
  // ============================================================================

  async move(
    from: string,
    to: string,
    options: MoveOptions
  ): Promise<CrudResult<FileMetadata>> {
    const normalizedFrom = this.normalizePath(from);
    const normalizedTo = this.normalizePath(to);
    this.log('move', { from: normalizedFrom, to: normalizedTo, source: options.source });

    try {
      // Check source exists
      const sourceExists = await this.exists(normalizedFrom);
      if (!sourceExists) {
        return failureFrom(
          'FILE_NOT_FOUND',
          `Source file not found: ${normalizedFrom}`,
          normalizedFrom
        );
      }

      // Check destination
      if (!options.overwrite) {
        const destExists = await this.exists(normalizedTo);
        if (destExists) {
          return failureFrom(
            'FILE_EXISTS',
            `Destination file already exists: ${normalizedTo}`,
            normalizedTo
          );
        }
      }

      await this.withLock(normalizedFrom, options, async () => {
        await this.withLock(normalizedTo, { ...options, useLock: false }, async () => {
          const readResult = await this.adapter.readFile(normalizedFrom);
          const content = readResult.text ?? new TextDecoder().decode(readResult.data);
          await this.adapter.writeFile(normalizedTo, new TextEncoder().encode(content));
          await this.adapter.deleteFile(normalizedFrom);
        });
      });

      const metadata = createFileMetadata(normalizedTo, {
        lastModified: new Date().toISOString(),
      });

      this.emitEvent('move', normalizedTo, options.source, true);
      return success(metadata);
    } catch (error) {
      this.emitEvent('move', normalizedTo, options.source, false);
      return failureFrom(
        'MOVE_ERROR',
        error instanceof Error ? error.message : 'Failed to move file',
        normalizedFrom,
        error
      );
    }
  }

  // ============================================================================
  // Copy
  // ============================================================================

  async copy(
    from: string,
    to: string,
    options: CopyOptions
  ): Promise<CrudResult<FileMetadata>> {
    const normalizedFrom = this.normalizePath(from);
    const normalizedTo = this.normalizePath(to);
    this.log('copy', { from: normalizedFrom, to: normalizedTo, source: options.source });

    try {
      // Read source
      const readResult = await this.read(normalizedFrom, { source: options.source });
      if (!readResult.success) {
        return readResult as CrudResult<FileMetadata>;
      }

      // Check destination
      if (!options.overwrite) {
        const destExists = await this.exists(normalizedTo);
        if (destExists) {
          return failureFrom(
            'FILE_EXISTS',
            `Destination file already exists: ${normalizedTo}`,
            normalizedTo
          );
        }
      }

      // Write to destination
      const createResult = await this.create(normalizedTo, readResult.data, {
        ...options,
        overwrite: options.overwrite,
      });

      if (createResult.success) {
        this.emitEvent('copy', normalizedTo, options.source, true);
      }

      return createResult;
    } catch (error) {
      this.emitEvent('copy', normalizedTo, options.source, false);
      return failureFrom(
        'COPY_ERROR',
        error instanceof Error ? error.message : 'Failed to copy file',
        normalizedFrom,
        error
      );
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  async exists(path: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(path);

    try {
      await this.adapter.readFile(normalizedPath);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(
    path: string,
    _options: ReadOptions
  ): Promise<CrudResult<FileMetadata>> {
    const normalizedPath = this.normalizePath(path);

    try {
      const metadata = await this.adapter.getMetadata(normalizedPath);
      const domainMetadata = createFileMetadata(normalizedPath, {
        size: metadata.size,
        lastModified: metadata.lastModified ? new Date(metadata.lastModified).toISOString() : undefined,
      });
      return success(domainMetadata);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('NotFoundError')) {
        return failureFrom(
          'FILE_NOT_FOUND',
          `File not found: ${normalizedPath}`,
          normalizedPath
        );
      }
      return failureFrom(
        'READ_ERROR',
        errorMessage,
        normalizedPath,
        error
      );
    }
  }
}

/**
 * Factory function to create UnifiedFileCrudService from a StorageAdapter
 *
 * The adapter must implement the StorageAdapter interface from domain layer.
 * This follows Clean Architecture - domain layer defines the interface,
 * infrastructure layer implements it, and this factory creates the service.
 *
 * @param adapter - Storage adapter implementing StorageAdapter interface
 * @param options - Optional configuration
 * @returns UnifiedFileCrudService instance
 *
 * @example
 * ```typescript
 * import { fsaAdapter } from '@/infrastructure/sync/adapters/fsa-adapter';
 *
 * const adapter = fsaAdapter;
 * const crudService = createUnifiedFileCrudService(adapter);
 * ```
 */
export function createUnifiedFileCrudService(
  adapter: StorageAdapter,
  options?: {
    fileLock?: FileLock;
    eventBus?: WorkspaceEventEmitter;
    debug?: boolean;
  }
): UnifiedFileCrudService {
  return new UnifiedFileCrudService({
    adapter,
    fileLock: options?.fileLock,
    eventBus: options?.eventBus,
    debug: options?.debug,
  });
}

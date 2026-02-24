/**
 * @fileoverview Platform Storage Gateway Wrapper
 * @module @/platform/core/storage-gateway
 *
 * Provides clean access to storage for platform layer.
 * Uses projectId ONLY - no workspaceId.
 *
 * PHASE R-2: Infrastructure port to clean architecture
 * NO workspaceId - use projectId only (per NO-WORKSPACE MANDATE)
 *
 * @created 2026-02-02
 */

import {
  createStorageGateway,
  createFSAGateway,
  createIDBGateway,
} from '@/infrastructure/filesystem/storage-gateway-factory';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { Project } from '../types';

/**
 * Options for creating platform storage
 * Clean interface without workspaceId
 */
export interface PlatformStorageOptions {
  /** The project requiring storage access */
  project: Project;
  /** FSA directory handle (required for FSA projects) */
  directoryHandle?: FileSystemDirectoryHandle;
}

/**
 * Create a storage gateway for a project
 *
 * Platform layer uses this instead of directly calling infrastructure.
 * This wrapper ensures clean separation and enforces projectId-only usage.
 *
 * @param options - Platform storage options
 * @returns StorageGateway implementation for the project
 *
 * @example
 * ```tsx
 * const { project } = usePlatform();
 * const storage = createPlatformStorage({ project, directoryHandle });
 * const data = await storage.read('path/to/file.txt');
 * ```
 */
export function createPlatformStorage(
  options: PlatformStorageOptions
): StorageGateway {
  return createStorageGateway(
    { storageType: options.project.storageType },
    {
      projectId: options.project.id,
      directoryHandle: options.directoryHandle,
    }
  );
}

/**
 * Create FSA storage gateway for a project
 *
 * Use for desktop projects with File System Access API.
 * Requires FSA directory handle from user permission grant.
 *
 * @param directoryHandle - The FSA directory handle
 * @returns StorageGateway for FSA storage
 *
 * @example
 * ```tsx
 * const handle = await showDirectoryPicker();
 * const storage = createPlatformFSAStorage(handle);
 * ```
 */
export function createPlatformFSAStorage(
  directoryHandle: FileSystemDirectoryHandle
): StorageGateway {
  return createFSAGateway(directoryHandle);
}

/**
 * Create IndexedDB storage gateway for a project
 *
 * Use for mobile/tablet projects or desktop fallback.
 * Uses projectId as namespace for file storage.
 *
 * @param projectId - The project ID
 * @returns StorageGateway for IndexedDB storage
 *
 * @example
 * ```tsx
 * const storage = createPlatformIDBStorage(projectId);
 * ```
 */
export function createPlatformIDBStorage(projectId: string): StorageGateway {
  return createIDBGateway(projectId);
}

/**
 * Re-export StorageGateway type for platform layer consumers
 */
export type { StorageGateway };

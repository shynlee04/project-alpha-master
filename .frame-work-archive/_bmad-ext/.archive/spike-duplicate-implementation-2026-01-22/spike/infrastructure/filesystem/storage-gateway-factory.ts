/**
 * @fileoverview Storage Gateway Factory - Creates appropriate gateway implementation
 * @module infrastructure/filesystem/storage-gateway-factory
 *
 * **ARC-B01**: Create StorageGateway abstraction layer
 *
 * Per ADR-033 Decision D2:
 * - Factory returns correct implementation based on platform
 * - Desktop with FSA → FSAGateway
 * - Mobile/Tablet → IDBGateway
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B01
 * @author Team B
 * @created 2026-01-17
 */

import type {
  StorageGateway,
  StorageGatewayFactory as IStorageGatewayFactory,
} from '@/domain/interfaces/storage-gateway.interface';
import type { StorageType } from './platform-contract';
import { FSAGateway } from './fsa-gateway';
import { IDBGateway } from './idb-gateway';

// ============================================================================
// Factory Implementation
// ============================================================================

/**
 * Storage Gateway Factory Implementation
 *
 * @remarks
 * Creates the appropriate gateway based on storage type from PlatformContract.
 *
 * Per ADR-033:
 * - 'fsa' → FSAGateway (requires FileSystemDirectoryHandle)
 * - 'indexeddb' → IDBGateway (requires projectId)
 *
 * @example
 * ```ts
 * const factory = new StorageGatewayFactoryImpl();
 *
 * // For FSA projects
 * const fsaGateway = factory.create('fsa', { directoryHandle });
 *
 * // For IndexedDB projects
 * const idbGateway = factory.create('indexeddb', { projectId });
 * ```
 */
class StorageGatewayFactoryImpl implements IStorageGatewayFactory {
  /**
   * Create a storage gateway
   *
   * @param _storageType - The storage type ('fsa' or 'indexeddb')
   * @returns A StorageGateway implementation
   * @throws {Error} always - use specific create methods instead
   *
   * @deprecated Use createFromPlatform(), createFSAGateway(), or createIDBGateway() instead.
   *             The generic create() method cannot provide required context (handle/projectId).
   */
  create(_storageType: StorageType): StorageGateway {
    // This method is not practical - use the specific create methods instead
    // FSA requires directoryHandle, IDB requires projectId
    throw new Error(
      'Use createFromPlatform(), createFSAGateway(handle), or createIDBGateway(projectId) instead. ' +
      'The generic create() method cannot provide required context.'
    );
  }

  /**
   * Create FSA gateway with directory handle
   *
   * @param directoryHandle - The FSA directory handle
   * @returns An FSAGateway instance
   */
  createFSAGateway(directoryHandle: FileSystemDirectoryHandle): StorageGateway {
    return new FSAGateway(directoryHandle);
  }

  /**
   * Create FSA gateway using the createFSAGateway function from fsa-gateway
   *
   * @param directoryHandle - The FSA directory handle
   * @returns An FSAGateway instance
   */
  createFSAGatewayFromFactory(directoryHandle: FileSystemDirectoryHandle): StorageGateway {
    return new FSAGateway(directoryHandle);
  }

  /**
   * Create IndexedDB gateway
   *
   * @param projectId - The project ID
   * @returns An IDBGateway instance
   */
  createIDBGateway(projectId: string): StorageGateway {
    return new IDBGateway(projectId);
  }

  /**
   * Create gateway from platform contract
   *
   * @param platform - The platform contract
   * @param options - Additional options for gateway creation
   * @returns A StorageGateway implementation
   *
   * @example
   * ```ts
   * const platform = getPlatformContract();
   * const gateway = factory.createFromPlatform(platform, {
   *   directoryHandle: fsaHandle,
   *   projectId: 'proj_abc123',
   * });
   * ```
   */
  createFromPlatform(
    platform: { storageType: StorageType },
    options: {
      directoryHandle?: FileSystemDirectoryHandle;
      projectId?: string;
    }
  ): StorageGateway {
    switch (platform.storageType) {
      case 'fsa':
        if (!options.directoryHandle) {
          throw new Error('FSAGateway requires directoryHandle option');
        }
        return this.createFSAGateway(options.directoryHandle);

      case 'indexeddb':
        if (!options.projectId) {
          throw new Error('IDBGateway requires projectId option');
        }
        return this.createIDBGateway(options.projectId);

      default:
        const _exhaustive: never = platform.storageType;
        throw new Error(`Unsupported storage type: ${_exhaustive}`);
    }
  }
}

// ============================================================================
// Singleton Factory Instance
// ============================================================================

/**
 * Global storage gateway factory instance
 *
 * @remarks
 * Use this singleton for creating storage gateways throughout the app.
 *
 * @example
 * ```ts
 * import { storageGatewayFactory } from '@/infrastructure/filesystem';
 *
 * const platform = getPlatformContract();
 * const gateway = storageGatewayFactory.createFromPlatform(platform, {
 *   directoryHandle: handle,
 *   projectId: projectId,
 * });
 * ```
 */
export const storageGatewayFactory = new StorageGatewayFactoryImpl();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create storage gateway from platform contract
 *
 * @param platform - The platform contract
 * @param options - Additional options for gateway creation
 * @returns A StorageGateway implementation
 *
 * @example
 * ```ts
 * import { getPlatformContract } from '@/infrastructure/filesystem';
 * import { createStorageGateway } from '@/infrastructure/filesystem/storage-gateway-factory';
 *
 * const platform = getPlatformContract();
 * const gateway = createStorageGateway(platform, { projectId, directoryHandle });
 * ```
 */
export function createStorageGateway(
  platform: { storageType: StorageType },
  options: {
    directoryHandle?: FileSystemDirectoryHandle;
    projectId?: string;
  }
): StorageGateway {
  return storageGatewayFactory.createFromPlatform(platform, options);
}

/**
 * Create FSA gateway (desktop only)
 *
 * @param directoryHandle - The FSA directory handle
 * @returns An FSAGateway instance
 *
 * @example
 * ```ts
 * const handle = await showDirectoryPicker();
 * const gateway = createFSAGateway(handle);
 * ```
 */
export function createFSAGateway(directoryHandle: FileSystemDirectoryHandle): StorageGateway {
  return storageGatewayFactory.createFSAGateway(directoryHandle);
}

/**
 * Create IndexedDB gateway (mobile/tablet)
 *
 * @param projectId - The project ID
 * @returns An IDBGateway instance
 *
 * @example
 * ```ts
 * // CC-V2-B05: Updated to use proj_ format per ADR-035
 * const gateway = createIDBGateway('proj_browser-default');
 * ```
 */
export function createIDBGateway(projectId: string): StorageGateway {
  return storageGatewayFactory.createIDBGateway(projectId);
}

// ============================================================================
// Re-exports
// ============================================================================

export { StorageGatewayFactoryImpl };
export type { IStorageGatewayFactory as StorageGatewayFactory };

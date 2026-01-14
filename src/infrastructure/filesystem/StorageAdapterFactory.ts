/**
 * @fileoverview Storage Adapter Factory - Creates appropriate storage adapters
 * @module infrastructure/filesystem/StorageAdapterFactory
 *
 * Factory that creates the appropriate storage adapter based on platform:
 * - Desktop with FSA → FSAStorageAdapter
 * - Mobile/Tablet → UnifiedStorageAdapter (IndexedDB)
 * - WebContainer → UnifiedStorageAdapter (IndexedDB, preview only)
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02-A - Platform Detection & Storage Routing
 *
 * FIX-2026-01-19: FSA-006 - Get handle from ProjectContext instead of requiring at creation time
 * FIX-2026-01-19: FSA-007 - Added handle to ProjectContext interface
 */

import type {
  StorageAdapter,
} from '@/domain/interfaces/storage-adapter.interface';
import type {
  StorageOptions,
  StorageType,
  PlatformInfo,
  FactoryConfig,
} from './storage-types';
import { detectPlatform, getOptimalStorageType } from './platform-detection';

// Import adapters (lazy loaded to avoid circular dependencies)
type FSAAdapterClass = new (options: StorageOptions) => StorageAdapter;
type IDBAdapterClass = new (options: StorageOptions) => StorageAdapter;

let FSAStorageAdapterClass: FSAAdapterClass | null = null;
let UnifiedStorageAdapterClass: IDBAdapterClass | null = null;

function getFSAStorageAdapterClass(): FSAAdapterClass {
  if (!FSAStorageAdapterClass) {
    try {
      const module = require('./fsa-storage-adapter');
      FSAStorageAdapterClass = module.FSAStorageAdapter;
    } catch {
      throw new Error('FSAStorageAdapter not available');
    }
  }
  return FSAStorageAdapterClass!;
}

function getUnifiedStorageAdapterClass(): IDBAdapterClass {
  if (!UnifiedStorageAdapterClass) {
    try {
      const module = require('@/lib/filesystem/unified-storage-adapter');
      UnifiedStorageAdapterClass = module.UnifiedStorageAdapter;
    } catch {
      throw new Error('UnifiedStorageAdapter not available');
    }
  }
  return UnifiedStorageAdapterClass!;
}

// ============================================================================
// Storage Adapter Factory
// ============================================================================

/**
 * Storage Adapter Factory
 * 
 * Creates appropriate storage adapters based on platform capabilities.
 * This is the central entry point for storage operations.
 */
export class StorageAdapterFactory {
  /**
   * Create a storage adapter for the given options
   *
   * @param options - Storage options including project ID and optional storage type
   * @returns Configured storage adapter
   * @throws Error if required options are missing
   *
   * FIX-2026-01-19: FSA-006 - Support handleGetter for context-based handle retrieval
   * FIX-2026-01-19: FSA-007 - Handle now optional when handleGetter is provided
   */
  createAdapter(options: StorageOptions): StorageAdapter {
    const { projectId, storageType: explicitType, handle, handleGetter } = options;

    if (!projectId) {
      throw new Error('StorageAdapterFactory: projectId is required');
    }

    // Determine storage type
    const storageType = explicitType ?? getOptimalStorageType();

    // Create appropriate adapter
    switch (storageType) {
      case 'fsa':
        // FSA-006: Get handle from getter if provided, otherwise use direct handle
        const effectiveHandle = handleGetter ? handleGetter() : handle;
        return this.createFSAAdapter({
          projectId,
          handle: effectiveHandle,
          directoryPath: effectiveHandle?.name,
        });

      case 'indexeddb':
        return this.createIDBAdapter({
          projectId,
        });

      default:
        throw new Error(`StorageAdapterFactory: Unknown storage type: ${storageType}`);
    }
  }

  /**
   * Create FSA storage adapter
   *
   * FIX-2026-01-19: FSA-006 - Gracefully handle null/unavailable handle
   * Instead of throwing immediately, returns a placeholder adapter that
   * defers handle validation until actual file operations are attempted.
   */
  private createFSAAdapter(options: StorageOptions): StorageAdapter {
    const { projectId, handle, directoryPath } = options;

    // FSA-006: Handle is now optional - defer error to actual operation time
    // This allows factory to be called before user grants permission
    if (!handle) {
      console.warn(
        `[StorageAdapterFactory] FSA handle not available for project: ${projectId}. ` +
        `Adapter will defer operations until handle is provided via ProjectContext.`
      );

      // Return a minimal adapter that will throw when operations are attempted
      // This is a temporary bridge until handle becomes available
      const FSAClass = getFSAStorageAdapterClass();
      return new FSAClass({
        projectId,
        storageType: 'fsa',
        handle: null,
        directoryPath: undefined,
      });
    }

    const FSAClass = getFSAStorageAdapterClass();
    return new FSAClass({
      projectId,
      storageType: 'fsa',
      handle,
      directoryPath,
    });
  }

  /**
   * Create IndexedDB storage adapter
   */
  private createIDBAdapter(options: StorageOptions): StorageAdapter {
    const { projectId } = options;

    const IDBClass = getUnifiedStorageAdapterClass();
    return new IDBClass({
      projectId,
      storageType: 'indexeddb',
    });
  }

  /**
   * Get the optimal storage type for the current platform
   *
   * @returns 'fsa' for desktop with FSA, 'indexeddb' otherwise
   */
  getOptimalStorageType(): StorageType {
    return getOptimalStorageType();
  }

  /**
   * Get platform information
   *
   * @returns Current platform detection info
   */
  getPlatformInfo(): PlatformInfo {
    return detectPlatform();
  }

  /**
   * Check if FSA is supported on current platform
   *
   * @returns true if FSA adapter can be created
   */
  isFSASupported(): boolean {
    const platform = detectPlatform();
    return platform.isFSASupported;
  }

  /**
   * Create adapter with custom configuration (for testing)
   *
   * @param options - Storage options
   * @param config - Factory configuration
   * @returns Configured storage adapter
   */
  createAdapterWithConfig(options: StorageOptions, config: FactoryConfig): StorageAdapter {
    // Use custom platform info if provided
    if (config.customPlatform) {
      return this.createAdapterForPlatform(options, config.customPlatform);
    }

    // Use forced storage type if provided
    if (config.forceStorageType) {
      return this.createAdapter({
        ...options,
        storageType: config.forceStorageType,
      });
    }

    // Default behavior
    return this.createAdapter(options);
  }

  /**
   * Create adapter for a specific platform (for testing)
   */
  private createAdapterForPlatform(options: StorageOptions, platform: PlatformInfo): StorageAdapter {
    return this.createAdapter({
      ...options,
      storageType: platform.storageType,
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Storage adapter factory singleton
 * 
 * Use this instance for all storage adapter creation.
 * It caches adapter instances where appropriate.
 */
export const storageAdapterFactory = new StorageAdapterFactory();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a storage adapter with optimal settings for the platform
 *
 * @param options - Storage options (projectId required)
 * @returns Configured storage adapter
 */
export function createStorageAdapter(options: Omit<StorageOptions, 'storageType'>): StorageAdapter {
  return storageAdapterFactory.createAdapter({
    ...options,
    storageType: undefined, // Will be auto-detected
  });
}

/**
 * Get the storage type that would be used for a new project
 *
 * @returns Optimal storage type for current platform
 */
export function getDefaultStorageType(): StorageType {
  return storageAdapterFactory.getOptimalStorageType();
}

/**
 * Check if FSA storage is available on the current platform
 *
 * @returns true if FSA can be used
 */
export function isFSAStorageAvailable(): boolean {
  return storageAdapterFactory.isFSASupported();
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if adapter is FSA adapter
 */
export function isFSAStorageAdapter(adapter: StorageAdapter): adapter is StorageAdapter & { name: 'fsa' } {
  return adapter.name === 'fsa';
}

/**
 * Type guard: Check if adapter is IndexedDB adapter
 */
export function isIDBStorageAdapter(adapter: StorageAdapter): adapter is StorageAdapter & { name: 'indexeddb' } {
  return adapter.name === 'indexeddb';
}

/**
 * Type guard: Check if storage type is FSA
 */
export function isFSAStorageType(type: StorageType): type is 'fsa' {
  return type === 'fsa';
}

/**
 * Type guard: Check if storage type is IndexedDB
 */
export function isIDBStorageType(type: StorageType): type is 'indexeddb' {
  return type === 'indexeddb';
}

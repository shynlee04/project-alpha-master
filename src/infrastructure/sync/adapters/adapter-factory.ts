/**
 * @fileoverview Adapter Factory - Storage Adapter Selection Based on Project Type
 * @module infrastructure/sync/adapters/adapter-factory
 *
 * Creates the appropriate storage adapter based on project.storageType.
 * Enables mobile support (IndexedDB) and desktop FSA-based storage.
 *
 * Usage:
 *   const adapter = createStorageAdapter(project.storageType, project.id);
 *   await adapter.writeFile('notes/test.md', content);
 */

import { IDBAdapter } from './idb-adapter-core.js';
import { FSAAdapter } from './fsa-adapter-core.js';
import type { StorageAdapter } from '../core/sync-result-types.js';
// ARC-E04: Use canonical path for ProjectMetadata (re-exported as alias)
import type { ProjectMetadata } from '@/infrastructure/persistence/stores/project';

// ============================================================================
// Types
// ============================================================================

/**
 * Storage type selection
 * - 'indexeddb': Browser-native storage, works on all platforms including mobile
 * - 'fsa': File System Access API, desktop browsers only, provides direct file access
 */
export type StorageType = 'indexeddb' | 'fsa';

/**
 * Options for adapter creation
 */
export interface CreateAdapterOptions {
  /** Storage type to create */
  storageType: StorageType;
  /** Project ID for namespacing (required for IndexedDB) */
  projectId: string;
  /** Optional pre-existing FSA directory handle */
  fsaHandle?: FileSystemDirectoryHandle;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a storage adapter based on storage type
 *
 * @param options - Adapter creation options
 * @returns Storage adapter instance
 *
 * @example
 * // IndexedDB adapter (mobile-friendly)
 * const adapter = createStorageAdapter({
 *   storageType: 'indexeddb',
 *   projectId: 'project-123',
 * });
 *
 * @example
 * // FSA adapter (desktop, direct file access)
 * const adapter = createStorageAdapter({
 *   storageType: 'fsa',
 *   projectId: 'project-123',
 *   fsaHandle: existingHandle,
 * });
 */
export function createStorageAdapter(options: CreateAdapterOptions): StorageAdapter {
  const { storageType, projectId, fsaHandle, debug = false } = options;

  if (storageType === 'indexeddb') {
    // IndexedDB adapter - works on all platforms including mobile
    return new IDBAdapter({
      projectId,
      databaseName: 'via-gent-persistence',
      tableName: 'syncFileContent',
      quotaThreshold: 0.9,
      evictionPolicy: 'least-recently-used',
      debug,
    });
  }

  // FSA adapter - desktop browsers only, direct file system access
  const adapter = new FSAAdapter({ debug });

  // If we have a pre-existing directory handle, mount it
  if (fsaHandle) {
    void adapter.mount(fsaHandle);
  }

  return adapter;
}

/**
 * Overload: Create adapter from project entity
 *
 * @param project - Project metadata with storageType
 * @param fsaHandle - Optional FSA directory handle
 * @returns Storage adapter instance
 *
 * @example
 * const adapter = createStorageAdapterFromProject(project, fsaHandle);
 */
export function createStorageAdapterFromProject(
  project: ProjectMetadata,
  fsaHandle?: FileSystemDirectoryHandle
): StorageAdapter {
  return createStorageAdapter({
    storageType: project.storageType ?? 'fsa', // Default to FSA for backward compatibility
    projectId: project.id,
    fsaHandle,
  });
}

/**
 * Check if a storage type is supported in the current browser
 *
 * @param storageType - Storage type to check
 * @returns Whether the storage type is supported
 */
export function isStorageTypeSupported(storageType: StorageType): boolean {
  if (storageType === 'indexeddb') {
    // IndexedDB is supported in all modern browsers
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  // FSA requires File System Access API (desktop browsers only)
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Get the best storage type for the current platform
 * Returns 'indexeddb' for mobile, 'fsa' for desktop with user choice
 *
 * @returns Recommended storage type for current platform
 */
export function getRecommendedStorageType(): StorageType {
  // Mobile devices: use IndexedDB (FSA not supported)
  if (typeof window !== 'undefined' && !('showDirectoryPicker' in window)) {
    return 'indexeddb';
  }

  // Desktop: default to IndexedDB for better UX, FSA available as option
  return 'indexeddb';
}

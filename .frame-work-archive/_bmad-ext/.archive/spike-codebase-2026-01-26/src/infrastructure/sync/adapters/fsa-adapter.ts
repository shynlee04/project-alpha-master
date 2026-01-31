/**
 * @fileoverview FSA Adapter - File System Access API Storage Backend
 * @module infrastructure/sync/adapters/fsa-adapter
 *
 * Implements StorageAdapter interface using File System Access API.
 * Provides read/write access to local file system with permission handling.
 *
 * **Key Features:**
 * - Permission denial handling with user-friendly errors
 * - File change detection via watch API
 * - Binary and text content support
 * - Automatic content type detection
 *
 * **Permission Handling:**
 * - Gracefully handles PermissionDeniedError
 * - Queues operations when permission is revoked
 * - Re-prompts user when permission is needed
 *
 * @example
 * ```ts
 * import { FSAAdapter } from '@/infrastructure/sync/adapters';
 *
 * const fsaAdapter = new FSAAdapter();
 * await fsaAdapter.mount(directoryHandle);
 * const content = await fsaAdapter.readFile('src/index.ts');
 * ```
 */

// ============================================================================
// Re-exports from split modules
// ============================================================================

// Type definitions
export type {
  FSAAdapterConfig,
} from './fsa-adapter-types';

// Utility functions
export {
  normalizePath,
  joinPath,
  getParentPath,
  getBasename,
  globToRegex,
  traverseDirectory,
  isPermissionDenied,
} from './fsa-adapter-utils';

// Main FSAAdapter class and singleton
export {
  FSAAdapter,
  fsaAdapter,
} from './fsa-adapter-core';

// Permission management (exported for testing)
export {
  requestDirectoryAccess,
  checkPermissionStatus,
  isFSSupported,
  ensurePermissionGranted,
} from './fsa-permission-manager';

export type { PermissionStatus } from './fsa-permission-manager';

// Path operations (exported for testing)
export {
  getFileHandle,
  getDirectoryHandle,
  ensureDirectoriesExist,
  deleteFileByPath,
  type PathOperationsConfig,
} from './fsa-path-operations';

// File watching (exported for testing)
export {
  watchFiles,
  closeWatchHandle,
  type FileWatcherConfig,
} from './fsa-file-watcher';

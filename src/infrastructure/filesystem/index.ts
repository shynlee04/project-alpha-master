/**
 * @fileoverview File System Infrastructure Barrel Export
 * @module infrastructure/filesystem
 *
 * File System Access API wrapper for local file operations.
 * Moved from src/lib/filesystem to comply with Clean Architecture.
 *
 * **Architecture**: Infrastructure Layer
 * - Wraps browser File System Access API
 * - Provides LocalFSAdapter for directory/file operations
 * - Includes path utilities and error handling
 *
 * @example
 * ```ts
 * import { LocalFSAdapter, localFS } from '@/infrastructure/filesystem';
 *
 * const adapter = new LocalFSAdapter();
 * await adapter.requestDirectoryAccess();
 * const content = await adapter.readFile('README.md');
 * ```
 */

// ============================================================================
// Error Classes
// ============================================================================

export { FileSystemError, PermissionDeniedError } from './fs-errors';

// ============================================================================
// Type Definitions
// ============================================================================

export type { DirectoryEntry, FileReadResult, FileReadBinaryResult } from './fs-types';

// ============================================================================
// Path Utilities
// ============================================================================

export { validatePath, isTraversalAttempt } from './path-guard';
export { parsePathSegments } from './path-utils';

// ============================================================================
// File System Operations
// ============================================================================

export { readFile, writeFile, deleteFile } from './file-ops';
export { duplicateFile, downloadFile, copyPathToClipboard, revealInFileManager, validateFileName } from './file-ops';

// ============================================================================
// Directory Operations
// ============================================================================

export { listDirectory, createDirectory, deleteDirectory, rename } from './dir-ops';

// ============================================================================
// Handle Utilities
// ============================================================================

export { getFileHandleFromPath, getDirectoryHandleFromPath } from './handle-utils';
export { walkDirectorySegments } from './fs-handle-utils';

// ============================================================================
// Permission Lifecycle (FSA Handle Persistence)
// ============================================================================
// NOTE: Re-exported from lib/filesystem/permission-lifecycle
// These handle FSA permission state and handle persistence via Dexie
// TODO: Move permission-lifecycle.ts to infrastructure/filesystem

export type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
export {
  getPermissionState,
  ensureReadWritePermission,
  restorePermission,
  isPersistentPermissionSupported,
} from '@/lib/filesystem/permission-lifecycle';

// ============================================================================
// Main Adapter
// ============================================================================

export { LocalFSAdapter, localFS } from './local-fs-adapter';

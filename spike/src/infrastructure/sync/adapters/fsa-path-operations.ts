/**
 * @fileoverview FSA Path Operations - File handle resolution for File System Access API
 * @module infrastructure/sync/adapters/fsa-path-operations
 *
 * Handles path-to-handle resolution for File System Access API.
 */

import {
  normalizePath,
  getParentPath,
  getBasename,
} from './fsa-adapter-utils';

// ============================================================================
// Path Operations
// ============================================================================

export interface PathOperationsConfig {
  directoryHandle: FileSystemDirectoryHandle;
  ensurePermission: () => void;
}

/**
 * Get file handle for a path
 * @param path - File path
 * @param config - Path operations configuration
 * @param options - Get file options
 * @returns File handle
 */
export async function getFileHandle(
  path: string,
  config: PathOperationsConfig,
  options: { create?: boolean } = {}
): Promise<FileSystemFileHandle> {
  config.ensurePermission();

  const segments = normalizePath(path).split('/');
  const filename = segments.pop()!;

  let current = config.directoryHandle;

  // Navigate through directories
  for (const segment of segments) {
    if (!segment) continue;
    current = await current.getDirectoryHandle(segment, { create: options.create });
  }

  return current.getFileHandle(filename, options);
}

/**
 * Get directory handle for a path
 * @param path - Directory path (empty for root)
 * @param config - Path operations configuration
 * @returns Directory handle
 */
export async function getDirectoryHandle(
  path: string,
  config: PathOperationsConfig
): Promise<FileSystemDirectoryHandle> {
  config.ensurePermission();

  path = normalizePath(path);

  if (path === '' || path === '.') {
    return config.directoryHandle;
  }

  const segments = path.split('/');
  let current = config.directoryHandle;

  for (const segment of segments) {
    if (!segment) continue;
    current = await current.getDirectoryHandle(segment);
  }

  return current;
}

/**
 * Ensure all parent directories exist for a file path
 * @param path - File path
 * @param config - Path operations configuration
 */
export async function ensureDirectoriesExist(
  path: string,
  config: PathOperationsConfig
): Promise<void> {
  const segments = normalizePath(path).split('/');
  segments.pop(); // Remove filename

  if (segments.length === 0 || segments.every(s => !s)) {
    return;
  }

  let current = config.directoryHandle;
  for (const segment of segments) {
    if (!segment) continue;
    try {
      current = await current.getDirectoryHandle(segment);
    } catch {
      // Directory doesn't exist, create it
      current = await current.getDirectoryHandle(segment, { create: true });
    }
  }
}

/**
 * Delete a file by path
 * @param path - File path
 * @param config - Path operations configuration
 */
export async function deleteFileByPath(
  path: string,
  config: PathOperationsConfig
): Promise<void> {
  const parentHandle = await getDirectoryHandle(getParentPath(path), config);
  await parentHandle.removeEntry(getBasename(path));
}

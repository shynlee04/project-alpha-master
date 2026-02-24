/**
 * @fileoverview FSA Adapter Utilities
 * @module infrastructure/sync/adapters/fsa-adapter-utils
 *
 * Utility functions for File System Access API operations.
 * Includes path manipulation, glob matching, and directory traversal.
 */

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Normalize file path by removing leading/trailing slashes and resolving .
 * @param path - File path to normalize
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
  return path
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/+/g, '/'); // Replace multiple slashes with single
}

/**
 * Join path segments
 * @param segments - Path segments to join
 * @returns Joined path
 */
export function joinPath(...segments: (string | undefined)[]): string {
  return segments
    .filter(s => s !== undefined && s !== '')
    .join('/');
}

/**
 * Get parent directory path
 * @param path - File path
 * @returns Parent directory path
 */
export function getParentPath(path: string): string {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? '' : normalized.substring(0, lastSlash);
}

/**
 * Get basename (filename) from path
 * @param path - File path
 * @returns Basename
 */
export function getBasename(path: string): string {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
}

// ============================================================================
// Glob Utilities
// ============================================================================

/**
 * Convert glob pattern to regex
 * @param pattern - Glob pattern (supports wildcards like ** and *)
 * @returns Regex pattern
 */
export function globToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '.*') // ** -> any characters
    .replace(/\*/g, '[^/]*') // * -> any characters except slash
    .replace(/\?/g, '[^/]'); // ? -> single character

  return new RegExp(`^${regexPattern}$`);
}

// ============================================================================
// Directory Traversal
// ============================================================================

/**
 * Common directory names to exclude during traversal
 */
export const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.vscode',
  '.idea',
  'coverage',
  '.next',
  '.nuxt',
  'out',
  'target',
];

/**
 * Check if a directory should be excluded from traversal
 * @param name - Directory name
 * @returns Whether to exclude
 */
export function shouldExcludeDirectory(name: string): boolean {
  return name.startsWith('.') || EXCLUDED_DIRECTORIES.includes(name);
}

/**
 * Traverse directory recursively with callback
 * @param dir - Directory handle
 * @param currentPath - Current path
 * @param callback - Callback for each entry
 */
export async function traverseDirectory(
  dir: FileSystemDirectoryHandle,
  currentPath: string,
  callback: (entry: { path: string; kind: 'file' | 'directory' }) => void
): Promise<void> {
  // Use for await...of on directory handle (uses async iterator protocol)
  // Cast to any because TypeScript doesn't recognize the async iterator
  const dirHandle = dir as any;

  for await (const entry of dirHandle) {
    const entryPath = joinPath(currentPath, entry.name);

    if (entry.kind === 'file') {
      callback({ path: entryPath, kind: 'file' });
    } else if (entry.kind === 'directory') {
      // Skip excluded directories
      if (!shouldExcludeDirectory(entry.name)) {
        await traverseDirectory(entry, entryPath, callback);
      }
      callback({ path: entryPath, kind: 'directory' });
    }
  }
}

// ============================================================================
// Permission Utilities
// ============================================================================

/**
 * Check if error is permission denied
 * @param error - Error to check
 * @returns Whether error indicates permission was denied
 */
export function isPermissionDenied(error: unknown): boolean {
  if (!error) return false;
  const err = error as Error;
  return (
    err.name === 'NotAllowedError' ||
    err.name === 'SecurityError' ||
    err.message?.toLowerCase().includes('permission')
  );
}

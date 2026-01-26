/**
 * @fileoverview File System Handle Utilities
 * @module infrastructure/filesystemfs-handle-utils
 *
 * Pure utility functions for working with FileSystemDirectoryHandle API.
 * Extracted from directory-walker.ts to break circular dependencies.
 *
 * These functions have NO dependencies on other FS modules.
 */

import { FileSystemError } from './fs-errors';

/**
 * Walk directory segments using FileSystemDirectoryHandle API
 *
 * Pure function that navigates through directory handles by segment path.
 * Does NOT depend on any other FS modules - only uses browser File System Access API.
 *
 * @param root - Root directory handle (null = no access)
 * @param segments - Path segments (e.g., ['src', 'components', 'Button.tsx'])
 * @param create - Whether to create directories if they don't exist
 * @returns Directory handle at the target path
 *
 * @throws {FileSystemError} If no directory access granted
 */
export async function walkDirectorySegments(
    root: FileSystemDirectoryHandle | null,
    segments: string[],
    create = false
): Promise<FileSystemDirectoryHandle> {
    if (!root) {
        throw new FileSystemError('No directory access granted.', 'NO_DIRECTORY_ACCESS');
    }

    let current = root;

    for (const segment of segments) {
        current = await current.getDirectoryHandle(segment, { create });
    }

    return current;
}

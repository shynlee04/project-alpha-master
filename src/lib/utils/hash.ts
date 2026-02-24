/**
 * @fileoverview Hash Utility Functions
 * @module lib/utils/hash
 *
 * Fast hash functions for detecting changes in file lists.
 * Used for idempotent import operations.
 *
 * @story PHASE0-2 - Make Notes Import Idempotent
 */

/**
 * Simple string hash function (djb2 algorithm)
 * Fast enough for file lists, provides good distribution.
 *
 * @param str - String to hash
 * @returns Hexadecimal hash string
 */
export function simpleHash(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + char
    }
    return (hash >>> 0).toString(16);
}

/**
 * Compute hash for file list (paths only)
 * Uses sorted file paths for consistent hash.
 *
 * @param filePaths - Array of file paths to hash
 * @returns Hash string representing the file list
 */
export function computeFileListHash(filePaths: string[]): string {
    // Sort paths to ensure consistent hash regardless of iteration order
    const sortedPaths = [...filePaths].sort();
    const combined = sortedPaths.join('|');
    return simpleHash(combined);
}

/**
 * Compute hash for file paths with sizes
 * Uses both path and size for more robust change detection.
 *
 * @param fileEntries - Array of {path, size} objects
 * @returns Hash string representing files
 */
export function computeFileEntriesHash(
    fileEntries: Array<{ path: string; size: number }>
): string {
    // Sort entries by path for consistent hash
    const sorted = [...fileEntries].sort((a, b) => a.path.localeCompare(b.path));

    // Combine path and size for each file
    const combined = sorted.map(e => `${e.path}:${e.size}`).join('|');

    return simpleHash(combined);
}

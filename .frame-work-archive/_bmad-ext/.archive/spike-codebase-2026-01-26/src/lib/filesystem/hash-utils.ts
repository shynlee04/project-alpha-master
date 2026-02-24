/**
 * @fileoverview File Hash Utilities
 * @module lib/filesystem/hash-utils
 * @governance Story WB-3: Project Context Provider
 *
 * Provides SHA-256 hash computation for file content change detection.
 * Uses Web Crypto API for secure, browser-native hashing.
 *
 * @example
 * ```tsx
 * import { computeSHA256 } from '@/lib/filesystem/hash-utils';
 *
 * const content = 'export const x = 1;';
 * const hash = await computeSHA256(content);
 * console.log(hash); // 'a1b2c3d4...'
 * ```
 */

/**
 * Compute SHA-256 hash of a string content
 * @param content - File content to hash
 * @returns Hexadecimal hash string
 *
 * @example
 * ```tsx
 * const hash = await computeSHA256('hello world');
 * // Returns: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
 * ```
 */
export async function computeSHA256(content: string): Promise<string> {
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    // Compute SHA-256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
}

/**
 * Compute SHA-256 hash of an ArrayBuffer
 * @param buffer - Binary data to hash
 * @returns Hexadecimal hash string
 *
 * @example
 * ```tsx
 * const buffer = await file.arrayBuffer();
 * const hash = await computeSHA256FromBuffer(buffer);
 * ```
 */
export async function computeSHA256FromBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

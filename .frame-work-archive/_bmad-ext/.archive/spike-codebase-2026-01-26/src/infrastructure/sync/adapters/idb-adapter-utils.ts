/**
 * @fileoverview IDB Adapter Utilities
 * @module infrastructure/sync/adapters/idb-adapter-utils
 *
 * Utility functions for IndexedDB operations.
 * Includes eviction policies, sorting, and helper functions.
 */

import type { FileRecord, EvictionPolicy } from './idb-adapter-types';

// ============================================================================
// Eviction Utilities
// ============================================================================

/**
 * Sort records for eviction based on policy
 * @param records - Records to sort
 * @param policy - Eviction policy to use
 * @returns Sorted records (first in array should be evicted first)
 */
export function sortForEviction(records: FileRecord[], policy: EvictionPolicy): FileRecord[] {
  switch (policy) {
    case 'least-recently-used':
      // Sort by lastAccessedAt ascending (oldest access first)
      return [...records].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

    case 'least-frequently-used':
      // Sort by accessCount ascending (least accessed first)
      return [...records].sort((a, b) => (a.accessCount || 0) - (b.accessCount || 0));

    case 'largest-first':
      // Sort by size descending (largest first)
      return [...records].sort((a, b) => b.size - a.size);

    case 'oldest-first':
      // Sort by createdAt ascending (oldest first)
      return [...records].sort((a, b) => a.createdAt - b.createdAt);

    default:
      return records;
  }
}

/**
 * Convert glob pattern to regex
 * @param pattern - Glob pattern (supports *, **, ?)
 * @returns Regular expression
 */
export function globToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '.*') // ** -> any characters
    .replace(/\*/g, '[^/]*') // * -> any characters except slash
    .replace(/\?/g, '[^/]'); // ? -> single character

  return new RegExp(`^${regexPattern}$`);
}

/**
 * Convert Uint8Array to base64 string
 * @param data - Uint8Array data
 * @returns Base64-encoded string
 */
export function uint8ArrayToBase64(data: Uint8Array): string {
  const binary = Array.from(data)
    .map(byte => String.fromCharCode(byte))
    .join('');
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 * @param base64 - Base64-encoded string
 * @returns Uint8Array data
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Make a composite ID for a file path
 * @param projectId - Project ID
 * @param path - File path
 * @returns Composite ID
 */
export function makeId(projectId: string, path: string): string {
  return `${projectId}:${path}`;
}

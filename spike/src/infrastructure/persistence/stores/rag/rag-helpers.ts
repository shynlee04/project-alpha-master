/**
 * @fileoverview RAG Store Helper Functions
 * @module infrastructure/persistence/stores/rag/rag-helpers
 * @governance EPIC-7-1
 *
 * Helper functions for RAG store operations.
 * Implements cache management, IndexedDB quota handling, and data utilities.
 */

import type { CachedSearchResult } from './rag-types';

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Generate cache key from projectId and query
 */
export function generateCacheKey(projectId: string, query: string): string {
  return `${projectId}:${query.trim().toLowerCase()}`;
}

/**
 * Check if cached result is still valid (not expired)
 */
export function isCacheValid(cached: CachedSearchResult, ttl: number): boolean {
  return Date.now() - cached.timestamp < ttl;
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache(cache: Map<string, CachedSearchResult>, ttl: number): Map<string, CachedSearchResult> {
  const now = Date.now();
  const cleaned = new Map<string, CachedSearchResult>();

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp < ttl) {
      cleaned.set(key, value);
    }
  }

  return cleaned;
}

/**
 * Enforce cache size limit (LRU eviction)
 * Implements December 2025 best practice: prune old data first
 */
export function enforceCacheLimit(
  cache: Map<string, CachedSearchResult>,
  maxSize: number
): Map<string, CachedSearchResult> {
  if (cache.size <= maxSize) return cache;

  // Sort by timestamp (oldest first) and keep only maxSize entries
  const sorted = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
  const pruned = new Map(sorted.slice(sorted.length - maxSize));

  console.log(`[RAGHelpers] Cache pruned from ${cache.size} to ${pruned.size} entries`);
  return pruned;
}

// ============================================================================
// IndexedDB Quota Handling (December 2025 Best Practices)
// ============================================================================

/**
 * Check available IndexedDB quota
 * Returns { quota, usage } in bytes or undefined if not supported
 */
export async function getStorageQuota(): Promise<{ quota: number; usage: number } | undefined> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    // Extract quota and usage, converting bigint to number if needed
    const quota = estimate.quota !== undefined ? Number(estimate.quota) : 0;
    const usage = estimate.usage !== undefined ? Number(estimate.usage) : 0;
    return { quota, usage };
  }
  console.warn('[RAGHelpers] StorageManager not available');
  return undefined;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// ============================================================================
// Data Utilities
// ============================================================================

/**
 * Convert base64 string to ArrayBuffer
 * Used for decoding Orama index data
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

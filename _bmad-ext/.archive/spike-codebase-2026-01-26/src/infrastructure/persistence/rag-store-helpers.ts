/**
 * @fileoverview RAG Store Helper Functions
 * @module lib/state/rag-store-helpers
 * @governance EPIC-7-1
 *
 * Helper functions for RAG state management.
 * Extracted from rag-store.ts for better code organization.
 */

import type { CachedSearchResult } from './rag-store-types';

// ============================================================================
// Constants
// ============================================================================

/** Search cache TTL in milliseconds (5 minutes) */
export const SEARCH_CACHE_TTL = 5 * 60 * 1000;

/** Maximum cache size */
export const MAX_CACHE_SIZE = 100;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate cache key for search query
 */
export function generateCacheKey(projectId: string, query: string): string {
    return `${projectId}:${query}`;
}

/**
 * Check if cached result is still valid
 */
export function isCacheValid(entry: CachedSearchResult): boolean {
    return Date.now() - entry.timestamp < SEARCH_CACHE_TTL;
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache(cache: Map<string, CachedSearchResult>): Map<string, CachedSearchResult> {
    const cleaned = new Map<string, CachedSearchResult>();
    for (const [key, entry] of cache.entries()) {
        if (isCacheValid(entry)) {
            cleaned.set(key, entry);
        }
    }
    return cleaned;
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Enforce cache size limit (LRU eviction)
 */
export function enforceCacheLimit(cache: Map<string, CachedSearchResult>): Map<string, CachedSearchResult> {
    if (cache.size <= MAX_CACHE_SIZE) {
        return cache;
    }

    // Sort by timestamp (oldest first) and keep only the most recent MAX_CACHE_SIZE entries
    const entries = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const trimmed = new Map<string, CachedSearchResult>();
    const startIdx = entries.length - MAX_CACHE_SIZE;
    for (let i = startIdx; i < entries.length; i++) {
        trimmed.set(entries[i][0], entries[i][1]);
    }
    return trimmed;
}

/**
 * @fileoverview Snapshot Cache Slice
 * @module infrastructure/persistence/stores/filesystem/snapshot-cache-slice
 * @governance EPIC-CP-1.8
 *
 * File content cache with lazy loading and TTL-based freshness.
 * Manages cached file content separately from metadata.
 */

import { StateCreator } from 'zustand';
import type { SnapshotCacheState, SnapshotCacheMethods } from './snapshot-types';

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const createSnapshotCacheSlice: StateCreator<
  SnapshotCacheState,
  [],
  [],
  SnapshotCacheMethods
> = (set, get) => ({
  // State initialization
  content: {},

  // Get cached content with freshness check
  getCachedContent: (projectId: string, path: string) => {
    const key = `${projectId}:${path}`;
    const cached = get().content[key];

    if (!cached) {
      return { hit: false, fresh: false };
    }

    const fresh = Date.now() < cached.expiresAt;

    return {
      hit: true,
      fresh,
      content: fresh ? cached.content : undefined,
    };
  },

  // Save content to cache
  saveCachedContent: async (projectId: string, path: string, content: string) => {
    const key = `${projectId}:${path}`;
    const expiresAt = Date.now() + DEFAULT_CACHE_TTL_MS;

    set((state) => ({
      content: {
        ...state.content,
        [key]: { content, expiresAt },
      },
    }));

    // Persist to Dexie
    // TODO: Add Dexie persistence with quota management
  },

  // Check if cache is fresh
  isCacheFresh: (projectId: string, path: string) => {
    const key = `${projectId}:${path}`;
    const cached = get().content[key];

    if (!cached) {
      return false;
    }

    return Date.now() < cached.expiresAt;
  },

  // Clear all expired cache entries
  clearExpiredCache: async () => {
    const now = Date.now();

    set((state) => {
      const fresh: SnapshotCacheState['content'] = {};

      Object.entries(state.content).forEach(([key, value]) => {
        if (value.expiresAt > now) {
          fresh[key] = value;
        }
      });

      return { content: fresh };
    });

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },
});

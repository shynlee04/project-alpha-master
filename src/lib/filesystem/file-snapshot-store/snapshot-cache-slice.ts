/**
 * @fileoverview Snapshot Cache Slice - Core cache state + CRUD
 * @module filesystem/file-snapshot-store/snapshot-cache-slice
 */

import { StateCreator } from 'zustand';
import type { SnapshotSaveResult } from './types';

export interface SnapshotCacheSliceState {
  /** Cache TTL in milliseconds */
  cacheTTL: number;

  /** Number of metadata records */
  metadataCount: number;

  /** Number of content records */
  contentCount: number;

  /** Total cache size in bytes */
  totalSize: number;
}

export interface SnapshotCacheSliceActions {
  /** Save file snapshot to cache */
  saveSnapshot: (
    projectId: string,
    path: string,
    content: string,
    hash: string,
    size?: number,
    workspaceId?: string
  ) => Promise<void>;

  /** Get file tree metadata */
  getFileTree: (projectId: string) => Promise<any[]>;

  /** Get file count in cache */
  getFileCount: (projectId: string) => Promise<number>;

  /** Get cache size in bytes */
  getCacheSize: (projectId: string) => Promise<number>;

  /** Get cache statistics */
  getCacheStats: (projectId: string) => Promise<{
    totalCount: number;
    totalSize: number;
    expiredCount: number;
    freshCount: number;
  }>;

  /** Refresh snapshot TTL */
  refreshSnapshot: (projectId: string, path: string) => Promise<void>;

  /** Refresh all snapshots for project */
  refreshAllSnapshots: (projectId: string) => Promise<number>;
}

export type SnapshotCacheSlice = SnapshotCacheSliceState & SnapshotCacheSliceActions;

export const createSnapshotCacheSlice: StateCreator<
  SnapshotCacheSlice,
  [],
  [],
  SnapshotCacheSlice
> = (set, get) => {
  // Default configuration
  const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  const SNAPSHOT_VERSION = 1;

  return {
    cacheTTL: DEFAULT_CACHE_TTL_MS,
    metadataCount: 0,
    contentCount: 0,
    totalSize: 0,

    saveSnapshot: async (projectId, path, content, hash, size = content.length, workspaceId = 'ide') => {
      // This will delegate to Dexie operations
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const now = Date.now();
      const expiresAt = now + get().cacheTTL;

      await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
        await db.fileSnapshots.put({
          projectId,
          workspaceId,
          path,
          hash,
          size,
          version: SNAPSHOT_VERSION,
          lastCachedAt: now,
          expiresAt,
          hasContent: true,
        });

        try {
          await db.fileContentCache.put({
            projectId,
            workspaceId,
            path,
            content,
          });
        } catch (error: unknown) {
          if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('[SnapshotCache] Quota exceeded, clearing old entries');
            // Handle quota exceeded via eviction slice
          } else {
            throw error;
          }
        }
      });
    },

    getFileTree: async (projectId) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      return await db.fileSnapshots.where('projectId').equals(projectId).toArray();
    },

    getFileCount: async (projectId) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      return await db.fileSnapshots.where('projectId').equals(projectId).count();
    },

    getCacheSize: async (projectId) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const snapshots = await db.fileSnapshots.where('projectId').equals(projectId).toArray();
      return snapshots.reduce((sum: number, s: any) => sum + s.size, 0);
    },

    getCacheStats: async (projectId) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const now = Date.now();
      const snapshots = await db.fileSnapshots.where('projectId').equals(projectId).toArray();

      const totalSize = snapshots.reduce((sum: number, s: any) => sum + s.size, 0);
      const expiredCount = snapshots.filter((s: any) => now >= s.expiresAt).length;
      const freshCount = snapshots.filter((s: any) => now < s.expiresAt).length;

      return {
        totalCount: snapshots.length,
        totalSize,
        expiredCount,
        freshCount,
      };
    },

    refreshSnapshot: async (projectId, path) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const now = Date.now();
      const expiresAt = now + get().cacheTTL;

      await db.fileSnapshots.where('[projectId+path]').equals([projectId, path]).modify({
        lastCachedAt: now,
        expiresAt,
      });
    },

    refreshAllSnapshots: async (projectId) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const now = Date.now();
      const expiresAt = now + get().cacheTTL;

      return await db.fileSnapshots.where('projectId').equals(projectId).modify({
        lastCachedAt: now,
        expiresAt,
      });
    },
  };
};

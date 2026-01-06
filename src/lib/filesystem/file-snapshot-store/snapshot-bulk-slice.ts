/**
 * @fileoverview Snapshot Bulk Slice - Bulk operations and chunking
 * @module filesystem/file-snapshot-store/snapshot-bulk-slice
 */

import { StateCreator } from 'zustand';
import type { SnapshotSaveResult } from './types';

export interface SnapshotBulkSliceState {
  /** Bulk operation statistics */
  bulkStats: {
    totalBulkOps: number;
    totalSnapshotsProcessed: number;
    lastBulkDuration: number;
  };
}

export interface SnapshotBulkSliceActions {
  /** Save multiple snapshots in a single transaction */
  saveBulkSnapshots: (
    projectId: string,
    snapshots: Array<{
      path: string;
      content: string;
      hash: string;
      size?: number;
      workspaceId?: string;
    }>
  ) => Promise<SnapshotSaveResult>;

  /** Get all expired snapshots across all projects */
  getExpiredSnapshots: () => Promise<Array<any>>;

  /** Bulk invalidate by pattern */
  bulkInvalidateByPattern: (
    projectId: string,
    pattern: RegExp
  ) => Promise<number>;

  /** Bulk refresh TTL for project */
  bulkRefreshTTL: (
    projectId: string,
    paths: string[]
  ) => Promise<number>;

  /** Reset bulk statistics */
  resetBulkStats: () => void;
}

export type SnapshotBulkSlice = SnapshotBulkSliceState & SnapshotBulkSliceActions;

export const createSnapshotBulkSlice: StateCreator<
  SnapshotBulkSlice,
  [],
  [],
  SnapshotBulkSlice
> = (set, get) => {
  const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  const SNAPSHOT_VERSION = 1;

  return {
    bulkStats: {
      totalBulkOps: 0,
      totalSnapshotsProcessed: 0,
      lastBulkDuration: 0,
    },

    saveBulkSnapshots: async (projectId, snapshots) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const startTime = Date.now();
      const now = Date.now();
      const expiresAt = now + get().cacheTTL;

      let metadataCount = 0;
      let contentCount = 0;

      await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
        for (const { path, content, hash, size = content.length, workspaceId = 'ide' } of snapshots) {
          // Save metadata
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
          metadataCount++;

          // Save content
          try {
            await db.fileContentCache.put({
              projectId,
              workspaceId,
              path,
              content,
            });
            contentCount++;
          } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              console.warn('[SnapshotBulk] Quota exceeded, stopping bulk operation');
              // Stop processing on quota error
              break;
            } else {
              throw error;
            }
          }
        }
      });

      const duration = Date.now() - startTime;

      set((state) => ({
        bulkStats: {
          totalBulkOps: state.bulkStats.totalBulkOps + 1,
          totalSnapshotsProcessed: state.bulkStats.totalSnapshotsProcessed + metadataCount,
          lastBulkDuration: duration,
        },
      }));

      return {
        metadataCount,
        contentCount,
        durationMs: duration,
      };
    },

    getExpiredSnapshots: async () => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const now = Date.now();

      const expiredSnapshots = await db.fileSnapshots
        .filter((snapshot) => now >= snapshot.expiresAt)
        .toArray();

      return expiredSnapshots;
    },

    bulkInvalidateByPattern: async (projectId, pattern) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');

      const snapshots = await db.fileSnapshots
        .where('projectId')
        .equals(projectId)
        .toArray();

      const matchingSnapshots = snapshots.filter((s) => pattern.test(s.path));

      if (matchingSnapshots.length === 0) {
        return 0;
      }

      await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
        for (const snapshot of matchingSnapshots) {
          await db.fileSnapshots.where({ projectId: snapshot.projectId, path: snapshot.path }).delete();
          await db.fileContentCache.where({ projectId: snapshot.projectId, path: snapshot.path }).delete();
        }
      });

      return matchingSnapshots.length;
    },

    bulkRefreshTTL: async (projectId, paths) => {
      const { db } = await import('@/infrastructure/persistence/dexie-db');
      const now = Date.now();
      const expiresAt = now + DEFAULT_CACHE_TTL_MS;

      let refreshedCount = 0;

      await db.fileSnapshots
        .where('projectId')
        .equals(projectId)
        .filter((snapshot) => paths.includes(snapshot.path))
        .modify({
          lastCachedAt: now,
          expiresAt,
        });

      refreshedCount = paths.length;

      return refreshedCount;
    },

    resetBulkStats: () => {
      set({
        bulkStats: {
          totalBulkOps: 0,
          totalSnapshotsProcessed: 0,
          lastBulkDuration: 0,
        },
      });
    },
  };
};

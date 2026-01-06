/**
 * @fileoverview Snapshot Invalidation Slice - Cache invalidation strategies
 * @module filesystem/file-snapshot-store/snapshot-invalidation-slice
 */

import { StateCreator } from 'zustand';

export interface SnapshotInvalidationSliceState {
  /** Invalidation statistics */
  invalidationStats: {
    totalInvalidated: number;
    hashMismatches: number;
    expiredCleared: number;
    manualInvalidations: number;
  };
}

export interface SnapshotInvalidationSliceActions {
  /** Invalidate specific snapshot */
  invalidateSnapshot: (projectId: string, path: string) => Promise<void>;

  /** Invalidate all snapshots for project */
  invalidateProject: (projectId: string) => Promise<number>;

  /** Clear all expired snapshots */
  invalidateExpired: (projectId?: string) => Promise<number>;

  /** Invalidate snapshots with hash mismatch */
  invalidateByHashMismatch: (
    projectId: string,
    path: string,
    expectedHash: string
  ) => Promise<boolean>;

  /** Delete all snapshots (nuclear option) */
  deleteAllSnapshots: () => Promise<void>;

  /** Reset invalidation statistics */
  resetInvalidationStats: () => void;
}

export type SnapshotInvalidationSlice = SnapshotInvalidationSliceState & SnapshotInvalidationSliceActions;

export const createSnapshotInvalidationSlice: StateCreator<
  SnapshotInvalidationSlice,
  [],
  [],
  SnapshotInvalidationSlice
> = (set, get) => ({
  invalidationStats: {
    totalInvalidated: 0,
    hashMismatches: 0,
    expiredCleared: 0,
    manualInvalidations: 0,
  },

  invalidateSnapshot: async (projectId, path) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');

    await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
      await db.fileSnapshots.where({ projectId, path }).delete();
      await db.fileContentCache.where({ projectId, path }).delete();
    });

    set((state) => ({
      invalidationStats: {
        ...state.invalidationStats,
        totalInvalidated: state.invalidationStats.totalInvalidated + 1,
        manualInvalidations: state.invalidationStats.manualInvalidations + 1,
      },
    }));
  },

  invalidateProject: async (projectId) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');

    let count = 0;
    await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
      const metadataCount = await db.fileSnapshots.where('projectId').equals(projectId).count();
      await db.fileSnapshots.where('projectId').equals(projectId).delete();
      await db.fileContentCache.where('projectId').equals(projectId).delete();
      count = metadataCount;
    });

    set((state) => ({
      invalidationStats: {
        ...state.invalidationStats,
        totalInvalidated: state.invalidationStats.totalInvalidated + count,
        manualInvalidations: state.invalidationStats.manualInvalidations + 1,
      },
    }));

    return count;
  },

  invalidateExpired: async (projectId) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');
    const now = Date.now();

    let clearedCount = 0;

    if (projectId) {
      // Clear expired for specific project
      const expiredSnapshots = await db.fileSnapshots
        .where('projectId')
        .equals(projectId)
        .and((snapshot) => now >= snapshot.expiresAt)
        .toArray();

      if (expiredSnapshots.length > 0) {
        await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
          for (const snapshot of expiredSnapshots) {
            await db.fileSnapshots.where({ projectId: snapshot.projectId, path: snapshot.path }).delete();
            await db.fileContentCache.where({ projectId: snapshot.projectId, path: snapshot.path }).delete();
          }
        });

        clearedCount = expiredSnapshots.length;
      }
    } else {
      // Clear ALL expired across all projects
      const expiredSnapshots = await db.fileSnapshots
        .filter((snapshot) => now >= snapshot.expiresAt)
        .toArray();

      if (expiredSnapshots.length > 0) {
        await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
          for (const snapshot of expiredSnapshots) {
            await db.fileSnapshots.where({ projectId: snapshot.projectId, path: snapshot.path }).delete();
            await db.fileContentCache.where({ projectId: snapshot.projectId, path: snapshot.path }).delete();
          }
        });

        clearedCount = expiredSnapshots.length;
      }
    }

    set((state) => ({
      invalidationStats: {
        ...state.invalidationStats,
        totalInvalidated: state.invalidationStats.totalInvalidated + clearedCount,
        expiredCleared: state.invalidationStats.expiredCleared + clearedCount,
      },
    }));

    return clearedCount;
  },

  invalidateByHashMismatch: async (projectId, path, expectedHash) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');

    const snapshot = await db.fileSnapshots.get({
      projectId,
      path,
    });

    if (!snapshot) {
      return false; // No snapshot to invalidate
    }

    if (snapshot.hash !== expectedHash) {
      await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
        await db.fileSnapshots.where({ projectId, path }).delete();
        await db.fileContentCache.where({ projectId, path }).delete();
      });

      set((state) => ({
        invalidationStats: {
          ...state.invalidationStats,
          totalInvalidated: state.invalidationStats.totalInvalidated + 1,
          hashMismatches: state.invalidationStats.hashMismatches + 1,
        },
      }));

      return true; // Invalidated due to hash mismatch
    }

    return false; // Hash matched, no invalidation needed
  },

  deleteAllSnapshots: async () => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');

    await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
      await db.fileSnapshots.clear();
      await db.fileContentCache.clear();
    });

    set({
      invalidationStats: {
        totalInvalidated: 0,
        hashMismatches: 0,
        expiredCleared: 0,
        manualInvalidations: 0,
      },
    });
  },

  resetInvalidationStats: () => {
    set({
      invalidationStats: {
        totalInvalidated: 0,
        hashMismatches: 0,
        expiredCleared: 0,
        manualInvalidations: 0,
      },
    });
  },
});

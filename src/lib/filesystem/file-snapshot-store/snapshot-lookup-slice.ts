/**
 * @fileoverview Snapshot Lookup Slice - Cache hit/freshness checking
 * @module filesystem/file-snapshot-store/snapshot-lookup-slice
 */

import { StateCreator } from 'zustand';
import type { CacheLookupResult } from './types';

export interface SnapshotLookupSliceState {
  /** Last lookup results for debugging */
  lastLookup?: CacheLookupResult;
}

export interface SnapshotLookupSliceActions {
  /** Lookup snapshot in cache */
  getSnapshot: (
    projectId: string,
    path: string,
    loadContent?: boolean
  ) => Promise<CacheLookupResult>;

  /** Check if snapshot is fresh (within TTL) */
  isFresh: (projectId: string, path: string) => Promise<boolean>;

  /** Get snapshot metadata only (no content) */
  getSnapshotMetadata: (
    projectId: string,
    path: string
  ) => Promise<any | undefined>;

  /** Load snapshot content from cache */
  loadSnapshotContent: (
    projectId: string,
    path: string,
    workspaceId?: string
  ) => Promise<string | undefined>;
}

export type SnapshotLookupSlice = SnapshotLookupSliceState & SnapshotLookupSliceActions;

export const createSnapshotLookupSlice: StateCreator<
  SnapshotLookupSlice,
  [],
  [],
  SnapshotLookupSlice
> = (set) => ({
  getSnapshot: async (projectId, path, loadContent = false) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');
    const now = Date.now();

    // Check metadata
    const snapshot = await db.fileSnapshots.get({
      projectId,
      path,
    });

    if (!snapshot) {
      const result: CacheLookupResult = {
        hit: false,
        fresh: false,
      };
      set({ lastLookup: result });
      return result;
    }

    // Check freshness
    const fresh = now < snapshot.expiresAt;

    const result: CacheLookupResult = {
      hit: true,
      fresh,
      snapshot,
    };

    // Optionally load content
    if (loadContent && fresh) {
      const contentEntry = await db.fileContentCache.get({
        projectId,
        path,
      });
      result.content = contentEntry?.content;
    }

    set({ lastLookup: result });
    return result;
  },

  isFresh: async (projectId, path) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');
    const now = Date.now();

    const snapshot = await db.fileSnapshots.get({
      projectId,
      path,
    });

    if (!snapshot) {
      return false;
    }

    return now < snapshot.expiresAt;
  },

  getSnapshotMetadata: async (projectId, path) => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');

    const snapshot = await db.fileSnapshots.get({
      projectId,
      path,
    });

    return snapshot;
  },

  loadSnapshotContent: async (projectId, path, workspaceId = 'ide') => {
    const { db } = await import('@/infrastructure/persistence/dexie-db');

    const contentEntry = await db.fileContentCache.get({
      projectId,
      workspaceId,
      path,
    });

    return contentEntry?.content;
  },
});

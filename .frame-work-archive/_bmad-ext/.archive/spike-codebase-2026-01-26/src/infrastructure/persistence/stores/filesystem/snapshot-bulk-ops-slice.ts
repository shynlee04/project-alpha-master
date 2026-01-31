/**
 * @fileoverview Snapshot Bulk Ops Slice
 * @module infrastructure/persistence/stores/filesystem/snapshot-bulk-ops-slice
 * @governance EPIC-CP-1.9
 *
 * Batch operations for large project file handling.
 * Handles chunked bulk operations (100 items per chunk).
 */

import { StateCreator } from 'zustand';
import type { FileSnapshotRecord } from '@/infrastructure/persistence/dexie-db-core-types';
import type { SnapshotBulkOpsState, SnapshotBulkOpsMethods } from './snapshot-types';

const BULK_OPERATION_CHUNK_SIZE = 100;

export const createSnapshotBulkOpsSlice: StateCreator<
  SnapshotBulkOpsState,
  [],
  [],
  SnapshotBulkOpsMethods
> = (set, get) => ({
  // Save multiple snapshots in chunks
  saveBulkSnapshots: async (projectId: string, snapshots: FileSnapshotRecord[]) => {
    const startTime = Date.now();
    let metadataCount = 0;
    let contentCount = 0;

    // Process in chunks to avoid blocking
    for (let i = 0; i < snapshots.length; i += BULK_OPERATION_CHUNK_SIZE) {
      const chunk = snapshots.slice(i, i + BULK_OPERATION_CHUNK_SIZE);

      // Process chunk (would integrate with metadata and cache slices)
      chunk.forEach((snapshot) => {
        // Save metadata via cross-slice call
        (get() as any).saveSnapshotMetadata(projectId, snapshot.path, snapshot);
        metadataCount++;

        // Content would be saved separately via cache slice if provided
        if ((snapshot as any).content) {
          (get() as any).saveCachedContent(projectId, snapshot.path, (snapshot as any).content);
          contentCount++;
        }
      });
    }

    const durationMs = Date.now() - startTime;

    return {
      metadataCount,
      contentCount,
      durationMs,
    };
  },

  // Get multiple snapshots efficiently
  getBulkSnapshots: async (projectId: string, paths: string[]) => {
    const results: FileSnapshotRecord[] = [];

    // Process in chunks
    for (let i = 0; i < paths.length; i += BULK_OPERATION_CHUNK_SIZE) {
      const chunk = paths.slice(i, i + BULK_OPERATION_CHUNK_SIZE);

      // Get metadata for each path
      chunk.forEach((path) => {
        const metadata = (get() as any).getSnapshotMetadata(projectId, path);
        if (metadata) {
          results.push(metadata);
        }
      });
    }

    return results;
  },

  // Clear all cache entries for a project
  clearProjectCache: async (projectId: string) => {
    // Get all keys for this project (cross-slice call to cache slice)
    const cacheState = get() as any;
    const allKeys = Object.keys(cacheState.content || {});

    const projectKeys = allKeys.filter((key) => key.startsWith(`${projectId}:`));

    // Remove each entry from cache (cross-slice call)
    projectKeys.forEach((key) => {
      delete cacheState.content[key];
    });

    // Also clear metadata (cross-slice call to metadata slice)
    const allMetadata = Object.keys(cacheState.metadata || {});
    const projectMetadata = allMetadata.filter((key) => key.startsWith(`${projectId}:`));

    projectMetadata.forEach((key) => {
      delete cacheState.metadata[key];
    });

    // Trigger state update
    set(cacheState);

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },
});

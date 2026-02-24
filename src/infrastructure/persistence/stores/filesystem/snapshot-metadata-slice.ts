/**
 * @fileoverview Snapshot Metadata Slice
 * @module infrastructure/persistence/stores/filesystem/snapshot-metadata-slice
 * @governance EPIC-CP-1.7
 *
 * File snapshot metadata management for instant file tree loads.
 * Caches file metadata (size, hash, timestamps) without content.
 */

import { StateCreator } from 'zustand';
import type { FileSnapshotRecord } from '@/infrastructure/persistence/dexie-db-core-types';
import type { SnapshotMetadataState, SnapshotMetadataMethods, FileTreeNode } from './snapshot-types';

export const createSnapshotMetadataSlice: StateCreator<
  SnapshotMetadataState,
  [],
  [],
  SnapshotMetadataMethods
> = (set, get) => ({
  // State initialization
  metadata: {},

  // Save snapshot metadata
  saveSnapshotMetadata: (projectId: string, path: string, metadata: FileSnapshotRecord) => {
    const key = `${projectId}:${path}`;

    set((state) => ({
      metadata: {
        ...state.metadata,
        [key]: metadata,
      },
    }));

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },

  // Get snapshot metadata
  getSnapshotMetadata: (projectId: string, path: string) => {
    const key = `${projectId}:${path}`;
    return get().metadata[key];
  },

  // Build file tree from metadata
  getFileTree: (projectId: string) => {
    const allMetadata = Object.entries(get().metadata)
      .filter(([key]) => key.startsWith(`${projectId}:`))
      .map(([, record]) => record);

    // Build hierarchical tree structure
    const root: FileTreeNode = {
      name: 'root',
      path: '/',
      type: 'directory',
      children: [],
    };

    allMetadata.forEach((record) => {
      const parts = record.path.split('/').filter(Boolean);
      let currentNode = root;

      parts.forEach((part, index) => {
        let child = currentNode.children?.find((c: FileTreeNode) => c.name === part);

        if (!child) {
          const isLast = index === parts.length - 1;
          const nodePath = '/' + parts.slice(0, index + 1).join('/');

          child = {
            name: part,
            path: nodePath,
            type: isLast ? 'file' : 'directory',
            size: isLast ? record.size : undefined,
            hash: isLast ? record.hash : undefined,
            children: isLast ? undefined : [],
          };

          if (!currentNode.children) {
            currentNode.children = [];
          }
          currentNode.children.push(child);
        }

        currentNode = child;
      });
    });

    return {
      root,
      metadata: Object.fromEntries(
        allMetadata.map((m) => [`${projectId}:${m.path}`, m])
      ),
    };
  },

  // Invalidate snapshot metadata
  invalidateSnapshot: (projectId: string, path: string) => {
    const key = `${projectId}:${path}`;

    set((state) => {
      const { [key]: removed, ...remaining } = state.metadata;
      return { metadata: remaining };
    });

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },
});

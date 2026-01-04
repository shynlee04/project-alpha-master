/**
 * @fileoverview Knowledge Collections Slice
 * @module infrastructure/persistence/stores/knowledge/knowledge-collections-slice
 * @governance EPIC-6-3
 *
 * Collection management and source filtering.
 */

import { StateCreator } from 'zustand';
import type {
  KnowledgeSource,
  KnowledgeCollection,
  KnowledgeCollectionsState,
} from './knowledge-types';

/**
 * Generate unique collection ID
 */
function generateCollectionId(): string {
  return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const createKnowledgeCollectionsSlice: StateCreator<
  KnowledgeCollectionsState,
  [],
  [],
  KnowledgeCollectionsState
> = (set, get) => ({
  // State initialization
  collections: {},
  filteredCollectionId: null,

  // Create new collection
  createCollection: (name: string, projectId: string) => {
    const collectionId = generateCollectionId();
    const now = new Date();
    const collection: KnowledgeCollection = {
      id: collectionId,
      projectId,
      name,
      sourceIds: [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      collections: { ...state.collections, [collectionId]: collection },
    }));

    // TODO: Persist to Dexie
    console.log('[KnowledgeStore] Created collection:', collectionId);

    return collectionId;
  },

  // Update collection
  updateCollection: (
    collectionId: string,
    updates: Partial<Omit<KnowledgeCollection, 'id' | 'createdAt'>>
  ) => {
    set((state) => {
      const existing = state.collections[collectionId];
      if (!existing) {
        console.warn('[KnowledgeStore] Collection not found:', collectionId);
        return state;
      }

      return {
        collections: {
          ...state.collections,
          [collectionId]: { ...existing, ...updates, updatedAt: new Date() },
        },
      };
    });

    // TODO: Persist to Dexie
  },

  // Delete collection
  deleteCollection: (collectionId: string) => {
    set((state) => {
      const updated = { ...state.collections };
      delete updated[collectionId];

      // Clear filter if this collection was selected
      const filteredCollectionId =
        state.filteredCollectionId === collectionId ? null : state.filteredCollectionId;

      return { collections: updated, filteredCollectionId };
    });

    // TODO: Persist to Dexie
  },

  // Add source to collection
  addSourceToCollection: (sourceId: string, collectionId: string) => {
    set((state) => {
      const existing = state.collections[collectionId];
      if (!existing) {
        console.warn('[KnowledgeStore] Collection not found:', collectionId);
        return state;
      }

      // Prevent duplicates
      if (existing.sourceIds.includes(sourceId)) {
        return state;
      }

      return {
        collections: {
          ...state.collections,
          [collectionId]: {
            ...existing,
            sourceIds: [...existing.sourceIds, sourceId],
            updatedAt: new Date(),
          },
        },
      };
    });

    // TODO: Persist to Dexie
  },

  // Remove source from collection
  removeSourceFromCollection: (sourceId: string, collectionId: string) => {
    set((state) => {
      const existing = state.collections[collectionId];
      if (!existing) {
        console.warn('[KnowledgeStore] Collection not found:', collectionId);
        return state;
      }

      return {
        collections: {
          ...state.collections,
          [collectionId]: {
            ...existing,
            sourceIds: existing.sourceIds.filter((id) => id !== sourceId),
            updatedAt: new Date(),
          },
        },
      };
    });

    // TODO: Persist to Dexie
  },

  // Filter sources by collection
  filterByCollection: (collectionId: string | null) => {
    set({ filteredCollectionId: collectionId });
  },

  // Get collection by ID
  getCollection: (collectionId: string) => {
    return get().collections[collectionId];
  },

  // Get all collections
  getAllCollections: () => {
    return Object.values(get().collections);
  },

  // Get filtered sources
  getFilteredSources: (sources: Record<string, KnowledgeSource>) => {
    const { filteredCollectionId, collections } = get();

    // If no filter, return all active sources
    if (!filteredCollectionId) {
      return Object.values(sources).filter((s) => !s.deleted);
    }

    // Filter by collection
    const collection = collections[filteredCollectionId];
    if (!collection) return [];

    return collection.sourceIds
      .map((id) => sources[id])
      .filter((s): s is KnowledgeSource => s !== undefined && s !== null && !s.deleted);
  },
});

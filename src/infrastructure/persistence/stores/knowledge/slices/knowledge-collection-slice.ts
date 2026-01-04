/**
 * @fileoverview Knowledge Collection Slice
 * @module infrastructure/persistence/stores/knowledge/slices/knowledge-collection-slice
 * @governance Epic 53-3 (State Management Consolidation)
 * @canonical This is the canonical location per ADR-024
 *
 * Collection management slice for knowledge store.
 * Manages source collections and filtering.
 */

import { StateCreator } from 'zustand';
import type { CollectionRecord, KnowledgeStoreState } from '../types';
import {
    db,
    getCollectionsForProject,
    saveCollection,
    deleteCollection,
    addSourceToCollection,
    removeSourceFromCollection
} from '../../../dexie-db';

export interface CollectionState {
    loadCollections: (projectId: string) => Promise<void>;
    createCollection: (name: string) => Promise<void>;
    updateCollection: (collectionId: string, updates: Partial<CollectionRecord>) => Promise<void>;
    deleteCollection: (collectionId: string) => Promise<void>;
    addSourceToCollection: (sourceId: string, collectionId: string) => Promise<void>;
    removeSourceFromCollection: (sourceId: string, collectionId: string) => Promise<void>;
    filterByCollection: (collectionId: string | null) => void;
}

export const createCollectionSlice: StateCreator<KnowledgeStoreState, [], []> = (set, get, _api) => ({
    loadCollections: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
            const collections = await getCollectionsForProject(projectId);
            set({ collections, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    createCollection: async (name: string) => {
        set({ loading: true, error: null });
        try {
            const projectId = 'current-project-id';
            const now = Date.now();
            await db.collections.add({ id: crypto.randomUUID(), projectId, name, sourceIds: [], createdAt: now, updatedAt: now });
            const collections = await getCollectionsForProject(projectId);
            set({ collections, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    updateCollection: async (collectionId: string, updates: Partial<CollectionRecord>) => {
        set({ loading: true, error: null });
        try {
            const collection = get().collections.find(c => c.id === collectionId);
            if (!collection) return;
            const updated = { ...collection, ...updates, updatedAt: Date.now() };
            await saveCollection(updated);
            set((state) => ({ collections: state.collections.map(c => c.id === collectionId ? updated : c), loading: false }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    deleteCollection: async (collectionId: string) => {
        set({ loading: true, error: null });
        try {
            await deleteCollection(collectionId);
            set((state) => ({ collections: state.collections.filter(c => c.id !== collectionId), filteredCollectionId: state.filteredCollectionId === collectionId ? null : state.filteredCollectionId, loading: false }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addSourceToCollection: async (sourceId: string, collectionId: string) => {
        set({ loading: true, error: null });
        try {
            await addSourceToCollection(collectionId, sourceId);
            const collection = get().collections.find(c => c.id === collectionId);
            if (collection) {
                const collections = await getCollectionsForProject(collection.projectId);
                set({ collections, loading: false });
            } else { set({ loading: false }); }
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    removeSourceFromCollection: async (sourceId: string, collectionId: string) => {
        set({ loading: true, error: null });
        try {
            await removeSourceFromCollection(collectionId, sourceId);
            const collection = get().collections.find(c => c.id === collectionId);
            if (collection) {
                const collections = await getCollectionsForProject(collection.projectId);
                set({ collections, loading: false });
            } else { set({ loading: false }); }
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    filterByCollection: (collectionId: string | null) => {
        set({ filteredCollectionId: collectionId });
    },
});

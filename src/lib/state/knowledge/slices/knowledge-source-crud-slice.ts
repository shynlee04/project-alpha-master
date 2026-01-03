/**
 * @fileoverview Knowledge Source CRUD Slice
 * @module lib/state/knowledge/slices/knowledge-source-crud-slice
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * Source CRUD operations slice for knowledge store.
 * Handles loading, selecting, deleting, renaming, and updating sources.
 */

import { StateCreator } from 'zustand';
import type { SourceRecord, SourceMetadata, DeletedSource, KnowledgeStoreState } from '../types';
import { db } from '../../dexie-db';

export interface SourceCrudState {
    loadSources: (projectId: string) => Promise<void>;
    selectSource: (source: SourceRecord | null) => void;
    deleteSource: (sourceId: string) => Promise<void>;
    renameSource: (sourceId: string, newName: string) => Promise<void>;
    updateSourceMetadata: (sourceId: string, metadata: SourceMetadata) => Promise<void>;
}

export const createSourceCrudSlice: StateCreator<KnowledgeStoreState> = (set, get, api) => ({
    loadSources: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
            const sources = await db.sources.where('projectId').equals(projectId).toArray();
            const activeSources = sources.filter(s => !s.deleted);
            set({ sources: activeSources, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    selectSource: (source) => {
        set({ selectedSource: source });
    },

    deleteSource: async (sourceId: string) => {
        try {
            const source = get().sources.find(s => s.id === sourceId);
            if (!source) return;

            await db.sources.update(sourceId, { deleted: true, deletedAt: Date.now() });
            const sources = get().sources.filter(s => s.id !== sourceId);
            set({ sources });

            const deletedSource: DeletedSource = { sourceId, source, timestamp: Date.now() };
            set((state) => ({ undoQueue: [...state.undoQueue, deletedSource] }));

            if (get().selectedSource?.id === sourceId) {
                set({ selectedSource: null });
            }

            // Remove from all collections
            for (const collection of get().collections) {
                if (collection.sourceIds.includes(sourceId)) {
                    await db.collections.where('id').equals(collection.id).modify(col => {
                        col.sourceIds = col.sourceIds.filter(id => id !== sourceId);
                    });
                }
            }

            setTimeout(() => {
                set((state) => ({ undoQueue: state.undoQueue.filter(item => item.sourceId !== sourceId) }));
            }, 5000);
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    renameSource: async (sourceId: string, newName: string) => {
        try {
            await db.sources.update(sourceId, { title: newName, updatedAt: Date.now() });
            set((state) => ({
                sources: state.sources.map(s => s.id === sourceId ? { ...s, title: newName, updatedAt: Date.now() } : s),
                selectedSource: state.selectedSource?.id === sourceId ? { ...state.selectedSource, title: newName, updatedAt: Date.now() } : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateSourceMetadata: async (sourceId: string, metadata: SourceMetadata) => {
        try {
            await db.sources.update(sourceId, { ...metadata, updatedAt: Date.now() });
            set((state) => ({
                sources: state.sources.map(s => s.id === sourceId ? { ...s, ...metadata, updatedAt: Date.now() } : s),
                selectedSource: state.selectedSource?.id === sourceId ? { ...state.selectedSource, ...metadata, updatedAt: Date.now() } : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
});

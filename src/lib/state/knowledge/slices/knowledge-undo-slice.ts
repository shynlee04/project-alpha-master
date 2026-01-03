/**
 * @fileoverview Knowledge Undo Slice
 * @module lib/state/knowledge/slices/knowledge-undo-slice
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * Undo functionality slice for knowledge store.
 * Manages undo queue for deleted sources.
 */

import { StateCreator } from 'zustand';
import type { KnowledgeStoreState } from '../types';
import { db } from '../../dexie-db';

export interface UndoState {
    undoDelete: (sourceId: string) => Promise<void>;
}

export const createUndoSlice: StateCreator<KnowledgeStoreState> = (set, get, api) => ({
    undoDelete: async (sourceId: string) => {
        try {
            await db.sources.update(sourceId, { deleted: false, deletedAt: undefined });

            const undoItem = get().undoQueue.find(item => item.sourceId === sourceId);
            if (!undoItem) return;

            set((state) => ({
                sources: [...state.sources, undoItem.source],
                undoQueue: state.undoQueue.filter(item => item.sourceId !== sourceId),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
});

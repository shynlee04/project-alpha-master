/**
 * @fileoverview Note Metadata Slice
 * @module lib/notes/slices/note-metadata-slice
 * @governance EPIC-26-1
 *
 * Note metadata operations:
 * - toggleFavorite: Toggle favorite status
 * - moveNote: Move note to new parent with reordering
 *
 * These operations update note metadata without changing content.
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';

/**
 * Metadata Operations Slice
 *
 * Manages note metadata changes (favorite, parent, order).
 * Updates are persisted to IndexedDB and local state.
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 */
export const createNoteMetadataSlice: StateCreator<
    NoteStoreState,
    [],
    [],
    Pick<NoteStoreState, 'toggleFavorite' | 'moveNote'>
> = (set, get) => ({

    /**
     * Toggle favorite status for a note
     * @param noteId - Note ID to toggle favorite status
     */
    toggleFavorite: async (noteId: string) => {
        const { notes } = get();
        const note = notes.get(noteId);

        if (!note) return;

        const newIsFavorite = !note.isFavorite;

        try {
            await db.notes.update(noteId, {
                isFavorite: newIsFavorite,
                updatedAt: Date.now(),
            });

            set((state) => {
                const newMap = new Map(state.notes);
                newMap.set(noteId, { ...note, isFavorite: newIsFavorite });
                return {
                    notes: newMap,
                    notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                };
            });

            console.log(`[NoteStore-Metadata] Toggled favorite for note ${noteId}: ${newIsFavorite}`);

            // Emit event via cross-slice call
            const { emitFavoriteChanged } = get();
            emitFavoriteChanged?.(noteId, note.projectId, newIsFavorite);

        } catch (error) {
            set({ error: (error as Error).message });
            console.error('[NoteStore-Metadata] Failed to toggle favorite:', error);
        }
    },

    /**
     * Move note to new parent with new order
     * @param noteId - Note ID to move
     * @param newParentId - New parent ID (null for root level)
     * @param newOrder - New order position
     */
    moveNote: async (noteId: string, newParentId: string | null, newOrder: number) => {
        const { notes } = get();
        const note = notes.get(noteId);

        if (!note) {
            console.warn(`[NoteStore-Metadata] Note ${noteId} not found, cannot move`);
            return;
        }

        try {
            await db.notes.update(noteId, {
                parentId: newParentId ?? undefined,
                order: newOrder,
                updatedAt: Date.now(),
            });

            set((state) => {
                const newMap = new Map(state.notes);
                newMap.set(noteId, {
                    ...note,
                    parentId: newParentId ?? undefined,
                    order: newOrder
                });
                return {
                    notes: newMap,
                    notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                };
            });

            console.log(`[NoteStore-Metadata] Moved note ${noteId} to parent ${newParentId} at order ${newOrder}`);

            // Emit event via cross-slice call
            const { emitNoteMoved } = get();
            emitNoteMoved?.(noteId, note.projectId, note.parentId ?? null, newParentId ?? null);

        } catch (error) {
            set({ error: (error as Error).message });
            console.error('[NoteStore-Metadata] Failed to move note:', error);
        }
    },
});

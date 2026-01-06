/**
 * @fileoverview Note Query Slice
 * @module lib/notes/slices/note-query-slice
 * @governance EPIC-26-1
 *
 * Query and search operations:
 * - getNotesByParent: Get child notes for tree rendering
 * - getFavoriteNotes: Get all favorited notes
 * - isNoteDirty: Check if note has unsaved changes
 *
 * These are pure read operations that don't modify state.
 */

import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';

/**
 * Query Operations Slice
 *
 * Provides read-only query methods for filtering and searching notes.
 * All methods are pure functions (no state mutations).
 */
export const createNoteQuerySlice: StateCreator<
    NoteStoreState,
    [],
    [],
    Pick<NoteStoreState, 'getNotesByParent' | 'getFavoriteNotes' | 'isNoteDirty'>
> = (_set, get) => ({

    /**
     * Get notes by parent ID for tree rendering
     * @param parentId - Parent ID (null for root level)
     * @returns Sorted array of child notes
     */
    getNotesByParent: (parentId: string | null) => {
        const { notesArray } = get();
        return notesArray
            .filter(n => (n.parentId ?? null) === parentId)
            .sort((a, b) => a.order - b.order);
    },

    /**
     * Get all favorite notes
     * @returns Array of favorited notes
     */
    getFavoriteNotes: () => {
        const { notesArray } = get();
        return notesArray.filter(n => n.isFavorite);
    },

    /**
     * Check if a note has unsaved changes
     * @param noteId - Note ID to check
     * @returns True if note is dirty (has unsaved changes)
     */
    isNoteDirty: (noteId: string) => {
        const { dirtyNoteIds } = get();
        return dirtyNoteIds.has(noteId);
    },
});

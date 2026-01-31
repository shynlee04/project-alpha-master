/**
 * @fileoverview Note UI Slice
 * @module lib/notes/slices/note-ui-slice
 * @governance EPIC-26-1
 *
 * UI state management:
 * - setActiveNote: Change active note
 * - UI state: activeNoteId, saveStatus, loading, error
 *
 * Manages transient UI state that doesn't persist to IndexedDB.
 */

import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';

/**
 * UI State Slice
 *
 * Manages transient UI state for note editor.
 * All state is ephemeral (cleared on page reload).
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 */
export const createNoteUISlice: StateCreator<
    NoteStoreState,
    [],
    [],
    {
        setActiveNote: (noteId: string | null) => void;
    }
> = (set, get) => ({

    /**
     * Set active note for editing
     * Emits note selected event for cross-workspace sync (NR-07)
     *
     * @param noteId - Note ID to set as active (null to clear)
     */
    setActiveNote: (noteId: string | null) => {
        const note = noteId ? get().notes.get(noteId) : null;
        set({ activeNoteId: noteId });

        // Emit event via cross-slice call
        if (noteId) {
            const { emitNoteSelected } = get();
            emitNoteSelected?.(noteId, note || undefined);
        }
    },
});

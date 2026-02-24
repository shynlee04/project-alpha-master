/**
 * @fileoverview Note Events Slice
 * @module lib/notes/slices/note-events-slice
 * @governance EPIC-26-1
 *
 * Event emission orchestration:
 * - Emits 8 event types for cross-workspace communication (NR-07)
 * - Centralizes all event emission logic
 *
 * Events enable cross-workspace note access and real-time sync.
 */

import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';
import {
    emitNoteCreated,
    emitNoteUpdated,
    emitNoteDeleted,
    emitNoteSelected,
    emitNoteContentChanged,
    emitNoteTitleChanged,
    emitNoteMoved,
    emitNoteFavoriteChanged,
} from '../note-event-emitter';

/**
 * Event Emission Slice
 *
 * Orchestrates all event emissions for cross-workspace communication.
 * Methods are called by other slices after state changes.
 */
export const createNoteEventsSlice: StateCreator<
    NoteStoreState,
    [],
    [],
    Pick<
        NoteStoreState,
        | 'emitNoteCreated'
        | 'emitNoteUpdated'
        | 'emitNoteDeleted'
        | 'emitNoteSelected'
        | 'emitNoteContentChanged'
        | 'emitNoteTitleChanged'
        | 'emitNoteMoved'
        | 'emitFavoriteChanged'
    >
> = () => ({

    /**
     * Emit note created event
     * Called after successful note creation
     */
    emitNoteCreated: (note: any, projectId: string) => {
        emitNoteCreated(note, projectId);
    },

    /**
     * Emit note updated event
     * Called after successful note update
     */
    emitNoteUpdated: (note: any, projectId: string, updates: any) => {
        emitNoteUpdated(note, projectId, updates);
    },

    /**
     * Emit note deleted event
     * Called after successful note deletion
     */
    emitNoteDeleted: (noteId: string, projectId: string) => {
        emitNoteDeleted(noteId, projectId);
    },

    /**
     * Emit note selected event
     * Called when active note changes
     */
    emitNoteSelected: (noteId: string, note?: any) => {
        emitNoteSelected(noteId, note);
    },

    /**
     * Emit note content changed event
     * Called when note blocks or content updates
     */
    emitNoteContentChanged: (noteId: string, projectId: string, content: string) => {
        emitNoteContentChanged(noteId, projectId, content);
    },

    /**
     * Emit note title changed event
     * Called when note title updates
     */
    emitNoteTitleChanged: (noteId: string, projectId: string, oldTitle: string, newTitle: string) => {
        emitNoteTitleChanged(noteId, projectId, oldTitle, newTitle);
    },

    /**
     * Emit note moved event
     * Called when note parent or order changes
     */
    emitNoteMoved: (noteId: string, projectId: string, oldParentId: string | null, newParentId: string | null) => {
        emitNoteMoved(noteId, projectId, oldParentId, newParentId);
    },

    /**
     * Emit note favorite changed event
     * Called when favorite status toggles
     */
    emitFavoriteChanged: (noteId: string, projectId: string, isFavorite: boolean) => {
        emitNoteFavoriteChanged(noteId, projectId, isFavorite);
    },
});

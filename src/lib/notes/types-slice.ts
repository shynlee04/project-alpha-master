/**
 * @fileoverview Note Store State Types
 * @module lib/notes/types-slice
 * @governance EPIC-26-1
 *
 * Shared TypeScript interfaces for note store slices.
 * Extends base types from types.ts with store-specific state.
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { NoteSaveStatus, CreateNoteParams, UpdateNoteParams } from './types';

/**
 * Complete note store state interface
 * Used by all slices for type safety
 */
export interface NoteStoreState {
    // --------------------------------------------------------------------------
    // State
    // --------------------------------------------------------------------------

    /** All notes for current project (Map for O(1) lookups) */
    notes: Map<string, NoteRecord>;

    /** Notes array for rendering (derived from Map, sorted by order) */
    notesArray: NoteRecord[];

    /** Set of note IDs currently being indexed */
    indexingNoteIds: Set<string>;

    /** Currently active note ID (for editing) */
    activeNoteId: string | null;

    /** Current project ID */
    currentProjectId: string | null;

    /** Save status for auto-save indicator */
    saveStatus: NoteSaveStatus;

    /** Dirty state tracking (has unsaved changes) */
    dirtyNoteIds: Set<string>;

    /** Loading state */
    loading: boolean;

    /** Error state */
    error: string | null;

    /** Hydration status (for Zustand persist) */
    _hasHydrated: boolean;

    // --------------------------------------------------------------------------
    // CRUD Actions
    // --------------------------------------------------------------------------

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Load notes for a project */
    loadNotes: (projectId: string) => Promise<void>;

    /** Create a new note */
    createNote: (params?: CreateNoteParams) => Promise<string>;

    /** Update an existing note */
    updateNote: (params: UpdateNoteParams) => Promise<void>;

    /** Delete a note */
    deleteNote: (noteId: string) => Promise<void>;

    // --------------------------------------------------------------------------
    // Metadata Actions
    // --------------------------------------------------------------------------

    /** Toggle favorite status */
    toggleFavorite: (noteId: string) => Promise<void>;

    /** Move note (change parent or order) */
    moveNote: (noteId: string, newParentId: string | null, newOrder: number) => Promise<void>;

    // --------------------------------------------------------------------------
    // Query Actions
    // --------------------------------------------------------------------------

    /** Get notes by parent ID (for tree rendering) */
    getNotesByParent: (parentId: string | null) => NoteRecord[];

    /** Get favorite notes */
    getFavoriteNotes: () => NoteRecord[];

    /** Check if note has unsaved changes */
    isNoteDirty: (noteId: string) => boolean;

    // --------------------------------------------------------------------------
    // Sync Actions
    // --------------------------------------------------------------------------

    /** Manually save note to file */
    saveNoteToFile: (noteId: string) => Promise<void>;

    // --------------------------------------------------------------------------
    // Internal Cross-Slice Communication (Optional Methods)
    // --------------------------------------------------------------------------

    /** Trigger debounced auto-save (called by CRUD slice) */
    triggerAutoSave?: (noteId: string, note: NoteRecord) => Promise<void>;

    /** Trigger background indexing (called by CRUD slice) */
    triggerIndexing?: (noteId: string) => Promise<void>;

    /** Remove from search index (called by CRUD slice) */
    removeFromIndex?: (noteId: string, projectId: string | null) => Promise<void>;

    // --------------------------------------------------------------------------
    // Event Emission (Optional Methods)
    // --------------------------------------------------------------------------

    /** Emit note created event */
    emitNoteCreated?: (note: any, projectId: string) => void;

    /** Emit note updated event */
    emitNoteUpdated?: (note: any, projectId: string, updates: any) => void;

    /** Emit note deleted event */
    emitNoteDeleted?: (noteId: string, projectId: string) => void;

    /** Emit note selected event */
    emitNoteSelected?: (noteId: string, note?: any) => void;

    /** Emit note content changed event */
    emitNoteContentChanged?: (noteId: string, projectId: string, content: string) => void;

    /** Emit note title changed event */
    emitNoteTitleChanged?: (noteId: string, projectId: string, oldTitle: string, newTitle: string) => void;

    /** Emit note moved event */
    emitNoteMoved?: (noteId: string, projectId: string, oldParentId: string | null, newParentId: string | null) => void;

    /** Emit note favorite changed event */
    emitFavoriteChanged?: (noteId: string, projectId: string, isFavorite: boolean) => void;

    // --------------------------------------------------------------------------
    // Reset
    // --------------------------------------------------------------------------

    /** Reset store to initial state */
    reset: () => void;
}

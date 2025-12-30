/**
 * @fileoverview Notes Library Barrel Export
 * @module lib/notes
 * @governance EPIC-26-1
 */

// Types
export type {
    NoteRecord,
    NoteSaveStatus,
    NoteTreeNode,
    NoteEditorState,
    CreateNoteParams,
    UpdateNoteParams,
} from './types';

export {
    generateNoteId,
    extractTitleFromBlocks,
    DEFAULT_NOTE_BLOCKS,
} from './types';

// Store
export {
    useNoteStore,
    useActiveNote,
    useNoteSaveStatus,
    useNotesByParent,
    useFavoriteNotes,
} from './note-store';

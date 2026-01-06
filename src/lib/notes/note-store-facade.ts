/**
 * @fileoverview Note Store Facade (Backward Compatibility)
 * @module lib/notes/note-store-facade
 * @governance EPIC-26-1
 *
 * Facade exports for backward compatibility with existing code.
 * All imports from 'note-store.ts' redirect to 'note-store-refactored.ts'
 *
 * ZERO BREAKING CHANGES - Existing code continues to work without modification.
 *
 * @deprecated Import from 'note-store-refactored.ts' directly in new code
 */

// Re-export everything from refactored store
export {
    useNoteStore,
    useActiveNote,
    useNoteSaveStatus,
    useNotesByParent,
    useFavoriteNotes,
    useIsNoteIndexing,
    registerFileSaveHandler,
    unregisterFileSaveHandler,
    type NoteStoreState,
} from './note-store-refactored';

// Re-export types for convenience
export type { NoteSaveStatus, CreateNoteParams, UpdateNoteParams } from './types';

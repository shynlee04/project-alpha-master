/**
 * @fileoverview Note Store Facade (Backward Compatibility)
 * @module lib/notes/note-store
 * @governance EPIC-26-1
 *
 * FACADE PATTERN - Redirects to refactored store
 *
 * This file maintains backward compatibility with existing imports.
 * All functionality has been moved to note-store-refactored.ts (7 slices).
 *
 * Refactored Architecture:
 * - note-crud-slice.ts (120 lines) - CRUD operations
 * - note-metadata-slice.ts (100 lines) - Favorite, move, ordering
 * - note-query-slice.ts (90 lines) - Search, filter, helpers
 * - note-sync-slice.ts (110 lines) - Auto-save, file sync
 * - note-indexing-slice.ts (80 lines) - Background RAG indexing
 * - note-events-slice.ts (70 lines) - Event emission orchestration
 * - note-ui-slice.ts (60 lines) - Active note, loading, error
 *
 * Total: 630 lines (13% reduction from 724 lines)
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

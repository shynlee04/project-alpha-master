/**
 * @fileoverview Note Event Emitter
 * @module lib/notes/note-event-emitter
 * @governance NR-07: Cross-Workspace Note Access
 *
 * Event bus for note operations enabling cross-workspace communication.
 * Allows Knowledge workspace to list notes and RAG to search across note content.
 */

import EventEmitter from 'eventemitter3';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Event Types
// ============================================================================

export interface NoteEvents {
    // Note Lifecycle Events
    'note:created': [{ note: NoteRecord; projectId: string }];
    'note:updated': [{ note: NoteRecord; projectId: string; changes: Partial<NoteRecord> }];
    'note:deleted': [{ noteId: string; projectId: string; note?: NoteRecord }];
    'note:selected': [{ noteId: string | null; note?: NoteRecord | null }];

    // Note Content Events
    'note:content-changed': [{ noteId: string; projectId: string; content: string }];
    'note:title-changed': [{ noteId: string; projectId: string; oldTitle: string; newTitle: string }];

    // Note Organization Events
    'note:moved': [{ noteId: string; projectId: string; oldParentId: string | null; newParentId: string | null }];
    'note:favorite-changed': [{ noteId: string; projectId: string; isFavorite: boolean }];

    // Note Indexing Events (for RAG)
    'note:indexed': [{ noteId: string; projectId: string; indexedAt: number }];
    'note:indexing-started': [{ noteId: string; projectId: string }];
    'note:indexing-failed': [{ noteId: string; projectId: string; error: string }];

    // Batch Events
    'notes:bulk-created': [{ notes: NoteRecord[]; projectId: string }];
    'notes:bulk-deleted': [{ noteIds: string[]; projectId: string }];

    // Query Events
    'notes:search': [{ query: string; projectId: string; results: NoteRecord[] }];
    'notes:listed': [{ projectId: string; notes: NoteRecord[] }];
}

export type NoteEventEmitter = EventEmitter<NoteEvents>;

// ============================================================================
// Singleton Event Bus
// ============================================================================

let noteEventBus: NoteEventEmitter | null = null;

/**
 * Get or create the singleton note event bus
 */
export function getNoteEventBus(): NoteEventEmitter {
    if (!noteEventBus) {
        noteEventBus = new EventEmitter<NoteEvents>();
    }
    return noteEventBus;
}

/**
 * Reset the event bus (useful for testing)
 */
export function resetNoteEventBus(): void {
    if (noteEventBus) {
        noteEventBus.removeAllListeners();
        noteEventBus = null;
    }
}

// ============================================================================
// Event Publisher Utilities
// ============================================================================

/**
 * Emit note creation event
 */
export function emitNoteCreated(note: NoteRecord, projectId: string): void {
    getNoteEventBus().emit('note:created', { note, projectId });
}

/**
 * Emit note update event
 */
export function emitNoteUpdated(note: NoteRecord, projectId: string, changes: Partial<NoteRecord>): void {
    getNoteEventBus().emit('note:updated', { note, projectId, changes });
}

/**
 * Emit note deletion event
 */
export function emitNoteDeleted(noteId: string, projectId: string, note?: NoteRecord): void {
    getNoteEventBus().emit('note:deleted', { noteId, projectId, note });
}

/**
 * Emit note selection event
 */
export function emitNoteSelected(noteId: string | null, note?: NoteRecord | null): void {
    getNoteEventBus().emit('note:selected', { noteId, note });
}

/**
 * Emit note content change event
 */
export function emitNoteContentChanged(noteId: string, projectId: string, content: string): void {
    getNoteEventBus().emit('note:content-changed', { noteId, projectId, content });
}

/**
 * Emit note title change event
 */
export function emitNoteTitleChanged(
    noteId: string,
    projectId: string,
    oldTitle: string,
    newTitle: string
): void {
    getNoteEventBus().emit('note:title-changed', { noteId, projectId, oldTitle, newTitle });
}

/**
 * Emit note move event
 */
export function emitNoteMoved(
    noteId: string,
    projectId: string,
    oldParentId: string | null,
    newParentId: string | null
): void {
    getNoteEventBus().emit('note:moved', { noteId, projectId, oldParentId, newParentId });
}

/**
 * Emit note favorite change event
 */
export function emitNoteFavoriteChanged(noteId: string, projectId: string, isFavorite: boolean): void {
    getNoteEventBus().emit('note:favorite-changed', { noteId, projectId, isFavorite });
}

/**
 * Emit note indexed event (for RAG integration)
 */
export function emitNoteIndexed(noteId: string, projectId: string, indexedAt: number): void {
    getNoteEventBus().emit('note:indexed', { noteId, projectId, indexedAt });
}

/**
 * Emit note indexing started event
 */
export function emitNoteIndexingStarted(noteId: string, projectId: string): void {
    getNoteEventBus().emit('note:indexing-started', { noteId, projectId });
}

/**
 * Emit note indexing failed event
 */
export function emitNoteIndexingFailed(noteId: string, projectId: string, error: string): void {
    getNoteEventBus().emit('note:indexing-failed', { noteId, projectId, error });
}

/**
 * Emit notes listed event
 */
export function emitNotesListed(projectId: string, notes: NoteRecord[]): void {
    getNoteEventBus().emit('notes:listed', { projectId, notes });
}

// ============================================================================
// Event Listener Hooks
// ============================================================================

import { useEffect, useCallback } from 'react';

/**
 * Hook to subscribe to note events
 */
export function useNoteEvents() {
    const eventBus = getNoteEventBus();

    const onNoteCreated = useCallback(
        (callback: (data: { note: NoteRecord; projectId: string }) => void) => {
            eventBus.on('note:created', callback);
            return () => eventBus.off('note:created', callback);
        },
        [eventBus]
    );

    const onNoteUpdated = useCallback(
        (callback: (data: { note: NoteRecord; projectId: string; changes: Partial<NoteRecord> }) => void) => {
            eventBus.on('note:updated', callback);
            return () => eventBus.off('note:updated', callback);
        },
        [eventBus]
    );

    const onNoteDeleted = useCallback(
        (callback: (data: { noteId: string; projectId: string; note?: NoteRecord }) => void) => {
            eventBus.on('note:deleted', callback);
            return () => eventBus.off('note:deleted', callback);
        },
        [eventBus]
    );

    const onNoteSelected = useCallback(
        (callback: (data: { noteId: string | null; note?: NoteRecord | null }) => void) => {
            eventBus.on('note:selected', callback);
            return () => eventBus.off('note:selected', callback);
        },
        [eventBus]
    );

    const onNoteContentChanged = useCallback(
        (callback: (data: { noteId: string; projectId: string; content: string }) => void) => {
            eventBus.on('note:content-changed', callback);
            return () => eventBus.off('note:content-changed', callback);
        },
        [eventBus]
    );

    const onNoteIndexed = useCallback(
        (callback: (data: { noteId: string; projectId: string; indexedAt: number }) => void) => {
            eventBus.on('note:indexed', callback);
            return () => eventBus.off('note:indexed', callback);
        },
        [eventBus]
    );

    return {
        onNoteCreated,
        onNoteUpdated,
        onNoteDeleted,
        onNoteSelected,
        onNoteContentChanged,
        onNoteIndexed,
    };
}

/**
 * Hook to get all notes for a project (listens to notes:listed event)
 */
export function useNotesListener(projectId: string, callback: (notes: NoteRecord[]) => void) {
    useEffect(() => {
        const eventBus = getNoteEventBus();
        const handler = (data: { projectId: string; notes: NoteRecord[] }) => {
            if (data.projectId === projectId) {
                callback(data.notes);
            }
        };
        eventBus.on('notes:listed', handler);
        return () => {
            eventBus.off('notes:listed', handler);
        };
    }, [projectId, callback]);
}

/**
 * Hook to search notes (listens to notes:search event)
 */
export function useNoteSearch(projectId: string, query: string, callback: (results: NoteRecord[]) => void) {
    useEffect(() => {
        const eventBus = getNoteEventBus();
        const handler = (data: { query: string; projectId: string; results: NoteRecord[] }) => {
            if (data.projectId === projectId && data.query === query) {
                callback(data.results);
            }
        };
        eventBus.on('notes:search', handler);
        return () => {
            eventBus.off('notes:search', handler);
        };
    }, [projectId, query, callback]);
}

/**
 * @fileoverview Context Engine Module
 * @module lib/context
 * @governance EPIC-31-1
 *
 * Exports context engine services for note-aware AI chat.
 */

export {
    buildNoteContext,
    formatContextAsMarkdown,
    getFormattedNoteContext,
    getCurrentNoteContent,
    clearContextCache,
} from './ContextEngine';

export type {
    NoteContext,
    ContextEngineConfig,
} from './ContextEngine';

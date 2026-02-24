/**
 * @fileoverview Note Format Module Index
 * @module lib/notes/format
 */

export {
    formatNoteForStorage,
    parseNoteFromStorage,
    parsedToNoteRecord,
    getNoteFilename,
    extractNoteId,
} from './note-formatter';

export type { NoteFrontmatter, ParsedNote } from './note-formatter';

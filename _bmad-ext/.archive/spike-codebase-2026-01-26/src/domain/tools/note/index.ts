/**
 * @fileoverview Note Tools Barrel Export
 * @module domain/tools/note
 * @governance EPIC-40 MM-04
 *
 * Centralized exports for all note CRUD tools.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

// Tool definitions
export { createNoteDef } from './create-note-tool';
export { readNoteDef } from './read-note-tool';
export { updateNoteDef } from './update-note-tool';
export { deleteNoteDef } from './delete-note-tool';
export { listNotesDef } from './list-notes-tool';

// Server factory functions
export { createCreateNoteServerTool } from './create-note-tool';
export { createReadNoteServerTool } from './read-note-tool';
export { createUpdateNoteServerTool } from './update-note-tool';
export { createDeleteNoteServerTool } from './delete-note-tool';
export { createListNotesServerTool } from './list-notes-tool';

// Client factory functions
export { createCreateNoteClientTool } from './create-note-tool';
export { createReadNoteClientTool } from './read-note-tool';
export { createUpdateNoteClientTool } from './update-note-tool';
export { createDeleteNoteClientTool } from './delete-note-tool';
export { createListNotesClientTool } from './list-notes-tool';

// Types
export type {
  NoteOperationResult,
  NotePaginationParams,
  ListNotesResult,
} from './types';

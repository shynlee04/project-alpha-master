/**
 * @fileoverview Delete Note Tool Definition
 * @module domain/tools/note/delete-note-tool
 * @governance EPIC-40 MM-04
 *
 * TanStack AI tool definition for deleting notes.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
// Note: NoteOperationResult type is defined in ./types but not directly used here
// We use DeleteNoteOutput which matches the tool's outputSchema

/**
 * Delete Note Tool Definition
 *
 * Allows the agent to permanently delete a note.
 */
export const deleteNoteDef = toolDefinition({
  name: 'delete_note',
  description: 'Permanently delete a note by its ID. This action cannot be undone.',
  inputSchema: z.object({
    noteId: z.string().describe('The unique ID of the note to delete'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
    data: z.object({
      deletedNoteId: z.string().describe('The ID of the deleted note'),
      deletedTitle: z.string().describe('The title of the deleted note'),
    }).optional().describe('Information about the deleted note'),
    error: z.string().optional().describe('Error message if operation failed'),
    message: z.string().optional().describe('Human-readable result message'),
  }),
});

/**
 * Server implementation factory for delete_note tool
 */
export function createDeleteNoteServerTool(getNoteStore: () => {
  deleteNote: (noteId: string) => Promise<void>;
  getNoteById: (noteId: string) => any;
}) {
  return deleteNoteDef.server(async ({ noteId }) => {
    try {
      const noteStore = getNoteStore();

      // Get note info before deleting (for confirmation message)
      const note = noteStore.getNoteById(noteId);
      const noteTitle = note?.title || noteId;

      // Delete the note
      await noteStore.deleteNote(noteId);

      return {
        success: true,
        data: {
          deletedNoteId: noteId,
          deletedTitle: noteTitle,
        },
        message: `Successfully deleted note "${noteTitle}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
}

/**
 * Client implementation factory for delete_note tool
 */
export function createDeleteNoteClientTool() {
  return deleteNoteDef.client(async () => {
    throw new Error('delete_note must be executed on the server side');
  });
}

export type DeleteNoteInput = z.infer<typeof deleteNoteDef.inputSchema>;
export type DeleteNoteOutput = z.infer<typeof deleteNoteDef.outputSchema>;

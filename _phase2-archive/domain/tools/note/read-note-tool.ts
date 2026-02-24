/**
 * @fileoverview Read Note Tool Definition
 * @module domain/tools/note/read-note-tool
 * @governance EPIC-40 MM-04
 *
 * TanStack AI tool definition for reading notes.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
// Output type is inferred from ReadNoteOutput (z.infer from the schema)

/**
 * Read Note Tool Definition
 *
 * Allows the agent to read the full content of an existing note.
 */
export const readNoteDef = toolDefinition({
  name: 'read_note',
  description: 'Read the full content of an existing note by its ID.',
  inputSchema: z.object({
    noteId: z.string().describe('The unique ID of the note to read'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
    data: z.object({
      id: z.string().describe('The unique ID of the note'),
      title: z.string().describe('The title of the note'),
      content: z.string().describe('The content of the note'),
      parentId: z.string().nullable().describe('The parent folder ID'),
      createdAt: z.string().describe('ISO timestamp of creation'),
      updatedAt: z.string().describe('ISO timestamp of last update'),
    }).optional().describe('The note data'),
    error: z.string().optional().describe('Error message if operation failed'),
    message: z.string().optional().describe('Human-readable result message'),
  }),
});

/**
 * Server implementation factory for read_note tool
 */
export function createReadNoteServerTool(getNoteStore: () => {
  getNoteById: (noteId: string) => any;
}) {
  return readNoteDef.server(async ({ noteId }) => {
    try {
      const noteStore = getNoteStore();
      const note = noteStore.getNoteById(noteId);

      if (!note) {
        return {
          success: false,
          error: `Note with ID "${noteId}" not found`,
          message: `Note "${noteId}" does not exist`,
        };
      }

      return {
        success: true,
        data: {
          id: note.id,
          title: note.title,
          content: note.content,
          parentId: note.parentId ?? null,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
        message: `Successfully read note "${note.title}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to read note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
}

/**
 * Client implementation factory for read_note tool
 */
export function createReadNoteClientTool() {
  return readNoteDef.client(async () => {
    throw new Error('read_note must be executed on the server side');
  });
}

export type ReadNoteInput = z.infer<typeof readNoteDef.inputSchema>;
export type ReadNoteOutput = z.infer<typeof readNoteDef.outputSchema>;

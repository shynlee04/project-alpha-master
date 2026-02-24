/**
 * @fileoverview Update Note Tool Definition
 * @module domain/tools/note/update-note-tool
 * @governance EPIC-40 MM-04
 *
 * TanStack AI tool definition for updating notes.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
// Note: NoteOperationResult type is defined in ./types but not directly used here
// We use UpdateNoteOutput which matches the tool's outputSchema

/**
 * Update Note Tool Definition
 *
 * Allows the agent to update an existing note's title or content.
 */
export const updateNoteDef = toolDefinition({
  name: 'update_note',
  description: 'Update an existing note. Provide the note ID and at least one field to update (title or content).',
  inputSchema: z.object({
    noteId: z.string().describe('The unique ID of the note to update'),
    title: z.string().optional().describe('New title for the note'),
    content: z.string().optional().describe('New content for the note (markdown supported)'),
  }).refine((data) => data.title !== undefined || data.content !== undefined, {
  message: 'At least one of "title" or "content" must be provided',
}),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
    data: z.object({
      id: z.string().describe('The unique ID of the note'),
      title: z.string().describe('The title of the note'),
      content: z.string().describe('The content of the note'),
      parentId: z.string().nullable().describe('The parent folder ID'),
      updatedAt: z.string().describe('ISO timestamp of update'),
    }).optional().describe('The updated note data'),
    error: z.string().optional().describe('Error message if operation failed'),
    message: z.string().optional().describe('Human-readable result message'),
  }),
});

/**
 * Server implementation factory for update_note tool
 */
export function createUpdateNoteServerTool(getNoteStore: () => {
  updateNote: (params: { noteId: string; title?: string; content?: string }) => Promise<any>;
}) {
  return updateNoteDef.server(async ({ noteId, title, content }) => {
    try {
      const noteStore = getNoteStore();

      // Call note store's updateNote method
      const result = await noteStore.updateNote({
        noteId,
        title,
        content,
      });

      return {
        success: true,
        data: {
          id: result.id,
          title: result.title,
          content: result.content,
          parentId: result.parentId ?? null,
          updatedAt: result.updatedAt,
        },
        message: `Successfully updated note "${title || noteId}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
}

/**
 * Client implementation factory for update_note tool
 */
export function createUpdateNoteClientTool() {
  return updateNoteDef.client(async () => {
    throw new Error('update_note must be executed on the server side');
  });
}

export type UpdateNoteInput = z.infer<typeof updateNoteDef.inputSchema>;
export type UpdateNoteOutput = z.infer<typeof updateNoteDef.outputSchema>;

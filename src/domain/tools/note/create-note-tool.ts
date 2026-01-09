/**
 * @fileoverview Create Note Tool Definition
 * @module domain/tools/note/create-note-tool
 * @governance EPIC-40 MM-04
 *
 * TanStack AI tool definition for creating notes.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { NoteOperationResult } from './types';

/**
 * Create Note Tool Definition
 *
 * Allows the agent to create new notes with title, content,
 * and optional folder assignment.
 */
export const createNoteDef = toolDefinition({
  name: 'create_note',
  description: 'Create a new note with a title and content. Supports markdown formatting.',
  inputSchema: z.object({
    title: z.string().min(1).describe('The title of the note (required)'),
    content: z.string().describe('The content/body of the note (markdown supported)'),
    parentId: z.string().optional().describe('Optional parent folder ID to organize the note'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
    data: z.object({
      id: z.string().describe('The unique ID of the created note'),
      title: z.string().describe('The title of the note'),
      content: z.string().describe('The content of the note'),
      parentId: z.string().nullable().describe('The parent folder ID'),
      createdAt: z.string().describe('ISO timestamp of creation'),
      updatedAt: z.string().describe('ISO timestamp of last update'),
    }).optional().describe('The created note data'),
    error: z.string().optional().describe('Error message if operation failed'),
    message: z.string().optional().describe('Human-readable result message'),
  }),
});

/**
 * Server implementation factory for create_note tool
 *
 * This function creates the server-side implementation that actually
 * performs the note creation using the note store.
 *
 * @param getNoteStore - Factory function to get the note store instance
 * @returns Server tool implementation
 */
export function createCreateNoteServerTool(getNoteStore: () => {
  createNote: (params?: { title?: string; content?: string; parentId?: string }) => Promise<any>;
}) {
  return createNoteDef.server(async ({ title, content, parentId }) => {
    try {
      const noteStore = getNoteStore();

      // Call note store's createNote method
      const result = await noteStore.createNote({
        title: title || '',
        content: content || '',
        parentId: parentId ?? null,
      });

      return {
        success: true,
        data: {
          id: result.id,
          title: result.title,
          content: result.content,
          parentId: result.parentId,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
        message: `Successfully created note "${title}"`,
      } as NoteOperationResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      } as NoteOperationResult;
    }
  });
}

/**
 * Client implementation factory for create_note tool
 *
 * This function creates the client-side implementation.
 * Client tools pass definitions only (no execution).
 *
 * @returns Client tool implementation
 */
export function createCreateNoteClientTool() {
  return createNoteDef.client(async () => {
    // Client-side: definition only, actual execution happens on server
    throw new Error('create_note must be executed on the server side');
  });
}

// Export the definition for type imports
export type CreateNoteInput = z.infer<typeof createNoteDef.inputSchema>;
export type CreateNoteOutput = z.infer<typeof createNoteDef.outputSchema>;

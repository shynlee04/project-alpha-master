/**
 * @fileoverview List Notes Tool Definition
 * @module domain/tools/note/list-notes-tool
 * @governance EPIC-40 MM-04
 *
 * TanStack AI tool definition for listing notes with pagination.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
// Note: ListNotesResult type is defined in ./types but not directly used here

/**
 * List Notes Tool Definition
 *
 * Allows the agent to list notes with pagination and filtering.
 */
export const listNotesDef = toolDefinition({
  name: 'list_notes',
  description: 'List notes with pagination support. Can filter by parent folder and search query.',
  inputSchema: z.object({
    limit: z.number().min(1).max(100).default(20).describe('Maximum number of notes to return (default: 20)'),
    offset: z.number().min(0).default(0).describe('Number of notes to skip for pagination (default: 0)'),
    parentId: z.string().nullable().optional().describe('Filter by parent folder ID (null for root level)'),
    search: z.string().optional().describe('Search query to filter notes by title or content'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
    data: z.object({
      notes: z.array(z.object({
        id: z.string(),
        title: z.string(),
        content: z.string().optional(),
        parentId: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })).describe('Array of notes'),
      total: z.number().describe('Total number of notes matching the filter'),
      offset: z.number().describe('Current pagination offset'),
      limit: z.number().describe('Current pagination limit'),
      hasMore: z.boolean().describe('Whether more notes exist beyond this page'),
    }).optional().describe('The paginated list of notes'),
    error: z.string().optional().describe('Error message if operation failed'),
    message: z.string().optional().describe('Human-readable result message'),
  }),
});

/**
 * Server implementation factory for list_notes tool
 */
export function createListNotesServerTool(getNoteStore: () => {
  notesArray: any[];
  loadNotes: (projectId: string) => Promise<void>;
  currentProjectId: string | null;
}) {
  return listNotesDef.server(async ({ limit = 20, offset = 0, parentId, search }) => {
    try {
      const noteStore = getNoteStore();

      // Get all notes as array
      let notes = [...noteStore.notesArray];

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        notes = notes.filter((note: any) =>
          note.title?.toLowerCase().includes(searchLower) ||
          note.content?.toLowerCase().includes(searchLower)
        );
      }

      // Apply parent filter if provided
      if (parentId !== undefined) {
        notes = notes.filter((note: any) => note.parentId === parentId);
      }

      // Get total count before pagination
      const total = notes.length;

      // Apply pagination
      const paginatedNotes = notes.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          notes: paginatedNotes.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            parentId: note.parentId,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          })),
          total,
          offset,
          limit,
          hasMore: offset + limit < total,
        },
        message: `Found ${total} note(s), showing ${paginatedNotes.length}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to list notes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
}

/**
 * Client implementation factory for list_notes tool
 */
export function createListNotesClientTool() {
  return listNotesDef.client(async () => {
    throw new Error('list_notes must be executed on the server side');
  });
}

export type ListNotesInput = z.infer<typeof listNotesDef.inputSchema>;
export type ListNotesOutput = z.infer<typeof listNotesDef.outputSchema>;

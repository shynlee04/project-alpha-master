/**
 * @fileoverview Search Notes Tool
 * @module lib/agent/tools/search-notes-tool
 * @story 26-3 - Ask My Notes RAG Tool
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import { searchNotes } from '@/lib/notes/note-retriever';
import type { ToolResult } from './types';

/**
 * Search notes tool definition
 */
export const searchNotesDef = toolDefinition({
    name: 'search_notes',
    description: 'Search the user\'s personal notes. Use this to find information, context, or previous ideas saved in the note-taking system. Answers should cite the note title if possible.',
    inputSchema: z.object({
        query: z.string().describe('The search query. Can be keywords or natural language.'),
        limit: z.number().optional().default(5).describe('Maximum number of notes to retrieve. Default is 5.'),
    }),
});

/**
 * Create a client implementation of search_notes tool
 */
export const createSearchNotesClientTool = () => {
    return searchNotesDef.client(async (args: unknown): Promise<ToolResult<string>> => {
        const { query, limit } = args as { query: string; limit: number };

        try {
            console.log(`[SearchNotesTool] Searching for: "${query}" (limit: ${limit})`);
            const results = await searchNotes(query, limit);

            if (results.length === 0) {
                return {
                    success: true,
                    data: `No matching notes found for "${query}".`
                };
            }

            // Format as a clear string for the LLM
            const formattedResults = results.map(note =>
                `[Note: ${note.title}] (Score: ${note.score.toFixed(2)})\n${note.content}`
            ).join('\n\n---\n\n');

            return {
                success: true,
                data: formattedResults
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error searching notes'
            };
        }
    });
};

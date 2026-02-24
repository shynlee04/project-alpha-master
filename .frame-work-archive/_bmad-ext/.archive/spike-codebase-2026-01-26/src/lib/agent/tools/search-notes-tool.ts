/**
 * @fileoverview Search Notes Tool
 * @module lib/agent/tools/search-notes-tool
 * @story 26-3 - Ask My Notes RAG Tool
 * @governance NS-2026-01-07
 *
 * NS-2026-01-07: Enhanced with note context awareness
 * - AI agent now understands current note context
 * - Includes active note info in search results
 * - Provides context-aware responses
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import { searchNotes } from '@/lib/notes/note-retriever';
import { getNoteExecutionContext } from '@/lib/workspace/note-context-tracker';
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
 *
 * NS-2026-01-07: Now includes current note context in search results
 * for AI agent awareness.
 */
export const createSearchNotesClientTool = () => {
    return searchNotesDef.client(async (args: unknown): Promise<ToolResult<string>> => {
        const { query, limit } = args as { query: string; limit: number };

        try {
            console.log(`[SearchNotesTool] Searching for: "${query}" (limit: ${limit})`);

            // NS-2026-01-07: Get current note context for AI awareness
            const noteContext = getNoteExecutionContext();

            // Include current note context in the response
            let contextPrefix = '';
            if (noteContext.hasActiveNote) {
                contextPrefix = `Currently viewing: "${noteContext.title}" (${noteContext.blockCount} blocks, ${noteContext.contentLength} characters)\n\n`;
            }

            const results = await searchNotes(query, limit);

            if (results.length === 0) {
                return {
                    success: true,
                    data: `${contextPrefix}No matching notes found for "${query}".`
                };
            }

            // Format as a clear string for the LLM
            // NS-2026-01-07: Exclude active note from results if it's in search results
            const formattedResults = results
                .filter(note => note.id !== noteContext.noteId) // Don't include current note in search results
                .map(note =>
                    `[Note: ${note.title}] (Score: ${note.score.toFixed(2)})\n${note.content}`
                ).join('\n\n---\n\n');

            return {
                success: true,
                data: contextPrefix + formattedResults
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error searching notes'
            };
        }
    });
};

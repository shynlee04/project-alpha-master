/**
 * @fileoverview Unified Read Tool
 * @module lib/agent/tools/unified/read-tool
 *
 * Universal read operation that works across ALL workspaces.
 * Replaces both read_file (IDE) and read_note (Notes).
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-01 - Unified File Operations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import { detectContentType, type ReadResult, type UnifiedToolContext } from './types';

/**
 * Unified read input schema
 */
export const ReadInputSchema = z.object({
  path: z.string().describe('File path or note ID to read'),
  encoding: z.enum(['utf-8', 'base64']).optional().default('utf-8')
    .describe('Encoding for binary files (default: utf-8)'),
});

export type ReadInput = z.infer<typeof ReadInputSchema>;

/**
 * Unified read tool definition
 */
export const readDef = toolDefinition({
  name: 'read',
  description: `Read content from any file or note. Works across all workspaces:
- In IDE: Reads files from the project directory
- In Notes: Reads note content by ID or path
- In Knowledge: Reads knowledge base entries
Automatically detects content type (code, markdown, json, etc.)`,
  inputSchema: ReadInputSchema,
  needsApproval: false, // Read is safe
});

/**
 * Create unified read tool client implementation
 *
 * @param getContext - Function to get workspace context
 * @returns TanStack AI tool client implementation
 */
export function createUnifiedReadTool(getContext: () => UnifiedToolContext) {
  return readDef.client(async (input: unknown): Promise<ReadResult> => {
    const args = input as ReadInput;
    const context = getContext();

    try {
      // Determine workspace and read accordingly
      if (context.workspaceType === 'ide' && context.fileAdapter) {
        // IDE workspace: Use file adapter
        const content = await context.fileAdapter.readFile(args.path);
        const contentType = detectContentType(args.path);

        return {
          success: true,
          content,
          metadata: {
            path: args.path,
            name: args.path.split('/').pop() || args.path,
            extension: args.path.split('.').pop(),
            contentType,
          },
        };
      } else if (context.workspaceType === 'notes' && context.noteService) {
        // Notes workspace: Use note service
        const note = await context.noteService.getNote(args.path);

        if (!note) {
          return {
            success: false,
            error: `Note not found: ${args.path}`,
          };
        }

        return {
          success: true,
          content: note.content,
          metadata: {
            path: note.id,
            name: note.title,
            contentType: 'markdown',
          },
        };
      } else {
        // Fallback for unsupported workspace or missing adapter
        return {
          success: false,
          error: `Read not available in ${context.workspaceType} workspace`,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown read error';
      console.error('[UnifiedReadTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}

/**
 * @fileoverview Unified Write Tool
 * @module lib/agent/tools/unified/write-tool
 *
 * Universal write operation that works across ALL workspaces.
 * Replaces both write_file (IDE) and create_note/update_note (Notes).
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-01 - Unified File Operations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import { detectContentType, type WriteResult, type UnifiedToolContext } from './types';

/**
 * Unified write input schema
 */
export const WriteInputSchema = z.object({
  path: z.string().describe('File path or note ID to write to'),
  content: z.string().describe('Content to write'),
  title: z.string().optional().describe('Title for notes (optional)'),
  parentId: z.string().optional().describe('Parent folder/note ID (optional)'),
  createIfMissing: z.boolean().optional().default(true)
    .describe('Create file/note if it does not exist'),
});

export type WriteInput = z.infer<typeof WriteInputSchema>;

/**
 * Unified write tool definition
 */
export const writeDef = toolDefinition({
  name: 'write',
  description: `Write content to any file or note. Works across all workspaces:
- In IDE: Writes files to the project directory
- In Notes: Creates or updates note content
- In Knowledge: Creates knowledge base entries
Automatically creates parent directories if needed.`,
  inputSchema: WriteInputSchema,
  needsApproval: true, // Write requires approval
});

/**
 * Create unified write tool client implementation
 *
 * @param getContext - Function to get workspace context
 * @returns TanStack AI tool client implementation
 */
export function createUnifiedWriteTool(getContext: () => UnifiedToolContext) {
  return writeDef.client(async (input: unknown): Promise<WriteResult> => {
    const args = input as WriteInput;
    const context = getContext();

    try {
      // Determine workspace and write accordingly
      if (context.workspaceType === 'ide' && context.fileAdapter) {
        // IDE workspace: Use file adapter
        await context.fileAdapter.writeFile(args.path, args.content);
        const contentType = detectContentType(args.path);

        return {
          success: true,
          path: args.path,
          metadata: {
            path: args.path,
            name: args.path.split('/').pop() || args.path,
            extension: args.path.split('.').pop(),
            contentType,
          },
        };
      } else if (context.workspaceType === 'notes' && context.noteService) {
        // Notes workspace: Use note service
        // Check if note exists
        const existingNote = await context.noteService.getNote(args.path);

        if (existingNote) {
          // Update existing note
          await context.noteService.updateNote(args.path, {
            title: args.title,
            content: args.content,
          });

          return {
            success: true,
            path: args.path,
            metadata: {
              path: args.path,
              name: args.title || existingNote.title,
              contentType: 'markdown',
            },
          };
        } else if (args.createIfMissing) {
          // Create new note
          const title = args.title || args.path.split('/').pop() || 'Untitled';
          const result = await context.noteService.createNote(title, args.content, args.parentId);

          return {
            success: true,
            path: result.id,
            metadata: {
              path: result.id,
              name: title,
              contentType: 'markdown',
            },
          };
        } else {
          return {
            success: false,
            error: `Note not found: ${args.path}`,
          };
        }
      } else {
        // Fallback for unsupported workspace or missing adapter
        return {
          success: false,
          error: `Write not available in ${context.workspaceType} workspace`,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown write error';
      console.error('[UnifiedWriteTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}

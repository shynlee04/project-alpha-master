/**
 * @fileoverview Unified Delete Tool
 * @module lib/agent/tools/unified/delete-tool
 *
 * Universal delete operation that works across ALL workspaces.
 * Previously missing delete_file in IDE, now unified.
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-01 - Unified File Operations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { DeleteResult, UnifiedToolContext } from './types';

/**
 * Unified delete input schema
 */
export const DeleteInputSchema = z.object({
  path: z.string().describe('File path or note ID to delete'),
  recursive: z.boolean().optional().default(false)
    .describe('Delete directory recursively (for folders)'),
});

export type DeleteInput = z.infer<typeof DeleteInputSchema>;

/**
 * Unified delete tool definition
 */
export const deleteDef = toolDefinition({
  name: 'delete',
  description: `Delete a file or note. Works across all workspaces:
- In IDE: Deletes files or directories from the project
- In Notes: Deletes notes (moves to trash or permanent delete)
- In Knowledge: Removes knowledge base entries
Use with caution - this action may be irreversible.`,
  inputSchema: DeleteInputSchema,
  needsApproval: true, // Delete requires approval (high risk)
});

/**
 * Create unified delete tool client implementation
 *
 * @param getContext - Function to get workspace context
 * @returns TanStack AI tool client implementation
 */
export function createUnifiedDeleteTool(getContext: () => UnifiedToolContext) {
  return deleteDef.client(async (input: unknown): Promise<DeleteResult> => {
    const args = input as DeleteInput;
    const context = getContext();

    try {
      // Determine workspace and delete accordingly
      if (context.workspaceType === 'ide' && context.fileAdapter) {
        // IDE workspace: Use file adapter
        await context.fileAdapter.deleteFile(args.path);

        return {
          success: true,
          path: args.path,
        };
      } else if (context.workspaceType === 'notes' && context.noteService) {
        // Notes workspace: Use note service
        await context.noteService.deleteNote(args.path);

        return {
          success: true,
          path: args.path,
        };
      } else {
        // Fallback for unsupported workspace or missing adapter
        return {
          success: false,
          error: `Delete not available in ${context.workspaceType} workspace`,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      console.error('[UnifiedDeleteTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}

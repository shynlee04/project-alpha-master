/**
 * @fileoverview Unified List Tool
 * @module lib/agent/tools/unified/list-tool
 *
 * Universal list operation that works across ALL workspaces.
 * Replaces both list_files (IDE) and list_notes (Notes).
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-01 - Unified File Operations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import { detectContentType, type ListResult, type UnifiedToolContext } from './types';

/**
 * Unified list input schema
 */
export const ListInputSchema = z.object({
  path: z.string().optional().default('/')
    .describe('Directory path or parent note ID (default: root)'),
  pattern: z.string().optional()
    .describe('Glob pattern to filter files (e.g., "*.ts", "**/*.md")'),
  recursive: z.boolean().optional().default(false)
    .describe('List files recursively'),
  includeHidden: z.boolean().optional().default(false)
    .describe('Include hidden files (starting with .)'),
});

export type ListInput = z.infer<typeof ListInputSchema>;

/**
 * Unified list tool definition
 */
export const listDef = toolDefinition({
  name: 'list',
  description: `List files or notes in a directory. Works across all workspaces:
- In IDE: Lists files and folders in project directory
- In Notes: Lists notes in a folder/parent
- In Knowledge: Lists knowledge base entries
Supports filtering by pattern and recursive listing.`,
  inputSchema: ListInputSchema,
  needsApproval: false, // List is safe
});

/**
 * Create unified list tool client implementation
 *
 * @param getContext - Function to get workspace context
 * @returns TanStack AI tool client implementation
 */
export function createUnifiedListTool(getContext: () => UnifiedToolContext) {
  return listDef.client(async (input: unknown): Promise<ListResult> => {
    const args = input as ListInput;
    const context = getContext();

    try {
      // Determine workspace and list accordingly
      if (context.workspaceType === 'ide' && context.fileAdapter) {
        // IDE workspace: Use file adapter
        const files = await context.fileAdapter.listFiles(args.path || '/', args.recursive);

        // Filter by pattern if provided
        let filteredFiles = files;
        if (args.pattern) {
          const patternRegex = new RegExp(
            args.pattern
              .replace(/\*\*/g, '.*')
              .replace(/\*/g, '[^/]*')
              .replace(/\?/g, '.')
          );
          filteredFiles = files.filter((f) => patternRegex.test(f));
        }

        // Filter hidden files unless requested
        if (!args.includeHidden) {
          filteredFiles = filteredFiles.filter((f) => !f.split('/').pop()?.startsWith('.'));
        }

        return {
          success: true,
          files: filteredFiles.map((path) => ({
            path,
            name: path.split('/').pop() || path,
            isDirectory: !path.includes('.'), // Simple heuristic
            contentType: detectContentType(path),
          })),
        };
      } else if (context.workspaceType === 'notes' && context.noteService) {
        // Notes workspace: Use note service
        const notes = await context.noteService.listNotes(args.path || undefined);

        return {
          success: true,
          files: notes.map((note) => ({
            path: note.id,
            name: note.title,
            isDirectory: false, // Notes are not directories
            contentType: 'markdown' as const,
          })),
        };
      } else {
        // Fallback for unsupported workspace or missing adapter
        return {
          success: false,
          error: `List not available in ${context.workspaceType} workspace`,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown list error';
      console.error('[UnifiedListTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}

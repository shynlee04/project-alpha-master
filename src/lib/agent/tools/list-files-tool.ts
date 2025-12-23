/**
 * @fileoverview List Files Tool
 * @module lib/agent/tools/list-files-tool
 * 
 * TanStack AI tool for listing directory contents.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { toolDefinition } from '@tanstack/ai';
import { ListFilesInputSchema, type ListFilesOutput, type FileEntry, type ToolResult } from './types';
import type { AgentFileTools } from '../facades';

/**
 * List files tool definition
 */
export const listFilesDef = toolDefinition({
    name: 'list_files',
    description: 'List files and directories in a path. Use this to explore the project structure.',
    inputSchema: ListFilesInputSchema,
});

/**
 * Create a server implementation of list_files tool
 * @param getTools - Function to get the file tools facade
 */
export function createListFilesTool(getTools: () => AgentFileTools) {
    return listFilesDef.server(async (args: unknown): Promise<ToolResult<ListFilesOutput>> => {
        const { path, recursive } = args as { path: string; recursive?: boolean };
        try {
            // Uses listDirectory from AgentFileTools interface
            const rawEntries = await getTools().listDirectory(path, recursive);

            // Transform to FileEntry format
            const entries: FileEntry[] = rawEntries.map((entry) => ({
                name: entry.name,
                path: `${path}/${entry.name}`.replace(/\/+/g, '/'),
                type: entry.kind === 'directory' ? 'directory' : 'file',
            }));

            // Sort: directories first, then files, alphabetically
            entries.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

            return {
                success: true,
                data: {
                    path,
                    entries,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list files',
            };
        }
    });
}

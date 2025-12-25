/**
 * @fileoverview Write File Tool
 * @module lib/agent/tools/write-file-tool
 * 
 * TanStack AI tool for writing file content.
 * Marked with needsApproval for Story 25-5 approval flow.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { toolDefinition } from '@tanstack/ai';
import { WriteFileInputSchema, type WriteFileOutput, type ToolResult } from './types';
import type { AgentFileTools } from '../facades';

/**
 * Write file tool definition
 * Note: This tool has needsApproval flag for approval overlay integration
 * @story 25-5 - Implement Approval Flow
 */
export const writeFileDef = toolDefinition({
    name: 'write_file',
    description: 'Write content to a file. Creates the file if it does not exist, overwrites if it does. This action requires user approval.',
    inputSchema: WriteFileInputSchema,
    needsApproval: true, // Requires user approval before execution (Story 25-5)
});

/**
 * Metadata indicating this tool requires approval
 */
export const writeFileToolConfig = {
    needsApproval: true,
    timeout: 30000, // 30 second timeout
};

/**
 * Create a server implementation of write_file tool
 * @param getTools - Function to get the file tools facade
 */
export function createWriteFileTool(getTools: () => AgentFileTools) {
    return writeFileDef.server(async (args: unknown): Promise<ToolResult<WriteFileOutput>> => {
        const { path, content } = args as { path: string; content: string };
        try {
            await getTools().writeFile(path, content);

            return {
                success: true,
                data: {
                    path,
                    bytesWritten: content.length,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to write file',
            };
        }
    });
}

/**
 * Create a client implementation of write_file tool
 * Uses TanStack AI .client() pattern for browser-side execution
 * 
 * @param getTools - Function to get the file tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function createWriteFileClientTool(getTools: () => AgentFileTools) {
    return writeFileDef.client(async (input: unknown): Promise<ToolResult<WriteFileOutput>> => {
        const args = input as { path: string; content: string };
        // Normalize path: remove leading slashes, fix separators
        const normalizedPath = args.path
            .replace(/\\/g, '/')      // Windows backslashes
            .replace(/^\/+/, '')      // Leading slashes
            .replace(/^\.\//, '');    // Leading ./

        try {
            await getTools().writeFile(normalizedPath, args.content);

            return {
                success: true,
                data: {
                    path: normalizedPath,
                    bytesWritten: args.content.length,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to write file',
            };
        }
    });
}


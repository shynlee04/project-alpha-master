/**
 * @fileoverview Read File Tool
 * @module lib/agent/tools/read-file-tool
 * 
 * TanStack AI tool for reading file content.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { toolDefinition } from '@tanstack/ai';
import { ReadFileInputSchema, type ReadFileOutput, type ToolResult } from './types';
import type { AgentFileTools } from '../facades';

/**
 * Read file tool definition
 */
export const readFileDef = toolDefinition({
    name: 'read_file',
    description: 'Read the content of a file. Use this to understand existing code or configuration.',
    inputSchema: ReadFileInputSchema,
});

/**
 * Create a server implementation of read_file tool
 * @param getTools - Function to get the file tools facade (allows lazy initialization)
 */
export function createReadFileTool(getTools: () => AgentFileTools) {
    return readFileDef.server(async (args: unknown): Promise<ToolResult<ReadFileOutput>> => {
        const { path } = args as { path: string };
        try {
            const content = await getTools().readFile(path);

            if (content === null) {
                return {
                    success: false,
                    error: `File not found: ${path}`,
                };
            }

            // Detect binary content (simple heuristic)
            const isBinary = content.includes('\0') || !/^[\x00-\x7F]*$/.test(content.substring(0, 1000));

            if (isBinary) {
                // Convert to base64 for binary files
                const encoder = new TextEncoder();
                const bytes = encoder.encode(content);
                const base64 = btoa(String.fromCharCode(...bytes));

                return {
                    success: true,
                    data: {
                        content: base64,
                        encoding: 'base64',
                        size: bytes.length,
                    },
                };
            }

            return {
                success: true,
                data: {
                    content,
                    encoding: 'utf-8',
                    size: content.length,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to read file',
            };
        }
    });
}

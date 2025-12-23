/**
 * @fileoverview AI Agent Tools - Public Exports
 * @module lib/agent/tools
 * 
 * Exports TanStack AI tool definitions for file operations.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

// Types
export * from './types';

// Tool definitions (for passing to chat)
export { readFileDef, createReadFileTool } from './read-file-tool';
export { writeFileDef, writeFileToolConfig, createWriteFileTool } from './write-file-tool';
export { listFilesDef, createListFilesTool } from './list-files-tool';

// Re-export AgentFileTools for convenience
export type { AgentFileTools } from '../facades';

/**
 * Create all file tools with a shared facade provider
 */
export function createFileTools(getTools: () => import('../facades').AgentFileTools) {
    const { createReadFileTool } = require('./read-file-tool');
    const { createWriteFileTool } = require('./write-file-tool');
    const { createListFilesTool } = require('./list-files-tool');

    return {
        readFile: createReadFileTool(getTools),
        writeFile: createWriteFileTool(getTools),
        listFiles: createListFilesTool(getTools),
    };
}

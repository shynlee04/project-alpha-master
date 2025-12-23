/**
 * @fileoverview AI Agent Tools - Public Exports
 * @module lib/agent/tools
 * 
 * Exports TanStack AI tool definitions for file and terminal operations.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 * @story 25-3 - Implement Terminal Tools
 */

// Types
export * from './types';

// File tool definitions (Story 25-2)
export { readFileDef, createReadFileTool } from './read-file-tool';
export { writeFileDef, writeFileToolConfig, createWriteFileTool } from './write-file-tool';
export { listFilesDef, createListFilesTool } from './list-files-tool';

// Terminal tool definitions (Story 25-3)
export { executeCommandDef, executeCommandToolConfig, createExecuteCommandTool } from './execute-command-tool';

// Re-export facades for convenience
export type { AgentFileTools, AgentTerminalTools } from '../facades';

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

/**
 * Create all terminal tools with a shared facade provider
 */
export function createTerminalTools(getTools: () => import('../facades').AgentTerminalTools) {
    const { createExecuteCommandTool } = require('./execute-command-tool');

    return {
        executeCommand: createExecuteCommandTool(getTools),
    };
}


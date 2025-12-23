/**
 * @fileoverview AI Agent Tools - Public Exports
 * @module lib/agent/tools
 * 
 * Exports TanStack AI tool definitions for file and terminal operations.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 * @story 25-3 - Implement Terminal Tools
 * @story 25-4 - Wire Tool Execution to UI
 */

// Types
export * from './types';

// File tool definitions (Story 25-2)
export { readFileDef, createReadFileTool, createReadFileClientTool } from './read-file-tool';
export { writeFileDef, writeFileToolConfig, createWriteFileTool, createWriteFileClientTool } from './write-file-tool';
export { listFilesDef, createListFilesTool, createListFilesClientTool } from './list-files-tool';

// Terminal tool definitions (Story 25-3)
export { executeCommandDef, executeCommandToolConfig, createExecuteCommandTool, createExecuteCommandClientTool } from './execute-command-tool';

// Re-export facades for convenience
export type { AgentFileTools, AgentTerminalTools } from '../facades';

/**
 * Create all file tools with a shared facade provider (server-side)
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
 * Create all terminal tools with a shared facade provider (server-side)
 */
export function createTerminalTools(getTools: () => import('../facades').AgentTerminalTools) {
    const { createExecuteCommandTool } = require('./execute-command-tool');

    return {
        executeCommand: createExecuteCommandTool(getTools),
    };
}

/**
 * Create all client-side file tools with a shared facade provider
 * Uses TanStack AI .client() pattern for browser execution
 * 
 * @param getTools - Function to get the file tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function createFileClientTools(getTools: () => import('../facades').AgentFileTools) {
    const { createReadFileClientTool } = require('./read-file-tool');
    const { createWriteFileClientTool } = require('./write-file-tool');
    const { createListFilesClientTool } = require('./list-files-tool');

    return {
        readFile: createReadFileClientTool(getTools),
        writeFile: createWriteFileClientTool(getTools),
        listFiles: createListFilesClientTool(getTools),
    };
}

/**
 * Create all client-side terminal tools with a shared facade provider
 * Uses TanStack AI .client() pattern for browser execution
 * 
 * @param getTools - Function to get the terminal tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function createTerminalClientTools(getTools: () => import('../facades').AgentTerminalTools) {
    const { createExecuteCommandClientTool } = require('./execute-command-tool');

    return {
        executeCommand: createExecuteCommandClientTool(getTools),
    };
}

/**
 * Returns an array of all client-side tools for use with TanStack AI chat
 * 
 * @param fileTools - Function to get file tools facade
 * @param terminalTools - Function to get terminal tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function getClientTools(
    fileTools: () => import('../facades').AgentFileTools,
    terminalTools: () => import('../facades').AgentTerminalTools
) {
    const ft = createFileClientTools(fileTools);
    const tt = createTerminalClientTools(terminalTools);

    return [
        ft.readFile,
        ft.writeFile,
        ft.listFiles,
        tt.executeCommand,
    ];
}


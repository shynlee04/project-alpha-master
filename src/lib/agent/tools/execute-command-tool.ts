/**
 * @fileoverview Execute Command Tool
 * @module lib/agent/tools/execute-command-tool
 * 
 * TanStack AI tool for executing terminal commands.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-3 - Implement Terminal Tools
 */

import { toolDefinition } from '@tanstack/ai';
import { ExecuteCommandInputSchema, type ExecuteCommandOutput, type ToolResult } from './types';
import type { AgentTerminalTools } from '../facades';

/** Default timeout: 2 minutes per master plan */
const DEFAULT_TIMEOUT = 120000;

/**
 * Execute command tool definition
 */
export const executeCommandDef = toolDefinition({
    name: 'execute_command',
    description: 'Execute a terminal command and return the output. Use this to run scripts, install packages, or verify code changes.',
    inputSchema: ExecuteCommandInputSchema,
});

/**
 * Configuration for execute_command tool
 */
export const executeCommandToolConfig = {
    needsApproval: false, // Regular commands don't need approval
    timeout: DEFAULT_TIMEOUT,
};

/**
 * Create a server implementation of execute_command tool
 * @param getTools - Function to get the terminal tools facade
 */
export function createExecuteCommandTool(getTools: () => AgentTerminalTools) {
    return executeCommandDef.server(async (args: unknown): Promise<ToolResult<ExecuteCommandOutput>> => {
        const { command, args: cmdArgs, timeout, cwd } = args as {
            command: string;
            args?: string[];
            timeout?: number;
            cwd?: string;
        };

        try {
            const result = await getTools().executeCommand(
                command,
                cmdArgs ?? [],
                {
                    timeout: timeout ?? DEFAULT_TIMEOUT,
                    cwd,
                }
            );

            return {
                success: result.exitCode === 0,
                data: {
                    stdout: result.stdout,
                    exitCode: result.exitCode,
                    pid: result.pid,
                },
                error: result.exitCode !== 0
                    ? `Command exited with code ${result.exitCode}`
                    : undefined,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to execute command',
            };
        }
    });
}

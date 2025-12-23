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
 * Marked with needsApproval for security (can run arbitrary shell commands)
 * @story 25-5 - Implement Approval Flow
 */
export const executeCommandDef = toolDefinition({
    name: 'execute_command',
    description: 'Execute a terminal command and return the output. Use this to run scripts, install packages, or verify code changes.',
    inputSchema: ExecuteCommandInputSchema,
    needsApproval: true, // Requires user approval - HIGH RISK (Story 25-5)
});

/**
 * Configuration for execute_command tool
 */
export const executeCommandToolConfig = {
    needsApproval: true, // Sync with toolDefinition
    riskLevel: 'high' as const, // High risk - can run any shell command
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

/**
 * Create a client implementation of execute_command tool
 * Uses TanStack AI .client() pattern for browser-side execution
 * 
 * @param getTools - Function to get the terminal tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function createExecuteCommandClientTool(getTools: () => AgentTerminalTools) {
    return executeCommandDef.client(async (input: unknown): Promise<ToolResult<ExecuteCommandOutput>> => {
        const args = input as {
            command: string;
            args?: string[];
            timeout?: number;
            cwd?: string;
        };
        try {
            const result = await getTools().executeCommand(
                args.command,
                args.args ?? [],
                {
                    timeout: args.timeout ?? DEFAULT_TIMEOUT,
                    cwd: args.cwd,
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


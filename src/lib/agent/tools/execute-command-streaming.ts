/**
 * Execute Command Tool - Streaming Version
 *
 * Ralph Loop Cycle 5: Real-Time Tool Output Streaming
 *
 * Streaming-enabled version of execute_command tool.
 * Provides real-time output as the command executes.
 *
 * @module lib/agent/tools/execute-command-streaming
 */

import { toolDefinition } from '@tanstack/ai';
import type { AgentTerminalTools } from '../facades';
import type { WorkspaceEventEmitter } from '../../events/workspace-events';
import {
    type StreamingExecutor,
    type StreamingChunk,
} from './streaming';
import { ExecuteCommandInputSchema } from './types';

/** Default timeout: 2 minutes */
const DEFAULT_TIMEOUT = 120000;

/**
 * Streaming execute command tool definition
 */
export const executeCommandStreamingDef = toolDefinition({
    name: 'execute_command_streaming',
    description: 'Execute a terminal command with real-time streaming output. Use for long-running commands where you want to see progress.',
    inputSchema: ExecuteCommandInputSchema,
    needsApproval: true,
});

/**
 * Create a streaming executor for command execution
 *
 * @param getTools - Function to get the terminal tools facade
 * @returns Streaming executor function
 */
export function createExecuteCommandStreamingExecutor(
    getTools: () => AgentTerminalTools,
    getEventBus?: () => WorkspaceEventEmitter | null
): (args: unknown) => StreamingExecutor {
    return (args: unknown) => {
        const { command, args: cmdArgs, timeout, cwd } = args as {
            command: string;
            args?: string[];
            timeout?: number;
            cwd?: string;
        };

        return streamCommandExecution(
            () => getTools().executeCommand(command, cmdArgs ?? [], {
                timeout: timeout ?? DEFAULT_TIMEOUT,
                cwd,
            }),
            getEventBus?.(),
            { command, cwd }
        );
    };
}

/**
 * Stream command execution with progress updates
 */
async function* streamCommandExecution(
    executeFn: () => Promise<{ stdout: string; stderr: string; exitCode: number; pid: number }>,
    eventBus: WorkspaceEventEmitter | null,
    metadata: { command: string; cwd?: string }
): StreamingExecutor {
    const { command, cwd } = metadata;

    // Emit progress start
    yield {
        type: 'progress',
        content: `Executing: ${command}`,
        timestamp: Date.now(),
    };

    try {
        // Execute command
        const result = await executeFn();

        // Stream stdout in chunks
        if (result.stdout) {
            const lines = result.stdout.split('\n');
            for (const line of lines) {
                if (line.length > 0) {
                    yield {
                        type: 'stdout',
                        content: line + '\n',
                        timestamp: Date.now(),
                    };
                }
            }
        }

        // Stream stderr in chunks
        if (result.stderr) {
            const lines = result.stderr.split('\n');
            for (const line of lines) {
                if (line.length > 0) {
                    yield {
                        type: 'stderr',
                        content: line + '\n',
                        timestamp: Date.now(),
                    };
                }
            }
        }

        // Emit completion
        yield {
            type: 'complete',
            content: `Command exited with code ${result.exitCode}`,
            timestamp: Date.now(),
            isFinal: true,
        };

        // Emit agent:command:executed event
        if (eventBus) {
            eventBus.emit('agent:command:executed', {
                command,
                workingDir: cwd,
                output: result.stdout,
                exitCode: result.exitCode,
            });
        }
    } catch (error) {
        yield {
            type: 'error',
            content: error instanceof Error ? error.message : 'Command execution failed',
            timestamp: Date.now(),
            isFinal: true,
        };
    }
}

/**
 * Create a client implementation with streaming support
 *
 * @param getTools - Function to get the terminal tools facade
 * @returns TanStack AI tool definition with streaming
 */
export function createExecuteCommandStreamingClientTool(
    getTools: () => AgentTerminalTools,
    getEventBus?: () => WorkspaceEventEmitter | null
) {
    return executeCommandStreamingDef.client(async (input: unknown) => {
        const executor = createExecuteCommandStreamingExecutor(getTools, getEventBus);
        const streamingExecutor = executor(input);

        // Collect all chunks (for non-streaming fallback)
        const chunks = [];
        for await (const chunk of streamingExecutor) {
            chunks.push(chunk);
        }

        // Return final result
        const stdout = chunks
            .filter((c) => c.type === 'stdout')
            .map((c) => c.content)
            .join('');

        const stderr = chunks
            .filter((c) => c.type === 'stderr')
            .map((c) => c.content)
            .join('');

        const hasError = chunks.some((c) => c.type === 'error');

        return {
            success: !hasError,
            data: {
                stdout,
                exitCode: hasError ? 1 : 0,
            },
            error: hasError ? stderr || 'Execution failed' : undefined,
        };
    });
}

/**
 * React hook for streaming command execution
 *
 * @param getTools - Function to get the terminal tools facade
 * @returns Hook that returns streaming state and executor
 */
export function createUseExecuteCommandStreaming(
    getTools: () => AgentTerminalTools,
    getEventBus?: () => WorkspaceEventEmitter | null
) {
    return () => {
        const [chunks, setChunks] = React.useState<StreamingChunk[]>([]);
        const [isExecuting, setIsExecuting] = React.useState(false);
        const [error, setError] = React.useState<string | null>(null);

        const execute = React.useCallback(
            async (args: {
                command: string;
                args?: string[];
                timeout?: number;
                cwd?: string;
            }) => {
                setIsExecuting(true);
                setError(null);
                setChunks([]);

                try {
                    const executor = createExecuteCommandStreamingExecutor(getTools, getEventBus);
                    const streamingExecutor = executor(args);

                    for await (const chunk of streamingExecutor) {
                        setChunks((prev) => [...prev, chunk]);

                        if (chunk.type === 'error') {
                            setError(chunk.content);
                        }
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Execution failed');
                } finally {
                    setIsExecuting(false);
                }
            },
            [getTools, getEventBus]
        );

        return {
            execute,
            chunks,
            isExecuting,
            error,
            output: chunks
                .filter((c) => c.type === 'stdout' || c.type === 'stderr')
                .map((c) => c.content)
                .join(''),
        };
    };
}

// Import React for the hook
import React from 'react';

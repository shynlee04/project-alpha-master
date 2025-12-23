/**
 * @fileoverview Agent Terminal Tools Interface
 * @module lib/agent/facades/terminal-tools
 * 
 * Defines the stable contract for AI agent terminal/command operations.
 * This interface decouples agent tools from the underlying WebContainer spawn.
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-2 - Create AgentTerminalTools Facade
 */

/**
 * Options for command execution
 */
export interface CommandOptions {
    /** Timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Working directory relative to container root */
    cwd?: string;
}

/**
 * Result of a command execution
 */
export interface CommandResult {
    /** Combined stdout output */
    stdout: string;
    /** Exit code (0 = success) */
    exitCode: number;
    /** Process ID for tracking */
    pid: string;
}

/**
 * Shell session for interactive terminal
 */
export interface ShellSession {
    /** Unique session ID */
    pid: string;
    /** Write data to shell stdin */
    write(data: string): void;
    /** Kill the shell process */
    kill(): void;
    /** Check if shell is running */
    isRunning(): boolean;
}

/**
 * Agent Terminal Tools Interface
 * 
 * Stable contract for AI agent command execution.
 * Implementation wraps WebContainer manager spawn() with event emission.
 */
export interface AgentTerminalTools {
    /**
     * Execute a command and wait for completion
     * @param command - Command to run (e.g., 'npm', 'node', 'cat')
     * @param args - Command arguments
     * @param options - Execution options (timeout, cwd)
     * @returns Command result with stdout and exit code
     * @emits process:started when command begins
     * @emits process:output for each stdout chunk
     * @emits process:exited when command completes
     */
    executeCommand(
        command: string,
        args?: string[],
        options?: CommandOptions
    ): Promise<CommandResult>;

    /**
     * Start an interactive shell session
     * @param projectPath - Optional working directory
     * @returns Shell session for interactive use
     * @emits process:started when shell starts
     */
    startShell(projectPath?: string): Promise<ShellSession>;

    /**
     * Kill a running process
     * @param pid - Process ID to kill
     * @emits process:exited with exitCode -1 (killed)
     */
    killProcess(pid: string): Promise<void>;

    /**
     * Check if a process is currently running
     * @param pid - Process ID to check
     */
    isRunning(pid: string): boolean;
}

/**
 * Error thrown when terminal operations fail
 */
export class TerminalToolsError extends Error {
    public readonly code: 'NOT_BOOTED' | 'TIMEOUT' | 'PROCESS_NOT_FOUND' | 'SPAWN_FAILED';

    constructor(message: string, code: TerminalToolsError['code']) {
        super(message);
        this.name = 'TerminalToolsError';
        this.code = code;
    }
}

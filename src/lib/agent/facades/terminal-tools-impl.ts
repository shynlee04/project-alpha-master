/**
 * @fileoverview Agent Terminal Tools Implementation
 * @module lib/agent/facades/terminal-tools-impl
 *
 * Facade implementation wrapping WebContainer spawn() for AI agent command execution.
 * Emits process lifecycle events for UI integration.
 * Includes command injection protection via CommandSanitizer.
 * Includes permission checks via ToolPermissionManager.
 *
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-2 - Create AgentTerminalTools Facade
 * @fix RC-028-001 - Wire ToolPermissionManager to execution layer
 */

import { spawn, isBooted } from '../../webcontainer/manager';
import type { WorkspaceEventEmitter } from '../../events';
import type {
    AgentTerminalTools,
    CommandOptions,
    CommandResult,
    ShellSession,
} from './terminal-tools';
import { TerminalToolsError } from './terminal-tools';
import { createDefaultSanitizer } from './command-sanitizer';
import { ToolPermissionManager, PermissionCheckResult } from '../tool-permission-manager';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

// Command execution timeout (30 seconds)
const DEFAULT_TIMEOUT = 30000;

// Shell session timeout settings
const SHELL_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const SHELL_WARNING_TIME = 25 * 60 * 1000; // 25 minutes (warning threshold)

/**
 * Error thrown when tool execution is blocked by permission settings
 */
export class ToolPermissionDeniedError extends Error {
    constructor(
        message: string,
        public readonly toolName: string,
        public readonly reason: PermissionCheckResult['reason']
    ) {
        super(message);
        this.name = 'ToolPermissionDeniedError';
    }
}

/**
 * TerminalToolsFacade - Wraps WebContainer for agent command execution
 * Includes command injection protection and permission checks
 */
export class TerminalToolsFacade implements AgentTerminalTools {
    private processes = new Map<string, { kill: () => void }>();
    private sanitizer = createDefaultSanitizer();
    private readonly permissionManager: ToolPermissionManager;
    private readonly workspaceType: WorkspaceType;

    constructor(
        private readonly eventBus: WorkspaceEventEmitter,
        permissionManager?: ToolPermissionManager,
        workspaceType?: WorkspaceType
    ) {
        this.permissionManager = permissionManager || ToolPermissionManager.getInstance();
        // Ralph Loop 51-3: Default to 'ide' workspace for backward compatibility
        this.workspaceType = workspaceType ?? 'ide';
    }

    /**
     * Check permission before tool execution
     * Ralph Loop 51-3: Now checks workspace-scoped permissions
     * @throws ToolPermissionDeniedError if tool cannot execute
     */
    private checkPermission(toolId: string): void {
        const result = this.permissionManager.checkPermission(toolId, this.workspaceType);

        if (!result.canExecute) {
            let userMessage: string;

            switch (result.reason) {
                case 'block':
                    userMessage = `The "${result.toolName}" tool is blocked by your security settings. You can change this in Agent Settings.`;
                    break;
                case 'prompt':
                    userMessage = `The "${result.toolName}" tool requires your approval before execution. Please approve this action when prompted.`;
                    break;
                default:
                    userMessage = `Permission denied for "${result.toolName}" tool.`;
            }

            throw new ToolPermissionDeniedError(
                userMessage,
                result.toolName,
                result.reason
            );
        }

        // Log for debugging (auto-approved or session-trusted tools)
        if (result.reason === 'auto' || result.reason === 'session') {
            console.log(`[TerminalToolsFacade] Permission granted for ${result.toolName} (reason: ${result.reason})`);
        }
    }

    /**
     * Execute a command and capture output
     * @fix RC-028-001 - Added permission check
     */
    async executeCommand(
        command: string,
        args: string[] = [],
        options: CommandOptions = {}
    ): Promise<CommandResult> {
        // RC-028-001: Check permission before execution
        this.checkPermission('execute_command');

        if (!isBooted()) {
            throw new TerminalToolsError(
                'WebContainer not booted. Call boot() first.',
                'NOT_BOOTED'
            );
        }

        // Validate command before execution (RC-004: Command Injection Protection)
        this.sanitizer.validateOrThrow(command, args);

        const { timeout = DEFAULT_TIMEOUT, cwd } = options;
        const pid = `${command}-${Date.now()}`;
        let stdout = '';

        // Emit process:started
        this.eventBus.emit('process:started', { pid, command, args });

        try {
            const process = await spawn(command, args, cwd ? { cwd } : undefined);

            // Track process for killProcess
            this.processes.set(pid, { kill: () => process.kill() });

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new TerminalToolsError(
                        `Command timed out after ${timeout}ms: ${command}`,
                        'TIMEOUT'
                    ));
                }, timeout);
            });

            // Capture output
            const outputCapture = new Promise<void>((resolve) => {
                process.output.pipeTo(
                    new WritableStream({
                        write: (data) => {
                            stdout += data;
                            this.eventBus.emit('process:output', {
                                pid,
                                data,
                                type: 'stdout',
                            });
                        },
                        close: () => resolve(),
                    })
                ).catch(() => resolve()); // Stream closed
            });

            // Wait for exit or timeout
            const exitCode = await Promise.race([
                process.exit,
                timeoutPromise,
            ]);

            await outputCapture;

            // Emit process:exited
            this.eventBus.emit('process:exited', { pid, exitCode });
            this.processes.delete(pid);

            return { stdout, exitCode, pid };
        } catch (error) {
            // Kill process if it exists
            this.processes.get(pid)?.kill();
            this.processes.delete(pid);

            // Emit exit event on error
            this.eventBus.emit('process:exited', { pid, exitCode: -1 });

            if (error instanceof TerminalToolsError) {
                throw error;
            }
            if (error instanceof ToolPermissionDeniedError) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new TerminalToolsError(`Spawn failed: ${message}`, 'SPAWN_FAILED');
        }
    }

    /**
     * Start an interactive shell session
     * @fix RC-028-008 - Add shell session timeout (30min max with warning at 25min)
     */
    async startShell(projectPath?: string): Promise<ShellSession> {
        // RC-028-001: Check permission before execution
        this.checkPermission('execute_command');

        if (!isBooted()) {
            throw new TerminalToolsError(
                'WebContainer not booted. Call boot() first.',
                'NOT_BOOTED'
            );
        }

        const pid = `jsh-${Date.now()}`;
        const spawnOptions = projectPath ? { cwd: projectPath } : undefined;
        const process = await spawn('jsh', [], spawnOptions);
        const writer = process.input.getWriter();
        const startTime = Date.now();
        let running = true;
        let warningEmitted = false;

        // Track process
        this.processes.set(pid, { kill: () => process.kill() });

        // Emit start event
        this.eventBus.emit('process:started', { pid, command: 'jsh', args: [] });

        // RC-028-008: Shell session timeout - monitor elapsed time
        const sessionTimer = setInterval(() => {
            if (!running) {
                clearInterval(sessionTimer);
                return;
            }

            const elapsed = Date.now() - startTime;

            // Warning at 25 minutes
            if (elapsed >= SHELL_WARNING_TIME && !warningEmitted) {
                warningEmitted = true;
                this.eventBus.emit('shell:warning', {
                    message: 'Shell session has been running for 25 minutes. It will be terminated at 30 minutes.',
                    command: undefined,
                } as any);
                console.warn(`[TerminalToolsFacade] Shell session ${pid} warning: 25min limit reached`);
            }

            // Terminate at 30 minutes
            if (elapsed >= SHELL_SESSION_TIMEOUT) {
                console.warn(`[TerminalToolsFacade] Shell session ${pid} terminated: 30min limit reached`);
                process.kill();
                running = false;
                clearInterval(sessionTimer);
                this.eventBus.emit('shell:timeout', {
                    command: 'shell-session',
                    duration: elapsed,
                } as any);
            }
        }, 10000); // Check every 10 seconds

        // Handle exit
        process.exit.then((exitCode) => {
            running = false;
            clearInterval(sessionTimer);
            this.processes.delete(pid);
            this.eventBus.emit('process:exited', { pid, exitCode });
        });

        return {
            pid,
            write: (data: string) => {
                writer.write(data).catch(() => { });
            },
            kill: () => {
                process.kill();
                running = false;
                clearInterval(sessionTimer);
            },
            isRunning: () => running,
            getElapsedTime: () => Date.now() - startTime,
        };
    }

    /**
     * Kill a running process
     */
    async killProcess(pid: string): Promise<void> {
        const process = this.processes.get(pid);
        if (!process) {
            throw new TerminalToolsError(
                `Process not found: ${pid}`,
                'PROCESS_NOT_FOUND'
            );
        }
        process.kill();
        this.processes.delete(pid);
        this.eventBus.emit('process:exited', { pid, exitCode: -1 });
    }

    /**
     * Check if process is running
     */
    isRunning(pid: string): boolean {
        return this.processes.has(pid);
    }
}

/**
 * Factory function to create TerminalToolsFacade
 * @param permissionManager - Optional permission manager for testing
 * @param workspaceType - Optional workspace type for workspace-scoped permissions (defaults to 'ide')
 */
export function createTerminalToolsFacade(
    eventBus: WorkspaceEventEmitter,
    permissionManager?: ToolPermissionManager,
    workspaceType?: WorkspaceType
): AgentTerminalTools {
    return new TerminalToolsFacade(eventBus, permissionManager, workspaceType);
}

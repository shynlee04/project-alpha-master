/**
 * @fileoverview Agent Terminal Tools Implementation
 * @module lib/agent/facades/terminal-tools-impl
 * 
 * Facade implementation wrapping WebContainer spawn() for AI agent command execution.
 * Emits process lifecycle events for UI integration.
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-2 - Create AgentTerminalTools Facade
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

const DEFAULT_TIMEOUT = 30000;

/**
 * TerminalToolsFacade - Wraps WebContainer for agent command execution
 */
export class TerminalToolsFacade implements AgentTerminalTools {
    private processes = new Map<string, { kill: () => void }>();

    constructor(private readonly eventBus: WorkspaceEventEmitter) { }

    /**
     * Execute a command and capture output
     */
    async executeCommand(
        command: string,
        args: string[] = [],
        options: CommandOptions = {}
    ): Promise<CommandResult> {
        if (!isBooted()) {
            throw new TerminalToolsError(
                'WebContainer not booted. Call boot() first.',
                'NOT_BOOTED'
            );
        }

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
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new TerminalToolsError(`Spawn failed: ${message}`, 'SPAWN_FAILED');
        }
    }

    /**
     * Start an interactive shell session
     */
    async startShell(projectPath?: string): Promise<ShellSession> {
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
        let running = true;

        // Track process
        this.processes.set(pid, { kill: () => process.kill() });

        // Emit start event
        this.eventBus.emit('process:started', { pid, command: 'jsh', args: [] });

        // Handle exit
        process.exit.then((exitCode) => {
            running = false;
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
            },
            isRunning: () => running,
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
 */
export function createTerminalToolsFacade(
    eventBus: WorkspaceEventEmitter
): AgentTerminalTools {
    return new TerminalToolsFacade(eventBus);
}

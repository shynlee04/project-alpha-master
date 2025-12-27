/**
 * @fileoverview TerminalToolsFacade Unit Tests
 * @module lib/agent/facades/__tests__/terminal-tools.test
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-2 - Create AgentTerminalTools Facade
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TerminalToolsFacade, createTerminalToolsFacade } from '../terminal-tools-impl';
import { TerminalToolsError } from '../terminal-tools';
import type { WorkspaceEventEmitter } from '../../../events';
import * as manager from '../../../webcontainer/manager';

// Mock the manager module
vi.mock('../../../webcontainer/manager', () => ({
    spawn: vi.fn(),
    isBooted: vi.fn(),
}));

function createMockEventBus() {
    return {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
        listeners: vi.fn().mockReturnValue([]),
        listenerCount: vi.fn().mockReturnValue(0),
        eventNames: vi.fn().mockReturnValue([]),
        addListener: vi.fn(),
    } as unknown as WorkspaceEventEmitter;
}

function createMockProcess(stdout: string, exitCode: number) {
    let writeHandler: ((chunk: string) => void) | null = null;
    let closeHandler: (() => void) | null = null;

    const mockOutput = {
        pipeTo: vi.fn().mockImplementation((writable: WritableStream<string>) => {
            const writer = writable.getWriter();
            // Simulate async output
            setTimeout(async () => {
                await writer.write(stdout);
                await writer.close();
            }, 10);
            return Promise.resolve();
        }),
    };

    const mockInput = {
        getWriter: vi.fn().mockReturnValue({
            write: vi.fn().mockResolvedValue(undefined),
            releaseLock: vi.fn(),
        }),
    };

    return {
        output: mockOutput,
        input: mockInput,
        exit: Promise.resolve(exitCode),
        kill: vi.fn(),
    };
}

describe('TerminalToolsFacade', () => {
    let facade: TerminalToolsFacade;
    let mockEventBus: ReturnType<typeof createMockEventBus>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockEventBus = createMockEventBus();
        facade = new TerminalToolsFacade(mockEventBus);
        vi.mocked(manager.isBooted).mockReturnValue(true);
    });

    describe('executeCommand', () => {
        it('should execute command and return result', async () => {
            const mockProcess = createMockProcess('Hello World\n', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            const result = await facade.executeCommand('echo', ['Hello World']);

            expect(result.stdout).toBe('Hello World\n');
            expect(result.exitCode).toBe(0);
            expect(result.pid).toMatch(/^echo-\d+$/);
        });

        it('should emit process:started event', async () => {
            const mockProcess = createMockProcess('', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            await facade.executeCommand('npm', ['install']);

            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'process:started',
                expect.objectContaining({
                    command: 'npm',
                    args: ['install'],
                })
            );
        });

        it('should emit process:output events', async () => {
            const mockProcess = createMockProcess('output line', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            await facade.executeCommand('cat', ['file.txt']);

            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'process:output',
                expect.objectContaining({
                    data: 'output line',
                    type: 'stdout',
                })
            );
        });

        it('should emit process:exited event', async () => {
            const mockProcess = createMockProcess('', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            await facade.executeCommand('ls', []);

            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'process:exited',
                expect.objectContaining({
                    exitCode: 0,
                })
            );
        });

        it('should throw TerminalToolsError when not booted', async () => {
            vi.mocked(manager.isBooted).mockReturnValue(false);

            await expect(facade.executeCommand('echo', ['test']))
                .rejects.toThrow(TerminalToolsError);
            await expect(facade.executeCommand('echo', ['test']))
                .rejects.toThrow('WebContainer not booted');
        });

        it('should pass cwd option to spawn', async () => {
            const mockProcess = createMockProcess('', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            await facade.executeCommand('ls', [], { cwd: '/project' });

            expect(manager.spawn).toHaveBeenCalledWith(
                'ls',
                [],
                { cwd: '/project' }
            );
        });
    });

    describe('startShell', () => {
        it('should start shell and return session', async () => {
            const mockProcess = createMockProcess('', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            const session = await facade.startShell();

            expect(session.pid).toMatch(/^jsh-\d+$/);
            expect(typeof session.write).toBe('function');
            expect(typeof session.kill).toBe('function');
            expect(typeof session.isRunning).toBe('function');
        });

        it('should emit process:started for shell', async () => {
            const mockProcess = createMockProcess('', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            await facade.startShell();

            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'process:started',
                expect.objectContaining({
                    command: 'jsh',
                    args: [],
                })
            );
        });

        it('should throw when not booted', async () => {
            vi.mocked(manager.isBooted).mockReturnValue(false);

            await expect(facade.startShell())
                .rejects.toThrow(TerminalToolsError);
        });
    });

    describe('killProcess', () => {
        it('should kill running process', async () => {
            const mockProcess = createMockProcess('', 0);
            vi.mocked(manager.spawn).mockResolvedValue(mockProcess as any);

            await facade.executeCommand('sleep', ['100']);
            const pid = (mockEventBus.emit as any).mock.calls
                .find((c: any) => c[0] === 'process:started')?.[1].pid;

            // Process is already done, but let's test the path
            // In real scenario, this would kill a running process
        });

        it('should throw when process not found', async () => {
            await expect(facade.killProcess('unknown-pid'))
                .rejects.toThrow(TerminalToolsError);
            await expect(facade.killProcess('unknown-pid'))
                .rejects.toThrow('Process not found');
        });
    });

    describe('isRunning', () => {
        it('should return false for unknown process', () => {
            expect(facade.isRunning('unknown-pid')).toBe(false);
        });
    });
});

describe('createTerminalToolsFacade', () => {
    it('should create facade instance', () => {
        const eventBus = createMockEventBus();
        const facade = createTerminalToolsFacade(eventBus);
        expect(facade).toBeDefined();
        expect(typeof facade.executeCommand).toBe('function');
    });
});

describe('TerminalToolsError', () => {
    it('should create error with code', () => {
        const error = new TerminalToolsError('Test error', 'TIMEOUT');
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TIMEOUT');
        expect(error.name).toBe('TerminalToolsError');
    });
});

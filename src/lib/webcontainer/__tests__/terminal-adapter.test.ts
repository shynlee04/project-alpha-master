/**
 * Terminal Adapter Tests
 * @module lib/webcontainer/__tests__/terminal-adapter.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTerminalAdapter, TerminalAdapterError } from '../terminal-adapter';
import { spawn, isBooted } from '../manager';

// Mock process factory
const createMockProcess = () => {
    const inputWriter = {
        write: vi.fn().mockResolvedValue(undefined),
        releaseLock: vi.fn(),
    };

    // Create a pending promise that never resolves - simulates a running process
    let resolveExit: (code: number) => void = () => { };
    const exitPromise = new Promise<number>((resolve) => {
        resolveExit = resolve;
    });

    return {
        output: new ReadableStream(),
        input: { getWriter: vi.fn().mockReturnValue(inputWriter) },
        exit: exitPromise,
        kill: vi.fn(),
        _inputWriter: inputWriter,
        _resolveExit: (code: number) => resolveExit(code),
    };
};

// Mock manager module
vi.mock('../manager', () => ({
    isBooted: vi.fn(),
    spawn: vi.fn(),
}));

// Mock terminal factory
const createMockTerminal = () => ({
    cols: 80,
    rows: 24,
    write: vi.fn(),
    resize: vi.fn(),
    onData: vi.fn(() => ({ dispose: vi.fn() })),
    onResize: vi.fn(() => ({ dispose: vi.fn() })),
});

// Mock fit addon factory
const createMockFitAddon = () => ({ fit: vi.fn() });

describe('Terminal Adapter', () => {
    let mockTerminal: ReturnType<typeof createMockTerminal>;
    let mockFitAddon: ReturnType<typeof createMockFitAddon>;
    let mockProcess: ReturnType<typeof createMockProcess>;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create fresh mocks for each test
        mockTerminal = createMockTerminal();
        mockFitAddon = createMockFitAddon();
        mockProcess = createMockProcess();

        // Set default mock implementations
        vi.mocked(isBooted).mockReturnValue(true);
        vi.mocked(spawn).mockResolvedValue(mockProcess as any);
    });

    describe('createTerminalAdapter()', () => {
        it('should create adapter with required options', () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });

            expect(adapter).toBeDefined();
            expect(adapter.startShell).toBeDefined();
            expect(adapter.write).toBeDefined();
            expect(adapter.resize).toBeDefined();
            expect(adapter.dispose).toBeDefined();
            expect(adapter.isRunning).toBeDefined();
        });
    });

    describe('startShell()', () => {
        it('should start shell with default options', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();

            expect(spawn).toHaveBeenCalledWith('jsh', [], {
                terminal: { cols: 80, rows: 24 },
            });
        });

        it('should start shell with project path (cwd)', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell('/my-project');

            expect(spawn).toHaveBeenCalledWith('jsh', [], {
                terminal: { cols: 80, rows: 24 },
                cwd: '/my-project',
            });
        });

        it('should throw NOT_BOOTED error when WebContainer not booted', async () => {
            vi.mocked(isBooted).mockReturnValue(false);

            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });

            await expect(adapter.startShell()).rejects.toThrow(TerminalAdapterError);
        });

        it('should throw ALREADY_STARTED on second call', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();

            await expect(adapter.startShell()).rejects.toThrow(TerminalAdapterError);
        });

        it('should throw DISPOSED after dispose', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            adapter.dispose();

            await expect(adapter.startShell()).rejects.toThrow(TerminalAdapterError);
        });
    });

    describe('write()', () => {
        it('should write data to shell stdin', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();
            adapter.write('ls -la\n');

            expect(mockProcess._inputWriter.write).toHaveBeenCalledWith('ls -la\n');
        });

        it('should throw SHELL_NOT_STARTED before startShell', () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });

            expect(() => adapter.write('test')).toThrow(TerminalAdapterError);
        });
    });

    describe('resize()', () => {
        it('should use fitAddon.fit() when provided', async () => {
            const adapter = createTerminalAdapter({
                terminal: mockTerminal as any,
                fitAddon: mockFitAddon as any,
            });
            await adapter.startShell();
            adapter.resize(100, 30);

            expect(mockFitAddon.fit).toHaveBeenCalled();
        });

        it('should call terminal.resize when no fitAddon', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();
            adapter.resize(100, 30);

            expect(mockTerminal.resize).toHaveBeenCalledWith(100, 30);
        });
    });

    describe('dispose()', () => {
        it('should release lock and kill process', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();
            adapter.dispose();

            expect(mockProcess._inputWriter.releaseLock).toHaveBeenCalled();
            expect(mockProcess.kill).toHaveBeenCalled();
        });

        it('should be safe to call multiple times', () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });

            // Should not throw when called multiple times
            adapter.dispose();
            adapter.dispose();
            adapter.dispose();

            expect(true).toBe(true); // If we got here, no error was thrown
        });
    });

    describe('isRunning()', () => {
        it('should return false before startShell', () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });

            expect(adapter.isRunning()).toBe(false);
        });

        it('should return true after startShell', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();

            expect(adapter.isRunning()).toBe(true);
        });

        it('should return false after dispose', async () => {
            const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
            await adapter.startShell();
            adapter.dispose();

            expect(adapter.isRunning()).toBe(false);
        });
    });
});

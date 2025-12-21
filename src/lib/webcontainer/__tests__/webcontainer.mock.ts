/**
 * WebContainer Mock Helper
 * Provides reusable mocks for testing WebContainer-dependent code
 * @module lib/webcontainer/__tests__/webcontainer.mock
 */

import { vi } from 'vitest';

/**
 * Create a mock WebContainerProcess
 */
export function createMockProcess(exitCode = 0) {
    const outputController = {
        enqueue: vi.fn(),
        close: vi.fn(),
    };

    const inputWriter = {
        write: vi.fn().mockResolvedValue(undefined),
        releaseLock: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
    };

    return {
        output: new ReadableStream({
            start(controller) {
                Object.assign(outputController, controller);
            },
        }),
        input: {
            getWriter: vi.fn().mockReturnValue(inputWriter),
        },
        exit: Promise.resolve(exitCode),
        kill: vi.fn(),
        // Expose internal mocks for testing
        _outputController: outputController,
        _inputWriter: inputWriter,
    };
}

/**
 * Create a mock FileSystem API
 */
export function createMockFileSystem() {
    return {
        readFile: vi.fn().mockResolvedValue('file content'),
        writeFile: vi.fn().mockResolvedValue(undefined),
        readdir: vi.fn().mockResolvedValue([]),
        rm: vi.fn().mockResolvedValue(undefined),
        mkdir: vi.fn().mockResolvedValue(undefined),
    };
}

/**
 * Create a mock WebContainer instance
 */
export function createMockWebContainer(options: {
    spawnExitCode?: number;
    shouldMountFail?: boolean;
    shouldSpawnFail?: boolean;
} = {}) {
    const { spawnExitCode = 0, shouldMountFail = false, shouldSpawnFail = false } = options;

    const mockProcess = createMockProcess(spawnExitCode);
    const mockFs = createMockFileSystem();
    const serverReadyCallbacks: Array<(port: number, url: string) => void> = [];

    const instance = {
        mount: shouldMountFail
            ? vi.fn().mockRejectedValue(new Error('Mount failed'))
            : vi.fn().mockResolvedValue(undefined),
        spawn: shouldSpawnFail
            ? vi.fn().mockRejectedValue(new Error('Spawn failed'))
            : vi.fn().mockResolvedValue(mockProcess),
        fs: mockFs,
        on: vi.fn().mockImplementation((event: string, callback: (port: number, url: string) => void) => {
            if (event === 'server-ready') {
                serverReadyCallbacks.push(callback);
            }
            return () => {
                const index = serverReadyCallbacks.indexOf(callback);
                if (index > -1) serverReadyCallbacks.splice(index, 1);
            };
        }),
        // Helper to simulate server-ready event
        _triggerServerReady: (port: number, url: string) => {
            serverReadyCallbacks.forEach(cb => cb(port, url));
        },
        _mockProcess: mockProcess,
        _mockFs: mockFs,
    };

    return instance;
}

/**
 * Create a mock for the @webcontainer/api module
 */
export function createWebContainerApiMock(options: {
    shouldBootFail?: boolean;
    spawnExitCode?: number;
    shouldMountFail?: boolean;
    shouldSpawnFail?: boolean;
} = {}) {
    const { shouldBootFail = false, ...instanceOptions } = options;
    const mockInstance = createMockWebContainer(instanceOptions);

    return {
        WebContainer: {
            boot: shouldBootFail
                ? vi.fn().mockRejectedValue(new Error('Boot failed'))
                : vi.fn().mockResolvedValue(mockInstance),
        },
        _mockInstance: mockInstance,
    };
}

/**
 * Create a mock xterm.js Terminal
 */
export function createMockTerminal() {
    const dataCallbacks: Array<(data: string) => void> = [];
    const resizeCallbacks: Array<(size: { cols: number; rows: number }) => void> = [];

    return {
        cols: 80,
        rows: 24,
        write: vi.fn(),
        resize: vi.fn(),
        onData: vi.fn().mockImplementation((callback: (data: string) => void) => {
            dataCallbacks.push(callback);
            return {
                dispose: () => {
                    const index = dataCallbacks.indexOf(callback);
                    if (index > -1) dataCallbacks.splice(index, 1);
                }
            };
        }),
        onResize: vi.fn().mockImplementation((callback: (size: { cols: number; rows: number }) => void) => {
            resizeCallbacks.push(callback);
            return {
                dispose: () => {
                    const index = resizeCallbacks.indexOf(callback);
                    if (index > -1) resizeCallbacks.splice(index, 1);
                }
            };
        }),
        // Helpers for testing
        _triggerData: (data: string) => dataCallbacks.forEach(cb => cb(data)),
        _triggerResize: (cols: number, rows: number) => resizeCallbacks.forEach(cb => cb({ cols, rows })),
        _dataCallbacks: dataCallbacks,
        _resizeCallbacks: resizeCallbacks,
    };
}

/**
 * Create a mock FitAddon
 */
export function createMockFitAddon() {
    return {
        fit: vi.fn(),
        proposeDimensions: vi.fn().mockReturnValue({ cols: 80, rows: 24 }),
        activate: vi.fn(),
        dispose: vi.fn(),
    };
}

/**
 * Reset the manager singleton state between tests
 * This needs to be called in beforeEach to ensure clean state
 */
export async function resetManagerState() {
    // Re-import to get fresh module state
    vi.resetModules();
}

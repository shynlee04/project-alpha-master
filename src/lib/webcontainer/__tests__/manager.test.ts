/**
 * WebContainer Manager Tests
 * @module lib/webcontainer/__tests__/manager.test
 * 
 * Tests the singleton WebContainer manager module.
 * Since WebContainer.boot is a static method, we mock the @webcontainer/api module.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a mock WebContainer instance
const createMockInstance = () => ({
    mount: vi.fn().mockResolvedValue(undefined),
    spawn: vi.fn().mockResolvedValue({
        output: new ReadableStream(),
        input: { getWriter: () => ({ write: vi.fn(), releaseLock: vi.fn() }) },
        exit: Promise.resolve(0),
        kill: vi.fn(),
    }),
    fs: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
    },
    on: vi.fn().mockReturnValue(() => { }),
});

let mockInstance = createMockInstance();
let shouldBootFail = false;

// Mock the @webcontainer/api at module level
vi.mock('@webcontainer/api', () => ({
    WebContainer: {
        boot: vi.fn(async () => {
            if (shouldBootFail) {
                throw new Error('Boot failed');
            }
            return mockInstance;
        }),
    },
}));

describe('WebContainer Manager', () => {
    beforeEach(async () => {
        // Reset everything for a fresh singleton state
        vi.resetModules();
        vi.clearAllMocks();

        // Reset mock state
        mockInstance = createMockInstance();
        shouldBootFail = false;
    });

    describe('boot()', () => {
        it('should boot WebContainer and return instance', async () => {
            const { boot } = await import('../manager');

            const instance = await boot();

            expect(instance).toBeDefined();
            expect(instance).toBe(mockInstance);
        });

        it('should return same instance on multiple calls (singleton)', async () => {
            const { boot } = await import('../manager');

            const instance1 = await boot();
            const instance2 = await boot();

            expect(instance1).toBe(instance2);
        });

        it('should throw WebContainerError on boot failure', async () => {
            shouldBootFail = true;

            const { boot } = await import('../manager');
            const { WebContainerError } = await import('../types');

            await expect(boot()).rejects.toThrow(WebContainerError);
            await expect(boot()).rejects.toThrow('Boot failed');
        });
    });

    describe('mount()', () => {
        it('should mount files when booted', async () => {
            const { boot, mount } = await import('../manager');

            await boot();

            const files = { 'test.txt': { file: { contents: 'test' } } };
            await mount(files);

            expect(mockInstance.mount).toHaveBeenCalledWith(files, { mountPoint: undefined });
        });

        it('should throw NOT_BOOTED error when not booted', async () => {
            const { mount } = await import('../manager');
            const { WebContainerError } = await import('../types');

            const files = { 'test.txt': { file: { contents: 'test' } } };

            await expect(mount(files)).rejects.toThrow(WebContainerError);
            await expect(mount(files)).rejects.toThrow('not booted');
        });
    });

    describe('spawn()', () => {
        it('should spawn a process when booted', async () => {
            const { boot, spawn } = await import('../manager');

            await boot();

            const process = await spawn('npm', ['install']);

            expect(mockInstance.spawn).toHaveBeenCalledWith('npm', ['install'], undefined);
            expect(process).toBeDefined();
        });

        it('should throw NOT_BOOTED error when not booted', async () => {
            const { spawn } = await import('../manager');
            const { WebContainerError } = await import('../types');

            await expect(spawn('npm')).rejects.toThrow(WebContainerError);
            await expect(spawn('npm')).rejects.toThrow('not booted');
        });
    });

    describe('getFileSystem()', () => {
        it('should return fs when booted', async () => {
            const { boot, getFileSystem } = await import('../manager');

            await boot();

            const fs = getFileSystem();

            expect(fs).toBe(mockInstance.fs);
        });

        it('should throw NOT_BOOTED error when not booted', async () => {
            const { getFileSystem } = await import('../manager');
            const { WebContainerError } = await import('../types');

            expect(() => getFileSystem()).toThrow(WebContainerError);
        });
    });

    describe('getInstance()', () => {
        it('should return null when not booted', async () => {
            const { getInstance } = await import('../manager');

            expect(getInstance()).toBeNull();
        });

        it('should return instance when booted', async () => {
            const { boot, getInstance } = await import('../manager');

            await boot();

            expect(getInstance()).toBe(mockInstance);
        });
    });

    describe('isBooted()', () => {
        it('should return false when not booted', async () => {
            const { isBooted } = await import('../manager');

            expect(isBooted()).toBe(false);
        });

        it('should return true when booted', async () => {
            const { boot, isBooted } = await import('../manager');

            await boot();

            expect(isBooted()).toBe(true);
        });
    });

    describe('onServerReady()', () => {
        it('should subscribe to server-ready events when booted', async () => {
            const { boot, onServerReady } = await import('../manager');

            await boot();

            const callback = vi.fn();
            const unsubscribe = onServerReady(callback);

            expect(mockInstance.on).toHaveBeenCalledWith('server-ready', callback);
            expect(typeof unsubscribe).toBe('function');
        });

        it('should throw NOT_BOOTED error when not booted', async () => {
            const { onServerReady } = await import('../manager');
            const { WebContainerError } = await import('../types');

            expect(() => onServerReady(() => { })).toThrow(WebContainerError);
        });
    });
});

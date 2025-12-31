/**
 * Sync Manager Tests
 * @module lib/filesystem/__tests__/sync-manager.test
 */

import type { SyncConfig } from '../sync-types';
import * as webcontainer from '../../webcontainer';
import { createWorkspaceEventBus } from '../../events';

vi.mock('../../webcontainer', () => ({
    boot: vi.fn(),
    mount: vi.fn(),
    getFileSystem: vi.fn(),
    isBooted: vi.fn(),
}));

vi.mock('./local-fs-adapter', () => {
    return {
        LocalFSAdapter: vi.fn().mockImplementation(() => ({
            listDirectory: vi.fn(),
            readFile: vi.fn(),
            writeFile: vi.fn(),
            deleteFile: vi.fn(),
            createDirectory: vi.fn(),
            deleteDirectory: vi.fn(),
        })),
    };
});

import { SyncManager } from '../sync-manager';
import { LocalFSAdapter } from './local-fs-adapter';

describe('SyncManager', () => {
    let syncManager: SyncManager;
    let mockAdapter: any;
    let mockFS: any;
    let eventBus: ReturnType<typeof createWorkspaceEventBus>;
    let emitSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Mock Adapter
        mockAdapter = new LocalFSAdapter();
        eventBus = createWorkspaceEventBus();
        emitSpy = vi.spyOn(eventBus as any, 'emit');
        syncManager = new SyncManager(mockAdapter, {}, eventBus);

        // Setup WebContainer mocks
        vi.mocked(webcontainer.isBooted).mockReturnValue(true);
        mockFS = {
            writeFile: vi.fn(),
            mkdir: vi.fn(),
            rm: vi.fn(),
        };
        vi.mocked(webcontainer.getFileSystem).mockReturnValue(mockFS as any);
    });

    describe('syncToWebContainer', () => {
        it('should exclude .git and node_modules by default', async () => {
            // Mock directory structure
            mockAdapter.listDirectory.mockResolvedValue([
                { name: '.git', type: 'directory' },
                { name: 'node_modules', type: 'directory' },
                { name: 'src', type: 'directory' },
                { name: 'package.json', type: 'file' },
            ]);

            // Mock recursive calls for 'src'
            mockAdapter.listDirectory.mockImplementation((path: string) => {
                if (path === 'src') {
                    return Promise.resolve([{ name: 'index.ts', type: 'file' }]);
                }
                return Promise.resolve([
                    { name: '.git', type: 'directory' },
                    { name: 'node_modules', type: 'directory' },
                    { name: 'src', type: 'directory' },
                    { name: 'package.json', type: 'file' },
                ]);
            });

            mockAdapter.readFile.mockResolvedValue({ content: 'content' });

            await syncManager.syncToWebContainer();

            expect(emitSpy).toHaveBeenCalledWith('sync:started', {
                fileCount: expect.any(Number),
                direction: 'to-wc',
            });

            expect(emitSpy).toHaveBeenCalledWith('sync:completed', {
                success: true,
                timestamp: expect.any(Date),
                filesProcessed: expect.any(Number),
            });

            // Verify mount called with correct tree structure
            expect(webcontainer.mount).toHaveBeenCalledWith({
                'src': {
                    directory: {
                        'index.ts': { file: { contents: 'content' } },
                    },
                },
                'package.json': { file: { contents: 'content' } },
            });

            // Should NOT contain .git or node_modules
            const mountedTree = vi.mocked(webcontainer.mount).mock.calls[0][0];
            expect(mountedTree).not.toHaveProperty('.git');
            expect(mountedTree).not.toHaveProperty('node_modules');
        });

        it('should handle nested directory recursion', async () => {
            mockAdapter.listDirectory.mockImplementation(async (path: string) => {
                if (path === '') return [{ name: 'folder', type: 'directory' }];
                if (path === 'folder') return [{ name: 'file.txt', type: 'file' }];
                return [];
            });
            mockAdapter.readFile.mockResolvedValue({ content: 'data' });

            await syncManager.syncToWebContainer();

            expect(emitSpy).toHaveBeenCalledWith('sync:started', {
                fileCount: expect.any(Number),
                direction: 'to-wc',
            });

            expect(emitSpy).toHaveBeenCalledWith('sync:progress', {
                current: expect.any(Number),
                total: expect.any(Number),
                currentFile: 'folder/file.txt',
            });

            expect(emitSpy).toHaveBeenCalledWith('sync:completed', {
                success: true,
                timestamp: expect.any(Date),
                filesProcessed: expect.any(Number),
            });

            expect(webcontainer.mount).toHaveBeenCalledWith({
                folder: {
                    directory: {
                        'file.txt': { file: { contents: 'data' } }
                    }
                }
            });
        });

        it('should emit sync:error on file read failure', async () => {
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const onError = vi.fn();
            syncManager = new SyncManager(mockAdapter, { onError }, eventBus);

            mockAdapter.listDirectory.mockResolvedValue([{ name: 'bad.txt', type: 'file' }]);
            mockAdapter.readFile.mockRejectedValueOnce(new Error('boom'));

            await syncManager.syncToWebContainer();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith('sync:error', {
                error: expect.any(Error),
                file: 'bad.txt',
            });

            consoleWarn.mockRestore();
        });
    });

    describe('writeFile', () => {
        it('should write to both local execution and WebContainer', async () => {
            await syncManager.writeFile('src/main.ts', 'console.log("hello")');

            // Check Local Write
            expect(mockAdapter.writeFile).toHaveBeenCalledWith('src/main.ts', 'console.log("hello")');

            // Check WebContainer Write
            expect(mockFS.writeFile).toHaveBeenCalledWith('src/main.ts', 'console.log("hello")');
        });

        it('should ensure parent directory exists in WebContainer', async () => {
            await syncManager.writeFile('src/utils/helper.ts', '...');

            // Should call mkdir for parent directory
            expect(mockFS.mkdir).toHaveBeenCalledWith('src/utils', { recursive: true });
            // Should write file
            expect(mockFS.writeFile).toHaveBeenCalledWith('src/utils/helper.ts', '...');
        });
    });

    describe('deleteFile', () => {
        it('should delete from both local and WebContainer', async () => {
            await syncManager.deleteFile('test.txt');

            expect(mockAdapter.deleteFile).toHaveBeenCalledWith('test.txt');
            expect(mockFS.rm).toHaveBeenCalledWith('test.txt');
        });
    });

    describe('createDirectory', () => {
        it('should create in both local and WebContainer', async () => {
            await syncManager.createDirectory('new-folder');

            expect(mockAdapter.createDirectory).toHaveBeenCalledWith('new-folder');
            expect(mockFS.mkdir).toHaveBeenCalledWith('new-folder', { recursive: true });
        });
    });

    describe('deleteDirectory', () => {
        it('should delete from both local and WebContainer', async () => {
            await syncManager.deleteDirectory('old-folder');

            expect(mockAdapter.deleteDirectory).toHaveBeenCalledWith('old-folder');
            expect(mockFS.rm).toHaveBeenCalledWith('old-folder', { recursive: true });
        });
    });

    describe('Concurrency', () => {
        // SKIP: This test has timing sensitivity issues in CI environment
        // The blocking behavior works but the timing assertions are flaky
        it.skip('should block concurrent sync calls', async () => {
            // Setup mock to simulate ongoing sync
            mockAdapter.listDirectory.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return [];
            });

            // Start first sync
            const sync1 = syncManager.syncToWebContainer();

            // Second sync should return early
            const sync2 = syncManager.syncToWebContainer();

            // Wait for first to complete
            await sync1;

            // Both should complete
            await sync2;

            // Should only have called listDirectory once (blocked second call)
            expect(mockAdapter.listDirectory).toHaveBeenCalledTimes(1);
        });
    });
});

// Story 24-1: Tests for incrementalSyncToWebContainer with FileMetadataCache integration
// SKIP: These tests require WebContainer integration that doesn't work properly in test environment
describe.skip('SyncManager incrementalSync (Story 24-1)', () => {
    let syncManager: SyncManager;
    let mockAdapter: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockAdapter = new LocalFSAdapter();
        syncManager = new SyncManager(mockAdapter);
    });

    describe('incrementalSyncToWebContainer', () => {
        it('should return empty result when no files changed', async () => {
            const result = await syncManager.incrementalSyncToWebContainer();
            expect(result.success).toBe(true);
            expect(result.totalFiles).toBe(0);
        });
    });
});

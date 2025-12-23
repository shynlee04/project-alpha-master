/**
 * @fileoverview Agent File Tools Unit Tests
 * @module lib/agent/facades/__tests__/file-tools.test
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 * @story 12-1B - Add Concurrency Control to FileToolsFacade
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileToolsFacade } from '../file-tools-impl';
import { validatePath, PathValidationError } from '../file-tools';
import { FileLock } from '../file-lock';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { SyncManager } from '@/lib/filesystem/sync-manager';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

// Create mock factories
function createMockLocalFS() {
    return {
        readFile: vi.fn().mockResolvedValue({ content: 'file content', path: 'test.txt' }),
        writeFile: vi.fn().mockResolvedValue(undefined),
        createFile: vi.fn().mockResolvedValue(undefined),
        deleteFile: vi.fn().mockResolvedValue(undefined),
        listDirectory: vi.fn().mockResolvedValue([
            { name: 'file1.ts', type: 'file', handle: {} },
            { name: 'file2.ts', type: 'file', handle: {} },
            { name: 'subdir', type: 'directory', handle: {} },
        ]),
        createDirectory: vi.fn().mockResolvedValue(undefined),
        deleteDirectory: vi.fn().mockResolvedValue(undefined),
        rename: vi.fn().mockResolvedValue(undefined),
        getDirectoryHandle: vi.fn().mockReturnValue({}),
        setDirectoryHandle: vi.fn(),
        requestDirectoryAccess: vi.fn().mockResolvedValue({}),
    } as unknown as LocalFSAdapter;
}

function createMockSyncManager() {
    return {
        writeFile: vi.fn().mockResolvedValue(undefined),
        deleteFile: vi.fn().mockResolvedValue(undefined),
        createDirectory: vi.fn().mockResolvedValue(undefined),
        deleteDirectory: vi.fn().mockResolvedValue(undefined),
        syncToWebContainer: vi.fn().mockResolvedValue({ filesProcessed: 0, errors: [] }),
        status: vi.fn().mockReturnValue('idle'),
        setExcludePatterns: vi.fn(),
        getExcludePatterns: vi.fn().mockReturnValue([]),
    } as unknown as SyncManager;
}

function createMockEventBus() {
    return {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
    } as unknown as WorkspaceEventEmitter;
}

function createMockFileLock() {
    return {
        acquire: vi.fn().mockResolvedValue(Date.now()),
        release: vi.fn().mockReturnValue(Date.now()),
        isLocked: vi.fn().mockReturnValue(false),
        getLockInfo: vi.fn().mockReturnValue(null),
    } as unknown as FileLock;
}

describe('validatePath', () => {
    it('should accept valid relative paths', () => {
        expect(() => validatePath('src/file.ts')).not.toThrow();
        expect(() => validatePath('components/Button.tsx')).not.toThrow();
        expect(() => validatePath('package.json')).not.toThrow();
    });

    it('should reject path traversal', () => {
        expect(() => validatePath('../secret.txt')).toThrow(PathValidationError);
        expect(() => validatePath('src/../.env')).toThrow(PathValidationError);
    });

    it('should reject absolute paths', () => {
        expect(() => validatePath('/etc/passwd')).toThrow(PathValidationError);
        expect(() => validatePath('C:\\Windows\\system32')).toThrow(PathValidationError);
    });
});

describe('FileToolsFacade', () => {
    let facade: FileToolsFacade;
    let mockLocalFS: ReturnType<typeof createMockLocalFS>;
    let mockSyncManager: ReturnType<typeof createMockSyncManager>;
    let mockEventBus: ReturnType<typeof createMockEventBus>;
    let mockFileLock: ReturnType<typeof createMockFileLock>;

    beforeEach(() => {
        mockLocalFS = createMockLocalFS();
        mockSyncManager = createMockSyncManager();
        mockEventBus = createMockEventBus();
        mockFileLock = createMockFileLock();
        facade = new FileToolsFacade(mockLocalFS, mockSyncManager, mockEventBus, mockFileLock);
    });

    describe('readFile', () => {
        it('should read file content via LocalFSAdapter', async () => {
            const content = await facade.readFile('test.txt');
            expect(mockLocalFS.readFile).toHaveBeenCalledWith('test.txt');
            expect(content).toBe('file content');
        });

        it('should return null for non-existent files', async () => {
            mockLocalFS.readFile = vi.fn().mockRejectedValue(new Error('File not found'));
            const content = await facade.readFile('missing.txt');
            expect(content).toBeNull();
        });

        it('should validate path before reading', async () => {
            await expect(facade.readFile('../secret.txt')).rejects.toThrow(PathValidationError);
            expect(mockLocalFS.readFile).not.toHaveBeenCalled();
        });
    });

    describe('writeFile', () => {
        it('should acquire lock and write via SyncManager', async () => {
            await facade.writeFile('src/index.ts', 'console.log("hello")');
            expect(mockFileLock.acquire).toHaveBeenCalledWith('src/index.ts');
            expect(mockSyncManager.writeFile).toHaveBeenCalledWith('src/index.ts', 'console.log("hello")');
            expect(mockFileLock.release).toHaveBeenCalledWith('src/index.ts');
        });

        it('should emit file:modified event with lock timestamps', async () => {
            await facade.writeFile('src/index.ts', 'content');
            expect(mockEventBus.emit).toHaveBeenCalledWith('file:modified', expect.objectContaining({
                path: 'src/index.ts',
                source: 'agent',
                content: 'content',
                lockAcquired: expect.any(Number),
                lockReleased: expect.any(Number),
            }));
        });
    });

    describe('listDirectory', () => {
        it('should list directory contents', async () => {
            const entries = await facade.listDirectory('');
            expect(mockLocalFS.listDirectory).toHaveBeenCalledWith('');
            expect(entries).toHaveLength(3);
            expect(entries[0]).toEqual({ name: 'file1.ts', path: 'file1.ts', type: 'file' });
        });
    });

    describe('createFile', () => {
        it('should acquire lock and create file via SyncManager', async () => {
            await facade.createFile('new-file.ts', 'export const a = 1;');
            expect(mockFileLock.acquire).toHaveBeenCalledWith('new-file.ts');
            expect(mockSyncManager.writeFile).toHaveBeenCalledWith('new-file.ts', 'export const a = 1;');
            expect(mockFileLock.release).toHaveBeenCalledWith('new-file.ts');
        });

        it('should emit file:created event with lock timestamps', async () => {
            await facade.createFile('new-file.ts');
            expect(mockEventBus.emit).toHaveBeenCalledWith('file:created', expect.objectContaining({
                path: 'new-file.ts',
                source: 'agent',
                lockAcquired: expect.any(Number),
                lockReleased: expect.any(Number),
            }));
        });
    });

    describe('deleteFile', () => {
        it('should acquire lock and delete via SyncManager', async () => {
            await facade.deleteFile('obsolete.ts');
            expect(mockFileLock.acquire).toHaveBeenCalledWith('obsolete.ts');
            expect(mockSyncManager.deleteFile).toHaveBeenCalledWith('obsolete.ts');
            expect(mockFileLock.release).toHaveBeenCalledWith('obsolete.ts');
        });

        it('should emit file:deleted event with lock timestamps', async () => {
            await facade.deleteFile('obsolete.ts');
            expect(mockEventBus.emit).toHaveBeenCalledWith('file:deleted', expect.objectContaining({
                path: 'obsolete.ts',
                source: 'agent',
                lockAcquired: expect.any(Number),
                lockReleased: expect.any(Number),
            }));
        });
    });

    describe('searchFiles', () => {
        it('should find files matching query', async () => {
            mockLocalFS.listDirectory = vi.fn().mockResolvedValue([
                { name: 'Button.tsx', type: 'file', handle: {} },
                { name: 'button.css', type: 'file', handle: {} },
                { name: 'Card.tsx', type: 'file', handle: {} },
            ]);

            const results = await facade.searchFiles('button');
            expect(results).toHaveLength(2);
            expect(results.map(r => r.name)).toEqual(['Button.tsx', 'button.css']);
        });
    });
});


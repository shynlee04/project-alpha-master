/**
 * @fileoverview Agent File Tools Unit Tests
 * @module lib/agent/facades/__tests__/file-tools.test
 *
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 * @story 12-1B - Add Concurrency Control to FileToolsFacade
 * @fix RC-028-001 - Wire ToolPermissionManager to execution layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileToolsFacade, ToolPermissionDeniedError } from '../file-tools-impl';
import { validatePath, PathValidationError } from '../file-tools';
import { FileLock } from '../file-lock';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { SyncManager } from '@/lib/filesystem/sync-manager';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';
import { ToolPermissionManager } from '../../tool-permission-manager';

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

/**
 * Create a mock permission manager that allows all operations by default
 */
function createMockPermissionManager(allowAll = true) {
    const mock = {
        checkPermission: vi.fn((toolId: string) => ({
            needsApproval: false,
            canExecute: allowAll,
            reason: 'auto' as const,
            toolName: toolId.replace(/_/g, ' '),
            toolId,
        })),
        getTrustLevel: vi.fn(() => 'auto' as const),
        setTrustLevel: vi.fn(),
        hasSessionTrust: vi.fn(() => false),
        addSessionTrust: vi.fn(),
        removeSessionTrust: vi.fn(),
        clearSessionTrust: vi.fn(),
        getAllTrustLevels: vi.fn(() => ({})),
        getDefaultTrustLevels: vi.fn(() => ({})),
        resetToDefaults: vi.fn(),
        toJSON: vi.fn(() => '{}'),
        getToolIds: vi.fn(() => []),
        getToolsByLevel: vi.fn(() => []),
        hasPromptTools: vi.fn(() => false),
        hasBlockedTools: vi.fn(() => false),
        setEventBus: vi.fn(),
    } as unknown as ToolPermissionManager;
    return mock;
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
    let mockPermissionManager: ReturnType<typeof createMockPermissionManager>;

    beforeEach(() => {
        mockLocalFS = createMockLocalFS();
        mockSyncManager = createMockSyncManager();
        mockEventBus = createMockEventBus();
        mockFileLock = createMockFileLock();
        mockPermissionManager = createMockPermissionManager(true);
        facade = new FileToolsFacade(
            mockLocalFS,
            mockSyncManager,
            mockEventBus,
            mockFileLock,
            mockPermissionManager
        );
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

    // ============================================================================
    // Advanced Operations Tests (RC-007)
    // ============================================================================

    describe('readMultiple', () => {
        it('should read multiple files atomically', async () => {
            mockLocalFS.readFile = vi.fn()
                .mockResolvedValueOnce({ content: 'content1', path: 'file1.txt' })
                .mockResolvedValueOnce({ content: 'content2', path: 'file2.txt' })
                .mockResolvedValueOnce({ content: 'content3', path: 'file3.txt' });

            const results = await facade.readMultiple(['file1.txt', 'file2.txt', 'file3.txt']);

            expect(results).toHaveLength(3);
            expect(results[0].content).toBe('content1');
            expect(results[1].content).toBe('content2');
            expect(results[2].content).toBe('content3');
        });

        it('should throw error when aborted', async () => {
            const abortController = new AbortController();
            abortController.abort();

            await expect(facade.readMultiple(['file.txt'], abortController.signal))
                .rejects.toThrow('Operation was aborted');
        });

        it('should throw on file read failure', async () => {
            mockLocalFS.readFile = vi.fn().mockRejectedValue(new Error('File not found'));

            await expect(facade.readMultiple(['nonexistent.txt']))
                .rejects.toThrow('Failed to read file "nonexistent.txt"');
        });
    });

    describe('writeMultiple', () => {
        it('should write multiple files with progress tracking', async () => {
            const progressCalls: number[] = [];
            mockSyncManager.writeFile = vi.fn().mockResolvedValue(undefined);

            await facade.writeMultiple(
                [
                    { path: 'file1.txt', content: 'content1' },
                    { path: 'file2.txt', content: 'content2' },
                ],
                (progress) => progressCalls.push(progress)
            );

            expect(mockSyncManager.writeFile).toHaveBeenCalledTimes(2);
            expect(progressCalls).toContain(100);
        });

        it('should emit events for each file written', async () => {
            mockSyncManager.writeFile = vi.fn().mockResolvedValue(undefined);

            await facade.writeMultiple([{ path: 'test.txt', content: 'test' }]);

            expect(mockEventBus.emit).toHaveBeenCalledWith('file:modified', expect.objectContaining({
                path: 'test.txt',
                source: 'agent',
            }));
        });

        it('should rollback on failure', async () => {
            mockSyncManager.writeFile = vi.fn()
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('Disk full'));
            mockSyncManager.deleteFile = vi.fn().mockResolvedValue(undefined);

            await expect(facade.writeMultiple([
                { path: 'file1.txt', content: 'content1' },
                { path: 'file2.txt', content: 'content2' },
            ])).rejects.toThrow();

            // Should have tried to delete the first file (rollback)
            expect(mockSyncManager.deleteFile).toHaveBeenCalledWith('file1.txt');
        });
    });

    describe('globFiles', () => {
        it('should find files by extension', async () => {
            mockLocalFS.listDirectory = vi.fn().mockResolvedValue([
                { name: 'Button.tsx', type: 'file', handle: {} },
                { name: 'button.css', type: 'file', handle: {} },
                { name: 'Card.tsx', type: 'file', handle: {} },
                { name: 'index.tsx', type: 'file', handle: {} },
            ]);

            const results = await facade.globFiles('*.tsx');
            expect(results).toHaveLength(3);
            expect(results.map(r => r.name)).toEqual(['Button.tsx', 'Card.tsx', 'index.tsx']);
        });

        it('should match nested directory patterns', async () => {
            mockLocalFS.listDirectory = vi.fn().mockResolvedValue([
                { name: 'src', type: 'directory', handle: {} },
            ]);

            const results = await facade.globFiles('src/**/*.tsx');
            expect(mockLocalFS.listDirectory).toHaveBeenCalled();
        });

        it('should filter by extension only when no wildcard', async () => {
            mockLocalFS.listDirectory = vi.fn().mockResolvedValue([
                { name: 'test.ts', type: 'file', handle: {} },
                { name: 'test.tsx', type: 'file', handle: {} },
                { name: 'test.js', type: 'file', handle: {} },
            ]);

            const results = await facade.globFiles('.ts');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('test.ts');
        });
    });

    describe('deleteMultiple', () => {
        it('should delete multiple files with progress tracking', async () => {
            const progressCalls: number[] = [];
            mockSyncManager.deleteFile = vi.fn().mockResolvedValue(undefined);

            await facade.deleteMultiple(
                ['file1.txt', 'file2.txt'],
                (progress) => progressCalls.push(progress)
            );

            expect(mockSyncManager.deleteFile).toHaveBeenCalledTimes(2);
            expect(progressCalls).toContain(100);
        });

        it('should emit events for each file deleted', async () => {
            mockSyncManager.deleteFile = vi.fn().mockResolvedValue(undefined);

            await facade.deleteMultiple(['test.txt']);

            expect(mockEventBus.emit).toHaveBeenCalledWith('file:deleted', expect.objectContaining({
                path: 'test.txt',
                source: 'agent',
            }));
        });

        it('should rollback on failure by re-creating files', async () => {
            mockSyncManager.deleteFile = vi.fn()
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('Permission denied'));
            mockSyncManager.writeFile = vi.fn().mockResolvedValue(undefined);

            await expect(facade.deleteMultiple(['file1.txt', 'file2.txt']))
                .rejects.toThrow();

            // Should have tried to re-create the first file (rollback)
            expect(mockSyncManager.writeFile).toHaveBeenCalledWith('file1.txt', '');
        });

        it('should throw error when aborted', async () => {
            const abortController = new AbortController();
            abortController.abort();

            await expect(facade.deleteMultiple(['file.txt'], undefined, abortController.signal))
                .rejects.toThrow('Operation was aborted');
        });
    });

    // ============================================================================
    // RC-028-001: Permission Wiring Tests
    // ============================================================================

    describe('Permission Wiring (RC-028-001)', () => {
        it('should check permission before readFile', async () => {
            await facade.readFile('test.txt');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('read_file');
        });

        it('should check permission before writeFile', async () => {
            await facade.writeFile('test.txt', 'content');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('write_file');
        });

        it('should check permission before listDirectory', async () => {
            await facade.listDirectory('src');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('list_files');
        });

        it('should check permission before createFile', async () => {
            await facade.createFile('new.ts', 'content');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('write_file');
        });

        it('should check permission before deleteFile', async () => {
            mockPermissionManager.checkPermission = vi.fn(() => ({
                needsApproval: false,
                canExecute: true,
                reason: 'session' as const,
                toolName: 'Delete File',
                toolId: 'delete_file',
            }));
            // Re-create facade with updated mock
            facade = new FileToolsFacade(
                mockLocalFS,
                mockSyncManager,
                mockEventBus,
                mockFileLock,
                mockPermissionManager
            );
            await facade.deleteFile('obsolete.ts');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('delete_file');
        });

        it('should check permission before searchFiles', async () => {
            await facade.searchFiles('button');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('list_files');
        });

        it('should check permission before readMultiple', async () => {
            await facade.readMultiple(['file1.txt', 'file2.txt']);
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('read_file');
        });

        it('should check permission before writeMultiple', async () => {
            await facade.writeMultiple([{ path: 'file.txt', content: 'content' }]);
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('write_file');
        });

        it('should check permission before globFiles', async () => {
            await facade.globFiles('**/*.ts');
            expect(mockPermissionManager.checkPermission).toHaveBeenCalledWith('list_files');
        });

        it('should throw ToolPermissionDeniedError when permission denied', async () => {
            // Create a permission manager that denies read_file
            const denyingPermissionManager = {
                checkPermission: vi.fn((toolId: string) => ({
                    needsApproval: false,
                    canExecute: false,
                    reason: 'block' as const,
                    toolName: 'Read File',
                    toolId,
                })),
            } as unknown as ToolPermissionManager;

            const denyingFacade = new FileToolsFacade(
                mockLocalFS,
                mockSyncManager,
                mockEventBus,
                mockFileLock,
                denyingPermissionManager
            );

            await expect(denyingFacade.readFile('test.txt'))
                .rejects.toThrow(ToolPermissionDeniedError);
            expect(mockLocalFS.readFile).not.toHaveBeenCalled();
        });

        it('should not execute operation when permission denied', async () => {
            const denyingPermissionManager = {
                checkPermission: vi.fn((toolId: string) => ({
                    needsApproval: true,
                    canExecute: true,
                    reason: 'prompt' as const,
                    toolName: 'Write File',
                    toolId,
                })),
            } as unknown as ToolPermissionManager;

            const denyingFacade = new FileToolsFacade(
                mockLocalFS,
                mockSyncManager,
                mockEventBus,
                mockFileLock,
                denyingPermissionManager
            );

            // Should throw when requires approval but not granted
            await expect(denyingFacade.writeFile('test.txt', 'content'))
                .rejects.toThrow(ToolPermissionDeniedError);
            expect(mockSyncManager.writeFile).not.toHaveBeenCalled();
            expect(mockFileLock.acquire).not.toHaveBeenCalled();
        });
    });
});


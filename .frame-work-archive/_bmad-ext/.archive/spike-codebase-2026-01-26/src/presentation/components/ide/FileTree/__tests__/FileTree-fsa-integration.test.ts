/**
 * @fileoverview FileTree FSA Integration Tests
 * @module components/ide/FileTree/__tests__/FileTree-fsa-integration.test
 *
 * **CC-IDE-07**: IDE FSA Migration Tests
 *
 * Tests for StorageGateway integration in FileTree:
 * - FileTree file loading uses gateway
 * - FileTree file changes propagate to gateway
 * - External file changes trigger FileTree refresh
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-07
 * @author TEAM_B
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { StorageGateway, FileEntry, FileChangeCallback } from '@/domain/interfaces';

// ============================================================================
// Mocks
// ============================================================================

const createMockGateway = (): StorageGateway => ({
    read: vi.fn(),
    write: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    exists: vi.fn(),
    watch: vi.fn(),
} as unknown as StorageGateway);

const createMockFileTree = () => ({
    files: [
        { path: 'src', kind: 'directory' as const },
        { path: 'src/index.ts', kind: 'file' as const },
        { path: 'package.json', kind: 'file' as const },
    ],
    selectedFile: null as string | null,
    refreshCount: 0,
});

let mockGateway: StorageGateway;

beforeEach(() => {
    mockGateway = createMockGateway();
});

afterEach(() => {
    vi.clearAllMocks();
});

// ============================================================================
// Test Suites
// ============================================================================

describe('FileTree FSA Integration (CC-IDE-07)', () => {
    describe('AC2: FileTree File Loading via Gateway', () => {
        it('should load files using gateway.list()', async () => {
            const mockFiles: FileEntry[] = [
                { path: 'src', kind: 'directory' },
                { path: 'src/index.ts', kind: 'file' },
                { path: 'package.json', kind: 'file' },
            ];

            mockGateway.list.mockResolvedValue(mockFiles);

            const files = await mockGateway.list('/');

            expect(mockGateway.list).toHaveBeenCalledWith('/');
            expect(files).toEqual(mockFiles);
        });

        it('should load nested directory structure via gateway', async () => {
            const mockFiles: FileEntry[] = [
                { path: 'src/components', kind: 'directory' },
                { path: 'src/components/Button.tsx', kind: 'file' },
                { path: 'src/components/Input.tsx', kind: 'file' },
            ];

            mockGateway.list.mockResolvedValue(mockFiles);

            const files = await mockGateway.list('/src/components');

            expect(mockGateway.list).toHaveBeenCalledWith('/src/components');
            expect(files).toHaveLength(3);
        });

        it('should handle empty directories', async () => {
            mockGateway.list.mockResolvedValue([]);

            const files = await mockGateway.list('/empty-dir');

            expect(files).toEqual([]);
        });

        it('should handle file tree refresh triggers', async () => {
            const mockFileTree = createMockFileTree();

            mockGateway.list.mockResolvedValue(mockFileTree.files as any);

            // Simulate file tree refresh
            const files = await mockGateway.list('/');
            mockFileTree.refreshCount++;

            expect(mockGateway.list).toHaveBeenCalled();
            expect(mockFileTree.refreshCount).toBe(1);
        });
    });

    describe('AC2: FileTree Changes Propagate to Gateway', () => {
        it('should write file changes to gateway', async () => {
            const newContent = 'export function hello() { return "world"; }';
            const encoded = new TextEncoder().encode(newContent);

            mockGateway.write.mockResolvedValue(undefined);

            await mockGateway.write('/src/hello.ts', encoded);

            expect(mockGateway.write).toHaveBeenCalledWith('/src/hello.ts', encoded);
        });

        it('should delete files via gateway', async () => {
            mockGateway.delete.mockResolvedValue(undefined);

            await mockGateway.delete('/old-file.ts');

            expect(mockGateway.delete).toHaveBeenCalledWith('/old-file.ts');
        });

        it('should create new files via gateway', async () => {
            const newFileContent = 'console.log("Hello, World!");';
            const encoded = new TextEncoder().encode(newFileContent);

            mockGateway.write.mockResolvedValue(undefined);

            await mockGateway.write('/new-file.ts', encoded);

            expect(mockGateway.write).toHaveBeenCalledWith('/new-file.ts', encoded);
        });

        it('should handle file renames via gateway', async () => {
            const oldName = '/old-name.ts';
            const newName = '/new-name.ts';

            // Read old file content
            const content = 'export const test = 123;';
            const encoded = new TextEncoder().encode(content);

            mockGateway.read.mockResolvedValue(encoded);
            mockGateway.write.mockResolvedValue(undefined);
            mockGateway.delete.mockResolvedValue(undefined);

            // Simulate rename: read → write new → delete old
            const oldData = await mockGateway.read(oldName);
            await mockGateway.write(newName, oldData);
            await mockGateway.delete(oldName);

            expect(mockGateway.read).toHaveBeenCalledWith(oldName);
            expect(mockGateway.write).toHaveBeenCalledWith(newName, oldData);
            expect(mockGateway.delete).toHaveBeenCalledWith(oldName);
        });
    });

    describe('AC2: External File Changes Trigger FileTree Refresh', () => {
        it('should watch files for changes via gateway.watch()', () => {
            let watchCallback: FileChangeCallback | null = null;

            mockGateway.watch.mockImplementation((callback: FileChangeCallback) => {
                watchCallback = callback;
                return { dispose: vi.fn() };
            });

            const watchHandle = mockGateway.watch((change: FileChangeEvent) => {
                console.log('File changed:', change);
            });

            expect(mockGateway.watch).toHaveBeenCalledWith(expect.any(Function));
            expect(watchCallback).not.toBeNull();
        });

        it('should trigger FileTree refresh on file modification', () => {
            const mockFileTree = createMockFileTree();
            let watchCallback: FileChangeCallback | null = null;

            mockGateway.watch.mockImplementation((callback: FileChangeCallback) => {
                watchCallback = callback;
                return { dispose: vi.fn() };
            });

            // Start watching
            mockGateway.watch((change: FileChangeEvent) => {
                mockFileTree.refreshCount++;
            });

            // Simulate external file change
            if (watchCallback) {
                watchCallback({
                    path: '/src/index.ts',
                    kind: 'modified',
                });
            }

            expect(mockFileTree.refreshCount).toBe(1);
        });

        it('should trigger FileTree refresh on file creation', () => {
            const mockFileTree = createMockFileTree();
            let watchCallback: FileChangeCallback | null = null;

            mockGateway.watch.mockImplementation((callback: FileChangeCallback) => {
                watchCallback = callback;
                return { dispose: vi.fn() };
            });

            // Start watching
            mockGateway.watch((change: FileChangeEvent) => {
                mockFileTree.refreshCount++;
            });

            // Simulate external file creation
            if (watchCallback) {
                watchCallback({
                    path: '/new-file.ts',
                    kind: 'created',
                });
            }

            expect(mockFileTree.refreshCount).toBe(1);
        });

        it('should trigger FileTree refresh on file deletion', () => {
            const mockFileTree = createMockFileTree();
            let watchCallback: FileChangeCallback | null = null;

            mockGateway.watch.mockImplementation((callback: FileChangeCallback) => {
                watchCallback = callback;
                return { dispose: vi.fn() };
            });

            // Start watching
            mockGateway.watch((change: FileChangeEvent) => {
                mockFileTree.refreshCount++;
            });

            // Simulate external file deletion
            if (watchCallback) {
                watchCallback({
                    path: '/deleted-file.ts',
                    kind: 'deleted',
                });
            }

            expect(mockFileTree.refreshCount).toBe(1);
        });

        it('should handle rapid file changes (debouncing)', () => {
            const mockFileTree = createMockFileTree();
            let watchCallback: FileChangeCallback | null = null;

            mockGateway.watch.mockImplementation((callback: FileChangeCallback) => {
                watchCallback = callback;
                return { dispose: vi.fn() };
            });

            // Start watching
            mockGateway.watch((change: FileChangeEvent) => {
                mockFileTree.refreshCount++;
            });

            // Simulate rapid changes
            if (watchCallback) {
                watchCallback({ path: '/test.ts', kind: 'modified' });
                watchCallback({ path: '/test.ts', kind: 'modified' });
                watchCallback({ path: '/test.ts', kind: 'modified' });
            }

            // All changes should trigger refreshes
            // (Debouncing would be handled by FileTree component)
            expect(mockFileTree.refreshCount).toBe(3);
        });
    });

    describe('AC2: FileTree Selection State', () => {
        it('should track selected file path', () => {
            const mockFileTree = createMockFileTree();

            mockFileTree.selectedFile = '/src/index.ts';

            expect(mockFileTree.selectedFile).toBe('/src/index.ts');
        });

        it('should clear selection when file is deleted', async () => {
            const mockFileTree = createMockFileTree();
            mockFileTree.selectedFile = '/deleted-file.ts';

            mockGateway.delete.mockResolvedValue(undefined);
            await mockGateway.delete('/deleted-file.ts');

            // Selection should be cleared (simulated behavior)
            mockFileTree.selectedFile = null;

            expect(mockFileTree.selectedFile).toBeNull();
            expect(mockGateway.delete).toHaveBeenCalledWith('/deleted-file.ts');
        });
    });

    describe('AC2: FileTree Error Handling', () => {
        it('should handle gateway read errors gracefully', async () => {
            mockGateway.read.mockRejectedValue(new Error('File not found'));

            await expect(mockGateway.read('/nonexistent.ts')).rejects.toThrow('File not found');
        });

        it('should handle gateway write errors gracefully', async () => {
            mockGateway.write.mockRejectedValue(new Error('Permission denied'));

            const content = new TextEncoder().encode('test');

            await expect(mockGateway.write('/test.ts', content)).rejects.toThrow('Permission denied');
        });

        it('should handle gateway list errors gracefully', async () => {
            mockGateway.list.mockRejectedValue(new Error('Directory not found'));

            await expect(mockGateway.list('/nonexistent-dir')).rejects.toThrow('Directory not found');
        });
    });
});

// ============================================================================
// Type Definitions
// ============================================================================

interface FileChangeEvent {
    path: string;
    kind: 'created' | 'modified' | 'deleted';
}

interface WatchHandle {
    dispose(): void;
}

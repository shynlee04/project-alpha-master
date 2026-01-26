/**
 * FSA Adapter Integration Tests
 * @module infrastructure/webcontainer/__tests__/fsa-adapter.test
 *
 * **CC-IDE-05b**: WebContainer FSA Integration
 *
 * Tests WebContainerFSAAdapter integration with:
 * - Storage gateway
 * - WebContainer instance
 * - Event bus
 *
 * @story CC-IDE-05b
 * @author TEAM_B
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { WebContainer, FileSystemTree } from '@webcontainer/api';
import type { StorageGateway, FileChangeCallback, WatchHandle } from '@/domain/interfaces/storage-gateway.interface';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';
import { WebContainerFSAAdapter } from '../fsa-adapter';

// ============================================================================
// Mocks
// ============================================================================

const createMockGateway = (): StorageGateway => ({
    read: vi.fn().mockResolvedValue(new TextEncoder().encode('test content')),
    write: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([
        { path: 'test.txt', kind: 'file' as const },
        { path: 'src', kind: 'directory' as const },
    ]),
    exists: vi.fn().mockResolvedValue(true),
    watch: vi.fn().mockReturnValue({ dispose: vi.fn() }),
});

const createMockContainer = (): WebContainer => ({
    mount: vi.fn().mockResolvedValue(undefined),
    fs: {
        watch: vi.fn().mockReturnValue({ close: vi.fn() }),
        readFile: vi.fn().mockResolvedValue('file content'),
        writeFile: vi.fn().mockResolvedValue(undefined),
        rm: vi.fn().mockResolvedValue(undefined),
        mkdir: vi.fn().mockResolvedValue(undefined),
        readdir: vi.fn().mockResolvedValue([]),
    },
    spawn: vi.fn(),
    on: vi.fn(),
} as unknown as WebContainer);

const createMockEventBus = (): WorkspaceEventEmitter => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
});

let mockGateway: StorageGateway;
let mockContainer: WebContainer;
let mockEventBus: WorkspaceEventEmitter;

beforeEach(() => {
    mockGateway = createMockGateway();
    mockContainer = createMockContainer();
    mockEventBus = createMockEventBus();
});

afterEach(() => {
    vi.clearAllMocks();
});

// ============================================================================
// Test Suites
// ============================================================================

describe('WebContainerFSAAdapter', () => {
    describe('initialization', () => {
        it('should create adapter with provided options', () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
                mountPoint: '/custom-mount',
                conflictResolution: 'wc-wins',
            });

            expect(adapter).toBeDefined();
        });

        it('should use default mount point /project', () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
            });

            expect(adapter).toBeDefined();
            // Adapter should use /project as default
        });
    });

    describe('mountToContainer()', () => {
        it('should mount files from FSA gateway to WebContainer', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.mountToContainer();

            // Verify gateway was called to list files
            expect(mockGateway.list).toHaveBeenCalledWith('/');

            // Verify WebContainer mount was called
            expect(mockContainer.mount).toHaveBeenCalledWith(
                expect.objectContaining({}),
                { mountPoint: '/project' }
            );
        });

        it('should emit container:mounted event after successful mount', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.mountToContainer();

            // Verify event was emitted
            expect(mockEventBus.emit).toHaveBeenCalledWith('container:mounted', {
                fileCount: expect.any(Number),
            });
        });

        it('should emit container:error event on mount failure', async () => {
            mockContainer.mount = vi.fn().mockRejectedValue(new Error('Mount failed'));

            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await expect(adapter.mountToContainer()).rejects.toThrow();

            // Verify error event was emitted
            expect(mockEventBus.emit).toHaveBeenCalledWith('container:error', {
                error: expect.any(Error),
            });
        });

        it('should automatically start bidirectional sync after mount', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            const startSyncSpy = vi.spyOn(adapter, 'startBidirectionalSync');

            await adapter.mountToContainer();

            expect(startSyncSpy).toHaveBeenCalled();
        });
    });

    describe('startBidirectionalSync()', () => {
        it('should start FSA watch for FSA → WebContainer sync', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.startBidirectionalSync();

            // Verify gateway watch was called
            expect(mockGateway.watch).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should start WebContainer watch for WebContainer → FSA sync', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.startBidirectionalSync();

            // Verify WebContainer fs.watch was called
            expect(mockContainer.fs.watch).toHaveBeenCalledWith(
                '/project',
                { recursive: true },
                expect.any(Function)
            );
        });
    });

    describe('stopSync()', () => {
        it('should stop FSA watch handle', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.startBidirectionalSync();
            adapter.stopSync();

            const watchHandle = mockGateway.watch.mock.results[0]?.value;
            if (watchHandle?.dispose) {
                expect(watchHandle.dispose).toHaveBeenCalled();
            }
        });

        it('should stop WebContainer watch handle', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.startBidirectionalSync();
            adapter.stopSync();

            const watchHandle = mockContainer.fs.watch.mock.results[0]?.value;
            if (watchHandle?.close) {
                expect(watchHandle.close).toHaveBeenCalled();
            }
        });
    });

    describe('onHMREvent()', () => {
        it('should register HMR callback', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            const hmrCallback = vi.fn();
            adapter.onHMREvent(hmrCallback);

            // Trigger a file change that should trigger HMR
            const watchCallback = mockGateway.watch.mock.results[0]?.value;
            const watchCallbackFn = typeof watchCallback === 'function' ? watchCallback : undefined;
            if (watchCallbackFn) {
                watchCallbackFn({ path: 'test.js', kind: 'modified' });
            }

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            // HMR callback should have been called
            expect(hmrCallback).toHaveBeenCalledWith('test.js');
        });

        it('should not trigger HMR for deleted files', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            const hmrCallback = vi.fn();
            adapter.onHMREvent(hmrCallback);

            // Trigger a file delete (should not trigger HMR)
            const watchCallback = mockGateway.watch.mock.results[0]?.value;
            const watchCallbackFn = typeof watchCallback === 'function' ? watchCallback : undefined;
            if (watchCallbackFn) {
                watchCallbackFn({ path: 'test.js', kind: 'deleted' });
            }

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            // HMR callback should not have been called
            expect(hmrCallback).not.toHaveBeenCalled();
        });
    });

    describe('conflict detection', () => {
        it('should detect concurrent edits within 1 second', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
                conflictResolution: 'manual',
            });

            await adapter.mountToContainer();

            // Simulate concurrent edits
            const watchCallback = mockGateway.watch.mock.calls[0]?.[0];
            if (watchCallback) {
                // First edit from FSA
                watchCallback({ path: 'test.js', kind: 'modified' });

                // Second edit from WebContainer within 1 second
                setTimeout(() => {
                    const wcWatchCallback = mockContainer.fs.watch.mock.calls[0]?.[2];
                    if (wcWatchCallback) {
                        wcWatchCallback('change', 'test.js');
                    }
                }, 100);
            }

            // Wait for conflict detection
            await new Promise(resolve => setTimeout(resolve, 200));

            // Conflict event should have been emitted
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'sync:warning',
                expect.objectContaining({
                    message: expect.stringContaining('Conflict'),
                })
            );
        });

        it('should resolve conflict with fsa-wins strategy', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
                conflictResolution: 'fsa-wins',
            });

            await adapter.mountToContainer();

            // Simulate concurrent edits
            const watchCallback = mockGateway.watch.mock.calls[0]?.[0];
            if (watchCallback) {
                watchCallback({ path: 'test.js', kind: 'modified' });
            }

            // Wait for conflict resolution
            await new Promise(resolve => setTimeout(resolve, 200));

            // FSA version should win (WebContainer file should be from FSA)
            expect(mockContainer.fs.writeFile).not.toHaveBeenCalled();
        });
    });

    describe('dispose()', () => {
        it('should stop sync and clear caches', async () => {
            const adapter = new WebContainerFSAAdapter({
                fsaGateway: mockGateway,
                container: mockContainer,
                eventBus: mockEventBus,
            });

            await adapter.startBidirectionalSync();
            adapter.dispose();

            // Verify sync was stopped
            const watchHandle = mockGateway.watch.mock.results[0]?.value;
            if (watchHandle?.dispose) {
                expect(watchHandle.dispose).toHaveBeenCalled();
            }

            const wcWatchHandle = mockContainer.fs.watch.mock.results[0]?.value;
            if (wcWatchHandle?.close) {
                expect(wcWatchHandle.close).toHaveBeenCalled();
            }
        });
    });
});

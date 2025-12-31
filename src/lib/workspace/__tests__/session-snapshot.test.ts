/**
 * @fileoverview Session Snapshot Tests
 * @governance EPIC-24-5
 */

import { db, type SessionSnapshotRecord } from '@/lib/state/dexie-db';
import {
    SessionSnapshotManager,
    sessionSnapshotManager,
    saveSessionSnapshot,
    loadSessionSnapshot,
    restoreSessionSnapshot,
    triggerSnapshot,
    deleteSessionSnapshot,
    getSnapshotHistory,
    clearProjectSnapshots,
    cleanupExpiredSnapshots,
    cleanupOldSnapshots,
    type SessionSnapshot,
    type SnapshotMetadata,
} from '../session-snapshot';

// Mock the IDE store
vi.mock('@/lib/state/ide-store', () => ({
    useIDEStore: {
        getState: vi.fn(() => ({
            openFiles: ['src/main.ts', 'src/app.tsx'],
            activeFile: 'src/main.ts',
            expandedPaths: new Set(['src', 'src/components']),
            panelLayouts: { sidebar: [200, 800] },
            terminalTab: 'terminal',
            chatVisible: true,
            activeFileScrollTop: 100,
            setExpandedPaths: vi.fn(),
            setActiveFile: vi.fn(),
            setActiveFileScrollTop: vi.fn(),
        })),
    },
}));

describe('SessionSnapshotManager', () => {
    const testProjectId = 'test-project-1';
    let manager: SessionSnapshotManager;

    beforeEach(async () => {
        manager = new SessionSnapshotManager();
        // Clear all snapshots before each test
        await db.sessionSnapshots.clear();
    });

    describe('captureSessionState', () => {
        it('should capture current IDE state', async () => {
            const snapshot = await manager.captureSessionState(testProjectId);

            expect(snapshot.id).toContain(testProjectId);
            expect(snapshot.projectId).toBe(testProjectId);
            expect(snapshot.createdAt).toBeTypeOf('number');
            expect(snapshot.expiresAt).toBeGreaterThan(snapshot.createdAt);
            expect(snapshot.snapshot.openFiles).toEqual(['src/main.ts', 'src/app.tsx']);
            expect(snapshot.snapshot.activeFile).toBe('src/main.ts');
        });

        it('should set expiration to 7 days from now', async () => {
            const snapshot = await manager.captureSessionState(testProjectId);
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;

            expect(snapshot.expiresAt - snapshot.createdAt).toBeCloseTo(sevenDays, -3);
        });

        it('should include scroll positions for active file', async () => {
            const snapshot = await manager.captureSessionState(testProjectId);

            expect(snapshot.snapshot.scrollPositions['src/main.ts']).toBe(100);
        });
    });

    describe('triggerSnapshot', () => {
        it('should save snapshot after debounce delay', async () => {
            vi.useFakeTimers();

            manager.triggerSnapshot(testProjectId);

            // Should not save immediately
            let snapshots = await db.sessionSnapshots.toArray();
            expect(snapshots.length).toBe(0);

            // Fast-forward past debounce delay
            vi.advanceTimersByTime(6000);
            await new Promise(resolve => setTimeout(resolve, 100));

            snapshots = await db.sessionSnapshots.toArray();
            expect(snapshots.length).toBe(1);

            vi.useRealTimers();
        });

        it('should debounce rapid calls', async () => {
            vi.useFakeTimers();

            // Trigger multiple times rapidly
            manager.triggerSnapshot(testProjectId);
            manager.triggerSnapshot(testProjectId);
            manager.triggerSnapshot(testProjectId);

            // Fast-forward past debounce delay
            vi.advanceTimersByTime(6000);
            await new Promise(resolve => setTimeout(resolve, 100));

            const snapshots = await db.sessionSnapshots.toArray();
            // Should only have one snapshot due to debouncing
            expect(snapshots.length).toBe(1);

            vi.useRealTimers();
        });

        it('should reset timer on new trigger', async () => {
            vi.useFakeTimers();

            manager.triggerSnapshot(testProjectId);

            // Trigger again before debounce completes
            vi.advanceTimersByTime(3000);
            manager.triggerSnapshot(testProjectId);

            // First debounce period should not have saved
            let snapshots = await db.sessionSnapshots.toArray();
            expect(snapshots.length).toBe(0);

            // Advance past second debounce
            vi.advanceTimersByTime(3000);
            await new Promise(resolve => setTimeout(resolve, 100));

            snapshots = await db.sessionSnapshots.toArray();
            expect(snapshots.length).toBe(1);

            vi.useRealTimers();
        });
    });

    describe('saveSnapshot', () => {
        it('should save snapshot to IndexedDB', async () => {
            const snapshot: SessionSnapshot = {
                id: `${testProjectId}:1234567890`,
                projectId: testProjectId,
                createdAt: Date.now(),
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: ['test.ts'],
                    activeFile: 'test.ts',
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [200, 800],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await manager.saveSnapshot(snapshot);

            const saved = await db.sessionSnapshots.get(snapshot.id);
            expect(saved).toBeDefined();
        });
    });

    describe('getLatestSnapshot', () => {
        it('should return most recent snapshot for project', async () => {
            const now = Date.now();

            // Create two snapshots
            const snapshot1: SessionSnapshotRecord = {
                id: `${testProjectId}:${now - 10000}`,
                projectId: testProjectId,
                createdAt: now - 10000,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: ['old.ts'],
                    activeFile: 'old.ts',
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            const snapshot2: SessionSnapshotRecord = {
                id: `${testProjectId}:${now}`,
                projectId: testProjectId,
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: ['new.ts'],
                    activeFile: 'new.ts',
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.bulkPut([snapshot1, snapshot2]);

            const latest = await manager.getLatestSnapshot(testProjectId);

            expect(latest).toBeDefined();
            expect(latest?.id).toBe(snapshot2.id);
        });

        it('should return null when no snapshots exist', async () => {
            const latest = await manager.getLatestSnapshot('nonexistent-project');
            expect(latest).toBeNull();
        });

        it('should exclude expired snapshots', async () => {
            const now = Date.now();

            const expiredSnapshot: SessionSnapshotRecord = {
                id: `${testProjectId}:${now - 10000}`,
                projectId: testProjectId,
                createdAt: now - 10000,
                expiresAt: now - 1000, // Expired
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.put(expiredSnapshot);

            const latest = await manager.getLatestSnapshot(testProjectId);
            expect(latest).toBeNull();
        });
    });

    describe('getSnapshotHistory', () => {
        it('should return all snapshots for project sorted by createdAt', async () => {
            const now = Date.now();

            const snapshot1: SessionSnapshotRecord = {
                id: `${testProjectId}:${now - 20000}`,
                projectId: testProjectId,
                createdAt: now - 20000,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            const snapshot2: SessionSnapshotRecord = {
                id: `${testProjectId}:${now - 10000}`,
                projectId: testProjectId,
                createdAt: now - 10000,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            const snapshot3: SessionSnapshotRecord = {
                id: `${testProjectId}:${now}`,
                projectId: testProjectId,
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.bulkPut([snapshot1, snapshot2, snapshot3]);

            const history = await manager.getSnapshotHistory(testProjectId);

            expect(history).toHaveLength(3);
            // Should be sorted by createdAt descending (most recent first)
            expect(history[0].id).toBe(snapshot3.id);
            expect(history[1].id).toBe(snapshot2.id);
            expect(history[2].id).toBe(snapshot1.id);
        });

        it('should only return snapshots for specified project', async () => {
            const now = Date.now();

            const snapshot1: SessionSnapshotRecord = {
                id: `other-project:${now}`,
                projectId: 'other-project',
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            const snapshot2: SessionSnapshotRecord = {
                id: `${testProjectId}:${now}`,
                projectId: testProjectId,
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.bulkPut([snapshot1, snapshot2]);

            const history = await manager.getSnapshotHistory(testProjectId);

            expect(history).toHaveLength(1);
            expect(history[0].id).toBe(snapshot2.id);
        });
    });

    describe('restoreSession', () => {
        it('should restore IDE state from snapshot', async () => {
            const { useIDEStore } = await import('@/lib/state/ide-store');
            const mockSetExpandedPaths = vi.fn();
            const mockSetActiveFile = vi.fn();
            const mockSetActiveFileScrollTop = vi.fn();

            (useIDEStore.getState as any).mockReturnValue({
                setExpandedPaths: mockSetExpandedPaths,
                setActiveFile: mockSetActiveFile,
                setActiveFileScrollTop: mockSetActiveFileScrollTop,
            });

            const snapshot: SessionSnapshot = {
                id: `${testProjectId}:1234567890`,
                projectId: testProjectId,
                createdAt: Date.now(),
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: ['src/restore.ts'],
                    activeFile: 'src/restore.ts',
                    cursorPositions: {},
                    scrollPositions: { 'src/restore.ts': 200 },
                    panelWidths: [300, 700],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await manager.restoreSession(snapshot);

            expect(mockSetExpandedPaths).toHaveBeenCalledWith(['src/restore.ts']);
            expect(mockSetActiveFile).toHaveBeenCalledWith('src/restore.ts');
            expect(mockSetActiveFileScrollTop).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteSnapshot', () => {
        it('should delete specified snapshot', async () => {
            const snapshotId = `${testProjectId}:1234567890`;

            const snapshot: SessionSnapshotRecord = {
                id: snapshotId,
                projectId: testProjectId,
                createdAt: Date.now(),
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.put(snapshot);

            let exists = await db.sessionSnapshots.get(snapshotId);
            expect(exists).toBeDefined();

            await manager.deleteSnapshot(snapshotId);

            exists = await db.sessionSnapshots.get(snapshotId);
            expect(exists).toBeUndefined();
        });
    });

    describe('clearProjectSnapshots', () => {
        it('should delete all snapshots for project', async () => {
            const now = Date.now();

            const snapshot1: SessionSnapshotRecord = {
                id: `${testProjectId}:${now - 10000}`,
                projectId: testProjectId,
                createdAt: now - 10000,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            const snapshot2: SessionSnapshotRecord = {
                id: `${testProjectId}:${now}`,
                projectId: testProjectId,
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            // Add snapshot for different project (should not be deleted)
            const otherSnapshot: SessionSnapshotRecord = {
                id: `other-project:${now}`,
                projectId: 'other-project',
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.bulkPut([snapshot1, snapshot2, otherSnapshot]);

            await manager.clearProjectSnapshots(testProjectId);

            const remaining = await db.sessionSnapshots.toArray();
            expect(remaining).toHaveLength(1);
            expect(remaining[0].projectId).toBe('other-project');
        });
    });

    describe('cleanupExpiredSnapshots', () => {
        it('should delete expired snapshots', async () => {
            const now = Date.now();

            const expiredSnapshot: SessionSnapshotRecord = {
                id: `${testProjectId}:${now - 10000}`,
                projectId: testProjectId,
                createdAt: now - 10000,
                expiresAt: now - 1000, // Expired
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            const validSnapshot: SessionSnapshotRecord = {
                id: `${testProjectId}:${now}`,
                projectId: testProjectId,
                createdAt: now,
                expiresAt: now + 7 * 24 * 60 * 60 * 1000, // Not expired
                snapshot: {
                    openFiles: [],
                    activeFile: null,
                    cursorPositions: {},
                    scrollPositions: {},
                    panelWidths: [],
                    terminalHistory: [],
                    chatState: {
                        activeConversationId: null,
                        scrollPosition: 0,
                    },
                },
            };

            await db.sessionSnapshots.bulkPut([expiredSnapshot, validSnapshot]);

            await manager.cleanupExpiredSnapshots();

            const remaining = await db.sessionSnapshots.toArray();
            expect(remaining).toHaveLength(1);
            expect(remaining[0].id).toBe(validSnapshot.id);
        });
    });

    describe('cleanupOldSnapshots', () => {
        it('should keep only specified number of recent snapshots', async () => {
            const now = Date.now();

            // Create 15 snapshots
            const snapshots: SessionSnapshotRecord[] = [];
            for (let i = 0; i < 15; i++) {
                snapshots.push({
                    id: `${testProjectId}:${now - i * 1000}`,
                    projectId: testProjectId,
                    createdAt: now - i * 1000,
                    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
                    snapshot: {
                        openFiles: [],
                        activeFile: null,
                        cursorPositions: {},
                        scrollPositions: {},
                        panelWidths: [],
                        terminalHistory: [],
                        chatState: {
                            activeConversationId: null,
                            scrollPosition: 0,
                        },
                    },
                });
            }

            await db.sessionSnapshots.bulkPut(snapshots);

            await manager.cleanupOldSnapshots(testProjectId, 10);

            const remaining = await db.sessionSnapshots.toArray();
            expect(remaining).toHaveLength(10);
        });
    });
});

describe('Convenience Functions', () => {
    const testProjectId = 'test-project-2';

    beforeEach(async () => {
        await db.sessionSnapshots.clear();
    });

    it('saveSessionSnapshot should capture and save', async () => {
        await saveSessionSnapshot(testProjectId);

        const snapshots = await db.sessionSnapshots.toArray();
        expect(snapshots.length).toBe(1);
    });

    it('loadSessionSnapshot should return latest snapshot', async () => {
        await saveSessionSnapshot(testProjectId);

        const snapshot = await loadSessionSnapshot(testProjectId);
        expect(snapshot).toBeDefined();
        expect(snapshot?.projectId).toBe(testProjectId);
    });

    it('deleteSessionSnapshot should delete snapshot', async () => {
        const snapshotId = `${testProjectId}:1234567890`;
        const snapshot: SessionSnapshotRecord = {
            id: snapshotId,
            projectId: testProjectId,
            createdAt: Date.now(),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            snapshot: {
                openFiles: [],
                activeFile: null,
                cursorPositions: {},
                scrollPositions: {},
                panelWidths: [],
                terminalHistory: [],
                chatState: {
                    activeConversationId: null,
                    scrollPosition: 0,
                },
            },
        };

        await db.sessionSnapshots.put(snapshot);
        await deleteSessionSnapshot(snapshotId);

        const deleted = await db.sessionSnapshots.get(snapshotId);
        expect(deleted).toBeUndefined();
    });

    it('getSnapshotHistory should return metadata', async () => {
        await saveSessionSnapshot(testProjectId);

        const history = await getSnapshotHistory(testProjectId);
        expect(history).toHaveLength(1);
        expect(history[0].projectId).toBe(testProjectId);
    });

    it('clearProjectSnapshots should delete all project snapshots', async () => {
        await saveSessionSnapshot(testProjectId);
        await clearProjectSnapshots(testProjectId);

        const snapshots = await db.sessionSnapshots.toArray();
        expect(snapshots.length).toBe(0);
    });
});

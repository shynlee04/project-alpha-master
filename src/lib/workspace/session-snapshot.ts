/**
 * @fileoverview Session State Snapshot Manager
 * @module lib/workspace/session-snapshot
 * @governance EPIC-24-5
 *
 * Captures and restores complete IDE session state for seamless resumption.
 * Provides automatic debounced snapshots and manual snapshot controls.
 *
 * Story 24-5: Session State Snapshot System
 *
 * @example
 * ```tsx
 * import { SessionSnapshotManager } from '@/lib/workspace/session-snapshot';
 *
 * // Auto-snapshot on state changes
 * const manager = new SessionSnapshotManager();
 * manager.triggerSnapshot(projectId);
 *
 * // Restore on project load
 * const snapshot = await manager.getLatestSnapshot(projectId);
 * if (snapshot) {
 *   await manager.restoreSession(snapshot);
 * }
 * ```
 */

import { db, type SessionSnapshotRecord } from '@/infrastructure/persistence/dexie-db';
import { useIDEStore } from '@/lib/state/ide-store';

// ============================================================================
// Types
// ============================================================================

/**
 * Session snapshot data structure
 * Matches the schema in SessionSnapshotRecord
 */
export interface SessionSnapshot {
    id: string;
    projectId: string;
    createdAt: number;
    expiresAt: number;
    snapshot: {
        openFiles: string[];
        activeFile: string | null;
        cursorPositions: Record<string, { line: number; column: number }>;
        scrollPositions: Record<string, number>;
        panelWidths: number[];
        terminalHistory: string[];
        chatState: {
            activeConversationId: string | null;
            scrollPosition: number;
        };
    };
}

/**
 * Snapshot metadata for history UI
 */
export interface SnapshotMetadata {
    id: string;
    projectId: string;
    createdAt: number;
    isActive: boolean;
}

// ============================================================================
// Session Snapshot Manager
// ============================================================================

/**
 * Manages session state snapshots with automatic debouncing
 * and manual snapshot controls.
 */
export class SessionSnapshotManager {
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_DELAY = 5000; // 5 seconds

    /**
     * Capture current IDE state as a snapshot
     */
    async captureSessionState(projectId: string): Promise<SessionSnapshot> {
        const ideState = useIDEStore.getState();

        const now = Date.now();
        const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

        return {
            id: this.generateSnapshotId(projectId, now),
            projectId,
            createdAt: now,
            expiresAt,
            snapshot: {
                openFiles: ideState.openFiles,
                activeFile: ideState.activeFile,
                cursorPositions: {}, // TODO: Integrate with Monaco editor
                scrollPositions: {
                    [ideState.activeFile || '']: ideState.activeFileScrollTop,
                },
                panelWidths: this.extractPanelWidths(ideState.panelLayouts),
                terminalHistory: [], // TODO: Integrate with terminal store
                chatState: {
                    activeConversationId: null, // TODO: Integrate with chat store
                    scrollPosition: 0, // TODO: Integrate with chat store
                },
            },
        };
    }

    /**
     * Trigger snapshot with debouncing
     * Rapid state changes will only result in one snapshot after delay
     */
    triggerSnapshot(projectId: string): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(async () => {
            try {
                const snapshot = await this.captureSessionState(projectId);
                await this.saveSnapshot(snapshot);
                console.log('[SessionSnapshot] Snapshot saved:', snapshot.id);
            } catch (error) {
                console.error('[SessionSnapshot] Failed to save snapshot:', error);
            }
        }, this.DEBOUNCE_DELAY);
    }

    /**
     * Save snapshot to IndexedDB
     */
    async saveSnapshot(snapshot: SessionSnapshot): Promise<void> {
        await db.sessionSnapshots.put(snapshot as SessionSnapshotRecord);
    }

    /**
     * Load latest snapshot for a project
     */
    async getLatestSnapshot(projectId: string): Promise<SessionSnapshot | null> {
        const now = Date.now();

        const snapshots = await db.sessionSnapshots
            .where('projectId')
            .equals(projectId)
            .and((snapshot) => snapshot.expiresAt > now)
            .reverse()
            .sortBy('createdAt');

        if (snapshots.length === 0) {
            return null;
        }

        return snapshots[0] as unknown as SessionSnapshot;
    }

    /**
     * Get all snapshots for a project (for history UI)
     */
    async getSnapshotHistory(projectId: string): Promise<SnapshotMetadata[]> {
        const now = Date.now();

        const snapshots = await db.sessionSnapshots
            .where('projectId')
            .equals(projectId)
            .and((snapshot) => snapshot.expiresAt > now)
            .reverse()
            .sortBy('createdAt');

        return snapshots.map((s) => ({
            id: s.id,
            projectId: s.projectId,
            createdAt: s.createdAt,
            isActive: false,
        }));
    }

    /**
     * Restore session state from a snapshot
     */
    async restoreSession(snapshot: SessionSnapshot): Promise<void> {
        const store = useIDEStore.getState();

        // Restore open files
        if (snapshot.snapshot.openFiles.length > 0) {
            store.setExpandedPaths(snapshot.snapshot.openFiles);
        }

        // Restore active file
        if (snapshot.snapshot.activeFile) {
            store.setActiveFile(snapshot.snapshot.activeFile);
        }

        // Restore scroll position
        if (snapshot.snapshot.activeFile && snapshot.snapshot.scrollPositions[snapshot.snapshot.activeFile]) {
            store.setActiveFileScrollTop(snapshot.snapshot.scrollPositions[snapshot.snapshot.activeFile]);
        }

        // Restore panel layouts
        // TODO: Restore panel widths to layout
    }

    /**
     * Delete a specific snapshot
     */
    async deleteSnapshot(snapshotId: string): Promise<void> {
        await db.sessionSnapshots.delete(snapshotId);
    }

    /**
     * Clear all snapshots for a project
     */
    async clearProjectSnapshots(projectId: string): Promise<void> {
        await db.sessionSnapshots.where('projectId').equals(projectId).delete();
    }

    /**
     * Clean up expired snapshots (older than 7 days)
     */
    async cleanupExpiredSnapshots(): Promise<void> {
        const now = Date.now();

        const expiredCount = await db.sessionSnapshots
            .where('expiresAt')
            .belowOrEqual(now)
            .delete();

        if (expiredCount > 0) {
            console.log(`[SessionSnapshot] Cleaned up ${expiredCount} expired snapshots`);
        }
    }

    /**
     * Clean up old snapshots (keep only last 10 per project)
     */
    async cleanupOldSnapshots(projectId: string, keepCount = 10): Promise<void> {
        const snapshots = await db.sessionSnapshots
            .where('projectId')
            .equals(projectId)
            .reverse()
            .sortBy('createdAt');

        if (snapshots.length > keepCount) {
            const toDelete = snapshots.slice(keepCount);
            for (const snapshot of toDelete) {
                await db.sessionSnapshots.delete(snapshot.id);
            }
            console.log(`[SessionSnapshot] Deleted ${toDelete.length} old snapshots`);
        }
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * Generate snapshot ID from project and timestamp
     */
    private generateSnapshotId(projectId: string, timestamp: number): string {
        return `${projectId}:${timestamp}`;
    }

    /**
     * Extract panel widths from panel layouts
     */
    private extractPanelWidths(panelLayouts: Record<string, number[]>): number[] {
        // Get the first panel layout as widths
        const layouts = Object.values(panelLayouts);
        return layouts.length > 0 ? layouts[0] : [];
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global session snapshot manager instance
 */
export const sessionSnapshotManager = new SessionSnapshotManager();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Save session snapshot (convenience function)
 */
export async function saveSessionSnapshot(projectId: string): Promise<void> {
    const snapshot = await sessionSnapshotManager.captureSessionState(projectId);
    await sessionSnapshotManager.saveSnapshot(snapshot);
}

/**
 * Load latest session snapshot (convenience function)
 */
export async function loadSessionSnapshot(projectId: string): Promise<SessionSnapshot | null> {
    return sessionSnapshotManager.getLatestSnapshot(projectId);
}

/**
 * Restore session from snapshot (convenience function)
 */
export async function restoreSessionSnapshot(snapshot: SessionSnapshot): Promise<void> {
    await sessionSnapshotManager.restoreSession(snapshot);
}

/**
 * Trigger debounced snapshot (convenience function)
 */
export function triggerSnapshot(projectId: string): void {
    sessionSnapshotManager.triggerSnapshot(projectId);
}

/**
 * Delete snapshot (convenience function)
 */
export async function deleteSessionSnapshot(snapshotId: string): Promise<void> {
    await sessionSnapshotManager.deleteSnapshot(snapshotId);
}

/**
 * Get snapshot history (convenience function)
 */
export async function getSnapshotHistory(projectId: string): Promise<SnapshotMetadata[]> {
    return sessionSnapshotManager.getSnapshotHistory(projectId);
}

/**
 * Clear project snapshots (convenience function)
 */
export async function clearProjectSnapshots(projectId: string): Promise<void> {
    await sessionSnapshotManager.clearProjectSnapshots(projectId);
}

/**
 * Clean up expired snapshots (convenience function)
 */
export async function cleanupExpiredSnapshots(): Promise<void> {
    await sessionSnapshotManager.cleanupExpiredSnapshots();
}

/**
 * Clean up old snapshots (convenience function)
 */
export async function cleanupOldSnapshots(projectId: string, keepCount?: number): Promise<void> {
    await sessionSnapshotManager.cleanupOldSnapshots(projectId, keepCount);
}

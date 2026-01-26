/**
 * @fileoverview Session Snapshot Helper Functions
 * @module infrastructure/persistence/dexie-db-helpers/session-snapshot-helpers
 * @governance ARC-1.1
 *
 * Helper functions for session snapshot management.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SessionSnapshotRecord } from '../dexie-db-types';
import { db } from '../dexie-db';

/**
 * Save session snapshot
 *
 * @param record - Session snapshot record (without timestamps)
 */
export async function saveSessionSnapshot(
    record: Omit<SessionSnapshotRecord, 'createdAt' | 'expiresAt'>
): Promise<void> {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    await db.sessionSnapshots.put({
        ...record,
        createdAt: now,
        expiresAt: now + sevenDays,
    });
}

/**
 * Get latest session snapshot for a project
 *
 * @param projectId - The project ID to query
 * @returns Latest non-expired session snapshot or undefined if not found
 */
export async function getLatestSessionSnapshot(
    projectId: string
): Promise<SessionSnapshotRecord | undefined> {
    const now = Date.now();
    const snapshots = await db.sessionSnapshots
        .where('[projectId+createdAt]')
        .between([projectId, 0], [projectId, now])
        .reverse()
        .limit(1)
        .toArray();

    // Return only if not expired
    const snapshot = snapshots[0];
    if (snapshot && snapshot.expiresAt > now) {
        return snapshot;
    }
    return undefined;
}

/**
 * Delete session snapshot
 *
 * @param id - The snapshot ID to delete
 */
export async function deleteSessionSnapshot(id: string): Promise<void> {
    await db.sessionSnapshots.delete(id);
}

/**
 * Clear expired session snapshots
 *
 * @returns Number of snapshots deleted
 */
export async function clearExpiredSessionSnapshots(): Promise<number> {
    const now = Date.now();
    return db.sessionSnapshots.where('expiresAt').below(now).delete();
}

/**
 * Clear all session snapshots for a project
 *
 * @param projectId - The project ID
 * @returns Number of snapshots deleted
 */
export async function clearProjectSessionSnapshots(projectId: string): Promise<number> {
    return db.sessionSnapshots.where('projectId').equals(projectId).delete();
}

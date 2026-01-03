/**
 * @fileoverview Sync Status Helper Functions
 * @module lib/state/dexie-db-helpers/sync-status-helpers
 * @governance ARC-1.1
 *
 * Helper functions for sync status CRUD operations.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SyncStatusRecord } from '../dexie-db-session-types';
import { db } from '../dexie-db';

/**
 * Get sync status for a specific file path
 *
 * @param filePath - The file path to query
 * @returns Sync status record or undefined if not found
 */
export async function getSyncStatus(filePath: string): Promise<SyncStatusRecord | undefined> {
    const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return db.syncStatus.get(id);
}

/**
 * Set sync status for a file
 *
 * @param record - Sync status record (without id, createdAt, updatedAt)
 */
export async function setSyncStatus(record: Omit<SyncStatusRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const id = `sync-${record.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await db.syncStatus.put({
        ...record,
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
}

/**
 * Update sync status by file path
 *
 * @param filePath - The file path to update
 * @param updates - Partial sync status record to update
 */
export async function updateSyncStatus(
    filePath: string,
    updates: Partial<Omit<SyncStatusRecord, 'id' | 'path'>>
): Promise<void> {
    const existing = await getSyncStatus(filePath);
    if (existing) {
        const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await db.syncStatus.update(id, { ...updates, updatedAt: Date.now() });
    }
}

/**
 * Delete sync status for a file
 *
 * @param filePath - The file path to delete
 */
export async function deleteSyncStatus(filePath: string): Promise<void> {
    const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await db.syncStatus.delete(id);
}

/**
 * Get all sync status items by status
 *
 * @param status - The sync status to filter by
 * @returns Array of sync status records matching the status
 */
export async function getSyncStatusByStatus(status: SyncStatusRecord['syncStatus']): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals(status).toArray();
}

/**
 * Get all pending sync status items
 *
 * @returns Array of sync status records with status 'pending'
 */
export async function getPendingSyncStatus(): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals('pending').toArray();
}

/**
 * Get all error sync status items
 *
 * @returns Array of sync status records with status 'error'
 */
export async function getErrorSyncStatus(): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals('error').toArray();
}

/**
 * Clear old sync status entries (older than 7 days)
 *
 * @param maxAgeMs - Maximum age in milliseconds (default: 7 days)
 * @returns Number of entries deleted
 */
export async function clearOldSyncStatus(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    const oldEntries = await db.syncStatus
        .where('updatedAt')
        .below(cutoff)
        .toArray();

    for (const entry of oldEntries) {
        await db.syncStatus.delete(entry.id);
    }

    return oldEntries.length;
}

/**
 * Get sync status statistics
 *
 * @returns Object with counts by status type
 */
export async function getSyncStatusStats(): Promise<{
    total: number;
    pending: number;
    syncing: number;
    synced: number;
    error: number;
    conflict: number;
}> {
    const all = await db.syncStatus.toArray();
    return {
        total: all.length,
        pending: all.filter((s) => s.syncStatus === 'pending').length,
        syncing: all.filter((s) => s.syncStatus === 'syncing').length,
        synced: all.filter((s) => s.syncStatus === 'synced').length,
        error: all.filter((s) => s.syncStatus === 'error').length,
        conflict: all.filter((s) => s.syncStatus === 'conflict').length,
    };
}

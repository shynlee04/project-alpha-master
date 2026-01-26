/**
 * @fileoverview Sync Status Helper Functions (Basic Operations)
 * @module infrastructure/persistence/dexie-db-helpers/sync-status-helpers-basic
 * @governance ARC-1.1
 *
 * Helper functions for sync status CRUD operations (Part 1 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SyncStatusRecord } from '../dexie-db-types';
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

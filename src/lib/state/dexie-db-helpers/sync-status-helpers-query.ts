/**
 * @fileoverview Sync Status Helper Functions (Query & Utilities)
 * @module lib/state/dexie-db-helpers/sync-status-helpers-query
 * @governance ARC-1.1
 *
 * Helper functions for sync status queries and utility operations (Part 2 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SyncStatusRecord } from '../dexie-db-session-types';
import { db } from '../dexie-db';

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

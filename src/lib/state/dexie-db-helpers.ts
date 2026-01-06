/**
 * @fileoverview Database Helper Functions
 * @module lib/state/dexie-db-helpers
 * @governance EPIC-27-1c
 *
 * Helper functions for database operations.
 * Extracted from dexie-db.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import type { SyncStatusRecord } from './dexie-db-types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert SyncQueueItem to SyncStatusRecord
 */
export function queueItemToSyncStatus(item: {
    id: string;
    type: 'read' | 'write' | 'delete';
    path: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    error?: string;
    createdAt: Date;
}): SyncStatusRecord {
    const statusMap: Record<string, SyncStatusRecord['syncStatus']> = {
        pending: 'pending',
        active: 'syncing',
        completed: 'synced',
        failed: 'error',
    };

    return {
        id: item.id,
        path: item.path,
        workspaceId: 'ide', // PERSIST-S002: Workspace isolation (sync status in ide workspace)
        syncStatus: statusMap[item.status],
        errorMessage: item.error,
        retryCount: item.status === 'failed' ? 1 : 0,
        createdAt: item.createdAt.getTime(),
        updatedAt: Date.now(),
    };
}

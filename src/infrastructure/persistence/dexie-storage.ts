/**
 * @fileoverview Dexie Storage Adapter for Zustand
 * @module infrastructure/persistence/dexie-storage
 * @governance ADR-024 State Management Consolidation, Epic 53
 *
 * CANONICAL LOCATION for Zustand-Dexie persistence adapter.
 * Implements Zustand's StateStorage interface using Dexie.js for persistence.
 * This allows Zustand stores to be persisted to IndexedDB instead of localStorage.
 *
 * Includes quota handling to prevent silent data loss:
 * - Quota estimation before operations
 * - Automatic cleanup when storage is full
 * - Retry mechanism after cleanup
 *
 * @migration-status CANONICAL (Epic 53 Story 53-6)
 * @last-reviewed 2026-01-04
 */

// import { type StateStorage } from 'zustand/middleware';
import { getDb, db, type PersistedStateRecord } from './dexie-db';
import type { ViaGentDatabase } from './dexie-db-class';
import type { Table } from 'dexie';

/**
 * Storage quota threshold (90%) - trigger cleanup before hitting limit
 */
const QUOTA_THRESHOLD = 0.9;

/**
 * Estimate current storage quota usage
 * @returns Object with usage and quota in bytes, or null if estimation fails
 */
async function getStorageQuota(): Promise<{ usage: number; quota: number } | null> {
    try {
        const estimate = await navigator.storage.estimate();
        if (!estimate) return null;

        return {
            usage: estimate.usage || 0,
            quota: estimate.quota || 0
        };
    } catch (error) {
        console.warn('[DexieStorage] Failed to estimate storage quota:', error);
        return null;
    }
}

/**
 * Check if storage is near quota limit
 * @returns true if usage exceeds threshold, false otherwise
 */
async function isStorageNearQuota(): Promise<boolean> {
    const quota = await getStorageQuota();
    if (!quota) return false;

    return quota.usage > quota.quota * QUOTA_THRESHOLD;
}

/**
 * Evict oldest entries from a table to free up space
 * @param table The Dexie table to clean up
 * @param bytesToFree Number of bytes to free (approximate)
 */
async function evictOldestEntries(
    table: Table<PersistedStateRecord, string>,
    bytesToFree: number
): Promise<void> {
    try {
        // Get all entries ordered by update date (oldest first)
        const entries = await table.orderBy('updatedAt').reverse().toArray();

        let bytesFreed = 0;
        const entriesToDelete: string[] = [];

        for (const entry of entries) {
            if (bytesFreed >= bytesToFree) break;

            // Estimate size of entry (rough approximation)
            const entrySize = JSON.stringify(entry.state).length * 2; // UTF-16 = 2 bytes per char
            bytesFreed += entrySize;
            entriesToDelete.push(entry.id);
        }

        // Delete entries in batch
        if (entriesToDelete.length > 0) {
            await table.bulkDelete(entriesToDelete);
            console.warn(
                `[DexieStorage] Evicted ${entriesToDelete.length} old entries to free ~${Math.round(bytesFreed / 1024)}KB`
            );
        }
    } catch (error) {
        console.error('[DexieStorage] Failed to evict old entries:', error);
        throw error;
    }
}

/**
 * Create a persistence storage adapter for a specific Dexie table
 *
 * @param tableName Name of the Dexie table to store state in
 * @returns Zustand StateStorage implementation
 *
 * @example
 * ```ts
 * persist(
 *   (set) => ({ ... }),
 *   {
 *     name: 'my-store',
 *     storage: createDexieStorage('providerConfigs')
 *   }
 * )
 * ```
 */
export function createDexieStorage(tableName: keyof typeof db): { getItem: (name: string) => Promise<string | null>, setItem: (name: string, value: string) => Promise<void>, removeItem: (name: string) => Promise<void> } {
    // Initialization guard: ensure database is fully opened before table access
    let dbInitPromise: Promise<ViaGentDatabase | null> | null = null;

    const ensureDatabaseOpen = async (): Promise<ViaGentDatabase | null> => {
        if (!dbInitPromise) {
            dbInitPromise = (async () => {
                const database = getDb();
                if (!database) return null;

                // CRITICAL: Wait for database.open() to complete before accessing tables
                // Without this, table properties (database[tableName]) are undefined
                try {
                    await database.open();
                    return database;
                } catch (error) {
                    console.error('[DexieStorage] Failed to open database:', error);
                    return null;
                }
            })();
        }

        return dbInitPromise;
    };

    return {
        getItem: async (name: string): Promise<string | null> => {
            try {
                const database = await ensureDatabaseOpen();
                if (!database) return null;

                const table = database[tableName] as Table<PersistedStateRecord, string>;
                const record = await table.get(name);
                return record ? JSON.stringify(record.state) : null;
            } catch (error) {
                console.warn(`[DexieStorage] Failed to get item '${name}':`, error);
                return null;
            }
        },

        setItem: async (name: string, value: string): Promise<void> => {
            const database = await ensureDatabaseOpen();
            if (!database) return;

            const table = database[tableName] as Table<PersistedStateRecord, string>;

            // Dexie/IndexedDB needs the raw object, not stringified JSON for the 'state' field
            // But Zustand passes a stringified JSON.
            // We parse it back to store as object for better inspectability in DB,
            // OR we store as string if we want 1:1 fidelity with localStorage behavior.
            // The Target Architecture suggested JSON.parse(value).
            const state = JSON.parse(value);

            try {
                // Proactive cleanup: Check if near quota before operation
                if (await isStorageNearQuota()) {
                    const quota = await getStorageQuota();
                    if (quota) {
                        const usagePercent = (quota.usage / quota.quota) * 100;
                        console.warn(
                            `[DexieStorage] Storage at ${usagePercent.toFixed(1)}% capacity, triggering cleanup`
                        );

                        // Estimate size of new entry and clean up equivalent space
                        const entrySize = value.length * 2; // UTF-16 = 2 bytes per char
                        await evictOldestEntries(table, entrySize);
                    }
                }

                // Attempt to write the data
                await table.put({
                    id: name,
                    state: state,
                    updatedAt: new Date()
                });
            } catch (error: unknown) {
                // Reactive cleanup: Handle QuotaExceededError
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    console.warn(
                        `[DexieStorage] Quota exceeded while setting '${name}', evicting old entries`
                    );

                    try {
                        // Estimate size of new entry and clean up
                        const entrySize = value.length * 2; // UTF-16 = 2 bytes per char
                        await evictOldestEntries(table, entrySize);

                        // Retry once after cleanup
                        await table.put({
                            id: name,
                            state: state,
                            updatedAt: new Date()
                        });

                        console.info(`[DexieStorage] Successfully saved '${name}' after cleanup`);
                    } catch (retryError) {
                        console.error(
                            `[DexieStorage] Failed to save '${name}' even after cleanup:`,
                            retryError
                        );
                        throw retryError;
                    }
                } else {
                    // Re-throw non-quota errors
                    console.error(`[DexieStorage] Failed to set item '${name}':`, error);
                    throw error;
                }
            }
        },

        removeItem: async (name: string): Promise<void> => {
            try {
                const database = await ensureDatabaseOpen();
                if (!database) return;

                const table = database[tableName] as Table<PersistedStateRecord, string>;
                await table.delete(name);
            } catch (error) {
                console.error(`[DexieStorage] Failed to remove item '${name}':`, error);
            }
        }
    };
}

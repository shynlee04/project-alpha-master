/**
 * @fileoverview Dexie Storage Adapter for Zustand
 * @module lib/state/dexie-storage
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - Migrate provider config to Zustand
 * 
 * Implements Zustand's StateStorage interface using Dexie.js for persistence.
 * This allows Zustand stores to be persisted to IndexedDB instead of localStorage.
 */

import { type StateStorage } from 'zustand/middleware';
import { db, type PersistedStateRecord } from './dexie-db';
import type { Table } from 'dexie';

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
    // We assume the table is accessible on the db instance
    // and follows the PersistedStateRecord interface (id, state, updatedAt)
    const table = db[tableName] as Table<PersistedStateRecord, string>;

    return {
        getItem: async (name: string): Promise<string | null> => {
            try {
                const record = await table.get(name);
                return record ? JSON.stringify(record.state) : null;
            } catch (error) {
                console.warn(`[DexieStorage] Failed to get item '${name}':`, error);
                return null;
            }
        },

        setItem: async (name: string, value: string): Promise<void> => {
            try {
                // Dexie/IndexedDB needs the raw object, not stringified JSON for the 'state' field
                // But Zustand passes a stringified JSON. 
                // We parse it back to store as object for better inspectability in DB,
                // OR we store as string if we want 1:1 fidelity with localStorage behavior.
                // The Target Architecture suggested JSON.parse(value).

                await table.put({
                    id: name,
                    state: JSON.parse(value),
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error(`[DexieStorage] Failed to set item '${name}':`, error);
            }
        },

        removeItem: async (name: string): Promise<void> => {
            try {
                await table.delete(name);
            } catch (error) {
                console.error(`[DexieStorage] Failed to remove item '${name}':`, error);
            }
        }
    };
}

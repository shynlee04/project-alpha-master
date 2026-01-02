/**
 * @fileoverview LocalStorage to Dexie Migration Utility
 * @module lib/state/migrations/local-storage-migrator
 * @governance RC-011
 *
 * Migrates legacy localStorage data to Dexie.js IndexedDB.
 * Provides idempotent migration with logging and rollback support.
 *
 * @story rc-011-dexie-migration-logic
 * @priority HIGH (HIGH-008)
 */

import { db, type PersistedStateRecord } from '../dexie-db';

// ============================================================================
// Types
// ============================================================================

/**
 * Migration log entry
 */
export interface MigrationLogEntry {
    timestamp: number;
    operation: string;
    storeName: string;
    status: 'started' | 'completed' | 'failed' | 'skipped';
    itemsCount: number;
    error?: string;
}

/**
 * Legacy localStorage store schema
 */
export interface LegacyLocalStorageStore {
    /** The localStorage key */
    key: string;
    /** The Dexie table to migrate to */
    tableName: keyof typeof db;
    /** Transform function to convert legacy data to new format */
    transform?: (data: unknown) => Omit<PersistedStateRecord, 'id' | 'updatedAt'>;
    /** Whether this migration has been run */
    migrated?: boolean;
}

/**
 * Migration result
 */
export interface MigrationResult {
    success: boolean;
    storeName: string;
    itemsMigrated: number;
    error?: string;
    duration: number;
}

/**
 * Logger interface for migration events
 */
export interface MigrationLogger {
    log: (message: string, data?: unknown) => void;
    warn: (message: string, data?: unknown) => void;
    error: (message: string, data?: unknown) => void;
    info: (message: string, data?: unknown) => void;
}

// ============================================================================
// Default Logger
// ============================================================================

/**
 * Create a migration logger with prefixed output
 */
export function createMigrationLogger(prefix: string): MigrationLogger {
    return {
        log: (message: string, data?: unknown) => {
            console.log(`[${prefix}] ${message}`, data ?? '');
        },
        warn: (message: string, data?: unknown) => {
            console.warn(`[${prefix}] ${message}`, data ?? '');
        },
        error: (message: string, data?: unknown) => {
            console.error(`[${prefix}] ${message}`, data ?? '');
        },
        info: (message: string, data?: unknown) => {
            console.info(`[${prefix}] ${message}`, data ?? '');
        },
    };
}

// ============================================================================
// Migration Registry
// ============================================================================

/**
 * Known legacy localStorage stores that need migration
 * Maps localStorage keys to Dexie tables
 */
const LEGACY_STORES: LegacyLocalStorageStore[] = [
    {
        key: 'via-gent-providers',
        tableName: 'providerConfigs',
        transform: (data: unknown) => {
            const parsed = data as { state?: { providers?: unknown[]; activeProviderId?: string; modelSettings?: Record<string, unknown> } };
            return {
                id: 'via-gent-providers',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'via-gent-ide-state',
        tableName: 'providerConfigs',
        transform: (data: unknown) => {
            const parsed = data as { state?: { openFiles?: string[]; activeFile?: string | null; expandedPaths?: string[]; panelLayouts?: Record<string, number[]>; terminalTab?: string; chatVisible?: boolean; activeFileScrollTop?: number } };
            return {
                id: 'via-gent-ide-state',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'via-gent-layout-storage',
        tableName: 'providerConfigs',
        transform: (data: unknown) => {
            const parsed = data as { state?: Record<string, unknown> };
            return {
                id: 'via-gent-layout-storage',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'via-gent-hub-storage',
        tableName: 'providerConfigs',
        transform: (data: unknown) => {
            const parsed = data as { state?: Record<string, unknown> };
            return {
                id: 'via-gent-hub-storage',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'via-gent-navigation-storage',
        tableName: 'providerConfigs',
        transform: (data: unknown) => {
            const parsed = data as { state?: Record<string, unknown> };
            return {
                id: 'via-gent-navigation-storage',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'conversation-state',
        tableName: 'conversationState',
        transform: (data: unknown) => {
            const parsed = data as { state?: Record<string, unknown> };
            return {
                id: 'conversation-state',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'agents-store-v1',
        tableName: 'agentConfigs',
        transform: (data: unknown) => {
            const parsed = data as { state?: Record<string, unknown> };
            return {
                id: 'agents-store-v1',
                state: parsed?.state ?? {},
                createdAt: Date.now(),
            };
        },
    },
    {
        key: 'sync-status-store',
        tableName: 'syncStatus',
        transform: (_data: unknown) => {
            // This is handled separately in dexie-db.ts v8 migration
            return {
                id: 'legacy-sync-status',
                state: {},
                createdAt: Date.now(),
            };
        },
    },
];

// ============================================================================
// Migration Functions
// ============================================================================

/**
 * Check if a localStorage key exists
 */
export function localStorageExists(key: string): boolean {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        return localStorage.getItem(key) !== null;
    } catch {
        return false;
    }
}

/**
 * Get data from localStorage safely
 */
export function getLocalStorageItem<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') {
        return null;
    }
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`[LocalStorageMigrator] Failed to get item '${key}':`, error);
        return null;
    }
}

/**
 * Delete from localStorage safely
 */
export function deleteLocalStorageItem(key: string): boolean {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`[LocalStorageMigrator] Failed to delete item '${key}':`, error);
        return false;
    }
}

/**
 * Migrate a single store from localStorage to Dexie
 */
export async function migrateStore(
    store: LegacyLocalStorageStore,
    logger: MigrationLogger = createMigrationLogger('LocalStorageMigrator')
): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
        // Check if localStorage data exists
        if (!localStorageExists(store.key)) {
            logger.info(`Store '${store.key}' not found in localStorage, skipping`);
            return {
                success: true,
                storeName: store.key,
                itemsMigrated: 0,
                duration: Date.now() - startTime,
            };
        }

        logger.log(`Migrating store '${store.key}' to table '${store.tableName}'`);

        // Get legacy data
        const legacyData = getLocalStorageItem(store.key);
        if (!legacyData) {
            logger.warn(`Store '${store.key}' has null data, skipping`);
            return {
                success: true,
                storeName: store.key,
                itemsMigrated: 0,
                duration: Date.now() - startTime,
            };
        }

        // Transform data if needed
        const transformed = store.transform
            ? store.transform(legacyData)
            : {
                id: store.key,
                state: legacyData,
                createdAt: Date.now(),
            };

        // Check if data already exists in Dexie (idempotency)
        const table = db[store.tableName] as { get: (key: string) => Promise<PersistedStateRecord | undefined>; put: (record: PersistedStateRecord) => Promise<string>; add: (record: PersistedStateRecord) => Promise<string> };
        const existing = await table.get(store.key);
        if (existing) {
            logger.info(`Store '${store.key}' already exists in Dexie, updating`);
            await table.put({
                ...transformed,
                updatedAt: Date.now(),
            } as PersistedStateRecord);
        } else {
            await table.add({
                ...transformed,
                updatedAt: Date.now(),
            } as PersistedStateRecord);
        }

        // Optionally remove from localStorage (commented out for safety)
        // deleteLocalStorageItem(store.key);

        logger.info(`Successfully migrated '${store.key}' (${Date.now() - startTime}ms)`);

        return {
            success: true,
            storeName: store.key,
            itemsMigrated: 1,
            duration: Date.now() - startTime,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to migrate '${store.key}': ${errorMessage}`);

        return {
            success: false,
            storeName: store.key,
            itemsMigrated: 0,
            error: errorMessage,
            duration: Date.now() - startTime,
        };
    }
}

/**
 * Migrate all legacy stores from localStorage to Dexie
 */
export async function migrateAllStores(
    logger: MigrationLogger = createMigrationLogger('LocalStorageMigrator')
): Promise<MigrationResult[]> {
    logger.info('Starting migration of all legacy stores');

    const results: MigrationResult[] = [];

    for (const store of LEGACY_STORES) {
        const result = await migrateStore(store, logger);
        results.push(result);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalItems = results.reduce((sum, r) => sum + r.itemsMigrated, 0);

    logger.info(`Migration complete: ${successful} succeeded, ${failed} failed, ${totalItems} items migrated`);

    return results;
}

/**
 * Check if any legacy stores need migration
 */
export function needsMigration(): boolean {
    return LEGACY_STORES.some(store => localStorageExists(store.key));
}

/**
 * Get list of stores that need migration
 */
export function getStoresNeedingMigration(): string[] {
    return LEGACY_STORES.filter(store => localStorageExists(store.key)).map(s => s.key);
}

/**
 * Backup localStorage data before migration
 * Returns a backup object that can be used for rollback
 */
export function backupLocalStorage(keys?: string[]): Record<string, string> {
    const backup: Record<string, string> = {};
    const keysToBackup = keys ?? LEGACY_STORES.map(s => s.key);

    for (const key of keysToBackup) {
        if (localStorageExists(key)) {
            const item = localStorage.getItem(key);
            if (item) {
                backup[key] = item;
            }
        }
    }

    return backup;
}

/**
 * Restore localStorage from backup (for rollback)
 */
export function restoreLocalStorage(backup: Record<string, string>): void {
    for (const [key, value] of Object.entries(backup)) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`[LocalStorageMigrator] Failed to restore '${key}':`, error);
        }
    }
}

/**
 * Create a Dexie backup of specific tables
 */
export async function backupDexieTables(
    tableNames: (keyof typeof db)[]
): Promise<Record<string, unknown[]>> {
    const backup: Record<string, unknown[]> = {};

    for (const tableName of tableNames) {
        try {
            const table = db[tableName] as { toArray?: () => Promise<unknown[]> };
            if (table && typeof table.toArray === 'function') {
                backup[tableName as string] = await table.toArray();
            }
        } catch (error) {
            console.error(`[LocalStorageMigrator] Failed to backup table '${tableName}':`, error);
        }
    }

    return backup;
}

/**
 * Get migration log for audit purposes
 */
export function getMigrationLog(): MigrationLogEntry[] {
    const logs: MigrationLogEntry[] = [];
    const logKey = 'via-gent-migration-log';

    if (localStorageExists(logKey)) {
        try {
            const data = localStorage.getItem(logKey);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    parsed.forEach((entry: MigrationLogEntry) => logs.push(entry));
                }
            }
        } catch {
            // Ignore parse errors
        }
    }

    return logs;
}

/**
 * Log a migration event
 */
export function logMigrationEvent(entry: Omit<MigrationLogEntry, 'timestamp'>): void {
    const logKey = 'via-gent-migration-log';
    const logs = getMigrationLog();

    logs.push({
        ...entry,
        timestamp: Date.now(),
    });

    // Keep only last 100 entries
    const trimmedLogs = logs.slice(-100);

    try {
        localStorage.setItem(logKey, JSON.stringify(trimmedLogs));
    } catch {
        // Ignore storage errors
    }
}

/**
 * Clear migration log
 */
export function clearMigrationLog(): void {
    const logKey = 'via-gent-migration-log';
    deleteLocalStorageItem(logKey);
}

// ============================================================================
// Export Registry for External Use
// ============================================================================

/**
 * Get the legacy stores registry
 */
export function getLegacyStores(): LegacyLocalStorageStore[] {
    return [...LEGACY_STORES];
}

/**
 * Add a new store to the legacy registry
 */
export function registerLegacyStore(store: LegacyLocalStorageStore): void {
    // Check if already registered
    if (!LEGACY_STORES.some(s => s.key === store.key)) {
        LEGACY_STORES.push(store);
    }
}

/**
 * Remove a store from the legacy registry
 */
export function unregisterLegacyStore(key: string): void {
    const index = LEGACY_STORES.findIndex(s => s.key === key);
    if (index !== -1) {
        LEGACY_STORES.splice(index, 1);
    }
}

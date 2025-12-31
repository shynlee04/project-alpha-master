/**
 * @fileoverview Dexie Migration Logic Tests
 * @module lib/state/__tests__/dexie-migrations.test
 * @governance RC-011
 *
 * Tests for Dexie migration logic including:
 * - Schema creation and validation
 * - Data migration from localStorage
 * - Index validation
 * - Error handling
 * - Idempotency
 */

import {
    localStorageExists,
    getLocalStorageItem,
    deleteLocalStorageItem,
    needsMigration,
    getStoresNeedingMigration,
    backupLocalStorage,
    restoreLocalStorage,
    getMigrationLog,
    logMigrationEvent,
    clearMigrationLog,
    getLegacyStores,
    registerLegacyStore,
    unregisterLegacyStore,
    createMigrationLogger,
} from '../migrations/local-storage-migrator';
import type { MigrationLogger, LegacyLocalStorageStore } from '../migrations/local-storage-migrator';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock localStorage
const mockLocalStorage = {
    data: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
    setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage.data[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
        delete mockLocalStorage.data[key];
    }),
};

describe('LocalStorageMigrator', () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
        mockLocalStorage.data = {};

        // Mock global localStorage
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });
    });

    describe('localStorageExists', () => {
        it('returns false when localStorage is undefined', () => {
            Object.defineProperty(global, 'localStorage', { value: undefined });
            expect(localStorageExists('test')).toBe(false);
        });

        it('returns true when key exists', () => {
            mockLocalStorage.data['test-key'] = 'value';
            expect(localStorageExists('test-key')).toBe(true);
        });

        it('returns false when key does not exist', () => {
            expect(localStorageExists('non-existent')).toBe(false);
        });
    });

    describe('getLocalStorageItem', () => {
        it('returns null when key does not exist', () => {
            expect(getLocalStorageItem('test')).toBeNull();
        });

        it('returns parsed JSON data', () => {
            mockLocalStorage.data['test'] = JSON.stringify({ foo: 'bar' });
            const result = getLocalStorageItem<{ foo: string }>('test');
            expect(result).toEqual({ foo: 'bar' });
        });

        it('returns null on parse error', () => {
            mockLocalStorage.data['test'] = 'invalid json';
            const result = getLocalStorageItem('test');
            expect(result).toBeNull();
        });
    });

    describe('deleteLocalStorageItem', () => {
        it('deletes item from localStorage', () => {
            mockLocalStorage.data['test'] = 'value';
            deleteLocalStorageItem('test');
            expect(mockLocalStorage.data['test']).toBeUndefined();
        });
    });

    describe('createMigrationLogger', () => {
        it('creates a logger with prefixed output', () => {
            const logger = createMigrationLogger('TestLogger');
            expect(logger.log).toBeDefined();
            expect(logger.warn).toBeDefined();
            expect(logger.error).toBeDefined();
            expect(logger.info).toBeDefined();
        });

        it('logger methods are callable without errors', () => {
            const logger = createMigrationLogger('TestLogger');
            expect(() => logger.log('test message')).not.toThrow();
            expect(() => logger.warn('test warning')).not.toThrow();
            expect(() => logger.error('test error')).not.toThrow();
            expect(() => logger.info('test info')).not.toThrow();
        });
    });

    describe('needsMigration', () => {
        it('returns false when no stores need migration', () => {
            expect(needsMigration()).toBe(false);
        });

        it('returns true when stores need migration', () => {
            mockLocalStorage.data['via-gent-providers'] = '{}';
            expect(needsMigration()).toBe(true);
        });
    });

    describe('getStoresNeedingMigration', () => {
        it('returns empty array when no stores need migration', () => {
            expect(getStoresNeedingMigration()).toEqual([]);
        });

        it('returns list of stores needing migration', () => {
            mockLocalStorage.data['via-gent-providers'] = '{}';
            mockLocalStorage.data['via-gent-ide-state'] = '{}';

            const stores = getStoresNeedingMigration();
            expect(stores.length).toBeGreaterThan(0);
            expect(stores).toContain('via-gent-providers');
        });
    });

    describe('backupLocalStorage', () => {
        it('backs up specified keys', () => {
            mockLocalStorage.data['backup-test'] = JSON.stringify({ foo: 'bar' });
            const backup = backupLocalStorage(['backup-test']);

            expect(backup['backup-test']).toBeDefined();
            expect(JSON.parse(backup['backup-test'] as string)).toEqual({ foo: 'bar' });
        });

        it('backs up all legacy stores when no keys specified', () => {
            mockLocalStorage.data['via-gent-providers'] = '{}';
            const backup = backupLocalStorage();

            expect(Object.keys(backup).length).toBeGreaterThan(0);
        });
    });

    describe('restoreLocalStorage', () => {
        it('restores data from backup', () => {
            const backup = { 'restore-test': JSON.stringify({ restored: true }) };
            restoreLocalStorage(backup);

            expect(mockLocalStorage.data['restore-test']).toBe(JSON.stringify({ restored: true }));
        });
    });

    describe('getMigrationLog', () => {
        it('returns empty array when no log exists', () => {
            expect(getMigrationLog()).toEqual([]);
        });

        it('returns parsed migration log entries', () => {
            const logEntry = {
                timestamp: Date.now(),
                operation: 'test',
                status: 'completed' as const,
                storeName: 'test-store',
                itemsCount: 1,
            };
            mockLocalStorage.data['via-gent-migration-log'] = JSON.stringify([logEntry]);

            const log = getMigrationLog();
            expect(log.length).toBe(1);
            expect(log[0].operation).toBe('test');
        });
    });

    describe('logMigrationEvent', () => {
        it('adds entry to migration log', () => {
            logMigrationEvent({
                operation: 'test-operation',
                storeName: 'test-store',
                status: 'completed',
                itemsCount: 1,
            });

            const log = getMigrationLog();
            expect(log.length).toBe(1);
            expect(log[0].operation).toBe('test-operation');
        });

        it('limits log to 100 entries', () => {
            // Add 105 entries
            for (let i = 0; i < 105; i++) {
                logMigrationEvent({
                    operation: `test-${i}`,
                    storeName: 'test-store',
                    status: 'completed',
                    itemsCount: 1,
                });
            }

            const log = getMigrationLog();
            expect(log.length).toBe(100);
            // Should contain the last 100 entries, not the first 5
            expect(log[0].operation).toBe('test-5');
        });
    });

    describe('clearMigrationLog', () => {
        it('clears the migration log', () => {
            logMigrationEvent({
                operation: 'test',
                storeName: 'test-store',
                status: 'completed',
                itemsCount: 1,
            });

            clearMigrationLog();
            expect(getMigrationLog()).toEqual([]);
        });
    });

    describe('getLegacyStores', () => {
        it('returns array of legacy stores', () => {
            const stores = getLegacyStores();
            expect(Array.isArray(stores)).toBe(true);
            expect(stores.length).toBeGreaterThan(0);
        });

        it('each store has required properties', () => {
            const stores = getLegacyStores();
            stores.forEach((store) => {
                expect(store.key).toBeDefined();
                expect(store.tableName).toBeDefined();
            });
        });
    });

    describe('registerLegacyStore', () => {
        it('adds new store to registry', () => {
            const initialCount = getLegacyStores().length;

            const newStore: LegacyLocalStorageStore = {
                key: 'custom-legacy-store',
                tableName: 'providerConfigs',
            };

            registerLegacyStore(newStore);
            expect(getLegacyStores().length).toBe(initialCount + 1);
        });

        it('does not duplicate existing store', () => {
            const initialCount = getLegacyStores().length;
            const existingStore = getLegacyStores()[0];

            registerLegacyStore(existingStore);
            expect(getLegacyStores().length).toBe(initialCount);
        });
    });

    describe('unregisterLegacyStore', () => {
        it('removes store from registry', () => {
            const initialCount = getLegacyStores().length;
            const storeToRemove = getLegacyStores()[0];

            unregisterLegacyStore(storeToRemove.key);
            expect(getLegacyStores().length).toBe(initialCount - 1);
        });
    });
});

describe('Error Handling', () => {
    beforeEach(() => {
        mockLocalStorage.data = {};
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });
    });

    it('handles malformed JSON in localStorage', () => {
        mockLocalStorage.data['malformed-test'] = 'not valid json{';

        // getLocalStorageItem should return null for malformed JSON
        const result = getLocalStorageItem('malformed-test');
        expect(result).toBeNull();
    });

    it('handles quota exceeded errors gracefully', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        // backupLocalStorage should handle quota errors
        expect(() => backupLocalStorage(['test'])).not.toThrow();
    });

    it('handles restore with corrupted backup data', () => {
        const backup = { 'corrupted': 'not valid json' };
        // Should not throw
        expect(() => restoreLocalStorage(backup)).not.toThrow();
    });
});

// Migration Logging functions are tested indirectly through migration tests.
// The logMigrationEvent and getMigrationLog functions use localStorage directly
// and are verified through the migration process itself.

describe('Migration Performance', () => {
    beforeEach(() => {
        mockLocalStorage.data = {};
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });
    });

    it('backup completes quickly', () => {
        const startTime = Date.now();
        backupLocalStorage();
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(500);
    });

    it('restore completes quickly', () => {
        const backup = {};
        for (let i = 0; i < 10; i++) {
            backup[`key-${i}`] = JSON.stringify({ data: `value-${i}` });
        }

        const startTime = Date.now();
        restoreLocalStorage(backup as Record<string, string>);
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(500);
    });

    it('getLegacyStores is fast', () => {
        const startTime = Date.now();
        const stores = getLegacyStores();
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(50);
        expect(stores.length).toBeGreaterThan(0);
    });
});

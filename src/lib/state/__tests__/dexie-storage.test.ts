/**
 * @fileoverview Dexie Storage Adapter Tests
 * @module lib/state/__tests__/dexie-storage.test
 * @governance ARC-DUP-IMPROVE-3
 *
 * Tests for Dexie storage adapter with quota handling.
 * P0 critical file - requires 90% coverage.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dexieDB } from '@/lib/state/dexie-db';
import { createDexieStorage } from '@/lib/state/dexie-storage';

describe('createDexieStorage', () => {
    beforeEach(async () => {
        // Clear all tables before each test
        await dexieDB.tables.forEach(async (table) => {
            await table.clear();
        });
    });

    afterEach(async () => {
        // Clear all tables after each test
        await dexieDB.tables.forEach(async (table) => {
            await table.clear();
        });
    });

    describe('getItem', () => {
        it('should retrieve existing item from database', async () => {
            const storage = createDexieStorage('conversationState');
            await storage.setItem('test-key', JSON.stringify({ value: 'test-data' }));

            const result = await storage.getItem('test-key');
            expect(result).toBe(JSON.stringify({ value: 'test-data' }));
        });

        it('should return null for non-existent item', async () => {
            const storage = createDexieStorage('conversationState');
            const result = await storage.getItem('non-existent');
            expect(result).toBeNull();
        });

        it('should handle quota exceeded errors gracefully', async () => {
            const storage = createDexieStorage('conversationState');

            // Mock Dexie to throw QuotaExceededError
            const tableMock = vi.spyOn(dexieDB.conversationState, 'get');
            tableMock.mockRejectedValueOnce(new DOMException('QuotaExceededError', 'QuotaExceededError'));

            const result = await storage.getItem('test-key');
            expect(result).toBeNull();
        });

        it('should parse JSON strings correctly', async () => {
            const storage = createDexieStorage('agentConfigs');
            const complexObject = { nested: { data: [1, 2, 3] } };
            await storage.setItem('complex', JSON.stringify(complexObject));

            const result = await storage.getItem('complex');
            expect(result).toBe(JSON.stringify(complexObject));
        });

        it('should handle empty strings', async () => {
            const storage = createDexieStorage('providerConfigs');
            await storage.setItem('empty', '');

            const result = await storage.getItem('empty');
            expect(result).toBe('');
        });
    });

    describe('setItem', () => {
        it('should store item in database', async () => {
            const storage = createDexieStorage('conversationState');
            await storage.setItem('new-key', 'new-value');

            const result = await storage.getItem('new-key');
            expect(result).toBe('new-value');
        });

        it('should update existing item', async () => {
            const storage = createDexieStorage('agentConfigs');
            await storage.setItem('update-key', 'old-value');
            await storage.setItem('update-key', 'new-value');

            const result = await storage.getItem('update-key');
            expect(result).toBe('new-value');
        });

        it('should handle quota exceeded errors', async () => {
            const storage = createDexieStorage('conversationState');

            // Mock Dexie to throw QuotaExceededError
            const tableMock = vi.spyOn(dexieDB.conversationState, 'put');
            tableMock.mockRejectedValueOnce(new DOMException('QuotaExceededError', 'QuotaExceededError'));

            // Should not throw, but fail silently
            await expect(storage.setItem('test-key', 'test-value')).resolves.toBeUndefined();
        });

        it('should store large objects', async () => {
            const storage = createDexieStorage('providerConfigs');
            const largeObject = { data: 'x'.repeat(10000) }; // 10KB string

            await storage.setItem('large', JSON.stringify(largeObject));
            const result = await storage.getItem('large');
            expect(result).toBe(JSON.stringify(largeObject));
        });

        it('should handle concurrent set operations', async () => {
            const storage = createDexieStorage('agentConfigs');
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(storage.setItem(`key-${i}`, `value-${i}`));
            }
            await Promise.all(promises);

            for (let i = 0; i < 10; i++) {
                const result = await storage.getItem(`key-${i}`);
                expect(result).toBe(`value-${i}`);
            }
        });
    });

    describe('removeItem', () => {
        it('should remove existing item from database', async () => {
            const storage = createDexieStorage('conversationState');
            await storage.setItem('remove-test', 'value');
            await storage.removeItem('remove-test');

            const result = await storage.getItem('remove-test');
            expect(result).toBeNull();
        });

        it('should handle removing non-existent item', async () => {
            const storage = createDexieStorage('agentConfigs');

            // Should not throw when removing non-existent item
            await expect(storage.removeItem('non-existent')).resolves.toBeUndefined();
        });

        it('should handle quota exceeded errors during removal', async () => {
            const storage = createDexieStorage('conversationState');

            // Mock Dexie to throw QuotaExceededError
            const tableMock = vi.spyOn(dexieDB.conversationState, 'delete');
            tableMock.mockRejectedValueOnce(new DOMException('QuotaExceededError', 'QuotaExceededError'));

            // Should not throw, but fail silently
            await expect(storage.removeItem('test-key')).resolves.toBeUndefined();
        });

        it('should handle multiple removals', async () => {
            const storage = createDexieStorage('providerConfigs');
            await storage.setItem('key1', 'value1');
            await storage.setItem('key2', 'value2');
            await storage.setItem('key3', 'value3');

            await storage.removeItem('key1');
            await storage.removeItem('key2');

            expect(await storage.getItem('key1')).toBeNull();
            expect(await storage.getItem('key2')).toBeNull();
            expect(await storage.getItem('key3')).toBe('value3');
        });
    });

    describe('integration with different tables', () => {
        it('should work with conversationState table', async () => {
            const storage = createDexieStorage('conversationState');
            await storage.setItem('test', 'conversation-data');

            expect(await storage.getItem('test')).toBe('conversation-data');
        });

        it('should work with agentConfigs table', async () => {
            const storage = createDexieStorage('agentConfigs');
            await storage.setItem('test', 'agent-data');

            expect(await storage.getItem('test')).toBe('agent-data');
        });

        it('should work with providerConfigs table', async () => {
            const storage = createDexieStorage('providerConfigs');
            await storage.setItem('test', 'provider-data');

            expect(await storage.getItem('test')).toBe('provider-data');
        });
    });
});

// Mock navigator.storage.estimate()
Object.defineProperty(global.navigator, 'storage', {
    value: {
        estimate: vi.fn(() => Promise.resolve({
            usage: 1000000, // 1MB
            quota: 100000000, // 100MB
        })),
    },
    writable: true,
});

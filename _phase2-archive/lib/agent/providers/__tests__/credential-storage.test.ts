/**
 * Credential Storage Unit Tests
 *
 * Tests IndexedDB operations for encrypted credential storage.
 *
 * @epic WB-PR-2 - Refactor Credential Vault
 * @test Credential Storage Module
 */

import { CredentialStorage } from '../credential-storage';
import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    uint8ArrayToBase64,
    base64ToUint8Array,
} from '../credential-storage';
import { db } from '../../../state/dexie-db';

describe('CredentialStorage', () => {
    let storage: CredentialStorage;

    beforeEach(async () => {
        storage = new CredentialStorage();
        // Clear all credentials before each test
        await db.credentials.clear();
    });

    afterEach(async () => {
        // Clean up after each test
        await db.credentials.clear();
    });

    describe('Store Credentials', () => {
        it('should store encrypted credentials successfully', async () => {
            const result = await storage.storeCredentials(
                'openai',
                'base64-encoded-encrypted-data',
                'base64-encoded-iv'
            );

            expect(result.success).toBe(true);
            expect(result.providerId).toBe('openai');
            expect(result.timestamp).toBeInstanceOf(Date);
        });

        it('should overwrite existing credentials for same provider', async () => {
            // Store first set
            await storage.storeCredentials('openai', 'encrypted-v1', 'iv-v1');

            // Store second set (should overwrite)
            await storage.storeCredentials('openai', 'encrypted-v2', 'iv-v2');

            const credential = await storage.getCredential('openai');
            expect(credential?.encrypted).toBe('encrypted-v2');
            expect(credential?.iv).toBe('iv-v2');
        });

        it('should store credentials for multiple providers', async () => {
            await storage.storeCredentials('openai', 'encrypted-1', 'iv-1');
            await storage.storeCredentials('anthropic', 'encrypted-2', 'iv-2');
            await storage.storeCredentials('openrouter', 'encrypted-3', 'iv-3');

            const providers = await storage.getAllProviderIds();
            expect(providers).toHaveLength(3);
            expect(providers).toContain('openai');
            expect(providers).toContain('anthropic');
            expect(providers).toContain('openrouter');
        });
    });

    describe('Get Credentials', () => {
        it('should retrieve stored credentials', async () => {
            await storage.storeCredentials('openai', 'encrypted-data', 'iv-data');

            const credential = await storage.getCredential('openai');

            expect(credential).toBeDefined();
            expect(credential?.providerId).toBe('openai');
            expect(credential?.encrypted).toBe('encrypted-data');
            expect(credential?.iv).toBe('iv-data');
            expect(credential?.createdAt).toBeInstanceOf(Date);
        });

        it('should return null for non-existent provider', async () => {
            const credential = await storage.getCredential('non-existent');
            expect(credential).toBeNull();
        });

        it('should preserve createdAt timestamp', async () => {
            const beforeStore = new Date();
            await storage.storeCredentials('openai', 'encrypted', 'iv');
            const afterStore = new Date();

            const credential = await storage.getCredential('openai');
            expect(credential?.createdAt.getTime()).toBeGreaterThanOrEqual(beforeStore.getTime());
            expect(credential?.createdAt.getTime()).toBeLessThanOrEqual(afterStore.getTime());
        });
    });

    describe('Has Credentials', () => {
        it('should return true for existing provider', async () => {
            await storage.storeCredentials('openai', 'encrypted', 'iv');
            const hasCredentials = await storage.hasCredentials('openai');
            expect(hasCredentials).toBe(true);
        });

        it('should return false for non-existent provider', async () => {
            const hasCredentials = await storage.hasCredentials('openai');
            expect(hasCredentials).toBe(false);
        });
    });

    describe('Delete Credentials', () => {
        it('should delete stored credentials', async () => {
            await storage.storeCredentials('openai', 'encrypted', 'iv');
            expect(await storage.hasCredentials('openai')).toBe(true);

            await storage.deleteCredentials('openai');
            expect(await storage.hasCredentials('openai')).toBe(false);
        });

        it('should not throw when deleting non-existent provider', async () => {
            await expect(storage.deleteCredentials('non-existent')).resolves.not.toThrow();
        });
    });

    describe('Clear All', () => {
        it('should clear all stored credentials', async () => {
            await storage.storeCredentials('openai', 'encrypted-1', 'iv-1');
            await storage.storeCredentials('anthropic', 'encrypted-2', 'iv-2');
            await storage.storeCredentials('openrouter', 'encrypted-3', 'iv-3');

            expect(await storage.getCredentialCount()).toBe(3);

            await storage.clearAll();

            expect(await storage.getCredentialCount()).toBe(0);
        });
    });

    describe('Get All Provider IDs', () => {
        it('should return empty array when no credentials stored', async () => {
            const providers = await storage.getAllProviderIds();
            expect(providers).toEqual([]);
        });

        it('should return all provider IDs', async () => {
            await storage.storeCredentials('provider-a', 'encrypted-1', 'iv-1');
            await storage.storeCredentials('provider-b', 'encrypted-2', 'iv-2');
            await storage.storeCredentials('provider-c', 'encrypted-3', 'iv-3');

            const providers = await storage.getAllProviderIds();
            expect(providers).toHaveLength(3);
            expect(providers.sort()).toEqual(['provider-a', 'provider-b', 'provider-c'].sort());
        });
    });

    describe('Get Credential Count', () => {
        it('should return 0 when no credentials stored', async () => {
            const count = await storage.getCredentialCount();
            expect(count).toBe(0);
        });

        it('should return correct count after storing credentials', async () => {
            expect(await storage.getCredentialCount()).toBe(0);

            await storage.storeCredentials('provider-1', 'encrypted-1', 'iv-1');
            expect(await storage.getCredentialCount()).toBe(1);

            await storage.storeCredentials('provider-2', 'encrypted-2', 'iv-2');
            expect(await storage.getCredentialCount()).toBe(2);

            await storage.storeCredentials('provider-3', 'encrypted-3', 'iv-3');
            expect(await storage.getCredentialCount()).toBe(3);
        });

        it('should decrease count after deleting credentials', async () => {
            await storage.storeCredentials('provider-1', 'encrypted-1', 'iv-1');
            await storage.storeCredentials('provider-2', 'encrypted-2', 'iv-2');

            expect(await storage.getCredentialCount()).toBe(2);

            await storage.deleteCredentials('provider-1');
            expect(await storage.getCredentialCount()).toBe(1);
        });
    });
});

describe('ArrayBuffer/Base64 Conversion Helpers', () => {
    describe('arrayBufferToBase64', () => {
        it('should convert ArrayBuffer to Base64', () => {
            const buffer = new TextEncoder().encode('Hello, World!');
            const base64 = arrayBufferToBase64(buffer);

            expect(base64).toBe('SGVsbG8sIFdvcmxkIQ==');
        });

        it('should handle empty ArrayBuffer', () => {
            const buffer = new ArrayBuffer(0);
            const base64 = arrayBufferToBase64(buffer);

            expect(base64).toBe('');
        });

        it('should handle binary data', () => {
            const buffer = new Uint8Array([0, 1, 2, 255, 254, 253]).buffer;
            const base64 = arrayBufferToBase64(buffer);

            expect(base64).toBe('AAEC//79');
        });
    });

    describe('base64ToArrayBuffer', () => {
        it('should convert Base64 to ArrayBuffer', () => {
            const base64 = 'SGVsbG8sIFdvcmxkIQ==';
            const buffer = base64ToArrayBuffer(base64);

            const decoded = new TextDecoder().decode(buffer);
            expect(decoded).toBe('Hello, World!');
        });

        it('should handle empty Base64 string', () => {
            const buffer = base64ToArrayBuffer('');
            expect(buffer.byteLength).toBe(0);
        });

        it('should handle binary data', () => {
            const base64 = 'AAEC//79';
            const buffer = base64ToArrayBuffer(base64);

            const bytes = new Uint8Array(buffer);
            expect(Array.from(bytes)).toEqual([0, 1, 2, 255, 254, 253]);
        });
    });

    describe('round-trip conversion', () => {
        it('should survive ArrayBuffer -> Base64 -> ArrayBuffer', () => {
            const original = new TextEncoder().encode('Test data with unicode: 🎉');
            const base64 = arrayBufferToBase64(original);
            const restored = base64ToArrayBuffer(base64);

            expect(new Uint8Array(restored)).toEqual(new Uint8Array(original));
        });

        it('should survive Uint8Array -> Base64 -> Uint8Array', () => {
            const original = new Uint8Array([0, 128, 255, 42, 99]);
            const base64 = uint8ArrayToBase64(original);
            const restored = base64ToUint8Array(base64);

            expect(restored).toEqual(original);
        });
    });

    describe('uint8ArrayToBase64', () => {
        it('should convert Uint8Array to Base64', () => {
            const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
            const base64 = uint8ArrayToBase64(bytes);

            expect(base64).toBe('SGVsbG8=');
        });
    });

    describe('base64ToUint8Array', () => {
        it('should convert Base64 to Uint8Array', () => {
            const base64 = 'SGVsbG8='; // "Hello"
            const bytes = base64ToUint8Array(base64);

            expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111]);
        });
    });
});

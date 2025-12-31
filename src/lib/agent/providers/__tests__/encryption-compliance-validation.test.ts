/**
 * AES-256-GCM Encryption Compliance Validation
 *
 * Validates that the credential vault encryption implementation
 * meets industry standards for secure key storage.
 *
 * @epic WB-PR-2 - Refactor Credential Vault
 * @test AES-256-GCM Compliance
 */

import { describe, it, expect } from 'vitest';
import { credentialEncryption } from '../credential-encryption';

describe('AES-256-GCM Encryption Compliance Validation', () => {
    describe('Encryption Algorithm', () => {
        it('should use AES-GCM algorithm', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();
            expect(report.algorithm).toBe('AES-GCM');
            expect(report.compliant).toBe(true);
        });

        it('should use 256-bit key length', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();
            expect(report.keyLength).toBe(256);
            expect(report.compliant).toBe(true);
        });

        it('should use 12-byte IV (96 bits - GCM standard)', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();
            expect(report.ivLength).toBe(12);
            expect(report.compliant).toBe(true);
        });

        it('should use 16-byte salt (128 bits)', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();
            expect(report.saltLength).toBe(16);
            expect(report.compliant).toBe(true);
        });

        it('should use 100,000+ PBKDF2 iterations', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();
            expect(report.iterations).toBeGreaterThanOrEqual(100000);
            expect(report.compliant).toBe(true);
        });
    });

    describe('Web Crypto API Compliance', () => {
        it('should support AES-GCM in Web Crypto API', async () => {
            // Verify browser supports AES-GCM
            const key = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            expect(key).toBeDefined();
            expect(key.type).toBe('secret');
            expect(key.algorithm.name).toBe('AES-GCM');
        });

        it('should support PBKDF2 in Web Crypto API', async () => {
            const password = new TextEncoder().encode('test-password');
            const salt = crypto.getRandomValues(new Uint8Array(16));

            const key = await crypto.subtle.importKey(
                'raw',
                password,
                'PBKDF2',
                false,
                ['deriveKey']
            );

            const derivedKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt as any,
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                key,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            expect(derivedKey).toBeDefined();
            expect(derivedKey.type).toBe('secret');
            expect(derivedKey.algorithm.name).toBe('AES-GCM');
        });
    });

    describe('Cryptographic Best Practices', () => {
        it('should generate unique IVs for each encryption', async () => {
            const ivs = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const iv = credentialEncryption.generateIV();
                const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');
                ivs.add(ivHex);
            }

            // All 100 IVs should be unique (no collisions)
            expect(ivs.size).toBe(100);
        });

        it('should generate unique salts for each vault', async () => {
            const salts = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const salt = credentialEncryption.generateSalt();
                const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
                salts.add(saltHex);
            }

            // All 100 salts should be unique (no collisions)
            expect(salts.size).toBe(100);
        });

        it('should generate unique passwords each time', async () => {
            const passwords = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const password = credentialEncryption.generateRandomPassword();
                passwords.add(password);
            }

            // All 100 passwords should be unique
            expect(passwords.size).toBe(100);
        });
    });

    describe('End-to-End Encryption Flow', () => {
        it('should encrypt and decrypt API keys correctly', async () => {
            const masterKey = await credentialEncryption.generateMasterKey();
            const apiKey = 'sk-test-api-key-12345';

            // Encrypt
            const encrypted = await credentialEncryption.encryptApiKey(apiKey, masterKey);
            expect(encrypted.encrypted).toBeDefined();
            expect(encrypted.iv).toBeDefined();
            expect(encrypted.encrypted).not.toBe(apiKey);

            // Decrypt
            const decrypted = await credentialEncryption.decryptApiKey(encrypted, masterKey);
            expect(decrypted).toBe(apiKey);
        });

        it('should fail to decrypt with wrong key', async () => {
            const masterKey1 = await credentialEncryption.generateMasterKey();
            const masterKey2 = await credentialEncryption.generateMasterKey();
            const apiKey = 'sk-test-api-key-12345';

            // Encrypt with key1
            const encrypted = await credentialEncryption.encryptApiKey(apiKey, masterKey1);

            // Try to decrypt with key2 (should fail)
            await expect(credentialEncryption.decryptApiKey(encrypted, masterKey2)).rejects.toThrow();
        });

        it('should encrypt and decrypt master keys correctly', async () => {
            const password = 'test-vault-password';
            const salt = credentialEncryption.generateSalt();

            // Derive encryption key
            const encryptionKey = await credentialEncryption.deriveKeyFromPassword(password, salt);

            // Generate master key
            const masterKey = await credentialEncryption.generateMasterKey();

            // Encrypt master key
            const encrypted = await credentialEncryption.encryptMasterKey(masterKey, encryptionKey);
            expect(encrypted).toBeDefined();
            expect(encrypted.length).toBeGreaterThan(0);

            // Decrypt master key
            const decrypted = await credentialEncryption.decryptMasterKey(encrypted, encryptionKey);
            expect(decrypted).toBeDefined();

            // Verify keys match by encrypting same data with both
            const testMessage = new TextEncoder().encode('test-message');
            const iv = credentialEncryption.generateIV();

            const encrypted1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, masterKey, testMessage);
            const encrypted2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, decrypted, testMessage);

            // Same IV + same key = same ciphertext (deterministic for testing)
            expect(new Uint8Array(encrypted1)).toEqual(new Uint8Array(encrypted2));
        });

        it('should derive same key from same password and salt', async () => {
            const password = 'test-password';
            const salt = credentialEncryption.generateSalt();

            const key1 = await credentialEncryption.deriveKeyFromPassword(password, salt);
            const key2 = await credentialEncryption.deriveKeyFromPassword(password, salt);

            // Keys should be equivalent (not necessarily same reference)
            // Export to raw bytes to compare
            const raw1 = await crypto.subtle.exportKey('raw', key1);
            const raw2 = await crypto.subtle.exportKey('raw', key2);

            expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
        });

        it('should derive different keys from different passwords', async () => {
            const salt = credentialEncryption.generateSalt();

            const key1 = await credentialEncryption.deriveKeyFromPassword('password1', salt);
            const key2 = await credentialEncryption.deriveKeyFromPassword('password2', salt);

            // Keys should be different
            const raw1 = await crypto.subtle.exportKey('raw', key1);
            const raw2 = await crypto.subtle.exportKey('raw', key2);

            expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
        });

        it('should derive different keys from different salts', async () => {
            const password = 'test-password';
            const salt1 = credentialEncryption.generateSalt();
            const salt2 = credentialEncryption.generateSalt();

            const key1 = await credentialEncryption.deriveKeyFromPassword(password, salt1);
            const key2 = await credentialEncryption.deriveKeyFromPassword(password, salt2);

            // Keys should be different
            const raw1 = await crypto.subtle.exportKey('raw', key1);
            const raw2 = await crypto.subtle.exportKey('raw', key2);

            expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
        });
    });

    describe('Compliance Report', () => {
        it('should generate compliance report with all required fields', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();

            expect(report).toHaveProperty('compliant');
            expect(report).toHaveProperty('algorithm');
            expect(report).toHaveProperty('keyLength');
            expect(report).toHaveProperty('ivLength');
            expect(report).toHaveProperty('saltLength');
            expect(report).toHaveProperty('iterations');
            expect(report).toHaveProperty('notes');
        });

        it('should report compliant when all parameters are correct', () => {
            const report = credentialEncryption.verifyEncryptionCompliance();

            console.log('[Encryption Compliance]', report);
            expect(report.compliant).toBe(true);
            expect(report.notes.length).toBe(0);
        });
    });
});

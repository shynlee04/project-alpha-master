/**
 * Credential Encryption Unit Tests
 *
 * Tests AES-256-GCM encryption operations for the credential vault.
 *
 * @epic WB-PR-2 - Refactor Credential Vault
 * @test Credential Encryption Module
 */

import { describe, it, expect } from 'vitest';
import {
    CredentialEncryption,
    credentialEncryption,
    ENCRYPTION_ALGORITHM,
    KEY_LENGTH,
    SALT_LENGTH,
    IV_LENGTH,
    ITERATIONS,
} from '../credential-encryption';

describe('CredentialEncryption', () => {
    let encryption: CredentialEncryption;

    beforeEach(() => {
        encryption = new CredentialEncryption();
    });

    describe('Generate Random Password', () => {
        it('should generate password of correct length', () => {
            const password = encryption.generateRandomPassword();
            expect(password.length).toBe(64); // 32 bytes * 2 hex chars
        });

        it('should generate password of custom length', () => {
            const password = encryption.generateRandomPassword(16);
            expect(password.length).toBe(32); // 16 bytes * 2 hex chars
        });

        it('should generate unique passwords', () => {
            const passwords = new Set<string>();

            for (let i = 0; i < 100; i++) {
                passwords.add(encryption.generateRandomPassword());
            }

            expect(passwords.size).toBe(100);
        });

        it('should generate valid hexadecimal strings', () => {
            const password = encryption.generateRandomPassword();
            expect(password).toMatch(/^[0-9a-f]{64}$/);
        });
    });

    describe('Generate Salt', () => {
        it('should generate salt of correct length', () => {
            const salt = encryption.generateSalt();
            expect(salt).toBeInstanceOf(Uint8Array);
            expect(salt.length).toBe(SALT_LENGTH);
        });

        it('should generate unique salts', () => {
            const salts = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const salt = encryption.generateSalt();
                const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
                salts.add(saltHex);
            }

            expect(salts.size).toBe(100);
        });

        it('should generate cryptographically secure salts', () => {
            const salts = Array.from({ length: 100 }, () => encryption.generateSalt());

            // Check that salts are not all the same
            const firstSalt = Array.from(salts[0]).map((b) => b.toString(16)).join('-');
            const allSame = salts.every((salt) => {
                const saltHex = Array.from(salt).map((b) => b.toString(16)).join('-');
                return saltHex === firstSalt;
            });

            expect(allSame).toBe(false);
        });
    });

    describe('Generate IV', () => {
        it('should generate IV of correct length', () => {
            const iv = encryption.generateIV();
            expect(iv).toBeInstanceOf(Uint8Array);
            expect(iv.length).toBe(IV_LENGTH);
        });

        it('should generate unique IVs', () => {
            const ivs = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const iv = encryption.generateIV();
                const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');
                ivs.add(ivHex);
            }

            expect(ivs.size).toBe(100);
        });
    });

    describe('Derive Key From Password', () => {
        it('should derive key with correct properties', async () => {
            const password = 'test-password';
            const salt = encryption.generateSalt();

            const key = await encryption.deriveKeyFromPassword(password, salt);

            expect(key).toBeDefined();
            expect(key.type).toBe('secret');
            expect(key.algorithm.name).toBe(ENCRYPTION_ALGORITHM);
            expect(key.extractable).toBe(false);
            expect(key.usages).toContain('encrypt');
            expect(key.usages).toContain('decrypt');
        });

        it('should derive same key from same password and salt', async () => {
            const password = 'test-password';
            const salt = encryption.generateSalt();

            const key1 = await encryption.deriveKeyFromPassword(password, salt);
            const key2 = await encryption.deriveKeyFromPassword(password, salt);

            // Export to raw bytes to compare
            const raw1 = await crypto.subtle.exportKey('raw', key1);
            const raw2 = await crypto.subtle.exportKey('raw', key2);

            expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
        });

        it('should derive different keys from different passwords', async () => {
            const salt = encryption.generateSalt();

            const key1 = await encryption.deriveKeyFromPassword('password1', salt);
            const key2 = await encryption.deriveKeyFromPassword('password2', salt);

            const raw1 = await crypto.subtle.exportKey('raw', key1);
            const raw2 = await crypto.subtle.exportKey('raw', key2);

            expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
        });

        it('should derive different keys from different salts', async () => {
            const password = 'test-password';
            const salt1 = encryption.generateSalt();
            const salt2 = encryption.generateSalt();

            const key1 = await encryption.deriveKeyFromPassword(password, salt1);
            const key2 = await encryption.deriveKeyFromPassword(password, salt2);

            const raw1 = await crypto.subtle.exportKey('raw', key1);
            const raw2 = await crypto.subtle.exportKey('raw', key2);

            expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
        });
    });

    describe('Generate Master Key', () => {
        it('should generate key with correct properties', async () => {
            const key = await encryption.generateMasterKey();

            expect(key).toBeDefined();
            expect(key.type).toBe('secret');
            expect(key.algorithm.name).toBe(ENCRYPTION_ALGORITHM);
            expect(key.extractable).toBe(true);
            expect(key.usages).toContain('encrypt');
            expect(key.usages).toContain('decrypt');
        });

        it('should generate unique keys', async () => {
            const keys = await Promise.all([
                encryption.generateMasterKey(),
                encryption.generateMasterKey(),
                encryption.generateMasterKey(),
            ]);

            const rawKeys = await Promise.all(
                keys.map((key) => crypto.subtle.exportKey('raw', key))
            );

            const hexKeys = rawKeys.map((raw) =>
                Array.from(new Uint8Array(raw))
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('')
            );

            expect(new Set(hexKeys).size).toBe(3);
        });
    });

    describe('Encrypt and Decrypt Master Key', () => {
        it('should encrypt and decrypt master key correctly', async () => {
            const password = 'vault-password';
            const salt = encryption.generateSalt();
            const encryptionKey = await encryption.deriveKeyFromPassword(password, salt);
            const masterKey = await encryption.generateMasterKey();

            // Encrypt
            const encrypted = await encryption.encryptMasterKey(masterKey, encryptionKey);
            expect(encrypted).toBeDefined();
            expect(encrypted.length).toBeGreaterThan(0);

            // Decrypt
            const decrypted = await encryption.decryptMasterKey(encrypted, encryptionKey);
            expect(decrypted).toBeDefined();

            // Verify keys match by encrypting same data
            const testMessage = new TextEncoder().encode('test');
            const iv = encryption.generateIV();

            const encrypted1 = await crypto.subtle.encrypt(
                { name: ENCRYPTION_ALGORITHM, iv },
                masterKey,
                testMessage
            );
            const encrypted2 = await crypto.subtle.encrypt(
                { name: ENCRYPTION_ALGORITHM, iv },
                decrypted,
                testMessage
            );

            expect(new Uint8Array(encrypted1)).toEqual(new Uint8Array(encrypted2));
        });

        it('should fail to decrypt with wrong encryption key', async () => {
            const password1 = 'password1';
            const password2 = 'password2';
            const salt = encryption.generateSalt();

            const encryptionKey1 = await encryption.deriveKeyFromPassword(password1, salt);
            const encryptionKey2 = await encryption.deriveKeyFromPassword(password2, salt);
            const masterKey = await encryption.generateMasterKey();

            const encrypted = await encryption.encryptMasterKey(masterKey, encryptionKey1);

            // Try to decrypt with wrong key
            await expect(
                encryption.decryptMasterKey(encrypted, encryptionKey2)
            ).rejects.toThrow();
        });

        it('should produce different ciphertext for same key (due to random IV)', async () => {
            const password = 'vault-password';
            const salt = encryption.generateSalt();
            const encryptionKey = await encryption.deriveKeyFromPassword(password, salt);
            const masterKey = await encryption.generateMasterKey();

            const encrypted1 = await encryption.encryptMasterKey(masterKey, encryptionKey);
            const encrypted2 = await encryption.encryptMasterKey(masterKey, encryptionKey);

            // Different IVs should produce different ciphertext
            expect(encrypted1).not.toBe(encrypted2);
        });
    });

    describe('Encrypt and Decrypt API Key', () => {
        it('should encrypt and decrypt API key correctly', async () => {
            const masterKey = await encryption.generateMasterKey();
            const apiKey = 'sk-test-api-key-1234567890';

            // Encrypt
            const encrypted = await encryption.encryptApiKey(apiKey, masterKey);

            expect(encrypted.encrypted).toBeDefined();
            expect(encrypted.iv).toBeDefined();
            expect(encrypted.encrypted).not.toBe(apiKey);
            expect(encrypted.encrypted.length).toBeGreaterThan(0);
            expect(encrypted.iv.length).toBeGreaterThan(0);

            // Decrypt
            const decrypted = await encryption.decryptApiKey(encrypted, masterKey);

            expect(decrypted).toBe(apiKey);
        });

        it('should handle empty API key', async () => {
            const masterKey = await encryption.generateMasterKey();
            const apiKey = '';

            const encrypted = await encryption.encryptApiKey(apiKey, masterKey);
            const decrypted = await encryption.decryptApiKey(encrypted, masterKey);

            expect(decrypted).toBe('');
        });

        it('should handle special characters in API key', async () => {
            const masterKey = await encryption.generateMasterKey();
            const apiKey = 'sk-测试!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

            const encrypted = await encryption.encryptApiKey(apiKey, masterKey);
            const decrypted = await encryption.decryptApiKey(encrypted, masterKey);

            expect(decrypted).toBe(apiKey);
        });

        it('should fail to decrypt with wrong master key', async () => {
            const masterKey1 = await encryption.generateMasterKey();
            const masterKey2 = await encryption.generateMasterKey();
            const apiKey = 'sk-test-key';

            const encrypted = await encryption.encryptApiKey(apiKey, masterKey1);

            // Try to decrypt with different key
            await expect(encryption.decryptApiKey(encrypted, masterKey2)).rejects.toThrow();
        });

        it('should produce different ciphertext for same API key', async () => {
            const masterKey = await encryption.generateMasterKey();
            const apiKey = 'sk-test-key';

            const encrypted1 = await encryption.encryptApiKey(apiKey, masterKey);
            const encrypted2 = await encryption.encryptApiKey(apiKey, masterKey);

            // Different IVs should produce different ciphertext
            expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
            expect(encrypted1.iv).not.toBe(encrypted2.iv);
        });
    });

    describe('Verify Encryption Compliance', () => {
        it('should verify AES-GCM algorithm', () => {
            const report = encryption.verifyEncryptionCompliance();
            expect(report.algorithm).toBe('AES-GCM');
        });

        it('should verify 256-bit key length', () => {
            const report = encryption.verifyEncryptionCompliance();
            expect(report.keyLength).toBe(256);
        });

        it('should verify 12-byte IV', () => {
            const report = encryption.verifyEncryptionCompliance();
            expect(report.ivLength).toBe(12);
        });

        it('should verify 16-byte salt', () => {
            const report = encryption.verifyEncryptionCompliance();
            expect(report.saltLength).toBe(16);
        });

        it('should verify 100,000+ PBKDF2 iterations', () => {
            const report = encryption.verifyEncryptionCompliance();
            expect(report.iterations).toBeGreaterThanOrEqual(100000);
        });

        it('should return compliant=true when all parameters correct', () => {
            const report = encryption.verifyEncryptionCompliance();
            expect(report.compliant).toBe(true);
            expect(report.notes).toEqual([]);
        });
    });

    describe('Module Exports', () => {
        it('should export correct constants', () => {
            expect(ENCRYPTION_ALGORITHM).toBe('AES-GCM');
            expect(KEY_LENGTH).toBe(256);
            expect(SALT_LENGTH).toBe(16);
            expect(IV_LENGTH).toBe(12);
            expect(ITERATIONS).toBe(100000);
        });

        it('should export singleton instance', () => {
            expect(credentialEncryption).toBeInstanceOf(CredentialEncryption);
        });
    });
});

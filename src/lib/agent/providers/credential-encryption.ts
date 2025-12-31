/**
 * @fileoverview Credential Encryption - AES-256-GCM Encryption
 * @module lib/agent/providers/credential-encryption
 *
 * Handles all cryptographic operations for the credential vault using Web Crypto API.
 * Implements AES-256-GCM encryption with PBKDF2 key derivation.
 *
 * Security Features:
 * - AES-256-GCM encryption (authenticated encryption)
 * - PBKDF2-SHA256 key derivation (100,000 iterations)
 * - Cryptographically secure random salt and IV generation
 * - Master key encryption with derived encryption key
 *
 * @epic WB-PR-2 - Refactor Credential Vault
 * @story WB-PR-2.1 - Split credential-vault.ts into 3 modules
 */

import { arrayBufferToBase64, base64ToArrayBuffer } from './credential-storage';

/**
 * Encryption algorithm configuration
 */
export const ENCRYPTION_ALGORITHM = 'AES-GCM';
export const KEY_LENGTH = 256;
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;
export const ITERATIONS = 100000;

/**
 * Encrypted data container with IV
 */
export interface EncryptedData {
    encrypted: string; // Base64-encoded encrypted data
    iv: string;        // Base64-encoded initialization vector
}

/**
 * Vault encryption keys
 */
export interface VaultKeys {
    masterKey: CryptoKey;
    encryptionKey: CryptoKey;
    salt: Uint8Array;
}

/**
 * CredentialEncryption - Cryptographic operations for credential vault
 *
 * Responsibilities:
 * - Generate cryptographically secure random values (salt, IV, passwords)
 * - Derive encryption keys from passwords using PBKDF2
 * - Encrypt and decrypt master keys
 * - Encrypt and decrypt API keys
 * - Validate encryption parameters
 */
export class CredentialEncryption {
    /**
     * Generate a cryptographically secure random password
     *
     * @param bytes - Number of bytes to generate (default: 32)
     * @returns Hex-encoded random password
     */
    generateRandomPassword(bytes: number = 32): string {
        const array = new Uint8Array(bytes);
        crypto.getRandomValues(array);
        return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate cryptographically secure random salt
     *
     * @returns Random salt for key derivation
     */
    generateSalt(): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    }

    /**
     * Generate cryptographically secure random IV
     *
     * @returns Random initialization vector
     */
    generateIV(): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    }

    /**
     * Derive an encryption key from password using PBKDF2
     *
     * PBKDF2 applies a pseudorandom function (HMAC with SHA-256) to the password
     * combined with a salt, and repeats the process many times (100,000 iterations).
     * This slows down brute-force attacks significantly.
     *
     * @param password - Password to derive key from
     * @param salt - Cryptographic salt
     * @returns Derived CryptoKey
     */
    async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as any,
                iterations: ITERATIONS,
                hash: 'SHA-256',
            },
            passwordKey,
            { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Generate a new master key for encrypting credentials
     *
     * @returns New AES-256-GCM CryptoKey
     */
    async generateMasterKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt a master key with a derived encryption key
     *
     * The master key is encrypted using the PBKDF2-derived encryption key.
     * This allows the master key to be securely stored and later decrypted
     * with the same password-derived key.
     *
     * @param masterKey - Master key to encrypt
     * @param encryptionKey - PBKDF2-derived encryption key
     * @returns Base64-encoded encrypted master key with IV prepended
     */
    async encryptMasterKey(masterKey: CryptoKey, encryptionKey: CryptoKey): Promise<string> {
        const iv = this.generateIV();
        const keyData = await crypto.subtle.exportKey('raw', masterKey);

        const encrypted = await crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGORITHM, iv: iv.buffer as BufferSource },
            encryptionKey,
            keyData
        );

        // Combine IV and encrypted data for storage
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        return arrayBufferToBase64(combined.buffer);
    }

    /**
     * Decrypt a master key with a derived encryption key
     *
     * @param encrypted - Base64-encoded encrypted master key with IV prepended
     * @param encryptionKey - PBKDF2-derived encryption key
     * @returns Decrypted master CryptoKey
     * @throws Error if decryption fails
     */
    async decryptMasterKey(encrypted: string, encryptionKey: CryptoKey): Promise<CryptoKey> {
        const combined = new Uint8Array(base64ToArrayBuffer(encrypted));
        const iv = combined.slice(0, IV_LENGTH);
        const data = combined.slice(IV_LENGTH);

        const decrypted = await crypto.subtle.decrypt(
            { name: ENCRYPTION_ALGORITHM, iv: iv.buffer as BufferSource },
            encryptionKey,
            data.buffer as BufferSource
        );

        return crypto.subtle.importKey(
            'raw',
            decrypted,
            { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt an API key using the master key
     *
     * @param apiKey - Plain text API key to encrypt
     * @param masterKey - Master encryption key
     * @returns Encrypted data with IV
     */
    async encryptApiKey(apiKey: string, masterKey: CryptoKey): Promise<EncryptedData> {
        const iv = this.generateIV();
        const encoder = new TextEncoder();

        const encrypted = await crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGORITHM, iv: iv.buffer as BufferSource },
            masterKey,
            encoder.encode(apiKey)
        );

        return {
            encrypted: arrayBufferToBase64(encrypted),
            iv: arrayBufferToBase64(iv.buffer.slice(0) as ArrayBuffer),
        };
    }

    /**
     * Decrypt an API key using the master key
     *
     * @param encryptedData - Encrypted data with IV
     * @param masterKey - Master encryption key
     * @returns Decrypted API key as plain text
     * @throws Error if decryption fails
     */
    async decryptApiKey(encryptedData: EncryptedData, masterKey: CryptoKey): Promise<string> {
        const encrypted = base64ToArrayBuffer(encryptedData.encrypted);
        const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));

        const decrypted = await crypto.subtle.decrypt(
            { name: ENCRYPTION_ALGORITHM, iv: iv.buffer as BufferSource },
            masterKey,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    /**
     * Verify that encryption parameters are compliant
     *
     * Validates:
     * - AES-256-GCM algorithm
     * - 256-bit key length
     * - 12-byte IV (standard for GCM)
     * - 16-byte salt
     * - Sufficient PBKDF2 iterations
     *
     * @returns Compliance report
     */
    verifyEncryptionCompliance(): {
        compliant: boolean;
        algorithm: string;
        keyLength: number;
        ivLength: number;
        saltLength: number;
        iterations: number;
        notes: string[];
    } {
        const notes: string[] = [];

        // Check algorithm
        if (ENCRYPTION_ALGORITHM !== 'AES-GCM') {
            notes.push(`⚠️ Algorithm is ${ENCRYPTION_ALGORITHM}, expected AES-GCM`);
        }

        // Check key length
        if (KEY_LENGTH !== 256) {
            notes.push(`⚠️ Key length is ${KEY_LENGTH}, expected 256 bits`);
        }

        // Check IV length (GCM standard is 96 bits / 12 bytes)
        if (IV_LENGTH !== 12) {
            notes.push(`⚠️ IV length is ${IV_LENGTH}, expected 12 bytes (96 bits)`);
        }

        // Check salt length
        if (SALT_LENGTH !== 16) {
            notes.push(`⚠️ Salt length is ${SALT_LENGTH}, expected 16 bytes`);
        }

        // Check iterations (OWASP recommends 100,000+ as of 2025)
        if (ITERATIONS < 100000) {
            notes.push(`⚠️ PBKDF2 iterations is ${ITERATIONS}, recommended 100,000+`);
        }

        return {
            compliant: notes.length === 0,
            algorithm: ENCRYPTION_ALGORITHM,
            keyLength: KEY_LENGTH,
            ivLength: IV_LENGTH,
            saltLength: SALT_LENGTH,
            iterations: ITERATIONS,
            notes,
        };
    }
}

/**
 * Default singleton instance
 */
export const credentialEncryption = new CredentialEncryption();

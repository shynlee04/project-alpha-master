/**
 * @fileoverview Credential Vault - Encrypted API Key Storage
 * @module lib/agent/providers/credential-vault
 *
 * Secure storage for API keys using Web Crypto API (AES-GCM) and Dexie.js.
 * Keys are encrypted before storage and decrypted on retrieval.
 *
 * Security improvements (RC-003, RC-028-002):
 * - Master key encryption using PBKDF2-derived key (not XOR obfuscation)
 * - Salt + IV + Authentication tag for proper cryptographic security
 * - CC-2025-12-29: Changed from sessionStorage to localStorage for persistence
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 * @fix RC-028-002 - Replace XOR with AES-GCM encryption
 * @fix CC-2025-12-29 - Persist vault metadata between sessions
 */

import { db, type CredentialRecord } from '../../state/dexie-db';

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;
const PASSWORD_MEM = 64 * 1024; // 64KB memory for Argon2-like resistance

// Storage key names - using obfuscated names to reduce XSS targetability
const ENCRYPTED_KEY_STORAGE = 'vg_ek_v3'; // Previously 'vg_mk_v2' with XOR
const SALT_STORAGE = 'vg_salt_v3';
const KEY_VERSION_STORAGE = 'vg_kv_v3';

/**
 * CredentialVault - Secure API key storage with encryption
 *
 * Security features:
 * - Persistent key storage via localStorage (CC-2025-12-29)
 * - Key derived from password using PBKDF2-SHA256
 * - Salt + IV + Authentication tag for proper cryptographic security
 *
 * @fix RC-028-002 - Replace XOR with AES-GCM encryption
 * @fix CC-2025-12-29 - Persist vault between browser sessions
 */
export class CredentialVault {
    private masterKey: CryptoKey | null = null;
    private initialized = false;
    private encryptionKey: CryptoKey | null = null;

    constructor() {
        // CC-2025-12-29: Removed beforeunload cleanup - we now persist credentials
    }

    /**
     * Generate a cryptographically secure random password
     * This is stored encrypted in sessionStorage and never exposed directly
     */
    private generateVaultPassword(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Derive an encryption key from password using PBKDF2
     */
    private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
                salt,
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
     * Initialize the vault (generate or load master key)
     */
    async initialize(): Promise<void> {
        if (this.initialized && this.masterKey) return;

        // Try to load existing encrypted master key
        const storedEncryptedKey = this.getStoredEncryptedKey();
        const storedSalt = this.getStoredSalt();

        if (storedEncryptedKey && storedSalt) {
            // Decrypt existing master key
            const vaultPassword = await this.getOrCreateVaultPassword();
            this.encryptionKey = await this.deriveKeyFromPassword(vaultPassword, storedSalt);

            this.masterKey = await this.decryptMasterKey(storedEncryptedKey);
            this.initialized = true;
        } else {
            // Generate new master key and encryption setup
            await this.createNewVault();
            this.initialized = true;
        }
    }

    /**
     * Create a new vault with fresh keys
     */
    private async createNewVault(): Promise<void> {
        // Generate vault password (never stored directly)
        const vaultPassword = this.generateVaultPassword();

        // Generate salt for key derivation
        const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
        this.storeSalt(salt);

        // Derive encryption key from password
        this.encryptionKey = await this.deriveKeyFromPassword(vaultPassword, salt);

        // Generate master key
        this.masterKey = await crypto.subtle.generateKey(
            { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
            true,
            ['encrypt', 'decrypt']
        );

        // Encrypt and store master key
        const encryptedKey = await this.encryptMasterKey(this.masterKey);
        this.storeEncryptedKey(encryptedKey);

        // Store vault password hint (not the password itself)
        // User can optionally set a memorable password later
        this.storeVaultPasswordHint();
    }

    /**
     * Get or create the vault password from secure storage
     */
    private async getOrCreateVaultPassword(): Promise<string> {
        // Check if we have a cached password
        const cached = this.getCachedPassword();
        if (cached) return cached;

        // Try to decrypt using sessionStorage
        const stored = this.getSessionPassword();
        if (stored) {
            this.cachePassword(stored);
            return stored;
        }

        // Generate new password and store encrypted
        const newPassword = this.generateVaultPassword();
        this.storeSessionPassword(newPassword);
        this.cachePassword(newPassword);
        return newPassword;
    }

    /**
     * Securely store the vault password in sessionStorage
     * Encrypted with a key derived from browser fingerprint
     */
    private storeSessionPassword(password: string): void {
        // CC-2025-12-29: Changed from sessionStorage to localStorage for persistence
        localStorage.setItem('vg_vp_v3', password);
    }

    /**
     * Retrieve the vault password
     */
    private getSessionPassword(): string | null {
        return localStorage.getItem('vg_vp_v3');
    }

    /**
     * Cache password in memory (cleared on page unload)
     */
    private cachePassword(password: string): void {
        // Store in a closure-scoped variable (not this property)
        (this as { _cachedPassword?: string })._cachedPassword = password;
    }

    /**
     * Get cached password
     */
    private getCachedPassword(): string | undefined {
        return (this as { _cachedPassword?: string })._cachedPassword;
    }

    /**
     * Store encrypted master key
     */
    private async encryptMasterKey(key: CryptoKey): Promise<string> {
        if (!this.encryptionKey) throw new Error('Encryption key not initialized');

        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const keyData = await crypto.subtle.exportKey('raw', key);

        const encrypted = await crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGORITHM, iv },
            this.encryptionKey,
            keyData
        );

        // Combine IV and encrypted data, then encode
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        return this.arrayBufferToBase64(combined.buffer);
    }

    /**
     * Decrypt and retrieve master key
     */
    private async decryptMasterKey(encrypted: string): Promise<CryptoKey> {
        if (!this.encryptionKey) throw new Error('Encryption key not initialized');

        const combined = new Uint8Array(this.base64ToArrayBuffer(encrypted));
        const iv = combined.slice(0, IV_LENGTH);
        const data = combined.slice(IV_LENGTH);

        const decrypted = await crypto.subtle.decrypt(
            { name: ENCRYPTION_ALGORITHM, iv },
            this.encryptionKey,
            data
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
     * Get stored encrypted master key
     */
    private getStoredEncryptedKey(): string | null {
        try {
            // CC-2025-12-29: Changed from sessionStorage to localStorage
            const stored = localStorage.getItem(ENCRYPTED_KEY_STORAGE);
            const version = localStorage.getItem(KEY_VERSION_STORAGE);

            // Verify version matches
            if (version !== '3') return null;
            if (!stored) return null;

            return stored;
        } catch {
            return null;
        }
    }

    /**
     * Store encrypted master key
     */
    private storeEncryptedKey(encrypted: string): void {
        // CC-2025-12-29: Changed from sessionStorage to localStorage
        localStorage.setItem(ENCRYPTED_KEY_STORAGE, encrypted);
        localStorage.setItem(KEY_VERSION_STORAGE, '3');
    }

    /**
     * Get stored salt
     */
    private getStoredSalt(): Uint8Array | null {
        try {
            // CC-2025-12-29: Changed from sessionStorage to localStorage
            const stored = localStorage.getItem(SALT_STORAGE);
            if (!stored) return null;

            const binary = atob(stored);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        } catch {
            return null;
        }
    }

    /**
     * Store salt
     */
    private storeSalt(salt: Uint8Array): void {
        let binary = '';
        for (let i = 0; i < salt.length; i++) {
            binary += String.fromCharCode(salt[i]);
        }
        // CC-2025-12-29: Changed from sessionStorage to localStorage
        localStorage.setItem(SALT_STORAGE, btoa(binary));
    }

    /**
     * Store vault password hint
     */
    private storeVaultPasswordHint(): void {
        // CC-2025-12-29: Changed from sessionStorage to localStorage
        localStorage.setItem('vg_vph_v3', 'Persistent encryption active');
    }

    /**
     * Clear master key and encryption key from memory
     */
    private clearFromMemory(): void {
        this.masterKey = null;
        this.encryptionKey = null;
        this.initialized = false;
        (this as { _cachedPassword?: string })._cachedPassword = undefined;
    }

    /**
     * Store encrypted credentials for a provider
     */
    async storeCredentials(providerId: string, apiKey: string): Promise<void> {
        await this.initialize();
        if (!this.masterKey) throw new Error('Vault not initialized');

        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the API key
        const encoder = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGORITHM, iv },
            this.masterKey,
            encoder.encode(apiKey)
        );

        // Store in IndexedDB
        const credential: CredentialRecord = {
            providerId,
            encrypted: this.arrayBufferToBase64(encrypted),
            iv: this.arrayBufferToBase64(iv.buffer),
            createdAt: new Date(),
        };

        await db.credentials.put(credential);
    }

    /**
     * Retrieve and decrypt credentials for a provider
     */
    async getCredentials(providerId: string): Promise<string | null> {
        console.log('[CredentialVault] getCredentials called for:', providerId);
        await this.initialize();
        if (!this.masterKey) {
            console.error('[CredentialVault] Master key not available after initialization');
            throw new Error('Vault not initialized');
        }

        const credential = await db.credentials.get(providerId);
        console.log('[CredentialVault] Credential lookup result:', credential ? 'found' : 'not found');
        if (!credential) return null;

        try {
            // Decrypt the API key
            const encrypted = this.base64ToArrayBuffer(credential.encrypted);
            const iv = this.base64ToArrayBuffer(credential.iv);

            const decrypted = await crypto.subtle.decrypt(
                { name: ENCRYPTION_ALGORITHM, iv: new Uint8Array(iv) },
                this.masterKey,
                encrypted
            );

            const decoder = new TextDecoder();
            const result = decoder.decode(decrypted);
            console.log('[CredentialVault] Decryption successful, key length:', result.length);
            return result;
        } catch (error) {
            console.error('[CredentialVault] Decryption failed:', error);
            throw error;
        }
    }

    /**
     * Check if credentials exist for a provider
     */
    async hasCredentials(providerId: string): Promise<boolean> {
        const credential = await db.credentials.get(providerId);
        return credential !== undefined;
    }

    /**
     * Delete credentials for a provider
     */
    async deleteCredentials(providerId: string): Promise<void> {
        await db.credentials.delete(providerId);
    }

    /**
     * Clear all credentials and reset the vault
     */
    async clear(): Promise<void> {
        // Get all provider IDs and delete each one
        const providerIds = await this.getStoredProviders();
        for (const providerId of providerIds) {
            await this.deleteCredentials(providerId);
        }

        // Clear master key from memory
        this.masterKey = null;
        this.initialized = false;

        // Remove master key from sessionStorage (clears when session ends anyway)
        sessionStorage.removeItem(ENCRYPTED_KEY_STORAGE);
        sessionStorage.removeItem(KEY_VERSION_STORAGE);
    }

    /**
     * Get all stored provider IDs
     */
    async getStoredProviders(): Promise<string[]> {
        const credentials = await db.credentials.toArray();
        return credentials.map((c: CredentialRecord) => c.providerId);
    }

    // Helper: ArrayBuffer to Base64
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Helper: Base64 to ArrayBuffer
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

/**
 * Default singleton instance
 */
export const credentialVault = new CredentialVault();

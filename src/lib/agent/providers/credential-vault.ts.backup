/**
 * @fileoverview Credential Vault - Fixed Version with Robust Initialization
 * @module lib/agent/providers/credential-vault
 *
 * Secure storage for API keys using Web Crypto API (AES-GCM) and Dexie.js.
 * Keys are encrypted before storage and decrypted on retrieval.
 *
 * FIX-2025-12-30: Added proper validation and fallback when localStorage keys are incomplete
 * - Validates all required localStorage keys exist before attempting decryption
 * - Gracefully creates new vault when keys are missing or corrupted
 * - Clears stale credentials when vault is reset
 * - Provides detailed error messages for debugging
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 * @fix CC-2025-12-29 - Persist vault metadata between sessions
 * @fix FIX-2025-12-30 - Handle incomplete localStorage keys gracefully
 */

import { db, type CredentialRecord } from '../../state/dexie-db';

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

// Storage key names - using obfuscated names to reduce XSS targetability
const ENCRYPTED_KEY_STORAGE = 'vg_ek_v3';
const SALT_STORAGE = 'vg_salt_v3';
const KEY_VERSION_STORAGE = 'vg_kv_v3';
const VAULT_PASSWORD_STORAGE = 'vg_vp_v3';

/**
 * Vault initialization status for debugging
 */
export interface VaultStatus {
    isInitialized: boolean;
    hasPassword: boolean;
    hasEncryptedKey: boolean;
    hasSalt: boolean;
    hasVersion: boolean;
    credentialCount: number;
    lastError: string | null;
}

/**
 * CredentialVault - Secure API key storage with encryption
 *
 * Security features:
 * - Persistent key storage via localStorage
 * - Key derived from password using PBKDF2-SHA256
 * - Salt + IV + Authentication tag for proper cryptographic security
 *
 * Initialization flow:
 * 1. Check if all required localStorage keys exist
 * 2. If complete, attempt to decrypt master key
 * 3. If missing/corrupted, create new vault
 * 4. Provide fallback for graceful recovery
 */
export class CredentialVault {
    private masterKey: CryptoKey | null = null;
    private initialized = false;
    private encryptionKey: CryptoKey | null = null;
    private _cachedPassword?: string;
    private initError: Error | null = null;

    constructor() {
        // No-op constructor
    }

    /**
     * Get the current vault status (for debugging)
     */
    async getStatus(): Promise<VaultStatus> {
        const providers = await this.getStoredProviders();
        return {
            isInitialized: this.initialized,
            hasPassword: !!localStorage.getItem(VAULT_PASSWORD_STORAGE),
            hasEncryptedKey: !!localStorage.getItem(ENCRYPTED_KEY_STORAGE),
            hasSalt: !!localStorage.getItem(SALT_STORAGE),
            hasVersion: localStorage.getItem(KEY_VERSION_STORAGE) === '3',
            credentialCount: providers.length,
            lastError: this.initError?.message || null,
        };
    }

    /**
     * Validate that all required localStorage keys are present
     */
    private validateStorageKeys(): { valid: boolean; missing: string[] } {
        const missing: string[] = [];

        if (!localStorage.getItem(VAULT_PASSWORD_STORAGE)) {
            missing.push(VAULT_PASSWORD_STORAGE);
        }
        if (!localStorage.getItem(ENCRYPTED_KEY_STORAGE)) {
            missing.push(ENCRYPTED_KEY_STORAGE);
        }
        if (!localStorage.getItem(SALT_STORAGE)) {
            missing.push(SALT_STORAGE);
        }
        const version = localStorage.getItem(KEY_VERSION_STORAGE);
        if (version !== '3') {
            missing.push(`${KEY_VERSION_STORAGE} (found: ${version || 'null'})`);
        }

        return {
            valid: missing.length === 0,
            missing,
        };
    }

    /**
     * Initialize the vault (generate or load master key)
     *
     * FIX-2025-12-30: Added comprehensive validation and error handling
     */
    async initialize(): Promise<void> {
        if (this.initialized && this.masterKey) {
            return;
        }

        console.log('[CredentialVault] Initializing...');

        // Validate storage keys first
        const validation = this.validateStorageKeys();
        console.log('[CredentialVault] Storage validation:', validation);

        if (!validation.valid) {
            console.warn('[CredentialVault] Missing localStorage keys:', validation.missing);
            console.log('[CredentialVault] Creating new vault...');

            // Clear any stale data and create new vault
            await this.createNewVault();
            this.initialized = true;
            return;
        }

        try {
            // Try to load existing encrypted master key
            const storedEncryptedKey = this.getStoredEncryptedKey();
            const storedSalt = this.getStoredSalt();

            if (storedEncryptedKey && storedSalt) {
                console.log('[CredentialVault] Found existing encrypted key, attempting decryption...');

                // Derive encryption key from password
                const vaultPassword = await this.getOrCreateVaultPassword();
                this.encryptionKey = await this.deriveKeyFromPassword(vaultPassword, storedSalt);

                // Decrypt master key
                this.masterKey = await this.decryptMasterKey(storedEncryptedKey);
                this.initialized = true;
                this.initError = null;
                console.log('[CredentialVault] Successfully initialized from existing vault');
            } else {
                // Keys exist but values are null (shouldn't happen with validation)
                console.log('[CredentialVault] Storage keys present but values are null, creating new vault...');
                await this.createNewVault();
                this.initialized = true;
            }
        } catch (error) {
            console.error('[CredentialVault] Failed to initialize from existing vault:', error);
            this.initError = error instanceof Error ? error : new Error(String(error));

            // Fallback: create new vault
            console.log('[CredentialVault] Falling back to new vault creation...');
            await this.createNewVault();
            this.initialized = true;
        }
    }

    /**
     * Create a new vault with fresh keys
     */
    private async createNewVault(): Promise<void> {
        console.log('[CredentialVault] Creating new vault...');

        // Generate vault password
        const vaultPassword = this.generateVaultPassword();
        this.cachePassword(vaultPassword);
        this.storeSessionPassword(vaultPassword);

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

        // Store version
        localStorage.setItem(KEY_VERSION_STORAGE, '3');

        // Store password hint
        this.storeVaultPasswordHint();

        console.log('[CredentialVault] New vault created successfully');
    }

    /**
     * Generate a cryptographically secure random password
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
     * Get or create the vault password from secure storage
     */
    private async getOrCreateVaultPassword(): Promise<string> {
        // Check if we have a cached password
        const cached = this.getCachedPassword();
        if (cached) return cached;

        // Try to get from localStorage
        const stored = this.getSessionPassword();
        if (stored) {
            this.cachePassword(stored);
            return stored;
        }

        // Generate new password (shouldn't happen if validation passes)
        const newPassword = this.generateVaultPassword();
        this.storeSessionPassword(newPassword);
        this.cachePassword(newPassword);
        return newPassword;
    }

    /**
     * Securely store the vault password in localStorage
     */
    private storeSessionPassword(password: string): void {
        localStorage.setItem(VAULT_PASSWORD_STORAGE, password);
    }

    /**
     * Retrieve the vault password
     */
    private getSessionPassword(): string | null {
        return localStorage.getItem(VAULT_PASSWORD_STORAGE);
    }

    /**
     * Cache password in memory
     */
    private cachePassword(password: string): void {
        this._cachedPassword = password;
    }

    /**
     * Get cached password
     */
    private getCachedPassword(): string | undefined {
        return this._cachedPassword;
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

        // Combine IV and encrypted data
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
            const stored = localStorage.getItem(ENCRYPTED_KEY_STORAGE);
            const version = localStorage.getItem(KEY_VERSION_STORAGE);

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
        localStorage.setItem(ENCRYPTED_KEY_STORAGE, encrypted);
    }

    /**
     * Get stored salt
     */
    private getStoredSalt(): Uint8Array | null {
        try {
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
        localStorage.setItem(SALT_STORAGE, btoa(binary));
    }

    /**
     * Store vault password hint
     */
    private storeVaultPasswordHint(): void {
        localStorage.setItem('vg_vph_v3', 'Persistent encryption active');
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
        console.log('[CredentialVault] Stored credentials for:', providerId);
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
        console.log('[CredentialVault] Deleted credentials for:', providerId);
    }

    /**
     * Clear all credentials and reset the vault
     */
    async clear(): Promise<void> {
        console.log('[CredentialVault] Clearing vault...');

        // Clear all credentials from IndexedDB
        await db.credentials.clear();

        // Clear all localStorage keys
        localStorage.removeItem(ENCRYPTED_KEY_STORAGE);
        localStorage.removeItem(SALT_STORAGE);
        localStorage.removeItem(KEY_VERSION_STORAGE);
        localStorage.removeItem(VAULT_PASSWORD_STORAGE);
        localStorage.removeItem('vg_vph_v3');

        // Clear in-memory state
        this.masterKey = null;
        this.encryptionKey = null;
        this.initialized = false;
        this._cachedPassword = undefined;
        this.initError = null;

        console.log('[CredentialVault] Vault cleared');
    }

    /**
     * Get all stored provider IDs
     */
    async getStoredProviders(): Promise<string[]> {
        const credentials = await db.credentials.toArray();
        return credentials.map((c: CredentialRecord) => c.providerId);
    }

    /**
     * Check if vault is properly initialized
     */
    isReady(): boolean {
        return this.initialized && this.masterKey !== null;
    }

    /**
     * Get initialization error if any
     */
    getInitializationError(): Error | null {
        return this.initError;
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

/**
 * @fileoverview Credential Vault - Public API Facade (Refactored)
 * @module lib/agent/providers/credential-vault
 *
 * Secure storage for API keys using Web Crypto API (AES-GCM) and Dexie.js.
 * This is the public API facade that orchestrates storage and encryption modules.
 *
 * FIX-2025-12-30: Added proper validation and fallback when localStorage keys are incomplete
 * - Validates all required localStorage keys exist before attempting decryption
 * - Gracefully creates new vault when keys are missing or corrupted
 * - Clears stale credentials when vault is reset
 * - Provides detailed error messages for debugging
 *
 * REFACTOR-2026-01-01: Split into 3 modules for better maintainability
 * - credential-storage.ts: IndexedDB operations
 * - credential-encryption.ts: AES-256-GCM encryption
 * - credential-vault.ts: Public API facade (this file)
 *
 * @epic WB-PR-2 - Refactor Credential Vault
 * @story WB-PR-2.1 - Split credential-vault.ts into 3 modules
 */

import { CredentialStorage } from './credential-storage';
import {
    CredentialEncryption,
    type EncryptedData,
} from './credential-encryption';

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
 * This is the public API facade that orchestrates:
 * - CredentialStorage for IndexedDB operations
 * - CredentialEncryption for cryptographic operations
 * - Vault lifecycle management (init, clear, status)
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
    private encryptionKey: CryptoKey | null = null;
    private initialized = false;
    private _cachedPassword?: string;
    private initError: Error | null = null;

    // Module dependencies
    private storage = new CredentialStorage();
    private encryption = new CredentialEncryption();

    constructor() {
        // No-op constructor (initialization is lazy)
    }

    /**
     * Helper to safely access localStorage
     */
    private getLocalStorageItem(key: string): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(key);
    }

    private setLocalStorageItem(key: string, value: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    }

    private removeLocalStorageItem(key: string): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }

    /**
     * Get the current vault status (for debugging)
     */
    async getStatus(): Promise<VaultStatus> {
        const providers = await this.storage.getAllProviderIds();
        return {
            isInitialized: this.initialized,
            hasPassword: !!this.getLocalStorageItem(VAULT_PASSWORD_STORAGE),
            hasEncryptedKey: !!this.getLocalStorageItem(ENCRYPTED_KEY_STORAGE),
            hasSalt: !!this.getLocalStorageItem(SALT_STORAGE),
            hasVersion: this.getLocalStorageItem(KEY_VERSION_STORAGE) === '3',
            credentialCount: providers.length,
            lastError: this.initError?.message || null,
        };
    }

    /**
     * Verify encryption compliance (AES-256-GCM)
     */
    verifyEncryptionCompliance() {
        return this.encryption.verifyEncryptionCompliance();
    }

    /**
     * Validate that all required localStorage keys are present
     */
    private validateStorageKeys(): { valid: boolean; missing: string[] } {
        const missing: string[] = [];

        if (!this.getLocalStorageItem(VAULT_PASSWORD_STORAGE)) {
            missing.push(VAULT_PASSWORD_STORAGE);
        }
        if (!this.getLocalStorageItem(ENCRYPTED_KEY_STORAGE)) {
            missing.push(ENCRYPTED_KEY_STORAGE);
        }
        if (!this.getLocalStorageItem(SALT_STORAGE)) {
            missing.push(SALT_STORAGE);
        }
        const version = this.getLocalStorageItem(KEY_VERSION_STORAGE);
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
     * FIX-2026-01-05: Added SSR guard to prevent initialization during server-side rendering
     *                 This prevents vault key regeneration on Vercel SSR deployments
     */
    async initialize(): Promise<void> {
        // =====================================================================
        // SSR GUARD - CRITICAL FOR VERCEL DEPLOYMENT
        // =====================================================================
        // During SSR, localStorage and IndexedDB are not available.
        // If we try to initialize, we'll create a new vault with keys that
        // get thrown away, and then the client will create ANOTHER vault.
        // This causes credential loss and models not loading.
        // =====================================================================
        if (typeof window === 'undefined') {
            console.log('[CredentialVault] SSR detected - skipping initialization');
            return;
        }

        // Check if already initialized with a valid master key
        if (this.initialized && this.masterKey) {
            console.log('[CredentialVault] Already initialized, skipping');
            return;
        }

        console.log('[CredentialVault] Initializing (client-side)...');

        // Validate storage keys first
        const validation = this.validateStorageKeys();
        console.log('[CredentialVault] Storage validation:', validation);

        if (!validation.valid) {
            console.warn('[CredentialVault] Missing localStorage keys:', validation.missing);
            console.log('[CredentialVault] Creating new vault...');

            // Clear any stale data and create new vault
            await this.createNewVault();
            this.initialized = true;
            console.log('[CredentialVault] New vault created and initialized');
            return;
        }

        try {
            // Try to load existing encrypted master key
            const storedEncryptedKey = this.getStoredEncryptedKey();
            const storedSalt = this.getStoredSalt();

            if (storedEncryptedKey && storedSalt) {
                console.log('[CredentialVault] Found existing encrypted key, attempting decryption...');

                // Derive wrapping key from password (AES-KW requires different key than AES-GCM)
                const vaultPassword = await this.getOrCreateVaultPassword();
                const wrappingKey = await this.encryption.deriveWrappingKey(vaultPassword, storedSalt);

                // Unwrap master key using AES-KW (P0 FIX: no more exportKey error)
                this.masterKey = await this.encryption.unwrapMasterKey(
                    storedEncryptedKey,
                    wrappingKey
                );

                // Also derive encryption key for API key encrypt/decrypt
                this.encryptionKey = await this.encryption.deriveKeyFromPassword(vaultPassword, storedSalt);

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
        const vaultPassword = this.encryption.generateRandomPassword();
        this.cachePassword(vaultPassword);
        this.storeSessionPassword(vaultPassword);

        // Generate salt for key derivation
        const salt = this.encryption.generateSalt();
        this.storeSalt(salt);

        // Derive wrapping key for AES-KW (different from encryption key)
        const wrappingKey = await this.encryption.deriveWrappingKey(vaultPassword, salt);

        // Also derive encryption key for API key encrypt/decrypt
        this.encryptionKey = await this.encryption.deriveKeyFromPassword(vaultPassword, salt);

        // Generate master key
        this.masterKey = await this.encryption.generateMasterKey();

        // Wrap and store master key using AES-KW (P0 FIX: no more exportKey error)
        const wrappedKey = await this.encryption.wrapMasterKey(this.masterKey, wrappingKey);
        this.storeEncryptedKey(wrappedKey);

        // Store version
        this.setLocalStorageItem(KEY_VERSION_STORAGE, '3');

        // Store password hint
        this.storeVaultPasswordHint();

        console.log('[CredentialVault] New vault created successfully');
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
        const newPassword = this.encryption.generateRandomPassword();
        this.storeSessionPassword(newPassword);
        this.cachePassword(newPassword);
        return newPassword;
    }

    /**
     * Securely store the vault password in localStorage
     */
    private storeSessionPassword(password: string): void {
        this.setLocalStorageItem(VAULT_PASSWORD_STORAGE, password);
    }

    /**
     * Retrieve the vault password
     */
    private getSessionPassword(): string | null {
        return this.getLocalStorageItem(VAULT_PASSWORD_STORAGE);
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
    private storeEncryptedKey(encrypted: string): void {
        this.setLocalStorageItem(ENCRYPTED_KEY_STORAGE, encrypted);
    }

    /**
     * Get stored encrypted master key
     */
    private getStoredEncryptedKey(): string | null {
        try {
            const stored = this.getLocalStorageItem(ENCRYPTED_KEY_STORAGE);
            const version = this.getLocalStorageItem(KEY_VERSION_STORAGE);

            if (version !== '3') return null;
            if (!stored) return null;

            return stored;
        } catch {
            return null;
        }
    }

    /**
     * Store salt
     */
    private storeSalt(salt: Uint8Array): void {
        const binary = Array.from(salt, (b) => String.fromCharCode(b)).join('');
        this.setLocalStorageItem(SALT_STORAGE, btoa(binary));
    }

    /**
     * Get stored salt
     */
    private getStoredSalt(): Uint8Array | null {
        try {
            const stored = this.getLocalStorageItem(SALT_STORAGE);
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
     * Store vault password hint
     */
    private storeVaultPasswordHint(): void {
        this.setLocalStorageItem('vg_vph_v3', 'Persistent encryption active');
    }

    /**
     * Store encrypted credentials for a provider
     *
     * @param providerId - Unique provider identifier
     * @param apiKey - Plain text API key to encrypt and store
     * @throws Error if vault not initialized or storage fails
     * 
     * FIX-2026-01-05: Check storage result and throw on failure for proper UI feedback
     */
    async storeCredentials(providerId: string, apiKey: string): Promise<void> {
        // SSR guard
        if (typeof window === 'undefined') {
            throw new Error('Cannot store credentials during SSR - operation requires browser environment');
        }

        await this.initialize();
        if (!this.masterKey) {
            throw new Error('Vault not initialized - please refresh the page and try again');
        }

        // Encrypt the API key
        const encryptedData = await this.encryption.encryptApiKey(apiKey, this.masterKey);

        // Store in IndexedDB and check result
        const result = await this.storage.storeCredentials(providerId, encryptedData.encrypted, encryptedData.iv);

        if (!result.success) {
            throw new Error(`Failed to store credentials for ${providerId} - IndexedDB may be unavailable`);
        }

        console.log('[CredentialVault] ✅ Stored credentials for:', providerId);
    }

    /**
     * Retrieve and decrypt credentials for a provider
     *
     * @param providerId - Unique provider identifier
     * @returns Decrypted API key or null if not found
     * 
     * FIX-2026-01-05: Added SSR guard to return null during server-side rendering
     */
    async getCredentials(providerId: string): Promise<string | null> {
        // SSR guard - credentials are not available during server-side rendering
        if (typeof window === 'undefined') {
            console.log('[CredentialVault] SSR detected - credentials not available');
            return null;
        }

        console.log('[CredentialVault] getCredentials called for:', providerId);

        await this.initialize();
        if (!this.masterKey) {
            console.error('[CredentialVault] Master key not available after initialization');
            throw new Error('Vault not initialized');
        }

        const credential = await this.storage.getCredential(providerId);
        console.log('[CredentialVault] Credential lookup result:', credential ? 'found' : 'not found');
        if (!credential) return null;

        try {
            // Decrypt the API key
            const encryptedData: EncryptedData = {
                encrypted: credential.encrypted,
                iv: credential.iv,
            };

            const decrypted = await this.encryption.decryptApiKey(encryptedData, this.masterKey);
            console.log('[CredentialVault] Decryption successful, key length:', decrypted.length);
            return decrypted;
        } catch (error) {
            console.error('[CredentialVault] Decryption failed:', error);
            throw error;
        }
    }

    /**
     * Check if credentials exist for a provider
     *
     * @param providerId - Unique provider identifier
     * @returns True if credentials exist
     */
    async hasCredentials(providerId: string): Promise<boolean> {
        return this.storage.hasCredentials(providerId);
    }

    /**
     * Delete credentials for a provider
     *
     * @param providerId - Unique provider identifier
     */
    async deleteCredentials(providerId: string): Promise<void> {
        await this.storage.deleteCredentials(providerId);
        console.log('[CredentialVault] Deleted credentials for:', providerId);
    }

    /**
     * Clear all credentials and reset the vault
     */
    async clear(): Promise<void> {
        console.log('[CredentialVault] Clearing vault...');

        // Clear all credentials from IndexedDB
        await this.storage.clearAll();

        // Clear all localStorage keys
        this.removeLocalStorageItem(ENCRYPTED_KEY_STORAGE);
        this.removeLocalStorageItem(SALT_STORAGE);
        this.removeLocalStorageItem(KEY_VERSION_STORAGE);
        this.removeLocalStorageItem(VAULT_PASSWORD_STORAGE);
        this.removeLocalStorageItem('vg_vph_v3');

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
     *
     * @returns Array of provider IDs with stored credentials
     */
    async getStoredProviders(): Promise<string[]> {
        return this.storage.getAllProviderIds();
    }

    /**
     * Check if vault is properly initialized
     *
     * @returns True if vault is initialized and ready
     */
    isReady(): boolean {
        return this.initialized && this.masterKey !== null;
    }

    /**
     * Get initialization error if any
     *
     * @returns Initialization error or null
     */
    getInitializationError(): Error | null {
        return this.initError;
    }
}

/**
 * Default singleton instance
 */
export const credentialVault = new CredentialVault();

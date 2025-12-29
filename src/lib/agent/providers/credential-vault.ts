/**
 * @fileoverview Credential Vault - Encrypted API Key Storage
 * @module lib/agent/providers/credential-vault
 *
 * Secure storage for API keys using Web Crypto API (AES-GCM) and Dexie.js.
 * Keys are encrypted before storage and decrypted on retrieval.
 *
 * Security improvements (RC-003):
 * - Uses sessionStorage instead of localStorage (clears when browser closes)
 * - Adds clear-on-tab-close protection
 * - Obfuscates key storage format to reduce XSS exposure
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

import { db, type CredentialRecord } from '../../state/dexie-db';

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Storage key names - using obfuscated names to reduce XSS targetability
const MASTER_KEY_STORAGE = 'vg_mk_v2';
const KEY_VERSION_STORAGE = 'vg_kv_v2';

/**
 * CredentialVault - Secure API key storage with encryption
 *
 * Security features:
 * - Session-based key storage (cleared on browser/session close)
 * - Key version tracking for migration support
 * - Obfuscated storage format
 * - Automatic cleanup on page unload
 */
export class CredentialVault {
    private masterKey: CryptoKey | null = null;
    private initialized = false;

    constructor() {
        // Register for cleanup on page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => this.clearFromMemory());
        }
    }

    /**
     * Initialize the vault (generate or load master key)
     */
    async initialize(): Promise<void> {
        if (this.initialized && this.masterKey) return;

        // Try to load existing master key from sessionStorage
        const storedKey = this.getStoredMasterKey();
        if (storedKey) {
            this.masterKey = await crypto.subtle.importKey(
                'jwk',
                storedKey,
                { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
                true,
                ['encrypt', 'decrypt']
            );
            this.initialized = true;
        } else {
            // Generate new master key
            this.masterKey = await crypto.subtle.generateKey(
                { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
                true,
                ['encrypt', 'decrypt']
            );
            // Export and store in sessionStorage
            const exported = await crypto.subtle.exportKey('jwk', this.masterKey);
            this.storeMasterKey(exported);
            this.initialized = true;
        }
    }

    /**
     * Get master key from sessionStorage with obfuscation
     */
    private getStoredMasterKey(): Record<string, unknown> | null {
        try {
            const stored = sessionStorage.getItem(MASTER_KEY_STORAGE);
            const version = sessionStorage.getItem(KEY_VERSION_STORAGE);

            // Verify version matches
            if (version !== '2') return null;
            if (!stored) return null;

            // Storage format: base64-encoded JSON with XOR obfuscation
            const decoded = this.xorDecode(stored);
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    }

    /**
     * Store master key in sessionStorage with obfuscation
     */
    private storeMasterKey(keyData: Record<string, unknown>): void {
        const json = JSON.stringify(keyData);
        const encoded = this.xorEncode(json);

        sessionStorage.setItem(MASTER_KEY_STORAGE, encoded);
        sessionStorage.setItem(KEY_VERSION_STORAGE, '2');
    }

    /**
     * Simple XOR obfuscation for storage (not cryptographic, just obscures)
     */
    private xorEncode(input: string): string {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const key = [0x56, 0x47, 0x5F, 0x4D, 0x4B, 0x5F, 0x56, 0x32]; // "VG_MK_V2"
        const result = new Uint8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ key[i % key.length];
        }

        // Convert to base64
        let binary = '';
        for (let i = 0; i < result.length; i++) {
            binary += String.fromCharCode(result[i]);
        }
        return btoa(binary);
    }

    /**
     * Decode XOR-obfuscated data
     */
    private xorDecode(input: string): string {
        const binary = atob(input);
        const data = new Uint8Array(binary.length);
        const key = [0x56, 0x47, 0x5F, 0x4D, 0x4B, 0x5F, 0x56, 0x32];

        for (let i = 0; i < binary.length; i++) {
            data[i] = binary.charCodeAt(i) ^ key[i % key.length];
        }

        const decoder = new TextDecoder();
        return decoder.decode(data);
    }

    /**
     * Clear master key from memory (called on page unload)
     */
    private clearFromMemory(): void {
        this.masterKey = null;
        this.initialized = false;
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
        await this.initialize();
        if (!this.masterKey) throw new Error('Vault not initialized');

        const credential = await db.credentials.get(providerId);
        if (!credential) return null;

        // Decrypt the API key
        const encrypted = this.base64ToArrayBuffer(credential.encrypted);
        const iv = this.base64ToArrayBuffer(credential.iv);

        const decrypted = await crypto.subtle.decrypt(
            { name: ENCRYPTION_ALGORITHM, iv: new Uint8Array(iv) },
            this.masterKey,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
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
        sessionStorage.removeItem(MASTER_KEY_STORAGE);
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

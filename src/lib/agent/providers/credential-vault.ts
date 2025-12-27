/**
 * @fileoverview Credential Vault - Encrypted API Key Storage
 * @module lib/agent/providers/credential-vault
 * 
 * Secure storage for API keys using Web Crypto API (AES-GCM) and Dexie.js.
 * Keys are encrypted before storage and decrypted on retrieval.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

import { db, type CredentialRecord } from '../../state/dexie-db';

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Master key storage key in localStorage (would use secure storage in production)
const MASTER_KEY_STORAGE = 'via-gent-master-key';

/**
 * CredentialVault - Secure API key storage with encryption
 */
export class CredentialVault {
    private masterKey: CryptoKey | null = null;

    /**
     * Initialize the vault (generate or load master key)
     */
    async initialize(): Promise<void> {
        if (this.masterKey) return;

        // Try to load existing master key
        const storedKey = localStorage.getItem(MASTER_KEY_STORAGE);
        if (storedKey) {
            const keyData = JSON.parse(storedKey);
            this.masterKey = await crypto.subtle.importKey(
                'jwk',
                keyData,
                { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
                true,
                ['encrypt', 'decrypt']
            );
        } else {
            // Generate new master key
            this.masterKey = await crypto.subtle.generateKey(
                { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
                true,
                ['encrypt', 'decrypt']
            );
            // Export and store
            const exported = await crypto.subtle.exportKey('jwk', this.masterKey);
            localStorage.setItem(MASTER_KEY_STORAGE, JSON.stringify(exported));
        }
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

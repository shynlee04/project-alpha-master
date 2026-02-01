/**
 * @fileoverview Credential Storage - IndexedDB Operations
 * @module infrastructure/ai/credential-storage
 *
 * Handles all IndexedDB operations for encrypted credential storage.
 * Separates storage concerns from encryption and vault management logic.
 *
 * FIX-2026-01-05: Made SSR-safe by using getDb() instead of db directly
 *
 * @epic WB-PR-2 - Refactor Credential Vault
 * @story WB-PR-2.1 - Split credential-vault.ts into 3 modules
 */

import { getDb, type CredentialRecord } from '@/infrastructure/persistence/dexie-db.js';

/**
 * Result of credential storage operation
 */
export interface StorageResult {
    success: boolean;
    providerId: string;
    timestamp: Date;
}

/**
 * CredentialStorage - IndexedDB operations for encrypted credentials
 *
 * Responsibilities:
 * - Store encrypted credentials in IndexedDB
 * - Retrieve encrypted credentials by provider ID
 * - Check credential existence
 * - Delete credentials
 * - Clear all credentials
 * - List all provider IDs with stored credentials
 *
 * SSR Safety: All methods check for window/IndexedDB availability
 */
export class CredentialStorage {
    /**
     * Check if we're in a browser environment with IndexedDB
     */
    private isAvailable(): boolean {
        return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
    }

    /**
     * Store encrypted credentials for a provider
     *
     * @param providerId - Unique provider identifier
     * @param encrypted - Base64-encoded encrypted data
     * @param iv - Base64-encoded initialization vector
     * @param workspaceId - Current workspace (default 'ide')
     * @returns Storage operation result
     */
    async storeCredentials(
        providerId: string,
        encrypted: string,
        iv: string,
        workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'
    ): Promise<StorageResult> {
        if (!this.isAvailable()) {
            console.warn('[CredentialStorage] Not available during SSR');
            return { success: false, providerId, timestamp: new Date() };
        }

        const db = getDb();
        if (!db) {
            throw new Error('[CredentialStorage] Database not available');
        }

        const credential: CredentialRecord = {
            providerId,
            workspaceId, // PERSIST-S002: Workspace isolation
            encrypted,
            iv,
            createdAt: new Date(),
        };

        await db.credentials.put(credential);
        console.log('[CredentialStorage] Stored credentials for:', providerId);

        return {
            success: true,
            providerId,
            timestamp: new Date(),
        };
    }

    /**
     * Retrieve encrypted credentials for a provider
     *
     * @param providerId - Unique provider identifier
     * @returns Credential record or null if not found
     */
    async getCredential(providerId: string): Promise<CredentialRecord | null> {
        if (!this.isAvailable()) return null;
        const db = getDb();
        if (!db) return null;

        const credential = await db.credentials.get(providerId);
        return credential || null;
    }

    /**
     * Check if credentials exist for a provider
     *
     * @param providerId - Unique provider identifier
     * @returns True if credentials exist
     */
    async hasCredentials(providerId: string): Promise<boolean> {
        if (!this.isAvailable()) return false;
        const db = getDb();
        if (!db) return false;

        const credential = await db.credentials.get(providerId);
        return credential !== undefined;
    }

    /**
     * Delete credentials for a provider
     *
     * @param providerId - Unique provider identifier
     */
    async deleteCredentials(providerId: string): Promise<void> {
        if (!this.isAvailable()) return;
        const db = getDb();
        if (!db) return;

        await db.credentials.delete(providerId);
        console.log('[CredentialStorage] Deleted credentials for:', providerId);
    }

    /**
     * Clear all credentials from storage
     */
    async clearAll(): Promise<void> {
        if (!this.isAvailable()) return;
        const db = getDb();
        if (!db) return;

        console.log('[CredentialStorage] Clearing all credentials...');
        await db.credentials.clear();
        console.log('[CredentialStorage] All credentials cleared');
    }

    /**
     * Get all provider IDs with stored credentials
     *
     * @returns Array of provider IDs
     */
    async getAllProviderIds(): Promise<string[]> {
        if (!this.isAvailable()) return [];
        const db = getDb();
        if (!db) return [];

        const credentials = await db.credentials.toArray();
        return credentials.map((c: CredentialRecord) => c.providerId);
    }

    /**
     * Get total count of stored credentials
     *
     * @returns Number of stored credentials
     */
    async getCredentialCount(): Promise<number> {
        if (!this.isAvailable()) return 0;
        const db = getDb();
        if (!db) return 0;

        return await db.credentials.count();
    }
}

/**
 * Helper functions for ArrayBuffer/Base64 conversion
 *
 * These are kept as pure functions rather than class methods
 * to make them easily testable and reusable.
 */

/**
 * Convert ArrayBuffer to Base64 string
 *
 * @param buffer - ArrayBuffer to convert
 * @returns Base64-encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 *
 * @param base64 - Base64-encoded string
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Convert Uint8Array to Base64 string
 *
 * @param bytes - Uint8Array to convert
 * @returns Base64-encoded string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array
 *
 * @param base64 - Base64-encoded string
 * @returns Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

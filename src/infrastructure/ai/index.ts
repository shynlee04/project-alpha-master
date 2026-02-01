/**
 * @fileoverview AI Infrastructure Barrel Export
 * @module infrastructure/ai
 * 
 * Canonical location for AI-related infrastructure:
 * - Credential vault (BYOK key storage)
 * - AI Gateway (future: Phase B)
 * - Provider adapters (future: Phase B)
 */

// Credential Vault
export { CredentialVault, credentialVault, type VaultStatus } from './credential-vault.js';
export { CredentialEncryption, type EncryptedData, type VaultKeys } from './credential-encryption.js';
export { CredentialStorage, arrayBufferToBase64, base64ToArrayBuffer, uint8ArrayToBase64, base64ToUint8Array, type StorageResult } from './credential-storage.js';

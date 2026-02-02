/**
 * @fileoverview AI Infrastructure Barrel Export
 * @module infrastructure/ai
 * 
 * Canonical location for AI-related infrastructure:
 * - Credential vault (BYOK key storage)
 * - AI Gateway (Phase B)
 * - Provider adapters (Phase B)
 */

// Credential Vault
export { CredentialVault, credentialVault, type VaultStatus } from './credential-vault.js';
export { CredentialEncryption, type EncryptedData, type VaultKeys } from './credential-encryption.js';
export { CredentialStorage, arrayBufferToBase64, base64ToArrayBuffer, uint8ArrayToBase64, base64ToUint8Array, type StorageResult } from './credential-storage.js';

// AI Gateway (Phase B)
export * from './gateway';

// Provider Adapters (Phase B)
export * from './adapters';

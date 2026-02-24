/**
 * Provider Vault Slice - Pure Vault Operations
 *
 * Thin wrapper around credentialVault for encryption/decryption operations.
 * No state management - pure async vault operations only.
 *
 * Key Design Decisions:
 * - No state (all operations go directly to vault)
 * - No metadata tracking (handled by crud-slice)
 * - No provider config sync (handled by crud-slice)
 * - SSR-safe (vault operations only in browser)
 *
 * @module providers/credentials/vault-slice
 * @story BYOK-01 - Split provider credentials god slice
 */

import { StateCreator } from 'zustand';
import { credentialVault } from '@/infrastructure/ai/credential-vault.js';

// ============================================================================
// PROVIDER VAULT SLICE
// ============================================================================

/**
 * Provider Vault Slice State Creator
 *
 * Pure vault operations wrapper - no state management.
 * All operations delegate to credentialVault singleton.
 *
 * Cross-Slice Communication:
 * - None (pure operations, no state)
 *
 * Note: This slice has no state - all operations are async and delegate
 * directly to the credentialVault. The crud-slice handles metadata and
 * provider config synchronization.
 */
export const createProviderVaultSlice: StateCreator<
  AppState,
  [],
  [],
  {
    // Actions - vault operations (no state)
    storeVaultCredential: (providerId: string, apiKey: string) => Promise<void>;
    retrieveVaultCredential: (providerId: string) => Promise<string | null>;
    hasVaultCredential: (providerId: string) => Promise<boolean>;
    deleteVaultCredential: (providerId: string) => Promise<void>;
    getAllStoredProviders: () => Promise<string[]>;
  }
> = () => ({
  // ========================================================================
  // ACTIONS - Vault Operations (Pure Delegate)
  // ========================================================================

  /**
   * Store API key in encrypted credential vault
   *
   * Direct delegation to credentialVault.storeCredentials().
   *
   * @param providerId - Provider ID to store key for
   * @param apiKey - Plain text API key to encrypt and store
   * @throws Error if vault unavailable or storage fails
   */
  storeVaultCredential: async (providerId: string, apiKey: string) => {
    console.log('[ProviderVaultSlice] Storing credential for:', providerId);
    await credentialVault.storeCredentials(providerId, apiKey);
  },

  /**
   * Retrieve API key from credential vault
   *
   * Direct delegation to credentialVault.getCredentials().
   *
   * @param providerId - Provider ID to retrieve key for
   * @returns Decrypted API key or null if not found
   * @throws Error if vault unavailable or decryption fails
   */
  retrieveVaultCredential: async (providerId: string): Promise<string | null> => {
    console.log('[ProviderVaultSlice] Retrieving credential for:', providerId);
    return await credentialVault.getCredentials(providerId);
  },

  /**
   * Check if provider has a stored API key
   *
   * Direct delegation to credentialVault.hasCredentials().
   *
   * @param providerId - Provider ID to check
   * @returns True if key exists in vault
   */
  hasVaultCredential: async (providerId: string): Promise<boolean> => {
    return await credentialVault.hasCredentials(providerId);
  },

  /**
   * Delete API key from credential vault
   *
   * Direct delegation to credentialVault.deleteCredentials().
   *
   * @param providerId - Provider ID to delete key for
   */
  deleteVaultCredential: async (providerId: string) => {
    console.log('[ProviderVaultSlice] Deleting credential for:', providerId);
    await credentialVault.deleteCredentials(providerId);
  },

  /**
   * Get all provider IDs with stored credentials
   *
   * Direct delegation to credentialVault.getStoredProviders().
   *
   * @returns Array of provider IDs with stored keys
   */
  getAllStoredProviders: async (): Promise<string[]> => {
    return await credentialVault.getStoredProviders();
  },
});

// ============================================================================
// TYPE IMPORTS (for AppState generic)
// ============================================================================

/**
 * AppState Interface (minimal for TypeScript compilation)
 *
 * Note: This slice has no state - only actions.
 */
interface AppState {
  // Vault actions (defined in this slice)
  storeVaultCredential: (providerId: string, apiKey: string) => Promise<void>;
  retrieveVaultCredential: (providerId: string) => Promise<string | null>;
  hasVaultCredential: (providerId: string) => Promise<boolean>;
  deleteVaultCredential: (providerId: string) => Promise<void>;
  getAllStoredProviders: () => Promise<string[]>;
}

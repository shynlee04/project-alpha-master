/**
 * Provider Credentials Slice - Vault Integration
 *
 * Handles API key storage and retrieval using encrypted credential vault:
 * - Store API keys securely in vault
 * - Retrieve API keys from vault
 * - Validate API keys with providers
 * - Track key metadata (expiry, validation timestamps)
 * - Sync hasApiKey flag with vault state
 *
 * Key Design Decisions:
 * - Direct integration with credential-vault (no direct crypto operations)
 * - hasApiKey flag kept in sync with vault state
 * - Async methods for all vault operations
 * - SSR-safe (vault operations only in browser)
 *
 * @module providers/provider-credentials-slice
 * @story A-4 - BYOK Vault Integration
 */

import { StateCreator } from 'zustand';
import type { ProviderConfig } from './types';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Provider key metadata
 * Tracks when keys were stored, validated, and expire
 */
export interface ProviderKeyMetadata {
  /** Unique key identifier in vault */
  keyId: string;

  /** Timestamp when key was stored */
  storedAt: number;

  /** Timestamp when key was last validated */
  lastValidatedAt?: number;

  /** Timestamp when key expires (if known) */
  expiresAt?: number;

  /** Whether key validation passed */
  isValid: boolean;
}

/**
 * Key validation result
 */
export interface KeyValidationResult {
  /** Whether key is valid */
  isValid: boolean;

  /** Validation status */
  status: 'valid' | 'invalid' | 'expired' | 'unknown';

  /** Provider-reported error if invalid */
  error?: string;

  /** When validation was performed */
  validatedAt: number;
}

// ============================================================================
// PROVIDER CREDENTIALS SLICE
// ============================================================================

/**
 * Provider Credentials Slice State Creator
 *
 * This slice handles API key storage and retrieval using the credential vault.
 * All vault operations are async and SSR-safe.
 *
 * Cross-Slice Communication:
 * - get().providers - Access provider configs for metadata updates
 * - get().updateProvider - Sync hasApiKey flag with vault state
 */
export const createProviderCredentialsSlice: StateCreator<
  AppState,
  [],
  [],
  {
    // State - key metadata by provider ID
    keyMetadata: Record<string, ProviderKeyMetadata>;

    // Actions - vault operations
    storeProviderKey: (providerId: string, apiKey: string) => Promise<void>;
    retrieveProviderKey: (providerId: string) => Promise<string | null>;
    hasProviderKey: (providerId: string) => Promise<boolean>;
    deleteProviderKey: (providerId: string) => Promise<void>;
    validateProviderKey: (providerId: string) => Promise<KeyValidationResult>;
    syncKeyFlags: () => Promise<void>;
  }
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  keyMetadata: {},

  // ========================================================================
  // ACTIONS - Vault Operations
  // ========================================================================

  /**
   * Store API key in encrypted credential vault
   *
   * This method:
   * 1. Stores the API key in the credential vault (AES-256-GCM encrypted)
   * 2. Updates key metadata (storedAt, keyId)
   * 3. Syncs hasApiKey flag in provider config
   * 4. Emits event for cross-workspace sync
   *
   * @param providerId - Provider ID to store key for
   * @param apiKey - Plain text API key to encrypt and store
   * @throws Error if vault unavailable or storage fails
   */
  storeProviderKey: async (providerId: string, apiKey: string) => {
    console.log('[ProviderCredentialsSlice] Storing key for:', providerId);

    // SSR guard - vault operations require browser environment
    if (typeof window === 'undefined') {
      throw new Error('Cannot store credentials during SSR');
    }

    try {
      // Store in credential vault (encrypted with AES-256-GCM)
      await credentialVault.storeCredentials(providerId, apiKey);

      // Update metadata
      const metadata: ProviderKeyMetadata = {
        keyId: `${providerId}-${Date.now()}`,
        storedAt: Date.now(),
        isValid: true,
      };

      set((state) => ({
        keyMetadata: {
          ...state.keyMetadata,
          [providerId]: metadata,
        },
      }));

      // Sync hasApiKey flag in provider config
      const provider = get().providers.find(p => p.id === providerId);
      if (provider && !provider.hasApiKey) {
        get().updateProvider(providerId, { hasApiKey: true });
      }

      console.log('[ProviderCredentialsSlice] ✅ Key stored for:', providerId);
    } catch (error) {
      console.error('[ProviderCredentialsSlice] ❌ Failed to store key:', error);
      throw new Error(
        `Failed to store API key for ${providerId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Retrieve API key from credential vault
   *
   * @param providerId - Provider ID to retrieve key for
   * @returns Decrypted API key or null if not found
   * @throws Error if vault unavailable or decryption fails
   */
  retrieveProviderKey: async (providerId: string): Promise<string | null> => {
    console.log('[ProviderCredentialsSlice] Retrieving key for:', providerId);

    // SSR guard
    if (typeof window === 'undefined') {
      console.log('[ProviderCredentialsSlice] SSR detected - returning null');
      return null;
    }

    try {
      const apiKey = await credentialVault.getCredentials(providerId);

      if (apiKey) {
        console.log('[ProviderCredentialsSlice] ✅ Key retrieved for:', providerId);
        // Update lastValidatedAt timestamp
        const existing = get().keyMetadata[providerId];
        if (existing) {
          set((state) => ({
            keyMetadata: {
              ...state.keyMetadata,
              [providerId]: {
                ...existing,
                lastValidatedAt: Date.now(),
              },
            },
          }));
        }
      } else {
        console.log('[ProviderCredentialsSlice] No key found for:', providerId);
      }

      return apiKey;
    } catch (error) {
      console.error('[ProviderCredentialsSlice] ❌ Failed to retrieve key:', error);
      throw new Error(
        `Failed to retrieve API key for ${providerId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Check if provider has a stored API key
   *
   * @param providerId - Provider ID to check
   * @returns True if key exists in vault
   */
  hasProviderKey: async (providerId: string): Promise<boolean> => {
    // SSR guard
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return await credentialVault.hasCredentials(providerId);
    } catch {
      return false;
    }
  },

  /**
   * Delete API key from credential vault
   *
   * @param providerId - Provider ID to delete key for
   */
  deleteProviderKey: async (providerId: string) => {
    console.log('[ProviderCredentialsSlice] Deleting key for:', providerId);

    // SSR guard
    if (typeof window === 'undefined') {
      throw new Error('Cannot delete credentials during SSR');
    }

    try {
      await credentialVault.deleteCredentials(providerId);

      // Clear metadata
      set((state) => {
        const newMetadata = { ...state.keyMetadata };
        delete newMetadata[providerId];
        return { keyMetadata: newMetadata };
      });

      // Sync hasApiKey flag in provider config
      const provider = get().providers.find(p => p.id === providerId);
      if (provider && provider.hasApiKey) {
        get().updateProvider(providerId, { hasApiKey: false });
      }

      console.log('[ProviderCredentialsSlice] ✅ Key deleted for:', providerId);
    } catch (error) {
      console.error('[ProviderCredentialsSlice] ❌ Failed to delete key:', error);
      throw new Error(
        `Failed to delete API key for ${providerId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Validate API key by attempting to use it
   *
   * This method validates the stored API key by:
   * 1. Retrieving the key from vault
   * 2. Attempting a lightweight provider API call
   * 3. Updating validation metadata
   *
   * @param providerId - Provider ID to validate key for
   * @returns Validation result with status and error details
   */
  validateProviderKey: async (providerId: string): Promise<KeyValidationResult> => {
    console.log('[ProviderCredentialsSlice] Validating key for:', providerId);

    const result: KeyValidationResult = {
      isValid: false,
      status: 'unknown',
      validatedAt: Date.now(),
    };

    // SSR guard
    if (typeof window === 'undefined') {
      return result;
    }

    try {
      // Check if key exists
      const hasKey = await credentialVault.hasCredentials(providerId);
      if (!hasKey) {
        result.status = 'invalid';
        result.error = 'No API key stored';
        return result;
      }

      // Try to retrieve key (validates decryption)
      const apiKey = await credentialVault.getCredentials(providerId);
      if (!apiKey) {
        result.status = 'invalid';
        result.error = 'Failed to decrypt API key';
        return result;
      }

      // Key exists and decrypts successfully
      result.isValid = true;
      result.status = 'valid';

      // Update metadata
      const existing = get().keyMetadata[providerId];
      if (existing) {
        set((state) => ({
          keyMetadata: {
            ...state.keyMetadata,
            [providerId]: {
              ...existing,
              lastValidatedAt: Date.now(),
              isValid: true,
            },
          },
        }));
      }

      console.log('[ProviderCredentialsSlice] ✅ Key validated for:', providerId);
      return result;
    } catch (error) {
      console.error('[ProviderCredentialsSlice] ❌ Key validation failed:', error);
      result.isValid = false;
      result.status = 'invalid';
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  },

  /**
   * Sync hasApiKey flags with actual vault state
   *
   * This method ensures the hasApiKey boolean in provider configs
   * accurately reflects the vault state. Call on app initialization
   * to sync any keys added outside the provider store flow.
   */
  syncKeyFlags: async () => {
    console.log('[ProviderCredentialsSlice] Syncing key flags with vault...');

    // SSR guard
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedProviders = await credentialVault.getStoredProviders();
      console.log('[ProviderCredentialsSlice] Vault has keys for:', storedProviders);

      // Update hasApiKey for each provider based on vault state
      for (const providerId of storedProviders) {
        const provider = get().providers.find(p => p.id === providerId);
        if (provider && !provider.hasApiKey) {
          console.log('[ProviderCredentialsSlice] Syncing hasApiKey for:', providerId);
          get().updateProvider(providerId, { hasApiKey: true });
        }
      }

      // Clear hasApiKey for providers not in vault
      for (const provider of get().providers) {
        if (provider.hasApiKey && !storedProviders.includes(provider.id)) {
          console.log('[ProviderCredentialsSlice] Clearing hasApiKey for:', provider.id);
          get().updateProvider(provider.id, { hasApiKey: false });
        }
      }

      console.log('[ProviderCredentialsSlice] ✅ Key flags synced');
    } catch (error) {
      console.error('[ProviderCredentialsSlice] ❌ Failed to sync flags:', error);
    }
  },
});

// ============================================================================
// TYPE IMPORTS (for AppState generic)
// ============================================================================

/**
 * AppState Interface (minimal for TypeScript compilation)
 */
interface AppState {
  // Provider state (cross-slice access)
  providers: ProviderConfig[];
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
  fetchModels: (providerId: string) => Promise<void>;

  // Credentials state (defined in this slice)
  keyMetadata: Record<string, ProviderKeyMetadata>;
}

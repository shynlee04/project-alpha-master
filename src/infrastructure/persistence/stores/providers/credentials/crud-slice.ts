/**
 * Provider Credentials CRUD Slice - Metadata and Validation
 *
 * Handles credential metadata, validation, and provider config sync.
 * Delegates vault operations to vault-slice.
 *
 * Key Design Decisions:
 * - Owns keyMetadata state
 * - Validates keys before/after storage using Zod schemas
 * - Syncs hasApiKey flag with provider configs
 * - Uses vault-slice for encryption/decryption
 *
 * @module providers/credentials/crud-slice
 * @story BYOK-01 - Split provider credentials god slice
 * @story BYOK-02 - Add Zod Validation Schemas
 */

import { StateCreator } from 'zustand';
import type { ProviderConfig } from '../types';
import { validateProviderApiKey as validateKeySchema } from './schemas';

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
// PROVIDER CREDENTIALS CRUD SLICE
// ============================================================================

/**
 * Provider Credentials CRUD Slice State Creator
 *
 * Handles metadata, validation, and provider config sync.
 * Delegates vault operations to vault-slice methods.
 *
 * Cross-Slice Communication:
 * - get().providers - Access provider configs for metadata updates
 * - get().updateProvider - Sync hasApiKey flag with vault state
 * - get().{vault methods} - Access vault-slice for encryption/decryption
 */
export const createProviderCredentialsCrudSlice: StateCreator<
  AppState,
  [],
  [],
  {
    // State - key metadata by provider ID
    keyMetadata: Record<string, ProviderKeyMetadata>;

    // Actions - CRUD operations
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
  // ACTIONS - CRUD Operations with Metadata
  // ========================================================================

  /**
   * Store API key in vault and update metadata
   *
   * This method:
   * 1. Validates API key format using Zod schemas (BYOK-02)
   * 2. Stores the API key via vault-slice (encrypted)
   * 3. Updates key metadata (storedAt, keyId)
   * 4. Syncs hasApiKey flag in provider config
   *
   * @param providerId - Provider ID to store key for
   * @param apiKey - Plain text API key to encrypt and store
   * @throws Error if validation fails, vault unavailable, or storage fails
   */
  storeProviderKey: async (providerId: string, apiKey: string) => {
    console.log('[ProviderCredentialsCrudSlice] Storing key for:', providerId);

    // SSR guard - vault operations require browser environment
    if (typeof window === 'undefined') {
      throw new Error('Cannot store credentials during SSR');
    }

    try {
      // BYOK-02: Validate API key format before storing
      const validationResult = validateKeySchema(providerId, apiKey);
      if (!validationResult.success) {
        const error = validationResult.error || 'Invalid API key format';
        console.error('[ProviderCredentialsCrudSlice] ❌ Validation failed:', error);
        throw new Error(`Invalid API key format: ${error}`);
      }
      console.log('[ProviderCredentialsCrudSlice] ✅ Key format validated for:', providerId);

      // Store in vault via vault-slice
      await get().storeVaultCredential(providerId, apiKey);

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

      console.log('[ProviderCredentialsCrudSlice] ✅ Key stored for:', providerId);
    } catch (error) {
      console.error('[ProviderCredentialsCrudSlice] ❌ Failed to store key:', error);
      throw new Error(
        `Failed to store API key for ${providerId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Retrieve API key from vault
   *
   * @param providerId - Provider ID to retrieve key for
   * @returns Decrypted API key or null if not found
   * @throws Error if vault unavailable or decryption fails
   */
  retrieveProviderKey: async (providerId: string): Promise<string | null> => {
    console.log('[ProviderCredentialsCrudSlice] Retrieving key for:', providerId);

    // SSR guard
    if (typeof window === 'undefined') {
      console.log('[ProviderCredentialsCrudSlice] SSR detected - returning null');
      return null;
    }

    try {
      const apiKey = await get().retrieveVaultCredential(providerId);

      if (apiKey) {
        console.log('[ProviderCredentialsCrudSlice] ✅ Key retrieved for:', providerId);
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
        console.log('[ProviderCredentialsCrudSlice] No key found for:', providerId);
      }

      return apiKey;
    } catch (error) {
      console.error('[ProviderCredentialsCrudSlice] ❌ Failed to retrieve key:', error);
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
      return await get().hasVaultCredential(providerId);
    } catch {
      return false;
    }
  },

  /**
   * Delete API key from vault
   *
   * @param providerId - Provider ID to delete key for
   */
  deleteProviderKey: async (providerId: string) => {
    console.log('[ProviderCredentialsCrudSlice] Deleting key for:', providerId);

    // SSR guard
    if (typeof window === 'undefined') {
      throw new Error('Cannot delete credentials during SSR');
    }

    try {
      await get().deleteVaultCredential(providerId);

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

      console.log('[ProviderCredentialsCrudSlice] ✅ Key deleted for:', providerId);
    } catch (error) {
      console.error('[ProviderCredentialsCrudSlice] ❌ Failed to delete key:', error);
      throw new Error(
        `Failed to delete API key for ${providerId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Validate API key by checking vault state
   *
   * This method validates the stored API key by:
   * 1. Checking if key exists in vault
   * 2. Verifying decryption succeeds
   * 3. Updating validation metadata
   *
   * @param providerId - Provider ID to validate key for
   * @returns Validation result with status and error details
   */
  validateProviderKey: async (providerId: string): Promise<KeyValidationResult> => {
    console.log('[ProviderCredentialsCrudSlice] Validating key for:', providerId);

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
      const hasKey = await get().hasVaultCredential(providerId);
      if (!hasKey) {
        result.status = 'invalid';
        result.error = 'No API key stored';
        return result;
      }

      // Try to retrieve key (validates decryption)
      const apiKey = await get().retrieveVaultCredential(providerId);
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

      console.log('[ProviderCredentialsCrudSlice] ✅ Key validated for:', providerId);
      return result;
    } catch (error) {
      console.error('[ProviderCredentialsCrudSlice] ❌ Key validation failed:', error);
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
    console.log('[ProviderCredentialsCrudSlice] Syncing key flags with vault...');

    // SSR guard
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedProviders = await get().getAllStoredProviders();
      console.log('[ProviderCredentialsCrudSlice] Vault has keys for:', storedProviders);

      // Update hasApiKey for each provider based on vault state
      for (const providerId of storedProviders) {
        const provider = get().providers.find(p => p.id === providerId);
        if (provider && !provider.hasApiKey) {
          console.log('[ProviderCredentialsCrudSlice] Syncing hasApiKey for:', providerId);
          get().updateProvider(providerId, { hasApiKey: true });
        }
      }

      // Clear hasApiKey for providers not in vault
      for (const provider of get().providers) {
        if (provider.hasApiKey && !storedProviders.includes(provider.id)) {
          console.log('[ProviderCredentialsCrudSlice] Clearing hasApiKey for:', provider.id);
          get().updateProvider(provider.id, { hasApiKey: false });
        }
      }

      console.log('[ProviderCredentialsCrudSlice] ✅ Key flags synced');
    } catch (error) {
      console.error('[ProviderCredentialsCrudSlice] ❌ Failed to sync flags:', error);
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

  // Vault operations (from vault-slice)
  storeVaultCredential: (providerId: string, apiKey: string) => Promise<void>;
  retrieveVaultCredential: (providerId: string) => Promise<string | null>;
  hasVaultCredential: (providerId: string) => Promise<boolean>;
  deleteVaultCredential: (providerId: string) => Promise<void>;
  getAllStoredProviders: () => Promise<string[]>;

  // Credentials state (defined in this slice)
  keyMetadata: Record<string, ProviderKeyMetadata>;
}

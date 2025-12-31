/**
 * @fileoverview Provider Credentials Slice
 * @module infrastructure/persistence/stores/providers/provider-store-credentials
 * @governance EPIC-7-1
 *
 * API key vault with AES-256-GCM encryption.
 * Manages provider credentials with workspace-scoped access.
 *
 * December 2025 Patterns:
 * - Encrypted credential storage
 * - Workspace-scoped credential access
 * - Credential validation with provider adapters
 */

import { StateCreator } from 'zustand';
import type { ProviderCredential } from '@/core/entities/Provider';
import { ProviderVault } from '@/lib/agent/providers/credential-vault';
import { crossWorkspaceEventBus } from '@/lib/events';
import type { ProviderConfigChangeEvent } from '@/lib/events';
import { useWorkspaceStore } from '@/lib/state';

// ============================================================================
// State
// ============================================================================

/**
 * Provider credentials slice state
 */
export interface ProviderCredentialsState {
  /** Encrypted API keys (persisted to IndexedDB) */
  credentials: Record<string, ProviderCredential>;
  /** Decryption or validation errors per provider */
  credentialErrors: Record<string, string>;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Provider credentials slice actions
 */
export interface ProviderCredentialsActions {
  /** Save or update provider credential (encrypted) */
  setCredential: (providerId: string, credential: ProviderCredential) => void;
  /** Remove provider credential */
  removeCredential: (providerId: string) => void;
  /** Get decrypted credential for provider */
  getCredential: (providerId: string) => ProviderCredential | null;
  /** Validate credential with provider adapter */
  validateCredential: (providerId: string) => Promise<boolean>;
  /** Clear all credentials (logout action) */
  clearAllCredentials: () => void;
}

// ============================================================================
// Slice Type
// ============================================================================

/**
 * Combined credentials slice type
 */
export type ProviderCredentialsSlice =
  ProviderCredentialsState & ProviderCredentialsActions;

// ============================================================================
// Slice Creator
// ============================================================================

/**
 * Create provider credentials slice
 *
 * @param set - Zustand set function
 * @param get - Zustand get function
 * @returns Credentials slice state and actions
 */
export const createProviderCredentialsSlice: StateCreator<
  ProviderCredentialsSlice,
  [],
  [],
  ProviderCredentialsSlice
> = (set, get) => ({
  credentials: {},
  credentialErrors: {},

  setCredential: (providerId, credential) => {
    console.log('[ProviderStore] Setting credential:', providerId);

    // Encrypt API key before storing
    const encrypted = ProviderVault.encrypt(credential.apiKey);

    set((state) => ({
      credentials: {
        ...state.credentials,
        [providerId]: {
          ...credential,
          apiKey: encrypted, // Store encrypted version
        },
      },
      credentialErrors: {
        ...state.credentialErrors,
        [providerId]: '', // Clear any existing error
      },
    }));

    // Emit event for cross-workspace sync
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: useWorkspaceStore.getState().currentWorkspaceType,
      providerId,
      changeType: 'credential-updated',
    } as ProviderConfigChangeEvent);
  },

  removeCredential: (providerId) => {
    console.log('[ProviderStore] Removing credential:', providerId);

    set((state) => {
      const { [providerId]: removed, ...remaining } = state.credentials;
      const { [providerId]: errorRemoved, ...remainingErrors } = state.credentialErrors;

      return {
        credentials: remaining,
        credentialErrors: remainingErrors,
      };
    });

    // Emit event
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: useWorkspaceStore.getState().currentWorkspaceType,
      providerId,
      changeType: 'credential-removed',
    } as ProviderConfigChangeEvent);
  },

  getCredential: (providerId) => {
    const credential = get().credentials[providerId];
    if (!credential) {
      console.warn('[ProviderStore] Credential not found:', providerId);
      return null;
    }

    // Decrypt API key on read
    try {
      const decrypted = ProviderVault.decrypt(credential.apiKey);
      return {
        ...credential,
        apiKey: decrypted, // Return decrypted version for use
      };
    } catch (error) {
      console.error('[ProviderStore] Failed to decrypt credential:', error);
      set((state) => ({
        credentialErrors: {
          ...state.credentialErrors,
          [providerId]: 'Failed to decrypt API key',
        },
      }));
      return null;
    }
  },

  validateCredential: async (providerId) => {
    const credential = get().getCredential(providerId);
    if (!credential) {
      set((state) => ({
        credentialErrors: {
          ...state.credentialErrors,
          [providerId]: 'No credential found',
        },
      }));
      return false;
    }

    // Validate with provider adapter
    try {
      const isValid = await ProviderVault.validate(credential);

      if (!isValid) {
        set((state) => ({
          credentialErrors: {
            ...state.credentialErrors,
            [providerId]: 'Invalid API key',
          },
        }));
      }

      console.log('[ProviderStore] Credential validation:', providerId, isValid ? 'PASS' : 'FAIL');
      return isValid;
    } catch (error) {
      console.error('[ProviderStore] Credential validation error:', error);
      set((state) => ({
        credentialErrors: {
          ...state.credentialErrors,
          [providerId]: error instanceof Error ? error.message : 'Validation failed',
        },
      }));
      return false;
    }
  },

  clearAllCredentials: () => {
    console.warn('[ProviderStore] Clearing all credentials');
    set({
      credentials: {},
      credentialErrors: {},
    });

    // Emit event for all workspaces
    const workspaces: Array<'ide' | 'knowledge' | 'study' | 'notes'> =
      ['ide', 'knowledge', 'study', 'notes'];

    for (const workspace of workspaces) {
      crossWorkspaceEventBus.emitProviderConfigChange({
        workspaceId: workspace,
        providerId: '*',
        changeType: 'all-credentials-cleared',
      } as ProviderConfigChangeEvent);
    }
  },
});

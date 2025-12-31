/**
 * @fileoverview Provider Store - Single Source of Truth
 * @module infrastructure/persistence/stores/providers
 * @governance EPIC-7-1
 *
 * Consolidated provider configuration store replacing 3 duplicate stores.
 * Workspace-aware with Dexie persistence and cross-workspace event sync.
 *
 * December 2025 Patterns:
 * - Slice pattern for focused state management (<120 lines each)
 * - Apply persist middleware ONLY to combined store (not individual slices)
 * - partialize for selective persistence (API keys yes, UI state no)
 * - Workspace-scoped state for multi-workspace architecture
 *
 * @example
 * ```tsx
 * // Use typed hooks for best DX
 * const { getCredential, setCredential } = useProviderCredentials();
 * const { activeProvider, setActiveProvider } = useProviderSelection();
 * const { isProviderAvailableInWorkspace } = useProviderWorkspaces();
 *
 * // Auto-start event listening
 * useProviderEvents();
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/dexie-storage';
import { createProviderCoreSlice, type ProviderCoreSlice } from './provider-store-core';
import {
  createProviderCredentialsSlice,
  type ProviderCredentialsSlice,
} from './provider-store-credentials';
import {
  createProviderWorkspaceSlice,
  type ProviderWorkspaceSlice,
} from './provider-store-workspace';
import {
  createProviderEventsSlice,
  type ProviderEventsSlice,
  useProviderEvents,
  useCurrentWorkspaceProvider,
  useProviderSelection as useProviderSelectionHook,
} from './provider-store-events';

// ============================================================================
// Combined Store Type
// ============================================================================

/**
 * Complete provider store state
 *
 * Combines all slices into single type for type safety.
 */
export type ProviderStoreState =
  ProviderCoreSlice &
  ProviderCredentialsSlice &
  ProviderWorkspaceSlice &
  ProviderEventsSlice;

// ============================================================================
// Store Creation with Persist
// ============================================================================

/**
 * Provider store - Single source of truth for provider configuration
 *
 * **CRITICAL**: Apply persist middleware to COMBINED store only.
 * Do NOT apply persist to individual slices (causes multiple hydration cycles).
 *
 * **Storage Strategy**:
 * - ✅ Persist: credentials (encrypted), workspaceProviders, providerAvailability
 * - ❌ Don't persist: uiState (transient), isListening (runtime state)
 *
 * **Migration**: Version 0 → 1 consolidates 3 duplicate localStorage stores
 */
export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (...a) => ({
      ...createProviderCoreSlice(...a),
      ...createProviderCredentialsSlice(...a),
      ...createProviderWorkspaceSlice(...a),
      ...createProviderEventsSlice(...a),
    }),
    {
      name: 'provider-config',
      storage: createJSONStorage(() => createDexieStorage('providerConfig')),

      // Selective persistence - December 2025 pattern
      partialize: (state) => ({
        // ✅ PERSIST: Encrypted credentials
        credentials: state.credentials,

        // ✅ PERSIST: Workspace provider selections
        workspaceProviders: state.workspaceProviders,

        // ✅ PERSIST: Provider availability per workspace
        providerAvailability: state.providerAvailability,

        // ✅ PERSIST: Default providers
        defaultProviders: state.defaultProviders,

        // ✅ PERSIST: Hydration flag
        _hasHydrated: state._hasHydrated,

        // ❌ DON'T PERSIST: Transient UI state
        // uiState: state.uiState,

        // ❌ DON'T PERSIST: Runtime event listening state
        // isListening: state.isListening,

        // ❌ DON'T PERSIST: Event history (debug only)
        // eventHistory: state.eventHistory,
      }),

      // Schema versioning for migrations
      version: 1,

      // Migration handler
      migrate: (persistedState, version) => {
        console.log('[ProviderStore] Migrating from version', version);

        if (version === 0) {
          // Migration from old localStorage stores
          // TODO: Implement migrateFromV0() helper
          console.log('[ProviderStore] Running v0 → v1 migration');
          return persistedState;
        }

        return persistedState;
      },

      // Hydration lifecycle hook
      onRehydrateStorage: () => (state) => {
        console.log('[ProviderStore] Rehydration complete');

        if (state) {
          state.setHasHydrated(true);

          // Auto-start event listening after hydration
          if (!state.isListening) {
            console.log('[ProviderStore] Auto-starting event listeners');
            const cleanup = state.startListening();

            // Cleanup on page unload
            if (typeof window !== 'undefined') {
              window.addEventListener('beforeunload', cleanup);
            }
          }
        }
      },
    }
  )
);

// ============================================================================
// Typed Hooks - Best DX for UI Components
// ============================================================================

/**
 * Provider credentials hook
 *
 * Use for API key CRUD operations.
 *
 * @example
 * ```tsx
 * const { getCredential, setCredential, validateCredential } = useProviderCredentials();
 *
 * const credential = getCredential('openrouter');
 * await setCredential('openrouter', { providerId: 'openrouter', apiKey: 'sk-...' });
 * const isValid = await validateCredential('openrouter');
 * ```
 */
export const useProviderCredentials = () =>
  useProviderStore((state) => ({
    credentials: state.credentials,
    credentialErrors: state.credentialErrors,
    setCredential: state.setCredential,
    removeCredential: state.removeCredential,
    getCredential: state.getCredential,
    validateCredential: state.validateCredential,
    clearAllCredentials: state.clearAllCredentials,
  }));

/**
 * Provider selection hook
 *
 * Use for workspace-scoped provider selection.
 *
 * @example
 * ```tsx
 * const { activeProvider, setActiveProvider } = useProviderSelection();
 *
 * // Set active provider for current workspace
 * setActiveProvider('openrouter');
 *
 * // Get active provider for IDE workspace
 * const provider = getActiveProvider('ide');
 * ```
 */
export const useProviderSelection = () =>
  useProviderStore((state) => ({
    workspaceProviders: state.workspaceProviders,
    setActiveProvider: state.setActiveProvider,
    getActiveProvider: state.getActiveProvider,
    clearWorkspaceProvider: state.clearWorkspaceProvider,
  }));

/**
 * Provider workspaces hook
 *
 * Use for workspace availability management.
 *
 * @example
 * ```tsx
 * const { isProviderAvailableInWorkspace, setProviderWorkspaces } = useProviderWorkspaces();
 *
 * // Check if provider available in Knowledge workspace
 * const available = isProviderAvailableInWorkspace('openrouter', 'knowledge');
 *
 * // Set provider workspaces
 * setProviderWorkspaces('openrouter', ['ide', 'knowledge']);
 * ```
 */
export const useProviderWorkspaces = () =>
  useProviderStore((state) => ({
    providerAvailability: state.providerAvailability,
    setProviderWorkspaces: state.setProviderWorkspaces,
    isProviderAvailableInWorkspace: state.isProviderAvailableInWorkspace,
    getAvailableProvidersForWorkspace: state.getAvailableProvidersForWorkspace,
  }));

/**
 * Provider events hook
 *
 * Use for event history and manual event emission.
 *
 * @example
 * ```tsx
 * const { eventHistory, emitChange, clearEventHistory } = useProviderEventsHook();
 *
 * // Emit custom event
 * emitChange({
 *   workspaceId: 'ide',
 *   providerId: 'openrouter',
 *   changeType: 'custom-event',
 * });
 *
 * // Clear history
 * clearEventHistory();
 * ```
 */
export const useProviderEventsHook = () =>
  useProviderStore((state) => ({
    isListening: state.isListening,
    eventHistory: state.eventHistory,
    emitChange: state.emitChange,
    clearEventHistory: state.clearEventHistory,
  }));

// ============================================================================
// Re-export React Hooks from Events Slice
// ============================================================================

/**
 * Auto-start event listening on mount
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useProviderEvents(); // Auto-start + cleanup
 * }
 * ```
 */
export { useProviderEvents };

/**
 * Get active provider for current workspace
 *
 * @example
 * ```tsx
 * const activeProvider = useCurrentWorkspaceProvider();
 * console.log('Active provider:', activeProvider);
 * ```
 */
export { useCurrentWorkspaceProvider };

/**
 * Workspace-aware provider selection hook
 *
 * @example
 * ```tsx
 * const { activeProvider, setActiveProvider, isProviderAvailableInWorkspace } =
 *   useProviderSelection();
 *
 * setActiveProvider('openrouter'); // Uses current workspace
 * ```
 */
export { useProviderSelectionHook as useProviderSelection };

// ============================================================================
// Utilities
// ============================================================================

/**
 * Wait for store hydration from IndexedDB
 *
 * Useful for preventing flash of empty state.
 *
 * @example
 * ```tsx
 * function ProviderConfigDialog() {
 *   const hasHydrated = useProviderStoreHydration();
 *
 *   if (!hasHydrated) {
 *     return <Loading />;
 *   }
 *
 *   return <DialogContent>...</DialogContent>;
 * }
 * ```
 */
export function useProviderStoreHydration() {
  return useProviderStore((state) => state._hasHydrated);
}

/**
 * Get registered providers list
 *
 * @example
 * ```tsx
 * const providers = useRegisteredProviders();
 * console.log('Available providers:', providers.length);
 * ```
 */
export function useRegisteredProviders() {
  return useProviderStore((state) => state.registeredProviders);
}

/**
 * Get provider UI state (dialog open/closed, selected tab)
 *
 * @example
 * ```tsx
 * const { uiState, setUIState } = useProviderUIState();
 *
 * setUIState({ isDialogOpen: true, selectedTab: 'credentials' });
 * ```
 */
export function useProviderUIState() {
  return useProviderStore((state) => ({
    uiState: state.uiState,
    setUIState: state.setUIState,
  }));
}

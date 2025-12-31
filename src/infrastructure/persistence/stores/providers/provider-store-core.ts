/**
 * @fileoverview Provider Store Core Slice
 * @module infrastructure/persistence/stores/providers/provider-store-core
 * @governance EPIC-7-1
 *
 * Core state and base actions for provider configuration.
 * Manages registered providers and transient UI state.
 *
 * December 2025 Patterns:
 * - Slice pattern for focused state management
 * - Transient UI state (not persisted)
 * - Type-safe state and actions separation
 */

import { StateCreator } from 'zustand';
import type { ProviderInfo } from '@/lib/agent/providers/model-registry';

// ============================================================================
// State
// ============================================================================

/**
 * Provider core slice state
 */
export interface ProviderCoreState {
  /** All registered providers from model registry */
  registeredProviders: ProviderInfo[];
  /** Transient UI state (not persisted) */
  uiState: {
    isDialogOpen: boolean;
    selectedTab: 'credentials' | 'selection' | 'workspaces';
  };
  /** Hydration flag */
  _hasHydrated: boolean;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Provider core slice actions
 */
export interface ProviderCoreActions {
  /** Update registered providers list */
  setRegisteredProviders: (providers: ProviderInfo[]) => void;
  /** Update transient UI state */
  setUIState: (ui: Partial<ProviderCoreState['uiState']>) => void;
  /** Mark store as hydrated */
  setHasHydrated: (hydrated: boolean) => void;
}

// ============================================================================
// Slice Type
// ============================================================================

/**
 * Combined core slice type
 */
export type ProviderCoreSlice = ProviderCoreState & ProviderCoreActions;

// ============================================================================
// Slice Creator
// ============================================================================

/**
 * Create provider core slice
 *
 * @param set - Zustand set function
 * @returns Core slice state and actions
 */
export const createProviderCoreSlice: StateCreator<
  ProviderCoreSlice,
  [],
  [],
  ProviderCoreSlice
> = (set) => ({
  registeredProviders: [],
  uiState: {
    isDialogOpen: false,
    selectedTab: 'credentials',
  },
  _hasHydrated: false,

  setRegisteredProviders: (providers) => {
    console.log('[ProviderStore] Setting registered providers:', providers.length);
    set({ registeredProviders: providers });
  },

  setUIState: (ui) => {
    set((state) => ({
      uiState: { ...state.uiState, ...ui },
    }));
  },

  setHasHydrated: (hydrated) => {
    console.log('[ProviderStore] Hydration complete:', hydrated);
    set({ _hasHydrated: hydrated });
  },
});

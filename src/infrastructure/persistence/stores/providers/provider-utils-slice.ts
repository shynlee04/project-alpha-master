/**
 * Provider Utils Slice - Utilities and Selectors
 *
 * Handles utility operations for provider configuration:
 * - Model settings management
 * - Selected model tracking
 * - Convenience selectors
 *
 * Key Design Decisions:
 * - Pure utilities with minimal state
 * - No external dependencies
 * - Single responsibility: helper functions
 *
 * @module providers/provider-utils-slice
 * @story AC-1.6 - Split provider slice into smaller slices
 */

import { StateCreator } from 'zustand';
import type { ModelInfo, ModelSettings } from './types';

// ============================================================================
// PROVIDER UTILS SLICE
// ============================================================================

/**
 * Provider Utils Slice State Creator
 *
 * This slice handles utility operations and convenience selectors.
 *
 * Note: No cross-slice communication needed (pure utilities).
 */
export const createProviderUtilsSlice: StateCreator<
  AppState,
  [],
  [],
  {
    // State
    modelSettings: Record<string, ModelSettings>;
    selectedModelId: string | null;
    isLoading: boolean;

    // Actions
    updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
    getAvailableModels: (providerId: string) => ModelInfo[];
    setSelectedModel: (modelId: string) => void;
  }
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  modelSettings: {},
  selectedModelId: null,
  isLoading: false,

  // ========================================================================
  // ACTIONS - Utilities and Selectors
  // ========================================================================

  /**
   * Update model settings for a provider
   *
   * @param providerId - Provider ID
   * @param settings - Partial model settings to update
   */
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => {
    console.log('[ProviderUtilsSlice] Updating model settings:', providerId, settings);
    set((state) => ({
      modelSettings: {
        ...state.modelSettings,
        [providerId]: { ...state.modelSettings[providerId], ...settings }
      }
    }));
  },

  /**
   * Get available models for a provider
   *
   * Convenience selector to get models for a specific provider.
   *
   * @param providerId - Provider ID
   * @returns Array of available models (empty array if none)
   */
  getAvailableModels: (providerId: string) => {
    return get().availableModels[providerId] || [];
  },

  /**
   * Set the selected model
   *
   * @param modelId - Model ID to set as selected
   */
  setSelectedModel: (modelId: string) => {
    console.log('[ProviderUtilsSlice] Setting selected model:', modelId);
    set({ selectedModelId: modelId });
  },
});

// ============================================================================
// TYPE IMPORTS (for AppState generic)
// ============================================================================

/**
 * AppState Interface (minimal for TypeScript compilation)
 */
interface AppState {
  // Models state (cross-slice access)
  availableModels: Record<string, ModelInfo[]>;

  // Utils state (defined in this slice)
  modelSettings: Record<string, ModelSettings>;
  selectedModelId: string | null;
  isLoading: boolean;
}

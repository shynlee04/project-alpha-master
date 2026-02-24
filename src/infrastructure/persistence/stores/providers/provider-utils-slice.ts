/**
 * PHASE 2 STUB: Provider Utils Slice
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/providers/provider-utils-slice.ts
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import type { StateCreator } from 'zustand';
import type { ModelInfo, ModelSettings } from '@/domain/types/llm';

interface AppState {
  modelSettings: Record<string, ModelSettings>;
  selectedModelId: string | null;
  isLoading: boolean;
  availableModels: Record<string, ModelInfo[]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProviderUtilsSlice: StateCreator<AppState, [], [], any> = (set, get) => ({
  modelSettings: {},
  selectedModelId: null,
  isLoading: false,

  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => {
    console.log('[ProviderUtilsSlice STUB] Phase 2 feature - updateModelSettings', providerId);
    set((state) => ({
      modelSettings: {
        ...state.modelSettings,
        [providerId]: { ...state.modelSettings[providerId], ...settings },
      },
    }));
  },

  getAvailableModels: (providerId: string): ModelInfo[] => {
    return get().availableModels[providerId] || [];
  },

  getSelectedModel: (_providerId: string): string | null => {
    return get().selectedModelId;
  },

  setSelectedModel: (modelId: string) => {
    console.log('[ProviderUtilsSlice STUB] Phase 2 feature - setSelectedModel', modelId);
    set({ selectedModelId: modelId });
  },
});

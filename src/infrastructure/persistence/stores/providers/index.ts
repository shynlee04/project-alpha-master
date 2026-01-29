/**
 * PHASE 2 STUB: Provider Store Barrel
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/providers/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import type { StateCreator } from 'zustand';

// Re-export types from canonical location
export type {
  ProviderType,
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderKeyMetadata,
  KeyValidationResult,
  StoredCredential,
  OpenAICompatibleConfig,
  ConnectionTestResult,
  AdapterConfig,
} from '@/domain/types/llm';

// Provider State interface (store-specific)
export interface ProviderState {
  providers: any[];
  activeProviderId: string | null;
  modelSettings: Record<string, any>;
  availableModels: Record<string, any[]>;
  isLoading: boolean;
  isLoadingModels: Record<string, boolean>;
  selectedModelId: string | null;
  modelCache: Record<string, any>;
  keyMetadata: Record<string, any>;
}

// Initial providers constant
export const INITIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google Gemini',
    type: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    hasApiKey: false,
    models: [],
    enabled: true,
  },
];

// Stub slice creators - these are no-ops
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProviderCrudSlice: StateCreator<any, [], [], any> = () => ({
  providers: INITIAL_PROVIDERS,
  activeProviderId: 'google',
  addProvider: () => {},
  updateProvider: () => {},
  removeProvider: async () => {},
  setActiveProvider: () => {},
  reset: () => {},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProviderModelsSlice: StateCreator<any, [], [], any> = () => ({
  availableModels: {},
  isLoadingModels: {},
  modelCache: {},
  fetchModels: async () => {},
  loadModelsForProvider: async () => {},
  clearModelsCache: () => {},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProviderUtilsSlice: StateCreator<any, [], [], any> = () => ({
  modelSettings: {},
  selectedModelId: null,
  isLoading: false,
  updateModelSettings: () => {},
  getAvailableModels: () => [],
  getSelectedModel: () => null,
  setSelectedModel: () => {},
});

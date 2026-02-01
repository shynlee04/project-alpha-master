/**
 * Provider Store Barrel
 * 
 * Exports provider-related slices for Zustand store composition.
 * Stub slices maintained for backward compatibility while vault slice
 * provides real credential vault operations.
 * 
 * @module infrastructure/persistence/stores/providers
 * @phase A-byok-foundation
 * @updated 2026-02-01
 */

import type { StateCreator } from 'zustand';

// Vault slice with real credential vault operations
export { createProviderVaultSlice } from './credentials/vault-slice.js';

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

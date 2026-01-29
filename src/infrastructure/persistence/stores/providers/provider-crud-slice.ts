/**
 * PHASE 2 STUB: Provider CRUD Slice
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/providers/provider-crud-slice.ts
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import type { StateCreator } from 'zustand';
import type { ProviderConfig } from '@/domain/types/llm';

// Initial providers constant
export const INITIAL_PROVIDERS: ProviderConfig[] = [
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
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    hasApiKey: false,
    models: [],
    enabled: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    hasApiKey: false,
    models: [],
    enabled: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    hasApiKey: false,
    models: [],
    enabled: true,
  },
];

interface AppState {
  agents?: unknown[];
  providers: ProviderConfig[];
  activeProviderId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProviderCrudSlice: StateCreator<AppState, [], [], any> = (set, get) => ({
  providers: INITIAL_PROVIDERS,
  activeProviderId: 'google',

  addProvider: (config: ProviderConfig) => {
    console.log('[ProviderCrudSlice STUB] Phase 2 feature - addProvider');
    set((state) => ({ providers: [...state.providers, config] }));
  },

  updateProvider: (id: string, config: Partial<ProviderConfig>) => {
    console.log('[ProviderCrudSlice STUB] Phase 2 feature - updateProvider', id);
    set((state) => ({
      providers: state.providers.map(p => p.id === id ? { ...p, ...config } : p),
    }));
  },

  removeProvider: async (id: string, _agents?: unknown[]) => {
    console.log('[ProviderCrudSlice STUB] Phase 2 feature - removeProvider', id);
    const agentsToCheck = _agents || get().agents || [];
    const dependentAgents = (agentsToCheck as Array<{ providerId: string }>).filter(a => a.providerId === id);
    
    if (dependentAgents.length > 0) {
      throw new Error(`Cannot delete provider - agents depend on it`);
    }
    
    set((state) => ({ providers: state.providers.filter(p => p.id !== id) }));
  },

  setActiveProvider: (id: string) => {
    console.log('[ProviderCrudSlice STUB] Phase 2 feature - setActiveProvider', id);
    set({ activeProviderId: id });
  },

  reset: () => {
    console.log('[ProviderCrudSlice STUB] Phase 2 feature - reset');
    set({ providers: INITIAL_PROVIDERS, activeProviderId: 'google' });
  },
});

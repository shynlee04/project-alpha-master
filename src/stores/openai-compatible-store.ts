/**
 * OpenAI Compatible Provider Store
 * 
 * Zustand store with persistence for user-configured custom OpenAI-compatible providers.
 * Allows users to save and manage multiple custom provider configurations.
 * 
 * @epic 25 - AI Foundation Sprint
 * @feature OpenAI Compatible Providers
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenAICompatibleConfig } from '@/lib/agent/providers';

/**
 * Store state interface
 */
interface OpenAICompatibleState {
    /** List of saved custom provider configurations */
    configs: OpenAICompatibleConfig[];
    /** Currently selected custom provider ID for form */
    selectedConfigId: string | null;
    /** Whether store has been hydrated from persistence */
    _hasHydrated: boolean;

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Add a new custom provider configuration */
    addConfig: (config: Omit<OpenAICompatibleConfig, 'id' | 'createdAt'>) => OpenAICompatibleConfig;

    /** Update an existing configuration */
    updateConfig: (id: string, updates: Partial<Omit<OpenAICompatibleConfig, 'id' | 'createdAt'>>) => void;

    /** Remove a configuration */
    removeConfig: (id: string) => void;

    /** Get configuration by ID */
    getConfig: (id: string) => OpenAICompatibleConfig | undefined;

    /** Select a configuration for editing */
    selectConfig: (id: string | null) => void;

    /** Update test result for a configuration */
    updateTestResult: (id: string, result: OpenAICompatibleConfig['lastTestResult']) => void;

    /** Clear all configurations */
    clearAll: () => void;
}

/**
 * Generate unique ID for custom provider config
 */
function generateConfigId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * OpenAI Compatible Provider store with localStorage persistence
 */
export const useOpenAICompatibleStore = create<OpenAICompatibleState>()(
    persist(
        (set, get) => ({
            configs: [],
            selectedConfigId: null,
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            addConfig: (configData) => {
                const newConfig: OpenAICompatibleConfig = {
                    ...configData,
                    id: generateConfigId(),
                    createdAt: new Date().toISOString(),
                };

                console.log('[OpenAICompatibleStore] Adding config:', newConfig.id, newConfig.name);
                set((state) => ({ configs: [...state.configs, newConfig] }));
                return newConfig;
            },

            updateConfig: (id, updates) => {
                console.log('[OpenAICompatibleStore] Updating config:', id, updates);
                set((state) => ({
                    configs: state.configs.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                }));
            },

            removeConfig: (id) => {
                console.log('[OpenAICompatibleStore] Removing config:', id);
                set((state) => ({
                    configs: state.configs.filter((c) => c.id !== id),
                    selectedConfigId: state.selectedConfigId === id ? null : state.selectedConfigId,
                }));
            },

            getConfig: (id) => {
                return get().configs.find((c) => c.id === id);
            },

            selectConfig: (id) => {
                set({ selectedConfigId: id });
            },

            updateTestResult: (id, result) => {
                console.log('[OpenAICompatibleStore] Updating test result:', id, result);
                set((state) => ({
                    configs: state.configs.map((c) =>
                        c.id === id ? { ...c, lastTestResult: result } : c
                    ),
                }));
            },

            clearAll: () => {
                console.log('[OpenAICompatibleStore] Clearing all configs');
                set({ configs: [], selectedConfigId: null });
            },
        }),
        {
            name: 'via-gent-openai-compatible',
            version: 1,
            onRehydrateStorage: () => (state) => {
                console.log('[OpenAICompatibleStore] Rehydrated:', state?.configs?.length, 'configs');
                state?.setHasHydrated(true);
            },
        }
    )
);

/**
 * Hook to wait for hydration
 */
export function useOpenAICompatibleStoreHydration() {
    return useOpenAICompatibleStore((state) => state._hasHydrated);
}

/**
 * Hook to get all saved configs
 */
export function useOpenAICompatibleConfigs() {
    return useOpenAICompatibleStore((state) => state.configs);
}

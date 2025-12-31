/**
 * Agents Store - Zustand with Dexie Persistence
 * 
 * Stores agent configurations persistently in IndexedDB via Dexie.
 * Agents survive page refresh and browser restarts.
 * 
 * @epic 2 - AI Chat That Just Works
 * @story 2.1 - Zustand + Dexie State Migration
 * @fix BF-01: Hot-reload visibility bug
 * @fix BF-02: Atomic state updates
 * 
 * Migration from localStorage to IndexedDB provides:
 * - Better scalability for complex state
 * - Async operations (non-blocking)
 * - Better inspectability in DevTools
 * - Consistent pattern with provider-store.ts
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';
import type { Agent } from '../mocks/agents';
import { DEFAULT_TOOLS, DEFAULT_WORKSPACE_BINDINGS } from '../mocks/agents';
import { useProviderStore } from '@/lib/state/provider-store';

/**
 * Default agent created on first load
 *
 * NEW SCHEMA (per Sprint Change Proposal v2.0):
 * - description (not role)
 * - providerId (not provider)
 * - modelId (not model)
 * - systemPrompt, temperature, maxTokens, topP (LLM parameters)
 * - tools, workspaceBindings (configuration)
 */
const DEFAULT_AGENT: Agent = {
    id: 'agt_default_001',
    name: 'Via-Gent Coder',
    description: 'Default AI coding assistant powered by Devstral via OpenRouter',

    // Provider + Model reference (foreign keys)
    providerId: 'openrouter',
    modelId: 'mistralai/devstral-2512:free',

    // LLM Parameters
    systemPrompt: 'You are an expert AI coding assistant specializing in React, TypeScript, and full-stack web development. You help write clean, maintainable code following best practices.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,

    // Tool bindings
    tools: DEFAULT_TOOLS,

    // Workspace bindings
    workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

    // Metadata
    status: 'online',
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
};

/**
 * Agents store state interface
 * 
 * @notes
 * - API keys are NOT stored here - use credentialVault
 * - _hasHydrated tracks IndexedDB restoration
 */
interface AgentsState {
    /** List of configured agents */
    agents: Agent[];

    /** Currently active agent ID for chat */
    activeAgentId: string | null;

    /** Whether the store has been hydrated from persistence */
    _hasHydrated: boolean;

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Add a new agent */
    addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;

    /** Remove an agent by ID */
    removeAgent: (id: string) => void;

    /** Update an existing agent */
    updateAgent: (id: string, updates: Partial<Agent>) => void;

    /** Update agent status */
    updateAgentStatus: (id: string, status: Agent['status']) => void;

    /** Get agent by ID */
    getAgent: (id: string) => Agent | undefined;

    /** Set active agent for chat */
    setActiveAgent: (id: string | null) => void;

    /** Reset to default agents */
    resetToDefaults: () => void;
}

/**
 * Agents store with IndexedDB (Dexie) persistence
 * 
 * Uses the same pattern as useProviderStore for consistency.
 * State changes sync to IndexedDB within ~100ms (NFR-PERF-08).
 * 
 * @example
 * ```tsx
 * const { agents, addAgent, removeAgent } = useAgentsStore();
 * ```
 */
export const useAgentsStore = create<AgentsState>()(
    persist(
        (set, get) => ({
            agents: [DEFAULT_AGENT],
            activeAgentId: DEFAULT_AGENT.id,
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            addAgent: (agentData) => {
                // ============================================================================
                // STORY AC-02: Agent Configuration Vault - P0 VALIDATION
                // Acceptance Criterion: "Validation: model must belong to provider"
                // ============================================================================
                const { providerId, modelId } = agentData;

                // Only validate if both providerId and modelId are provided (NEW schema)
                // Skip validation for OLD schema or partial data (defensive programming)
                if (providerId && modelId && typeof providerId === 'string' && typeof modelId === 'string') {
                    // Get available models from provider store
                    const availableModels = useProviderStore.getState().availableModels;
                    const providerModels = availableModels[providerId] || [];

                    // Validate: modelId must exist in provider's available models
                    const modelExists = providerModels.some(m => m.id === modelId);

                    if (!modelExists) {
                        throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
                    }
                }

                const newAgent: Agent = {
                    ...agentData,
                    id: `agt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    tasksCompleted: 0,
                    successRate: 0,
                    tokensUsed: 0,
                };

                console.log('[AgentsStore] Adding agent:', newAgent.id, newAgent.name);
                set((state) => ({ agents: [...state.agents, newAgent] }));
                return newAgent;
            },

            removeAgent: (id) => {
                console.log('[AgentsStore] Removing agent:', id);
                const currentActive = get().activeAgentId;

                set((state) => {
                    const filteredAgents = state.agents.filter((a) => a.id !== id);

                    // If removing active agent, switch to first remaining agent
                    const newActiveId = currentActive === id
                        ? (filteredAgents[0]?.id || null)
                        : currentActive;

                    return {
                        agents: filteredAgents,
                        activeAgentId: newActiveId
                    };
                });
            },

            updateAgent: (id, updates) => {
                // ============================================================================
                // STORY AC-02: Agent Configuration Vault - P0 VALIDATION
                // Acceptance Criterion: "Validation: model must belong to provider"
                // ============================================================================
                const { providerId, modelId } = updates;

                // Only validate if both providerId and modelId are being updated (NEW schema)
                // Skip validation for partial updates or OLD schema (defensive programming)
                if (providerId && modelId && typeof providerId === 'string' && typeof modelId === 'string') {
                    // Get available models from provider store
                    const availableModels = useProviderStore.getState().availableModels;
                    const providerModels = availableModels[providerId] || [];

                    // Validate: modelId must exist in provider's available models
                    const modelExists = providerModels.some(m => m.id === modelId);

                    if (!modelExists) {
                        throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
                    }
                }

                console.log('[AgentsStore] Updating agent:', id, updates);
                set((state) => ({
                    agents: state.agents.map((a) =>
                        a.id === id
                            ? { ...a, ...updates, lastActive: new Date().toISOString() }
                            : a
                    ),
                }));
            },

            updateAgentStatus: (id, status) => {
                console.log('[AgentsStore] Updating status:', id, status);
                set((state) => ({
                    agents: state.agents.map((a) =>
                        a.id === id
                            ? { ...a, status, lastActive: new Date().toISOString() }
                            : a
                    ),
                }));
            },

            getAgent: (id) => {
                return get().agents.find((a) => a.id === id);
            },

            setActiveAgent: (id) => {
                console.log('[AgentsStore] Setting active agent:', id);
                set({ activeAgentId: id });
            },

            resetToDefaults: () => {
                console.log('[AgentsStore] Resetting to defaults');
                set({
                    agents: [DEFAULT_AGENT],
                    activeAgentId: DEFAULT_AGENT.id
                });
            },
        }),
        {
            name: 'agent-configs',
            // Use Dexie storage adapter for IndexedDB persistence
            storage: createJSONStorage(() => createDexieStorage('agentConfigs')),

            // Only persist essential fields (not hydration state)
            partialize: (state) => ({
                agents: state.agents,
                activeAgentId: state.activeAgentId,
            }),

            // Hydration handler - restore defaults if empty
            onRehydrateStorage: () => (state) => {
                console.log('[AgentsStore] Rehydrated from IndexedDB:', state?.agents?.length, 'agents');

                if (state) {
                    // Ensure at least one agent exists
                    if (!state.agents || state.agents.length === 0) {
                        state.agents = [DEFAULT_AGENT];
                        state.activeAgentId = DEFAULT_AGENT.id;
                    }

                    // Ensure activeAgentId points to valid agent
                    if (state.activeAgentId && !state.agents.find(a => a.id === state.activeAgentId)) {
                        state.activeAgentId = state.agents[0]?.id || null;
                    }

                    state.setHasHydrated(true);
                }
            },
        }
    )
);

/**
 * Hook to wait for hydration from IndexedDB
 * 
 * @example
 * ```tsx
 * const hasHydrated = useAgentsStoreHydration();
 * if (!hasHydrated) return <Loading />;
 * ```
 */
export function useAgentsStoreHydration() {
    return useAgentsStore((state) => state._hasHydrated);
}

/**
 * Export default agent for reference
 */
export { DEFAULT_AGENT };

/**
 * Export type for external use
 */
export type { AgentsState };

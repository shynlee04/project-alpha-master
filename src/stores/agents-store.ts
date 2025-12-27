/**
 * Agents Store - Zustand with Persistence
 * 
 * Stores agent configurations persistently in localStorage.
 * Agents survive page refresh and browser restarts.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-R1 - E2E Integration Fix
 * @fix Gap 3: Agents not persisting (lost on refresh)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent } from '../mocks/agents';

/**
 * Default agent created on first load
 */
const DEFAULT_AGENT: Agent = {
    id: 'agt_default_001',
    name: 'Via-Gent Coder',
    role: 'AI Coding Assistant',
    status: 'online',
    provider: 'OpenRouter',
    model: 'mistralai/devstral-2512:free',
    description: 'Default AI coding assistant powered by Devstral via OpenRouter',
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
};

/**
 * Agents store state
 */
interface AgentsState {
    /** List of configured agents */
    agents: Agent[];
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

    /** Reset to default agents */
    resetToDefaults: () => void;
}

/**
 * Agents store with localStorage persistence
 * 
 * Usage:
 * ```tsx
 * const { agents, addAgent, removeAgent } = useAgentsStore();
 * ```
 */
export const useAgentsStore = create<AgentsState>()(
    persist(
        (set, get) => ({
            agents: [DEFAULT_AGENT],
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            addAgent: (agentData) => {
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
                set((state) => ({ agents: state.agents.filter((a) => a.id !== id) }));
            },

            updateAgent: (id, updates) => {
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

            resetToDefaults: () => {
                console.log('[AgentsStore] Resetting to defaults');
                set({ agents: [DEFAULT_AGENT] });
            },
        }),
        {
            name: 'via-gent-agents',
            version: 1,
            onRehydrateStorage: () => (state) => {
                console.log('[AgentsStore] Rehydrated from storage:', state?.agents?.length, 'agents');
                state?.setHasHydrated(true);
            },
        }
    )
);

/**
 * Hook to wait for hydration
 */
export function useAgentsStoreHydration() {
    return useAgentsStore((state) => state._hasHydrated);
}

/**
 * Export default agent for reference
 */
export { DEFAULT_AGENT };

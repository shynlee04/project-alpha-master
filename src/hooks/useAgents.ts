/**
 * useAgents Hook - Agent Management State (PERSISTENT)
 * 
 * @epic Epic-25 - AI Foundation Sprint
 * @story 25-R1 - E2E Integration Fix
 * @fix Agents now persist to localStorage via Zustand
 */

import { useCallback } from 'react';
import { useAgentsStore, useAgentsStoreHydration } from '../stores/agents-store';
import type { Agent } from '../mocks/agents';

interface UseAgentsReturn {
    /** List of configured agents */
    agents: Agent[];
    /** Whether the store is loading/hydrating */
    isLoading: boolean;
    /** Error state (null for now, reserved for future API integration) */
    error: Error | null;
    /** Add a new agent */
    addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => void;
    /** Remove an agent */
    removeAgent: (id: string) => void;
    /** Update agent status */
    updateAgentStatus: (id: string, status: Agent['status']) => void;
    /** Update agent data */
    updateAgent: (id: string, updates: Partial<Agent>) => void;
    /** Refresh agents (no-op for now, reserved for future API) */
    refreshAgents: () => void;
}

/**
 * Hook for managing agent state with persistence
 * 
 * Agents are stored in localStorage via Zustand persist middleware.
 * They survive page refresh and browser restarts.
 * 
 * @example
 * ```tsx
 * const { agents, addAgent, removeAgent } = useAgents();
 * 
 * // Add a new agent
 * addAgent({
 *     name: 'My Agent',
 *     role: 'Coder',
 *     status: 'online',
 *     provider: 'OpenRouter',
 *     model: 'mistralai/devstral-2512:free'
 * });
 * ```
 */
export function useAgents(): UseAgentsReturn {
    // Get persistent state from Zustand store
    const agents = useAgentsStore((state) => state.agents);
    const addAgentStore = useAgentsStore((state) => state.addAgent);
    const removeAgentStore = useAgentsStore((state) => state.removeAgent);
    const updateAgentStatusStore = useAgentsStore((state) => state.updateAgentStatus);
    const updateAgentStore = useAgentsStore((state) => state.updateAgent);

    // Check if store has hydrated from localStorage
    const hasHydrated = useAgentsStoreHydration();

    // Wrap store actions with callbacks for stable references
    const addAgent = useCallback(
        (agentData: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => {
            addAgentStore(agentData);
        },
        [addAgentStore]
    );

    const removeAgent = useCallback(
        (id: string) => {
            removeAgentStore(id);
        },
        [removeAgentStore]
    );

    const updateAgentStatus = useCallback(
        (id: string, status: Agent['status']) => {
            updateAgentStatusStore(id, status);
        },
        [updateAgentStatusStore]
    );

    const updateAgent = useCallback(
        (id: string, updates: Partial<Agent>) => {
            updateAgentStore(id, updates);
        },
        [updateAgentStore]
    );

    // No-op for now, reserved for future API integration
    const refreshAgents = useCallback(() => {
        console.log('[useAgents] refreshAgents called (no-op for localStorage)');
    }, []);

    return {
        agents,
        isLoading: !hasHydrated, // Loading until store hydrates
        error: null,
        addAgent,
        removeAgent,
        updateAgentStatus,
        updateAgent,
        refreshAgents,
    };
}


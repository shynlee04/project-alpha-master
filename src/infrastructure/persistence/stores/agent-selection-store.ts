/**
 * Agent Selection Store - Zustand with Persistence
 * 
 * Manages which agent is currently active for chat.
 * Persisted to localStorage so selection survives navigation/refresh.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-R1 - E2E Integration Fix
 * @fix Gap 3: Agent selection not persisting
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Agent selection state
 */
interface AgentSelectionState {
    /** Currently active agent ID */
    activeAgentId: string | null;
    /** Set the active agent */
    setActiveAgent: (id: string | null) => void;
    /** Clear selection */
    clearSelection: () => void;
}

/**
 * Agent selection store with localStorage persistence
 * 
 * Usage:
 * ```tsx
 * const { activeAgentId, setActiveAgent } = useAgentSelection();
 * ```
 */
export const useAgentSelection = create<AgentSelectionState>()(
    persist(
        (set) => ({
            activeAgentId: null,

            setActiveAgent: (id) => {
                console.log('[AgentSelection] Setting active agent:', id);
                set({ activeAgentId: id });
            },

            clearSelection: () => {
                console.log('[AgentSelection] Clearing selection');
                set({ activeAgentId: null });
            },
        }),
        {
            name: 'agent-selection',
            // Version for future migrations
            version: 1,
        }
    )
);

/**
 * Hook to get the active agent's full data
 * Combines selection store with agents list
 */
export function useActiveAgent(agents: Array<{ id: string;[key: string]: unknown }>) {
    const { activeAgentId } = useAgentSelection();
    return agents.find(agent => agent.id === activeAgentId) || null;
}

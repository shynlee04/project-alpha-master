/**
 * Agent Utils Slice - Selectors and Hydration
 *
 * This slice contains utility functions:
 * - Selectors (getAgent, getActiveAgent, getAgentsCount)
 * - Hydration state tracking (_hasHydrated, setHasHydrated)
 * - Agent status updates (updateAgentStatus)
 *
 * @module agents/slices/agent-utils-slice
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import { StateCreator } from 'zustand';
import type { Agent } from '@/core/entities/Agent';
import type { CombinedAgentsState } from '../types';

/**
 * Agent Utils Slice
 *
 * Utility operations:
 * - setHasHydrated: Set hydration status from IndexedDB
 * - getAgent: Get agent by ID
 * - updateAgentStatus: Update agent status
 * - getActiveAgent: Get active agent
 * - getAgentsCount: Get total agents count
 */
export const createAgentUtilsSlice: StateCreator<
  CombinedAgentsState,
  [],
  [],
  Omit<CombinedAgentsState, 'agents' | 'activeAgentId' | 'addAgent' | 'removeAgent' | 'updateAgent' | 'setActiveAgent' | 'resetToDefaults' | 'getAgentsForWorkspace' | 'updateWorkspaceBinding' | 'updateAgentWorkspaceBinding' | 'getAgentWorkspaceBinding' | 'isAgentAvailableInWorkspace' | 'validationErrors' | 'addAgentValidated' | 'updateAgentValidated' | 'clearValidationErrors' | 'addAgentWithEvent' | 'removeAgentWithEvent' | 'updateAgentWithEvent' | 'updateWorkspaceBindingWithEvent'>
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  _hasHydrated: false,

  // ========================================================================
  // HYDRATION OPERATIONS
  // ========================================================================

  /**
   * Set hydration status
   *
   * Called after IndexedDB restoration is complete.
   * This is excluded from persistence via partialize.
   *
   * @param state - Whether the store has been hydrated
   */
  setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state });
  },

  // ========================================================================
  // SELECTOR OPERATIONS
  // ========================================================================

  /**
   * Get agent by ID
   *
   * @param id - Agent ID to retrieve
   * @returns Agent or undefined if not found
   */
  getAgent: (id: string) => {
    return get().agents.find((a) => a.id === id);
  },

  /**
   * Update agent status
   *
   * Updates agent status (online/offline/error) and lastActive timestamp.
   *
   * @param id - Agent ID to update
   * @param status - New status
   */
  updateAgentStatus: (id: string, status: Agent['status']) => {
    console.log('[AgentUtilsSlice] Updating status:', id, status);
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, status, lastActive: new Date().toISOString() }
          : a
      ),
    }));
  },

  /**
   * Get active agent
   *
   * @returns Active agent or undefined if none set
   */
  getActiveAgent: () => {
    const { activeAgentId, agents } = get();
    if (!activeAgentId) return undefined;
    return agents.find((a) => a.id === activeAgentId);
  },

  /**
   * Get total agents count
   *
   * @returns Total number of agents
   */
  getAgentsCount: () => {
    return get().agents.length;
  },
});

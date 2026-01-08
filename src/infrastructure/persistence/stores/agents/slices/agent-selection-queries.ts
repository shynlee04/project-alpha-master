/**
 * @fileoverview Agent Selection Query Actions
 * @module infrastructure/persistence/stores/agents/slices/agent-selection-queries
 * @governance Architectural Specification v3.0
 *
 * Query actions for retrieving agents based on workspace context.
 */

import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { AgentData } from '../types';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { isAgentAvailableIn, isAgentDefaultFor } from '@/domain/services/agent-workspace-utils';
import type { AgentSelectionState } from './agent-selection-state';

/**
 * Create agent selection query actions slice
 * @param get - Zustand getState function
 * @param set - Zustand setState function
 */
export function createAgentSelectionQueries(
  get: () => AgentSelectionState,
  set: (partial: Partial<AgentSelectionState>) => void
) {
  return {
    /**
     * Get the currently active agent
     */
    getActiveAgent: (): AgentData | null => {
      const { activeAgentId } = get();
      if (!activeAgentId) return null;
      return useAppStore.getState().getAgent(activeAgentId) || null;
    },

    /**
     * Get the best agent for a specific workspace
     * Priority: workspace default > last selected > marked default > first available
     */
    getAgentForWorkspace: (workspaceType: WorkspaceType): AgentData | null => {
      const agents = useAppStore.getState().agents;
      const availableAgents = agents.filter((agent) => isAgentAvailableIn(agent, workspaceType));

      if (availableAgents.length === 0) return null;

      // Rule 1: Prefer workspace-specific default
      const defaultAgentId = get().defaultAgentIds[workspaceType];
      if (defaultAgentId) {
        const defaultAgent = availableAgents.find((a) => a.id === defaultAgentId);
        if (defaultAgent) return defaultAgent;
      }

      // Rule 2: Fall back to last selected
      const lastSelectedId = get().lastSelectedAgentIds[workspaceType];
      if (lastSelectedId) {
        const lastSelected = availableAgents.find((a) => a.id === lastSelectedId);
        if (lastSelected) return lastSelected;
      }

      // Rule 3 & 4: Use marked default or first available
      const markedDefault = availableAgents.find((agent) => isAgentDefaultFor(agent, workspaceType));
      return markedDefault || availableAgents[0] || null;
    },

    /**
     * Select the best agent for a workspace and set it as active
     */
    selectAgentForWorkspace: (workspaceType: WorkspaceType) => {
      const agent = get().getAgentForWorkspace(workspaceType);
      if (agent) {
        set({ activeAgentId: agent.id });
        get().emitAgentSelected(agent, workspaceType);
      }
    },

    /**
     * Check if the current agent needs reselection for the given workspace
     */
    needsReselection: (workspaceType: WorkspaceType): boolean => {
      const activeAgent = get().getActiveAgent();
      if (!activeAgent) return true;
      return !isAgentAvailableIn(activeAgent, workspaceType);
    },
  };
}

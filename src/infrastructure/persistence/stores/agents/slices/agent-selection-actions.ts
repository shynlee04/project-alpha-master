/**
 * @fileoverview Agent Selection Core Actions
 * @module infrastructure/persistence/stores/agents/slices/agent-selection-actions
 * @governance Architectural Specification v3.0
 *
 * Core actions for setting and managing agent selection.
 */

import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { Agent } from '@/core/entities/Agent';
import { useAppStore } from '../use-app-store';
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';
import type { AgentSelectionState } from './agent-selection-state';
import type { StoreApi } from 'zustand';

/**
 * Create agent selection actions slice
 * @param get - Zustand getState function
 * @param set - Zustand setState function
 */
export function createAgentSelectionActions(
  get: () => AgentSelectionState,
  set: (partial: Partial<AgentSelectionState> | ((state: AgentSelectionState) => Partial<AgentSelectionState>)) => void
) {
  return {
    /**
     * Set the active agent for the current workspace
     */
    setActiveAgent: (agentId: string | null, workspaceType: WorkspaceType) => {
      if (agentId === null) {
        set({ activeAgentId: null });
        get().emitAgentDeselected(workspaceType);
        return;
      }

      // Get agent from agents store
      const agent = useAppStore.getState().getAgent(agentId);
      if (!agent) {
        console.warn(`[AgentSelectionStore] Agent not found: ${agentId}`);
        throw new Error(`Agent not found: ${agentId}`);
      }

      // Validate agent is available in workspace
      if (!isAgentAvailableIn(agent, workspaceType)) {
        console.warn(`Agent "${agent.name}" might not be available in workspace: ${workspaceType}`);
      }

      // Update active agent
      set({ activeAgentId: agentId });

      // Update last selected for workspace
      set((state: AgentSelectionState) => ({
        lastSelectedAgentIds: {
          ...state.lastSelectedAgentIds,
          [workspaceType]: agentId,
        },
      }));

      // Emit event for hot-reload
      get().emitAgentSelected(agent, workspaceType);
    },

    /**
     * Set the default agent for a specific workspace
     */
    setDefaultAgent: (agentId: string, workspaceType: WorkspaceType) => {
      const agent = useAppStore.getState().getAgent(agentId);
      if (!agent) throw new Error(`Agent not found: ${agentId}`);

      set((state: AgentSelectionState) => ({
        defaultAgentIds: {
          ...state.defaultAgentIds,
          [workspaceType]: agentId,
        },
      }));

      get().emitDefaultAgentChanged(agent, workspaceType);
    },
  };
}

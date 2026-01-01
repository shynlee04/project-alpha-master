/**
 * Agent Workspace Bindings Slice - Workspace Filtering Logic
 *
 * This slice handles workspace-specific agent availability.
 * Agents can be enabled/disabled for specific workspace types (ide, chat, terminal).
 *
 * @module agents/slices/agent-workspace-bindings-slice
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import { StateCreator } from 'zustand';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBinding } from '@/core/entities/Agent';
import type { CombinedAgentsState } from '../types';

/**
 * Agent Workspace Bindings Slice
 *
 * Workspace filtering operations:
 * - getAgentsForWorkspace: Get agents available in specific workspace
 * - updateWorkspaceBinding: Update agent availability for workspace
 * - updateAgentWorkspaceBinding: Update workspace binding with partial data
 * - getAgentWorkspaceBinding: Get specific workspace binding for an agent
 * - isAgentAvailableInWorkspace: Check if agent is available in workspace
 */
export const createAgentWorkspaceBindingsSlice: StateCreator<
  CombinedAgentsState,
  [],
  [],
  Omit<CombinedAgentsState, 'agents' | 'activeAgentId' | 'addAgent' | 'removeAgent' | 'updateAgent' | 'setActiveAgent' | 'resetToDefaults' | 'validationErrors' | 'addAgentValidated' | 'updateAgentValidated' | 'clearValidationErrors' | 'addAgentWithEvent' | 'removeAgentWithEvent' | 'updateAgentWithEvent' | 'updateWorkspaceBindingWithEvent' | '_hasHydrated' | 'setHasHydrated' | 'getAgent' | 'updateAgentStatus' | 'getActiveAgent' | 'getAgentsCount'>
> = (set, get) => ({
  // ========================================================================
  // WORKSPACE BINDING OPERATIONS
  // ========================================================================

  /**
   * Get agents available in specific workspace
   *
   * @param workspaceType - Workspace type to filter by
   * @returns Array of agents available in the workspace
   */
  getAgentsForWorkspace: (workspaceType: WorkspaceType) => {
    const { agents } = get();
    return agents.filter(agent => {
      const binding = agent.workspaceBindings.find(b => b.workspaceType === workspaceType);
      return binding?.isAvailable === true;
    });
  },

  /**
   * Update workspace binding for an agent
   *
   * NOTE: This is a pure update operation.
   * For event emission, use updateWorkspaceBindingWithEvent from agent-events-slice.
   *
   * @param agentId - Agent ID to update
   * @param workspaceType - Workspace type to update
   * @param isAvailable - Whether agent is available in this workspace
   */
  updateWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => {
    console.log('[AgentWorkspaceBindingsSlice] Updating workspace binding:', agentId, workspaceType, isAvailable);
    set((state) => ({
      agents: state.agents.map(agent => {
        if (agent.id !== agentId) return agent;

        const updatedBindings = agent.workspaceBindings.map(binding =>
          binding.workspaceType === workspaceType
            ? { ...binding, isAvailable }
            : binding
        );

        return { ...agent, workspaceBindings: updatedBindings };
      }),
    }));
  },

  /**
   * Update workspace binding with partial data (enhanced method)
   *
   * Allows updating any field in WorkspaceBinding:
   * - isAvailable
   * - uiConfig
   * - isDefault
   *
   * NOTE: This is a pure update operation.
   * For event emission, use updateWorkspaceBindingWithEvent from agent-events-slice.
   *
   * @param agentId - Agent ID to update
   * @param workspaceType - Workspace type to update
   * @param binding - Partial binding data to update
   */
  updateAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBinding>) => {
    console.log('[AgentWorkspaceBindingsSlice] Updating agent workspace binding (partial):', agentId, workspaceType, binding);
    set((state) => ({
      agents: state.agents.map(agent => {
        if (agent.id !== agentId) return agent;

        const updatedBindings = agent.workspaceBindings.map(existingBinding =>
          existingBinding.workspaceType === workspaceType
            ? { ...existingBinding, ...binding }
            : existingBinding
        );

        return { ...agent, workspaceBindings: updatedBindings };
      }),
    }));
  },

  /**
   * Get specific workspace binding for an agent
   *
   * @param agentId - Agent ID to query
   * @param workspaceType - Workspace type to query
   * @returns Workspace binding or undefined if not found
   */
  getAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType) => {
    const agent = get().agents.find(a => a.id === agentId);
    if (!agent) return undefined;

    return agent.workspaceBindings.find(b => b.workspaceType === workspaceType);
  },

  /**
   * Check if agent is available in workspace
   *
   * @param agentId - Agent ID to check
   * @param workspaceType - Workspace type to check
   * @returns True if agent is available in workspace
   */
  isAgentAvailableInWorkspace: (agentId: string, workspaceType: WorkspaceType) => {
    const agent = get().agents.find(a => a.id === agentId);
    if (!agent) return false;

    const binding = agent.workspaceBindings.find(b => b.workspaceType === workspaceType);
    return binding?.isAvailable === true;
  },
});

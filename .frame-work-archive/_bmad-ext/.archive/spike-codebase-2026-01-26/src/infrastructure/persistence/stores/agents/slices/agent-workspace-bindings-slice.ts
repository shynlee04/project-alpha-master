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
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
import type { CombinedAgentsState, AgentData } from '../types';
import type { ModelInfo } from '@/infrastructure/persistence/stores/providers/types';

/**
 * Helper to update workspace binding in plain data
 */
function updateWorkspaceBindingValue(
  bindings: WorkspaceBindingProps[],
  workspaceType: WorkspaceType,
  updates: Partial<WorkspaceBindingProps>
): WorkspaceBindingProps[] {
  return bindings.map(binding =>
    binding.workspaceType === workspaceType
      ? { ...binding, ...updates }
      : binding
  );
}

/**
 * Helper to find workspace binding
 */
function findWorkspaceBinding(
  bindings: WorkspaceBindingProps[],
  workspaceType: WorkspaceType
): WorkspaceBindingProps | undefined {
  return bindings.find(b => b.workspaceType === workspaceType);
}

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
> = (set, get) => {
  // ========================================================================
  // STATE (required by CombinedAgentsState)
  // ========================================================================

  /** Available models by provider ID */
  const availableModels: Record<string, ModelInfo[]> = {};

  // ========================================================================
  // WORKSPACE BINDING OPERATIONS
  // ========================================================================

  /**
   * Get agents available in specific workspace
   *
   * @param workspaceType - Workspace type to filter by
   * @returns Array of agents available in the workspace
   */
  const getAgentsForWorkspace = (workspaceType: WorkspaceType): AgentData[] => {
    const { agents } = get();
    return agents.filter(agent => {
      const binding = findWorkspaceBinding(agent.workspaceBindings, workspaceType);
      return binding?.isAvailable === true;
    });
  };

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
  const updateWorkspaceBinding = (
    agentId: string,
    workspaceType: WorkspaceType,
    isAvailable: boolean
  ): void => {
    console.log('[AgentWorkspaceBindingsSlice] Updating workspace binding:', agentId, workspaceType, isAvailable);
    set((state) => ({
      agents: state.agents.map(agent => {
        if (agent.id !== agentId) return agent;

        const updatedBindings = updateWorkspaceBindingValue(
          agent.workspaceBindings,
          workspaceType,
          { isAvailable }
        );

        return { ...agent, workspaceBindings: updatedBindings, updatedAt: Date.now() };
      }),
    }));
  };

  /**
   * Update workspace binding with partial data (enhanced method)
   *
   * Allows updating any field in WorkspaceBinding:
   * - isAvailable
   * - uiVariant
   * - isDefault
   *
   * NOTE: This is a pure update operation.
   * For event emission, use updateWorkspaceBindingWithEvent from agent-events-slice.
   *
   * @param agentId - Agent ID to update
   * @param workspaceType - Workspace type to update
   * @param binding - Partial binding data to update
   */
  const updateAgentWorkspaceBinding = (
    agentId: string,
    workspaceType: WorkspaceType,
    binding: Partial<WorkspaceBindingProps>
  ): void => {
    console.log('[AgentWorkspaceBindingsSlice] Updating agent workspace binding (partial):', agentId, workspaceType, binding);
    set((state) => ({
      agents: state.agents.map(agent => {
        if (agent.id !== agentId) return agent;

        const updatedBindings = updateWorkspaceBindingValue(
          agent.workspaceBindings,
          workspaceType,
          binding
        );

        return { ...agent, workspaceBindings: updatedBindings, updatedAt: Date.now() };
      }),
    }));
  };

  /**
   * Get specific workspace binding for an agent
   *
   * @param agentId - Agent ID to query
   * @param workspaceType - Workspace type to query
   * @returns Workspace binding or undefined if not found
   */
  const getAgentWorkspaceBinding = (
    agentId: string,
    workspaceType: WorkspaceType
  ): WorkspaceBindingProps | undefined => {
    const agent = get().agents.find(a => a.id === agentId);
    if (!agent) return undefined;
    return findWorkspaceBinding(agent.workspaceBindings, workspaceType);
  };

  /**
   * Check if agent is available in workspace
   *
   * @param agentId - Agent ID to check
   * @param workspaceType - Workspace type to check
   * @returns True if agent is available in workspace
   */
  const isAgentAvailableInWorkspace = (
    agentId: string,
    workspaceType: WorkspaceType
  ): boolean => {
    const agent = get().agents.find(a => a.id === agentId);
    if (!agent) return false;
    const binding = findWorkspaceBinding(agent.workspaceBindings, workspaceType);
    return binding?.isAvailable === true;
  };

  return {
    availableModels,
    getAgentsForWorkspace,
    updateWorkspaceBinding,
    updateAgentWorkspaceBinding,
    getAgentWorkspaceBinding,
    isAgentAvailableInWorkspace,
  };
};

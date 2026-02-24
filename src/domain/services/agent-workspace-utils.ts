/**
 * Agent Workspace Utilities - Domain Business Logic
 *
 * Provides workspace-aware business logic for Agent entities.
 * These utilities encapsulate business rules about where agents are available
 * and which agents are defaults for specific workspaces.
 *
 * @module domain/services/agent-workspace-utils
 * @story AC-1.5 - Fix circular dependencies in agent-selection-store
 */

import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
import type { PluginType } from '@/domain/schemas/plugin.schema';

/**
 * @deprecated Use PluginType from @/domain/schemas/plugin.schema
 */
type WorkspaceType = PluginType;

// Type for agents that have workspaceBindings
export type AgentWithWorkspaceBindings = {
  workspaceBindings: WorkspaceBindingProps[];
};

/**
 * Check if agent is available in workspace
 *
 * Business Rule: Agent is available if it has a workspace binding
 * with isAvailable = true for the given workspace type.
 *
 * @param agent - Agent entity to check (plain data or class instance)
 * @param workspaceType - Workspace type to check availability for
 * @returns true if agent is available in workspace
 */
export function isAgentAvailableIn(
  agent: AgentWithWorkspaceBindings,
  workspaceType: WorkspaceType
): boolean {
  const binding = agent.workspaceBindings.find(
    (b) => b.pluginType === workspaceType
  );
  return binding?.isAvailable ?? false;
}

/**
 * Check if agent is default for workspace
 *
 * Business Rule: Agent is default if it has a workspace binding
 * with isDefault = true for the given workspace type.
 *
 * @param agent - Agent entity to check (plain data or class instance)
 * @param workspaceType - Workspace type to check default status for
 * @returns true if agent is marked as default for workspace
 */
export function isAgentDefaultFor(
  agent: AgentWithWorkspaceBindings,
  workspaceType: WorkspaceType
): boolean {
  const binding = agent.workspaceBindings.find(
    (b) => b.pluginType === workspaceType
  );
  return binding?.isDefault ?? false;
}

/**
 * Get agents available for workspace
 *
 * Filters agent list to only those available in the given workspace.
 *
 * @param agents - List of agents to filter
 * @param workspaceType - Workspace type to filter for
 * @returns Array of agents available in workspace
 */
export function getAgentsForWorkspace<T extends AgentWithWorkspaceBindings>(
  agents: T[],
  workspaceType: WorkspaceType
): T[] {
  return agents.filter((agent) => isAgentAvailableIn(agent, workspaceType));
}

/**
 * Get default agent for workspace
 *
 * Returns the agent marked as default for the given workspace,
 * or null if no default is set.
 *
 * @param agents - List of agents to search
 * @param workspaceType - Workspace type to get default for
 * @returns Default agent or null
 */
export function getDefaultAgentForWorkspace<T extends AgentWithWorkspaceBindings>(
  agents: T[],
  workspaceType: WorkspaceType
): T | null {
  return agents.find((agent) => isAgentDefaultFor(agent, workspaceType)) ?? null;
}

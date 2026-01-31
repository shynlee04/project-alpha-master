/**
 * @fileoverview Agent Orchestration Domain Service
 * @module domain/services/agent-orchestration-service
 * @governance Architectural Specification v3.0
 *
 * Stateless business logic for agent selection and validation.
 */

import { Agent } from '../entities/agent';
import { WorkspaceType } from '../value-objects/workspace-type';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Agent selection result
 */
export interface AgentSelectionResult {
  agent: Agent | null;
  reason?: string;
}

/**
 * Agent Orchestration Domain Service
 *
 * Provides business logic for agent-related operations:
 * - Agent selection for workspaces
 * - Agent configuration validation
 * - Default agent resolution
 *
 * This service is stateless and contains only business logic.
 * It does not depend on any framework or infrastructure.
 *
 * @example
 * ```ts
 * const service = new AgentOrchestrationService();
 *
 * // Select agent for workspace
 * const result = service.selectAgentForWorkspace(agents, 'ide');
 *
 * // Validate configuration
 * const validation = service.validateAgentConfiguration(agents, WorkspaceTypeUtils.all());
 * ```
 */
export class AgentOrchestrationService {
  /**
   * Select best available agent for workspace
   *
   * Business Rules:
   * 1. Prefer agents marked as default for workspace
   * 2. Fall back to first available agent
   * 3. Return null if no agents available
   *
   * @param agents - All available agents
   * @param workspaceType - Target workspace type
   * @returns Selected agent or null
   */
  selectAgentForWorkspace(
    agents: Agent[],
    workspaceType: WorkspaceType
  ): AgentSelectionResult {
    // Filter agents available in workspace
    const availableAgents = agents.filter(agent =>
      agent.isAvailableIn(workspaceType)
    );

    if (availableAgents.length === 0) {
      return {
        agent: null,
        reason: `No agents available for workspace: ${workspaceType}`
      };
    }

    // Prefer default agent for workspace
    const defaultAgent = availableAgents.find(agent =>
      agent.isDefaultFor(workspaceType)
    );

    if (defaultAgent) {
      return {
        agent: defaultAgent,
        reason: 'Default agent for workspace'
      };
    }

    // Fall back to first available agent
    return {
      agent: availableAgents[0],
      reason: 'First available agent'
    };
  }

  /**
   * Validate agent configuration for all workspaces
   *
   * Business Rules:
   * 1. At least one agent must be available in each workspace
   * 2. Each workspace must have a default agent
   * 3. No workspace should have all agents with the same default flag
   *
   * @param agents - All agents to validate
   * @param workspaceTypes - Workspace types to validate against
   * @returns Validation result with errors if any
   */
  validateAgentConfiguration(
    agents: Agent[],
    workspaceTypes: WorkspaceType[]
  ): ValidationResult {
    const errors: string[] = [];

    for (const workspaceType of workspaceTypes) {
      // Rule 1: At least one agent available
      const availableAgents = agents.filter(a => a.isAvailableIn(workspaceType));

      if (availableAgents.length === 0) {
        errors.push(`No agents available for workspace: ${workspaceType}`);
        continue; // Skip other checks for this workspace
      }

      // Rule 2: At least one default agent
      const defaultAgents = availableAgents.filter(a =>
        a.isDefaultFor(workspaceType)
      );

      if (defaultAgents.length === 0) {
        errors.push(`No default agent for workspace: ${workspaceType}`);
      }

      if (defaultAgents.length > 1) {
        errors.push(
          `Multiple agents marked as default for workspace: ${workspaceType} ` +
          `(${defaultAgents.map(a => a.name).join(', ')})`
        );
      }
    }

    // Rule 3: Each agent must have at least one enabled tool
    for (const agent of agents) {
      const hasEnabledTools = agent.tools.some(t => t.isEnabled);

      if (!hasEnabledTools) {
        errors.push(`Agent "${agent.name}" has no enabled tools`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get agents available for workspace
   *
   * @param agents - All agents
   * @param workspaceType - Target workspace type
   * @returns Filtered list of available agents
   */
  getAvailableAgentsFor(
    agents: Agent[],
    workspaceType: WorkspaceType
  ): Agent[] {
    return agents.filter(agent => agent.isAvailableIn(workspaceType));
  }

  /**
   * Check if agent needs re-selection when switching workspaces
   *
   * @param currentAgent - Currently selected agent
   * @param targetWorkspace - Target workspace type
   * @returns True if agent needs re-selection
   */
  needsReselection(currentAgent: Agent | null, targetWorkspace: WorkspaceType): boolean {
    if (!currentAgent) {
      return true;
    }

    return !currentAgent.isAvailableIn(targetWorkspace);
  }

  /**
   * Resolve agent conflict when multiple agents marked as default
   *
   * Business Rule: Select agent with earliest creation date
   *
   * @param agents - Agents with default flag
   * @returns Single default agent
   */
  resolveDefaultConflict(agents: Agent[]): Agent {
    // Sort by creation date and return oldest
    return agents.sort((a, b) => a.createdAt - b.createdAt)[0];
  }

  /**
   * Get recommended agents for workspace based on tools
   *
   * @param agents - All agents
   * @param workspaceType - Target workspace type
   * @param requiredToolIds - Required tool IDs
   * @returns Agents with all required tools enabled
   */
  getAgentsWithTools(
    agents: Agent[],
    workspaceType: WorkspaceType,
    requiredToolIds: string[]
  ): Agent[] {
    return agents.filter(agent => {
      if (!agent.isAvailableIn(workspaceType)) {
        return false;
      }

      const enabledTools = agent.getEnabledToolsFor(workspaceType);
      const enabledToolIds = new Set(enabledTools.map(t => t.toolId));

      return requiredToolIds.every(toolId => enabledToolIds.has(toolId));
    });
  }
}

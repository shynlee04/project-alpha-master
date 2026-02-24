/**
 * @fileoverview Agent Orchestration Domain Service
 * @module domain/services/agent-orchestration-service
 * @governance Architectural Specification v3.0
 *
 * Stateless business logic for agent selection and validation.
 *
 * ANNOTATION: 2026-01-11 - Initial copy from exploration - _test-spike/_notes/codebase-exploration-2026-01-11.md
 * Original: src/domain/services/agent-orchestration-service.ts
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
 */
export class AgentOrchestrationService {
  /**
   * Select best available agent for workspace
   *
   * Business Rules:
   * 1. Prefer agents marked as default for workspace
   * 2. Fall back to first available agent
   * 3. Return null if no agents available
   */
  selectAgentForWorkspace(
    agents: Agent[],
    workspaceType: WorkspaceType
  ): AgentSelectionResult {
    const availableAgents = agents.filter((agent) =>
      agent.isAvailableIn(workspaceType)
    );

    if (availableAgents.length === 0) {
      return {
        agent: null,
        reason: `No agents available for workspace: ${workspaceType}`,
      };
    }

    // Prefer default agent for workspace
    const defaultAgent = availableAgents.find((agent) =>
      agent.isDefaultFor(workspaceType)
    );

    if (defaultAgent) {
      return {
        agent: defaultAgent,
        reason: 'Selected as default agent for workspace',
      };
    }

    return {
      agent: availableAgents[0],
      reason: 'First available agent selected',
    };
  }

  /**
   * Validate agent configuration
   */
  validateAgentConfiguration(
    agent: Agent,
    availableWorkspaceTypes: WorkspaceType[]
  ): ValidationResult {
    const errors: string[] = [];

    // Check if agent has at least one workspace binding
    if (agent.workspaceBindings.length === 0) {
      errors.push('Agent must have at least one workspace binding');
    }

    // Check if agent has at least one enabled tool
    const hasEnabledTools = agent.tools.some((t) => t.isEnabled);
    if (!hasEnabledTools) {
      errors.push('Agent must have at least one enabled tool');
    }

    // Check workspace bindings are valid
    for (const binding of agent.workspaceBindings) {
      if (!availableWorkspaceTypes.includes(binding.workspaceType)) {
        errors.push(
          `Invalid workspace type: ${binding.workspaceType}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if agent needs reselection
   */
  needsReselection(
    currentAgent: Agent,
    agents: Agent[],
    workspaceType: WorkspaceType
  ): boolean {
    // Check if current agent is still available
    if (!currentAgent.isAvailableIn(workspaceType)) {
      return true;
    }

    // Check if there's a default agent that's different
    const defaultAgent = agents.find((a) =>
      a.isDefaultFor(workspaceType)
    );

    if (defaultAgent && defaultAgent.id !== currentAgent.id) {
      return true;
    }

    return false;
  }

  /**
   * Get agents with their tools for a workspace
   */
  getAgentsWithTools(agents: Agent[], workspaceType: WorkspaceType) {
    return agents
      .filter((agent) => agent.isAvailableIn(workspaceType))
      .map((agent) => ({
        agent,
        tools: agent.getEnabledToolsFor(workspaceType),
      }));
  }
}

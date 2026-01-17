/**
 * @fileoverview Workspace Transition Domain Service
 * @module domain/services/workspace-transition-service
 * @governance Architectural Specification v3.0
 *
 * Business logic for workspace transitions.
 */

import { Agent } from '../entities/agent';
import { WorkspaceType } from '../value-objects/workspace-type';
import { AgentOrchestrationService } from './agent-orchestration-service';

/**
 * Workspace transition state
 */
export enum TransitionState {
  IDLE = 'idle',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Workspace transition result
 */
export interface TransitionResult {
  success: boolean;
  from: WorkspaceType;
  to: WorkspaceType;
  agentId?: string;
  error?: string;
}

/**
 * Workspace transition context
 */
export interface TransitionContext {
  from: WorkspaceType;
  to: WorkspaceType;
  currentAgentId: string | null;
  availableAgents: Agent[];
  timestamp: number;
}

/**
 * Workspace Transition Domain Service
 *
 * Business logic for workspace transitions:
 * - Validates transition requests
 * - Determines if agent re-selection is needed
 * - Selects appropriate agent for new workspace
 *
 * @example
 * ```ts
 * const service = new WorkspaceTransitionService(
 *   new AgentOrchestrationService()
 * );
 *
 * const context: TransitionContext = {
 *   from: 'ide',
 *   to: 'knowledge',
 *   currentAgentId: 'agent-1',
 *   availableAgents: agents,
 *   timestamp: Date.now()
 * };
 *
 * const plan = service.planTransition(context);
 * const result = service.executeTransition(context);
 * ```
 */
export class WorkspaceTransitionService {
  constructor(
    private agentService: AgentOrchestrationService
  ) {}

  /**
   * Validate transition request
   *
   * Business Rules:
   * 1. Cannot transition to same workspace
   * 2. Target workspace must have at least one available agent
   *
   * @param context - Transition context
   * @returns Validation result
   */
  validateTransition(context: TransitionContext): ValidationResult {
    const errors: string[] = [];

    // Rule 1: Cannot transition to same workspace
    if (context.from === context.to) {
      errors.push(`Cannot transition from ${context.from} to itself`);
    }

    // Rule 2: Target workspace must have available agents
    const availableAgents = this.agentService.getAvailableAgentsFor(
      context.availableAgents,
      context.to
    );

    if (availableAgents.length === 0) {
      errors.push(`No agents available for target workspace: ${context.to}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Plan workspace transition
   *
   * Determines if agent re-selection is needed and which agent to select.
   *
   * @param context - Transition context
   * @returns Transition plan
   */
  planTransition(context: TransitionContext): TransitionPlan {
    const validation = this.validateTransition(context);

    if (!validation.isValid) {
      return {
        canTransition: false,
        needsReselection: false,
        selectedAgentId: null,
        errors: validation.errors
      };
    }

    // Check if current agent needs re-selection
    const currentAgent = context.availableAgents.find(
      a => a.id === context.currentAgentId
    );

    const needsReselection = this.agentService.needsReselection(
      currentAgent || null,
      context.to
    );

    let selectedAgentId: string | null = null;

    if (needsReselection) {
      const selectionResult = this.agentService.selectAgentForWorkspace(
        context.availableAgents,
        context.to
      );

      selectedAgentId = selectionResult.agent?.id || null;

      if (!selectedAgentId) {
        return {
          canTransition: false,
          needsReselection: true,
          selectedAgentId: null,
          errors: ['No suitable agent found for target workspace']
        };
      }
    } else {
      selectedAgentId = context.currentAgentId;
    }

    return {
      canTransition: true,
      needsReselection,
      selectedAgentId,
      errors: []
    };
  }

  /**
   * Execute workspace transition
   *
   * @param context - Transition context
   * @returns Transition result
   */
  executeTransition(context: TransitionContext): TransitionResult {
    const plan = this.planTransition(context);

    if (!plan.canTransition) {
      return {
        success: false,
        from: context.from,
        to: context.to,
        error: plan.errors.join('; ')
      };
    }

    return {
      success: true,
      from: context.from,
      to: context.to,
      agentId: plan.selectedAgentId || undefined
    };
  }

  /**
   * Check if transition is safe (no data loss risk)
   *
   * @param context - Transition context
   * @returns True if transition is safe
   */
  isTransitionSafe(_context: TransitionContext): boolean {
    // Transition is safe if:
    // 1. No active operations in progress
    // 2. Current work is saved
    // 3. Target workspace is available

    // For now, always return true
    // TODO: Implement actual safety checks
    return true;
  }
}

/**
 * Transition plan
 */
export interface TransitionPlan {
  canTransition: boolean;
  needsReselection: boolean;
  selectedAgentId: string | null;
  errors: string[];
}

/**
 * Validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

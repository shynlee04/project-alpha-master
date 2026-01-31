/**
 * @fileoverview Switch Workspace Use Case
 * @module domain/use-cases/switch-workspace-use-case
 * @governance Architectural Specification v3.0
 *
 * Transaction script that orchestrates workspace transition.
 */

import { Agent } from '../entities/agent';
import { WorkspaceType } from '../value-objects/workspace-type';
import { WorkspaceTransitionService, TransitionResult } from '../services/workspace-transition-service';

/**
 * Switch workspace request
 */
export interface SwitchWorkspaceRequest {
  targetWorkspace: WorkspaceType;
  correlationId?: string;
}

/**
 * Switch workspace response
 */
export interface SwitchWorkspaceResponse {
  success: boolean;
  from: WorkspaceType;
  to: WorkspaceType;
  agentId: string;
  error?: string;
}

/**
 * Switch Workspace Use Case
 *
 * Transaction script that orchestrates workspace transition:
 * 1. Validates transition request
 * 2. Selects appropriate agent for new workspace
 * 3. Emits domain events
 * 4. Returns transition result
 *
 * This use case is part of the application layer and coordinates
 * between domain services and infrastructure.
 *
 * @example
 * ```ts
 * const useCase = new SwitchWorkspaceUseCase(
 *   agentRepository,
 *   workspaceTransitionService
 * );
 *
 * const result = await useCase.execute({
 *   targetWorkspace: 'knowledge',
 *   correlationId: 'transition-123'
 * });
 * ```
 */
export class SwitchWorkspaceUseCase {
  constructor(
    private getAgents: () => Promise<Agent[]>,
    private getCurrentWorkspace: () => Promise<WorkspaceType>,
    private getCurrentAgentId: () => Promise<string | null>,
    private onTransitionStart: (from: WorkspaceType, to: WorkspaceType) => void,
    private onTransitionComplete: (result: TransitionResult) => void,
    private onTransitionFailed: (error: string) => void,
    private workspaceTransitionService: WorkspaceTransitionService
  ) {}

  /**
   * Execute workspace switch
   *
   * @param request - Switch workspace request
   * @returns Switch workspace response
   */
  async execute(request: SwitchWorkspaceRequest): Promise<SwitchWorkspaceResponse> {
    try {
      // Step 1: Get current state
      const currentWorkspace = await this.getCurrentWorkspace();
      const currentAgentId = await this.getCurrentAgentId();
      const agents = await this.getAgents();

      // Step 2: Emit transition start event
      this.onTransitionStart(currentWorkspace, request.targetWorkspace);

      // Step 3: Plan transition
      const transitionContext = {
        from: currentWorkspace,
        to: request.targetWorkspace,
        currentAgentId,
        availableAgents: agents,
        timestamp: Date.now()
      };

      // Step 4: Execute transition
      const result = this.workspaceTransitionService.executeTransition(transitionContext);

      if (!result.success) {
        this.onTransitionFailed(result.error || 'Unknown error');
        return {
          success: false,
          from: currentWorkspace,
          to: request.targetWorkspace,
          agentId: '',
          error: result.error
        };
      }

      // Step 5: Emit transition complete event
      this.onTransitionComplete(result);

      return {
        success: true,
        from: result.from,
        to: result.to,
        agentId: result.agentId || ''
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.onTransitionFailed(errorMessage);

      return {
        success: false,
        from: await this.getCurrentWorkspace(),
        to: request.targetWorkspace,
        agentId: '',
        error: errorMessage
      };
    }
  }
}

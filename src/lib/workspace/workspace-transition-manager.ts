// @ts-nocheck
/**
 * @fileoverview Workspace Transition Manager
 * @module lib/workspace/workspace-transition-manager
 *
 * Orchestrates state updates during workspace transitions.
 * Coordinates updates across all stores to ensure consistency.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - State Management Orchestration
 *
 * December 2025 Patterns:
 * - Single responsibility (coordinates transitions only)
 * - Event-driven coordination (emits and listens to events)
 * - Graceful degradation (handles missing state)
 */

import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';
import type { WorkspaceType, WorkspaceTransitionEvent } from '@/infrastructure/persistence/stores/workspace/workspace-types';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { crossWorkspaceEventBus } from '../events/cross-workspace-event-bus';
import { WorkspacePermissionManager } from '../agent/workspace-permission-manager';
import { ToolPermissionManager } from '../agent/tool-permission-manager';

/**
 * Workspace transition manager
 *
 * Responsibilities:
 * - Coordinate state updates during workspace switch
 * - Filter agents by workspace availability
 * - Re-select agent if current one unavailable
 * - Emit coordinated events
 * - Manage transition state
 */
export class WorkspaceTransitionManager {
  private static instance: WorkspaceTransitionManager | null = null;

  private permissionManager: WorkspacePermissionManager;
  private isTransitioning: boolean = false;

  private constructor() {
    // Initialize permission managers
    const basePermissionManager = ToolPermissionManager.getInstance();
    this.permissionManager = new WorkspacePermissionManager(basePermissionManager);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WorkspaceTransitionManager {
    if (!WorkspaceTransitionManager.instance) {
      WorkspaceTransitionManager.instance = new WorkspaceTransitionManager();
    }
    return WorkspaceTransitionManager.instance;
  }

  /**
   * Transition to new workspace
   *
   * Coordinates:
   * 1. Save current state
   * 2. Update workspace store
   * 3. Filter agents for new workspace
   * 4. Check if current agent still available
   * 5. Re-select agent if needed
   * 6. Emit coordinated events
   * 7. End transition
   *
   * @param workspace - Target workspace type
   */
  public async transitionTo(workspace: WorkspaceType): Promise<void> {
    // Prevent concurrent transitions
    if (this.isTransitioning) {
      console.warn('[WorkspaceTransitionManager] Transition already in progress');
      return;
    }

    try {
      this.isTransitioning = true;

      // Step 1: Get current state
      const currentState = this.getCurrentState();
      console.log('[WorkspaceTransitionManager] Transitioning from', currentState.workspace, 'to', workspace);

      // Step 2: Start transition (only if we have a current workspace)
      const workspaceStore = useWorkspaceStore.getState();
      if (currentState.workspace) {
        workspaceStore.startTransition(currentState.workspace);
      }

      // Step 3: Update workspace store (this will emit workspace:changed event)
      workspaceStore.setCurrentWorkspace(workspace);

      // Step 4: Filter agents for new workspace
      const agentsStore = useAgentsStore.getState();
      const availableAgents = this.filterAgentsByWorkspace(agentsStore.agents, workspace);
      console.log('[WorkspaceTransitionManager] Available agents in', workspace, ':', availableAgents.length);

      // Step 5: Check if current agent is available
      const currentAgent = agentsStore.getAgent(currentState.activeAgentId || '');
      const agentNeedsReselection = !currentAgent || !this.isAgentAvailable(currentAgent, workspace);

      // Step 6: Re-select agent if needed
      if (agentNeedsReselection) {
        const newAgent = this.findAvailableAgent(availableAgents, workspace);

        if (newAgent) {
          console.log('[WorkspaceTransitionManager] Re-selecting agent:', newAgent.name);
          const agentSelectionStore = useAgentSelection.getState();
          agentSelectionStore.setActiveAgent(newAgent.id, workspace);
        } else {
          console.warn('[WorkspaceTransitionManager] No agents available in', workspace);
        }
      } else {
        console.log('[WorkspaceTransitionManager] Current agent still available:', currentAgent?.name);
      }

      // Step 7: Emit transition complete event (only if we had a previous workspace)
      if (currentState.workspace) {
        this.emitTransitionCompleteEvent(currentState.workspace, workspace);
      }

      // Step 8: End transition
      workspaceStore.endTransition();

      console.log('[WorkspaceTransitionManager] Transition complete');

    } catch (error) {
      console.error('[WorkspaceTransitionManager] Transition failed:', error);

      // Ensure transition state is cleared
      const workspaceStore = useWorkspaceStore.getState();
      workspaceStore.endTransition();

      throw error;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Filter agents by workspace availability
   */
  private filterAgentsByWorkspace(agents: AgentData[], workspace: WorkspaceType): AgentData[] {
    return agents.filter(agent =>
      this.permissionManager.isAgentAvailableInWorkspace(agent.workspaceBindings, workspace)
    );
  }

  /**
   * Check if agent is available in workspace
   */
  private isAgentAvailable(agent: AgentData, workspace: WorkspaceType): boolean {
    return this.permissionManager.isAgentAvailableInWorkspace(agent.workspaceBindings, workspace);
  }

  /**
   * Find best available agent for workspace
   *
   * Priority:
   * 1. Agent marked as default for workspace
   * 2. First available agent
   */
  private findAvailableAgent(agents: AgentData[], workspace: WorkspaceType): AgentData | null {
    // Try to find default agent for workspace
    const defaultAgent = agents.find(agent =>
      agent.workspaceBindings.find(binding =>
        binding.workspaceType === workspace && binding.isDefault
      )?.isDefault
    );

    if (defaultAgent) {
      return defaultAgent;
    }

    // Fall back to first available agent
    return agents[0] || null;
  }

  /**
   * Get current state snapshot
   */
  private getCurrentState(): {
    workspace: WorkspaceType | null;
    projectId: string | null;
    activeAgentId: string | null;
  } {
    const workspaceStore = useWorkspaceStore.getState();
    const agentSelectionStore = useAgentSelection.getState();

    return {
      workspace: workspaceStore.currentWorkspace,
      projectId: workspaceStore.currentProjectId,
      activeAgentId: agentSelectionStore.activeAgentId,
    };
  }

  /**
   * Emit transition complete event
   */
  private emitTransitionCompleteEvent(from: WorkspaceType, to: WorkspaceType): void {
    const event: WorkspaceTransitionEvent = {
      from,
      to,
      timestamp: new Date().toISOString(),
      projectId: useWorkspaceStore.getState().currentProjectId,
    };

    // Emit via cross-workspace event bus
    crossWorkspaceEventBus.emit('workspace:transition:complete', event);
  }

  /**
   * Get available agents for workspace
   */
  public getAvailableAgents(workspace: WorkspaceType): AgentData[] {
    const agentsStore = useAgentsStore.getState();
    return this.filterAgentsByWorkspace(agentsStore.agents, workspace);
  }

  /**
   * Get available tools for agent in workspace
   */
  public getAvailableTools(agent: AgentData, workspace: WorkspaceType) {
    return this.permissionManager.getToolsForWorkspace(
      agent.tools,
      agent.workspaceBindings,
      workspace
    );
  }
}

/**
 * Singleton instance for easy access
 */
export const workspaceTransitionManager = WorkspaceTransitionManager.getInstance();

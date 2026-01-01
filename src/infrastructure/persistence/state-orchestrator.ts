/**
 * @fileoverview State Orchestrator
 * @module infrastructure/persistence/state-orchestrator
 * @governance Architectural Specification v3.0
 *
 * Coordinates state updates across multiple stores using event bus.
 * Ensures consistency and prevents race conditions.
 */

import { eventBus, DomainEventType } from '../events/event-bus';
import type { DomainEvent } from '../events/event-bus';
import { WorkspaceType } from '../../domain/value-objects/workspace-type';

/**
 * Store references (lazy loaded to avoid circular dependencies)
 * Note: Getters return Zustand store instances directly, not getState() results
 */
interface StoreReferences {
  workspaceStore?: {
    currentWorkspace: WorkspaceType;
    startTransition: (from: WorkspaceType) => void;
    setCurrentWorkspace: (workspace: WorkspaceType) => void;
    endTransition: () => void;
  };
  agentsStore?: {
    agents: any[];
    getAgent: (id: string) => any;
  };
  agentSelectionStore?: {
    activeAgentId: string | null;
    setActiveAgent: (agentId: string | null, workspaceType: WorkspaceType) => void;
  };
}

/**
 * State Orchestrator
 *
 * Coordinates state updates across multiple stores:
 * - Handles workspace transitions
 * - Manages agent re-selection
 * - Emits domain events
 * - Prevents race conditions
 *
 * This is a singleton that initializes on first use.
 *
 * @example
 * ```ts
 * import { stateOrchestrator } from '@/infrastructure/persistence/state-orchestrator';
 *
 * // State orchestrator automatically handles events
 * stateOrchestrator.initialize();
 * ```
 */
export class StateOrchestrator {
  private isInitialized = false;
  private isTransitioning = false;
  private stores: StoreReferences = {};

  /**
   * Initialize state orchestrator
   *
   * Registers event handlers for domain events.
   * Must be called before orchestrator can function.
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('[StateOrchestrator] Already initialized');
      return;
    }

    // Register event handlers
    this.registerWorkspaceEventHandlers();
    this.registerAgentEventHandlers();
    this.registerProviderEventHandlers();

    this.isInitialized = true;
    console.log('[StateOrchestrator] Initialized');
  }

  /**
   * Register store references
   *
   * Lazy load stores to avoid circular dependencies.
   *
   * @param storeName - Name of store
   * @param store - Store reference
   */
  registerStore(storeName: keyof StoreReferences, store: any): void {
    // Extract the state interface from the store's getState method
    const state = store.getState();
    this.stores[storeName] = state;
  }

  /**
   * Register workspace event handlers
   */
  private registerWorkspaceEventHandlers(): void {
    // Workspace transition started
    eventBus.on(
      DomainEventType.WORKSPACE_TRANSITION_STARTED,
      this.handleWorkspaceTransitionStarted.bind(this)
    );

    // Workspace transition completed
    eventBus.on(
      DomainEventType.WORKSPACE_TRANSITION_COMPLETED,
      this.handleWorkspaceTransitionCompleted.bind(this)
    );

    // Workspace transition failed
    eventBus.on(
      DomainEventType.WORKSPACE_TRANSITION_FAILED,
      this.handleWorkspaceTransitionFailed.bind(this)
    );
  }

  /**
   * Register agent event handlers
   */
  private registerAgentEventHandlers(): void {
    // Agent config updated
    eventBus.on(
      DomainEventType.AGENT_CONFIG_UPDATED,
      this.handleAgentConfigUpdated.bind(this)
    );

    // Agent deleted
    eventBus.on(
      DomainEventType.AGENT_DELETED,
      this.handleAgentDeleted.bind(this)
    );
  }

  /**
   * Register provider event handlers
   */
  private registerProviderEventHandlers(): void {
    // Provider key set
    eventBus.on(
      DomainEventType.PROVIDER_KEY_SET,
      this.handleProviderKeySet.bind(this)
    );
  }

  /**
   * Handle workspace transition started event
   *
   * @param event - Domain event
   */
  private async handleWorkspaceTransitionStarted(
    event: DomainEvent<{ from: WorkspaceType; to: WorkspaceType }>
  ): Promise<void> {
    if (this.isTransitioning) {
      console.warn('[StateOrchestrator] Transition already in progress, ignoring new request');
      return;
    }

    try {
      this.isTransitioning = true;
      const { from, to } = event.payload;

      console.log(`[StateOrchestrator] Starting workspace transition: ${from} → ${to}`);

      // Get store references (lazy load)
      const workspaceStore = this.getWorkspaceStore();
      const agentsStore = this.getAgentsStore();
      const agentSelectionStore = this.getAgentSelectionStore();

      // Step 1: Start transition in workspace store
      workspaceStore?.startTransition(from);

      // Step 2: Filter agents for new workspace
      const allAgents = agentsStore?.agents || [];
      const availableAgents = allAgents.filter((agent: any) =>
        this.isAgentAvailableInWorkspace(agent, to)
      );

      console.log(`[StateOrchestrator] Found ${availableAgents.length} agents available in ${to}`);

      // Step 3: Check if current agent needs re-selection
      const currentAgentId = agentSelectionStore?.activeAgentId ?? null;
      const getAgentFn = agentsStore?.getAgent;
      const currentAgent = currentAgentId && getAgentFn
        ? getAgentFn(currentAgentId)
        : null;

      const agentNeedsReselection = !currentAgent ||
        !this.isAgentAvailableInWorkspace(currentAgent, to);

      // Step 4: Re-select agent if needed
      if (agentNeedsReselection) {
        const newAgent = this.selectAgentForWorkspace(availableAgents, to);

        if (newAgent) {
          console.log(`[StateOrchestrator] Re-selecting agent: ${newAgent.name} (${newAgent.id})`);
          agentSelectionStore?.setActiveAgent(newAgent.id, to);
        } else {
          console.warn(`[StateOrchestrator] No agents available for workspace: ${to}`);
        }
      }

      // Emit transition progress event
      eventBus.emit(
        DomainEventType.WORKSPACE_CHANGED,
        {
          from,
          to,
          agentId: agentSelectionStore?.activeAgentId ?? null
        },
        event.correlationId
      );

    } catch (error) {
      console.error('[StateOrchestrator] Error in workspace transition:', error);

      // Emit failure event
      eventBus.emit(
        DomainEventType.WORKSPACE_TRANSITION_FAILED,
        {
          from: event.payload.from,
          to: event.payload.to,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        event.correlationId
      );
    }
  }

  /**
   * Handle workspace transition completed event
   *
   * @param event - Domain event
   */
  private handleWorkspaceTransitionCompleted(
    event: DomainEvent<{ from: WorkspaceType; to: WorkspaceType; agentId: string }>
  ): void {
    const workspaceStore = this.getWorkspaceStore();

    // Update workspace store
    workspaceStore?.setCurrentWorkspace(event.payload.to);

    // End transition state
    workspaceStore?.endTransition();

    this.isTransitioning = false;

    console.log(`[StateOrchestrator] Workspace transition completed: ${event.payload.from} → ${event.payload.to}`);
  }

  /**
   * Handle workspace transition failed event
   *
   * @param event - Domain event
   */
  private handleWorkspaceTransitionFailed(
    event: DomainEvent<{ from: WorkspaceType; to: WorkspaceType; error: string }>
  ): void {
    const workspaceStore = this.getWorkspaceStore();

    // End transition state
    workspaceStore?.endTransition();

    this.isTransitioning = false;

    console.error(`[StateOrchestrator] Workspace transition failed: ${event.payload.error}`);
  }

  /**
   * Handle agent config updated event
   *
   * @param event - Domain event
   */
  private handleAgentConfigUpdated(
    event: DomainEvent<{ agentId: string }>
  ): void {
    const agentSelectionStore = this.getAgentSelectionStore();
    const agentsStore = this.getAgentsStore();
    const workspaceStore = this.getWorkspaceStore();

    const currentAgentId = agentSelectionStore?.activeAgentId ?? null;
    const currentWorkspace = workspaceStore?.currentWorkspace ?? 'ide';

    // If updated agent is currently selected, emit re-selected event
    if (currentAgentId === event.payload.agentId && agentsStore?.getAgent) {
      const agent = agentsStore.getAgent(event.payload.agentId);

      if (agent && this.isAgentAvailableInWorkspace(agent, currentWorkspace)) {
        eventBus.emit(
          DomainEventType.AGENT_SELECTED,
          {
            agentId: agent.id,
            agentName: agent.name,
            workspaceType: currentWorkspace
          }
        );
      }
    }
  }

  /**
   * Handle agent deleted event
   *
   * @param event - Domain event
   */
  private handleAgentDeleted(event: DomainEvent<{ agentId: string }>): void {
    const agentSelectionStore = this.getAgentSelectionStore();
    const agentsStore = this.getAgentsStore();

    const currentAgentId = agentSelectionStore?.activeAgentId ?? null;

    // If deleted agent was selected, select another agent
    if (currentAgentId === event.payload.agentId) {
      const remainingAgents = agentsStore?.agents ?? [];
      const workspaceStore = this.getWorkspaceStore();
      const currentWorkspace = workspaceStore?.currentWorkspace ?? 'ide';

      const availableAgents = remainingAgents.filter((agent: any) =>
        this.isAgentAvailableInWorkspace(agent, currentWorkspace)
      );

      if (availableAgents.length > 0) {
        const newAgent = this.selectAgentForWorkspace(availableAgents, currentWorkspace);
        if (newAgent) {
          agentSelectionStore?.setActiveAgent(newAgent.id, currentWorkspace);
        }
      } else {
        // No agents available, clear selection
        agentSelectionStore?.setActiveAgent(null, currentWorkspace);
      }
    }
  }

  /**
   * Handle provider key set event
   *
   * @param event - Domain event
   */
  private handleProviderKeySet(event: DomainEvent<{ providerId: string }>): void {
    // Trigger model fetch for provider
    // This is handled by provider-config-store
    console.log(`[StateOrchestrator] Provider key set for: ${event.payload.providerId}`);
  }

  /**
   * Check if agent is available in workspace
   *
   * @param agent - Agent to check
   * @param workspaceType - Workspace type
   * @returns True if agent is available
   */
  private isAgentAvailableInWorkspace(agent: any, workspaceType: WorkspaceType): boolean {
    if (!agent.workspaceBindings) {
      return false;
    }

    const binding = agent.workspaceBindings.find(
      (b: any) => b.workspaceType === workspaceType
    );

    return binding?.isAvailable ?? false;
  }

  /**
   * Select agent for workspace
   *
   * @param agents - Available agents
   * @param workspaceType - Target workspace
   * @returns Selected agent or null
   */
  private selectAgentForWorkspace(agents: any[], workspaceType: WorkspaceType): any | null {
    if (agents.length === 0) {
      return null;
    }

    // Prefer default agent
    const defaultAgent = agents.find((agent: any) => {
      const binding = agent.workspaceBindings?.find(
        (b: any) => b.workspaceType === workspaceType
      );
      return binding?.isDefault ?? false;
    });

    return defaultAgent || agents[0];
  }

  /**
   * Get workspace store (lazy load)
   */
  private getWorkspaceStore() {
    if (!this.stores.workspaceStore) {
      // Lazy load to avoid circular dependency
      const { useWorkspaceStore } = require('@/stores/workspace-store');
      this.stores.workspaceStore = useWorkspaceStore.getState();
    }
    return this.stores.workspaceStore;
  }

  /**
   * Get agents store (lazy load)
   */
  private getAgentsStore() {
    if (!this.stores.agentsStore) {
      // Lazy load to avoid circular dependency
      const { useAgentsStore } = require('@/stores/agents-store');
      this.stores.agentsStore = useAgentsStore.getState();
    }
    return this.stores.agentsStore;
  }

  /**
   * Get agent selection store (lazy load)
   */
  private getAgentSelectionStore() {
    if (!this.stores.agentSelectionStore) {
      // Lazy load to avoid circular dependency
      const { useAgentSelectionStore } = require('@/stores/agent-selection-store');
      this.stores.agentSelectionStore = useAgentSelectionStore.getState();
    }
    return this.stores.agentSelectionStore;
  }
}

// Export singleton instance
export const stateOrchestrator = new StateOrchestrator();

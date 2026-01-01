/**
 * @fileoverview Cross-Workspace Event Bus
 * @module infrastructure/events/cross-workspace-event-bus
 * @governance Architectural Specification v3.0
 * @ai-observable true
 *
 * Cross-workspace event propagation system.
 * Ensures agent configuration changes propagate across all workspace contexts.
 *
 * Addresses Gap G-004: Cross-workspace agent sync not wired
 */

import { eventBus, DomainEventType } from './event-bus';
import { useProviderStore } from '@/lib/state/provider-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';

/**
 * Cross-workspace event subscription manager
 *
 * Manages event subscriptions across all stores to ensure
 * configuration changes propagate to all workspace contexts.
 */
export class CrossWorkspaceEventBus {
  private unsubscribers: Array<() => void> = [];

  /**
   * Initialize all cross-workspace event subscriptions
   */
  initialize(): void {
    console.log('[CrossWorkspaceEventBus] Initializing subscriptions...');

    // Provider events → Agent stores
    this.subscribeProviderEvents();

    // Agent events → Selection store
    this.subscribeAgentEvents();

    // Workspace events → All stores
    this.subscribeWorkspaceEvents();

    console.log('[CrossWorkspaceEventBus] All subscriptions initialized');
  }

  /**
   * Subscribe to provider configuration events
   *
   * When provider changes, notify agent stores to update available models
   */
  private subscribeProviderEvents(): void {
    // Provider key set → Fetch models
    const unsubscribeKeySet = eventBus.on<{ providerId: string }>(
      DomainEventType.PROVIDER_KEY_SET,
      async ({ providerId }) => {
        console.log(`[CrossWorkspaceEventBus] Provider key set: ${providerId}`);

        // Fetch models for provider
        try {
          await useProviderStore.getState().fetchModels(providerId);
        } catch (error) {
          console.error(`[CrossWorkspaceEventBus] Failed to fetch models for ${providerId}:`, error);
        }
      }
    );

    // Provider added → Notify all workspaces
    const unsubscribeProviderAdded = eventBus.on<{ providerId: string }>(
      DomainEventType.PROVIDER_ADDED,
      ({ providerId }) => {
        console.log(`[CrossWorkspaceEventBus] Provider added: ${providerId}`);
        // Agent stores will reactively update via subscription
      }
    );

    // Provider updated → Notify all workspaces
    const unsubscribeProviderUpdated = eventBus.on<{ providerId: string }>(
      DomainEventType.PROVIDER_UPDATED,
      ({ providerId }) => {
        console.log(`[CrossWorkspaceEventBus] Provider updated: ${providerId}`);
      }
    );

    // Provider removed → Remove from agents
    const unsubscribeProviderRemoved = eventBus.on<{ providerId: string }>(
      DomainEventType.PROVIDER_REMOVED,
      ({ providerId }) => {
        console.log(`[CrossWorkspaceEventBus] Provider removed: ${providerId}`);

        // Update all agents using this provider
        const agentsStore = useAgentsStore.getState();
        const agents = agentsStore.agents.filter(a => a.providerId === providerId);

        for (const agent of agents) {
          // Disable or reconfigure agents
          console.warn(`[CrossWorkspaceEventBus] Agent ${agent.name} uses removed provider ${providerId}`);
        }
      }
    );

    this.unsubscribers.push(
      unsubscribeKeySet,
      unsubscribeProviderAdded,
      unsubscribeProviderUpdated,
      unsubscribeProviderRemoved
    );
  }

  /**
   * Subscribe to agent configuration events
   *
   * When agent changes, propagate to selection store and all workspaces
   */
  private subscribeAgentEvents(): void {
    // Agent created → Update selection store
    const unsubscribeAgentCreated = eventBus.on<{ agentId: string }>(
      DomainEventType.AGENT_CREATED,
      ({ agentId }) => {
        console.log(`[CrossWorkspaceEventBus] Agent created: ${agentId}`);

        // If this is first agent, set as active
        const agentsStore = useAgentsStore.getState();
        if (agentsStore.agents.length === 1) {
          const selectionStore = useAgentSelectionStore.getState();
          selectionStore.setActiveAgent(agentId, 'ide'); // Default to IDE
        }
      }
    );

    // Agent updated → Notify all workspaces
    const unsubscribeAgentUpdated = eventBus.on<{ agentId: string }>(
      DomainEventType.AGENT_CONFIG_UPDATED,
      ({ agentId }) => {
        console.log(`[CrossWorkspaceEventBus] Agent updated: ${agentId}`);
        // All workspaces using this agent will reactively update
      }
    );

    // Agent selected → Update selection store
    const unsubscribeAgentSelected = eventBus.on<{ agentId: string; workspaceType: string }>(
      DomainEventType.AGENT_SELECTED,
      ({ agentId, workspaceType }) => {
        console.log(`[CrossWorkspaceEventBus] Agent selected: ${agentId} for ${workspaceType}`);

        const selectionStore = useAgentSelectionStore.getState();
        selectionStore.setActiveAgent(agentId, workspaceType as any);
      }
    );

    // Agent deleted → Update selection store
    const unsubscribeAgentDeleted = eventBus.on<{ agentId: string }>(
      DomainEventType.AGENT_DELETED,
      ({ agentId }) => {
        console.log(`[CrossWorkspaceEventBus] Agent deleted: ${agentId}`);

        const selectionStore = useAgentSelectionStore.getState();
        const activeAgentId = selectionStore.activeAgentId;

        // If deleted agent was active, clear selection
        if (activeAgentId === agentId) {
          selectionStore.setActiveAgent(null, 'ide');
        }
      }
    );

    this.unsubscribers.push(
      unsubscribeAgentCreated,
      unsubscribeAgentUpdated,
      unsubscribeAgentSelected,
      unsubscribeAgentDeleted
    );
  }

  /**
   * Subscribe to workspace transition events
   *
   * When workspace changes, orchestrate state across all stores
   */
  private subscribeWorkspaceEvents(): void {
    // Workspace transition started → Prepare all stores
    const unsubscribeTransitionStarted = eventBus.on<{
      from: string;
      to: string;
    }>(
      DomainEventType.WORKSPACE_TRANSITION_STARTED,
      ({ from, to }) => {
        console.log(`[CrossWorkspaceEventBus] Workspace transition: ${from} → ${to}`);

        // Notify all stores to prepare for transition
        // State orchestrator handles this
      }
    );

    // Workspace transition completed → Finalize all stores
    const unsubscribeTransitionCompleted = eventBus.on<{
      from: string;
      to: string;
    }>(
      DomainEventType.WORKSPACE_TRANSITION_COMPLETED,
      ({ from, to }) => {
        console.log(`[CrossWorkspaceEventBus] Workspace transition completed: ${from} → ${to}`);

        // Trigger workspace-specific agent selection
        const selectionStore = useAgentSelectionStore.getState();
        selectionStore.selectAgentForWorkspace(to as any);
      }
    );

    // Workspace changed → Notify all stores
    const unsubscribeWorkspaceChanged = eventBus.on<{
      workspaceType: string;
    }>(
      DomainEventType.WORKSPACE_CHANGED,
      ({ workspaceType }) => {
        console.log(`[CrossWorkspaceEventBus] Workspace changed to: ${workspaceType}`);
      }
    );

    this.unsubscribers.push(
      unsubscribeTransitionStarted,
      unsubscribeTransitionCompleted,
      unsubscribeWorkspaceChanged
    );
  }

  /**
   * Cleanup all event subscriptions
   */
  destroy(): void {
    console.log('[CrossWorkspaceEventBus] Destroying subscriptions...');

    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }

    this.unsubscribers = [];
    console.log('[CrossWorkspaceEventBus] All subscriptions destroyed');
  }

  /**
   * Emit custom event across workspaces
   *
   * Use this for application-specific cross-workspace communication
   *
   * @param eventType - Custom event type
   * @param payload - Event payload
   * @param targetWorkspace - Target workspace (optional, broadcasts to all if not specified)
   */
  emitCrossWorkspace<T>(
    eventType: string,
    payload: T,
    targetWorkspace?: string
  ): void {
    console.log(`[CrossWorkspaceEventBus] Emitting cross-workspace event: ${eventType}`, {
      payload,
      targetWorkspace,
    });

    // Emit via event bus with workspace metadata
    eventBus.emit(eventType as any, {
      ...payload,
      targetWorkspace,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();

/**
 * Initialize cross-workspace event system on app mount
 *
 * Call this once during application initialization
 */
export function initializeCrossWorkspaceEvents(): void {
  if (typeof window !== 'undefined') {
    crossWorkspaceEventBus.initialize();
  }
}

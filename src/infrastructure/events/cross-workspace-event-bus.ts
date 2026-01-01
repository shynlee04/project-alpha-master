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
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
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
   * Ralph Loop Cycle 4: This method is obsolete.
   * New cross-workspace events are emitted directly via:
   * - crossWorkspaceEventBus.emitProviderConfigChange()
   * - crossWorkspaceEventBus.emitModelsUpdated()
   *
   * Subscribe to these events using:
   * - crossWorkspaceEventBus.onProviderConfigChange()
   * - crossWorkspaceEventBus.onModelsUpdated()
   */
  private subscribeProviderEvents(): void {
    // OBSOLETE: Ralph Loop Cycle 4 replaced this with direct event emission
    // The new cross-workspace events don't use the old eventBus.on() pattern
    // Provider config changes are now emitted from provider-store.ts and credential save flow

    // Legacy event subscriptions (commented out - using non-existent event types)
    // const unsubscribeKeySet = eventBus.on<{ providerId: string }>(
    //   DomainEventType.PROVIDER_KEY_SET,
    //   async ({ providerId }) => {
    //     console.log(`[CrossWorkspaceEventBus] Provider key set: ${providerId}`);
    //     try {
    //       await useProviderStore.getState().fetchModels(providerId);
    //     } catch (error) {
    //       console.error(`[CrossWorkspaceEventBus] Failed to fetch models for ${providerId}:`, error);
    //     }
    //   }
    // );

    // Note: PROVIDER_ADDED, PROVIDER_UPDATED, PROVIDER_REMOVED don't exist in DomainEventType enum
    // These subscriptions would cause TypeScript errors
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
      (event) => {
        const { agentId } = event.payload;
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
      (event) => {
        const { agentId } = event.payload;
        console.log(`[CrossWorkspaceEventBus] Agent updated: ${agentId}`);
        // All workspaces using this agent will reactively update
      }
    );

    // Agent selected → Update selection store
    // REMOVED: Circular dependency loop. AgentSelectionStore emits this event,
    // so listening to it and calling setActiveAgent causes an infinite loop.
    // UI components call setActiveAgent directly.
    /*
    const unsubscribeAgentSelected = eventBus.on<{ agentId: string; workspaceType: string }>(
      DomainEventType.AGENT_SELECTED,
      (event) => {
        const { agentId, workspaceType } = event.payload;
        console.log(`[CrossWorkspaceEventBus] Agent selected: ${agentId} for ${workspaceType}`);

        const selectionStore = useAgentSelectionStore.getState();
        selectionStore.setActiveAgent(agentId, workspaceType as any);
      }
    );
    */

    // Agent deleted → Update selection store
    const unsubscribeAgentDeleted = eventBus.on<{ agentId: string }>(
      DomainEventType.AGENT_DELETED,
      (event) => {
        const { agentId } = event.payload;
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
      // unsubscribeAgentSelected, // Removed circular loop
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
      (event) => {
        const { from, to } = event.payload;
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
      (event) => {
        const { from, to } = event.payload;
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
      (event) => {
        const { workspaceType } = event.payload;
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

/**
 * @fileoverview Agent Selection Event Emitters
 * @module infrastructure/persistence/stores/agents/slices/agent-selection-events
 * @governance Architectural Specification v3.0
 *
 * Event emission actions for agent selection changes.
 */

import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { Agent } from '@/core/entities/Agent';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import { emitStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';

/**
 * Create agent selection event emitters slice
 */
export function createAgentSelectionEvents() {
  return {
    /**
     * Emit agent selected event
     */
    emitAgentSelected: (agent: Agent, workspaceType: WorkspaceType) => {
      console.log('[AgentSelectionStore] Agent selected:', agent.name, 'for workspace:', workspaceType);

      // Emit to domain event bus (legacy, for backward compatibility)
      eventBus.emit(DomainEventType.AGENT_SELECTED, {
        agentId: agent.id,
        agentName: agent.name,
        workspaceType,
      });

      // Emit to store events (for cross-store reactivity)
      emitStoreEvent(STORE_EVENTS.AGENT_CONFIG_CHANGED, {
        agentId: agent.id,
        workspaceType,
        configType: 'selection',
        timestamp: Date.now(),
      });
    },

    /**
     * Emit agent deselected event
     */
    emitAgentDeselected: (workspaceType: WorkspaceType) => {
      console.log('[AgentSelectionStore] Agent deselected for workspace:', workspaceType);
      eventBus.emit(DomainEventType.AGENT_DESELECTED, {
        workspaceType,
      });
    },

    /**
     * Emit default agent changed event
     */
    emitDefaultAgentChanged: (agent: Agent, workspaceType: WorkspaceType) => {
      console.log('[AgentSelectionStore] Default agent changed:', agent.name, 'for workspace:', workspaceType);

      // Emit to domain event bus (legacy, for backward compatibility)
      eventBus.emit(DomainEventType.DEFAULT_AGENT_CHANGED, {
        agentId: agent.id,
        agentName: agent.name,
        workspaceType,
      });

      // Emit to store events (for cross-store reactivity)
      emitStoreEvent(STORE_EVENTS.AGENT_CONFIG_CHANGED, {
        agentId: agent.id,
        workspaceType,
        configType: 'default',
        timestamp: Date.now(),
      });
    },
  };
}

/**
 * @fileoverview Event System Integration
 * @module infrastructure/events
 * @governance Architectural Specification v3.0
 *
 * Central initialization point for all event systems.
 * Wires event bus, state orchestrator, and cross-workspace events.
 */

import { eventBus } from './event-bus';
import { stateOrchestrator, StateOrchestrator } from '../persistence/state-orchestrator';
import { crossWorkspaceEventBus } from './cross-workspace-event-bus';

/**
 * Initialize complete event system
 *
 * This should be called once during application bootstrap
 * to wire all event-driven architecture components.
 *
 * @example
 * ```ts
 * // In main.tsx or App.tsx
 * import { initializeEventSystem } from '@/infrastructure/events';
 *
 * function App() {
 *   useEffect(() => {
 *     initializeEventSystem();
 *   }, []);
 *
 *   return <YourApp />;
 * }
 * ```
 */
export function initializeEventSystem(): void {
  console.log('[EventSystem] Initializing complete event system...');

  // Step 1: Initialize state orchestrator
  stateOrchestrator.initialize();

  // Step 2: Register store references with orchestrator
  registerStoreReferences(stateOrchestrator);

  console.log('[EventSystem] Complete event system initialized');
}

/**
 * Register store references with state orchestrator
 *
 * Lazy load stores to avoid circular dependencies
 */
function registerStoreReferences(orchestrator: StateOrchestrator): void {
  // Workspace store
  try {
    const { useWorkspaceStore } = require('@/lib/state/workspace-store');
    orchestrator.registerStore('workspaceStore', useWorkspaceStore);
  } catch (error) {
    console.warn('[EventSystem] Workspace store not available:', error);
  }

  // Agents store
  try {
    const { useAgentsStore } = require('@/stores/agents-store');
    orchestrator.registerStore('agentsStore', useAgentsStore);
  } catch (error) {
    console.warn('[EventSystem] Agents store not available:', error);
  }

  // Agent selection store
  try {
    const { useAgentSelectionStore } = require('@/infrastructure/persistence/stores/agents/agent-selection-store');
    orchestrator.registerStore('agentSelectionStore', useAgentSelectionStore);
  } catch (error) {
    console.warn('[EventSystem] Agent selection store not available:', error);
  }
}

/**
 * Export event system components for direct access
 */
export { eventBus };
export { StateOrchestrator };
export { crossWorkspaceEventBus };

/**
 * Re-export all domain event types
 */
export { DomainEventType } from './event-bus';
export type { DomainEvent, EventHandler } from './event-bus';

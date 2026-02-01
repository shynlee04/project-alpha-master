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
export async function initializeEventSystem(): Promise<void> {
  console.log('[EventSystem] Initializing complete event system...');

  // Step 1: Initialize state orchestrator
  stateOrchestrator.initialize();

  // Step 2: Register store references with orchestrator (async for ESM)
  await registerStoreReferences(stateOrchestrator);

  console.log('[EventSystem] Complete event system initialized');
}

/**
 * Register store references with state orchestrator
 *
 * Uses dynamic import() for ESM compatibility.
 * Stores are loaded asynchronously to avoid circular dependencies.
 */
async function registerStoreReferences(orchestrator: StateOrchestrator): Promise<void> {
  // Workspace store
  try {
    const workspaceModule = await import('@/infrastructure/persistence/stores/workspace/workspace-store');
    orchestrator.registerStore('workspaceStore', workspaceModule.useWorkspaceStore);
  } catch (error) {
    console.warn('[EventSystem] Workspace store not available:', error);
  }

  // Agents store (re-exported from agents/index.ts)
  try {
    const agentsModule = await import('@/infrastructure/persistence/stores/agents');
    orchestrator.registerStore('agentsStore', agentsModule.useAgentsStore);
  } catch (error) {
    console.warn('[EventSystem] Agents store not available:', error);
  }

  // Agent selection store
  try {
    const selectionModule = await import('@/infrastructure/persistence/stores/agents/agent-selection-store');
    orchestrator.registerStore('agentSelectionStore', selectionModule.useAgentSelectionStore);
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

/**
 * Re-export file event bus (EPIC-0.5-02)
 */
export { fileEventBus, useFileEventBus } from './file-event-bus';
export {
  emitFileCreated,
  emitFileUpdated,
  emitFileDeleted,
  emitFileMoved,
  emitFileRenamed,
} from './file-event-bus';
export type {
  FileEvent,
  FileEventType,
  FileEventSource,
  FileEventHandler,
  FileEventSubscriberOptions,
  FileEventBusEvents,
  FileCreatedEvent,
  FileUpdatedEvent,
  FileDeletedEvent,
  FileMovedEvent,
  FileRenamedEvent,
} from './types';
export {
  isFileCreatedEvent,
  isFileUpdatedEvent,
  isFileDeletedEvent,
  isFileMovedEvent,
  isFileRenamedEvent,
} from './types';

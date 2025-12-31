export {
  createWorkspaceEventBus,
  type WorkspaceEventEmitter,
  type WorkspaceEvents,
} from './workspace-events'

export { useWorkspaceEvent } from './use-workspace-event'

// Store events for cross-store communication (AC-01)
export {
  storeEvents,
  STORE_EVENTS,
  emitStoreEvent,
  onStoreEvent,
  onceStoreEvent,
  offStoreEvent,
  type StoreEventType,
  type ProviderKeySetPayload,
  type ProviderModelsLoadedPayload,
  type AgentSelectedPayload,
} from './store-events'

// ============================================================================
// WB-8.3: Cross-Workspace Event System
// ============================================================================

export {
  crossWorkspaceEventBus,
} from './cross-workspace-event-bus'

export type {
  WorkspaceId,
  FileChangeEvent,
  AgentConfigChangeEvent,
  SyncStatusEvent,
  ProjectStateChangeEvent,
} from './cross-workspace-event-bus'

export {
  useCrossWorkspaceAgentConfigEvents,
  useAllCrossWorkspaceEvents,
} from './use-cross-workspace-events'

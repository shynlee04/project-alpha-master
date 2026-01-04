/**
 * @fileoverview Cross-Workspace Event Bus
 * @module infrastructure/events/cross-workspace-event-bus
 * @governance Architectural Specification v3.0
 * @ai-observable true
 *
 * **REFACTORED (P0-3)**: Now re-exports from canonical location
 * to eliminate duplicate implementations.
 *
 * Canonical implementation: `@/lib/events/cross-workspace-event-bus`
 *
 * Cross-workspace event propagation system.
 * Ensures agent configuration changes propagate across all workspace contexts.
 *
 * @deprecated Import from `@/lib/events/cross-workspace-event-bus` instead
 */

// Re-export all from canonical lib location
export { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';

// Re-export types
export type {
  WorkspaceId,
  FileChangeEvent,
  AgentConfigChangeEvent,
  SyncStatusEvent,
  ProjectStateChangeEvent,
  WorkspaceChangeEvent,
  ProviderConfigChangeEvent,
  ModelsUpdatedEvent,
} from '@/lib/events/cross-workspace-event-bus';

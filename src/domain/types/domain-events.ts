/**
 * @fileoverview Domain Event Types
 * @module domain/types/domain-events
 *
 * Defines typed domain events for cross-operator communication.
 * These events enable loose coupling between Platform Operators.
 *
 * Event naming convention:
 * - Format: `{entity}:{action}` (e.g., 'file:created', 'project:switched')
 * - Entity: The domain entity affected
 * - Action: Past tense verb describing what happened
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

// ============================================================================
// Domain Event Types
// ============================================================================

/**
 * All possible domain event types
 *
 * Events are organized by domain entity:
 * - file:* - File operations
 * - project:* - Project lifecycle
 * - thread:* - Chat thread events
 * - tool:* - Agent tool execution
 * - sync:* - Sync status events
 * - workspace:* - Workspace change events
 * - provider:* - AI provider events
 */
export type DomainEventType =
  // File events
  | 'file:created'
  | 'file:updated'
  | 'file:deleted'
  | 'file:synced'
  | 'file:renamed'
  | 'file:changed' // Legacy event for backward compatibility
  | 'file:modified' // Legacy alias for file:updated
  // Project events
  | 'project:created'
  | 'project:deleted'
  | 'project:switched'
  | 'project:opened'
  | 'project:closed'
  // Thread events (Chat-Cascade)
  | 'thread:created'
  | 'thread:updated'
  | 'thread:deleted'
  | 'thread:message:added'
  // Tool events (Agent tools)
  | 'tool:executed'
  | 'tool:approved'
  | 'tool:rejected'
  | 'tool:pending'
  // Sync events
  | 'sync:status'
  | 'sync:progress'
  | 'sync:completed'
  | 'sync:error'
  | 'sync:warning' // For non-critical sync issues
  | 'sync:started' // Legacy alias for sync:status with syncing
  | 'sync:start' // Alternative event name
  | 'sync:rollback' // For transaction rollback events
  // Workspace events
  | 'workspace:changed'
  | 'workspace:activated'
  | 'workspace:deactivated'
  // Provider events
  | 'provider:config:changed'
  | 'provider:models:updated'
  // Container events (WebContainer lifecycle)
  | 'container:mounted'
  | 'container:error'
  | 'container:ready'
  | 'container:destroyed';

// ============================================================================
// Domain Event Base
// ============================================================================

/**
 * Base domain event structure
 *
 * All domain events share this structure:
 * - type: Event identifier
 * - payload: Event-specific data
 * - timestamp: When the event occurred
 * - source: Which operator/service emitted the event
 */
export interface DomainEvent<T = unknown> {
  /** Event type identifier */
  type: DomainEventType;
  /** Event-specific payload */
  payload: T;
  /** Event timestamp (milliseconds since epoch) */
  timestamp: number;
  /** Source operator/service that emitted this event */
  source: string;
}

// ============================================================================
// Typed Event Payloads
// ============================================================================

/**
 * Payload for file-related events
 */
export interface FileEventPayload {
  /** Project ID (files belong to projects) */
  projectId: string;
  /** File path relative to project root */
  path: string;
  /** File content (optional, for create/update) */
  content?: string;
  /** Previous path (for renamed events) */
  previousPath?: string;
  /** Source of file change (fsa, wc) */
  source?: string;
  /** Direction of sync */
  direction?: string;
}

/**
 * Payload for project-related events
 */
export interface ProjectEventPayload {
  /** Project ID */
  projectId: string;
  /** Project name (optional) */
  name?: string;
}

/**
 * Payload for thread-related events
 */
export interface ThreadEventPayload {
  /** Project ID this thread belongs to */
  projectId: string;
  /** Thread ID */
  threadId: string;
  /** Message ID (for message events) */
  messageId?: string;
}

/**
 * Payload for tool execution events
 */
export interface ToolEventPayload {
  /** Project ID */
  projectId: string;
  /** Thread ID where tool was used */
  threadId: string;
  /** Tool name */
  toolName: string;
  /** Tool call ID */
  toolCallId: string;
  /** Tool arguments (for executed) */
  arguments?: Record<string, unknown>;
  /** Tool result (for executed) */
  result?: unknown;
}

// ============================================================================
// Sync Event Payloads
// ============================================================================

/**
 * Payload for sync status events
 */
export interface SyncStatusPayload {
  /** Project or workspace ID */
  projectId?: string;
  workspaceId?: string;
  /** Project path for display */
  projectPath?: string;
  /** Sync status (optional for started events) */
  status?: 'syncing' | 'synced' | 'error' | 'idle' | 'pending';
  /** Error message if status is 'error' */
  error?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** File count (for started events) */
  fileCount?: number;
  /** Sync direction */
  direction?: 'to-wc' | 'from-wc' | 'bidirectional';
}

/**
 * Payload for sync progress events
 */
export interface SyncProgressPayload {
  projectId?: string;
  workspaceId?: string;
  /** Files processed (alias: current) */
  processed?: number;
  /** Total files */
  total: number;
  /** Current file being processed */
  currentFile?: string;
  /** Current file index (alternative to processed) */
  current?: number;
  /** Operation ID for tracking */
  operationId?: string;
}

/**
 * Payload for sync completed events
 */
export interface SyncCompletedPayload {
  projectId?: string;
  workspaceId?: string;
  /** Number of files synced */
  filesCount: number;
  /** Duration in ms */
  duration: number;
  /** Sync result */
  success: boolean;
  /** Completion timestamp (ms or Date) */
  timestamp?: number | Date;
}

/**
 * Payload for sync error events
 */
export interface SyncErrorPayload {
  projectId?: string;
  workspaceId?: string;
  /** Error message or Error object */
  error: Error | string;
  /** Error code */
  code?: string;
  /** File that caused the error */
  file?: string;
  /** Operation ID for tracking */
  operationId?: string;
}

// ============================================================================
// Workspace Event Payloads
// ============================================================================

/**
 * Payload for workspace changed events
 */
export interface WorkspaceChangedPayload {
  /** Previous workspace */
  from: string;
  /** New workspace */
  to: string;
  /** ISO timestamp */
  timestamp: string;
}

/**
 * Payload for workspace activated/deactivated events
 */
export interface WorkspaceActivatedPayload {
  /** Workspace ID/type */
  workspaceId: string;
  /** Project ID if applicable */
  projectId?: string;
}

// ============================================================================
// Provider Event Payloads
// ============================================================================

/**
 * Payload for provider config change events
 */
export interface ProviderConfigPayload {
  /** Provider ID */
  providerId: string;
  /** Changed fields */
  changes: Record<string, unknown>;
}

/**
 * Payload for provider models updated events
 */
export interface ProviderModelsPayload {
  /** Provider ID */
  providerId: string;
  /** Updated model list */
  models: string[];
}

/**
 * Payload for file changed events (legacy)
 */
export interface FileChangedPayload {
  workspaceId?: string;
  projectId?: string;
  projectPath?: string;
  path: string;
  /** File path (alias for path) */
  filePath?: string;
  type: 'created' | 'modified' | 'deleted';
}

// ============================================================================
// Container Event Payloads
// ============================================================================

/**
 * Payload for sync warning events
 */
export interface SyncWarningPayload {
  message: string;
  path?: string;
  projectId?: string;
  file?: string;
  [key: string]: unknown;
}

/**
 * Payload for container mounted events
 */
export interface ContainerMountedPayload {
  fileCount: number;
  mountPoint?: string;
}

/**
 * Payload for container error events
 */
export interface ContainerErrorPayload {
  error: Error | string;
  operation?: string;
}

/**
 * Payload for container ready events
 */
export interface ContainerReadyPayload {
  containerId?: string;
}

/**
 * Payload for container destroyed events
 */
export interface ContainerDestroyedPayload {
  reason?: string;
}

// ============================================================================
// Typed Domain Events
// ============================================================================

/**
 * File created event
 */
export interface FileCreatedEvent extends DomainEvent<FileEventPayload> {
  type: 'file:created';
}

/**
 * File updated event
 */
export interface FileUpdatedEvent extends DomainEvent<FileEventPayload> {
  type: 'file:updated';
}

/**
 * File deleted event
 */
export interface FileDeletedEvent extends DomainEvent<FileEventPayload> {
  type: 'file:deleted';
}

/**
 * File synced event
 */
export interface FileSyncedEvent extends DomainEvent<FileEventPayload> {
  type: 'file:synced';
}

/**
 * File renamed event
 */
export interface FileRenamedEvent extends DomainEvent<FileEventPayload> {
  type: 'file:renamed';
}

/**
 * Project switched event
 */
export interface ProjectSwitchedEvent extends DomainEvent<ProjectEventPayload> {
  type: 'project:switched';
}

/**
 * Thread message added event
 */
export interface ThreadMessageAddedEvent extends DomainEvent<ThreadEventPayload> {
  type: 'thread:message:added';
}

/**
 * Tool executed event
 */
export interface ToolExecutedEvent extends DomainEvent<ToolEventPayload> {
  type: 'tool:executed';
}

// ============================================================================
// Event Type Map (for type-safe handlers)
// ============================================================================

/**
 * Map event types to their payload types
 * Used for type-safe event handlers
 */
export interface DomainEventMap {
  'file:created': FileEventPayload;
  'file:updated': FileEventPayload;
  'file:deleted': FileEventPayload;
  'file:synced': FileEventPayload;
  'file:renamed': FileEventPayload;
  'file:changed': FileChangedPayload;
  'file:modified': FileEventPayload;
  'project:created': ProjectEventPayload;
  'project:deleted': ProjectEventPayload;
  'project:switched': ProjectEventPayload;
  'project:opened': ProjectEventPayload;
  'project:closed': ProjectEventPayload;
  'thread:created': ThreadEventPayload;
  'thread:updated': ThreadEventPayload;
  'thread:deleted': ThreadEventPayload;
  'thread:message:added': ThreadEventPayload;
  'tool:executed': ToolEventPayload;
  'tool:approved': ToolEventPayload;
  'tool:rejected': ToolEventPayload;
  'tool:pending': ToolEventPayload;
  // Sync events
  'sync:status': SyncStatusPayload;
  'sync:progress': SyncProgressPayload;
  'sync:completed': SyncCompletedPayload;
  'sync:error': SyncErrorPayload;
  'sync:warning': SyncWarningPayload;
  'sync:started': SyncStatusPayload;
  'sync:start': SyncStatusPayload;
  'sync:rollback': SyncErrorPayload;
  // Workspace events
  'workspace:changed': WorkspaceChangedPayload;
  'workspace:activated': WorkspaceActivatedPayload;
  'workspace:deactivated': WorkspaceActivatedPayload;
  // Provider events
  'provider:config:changed': ProviderConfigPayload;
  'provider:models:updated': ProviderModelsPayload;
  // Container events
  'container:mounted': ContainerMountedPayload;
  'container:error': ContainerErrorPayload;
  'container:ready': ContainerReadyPayload;
  'container:destroyed': ContainerDestroyedPayload;
}

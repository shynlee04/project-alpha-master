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
 */
export type DomainEventType =
  // File events
  | 'file:created'
  | 'file:updated'
  | 'file:deleted'
  | 'file:synced'
  | 'file:renamed'
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
  | 'tool:pending';

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
}

/**
 * @fileoverview File Event Types
 * @module infrastructure/events/types
 *
 * **EPIC-0.5-02**: EventBus for File CRUD Sync
 *
 * Type definitions for file system CRUD events.
 * Used by FileEventBus for type-safe event emission and subscription.
 *
 * @epic EPIC-0.5-02
 * @story 0.5-02-B
 * @team Team B
 * @created 2026-01-26
 */

// ============================================================================
// File Event Type
// ============================================================================

/**
 * File Event Types
 *
 * All possible file-related CRUD operations that can be emitted
 * through the FileEventBus.
 */
export type FileEventType =
  | 'FILE_CREATED'
  | 'FILE_UPDATED'
  | 'FILE_DELETED'
  | 'FILE_MOVED'
  | 'FILE_RENAMED';

/**
 * File Event
 *
 * Represents a single file system change event.
 * Emitted by FileEventBus when files are created, updated, deleted, moved, or renamed.
 *
 * @example
 * ```ts
 * const event: FileEvent = {
 *   type: 'FILE_UPDATED',
 *   path: '/src/components/Header.tsx',
 *   timestamp: Date.now(),
 *   source: 'user',
 * };
 * ```
 */
export interface FileEvent {
  /** Type of file operation */
  type: FileEventType;

  /** Current path of the file (after operation) */
  path: string;

  /** Previous path (only for FILE_MOVED and FILE_RENAMED) */
  oldPath?: string;

  /** Unix timestamp of when the event occurred */
  timestamp: number;

  /** Source of the file operation */
  source: FileEventSource;

  /** Project ID where the file change occurred */
  projectId: string;

  /** Optional file content (for created/updated files) */
  content?: string;

  /** Optional file size in bytes */
  size?: number;
}

/**
 * File Event Source
 *
 * Indicates what triggered the file operation.
 */
export type FileEventSource =
  | 'user'     // User action (e.g., editing in Monaco)
  | 'external' // External change (e.g., file edited outside the app)
  | 'agent';   // Agent action (e.g., AI agent created/modified a file)

// ============================================================================
// File Event Handler Types
// ============================================================================

/**
 * File Event Handler
 *
 * Type definition for functions that handle file events.
 */
export type FileEventHandler = (event: FileEvent) => void | Promise<void>;

/**
 * File Event Filter
 *
 * Type definition for functions that filter file events.
 * Returns true if the event should be processed.
 */
export type FileEventFilter = (event: FileEvent) => boolean;

/**
 * File Event Subscriber Options
 *
 * Configuration options for subscribing to file events.
 */
export interface FileEventSubscriberOptions {
  /** Optional filter to only process certain events */
  filter?: FileEventFilter;

  /** Whether to receive events for all projects or just current one */
  allProjects?: boolean;

  /** Specific project ID to listen to (if not all projects) */
  projectId?: string;

  /** Specific event types to listen to (if not all types) */
  eventTypes?: FileEventType[];
}

// ============================================================================
// File Event Bus Events
// ============================================================================

/**
 * File Event Bus Event Map
 *
 * Type-safe event map for EventEmitter3.
 * Defines all possible events and their payload types.
 */
export interface FileEventBusEvents {
  /** Catch-all for all file events */
  file: (event: FileEvent) => void;

  /** File created event */
  'file:created': (event: FileEvent) => void;

  /** File updated event */
  'file:updated': (event: FileEvent) => void;

  /** File deleted event */
  'file:deleted': (event: FileEvent) => void;

  /** File moved event */
  'file:moved': (event: FileEvent) => void;

  /** File renamed event */
  'file:renamed': (event: FileEvent) => void;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * File Created Event
 *
 * Helper type for FILE_CREATED events.
 */
export interface FileCreatedEvent extends FileEvent {
  type: 'FILE_CREATED';
}

/**
 * File Updated Event
 *
 * Helper type for FILE_UPDATED events.
 */
export interface FileUpdatedEvent extends FileEvent {
  type: 'FILE_UPDATED';
}

/**
 * File Deleted Event
 *
 * Helper type for FILE_DELETED events.
 */
export interface FileDeletedEvent extends FileEvent {
  type: 'FILE_DELETED';
}

/**
 * File Moved Event
 *
 * Helper type for FILE_MOVED events.
 */
export interface FileMovedEvent extends FileEvent {
  type: 'FILE_MOVED';
  oldPath: string;
}

/**
 * File Renamed Event
 *
 * Helper type for FILE_RENAMED events.
 */
export interface FileRenamedEvent extends FileEvent {
  type: 'FILE_RENAMED';
  oldPath: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if event is a file created event
 */
export function isFileCreatedEvent(event: FileEvent): event is FileCreatedEvent {
  return event.type === 'FILE_CREATED';
}

/**
 * Check if event is a file updated event
 */
export function isFileUpdatedEvent(event: FileEvent): event is FileUpdatedEvent {
  return event.type === 'FILE_UPDATED';
}

/**
 * Check if event is a file deleted event
 */
export function isFileDeletedEvent(event: FileEvent): event is FileDeletedEvent {
  return event.type === 'FILE_DELETED';
}

/**
 * Check if event is a file moved event
 */
export function isFileMovedEvent(event: FileEvent): event is FileMovedEvent {
  return event.type === 'FILE_MOVED';
}

/**
 * Check if event is a file renamed event
 */
export function isFileRenamedEvent(event: FileEvent): event is FileRenamedEvent {
  return event.type === 'FILE_RENAMED';
}

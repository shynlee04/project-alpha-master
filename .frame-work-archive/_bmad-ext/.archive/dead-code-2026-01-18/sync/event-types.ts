/**
 * Sync Event Bus - Event Type Definitions
 * 
 * Centralized event types for file sync, terminal, and navigation events.
 * All events are typed for compile-time safety.
 * 
 * @packageDocumentation
 */

// =============================================================================
// Event Type Unions
// =============================================================================

/**
 * File system event types
 */
export type FileEventType = 
  | 'file:created'
  | 'file:modified'
  | 'file:deleted'
  | 'file:read'
  | 'file:synced';

/**
 * Terminal event types
 */
export type TerminalEventType = 
  | 'terminal:output'
  | 'terminal:error'
  | 'terminal:command'
  | 'terminal:session_started'
  | 'terminal:session_ended';

/**
 * Navigation event types
 */
export type NavigationEventType = 
  | 'navigation:file_opened'
  | 'navigation:file_closed'
  | 'navigation:panel_switched'
  | 'navigation:sidebar_tab_changed'
  | 'navigation:directory_changed';

/**
 * All sync event types
 */
export type SyncEventType = FileEventType | TerminalEventType | NavigationEventType;

// =============================================================================
// Event Payloads
// =============================================================================

/**
 * Base event payload structure
 */
export interface BaseEventPayload<T = unknown> {
  /** Event type identifier */
  type: SyncEventType;
  /** Timestamp when event was emitted */
  timestamp: number;
  /** Event payload data */
  data: T;
  /** Source identifier (e.g., 'local-fs-adapter', 'terminal-adapter') */
  source: string;
  /** Optional namespace for event filtering */
  namespace?: string;
}

/**
 * File system event payload
 */
export interface FileEventPayload {
  /** File path (relative or absolute) */
  path: string;
  /** File name */
  name: string;
  /** Operation type */
  operation: 'create' | 'modify' | 'delete' | 'read' | 'sync';
  /** File size in bytes (if available) */
  size?: number;
  /** MIME type (if available) */
  mimeType?: string;
  /** Last modified timestamp */
  lastModified?: number;
}

/**
 * Terminal output event payload
 */
export interface TerminalEventPayload {
  /** Terminal session ID */
  sessionId: string;
  /** Command that was executed (if applicable) */
  command?: string;
  /** Output data */
  output: string;
  /** Whether this is an error stream */
  isError: boolean;
  /** Exit code (if available) */
  exitCode?: number;
}

/**
 * Navigation event payload
 */
export interface NavigationEventPayload {
  /** Previous path (for file/directory navigation) */
  previousPath?: string;
  /** Previous state value */
  previousValue: unknown;
  /** New state value */
  newValue: unknown;
  /** Navigation target (file path, panel ID, etc.) */
  target: string;
  /** Navigation action type */
  action: 'open' | 'close' | 'switch' | 'change';
}

// =============================================================================
// Event Maps (for TypeScript type safety)
// =============================================================================

/**
 * Type-safe event map for file events
 */
export interface FileEventMap {
  'file:created': BaseEventPayload<FileEventPayload>;
  'file:modified': BaseEventPayload<FileEventPayload>;
  'file:deleted': BaseEventPayload<FileEventPayload>;
  'file:read': BaseEventPayload<FileEventPayload>;
  'file:synced': BaseEventPayload<FileEventPayload>;
}

/**
 * Type-safe event map for terminal events
 */
export interface TerminalEventMap {
  'terminal:output': BaseEventPayload<TerminalEventPayload>;
  'terminal:error': BaseEventPayload<TerminalEventPayload>;
  'terminal:command': BaseEventPayload<TerminalEventPayload>;
  'terminal:session_started': BaseEventPayload<TerminalEventPayload>;
  'terminal:session_ended': BaseEventPayload<TerminalEventPayload>;
}

/**
 * Type-safe event map for navigation events
 */
export interface NavigationEventMap {
  'navigation:file_opened': BaseEventPayload<NavigationEventPayload>;
  'navigation:file_closed': BaseEventPayload<NavigationEventPayload>;
  'navigation:panel_switched': BaseEventPayload<NavigationEventPayload>;
  'navigation:sidebar_tab_changed': BaseEventPayload<NavigationEventPayload>;
  'navigation:directory_changed': BaseEventPayload<NavigationEventPayload>;
}

/**
 * Combined type-safe event map for all sync events
 */
export interface SyncEventMap extends FileEventMap, TerminalEventMap, NavigationEventMap {}

// =============================================================================
// Event Listener Types
// =============================================================================

/**
 * Generic event listener type
 */
export type SyncEventListener<T = unknown> = (payload: BaseEventPayload<T>) => void;

/**
 * Event listener for typed events
 */
export type TypedEventListener<K extends SyncEventType> = (payload: SyncEventMap[K]) => void;

// =============================================================================
// Event Builder Utilities
// =============================================================================

/**
 * Options for creating event payloads
 */
export interface EventOptions<T> {
  /** Event type */
  type: SyncEventType;
  /** Source identifier */
  source: string;
  /** Event data */
  data: T;
  /** Optional namespace */
  namespace?: string;
}

/**
 * Create a typed event payload
 */
export function createEventPayload<T>(
  type: SyncEventType,
  data: T,
  source: string,
  namespace?: string
): BaseEventPayload<T> {
  return {
    type,
    timestamp: Date.now(),
    data,
    source,
    namespace,
  };
}

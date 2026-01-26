/**
 * @fileoverview File Event Bus - Typed Event System for File CRUD Operations
 * @module infrastructure/events/file-event-bus
 *
 * **EPIC-0.5-02**: EventBus for File CRUD Sync
 *
 * Type-safe event bus for file system CRUD operations.
 * Wraps EventEmitter3 with strongly-typed file events.
 *
 * Provides:
 * - Type-safe event emission for file CRUD operations
 * - Subscription to specific file event types
 * - Wildcard subscription to all file events
 * - Event filtering by project, path, or source
 *
 * @epic EPIC-0.5-02
 * @story 0.5-02-B
 * @team Team B
 * @created 2026-01-26
 */

import EventEmitter3 from 'eventemitter3';
import type {
  FileEvent,
  FileEventType,
  FileEventSource,
  FileEventBusEvents,
  FileEventHandler,
  FileEventSubscriberOptions,
  FileCreatedEvent,
  FileUpdatedEvent,
  FileDeletedEvent,
  FileMovedEvent,
  FileRenamedEvent,
} from './types';

// ============================================================================
// FileEventBus Class
// ============================================================================

/**
 * FileEventBus
 *
 * Type-safe event bus for file system CRUD operations.
 * Uses composition pattern with EventEmitter3.
 *
 * @example
 * ```ts
 * // Emit a file updated event
 * fileEventBus.emitFileUpdated({
 *   path: '/src/components/Header.tsx',
 *   projectId: 'project-123',
 *   timestamp: Date.now(),
 *   source: 'user',
 *   content: 'export default function Header() {}',
 *   size: 45,
 * });
 *
 * // Subscribe to all file events
 * const unsubscribe = fileEventBus.on('file', (event) => {
 *   console.log('File event:', event.type, event.path);
 * });
 *
 * // Subscribe to specific event type
 * fileEventBus.on('file:updated', (event) => {
 *   console.log('File updated:', event.path);
 * });
 * ```
 */
class FileBus {
  private emitter: EventEmitter3;
  private enabled: boolean = true;
  private eventLog: FileEvent[] = [];
  private maxLogSize: number = 500;

  constructor() {
    this.emitter = new EventEmitter3();
  }

  /**
   * Emit a file event
   *
   * @param eventName - Name of the event to emit
   * @param event - File event data
   * @returns true if event had listeners, false otherwise
   */
  emit(eventName: keyof FileEventBusEvents, event: FileEvent): boolean {
    if (!this.enabled) {
      return false;
    }

    // Log event
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    // Emit to wildcard 'file' event for all file operations
    if (eventName !== 'file') {
      this.emitter.emit('file', event);
    }

    // Emit to specific event type
    return this.emitter.emit(eventName, event);
  }

  /**
   * Emit file created event
   *
   * @param event - File created event data
   */
  emitFileCreated(event: Omit<FileCreatedEvent, 'type'>): void {
    const fullEvent: FileCreatedEvent = {
      ...event,
      type: 'FILE_CREATED',
    };
    this.emit('file:created', fullEvent);
    this.emit('file', fullEvent);
  }

  /**
   * Emit file updated event
   *
   * @param event - File updated event data
   */
  emitFileUpdated(event: Omit<FileUpdatedEvent, 'type'>): void {
    const fullEvent: FileUpdatedEvent = {
      ...event,
      type: 'FILE_UPDATED',
    };
    this.emit('file:updated', fullEvent);
    this.emit('file', fullEvent);
  }

  /**
   * Emit file deleted event
   *
   * @param event - File deleted event data
   */
  emitFileDeleted(event: Omit<FileDeletedEvent, 'type'>): void {
    const fullEvent: FileDeletedEvent = {
      ...event,
      type: 'FILE_DELETED',
    };
    this.emit('file:deleted', fullEvent);
    this.emit('file', fullEvent);
  }

  /**
   * Emit file moved event
   *
   * @param event - File moved event data
   */
  emitFileMoved(event: Omit<FileMovedEvent, 'type'>): void {
    if (!event.oldPath) {
      throw new Error('FILE_MOVED event requires oldPath');
    }
    const fullEvent: FileMovedEvent = {
      ...event,
      type: 'FILE_MOVED',
      oldPath: event.oldPath,
    };
    this.emit('file:moved', fullEvent);
    this.emit('file', fullEvent);
  }

  /**
   * Emit file renamed event
   *
   * @param event - File renamed event data
   */
  emitFileRenamed(event: Omit<FileRenamedEvent, 'type'>): void {
    if (!event.oldPath) {
      throw new Error('FILE_RENAMED event requires oldPath');
    }
    const fullEvent: FileRenamedEvent = {
      ...event,
      type: 'FILE_RENAMED',
      oldPath: event.oldPath,
    };
    this.emit('file:renamed', fullEvent);
    this.emit('file', fullEvent);
  }

  /**
   * Subscribe to file events
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on(
    eventName: keyof FileEventBusEvents,
    handler: (event: FileEvent) => void
  ): () => void {
    this.emitter.on(eventName, handler);
    return () => {
      this.emitter.off(eventName, handler);
    };
  }

  /**
   * Subscribe to file events with options
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Event handler function
   * @param options - Subscriber options (filter, projectId, etc.)
   * @returns Unsubscribe function
   */
  onWithFilter(
    eventName: keyof FileEventBusEvents,
    handler: (event: FileEvent) => void,
    options: FileEventSubscriberOptions = {}
  ): () => void {
    const filteredHandler = (event: FileEvent) => {
      // Apply project filter
      if (options.allProjects !== true && options.projectId) {
        if (event.projectId !== options.projectId) {
          return;
        }
      }

      // Apply event type filter
      if (options.eventTypes && options.eventTypes.length > 0) {
        if (!options.eventTypes.includes(event.type)) {
          return;
        }
      }

      // Apply custom filter
      if (options.filter && !options.filter(event)) {
        return;
      }

      handler(event);
    };

    return this.on(eventName, filteredHandler);
  }

  /**
   * Subscribe once (auto-unsubscribe after first call)
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Event handler function
   */
  once(
    eventName: keyof FileEventBusEvents,
    handler: (event: FileEvent) => void
  ): void {
    this.emitter.once(eventName, handler);
  }

  /**
   * Remove all listeners for an event or all events
   *
   * @param eventName - Optional event name to clear
   */
  removeAllListeners(eventName?: keyof FileEventBusEvents): void {
    if (eventName) {
      this.emitter.removeAllListeners(eventName);
    } else {
      this.emitter.removeAllListeners();
    }
  }

  /**
   * Get event log
   *
   * @param filterEventType - Optional event type filter
   * @returns Array of logged events
   */
  getEventLog(filterEventType?: FileEventType): FileEvent[] {
    if (filterEventType) {
      return this.eventLog.filter(event => event.type === filterEventType);
    }
    return [...this.eventLog];
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Get subscriber count for an event
   *
   * @param eventName - Event name
   * @returns Number of subscribers
   */
  getSubscriberCount(eventName: keyof FileEventBusEvents): number {
    return this.emitter.listenerCount(eventName);
  }

  /**
   * Check if event has subscribers
   *
   * @param eventName - Event name
   * @returns True if event has subscribers
   */
  hasSubscribers(eventName: keyof FileEventBusEvents): boolean {
    return this.getSubscriberCount(eventName) > 0;
  }

  /**
   * Enable or disable event emission
   *
   * @param enabled - Whether to enable event emission
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if event bus is enabled
   *
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * File Event Bus Singleton
 *
 * Global instance of the file event bus.
 * Use this for all file event emissions and subscriptions.
 *
 * @example
 * ```ts
 * import { fileEventBus } from '@/infrastructure/events/file-event-bus';
 *
 * // Emit event
 * fileEventBus.emitFileUpdated({
 *   path: '/src/file.ts',
 *   projectId: 'project-123',
 *   timestamp: Date.now(),
 *   source: 'user',
 * });
 *
 * // Subscribe to events
 * const unsubscribe = fileEventBus.on('file:updated', (event) => {
 *   console.log('File updated:', event.path);
 * });
 * ```
 */
export const fileEventBus = new FileBus();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Emit file created event
 *
 * Convenience function for creating and emitting a FILE_CREATED event.
 *
 * @param path - File path
 * @param projectId - Project ID
 * @param source - Event source
 * @param content - Optional file content
 * @param size - Optional file size
 */
export function emitFileCreated(
  path: string,
  projectId: string,
  source: FileEventSource = 'user',
  content?: string,
  size?: number
): void {
  fileEventBus.emitFileCreated({
    path,
    projectId,
    timestamp: Date.now(),
    source,
    content,
    size,
  });
}

/**
 * Emit file updated event
 *
 * Convenience function for creating and emitting a FILE_UPDATED event.
 *
 * @param path - File path
 * @param projectId - Project ID
 * @param source - Event source
 * @param content - Optional file content
 * @param size - Optional file size
 */
export function emitFileUpdated(
  path: string,
  projectId: string,
  source: FileEventSource = 'user',
  content?: string,
  size?: number
): void {
  fileEventBus.emitFileUpdated({
    path,
    projectId,
    timestamp: Date.now(),
    source,
    content,
    size,
  });
}

/**
 * Emit file deleted event
 *
 * Convenience function for creating and emitting a FILE_DELETED event.
 *
 * @param path - File path
 * @param projectId - Project ID
 * @param source - Event source
 */
export function emitFileDeleted(
  path: string,
  projectId: string,
  source: FileEventSource = 'user'
): void {
  fileEventBus.emitFileDeleted({
    path,
    projectId,
    timestamp: Date.now(),
    source,
  });
}

/**
 * Emit file moved event
 *
 * Convenience function for creating and emitting a FILE_MOVED event.
 *
 * @param oldPath - Original file path
 * @param newPath - New file path
 * @param projectId - Project ID
 * @param source - Event source
 */
export function emitFileMoved(
  oldPath: string,
  newPath: string,
  projectId: string,
  source: FileEventSource = 'user'
): void {
  fileEventBus.emitFileMoved({
    path: newPath,
    oldPath,
    projectId,
    timestamp: Date.now(),
    source,
  });
}

/**
 * Emit file renamed event
 *
 * Convenience function for creating and emitting a FILE_RENAMED event.
 *
 * @param oldPath - Original file path
 * @param newPath - New file path
 * @param projectId - Project ID
 * @param source - Event source
 */
export function emitFileRenamed(
  oldPath: string,
  newPath: string,
  projectId: string,
  source: FileEventSource = 'user'
): void {
  fileEventBus.emitFileRenamed({
    path: newPath,
    oldPath,
    projectId,
    timestamp: Date.now(),
    source,
  });
}

// ============================================================================
// React Hook Integration
// ============================================================================

/**
 * File Event Bus Hook Options
 *
 * Options for the useFileEventBus hook.
 */
export interface UseFileEventBusOptions {
  /** Event name to subscribe to */
  eventName: keyof FileEventBusEvents;

  /** Project ID filter (optional) */
  projectId?: string;

  /** Event types filter (optional) */
  eventTypes?: FileEventType[];

  /** Custom filter function (optional) */
  filter?: (event: FileEvent) => boolean;
}

/**
 * useFileEventBus Hook
 *
 * React hook for subscribing to file events.
 * Handles automatic cleanup on unmount.
 *
 * Note: This returns a subscription function that should be called
 * within a useEffect for proper React integration.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { projectId } = useProjectContext();
 *
 *   useEffect(() => {
 *     const unsubscribe = useFileEventBus({
 *       eventName: 'file:updated',
 *       projectId,
 *       handler: (event) => {
 *         console.log('File updated:', event.path);
 *       }
 *     });
 *     return unsubscribe;
 *   }, [projectId]);
 * }
 * ```
 */
export function useFileEventBus(
  options: UseFileEventBusOptions & { handler: FileEventHandler }
): () => void {
  const { eventName, handler, projectId, eventTypes, filter } = options;

  return fileEventBus.onWithFilter(eventName, handler, {
    projectId,
    eventTypes,
    filter,
    allProjects: projectId === undefined,
  });
}

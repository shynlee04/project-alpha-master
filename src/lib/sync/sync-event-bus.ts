/**
 * Sync Event Bus - Centralized Event Publishing Service
 * 
 * A singleton event bus that provides pub/sub pattern for sync-related events
 * across the IDE. Supports typed events, namespace filtering, and error handling.
 * 
 * @packageDocumentation
 */

import path from 'node:path';
import type {
  SyncEventType,
  SyncEventMap,
  BaseEventPayload,
  FileEventPayload,
  TerminalEventPayload,
  NavigationEventPayload,
  FileEventType,
  TerminalEventType,
  NavigationEventType,
} from './event-types';

/**
 * Default source identifier for the sync event bus
 */
const DEFAULT_SOURCE = 'sync-event-bus';

/**
 * Callback type for event listeners
 */
type EventCallback<K extends SyncEventType> = (payload: SyncEventMap[K]) => void;

/**
 * Options for subscribing to events
 */
export interface SubscribeOptions {
  /** Namespace filter for event filtering */
  namespace?: string;
  /** Whether to only listen once */
  once?: boolean;
}

/**
 * Configuration for the SyncEventBus
 */
export interface SyncEventBusConfig {
  /** Default source identifier */
  defaultSource?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum listeners per event (0 = unlimited) */
  maxListeners?: number;
}

/**
 * SyncEventBus - Centralized event publishing service for sync operations
 * 
 * @example
 * ```typescript
 * import { syncEventBus } from '@/lib/sync';
 * 
 * // Subscribe to file events
 * const unsubscribe = syncEventBus.on('file:created', (payload) => {
 *   console.log('File created:', payload.data.path);
 * });
 * 
 * // Emit a file event
 * syncEventBus.emitFileCreated('/path/to/file.txt');
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */
export class SyncEventBus {
  /** Internal EventEmitter3 instance */
  private emitter: EventEmitter<SyncEventMap>;
  
  /** Default source identifier */
  private defaultSource: string;
  
  /** Debug mode flag */
  private debug: boolean;
  
  /** Namespace separator */
  private readonly namespaceSeparator = ':';
  
  /** Map of namespaces to event types */
  private namespaceEventTypes: Map<string, Set<SyncEventType>>;

  /**
   * Create a new SyncEventBus instance
   * 
   * @param config - Optional configuration
   */
  constructor(config: SyncEventBusConfig = {}) {
    this.emitter = new EventEmitter<SyncEventMap>();
    this.defaultSource = config.defaultSource || DEFAULT_SOURCE;
    this.debug = config.debug || false;
    this.namespaceEventTypes = new Map();
    
    // Set max listeners if specified
    if (config.maxListeners !== undefined && config.maxListeners > 0) {
      this.emitter.setMaxListeners(config.maxListeners);
    }
    
    this.log('SyncEventBus initialized with source:', this.defaultSource);
  }

  // =============================================================================
  // Public API
  // =============================================================================

  /**
   * Subscribe to an event type
   * 
   * @param type - Event type to subscribe to
   * @param callback - Callback function
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  on<K extends SyncEventType>(
    type: K,
    callback: EventCallback<K>,
    options?: SubscribeOptions
  ): () => void {
    if (options?.once) {
      this.emitter.once(type, callback as EventCallback<SyncEventType>);
    } else {
      this.emitter.on(type, callback as EventCallback<SyncEventType>);
    }
    
    // Track namespace
    if (options?.namespace) {
      this.trackNamespace(options.namespace, type);
    }
    
    this.log(`Subscribed to event: ${type}`, options?.namespace ? `namespace: ${options.namespace}` : '');
    
    // Return unsubscribe function
    return () => {
      this.off(type, callback);
      if (options?.namespace) {
        this.untrackNamespace(options.namespace, type);
      }
    };
  }

  /**
   * Subscribe to an event type once
   * 
   * @param type - Event type to subscribe to
   * @param callback - Callback function
   * @param namespace - Optional namespace filter
   * @returns Unsubscribe function
   */
  once<K extends SyncEventType>(
    type: K,
    callback: EventCallback<K>,
    namespace?: string
  ): () => void {
    return this.on(type, callback, { once: true, namespace });
  }

  /**
   * Unsubscribe from an event type
   * 
   * @param type - Event type to unsubscribe from
   * @param callback - Callback function to remove
   */
  off<K extends SyncEventType>(type: K, callback: EventCallback<K>): void {
    this.emitter.off(type, callback as EventCallback<SyncEventType>);
    this.log(`Unsubscribed from event: ${type}`);
  }

  /**
   * Emit an event
   * 
   * @param type - Event type
   * @param payload - Event payload
   */
  emit<K extends SyncEventType>(type: K, payload: BaseEventPayload): void {
    // Create the full event payload
    const eventPayload: SyncEventMap[K] = {
      ...payload,
      type,
      timestamp: payload.timestamp || Date.now(),
      source: payload.source || this.defaultSource,
    };
    
    // Emit to EventEmitter3
    this.emitter.emit(type, eventPayload);
    
    // Emit to namespace subscribers if namespace is set
    if (payload.namespace) {
      this.emitToNamespace(type, eventPayload, payload.namespace);
    }
    
    this.log(`Emitted event: ${type}`, payload.namespace ? `namespace: ${payload.namespace}` : '');
  }

  /**
   * Subscribe to all events matching a namespace prefix
   * 
   * @param namespace - Namespace prefix to filter by
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  onNamespace(
    namespace: string,
    callback: (type: SyncEventType, payload: BaseEventPayload) => void
  ): () => void {
    // Create a wildcard subscription for namespace events
    const wildcardCallback = (type: SyncEventType, payload: BaseEventPayload) => {
      if (payload.namespace?.startsWith(namespace)) {
        callback(type, payload);
      }
    };
    
    // Subscribe to all events
    this.emitter.on('*', wildcardCallback as EventCallback<SyncEventType>);
    
    // Track the namespace
    this.trackNamespace(namespace, '*');
    
    return () => {
      this.emitter.off('*', wildcardCallback as EventCallback<SyncEventType>);
      this.namespaceEventTypes.delete(namespace);
    };
  }

  /**
   * Get the number of listeners for an event type
   * 
   * @param type - Event type
   * @returns Number of listeners
   */
  listenerCount(type: SyncEventType): number {
    return this.emitter.listenerCount(type);
  }

  /**
   * Get all event types with listeners
   * 
   * @returns Array of event types
   */
  eventNames(): SyncEventType[] {
    return this.emitter.eventNames() as SyncEventType[];
  }

  /**
   * Remove all listeners for an event type
   * 
   * @param type - Event type to remove listeners for (optional, removes all if not specified)
   */
  removeAllListeners(type?: SyncEventType): void {
    if (type) {
      this.emitter.removeAllListeners(type);
    } else {
      this.emitter.removeAllListeners();
      this.namespaceEventTypes.clear();
    }
    this.log('Removed all listeners', type ? `for: ${type}` : 'for all events');
  }

  // =============================================================================
  // Convenience Methods for Common Events
  // =============================================================================

  /**
   * Emit a file created event
   * 
   * @param filePath - Path to the created file
   * @param data - Additional file data
   * @param namespace - Optional namespace
   */
  emitFileCreated(
    filePath: string,
    data?: Partial<FileEventPayload>,
    namespace?: string
  ): void {
    const payload = this.createFilePayload(
      'file:created',
      filePath,
      'create',
      data
    );
    this.emit('file:created', { ...payload, namespace });
  }

  /**
   * Emit a file modified event
   * 
   * @param filePath - Path to the modified file
   * @param data - Additional file data
   * @param namespace - Optional namespace
   */
  emitFileModified(
    filePath: string,
    data?: Partial<FileEventPayload>,
    namespace?: string
  ): void {
    const payload = this.createFilePayload(
      'file:modified',
      filePath,
      'modify',
      data
    );
    this.emit('file:modified', { ...payload, namespace });
  }

  /**
   * Emit a file deleted event
   * 
   * @param filePath - Path to the deleted file
   * @param data - Additional file data
   * @param namespace - Optional namespace
   */
  emitFileDeleted(
    filePath: string,
    data?: Partial<FileEventPayload>,
    namespace?: string
  ): void {
    const payload = this.createFilePayload(
      'file:deleted',
      filePath,
      'delete',
      data
    );
    this.emit('file:deleted', { ...payload, namespace });
  }

  /**
   * Emit a terminal output event
   * 
   * @param sessionId - Terminal session ID
   * @param output - Output data
   * @param isError - Whether this is an error stream
   * @param namespace - Optional namespace
   */
  emitTerminalOutput(
    sessionId: string,
    output: string,
    isError: boolean,
    namespace?: string
  ): void {
    const payload: BaseEventPayload<TerminalEventPayload> = {
      type: isError ? 'terminal:error' : 'terminal:output',
      timestamp: Date.now(),
      data: {
        sessionId,
        output,
        isError,
      },
      source: 'terminal-adapter',
      namespace,
    };
    this.emit(isError ? 'terminal:error' : 'terminal:output', payload);
  }

  /**
   * Emit a navigation changed event
   * 
   * @param previousValue - Previous state value
   * @param newValue - New state value
   * @param target - Navigation target
   * @param action - Navigation action
   * @param namespace - Optional namespace
   */
  emitNavigationChanged(
    previousValue: unknown,
    newValue: unknown,
    target: string,
    action: 'open' | 'close' | 'switch' | 'change',
    namespace?: string
  ): void {
    const eventType = this.getNavigationEventType(action);
    const payload: BaseEventPayload<NavigationEventPayload> = {
      type: eventType,
      timestamp: Date.now(),
      data: {
        previousValue,
        newValue,
        target,
        action,
      },
      source: 'navigation-store',
      namespace,
    };
    this.emit(eventType, payload);
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  /**
   * Create a file event payload
   */
  private createFilePayload(
    type: FileEventType,
    filePath: string,
    operation: FileEventPayload['operation'],
    additionalData?: Partial<FileEventPayload>
  ): BaseEventPayload<FileEventPayload> {
    const path = require('path');
    const fileName = path.basename(filePath);
    
    return {
      type,
      timestamp: Date.now(),
      data: {
        path: filePath,
        name: fileName,
        operation,
        ...additionalData,
      },
      source: 'local-fs-adapter',
    };
  }

  /**
   * Get the navigation event type for an action
   */
  private getNavigationEventType(action: NavigationEventPayload['action']): NavigationEventType {
    switch (action) {
      case 'open':
        return 'navigation:file_opened';
      case 'close':
        return 'navigation:file_closed';
      case 'switch':
        return 'navigation:panel_switched';
      case 'change':
        return 'navigation:directory_changed';
      default:
        return 'navigation:file_opened';
    }
  }

  /**
   * Track namespace event subscriptions
   */
  private trackNamespace(namespace: string, type: SyncEventType): void {
    if (!this.namespaceEventTypes.has(namespace)) {
      this.namespaceEventTypes.set(namespace, new Set());
    }
    this.namespaceEventTypes.get(namespace)!.add(type);
  }

  /**
   * Untrack namespace event subscriptions
   */
  private untrackNamespace(namespace: string, type: SyncEventType): void {
    const types = this.namespaceEventTypes.get(namespace);
    if (types) {
      types.delete(type);
      if (types.size === 0) {
        this.namespaceEventTypes.delete(namespace);
      }
    }
  }

  /**
   * Emit events to namespace subscribers
   */
  private emitToNamespace<K extends SyncEventType>(
    type: K,
    payload: SyncEventMap[K],
    namespace: string
  ): void {
    // Check if there are subscribers for this namespace
    const types = this.namespaceEventTypes.get(namespace);
    if (types && (types.has('*') || types.has(type))) {
      // Emit to the wildcard namespace listener
      this.emitter.emit('*', type, payload);
    }
  }

  /**
   * Log debug messages
   */
  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log('[SyncEventBus]', ...args);
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Singleton instance of the SyncEventBus
 */
export const syncEventBus = new SyncEventBus();

// =============================================================================
// Default Exports
// =============================================================================

export type { SubscribeOptions, SyncEventBusConfig, EventCallback };
export { DEFAULT_SOURCE as SYNC_EVENT_BUS_DEFAULT_SOURCE };

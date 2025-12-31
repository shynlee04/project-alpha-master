/**
 * Sync Event Bus Implementation
 * 
 * Centralized event bus for file sync, terminal, and navigation events.
 * Uses EventEmitter3 for pub/sub pattern with type-safe event handling.
 * 
 * @packageDocumentation
 */

import { EventEmitter } from 'eventemitter3';

// =============================================================================
// Event Type Imports
// =============================================================================

import type {
  SyncEventType,
  FileEventType,
  TerminalEventType,
  NavigationEventType,
  BaseEventPayload,
  FileEventPayload,
  TerminalEventPayload,
  NavigationEventPayload,
  SyncEventMap,
  SyncEventListener,
} from './event-types';

// =============================================================================
// Event Bus Interface
// =============================================================================

/**
 * Sync Event Bus - Centralized event management for sync operations
 */
export class SyncEventBus {
  private emitter: EventEmitter;
  private namespace: string;
  private eventCount: number;
  private wildcardListeners: Array<(type: SyncEventType, payload: BaseEventPayload<unknown>) => void>;

  constructor(namespace = 'sync') {
    this.emitter = new EventEmitter();
    this.namespace = namespace;
    this.eventCount = 0;
    this.wildcardListeners = [];
  }

  // ===========================================================================
  // Emit Methods
  // ===========================================================================

  /**
   * Notify all wildcard listeners (internal helper)
   */
  private notifyWildcardListeners(type: SyncEventType, payload: BaseEventPayload<unknown>): void {
    for (const listener of this.wildcardListeners) {
      try {
        listener(type, payload);
      } catch (error) {
        console.error('Wildcard listener error:', error);
      }
    }
  }

  /**
   * Emit a typed file event
   */
  emitFileEvent<K extends FileEventType>(
    type: K,
    payload: BaseEventPayload<FileEventPayload>
  ): void {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.emit(namespacedType, payload);
    this.notifyWildcardListeners(type, payload);
    this.eventCount++;
  }

  /**
   * Emit a typed terminal event
   */
  emitTerminalEvent<K extends TerminalEventType>(
    type: K,
    payload: BaseEventPayload<TerminalEventPayload>
  ): void {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.emit(namespacedType, payload);
    this.notifyWildcardListeners(type, payload);
    this.eventCount++;
  }

  /**
   * Emit a typed navigation event
   */
  emitNavigationEvent<K extends NavigationEventType>(
    type: K,
    payload: BaseEventPayload<NavigationEventPayload>
  ): void {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.emit(namespacedType, payload);
    this.notifyWildcardListeners(type, payload);
    this.eventCount++;
  }

  /**
   * Emit a generic sync event (for any sync event type)
   */
  emit<K extends SyncEventType>(type: K, payload: BaseEventPayload<unknown>): void {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.emit(namespacedType, payload);
    this.notifyWildcardListeners(type, payload);
    this.eventCount++;
  }

  /**
   * Emit an event with custom data
   */
  emitEvent(type: SyncEventType, data: unknown, source: string): void {
    const payload: BaseEventPayload<unknown> = {
      type,
      timestamp: Date.now(),
      data,
      source,
      namespace: this.namespace,
    };
    this.emit(type, payload);
  }

  // ===========================================================================
  // On Methods
  // ===========================================================================

  /**
   * Subscribe to a specific event type
   */
  on<K extends SyncEventType>(
    type: K,
    listener: (payload: SyncEventMap[K]) => void
  ): this {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.on(namespacedType, listener as SyncEventListener);
    return this;
  }

  /**
   * Subscribe to a file event
   */
  onFileEvent<K extends FileEventType>(
    type: K,
    listener: (payload: BaseEventPayload<FileEventPayload>) => void
  ): this {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.on(namespacedType, listener);
    return this;
  }

  /**
   * Subscribe to a terminal event
   */
  onTerminalEvent<K extends TerminalEventType>(
    type: K,
    listener: (payload: BaseEventPayload<TerminalEventPayload>) => void
  ): this {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.on(namespacedType, listener);
    return this;
  }

  /**
   * Subscribe to a navigation event
   */
  onNavigationEvent<K extends NavigationEventType>(
    type: K,
    listener: (payload: BaseEventPayload<NavigationEventPayload>) => void
  ): this {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.on(namespacedType, listener);
    return this;
  }

  /**
   * Subscribe to all events (wildcard listener)
   * Note: EventEmitter3 doesn't support wildcard '*', so we track these manually
   */
  onAny(listener: (type: SyncEventType, payload: BaseEventPayload<unknown>) => void): this {
    this.wildcardListeners.push(listener);
    return this;
  }

  // ===========================================================================
  // Once Methods
  // ===========================================================================

  /**
   * Subscribe to an event once (auto-unsubscribes after first emit)
   */
  once<K extends SyncEventType>(
    type: K,
    listener: (payload: SyncEventMap[K]) => void
  ): this {
    const namespacedType = this.getNamespacedType(type);
    this.emitter.once(namespacedType, listener as SyncEventListener);
    return this;
  }

  // ===========================================================================
  // Off Methods
  // ===========================================================================

  /**
   * Unsubscribe from a specific event
   */
  off<K extends SyncEventType>(
    type: K,
    listener?: (payload: SyncEventMap[K]) => void
  ): this {
    const namespacedType = this.getNamespacedType(type);
    if (listener) {
      this.emitter.off(namespacedType, listener as SyncEventListener);
    } else {
      this.emitter.off(namespacedType);
    }
    return this;
  }

  /**
   * Remove wildcard listener
   */
  offAny(listener?: (type: SyncEventType, payload: BaseEventPayload<unknown>) => void): this {
    if (listener) {
      const idx = this.wildcardListeners.indexOf(listener);
      if (idx >= 0) {
        this.wildcardListeners.splice(idx, 1);
      }
    } else {
      this.wildcardListeners = [];
    }
    return this;
  }

  /**
   * Remove all listeners for this event bus
   */
  removeAllListeners(): this {
    this.emitter.removeAllListeners();
    return this;
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Get the namespaced type for internal event handling
   */
  private getNamespacedType(type: SyncEventType): string {
    return `${this.namespace}:${type}`;
  }

  /**
   * Get listener count for a specific event
   */
  listenerCount(type: SyncEventType): number {
    const namespacedType = this.getNamespacedType(type);
    return this.emitter.listenerCount(namespacedType);
  }

  /**
   * Get total event count (for debugging/metrics)
   */
  getEventCount(): number {
    return this.eventCount;
  }

  /**
   * Get event types with listeners
   */
  getActiveEventTypes(): SyncEventType[] {
    // EventEmitter3 doesn't expose event types directly
    // This is a placeholder that returns empty array
    // In a more complete implementation, we'd track this ourselves
    return [];
  }

  /**
   * Check if event bus has listeners
   */
  hasListeners(): boolean {
    return this.listenerCount() > 0;
  }

  /**
   * Get the namespace for this event bus
   */
  getNamespace(): string {
    return this.namespace;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let syncEventBusInstance: SyncEventBus | null = null;

/**
 * Get or create the singleton SyncEventBus instance
 */
export function getSyncEventBus(): SyncEventBus {
  if (!syncEventBusInstance) {
    syncEventBusInstance = new SyncEventBus('sync');
  }
  return syncEventBusInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetSyncEventBus(): void {
  syncEventBusInstance?.removeAllListeners();
  syncEventBusInstance = null;
}

// =============================================================================
// Named Exports for Convenience
// =============================================================================

/**
 * Default source identifier for sync events
 */
export const SYNC_EVENT_BUS_DEFAULT_SOURCE = 'sync-event-bus';

/**
 * Create a new SyncEventBus instance (convenience alias for new SyncEventBus)
 */
export function createSyncEventBus(namespace?: string): SyncEventBus {
  return new SyncEventBus(namespace);
}

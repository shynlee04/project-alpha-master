/**
 * @fileoverview Sync Event Bus Implementation
 * @module infrastructure/sync/core/sync-event-bus
 *
 * Core event bus for sync operations.
 * Components subscribe to specific event types and receive updates.
 */

import type {
  EventEmitter,
  SyncEvent,
  SyncEventData,
  SyncEventType,
} from './sync-types';

// ============================================================================
// Event Handler Type
// ============================================================================

/**
 * Event handler function type
 */
export type EventHandler = (data: SyncEventData) => void;

/**
 * Event listener with optional filter
 */
export interface EventListener {
  handler: EventHandler;
  filter?: (data: SyncEventData) => boolean;
  once?: boolean;
}

// ============================================================================
// SyncEventBus Implementation
// ============================================================================

/**
 * SyncEventBus - Event emitter for sync operations
 *
 * Provides a centralized event bus for all sync-related events.
 * Components can subscribe to specific event types and receive updates.
 *
 * **Integration with Zustand Store:**
 * ```ts
 * // In SyncEngine, emit events:
 * SyncEventBus.emit('sync:progress', {
 *   current: 5,
 *   total: 100,
 *   percentage: 5,
 * });
 *
 * // In component or store, subscribe:
 * const unsubscribe = SyncEventBus.on('sync:progress', (data) => {
 *   setFileSyncProgress(data.current, data.total);
 * });
 * ```
 */
export class SyncEventBus implements EventEmitter {
  private listeners: Map<SyncEventType, Set<EventListener>> = new Map();
  private wildcardListeners: Set<EventListener> = new Set();
  private eventHistory: SyncEvent[] = [];
  private maxHistorySize = 100;
  private debugMode = false;

  /**
   * Emit a sync event
   * @param type - Event type
   * @param data - Event data
   */
  emit(type: SyncEventType, data: SyncEventData): void {
    const event: SyncEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    // Add to history (circular buffer)
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Debug logging
    if (this.debugMode) {
      console.log(`[SyncEventBus] ${type}`, data);
    }

    // Notify type-specific listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const toRemove: EventListener[] = [];
      for (const listener of typeListeners) {
        if (listener.filter && !listener.filter(data)) {
          continue;
        }
        listener.handler(data);
        if (listener.once) {
          toRemove.push(listener);
        }
      }
      // Remove once listeners
      for (const listener of toRemove) {
        typeListeners.delete(listener);
      }
    }

    // Notify wildcard listeners
    for (const listener of this.wildcardListeners) {
      if (listener.filter && !listener.filter(event as unknown as SyncEventData)) {
        continue;
      }
      // Wildcard handlers receive full SyncEvent, not just data
      (listener.handler as unknown as (event: SyncEvent) => void)(event);
    }
  }

  /**
   * Subscribe to events of a specific type
   * @param type - Event type to listen for
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on(type: SyncEventType, handler: EventHandler): () => void {
    const listener: EventListener = { handler };

    let typeListeners = this.listeners.get(type);
    if (!typeListeners) {
      typeListeners = new Set();
      this.listeners.set(type, typeListeners);
    }
    typeListeners.add(listener);

    // Return unsubscribe function
    return () => {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  /**
   * Subscribe to all events (wildcard)
   * @param handler - Event handler function (receives full SyncEvent)
   * @returns Unsubscribe function
   */
  onAll(handler: (event: SyncEvent) => void): () => void {
    const listener: EventListener = {
      // Cast via unknown since wildcard handler receives SyncEvent, not SyncEventData
      handler: handler as unknown as EventHandler,
    };
    this.wildcardListeners.add(listener);

    return () => {
      this.wildcardListeners.delete(listener);
    };
  }

  /**
   * Subscribe to event with filter
   * @param type - Event type
   * @param filter - Filter function
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  onFiltered(
    type: SyncEventType,
    filter: (data: SyncEventData) => boolean,
    handler: EventHandler
  ): () => void {
    const listener: EventListener = { handler, filter };

    let typeListeners = this.listeners.get(type);
    if (!typeListeners) {
      typeListeners = new Set();
      this.listeners.set(type, typeListeners);
    }
    typeListeners.add(listener);

    return () => {
      typeListeners.delete(listener);
    };
  }

  /**
   * Subscribe to event for one-time emission
   * @param type - Event type
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  once(type: SyncEventType, handler: EventHandler): () => void {
    const listener: EventListener = { handler, once: true };

    let typeListeners = this.listeners.get(type);
    if (!typeListeners) {
      typeListeners = new Set();
      this.listeners.set(type, typeListeners);
    }
    typeListeners.add(listener);

    return () => {
      typeListeners.delete(listener);
    };
  }

  /**
   * Remove all listeners for a specific type
   * @param type - Event type
   */
  removeAllListeners(type?: SyncEventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
      this.wildcardListeners.clear();
    }
  }

  /**
   * Get event history
   * @param type - Optional event type filter
   * @param limit - Optional limit on number of events
   * @returns Array of past events
   */
  getHistory(type?: SyncEventType, limit?: number): SyncEvent[] {
    let history = this.eventHistory;
    if (type) {
      history = history.filter(e => e.type === type);
    }
    if (limit) {
      history = history.slice(-limit);
    }
    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable debug mode
   * @param enabled - Whether to enable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Get listener count for an event type
   * @param type - Event type
   * @returns Number of active listeners
   */
  listenerCount(type?: SyncEventType): number {
    if (type) {
      return this.listeners.get(type)?.size ?? 0;
    }
    let count = this.wildcardListeners.size;
    for (const listeners of this.listeners.values()) {
      count += listeners.size;
    }
    return count;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global sync event bus instance
 * Use this instance throughout the application for sync events
 */
export const syncEventBus = new SyncEventBus();

export default syncEventBus;

/**
 * @fileoverview Domain Event Bus
 * @module infrastructure/events/domain-event-bus
 *
 * Simple pub/sub event bus for cross-operator communication.
 * Enables loose coupling between Platform Operators.
 *
 * Key features:
 * - Type-safe event handling with DomainEventMap
 * - Unsubscribe function returned from on()
 * - Source tracking for debugging event chains
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import type {
  DomainEvent,
  DomainEventType,
  DomainEventMap,
} from '@/domain/types/domain-events';

// ============================================================================
// Types
// ============================================================================

/**
 * Event handler function type
 */
type EventHandler<T> = (event: DomainEvent<T>) => void;

/**
 * Unsubscribe function returned from on()
 */
type Unsubscribe = () => void;

// ============================================================================
// Domain Event Bus
// ============================================================================

/**
 * DomainEventBus - Cross-operator communication
 *
 * Simple pub/sub implementation for domain events.
 * Platform Operators use this to communicate without direct coupling.
 *
 * @example
 * ```typescript
 * // Subscribe to file events
 * const unsubscribe = domainEventBus.on('file:created', (event) => {
 *   console.log('File created:', event.payload.path);
 *   // Update file tree, sync state, etc.
 * });
 *
 * // Emit an event
 * domainEventBus.emit('file:created', {
 *   projectId: 'proj-123',
 *   path: 'src/app.ts',
 *   content: 'export const app = {}'
 * }, 'FileService');
 *
 * // Later: cleanup
 * unsubscribe();
 * ```
 */
export class DomainEventBus {
  /**
   * Map of event type to set of handlers
   */
  private handlers = new Map<DomainEventType, Set<EventHandler<unknown>>>();

  /**
   * Debug mode flag for logging
   */
  private debugMode = false;

  /**
   * Enable or disable debug logging
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Emit a domain event
   *
   * @param type - Event type
   * @param payload - Event payload
   * @param source - Source operator/service name (default: 'unknown')
   */
  emit<K extends DomainEventType>(
    type: K,
    payload: DomainEventMap[K],
    source: string = 'unknown'
  ): void {
    const event: DomainEvent<DomainEventMap[K]> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
    };

    if (this.debugMode) {
      console.log('[DomainEventBus] emit:', type, 'from:', source, payload);
    }

    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.forEach((handler) => {
        try {
          handler(event as DomainEvent<unknown>);
        } catch (error) {
          console.error(
            `[DomainEventBus] Error in handler for ${type}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Subscribe to a domain event type
   *
   * @param type - Event type to subscribe to
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  on<K extends DomainEventType>(
    type: K,
    handler: EventHandler<DomainEventMap[K]>
  ): Unsubscribe {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    const typedHandler = handler as EventHandler<unknown>;
    this.handlers.get(type)!.add(typedHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(typedHandler);
    };
  }

  /**
   * Unsubscribe a specific handler from an event type
   *
   * @param type - Event type
   * @param handler - Handler to remove
   */
  off<K extends DomainEventType>(
    type: K,
    handler: EventHandler<DomainEventMap[K]>
  ): void {
    const typedHandler = handler as EventHandler<unknown>;
    this.handlers.get(type)?.delete(typedHandler);
  }

  /**
   * Subscribe to an event type once (auto-unsubscribe after first event)
   *
   * @param type - Event type
   * @param handler - Handler function
   * @returns Unsubscribe function (can call to cancel before event fires)
   */
  once<K extends DomainEventType>(
    type: K,
    handler: EventHandler<DomainEventMap[K]>
  ): Unsubscribe {
    const wrappedHandler: EventHandler<DomainEventMap[K]> = (event) => {
      unsubscribe();
      handler(event);
    };
    const unsubscribe = this.on(type, wrappedHandler);
    return unsubscribe;
  }

  /**
   * Remove all handlers for a specific event type
   *
   * @param type - Event type to clear
   */
  clear(type: DomainEventType): void {
    this.handlers.delete(type);
  }

  /**
   * Remove all handlers for all event types
   */
  clearAll(): void {
    this.handlers.clear();
  }

  /**
   * Get the number of handlers for a specific event type
   * (Useful for testing/debugging)
   */
  getHandlerCount(type: DomainEventType): number {
    return this.handlers.get(type)?.size ?? 0;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global domain event bus instance
 *
 * Use this singleton for cross-operator communication.
 * Platform Operators subscribe on init() and unsubscribe on destroy().
 */
export const domainEventBus = new DomainEventBus();

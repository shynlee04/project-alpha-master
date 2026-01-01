/**
 * @fileoverview Event Bus Infrastructure
 * @module infrastructure/events/event-bus
 * @governance Architectural Specification v3.0
 *
 * Cross-cutting event system for state coordination across stores.
 * Implements publish-subscribe pattern for domain events.
 */

import EventEmitter from 'eventemitter3';

/**
 * Domain Event Types
 *
 * Categorized by domain:
 * - Workspace: Workspace transitions and state changes
 * - Agent: Agent selection and configuration
 * - Conversation: Chat and thread management
 * - Provider: LLM provider configuration
 * - Sync: File synchronization
 * - RAG: Knowledge synthesis operations (embedding, chunking, indexing)
 */
export enum DomainEventType {
  // Workspace events
  WORKSPACE_TRANSITION_STARTED = 'workspace:transition:started',
  WORKSPACE_TRANSITION_COMPLETED = 'workspace:transition:completed',
  WORKSPACE_TRANSITION_FAILED = 'workspace:transition:failed',
  WORKSPACE_CHANGED = 'workspace:changed',

  // Agent events
  AGENT_SELECTED = 'agent:selected',
  AGENT_DESELECTED = 'agent:deselected',
  DEFAULT_AGENT_CHANGED = 'agent:default:changed',
  AGENT_CONFIG_UPDATED = 'agent:config:updated',
  AGENT_CREATED = 'agent:created',
  AGENT_DELETED = 'agent:deleted',

  // Conversation events
  CONVERSATION_CREATED = 'conversation:created',
  CONVERSATION_DELETED = 'conversation:deleted',
  CONVERSATION_MESSAGE_ADDED = 'conversation:message:added',
  CONVERSATION_TITLE_UPDATED = 'conversation:title:updated',

  // Provider events
  PROVIDER_KEY_SET = 'provider:key:set',
  PROVIDER_KEY_REMOVED = 'provider:key:removed',
  PROVIDER_MODELS_FETCHED = 'provider:models:fetched',
  PROVIDER_ERROR = 'provider:error',

  // Sync events
  SYNC_STARTED = 'sync:started',
  SYNC_COMPLETED = 'sync:completed',
  SYNC_FAILED = 'sync:failed',
  SYNC_PROGRESS = 'sync:progress',

  // File events
  FILE_OPENED = 'file:opened',
  FILE_CLOSED = 'file:closed',
  FILE_SAVED = 'file:saved',
  FILE_SYNCED = 'file:synced',

  // RAG events (Iteration 15 - Knowledge synthesis operations)
  RAG_EMBEDDING_PROGRESS = 'rag:embedding:progress',
  RAG_CHUNKING_STATUS = 'rag:chunking:status',
  RAG_DATABASE_INDEXING = 'rag:database:indexing',
  RAG_SOURCE_PROCESSING = 'rag:source:processing'
}

/**
 * Domain Event Interface
 *
 * All domain events follow this structure for consistency and debugging.
 */
export interface DomainEvent<T = unknown> {
  type: DomainEventType;
  payload: T;
  timestamp: number;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Event Handler Type
 *
 * Type definition for event handler functions.
 */
export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

/**
 * RAG Activity Status
 *
 * Status types for RAG operation progress tracking.
 */
export type RAGActivityStatus = 'idle' | 'running' | 'completed' | 'error';

/**
 * RAG Progress Event Payload
 *
 * Common payload structure for RAG operation progress events.
 * Matches ActivityState interface from activity indicators.
 */
export interface RAGProgressPayload {
  status: RAGActivityStatus;
  progress?: number; // 0-100 percentage
  current?: number; // Current item count
  total?: number; // Total item count
  message?: string; // Status message
  error?: string; // Error message if status is 'error'
  documentId?: string; // Optional document identifier
  sourceId?: string; // Optional source identifier
}

/**
 * Event Bus Configuration
 */
export interface EventBusConfig {
  enableEventLog?: boolean;
  maxEventLogSize?: number;
  enableDebugLogging?: boolean;
}

/**
 * Event Bus
 *
 * Central event system for cross-store communication.
 * Implements publish-subscribe pattern with event logging.
 *
 * Features:
 * - Type-safe event emission and handling
 * - Event correlation for request/response tracking
 * - Event log for debugging
 * - Unsubscribe capability
 *
 * @example
 * ```ts
 * // Subscribe to event
 * const unsubscribe = eventBus.on(
 *   DomainEventType.WORKSPACE_CHANGED,
 *   (event) => {
 *     console.log('Workspace changed to:', event.payload.workspaceType);
 *   }
 * );
 *
 * // Emit event
 * eventBus.emit(
 *   DomainEventType.WORKSPACE_CHANGED,
 *   { workspaceType: 'knowledge' },
 *   'correlation-123'
 * );
 *
 * // Unsubscribe
 * unsubscribe();
 * ```
 */
export class EventBus {
  private emitter: EventEmitter;
  private eventLog: DomainEvent[] = [];
  private config: Required<EventBusConfig>;

  constructor(config: EventBusConfig = {}) {
    this.emitter = new EventEmitter();
    this.config = {
      enableEventLog: config.enableEventLog ?? true,
      maxEventLogSize: config.maxEventLogSize ?? 1000,
      enableDebugLogging: config.enableDebugLogging ?? false
    };
  }

  /**
   * Emit event to all subscribers
   *
   * @param eventType - Type of event to emit
   * @param payload - Event payload
   * @param correlationId - Optional correlation ID for tracking
   * @param metadata - Optional metadata
   */
  emit<T>(
    eventType: DomainEventType,
    payload: T,
    correlationId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: DomainEvent<T> = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      correlationId,
      metadata
    };

    // Log event if enabled
    if (this.config.enableEventLog) {
      this.eventLog.push(event);

      // Trim log if exceeds max size
      if (this.eventLog.length > this.config.maxEventLogSize) {
        this.eventLog = this.eventLog.slice(-this.config.maxEventLogSize);
      }
    }

    // Debug logging
    if (this.config.enableDebugLogging) {
      console.debug(`[EventBus] Emit: ${eventType}`, event);
    }

    // Emit to subscribers
    this.emitter.emit(eventType, event);
  }

  /**
   * Subscribe to event
   *
   * @param eventType - Type of event to subscribe to
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on<T>(
    eventType: DomainEventType,
    handler: EventHandler<T>
  ): () => void {
    this.emitter.on(eventType, handler);

    // Return unsubscribe function
    return () => {
      this.emitter.off(eventType, handler);
    };
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first call)
   *
   * @param eventType - Type of event to subscribe to
   * @param handler - Event handler function
   */
  once<T>(eventType: DomainEventType, handler: EventHandler<T>): void {
    this.emitter.once(eventType, handler);
  }

  /**
   * Remove all subscribers for event type
   *
   * @param eventType - Type of event to clear
   */
  removeAllListeners(eventType?: DomainEventType): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType);
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
  getEventLog(filterEventType?: DomainEventType): DomainEvent[] {
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
   * Get subscriber count for event type
   *
   * @param eventType - Event type
   * @returns Number of subscribers
   */
  getSubscriberCount(eventType: DomainEventType): number {
    return this.emitter.listenerCount(eventType);
  }

  /**
   * Check if event has subscribers
   *
   * @param eventType - Event type
   * @returns True if event has subscribers
   */
  hasSubscribers(eventType: DomainEventType): boolean {
    return this.getSubscriberCount(eventType) > 0;
  }

  /**
   * Wait for event (promise-based)
   *
   * @param eventType - Event type to wait for
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise that resolves with event payload
   */
  waitFor<T>(
    eventType: DomainEventType,
    timeout?: number
  ): Promise<DomainEvent<T>> {
    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout | null = null;
      let unsubscribe: (() => void) | null = null;

      const handler: EventHandler<T> = (event) => {
        if (timer) clearTimeout(timer);
        if (unsubscribe) unsubscribe();
        resolve(event);
      };

      unsubscribe = this.on<T>(eventType, handler);

      if (timeout) {
        timer = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          reject(new Error(`Timeout waiting for event: ${eventType}`));
        }, timeout);
      }
    });
  }

  /**
   * Emit RAG embedding progress event
   *
   * Type-safe helper for RAG embedding progress events.
   *
   * @param payload - RAG progress payload
   * @param correlationId - Optional correlation ID
   */
  emitRAGEmbeddingProgress(
    payload: RAGProgressPayload,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.RAG_EMBEDDING_PROGRESS,
      payload,
      correlationId
    );
  }

  /**
   * Emit RAG chunking status event
   *
   * Type-safe helper for RAG chunking status events.
   *
   * @param payload - RAG progress payload
   * @param correlationId - Optional correlation ID
   */
  emitRAGChunkingStatus(
    payload: RAGProgressPayload,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.RAG_CHUNKING_STATUS,
      payload,
      correlationId
    );
  }

  /**
   * Emit RAG database indexing event
   *
   * Type-safe helper for RAG database indexing events.
   *
   * @param payload - RAG progress payload
   * @param correlationId - Optional correlation ID
   */
  emitRAGDatabaseIndexing(
    payload: RAGProgressPayload,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.RAG_DATABASE_INDEXING,
      payload,
      correlationId
    );
  }

  /**
   * Emit RAG source processing event
   *
   * Type-safe helper for RAG source processing events.
   *
   * @param payload - RAG progress payload
   * @param correlationId - Optional correlation ID
   */
  emitRAGSourceProcessing(
    payload: RAGProgressPayload,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.RAG_SOURCE_PROCESSING,
      payload,
      correlationId
    );
  }
}

/**
 * Singleton event bus instance
 *
 * Use this instance for all event emissions and subscriptions.
 *
 * @example
 * ```ts
 * import { eventBus } from '@/infrastructure/events/event-bus';
 *
 * eventBus.emit(DomainEventType.WORKSPACE_CHANGED, { workspaceType: 'ide' });
 * ```
 */
export const eventBus = new EventBus({
  enableEventLog: true,
  maxEventLogSize: 1000,
  enableDebugLogging: process.env.NODE_ENV === 'development'
});

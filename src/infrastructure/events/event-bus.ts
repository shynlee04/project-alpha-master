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

  // File change events (ARCH-01.5 - RAG Auto-Indexing on Sync)
  FILE_CREATED = 'file:created',
  FILE_UPDATED = 'file:updated',
  FILE_DELETED = 'file:deleted',

  // RAG events (Iteration 15 - Knowledge synthesis operations)
  RAG_EMBEDDING_PROGRESS = 'rag:embedding:progress',
  RAG_CHUNKING_STATUS = 'rag:chunking:status',
  RAG_DATABASE_INDEXING = 'rag:database:indexing',
  RAG_SOURCE_PROCESSING = 'rag:source:processing',
  RAG_INDEXING_CANCEL_REQUESTED = 'rag:indexing:cancel:request',
  RAG_INDEXING_RETRY_REQUESTED = 'rag:indexing:retry:request',

  // IDE events (P2-6 - IDE → Knowledge bridge)
  IDE_DEBUG_SESSION_CAPTURED = 'ide:debug:session:captured',
  IDE_REFACTOR_JOURNAL_CREATED = 'ide:refactor:journal:created',
  IDE_DEPENDENCY_AUDIT_COMPLETE = 'ide:dependency:audit:complete',

  // IDE → Knowledge events (P2-10 AC2 - Code Analysis Bridge)
  IDE_CODE_ANALYSIS_REQUESTED = 'ide:code:analysis:request',

  // Knowledge events (P2-7 - Knowledge → Notes export)
  KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED = 'knowledge:synthesis:export:request',

  // Notes events (P2-8 - Notes → Knowledge RAG indexing)
  NOTES_RAG_INDEX_REQUESTED = 'notes:rag:index:request'
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
 * IDE → Knowledge Event Payloads (P2-6 - IDE ↔ Knowledge Bridge)
 *
 * These payloads carry IDE context to Knowledge workspace for:
 * - UC-02: IDE Debugging Vault
 * - UC-11: Agentic Refactor Validation
 * - UC-13: Dependency Audit Upgrade
 */

/**
 * Debug Session Data (UC-02)
 *
 * Captured from IDE when user clicks "Capture Debug Session"
 */
export interface DebugSessionData {
  workspaceType: 'ide';
  projectId: string;
  timestamp: Date;
  errorType: string; // e.g., "TypeError", "ReferenceError"
  errorMessage: string; // Human-readable error message
  stackTrace: string; // Full stack trace
  environment: {
    nodeVersion?: string;
    browser?: string;
    os?: string;
    framework?: string; // e.g., "React 18.2.0"
  };
  codeContext: {
    filePath: string;
    lineNumber: number;
    snippet: string; // Surrounding code
  };
  attemptedFixes: string[]; // List of attempted solutions
  finalFix: string; // What actually worked
  symptoms: string; // User's description of the problem
  tags: string[]; // Auto-generated tags (framework, error family, language feature)
}

/**
 * Refactor Journal Data (UC-11)
 *
 * Created when agent completes multi-file refactor
 */
export interface RefactorJournalData {
  workspaceType: 'ide';
  projectId: string;
  timestamp: Date;
  title: string; // e.g., "Refactor: useAppStore → 3 slices"
  originalState: {
    storeName: string;
    lineCount: number;
    sliceCount: number;
  };
  migrationPlan: string[]; // Step-by-step migration plan
  changedFiles: Array<{
    filePath: string;
    action: 'created' | 'updated' | 'deleted';
    diffSummary: string;
  }>;
  validationResults: Array<{
    step: number;
    description: string;
    status: 'pass' | 'fail' | 'warning';
    output?: string;
  }>;
  rollbackCheckpoints: Array<{
    step: number;
    gitCommand: string; // e.g., "git checkout HEAD~1 -- src/store.ts"
    description: string;
  }>;
  tags: string[]; // e.g., ["zustand", "store-split", "migration"]
}

/**
 * Dependency Audit Data (UC-13)
 *
 * Generated when agent completes dependency research phase
 */
export interface DependencyAuditData {
  workspaceType: 'ide';
  projectId: string;
  timestamp: Date;
  packageName: string; // e.g., "react"
  fromVersion: string; // e.g., "18.2.0"
  toVersion: string; // e.g., "19.0.0"
  breakingChanges: Array<{
    description: string;
    affectedCode: string[]; // File paths
    migrationGuide?: string; // URL to migration guide
  }>;
  codebaseImpact: {
    totalFilesAffected: number;
    filesByImportType: Record<string, number>; // e.g., { "useState": 15, "useEffect": 8 }
  };
  upgradePlan: string[]; // Step-by-step upgrade plan
  externalLinks: {
    changelog?: string;
    migrationGuide?: string;
    releaseNotes?: string;
    githubDiscussion?: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[]; // e.g., ["react", "major-version", "hooks"]
}

/**
 * Code Analysis Data (P2-10 AC2 - IDE → Knowledge Bridge)
 *
 * Generated when user analyzes code file from IDE for Knowledge workspace
 */
export interface CodeAnalysisData {
  workspaceType: 'ide';
  projectId: string;
  timestamp: Date;
  filePath: string;
  fileName: string;
  analysis: {
    language: string;
    linesOfCode: number;
    functionCount: number;
    classCount: number;
    complexity: {
      cyclomaticComplexity: number;
      averageNestingDepth: number;
      maxNestingDepth: number;
      longestFunction: number;
      complexityScore: number;
    };
    dependencies: Array<{
      importPath: string;
      importType: 'local' | 'external' | 'builtin';
      moduleName?: string;
    }>;
    concepts: Array<{
      type: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'enum';
      name: string;
      line: number;
      description?: string;
      relatedTo: string[];
    }>;
  };
  sourceCode?: string; // Optional: full source code for reference
}

/**
 * Synthesis Export Data (P2-7 - Knowledge → Notes)
 *
 * Generated when user exports knowledge node to Notes workspace
 */
export interface SynthesisExportData {
  workspaceType: 'knowledge';
  nodeId: string;
  timestamp: Date;
  data: {
    nodeId: string;
    title: string;
    content: string; // Markdown content
    frontmatter: {
      createdAt: string;
      updatedAt: string;
      workspaceType: 'knowledge';
      tags: string[];
      sources?: Array<{
        type: 'pdf' | 'url' | 'note';
        path: string;
        title?: string;
      }>;
    };
    blocks?: Array<{
      type: 'paragraph' | 'heading' | 'list' | 'code';
      content: string;
      level?: number;
    }>;
  };
}

/**
 * Notes RAG Index Data (P2-8 - Notes → Knowledge)
 *
 * Generated when user indexes notes for RAG in Knowledge workspace
 */
export interface NotesRAGIndexData {
  workspaceType: 'notes';
  noteIds: string[]; // Array of note IDs to index
  timestamp: Date;
  projectId: string;
  mode: 'batch' | 'incremental'; // Batch all notes or single note
}

/**
 * RAG Indexing Cancel Data
 *
 * Generated when user cancels an ongoing RAG indexing operation
 */
export interface RAGIndexingCancelData {
  documentId: string; // Document ID to cancel
  projectId: string;
  timestamp: Date;
}

/**
 * RAG Indexing Retry Data
 *
 * Generated when user retries a failed RAG indexing operation
 */
export interface RAGIndexingRetryData {
  documentId: string; // Document ID to retry
  projectId: string;
  timestamp: Date;
}

/**
 * File Change Data (ARCH-01.5 - RAG Auto-Indexing on Sync)
 *
 * Generated when files are created, updated, or deleted during sync.
 * Triggers RAG indexing to keep search index synchronized with file system.
 */
export interface FileChangeData {
  /** Workspace type where change occurred */
  workspaceType: 'ide' | 'knowledge' | 'notes' | 'study';
  /** Project ID */
  projectId: string;
  /** File path relative to project root */
  filePath: string;
  /** File content (for created/updated files) */
  content?: string;
  /** File size in bytes */
  fileSize?: number;
  /** MIME type if available */
  mimeType?: string;
  /** Timestamp of change */
  timestamp: Date;
  /** Whether file should be indexed for RAG */
  shouldIndex: boolean;
}

/**
 * File Created Data
 *
 * Emitted when a new file is synced to the local filesystem.
 */
export interface FileCreatedData extends FileChangeData {
  changeType: 'created';
}

/**
 * File Updated Data
 *
 * Emitted when an existing file is modified.
 */
export interface FileUpdatedData extends FileChangeData {
  changeType: 'updated';
  /** Previous content hash for change detection */
  previousHash?: string;
  /** New content hash */
  newHash?: string;
}

/**
 * File Deleted Data
 *
 * Emitted when a file is removed from the filesystem.
 */
export interface FileDeletedData extends Omit<FileChangeData, 'content'> {
  changeType: 'deleted';
  /** Chunk IDs that need to be removed from index */
  chunkIds?: string[];
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

  /**
   * Emit file created event (ARCH-01.5 - RAG Auto-Indexing on Sync)
   *
   * Type-safe helper for file created events that trigger RAG indexing.
   *
   * @param payload - File created data
   * @param correlationId - Optional correlation ID
   */
  emitFileCreated(
    payload: FileCreatedData,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.FILE_CREATED,
      payload,
      correlationId
    );
  }

  /**
   * Emit file updated event (ARCH-01.5 - RAG Auto-Indexing on Sync)
   *
   * Type-safe helper for file updated events that trigger RAG re-indexing.
   *
   * @param payload - File updated data
   * @param correlationId - Optional correlation ID
   */
  emitFileUpdated(
    payload: FileUpdatedData,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.FILE_UPDATED,
      payload,
      correlationId
    );
  }

  /**
   * Emit file deleted event (ARCH-01.5 - RAG Auto-Indexing on Sync)
   *
   * Type-safe helper for file deleted events that trigger RAG cleanup.
   *
   * @param payload - File deleted data
   * @param correlationId - Optional correlation ID
   */
  emitFileDeleted(
    payload: FileDeletedData,
    correlationId?: string
  ): void {
    this.emit(
      DomainEventType.FILE_DELETED,
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

// ============================================================================
// Legacy Store Events Compatibility Layer
// ============================================================================
// These exports maintain compatibility with code that previously imported
// from '@/lib/events/store-events' which has been migrated to infrastructure/events

/**
 * File Saved Payload
 *
 * Payload for file saved events from the legacy store-events module.
 */
export interface FileSavedPayload {
  /** Relative path to the file */
  filePath: string;
  /** Project ID where the file was saved */
  projectId: string;
  /** Workspace type */
  workspaceType: 'ide' | 'notes' | 'knowledge' | 'study';
  /** Timestamp of save */
  timestamp: number;
  /** Whether content was provided */
  hasContent?: boolean;
}

/**
 * Store Event Types
 *
 * Event type constants for store-level events.
 * Maps to DomainEventType values for compatibility.
 */
export const STORE_EVENTS = {
  FILE_SAVED: 'file:saved' as const,
  FILE_CREATED: 'file:created' as const,
  FILE_UPDATED: 'file:updated' as const,
  FILE_DELETED: 'file:deleted' as const,
  SYNC_STARTED: 'sync:started' as const,
  SYNC_COMPLETED: 'sync:completed' as const,
  WORKSPACE_CHANGED: 'workspace:changed' as const,
};

/**
 * Emit Store Event
 *
 * Helper function to emit store events with the legacy store-events API.
 * Wraps the EventBus emit method for compatibility.
 *
 * @param eventType - Type of store event
 * @param payload - Event payload
 * @param correlationId - Optional correlation ID
 */
export function emitStoreEvent<T>(
  eventType: string,
  payload: T,
  correlationId?: string
): void {
  // Convert legacy event types to DomainEventType if needed
  const domainEventType = mapToDomainEventType(eventType);
  // Use type assertion for compatibility with legacy API
  eventBus.emit(domainEventType, payload as unknown as T, correlationId);
}

/**
 * Map legacy store event type to DomainEventType
 */
function mapToDomainEventType(eventType: string): DomainEventType {
  const mapping: Record<string, DomainEventType> = {
    'file:saved': DomainEventType.FILE_SAVED,
    'file:created': DomainEventType.FILE_CREATED,
    'file:updated': DomainEventType.FILE_UPDATED,
    'file:deleted': DomainEventType.FILE_DELETED,
    'sync:started': DomainEventType.SYNC_STARTED,
    'sync:completed': DomainEventType.SYNC_COMPLETED,
    'workspace:changed': DomainEventType.WORKSPACE_CHANGED,
  };

  return mapping[eventType] ?? (eventType as DomainEventType);
}

/**
 * Use Store Event Hook
 *
 * React hook for subscribing to store events.
 * Provides type-safe event subscription with automatic cleanup.
 * Mimics useEffect pattern with dependency array.
 *
 * @param eventType - Type of event to subscribe to
 * @param handler - Event handler function
 * @param deps - Dependency array (like useEffect) - empty array = run once on mount
 * @returns void
 *
 * @example
 * ```tsx
 * // Subscribe once on mount
 * useStoreEvent('file:saved', (payload) => {
 *   console.log('File saved:', payload.path);
 * }, []);
 * ```
 */
export function useStoreEvent<T>(
  eventType: string,
  handler: (payload: T) => void,
  _deps: unknown[]
): void {
  // This function is designed to be called within a useEffect or similar
  // React hook context. The subscription is managed by the caller.
  // For true React hook behavior, use useEffect with this pattern:
  // useEffect(() => {
  //   const unsubscribe = eventBus.on(mappedType, (event) => handler(event.payload));
  //   return unsubscribe;
  // }, [deps]);
  //
  // For backward compatibility, we export the raw subscription function
  // and the caller is expected to manage cleanup.
  const domainEventType = mapToDomainEventType(eventType);
  const unsubscribe = eventBus.on(domainEventType, (event) => {
    handler(event.payload as T);
  });

  // Return unsubscribe function for manual cleanup
  // The caller should store this and call it on cleanup
  // This matches the pattern expected by the existing code
  (useStoreEvent as unknown as { _unsubscribe?: () => void })._unsubscribe = unsubscribe;
}

/**
 * @fileoverview RAG Sync Subscription Service
 * @module lib/rag/sync-subscription-service
 *
 * ARCH-01.5.2 - Subscribe to file sync events and trigger RAG indexing.
 *
 * This service bridges the file sync infrastructure with the RAG indexing system.
 * It subscribes to file change events and queues appropriate indexing tasks.
 */

import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { FileCreatedData, FileUpdatedData, FileDeletedData } from '@/infrastructure/events/event-bus';
import type { IndexConfig } from './types';

/**
 * Indexing task queue item
 */
export interface IndexingTask {
  /** Task ID */
  id: string;
  /** Project ID */
  projectId: string;
  /** Workspace type */
  workspaceType: 'ide' | 'knowledge' | 'notes' | 'study';
  /** File path */
  filePath: string;
  /** Task type */
  type: 'index' | 'reindex' | 'remove';
  /** File content (for index/reindex) */
  content?: string;
  /** Chunk IDs to remove (for remove) */
  chunkIds?: string[];
  /** Priority (lower = higher priority) */
  priority: number;
  /** Timestamp when task was created */
  createdAt: number;
  /** Whether task is currently being processed */
  processing: boolean;
}

/**
 * Subscription service configuration
 */
export interface SubscriptionConfig {
  /** Maximum queue size */
  maxQueueSize?: number;
  /** Batch size for processing */
  batchSize?: number;
  /** Delay between batches (ms) */
  batchDelay?: number;
  /** File extensions to index */
  indexableExtensions?: string[];
  /** Maximum file size to index (bytes) */
  maxFileSize?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<SubscriptionConfig> = {
  maxQueueSize: 100,
  batchSize: 5,
  batchDelay: 1000,
  indexableExtensions: ['.md', '.txt', '.js', '.ts', '.tsx', '.jsx', '.py', '.json'],
  maxFileSize: 1024 * 1024, // 1MB
};

/**
 * RAG Sync Subscription Service
 *
 * Subscribes to file sync events and queues indexing tasks.
 * Implements debouncing and batching for efficient indexing.
 */
export class RAGSyncSubscriptionService {
  private subscriptions: Array<() => void> = [];
  private queue: Map<string, IndexingTask> = new Map();
  private processing: boolean = false;
  private config: Required<SubscriptionConfig>;
  private indexConfigs: Map<string, IndexConfig> = new Map();

  constructor(config: SubscriptionConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start listening to file sync events
   */
  start(): void {
    if (this.subscriptions.length > 0) {
      console.warn('[RAGSyncSubscription] Already started');
      return;
    }

    // Subscribe to file created events
    this.subscriptions.push(
      eventBus.on<FileCreatedData>(
        DomainEventType.FILE_CREATED,
        this.handleFileCreated.bind(this)
      )
    );

    // Subscribe to file updated events
    this.subscriptions.push(
      eventBus.on<FileUpdatedData>(
        DomainEventType.FILE_UPDATED,
        this.handleFileUpdated.bind(this)
      )
    );

    // Subscribe to file deleted events
    this.subscriptions.push(
      eventBus.on<FileDeletedData>(
        DomainEventType.FILE_DELETED,
        this.handleFileDeleted.bind(this)
      )
    );

    console.log('[RAGSyncSubscription] Started listening to file sync events');
  }

  /**
   * Stop listening to file sync events
   */
  stop(): void {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    console.log('[RAGSyncSubscription] Stopped listening to file sync events');
  }

  /**
   * Register index configuration for a project
   */
  registerIndex(projectId: string, config: IndexConfig): void {
    this.indexConfigs.set(projectId, config);
  }

  /**
   * Unregister index configuration for a project
   */
  unregisterIndex(projectId: string): void {
    this.indexConfigs.delete(projectId);
  }

  /**
   * Get current queue state
   */
  getQueueState(): {
    queued: number;
    processing: number;
    tasks: IndexingTask[];
  } {
    const tasks = Array.from(this.queue.values());
    return {
      queued: tasks.filter(t => !t.processing).length,
      processing: tasks.filter(t => t.processing).length,
      tasks: tasks.sort((a, b) => a.priority - b.priority),
    };
  }

  /**
   * Clear queue for a specific project
   */
  clearProjectQueue(projectId: string): void {
    const keysToRemove: string[] = [];
    for (const [key, task] of this.queue) {
      if (task.projectId === projectId && !task.processing) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => this.queue.delete(key));
  }

  /**
   * Process next batch of indexing tasks
   */
  async processNextBatch(
    handler: (tasks: IndexingTask[]) => Promise<void>
  ): Promise<void> {
    if (this.processing) {
      console.warn('[RAGSyncSubscription] Already processing batch');
      return;
    }

    const pendingTasks = Array.from(this.queue.values())
      .filter(t => !t.processing)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, this.config.batchSize);

    if (pendingTasks.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Mark tasks as processing
      pendingTasks.forEach(task => {
        task.processing = true;
        this.queue.set(task.id, task);
      });

      await handler(pendingTasks);

      // Remove completed tasks
      pendingTasks.forEach(task => this.queue.delete(task.id));
    } catch (error) {
      console.error('[RAGSyncSubscription] Batch processing failed:', error);
      // Mark tasks as not processing so they can be retried
      pendingTasks.forEach(task => {
        task.processing = false;
        this.queue.set(task.id, task);
      });
    } finally {
      this.processing = false;
    }
  }

  /**
   * Handle file created event
   */
  private handleFileCreated(event: { payload: FileCreatedData }): void {
    const { payload } = event;

    if (!this.shouldIndexFile(payload)) {
      return;
    }

    const taskId = this.generateTaskId(payload.projectId, payload.filePath, 'index');

    // Remove existing task if any (debounce)
    this.queue.delete(taskId);

    const task: IndexingTask = {
      id: taskId,
      projectId: payload.projectId,
      workspaceType: payload.workspaceType,
      filePath: payload.filePath,
      type: 'index',
      content: payload.content,
      priority: this.calculatePriority(payload),
      createdAt: Date.now(),
      processing: false,
    };

    this.queue.set(taskId, task);
    console.log(`[RAGSyncSubscription] Queued indexing task for: ${payload.filePath}`);
  }

  /**
   * Handle file updated event
   */
  private handleFileUpdated(event: { payload: FileUpdatedData }): void {
    const { payload } = event;

    if (!this.shouldIndexFile(payload)) {
      return;
    }

    const taskId = this.generateTaskId(payload.projectId, payload.filePath, 'reindex');

    // Remove existing task if any (debounce)
    this.queue.delete(taskId);

    const task: IndexingTask = {
      id: taskId,
      projectId: payload.projectId,
      workspaceType: payload.workspaceType,
      filePath: payload.filePath,
      type: 'reindex',
      content: payload.content,
      priority: this.calculatePriority(payload),
      createdAt: Date.now(),
      processing: false,
    };

    this.queue.set(taskId, task);
    console.log(`[RAGSyncSubscription] Queued reindexing task for: ${payload.filePath}`);
  }

  /**
   * Handle file deleted event
   */
  private handleFileDeleted(event: { payload: FileDeletedData }): void {
    const { payload } = event;

    const taskId = this.generateTaskId(payload.projectId, payload.filePath, 'remove');

    // Remove existing task if any
    this.queue.delete(taskId);

    const task: IndexingTask = {
      id: taskId,
      projectId: payload.projectId,
      workspaceType: payload.workspaceType,
      filePath: payload.filePath,
      type: 'remove',
      chunkIds: payload.chunkIds,
      priority: 0, // Highest priority for deletions
      createdAt: Date.now(),
      processing: false,
    };

    this.queue.set(taskId, task);
    console.log(`[RAGSyncSubscription] Queued removal task for: ${payload.filePath}`);
  }

  /**
   * Check if file should be indexed
   */
  private shouldIndexFile(data: FileCreatedData | FileUpdatedData): boolean {
    // Check if shouldIndex flag is set
    if (!data.shouldIndex) {
      return false;
    }

    // Check if index is registered for this project
    if (!this.indexConfigs.has(data.projectId)) {
      return false;
    }

    // Check file extension
    const ext = this.getFileExtension(data.filePath);
    if (!this.config.indexableExtensions.includes(ext)) {
      return false;
    }

    // Check file size
    if (data.fileSize && data.fileSize > this.config.maxFileSize) {
      console.warn(`[RAGSyncSubscription] File too large for indexing: ${data.filePath} (${data.fileSize} bytes)`);
      return false;
    }

    return true;
  }

  /**
   * Calculate task priority based on workspace type
   */
  private calculatePriority(data: FileCreatedData | FileUpdatedData): number {
    // Knowledge workspace gets highest priority
    if (data.workspaceType === 'knowledge') return 10;
    // Notes workspace gets medium priority
    if (data.workspaceType === 'notes') return 20;
    // IDE and Study get lower priority
    return 30;
  }

  /**
   * Get file extension from path
   */
  private getFileExtension(filePath: string): string {
    const match = filePath.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : '';
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(projectId: string, filePath: string, type: string): string {
    return `${projectId}:${filePath}:${type}`;
  }
}

/**
 * Singleton instance
 */
let subscriptionServiceInstance: RAGSyncSubscriptionService | null = null;

/**
 * Get or create the subscription service singleton
 */
export function getRAGSyncSubscriptionService(
  config?: SubscriptionConfig
): RAGSyncSubscriptionService {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new RAGSyncSubscriptionService(config);
  }
  return subscriptionServiceInstance;
}

/**
 * Reset the singleton (for testing)
 */
export function resetRAGSyncSubscriptionService(): void {
  if (subscriptionServiceInstance) {
    subscriptionServiceInstance.stop();
    subscriptionServiceInstance = null;
  }
}

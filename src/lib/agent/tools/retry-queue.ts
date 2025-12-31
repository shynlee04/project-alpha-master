/**
 * @fileoverview Retry Queue for Tool Execution
 * @module lib/agent/tools/retry-queue
 * @governance RC-006
 *
 * Implements retry queue with:
 * - Error classification (RETRYABLE, NON_RETRYABLE, FATAL)
 * - Exponential backoff with jitter
 * - Max retry limits per error type
 * - Dexie persistence for session recovery
 * - Event bus lifecycle events
 *
 * @story rc-006-epic4-story44-retry-queue
 * @priority HIGH (HIGH-002)
 */

import { type WorkspaceEventEmitter } from '../../events/workspace-events';
import {
    classifyError,
    type RetryClass,
    isRetryableError,
    isFatalError,
    isNonRetryableError,
} from '../../utils/error-classification';
import { ToolError } from './tool-error';

// ============================================================================
// Types
// ============================================================================

/**
 * Retry queue item status
 */
export type RetryQueueItemStatus = 'queued' | 'running' | 'retrying' | 'completed' | 'exhausted' | 'failed';

/**
 * Retry queue item for tracking retry state
 */
export interface RetryQueueItem {
    /** Unique item ID */
    id: string;
    /** Tool identifier */
    toolId: string;
    /** Tool name for display */
    toolName: string;
    /** Error that triggered the retry */
    error: ToolError;
    /** Current retry classification */
    classification: RetryClass;
    /** Current attempt number (1-based) */
    attempt: number;
    /** Maximum attempts based on classification */
    maxAttempts: number;
    /** Status of the queue item */
    status: RetryQueueItemStatus;
    /** Scheduled retry timestamp */
    scheduledAt: number;
    /** Last execution timestamp */
    lastExecutedAt?: number;
    /** Result if completed */
    result?: unknown;
    /** Created timestamp */
    createdAt: number;
}

/**
 * Retry queue configuration
 */
export interface RetryQueueConfig {
    /** Base delay in milliseconds */
    baseDelay: number;
    /** Maximum delay in milliseconds */
    maxDelay: number;
    /** Jitter factor (0-1) */
    jitterFactor: number;
    /** Max retries for RETRYABLE errors */
    maxRetriesRetryable: number;
    /** Max retries for NON_RETRYABLE errors */
    maxRetriesNonRetryable: number;
    /** Max retries for FATAL errors */
    maxRetriesFatal: number;
}

/**
 * Default retry queue configuration
 */
export const DEFAULT_RETRY_QUEUE_CONFIG: RetryQueueConfig = {
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    jitterFactor: 0.3, // 30% jitter
    maxRetriesRetryable: 3,
    maxRetriesNonRetryable: 1,
    maxRetriesFatal: 0,
};

/**
 * Retry queue statistics
 */
export interface RetryQueueStats {
    totalQueued: number;
    completed: number;
    exhausted: number;
    failed: number;
    currentlyRetrying: number;
    averageRetries: number;
}

/**
 * Backoff calculation result
 */
export interface BackoffResult {
    /** Delay in milliseconds */
    delay: number;
    /** Calculated at timestamp */
    calculatedAt: number;
}

// ============================================================================
// Event Types (to be added to workspace-events.ts)
// ============================================================================

/**
 * Retry queue events (extend WorkspaceEvents)
 */
export interface RetryQueueEvents {
    'retry:queued': [{ item: RetryQueueItem }];
    'retry:attempt': [{ item: RetryQueueItem; attempt: number }];
    'retry:success': [{ item: RetryQueueItem; result: unknown }];
    'retry:exhausted': [{ item: RetryQueueItem; finalError: ToolError }];
    'retry:failed': [{ item: RetryQueueItem; error: ToolError }];
}

// ============================================================================
// Backoff Calculation
// ============================================================================

/**
 * Calculate exponential backoff with jitter
 *
 * Formula: delay = min(baseDelay * 2^attempt + jitter, maxDelay)
 * where jitter = random(0, baseDelay * jitterFactor)
 *
 * @param attempt - Current attempt number (0-based for first retry)
 * @param config - Retry queue configuration
 * @returns Backoff result with delay
 */
export function calculateBackoff(attempt: number, config: RetryQueueConfig = DEFAULT_RETRY_QUEUE_CONFIG): BackoffResult {
    const baseDelay = config.baseDelay;
    const maxDelay = config.maxDelay;
    const jitterFactor = config.jitterFactor;

    // Calculate raw exponential backoff first
    const rawBackoff = baseDelay * Math.pow(2, attempt);

    // Jitter: random factor between 0 and jitterFactor * baseDelay
    const jitter = Math.random() * jitterFactor * baseDelay;

    // Total delay with jitter, then cap at maxDelay
    const delay = Math.min(Math.floor(rawBackoff + jitter), maxDelay);

    return {
        delay,
        calculatedAt: Date.now(),
    };
}

/**
 * Get max attempts based on error classification
 */
export function getMaxAttempts(classification: RetryClass, config: RetryQueueConfig = DEFAULT_RETRY_QUEUE_CONFIG): number {
    switch (classification) {
        case 'RETRYABLE':
            return config.maxRetriesRetryable;
        case 'NON_RETRYABLE':
            return config.maxRetriesNonRetryable;
        case 'FATAL':
            return config.maxRetriesFatal;
        default:
            return 0;
    }
}

// ============================================================================
// Retry Queue Item Factory
// ============================================================================

/**
 * Create a new retry queue item
 */
export function createRetryQueueItem(
    toolId: string,
    toolName: string,
    error: ToolError,
    classification: RetryClass,
    config: RetryQueueConfig = DEFAULT_RETRY_QUEUE_CONFIG
): RetryQueueItem {
    const attempt = 1;
    const maxAttempts = getMaxAttempts(classification, config);
    const backoff = calculateBackoff(0, config);

    return {
        id: crypto.randomUUID(),
        toolId,
        toolName,
        error,
        classification,
        attempt,
        maxAttempts,
        status: 'queued',
        scheduledAt: Date.now() + backoff.delay,
        createdAt: Date.now(),
    };
}

// ============================================================================
// Retry Queue (In-Memory)
// ============================================================================

/**
 * In-memory retry queue for managing retry items
 */
export class RetryQueue {
    private items: Map<string, RetryQueueItem> = new Map();
    private config: RetryQueueConfig;
    private eventBus?: WorkspaceEventEmitter;

    constructor(config: Partial<RetryQueueConfig> = {}, eventBus?: WorkspaceEventEmitter) {
        this.config = { ...DEFAULT_RETRY_QUEUE_CONFIG, ...config };
        this.eventBus = eventBus;
    }

    /**
     * Set the event bus for emitting events
     */
    setEventBus(eventBus: WorkspaceEventEmitter): void {
        this.eventBus = eventBus;
    }

    /**
     * Get a queue item by ID
     */
    getItem(id: string): RetryQueueItem | undefined {
        return this.items.get(id);
    }

    /**
     * Get all queue items
     */
    getAllItems(): RetryQueueItem[] {
        return Array.from(this.items.values());
    }

    /**
     * Get items by status
     */
    getItemsByStatus(status: RetryQueueItemStatus): RetryQueueItem[] {
        return this.getAllItems().filter((item) => item.status === status);
    }

    /**
     * Get queued items (sorted by scheduled time)
     */
    getQueuedItems(): RetryQueueItem[] {
        return this.getItemsByStatus('queued').sort((a, b) => a.scheduledAt - b.scheduledAt);
    }

    /**
     * Get items ready for retry
     */
    getItemsReadyForRetry(): RetryQueueItem[] {
        const now = Date.now();
        return this.getQueuedItems().filter((item) => item.scheduledAt <= now);
    }

    /**
     * Queue an item for retry
     */
    queue(item: RetryQueueItem): void {
        this.items.set(item.id, item);
        this.emitEvent('retry:queued', { item });
    }

    /**
     * Start executing a queued item
     */
    startExecuting(id: string): RetryQueueItem | undefined {
        const item = this.items.get(id);
        if (!item || item.status !== 'queued') {
            return undefined;
        }

        item.status = 'running';
        item.lastExecutedAt = Date.now();
        this.items.set(id, item);

        this.emitEvent('retry:attempt', { item, attempt: item.attempt });
        return item;
    }

    /**
     * Mark an item as successful
     */
    markSuccess(id: string, result: unknown): RetryQueueItem | undefined {
        const item = this.items.get(id);
        if (!item) {
            return undefined;
        }

        item.status = 'completed';
        item.result = result;
        this.items.set(id, item);

        this.emitEvent('retry:success', { item, result });
        return item;
    }

    /**
     * Schedule a retry for an item
     */
    scheduleRetry(id: string): RetryQueueItem | undefined {
        const item = this.items.get(id);
        if (!item) {
            return undefined;
        }

        // Check if max attempts reached
        if (item.attempt >= item.maxAttempts) {
            this.markExhausted(id);
            return undefined; // Return undefined when exhausted
        }

        // Calculate backoff for next attempt
        const backoff = calculateBackoff(item.attempt, this.config);

        item.status = 'retrying';
        item.attempt++;
        item.scheduledAt = Date.now() + backoff.delay;
        this.items.set(id, item);

        this.emitEvent('retry:attempt', { item, attempt: item.attempt });
        return item;
    }

    /**
     * Mark an item as exhausted (max retries reached)
     */
    markExhausted(id: string): RetryQueueItem | undefined {
        const item = this.items.get(id);
        if (!item) {
            return undefined;
        }

        item.status = 'exhausted';
        this.items.set(id, item);

        this.emitEvent('retry:exhausted', { item, finalError: item.error });
        return item;
    }

    /**
     * Mark an item as failed (non-retryable error)
     */
    markFailed(id: string, error: ToolError): RetryQueueItem | undefined {
        const item = this.items.get(id);
        if (!item) {
            return undefined;
        }

        item.status = 'failed';
        item.error = error;
        this.items.set(id, item);

        this.emitEvent('retry:failed', { item, error });
        return item;
    }

    /**
     * Remove an item from the queue
     */
    remove(id: string): boolean {
        return this.items.delete(id);
    }

    /**
     * Clear all items
     */
    clear(): void {
        this.items.clear();
    }

    /**
     * Get queue statistics
     */
    getStats(): RetryQueueStats {
        const allItems = this.getAllItems();
        const completed = allItems.filter((i) => i.status === 'completed');
        const exhausted = allItems.filter((i) => i.status === 'exhausted');
        const failed = allItems.filter((i) => i.status === 'failed');
        const retrying = allItems.filter((i) => i.status === 'running' || i.status === 'retrying');

        // Calculate average retries
        const retryCounts = allItems.filter((i) => i.attempt > 1).map((i) => i.attempt);
        const averageRetries = retryCounts.length > 0
            ? retryCounts.reduce((a, b) => a + b, 0) / retryCounts.length
            : 0;

        return {
            totalQueued: allItems.length,
            completed: completed.length,
            exhausted: exhausted.length,
            failed: failed.length,
            currentlyRetrying: retrying.length,
            averageRetries: Math.round(averageRetries * 100) / 100,
        };
    }

    /**
     * Get the next item ready for retry
     */
    popNext(): RetryQueueItem | undefined {
        const readyItems = this.getItemsReadyForRetry();
        if (readyItems.length === 0) {
            return undefined;
        }

        const item = readyItems[0];
        return this.startExecuting(item.id);
    }

    /**
     * Process a tool execution result
     */
    processResult(id: string, success: boolean, result?: unknown, error?: Error): RetryQueueItem | undefined {
        if (success) {
            return this.markSuccess(id, result);
        }

        if (!error) {
            // Unknown error - fail immediately
            return this.markFailed(id, new ToolError(
                'Unknown error during retry',
                'EUNKNOWN',
                {
                    toolId: this.items.get(id)?.toolId || 'unknown',
                    toolName: this.items.get(id)?.toolName || 'Unknown',
                    parameters: {},
                    category: 'PERMANENT',
                    retryable: false,
                    attemptCount: this.items.get(id)?.attempt || 1,
                }
            ));
        }

        // Classify the error
        // const classification = classifyError(error);

        // Check if error is retryable
        if (!isRetryableError(error)) {
            // Non-retryable or fatal error
            const toolError = error instanceof ToolError ? error : new ToolError(
                error.message,
                'ECLASSIFIED',
                {
                    toolId: this.items.get(id)?.toolId || 'unknown',
                    toolName: this.items.get(id)?.toolName || 'Unknown',
                    parameters: {},
                    category: 'PERMANENT',
                    retryable: false,
                    attemptCount: this.items.get(id)?.attempt || 1,
                },
                error
            );

            return this.markFailed(id, toolError);
        }

        // Schedule retry - if undefined (exhausted), return the item from store
        const scheduled = this.scheduleRetry(id);
        if (scheduled === undefined) {
            return this.items.get(id);
        }
        return scheduled;
    }

    /**
     * Emit an event to the event bus
     */
    private emitEvent<K extends keyof RetryQueueEvents>(event: K, data: RetryQueueEvents[K][0]): void {
        this.eventBus?.emit(event as string, data);
    }

    /**
     * Serialize queue for persistence
     */
    serialize(): string {
        return JSON.stringify(Array.from(this.items.values()));
    }

    /**
     * Deserialize queue from persistence
     */
    static deserialize(data: string, config?: Partial<RetryQueueConfig>): RetryQueue {
        const queue = new RetryQueue(config);
        try {
            const items: RetryQueueItem[] = JSON.parse(data);
            for (const item of items) {
                queue.items.set(item.id, item);
            }
        } catch {
            // Invalid data - start fresh
        }
        return queue;
    }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a retry queue with optional event bus
 */
export function createRetryQueue(eventBus?: WorkspaceEventEmitter, config?: Partial<RetryQueueConfig>): RetryQueue {
    return new RetryQueue(config, eventBus);
}

/**
 * Classify error and get retry configuration
 */
export function classifyForRetry(error: Error): {
    classification: RetryClass;
    isRetryable: boolean;
    isFatal: boolean;
    isNonRetryable: boolean;
} {
    const classification = classifyError(error);
    return {
        classification: classification.classification,
        isRetryable: isRetryableError(error),
        isFatal: isFatalError(error),
        isNonRetryable: isNonRetryableError(error),
    };
}

// ============================================================================
// End of Module
// ============================================================================

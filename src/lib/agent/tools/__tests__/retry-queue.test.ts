/**
 * @fileoverview Retry Queue Tests
 * @module lib/agent/tools/__tests__/retry-queue.test.ts
 * @governance RC-006
 *
 * Tests for retry queue implementation:
 * - Error classification mapping
 * - Backoff calculation
 * - Max retry limits per type
 * - Queue operations
 * - Event emission
 *
 * @story rc-006-epic4-story44-retry-queue
 */

import {
    RetryQueue,
    createRetryQueue,
    calculateBackoff,
    getMaxAttempts,
    createRetryQueueItem,
    classifyForRetry,
    DEFAULT_RETRY_QUEUE_CONFIG,
    type RetryQueueConfig,
} from '../retry-queue';
import { ToolError } from '../tool-error';
import type { WorkspaceEventEmitter } from '../../events/workspace-events';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock ToolError for testing
 */
function createMockToolError(
    message: string,
    code: string = 'ETEST',
    retryable: boolean = true
): ToolError {
    return new ToolError(
        message,
        code,
        {
            toolId: 'test-tool',
            toolName: 'Test Tool',
            parameters: { test: 'value' },
            category: retryable ? 'TRANSIENT' : 'PERMANENT',
            retryable,
            attemptCount: 1,
        }
    );
}

/**
 * Create a mock event emitter for testing
 * Simple object that implements the required interface without type casting issues
 */
function createMockEventEmitter() {
    const events: Map<string, Array<(...args: unknown[]) => void>> = new Map();

    // Track emit calls using a simple counter (without vi.fn for emit)
    let emitCallCount = 0;
    let lastEmitEvent: string | null = null;
    let lastEmitData: unknown = null;

    const emitter = {
        on: (event: string, callback: (...args: unknown[]) => void) => {
            if (!events.has(event)) {
                events.set(event, []);
            }
            events.get(event)!.push(callback);
        },
        off: (event: string, callback: (...args: unknown[]) => void) => {
            const callbacks = events.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        },
        emit: (event: string, data: unknown) => {
            emitCallCount++;
            lastEmitEvent = event;
            lastEmitData = data;
            const callbacks = events.get(event);
            if (callbacks) {
                callbacks.forEach(cb => cb(data));
            }
        },
        once: (event: string, callback: (...args: unknown[]) => void) => {
            if (!events.has(event)) {
                events.set(event, []);
            }
            events.get(event)!.push(callback);
        },
        removeAllListeners: (event?: string) => {
            if (event) {
                events.delete(event);
            } else {
                events.clear();
            }
        },
        // Test utilities
        _getEmitCallCount: () => emitCallCount,
        _getLastEmitEvent: () => lastEmitEvent,
        _getLastEmitData: () => lastEmitData,
        _resetEmitCalls: () => {
            emitCallCount = 0;
            lastEmitEvent = null;
            lastEmitData = null;
        },
    };

    return emitter;
}

// ============================================================================
// Backoff Calculation Tests
// ============================================================================

describe('Backoff Calculation', () => {
    it('should calculate exponential backoff for first retry (attempt 0)', () => {
        const result = calculateBackoff(0);

        // Base delay = 1000ms, max = 30000ms
        // Expected: 1000 + jitter(0-300)
        expect(result.delay).toBeGreaterThanOrEqual(1000);
        expect(result.delay).toBeLessThanOrEqual(1300);
        expect(result.calculatedAt).toBeDefined();
    });

    it('should double backoff for each attempt', () => {
        const backoff0 = calculateBackoff(0);
        const backoff1 = calculateBackoff(1);
        const backoff2 = calculateBackoff(2);

        // Each should be roughly double the previous (minus jitter)
        expect(backoff1.delay).toBeGreaterThan(backoff0.delay);
        expect(backoff2.delay).toBeGreaterThan(backoff1.delay);
    });

    it('should cap at maxDelay', () => {
        const config = { ...DEFAULT_RETRY_QUEUE_CONFIG, maxDelay: 5000 };
        const result = calculateBackoff(10, config); // High attempt number

        expect(result.delay).toBeLessThanOrEqual(5000);
    });

    it('should include jitter in calculation', () => {
        // Run multiple times to verify jitter varies
        const delays = new Set<number>();
        for (let i = 0; i < 10; i++) {
            delays.add(calculateBackoff(0).delay);
        }

        // Jitter should cause some variation
        expect(delays.size).toBeGreaterThan(1);
    });

    it('should handle custom configuration', () => {
        const customConfig: RetryQueueConfig = {
            baseDelay: 2000,
            maxDelay: 10000,
            jitterFactor: 0.5,
            maxRetriesRetryable: 5,
            maxRetriesNonRetryable: 2,
            maxRetriesFatal: 0,
        };

        const result = calculateBackoff(0, customConfig);
        expect(result.delay).toBeGreaterThanOrEqual(2000);
        expect(result.delay).toBeLessThanOrEqual(3000); // 2000 + 50% jitter
    });
});

// ============================================================================
// Max Attempts Tests
// ============================================================================

describe('Max Attempts', () => {
    it('should return 3 for RETRYABLE errors', () => {
        expect(getMaxAttempts('RETRYABLE')).toBe(3);
    });

    it('should return 1 for NON_RETRYABLE errors', () => {
        expect(getMaxAttempts('NON_RETRYABLE')).toBe(1);
    });

    it('should return 0 for FATAL errors', () => {
        expect(getMaxAttempts('FATAL')).toBe(0);
    });

    it('should use custom config when provided', () => {
        const config: RetryQueueConfig = {
            ...DEFAULT_RETRY_QUEUE_CONFIG,
            maxRetriesRetryable: 5,
            maxRetriesNonRetryable: 2,
            maxRetriesFatal: 1,
        };

        expect(getMaxAttempts('RETRYABLE', config)).toBe(5);
        expect(getMaxAttempts('NON_RETRYABLE', config)).toBe(2);
        expect(getMaxAttempts('FATAL', config)).toBe(1);
    });
});

// ============================================================================
// Retry Queue Item Creation Tests
// ============================================================================

describe('Retry Queue Item Creation', () => {
    it('should create a queued item with correct initial state', () => {
        const error = createMockToolError('Test error');
        const item = createRetryQueueItem('read_file', 'Read File', error, 'RETRYABLE');

        expect(item.id).toBeDefined();
        expect(item.toolId).toBe('read_file');
        expect(item.toolName).toBe('Read File');
        expect(item.error).toBe(error);
        expect(item.classification).toBe('RETRYABLE');
        expect(item.attempt).toBe(1);
        expect(item.maxAttempts).toBe(3);
        expect(item.status).toBe('queued');
        expect(item.scheduledAt).toBeGreaterThan(Date.now());
        expect(item.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('should set correct maxAttempts based on classification', () => {
        const error = createMockToolError('Test error');

        const retryableItem = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
        expect(retryableItem.maxAttempts).toBe(3);

        const nonRetryableItem = createRetryQueueItem('tool', 'Tool', error, 'NON_RETRYABLE');
        expect(nonRetryableItem.maxAttempts).toBe(1);

        const fatalItem = createRetryQueueItem('tool', 'Tool', error, 'FATAL');
        expect(fatalItem.maxAttempts).toBe(0);
    });

    it('should schedule retry with backoff delay', () => {
        const error = createMockToolError('Test error');
        const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');

        const expectedMinDelay = DEFAULT_RETRY_QUEUE_CONFIG.baseDelay;
        const expectedMaxDelay = expectedMinDelay + (DEFAULT_RETRY_QUEUE_CONFIG.baseDelay * DEFAULT_RETRY_QUEUE_CONFIG.jitterFactor);

        expect(item.scheduledAt).toBeGreaterThanOrEqual(Date.now() + expectedMinDelay);
        expect(item.scheduledAt).toBeLessThanOrEqual(Date.now() + expectedMaxDelay + 10); // +10ms tolerance
    });
});

// ============================================================================
// Classify for Retry Tests
// ============================================================================

describe('Classify for Retry', () => {
    it('should classify network errors as RETRYABLE', () => {
        const error = new Error('Failed to fetch: network error');
        const result = classifyForRetry(error);

        expect(result.classification).toBe('RETRYABLE');
        expect(result.isRetryable).toBe(true);
        expect(result.isFatal).toBe(false);
        expect(result.isNonRetryable).toBe(false);
    });

    it('should classify timeout errors as RETRYABLE', () => {
        const error = new Error('Request timed out');
        const result = classifyForRetry(error);

        expect(result.isRetryable).toBe(true);
    });

    it('should classify permission errors as NON_RETRYABLE', () => {
        const error = new Error('Permission denied: access denied');
        const result = classifyForRetry(error);

        expect(result.isRetryable).toBe(false);
        expect(result.isNonRetryable).toBe(true);
    });

    it('should classify invalid input errors as NON_RETRYABLE', () => {
        const error = new Error('Invalid input: malformed request');
        const result = classifyForRetry(error);

        expect(result.isRetryable).toBe(false);
        expect(result.isNonRetryable).toBe(true);
    });

    it('should classify data corruption as FATAL', () => {
        const error = new Error('Data corruption: checksum failed');
        const result = classifyForRetry(error);

        expect(result.isRetryable).toBe(false);
        expect(result.isFatal).toBe(true);
    });
});

// ============================================================================
// Retry Queue Operations Tests
// ============================================================================

describe('RetryQueue Operations', () => {
    let queue: RetryQueue;
    let eventBus: ReturnType<typeof createMockEventEmitter>;

    beforeEach(() => {
        eventBus = createMockEventEmitter();
        // Pass eventBus first, config second (order matters!)
        queue = createRetryQueue(eventBus as any, undefined);
    });

    afterEach(() => {
        queue.clear();
    });

    describe('Queue Management', () => {
        it('should queue an item', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');

            queue.queue(item);

            expect(queue.getItem(item.id)).toBe(item);
            expect(queue.getAllItems().length).toBe(1);
        });

        it('should get items by status', () => {
            const error1 = createMockToolError('Error 1');
            const error2 = createMockToolError('Error 2');
            const error3 = createMockToolError('Error 3');

            const item1 = createRetryQueueItem('tool1', 'Tool 1', error1, 'RETRYABLE');
            const item2 = createRetryQueueItem('tool2', 'Tool 2', error2, 'RETRYABLE');
            const item3 = createRetryQueueItem('tool3', 'Tool 3', error3, 'RETRYABLE');

            queue.queue(item1);
            queue.queue(item2);
            queue.queue(item3);

            // Start executing item2
            queue.startExecuting(item2.id);

            expect(queue.getItemsByStatus('queued').length).toBe(2);
            expect(queue.getItemsByStatus('running').length).toBe(1);
        });

        it('should get queued items sorted by scheduled time', () => {
            const error = createMockToolError('Test error');
            const now = Date.now();

            // Create items with different scheduled times
            const item1 = createRetryQueueItem('tool1', 'Tool 1', error, 'RETRYABLE');
            item1.scheduledAt = now + 1000;

            const item2 = createRetryQueueItem('tool2', 'Tool 2', error, 'RETRYABLE');
            item2.scheduledAt = now + 500;

            const item3 = createRetryQueueItem('tool3', 'Tool 3', error, 'RETRYABLE');
            item3.scheduledAt = now + 2000;

            queue.queue(item1);
            queue.queue(item2);
            queue.queue(item3);

            const queued = queue.getQueuedItems();
            expect(queued[0].id).toBe(item2.id);
            expect(queued[1].id).toBe(item1.id);
            expect(queued[2].id).toBe(item3.id);
        });

        it('should remove an item from the queue', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');

            queue.queue(item);
            expect(queue.getAllItems().length).toBe(1);

            const removed = queue.remove(item.id);
            expect(removed).toBe(true);
            expect(queue.getAllItems().length).toBe(0);

            const removedAgain = queue.remove(item.id);
            expect(removedAgain).toBe(false);
        });

        it('should clear all items', () => {
            const error = createMockToolError('Test error');
            queue.queue(createRetryQueueItem('tool1', 'Tool 1', error, 'RETRYABLE'));
            queue.queue(createRetryQueueItem('tool2', 'Tool 2', error, 'RETRYABLE'));
            queue.queue(createRetryQueueItem('tool3', 'Tool 3', error, 'RETRYABLE'));

            expect(queue.getAllItems().length).toBe(3);

            queue.clear();

            expect(queue.getAllItems().length).toBe(0);
        });
    });

    describe('Execution Flow', () => {
        it('should start executing a queued item', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);

            const executing = queue.startExecuting(item.id);

            expect(executing).toBeDefined();
            expect(executing?.status).toBe('running');
            expect(executing?.lastExecutedAt).toBeDefined();
        });

        it('should not start non-queued items', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);

            // Start executing
            queue.startExecuting(item.id);

            // Try to start again - should fail
            const again = queue.startExecuting(item.id);
            expect(again).toBeUndefined();
        });

        it('should mark an item as successful', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            const result = { data: 'test result' };
            const marked = queue.markSuccess(item.id, result);

            expect(marked).toBeDefined();
            expect(marked?.status).toBe('completed');
            expect(marked?.result).toBe(result);
        });

        it('should schedule a retry on failure', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            const scheduled = queue.scheduleRetry(item.id);

            expect(scheduled).toBeDefined();
            expect(scheduled?.status).toBe('retrying');
            expect(scheduled?.attempt).toBe(2);
            expect(scheduled?.scheduledAt).toBeGreaterThan(Date.now());
        });

        it('should mark as exhausted when max attempts reached', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            item.attempt = item.maxAttempts; // Simulate max attempts reached
            queue.queue(item);
            queue.startExecuting(item.id);

            const scheduled = queue.scheduleRetry(item.id);

            expect(scheduled).toBeUndefined(); // Should not schedule

            const exhausted = queue.getItem(item.id);
            expect(exhausted?.status).toBe('exhausted');
        });

        it('should mark failed for non-retryable errors', () => {
            const error = createMockToolError('Permission denied', 'EPERM', false);
            const item = createRetryQueueItem('tool', 'Tool', error, 'NON_RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            const failed = queue.markFailed(item.id, error);

            expect(failed).toBeDefined();
            expect(failed?.status).toBe('failed');
        });
    });

    describe('Process Result', () => {
        it('should mark success when result is successful', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            const processed = queue.processResult(item.id, true, { success: true });

            expect(processed?.status).toBe('completed');
        });

        it('should schedule retry for retryable errors', () => {
            const error = createMockToolError('Network timeout');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            const processed = queue.processResult(item.id, false, undefined, error);

            expect(processed?.status).toBe('retrying');
            expect(processed?.attempt).toBe(2);
        });

        it('should mark failed for non-retryable errors', () => {
            const error = createMockToolError('Permission denied', 'EPERM', false);
            const item = createRetryQueueItem('tool', 'Tool', error, 'NON_RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            const processed = queue.processResult(item.id, false, undefined, error);

            expect(processed?.status).toBe('failed');
        });

        it('should mark exhausted after max retries for retryable errors', () => {
            const error = createMockToolError('Network timeout');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            item.attempt = 3; // Max attempts = 3
            queue.queue(item);
            queue.startExecuting(item.id);

            const processed = queue.processResult(item.id, false, undefined, error);

            expect(processed?.status).toBe('exhausted');
        });
    });

    describe('Statistics', () => {
        it('should calculate correct statistics', () => {
            const error = createMockToolError('Test error');

            // Add completed items
            for (let i = 0; i < 3; i++) {
                const item = createRetryQueueItem(`tool${i}`, `Tool ${i}`, error, 'RETRYABLE');
                item.status = 'completed';
                queue.queue(item);
            }

            // Add exhausted item
            const exhaustedItem = createRetryQueueItem('tool-ex', 'Tool Ex', error, 'RETRYABLE');
            exhaustedItem.status = 'exhausted';
            queue.queue(exhaustedItem);

            // Add failed item
            const failedItem = createRetryQueueItem('tool-fail', 'Tool Fail', error, 'NON_RETRYABLE');
            failedItem.status = 'failed';
            queue.queue(failedItem);

            // Add running item
            const runningItem = createRetryQueueItem('tool-run', 'Tool Run', error, 'RETRYABLE');
            runningItem.status = 'running';
            queue.queue(runningItem);

            const stats = queue.getStats();

            expect(stats.totalQueued).toBe(6);
            expect(stats.completed).toBe(3);
            expect(stats.exhausted).toBe(1);
            expect(stats.failed).toBe(1);
            expect(stats.currentlyRetrying).toBe(1);
        });
    });

    describe('Serialization', () => {
        it('should serialize and deserialize queue correctly', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);

            const serialized = queue.serialize();
            expect(serialized).toContain(item.id);

            const deserialized = RetryQueue.deserialize(serialized);
            expect(deserialized.getItem(item.id)?.toolId).toBe('tool');
        });

        it('should handle invalid serialization data', () => {
            const deserialized = RetryQueue.deserialize('invalid json');
            expect(deserialized.getAllItems().length).toBe(0);
        });
    });

    describe('Event Emission', () => {
        it('should emit retry:queued event', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);

            expect(eventBus._getEmitCallCount()).toBe(1);
            expect(eventBus._getLastEmitEvent()).toBe('retry:queued');
            expect(eventBus._getLastEmitData()).toEqual(expect.objectContaining({
                item: expect.objectContaining({ id: item.id }),
            }));
        });

        it('should emit retry:attempt event when starting', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            // First emit was retry:queued, second is retry:attempt
            expect(eventBus._getEmitCallCount()).toBe(2);
            expect(eventBus._getLastEmitEvent()).toBe('retry:attempt');
            expect(eventBus._getLastEmitData()).toEqual(expect.objectContaining({
                item: expect.objectContaining({ id: item.id }),
                attempt: 1,
            }));
        });

        it('should emit retry:success event', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            eventBus._resetEmitCalls();
            queue.markSuccess(item.id, { result: 'test' });

            expect(eventBus._getEmitCallCount()).toBe(1);
            expect(eventBus._getLastEmitEvent()).toBe('retry:success');
            expect(eventBus._getLastEmitData()).toEqual(expect.objectContaining({
                result: { result: 'test' },
            }));
        });

        it('should emit retry:exhausted event', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'RETRYABLE');
            item.attempt = 3;
            queue.queue(item);
            queue.startExecuting(item.id);

            eventBus._resetEmitCalls();
            queue.scheduleRetry(item.id);

            expect(eventBus._getEmitCallCount()).toBe(1);
            expect(eventBus._getLastEmitEvent()).toBe('retry:exhausted');
            expect(eventBus._getLastEmitData()).toEqual(expect.objectContaining({
                item: expect.objectContaining({ id: item.id }),
            }));
        });

        it('should emit retry:failed event', () => {
            const error = createMockToolError('Test error');
            const item = createRetryQueueItem('tool', 'Tool', error, 'NON_RETRYABLE');
            queue.queue(item);
            queue.startExecuting(item.id);

            eventBus._resetEmitCalls();
            queue.markFailed(item.id, error);

            expect(eventBus._getEmitCallCount()).toBe(1);
            expect(eventBus._getLastEmitEvent()).toBe('retry:failed');
            expect(eventBus._getLastEmitData()).toEqual(expect.objectContaining({
                item: expect.objectContaining({ id: item.id }),
            }));
        });
    });
});

// ============================================================================
// End of Test Suite
// ============================================================================

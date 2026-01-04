/**
 * @fileoverview Mock sync event emitter for testing SyncStatusPanel
 * @module lib/filesync/__tests__/mock-sync-events
 *
 * Test helper for manually testing SyncStatusPanel component.
 * Simulates sync events without actual file operations.
 *
 * @example
 * ```tsx
 * import { mockSyncEmit, mockSyncError } from '@/lib/filesync/__tests__/mock-sync-events';
 *
 * function DevTools() {
 *   return (
 *     <>
 *       <Button onClick={mockSyncEmit}>Test Sync Success</Button>
 *       <Button onClick={mockSyncError}>Test Sync Error</Button>
 *     </>
 *   );
 * }
 * ```
 */

import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

/**
 * Mock sync event emitter - simulates successful sync operation
 *
 * Emits the following events:
 * 1. SYNC_STARTED with total=10
 * 2. SYNC_PROGRESS (10 times, 500ms apart)
 * 3. SYNC_COMPLETED with success message
 *
 * Progress: 0% → 10% → 20% → ... → 100%
 * Duration: ~5 seconds
 */
export function mockSyncEmit() {
  const { eventBus } = useWorkspace();

  if (!eventBus) {
    console.warn('[mockSyncEmit] No event bus available');
    return;
  }

  console.log('[mockSyncEmit] Starting mock sync operation...');

  // Simulate sync started
  eventBus.emit('sync:started', {
    fileCount: 10,
    direction: 'bidirectional',
  });

  // Simulate progress updates
  let current = 0;
  const total = 10;

  const interval = setInterval(() => {
    current += 1;

    eventBus.emit('sync:progress', {
      current,
      total,
      currentFile: `file-${current}.txt`,
    });

    console.log(`[mockSyncEmit] Progress: ${current}/${total} (${(current / total) * 100}%)`);

    if (current >= total) {
      clearInterval(interval);
      eventBus.emit('sync:completed', {
        success: true,
        timestamp: new Date(),
        filesProcessed: total,
      });
      console.log('[mockSyncEmit] Mock sync completed');
    }
  }, 500);
}

/**
 * Mock sync error - simulates failed sync operation
 *
 * Emits the following events:
 * 1. SYNC_STARTED with total=10
 * 2. SYNC_FAILED with error message
 *
 * Purpose: Test error state display and auto-hide (5s timeout)
 */
export function mockSyncError() {
  const { eventBus } = useWorkspace();

  if (!eventBus) {
    console.warn('[mockSyncError] No event bus available');
    return;
  }

  console.log('[mockSyncError] Starting mock sync error...');

  eventBus.emit('sync:started', {
    fileCount: 10,
    direction: 'bidirectional',
  });

  // Simulate immediate failure
  setTimeout(() => {
    eventBus.emit('sync:error', {
      error: new Error('Network connection lost during sync'),
    });
    console.log('[mockSyncError] Mock sync error emitted');
  }, 100);
}

/**
 * Mock sync with custom parameters
 *
 * @param options - Sync operation options
 * @param options.total - Total number of files to sync (default: 10)
 * @param options.duration - Duration in milliseconds (default: 3000)
 * @param options.shouldFail - Whether to fail the sync (default: false)
 * @param options.errorMessage - Custom error message (default: 'Sync failed')
 */
export function mockSyncCustom({
  total = 10,
  duration = 3000,
  shouldFail = false,
  errorMessage = 'Sync failed',
}: {
  total?: number;
  duration?: number;
  shouldFail?: boolean;
  errorMessage?: string;
} = {}) {
  const { eventBus } = useWorkspace();

  if (!eventBus) {
    console.warn('[mockSyncCustom] No event bus available');
    return;
  }

  console.log(`[mockSyncCustom] Starting custom mock sync (total=${total}, duration=${duration}ms, fail=${shouldFail})`);

  eventBus.emit('sync:started', {
    fileCount: total,
    direction: 'bidirectional',
  });

  if (shouldFail) {
    // Simulate failure after 20% progress
    const failAt = Math.ceil(total * 0.2);
    const intervalDuration = duration * 0.2 / failAt;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;

      eventBus.emit('sync:progress', {
        current,
        total,
        currentFile: `file-${current}.txt`,
      });

      if (current >= failAt) {
        clearInterval(interval);
        eventBus.emit('sync:error', {
          error: new Error(errorMessage),
        });
        console.log(`[mockSyncCustom] Mock sync failed at ${current}/${total}`);
      }
    }, intervalDuration);
  } else {
    // Simulate success
    const intervalDuration = duration / total;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;

      eventBus.emit('sync:progress', {
        current,
        total,
        currentFile: `file-${current}.txt`,
      });

      if (current >= total) {
        clearInterval(interval);
        eventBus.emit('sync:completed', {
          success: true,
          timestamp: new Date(),
          filesProcessed: total,
        });
        console.log(`[mockSyncCustom] Mock sync completed (${total} files in ${duration}ms)`);
      }
    }, intervalDuration);
  }
}

/**
 * React hook that provides mock sync functions
 *
 * @example
 * ```tsx
 * function DevTools() {
 *   const { mockSyncEmit, mockSyncError, mockSyncCustom } = useMockSyncEvents();
 *
 *   return (
 *     <>
 *       <Button onClick={() => mockSyncEmit()}>Test Sync</Button>
 *       <Button onClick={() => mockSyncError()}>Test Error</Button>
 *       <Button onClick={() => mockSyncCustom({ total: 20, duration: 5000 })}>
 *         Custom Sync
 *       </Button>
 *     </>
 *   );
 * }
 * ```
 */
export function useMockSyncEvents() {
  return {
    mockSyncEmit,
    mockSyncError,
    mockSyncCustom,
  };
}

/**
 * @fileoverview Sync Dev Tools Component
 * @module presentation/components/dev/SyncDevTools
 *
 * Development-only component for testing SyncStatusPanel.
 * Provides buttons to emit mock sync events.
 *
 * @example
 * ```tsx
 * import { SyncDevTools } from '@/presentation/components/dev/SyncDevTools';
 *
 * function IDELayout() {
 *   return (
 *     <>
 *       <SyncDevTools />
 *       {/* ... rest of layout *\/}
 *     </>
 *   );
 * }
 * ```
 */

import { useMockSyncEvents } from '@/lib/filesync/__tests__/mock-sync-events';

/**
 * SyncDevTools - Development testing buttons for SyncStatusPanel
 *
 * Only renders in development mode (import.meta.env.DEV).
 * Provides three test scenarios:
 * 1. Quick sync (10 files, 5 seconds)
 * 2. Failed sync (network error)
 * 3. Custom sync (configurable parameters)
 */
export function SyncDevTools() {
  const { mockSyncEmit, mockSyncError, mockSyncCustom } = useMockSyncEvents();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-[100] bg-background border border-border rounded-lg shadow-lg p-4 w-80">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <span className="text-yellow-500">⚙️</span>
        Sync Dev Tools
      </h3>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => mockSyncEmit()}
          className="px-3 py-2 text-xs bg-success hover:bg-success/80 text-success-foreground rounded transition-colors"
        >
          Test Sync Success (10 files, 5s)
        </button>

        <button
          onClick={() => mockSyncError()}
          className="px-3 py-2 text-xs bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded transition-colors"
        >
          Test Sync Error (Network failure)
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => mockSyncCustom({ total: 5, duration: 2000 })}
            className="flex-1 px-3 py-2 text-xs bg-info hover:bg-info/80 text-info-foreground rounded transition-colors"
          >
            Quick (5 files)
          </button>

          <button
            onClick={() => mockSyncCustom({ total: 20, duration: 5000 })}
            className="flex-1 px-3 py-2 text-xs bg-info hover:bg-info/80 text-info-foreground rounded transition-colors"
          >
            Slow (20 files)
          </button>
        </div>

        <button
          onClick={() =>
            mockSyncCustom({
              total: 50,
              duration: 8000,
              shouldFail: true,
              errorMessage: 'Permission denied: Read access required',
            })
          }
          className="px-3 py-2 text-xs bg-warning hover:bg-warning/80 text-warning-foreground rounded transition-colors"
        >
          Test Partial Failure (50 files → fail at 20%)
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Instructions:</strong>
          <br />• Click buttons to test SyncStatusPanel
          <br />• Watch bottom-right corner for sync progress
          <br />• Success auto-hides after 3s
          <br />• Errors auto-hide after 5s
        </p>
      </div>
    </div>
  );
}

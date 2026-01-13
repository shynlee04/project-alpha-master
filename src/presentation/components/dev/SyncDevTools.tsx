/**
 * @fileoverview Sync Dev Tools Component
 * @module presentation/components/dev/SyncDevTools
 *
 * Development-only component for testing SyncStatusPanel.
 * Provides buttons to emit mock sync events via crossWorkspaceEventBus.
 *
 * FIXED 2026-01-15: Now uses crossWorkspaceEventBus instead of deprecated useWorkspaceSync
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

import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';

/**
 * Get the current project path from localStorage or use a default
 */
function getCurrentProjectPath(): string {
  if (typeof window === 'undefined') return '/test-project';
  const projectId = localStorage.getItem('lastProjectId') || 'test-project';
  return `/${projectId}`;
}

/**
 * SyncDevTools - Development testing buttons for SyncStatusPanel
 *
 * Only renders in development mode (import.meta.env.DEV).
 * Provides buttons to emit test events via crossWorkspaceEventBus.
 *
 * Events are consumed by:
 * - SyncStatusPanel (in IDE)
 * - SyncStatusIndicator (in workspace components)
 */
export function SyncDevTools() {
  if (!import.meta.env.DEV) {
    return null;
  }

  const projectPath = getCurrentProjectPath();

  /**
   * Simulate quick successful sync
   */
  const mockQuickSync = () => {
    crossWorkspaceEventBus.emitSyncStatus({
      workspaceId: 'ide',
      projectPath,
      status: 'syncing',
    });
    setTimeout(() => {
      crossWorkspaceEventBus.emitSyncStatus({
        workspaceId: 'ide',
        projectPath,
        status: 'synced',
      });
      // Auto-clear after 3 seconds
      setTimeout(() => {
        crossWorkspaceEventBus.emitSyncStatus({
          workspaceId: 'ide',
          projectPath,
          status: 'synced',
        });
      }, 3000);
    }, 2000);
  };

  /**
   * Simulate sync error
   */
  const mockSyncError = () => {
    crossWorkspaceEventBus.emitSyncStatus({
      workspaceId: 'ide',
      projectPath,
      status: 'error',
      error: 'Network failure: Unable to connect to storage',
    });
    // Auto-clear after 5 seconds
    setTimeout(() => {
      crossWorkspaceEventBus.emitSyncStatus({
        workspaceId: 'ide',
        projectPath,
        status: 'synced',
      });
    }, 5000);
  };

  /**
   * Simulate partial failure
   */
  const mockPartialFailure = () => {
    crossWorkspaceEventBus.emitSyncStatus({
      workspaceId: 'ide',
      projectPath,
      status: 'syncing',
    });
    setTimeout(() => {
      crossWorkspaceEventBus.emitSyncStatus({
        workspaceId: 'ide',
        projectPath,
        status: 'error',
        error: 'Partial failure: 10/50 files failed (Permission denied)',
      });
    }, 3000);
  };

  /**
   * Simulate file change
   */
  const mockFileChange = (changeType: 'created' | 'modified' | 'deleted') => {
    const testFiles = [
      'src/index.ts',
      'src/App.tsx',
      'src/components/Button.tsx',
      'package.json',
      'README.md',
    ];
    const randomFile = testFiles[Math.floor(Math.random() * testFiles.length)];
    crossWorkspaceEventBus.emitFileChange({
      workspaceId: 'ide',
      projectPath,
      filePath: randomFile,
      changeType,
    });
  };

  return (
    <div className="fixed top-20 right-4 z-[100] bg-background border border-border rounded-lg shadow-lg p-4 w-80">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <span className="text-yellow-500">⚙️</span>
        Sync Dev Tools
      </h3>

      <div className="flex flex-col gap-2">
        {/* Sync Status Tests */}
        <button
          onClick={mockQuickSync}
          className="px-3 py-2 text-xs bg-success hover:bg-success/80 text-success-foreground rounded transition-colors"
        >
          Test Sync Success (10 files, 5s)
        </button>

        <button
          onClick={mockSyncError}
          className="px-3 py-2 text-xs bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded transition-colors"
        >
          Test Sync Error (Network failure)
        </button>

        <button
          onClick={mockPartialFailure}
          className="px-3 py-2 text-xs bg-warning hover:bg-warning/80 text-warning-foreground rounded transition-colors"
        >
          Test Partial Failure (50 files → fail at 20%)
        </button>

        <hr className="my-2 border-border" />

        {/* File Change Tests */}
        <p className="text-xs text-muted-foreground mb-1">File Change Events:</p>
        <div className="flex gap-2">
          <button
            onClick={() => mockFileChange('created')}
            className="flex-1 px-3 py-2 text-xs bg-info hover:bg-info/80 text-info-foreground rounded transition-colors"
          >
            + Created
          </button>
          <button
            onClick={() => mockFileChange('modified')}
            className="flex-1 px-3 py-2 text-xs bg-info hover:bg-info/80 text-info-foreground rounded transition-colors"
          >
            ~ Modified
          </button>
          <button
            onClick={() => mockFileChange('deleted')}
            className="flex-1 px-3 py-2 text-xs bg-info hover:bg-info/80 text-info-foreground rounded transition-colors"
          >
            × Deleted
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Instructions:</strong>
          <br />• Click buttons to test SyncStatusPanel/SyncStatusIndicator
          <br />• Events emit to crossWorkspaceEventBus
          <br />• Watch status bar and bottom-right for sync progress
          <br />• Success auto-hides after 3s, errors after 5s
        </p>
      </div>
    </div>
  );
}

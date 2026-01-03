---
date: 2026-01-03
time: 16:50:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1095
type: critical-fix-handoff
---

# P1-2 Handoff: Wire SyncStatusPanel to Event Bus

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P1 - High (User Feedback Gap)
**Estimate**: 2 hours
**Impact**: Users don't see sync progress feedback during file operations

## Problem Statement

The `SyncStatusIndicator` component exists but is not wired to the cross-workspace event bus to receive real-time sync events. Users cannot see sync progress when files are being synchronized.

**Current State**:
- Event bus has sync events defined: `SYNC_STARTED`, `SYNC_PROGRESS`, `SYNC_COMPLETED`, `SYNC_FAILED`
- `SyncStatusIndicator` component exists but doesn't listen to events
- No component is emitting these sync events to the event bus
- Users don't see sync progress during file operations

## Root Cause Analysis

### Event Bus Sync Events (Already Defined):
**File**: `src/infrastructure/events/event-bus.ts:51-54`
```typescript
SYNC_STARTED = 'sync:started',
SYNC_COMPLETED = 'sync:completed',
SYNC_FAILED = 'sync:failed',
SYNC_PROGRESS = 'sync:progress',
```

### SyncStatusIndicator Component (Presentational Only):
**File**: `src/presentation/components/ui/activity-indicators/SyncStatusIndicator.tsx`
- Takes `state` prop with sync status
- Shows progress bar, file count, status messages
- ❌ Does NOT listen to event bus
- ❌ Not connected to any data source

### Existing Pattern for Event Bus Consumption:
**File**: `src/presentation/components/ide/statusbar/AgentStatusSegment.tsx`
```typescript
const { eventBus } = useWorkspace();

useEffect(() => {
    if (!eventBus) return;

    const handleActivityChanged = ({ status }) => {
        setAgentStatus(status);
    };

    eventBus.on('agent:activity:changed', handleActivityChanged);

    return () => {
        eventBus.off('agent:activity:changed', handleActivityChanged);
    };
}, [eventBus, setAgentStatus]);
```

## Implementation Plan

### Step 1: Extend FileSyncStatusStore with Progress State (30 minutes)

**Add to**: `src/lib/workspace/file-sync-status-store.ts`

**Add new state properties**:
```typescript
interface SyncStatusState {
  // ... existing state ...

  // Sync operation progress (for event bus integration)
  syncProgress: {
    isRunning: boolean;
    current: number;
    total: number;
    progress: number; // 0-100
    message?: string;
    error?: string;
  };

  // Actions for updating progress from event bus
  setSyncStarted: (total: number) => void;
  setSyncProgress: (current: number, total: number, message?: string) => void;
  setSyncCompleted: (message?: string) => void;
  setSyncFailed: (error: string) => void;
}
```

**Implement actions**:
```typescript
export const useFileSyncStatusStore = create<SyncStatusState>()(
  persist(
    subscribeWithSelector(
      (set, get) => ({
        // ... existing state ...
        syncProgress: {
          isRunning: false,
          current: 0,
          total: 0,
          progress: 0,
        },

        setSyncStarted: (total) => {
          set({
            syncProgress: {
              isRunning: true,
              current: 0,
              total,
              progress: 0,
              message: `Starting sync of ${total} files...`,
            },
          });
        },

        setSyncProgress: (current, total, message) => {
          set((state) => ({
            syncProgress: {
              ...state.syncProgress,
              current,
              total,
              progress: total > 0 ? (current / total) * 100 : 0,
              message: message || `Syncing ${current}/${total} files...`,
            },
          }));
        },

        setSyncCompleted: (message) => {
          set((state) => ({
            syncProgress: {
              ...state.syncProgress,
              isRunning: false,
              progress: 100,
              message: message || `Synced ${state.syncProgress.total} files successfully`,
            },
          }));
        },

        setSyncFailed: (error) => {
          set((state) => ({
            syncProgress: {
              ...state.syncProgress,
              isRunning: false,
              error,
            },
          }));
        },

        // ... existing actions ...
      })
    ),
    {
      // Update partialize to exclude syncProgress (ephemeral runtime state)
      partialize: (state) => ({
        statuses: state.statuses,
        // ❌ DON'T persist: syncProgress (runtime only)
      }),
    }
  )
);
```

### Step 2: Create SyncStatusPanel Container Component (45 minutes)

**Create**: `src/presentation/components/ui/activity-indicators/SyncStatusPanel.tsx`

This container component:
- Listens to event bus for sync events
- Updates file-sync-status-store with progress
- Renders SyncStatusIndicator with store state

```typescript
/**
 * @fileoverview Sync Status Panel Container
 * @module presentation/components/ui/activity-indicators/SyncStatusPanel
 *
 * Container component that wires SyncStatusIndicator to the event bus.
 * Listens for sync events and updates the file-sync-status-store.
 */

import { useEffect } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { WorkspaceEventType } from '@/infrastructure/events/event-bus';

/**
 * SyncStatusPanel - Displays real-time file sync progress
 *
 * Listens to sync events from the event bus and displays progress.
 * Automatically shows/hides based on sync activity.
 */
export function SyncStatusPanel() {
  const { eventBus } = useWorkspace();

  // Get sync progress state from store
  const syncProgress = useFileSyncStatusStore((s) => s.syncProgress);
  const setSyncStarted = useFileSyncStatusStore((s) => s.setSyncStarted);
  const setSyncProgress = useFileSyncStatusStore((s) => s.setSyncProgress);
  const setSyncCompleted = useFileSyncStatusStore((s) => s.setSyncCompleted);
  const setSyncFailed = useFileSyncStatusStore((s) => s.setSyncFailed);

  // Subscribe to sync events
  useEffect(() => {
    if (!eventBus) return;

    // Handle sync started event
    const handleSyncStarted = ({ total }: { total: number }) => {
      console.log('[SyncStatusPanel] Sync started:', total);
      setSyncStarted(total);
    };

    // Handle sync progress event
    const handleSyncProgress = ({
      current,
      total,
      message
    }: {
      current: number;
      total: number;
      message?: string;
    }) => {
      console.log('[SyncStatusPanel] Sync progress:', current, '/', total);
      setSyncProgress(current, total, message);
    };

    // Handle sync completed event
    const handleSyncCompleted = ({ message }: { message?: string }) => {
      console.log('[SyncStatusPanel] Sync completed');
      setSyncCompleted(message);

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        setSyncCompleted(message); // Will reset to idle state
      }, 3000);

      return () => clearTimeout(timeout);
    };

    // Handle sync failed event
    const handleSyncFailed = ({ error }: { error: string }) => {
      console.error('[SyncStatusPanel] Sync failed:', error);
      setSyncFailed(error);

      // Auto-hide after 5 seconds (longer for errors)
      const timeout = setTimeout(() => {
        setSyncFailed(''); // Clear error
      }, 5000);

      return () => clearTimeout(timeout);
    };

    // Register event listeners
    eventBus.on(WorkspaceEventType.SYNC_STARTED, handleSyncStarted as any);
    eventBus.on(WorkspaceEventType.SYNC_PROGRESS, handleSyncProgress as any);
    eventBus.on(WorkspaceEventType.SYNC_COMPLETED, handleSyncCompleted as any);
    eventBus.on(WorkspaceEventType.SYNC_FAILED, handleSyncFailed as any);

    // Cleanup function
    return () => {
      eventBus.off(WorkspaceEventType.SYNC_STARTED, handleSyncStarted as any);
      eventBus.off(WorkspaceEventType.SYNC_PROGRESS, handleSyncProgress as any);
      eventBus.off(WorkspaceEventType.SYNC_COMPLETED, handleSyncCompleted as any);
      eventBus.off(WorkspaceEventType.SYNC_FAILED, handleSyncFailed as any);
    };
  }, [eventBus, setSyncStarted, setSyncProgress, setSyncCompleted, setSyncFailed]);

  // Don't render if no sync activity
  if (!syncProgress.isRunning && !syncProgress.error && syncProgress.progress === 0) {
    return null;
  }

  // Map store state to component props
  const state = {
    status: syncProgress.error
      ? 'error'
      : syncProgress.isRunning
      ? 'running'
      : 'completed',
    current: syncProgress.current,
    total: syncProgress.total,
    progress: syncProgress.progress,
    message: syncProgress.message,
    error: syncProgress.error,
  };

  return <SyncStatusIndicator state={state} />;
}
```

### Step 3: Export New Component from Barrel (5 minutes)

**Update**: `src/presentation/components/ui/activity-indicators/index.ts`

```typescript
export { SyncStatusIndicator } from './SyncStatusIndicator';
export { SyncStatusPanel } from './SyncStatusPanel'; // NEW
```

### Step 4: Add SyncStatusPanel to Layout Components (30 minutes)

Add `SyncStatusPanel` to workspace layouts where sync operations occur:

**IDE Layout** (`src/presentation/components/layout/IDELayout.tsx`):
```typescript
import { SyncStatusPanel } from '@/presentation/components/ui/activity-indicators';

// In JSX (near status bar or as floating panel):
<div className="fixed bottom-4 right-4 z-50 w-96">
  <SyncStatusPanel />
</div>
```

**Notes Layout** (`src/presentation/components/notes/NotesPage.tsx`):
```typescript
import { SyncStatusPanel } from '@/presentation/components/ui/activity-indicators';

// Add near markdown export controls
<SyncStatusPanel />
```

**Study Layout** (`src/presentation/components/study/StudyPage.tsx`):
```typescript
import { SyncStatusPanel } from '@/presentation/components/ui/activity-indicators';

// Add near file picker
<SyncStatusPanel />
```

### Step 5: Add Mock Event Emitters for Testing (20 minutes)

**Create test helper**: `src/lib/filesync/__tests__/mock-sync-events.ts`

```typescript
/**
 * Mock sync event emitter for testing SyncStatusPanel
 *
 * This helper simulates sync events for manual testing.
 */

import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { WorkspaceEventType } from '@/infrastructure/events/event-bus';

export function mockSyncEmit() {
  const { eventBus } = useWorkspace();

  if (!eventBus) {
    console.warn('[mockSyncEmit] No event bus available');
    return;
  }

  // Simulate sync started
  eventBus.emit(WorkspaceEventType.SYNC_STARTED, {
    total: 10,
  });

  // Simulate progress updates
  let current = 0;
  const total = 10;

  const interval = setInterval(() => {
    current += 1;

    eventBus.emit(WorkspaceEventType.SYNC_PROGRESS, {
      current,
      total,
      message: `Syncing file ${current}/${total}...`,
    });

    if (current >= total) {
      clearInterval(interval);
      eventBus.emit(WorkspaceEventType.SYNC_COMPLETED, {
        message: `Synced ${total} files successfully`,
      });
    }
  }, 500);
}

export function mockSyncError() {
  const { eventBus } = useWorkspace();

  if (!eventBus) return;

  eventBus.emit(WorkspaceEventType.SYNC_STARTED, { total: 10 });
  eventBus.emit(WorkspaceEventType.SYNC_FAILED, {
    error: 'Network connection lost',
  });
}
```

**Add test button** (dev mode only):
```typescript
// In IDELayout.tsx or a dev tools component
if (import.meta.env.DEV) {
  return (
    <>
      <Button onClick={mockSyncEmit}>Test Sync Success</Button>
      <Button onClick={mockSyncError}>Test Sync Error</Button>
    </>
  );
}
```

### Step 6: Manual Testing (30 minutes)

**Test Case 1: Sync Progress Display**
1. Open IDE workspace
2. Click "Test Sync Success" button (dev mode)
3. Verify SyncStatusPanel appears
4. Verify progress bar updates in real-time
5. Verify "Synced 10 files successfully" message appears
6. Verify panel auto-hides after 3 seconds

**Test Case 2: Sync Error Display**
1. Open IDE workspace
2. Click "Test Sync Error" button (dev mode)
3. Verify SyncStatusPanel shows error state
4. Verify error message displayed
5. Verify panel auto-hides after 5 seconds

**Test Case 3: No Sync Activity**
1. Open workspace (no sync operations)
2. Verify SyncStatusPanel is hidden (doesn't render)
3. Check console: no "Sync started" logs

**Expected Console Output**:
```
[SyncStatusPanel] Sync started: 10
[SyncStatusPanel] Sync progress: 1 / 10
[SyncStatusPanel] Sync progress: 2 / 10
...
[SyncStatusPanel] Sync progress: 10 / 10
[SyncStatusPanel] Sync completed
```

## Validation Steps

### Code Quality (15 minutes)
```bash
# TypeScript check
pnpm tsc --noEmit 2>&1 | grep -E "(SyncStatusPanel|file-sync-status-store)" | grep "error" | wc -l
# Expected: 0 errors

# Check no circular dependencies
pnpm madge --circular src/presentation/components/ui/activity-indicators/SyncStatusPanel.tsx
# Expected: No circular dependencies
```

### Component Testing (15 minutes)

1. **Verify Event Listeners Registered**:
   - Open DevTools Console
   - Mount SyncStatusPanel component
   - Check for "Sync started" logs when events emitted

2. **Verify Store Updates**:
   ```javascript
   // In DevTools Console:
   useFileSyncStatusStore.getState().syncProgress
   // Should show { isRunning: true/false, current: N, total: M, ... }
   ```

3. **Verify Cleanup**:
   - Unmount SyncStatusPanel component
   - Emit sync events
   - Verify store no longer updates (event listeners removed)

## Constraints & Safeguards

### DO NOT:
- ❌ Modify existing SyncStatusIndicator component (it's fine as-is)
- ❌ Break file-sync-status-store's existing API
- ❌ Persist syncProgress to IndexedDB (runtime state only)
- ❌ Show SyncStatusPanel when no sync activity (wastes screen space)

### MUST:
- ✅ Use event bus pattern (AgentStatusSegment.tsx as reference)
- ✅ Clean up event listeners in useEffect return
- ✅ Auto-hide panel after sync completes (3s for success, 5s for error)
- ✅ Add console.log statements for debugging
- ✅ Add JSDoc comments to all new code
- ✅ Exclude syncProgress from persist() (ephemeral state)

### Validation Checklist:
- [ ] file-sync-status-store extended with syncProgress state
- [ ] 4 new actions added: setSyncStarted, setSyncProgress, setSyncCompleted, setSyncFailed
- [ ] SyncStatusPanel container component created
- [ ] Event listeners properly registered in useEffect
- [ ] Event listeners cleaned up in useEffect return
- [ ] Component auto-hides when no sync activity
- [ ] SyncStatusPanel exported from barrel index.ts
- [ ] Added to at least 2 layout components (IDE, Notes, or Study)
- [ ] Mock event emitters created for testing
- [ ] Zero TypeScript errors in modified files
- [ ] Manual test: Sync success shows progress then auto-hides
- [ ] Manual test: Sync error shows error then auto-hides
- [ ] Console logs show all event handlers firing
- [ ] JSDoc comments added

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query React 2025 useEffect cleanup patterns
- Query Zustand subscribeWithSelector best practices

### Deepwiki:
- Search zustand repo for event listener patterns
- Search React repo for useEffect event bus integration

## Output Location

Report completion to:
```
_bmad-output/p1-2-sync-events-completion-2026-01-03.md
```

Include:
- Code diff showing changes made
- Files created/modified count
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (screenshot of sync progress panel)
- Console log output showing event flow
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P1-2 completion status (SUCCESS/BLOCKED)
2. Files created/modified count (expected: 3-4 files)
3. Verification results (manual test passed/failed)
4. Screenshot/video of sync progress in action
5. Next action recommendation (proceed to P1-3 or address issues)

---

**Handoff Created**: 2026-01-03T16:50:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1095
**Team**: Team A
**Priority**: P1 HIGH - Users Don't See Sync Progress Feedback

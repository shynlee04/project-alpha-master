---
title: "5-1 Sync Queue Visualizer & Global Status"
epic: "Epic 5: Production-Ready Polish"
story: "5-1-sync-queue-visualizer"
status: "drafted"
priority: "P1"
points: 3
created: "2025-12-29"
sprint: "SPRINT-5"
team: "Team A"
dependencies:
  - "3-3-dual-write-sync"
---

# Story: 5-1 Sync Queue Visualizer & Global Status

**As a** user,
**I want** to see the status of my file syncs and background processes,
**So that** I trust the system is saving my work.

---

## Story Context

### From Epic 5

Epic 5 delivers "Production-Ready Polish". Story 5-1 delivers the sync queue visualizer that shows file operation status in the status bar, meeting FR-STATE-04 requirement.

### User Journey

1. User performs file operations
2. Status bar shows sync status
3. If sync fails, user clicks to see details
4. Process panel shows failed files with retry

### Technical Context

**Sync States:**
- `idle`: No operations
- `syncing`: Operations in progress
- `synced`: All operations complete
- `error`: Operation failed

**Components:**
- StatusBar integration
- SyncStatusSegment component
- ProcessPanel component

---

## Acceptance Criteria

### AC-1: Status Bar Sync Indicator

**Given** file operations (dual-write) are in progress
**When** the user looks at the status bar
**Then** it shows "Syncing..." with a spinning indicator
**And** changes to "Saved" (with checkmark) when queue is empty

---

### AC-2: Sync Error State

**Given** a sync operation fails
**When** the error occurs
**Then** status bar shows "Sync Error" (Red)
**And** error icon pulses
**And** tooltip shows error summary

---

### AC-3: Process Panel

**Given** the user clicks the status bar sync indicator
**When** the Process Panel opens
**Then** it lists:
- Active operations (with progress)
- Pending operations (in queue)
- Completed operations (last session)
- Failed operations (with error details)

---

### AC-4: Retry Failed Operations

**Given** a sync operation failed
**When** user clicks "Retry" on the failed item
**Then** the operation is re-queued
**And** progress updates in real-time
**And** on success, item moves to completed

---

### AC-5: Queue Statistics

**Given** the Process Panel is open
**When** user views queue statistics
**Then** it shows:
- Total operations in queue
- Estimated time remaining
- Success rate (percentage)
- Last sync timestamp

---

## Implementation Tasks

### Task 1: Create sync status store

**File:** `src/lib/state/sync-status-store.ts`

**Interface:**
```typescript
export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncQueueItem {
  id: string;
  type: 'read' | 'write' | 'delete';
  path: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  createdAt: Date;
}

export interface SyncStatusState {
  state: SyncState;
  queue: SyncQueueItem[];
  stats: {
    total: number;
    completed: number;
    failed: number;
    lastSync?: Date;
  };
  // Actions
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<SyncQueueItem>) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  retryItem: (id: string) => void;
}
```

---

### Task 2: Create SyncStatusSegment component

**File:** `src/components/ide/statusbar/SyncStatusSegment.tsx`

**Features:**
- Clickable status indicator
- Animated sync spinner
- Error state with pulse animation
- Tooltip with details

---

### Task 3: Create ProcessPanel component

**File:** `src/components/ide/ProcessPanel.tsx`

**Features:**
- Queue list with filtering
- Retry/Delete actions for failed items
- Progress bars for active items
- Statistics summary

---

### Task 4: Add unit tests

**File:** `src/lib/state/__tests__/sync-status-store.test.ts`

**Test cases:**
- Queue state transitions
- Error handling
- Retry logic
- Statistics calculation

---

## Technical Notes

### Performance

- Store updates should be <16ms (60fps)
- Queue filtering should be memoized
- Large queues (>100 items) should virtualize

### Persistence

- Queue state persists across sessions
- Failed items preserved for retry
- Completed items cleared on success

---

## Dependencies

| Dependency | Status | Purpose |
|------------|--------|---------|
| Story 3-3 | Drafted | Sync operations |
| Zustand | Installed | State management |
| useStatusBarStore | Exists | Status bar integration |

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Unit tests written and passing
- [ ] Status bar integration complete
- [ ] Process panel implemented
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `5-1-sync-queue-visualizer: done`

---

## Dev Agent Record

**Agent:** TBD
**Session:** TBD

#### Task Progress:
- [ ] T1: Create sync status store
- [ ] T2: Create SyncStatusSegment component
- [ ] T3: Create ProcessPanel component
- [ ] T4: Add unit tests

#### Research Executed:
- [ ] Context7: Zustand patterns
- [ ] DeepWiki: Status bar component patterns

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/state/sync-status-store.ts | Created | - |
| src/components/ide/statusbar/SyncStatusSegment.tsx | Created | - |
| src/components/ide/ProcessPanel.tsx | Created | - |
| src/lib/state/__tests__/sync-status-store.test.ts | Created | - |

#### Decisions Made:
- TBD

---

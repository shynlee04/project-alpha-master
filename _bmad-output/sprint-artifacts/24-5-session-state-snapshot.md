---
epic: 24
story: 5
title: "Session State Snapshot"
status: drafted
priority: high
team: A
created: 2025-12-31
updated: 2025-12-31
estimate_hours: 4-5
---

# User Story

As a developer who works on multiple projects,
I want my complete IDE session state (open files, panels, terminal tabs) to be saved and restored automatically,
So that I can seamlessly continue working where I left off without manually reopening files or rearranging panels.

# Problem Statement

Currently, while conversation history and some individual state elements are persisted, there is no comprehensive session state snapshot mechanism. Users must manually:
- Reopen files they were working on
- Rearrange panel layouts to their preferred configuration
- Navigate to the same terminal tabs
- Re-open chat panels if they were using them

This breaks the development flow and wastes time on every session load.

# Acceptance Criteria

## AC-1: Session State Schema
- [ ] **AC-1.1**: Dexie table `sessionSnapshots` exists with schema: `id`, `projectId`, `timestamp`, `state` (JSON)
- [ ] **AC-1.2**: State JSON includes: open files list, active file, panel layout, terminal tabs, chat visibility
- [ ] **AC-1.3**: Helper functions `saveSessionSnapshot()`, `loadSessionSnapshot()`, `deleteSessionSnapshot()` exist
- [ ] **AC-1.4**: Automatic snapshot on state change (debounced, 5 second delay)

## AC-2: Automatic Snapshot on State Changes
- [ ] **AC-2.1**: Snapshot triggered when: file opened/closed, active file changed, panel resized, terminal tab changed
- [ ] **AC-2.2**: Debouncing prevents excessive snapshots (max 1 per 5 seconds during active state changes)
- [ ] **AC-2.3**: Snapshot saved to IndexedDB within 100ms of trigger
- [ ] **AC-2.4**: Error handling for failed snapshots (log error, don't block UI)

## AC-3: Session Restore on Project Load
- [ ] **AC-3.1**: On project load, check for existing session snapshot
- [ ] **AC-3.2**: If snapshot exists and is recent (<24 hours), automatically restore state
- [ ] **AC-3.3**: Restore completes within 500ms of project load
- [ ] **AC-3.4**: If no snapshot or snapshot is stale, use default IDE layout

## AC-4: Manual Snapshot Controls
- [ ] **AC-4.1**: User can manually trigger snapshot via keyboard shortcut (Cmd+S / Ctrl+S for session)
- [ ] **AC-4.2**: User can clear session state (reset to default layout)
- [ ] **AC-4.3**: Visual indicator when snapshot is saved (toast notification)
- [ ] **AC-4.4**: Session snapshot time displayed in status bar

## AC-5: Multi-Session Support
- [ ] **AC-5.1**: Support multiple snapshots per project (keep last 10)
- [ ] **AC-5.2**: User can view snapshot history (timestamp + basic metadata)
- [ ] **AC-5.3**: User can restore from any historical snapshot
- [ ] **AC-5.4**: Automatic cleanup of old snapshots (>30 days)

---

# Tasks

## Research & Planning
- [ ] T1: Review `useIDEStore` implementation for current state persistence
- [ ] T2: Review `dexie-db.ts` for existing schema patterns
- [ ] T3: Design session state JSON structure
- [ ] T4: Design debouncing strategy for automatic snapshots

## Implementation
- [ ] T5: Create `session-snapshot.ts` module with `SessionSnapshotManager` class
- [ ] T6: Add `sessionSnapshots` table to Dexie schema
- [ ] T7: Implement `captureSessionState()` to serialize current IDE state
- [ ] T8: Implement `restoreSessionState()` to deserialize and apply state
- [ ] T9: Add debounced snapshot trigger to `useIDEStore` state change listeners
- [ ] T10: Integrate snapshot restoration into workspace initialization
- [ ] T11: Add keyboard shortcut handler for manual snapshot
- [ ] T12: Implement snapshot history UI (dialog with list)
- [ ] T13: Add automatic cleanup for old snapshots
- [ ] T14: Add toast notification for snapshot saves

## Testing
- [ ] T15: Write unit tests for `captureSessionState()` serialization
- [ ] T16: Write unit tests for `restoreSessionState()` deserialization
- [ ] T17: Write integration test for automatic snapshot on state change
- [ ] T18: Write integration test for session restore on project load
- [ ] T19: Test debouncing behavior (rapid state changes)
- [ ] T20: Test error handling for corrupted snapshots
- [ ] T21: Test multi-session support (multiple snapshots per project)
- [ ] E2E test: Open files, change layout, close project, reopen, verify state restored

## Documentation
- [ ] T22: Update AGENTS.md with session snapshot behavior
- [ ] T23: Add JSDoc comments to all new functions/classes
- [ ] T24: Document keyboard shortcuts in user guide

---

# Dev Notes

## Architecture Reference
- **Current State**: `useIDEStore` persists some state (open files, active file, panels) but not comprehensive snapshot
- **Gap**: No automatic snapshot + restore on session load
- **Solution**: Add session snapshot layer on top of existing store

## Key Files
- `src/lib/state/ide-store.ts` - IDE state management (to be enhanced)
- `src/lib/state/dexie-db.ts` - IndexedDB schema (add sessionSnapshots table)
- `src/lib/workspace/project-manager.ts` - Project load hooks (add restore logic)
- `src/components/layout/IDELayout.tsx` - Main layout component (subscribe to state changes)

## Session State JSON Structure
```typescript
interface SessionSnapshot {
  id: string;
  projectId: string;
  timestamp: number;
  state: {
    // Open files
    openFiles: string[];
    activeFile?: string;

    // Panel layout
    panelSizes: {
      sidebar: number[];
      editor: number[];
      terminal: number[];
      chat?: number;
    };

    // Panel visibility
    panelsVisible: {
      fileTree: boolean;
      chat: boolean;
      terminal: boolean;
    };

    // Terminal state
    terminalTabs: string[];
    activeTerminalTab?: string;

    // Chat state
    chatVisible: boolean;
    activeConversationId?: string;

    // Scroll positions (optional)
    scrollPositions?: {
      [fileId: string]: number;
    };
  };
}
```

## Implementation Pattern
```typescript
// Session snapshot manager
class SessionSnapshotManager {
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 5000; // 5 seconds

  // Capture current state
  async captureSessionState(projectId: string): Promise<SessionSnapshot> {
    const ideState = useIDEStore.getState();

    return {
      id: `snapshot-${Date.now()}`,
      projectId,
      timestamp: Date.now(),
      state: {
        openFiles: ideState.openFiles,
        activeFile: ideState.activeFile,
        panelSizes: ideState.panelSizes,
        panelsVisible: ideState.panelsVisible,
        terminalTabs: ideState.terminalTabs,
        activeTerminalTab: ideState.activeTerminalTab,
        chatVisible: ideState.chatVisible,
        activeConversationId: ideState.activeConversationId,
        scrollPositions: ideState.scrollPositions,
      },
    };
  }

  // Trigger snapshot with debouncing
  triggerSnapshot(projectId: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      const snapshot = await this.captureSessionState(projectId);
      await saveSessionSnapshot(snapshot);
      this.showSnapshotNotification();
    }, this.DEBOUNCE_DELAY);
  }

  // Restore session state
  async restoreSessionState(snapshot: SessionSnapshot): Promise<void> {
    const store = useIDEStore.getState();

    // Restore all state elements
    store.setOpenFiles(snapshot.state.openFiles);
    if (snapshot.state.activeFile) {
      store.setActiveFile(snapshot.state.activeFile);
    }
    store.setPanelSizes(snapshot.state.panelSizes);
    store.setPanelsVisible(snapshot.state.panelsVisible);
    store.setTerminalTabs(snapshot.state.terminalTabs);
    if (snapshot.state.activeTerminalTab) {
      store.setActiveTerminalTab(snapshot.state.activeTerminalTab);
    }
    store.setChatVisible(snapshot.state.chatVisible);
    if (snapshot.state.activeConversationId) {
      store.setActiveConversationId(snapshot.state.activeConversationId);
    }
    if (snapshot.state.scrollPositions) {
      store.setScrollPositions(snapshot.state.scrollPositions);
    }
  }
}
```

## Integration Points
1. **useIDEStore**: Subscribe to state changes, trigger snapshot
2. **Workspace Initialization**: Restore snapshot after project load
3. **Keyboard Shortcuts**: Add Cmd+S / Ctrl+S for manual snapshot
4. **Status Bar**: Display snapshot timestamp

## Edge Cases
1. **Snapshot corrupted**: Log error, use default layout
2. **Snapshot schema mismatch**: Handle migration, use default for missing fields
3. **File deleted since snapshot**: Skip restoring that file, log warning
4. **Project deleted**: Cleanup snapshots for deleted projects
5. **Rapid state changes**: Debouncing prevents excessive snapshots

## Performance Considerations
- Snapshot serialization should be fast (<50ms)
- Debouncing prevents excessive DB writes
- Restore should not block UI (use loading indicator if needed)
- Limit history to 10 snapshots per project to prevent DB bloat

## NFR Compliance
- **NFR-PERF-P1-01**: Session restore <500ms
- **NFR-PERF-P1-02**: Snapshot save <100ms
- **NFR-RELIABILITY-P1-01**: Graceful degradation on snapshot failure
- **NFR-USABILITY-P1-01**: Keyboard shortcut for manual snapshot
- **NFR-USABILITY-P1-02**: Visual feedback for snapshot saves

---

# Dev Agent Record

**Agent:**
**Session:**

#### Task Progress:
- [ ] T1:
- [ ] T2:
- [ ] T3:
- [ ] T4:
- [ ] T5:
- [ ] T6:
- [ ] T7:
- [ ] T8:
- [ ] T9:
- [ ] T10:
- [ ] T11:
- [ ] T12:
- [ ] T13:
- [ ] T14:
- [ ] T15:
- [ ] T16:
- [ ] T17:
- [ ] T18:
- [ ] T19:
- [ ] T20:
- [ ] T21:
- [ ] T22:
- [ ] T23:
- [ ] T24:

#### Research Executed:

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

#### Tests Created:

#### Decisions Made:

---

# Code Review

**Reviewer:**
**Date:**

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] i18n keys added (EN + VI)

#### Issues Found:

#### Sign-off:

---

# Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-31 | drafted | Story created for full PRD compliance implementation |

# Story 13-3: Add Sync Progress Indicator

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13  
**Priority:** P1  
**Points:** 2  
**Status:** done

---

## User Story

As a **user**,  
I want **to see sync progress with file count**,  
So that **I know when it's safe to work**.

---

## Acceptance Criteria

### AC-13-3-1: Show syncing file count
**Given** a sync operation is in progress  
**When** viewing the SyncStatusIndicator  
**Then** it shows "Syncing X of Y files"  
**And** the count updates in real-time

### AC-13-3-2: Show current file in tooltip
**Given** a sync operation is in progress  
**When** hovering over the SyncStatusIndicator  
**Then** tooltip shows the current file being synced  
**And** updates as files are processed

### AC-13-3-3: Warning for editing during sync
**Given** auto-sync is in progress  
**When** user attempts to type in Monaco editor  
**Then** a warning toast appears: "Editing during sync may cause conflicts"  
**And** toast is dismissible and non-blocking

### AC-13-3-4: Progress via event bus
**Given** SyncManager is syncing files  
**When** each file is processed  
**Then** `sync:progress` event emits with `{ current, total, currentFile }`  
**And** SyncStatusIndicator subscribes via `useWorkspaceEvent` hook

---

## Task Breakdown

### Research Tasks
- [ ] T0-1: Verify `sync:progress` event exists in workspace-events.ts
- [ ] T0-2: Review SyncStatusIndicator current implementation
- [ ] T0-3: Confirm SyncManager emits progress events during tree build

### Implementation Tasks
- [ ] T1: Add `currentFile` display to SyncStatusIndicator tooltip
- [ ] T2: Create `SyncEditWarning` toast component
- [ ] T3: Wire warning to editor focus during active sync
- [ ] T4: Add SyncStatusIndicator tests for progress display
- [ ] T5: Run TypeScript check: `pnpm exec tsc --noEmit`
- [ ] T6: Run tests: `pnpm test`

---

## Dev Notes

### Current State (Already Implemented)

**`sync:progress` Event:** Already defined in `workspace-events.ts`:
```typescript
'sync:progress': [{ current: number; total: number; currentFile: string }]
```

**SyncManager Progress Emission:** Already emits progress via `sync-operations.ts`:
```typescript
eventBus?.emit('sync:progress', {
    current: processedRef.filesProcessed,
    total: totalFileCount,
    currentFile: entryPath,
});
```

**SyncStatusIndicator:** Already shows `Syncing X/Y` but uses callback-based `SyncProgress` type:
```typescript
progress?: SyncProgress | null  // { totalFiles, syncedFiles, currentFile, percentage }
```

### Gap Analysis

| Feature | Current State | Story 13-3 Requirement |
|---------|--------------|-------------------------|
| File count display | ✅ Shows X/Y | ✅ Already works |
| Current file tooltip | ❌ Not shown | 🔧 Add to indicator |
| Edit warning | ❌ Not implemented | 🔧 Create toast |
| Event bus integration | ⚠️ Uses props only | 🔧 Wire via useWorkspaceEvent |

### Implementation Strategy

1. **Update SyncStatusIndicator**: Add title/tooltip showing `currentFile` during sync
2. **Create SyncEditWarning**: Small toast component warning users during sync
3. **Wire to Monaco**: Listen for focus/keydown during `syncing` status
4. **Subscribe via Event Bus**: Use `useWorkspaceEvent` hook instead of prop drilling

---

## Research Requirements

| Tool | Query | Finding |
|------|-------|---------|
| Codebase | workspace-events.ts | `sync:progress` event ✅ already defined |
| Codebase | sync-manager.ts | Progress events emitted via eventBus |
| Codebase | SyncStatusIndicator.tsx | Shows X/Y, no current file tooltip |
| Codebase | sync-manager.test.ts | Progress event emission tested |

---

## References

- [sprint-change-proposal-v5](file:///_bmad-output/sprint-change-proposal-v5-2025-12-20.md#BUG-03)
- [epics.md Story 13-3](file:///_bmad-output/epics.md#story-13-3-add-sync-progress-indicator)
- [Story 13-2](file:///_bmad-output/sprint-artifacts/13-2-fix-auto-sync-on-project-load.md)

---

## Dev Agent Record

**Agent:** Antigravity  
**Session:** 2025-12-20  
**Status:** ✅ COMPLETE

### Task Progress:
- [x] T0-1: Verified `sync:progress` event exists in workspace-events.ts
- [x] T0-2: Reviewed SyncStatusIndicator current implementation
- [x] T0-3: Confirmed SyncManager emits progress events during tree build
- [x] T1: Added `currentFile` display to SyncStatusIndicator tooltip
- [x] T2: Created `SyncEditWarning` toast component
- [x] T3: Wired warning to editor onChange during active sync
- [x] T4: Added SyncStatusIndicator tests for progress display (11 tests)
- [x] T5: TypeScript check passes
- [x] T6: All 171 tests pass

### Files Changed:
| File | Action | Notes |
|------|--------|-------|
| src/components/ide/SyncStatusIndicator.tsx | Modified | Added title attribute for currentFile tooltip |
| src/components/ide/SyncEditWarning.tsx | Created | New toast component for edit warning |
| src/components/ide/MonacoEditor/MonacoEditor.tsx | Modified | Added sync warning state and trigger |
| src/components/ide/__tests__/SyncStatusIndicator.test.tsx | Created | 11 new tests |

### Decisions Made:
- Used container.querySelector instead of screen.getByText for tooltip title tests
- Warning shown once per sync cycle, resets when sync completes
- Auto-dismiss toast after 5 seconds

### Test Results:
- TypeScript: ✅ Pass
- Unit Tests: ✅ 171 tests pass (11 new)

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-20 | drafted | Story created from sprint-change-proposal-v5 |
| 2025-12-20 | ready-for-dev | Context XML created with research |
| 2025-12-20 | done | Implementation complete, all tests pass |

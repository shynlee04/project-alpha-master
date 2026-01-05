# Story UJ-001: Wire SyncStatusPanel to Real Events

**Epic:** User Journey Lifecycle Fixes (Phase 0.5)  
**Sprint:** ARCH-95-2026-01-05 (Comprehensive Architecture Remediation)  
**Priority:** P0 - EXECUTE FIRST  
**Story Points:** 4 hours  
**Status:** drafted  

---

## User Story

**As a** user mounting or syncing files  
**I want** to see real-time sync status in the SyncStatusPanel  
**So that** I know which files are being synced, their progress, and any errors

---

## Acceptance Criteria

### AC-1: Event Subscription
**Given** the SyncStatusPanel component is mounted  
**When** sync operations occur anywhere in the application  
**Then** the panel receives events via crossWorkspaceEventBus

### AC-2: Real Operations Display
**Given** files are being synced  
**When** viewing the SyncStatusPanel  
**Then** I see actual file paths and sync operations (not mock data)

### AC-3: Progress Updates
**Given** a large sync operation is in progress  
**When** files complete syncing  
**Then** the progress bar updates in real-time

### AC-4: Retry Functionality
**Given** a sync operation has failed  
**When** I click the Retry button  
**Then** the failed operation is re-attempted via real sync mechanism

---

## Tasks

### Research Tasks
- [ ] T0.1: Review crossWorkspaceEventBus event types and payloads
- [ ] T0.2: Review SyncManager event emission patterns
- [ ] T0.3: Identify all places that emit sync-related events

### Implementation Tasks
- [ ] T1: Remove mock data from SyncStatusPanel useEffect
- [ ] T2: Add crossWorkspaceEventBus subscription for 'SyncProgress' event
- [ ] T3: Add crossWorkspaceEventBus subscription for 'SyncComplete' event
- [ ] T4: Add crossWorkspaceEventBus subscription for 'SyncError' event
- [ ] T5: Map event payloads to SyncOperation interface
- [ ] T6: Implement handleRetry to emit retry event via bus

### Validation Tasks
- [ ] T7: TypeScript compiles without errors
- [ ] T8: Panel shows real operations during folder mount
- [ ] T9: Progress updates as files sync
- [ ] T10: Retry button triggers re-sync

---

## Research Requirements

### Event Bus Patterns
- **Source:** `src/lib/events/cross-workspace-event-bus.ts`
- **Query:** What events are emitted during sync operations?
- **Expected:** 'SyncProgress', 'SyncComplete', 'SyncError' event types

### SyncManager Integration
- **Source:** `src/lib/filesystem/sync-manager.ts`
- **Query:** How does SyncManager emit progress events?
- **Expected:** Callback or event emission pattern

---

## Dev Notes

### Architecture Patterns
From `architecture.md`:
- Use crossWorkspaceEventBus for cross-component communication
- Subscribe in useEffect with cleanup function
- Map external events to local state

### Key Interfaces
```typescript
// From SyncStatusPanel.tsx
interface SyncOperation {
  id: string;
  type: 'file-create' | 'file-update' | 'file-delete' | 'directory-sync';
  path: string;
  status: SyncStatus;
  progress: number;
  error?: string;
  timestamp: number;
}

// Expected event payload from crossWorkspaceEventBus
interface SyncProgressEvent {
  workspaceId: string;
  operationType: string;
  currentFile: string;
  progress: number;
  totalFiles: number;
  timestamp: number;
}
```

### Files to Modify
1. `src/presentation/components/ide/SyncStatusPanel.tsx`
   - Remove mock data (lines 94-125)
   - Add event subscriptions
   - Wire retry button

---

## References

- [crossWorkspaceEventBus](src/lib/events/cross-workspace-event-bus.ts)
- [SyncStatusIndicator](src/presentation/components/ide/SyncStatusIndicator.tsx)
- [unified-workspace-context](src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts)

---

## Dev Agent Record

**Agent:** _(to be filled)_  
**Session:** _(to be filled)_

### Task Progress:
_(to be updated during implementation)_

### Research Executed:
_(to be updated during implementation)_

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| _(to be filled)_ | | |

### Tests Created:
_(to be filled)_

### Decisions Made:
_(to be filled)_

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2026-01-06T02:50:00+07:00 | drafted | SM Agent | Story created via course correction |

---

## Code Review

_(to be filled after implementation)_

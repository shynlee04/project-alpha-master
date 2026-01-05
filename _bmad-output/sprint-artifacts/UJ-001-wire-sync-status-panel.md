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
- [x] T0.1: Review crossWorkspaceEventBus event types and payloads
- [x] T0.2: Review SyncManager event emission patterns
- [x] T0.3: Identify all places that emit sync-related events

### Implementation Tasks
- [x] T1: Remove mock data from SyncStatusPanel useEffect
- [x] T2: Add crossWorkspaceEventBus subscription for 'SyncProgress' event (via onSyncStatus)
- [x] T3: Add crossWorkspaceEventBus subscription for 'SyncComplete' event (via onSyncStatus)
- [x] T4: Add crossWorkspaceEventBus subscription for 'SyncError' event (via onSyncStatus)
- [x] T5: Map event payloads to SyncOperation interface
- [x] T6: Implement handleRetry to emit retry event via bus

### Validation Tasks
- [x] T7: TypeScript compiles without errors
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

**Agent:** Gemini 2.5 Pro (Antigravity)  
**Session:** 2026-01-06T03:00:00+07:00

### Task Progress:
- [x] T0.1-T0.3: Reviewed crossWorkspaceEventBus - found onSyncStatus and onFileChange events
- [x] T1-T6: Implemented real event subscriptions replacing mock data
- [x] T7: TypeScript compiles without errors

### Research Executed:
- Codebase: `cross-workspace-event-bus.ts` → Found SyncStatusEvent and FileChangeEvent types
- Codebase: `SyncStatusPanel.tsx` → Identified mock data at lines 94-125

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/presentation/components/ide/SyncStatusPanel.tsx | Modified | +90/-45 |

### Tests Created:
- None (manual validation pending)

### Decisions Made:
1. **Event Accumulation Pattern:** Used Map<path, SyncOperation> to accumulate events and avoid duplicates
2. **Status Mapping:** Mapped SyncStatusEvent.status (syncing/synced/error) to SyncStatus (in-progress/completed/failed)
3. **Auto-cleanup:** Clear completed operations after 30s, file operations after 10s
4. **Retry via Event:** handleRetry emits SyncStatusEvent with status='syncing' for re-sync_

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2026-01-06T02:50:00+07:00 | drafted | SM Agent | Story created via course correction |
| 2026-01-06T03:05:00+07:00 | in-progress | Dev Agent | Implementation complete, pending runtime validation |

---

## Code Review

_(to be filled after implementation)_

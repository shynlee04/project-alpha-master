---
# Story File: PS-02-B Hot Reactive Sync Integration

**Story ID**: `PS-02-B`  
**Epic**: `EPIC-CC-01` (Project Space Foundation)  
**Created**: 2026-01-15  
**Status**: `READY_FOR_DEV`  
**Priority**: `P0`  
**Team**: `Team B`  
**Estimated Effort**: `4h`

---

## Story Overview

Connect `FSAStorageAdapter.watch()` to the React UI for hot reactive file synchronization. This enables real-time detection of external file changes (e.g., from VS Code, terminal, or other editors) and reflects them immediately in the IDE.

**Addresses Issue**: `URI-03` (External file changes not detected - watch() disconnected)

---

## Background & Context

### Dependencies
- **PS-02-A** (COMPLETED): Platform Detection & Storage Routing
- **FSA-ADAPTER** (COMPLETED): FSAStorageAdapter with watch() method
- **PS-04** (COMPLETED): Handle Persistence Architecture

### Technical Foundation
From PS-02-A, we now have:
- `FSAStorageAdapter.watch(callback)` - Watch for file changes with SHA-256 hashing
- `StorageAdapterFactory` - Create appropriate adapters per platform
- `platform-detection.ts` - Platform capability detection

### The Problem
Currently:
1. `FSAStorageAdapter.watch()` exists but produces no visible UI effect
2. External file changes go undetected by the user
3. No sync status indication when files are modified externally

### The Solution
Create a sync slice that:
1. Connects `watch()` events to React state
2. Provides sync status indicators
3. Handles permission boundary enforcement

---

## User Story

**As a** developer working on a project folder in the IDE workspace,  
**I want** to see when files are modified externally (e.g., by VS Code, terminal, or file manager),  
**So that** I always have the latest content without manual refresh.

---

## Requirements

### Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Create `useVFSSyncSlice` for watch→UI connection | P0 | DONE |
| FR-02 | Create `SyncStatusIndicator` component | P0 | DONE |
| FR-03 | Display file change notifications | P0 | DONE |
| FR-04 | Handle permission revocation gracefully | P1 | DONE |
| FR-05 | Debounce rapid successive changes | P1 | DONE |
| **FR-06** | **Integrate useVFSAutoWatch in IDELayoutMain** | **P0** | **IN_PROGRESS** |
| **FR-07** | **Bridge FSA watch callbacks to crossWorkspaceEventBus** | **P0** | **IN_PROGRESS** |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | UI update latency | < 500ms |
| NFR-02 | Memory footprint | < 50KB for sync slice |
| NFR-03 | Battery impact (mobile) | Minimal polling |
| NFR-04 | Fallback if watch() unsupported | IndexedDB polling |

---

## Implementation Plan

### Phase 1: Sync Slice Foundation

```
src/infrastructure/persistence/stores/workspace/slices/
└── use-vfs-sync-slice.ts    ✅ Create this file

State:
  - syncState: 'idle' | 'syncing' | 'error' | 'permission-revoked'
  - lastSyncedAt: Date | null
  - pendingChanges: FileChangeEvent[]
  - changeCount: number
  - errorMessage: string | null

Actions:
  - startWatch(projectId): void
  - stopWatch(): void
  - acknowledgeChange(filePath): void
  - dismissNotification(filePath): void
  - retryAfterError(): void
```

### Phase 2: UI Components

```
src/presentation/components/workspace/
├── sync/
│   ├── SyncStatusIndicator.tsx    ✅ Create
│   ├── FileChangeNotification.tsx ✅ Create
│   └── sync-status.css            ✅ Create (8-bit design)
└── index.ts                       ✅ Update exports
```

### Phase 3: Integration (IN PROGRESS)

```
Integration Points:
1. useWorkspaceFileSystem.ts - Initialize watch on project load
2. IDELayoutMain.tsx - Add useVFSAutoWatch() call ⏮️ IN PROGRESS
3. FSAStorageAdapter - Bridge to crossWorkspaceEventBus ⏮️ IN PROGRESS
4. Fix SyncDevTools to use crossWorkspaceEventBus instead of dead bus
5. Uncomment SyncStatusPanel in IDELayoutMain.tsx
```

---

## File Changes Summary

### New Files to Create

| File | description | Lines (est.) |
|------|---------|--------------|
| `src/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice.ts` | VFS sync Zustand slice | 200 |
| `src/presentation/components/workspace/sync/SyncStatusIndicator.tsx` | Sync status badge | 100 |
| `src/presentation/components/workspace/sync/FileChangeNotification.tsx` | Change toaster | 80 |
| `src/presentation/components/workspace/sync/sync-status.css` | 8-bit styles | 50 |
| `src/presentation/components/workspace/sync/index.ts` | Barrel export | 30 |

### Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts` | Initialize watch ⏮️ | P0 |
| `src/presentation/components/layout/IDELayoutMain.tsx` | Add useVFSAutoWatch, uncomment SyncStatusPanel ⏮️ | P0 |
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | Bridge to crossWorkspaceEventBus ⏮️ | P0 |
| `src/presentation/components/dev/SyncDevTools.tsx` | Fix to use crossWorkspaceEventBus | P1 |
| `src/presentation/components/workspace/index.ts` | Export sync components | P1 |
| `src/presentation/components/ide/IDELayout.tsx` | Add status to status bar | P2 |

### Files to Reference

| File | description |
|------|---------|
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | watch() implementation |
| `src/infrastructure/filesystem/StorageAdapterFactory.ts` | Adapter creation |
| `src/infrastructure/sync/core/sync-result-types.ts` | FileChangeEvent types |

---

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-01 | External file changes appear in UI within 500ms | Manual test |
| AC-02 | Sync status indicator shows current state | Visual inspection |
| AC-03 | Permission revocation handled gracefully | Manual test |
| AC-04 | No memory leaks on component unmount | Console check |
| AC-05 | TypeScript compiles with 0 errors | `pnpm tsc --noEmit` |
| AC-06 | 8-bit design system compliance | Visual inspection |
| AC-07 | Mobile-friendly (touch targets 44px+) | Mobile test |

---

## Story Tasks

### Task 1: Create useVFSSyncSlice (COMPLETED)

- [x] Define VFS sync state interface
- [x] Implement startWatch() with FSAStorageAdapter.watch()
- [x] Implement stopWatch() with cleanup
- [x] Handle FileChangeEvent callbacks
- [x] Implement acknowledge/dismiss actions
- [x] Add error handling for permission revocation
- [x] Write unit tests (≥80% coverage)

### Task 2: Create SyncStatusIndicator Component (COMPLETED)

- [x] Design 8-bit status badge (idle, syncing, error, revoked)
- [x] Connect to useVFSSyncSlice
- [x] Add to status bar area
- [x] Implement animated transitions
- [x] Write component tests

### Task 3: Create FileChangeNotification Component (COMPLETED)

- [x] Design toaster notification for changes
- [x] Show file path and change type
- [x] "Refresh" button to apply changes
- [x] Auto-dismiss after 5s
- [x] Write component tests

### Task 4: Integration (IN PROGRESS - MISSING FROM ORIGINAL)

- [ ] Add useVFSAutoWatch() call in IDELayoutMain.tsx ⏮️
- [ ] Bridge FSA watch callbacks to crossWorkspaceEventBus ⏮️
- [ ] Fix SyncDevTools to use crossWorkspaceEventBus
- [ ] Uncomment SyncStatusPanel in IDELayoutMain.tsx
- [ ] Full E2E testing
- [ ] Performance testing (latency < 500ms)
- [ ] Auto-dismiss after 5s
- [ ] Write component tests

### Task 4: Integration & Testing (30min)

- [ ] Integrate with useWorkspaceFileSystem
- [ ] Connect MonacoEditor to change events
- [ ] Full E2E testing
- [ ] Performance testing (latency < 500ms)

---

## Technical Details

### VFS Sync Slice Interface

```typescript
interface VFSSyncState {
  // State
  syncState: 'idle' | 'syncing' | 'error' | 'permission-revoked';
  lastSyncedAt: Date | null;
  pendingChanges: FileChangeEvent[];
  changeCount: number;
  errorMessage: string | null;
  
  // Actions
  startWatch(projectId: string): void;
  stopWatch(): void;
  acknowledgeChange(filePath: string): void;
  dismissNotification(filePath: string): void;
  retryAfterError(): void;
  clearAllChanges(): void;
}
```

### Sync Status Indicator States

```
┌─────────────────────────────────────────────────────┐
│  IDLE           │  SYNCING        │  ERROR          │
│  ├─ Green dot   │  ├─ Yellow dot  │  ├─ Red dot     │
│  ├─ "Synced"    │  ├─ "Syncing..." │  ├─ "Error"     │
│  └─ No action   │  └─ Spinner     │  └─ Retry btn   │
├─────────────────────────────────────────────────────┤
│  PERMISSION-REVOKED                                 │
│  ├─ Gray dot    │  "Folder access revoked"          │
│  ├─ "Revoked"   │  ├─ Re-pick folder button         │
│  └─ Warning     │  └─ Dismiss button                │
└─────────────────────────────────────────────────────┘
```

### FileChangeEvent Type

```typescript
interface FileChangeEvent {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: Date;
  oldHash?: string;  // For modified
  newHash?: string;  // For modified/created
  isExternal: boolean;
}
```

---

## Design System (8-bit)

### Sync Status Colors

```css
/* 8-bit design tokens */
--color-sync-idle: #22c55e;      /* Green-500 */
--color-sync-syncing: #eab308;   /* Yellow-500 */
--color-sync-error: #ef4444;     /* Red-500 */
--color-sync-revoked: #6b7280;   /* Gray-500 */

/* No gradients, no blur, sharp corners */
.sync-badge {
  border: 2px solid var(--color-sync-idle);
  border-radius: 0;
  box-shadow: 4px 4px 0 0 var(--color-sync-idle);
}
```

### Touch Targets

```
SyncStatusIndicator: 44x44px minimum
Refresh button: 44x44px
Dismiss button: 44x44px
Re-pick folder: 48x48px (larger for importance)
```

---

## Testing Strategy

### Unit Tests (useVFSSyncSlice)

```typescript
describe('useVFSSyncSlice', () => {
  it('should start watch on project load', () => {});
  it('should stop watch on cleanup', () => {});
  it('should track pending changes', () => {});
  it('should handle permission revocation', () => {});
  it('should debounce rapid changes', () => {});
  it('should not leak memory on unmount', () => {});
});
```

### Component Tests (SyncStatusIndicator)

```typescript
describe('SyncStatusIndicator', () => {
  it('should show idle state when synced', () => {});
  it('should show syncing state during sync', () => {});
  it('should show error state on failure', () => {});
  it('should animate state transitions', () => {});
});
```

### E2E Tests

```typescript
describe('Hot Reactive Sync E2E', () => {
  it('should detect external file change within 500ms', () => {});
  it('should show notification for new file', () => {});
  it('should show notification for deleted file', () => {});
  it('should handle permission revocation gracefully', () => {});
});
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] TypeScript: 0 errors (`pnpm tsc --noEmit`)
- [ ] Tests: ≥80% coverage, all passing
- [ ] Design: 8-bit system compliant
- [ ] Design Review: Approved
- [ ] Code Review: Approved
- [ ] E2E Tests: All passing
- [ ] Documentation: Updated

---

## Dependencies & Blockers

### Blockers (Resolved)
- ✅ PS-02-A: Platform Detection & Storage Routing
- ✅ FSA-ADAPTER: FSAStorageAdapter with watch()

### Dependencies
- None (all dependencies resolved)

### Unblocks
- PS-03: Consolidate Legacy Sync Code (after PS-02-B)
- PS-05: VFS Tree Structure (related)

---

## Notes

### Related Stories
- **PS-02-A**: Platform Detection & Storage Routing (completed)
- **PS-04**: Handle Persistence Architecture (completed)
- **PS-05**: VFS Tree Structure (depends on PS-04, related to PS-02-B)

### Related Files
- `src/infrastructure/filesystem/fsa-storage-adapter.ts` - Watch implementation
- `src/infrastructure/filesystem/storage-types.ts` - FileChangeEvent type
- `src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts` - Integration point

### Performance Considerations
- Debounce rapid file system changes (>5 changes/sec)
- Limit pending changes to 100 (FIFO)
- Clean up old change events after 1 hour

### Security Considerations
- Validate all file paths from watch events
- Sanitize file names in notifications
- Handle permission revocation as security feature

---

## Changelog

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-01-15 | 1.0 | Team B | Initial creation |

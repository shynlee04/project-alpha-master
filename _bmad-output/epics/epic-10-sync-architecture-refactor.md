# Epic 10: Sync Architecture Refactor

**Goal:** Transform sync layer from callback-based to event-driven architecture for AI agent observability and future multi-root support.

**Prerequisites:** Epic 3 hotfix stories complete  
**Status:** IN PROGRESS (Infrastructure complete, wiring incomplete)  
**Priority:** P1  
**Gap Analysis (2025-12-21):** Event bus types exist (`workspace-events.ts`) but no `.emit()` calls found in codebase

### Story 10.1: Create Event Bus Infrastructure ✅ DONE

As a **developer**,
I want **a typed event bus for workspace-wide events**,
So that **components can observe state changes without direct coupling**.

**Acceptance Criteria:**

- **AC-10-1-1:** `WorkspaceEvents` interface defines all event types with typed payloads ✅
- **AC-10-1-2:** `createWorkspaceEventBus()` returns typed EventEmitter3 instance ✅
- **AC-10-1-3:** `useWorkspaceEvent()` React hook with automatic cleanup ✅
- **AC-10-1-4:** Event bus instance accessible via WorkspaceContext
- **AC-10-1-5:** Unit tests for event subscription/emission

---

### Story 10.2: Refactor SyncManager to Emit Events ⏳ BACKLOG

As a **developer**,
I want **SyncManager to emit progress and status events**,
So that **UI components and AI agents can observe sync activity**.

**Gap Analysis:** Marked done but grep shows NO .emit() calls in SyncManager

**Acceptance Criteria:**

- **AC-10-2-1:** `sync:started` event emitted with file count and direction
- **AC-10-2-2:** `sync:progress` event emitted for each file processed
- **AC-10-2-3:** `sync:completed` event emitted with success status and timestamp
- **AC-10-2-4:** `sync:error` event emitted on failures with error details
- **AC-10-2-5:** Existing callback behavior preserved for backwards compatibility

---

### Story 10.3: Add Manual Sync Toggle ⏳ BACKLOG

As a **user**,
I want **to enable/disable auto-sync and trigger manual sync**,
So that **I control when files are synchronized**.

**Acceptance Criteria:**

- **AC-10-3-1:** WorkspaceContext exposes `autoSync` state and `setAutoSync()` action
- **AC-10-3-2:** Header shows toggle for auto-sync on/off
- **AC-10-3-3:** "Sync Now" button triggers immediate full sync
- **AC-10-3-4:** Sync preference persisted in ProjectStore
- **AC-10-3-5:** Visual indicator shows when auto-sync is off

---

### Story 10.4: Implement Per-File Sync Status ⏳ BACKLOG

As a **user**,
I want **to see which files are synced, pending, or have errors**,
So that **I know the exact state of my project files**.

**Acceptance Criteria:**

- **AC-10-4-1:** FileTree shows sync status icon per file (synced/pending/error)
- **AC-10-4-2:** `file:modified` events tracked to compute pending status
- **AC-10-4-3:** Clicking error icon shows error details tooltip
- **AC-10-4-4:** "Retry sync" action available for failed files
- **AC-10-4-5:** Batch status shown in FileTree header

---

### Story 10.5: Create Sync Exclusion Configuration ✅ DONE

As a **user**,
I want **to configure which files/folders are excluded from sync**,
So that **I can customize sync behavior beyond defaults**.

**Acceptance Criteria:**

- **AC-10-5-1:** Default exclusions: `.git`, `node_modules`, `.DS_Store` ✅
- **AC-10-5-2:** Settings panel allows adding custom exclusion patterns
- **AC-10-5-3:** Exclusion patterns use glob syntax ✅
- **AC-10-5-4:** Exclusions persisted in ProjectStore per project
- **AC-10-5-5:** Excluded files shown differently in FileTree (greyed out)

---

### Story 10-6: Wire SyncManager Event Emissions (NEW)

**Added:** 2025-12-21 (Gap Analysis)  
**Priority:** P0  
**Story Points:** 3

As a **developer**,
I want **SyncManager to actually emit events using the event bus**,
So that **the infrastructure created in Story 10-1 is functional**.

**Acceptance Criteria:**

- **AC-10-6-1:** Import `eventBus` instance in SyncManager
- **AC-10-6-2:** Emit `sync:started` at beginning of `syncToWebContainer()`
- **AC-10-6-3:** Emit `sync:progress` after each file processed
- **AC-10-6-4:** Emit `sync:completed` on success, `sync:error` on failure
- **AC-10-6-5:** Existing functionality unchanged (events are additive)
- **AC-10-6-6:** Unit tests verify events are emitted

**Files to Modify:**
- `src/lib/filesystem/sync-manager.ts`
- `src/lib/filesystem/sync-executor.ts`

---

### Story 10-7: Wire UI Components to Event Bus (NEW)

**Added:** 2025-12-21 (Gap Analysis)  
**Priority:** P1  
**Story Points:** 3

As a **developer**,
I want **UI components to subscribe to event bus events**,
So that **UI updates reactively when sync/file operations occur**.

**Acceptance Criteria:**

- **AC-10-7-1:** `SyncStatusIndicator` subscribes to `sync:started`, `sync:progress`, `sync:completed`
- **AC-10-7-2:** `FileTree` subscribes to `file:created`, `file:modified`, `file:deleted`
- **AC-10-7-3:** Monaco editor subscribes to `file:modified` for external changes
- **AC-10-7-4:** Use `useWorkspaceEvent()` hook for automatic cleanup
- **AC-10-7-5:** Event subscriptions tested in component tests

**Files to Modify:**
- `src/components/ide/SyncStatusIndicator.tsx`
- `src/components/ide/FileTree/index.tsx`
- `src/components/ide/MonacoEditor/MonacoEditor.tsx`

---

# Plan: Complete ARCH-01 Epic - Foundation Architecture Refactoring

**Status**: Continuing from previous session where ARCH-01.3 was completed
**Goal**: Complete remaining stories (ARCH-01.4, ARCH-01.5, ARCH-01.6) with 100% passing rate

---

## Current State

| Story | Status | Status (file) | Dependencies |
|-------|--------|---------------|--------------|
| ARCH-01.1 | ✅ DONE | DONE | - |
| ARCH-01.2 | ✅ DONE | DONE | - |
| ARCH-01.3 | ✅ DONE | NOT_STARTED | ARCH-01.2 ✅ |
| ARCH-01.4 | ⏳ TODO | NOT_STARTED | ARCH-01.2 ✅ |
| ARCH-01.5 | ⏳ TODO | NOT_STARTED | ARCH-01.1 ✅ |
| ARCH-01.6 | ⏳ TODO | NOT_STARTED | ARCH-01.1 ✅, ARCH-01.3 ✅ |

---

## Phase 1: Update Sprint Status (5 min)

**File**: `_bmad-output/sprint-artifacts/sprint-status.yaml`

1. Update ARCH-01.3 status from NOT_STARTED to DONE
2. Add completion timestamp
3. Add progress notes with acceptance criteria
4. Update health score based on completion

---

## Phase 2: ARCH-01.4 - Agent Tool Permission Matrix (32-40 hours)

### Description
Enhance agent tool permission system with YOLO mode, category-based approvals, and real-time tool execution UI.

### Current System Status (from exploration)
**Health**: 83% - Production-ready foundation exists

**Existing Components**:
- `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts` ✅
- `src/lib/agent/tool-permission-manager.ts` ✅ (facade pattern)
- `src/presentation/components/agent/WorkspacePermissions/` ✅ (6 components)
- `src/lib/agent/facades/` ✅ (file, terminal, knowledge)

**Existing UI Components** (from Ralph Loop Cycle 17 Phase 2):
- `PermissionBadge.tsx` (44 lines)
- `PermissionSwitch.tsx` (56 lines)
- `PermissionGridHeader.tsx` (59 lines)
- `ToolPermissionRow.tsx` (77 lines)
- `PermissionLegend.tsx` (55 lines)
- `useWorkspacePermissions.ts` (81 lines)

### Acceptance Criteria
- AC1: YOLO mode toggle in Settings enables auto-approval of all tools
- AC2: Category toggles (files, terminal, knowledge, vision) work
- AC3: Real-time tool execution status shows in chat UI
- AC4: Permission checks enforced in all tool facades
- AC5: Workspace-specific permissions respected
- AC6: Permission changes persist across sessions

### Implementation Tasks

#### Task ARCH-01.4.1: Extend existing tool-permission-types (4h)
**File**: `src/infrastructure/persistence/stores/permissions/tool-permission-types.ts`
- Add `YOLOMode` interface (enabled: boolean, expiryTime: number)
- Add `ToolCategory` enum (files, terminal, knowledge, vision, search, web)
- Add `CategoryApproval` interface
- Extend `ToolPermission` to include `yolo_bypass`

#### Task ARCH-01.4.2: Extend tool-permission-store with YOLO slice (6h)
**File**: `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`
- Add YOLO mode state to existing store
- Add actions: toggleYOLO, setYOLOExpiry, isYOLOActive
- Auto-disable after 24 hours
- Integrate with existing workspace-scoped permissions

#### Task ARCH-01.4.3: Add category approval state to store (6h)
**File**: `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`
- Add categoryApprovals state (Record<ToolCategory, boolean>)
- Add actions: setCategoryApproval, setAllCategories, resetCategories
- Workspace-specific category overrides

#### Task ARCH-01.4.4: Add Settings UI components (8h)
**Files** (in `src/presentation/components/agent/WorkspacePermissions/`):
- `YOLOModeToggle.tsx` (≤120 lines) - YOLO toggle with expiry warning
- `CategoryApprovalGrid.tsx` (≤120 lines) - Category switches in grid layout
- Update `WorkspacePermissionEditor.tsx` to include new panels

**Pattern**: Follow existing WorkspacePermissions component pattern (≤120 lines, 8-bit design)

#### Task ARCH-01.4.5: Create ToolExecutionIndicator component (6h)
**File**: `src/presentation/components/chat/ToolExecutionIndicator.tsx` (≤120 lines)

**Features**:
- Shows tool name, icon, status (pending, executing, completed, failed)
- Progress spinner for long-running operations
- Animated status transitions (use existing animations.css)
- Inline in chat message stream

#### Task ARCH-01.4.6: Update ToolPermissionManager facade (6h)
**File**: `src/lib/agent/tool-permission-manager.ts`

**Changes**:
- Add `checkYOLOMode()` method
- Add `checkCategoryApproval()` method
- Update `checkPermission()` to check YOLO → category → tool level
- Emit events for real-time UI updates

#### Task ARCH-01.4.7: Update tool facades to use new checks (6h)
**Files**:
- `src/lib/agent/facades/file-tools-impl.ts`
- `src/lib/agent/facades/terminal-tools-impl.ts`

**Changes**:
- Call ToolPermissionManager with tool category
- Handle YOLO mode bypass
- Emit execution events for UI

#### Task ARCH-01.4.8: Testing (4h)
- Unit tests for new store methods
- Integration tests for YOLO mode lifecycle
- E2E test for category approval flow

---

## Phase 3: ARCH-01.5 - RAG Auto-Indexing on Sync (48-56 hours)

### Description
Wire RAG pipeline to automatically re-index documents when files are synchronized.

### Dependencies
- ARCH-01.1 (SyncEngine with events) ✅

### Acceptance Criteria
- AC1: File sync events trigger RAG indexing
- AC2: Only changed chunks are re-embedded (incremental)
- AC3: Progress indicator shows during background indexing
- AC4: File deletions remove entries from index
- AC5: No duplicate embeddings in index
- AC6: Knowledge workspace reflects changes in real-time

### Implementation Tasks

#### Task ARCH-01.5.1: Define sync-to-rag event contract (4h)
**File**: `src/lib/events/sync-to-rag-events.ts`
- Define `FileCreatedEvent`, `FileUpdatedEvent`, `FileDeletedEvent`
- Integrate with existing WorkspaceEventEmitter

#### Task ARCH-01.5.2: Create RAG subscription service (8h)
**File**: `src/lib/rag/sync-subscription-service.ts`
- Subscribe to sync events from workspace event bus
- Filter for workspace-specific file changes
- Queue indexing tasks

#### Task ARCH-01.5.3: Implement incremental chunking (12h)
**File**: `src/lib/rag/incremental-chunker.ts`
- Detect changed sections using diff
- Only re-chunk modified sections
- Preserve existing chunk IDs where possible

#### Task ARCH-01.5.4: Implement incremental embedding (8h)
**File**: `src/lib/rag/incremental-embedder.ts`
- Track embedded chunks
- Only embed new/changed chunks
- Batch embedding requests

#### Task ARCH-01.5.5: Handle file deletions (6h)
**File**: `src/lib/rag/index-cleanup.ts`
- Remove chunks by file path
- Remove embeddings by chunk IDs
- Update search index

#### Task ARCH-01.5.6: Create background progress UI (6h)
**File**: `src/presentation/components/rag/IndexingProgressIndicator.tsx`
- Show in status bar
- Progress percentage
- Current file being indexed

#### Task ARCH-01.5.7: Integration testing (8h)
- Test sync → chunk → embed → search flow
- Test deletion handling
- Test concurrent syncs

---

## Phase 4: ARCH-01.6 - Cross-Workspace Context Sharing (40-48 hours)

### Description
Enable seamless context sharing when transitioning between workspaces.

### Dependencies
- ARCH-01.1 ✅
- ARCH-01.3 ✅

### Acceptance Criteria
- AC1: "Open in IDE" from Notes opens file at same position
- AC2: "Open in Notes" from IDE opens file in editor
- AC3: Active file preserved on workspace transition
- AC4: Agent selection preserved on transition
- AC5: Conversation context available in destination workspace
- AC6: Deep links with context work

### Implementation Tasks

#### Task ARCH-01.6.1: Define WorkspaceTransition types (4h)
**File**: `src/domain/value-objects/workspace-transition.ts`
- `WorkspaceTransitionContext` interface
- `FileContext` (path, position, selection)
- `AgentContext` (agentId, mode)
- `ConversationContext` (threadId, messageId)

#### Task ARCH-01.6.2: Create transition context store (6h)
**File**: `src/infrastructure/persistence/stores/workspace-transition-store.ts`
- Persist to sessionStorage
- Store transition context
- Clear after consumption

#### Task ARCH-01.6.3: Add "Open in X" actions (8h)
**Files**:
- `src/presentation/components/notes/OpenInIDEButton.tsx`
- `src/presentation/components/ide/OpenInNotesButton.tsx`

#### Task ARCH-01.6.4: Wire context preservation (12h)
**Files**:
- `src/infrastructure/persistence/stores/workspace/transition-handler.ts`
- Capture context before workspace switch
- Restore context after navigation

#### Task ARCH-01.6.5: Implement deep linking (8h)
**File**: `src/routes/workspace/deep-link-handler.ts`
- URL schema: `/workspace/{workspace}/{file}?line={line}&agent={agentId}`
- Parse on route load
- Apply context

#### Task ARCH-01.6.6: Integration testing (8h)
- Test all transition scenarios
- Test deep links
- Test context restoration

---

## Phase 5: Validation & Completion (4 hours)

### Final Checklist
- [ ] All acceptance criteria met (6 stories × 6 AC = 36 items)
- [ ] TypeScript builds with 0 errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Sprint status updated
- [ ] Health score >= 85

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Health Score | 75.0 | 85+ |
| Duplicate Stores | ~5 | 0 |
| Sync Reliability | ~60% | 99%+ |
| TypeScript Errors | 0 | 0 |

---

## Execution Order

1. **Update sprint-status** → ARCH-01.3 marked DONE
2. **ARCH-01.4** → Tool Permission Matrix (Team B)
3. **ARCH-01.5** → RAG Auto-Indexing (Team A, parallel with 01.4)
4. **ARCH-01.6** → Cross-Workspace Context (Team B, after 01.3 confirmed)
5. **Final validation** → Update health score, mark epic complete

---

## Critical Files to Modify

### ARCH-01.4
- `src/infrastructure/persistence/stores/tool-permission/yolo-mode-slice.ts` (NEW)
- `src/infrastructure/persistence/stores/tool-permission/category-approval-slice.ts` (NEW)
- `src/presentation/components/agent/tool-permission/*.tsx` (NEW)
- `src/lib/agent/facades/*.ts` (MODIFY)

### ARCH-01.5
- `src/lib/events/sync-to-rag-events.ts` (NEW)
- `src/lib/rag/sync-subscription-service.ts` (NEW)
- `src/lib/rag/incremental-*.ts` (NEW)
- `src/presentation/components/rag/IndexingProgressIndicator.tsx` (NEW)

### ARCH-01.6
- `src/domain/value-objects/workspace-transition.ts` (NEW)
- `src/infrastructure/persistence/stores/workspace-transition-store.ts` (NEW)
- `src/presentation/components/*/OpenIn*.tsx` (NEW)
- `src/routes/workspace/deep-link-handler.ts` (NEW)

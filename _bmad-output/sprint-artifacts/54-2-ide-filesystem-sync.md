# Story 54-2: IDE Workspace + File System Sync (End-to-End)

**Epic**: 54 - Foundation Stabilization
**Story**: 54-2-ide-filesystem-sync
**Status**: in_progress
**Priority**: P0
**Estimated Hours**: 26-36
**Assigned**: BMAD Master
**Created**: 2026-01-04

---

## Problem Statement

User's IDE workspace lacks end-to-end cohesion across four critical domains:
1. **File System Sync**: No clear visibility into sync status, progress, or errors
2. **Loading UX**: Poor user feedback during sync and file operations
3. **State Persistence**: IDE state doesn't reliably persist/restore across workspace switches
4. **CRUD Permissions**: AI agent tool permissions lack clarity and proper UI

**User Quote**: "File system sync + loading (ui, ux) + States + CRUD permissions for users vs. their actual file system"

---

## Acceptance Criteria

### AC1: Sync Status Visibility (5 tests)
- [ ] User sees "Syncing..." indicator during sync
- [ ] Progress bar shows files processed / total files
- [ ] User sees "Sync complete" with file count
- [ ] User sees clear error message if sync fails
- **Test**: `src/lib/filesystem/sync-manager/__tests__/sync-status-visibility.test.ts`

### AC2: Incremental Sync Accuracy (8 tests)
- [ ] Only changed files sync after initial sync
- [ ] File metadata cache detects modifications via timestamp
- [ ] File size change detected
- [ ] No unnecessary file operations
- [ ] Deleted files detected and removed from WebContainer
- [ ] New files detected and added to WebContainer
- [ ] Metadata cache updates correctly after sync
- [ ] Incremental sync completes faster than full sync
- **Test**: `src/lib/filesystem/sync-manager/__tests__/incremental-sync.test.ts`

### AC3: File Type Handling (6 tests)
- [ ] Text files (UTF-8) read and written correctly
- [ ] Binary files (png, pdf, mp3, etc.) handled as ArrayBuffer
- [ ] No corruption during sync
- [ ] Correct mime type detection for all 24 binary extensions
- [ ] Binary files don't corrupt when read as text
- [ ] Text files don't corrupt when processed
- **Test**: `src/lib/filesystem/__tests__/file-type-handling.test.ts`

### AC4: Error Recovery (7 tests)
- [ ] Permission denied shows user-friendly message
- [ ] Quota exceeded triggers cleanup and warning
- [ ] Network errors handled with retry (up to 3 times)
- [ ] Partial sync doesn't corrupt state
- [ ] Invalid file path handled gracefully
- [ ] WebContainer boot failure shows clear error
- [ ] Recovery path suggested for each error type
- **Test**: `src/lib/filesystem/sync-manager/__tests__/error-recovery.test.ts`

### AC5: IDE State Persistence (10 tests)
- [ ] Open files list saved to IndexedDB
- [ ] Active file saved and restored
- [ ] Expanded folders saved and restored
- [ ] Panel layout (ratios) saved and restored
- [ ] Scroll positions saved and restored
- [ ] Terminal tab selection saved and restored
- [ ] Chat panel state saved and restored
- [ ] Survives browser refresh
- [ ] Survives workspace switch
- [ ] Multiple projects have independent state
- **Test**: `src/infrastructure/persistence/stores/ide/__tests__/ide-state-persistence.test.ts`

### AC6: Workspace Switch Isolation (6 tests)
- [ ] Switching IDE → Notes doesn't affect IDE state
- [ ] Switching Notes → IDE restores IDE state
- [ ] No cross-contamination between workspaces
- [ ] Each workspace has independent agent selection
- [ ] Each workspace has independent conversation history
- [ ] Each workspace has independent file system handles
- **Test**: `src/infrastructure/persistence/stores/workspace/__tests__/workspace-switch-isolation.test.ts`

### AC7: Permission Checks Accuracy (8 tests)
- [ ] read_file in IDE = auto (no prompt)
- [ ] write_file in IDE = prompt (user approval)
- [ ] execute_command in IDE = prompt
- [ ] delete_file in IDE = block
- [ ] Workspace-specific defaults respected
- [ ] Permission check happens before tool execution
- [ ] Blocked tools return clear "blocked" message
- [ ] Auto tools execute without user interaction
- **Test**: `src/lib/agent/__tests__/permission-checks.test.ts`

### AC8: Approval UI Usability (7 tests)
- [ ] Permission prompt shows: tool name, file path, operation
- [ ] Approve/Reject buttons clearly labeled
- [ ] User can approve once or approve for session
- [ ] Block list shows blocked operations with reason
- [ ] Pending approvals display in UI
- [ ] Approved tool execution shows confirmation
- [ ] Rejected tool execution shows cancellation
- **Test**: `src/presentation/components/ide/__tests__/approval-ui.test.tsx`

---

## User Use Cases

### UC1: User Opens IDE Workspace
1. User navigates to IDE workspace
2. System prompts for directory access (if not already granted)
3. User grants permission via `window.showDirectoryPicker()`
4. Files load from Local FS → WebContainer
5. File tree displays with loading indicator
6. Progress bar shows sync progress
7. User sees "Sync complete: X files"
8. User can open files in editor

### UC2: User Edits File
1. User opens file in Monaco editor
2. User makes changes
3. User saves (Cmd+S)
4. Changes written to Local FS (source of truth)
5. Incremental sync updates WebContainer
6. Both systems in sync

### UC3: User Switches Workspaces
1. User switches IDE → Notes
2. IDE state persists (open files, scroll positions, panel layout)
3. User works in Notes workspace
4. User switches Notes → IDE
5. IDE state restored exactly as left

### UC4: AI Agent Uses File Tools
1. User starts AI chat in IDE
2. Agent requests to read file (auto permission)
3. Agent reads file successfully without prompt
4. Agent requests to write file (prompt permission)
5. User sees approval UI with file path and operation
6. User approves
7. File written to Local FS
8. User sees confirmation message

---

## Test Suite Structure

```
src/
├── lib/filesystem/
│   ├── __tests__/
│   │   └── file-type-handling.test.ts (6 tests)
│   └── sync-manager/__tests__/
│       ├── sync-status-visibility.test.ts (5 tests)
│       ├── incremental-sync.test.ts (8 tests)
│       └── error-recovery.test.ts (7 tests)
├── lib/agent/__tests__/
│   └── permission-checks.test.ts (8 tests)
├── infrastructure/persistence/stores/
│   ├── ide/__tests__/
│   │   └── ide-state-persistence.test.ts (10 tests)
│   └── workspace/__tests__/
│       └── workspace-switch-isolation.test.ts (6 tests)
└── presentation/components/ide/__tests__/
    └── approval-ui.test.tsx (7 tests)

Total: 57 tests across 8 test files
```

---

## Implementation Phases

### Phase 1: Test Suite Creation (4-6 hours) - CURRENT
**Goal**: Create all test files with failing tests (TDD red phase)

| Test File | Tests | Focus |
|-----------|-------|-------|
| file-type-handling.test.ts | 6 | Binary vs text detection |
| sync-status-visibility.test.ts | 5 | User feedback during sync |
| incremental-sync.test.ts | 8 | Changed file detection |
| error-recovery.test.ts | 7 | Error handling |
| permission-checks.test.ts | 8 | Permission logic |
| ide-state-persistence.test.ts | 10 | State save/restore |
| workspace-switch-isolation.test.ts | 6 | Workspace isolation |
| approval-ui.test.tsx | 7 | Permission UI |

**Exit Criteria**: All 57 tests written and failing (red)

### Phase 2: Sync Layer Fixes (8-10 hours)
**Goal**: Fix sync layer, tests pass incrementally

**Files**:
- `src/lib/filesync/file-sync-status-store.ts` (may need enhancement)
- `src/lib/filesystem/sync-manager/sync-manager.ts`
- `src/lib/filesystem/sync-manager/sync-batch-sync.ts`
- `src/lib/sync/file-metadata-cache.ts`

**AC Coverage**: AC1, AC2, AC3, AC4

### Phase 3: State Layer Fixes (6-8 hours)
**Goal**: Fix state persistence and workspace isolation

**Files**:
- `src/infrastructure/persistence/stores/ide/*` (6 slice files)
- `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx`

**AC Coverage**: AC5, AC6

### Phase 4: Permission Layer Fixes (4-6 hours)
**Goal**: Fix permission checks and approval UI

**Files**:
- `src/lib/agent/tool-permission-manager.ts`
- `src/infrastructure/persistence/stores/permissions/*`
- `src/presentation/components/ide/AgentChatPanel.tsx`

**AC Coverage**: AC7, AC8

### Phase 5: Integration & Validation (4-6 hours)
**Goal**: End-to-end validation, all tests pass

**Activities**:
- Run full test suite: `pnpm test`
- Manual verification with user
- Fix any consequential issues discovered
- Update sprint-status.yaml

**Exit Criteria**: 57/57 tests passing (green)

---

## Dev Agent Record

| Timestamp | File | Change | Reason |
|-----------|------|--------|--------|
| (To be filled) | | | |

---

## Governance

### ADR References
- ADR-024: State Management Consolidation
- ADR-027: IndexedDB Quota Management (pending)

### Dependencies
- Requires: Story 54-1 (TypeScript Remediation) ✅ DONE
- Blocks: Story 54-3 (Notes Workspace)
- Related: Story 54-1a (IndexedDB Quota), 54-1b (Silent Failures)

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking IDE state during refactor | HIGH | Create backup before changes, test incrementally |
| Test writing takes longer than estimated | MEDIUM | Focus on critical paths first, expand coverage later |
| WebContainer sync not testable in unit tests | MEDIUM | Use mocks for WebContainer, integration tests for real behavior |

---

**Story File**: `_bmad-output/sprint-artifacts/54-2-ide-filesystem-sync.md`

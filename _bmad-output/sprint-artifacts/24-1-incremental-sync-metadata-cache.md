---
epic: 24
story: 1
title: "Incremental Sync with Metadata Cache"
status: drafted
priority: high
team: A
created: 2025-12-29
updated: 2025-12-29
estimate_hours: 3-4

# User Story
As a user who frequently switches between projects,
I want the IDE to sync only changed files when re-entering a project,
So that project loading is fast (under 1 second) instead of doing full sync every time.

# Problem Statement
Currently, `SyncManager.syncToWebContainer()` performs a full directory tree scan and mount on every project entry, causing 3-5 second delays even when no files have changed. This was flagged as CC-001 in the correct-course workflow.

# Acceptance Criteria

## AC-1: Metadata Cache Infrastructure
- [ ] **AC-1.1**: Dexie table `fileMetadata` exists with schema from Story 24-1 design
- [ ] **AC-1.2**: Helper functions `getFileMetadata()`, `upsertFileMetadata()`, `bulkUpsertFileMetadata()` work correctly
- [ ] **AC-1.3**: File metadata includes: path, projectId, lastModified timestamp, size, optional hash

## AC-2: Incremental Sync Logic
- [ ] **AC-2.1**: On project load, compare current file metadata with cached metadata
- [ ] **AC-2.2**: Only sync files where `lastModified > syncedAt`
- [ ] **AC-2.3**: Full sync only when:
  - No cached metadata exists for the project
  - Cache is older than 24 hours (configurable)
  - User explicitly triggers "Force Refresh"

## AC-3: Performance Target
- [ ] **AC-3.1**: Project re-entry sync completes in <1 second for projects with <100 files (no changes)
- [ ] **AC-3.2**: Only modified files are written to WebContainer (verified by logs)
- [ ] **AC-3.3**: No regression in sync correctness (all files sync eventually)

## AC-4: Cache Coherency
- [ ] **AC-4.1**: Cache updates after every file write/delete operation
- [ ] **AC-4.2**: Cache invalidation when file modifications are detected outside the app
- [ ] **AC-4.3**: Graceful handling of missing/deleted files in cache

---

# Tasks

## Research & Planning
- [ ] T1: Review existing SyncManager implementation
- [ ] T2: Review fileMetadata helper functions in dexie-db.ts
- [ ] T3: Design incremental sync algorithm with edge cases

## Implementation
- [ ] T4: Create `sync-metadata-cache.ts` module with IncrementalSyncManager class
- [ ] T5: Implement `computeFileHash()` for content verification (optional optimization)
- [ ] T6: Implement `getChangedFiles()` comparison function
- [ ] T7: Implement `syncChangedFiles()` to only sync modified files
- [ ] T8: Modify `SyncManager` to use incremental sync when cache exists
- [ ] T9: Add cache cleanup task (remove entries for deleted files)
- [ ] T10: Add cache TTL configuration (default 24 hours)

## Testing
- [ ] T11: Write unit tests for `computeFileHash()` (if implemented)
- [ ] T12: Write unit tests for `getChangedFiles()` comparison logic
- [ ] T13: Write integration test for incremental sync with mock WebContainer
- [ ] T14: Test cache coherency after file operations
- [ ] T15: Test fallback to full sync when cache is stale

## Documentation
- [ ] T16: Update AGENTS.md with incremental sync behavior documentation
- [ ] T17: Add JSDoc comments to new functions/classes

---

# Dev Notes

## Architecture Reference
- **Sync Strategy**: Local FS is source of truth, WebContainer mirrors it
- **Current Issue**: Full scan + mount on every project entry
- **Solution**: Cache file metadata, only sync changed files

## Key Files
- `src/lib/filesystem/sync-manager.ts` - Main sync logic (to be modified)
- `src/lib/state/dexie-db.ts` - File metadata table and helpers (already exists)
- `src/lib/filesystem/local-fs-adapter.ts` - File operations (reads for metadata)

## Implementation Pattern
```typescript
// Pseudocode for incremental sync
class IncrementalSyncManager {
  async syncIfNeeded(projectId: string): Promise<SyncResult> {
    const cached = await getAllFileMetadata(projectId);
    const current = await scanLocalFiles();

    const changed = findChangedFiles(cached, current);

    if (shouldDoFullSync(cached, current)) {
      return this.doFullSync();
    }

    return this.doIncrementalSync(changed);
  }
}
```

## Edge Cases
1. File deleted outside app → remove from cache
2. File modified outside app → sync to WebContainer
3. Large file (>10MB) → skip hash computation, use size + timestamp
4. Cache corruption → fallback to full sync

## Performance Considerations
- Hash computation is expensive; use timestamp + size for initial filter
- Only compute hash for files where timestamp changed
- Batch DB operations for bulk metadata updates

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

#### Issues Found:

#### Sign-off:

---

# Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-29 | drafted | Story created |

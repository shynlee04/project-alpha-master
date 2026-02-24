---
story_key: "38-02-move-fs-adapters"
epic: 38
story: 2
status: "drafted"
created_at: "2026-01-08T12:00:00+07:00"
points: 2
type: "refactor"
---

# Move file system adapters to infrastructure/filesystem

## User Story

**As a** developer maintaining Clean Architecture compliance
**I want** file system adapters (LocalFSAdapter, SyncManager) moved to infrastructure layer
**So that** import direction follows Clean Architecture (infrastructure → domain → lib only)

## Acceptance Criteria

### AC-1: LocalFSAdapter moved to infrastructure
**Given** LocalFSAdapter currently resides in `src/lib/filesystem/local-fs-adapter.ts`
**When** I move it to `src/infrastructure/filesystem/local-fs-adapter.ts`
**Then** the file is properly located in the infrastructure layer with all dependencies

### AC-2: SyncManager remains in infrastructure/sync
**Given** SyncManager already resides in `src/lib/filesystem/sync-manager.ts`
**When** I verify its location and ensure proper barrel exports
**Then** it's correctly exported from `src/infrastructure/sync/index.ts`

### AC-3: All infrastructure imports updated
**Given** Infrastructure files may import from old lib/filesystem location
**When** I update all imports to use `@/infrastructure/filesystem`
**Then** zero import direction violations exist for file system adapters

## Tasks

- [ ] T1: Create `src/infrastructure/filesystem/` directory structure
- [ ] T2: Copy LocalFSAdapter to infrastructure with dependency analysis
- [ ] T3: Create barrel exports in `src/infrastructure/filesystem/index.ts`
- [ ] T4: Update infrastructure files to import from new location
- [ ] T5: Create facade in `src/lib/filesystem/local-fs-adapter.ts` for backward compatibility
- [ ] T6: Verify SyncManager export from infrastructure/sync
- [ ] T7: Run TypeScript check to verify zero errors

## Research Requirements

### Required MCP Research
- [ ] Context7: File System Access API documentation for browser compatibility
- [ ] DeepWiki: WebContainer or StackBlitz projects for file system adapter patterns
- [ ] Tavily/Exa: Clean Architecture file system adapter best practices 2025

### Architecture Patterns to Follow
- Pattern: **Clean Architecture Layer Compliance** (architecture.md Section 2)
- Rationale: Infrastructure layer handles external concerns like File System Access API. Lib layer should only provide utilities/facades, not core adapters.

### Import Direction Rules
- ✅ infrastructure → infrastructure (same layer)
- ✅ lib → infrastructure (lib can use infrastructure)
- ❌ infrastructure → lib (VIOLATION - infrastructure must not import from lib)
- ✅ presentation → infrastructure
- ✅ presentation → lib

## Dev Notes

### Files to Move/Copy
- `src/lib/filesystem/local-fs-adapter.ts` → `src/infrastructure/filesystem/local-fs-adapter.ts`
- Dependencies: file-ops, dir-ops, fs-errors, fs-types, path-utils, handle-utils, fs-handle-utils, path-guard

### Files to Update (infrastructure imports)
Based on Investigation B findings:
- `src/infrastructure/sync/adapters/fsa-adapter.ts`
- `src/infrastructure/sync/adapters/idb-adapter.ts`
- `src/infrastructure/sync/core/sync-engine.ts`
- `src/infrastructure/sync/strategies/bidirectional-sync.ts`
- And other sync-related files

### Facade Pattern (MANDATORY per governance-rules.md)
Keep `src/lib/filesystem/local-fs-adapter.ts` as a facade re-exporting from infrastructure:
```typescript
// Facade for backward compatibility
export { LocalFSAdapter, localFS } from '@/infrastructure/filesystem';
export type { DirectoryEntry, FileReadResult, FileReadBinaryResult } from '@/infrastructure/filesystem';
```

### Dependencies
- None (uses existing browser File System Access API)

### Integration Points
- Touches: All files using LocalFSAdapter or file system operations
- Breaks: None (facade ensures backward compatibility)
- Tests Required: Import verification, TypeScript compilation

## References

- Epic: `_bmad-output/planning-artifacts/epics.md#epic-38`
- Architecture: `_bmad-output/planning-artifacts/architecture.md#section-2` (Five-Layer Architecture)
- ADR-029: `_bmad-output/planning-artifacts/architecture/adr-029-clean-architecture-layer-compliance.md`
- Related Stories: 38-01 (sync-types moved), 38-03 (facade exports), 38-04 (fix imports)

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: TBD
- Session: TBD

### Task Progress
- [ ] T1: Create infrastructure/filesystem directory
- [ ] T2: Copy LocalFSAdapter with dependencies
- [ ] T3: Create barrel exports
- [ ] T4: Update infrastructure imports
- [ ] T5: Create facade for backward compatibility
- [ ] T6: Verify SyncManager exports
- [ ] T7: TypeScript verification

### Research Executed
*Documentation of MCP research findings*

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| ... | ... | ... |

### Tests Created
- {test_file}: {count} tests

### Decisions Made
- Decision 1: {rationale}

## Code Review

*This section populated during review phase*

**Reviewer:** TBD
**Date:** TBD

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for merge

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-08T12:00:00+07:00 | SM | Story 38-02 from epic |
| drafted | 2026-01-08T12:00:00+07:00 | SM | Story file created via story-cycle workflow |

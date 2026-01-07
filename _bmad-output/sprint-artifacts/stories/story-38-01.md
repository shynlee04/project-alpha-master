---
story_id: "38-01"
story_title: "Move sync-types.ts to infrastructure/sync/types"
epic_id: "EPIC-38"
priority: "P0"
effort_hours: 1
status: "draft"
created_at: "2026-01-08T06:30:00+07:00"
updated_at: "2026-01-08T06:30:00+07:00"
assigned_to: "@bmad-bmm-dev"
dependencies: []
research_artifacts:
  - source: "context7"
    query: "TypeScript path alias configuration"
    findings: 3
  - source: "codebase-analysis"
    query: "Current sync-types.ts usage and imports"
    findings: 5
---

# Story 38-01: Move sync-types.ts to infrastructure/sync/types

## Epic Context
**EPIC-38**: Clean Architecture Compliance - Achieve 100% import direction compliance across the codebase.

## Overview
Move the `sync-types.ts` file from its current location to the canonical infrastructure layer location, establishing the foundation for clean architecture compliance.

## Background
Currently, sync-related type definitions are scattered across the codebase. Consolidating them into `infrastructure/sync/types` establishes the single source of truth for sync primitives and sets the pattern for subsequent file moves.

## Acceptance Criteria

1. [ ] **AC1 - File Moved**: `sync-types.ts` relocated to `src/infrastructure/sync/types/sync-types.ts`
2. [ ] **AC2 - Directory Created**: `src/infrastructure/sync/types/` directory exists
3. [ ] **AC3 - No Breaking Changes**: All imports updated to new path
4. [ ] **AC4 - TypeScript Clean**: Zero TS errors after migration
5. [ ] **AC5 - Barrel Export**: `src/infrastructure/sync/types/index.ts` exports sync types

## Dependencies

### Story Dependencies
- None (first story in EPIC-38)

### Code Dependencies
- `src/lib/sync/sync-types.ts` (source file to move)
- Files importing sync-types.ts (to be updated):
  - `src/infrastructure/filesystem/adapters/local-fs-adapter.ts`
  - `src/infrastructure/filesystem/adapters/webcontainer-fs-adapter.ts`
  - `src/lib/filesystem/sync-manager.ts`

### Documentation
- `_bmad-output/planning-artifacts/architecture.md` - Clean Architecture specification
- ADR-024: State Management Consolidation

## Traceability Matrix

| PRD Req | AC | Test | Code | Review |
|---------|----|----|----|----|
| REQ-ARCH-001 | AC1 | sync-types-file.test.ts | infrastructure/sync/types/sync-types.ts:1 | @code-reviewer |
| REQ-ARCH-001 | AC2 | directory-exists.test.ts | N/A (mkdir) | @code-reviewer |
| REQ-ARCH-001 | AC3 | import-resolution.test.ts | All import paths | @code-reviewer |
| REQ-ARCH-001 | AC4 | pnpm-typecheck | Zero errors | @code-reviewer |
| REQ-ARCH-001 | AC5 | barrel-export.test.ts | infrastructure/sync/types/index.ts:1 | @code-reviewer |

## Research Findings

### Source 1: Context7 - TypeScript Path Aliases
**Finding**: Vite tsconfig paths are configured with `@/*` → `./src/*` prefix. All imports must use absolute paths from the `src/` directory root.

**Impact**: When moving files to new locations, update ALL imports to use new absolute paths. Relative imports will break.

**References**:
- `tsconfig.json` lines 15-25
- Vite documentation on path resolution

### Source 2: Codebase Analysis - sync-types.ts Usage
**Finding**: The `sync-types.ts` file defines 12 core interfaces used by file system adapters:

```typescript
// Current location: src/lib/sync/sync-types.ts
- FileSyncStatus
- SyncOperation
- SyncResult
- FileMetadata
- SyncConflict
- SyncError
- SyncEventType
- FileChange
- SyncDirection
- FileHandle
- SyncOptions
- SyncQueueItem
```

**Impact**: These are foundational types. Moving them requires careful import path updates across 8+ files.

**Files to Update**:
1. `src/infrastructure/filesystem/adapters/local-fs-adapter.ts` - imports 5 types
2. `src/infrastructure/filesystem/adapters/webcontainer-fs-adapter.ts` - imports 5 types
3. `src/lib/filesystem/sync-manager.ts` - imports 8 types
4. `src/lib/filesystem/permission-lifecycle.ts` - imports 2 types
5. `src/lib/filesystem/sync-types.ts` (self-reference, remove)

### Source 3: Architecture Pattern Research
**Finding**: Clean Architecture defines that infrastructure types (file system, persistence) should live in the `infrastructure/` layer, NOT `lib/`.

**Impact**: This move establishes the canonical pattern for all subsequent infrastructure type migrations.

**References**:
- ADR-024: Clean Architecture (lines 45-60)
- Platform Architecture Definitive (lines 120-145)

## Implementation Plan

### Step 1: Create Directory Structure (5 minutes)
```bash
mkdir -p src/infrastructure/sync/types
```

### Step 2: Move File (2 minutes)
```bash
mv src/lib/sync/sync-types.ts src/infrastructure/sync/types/sync-types.ts
```

### Step 3: Create Barrel Export (3 minutes)
```typescript
// src/infrastructure/sync/types/index.ts
export * from './sync-types';
```

### Step 4: Update Imports (15 minutes)
```bash
# Find all imports
grep -r "from '@/lib/sync/sync-types'" src --include='*.ts' --include='*.tsx'

# Replace with new path
# Old: import { FileSyncStatus } from '@/lib/sync/sync-types';
# New: import { FileSyncStatus } from '@/infrastructure/sync/types';
```

### Step 5: Validate (5 minutes)
```bash
pnpm typecheck
# Expected: Zero errors
```

## Validation Checklist

### Pre-Development
- [x] Research completed (3 sources analyzed)
- [x] Architecture pattern documented (Clean Architecture)
- [x] Dependencies identified (8 files)
- [x] Acceptance criteria numbered and testable

### Post-Development
- [ ] All 5 ACs met
- [ ] TypeScript check passes (zero errors)
- [ ] All imports updated (verified via grep)
- [ ] Barrel export created and working
- [ ] Code reviewed by @code-reviewer

## Exit Criteria

Story is **DONE** when:
1. File exists at `src/infrastructure/sync/types/sync-types.ts`
2. All imports use new path `@/infrastructure/sync/types`
3. `pnpm typecheck` returns zero errors
4. Story 38-02 can proceed (file system adapters move)

## Notes

- **Estimated Effort**: 1 hour (low complexity, file move only)
- **Risk**: LOW - isolated change with clear rollback (git revert)
- **Blocking**: Story 38-02 depends on this completing

## Metadata

**Story Type**: Architecture Refactoring
**Complexity**: Low (file move + import updates)
**Risk Level**: LOW
**Test Coverage Required**: Basic path resolution tests
**Rollback Plan**: `git revert` commit, zero data risk

---

**Generated**: 2026-01-08T06:30:00+07:00
**Workflow**: story-dev-cycle-v2.md
**Template Version**: 2.0.0

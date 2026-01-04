# Story: ARCH-01.2-1 - State Consolidation: Audit & Migration Plan

**Epic**: ARCH-01 (Foundation Architecture Refactoring)
**Story**: ARCH-01.2 (Complete State Consolidation) - Sub-story 1
**Status**: DRAFTED
**Priority**: P0
**Estimated Hours**: 8
**Assigned Team**: B
**Created**: 2026-01-05T00:10:00+07:00
**Created By**: @bmad-core-bmad-master

---

## User Story

**As a** developer maintaining the platform
**I want** all state management to be consolidated in `@/infrastructure/persistence/stores`
**So that** there is a single source of truth for all application state with no legacy conflicts

---

## Background

The state management has been partially consolidated (Epic 53 progress), but there are still:
- Legacy files in `src/lib/state/` that consumers import directly
- Duplicate folders (knowledge/ in multiple locations)
- Dead files (knowledge-store.ts.backup)
- Inconsistent import paths across the codebase

This story creates the **migration audit** and **implementation plan** for complete consolidation.

---

## Acceptance Criteria

### AC-1: Complete Import Audit

**Given** the codebase has multiple import paths for state
**When** I run the audit script
**Then** I have a complete list of:
- All files importing from `@/lib/state/*`
- All files importing directly from subfolder paths
- All consumers that need migration

### AC-2: Legacy File Analysis

**Given** the `src/lib/state/` folder
**When** I analyze its contents
**Then** I categorize each file as:
- FACADE (re-exports from infrastructure) → Keep until all consumers migrated
- DUPLICATE (also exists in infrastructure) → Delete after consumers migrated
- DEAD (not imported anywhere) → Delete immediately
- LEGACY (active consumers, not yet in infrastructure) → Migrate

### AC-3: Migration Script Creation

**Given** the audit results
**When** I create migration tooling
**Then** I have:
- A script that lists all files needing migration
- A script that verifies migration completeness
- Documentation of the migration order (dependency-aware)

### AC-4: Zero Breaking Changes

**Given** the migration plan
**When** I review backwards compatibility
**Then** all existing import paths work via facade re-exports

---

## Tasks

### Task Group A: Audit (2h)

- [ ] **T-A1**: Run grep to find all `from '@/lib/state` imports (30m)
- [ ] **T-A2**: Categorize `src/lib/state/` files by type (30m)
- [ ] **T-A3**: Check for duplicate files between `lib/state` and `infrastructure/persistence` (30m)
- [ ] **T-A4**: Create audit report with file classifications (30m)

### Task Group B: Analysis (3h)

- [ ] **T-B1**: For each DUPLICATE file, compare contents (45m)
- [ ] **T-B2**: For each LEGACY file, identify the infrastructure target location (45m)
- [ ] **T-B3**: Map consumer dependencies (which files import which) (45m)
- [ ] **T-B4**: Create migration order (dependency-aware, leaves first) (45m)

### Task Group C: Migration Plan (3h)

- [ ] **T-C1**: Create validation script for checking migration completeness (1h)
- [ ] **T-C2**: Document step-by-step migration procedure (1h)
- [ ] **T-C3**: Create facade update strategy (how to sunset facades) (1h)

---

## Research Requirements

Before implementation, query:

1. **Repomix**: Pack `src/lib/state/` and `src/infrastructure/persistence/stores/` for comparison
2. **Grep**: All `from '@/lib/state` patterns
3. **Grep**: All `from '@/infrastructure/persistence` patterns

---

## Dev Notes

### Architecture Reference
From `architecture.md` and Epic 53:
- All stores should live in `@/infrastructure/persistence/stores/`
- Facades in `src/lib/state/` re-export from infrastructure
- Zustand stores use `subscribeWithSelector` middleware
- Dexie persistence via `createDexieStorage` helper

### Known Legacy Files
From previous analysis:
- `src/lib/state/dexie-db.ts` - FACADE (confirmed)
- `src/lib/state/knowledge/` - DUPLICATE folder
- `src/lib/state/ide-store.ts` - Used by some components
- `src/lib/state/workspace-store.ts` - Legacy workspace logic
- `src/lib/state/knowledge-store.ts.backup` - DEAD file

---

## Dev Agent Record

*(To be filled during development)*

**Agent:** 
**Session Started:** 

### Task Progress:
*Tasks marked as completed during dev*

### Research Executed:
*MCP tool queries and findings*

### Files Changed:
| File | Action | Lines |
|------|--------|-------|

### Artifacts Created:
| Artifact | Path |
|----------|------|

---

## Code Review

*(To be filled during review)*

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-05 | DRAFTED | Story created for Team B parallel execution |

---

## References

- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`
- Epic Definition: `_bmad-output/epics/epic-arch-01-foundation-architecture.md`
- Architecture: `_bmad-output/architecture.md`

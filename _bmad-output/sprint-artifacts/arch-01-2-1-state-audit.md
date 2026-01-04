# Story: ARCH-01.2-1 - State Consolidation: Audit & Migration Plan

**Epic**: ARCH-01 (Foundation Architecture Refactoring)
**Story**: ARCH-01.2 (Complete State Consolidation) - Sub-story 1
**Status**: DONE
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

**Agent:** @bmad-bmm-dev (Team B)
**Session Started:** 2026-01-05T00:10:00+07:00
**Session Status:** COMPLETE

### Task Progress:

#### Task Group A: Audit (2h) - ✅ COMPLETE
- [x] **T-A1**: Run grep to find all `from '@/lib/state` imports → **87 imports found**
- [x] **T-A2**: Categorize `src/lib/state/` files by type → **6 FACADE, 2 DUPLICATE, 3 LEGACY, 0 DEAD**
- [x] **T-A3**: Check for duplicate files between `lib/state` and `infrastructure/persistence` → **knowledge/ folder duplicated, circular deps found**
- [x] **T-A4**: Create audit report with file classifications → **Audit report created**

#### Task Group B: Analysis (3h) - ✅ COMPLETE
- [x] **T-B1**: For each DUPLICATE file, compare contents → **knowledge/ and dexie-db-helpers/ differ but can coexist**
- [x] **T-B2**: For each LEGACY file, identify the infrastructure target location → **workspace-store.ts → workspace/, workspace-types.ts → workspace/types.ts**
- [x] **T-B3**: Map consumer dependencies (which files import which) → **11 imports for workspace-store, 9 for workspace-types**
- [x] **T-B4**: Create migration order (dependency-aware, leaves first) → **Migration plan created with 3 phases**

#### Task Group C: Migration Plan (3h) - ✅ COMPLETE
- [x] **T-C1**: Create validation script for checking migration completeness → **scripts/validate-state-consolidation.sh**
- [x] **T-C2**: Document step-by-step migration procedure → **arch-01-2-1-migration-plan.md**
- [x] **T-C3**: Create facade update strategy (how to sunset facades) → **Facade templates in migration plan**

### Research Executed:
- **grep-analysis**: `from '@/lib/state` → 87 imports across 58 files
- **codebase-analysis**: 8 circular dependencies (infrastructure imports from lib/state)
- **folder-comparison**: knowledge/ and dexie-db-helpers/ are duplicates

### Key Findings:

| Category | Count | Details |
|----------|-------|---------|
| FACADE | 6 | dexie-db.ts, ide-store.ts, etc. |
| DUPLICATE | 2 | knowledge/, dexie-db-helpers/ |
| LEGACY | 3 | workspace-store.ts, workspace-types.ts, migrations/ |
| DEAD | 0 | Already cleaned |
| CIRCULAR DEPS | 8 | Infrastructure imports from lib/state ⚠️ |

### Critical Issue Found:
**Circular Dependency**: `src/infrastructure/persistence/stores/workspace/*.ts` imports from `@/lib/state/workspace-store` - must fix FIRST

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| `_bmad-output/sprint-artifacts/arch-01-2-1-audit-report.md` | Created | 290 |
| `scripts/validate-state-consolidation.sh` | Created | 98 |
| `_bmad-output/sprint-artifacts/arch-01-2-1-migration-plan.md` | Created | 210 |

### Artifacts Created:
| Artifact | Path |
|----------|------|
| Audit Report | `_bmad-output/sprint-artifacts/arch-01-2-1-audit-report.md` |
| Validation Script | `scripts/validate-state-consolidation.sh` |
| Migration Plan | `_bmad-output/sprint-artifacts/arch-01-2-1-migration-plan.md` |

### Baseline Validation (2026-01-05):
```
Passed: 3    Failed: 4
- ✅ Dead files removed
- ✅ Production imports <20
- ✅ TypeScript compilation
- ❌ Circular dependencies: 8
- ❌ knowledge/ folder exists
- ❌ workspace-store.ts not migrated
- ❌ workspace-types.ts not migrated
```

### Decisions Made:
- **D1**: Must migrate workspace-store.ts FIRST to fix circular dependencies
- **D2**: Create facades for backward compatibility after migration
- **D3**: Test files can be migrated in batch after production code

---

## Code Review

**Reviewer:** @bmad-bmm-dev (self-review)
**Date:** 2026-01-05T00:45:00+07:00

#### Checklist:
- [x] **AC-1**: Complete Import Audit - ✅ 87 imports documented
- [x] **AC-2**: Legacy File Analysis - ✅ All files categorized (FACADE/DUPLICATE/LEGACY/DEAD)
- [x] **AC-3**: Migration Script Creation - ✅ Validation script + migration plan created
- [x] **AC-4**: Zero Breaking Changes - ✅ Facade strategy ensures backward compatibility

#### Artifacts Verified:
- [x] `arch-01-2-1-audit-report.md` - Complete with 290 lines of analysis
- [x] `validate-state-consolidation.sh` - Executable, shows current baseline
- [x] `arch-01-2-1-migration-plan.md` - Phased approach with rollback plan

#### Issues Found:
- None - audit and planning phase complete

#### Sign-off:
✅ **APPROVED for DONE status**

This story completes the audit phase. The next story (ARCH-01.2-2) will execute the migration plan.

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-05 00:10 | DRAFTED | Story created for Team B parallel execution |
| 2026-01-05 00:30 | IN_PROGRESS | Task Group A complete (audit) |
| 2026-01-05 00:40 | REVIEW | All tasks complete, artifacts ready for review |

---

## References

- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`
- Epic Definition: `_bmad-output/epics/epic-arch-01-foundation-architecture.md`
- Architecture: `_bmad-output/architecture.md`

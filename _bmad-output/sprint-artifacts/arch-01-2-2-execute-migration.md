# Story: ARCH-01.2-2 - Execute State Migration

**Epic**: ARCH-01 (Foundation Architecture Refactoring)
**Story**: ARCH-01.2 (Complete State Consolidation) - Sub-story 2
**Status**: DRAFTED
**Priority**: P0
**Estimated Hours**: 4
**Assigned Team**: B
**Created**: 2026-01-05T00:20:00+07:00
**Created By**: @bmad-bmm-dev (Team B)

---

## User Story

**As a** developer maintaining the platform
**I want** workspace-store.ts and workspace-types.ts migrated to infrastructure
**So that** the 8 circular dependencies are eliminated and state is properly consolidated

---

## Background

From ARCH-01.2-1 (Audit & Migration Plan), we identified:
- **8 circular dependencies**: Infrastructure imports from lib/state (should be reversed)
- **Root cause**: `workspace-store.ts` and `workspace-types.ts` live in `lib/state` but are imported BY infrastructure
- **Solution**: Copy files to infrastructure, update imports, create facades for backward compatibility

This story executes **Phase 1** of the migration plan.

---

## Acceptance Criteria

### AC-1: workspace-types.ts Migrated

**Given** `src/lib/state/workspace-types.ts` (79 lines)
**When** I execute the migration
**Then**:
- File exists at `src/infrastructure/persistence/stores/workspace/workspace-types.ts`
- All exports available from infrastructure path
- Old file converted to facade that re-exports from infrastructure

### AC-2: workspace-store.ts Migrated

**Given** `src/lib/state/workspace-store.ts` (216 lines)
**When** I execute the migration
**Then**:
- File exists at `src/infrastructure/persistence/stores/workspace/workspace-store.ts`
- Import paths updated (workspace-types from relative, event-bus from infrastructure)
- All exports available from infrastructure path
- Old file converted to facade that re-exports from infrastructure

### AC-3: Circular Dependencies Eliminated

**Given** 8 files in infrastructure import from lib/state
**When** I update their import paths
**Then**:
- All 8 imports updated to use infrastructure paths
- Validation script shows 0 circular dependencies
- TypeScript compiles without errors

### AC-4: Backward Compatibility Maintained

**Given** external consumers import from `@/lib/state/workspace-store`
**When** I create facades
**Then**:
- All existing imports continue to work
- Console warning in development mode (optional)
- No breaking changes for consumers

---

## Tasks

### Task Group A: Copy Files to Infrastructure (30m)

- [ ] **T-A1**: Copy `workspace-types.ts` to `infrastructure/persistence/stores/workspace/workspace-types.ts`
- [ ] **T-A2**: Copy `workspace-store.ts` to `infrastructure/persistence/stores/workspace/workspace-store.ts`
- [ ] **T-A3**: Update imports in copied `workspace-store.ts`:
  - `./workspace-types` → relative path (same folder)
  - `../events/cross-workspace-event-bus` → `@/infrastructure/events/cross-workspace-event-bus`

### Task Group B: Update Infrastructure Consumers (1h)

- [ ] **T-B1**: Update `src/infrastructure/persistence/stores/workspace/index.ts`
- [ ] **T-B2**: Update `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx`
- [ ] **T-B3**: Update `src/infrastructure/persistence/stores/providers/provider-models-slice.ts`
- [ ] **T-B4**: Update `src/infrastructure/persistence/stores/agents/slices/agent-events-slice.ts`
- [ ] **T-B5**: Run `pnpm typecheck` to verify no errors

### Task Group C: Create Facades (30m)

- [ ] **T-C1**: Convert `src/lib/state/workspace-types.ts` to facade
- [ ] **T-C2**: Convert `src/lib/state/workspace-store.ts` to facade
- [ ] **T-C3**: Run `pnpm typecheck` to verify backward compatibility

### Task Group D: Validation (30m)

- [ ] **T-D1**: Run `bash scripts/validate-state-consolidation.sh`
- [ ] **T-D2**: Verify circular dependencies = 0
- [ ] **T-D3**: Verify TypeScript compiles
- [ ] **T-D4**: Run `pnpm build` to verify full build

---

## Research Requirements

Reference documents from ARCH-01.2-1:
- `_bmad-output/sprint-artifacts/arch-01-2-1-migration-plan.md` (Phase 1 details)
- `_bmad-output/sprint-artifacts/arch-01-2-1-audit-report.md` (Consumer list)

---

## Dev Notes

### Files to Copy

| Source | Target |
|--------|--------|
| `src/lib/state/workspace-types.ts` | `src/infrastructure/persistence/stores/workspace/workspace-types.ts` |
| `src/lib/state/workspace-store.ts` | `src/infrastructure/persistence/stores/workspace/workspace-store.ts` |

### Import Updates Required in workspace-store.ts

```typescript
// OLD (in lib/state)
import type { WorkspaceType } from './workspace-types';
import { crossWorkspaceEventBus } from '../events/cross-workspace-event-bus';

// NEW (in infrastructure)
import type { WorkspaceType } from './workspace-types';
import { crossWorkspaceEventBus } from '@/infrastructure/events/cross-workspace-event-bus';
```

### Facade Template

```typescript
/**
 * @deprecated Use '@/infrastructure/persistence/stores/workspace' instead
 * This file is a backward-compatibility facade.
 */
export * from '@/infrastructure/persistence/stores/workspace/workspace-store';
```

---

## Dev Agent Record

*(To be filled during development)*

**Agent:** 
**Session Started:** 

### Task Progress:
*Tasks marked as completed during dev*

### Files Changed:
| File | Action | Lines |
|------|--------|-------|

---

## Code Review

*(To be filled during review)*

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-05 00:20 | DRAFTED | Story created from migration plan |

---

## References

- Migration Plan: `_bmad-output/sprint-artifacts/arch-01-2-1-migration-plan.md`
- Audit Report: `_bmad-output/sprint-artifacts/arch-01-2-1-audit-report.md`
- Validation Script: `scripts/validate-state-consolidation.sh`
- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`

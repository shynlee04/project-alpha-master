# State Management Inventory Report

**Scan Date**: 2026-01-04
**Scanner**: @bmad/modules/deep-scan/agents/state-scanner
**Phase**: Inventory
**Version**: 1.0.0

---

## Executive Summary

The codebase contains **79 state management files** (33 stores + 46 slices) across 3 primary locations. The inventory reveals significant technical debt with **10 god stores** (>300 lines) and **13 legacy files** requiring migration to canonical infrastructure paths.

### Critical Findings

- **God Stores**: 10 stores exceed the 300-line limit, with the largest being `quiz-store.ts` at 658 lines (2.2x the threshold)
- **Location Fragmentation**: 13 files remain in legacy paths (`src/lib/state`, `src/lib/workspace`, `src/lib/notes`, `src/lib/filesystem`)
- **Migration Status**: 60.6% of stores are in canonical location (`src/infrastructure/persistence/stores`)

---

## Detailed Inventory

### God Stores (>300 lines) - CRITICAL PRIORITY

| Rank | File | LOC | Location | Compliance | Action Required |
|------|------|-----|----------|------------|-----------------|
| 1 | `src/infrastructure/persistence/stores/study/quiz-store.ts` | 658 | Canonical | ✅ | Split into 6-8 slices |
| 2 | `src/infrastructure/persistence/stores/canvas-store.ts` | 623 | Canonical | ✅ | Split into 5-6 slices |
| 3 | `src/lib/notes/note-store.ts` | 566 | Legacy | ❌ | Migrate + split into 4-5 slices |
| 4 | `src/infrastructure/persistence/stores/flashcard-store.ts` | 531 | Canonical | ✅ | Split into 4-5 slices |
| 5 | `src/lib/workspace/project-store.ts` | 519 | Legacy | ❌ | Migrate + split into 6 slices |
| 6 | `src/lib/filesystem/file-snapshot-store.ts` | 509 | Legacy | ❌ | Migrate + split into 5 slices |
| 7 | `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts` | 493 | Canonical | ✅ | Split into 4-5 slices |
| 8 | `src/infrastructure/persistence/stores/study-store.ts` | 458 | Canonical | ✅ | Split into 4 slices |
| 9 | `src/infrastructure/persistence/stores/use-app-store.ts` | 372 | Canonical | ⚠️ | Acceptable (unified store pattern) |
| 10 | `src/lib/workspace/file-sync-status-store.ts` | 358 | Legacy | ❌ | Migrate + split into 3 slices |

**Notes**:
- `use-app-store.ts` (372 lines) is exempt from splitting as it implements the Single Bounded Store pattern (December 2025 Zustand best practices)
- All legacy files should be migrated to `src/infrastructure/persistence/stores/` before refactoring

---

### Large Stores (120-300 lines) - MEDIUM PRIORITY

| Rank | File | LOC | Location | Compliance | Action Required |
|------|------|-----|----------|------------|-----------------|
| 11 | `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` | 282 | Canonical | ✅ | Monitor near limit |
| 12 | `src/infrastructure/persistence/stores/events/event-status-store.ts` | 256 | Canonical | ✅ | Acceptable |
| 13 | `src/infrastructure/persistence/stores/statusbar-store.ts` | 236 | Canonical | ✅ | Acceptable |
| 14 | `src/lib/state/workspace-store.ts` | 215 | Legacy | ❌ | Migrate to infrastructure |
| 15 | `src/infrastructure/persistence/stores/synthesis-store.ts` | 210 | Canonical | ✅ | Acceptable |
| 16 | `src/infrastructure/persistence/stores/quiz-history-store.ts` | 197 | Canonical | ✅ | Acceptable |
| 17 | `src/lib/notes/note-navigation-store.ts` | 161 | Legacy | ❌ | Migrate to infrastructure |
| 18 | `src/infrastructure/persistence/stores/navigation-store.ts` | 158 | Canonical | ✅ | Acceptable |
| 19 | `src/lib/workspace/threads-store.ts` | 152 | Legacy | ❌ | Migrate to infrastructure |
| 20 | `src/infrastructure/persistence/stores/auto-approve-store.ts` | 152 | Canonical | ✅ | Acceptable |
| 21 | `src/infrastructure/persistence/stores/openai-compatible-store.ts` | 146 | Canonical | ✅ | Acceptable |
| 22 | `src/infrastructure/persistence/stores/layout-store.ts` | 141 | Canonical | ✅ | Acceptable |
| 23 | `src/infrastructure/persistence/stores/rag/rag-store.ts` | 129 | Canonical | ✅ | Acceptable |
| 24 | `src/lib/state/ide-store.ts` | 126 | Legacy | ❌ | Migrate to infrastructure |

---

### Compliance Summary

#### Location Compliance

| Location | Count | Percentage | Status |
|----------|-------|------------|--------|
| **Canonical** (`src/infrastructure/persistence/stores/`) | 20 stores | 60.6% | ✅ On Track |
| **Legacy** (`src/lib/state`, `src/lib/workspace`, etc.) | 13 stores | 39.4% | ❌ Requires Migration |

#### Size Compliance

| Category | Count | Percentage | Status |
|----------|-------|------------|--------|
| **God Stores** (>300 LOC) | 10 stores | 30.3% | 🔴 Critical |
| **Large Stores** (120-300 LOC) | 14 stores | 42.4% | 🟡 Monitor |
| **Slices** (<120 LOC) | 55 files | 69.6% | ✅ Compliant |

---

### Slice Inventory (46 total)

All 46 slice files are in canonical location and mostly compliant with size limits:

**Top 10 Largest Slices** (require monitoring):

| Rank | Slice File | LOC | Status |
|------|------------|-----|--------|
| 1 | `providers/provider-crud-slice.ts` | 232 | ⚠️ 1.9x limit (120) |
| 2 | `providers/provider-models-slice.ts` | 218 | ⚠️ 1.8x limit (120) |
| 3 | `conversation/slices/create-hierarchy-slice.ts` | 179 | ⚠️ 1.5x limit (120) |
| 4 | `conversation/conversation-validation-slice.ts` | 178 | ⚠️ 1.5x limit (120) |
| 5 | `conversation/conversation-events-slice.ts` | 171 | ⚠️ 1.4x limit (120) |
| 6 | `agents/slices/agent-crud-slice.ts` | 163 | ⚠️ 1.4x limit (120) |
| 7 | `project/project-utils-slice.ts` | 148 | ⚠️ 1.2x limit (120) |
| 8 | `project/project-crud-slice.ts` | 147 | ⚠️ 1.2x limit (120) |
| 9 | `agents/slices/agent-workspace-bindings-slice.ts` | 144 | ⚠️ 1.2x limit (120) |
| 10 | `agents/slices/agent-events-slice.ts` | 142 | ⚠️ 1.2x limit (120) |

**Recommendation**: These 10 slices should be further split or consolidated to meet the 120-line target.

---

## Remediation Roadmap

### Phase 1: Legacy Migration (Priority: HIGH)

**Target**: 13 legacy files → canonical infrastructure

1. **Workspace Stores** (3 files, 992 LOC total)
   - `src/lib/workspace/project-store.ts` (519 LOC) → `src/infrastructure/persistence/stores/project/`
   - `src/lib/workspace/file-sync-status-store.ts` (358 LOC) → `src/infrastructure/persistence/stores/filesystem/`
   - `src/lib/workspace/threads-store.ts` (152 LOC) → `src/infrastructure/persistence/stores/conversation/`

2. **State Stores** (3 files, 178 LOC total)
   - `src/lib/state/workspace-store.ts` (215 LOC) → `src/infrastructure/persistence/stores/workspace/`
   - `src/lib/state/ide-store.ts` (126 LOC) → `src/infrastructure/persistence/stores/ide/`
   - `src/lib/state/tool-permission-store.ts` (37 LOC) → Already migrated (duplicate exists)

3. **Notes Stores** (2 files, 577 LOC total)
   - `src/lib/notes/note-store.ts` (566 LOC) → `src/infrastructure/persistence/stores/notes/`
   - `src/lib/notes/note-navigation-store.ts` (161 LOC) → `src/infrastructure/persistence/stores/notes/`

4. **Filesystem Stores** (1 file, 509 LOC)
   - `src/lib/filesystem/file-snapshot-store.ts` (509 LOC) → `src/infrastructure/persistence/stores/filesystem/`

5. **Quiz Stores** (2 files, 42 LOC total)
   - `src/lib/state/quiz-store.ts` (27 LOC) → `src/infrastructure/persistence/stores/study/`
   - `src/lib/state/knowledge/knowledge-store.ts` (15 LOC) → Delete (duplicate)

6. **AI Prompt Stores** (2 files, 22 LOC total)
   - `src/lib/notes/ai-prompt-store.ts` (16 LOC) → `src/infrastructure/persistence/stores/ai/`
   - Test file: `src/lib/state/knowledge/__tests__/test-store.ts` (64 LOC) → Move to canonical test directory

**Estimated Effort**: 40-50 hours (includes migration + testing + facade updates)

---

### Phase 2: God Store Elimination (Priority: CRITICAL)

**Target**: 9 god stores → modular slices

1. **Study Workspace** (1 god store, 658 LOC)
   - `quiz-store.ts` → Split into 6-8 slices:
     - `quiz-crud-slice.ts` (~100 LOC)
     - `quiz-validation-slice.ts` (~90 LOC)
     - `quiz-generation-slice.ts` (~110 LOC)
     - `quiz-session-slice.ts` (~100 LOC)
     - `quiz-history-slice.ts` (~95 LOC)
     - `quiz-stats-slice.ts` (~80 LOC)
     - `quiz-utils-slice.ts` (~83 LOC)

2. **Canvas Store** (1 god store, 623 LOC)
   - `canvas-store.ts` → Split into 5-6 slices:
     - `canvas-crud-slice.ts` (~110 LOC)
     - `canvas-node-slice.ts` (~100 LOC)
     - `canvas-edge-slice.ts` (~95 LOC)
     - `canvas-layout-slice.ts` (~105 LOC)
     - `canvas-selection-slice.ts` (~95 LOC)
     - `canvas-utils-slice.ts` (~118 LOC)

3. **Notes Workspace** (1 god store, 566 LOC) - **AFTER MIGRATION**
   - `note-store.ts` → Split into 4-5 slices:
     - `note-crud-slice.ts` (~120 LOC)
     - `note-block-slice.ts` (~110 LOC)
     - `note-collaboration-slice.ts` (~100 LOC)
     - `note-sync-slice.ts` (~115 LOC)
     - `note-utils-slice.ts` (~121 LOC)

4. **Flashcard Store** (1 god store, 531 LOC)
   - `flashcard-store.ts` → Split into 4-5 slices:
     - `flashcard-crud-slice.ts` (~110 LOC)
     - `flashcard-deck-slice.ts` (~100 LOC)
     - `flashcard-review-slice.ts` (~120 LOC)
     - `flashcard-scheduling-slice.ts` (~105 LOC)
     - `flashcard-export-slice.ts` (~96 LOC)

5. **Project Store** (1 god store, 519 LOC) - **AFTER MIGRATION**
   - `project-store.ts` → Split into 6 slices (Epic CP-1):
     - `project-crud-slice.ts` (~120 LOC) ✅ EXISTS
     - `project-bindings-slice.ts` (~100 LOC) ✅ EXISTS
     - `project-permissions-slice.ts` (~110 LOC) ✅ EXISTS
     - `project-layout-slice.ts` (~90 LOC) ✅ EXISTS
     - `project-utils-slice.ts` (~90 LOC) ✅ EXISTS
     - Combined store barrel (~19 LOC)

6. **File Snapshot Store** (1 god store, 509 LOC) - **AFTER MIGRATION**
   - `file-snapshot-store.ts` → Split into 5 slices (Epic CP-1):
     - `snapshot-metadata-slice.ts` (~100 LOC) ✅ EXISTS
     - `snapshot-cache-slice.ts` (~110 LOC) ✅ EXISTS
     - `snapshot-bulk-ops-slice.ts` (~90 LOC) ✅ EXISTS
     - `snapshot-quota-slice.ts` (~80 LOC) ✅ EXISTS
     - Combined store barrel (~129 LOC)

7. **Tool Permission Store** (1 god store, 493 LOC)
   - `tool-permission-store.ts` → Split into 4-5 slices:
     - `permission-crud-slice.ts` (~110 LOC)
     - `permission-trust-slice.ts` (~100 LOC)
     - `permission-workspace-slice.ts` (~105 LOC)
     - `permission-validation-slice.ts` (~90 LOC)
     - `permission-utils-slice.ts` (~88 LOC)

8. **Study Store** (1 god store, 458 LOC)
   - `study-store.ts` → Split into 4 slices:
     - `study-session-slice.ts` (~120 LOC)
     - `study-progress-slice.ts` (~105 LOC)
     - `study-analytics-slice.ts` (~110 LOC)
     - `study-utils-slice.ts` (~123 LOC)

9. **File Sync Status Store** (1 god store, 358 LOC) - **AFTER MIGRATION**
   - `file-sync-status-store.ts` → Split into 3 slices:
     - `sync-status-slice.ts` (~120 LOC)
     - `sync-queue-slice.ts` (~115 LOC)
     - `sync-events-slice.ts` (~123 LOC)

**Estimated Effort**: 120-150 hours (includes splitting, testing, migration, and consumer updates)

---

### Phase 3: Slice Optimization (Priority: MEDIUM)

**Target**: 10 oversized slices → compliant (<120 LOC)

See "Top 10 Largest Slices" section above.

**Estimated Effort**: 30-40 hours

---

## Risk Assessment

### Critical Risks

1. **Data Loss During Migration**
   - **Risk**: Migrating IndexedDB-backed stores without proper backup
   - **Mitigation**: Create timestamped backups before each migration; implement rollback procedures

2. **Breaking Consumer Components**
   - **Risk**: 100+ components import from legacy store paths
   - **Mitigation**: Create facade exports in old locations; update consumers incrementally

3. **Circular Dependencies**
   - **Risk**: Splitting god stores may introduce new circular dependencies
   - **Mitigation**: Use `get()` pattern for cross-slice communication; validate with `madge`

### Medium Risks

1. **Test Coverage Gaps**
   - **Risk**: Many god stores lack comprehensive tests
   - **Mitigation**: Write tests BEFORE splitting (TDD approach)

2. **Performance Regression**
   - **Risk**: Over-slicing may increase bundle size
   - **Mitigation**: Measure bundle impact; combine tightly-coupled slices

---

## Success Metrics

### Quantitative Targets

- **God Stores**: 10 → 0 (100% reduction)
- **Legacy Location Stores**: 13 → 0 (100% migration)
- **Oversized Slices**: 10 → 0 (100% compliance)
- **Average Store Size**: 213 LOC → <100 LOC (53% reduction)

### Qualitative Targets

- ✅ All stores in canonical location (`src/infrastructure/persistence/stores/`)
- ✅ Zero circular dependencies (validated via `madge --circular`)
- ✅ 100% test coverage on critical paths (god stores → slices)
- ✅ Zero breaking changes to consumers (facade pattern)

---

## Next Steps

1. **Review Inventory** (1 hour)
   - Validate findings with development team
   - Prioritize god stores based on business impact

2. **Create Migration Plan** (4 hours)
   - Detailed task breakdown for each phase
   - Assign stories to sprint backlog
   - Estimate effort per epic

3. **Execute Phase 1** (40-50 hours)
   - Migrate 13 legacy stores to canonical location
   - Create facade exports for backward compatibility
   - Update 20+ consumer components

4. **Execute Phase 2** (120-150 hours)
   - Split 9 god stores into 50+ modular slices
   - Write comprehensive tests for each slice
   - Update consumer imports incrementally

5. **Execute Phase 3** (30-40 hours)
   - Optimize 10 oversized slices
   - Final validation and cleanup

**Total Estimated Effort**: 195-245 hours (24-31 working days)

---

## Appendix A: File Classification Legend

### Types

- **God Store**: >300 LOC (critical violation)
- **Large Store**: 120-300 LOC (warning threshold)
- **Slice**: <120 LOC (compliant)

### Location Compliance

- **Canonical**: `src/infrastructure/persistence/stores/` (✅ correct)
- **Legacy**: `src/lib/state/`, `src/lib/workspace/`, etc. (❌ requires migration)
- **Other**: Special cases (test files, utilities)

---

## Appendix B: Related Artifacts

- **JSON Inventory**: `_bmad-output/deep-scan/inventory/state-inventory.json`
- **State Scanner Agent**: `_bmad/modules/deep-scan/agents/state-scanner.md`
- **ADR-024**: `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`
- **Epic 51**: `_bmad-output/research/platform-unification-2026-01-02/epic-ac-1-agent-consolidation-breakdown.md`
- **Epic CC-1**: `_bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md`
- **Epic CP-1**: `_bmad-output/research/platform-unification-2026-01-02/epic-cp-1-project-consolidation-breakdown.md`

---

**Report Generated**: 2026-01-04
**Scanner Version**: 1.0.0
**Status**: ✅ Phase 1 Complete - Ready for Phase 2 (Proofs)

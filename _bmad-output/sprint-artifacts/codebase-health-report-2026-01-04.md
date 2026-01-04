# Codebase Health Report
## Epic 53 State Management Consolidation - Final Assessment

**Date**: 2026-01-04
**Epic**: 53 - State Management Consolidation (ADR-024)
**Assessment Type**: Comprehensive Health Evaluation
**Agents**: 4 parallel analysis agents (State Review, Dependency Audit, Structure Explore, Architect Audit)

---

## Executive Summary

**Overall Codebase Health: 68%**

| Dimension | Score | Status | Critical Issues |
|-----------|-------|--------|-----------------|
| **State Consolidation** | 72% | IN PROGRESS | 6 stores in lib/ need migration |
| **Layer Compliance** | 62% | NEEDS WORK | 49 god components, misplaced stores |
| **Import Path Hygiene** | 56% | POOR | 95+ files using deprecated paths |
| **Circular Dependency Risk** | 85% | GOOD | 3 potential circular deps |
| **Facade Pattern** | 80% | GOOD | 4 of 5 facades have warnings |

### Key Finding
**Epic 53 is approximately 50% complete** (4 of 8 stories done). The infrastructure is in place, but significant cleanup work remains before the codebase is fully compliant with ADR-024 Clean Architecture.

---

## 1. STATE MANAGEMENT INVENTORY

### 1.1 Canonical Stores (Correct Placement)

**71 Zustand stores in `infrastructure/persistence/stores/`:**

```
src/infrastructure/persistence/stores/
├── agents/           # 5 slices + types ✓
├── providers/        # 3 slices + migration ✓
├── conversation/     # 6 slices + types ✓
├── ide/              # 6 slices (editor, explorer, terminal, layout, project, selectors)
├── knowledge/        # 6 slices ✓
├── project/          # 5 slices ✓
├── filesystem/       # 4 slices (snapshot management)
├── rag/              # 4 slices
├── workspace/        # provider + context
├── permissions/      # tool-permission-store
├── study/            # quiz-store, study-store
├── canvas-store.ts   # 623 lines (GOD STORE - needs splitting)
├── flashcard-store.ts # 531 lines (GOD STORE - needs splitting)
└── layout-store.ts
```

**Status**: ✅ Correctly placed following ADR-024 architecture

### 1.2 Facade Stores (Deprecated but Functional)

**5 backward-compatibility facades in `lib/state/`:**

| Facade File | Canonical Target | Deprecation Warning | Status |
|-------------|------------------|---------------------|--------|
| `ide-store.ts` (127 lines) | `infrastructure/stores/ide/` | YES | ✅ EXCELLENT |
| `quiz-store.ts` (28 lines) | `infrastructure/stores/study/` | YES | ✅ EXCELLENT |
| `tool-permission-store.ts` (38 lines) | `infrastructure/stores/permissions/` | YES | ✅ EXCELLENT |
| `knowledge/knowledge-store.ts` (16 lines) | `infrastructure/stores/knowledge/` | NO | ⚠️ NEEDS WARNING |
| `dexie-db.ts` | `infrastructure/persistence/dexie-db` | YES | ✅ EXCELLENT |
| `dexie-db-types.ts` | `infrastructure/persistence/` | YES | ✅ EXCELLENT |

**Status**: ✅ 80% compliant - knowledge-store needs deprecation warning

### 1.3 Non-Compliant Stores (Need Migration)

**6 Zustand stores in `lib/` that violate ADR-024:**

| Store | Location | Lines | Should Move To | Priority |
|-------|----------|-------|----------------|----------|
| **workspace-store.ts** | `lib/state/` | 216 | `infrastructure/stores/workspace/` | **P0** - Circular risk |
| **note-store.ts** | `lib/notes/` | 567 | `infrastructure/stores/notes/` | **P1** - God store |
| **ai-prompt-store.ts** | `lib/notes/` | 17 | `infrastructure/stores/notes/` | **P1** |
| **note-navigation-store.ts** | `lib/notes/` | 162 | `infrastructure/stores/notes/` | **P1** |
| **file-sync-status-store.ts** | `lib/workspace/` | 359 | `infrastructure/stores/filesystem/` | **P2** |
| **knowledge-store.ts.backup** | `lib/state/` | 719 | DELETE | **P3** - Dead file |

**Status**: ❌ 6 stores need migration to infrastructure layer

---

## 2. GOD STORE ANALYSIS

### 2.1 God Stores (>300 lines)

**9 god stores identified for refactoring:**

| Store | Lines | Location | Slices Available | Target Slices |
|-------|-------|----------|------------------|---------------|
| **quiz-store.ts** | 658 | `infrastructure/stores/study/` | NO | 6 slices (CRUD, questions, filter, search, session, settings) |
| **canvas-store.ts** | 623 | `infrastructure/stores/` | NO | 5 slices (CRUD, edges, viewport, selection, layout) |
| **note-store.ts** | 567 | `lib/notes/` | NO | 5 slices (CRUD, tree, events, index, favorites) |
| **flashcard-store.ts** | 531 | `infrastructure/stores/` | NO | 4 slices (CRUD, SRS, deck, session) |
| **tool-permission-store.ts** | 493 | `infrastructure/stores/permissions/` | NO | 3 slices (trust levels, session, selectors) |
| **study-store.ts** | 458 | `infrastructure/stores/study/` | NO | 4 slices (session, cards, stats, SRS) |
| **file-sync-status-store.ts** | 359 | `lib/workspace/` | NO | 3 slices (statuses, progress, counts) |
| **conversation-store.ts** | 303 | `infrastructure/stores/conversation/` | YES | Already has slices (but main file is 303 lines) |
| **knowledge-store.ts.backup** | 719 | `lib/state/` | N/A | DELETE |

**Total Lines in God Stores**: ~4,710 lines
**Estimated Refactoring Effort**: 40-50 hours

### 2.2 Oversized Slices (>120 lines)

**5 slices exceed the 120-line guideline:**

| Slice | Lines | Category | Split Strategy |
|-------|-------|----------|----------------|
| **provider-crud-slice.ts** | 232 | Providers | 3 slices: models, config, actions |
| **provider-models-slice.ts** | 218 | Providers | 2 slices: fetch, cache |
| **create-hierarchy-slice.ts** | 179 | Conversation | 3 slices: tree, path, operations |
| **conversation-validation-slice.ts** | 178 | Conversation | 2 slices: validate, constraints |
| **conversation-events-slice.ts** | 171 | Conversation | 2 slices: emit, handlers |

**Estimated Refactoring Effort**: 10-12 hours

---

## 3. IMPORT PATH AUDIT

### 3.1 Import Path Summary

| Import Pattern | Count | Status |
|----------------|-------|--------|
| `from '@/infrastructure/persistence/stores/'` | ~130 files | ✅ Canonical (recommended) |
| `from '@/lib/state/'` | ~95 files | ⚠️ Deprecated (facade) |
| `from '@/stores/'` | 0 active | ✅ Deleted |

**Migration Progress**: ~58% of imports use canonical paths

### 3.2 High-Volume Type Imports Needing Migration

| Type | Current Import | Canonical Import | Consumers |
|------|----------------|------------------|------------|
| `SourceRecord` | `@/lib/state/dexie-db` | `@/infrastructure/persistence/dexie-db` | 25+ files |
| `NoteRecord` | `@/lib/state/dexie-db` | `@/infrastructure/persistence/dexie-db` | 8 files |
| `WorkspaceType` | `@/lib/state/workspace-types` | `@/infrastructure/persistence/stores/rag/rag-types` | 9 files |
| `ProjectRecord` | `@/lib/state/dexie-db-types` | `@/infrastructure/persistence/dexie-db-types` | 4 files |

### 3.3 Top Store Consumers (Old Import Paths)

| Store | Consumers | Files | Migration Effort |
|-------|-----------|-------|-------------------|
| **useIDEStore** | 15+ | Components in canvas, knowledge, study, notes, layout | 2 hours |
| **useKnowledgeStore** | 12+ | Knowledge workspace components | 2 hours |
| **useWorkspaceStore** | 8+ | Agent configuration components | 1 hour |
| **dexie-db types** | 40+ | Lib utilities, presentation components | 4 hours |

---

## 4. CIRCULAR DEPENDENCY ANALYSIS

### 4.1 Identified Risks

**3 circular dependency patterns detected:**

| Pattern | Risk Level | Files Involved | Resolution |
|---------|-----------|----------------|------------|
| Infrastructure imports `lib/state/workspace-store` | **HIGH** | 6 files in infrastructure/ | Move workspace-store to infrastructure first |
| Infrastructure imports `lib/state/ide-store` | **MEDIUM** | 4 files | Use local infrastructure import |
| Domain types imported from lib/state | **LOW** | Type imports only | Consolidate type definitions |

### 4.2 Infrastructure Files Affected

```
infrastructure/persistence/stores/
├── agents/slices/agent-events-slice.ts         → imports lib/state/workspace-store
├── providers/provider-models-slice.ts          → imports lib/state/ide-store (types)
├── workspace/workspace-provider.tsx            → imports lib/state/workspace-store
├── session-snapshot-manager.ts                 → imports lib/state/ide-store (types)
└── index.ts                                     → re-exports facade lib/state/*
```

**Impact**: These imports violate the dependency inversion principle - infrastructure should NOT depend on lib/state.

---

## 5. GOD COMPONENT INVENTORY

### 5.1 Presentation Layer Analysis

**49 god components (>300 lines) in `src/presentation/components/`:**

| Component | Lines | Workspace | Violation Factor |
|-----------|-------|------------|------------------|
| `resizable.tsx` | 745 | UI (shared) | 6.2x |
| `KnowledgePage.tsx` | 658 | Knowledge | 5.5x |
| `IndexingProgressPanel.tsx` | 593 | Knowledge | 4.9x |
| `ChatConversation.tsx` | 521 | Chat | 4.3x |
| `WorkspacePermissionEditor.tsx` | 479 | Agent | 4.0x |
| `NotesPage.tsx` | 466 | Notes | 3.9x |
| `CodeBlock.tsx` | 465 | Chat | 3.9x |
| `AgentWorkspaceSwitchingFeedback.tsx` | 458 | Agent | 3.8x |
| `ApprovalOverlay.tsx` | 443 | UI (shared) | 3.7x |
| `PreferenceSettings.tsx` | 433 | Agent | 3.6x |
| ... 39 more ... | 300-432 | Various | 2.5-3.6x |

**Total Lines in God Components**: ~18,000 lines
**Target**: Max 120 lines per component (BMAD standard)
**Estimated Refactoring Effort**: 40-60 hours

### 5.2 Refactoring Priority

| Priority | Components | Rationale | Effort |
|----------|------------|-----------|--------|
| **P0** | `resizable.tsx` (745 lines) | Used across all workspaces | 6 hours |
| **P0** | `KnowledgePage.tsx` (658 lines) | Main workspace page | 8 hours |
| **P1** | `IndexingProgressPanel.tsx` (593 lines) | Blocks RAG workflow | 4 hours |
| **P1** | `ChatConversation.tsx` (521 lines) | Core chat feature | 6 hours |
| **P2** | Components 400-500 lines | High-impact features | 20 hours |
| **P3** | Components 300-400 lines | Lower impact | 20 hours |

---

## 6. EPIC 53 STATUS

### 6.1 Story Completion Status

| Story | Description | Status | Completion |
|-------|-------------|--------|------------|
| 53-1 | Consolidate Dexie Database Files | ✅ COMPLETE | 100% |
| 53-2 | Move Dexie Helpers to Infrastructure | ✅ COMPLETE | 100% |
| 53-3 | Merge Knowledge Store Implementations | ✅ COMPLETE | 100% |
| 53-4 | Migrate IDE Store | ✅ COMPLETE | 100% |
| 53-5 | Migrate Quiz/Permission Stores | ⏳ IN PROGRESS | 30% |
| 53-6 | Move dexie-storage.ts | ⏳ BACKLOG | 0% |
| 53-7 | Update All Import Paths | ⏳ BACKLOG | 0% |
| 53-8 | Documentation Cleanup | ⏳ BACKLOG | 0% |

**Overall Epic 53 Progress**: 50% (4 of 8 stories complete, 1 in progress)

### 6.2 Remaining Work Estimate

| Phase | Stories | Effort | Target Completion |
|-------|---------|--------|-------------------|
| **Phase 1** (Store Migration) | 53-5, 53-6 | 12-16 hours | Week 1 |
| **Phase 2** (Import Paths) | 53-7 | 8-12 hours | Week 2 |
| **Phase 3** (God Stores) | 53-3b | 40-50 hours | Weeks 3-5 |
| **Phase 4** (God Components) | New stories | 40-60 hours | Weeks 6-9 |
| **Phase 5** (Documentation) | 53-8 | 4-6 hours | Week 10 |

**Total Remaining Effort**: 104-144 hours (3-4 weeks with dedicated developer)

---

## 7. 4-LAYER ARCHITECTURE COMPLIANCE

### 7.1 Layer Scorecard

| Layer | Target Location | Compliance | Critical Issues |
|-------|-----------------|------------|-----------------|
| **L5: Presentation** | `src/presentation/components/` | 31% | 49 god components (>300 lines) |
| **L4: Application** | `src/application/` | 100% | Minimal implementation (2 services) |
| **L3: Domain** | `src/domain/`, `src/lib/` (pure utils) | 78% | 6 Zustand stores in `lib/` (should be infrastructure) |
| **L2: Infrastructure** | `src/infrastructure/persistence/stores/` | 89% | Circular dependency on `lib/state/workspace-store` |
| **L1: Persistence** | `src/infrastructure/persistence/dexie-*.ts` | 95% | Minor - Dexie helpers in lib/state |

**Overall Architecture Compliance**: 62%

### 7.2 Dependency Flow

```
                    ┌─────────────────────────────────────┐
                    │  L5: Presentation (Components)      │
                    │  62,014 lines, 49 god components     │
                    └─────────────┬───────────────────────┘
                                  │ useStore()
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  L2: Infrastructure (Stores) - 71 Zustand stores                        │
│  ┌─────────────────┐    ┌───────────────────────────────────────────┐  │
│  │  stores/        │◄───│  lib/state/workspace-store (CIRCULAR)     │  │
│  │  agents/        │    │  lib/state/ide-store (facade, OK)         │  │
│  │  providers/     │    └───────────────────────────────────────────┘  │
│  │  conversation/  │                                                     │
│  │  ide/           │                                                     │
│  │  knowledge/     │                                                     │
│  └─────────────────┘                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                  │ createDexieStorage()
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  L1: Persistence (Dexie)                                                 │
│  dexie-db.ts, dexie-storage.ts, dexie-helpers/                          │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │  L3: Domain (Business Logic)        │
                    │  src/lib/agent/ (pure)              │
                    │  src/lib/knowledge/ (pure)          │
                    │  src/lib/rag/ (pure)                │
                    │  src/domain/ (entities, services)   │
                    └─────────────────────────────────────┘
```

---

## 8. REMEDIATION ROADMAP

### Phase 1: Critical State Migration (Week 1, 12-16 hours)

**Objective**: Move remaining Zustand stores from lib/ to infrastructure/

**Stories**: 53-5, 53-6

| Task | File | Action | Hours |
|------|------|--------|-------|
| 1.1 | `lib/state/workspace-store.ts` | Move to `infrastructure/stores/workspace/` | 2 |
| 1.2 | Infrastructure imports | Update 6 files to use local workspace-store | 2 |
| 1.3 | `lib/notes/note-store.ts` | Move to `infrastructure/stores/notes/` | 3 |
| 1.4 | `lib/notes/ai-prompt-store.ts` | Move to `infrastructure/stores/notes/` | 1 |
| 1.5 | `lib/notes/note-navigation-store.ts` | Move to `infrastructure/stores/notes/` | 1 |
| 1.6 | Note store consumers | Update 30+ import paths | 3 |
| 1.7 | `lib/workspace/file-sync-status-store.ts` | Move to `infrastructure/stores/filesystem/` | 1 |
| 1.8 | `lib/state/knowledge-store.ts.backup` | DELETE | 0.5 |
| 1.9 | Type imports | Update dexie-db type imports (40+ files) | 4 |
| 1.10 | Validation | Run tests, TypeScript checks | 1 |

**Acceptance Criteria**:
- ✅ Zero Zustand stores in `src/lib/` (except facades)
- ✅ Infrastructure no longer imports from `lib/state/`
- ✅ Zero TypeScript errors
- ✅ All tests passing

### Phase 2: Import Path Migration (Week 2, 8-12 hours)

**Story**: 53-7

| Task | Description | Files | Hours |
|------|-------------|-------|-------|
| 2.1 | Update IDE store imports | 15 files | 2 |
| 2.2 | Update Knowledge store imports | 12 files | 2 |
| 2.3 | Update Workspace imports | 20 files | 2 |
| 2.4 | Update dexie-db type imports | 40+ files | 4 |
| 2.5 | Validation | Test all workspaces | 2 |

**Acceptance Criteria**:
- ✅ 95+ files using canonical import paths
- ✅ Zero deprecation warnings in console
- ✅ All workspaces functional

### Phase 3: God Store Elimination (Weeks 3-5, 40-50 hours)

**Story**: 53-3b (new)

| Priority | Store | Lines | Target Slices | Hours |
|----------|-------|-------|---------------|-------|
| P0 | `quiz-store.ts` | 658 | 6 slices | 8 |
| P0 | `canvas-store.ts` | 623 | 5 slices | 6 |
| P1 | `note-store.ts` | 567 | 5 slices | 6 |
| P1 | `flashcard-store.ts` | 531 | 4 slices | 6 |
| P2 | `tool-permission-store.ts` | 493 | 3 slices | 4 |
| P2 | `study-store.ts` | 458 | 4 slices | 4 |
| P3 | `file-sync-status-store.ts` | 359 | 3 slices | 4 |
| P3 | Slice refactoring | 5 slices | 2-3 each | 12 |

**Acceptance Criteria**:
- ✅ All stores ≤300 lines (main store file)
- ✅ All slices ≤120 lines
- ✅ Zero breaking changes (use facades)
- ✅ 100% test coverage for refactored stores

### Phase 4: God Component Elimination (Weeks 6-9, 40-60 hours)

**New Epic**: Component Quality

| Priority | Component | Lines | Strategy | Hours |
|----------|-----------|-------|----------|-------|
| P0 | `resizable.tsx` | 745 | Extract hook-based API | 6 |
| P0 | `KnowledgePage.tsx` | 658 | 5-6 focused components | 8 |
| P1 | `IndexingProgressPanel.tsx` | 593 | Extract visualization | 4 |
| P1 | `ChatConversation.tsx` | 521 | Extract rendering | 6 |
| P2 | Top 10 >400 lines | 400-466 | Component composition | 20 |
| P3 | Remaining 35 | 300-400 | Iterative refactoring | 20 |

**Acceptance Criteria**:
- ✅ All components ≤300 lines (interim target)
- ✅ All components ≤120 lines (final target)
- ✅ Business logic in hooks/services
- ✅ UI components presentational only

### Phase 5: Documentation & Validation (Week 10, 4-6 hours)

**Story**: 53-8

| Task | Description | Hours |
|------|-------------|-------|
| 5.1 | Update CLAUDE.md | 1 |
| 5.2 | Update AGENTS.md | 1 |
| 5.3 | Update architecture documents | 2 |
| 5.4 | Final validation | 1 |

---

## 9. RECOMMENDATIONS

### Immediate Actions (This Week)

1. **Complete Story 53-5**: Move remaining stores from lib/ to infrastructure
   - Priority: workspace-store first (resolves circular dependency)
   - Estimated: 8 hours

2. **Complete Story 53-6**: Move dexie-storage.ts to infrastructure
   - Estimated: 2 hours

3. **Update sprint tracking**: Mark stories 53-5 and 53-6 as complete

### Short Term (Next 2 Weeks)

1. **Complete Story 53-7**: Update all import paths
   - Estimated: 10 hours
   - Impact: 95+ files updated

2. **Begin God Store Elimination**: Start with quiz-store and canvas-store
   - Estimated: 14 hours for first 2 stores

### Long Term (Next 2-3 Months)

1. **God Component Refactoring**: 49 components need attention
   - Estimated: 50-60 hours
   - Strategy: Tackle highest-impact components first

2. **Application Layer Expansion**: Implement proper use-cases and DTOs
   - Estimated: 16-20 hours

---

## 10. METRICS SUMMARY

| Metric | Current | Target | Gap | Status |
|--------|---------|--------|-----|--------|
| **State Consolidation** | 72% | 100% | -28% | IN PROGRESS |
| **Layer Compliance** | 62% | 100% | -38% | NEEDS WORK |
| **Import Path Hygiene** | 56% | 100% | -44% | POOR |
| **God Stores** | 9 remaining | 0 | -9 | HIGH DEBT |
| **God Components** | 49 remaining | 0 | -49 | HIGH DEBT |
| **Circular Dependencies** | 3 risks | 0 | -3 | MEDIUM RISK |

### Technical Debt Summary

| Category | Count | Lines | Effort to Fix |
|----------|-------|-------|---------------|
| Misplaced stores | 6 | ~2,000 | 12 hours |
| God stores | 9 | ~4,700 | 50 hours |
| God components | 49 | ~18,000 | 60 hours |
| Deprecated imports | 95+ | N/A | 12 hours |
| **TOTAL** | **159** | **~24,700** | **134 hours** |

**Projected Time to Full Compliance**: 3-4 weeks with dedicated developer

---

## 11. CONCLUSION

The codebase has made **significant progress** toward Epic 53 (State Management Consolidation):

✅ **Completed**:
- Canonical store structure established in `infrastructure/persistence/stores/`
- 71 stores correctly placed in infrastructure layer
- Facade pattern working for 4 stores with deprecation warnings
- Stories 53-1 through 53-4 complete

⚠️ **Remaining Work**:
- 6 Zustand stores still in `lib/` need migration
- 9 god stores need splitting into slices
- 49 god components need refactoring
- 95+ import paths need updating

**Recommendation**: Prioritize completing Epic 53 before starting new workspace-specific feature development. This will:
1. Eliminate circular dependency risks
2. Establish clean architecture patterns
3. Make workspace feature development significantly easier
4. Reduce long-term maintenance burden

---

**Report Generated**: 2026-01-04
**Analyst**: BMAD Master Orchestration
**Governance Reference**: ADR-024 Clean Architecture, Epic 53
**Next Review**: After completion of Stories 53-5, 53-6

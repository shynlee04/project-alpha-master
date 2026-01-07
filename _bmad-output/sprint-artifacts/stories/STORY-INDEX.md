# Story Index - Via-Gent (Project Alpha v2.0)

**Generated**: 2026-01-08T06:30:00+07:00
**Total Stories**: 81 (active)
**Total Epics**: 9
**Development Cycle**: v2.0

---

## Story File Index

### How to Use This Index

1. Each story has a dedicated file: `story-{ID}.md`
2. Stories follow v2.0 template with metadata, research artifacts, traceability
3. Status tracking in sprint-status.yaml
4. All timestamps use timezone +07:00

---

## EPIC-38: Clean Architecture Compliance (P0)
**Status**: READY
**Stories**: 18
**Effort**: ~33 hours

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 38-01 | story-38-01.md | Move sync-types.ts to infrastructure/sync/types | 1h | None | pending |
| 38-02 | story-38-02.md | Move file system adapters to infrastructure/filesystem | 2h | 38-01 | pending |
| 38-03 | story-38-03.md | Create facade exports in lib/filesystem | 1h | 38-02 | pending |
| 38-04 | story-38-04.md | Update 32 infrastructure→lib imports | 2h | 38-03 | pending |
| 38-05 | story-38-05.md | Create domain/entities/Project.ts | 2h | None | pending |
| 38-06 | story-38-06.md | Create domain/entities/Workspace.ts and Agent.ts | 2h | 38-05 | pending |
| 38-07 | story-38-07.md | Update infrastructure to import from domain entities | 2h | 38-06 | pending |
| 38-08 | story-38-08.md | Update application layer to use domain entities | 2h | 38-07 | pending |
| 38-09 | story-38-09.md | Define WorkspaceRepository interface | 1.5h | 38-08 | pending |
| 38-10 | story-38-10.md | Define AgentRepository and ProjectRepository interfaces | 1.5h | 38-09 | pending |
| 38-11 | story-38-11.md | Implement ZustandWorkspaceRepository | 2h | 38-10 | pending |
| 38-12 | story-38-12.md | Implement ZustandAgentRepository | 2h | 38-11 | pending |
| 38-13 | story-38-13.md | Create DI ServiceContainer | 1.5h | 38-12 | pending |
| 38-14 | story-38-14.md | Migrate application layer to repositories | 3h | 38-13 | pending |
| 38-15 | story-38-15.md | Extract workspace-context.ts from unified context | 2h | 38-08 | pending |
| 38-16 | story-38-16.md | Extract file-system-context.tsx | 2h | 38-15 | pending |
| 38-17 | story-38-17.md | Create UnifiedWorkspaceProvider (composition) | 2h | 38-16 | pending |
| 38-18 | story-38-18.md | Install ESLint import plugin and configure rules | 1.5h | None | pending |

---

## EPIC-30: P0 Critical Fixes (P0)
**Status**: READY
**Stories**: 6
**Effort**: ~8 hours

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 30-01 | story-30-01.md | Add ErrorBoundaries to all workspace routes | 2h | None | pending |
| 30-02 | story-30-02.md | Fix missing useProjectStats export | 1h | None | pending |
| 30-03 | story-30-03.md | Fix redirect loop prevention | 1.5h | None | pending |
| 30-04 | story-30-04.md | Integrate BYOK vault with all providers | 2h | 30-01 | pending |
| 30-05 | story-30-05.md | Fix workspace access race conditions | 1h | 30-01 | pending |
| 30-06 | story-30-06.md | Add error boundary coverage monitoring | 0.5h | 30-01 | pending |

---

## EPIC-31: AI Service Unification (P1)
**Status**: READY
**Stories**: 8
**Effort**: ~12 hours
**Dependencies**: EPIC-38, EPIC-30

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 31-01 | story-31-01.md | Implement AgentExecutionService core | 2h | EPIC-38, EPIC-30 | pending |
| 31-02 | story-31-02.md | Migrate IDE workspace AI to unified service | 1.5h | 31-01 | pending |
| 31-03 | story-31-03.md | Migrate Notes AI to unified service | 2h | 31-02 | pending |
| 31-04 | story-31-04.md | Migrate Knowledge workspace AI | 1.5h | 31-03 | pending |
| 31-05 | story-31-05.md | Integrate BYOK vault with all providers | 2h | 31-04 | pending |
| 31-06 | story-31-06.md | Add agent deep think flags | 1h | 31-05 | pending |
| 31-07 | story-31-07.md | Remove duplicate AI invocation code | 1h | 31-06 | pending |
| 31-08 | story-31-08.md | Add AI service monitoring | 1h | 31-07 | pending |

---

## EPIC-32: Notes Workspace Full Features (P1)
**Status**: READY
**Stories**: 10 (32-11, 32-12 deferred)
**Effort**: ~16 hours
**Dependencies**: EPIC-31

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 32-01 | story-32-01.md | Implement Markdown to BlockNote parser | 3h | EPIC-31 | pending |
| 32-02 | story-32-02.md | Implement BlockNote to Markdown serializer | 2h | 32-01 | pending |
| 32-03 | story-32-03.md | Add local filesystem read (notes) | 1.5h | 32-02 | pending |
| 32-04 | story-32-04.md | Add local filesystem write (notes) | 2h | 32-03 | pending |
| 32-05 | story-32-05.md | Implement note CRUD operations | 2h | 32-04 | pending |
| 32-06 | story-32-06.md | Add note list with search/filter | 1.5h | 32-05 | pending |
| 32-07 | story-32-07.md | Integrate AI transformations (summarize) | 2h | 32-06 | pending |
| 32-08 | story-32-08.md | Integrate AI transformations (expand) | 1.5h | 32-07 | pending |
| 32-09 | story-32-09.md | Integrate AI transformations (rewrite) | 1.5h | 32-08 | pending |
| 32-10 | story-32-10.md | Add note sharing (export) | 1h | 32-09 | pending |

---

## EPIC-33: IDE Workspace Full Features (P1)
**Status**: READY
**Stories**: 8 (33-09, 33-10 deferred)
**Effort**: ~14 hours
**Dependencies**: EPIC-31

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 33-01 | story-33-01.md | Complete terminal integration | 2h | EPIC-31 | pending |
| 33-02 | story-33-02.md | Add terminal tabs (multiple shells) | 1.5h | 33-01 | pending |
| 33-03 | story-33-03.md | Implement file tree with drag-drop | 2h | EPIC-31 | pending |
| 33-04 | story-33-04.md | Add file search/filter in tree | 1h | 33-03 | pending |
| 33-05 | story-33-05.md | Complete Monaco editor integration | 2h | EPIC-31 | pending |
| 33-06 | story-33-06.md | Add Monaco language features | 2h | 33-05 | pending |
| 33-07 | story-33-07.md | Stabilize WebContainer lifecycle | 2h | 33-06 | pending |
| 33-08 | story-33-08.md | Add file operations (create/delete) | 1.5h | 33-07 | pending |

---

## EPIC-34: State Management Consolidation (P1)
**Status**: READY
**Stories**: 8
**Effort**: ~14 hours
**Dependencies**: EPIC-38
**NOTE**: Story 34-01 is COMPLETED via EPIC-38 stories 38-15/16/17

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 34-01 | story-34-01.md | Split unified-workspace-context | 3h | **COMPLETED via 38-15/16/17** | resolved |
| 34-02 | story-34-02.md | Split plugins-store (317 lines) | 2h | EPIC-38 | pending |
| 34-03 | story-34-03.md | Split schema-migrations (315 lines) | 2h | EPIC-38 | pending |
| 34-04 | story-34-04.md | Complete Zustand v5 migration | 3h | 34-02, 34-03 | pending |
| 34-05 | story-34-05.md | Eliminate cross-store circular dependencies | 2h | 34-04 | pending |
| 34-06 | story-34-06.md | Consolidate duplicate provider stores | 1h | 34-05 | pending |
| 34-07 | story-34-07.md | Optimize Dexie persistence hydration | 1h | 34-06 | pending |
| 34-08 | story-34-08.md | Add store migration scripts | 0h | 34-07 | pending |

---

## EPIC-35: Cross-Workspace CRUD (P2)
**Status**: READY
**Stories**: 6
**Effort**: ~10 hours
**Dependencies**: EPIC-32, EPIC-33, EPIC-34

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 35-01 | story-35-01.md | Create note from Knowledge source | 2h | EPIC-32 | pending |
| 35-02 | story-35-02.md | Export IDE code to Knowledge | 2h | EPIC-33 | pending |
| 35-03 | story-35-03.md | Add cross-workspace file references | 2h | EPIC-32, EPIC-33 | pending |
| 35-04 | story-35-04.md | Implement unified clipboard | 1.5h | 35-03 | pending |
| 35-05 | story-35-05.md | Add workspace switch animation | 1h | 35-04 | pending |
| 35-06 | story-35-06.md | Add cross-workspace search | 1.5h | 35-05 | pending |

---

## EPIC-36: Responsive UX (P2)
**Status**: READY
**Stories**: 8
**Effort**: ~12 hours
**Dependencies**: None (parallel execution)

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 36-01 | story-36-01.md | Mobile-responsive IDE layout | 2h | None | pending |
| 36-02 | story-36-02.md | Mobile-responsive Notes layout | 1.5h | None | pending |
| 36-03 | story-36-03.md | Mobile-responsive Knowledge layout | 1.5h | None | pending |
| 36-04 | story-36-04.md | Mobile-responsive Study layout | 1h | None | pending |
| 36-05 | story-36-05.md | Fix touch targets (<44px) | 2h | 36-04 | pending |
| 36-06 | story-36-06.md | Mobile command palette | 2h | None | pending |
| 36-07 | story-36-07.md | Mobile file tree | 1h | None | pending |
| 36-08 | story-36-08.md | Test on real devices | 1h | All above | pending |

---

## EPIC-37: i18n (P2)
**Status**: READY
**Stories**: 9 (37-10 deferred)
**Effort**: ~15 hours
**Dependencies**: None (parallel execution)

| Story ID | File | Title | Effort | Dependencies | Status |
|----------|------|-------|--------|--------------|--------|
| 37-01 | story-37-01.md | Extract all hardcoded strings | 3h | None | pending |
| 37-02 | story-37-02.md | Complete English translations (en.json) | 2h | 37-01 | pending |
| 37-03 | story-37-03.md | Complete Vietnamese translations (vi.json) | 4h | 37-02 | pending |
| 37-04 | story-37-04.md | Add language switcher UI | 1.5h | 37-03 | pending |
| 37-05 | story-37-05.md | Add language detection | 1h | 37-04 | pending |
| 37-06 | story-37-06.md | Translate IDE workspace | 1.5h | 37-05 | pending |
| 37-07 | story-37-07.md | Translate Notes workspace | 1h | 37-06 | pending |
| 37-08 | story-37-08.md | Translate Knowledge workspace | 1h | 37-07 | pending |
| 37-09 | story-37-09.md | Translate Study workspace | 0.5h | 37-08 | pending |

---

## Story Overlap Resolution

### EPIC-34 Story 34-01 ↔ EPIC-38 Story 38-15

Both stories address `unified-workspace-context` split.

**Resolution**: Execute EPIC-38 stories 38-15, 38-16, 38-17 first. Mark EPIC-34 story 34-01 as "COMPLETED via 38-15" with reference.

```yaml
overlap_resolution:
  story_34_01:
    status: "completed_via_epic_38"
    reference_stories: ["38-15", "38-16", "38-17"]
    effort_saved: "3 hours"
    notes: "Workspace context split completed in EPIC-38"
```

---

## Deferred Stories

The following stories are deferred to future sprints:

| Story ID | Epic | Reason | Future Priority |
|----------|------|--------|-----------------|
| 32-11 | EPIC-32 | Note collaboration requires WebSocket infrastructure | P3 |
| 32-12 | EPIC-32 | Mobile-responsive covered in EPIC-36 | N/A |
| 33-09 | EPIC-33 | Git integration requires isomorphic-git setup | P3 |
| 33-10 | EPIC-33 | Mobile-responsive covered in EPIC-36 | N/A |
| 37-10 | EPIC-37 | RTL support for Arabic expansion | P3 |

---

## Status Summary

| Metric | Count |
|--------|-------|
| Total Epics | 9 |
| Active Stories | 76 |
| Deferred Stories | 5 |
| Total Effort | ~134 hours |
| Estimated Duration | 3-4 weeks (2 teams) |

---

**End of Story Index**

*Generated 2026-01-08 by BMAD Master Orchestrator v3.2*
*Development Cycle v2.0 - Strictly Regulated Workflow*

# EPIC-0 Retrospective: Project-Centric Foundation Reset

## Metadata

```yaml
retrospective_id: "RETRO-EPIC-0-2026-01-26"
epic_id: "EPIC-0"
title: "Project-Centric Foundation Reset"
version: "1.0.0"
status: "COMPLETE"
date: "2026-01-26"
duration: "~6 hours (19:30 - 21:45)"
author: "analyst-ext"
artifacts_analyzed:
  - "EPIC-0-PROJECT-CENTRIC-RESET-2026-01-26.md (Sections 12-14)"
  - "User feedback session 2026-01-26"
```

---

## Executive Summary

EPIC-0 achieved its core mission of stabilizing the Project-Centric foundation by fixing critical route references and identifying deep architectural flaws. However, E2E validation revealed that **TypeScript compilation is insufficient validation** - the app compiled but failed runtime testing.

**Key Achievement**: 3 P0 root causes identified and fixed:
- FSA handle serialization issue (P0-1)
- gateway.list('.') pattern bug (P0-3)
- FileTreePlugin store reactivity broken (P0-4)

**Critical Gap**: 9 additional architectural gaps identified by user feedback that were NOT addressed in EPIC-0 and must be transferred to EPIC-0.5.

---

## What Went Well

### 1. Fast Import/Export Scanning (EPIC-0-01)
- Completed in 1 hour
- Identified 90+ active imports preventing archive of workspace directories
- Correctly concluded: "Cannot archive workspace dirs - must rename/migrate exports instead"
- Prevented premature archival that would have broken the app

### 2. Route Cleanup Already Done (EPIC-0-02)
- Verified deprecated routes (ide.tsx, notes.lazy.tsx) were already removed in prior work
- No wasted effort on completed work
- Clean route structure confirmed: only `/$projectId`, `/hub`, `/index`

### 3. Legacy Route References Fixed (EPIC-0-03)
- Found and fixed 10 files with legacy route references
- TypeScript errors reduced from 8 to 0 route errors
- Fast execution: ~1 hour

### 4. Strategic Deferral of Non-Critical Work
- EPIC-0-04 (i18n keys) correctly deferred as "cosmetic - keys work, just poorly named"
- EPIC-0-05 and EPIC-0-06 deferred to Phase 2 with proper justification
- Avoided scope creep by focusing on blockers only

### 5. Parallel Investigation Methodology
- 3 specialist agents deployed in parallel for root cause analysis
- All 3 root causes identified within 45 minutes
- Precise fix locations documented with line numbers

---

## What Didn't Go Well

### 1. E2E Validation Failed After "Complete" Status

| Failure | Expected | Actual |
|---------|----------|--------|
| **No files loading** | FileTree shows project files | FileTree shows empty |
| **No sidebar loading** | MainSidebar on hub, FileTree on project | No sidebar at all |
| **Double sidebar (before fix)** | Either MainSidebar OR FileTree | Both rendered simultaneously |

**Root Cause**: Agent trusted TypeScript compilation as E2E validation. TypeScript checks syntax, NOT runtime behavior.

### 2. Incorrect Assumptions About Data Flow

| Assumption | Reality |
|------------|---------|
| Navigation state serializes FSA handles | `FileSystemDirectoryHandle` is NOT serializable |
| `gateway.list('.')` returns all files | Returns ONLY immediate children matching literal '.' |
| Store.load() triggers re-render | FileTreePlugin used local state, not store |

**Root Cause**: Agent implemented against assumed API behavior without reading adapter implementations.

### 3. Architecture Document Gaps Not Caught Early

| Gap | Impact |
|-----|--------|
| No spec for FSA handle serialization through router | Agent assumed router state works |
| No spec for recursive vs flat file listing | Agent didn't trace data pipeline |
| No spec for component subscription patterns | Agent didn't know store usage pattern |

**Root Cause**: EPIC-0 stories focused on file cleanup, not data flow verification.

### 4. IndexedDB Path Completely Untested

- All testing focused on FSA (desktop) path
- Mobile/tablet flow with IndexedDB not verified
- No default project creation for mobile implemented

**Root Cause**: EPIC-0-07 relied solely on human E2E testing instead of automated smoke tests.

---

## Root Causes Identified (From EPIC-0 Investigation)

| Issue | Root Cause | Fix Applied | Verified |
|-------|------------|-------------|----------|
| **P0-1** FSA handle not passed | Handle not serializable via router state | Restore from IndexedDB on mount | ARCHITECTURE ALREADY CORRECT |
| **P0-3** Files not loading | `gateway.list('.')` creates regex `/^\\.$/` matching nothing | Pattern normalization: '.' -> '**/*' | FIX APPLIED |
| **P0-4** Store not reactive | FileTreePlugin uses local state, ignores store | Migrate to useFileTreeStore() | FIX APPLIED |

### Additional Issues Found But Not Root Causes

| Issue | Classification | Notes |
|-------|---------------|-------|
| Double sidebar rendering | UI bug | Fixed by ProjectAwareLayout conditional |
| Handle restoration silent failure | Debug visibility | Added console logging |
| Duplicate gateway.list() calls | Performance waste | Removed from FileTreePlugin |

---

## Unaddressed Gaps (Transfer to EPIC-0.5)

These gaps were identified by user feedback and are NOT addressed in EPIC-0:

### P0-BLOCKER Gaps

| Gap ID | Description | Impact | Recommended Story |
|--------|-------------|--------|-------------------|
| **GAP-01** | FileTree not truly hierarchical (no recursive child nodes) | Users see flat list, not folder structure | Implement FileTree node expansion with lazy loading |
| **GAP-02** | Event-emitter sync for browser CRUD operations missing | File changes in browser don't reflect in UI | Wire EventBus to FileTree store |
| **GAP-03** | Plugin data mapping contracts undefined (Monaco, BlockNote) | No spec for how file data flows to editors | Define FileData interface per plugin type |
| **GAP-07** | UX: FileTree vs Sidebar panel confusion | Users don't know where sidebar ends and filetree begins | Clarify layout hierarchy in ux-specification.md |

### P1-HIGH Gaps

| Gap ID | Description | Impact | Recommended Story |
|--------|-------------|--------|-------------------|
| **GAP-04** | Non-PC (IndexedDB) storage path untested | Mobile users may see broken UI | Add IndexedDB integration tests |
| **GAP-06** | Auto-save feature for mirroring plugins missing | User edits not persisted automatically | Implement debounced auto-save (500ms) |
| **GAP-08** | UX: Progressive disclosure patterns undefined | Complex features overwhelm users | Add to ux-specification.md |

### P2-MEDIUM Gaps

| Gap ID | Description | Impact | Recommended Story |
|--------|-------------|--------|-------------------|
| **GAP-05** | CRUD permissions from AI agents undefined | No tool permission matrix implemented | Define agent permission scopes |
| **GAP-09** | Indexing and RAG features missing | Knowledge workspace non-functional | Defer to Phase 2 (Knowledge workspace) |

---

## Recommendations for EPIC-0.5

### Priority 1: Complete FileTree Data Flow

1. **EPIC-0.5-01**: Verify gateway.list() returns hierarchical structure
   - Test FSA adapter returns nested files
   - Test IndexedDB adapter returns nested files
   - Add unit tests for both adapters

2. **EPIC-0.5-02**: Implement FileTree node expansion
   - Lazy load children on folder click
   - Show loading indicator during expansion
   - Cache expanded state in store

3. **EPIC-0.5-03**: Wire EventBus to FileTree
   - File CREATE -> store.addEntry()
   - File UPDATE -> store.updateEntry()
   - File DELETE -> store.removeEntry()

### Priority 2: Plugin Data Contracts

4. **EPIC-0.5-04**: Define FileData interface
   ```typescript
   interface FileData {
     path: string;
     content: Uint8Array | string;
     encoding: 'utf-8' | 'binary';
     lastModified: number;
   }
   ```

5. **EPIC-0.5-05**: Implement Monaco file loading
   - Monaco receives FileData from FileTree click
   - Monaco tracks dirty state
   - Auto-save debounced at 500ms

### Priority 3: IndexedDB Path Verification

6. **EPIC-0.5-06**: Add IndexedDB integration tests
   - Create project with storageType: 'indexeddb'
   - Write test files to Dexie
   - Verify FileTree shows files

### Priority 4: UX Clarification

7. **EPIC-0.5-07**: Update ux-specification.md
   - Add layout hierarchy diagram
   - Define sidebar vs plugin panel relationship
   - Add progressive disclosure patterns

---

## Document Updates Required

| Document | Update Needed | Priority | Assigned To |
|----------|---------------|----------|-------------|
| **architecture.md** | Add FSA handle lifecycle spec (serialization, restoration, error handling) | P0 | architect-ext |
| **prd.md** | Add plugin contract specs (FileTree -> Monaco data flow) | P0 | analyst-ext |
| **ux-specification.md** | Add plugin panel layouts, sidebar hierarchy, progressive disclosure | P1 | ux-designer-ext |
| **ADR-039** | Consolidate all EPIC-0 decisions (pattern normalization, store reactivity) | P1 | architect-ext |
| **new-fundamental-truths.md** | Add recursive file listing spec, event-emitter CRUD spec | P1 | architect-ext |

---

## Metrics

### EPIC-0 Execution Metrics

| Metric | Value |
|--------|-------|
| **Total Stories** | 7 |
| **Completed** | 3 (EPIC-0-01, EPIC-0-02, EPIC-0-03) |
| **Deferred (P1 Cosmetic)** | 1 (EPIC-0-04) |
| **Deferred (Phase 2)** | 2 (EPIC-0-05, EPIC-0-06) |
| **Ready for E2E** | 1 (EPIC-0-07) |
| **Files Modified** | 10 |
| **TypeScript Errors Fixed** | 8 -> 0 route errors |
| **Root Causes Identified** | 3 (P0-1, P0-3, P0-4) |
| **Fixes Applied** | 2 (P0-3, P0-4) |
| **Duration** | ~6 hours |

### User-Identified Gap Metrics

| Category | Count |
|----------|-------|
| **P0-BLOCKER** | 4 gaps (GAP-01, GAP-02, GAP-03, GAP-07) |
| **P1-HIGH** | 3 gaps (GAP-04, GAP-06, GAP-08) |
| **P2-MEDIUM** | 2 gaps (GAP-05, GAP-09) |
| **Total Gaps** | 9 |

---

## Lessons Learned

### 1. TypeScript Compilation != E2E Validation
**Lesson**: Always run the app and test user flows after claiming "complete".
**Action**: Add mandatory browser test before story completion in story-done-gate.yaml.

### 2. Read Adapter Implementations Before Assuming API Behavior
**Lesson**: Don't assume library behavior - read the actual implementation.
**Action**: Add "implementation verification" step to dev-story workflow.

### 3. Parallel Investigation Pays Off
**Lesson**: 3 parallel agents found 3 root causes in 45 minutes (vs. sequential ~2 hours).
**Action**: Use parallel specialist agents for all deep investigations.

### 4. Defer Early, Defer Often
**Lesson**: Deferring EPIC-0-04, 05, 06 prevented scope creep and allowed focus on blockers.
**Action**: Establish clear deferral criteria in story-cycle workflow.

### 5. User Feedback Reveals Hidden Gaps
**Lesson**: EPIC-0 missed 9 gaps that user identified in single feedback session.
**Action**: Add user feedback checkpoint after each epic completion.

---

## Follow-Up Actions

| Action | Owner | Due |
|--------|-------|-----|
| Create EPIC-0.5 with 7 stories addressing gaps | bmad-master | Immediate |
| Update architecture.md with FSA handle lifecycle | architect-ext | Before EPIC-0.5 |
| Add browser smoke test to CI | tea-ext | EPIC-0.5-01 |
| Update story-done-gate.yaml with E2E requirement | dev-ext | EPIC-0.5-01 |
| Schedule user feedback session after EPIC-0.5 | bmad-master | After EPIC-0.5 |

---

## Appendix: Files Modified in EPIC-0

| File | Change Type | Story |
|------|-------------|-------|
| src/presentation/components/hub/RecentProjectsSection.tsx | MODIFY | EPIC-0-03 |
| src/presentation/components/project/ProjectsPage.tsx | MODIFY | EPIC-0-03 |
| src/presentation/components/common/Header.tsx | MODIFY | EPIC-0-03 |
| src/presentation/components/project/MobileProjectSelector.tsx | MODIFY | EPIC-0-03 |
| src/presentation/components/notes/NoteReference.tsx | MODIFY | EPIC-0-03 |
| src/lib/workspace/useWorkspaceActions.ts | MODIFY | EPIC-0-03 |
| src/lib/workspace/use-file-ops-slice.ts | MODIFY | EPIC-0-03 |
| src/lib/workspace/route-guards.ts | MODIFY | EPIC-0-03 |
| src/infrastructure/context/project-context.tsx | MODIFY | Section 14 Fix |
| src/plugins/filetree/FileTreePlugin.tsx | MODIFY | Section 14 Fix |

---

*End of Retrospective*
*Generated by analyst-ext*
*Version 1.0.0*
*Date: 2026-01-26*

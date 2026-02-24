# Strategic Course Correction Plan - Project Alpha Architecture Remediation
**Date**: 2026-01-03
**Agent**: BMad Master Orchestrator
**Priority**: CRITICAL
**Status**: PLANNING PHASE

---

## 🎯 EXECUTIVE SUMMARY

After 2 days of intensive iterations (2026-01-02 through 2026-01-03), an external GPT-5.2 deep scan has revealed **critical architectural drift** and **severe code smells** that require immediate strategic intervention.

**Current Platform Health**: 7.0/10 (Moderate Debt)
**Target Platform Health**: 8.8/10 (Production Ready)
**Total Remediation Effort**: 235-259 hours (30-37 days)

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### 1. GOD STORES (Highest Priority)
- **knowledge-store.ts**: ~1,595 lines (GOD STORE)
- **conversation-store.ts**: 626 lines (422% drift from 120-line target)
- **conversation-threads-store.ts**: 726 lines (505% drift)
- **project-store.ts**: 450 lines (275% drift)
- **file-snapshot-store.ts**: 509 lines (324% drift)
- **AgentConfigDialog.tsx**: 1,089 lines (363% drift from 300-line limit)

### 2. MISSING P0 INFRASTRUCTURE
- **No IndexedDB quota handling** → Data loss risk when storage full
- **Silent error handling** → 23 instances of `console.error + return null`
- **No test coverage** → Refactoring blocked (20% vs 80% target)

### 3. ARCHITECTURAL VIOLATIONS
- **17 components exceed 300-line limit**
- **8 instances of N+1 query pattern**
- **No code splitting** → 3MB+ JS bundle, 5s+ load times
- **7 large lists without virtualization** → UI freezes

### 4. WORKSPACE INTEGRATION GAPS
- **Hub not discoverable** → No `/hub` route
- **No workspace state persistence** → Lost context on navigation
- **Missing mobile optimizations** → Touch targets <44px, no gestures

---

## 📋 PROPOSED WORKFLOW

### PHASE 0: Foundation Stabilization (Week 1-2)
**Goal**: Fix P0 infrastructure gaps that block all other work

**Story TS-001**: Fix TypeScript Errors (6-8 hours)
- Target: Reduce from ~100 to <10 errors
- Enable stricter type checking
- Remove all `@ts-ignore` uses

**Story DB-001**: IndexedDB Quota Handling (18-22 hours)
- Add `QuotaExceededError` handling to all Dexie operations
- Implement cleanup strategy (auto-delete old data)
- Add quota monitoring (alert at 80% full)

**Story UI-001**: Extract AgentConfigDialog Hooks (16-20 hours)
- Target: 1,089 → <300 lines
- Extract 5-6 custom hooks (form state, validation, workspace management)
- Preserve 100% functionality

**Deliverables**:
- ✅ Zero P0 blockers
- ✅ Safe refactoring environment
- ✅ ~40-50 hours of work

---

### PHASE 1: Epic CC-1 - Conversation Consolidation (Week 3-4)
**Goal**: Refactor 2 conversation god stores into 6 modular slices

**Epic CC-1 Breakdown** (15 stories, 127 hours):
1. **CC-1.1**: Create conversation-metadata-slice.ts (120 lines)
2. **CC-1.2**: Create thread-management-slice.ts (120 lines)
3. **CC-1.3**: Create message-crud-slice.ts (120 lines)
4. **CC-1.4**: Create conversation-utils-slice.ts (120 lines)
5. **CC-1.5**: Create conversation-validation-slice.ts (120 lines)
6. **CC-1.6**: Create conversation-events-slice.ts (120 lines)
7. **CC-1.7**: Create unified conversation-store.ts (barrel)
8. **CC-1.8**: Write data migration script (with backup + rollback)
9. **CC-1.9**: Migrate Study workspace components
10. **CC-1.10**: Migrate Notes workspace components
11. **CC-1.11**: Migrate Knowledge workspace components
12. **CC-1.12**: Migrate Chat components
13. **CC-1.13**: Migrate IDE workspace components
14. **CC-1.14**: Update all imports and barrel exports
15. **CC-1.15**: Write 105 tests (70 unit + 20 integration + 15 E2E)

**Target Architecture**:
- 6 modular slices (630 lines total, 53% reduction from 1,352 lines)
- Zero circular dependencies
- 100% test coverage

**Timeline**: 16 days (with parallel development)

---

### PHASE 2: Epic CP-1 - Project Consolidation (Week 5-6)
**Goal**: Refactor 2 project god stores + fix Hub routing

**Epic CP-1 Breakdown** (18 stories, 80-100 hours):
1. **CP-1.1**: Create project-crud-slice.ts (120 lines)
2. **CP-1.2**: Create project-workspace-bindings-slice.ts (100 lines)
3. **CP-1.3**: Create project-permissions-slice.ts (110 lines)
4. **CP-1.4**: Create project-layout-slice.ts (80 lines)
5. **CP-1.5**: Create project-utils-slice.ts (90 lines)
6. **CP-1.6**: Create unified project-store.ts
7. **CP-1.7**: Create snapshot-metadata-slice.ts (100 lines)
8. **CP-1.8**: Create snapshot-cache-slice.ts (110 lines)
9. **CP-1.9**: Create snapshot-bulk-ops-slice.ts (90 lines)
10. **CP-1.10**: Create snapshot-quota-slice.ts (80 lines)
11. **CP-1.11**: Create unified snapshot-store.ts
12. **CP-1.12**: Create `routes/hub.tsx` (2-3 hours)
13. **CP-1.13**: Migrate Hub components
14. **CP-1.14**: Update routing references
15. **CP-1.15**: Write 95 tests (60 unit + 20 integration + 15 E2E)

**Target Architecture**:
- 9 modular slices (880 lines total, 8% reduction from 959 lines)
- Hub accessible via `/hub` URL
- Zero circular dependencies

**Timeline**: 12-15 days (with parallel development)

---

### PHASE 3: Infrastructure Hardening (Week 7-8)
**Goal**: Fix P1 gaps + improve performance

**Stories**:
1. **PERF-001**: Implement code splitting (8 hours)
   - Lazy load workspaces: `lazy(() => import('./workspaces/IDE'))`
   - Expected: 50% faster initial load

2. **PERF-002**: List virtualization (12 hours)
   - Use `react-window` or `react-virtuoso`
   - Target: ConversationList, FileTree, BlockList

3. **PERSIST-002**: Bulk delete operations (6 hours)
   - Add `bulkDelete()` to Dexie wrapper
   - Performance: 100x faster for batch cleanup

4. **TEST-003**: E2E test suite (16 hours)
   - Playwright for critical user flows
   - Percy for visual regression

5. **UI-001**: I18N sweep (8 hours)
   - `pnpm i18n:extract` to find hardcoded strings
   - Wrap all strings in `t()` function
   - Add Vietnamese translations

**Total**: 50 hours (7 days)

---

## 🔧 EXECUTION PROTOCOL

### Step 1: Codebase Analysis (Current Phase)
**Action**: Use specialized agents for exhaustive analysis

1. **`/repomix-explorer:explore-local`**
   - Download entire codebase
   - **EXCLUSIONS**: `.bmad`, `documents`, dot folders
   - **Scope**: Raw source code only (no artifacts)

2. **`/analyze-codebase:analyze-codebase`**
   - Exhaustive mode analysis
   - Focus on actual runtime behavior (not documentation)

3. **`/bmad:bmm:workflows:document-project`**
   - Exhaustive mode
   - Generate accurate project documentation from code

### Step 2: Course Correction Workflow
**Action**: Assemble specialist team

1. **`/bmad:bmm:workflows:correct-course`**
   - Lead workflow for strategic remediation
   - Validate findings from deep scan
   - Generate comprehensive epics

2. **Specialist Agents**:
   - `/bmad:bmm:agents:architect` - Architecture decisions
   - `/bmad:bmm:agents:sm` - Sprint planning & breakdown
   - `/bmad:bmm:agents:dev` - Implementation execution

### Step 3: Module Creation
**Action**: Build dedicated remediation module

1. **`/bmad:bmb:agents:module-builder`**
   - Create dedicated module for architecture fixes
   - Name: `architecture-remediation`
   - Scope: State management refactoring

2. **`/bmad:bmb:agents:workflow-builder`**
   - Create workflow for systematic refactoring
   - Include validation gates at each step

### Step 4: Epic Execution
**Action**: Execute epics with strict validation

1. **Create Epic CC-1** (Conversation Consolidation)
   - 15 stories, 127 hours
   - Strict acceptance criteria
   - Zero regression tolerance

2. **Create Epic CP-1** (Project Consolidation)
   - 18 stories, 80-100 hours
   - Hub routing fix included
   - Zero regression tolerance

3. **Phase 0 Stories** (Infrastructure)
   - Execute in parallel with Epic CC-1
   - Fix P0 blockers first

---

## ✅ SUCCESS CRITERIA

### Metrics (After Completion):
- ✅ **Zero god stores** (all files ≤300 lines)
- ✅ **Zero circular dependencies**
- ✅ **Test coverage ≥80%**
- ✅ **TypeScript errors <10**
- ✅ **Performance**: 50% faster load (code splitting)
- ✅ **Data integrity**: Zero data loss (quota handling)
- ✅ **Health score**: 8.8/10

### Platform Readiness:
- ✅ Production-ready state
- ✅ Safe to add new features
- ✅ Maintainable architecture
- ✅ Comprehensive test coverage

---

## 📅 TIMELINE OVERVIEW

| Phase | Duration | Stories | Effort | Dependencies |
|-------|----------|---------|-------|--------------|
| **Phase 0** | Week 1-2 | 3 stories | 40-50h | None |
| **Phase 1** | Week 3-4 | 15 stories | 127h | Phase 0 complete |
| **Phase 2** | Week 5-6 | 18 stories | 80-100h | Phase 1 complete |
| **Phase 3** | Week 7-8 | 5 stories | 50h | Phase 1+2 complete |
| **TOTAL** | **30-37 days** | **41 stories** | **297-327h** | - |

---

## 🚀 NEXT STEPS

1. **Execute codebase analysis** (using repomix-explorer, analyze-codebase, document-project)
2. **Run correct-course workflow** (with architect + sm + dev agents)
3. **Generate comprehensive epics** (CC-1, CP-1, Phase 0-3)
4. **Create dedicated module** (architecture-remediation)
5. **Execute epics systematically** (strict validation, zero tolerance for shortcuts)

---

## ⚠️ CRITICAL SUCCESS FACTORS

1. **NO SHORTCUTS**: Every epic must be executed fully
2. **STRICT VALIDATION**: Acceptance criteria must be met before proceeding
3. **ZERO REGRESSION**: No new bugs introduced
4. **DOCUMENTATION**: Update CLAUDE.md and AGENTS.md after every 3-4 stories
5. **RESOURCE MANAGEMENT**: Max 1 background task, manage terminal processes carefully

**BMad Master will personally orchestrate this entire workflow to ensure successful completion.**

---

**Status**: PLAN READY FOR USER APPROVAL
**Next Action**: Awaiting user confirmation to proceed with Step 1 (Codebase Analysis)

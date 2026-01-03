after this mess of dexie-db here ```you really messed up try running `tree` commands on these places `src/infrastructure` `src/infrastructure/persistence` and just showing how fuck up you are here @_bmad-output/prompts/2026-01-04/confusing-overlapping-filetree.md and here the whole fuck of other slices - see how serious these are! how are you going to address them systematically. Still there are @src/lib/state/dexie-storage.ts @src/lib/state/dexie-db.ts and @src/infrastructure/persistence/dexie-storage.ts  - so which is which .``` which my agent has planned this ```# Plan: Dexie & State Management Duplication Crisis - Comprehensive Consolidation

## 🔴 CRITICAL FINDINGS - FULL CODEBASE ANALYSIS

### Three-Layer Architecture Chaos

**Layer 1: `src/infrastructure/persistence/stores/`** ✅ CANONICAL (Modern)
- **45 slice files** organized by domain (agents, conversation, ide, knowledge, project, providers, rag, filesystem)
- **18 standalone stores** (use-app-store, canvas-store, flashcard-store, study-store, etc.)
- **Status**: PRIMARY LOCATION - Current active implementation

**Layer 2: `src/lib/state/`** ⚠️ DEPRECATED (Legacy Facade)
- **16 files**: 11 dexie type files + 5 store files
- **dexie-db-helpers/** (15 helper files from Story ARC-1.1)
- **Status**: BACKWARDS COMPATIBILITY - Should be consolidated

**Layer 3: `src/lib/workspace/`** ⚠️ MIXED (Utilities + Some State)
- **10 files**: project-store.ts (DUPLICATE), threads-store.ts, session-snapshot.ts, etc.
- **Status**: UTILITY FOCUS - project-store is duplicate

### Import Statistics (Comprehensive)

**Total Files Analyzed**: 199 files across entire codebase

**Import Distribution:**
- `@/lib/state/dexie-db`: **68 files** (UI components, legacy services, tests)
- `@/infrastructure/persistence/dexie-db`: **14 files** (modern stores, types)
- `dexie-storage` (both): **117 files** (store configurations)

**KEY FINDING: ✅ NO MIXED IMPORTS**
- Zero files import from both locations
- Clean separation enables safe migration
- Risk level: **LOW**

### 🚨 GOD STORE CRISIS (Files > 300 lines)

**CRITICAL VIOLATIONS - Must be split:**

1. **`canvas-store.ts`**: **18,954 lines** (63x over limit!)
2. **`flashcard-store.ts`**: **15,726 lines** (52x over limit!)
3. **`use-app-store.ts`**: **13,174 lines** (43x over limit!)
4. **`study-store.ts`**: **11,864 lines** (39x over limit!)
5. **`rag-store.ts`**: Large (not measured yet)
6. **`conversation-store.ts`**: 626 lines (2x over limit)

### 📋 DUPLICATE FILES IDENTIFIED

**CRITICAL DUPLICATES:**

1. **`knowledge-store.ts`** - 2 LOCATIONS:
   - `src/lib/state/knowledge-store.ts` ⚠️ **FACADE** (re-exports from ./knowledge/)
   - `src/lib/state/knowledge/knowledge-store.ts` ✅ **REAL IMPLEMENTATION**

2. **`project-store.ts`** - 2 LOCATIONS:
   - `src/lib/workspace/project-store.ts` ⚠️ **LEGACY**
   - `src/infrastructure/persistence/stores/project/useProjectStore.ts` ✅ **NEW (6 slices)**

3. **`dexie-storage.ts`** - 2 VERSIONS (DIFFERENT CODE!):
   - `src/lib/state/dexie-storage.ts` (84 lines) ❌ Simple, NO quota handling
   - `src/infrastructure/persistence/dexie-storage.ts` (207 lines) ✅ Advanced, WITH quota handling

4. **Dexie Type Files** - DUPLICATED in both locations:
   - dexie-db-ai-types.ts
   - dexie-db-class.ts
   - dexie-db-core-types.ts
   - dexie-db-helpers.ts
   - dexie-db-knowledge-types.ts
   - dexie-db-migrations.ts
   - dexie-db-session-types.ts
   - dexie-db.ts

**UNIQUE FILES (Keep):**
- `src/lib/state/dexie-db-dashboard-types.ts` (only in lib/state)
- `src/lib/state/dexie-db-helpers/` (15 helper files - Story ARC-1.1 work)
- `src/lib/workspace/threads-store.ts` (utility, not duplicate)
- `src/lib/workspace/session-snapshot.ts` (utility, not duplicate)

## 🎯 COMPREHENSIVE CONSOLIDATION STRATEGY

### Canonical Location Decision

**DECISION: Hybrid approach based on layer purpose**

1. **`src/infrastructure/persistence/stores/`** ✅ **CANONICAL for Zustand stores**
   - All modern slice-based stores go here
   - 45 domain slices (agents, conversation, ide, knowledge, project, providers, rag, filesystem)
   - Follows 4-layer architecture

2. **`src/lib/state/dexie-db-helpers/`** ✅ **KEEP HERE (Story ARC-1.1 work)**
   - 15 helper files are correctly placed
   - Part of Dexie database layer (not Zustand stores)
   - Keep in lib/state as database utilities

3. **`src/lib/state/`** ⚠️ **CONSOLIDATE then DELETE most files**
   - Keep: dexie-db-helpers/, quiz-store.ts, tool-permission-store.ts, workspace-store.ts
   - Delete: knowledge-store.ts (facade), duplicate dexie files
   - Move dexie type files to infrastructure/persistence

4. **`src/lib/workspace/`** ⚠️ **CLEANUP duplicates**
   - Delete: project-store.ts (duplicate)
   - Keep: threads-store.ts, session-snapshot.ts (utilities, not stores)

### 🚀 6-PHASE CLEANUP PLAN

## **PHASE 1: Dexie Storage Consolidation** ⚠️ URGENT (P0 - Data Loss Risk)

**Problem:** Two versions with different code, 84-line version has NO quota handling

**Action:**
1. Copy 207-line version (with quota handling) to lib/state:
   ```bash
   cp src/infrastructure/persistence/dexie-storage.ts src/lib/state/dexie-storage.ts
   ```

2. Update all imports to use lib/state version (117 files):
   ```bash
   # Find and update
   grep -l "from.*infrastructure/persistence/dexie-storage" src/ -r
   ```

3. Delete duplicate from infrastructure/persistence:
   ```bash
   rm src/infrastructure/persistence/dexie-storage.ts
   ```

4. Update infrastructure/persistence/index.ts:
   ```typescript
   // Change from: export * from './dexie-storage';
   // To: export { createDexieStorage } from '@/lib/state/dexie-storage';
   ```

**Files Affected:** 117 store configurations
**Risk:** LOW (same API, better implementation)
**Estimated Time:** 2-3 hours

---

## **PHASE 2: Dexie Type File Consolidation** ⚠️ HIGH PRIORITY

**Problem:** 8 dexie type files duplicated in both locations

**Action:**
1. **Move all dexie type files to infrastructure/persistence** (canonical):
   ```bash
   # Already in infrastructure/persistence (keep these):
   - dexie-db-ai-types.ts
   - dexie-db-class.ts
   - dexie-db-core-types.ts
   - dexie-db-helpers.ts
   - dexie-db-knowledge-types.ts
   - dexie-db-migrations.ts
   - dexie-db-session-types.ts
   - dexie-db.ts

   # Delete from lib/state:
   rm src/lib/state/dexie-db-ai-types.ts
   rm src/lib/state/dexie-db-class.ts
   rm src/lib/state/dexie-db-core-types.ts
   rm src/lib/state/dexie-db-helpers.ts
   rm src/lib/state/dexie-db-knowledge-types.ts
   rm src/lib/state/dexie-db-migrations.ts
   rm src/lib/state/dexie-db-session-types.ts
   rm src/lib/state/dexie-db.ts
   ```

2. **Keep unique files in lib/state:**
   - `dexie-db-dashboard-types.ts` (unique, keep)
   - `dexie-db-helpers/` (15 helper files, keep)

3. **Create facade in lib/state** for backwards compatibility:
   ```typescript
   // src/lib/state/dexie-db-types.ts
   export * from '@/infrastructure/persistence/dexie-db-ai-types';
   export * from '@/infrastructure/persistence/dexie-db-core-types';
   export * from '@/infrastructure/persistence/dexie-db-session-types';
   export * from '@/infrastructure/persistence/dexie-db-knowledge-types';
   export * from '@/infrastructure/persistence/dexie-db-class';
   export * from '@/infrastructure/persistence/dexie-db-migrations';
   export { db, getDb, getRecentProjects } from '@/infrastructure/persistence/dexie-db';
   ```

4. **Update imports** (68 files):
   ```bash
   # Update all @/lib/state/dexie-db imports to use facade
   find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
     's|from '\''@/lib/state/dexie-db'\''|from '\''@/lib/state/dexie-db-types'\''|g'
   ```

**Files Affected:** 8 files deleted, 68 imports updated
**Risk:** MEDIUM (facade maintains compatibility)
**Estimated Time:** 3-4 hours

---

## **PHASE 3: Store Facade Cleanup** ⚠️ MEDIUM PRIORITY

**Problem:** knowledge-store.ts is a facade breaking clean imports

**Action:**
1. **Delete knowledge-store.ts facade**:
   ```bash
   rm src/lib/state/knowledge-store.ts
   ```

2. **Update all imports** (find first):
   ```bash
   grep -r "from '@/lib/state/knowledge-store'" src/ --include="*.ts" --include="*.tsx"
   ```

3. **Update imports to direct path**:
   ```typescript
   // Before:
   import { useKnowledgeStore } from '@/lib/state/knowledge-store';

   // After:
   import { useKnowledgeStore } from '@/lib/state/knowledge/knowledge-store';
   ```

**Files Affected:** ~10-15 files
**Risk:** LOW (simple path update)
**Estimated Time:** 1-2 hours

---

## **PHASE 4: Project Store Cleanup** ⚠️ MEDIUM PRIORITY

**Problem:** project-store.ts duplicated between workspace/ and infrastructure/

**Action:**
1. **Delete legacy version**:
   ```bash
   rm src/lib/workspace/project-store.ts
   ```

2. **Update all imports**:
   ```bash
   grep -r "from.*workspace/project-store" src/ --include="*.ts" --include="*.tsx"
   ```

3. **Update to use new location**:
   ```typescript
   // Before:
   import { useProjectStore } from '@/lib/workspace/project-store';

   // After:
   import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
   ```

4. **Keep workspace utilities**:
   - threads-store.ts (utility, not duplicate)
   - session-snapshot.ts (utility, not duplicate)
   - file-sync-status-store.ts (utility, not duplicate)

**Files Affected:** ~5-10 files
**Risk:** LOW (new store already implemented with 6 slices)
**Estimated Time:** 1-2 hours

---

## **PHASE 5: God Store Elimination** ⚠️ CRITICAL P0 (Technical Debt)

**Problem:** 6 god stores violate 300-line limit (up to 63x over!)

**Priority Order:**

1. **`canvas-store.ts`** (18,954 lines - 63x limit!) - HIGHEST PRIORITY
2. **`flashcard-store.ts`** (15,726 lines - 52x limit!)
3. **`use-app-store.ts`** (13,174 lines - 43x limit!)
4. **`study-store.ts`** (11,864 lines - 39x limit!)
5. **`rag-store.ts`** (large, not measured)
6. **`conversation-store.ts`** (626 lines - 2x limit)

**Strategy for Each Store:**
1. Read store file, identify logical domains
2. Split into 120-line slices following existing patterns
3. Create barrel export for backwards compatibility
4. Update all imports
5. Test thoroughly

**Example Pattern (from agents/):**
`` BEFORE: agents-store.ts (429 lines)
 AFTER:
   - agent-crud-slice.ts (120 lines)
   - agent-events-slice.ts (120 lines)
   - agent-utils-slice.ts (120 lines)
   - agent-validation-slice.ts (120 lines)
   - agent-workspace-bindings-slice.ts (120 lines)
   - agent-selection-store.ts (facade)
```

**Estimated Time per Store:** 8-12 hours (split + test + migrate)
**Total Estimated Time:** 48-72 hours (6 stores)

**Risks:**
- HIGH - Breaking changes if facade not correct
- HIGH - Complex state logic may have hidden dependencies
- HIGH - Extensive testing required

**Recommendation:** Execute as separate Epic stories, one store at a time

---

## **PHASE 6: Final Documentation & Validation** ⚠️ REQUIRED

**Action:**
1. **Update AGENTS.md** with new canonical locations
2. **Update CLAUDE.md** with correct import patterns
3. **Run comprehensive validation**:
   ```bash
   # TypeScript check
   pnpm tsc --noEmit

   # Build check
   pnpm build

   # Test suite
   pnpm test

   # Verify no duplicate imports
   grep -r "from.*infrastructure/persistence/dexie-storage" src/
   grep -r "from.*lib/state/knowledge-store" src/
   grep -r "from.*workspace/project-store" src/
   ```

4. **Create migration documentation**:
   - Before/After file locations
   - Import pattern changes
   - Breaking changes (should be zero with facades)

**Estimated Time:** 2-3 hours

---

## 📊 EXECUTION SUMMARY

### Total Scope
- **Phases:** 6
- **Files to Delete:** 12-15 duplicates
- **Files to Move/Consolidate:** 8-10
- **Imports to Update:** ~100 files
- **God Stores to Split:** 6
- **Total Estimated Time:** 60-85 hours

### Risk Assessment
- **Phase 1-2 (Dexie Consolidation):** MEDIUM risk (facades maintain compatibility)
- **Phase 3-4 (Store Cleanup):** LOW risk (simple path updates)
- **Phase 5 (God Stores):** HIGH risk (complex refactoring, extensive testing)
- **Phase 6 (Validation):** NO risk (verification only)

### Recommended Execution Order

**Week 1: Foundation (Quick Wins)**
1. ✅ Phase 1: Dexie Storage (2-3 hours) - **URGENT - P0 Data Loss Risk**
2. ✅ Phase 2: Dexie Type Files (3-4 hours)
3. ✅ Phase 3: Knowledge Store Facade (1-2 hours)
4. ✅ Phase 4: Project Store Cleanup (1-2 hours)

**Week 2: Documentation & Planning**
5. ✅ Phase 6: Documentation & Validation (2-3 hours)
6. ⏳ Plan God Store Elimination (detailed breakdown per store)

**Week 3-10: God Store Elimination (One per week)**
7. ⏳ Phase 5: Split canvas-store.ts (8-12 hours)
8. ⏳ Phase 5: Split flashcard-store.ts (8-12 hours)
9. ⏳ Phase 5: Split use-app-store.ts (8-12 hours)
10. ⏳ Phase 5: Split study-store.ts (8-12 hours)
11. ⏳ Phase 5: Split rag-store.ts (8-12 hours)
12. ⏳ Phase 5: Split conversation-store.ts (8-12 hours)

### Success Criteria

✅ **Phase 1-4 Complete When:**
- Zero duplicate dexie-storage.ts files
- Zero duplicate dexie type files
- All imports use facade or direct paths
- `pnpm tsc --noEmit` passes (zero new errors)
- `pnpm build` succeeds
- `pnpm test` passes

✅ **Phase 5 Complete When (per store):**
- God store split into 120-line slices
- All slices in appropriate domain directory
- Facade export maintains backwards compatibility
- All tests pass
- Zero breaking changes for consumers

✅ **Phase 6 Complete When:**
- AGENTS.md updated with new locations
- CLAUDE.md updated with import patterns
- Migration documentation created
- All validation commands pass

### Critical Files to Monitor

**During Phase 1-2:**
- `src/lib/state/dexie-storage.ts` (ensure quota handling works)
- `src/lib/state/dexie-db-types.ts` (new facade)
- All files importing from old locations

**During Phase 3-4:**
- `src/lib/state/knowledge/` (ensure direct imports work)
- `src/infrastructure/persistence/stores/project/` (ensure 6 slices work)

**During Phase 5:**
- Each god store being split
- All consumers of each store
- Test coverage for new slices

### Rollback Strategy

If anything breaks:
1. **Git revert** the phase commits
2. **Restore facade** from backup
3. **Fix imports** that broke
4. **Re-test** before continuing
5. **Document** what went wrong

### Next Steps

**Immediate (This Session):**
1. Start Phase 1: Dexie Storage Consolidation
2. Copy 207-line dexie-storage.ts to lib/state
3. Update all 117 imports
4. Delete duplicate from infrastructure/persistence
5. Validate with TypeScript and build

**This Week:**
1. Complete Phase 1-4 (Foundation)
2. Update sprint status with progress
3. Document lessons learned

**Next Sprint:**
1. Begin Phase 5 (God Store Elimination)
2. Start with canvas-store.ts (highest priority)
3. Create Epic stories for remaining god stores

---

**This plan provides a systematic, phased approach to eliminating the duplication crisis while maintaining code stability through facade patterns and comprehensive testing.**

---

## 📝 DEV NOTES: Story ARC-1.1 Post-Implementation Findings

### 🔴 CRITICAL DISCOVERIES During Code Review

**Story Status Update:**
- **Claimed:** "Split dexie-db.ts (1,267 lines) → 14 helper modules"
- **Reality:** Discovered MASSIVE codebase-wide duplication crisis during review
- **Impact:** Story ARC-1.1 work is VALID, but exposed deeper architectural problems

### What Story ARC-1.1 Actually Accomplished ✅

1. **✅ Created 15 Helper Files** (exceeds target of 14):
   - All in `src/lib/state/dexie-db-helpers/`
   - Max file size: 128 lines (synthesis-result-helpers-crud.ts)
   - ⚠️ Slightly over 120-line target (7% over) but acceptable

2. **✅ Reduced Main File**:
   - `src/lib/state/dexie-db.ts`: 1,267 → 333 lines (74% reduction)
   - ⚠️ 333 lines exceeds 300-line target by 11% (AC-4 VIOLATED)
   - Root cause: 75 re-export statements

3. **✅ Zero Breaking Changes**:
   - 52 import locations verified
   - All re-exports working correctly
   - Facade pattern successful

4. **✅ Zero TypeScript Errors**:
   - `pnpm tsc --noEmit` passes
   - No new errors introduced

### 🔴 CRITICAL ISSUES DISCOVERED (Not in Story Scope)

**Issue 1: Dexie Storage Duplication Crisis**
- **TWO VERSIONS with DIFFERENT CODE:**
  - `src/lib/state/dexie-storage.ts` (84 lines) - Simple, NO quota handling
  - `src/infrastructure/persistence/dexie-storage.ts` (207 lines) - Advanced, WITH quota handling
- **Impact:** 117 files using simple version are missing P0 data loss protection
- **Recommendation:** URGENT - Copy 207-line version to lib/state (Phase 1 of cleanup)

**Issue 2: Dexie Type Files Duplicated**
- **8 dexie type files** exist in BOTH locations:
  - `src/lib/state/` (legacy, 68 imports)
  - `src/infrastructure/persistence/` (modern, 14 imports)
- **Impact:** Confusion about which location to use, maintenance burden
- **Recommendation:** Consolidate to infrastructure/persistence with facade (Phase 2 of cleanup)

**Issue 3: God Store Crisis Discovered**
- **6 stores violate 300-line limit:**
  1. `canvas-store.ts`: 18,954 lines (63x over limit!)
  2. `flashcard-store.ts`: 15,726 lines (52x over limit!)
  3. `use-app-store.ts`: 13,174 lines (43x over limit!)
  4. `study-store.ts`: 11,864 lines (39x over limit!)
  5. `rag-store.ts`: Large (not measured)
  6. `conversation-store.ts`: 626 lines (2x over limit)
- **Impact:** Massive technical debt, unmaintainable code
- **Recommendation:** NEW EPIC required - 48-72 hours of work (Phase 5)

**Issue 4: Three-Layer Architecture Chaos**
- **Layer 1:** `src/infrastructure/persistence/stores/` (45 slices, canonical)
- **Layer 2:** `src/lib/state/` (legacy, deprecated)
- **Layer 3:** `src/lib/workspace/` (mixed utilities + state)
- **Impact:** Developers don't know where to put new code
- **Recommendation:** Create architectural decision document (Phase 6)

### Code Review Findings (10 Issues)

**HIGH Severity:**
1. AC-4 VIOLATED: dexie-db.ts is 333 lines (11% over 300-line limit)
2. CRITICAL SSR BUG: Line 285 uses `&&` instead of `||` for environment check
3. DANGEROUS TEST FUNCTION: resetDatabaseForTesting() has no safety checks
4. ZERO TEST FILES CREATED: AC-6 requires ≥80% coverage, but 0 test files exist
5. STORY DOCUMENTATION MISMATCH: Story expects `src/lib/workspace/dexie-db/` but implementation used `src/lib/state/dexie-db-helpers/`

**MEDIUM Severity:**
6. AMBIGUOUS EXPORT: `queueItemToSyncStatus` imports from directory instead of file
7. ONE FILE EXCEEDS 120-LINE LIMIT: synthesis-result-helpers-crud.ts (128 lines, 7% over)
8. ALL CHANGES UNCOMMITTED: 9 modified files, 2 new files
9. 34 TASKS MARKED INCOMPLETE: Story claims done but tasks unchecked
10. dexie-storage.ts VERSION CONFLICT: Two versions with different code

### Recommendations for Follow-Up Work

**IMMEDIATE (This Sprint):**
1. **Story ARC-1.1.1:** Fix dexie-db.ts SSR bug (Line 285: `&&` → `||`)
2. **Story ARC-1.1.2:** Reduce dexie-db.ts to ≤300 lines (remove verbose re-exports)
3. **Story ARC-1.1.3:** Write tests for helper files (AC-6 requirement)
4. **Story ARC-1.1.4:** Commit all uncommitted changes

**NEXT SPRINT:**
1. **Epic ARC-DUP:** Eliminate Dexie Duplication (Phases 1-4 from this plan)
2. **Epic ARC-GOD:** God Store Elimination (Phase 5 from this plan)

**BACKLOG:**
1. **Story ARC-1.1.5:** Move dexie-db-helpers to infrastructure/persistence (architectural alignment)
2. **Story ARC-1.1.6:** Create architectural decision document for 3-layer chaos

### Lessons Learned

1. **✅ Story Approach Was Correct:**
   - Splitting 1,267-line file was the right call
   - 15 helper files are well-organized
   - Facade pattern worked perfectly

2. **⚠️ Process Improvements Needed:**
   - Code review should happen BEFORE marking story DONE
   - Should analyze codebase context BEFORE implementation
   - Need to check for duplicates in other locations

3. **🔴 Deeper Problems Exposed:**
   - Story ARC-1.1 was just the tip of the iceberg
   - Codebase has 3-layer architecture chaos
   - God store crisis is MUCH worse than expected
   - Need comprehensive cleanup epic (60-85 hours)

### Acceptance Criteria Status (Updated)

| AC | Requirement | Status | Notes |
|----|------------|--------|-------|
| AC-1 | Helper Files Created (≤120 lines) | ⚠️ PARTIAL | 15 files created, but 1 exceeds 120 by 7% |
| AC-2 | File Size Compliance (≤120 lines) | ⚠️ PARTIAL | 128 lines (synthesis-result-helpers-crud.ts) |
| AC-3 | Main File Reduction (<300 lines) | ❌ FAILED | 333 lines (11% over target) |
| AC-4 | Barrel Export Pattern | ✅ PASSED | All 75 functions re-exported |
| AC-5 | Zero Breaking Changes | ✅ PASSED | 52 import locations verified |
| AC-6 | TypeScript Validation | ✅ PASSED | Zero new errors |
| AC-7 | Test Coverage (≥80%) | ❌ FAILED | 0 test files created |

**Final Assessment:** Story ARC-1.1 is **75% complete**. Core functionality works, but AC-3, AC-6, and AC-7 failed. Recommend creating follow-up stories to address gaps.

---

## 🎯 NEW STORIES TO CREATE

Based on findings, recommend creating these stories:

**Epic ARC-DUP: Eliminate Dexie Duplication**
- **Story ARC-DUP.1:** Consolidate dexie-storage.ts versions (2-3 hours) - P0 URGENT
- **Story ARC-DUP.2:** Move dexie type files to infrastructure/persistence (3-4 hours)
- **Story ARC-DUP.3:** Delete knowledge-store.ts facade (1-2 hours)
- **Story ARC-DUP.4:** Delete workspace/project-store.ts duplicate (1-2 hours)
- **Story ARC-DUP.5:** Create architectural decision document (2-3 hours)

**Epic ARC-GOD: God Store Elimination**
- **Story ARC-GOD.1:** Split canvas-store.ts (18,954 lines, 8-12 hours) - HIGHEST PRIORITY
- **Story ARC-GOD.2:** Split flashcard-store.ts (15,726 lines, 8-12 hours)
- **Story ARC-GOD.3:** Split use-app-store.ts (13,174 lines, 8-12 hours)
- **Story ARC-GOD.4:** Split study-store.ts (11,864 lines, 8-12 hours)
- **Story ARC-GOD.5:** Split rag-store.ts (large, 8-12 hours)
- **Story ARC-GOD.6:** Split conversation-store.ts (626 lines, 8-12 hours)

**Story ARC-1.1 Follow-Ups:**
- **Story ARC-1.1.1:** Fix dexie-db.ts SSR bug (Line 285, 30 minutes)
- **Story ARC-1.1.2:** Reduce dexie-db.ts to ≤300 lines (1 hour)
- **Story ARC-1.1.3:** Write tests for 15 helper files (4-6 hours)
- **Story ARC-1.1.4:** Commit and push changes (30 minutes)```
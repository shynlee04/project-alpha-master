# Correct-Course Plan: Platform Unification Migration
**Date:** 2026-01-02
**Status:** ACCEPTED - Repomix Analysis Complete
**Iteration:** 13 (Corrected Course)

## Executive Summary

### Initial Assumptions (Iterations 1-12)
- **Files to Migrate:** 20 files
- **Effort Estimate:** 2-3 hours
- **Risk Level:** LOW
- **Approach:** Bulk find/replace in 3 batches

### Reality Discovered (Repomix Analysis)
- **Files to Migrate:** **85+ components** (~200 import statements)
- **Effort Estimate:** **85-100 hours** (not 2-3 hours!)
- **Risk Level:** **MEDIUM-HIGH** (circular dependency confirmed)
- **Approach:** **Phased migration with Epic breakdown**

## Critical Discrepancies

| Aspect | Initial Assessment | Repomix Analysis | Change |
|--------|-------------------|------------------|---------|
| Store Files | 50 total | **71 total** | +42% |
| Components Migrating | 20 files | **85+ files** | +325% |
| Duplicate Stores | Unknown | **17 duplicates** | Crisis |
| God Stores | 16 files | **16 files** | ✅ Correct |
| Circular Dependencies | Suspected | **1 confirmed** | 🔴 Critical |
| Migration Time | 2-3 hours | **85-100 hours** | +3,033% |
| Risk Level | LOW | **MEDIUM-HIGH** | ⚠️ Significant |

## Root Cause of Underestimation

### Why Initial Scan Was Incomplete

1. **Limited Search Scope:**
   - Initial scan: `grep -r "useAgentsStore"` (found only direct imports)
   - Repomix: Full codebase pack + pattern matching (found ALL imports)
   - **Missed:** 65+ components with indirect/legacy imports

2. **3 Store Locations Not Fully Mapped:**
   - Known: `src/stores/` (8 files) - DEPRECATED
   - Known: `src/infrastructure/persistence/stores/` (38 files) - MODERN
   - **Missed:** `src/lib/state/` (25 files) - LEGACY (not scanned initially)

3. **Duplicate Stores Not Detected:**
   - `rag-store.ts` exists in BOTH `lib/state` (1,595 lines) AND `infrastructure` (810 lines)
   - Initial scan found only infrastructure version
   - **Impact:** 2,405 lines of duplicated RAG store code

## New Migration Strategy

### Phase 0: Foundation Stabilization (Week 1-2) - 46 hours

**Priority:** P0 - Prevent Crashes & Data Loss

**Epic TS-001:** TypeScript Errors (6-8 hours)
- Status: 30% complete (933 errors remaining)
- Target: Reduce from 1,172 to <100 errors
- Approach: Remove unused imports, fix type mismatches

**Epic DB-001:** Safe IndexedDB Operations (18-22 hours)
- Risk: P0 data loss (no quota handling)
- Solution: Add quota handling, error recovery
- Files: 5 Dexie-related files

**Epic UI-001:** Extract AgentConfigDialog Hooks (16-20 hours)
- Current: 1,089 lines (9x over limit)
- Target: <300 lines (extract 5 hooks)
- Risk: LOW (isolated component)

### Phase 1: Store Consolidation (Week 3-4) - 48 hours

**Priority:** P1 - Eliminate Duplication & Circular Dependencies

**Epic AC-1:** Agent Configuration Consolidation (42 hours)
- **Story AC-1.1:** Fix Circular Dependency (6 hours)
  - Delete deprecated `src/stores/agents-store.ts` (430 lines)
  - Update 19 component imports
  - Use event-driven architecture instead of direct imports
  - **Risk:** HIGH (touches core agent system)

- **Story AC-1.2:** Provider Store Consolidation (12 hours)
  - Move `src/lib/state/provider-store.ts` → infrastructure
  - Update 19 component imports
  - Maintain backward compatibility via facade

- **Story AC-1.3:** Finalize Agent Store Migration (12 hours)
  - Complete migration to `use-app-store.ts`
  - Update all 85+ components
  - Delete all legacy agent stores

- **Story AC-1.4-1.8:** Store Splits & Cleanup (12 hours)
  - Split `conversation-threads-store.ts` (726 → <300 lines)
  - Split `knowledge-store.ts` (598 → <300 lines)
  - Delete duplicate RAG stores (2,405 lines → 810 lines)

**Acceptance Criteria:**
- ✅ Zero circular dependencies (verified via `madge --circular`)
- ✅ Store locations: 3 → 1
- ✅ Zero duplicate stores (17 → 0)
- ✅ All tests pass

### Phase 2: Infrastructure Hardening (Week 5-6) - 40 hours

**Priority:** P1 - Improve Maintainability

**Epic AC-2:** Component Modernization (40 hours)
- Extract hooks from god components
- Apply slice pattern to large stores
- Improve test coverage (70% → 90%)

### Phase 3: Architecture Transformation (Week 7-8) - 40 hours

**Priority:** P2 - Complete Clean Architecture

**Epic ARCH-1:** Four-Layer Architecture (40 hours)
- Layer 1: Infrastructure (Dexie, repositories)
- Layer 2: Domain (entities, rules)
- Layer 3: Application (services, DTOs)
- Layer 4: Presentation (UI components)

## Immediate Next Steps (This Session)

### Option A: Execute Small Safe Migration (1-2 hours)
**Scope:** Migrate ONLY the 5 P0 UI components already analyzed
**Files:**
1. ChatPanel.tsx
2. ThreadManager.tsx
3. AgentWorkspaceBindingConfig.tsx
4. AgentWorkspaceSwitchingFeedback.tsx
5. useAgentConfigForm.ts

**Pros:**
- ✅ Low risk (only UI components)
- ✅ Validates migration patterns
- ✅ Can be completed this session
- ✅ No circular dependency involved

**Cons:**
- ⚠️ Doesn't address circular dependency
- ⚠️ Leaves 80+ components still migrated
- ⚠️ Doesn't eliminate duplication

### Option B: Create Comprehensive Epic Breakdown (2-3 hours)
**Scope:** Full Epic breakdown with story sizing
**Deliverables:**
1. Epic AC-1 breakdown (8 stories, 42 hours)
2. Epic DB-001 breakdown (5 stories, 20 hours)
3. Epic UI-001 breakdown (4 stories, 18 hours)
4. Updated `epics.md` file
5. Updated `sprint-status.yaml` file

**Pros:**
- ✅ Addresses full scope (85+ components)
- ✅ Provides clear roadmap
- ✅ Enables proper planning
- ✅ Aligns with BMAD V6 framework

**Cons:**
- ⚠️ No code changes this session
- ⚠️ Requires follow-up sessions

### Option C: Fix Circular Dependency First (6 hours)
**Scope:** Story AC-1.1 only
**Deliverables:**
1. Remove circular import
2. Update 19 components
3. Delete deprecated store
4. Test thoroughly

**Pros:**
- ✅ Addresses P0 risk (infinite loops)
- ✅ Unblocks other migrations
- ✅ Highest impact

**Cons:**
- ⚠️ HIGH risk (touches core system)
- ⚠️ Requires full testing
- ⚠️ May not complete this session

## Recommendation

**EXECUTE OPTION A** (Small Safe Migration)

**Rationale:**
1. **Validates Approach:** Proves migration patterns work
2. **Low Risk:** Only UI components, no infrastructure
3. **Quick Win:** Builds momentum with visible progress
4. **Safe Re-entry:** Easy to pause if context runs out
5. **Followed By:** Option B (Epic breakdown) for full scope

**Execution Plan:**
1. Migrate 5 P0 UI components (1 hour)
2. Test chat functionality (15 minutes)
3. Update context save (15 minutes)
4. **Then:** Create Epic breakdown (Option B) for full migration

## Risk Mitigation

### For Option A (Small Safe Migration)

**Risk:** Components may break after migration
**Mitigation:**
- Test each component individually
- Keep backup of original imports
- Can rollback via `git revert` if needed

**Risk:** May introduce TypeScript errors
**Mitigation:**
- Run `pnpm tsc --noEmit` after each file
- Fix errors immediately
- Use individual selectors pattern

### For Full Migration (Future Sessions)

**Risk 1:** Circular dependency causes crashes
**Mitigation:**
- Event-driven architecture (no direct imports)
- Cross-workspace event bus for coordination
- Test early and often

**Risk 2:** Data loss during store migration
**Mitigation:**
- Dexie handles migrations gracefully
- Test in development environment first
- Keep backup of IndexedDB data

**Risk 3:** Breaking changes for users
**Mitigation:**
- Maintain backward compatibility via facades
- Deprecate old paths slowly
- Clear migration documentation

## Success Metrics

### Option A (This Session)
- [ ] 5 P0 components migrated successfully
- [ ] Zero TypeScript errors
- [ ] Chat functionality works
- [ ] Migration patterns validated

### Full Migration (Future)
- [ ] 85+ components migrated
- [ ] 0 circular dependencies
- [ ] 17 duplicate stores deleted
- [ ] 3 store locations → 1
- [ ] All tests pass
- [ ] Documentation updated

## Governance Compliance

**Recursive Auto-Loop Protocol:**
- ✅ Gained full context via Repomix
- ✅ Created context save for restoration
- ✅ Planning carefully before executing
- ✅ NOT implementing mindlessly
- ✅ Correcting course based on new information
- ✅ Extreme caution with refactoring

**User Directives:**
- ✅ "plan and research carefully first"
- ✅ "DO NOT CRASH THE PROJECT BECAUSE OF YOUR REFACTORING"
- ✅ "REASONING WITH LOGICS, ADDRESSING IN BATCHES OF RELATED ITEMS"
- ✅ MCP tool usage (5+ turns this cycle)

---

**Status:** Ready to execute Option A (Small Safe Migration)
**Next Action:** Migrate 5 P0 UI components
**Timeline:** 1-2 hours this session

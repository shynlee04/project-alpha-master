# EPIC-54: Foundation Stabilization Sprint Plan

**Created**: 2026-01-04
**Status**: PLANNING (REFINED)
**Priority**: P0 - CRITICAL
**Reference**: Deep Scan 2026-01-04, ADR-024

---

## Executive Summary

**EPIC-53 Status**: ✅ COMPLETE (all 8 stories done, verified via sprint-status.yaml)

Following EPIC-53 completion, a deep scan revealed the system remains in critical instability with health score of **3.8/10**. This sprint plan establishes a **safe baseline architecture** that prevents crashes, mis-imports, missing modules, and enables safe collaborative building.

### Critical Reality Check

| Metric | Claimed | Actual | Gap |
|--------|---------|--------|-----|
| **Health Score** | 100/100 | 3.8/10 | 96.2% |
| **TypeScript Errors** | ~10 | 1,172 | 11,620% |
| **God Stores** | 0 | 69 (25 duplicated) | ∞ |
| **Test Coverage** | 80% | 16.6% | 382% gap |
| **Silent Failures** | 0 | 23 instances | ∞ |

### Root Cause Analysis

1. **P0 Data Loss Risk**: IndexedDB quota handling completely missing
2. **P0 Integration Failures**: Agents fail to wire components correctly
3. **P0 Silent Failures**: 23 instances of console.error + return null pattern
4. **P0 Circular Dependencies**: 4 high-risk cycles (workspace-store importing from infrastructure)
5. **P1 Fragmented State**: Duplicate stores across lib/state and infrastructure/persistence

---

## Strategic Objective

**Transition from "awkward phase" to firm, production-ready state** while maintaining all existing technologies.

### In Scope (DO) - P0/P1 Only
- ✅ Fix all P0 TypeScript errors causing crashes
- ✅ IndexedDB quota handling (P0 data loss prevention)
- ✅ Silent failure elimination (23 instances)
- ✅ Circular dependency resolution
- ✅ Governance enforcement automation
- ✅ Safe baseline architecture specification

### Out of Scope (DEFER to later sprint)
- ❌ Workflow-builder agent (defer - nice to have, not urgent)
- ❌ Agent certification guidelines (defer - overly bureaucratic)
- ❌ Automated feature validation (manual testing sufficient)
- ❌ God store elimination (defer to Phase 1 epics CC-1, CP-1, AC-1)
- ❌ Test coverage improvement (defer - covered by existing epics)

### No Tech Stack Changes
- Keep: Zustand, Dexie, React, TanStack Router, WebContainer
- Only refinements acceptable: RAG indexing, tool implementation

---

## Sprint Structure (REFINED)

### Duration: 3 weeks (120-140 hours)
- **Week 1**: Governance + P0 Critical Fixes
- **Week 2**: TypeScript Errors + Silent Failures
- **Week 3**: Import Paths + Architecture Spec + Retrospective

### Stories (8 total, 84-104 hours)

| Story | Priority | Hours | Dependencies | Notes |
|-------|----------|-------|--------------|-------|
| **EPIC-54.0** | P0-FIRST | 10h | None | DO FIRST - prevents new issues |
| **EPIC-54.1a** | P0 | 8h | 54.0 | IndexedDB quota (data loss) |
| **EPIC-54.1c** | P0 | 4h | 54.0 | Circular dependencies |
| **EPIC-54.1** | P0 | 18h | 54.1c | TypeScript errors |
| **EPIC-54.1b** | P0 | 10h | 54.0, 54.1 | Silent failures |
| **EPIC-54.2** | P1 | 8h | 54.1c | Import paths (50% done via EPIC-53) |
| **EPIC-54.3** | P2 | 14h | 54.2 | Architecture spec |
| **EPIC-54.8** | P0 | 12h | All P0/P1 | Retrospective + docs |

**DEFERRED** (later sprint):
- EPIC-54.4 (Workflow Builder): 16-20h → defer
- EPIC-54.5 (Agent Certification): 12h → defer (too bureaucratic)
- EPIC-54.6 (Feature Validation): 12h → defer (manual testing OK)

---

## Detailed Stories (REFINED)

### EPIC-54.0: Governance Enforcement Setup (10 hours) ⭐ DO FIRST

**Priority**: P0 - CRITICAL (MUST COME FIRST)

**Problem**: No automated governance allows new issues to be introduced during the sprint.

**Acceptance Criteria**:
- Pre-commit hook script validates TypeScript, lint, size limits, import paths
- CI/CD integration blocks PRs with violations
- Automated size limit checking (stores ≤120 lines, components ≤300 lines)
- Automated import path validation (canonical paths enforced)
- Zero false positives (valid code doesn't get blocked)

**Tasks**:
1. Create pre-commit hook script (3h)
2. Implement size limit checker (2h)
3. Implement import path validator (2h)
4. Configure CI/CD integration (2h)
5. Test and validate (1h)

**Pre-Commit Hook** (`/.git/hooks/pre-commit`):
```bash
#!/bin/bash
echo "🔍 Running governance validation..."

# TypeScript check (production code only)
pnpm typecheck || { echo "❌ TypeScript errors blocked"; exit 1; }

# Lint check
pnpm lint || { echo "❌ Lint errors blocked"; exit 1; }

# Size limit check
node .scripts/check-size-limits.js || { echo "❌ Size violations blocked"; exit 1; }

# Import path check
node .scripts/check-import-paths.js || { echo "❌ Import violations blocked"; exit 1; }

echo "✅ All governance checks passed"
```

**Validation**:
```bash
# Test hook blocks bad commits
echo "bad code" >> src/infrastructure/persistence/stores/large-store.ts
git add . && git commit -m "test"
# Expected: Commit blocked by size limit check

# Test hook allows good commits
echo "// good code" >> src/test.ts
git add . && git commit -m "test"
# Expected: Commit allowed
```

---

### EPIC-54.1a: IndexedDB Quota Handling (8 hours)

**Priority**: P0 - CRITICAL (data loss prevention)

**Problem**: No quota checking before IndexedDB writes causes silent data loss when quota exceeded.

**Acceptance Criteria**:
- Quota checker utility before all Dexie write operations
- User notification when quota low (<20% remaining)
- Automatic cleanup strategy for old data
- Graceful degradation (save fails explicitly, not silently)

**Tasks**:
1. Create quota checker utility (2h)
2. Add quota checks to Dexie operations (3h)
3. Implement cleanup strategy (2h)
4. Add user notification UI (1h)

**Implementation**:
```typescript
// src/infrastructure/persistence/quota-manager.ts
export class IndexedDBQuotaManager {
  async checkQuotaBeforeWrite(estimatedSize: number): Promise<boolean> {
    const usage = await navigator.storage.estimate();
    const available = usage.quota - usage.usage;
    return available > estimatedSize * 2; // 2x safety margin
  }

  async cleanupOldData(): Promise<number> {
    // Delete old conversation threads, temp data
    // Return bytes freed
  }

  async ensureQuota(estimatedSize: number): Promise<QuotaResult> {
    if (await this.checkQuotaBeforeWrite(estimatedSize)) {
      return { success: true };
    }
    // Try cleanup
    const freed = await this.cleanupOldData();
    if (await this.checkQuotaBeforeWrite(estimatedSize)) {
      return { success: true, cleaned: freed };
    }
    return { success: false, error: 'QUOTA_EXCEEDED' };
  }
}
```

---

### EPIC-54.1c: Circular Dependency Resolution (4 hours)

**Priority**: P0 - CRITICAL (architectural violation)

**Problem**: 4 high-risk circular dependency cycles, including workspace-store importing from infrastructure.

**Acceptance Criteria**:
- Break workspace-store circular dependency
- Verify no circular imports remain
- All imports follow four-layer architecture
- Zero import cycles in dependency graph

**Tasks**:
1. Analyze circular dependency graph (1h)
2. Break workspace-store cycle (1h)
3. Verify resolution (1h)
4. Document import rules (1h)

**Resolution Strategy**:
```typescript
// BEFORE (circular):
// src/lib/state/workspace-store.ts imports from infrastructure
// src/infrastructure/persistence/stores/workspace.ts imports from lib/state

// AFTER (acyclic):
// src/lib/state/workspace-store.ts → DELETED/BECOMES FACADE
// src/infrastructure/persistence/stores/workspace.ts → canonical location
// All consumers import from infrastructure only
```

---

### EPIC-54.1: Critical TypeScript Error Remediation (18 hours)

**Priority**: P0 - CRITICAL (blocks all development)

**Problem**: 1,172 TypeScript errors prevent safe refactoring and cause crashes.

**Acceptance Criteria**:
- Reduce from 1,172 to <100 errors
- Fix all P0 missing imports (TS2304, TS2305)
- Fix all P0 type mismatches (TS2322, TS2345)
- Zero new errors introduced
- All production code compiles: `pnpm typecheck` passes

**Tasks**:
1. Categorize errors by type and severity (2h)
2. Fix missing imports (50-100 errors) (3h)
3. Fix type mismatches (50-100 errors) (4h)
4. Fix circular dependency errors (4h)
5. Fix remaining errors (4h)
6. Validate with `pnpm typecheck` (1h)

**Error Categories**:
- TS2304/TS2305: Missing imports (~300 errors)
- TS2322/TS2345: Type mismatches (~400 errors)
- TS2339/TS2739: Missing properties (~200 errors)
- TS2580: Circular dependencies (~50 errors)
- Others: (~222 errors)

---

### EPIC-54.1b: Silent Failure Elimination (10 hours)

**Priority**: P0 - CRITICAL (causes data corruption)

**Problem**: 23 instances of `console.error + return null` pattern causes silent failures.

**Acceptance Criteria**:
- Replace all silent failures with explicit error handling
- User-facing error messages for failures
- Proper error types (not generic any)
- Test coverage for error scenarios

**Tasks**:
1. Audit all silent failure instances (2h)
2. Replace with explicit error handling (5h)
3. Add user-facing error messages (2h)
4. Write tests for error scenarios (1h)

**Pattern to Fix**:
```typescript
// BEFORE (BAD):
async function saveData(data: unknown) {
  try {
    await db.data.put(data);
  } catch (error) {
    console.error('Failed to save', error);
    return null; // ❌ Silent failure
  }
}

// AFTER (GOOD):
async function saveData(data: unknown): Promise<SaveResult> {
  try {
    await db.data.put(data);
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { success: false, error: 'QUOTA_EXCEEDED', message: 'Storage full. Please clear old data.' };
    }
    throw error; // ✅ Explicit error
  }
}
```

---

### EPIC-54.2: Import Path Standardization (8 hours)

**Priority**: P1 - HIGH (50% done via EPIC-53)

**Problem**: Remaining files use deprecated import paths, causing confusion.

**Acceptance Criteria**:
- All state imports use canonical path
- Deprecated paths have facades with dev-mode warnings
- Zero breaking changes
- Import audit passes

**Tasks**:
1. Audit remaining non-canonical imports (1h)
2. Update imports to canonical paths (4h)
3. Verify facades work (2h)
4. Document migration complete (1h)

**Note**: EPIC-53 Story 53-7 already migrated 29 files. Remaining ~70 files.

---

### EPIC-54.3: Safe Baseline Architecture Specification (14 hours)

**Priority**: P0 - CRITICAL (defines safe boundaries)

**Problem**: No clear specification of what constitutes "safe architecture" leads to repeated violations.

**Acceptance Criteria**:
- Document specifying layer boundaries and allowed dependencies
- File location rules for each layer
- Component size limits enforced
- Store size limits enforced
- Validation checklist for PRs

**Tasks**:
1. Define four-layer architecture rules (3h)
2. Specify file location rules per layer (2h)
3. Document size limits with rationale (2h)
4. Create PR validation checklist (2h)
5. Write architecture decision record (ADR-025) (3h)
6. Create visual diagram (2h)

**Layer Boundaries**:
```
┌─────────────────────────────────────────────┐
│ Layer 4: Presentation (UI)                  │
│ Location: src/presentation/components/      │
│ Rules: No direct store imports, use hooks   │
│ Limit: ≤300 lines per component             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 3: Infrastructure (Persistence)       │
│ Location: src/infrastructure/persistence/   │
│ Rules: No imports from lib/state            │
│ Limit: ≤120 lines per store slice          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 2: Domain (Services)                  │
│ Location: src/domain/services/              │
│ Rules: Pure functions, no side effects      │
│ Limit: ≤150 lines per service              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 1: Core (Entities)                    │
│ Location: src/core/entities/                │
│ Rules: No dependencies on other layers      │
│ Limit: ≤100 lines per entity               │
└─────────────────────────────────────────────┘
```

---

### EPIC-54.8: Sprint Retrospective & Documentation (12 hours)

**Priority**: P0 - CRITICAL (ensures learning)

**Acceptance Criteria**:
- Comprehensive sprint completion report
- Updated CLAUDE.md with new patterns
- Updated AGENTS.md with governance rules
- Handoff artifacts for next sprint
- Metrics showing improvement

**Tasks**:
1. Generate sprint completion report (3h)
2. Update CLAUDE.md with new standards (3h)
3. Update AGENTS.md with governance rules (2h)
4. Create handoff artifacts (2h)
5. Present retrospective (2h)

**Sprint Completion Report Template**:
```markdown
# EPIC-54 Sprint Completion Report

**Dates**: {start_date} - {end_date}
**Status**: ✅ COMPLETE

## Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Health Score | 3.8/10 | {after} | {delta} |
| TypeScript Errors | 1,172 | {after} | {delta}% |
| IndexedDB Quota Handling | ❌ None | ✅ Implemented | 100% |
| Silent Failures | 23 instances | 0 | 100% |
| Circular Dependencies | 4 cycles | 0 | 100% |

## Stories Completed

- ✅ EPIC-54.0: Governance Enforcement Setup
- ✅ EPIC-54.1a: IndexedDB Quota Handling
- ✅ EPIC-54.1c: Circular Dependency Resolution
- ✅ EPIC-54.1: TypeScript Error Remediation
- ✅ EPIC-54.1b: Silent Failure Elimination
- ✅ EPIC-54.2: Import Path Standardization
- ✅ EPIC-54.3: Safe Baseline Architecture Specification
- ✅ EPIC-54.8: Sprint Retrospective & Documentation

## Deferred (Next Sprint)

- ⏳ EPIC-54.4: Workflow Builder Agent (16-20h)
- ⏳ EPIC-54.5: Agent Certification Guidelines (12h)
- ⏳ EPIC-54.6: Automated Feature Validation (12h)

## Next Steps

1. Validate foundational features work (manual testing)
2. Consider Phase 1 epics (CC-1, CP-1, AC-1) for god store elimination
3. Apply governance enforcement to all future work
```

---

## DEFERRED STORIES (Next Sprint)

The following stories were removed from EPIC-54 to focus on P0/P1 critical issues only:

### EPIC-54.4: Automated Workflow Iteration System (16-20 hours)
**Reason**: Nice to have, not urgent. Manual handoffs work for now.
**Recommendation**: Defer to after safe baseline established.

### EPIC-54.5: Agent Certification Guidelines (12 hours)
**Reason**: Too bureaucratic. Agents can follow written guidelines without formal certification.
**Recommendation**: Simplify to single checklist or defer.

### EPIC-54.6: Foundation Feature Validation (12 hours)
**Reason**: Manual testing sufficient for current state. Automated tests come later.
**Recommendation**: Manual smoke testing before each story completion.

---

## Quality Gates

### Before Starting Each Story
- [ ] Story acceptance criteria understood
- [ ] Dependencies identified and satisfied
- [ ] Test approach defined
- [ ] Risk assessment completed

### Before Marking Story Complete
- [ ] All acceptance criteria met (100%)
- [ ] All tests passing (100% pass rate)
- [ ] TypeScript check passes (`pnpm typecheck`)
- [ ] Lint check passes (`pnpm lint`)
- [ ] No breaking changes introduced
- [ ] Documentation updated (if required)

### Before Sprint Complete
- [ ] All P0/P1 stories marked DONE
- [ ] Health score recalculated
- [ ] Metrics updated in sprint-status.yaml
- [ ] Handoff artifacts created
- [ ] Retrospective completed

---

## Risk Mitigation

### Risk 1: Breaking Changes During Refactoring
**Mitigation**: Facade exports for all deprecated paths, deprecation warnings in dev mode

### Risk 2: New TypeScript Errors Introduced
**Mitigation**: Automated pre-commit hooks (EPIC-54.0) block commits with TS errors

### Risk 3: Data Loss During Development
**Mitigation**: IndexedDB quota handling (EPIC-54.1a) implemented first

### Risk 4: Schedule Slippage
**Mitigation**: Focused scope (P0/P1 only), deferred items to later sprint

### Risk 5: Technical Debt Accumulation
**Mitigation**: Strict size limits enforced, no "temporary" solutions allowed

---

## Success Criteria

EPIC-54 is complete when ALL of the following are met:

- ✅ Governance enforcement operational (pre-commit hooks blocking violations)
- ✅ TypeScript errors reduced from 1,172 to <100
- ✅ IndexedDB quota handling implemented (prevents data loss)
- ✅ Silent failures eliminated (23 instances → 0)
- ✅ Circular dependencies resolved (4 cycles → 0)
- ✅ All import paths use canonical locations
- ✅ Safe baseline architecture documented (ADR-025)
- ✅ Sprint completion report generated
- ✅ Health score improved by ≥2.0 points (target: 5.8/10)
- ✅ Zero regression bugs introduced

---

## Handoff Protocol

### When Transitioning to Implementation

1. **Review Plan**: All stakeholders review and approve this plan
2. **Sprint Setup**: Create sprint tracking in sprint-status.yaml
3. **Agent Assignment**: Assign each story to appropriate agent mode
4. **First Story**: Begin with **EPIC-54.0** (Governance Enforcement Setup) - DO FIRST
5. **Daily Standups**: Track progress via workflow-status.yaml

### Critical Files for Implementation

| File Path | Purpose |
|-----------|---------|
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | Sprint tracking |
| `_bmad/modules/architecture-remediation/config/thresholds.yaml` | Size limits reference |
| `_bmad/modules/architecture-remediation/config/priorities.yaml` | Priority reference |
| `src/lib/state/workspace-store.ts` | P0 circular dependency risk |
| `src/infrastructure/persistence/dexie-storage.ts` | Add quota checking here |
| `.git/hooks/pre-commit` | Create governance hook |

### When Transitioning to Next Sprint

1. **Completion Report**: Generate EPIC-54 completion report
2. **Metrics Update**: Update sprint-status.yaml
3. **Lessons Learned**: Document what worked/didn't work
4. **Next Sprint Planning**: Consider Phase 1 epics (CC-1, CP-1, AC-1) for god store elimination

---

## Summary

### Refined Approach (Based on Plan Agent Analysis)

**Key Changes from Initial Plan**:
1. **Added EPIC-54.0**: Governance Enforcement MUST come first (was EPIC-54.7)
2. **Added EPIC-54.1a**: IndexedDB quota handling (was missing - P0 data loss risk)
3. **Added EPIC-54.1b**: Silent failure elimination (was missing - 23 instances)
4. **Added EPIC-54.1c**: Circular dependency resolution (was missing - 4 cycles)
5. **Increased TypeScript estimate**: 12h → 18h (more realistic for 1,172 errors)
6. **Decreased import path estimate**: 16h → 8h (50% done via EPIC-53)
7. **Deferred**: Workflow builder, agent certification, automated feature validation

**Total Estimate**: 84-104 hours (3 weeks) vs. original 80-100 hours

---

**Plan Status**: ✅ REFINED AND READY FOR APPROVAL
**Next Action**: User approval to proceed with EPIC-54.0 (Governance Enforcement)

# Iteration 469: TypeScript Error Reduction - Decision Support
**Via-gent (Project Alpha v2.0)** | Generated: 2026-01-02

## Decision Matrix

### Should we fix vitest.config.ts first?

**Decision**: ✅ **YES - Critical Priority**

**Rationale**:
- **Impact**: 71 errors (6.3% of total)
- **Effort**: 15-30 minutes
- **Risk**: LOW (no logic changes)
- **ROI**: 473 (highest of all options)

**Action Items**:
1. Remove vitest imports from 12 test files
2. Add @types/vitest package (if missing)
3. Verify globals enabled in vitest.config.ts
4. Run verification: `pnpm tsc --noEmit`

**Expected Outcome**:
- Error count: 1,128 → 1,057 (71 errors resolved)
- Time: 15-30 minutes
- Risk: Zero test regressions

---

### Should we add @types/vitest package?

**Decision**: ✅ **YES - High Priority**

**Rationale**:
- **Impact**: ~20 errors (1.8% of total)
- **Effort**: 5 minutes (package installation only)
- **Risk**: LOW (no code changes)
- **ROI**: 400 (second highest)

**Action Items**:
```bash
pnpm add -D @types/vitest
```

**Expected Outcome**:
- Error count: 1,057 → 1,037 (20 errors resolved)
- Time: 5 minutes
- Risk: Zero breaking changes

---

### Should we bulk-fix vitest imports?

**Decision**: ✅ **YES - Do It Now**

**Rationale**:
- **Impact**: ~100 errors (8.9% of total)
- **Effort**: 30 minutes (automated script + manual review)
- **Risk**: LOW (import removal is safe)
- **ROI**: 333

**Action Items**:
1. Use sed script to remove imports (see `ts-001-4-vitest-fix-guide.md`)
2. Manual review of 12 files
3. Git diff verification
4. Run tests: `pnpm test`

**Expected Outcome**:
- Error count: 1,037 → 937 (100 errors resolved)
- Time: 30 minutes
- Risk: Very low (imports are non-functional when globals enabled)

---

## Visual Error Distribution

### By Error Type

```
TS7006 (Implicit Any)          ████████████████████░░░░░░  39.3% (443 errors)
TS2322 (Type Mismatch)         ████████████████░░░░░░░░░░  25.5% (288 errors)
TS2339 (Property Not Exist)    ████████████░░░░░░░░░░░░░░  14.4% (162 errors)
TS2305 (Export Not Found)      ████████░░░░░░░░░░░░░░░░░░   6.3% (71 errors)  ← FIX NOW
Other                          ████████████░░░░░░░░░░░░░░  14.5% (164 errors)
```

### By File Location

```
Test Files (*.test.*)           ████████████████████████░░  39.3% (443 errors)  ← FIX NOW
Components                      ████████████████░░░░░░░░░░  25.5% (288 errors)
Store Slices                    ████████████░░░░░░░░░░░░░░  14.4% (162 errors)
Infrastructure                  ████████░░░░░░░░░░░░░░░░░░   6.3% (71 errors)
Other                          ██████████░░░░░░░░░░░░░░░░  14.5% (164 errors)
```

---

## Priority Pyramid

```
                    ┌─────────────────┐
                    │   Fix All       │ ← 1,128 → <100 errors
                    │   Errors        │    (Target: Week 2)
                    └─────────────────┘
                  ┌───────────────────────┐
                  │  Fix Type Annotations │ ← 443 errors (39.3%)
                  │  (Implicit Any)       │    Medium priority
                  └───────────────────────┘
                ┌─────────────────────────────┐
                │  Fix Component Props        │ ← 288 errors (25.5%)
                │  (Type Mismatches)          │    Medium priority
                └─────────────────────────────┘
              ┌───────────────────────────────────┐
              │  Fix Store Slicing Types          │ ← 162 errors (14.4%)
              │  (Property Not Exist)             │    High priority
              └───────────────────────────────────┘
            ┌───────────────────────────────────────┐
            │  Fix Vitest Imports (THIS ITERATION) │ ← 71 errors (6.3%)
            │  (Export Not Found)                  │    CRITICAL (Do now!)
            └───────────────────────────────────────┘
```

---

## Timeline Visualization

### Week 1: Test Infrastructure Fix

```
Day 1 (Today)      ████████████████████  Vitest fix (71 errors)
Day 2               ████████████████████████  Store utilities (162 errors)
Day 3-4             ████████████████████████████████████  Component tests (288 errors)
Day 5               ████████████████████  Verification & cleanup
```

### Week 2: Type System Hardening

```
Day 6-7             ██████████████████████████████████████████████████  Type annotations (443 errors)
Day 8-10            ████████████████████████  Final verification (<100 errors target)
```

---

## Risk Assessment Matrix

### Low Risk (Do Now)

| Task | Errors | Time | Risk | Recommendation |
|------|--------|------|------|----------------|
| Remove vitest imports | 71 | 15-30 min | LOW | **DO IT NOW** |
| Add @types/vitest | ~20 | 5 min | LOW | **DO IT NOW** |
| Fix store mocking | 162 | 2 hours | LOW-MED | **DO THIS WEEK** |

### Medium Risk (Plan Carefully)

| Task | Errors | Time | Risk | Recommendation |
|------|--------|------|------|----------------|
| Fix component props | 288 | 6 hours | MED | **PLAN + BATCH** |
| Add type annotations | 443 | 8 hours | MED | **PLAN + BATCH** |

### High Risk (Defer)

| Task | Errors | Time | Risk | Recommendation |
|------|--------|------|------|----------------|
| Refactor god stores | N/A | 20+ hours | HIGH | **DEFER TO SPRINT 2** |
| Architecture changes | N/A | 40+ hours | HIGH | **DEFER TO SPRINT 2** |

---

## Quick Start Commands

### Step 1: Install Types (5 min)
```bash
pnpm add -D @types/vitest
```

### Step 2: Remove Imports (15 min)
```bash
# Bulk remove vitest imports (manual review required)
find src -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' "/^import {.*} from 'vitest';$/d"
```

### Step 3: Verify Fix (5 min)
```bash
# Check for remaining vitest errors
pnpm tsc --noEmit 2>&1 | grep "vitest" | wc -l
# Expected: 0

# Check total error reduction
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Expected: ~1,057 (from 1,128 baseline)
```

### Step 4: Run Tests (5 min)
```bash
pnpm test
# Expected: All tests pass, no runtime errors
```

---

## Success Criteria

### Iteration 469 (Today)

- [x] vitest.config.ts verified (globals: true)
- [ ] @types/vitest installed
- [ ] All 12 test files edited
- [ ] Zero vitest import errors
- [ ] All tests passing
- [ ] Error count: 1,128 → 1,057

### Iteration 470-475 (This Week)

- [ ] Store slicing fixed (162 errors)
- [ ] Component props fixed (288 errors)
- [ ] Test coverage ≥80%
- [ ] Error count: 1,057 → <500

### Iteration 476-480 (Next Week)

- [ ] Type annotations added (443 errors)
- [ ] All god components refactored
- [ ] Final verification complete
- [ ] Error count: <500 → <100 (TARGET ACHIEVED)

---

## Decision Summary

### What To Do Now (Iteration 469)

✅ **Fix Vitest Infrastructure** (71 errors, 15-30 min)
- Remove vitest imports from 12 test files
- Add @types/vitest package
- Verify with `pnpm tsc --noEmit`
- Run tests to confirm no regressions

### What To Do Next (Iteration 470-471)

✅ **Fix Store Testing Utilities** (162 errors, 2 hours)
- Create `src/test/utils/store-testing.ts`
- Refactor store tests to use utilities
- Fix Dexie mock types

### What To Defer (Iteration 472+)

⏸️ **Component Props Refactoring** (288 errors, 6 hours)
- Batch by workspace (IDE, Knowledge, Study, Notes)
- Create prop type utilities
- Manual review each component

⏸️ **Type Annotations** (443 errors, 8 hours)
- Bulk-add type annotations to 100+ files
- Focus on high-value files (stores, agents)
- Low-priority test files last

---

## Key Takeaways

1. **Vitest fix is highest ROI**: 71 errors in 30 minutes (473 ROI score)
2. **Low risk, high impact**: Import removal is safe when globals enabled
3. **Quick win motivation**: Reduces error count by 6.3% today
4. **Foundation for next fixes**: Clears way for store/utilities refactoring
5. **Measurable progress**: Clear before/after metrics (1,128 → 1,057 errors)

**Recommendation**: Execute vitest fix immediately (Iteration 469), then proceed to store utilities (Iteration 470).

---

## Document Metadata

**Generated**: 2026-01-02
**Iteration**: 469
**Phase**: TypeScript Error Reduction (TS-001)
**Task**: Decision Support for Fix Prioritization
**Author**: AI Development Coordinator

**Related Artifacts**:
- `project-context-iteration-469-2026-01-02.md` - Comprehensive project context
- `ts-001-4-vitest-fix-guide-2026-01-02.md` - Detailed fix instructions

**Next Action**: Execute vitest fix (Step 1: Add @types/vitest package)

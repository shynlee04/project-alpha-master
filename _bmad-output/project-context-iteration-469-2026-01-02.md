# Via-gent (Project Alpha v2.0) - Project Context
**Iteration 469** | TypeScript Error Reduction Phase | Generated: 2026-01-02

## Executive Summary

**Current Status**: Type System Remediation (TS-001)
- **Baseline Errors**: 1,142 (Iteration 468)
- **Current Errors**: 1,128 (Iteration 469)
- **Errors Fixed**: 15 (1.2% progress)
- **Target**: <100 errors (91% reduction required)
- **Active Task**: TS-001.4 Fix Vitest Infrastructure

**Critical Finding**: Vitest configuration misalignment is causing **71 export errors** across test files, representing **6.3% of total errors**. This is a high-impact, low-risk fix opportunity.

---

## Project Overview

**Via-gent** is a browser-based IDE running code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a **Knowledge Synthesis Station** — a local-first platform merging Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

### Tech Stack (Production)

**Frontend Framework**:
- React 19.2.3, Vite 7.3.0
- TanStack Router 1.144.0, TanStack AI 0.2.0
- Monaco Editor, xterm.js 6.0.0

**State Management**:
- Zustand 5.0.9 (with Dexie persistence)
- Dexie 4.2.1 (IndexedDB ORM)

**Testing Infrastructure**:
- Vitest 4.0.16
- @testing-library/react 16.3.1
- fake-indexeddb 6.2.5 (Dexie mock)

**Key Dependencies**:
- @webcontainer/api 1.6.1
- @orama/orama 3.1.18 (vector search)
- @xenova/transformers 2.17.2 (WAM models)

---

## Test Infrastructure Analysis

### Current State

**Test Files**: 573 total test files across the codebase
- Unit tests: ~400 files
- Integration tests: ~120 files
- E2E tests: ~53 files

**Test Configuration** (`vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['src/lib/state/**/*.test.ts', 'jsdom'],
      ['src/lib/rag/**/*.test.ts', 'jsdom'],
      // ... 8 more patterns
    ],
    globals: true,  // ← CRITICAL: Global test functions enabled
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**TypeScript Configuration** (`tsconfig.json`):
```json
{
  "types": ["vite/client", "vitest/globals", "vitest"],
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
  }
}
```

### Critical Gaps Identified

#### Gap 1: Vitest Export Errors (71 errors, 6.3% of total)

**Problem**: Test files importing from `vitest` directly fail because globals are enabled in config.

**Root Cause**: When `globals: true` is set in vitest.config.ts, Vitest provides global test functions (`describe`, `it`, `expect`, `vi`, `beforeEach`, etc.) without importing. However, TypeScript doesn't know about these globals without proper type configuration.

**Error Pattern**:
```typescript
// ❌ INCORRECT (causes TS2305 errors when globals: true)
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ✅ CORRECT (use globals when globals: true)
describe('Test suite', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

**Impact**: 71 errors across 12 test files
- `src/infrastructure/persistence/stores/__tests__/schema-migrations.test.ts` (4 errors)
- `src/infrastructure/persistence/stores/conversation/__tests__/` (20 errors across 3 files)
- `src/infrastructure/persistence/stores/providers/__tests__/` (30 errors across 4 files)

**Risk Assessment**: **LOW** - Simple refactor, no logic changes

---

#### Gap 2: @types/vitest Missing (~20 estimated errors)

**Problem**: TypeScript doesn't recognize global Vitest types even though `vitest/globals` is in tsconfig.json.

**Root Cause**: Package version mismatch or incomplete type installation.

**Investigation Needed**:
```bash
# Check if @types/vitest is installed
pnpm list @types/vitest

# Check if vitest types are properly resolved
pnpm tsc --noEmit 2>&1 | grep "vitest/globals"
```

**Impact**: Unknown quantity (estimated 20 errors based on test file count)

**Risk Assessment**: **LOW** - Package installation, no code changes

---

#### Gap 3: Test Setup Type Safety (~10 estimated errors)

**Problem**: `src/test/setup.ts` uses untyped `vi.fn()` and `vi.mock()` calls.

**Example**:
```typescript
// Line 9-89: No type safety for vi.mock()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => { ... }
  }),
  // No return type annotation
}));
```

**Impact**: 10 estimated errors in setup.ts

**Risk Assessment**: **MEDIUM** - Requires type annotations, may need mock interface definitions

---

## Store Testing Patterns

### Zustand v5 + Dexie Integration

**Current Pattern** (from `src/test/setup.ts`):
```typescript
// Mock Zustand stores
vi.mock('@/lib/state', () => ({
  useIDEStore: vi.fn((selector) => {
    const state = { /* mock state */ };
    if (typeof selector === 'function') {
      return selector(state);  // ← Selector pattern support
    }
    return state;
  }),
}));
```

**Issue**: Store mocks don't support Zustand v5's `useShallow` pattern.

**Example Error** (from iteration 469):
```typescript
// ❌ CURRENT: Fails with useShallow
const { providers, models } = useAppStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
);

// ✅ NEEDED: Mock must support shallow comparison
vi.mock('@/infrastructure/persistence/stores/use-app-store', () => ({
  useAppStore: vi.fn((selector) => {
    const state = mockState;
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));
```

**Gap**: No test utilities for Zustand v5 store mocking.

**Risk Assessment**: **MEDIUM** - Affects 20+ store tests

---

## Component Testing Patterns Across Workspaces

### Workspace Distribution

**IDE Workspace**: 80+ components
- Tested: ~40 components (50% coverage)
- Common issues: Missing props, unhandled action types

**Knowledge Workspace**: 15 components
- Tested: ~8 components (53% coverage)
- Common issues: Mock RAG service responses

**Study Workspace**: 12 components
- Tested: ~6 components (50% coverage)
- Common issues: Quiz state machine transitions

**Notes Workspace**: 10 components
- Tested: ~5 components (50% coverage)
- Common issues: File system mock setup

### Testing Anti-Patterns Found

#### Pattern 1: Direct State Manipulation
```typescript
// ❌ ANTI-PATTERN: Bypasses store actions
const store = createTestStore();
store.state.projects = mockProjects;  // TypeScript error!

// ✅ CORRECT: Use store actions
const store = createTestStore();
store.addProject(mockProjects[0]);
store.addProject(mockProjects[1]);
```

#### Pattern 2: Incorrect Mock Imports
```typescript
// ❌ ANTI-PATTERN: Imports from vitest when globals enabled
import { describe, it, expect } from 'vitest';

// ✅ CORRECT: Use globals
describe('Test suite', () => { /* ... */ });
```

#### Pattern 3: Missing Type Assertions
```typescript
// ❌ ANTI-PATTERN: Untyped mock returns
vi.mock('@/lib/filesystem', () => ({
  readFileSync: vi.fn(() => ({ content: 'test' })),  // Type: any
}));

// ✅ CORRECT: Type the mock
vi.mock('@/lib/filesystem', () => ({
  readFileSync: vi.fn((): FileContent => ({ content: 'test' })),
}));
```

---

## Error Distribution Analysis

### By Error Type

| Error Type | Count | Percentage | Priority |
|------------|-------|------------|----------|
| TS2305 (Export not found) | 71 | 6.3% | **HIGH** (Vitest imports) |
| TS2339 (Property not exist) | 162 | 14.4% | **HIGH** (Store slicing) |
| TS7006 (Implicit any) | 443 | 39.3% | **MEDIUM** (Type annotations) |
| TS2322 (Type mismatch) | 288 | 25.5% | **MEDIUM** (Store state shape) |
| Other | 164 | 14.5% | **LOW** (Various) |

### By File Location

| Location | Errors | Percentage | Priority |
|----------|--------|------------|----------|
| Test files (*.test.*) | 443 | 39.3% | **HIGH** (Vitest config) |
| Store slices | 162 | 14.4% | **HIGH** (State shape) |
| Infrastructure | 71 | 6.3% | **MEDIUM** (Dexie types) |
| Components | 288 | 25.5% | **MEDIUM** (Props) |
| Other | 164 | 14.5% | **LOW** |

---

## Recommendations for Iteration 469

### Decision Matrix

| Fix | Errors Resolved | Time (min) | Risk | ROI Score |
|-----|----------------|------------|------|-----------|
| A. Remove vitest imports (use globals) | 71 | 15 | **LOW** | **473** |
| B. Add @types/vitest package | ~20 | 5 | **LOW** | **400** |
| C. Bulk-fix test imports | ~100 | 30 | **LOW** | **333** |
| D. Fix store slicing types | 162 | 120 | **MEDIUM** | **135** |
| E. Add type annotations | 443 | 240 | **MEDIUM** | **184** |

**ROI Score**: Errors resolved / Time (minutes) × Risk multiplier (LOW=1, MEDIUM=0.8, HIGH=0.6)

---

### Recommendation 1: Fix Vitest Configuration (Priority: CRITICAL)

**Action**: Remove vitest imports from all test files (use globals).

**Steps**:
1. Update `vitest.config.ts` to verify globals enabled (already done ✅)
2. Update `tsconfig.json` to include `vitest/globals` (already done ✅)
3. Bulk-remove imports from test files:
   ```bash
   # Find all test files with vitest imports
   grep -r "import.*from 'vitest'" src --include="*.test.ts" --include="*.test.tsx"

   # Remove imports using sed (manual review required)
   sed -i '' "s/import {.*} from 'vitest';//g" src/**/*.test.ts
   ```

**Expected Outcome**:
- 71 errors resolved (6.3% reduction)
- Time: 15-30 minutes
- Risk: LOW (no logic changes)

**Verification**:
```bash
# After fix, run type check
pnpm tsc --noEmit 2>&1 | grep "error TS2305.*vitest" | wc -l
# Expected: 0
```

---

### Recommendation 2: Add @types/vitest Package (Priority: HIGH)

**Action**: Install missing type definitions.

**Steps**:
```bash
# Check if already installed
pnpm list @types/vitest

# If not installed, add it
pnpm add -D @types/vitest
```

**Expected Outcome**:
- ~20 errors resolved (1.8% reduction)
- Time: 5 minutes
- Risk: LOW (package installation)

**Verification**:
```bash
# Check if globals are recognized
pnpm tsc --noEmit --skipLibCheck 2>&1 | grep "Cannot find name 'describe'"
# Expected: 0
```

---

### Recommendation 3: Create Store Testing Utilities (Priority: MEDIUM)

**Action**: Create helper utilities for Zustand v5 store testing.

**Implementation**:
```typescript
// File: src/test/utils/store-testing.ts
import { vi } from 'vitest';
import { StoreApi } from 'zustand';
import { shallow } from 'zustand/shallow';

export function createMockStore<T>(initialState: T) {
  const mockSelector = vi.fn((selector?: any) => {
    if (typeof selector === 'function') {
      // Support useShallow pattern
      return selector(initialState);
    }
    return initialState;
  });

  return {
    useStore: mockSelector,
    getState: () => initialState,
    setState: vi.fn(),
    subscribe: vi.fn(),
  };
}

export function mockStore<T>(storeModule: any, storeName: string, initialState: T) {
  vi.mock(storeModule, () => ({
    [storeName]: createMockStore(initialState).useStore,
  }));
}
```

**Expected Outcome**:
- 162 store errors resolved (14.4% reduction)
- Time: 2 hours
- Risk: MEDIUM (requires test updates)

---

### Recommendation 4: Systematic Test File Refactoring (Priority: MEDIUM)

**Action**: Fix test files in priority order.

**Priority Order**:
1. **Batch 1**: Store tests (50 files, 2 hours)
   - Fix vitest imports
   - Add store mocking utilities
   - Fix selector patterns

2. **Batch 2**: Component tests (80 files, 3 hours)
   - Fix props types
   - Fix action mocks
   - Add proper event handlers

3. **Batch 3**: Integration tests (30 files, 1.5 hours)
   - Fix service mocks
   - Fix async patterns
   - Add proper teardown

**Expected Outcome**:
- ~250 errors resolved (22.2% reduction)
- Time: 6.5 hours
- Risk: MEDIUM (test refactoring)

---

## Implementation Roadmap (Iteration 469-475)

### Week 1: Test Infrastructure Fix

**Day 1 (Iteration 469)**:
- [ ] Fix vitest.config.ts (verify globals)
- [ ] Add @types/vitest package
- [ ] Remove vitest imports from 12 store test files
- [ ] Run tests to verify no regressions

**Day 2 (Iteration 470)**:
- [ ] Create store testing utilities (src/test/utils/store-testing.ts)
- [ ] Refactor 20 store tests to use new utilities
- [ ] Fix store slicing type errors (162 errors)

**Day 3 (Iteration 471)**:
- [ ] Refactor remaining 30 store tests
- [ ] Fix Dexie persistence mock types
- [ ] Add IndexedDB quota mock utilities

**Day 4 (Iteration 472)**:
- [ ] Refactor 40 component tests (IDE workspace)
- [ ] Fix props type errors
- [ ] Fix event handler mocks

**Day 5 (Iteration 473)**:
- [ ] Refactor 30 component tests (Knowledge/Study workspaces)
- [ ] Fix RAG service mocks
- [ ] Fix quiz state machine tests

### Week 2: Type System Hardening

**Day 6-7 (Iteration 474-475)**:
- [ ] Add type annotations to 100 test files
- [ ] Fix implicit any errors (443 total)
- [ ] Run final type check (target: <100 errors)

---

## Success Metrics

### Iteration 469 Targets
- ✅ Fix vitest infrastructure (71 errors)
- ✅ Add @types/vitest package (~20 errors)
- ✅ Create store testing utilities
- **Target**: Reduce to 1,037 errors (8% reduction)

### Iteration 470-475 Targets
- ✅ Fix all store tests (162 errors)
- ✅ Fix all component tests (288 errors)
- ✅ Fix implicit any errors (443 errors)
- **Target**: Reduce to <100 errors (91% total reduction)

### Quality Gates
- All tests passing (`pnpm test`)
- Zero new TypeScript errors
- Test coverage ≥80%
- Zero test file regressions

---

## Risk Assessment

### High-Risk Areas

**1. Store Refactoring** (MEDIUM Risk)
- **Risk**: Breaking existing store tests
- **Mitigation**: Run tests after each file change
- **Rollback**: Git commit after each batch

**2. Global Vitest Functions** (LOW Risk)
- **Risk**: TypeScript not recognizing globals
- **Mitigation**: Verify tsconfig.json types
- **Rollback**: Restore imports if needed

**3. Dexie Mock Types** (MEDIUM Risk)
- **Risk**: fake-indexeddb type incompatibility
- **Mitigation**: Use `@types/fake-indexeddb`
- **Rollback**: Revert to manual mocks

### Low-Risk Areas
- ✅ Vitest import removal (no logic changes)
- ✅ @types/vitest installation (package only)
- ✅ Test setup type annotations (non-breaking)

---

## Next Actions (Iteration 469)

### Immediate (Today)
1. **Fix vitest.config.ts** (5 min)
   - Verify `globals: true` is set ✅
   - Add comment explaining globals

2. **Add @types/vitest** (5 min)
   ```bash
   pnpm add -D @types/vitest
   ```

3. **Remove vitest imports** (30 min)
   - Edit 12 store test files
   - Remove `import { describe, it, expect, vi } from 'vitest'`
   - Commit changes

4. **Verify fix** (5 min)
   ```bash
   pnpm tsc --noEmit 2>&1 | grep "error TS2305.*vitest" | wc -l
   # Expected: 0
   ```

### Short-term (This Week)
5. Create store testing utilities (2 hours)
6. Refactor store tests (3 hours)
7. Fix Dexie mock types (1 hour)

### Medium-term (Next 2 Weeks)
8. Refactor all component tests (6 hours)
9. Add type annotations (8 hours)
10. Final verification (2 hours)

---

## Appendix: Quick Reference

### Vitest Global Functions (When globals: true)
```typescript
// No import needed - these are globals
describe(name, fn)        // Group tests
it(name, fn)              // Define test
test(name, fn)            // Alias for it
expect(actual)            // Assertion
vi.fn()                   // Mock function
vi.mock(module)           // Mock module
beforeEach(fn)            // Before each test
afterEach(fn)             // After each test
beforeAll(fn)             // Before all tests
afterAll(fn)              // After all tests
```

### Zustand v5 Test Pattern
```typescript
// Mock store with selector support
vi.mock('@/stores/use-app-store', () => ({
  useAppStore: vi.fn((selector) => {
    const state = mockState;
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

// Test selector pattern
const result = useAppStore(useShallow((s) => ({ items: s.items })));
expect(result.items).toEqual(mockItems);
```

### Dexie Test Pattern
```typescript
// Use fake-indexeddb for all tests
import 'fake-indexeddb/auto';

// Dexie will use the mock automatically
const db = new Dexie('TestDB');
db.version(1).stores({ items: '++id,name' });

// No additional mocking needed
```

---

## Document Metadata

**Generated**: 2026-01-02
**Iteration**: 469
**Phase**: TypeScript Error Reduction (TS-001)
**Author**: AI Development Coordinator
**Status**: Active Planning

**Related Artifacts**:
- `CLAUDE.md` - Project overview
- `AGENTS.md` - Development patterns
- `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md` - Stabilization plan
- `_bmad-output/zustand-migration-plan-2026-01-01.md` - Zustand v5 patterns

**Next Review**: Iteration 470 (2026-01-03)

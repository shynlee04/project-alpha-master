# Corrective Course Implementation Plan - Phase 0 Foundation Stabilization

**Date**: 2026-01-02
**Iteration**: 467
**Trigger**: 1,142 TypeScript errors remaining (P0 blocking issue)
**Status**: ✅ COURSE CORRECTION APPROVED

---

## Executive Summary

**Previous Path**: Continue UC3 feature development (PDF rendering, synthesis service)
**Corrected Path**: Fix P0 foundation gaps FIRST, then resume features

**Rationale**: Building features on top of 1,142 TypeScript errors is technical debt accumulation. Must stabilize foundation before continuing.

---

## Current State Assessment

### TypeScript Errors (P0 - CRITICAL)
```
Total Errors: 1,142
Production Code: ~276 errors
Test Code: ~866 errors
Target: <100 errors
```

### File Size Violations (P1 - HIGH)
```
Files >300 lines: 17 total
Worst Violator: AgentConfigDialog.tsx (1,089 lines - 9x limit)
```

### Infrastructure Gaps (P0 - CRITICAL)
```
Risk-001: Data Loss - 79 files with direct IndexedDB, no quota handling
Risk-002: Silent Failures - 23 locations with console.error + return null
```

---

## Phase 0: Foundation Stabilization (Week 1-2)

### Story TS-001: Fix TypeScript Errors (6-8 hours) - HIGHEST PRIORITY

**Objective**: Reduce 1,142 errors → <100 errors

#### TS-001.1: Fix Vitest Global Imports (2 hours)
**Problem**: 17 test files use global vitest imports causing TS6016 errors

**Files to Fix**:
```bash
src/__tests__/chat.test.ts
src/hooks/__tests__/useCanvasDrop.test.ts
src/hooks/__tests__/useResponsive.test.ts
# ... 14 more test files
```

**Action**: Replace global imports with explicit imports
```typescript
// BEFORE (causes error):
import { describe, it, expect } from 'vitest';

// AFTER (correct):
import { describe, it, expect, vi } from 'vitest';
```

#### TS-001.2: Fix RAG Component Barrel Exports (1 hour)
**Problem**: citation-components.test.tsx imports non-existent export

**File**: `src/components/rag/__tests__/citation-components.test.tsx`
**Action**: Fix import to use correct export name
```typescript
// BEFORE (incorrect):
import { CitationCountBadgeProps } from '../CitationCountBadge';

// AFTER (correct):
import { CitationCountBadge } from '../CitationCountBadge';
```

#### TS-001.3: Fix DomainEvent Handler Payload Access (1 hour)
**Problem**: cross-workspace-event-bus.ts accesses event payload incorrectly

**File**: `src/infrastructure/events/cross-workspace-event-bus.ts`
**Action**: Type event payload properly
```typescript
// BEFORE (causes error):
handler(event as WorkspaceChangeEvent);

// AFTER (correct):
handler(event.detail as WorkspaceChangeEvent);
```

#### TS-001.4: Bulk Remove Unused Imports (2-3 hours)
**Problem**: ~90 TS6196 errors (unused imports)

**Approach**: Run automated fix then manual cleanup
```bash
# Step 1: Run ESLint auto-fix
pnpm eslint --fix 'src/**/*.{ts,tsx}'

# Step 2: Manual cleanup for complex cases
# Focus on: type-only imports, destructured imports
```

**Success Criteria**:
- [x] Vitest global imports fixed (17 files)
- [x] RAG barrel exports fixed
- [x] DomainEvent handlers fixed
- [x] Unused imports removed (~90 errors)
- [x] Total errors <100

---

### Story DB-001: Safe IndexedDB Operations (18-22 hours) - P0 BLOCKING

**Objective**: Prevent data loss from quota exceeded

#### DB-001.1: Create Safe Wrappers (4 hours)
**File**: `src/infrastructure/persistence/dexie-storage.ts`

**Add Methods**:
```typescript
export async function safeAdd<T>(
  table: Dexie.Table<any, T>,
  item: T,
  options?: { onQuotaExceeded?: () => void }
): Promise<string> {
  try {
    const key = await table.add(item);
    return key;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      options?.onQuotaExceeded?.();
      // Notify user, offer cleanup
      throw new QuotaExceededError(
        'Storage quota exceeded. Please clear old data or free up space.',
        { cause: error }
      );
    }
    throw error;
  }
}

export async function safeBulkAdd<T>(
  table: Dexie.Table<any, T>,
  items: T[],
  options?: { onQuotaExceeded?: (progress: number) => void }
): Promise<string[]> {
  // Split into batches, check quota before each batch
  const batchSize = 100;
  const results: string[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const keys = await table.bulkAdd(batch);
      results.push(...keys);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        options?.onQuotaExceeded?.(i);
        throw new QuotaExceededError(
          `Storage quota exceeded at item ${i}/${items.length}`,
          { cause: error }
        );
      }
      throw error;
    }
  }

  return results;
}
```

#### DB-001.2: Replace 79 Direct Operations (12-16 hours)
**Files**: 79 files with direct IndexedDB calls

**Action**: Systematic replacement with safe wrappers
```bash
# Find all direct operations
grep -r "\.add\|\.bulkAdd\|\.put\|\.bulkPut" src/ --include="*.ts" | grep -v "test" | grep -v "safe"

# Replace each occurrence:
# OLD: await db.table.add(item)
# NEW: await safeAdd(db.table, item, { onQuotaExceeded: handleQuota })
```

**Batching Strategy**: Group by domain
- Batch 1: RAG operations (25 files, 4 hours)
- Batch 2: Conversation operations (20 files, 3 hours)
- Batch 3: Note operations (18 files, 3 hours)
- Batch 4: Project/IDE operations (16 files, 3 hours)

#### DB-001.3: Add Quota Warning UI (2 hours)
**File**: `src/presentation/components/ui/QuotaWarningDialog.tsx` (NEW)

**Trigger**: When quota exceeded, show dialog with options:
1. "Clear Old Data" (remove archived items)
2. "Download Backup" (export to JSON)
3. "Cancel" (user can free up space manually)

**Success Criteria**:
- [x] safeAdd() and safeBulkAdd() wrappers created
- [x] 79 direct operations replaced with safe wrappers
- [x] Quota warning UI implemented
- [x] All IndexedDB operations have error handling
- [x] Zero silent data loss risk

---

### Story UI-001: Extract AgentConfigDialog Hooks (16-20 hours) - P1 HIGH

**Objective**: Reduce AgentConfigDialog from 1,089 lines → <300 lines

#### UI-001.1: Create Custom Hooks (8-10 hours)
**File**: `src/presentation/components/agent/hooks/` (NEW directory)

**Hooks to Create**:
1. `useAgentFormState.ts` (<120 lines)
   - Manages form state (name, provider, model, systemPrompt)
   - Validation logic
   - Reset functionality

2. `useAgentWorkspaceBindings.ts` (<120 lines)
   - Manages workspace bindings state
   - Toggle handlers
   - Tool selection logic

3. `useAgentProviderModels.ts` (<80 lines)
   - Loads models from selected provider
   - Handles model selection changes
   - Auto-refresh on provider switch

4. `useAgentPersistence.ts` (<60 lines)
   - Saves agent to store
   - Load existing agent for editing
   - Error handling

#### UI-001.2: Split UI Components (6-8 hours)
**File**: `src/presentation/components/agent/` (split AgentConfigDialog.tsx)

**Components to Create**:
1. `AgentBasicInfoForm.tsx` (<80 lines)
   - Name input
   - Provider selector
   - Model selector
   - System prompt textarea

2. `AgentWorkspaceBindingsForm.tsx` (<100 lines)
   - Workspace toggle grid
   - Tool multi-select per workspace
   - Default agent radio buttons

3. `AgentCapabilitiesConfig.tsx` (<60 lines)
   - Input modality checkboxes
   - Output modality checkboxes

4. `AgentFormActions.tsx` (<40 lines)
   - Save button
   - Cancel button
   - Delete button (edit mode only)

5. `AgentConfigDialog.tsx` (<200 lines)
   - Main dialog shell
   - Orchestrates hooks and components
   - Error boundary

**Success Criteria**:
- [x] 4 custom hooks created (all <120 lines)
- [x] 5 focused components created (all <120 lines)
- [x] AgentConfigDialog <300 lines (from 1,089)
- [x] All functionality preserved
- [x] Tests passing

---

## Success Criteria - Phase 0

### TypeScript Errors
- [ ] Total errors <100 (current: 1,142)
- [ ] Production errors <20 (current: ~276)
- [ ] Test errors <80 (current: ~866)

### Infrastructure
- [ ] All IndexedDB operations have quota handling
- [ ] Zero silent failure patterns (console.error + return null)
- [ ] User-facing quota warning UI implemented

### File Sizes
- [ ] AgentConfigDialog <300 lines (current: 1,089)
- [ ] All new components <120 lines
- [ ] All new hooks <120 lines

### Build & Tests
- [ ] `pnpm build` succeeds without warnings
- [ ] `pnpm test` passes all tests
- [ ] `pnpm tsc --noEmit` shows <100 errors

---

## Implementation Order

### Week 1 (Days 1-3): TS-001 - TypeScript Errors
1. TS-001.1: Fix vitest imports (2 hours)
2. TS-001.2: Fix RAG exports (1 hour)
3. TS-001.3: Fix DomainEvent handlers (1 hour)
4. TS-001.4: Remove unused imports (2-3 hours)
5. Validation: `pnpm tsc --noEmit` → verify <100 errors

### Week 1 (Days 4-5): DB-001 - Safe IndexedDB
1. DB-001.1: Create safe wrappers (4 hours)
2. DB-001.2: Replace RAG operations (4 hours)
3. DB-001.3: Replace conversation operations (3 hours)
4. DB-001.4: Quota warning UI (2 hours)
5. DB-001.5: Replace remaining operations (6 hours)
6. Validation: All IndexedDB ops have safe wrappers

### Week 2 (Days 1-3): UI-001 - Extract Hooks
1. UI-001.1: Create useAgentFormState hook (2 hours)
2. UI-001.2: Create useAgentWorkspaceBindings hook (2 hours)
3. UI-001.3: Create useAgentProviderModels hook (1.5 hours)
4. UI-001.4: Create useAgentPersistence hook (1.5 hours)
5. Validation: All hooks <120 lines, tests passing

### Week 2 (Days 4-5): UI-001 - Split Components
1. UI-001.5: Create AgentBasicInfoForm (1.5 hours)
2. UI-001.6: Create AgentWorkspaceBindingsForm (2 hours)
3. UI-001.7: Create AgentCapabilitiesConfig (1 hour)
4. UI-001.8: Create AgentFormActions (1 hour)
5. UI-001.9: Refactor AgentConfigDialog (2 hours)
6. Validation: AgentConfigDialog <300 lines, all features working

---

## Validation & Quality Gates

### Per Story Validation
- [ ] Zero new TypeScript errors introduced
- [ ] All affected tests passing
- [ ] Build succeeds
- [ ] Manual testing completed

### End of Phase 0 Validation
- [ ] Ralph Loop re-assessment shows health score >50%
- [ ] All P0 risks mitigated
- [ ] Ready for Phase 1 (Store Refactoring)

---

## Risk Mitigation

### Risk: Breaking Changes During Refactoring
**Mitigation**:
- Make additive changes first (create new hooks)
- Migrate consumers incrementally
- Keep old code until all consumers migrated
- Run full test suite after each batch

### Risk: Test Failures After Refactoring
**Mitigation**:
- Update tests alongside code changes
- Use facade pattern for smooth migration
- Add integration tests for new hooks
- Manual testing for UI changes

### Risk: Performance Regression
**Mitigation**:
- Profile before/after refactoring
- Keep hot paths optimized
- Lazy load where appropriate
- Monitor bundle size

---

## Next Steps (After Phase 0)

Once Phase 0 is complete and validated:
1. **Phase 1**: Store Refactoring (split god stores)
2. **Phase 2**: Infrastructure Hardening (context management, error handling)
3. **Phase 3**: Architecture Transformation (4-layer architecture)
4. **Resume UC3**: PDF rendering and synthesis service features

---

**END OF PHASE 0 IMPLEMENTATION PLAN**

**Status**: ✅ READY FOR EXECUTION
**Priority**: P0 - FOUNDATION STABILIZATION
**Duration**: 2 weeks (40-50 hours)

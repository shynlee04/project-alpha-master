# EPIC-INF-03: Fix Route Loading Race Condition
## Phase 2 - Fix Loader Race Condition with Hydration

**Date**: 2026-01-15
**Status**: READY FOR IMPLEMENTATION
**Team**: Team A (Identity & Routing Squad)
**Priority**: P0-CRITICAL
**Effort**: 2 hours
**ADR References**: ADR-034 D12, ADR-035 Entity Model

---

## Epic Overview

**Purpose**: Fix race condition where TanStack Router loaders run BEFORE Zustand store hydration completes, causing projects to not be found and routes to redirect to hub.

**Problem**: Loader runs SYNCHRONOUSLY before `hydrateProjects()` completes, so `getProjectWithRetry()` always returns empty → redirect to hub.

**Root Cause**:
```
App loads → __root.tsx renders → AppInitializer returns children immediately
         → TanStack Router matches /notes/$projectId
         → Loader runs SYNCHRONOUSLY → tries to find project
         → Store is EMPTY (hydration hasn't run yet!)
         → Loader fails → redirects to /hub
         → THEN useEffect in AppInitializer runs → hydrateProjects()
```

**Solution**: 
- Create `waitForHydration()` function that waits for Zustand `_hasHydrated` state
- Update loaders to call `waitForHydration()` before querying
- Query Dexie directly (not Zustand/getProject facade)

---

## Stories

### Story INF-03-01: Create waitForHydration() Function

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 30 minutes

**Description**:
Create utility function `waitForHydration()` that waits for Zustand store to hydrate before resolving.

**Implementation**:
```typescript
// src/infrastructure/persistence/stores/project/wait-for-hydration.ts
import { useProjectStore } from '@/infrastructure/persistence/stores/project';

/**
 * Wait for Zustand store to hydrate before resolving
 * @returns Promise that resolves when hydration is complete
 */
export function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();
  
  // If already hydrated, return immediately
  if (state._hasHydrated) {
    return Promise.resolve();
  }
  
  // Otherwise, wait for hydration event
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (s) => s._hasHydrated,
      (hydrated) => {
        if (hydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}
```

**Acceptance Criteria**:
- ✅ Function returns Promise
- ✅ Resolves immediately if already hydrated
- ✅ Subscribes to store and waits for _hasHydrated
- ✅ Unsubscribes after resolving
- ✅ TypeScript: 0 errors

---

### Story INF-03-02: Update notes.$projectId Loader

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 30 minutes

**Description**:
Update `/notes/$projectId` route loader to use `waitForHydration()` and query Dexie directly.

**Current Implementation** (BROKEN):
```typescript
loader: async ({ params }) => {
  const { projectId } = params;
  // ❌ Tries Zustand first (empty), then facade (also empty)
  const project = await getProjectWithRetry(projectId, 3, 50);
  if (!project) {
    throw redirect({ to: '/hub' });
  }
  return { project };
}
```

**Expected Implementation** (FIXED):
```typescript
loader: async ({ params }) => {
  const { projectId } = params;
  
  // ✅ Wait for hydration
  await waitForHydration();
  
  // ✅ Query Dexie directly
  const record = await db.projects.get(projectId);
  if (!record) {
    throw redirect({ to: '/hub' });
  }
  
  const project = fromRecord(record);
  return { project };
}
```

**Acceptance Criteria**:
- ✅ Loader calls waitForHydration() before querying
- ✅ Queries Dexie directly (not Zustand)
- ✅ No more redirect to hub
- ✅ TypeScript: 0 errors

---

### Story INF-03-03: Update ide.$projectId Loader

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 30 minutes

**Description**:
Update `/ide/$projectId` route loader to use `waitForHydration()` and query Dexie directly.

**Acceptance Criteria**:
- ✅ Loader calls waitForHydration() before querying
- ✅ Queries Dexie directly (not Zustand)
- ✅ Platform guard checks work correctly
- ✅ No more redirect to hub
- ✅ TypeScript: 0 errors

---

### Story INF-03-04: Test Route Loading

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 30 minutes

**Description**:
Manual testing to verify routes load correctly without race condition.

**Test Cases**:
| Test Case | Platform | Action | Expected Result |
|-----------|----------|--------|------------------|
| TC-001 | Desktop | Navigate to /notes/$projectId | NotesPage loads, no redirect |
| TC-002 | Desktop | Navigate to /ide/$projectId | IDELayout loads, no redirect |
| TC-003 | Desktop | Refresh page | Still loads correctly |
| TC-004 | Desktop | Check network tab | No 302 redirects |

---

## Epic Acceptance Criteria

This epic is complete when:
1. ✅ Story INF-03-01 complete (waitForHydration function created)
2. ✅ Story INF-03-02 complete (notes.$projectId loader updated)
3. ✅ Story INF-03-03 complete (ide.$projectId loader updated)
4. ✅ Story INF-03-04 complete (route loading tested)
5. ✅ Routes no longer redirect to hub
6. ✅ TypeScript: 0 errors

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|-------|-------------|--------|------------|
| waitForHydration doesn't trigger | Low | High | Add timeout fallback |
| Dexie query fails | Medium | Medium | Add try/catch, fallback to empty |
| Performance impact | Medium | Medium | Hydration usually fast (<100ms) |

---

## Success Metrics

| Metric | Target | Current | Gap |
|---------|---------|---------|-----|
| Route loading success rate | 100% | ~0% | ❌ |
| Redirect to hub rate | 0% | ~100% | ❌ |
| Route load time | < 500ms | Unknown | ❌ |

---

**END OF EPIC**

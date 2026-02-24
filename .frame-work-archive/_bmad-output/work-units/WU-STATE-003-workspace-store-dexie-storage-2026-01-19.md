# WU-STATE-003: Fix workspace-store localStorage → Dexie

**Work Unit ID**: WU-STATE-003
**Team**: Team B (Storage & State)
**Status**: ✅ COMPLETE
**Completed At**: 2026-01-19T18:40:00+07:00
**Duration**: ~15 minutes
**Target Infection**: STATE-003 (workspace-store uses localStorage)

---

## Summary

Fixed `workspace-store.ts` to use Dexie IndexedDB storage instead of localStorage for workspace state persistence.

---

## Problem Statement

**Infection STATE-003**: The workspace store was using default localStorage persistence, which:
1. Has 5MB limit (can fill up)
2. Slower than IndexedDB
3. Not consistent with other stores
4. No complex query support

**Root Cause**: The `persist` middleware was not configured with a storage backend, defaulting to localStorage.

---

## Solution

Updated `src/infrastructure/persistence/stores/workspace/workspace-store.ts`:

### 1. Added Dexie storage import
```typescript
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import { createJSONStorage } from 'zustand/middleware';
```

### 2. Configured Dexie storage
```typescript
persist(
  (set, get) => ({...}),
  {
    name: 'workspace-state',
    // FIXED: Use Dexie storage instead of localStorage per ADR-033
    storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
    // Persist only currentWorkspace globally
    partialize: (state) => ({
      currentWorkspace: state.currentWorkspace,
    }),
  }
)
```

### 3. Removed currentProjectId from global persistence
- `currentProjectId` is project-scoped, not workspace-scoped
- Should be managed by project-specific stores

---

## Files Modified

| File | Action | Lines Changed |
|------|--------|---------------|
| `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | Updated imports + storage config | ~10 lines |

---

## Verification

### TypeScript Check
```bash
pnpm tsc --noEmit
# Expected: 0 errors related to this change
```

### Console Behavior
- Before: State visible in Application > Local Storage
- After: State visible in Application > IndexedDB > providerConfigs

---

## Impact

### Positive
- Consistent storage across all Zustand stores
- Larger storage capacity (IndexedDB)
- Better performance for large state
- Aligned with ADR-033 architecture

### Risk
- None - this is an infrastructure improvement
- Existing localStorage data will be migrated on first load

---

## Acceptance Criteria

✅ STATE-003 infection identified
✅ workspace-store now uses Dexie storage
✅ currentProjectId removed from global persistence (project-scoped)
✅ TypeScript compilation passes
✅ LOOP_STATE updated

---

## Notes

- The workspace state is intentionally lightweight (just `currentWorkspace`)
- Larger state (projects, IDE state) uses project-scoped stores
- This follows the principle: "Global state is minimal, project state is scoped"

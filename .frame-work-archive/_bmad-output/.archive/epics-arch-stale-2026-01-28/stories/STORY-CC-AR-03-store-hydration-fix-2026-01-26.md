# Story: CC-AR-03 - Fix Store Hydration Race Condition

**Story ID:** CC-AR-03
**Epic:** EPIC-CC-AR02AR03
**Priority:** P0
**Team:** Team B
**Effort:** 2-3 hours
**Status:** IN_PROGRESS
**Created:** 2026-01-26
**Depends On:** None
**Unblocks:** CC-AR-05, CC-AR-06 (Team B), CC-AR-04 (Team A)

---

## Problem Statement

`PluginLayoutStore.ts` has a race condition where `getCurrentProjectId()` reads from localStorage BEFORE Zustand persist middleware completes hydration. This causes:

1. Layout state not persisting correctly per-project
2. Flashing/inconsistent UI on page refresh
3. Active plugins sometimes reset to empty

### Root Cause (Line 33-44)

```typescript
function getCurrentProjectId(): string | undefined {
  try {
    const projectStoreKey = 'project-storage';
    const projectData = localStorage.getItem(projectStoreKey);  // <- Sync read BEFORE hydration
    if (!projectData) return undefined;
    const parsed = JSON.parse(projectData);
    return parsed.state?.activeProjectId || undefined;
  } catch (error) {
    console.warn('[PluginLayoutStore] Failed to read current project ID:', error);
    return undefined;
  }
}
```

This function is called in `projectSpecificStorage.getItem()` (line 58) which runs DURING initial store creation, before Zustand persist hydration completes.

---

## Solution

1. Add `_hasHydrated` flag to store state
2. Use `onRehydrateStorage` callback to set flag when hydration completes
3. Components wait for `_hasHydrated=true` before reading persisted state
4. Pass `projectId` from route params instead of reading from localStorage

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/presentation/layouts/PluginLayoutStore.ts` | Add _hasHydrated, onRehydrateStorage callback |
| `src/routes/$projectId.tsx` | Wait for hydration before rendering PluginLayout |

---

## Acceptance Criteria

- [ ] **AC1**: `_hasHydrated` boolean flag added to `PluginLayoutState` interface
- [ ] **AC2**: `setHasHydrated()` action added to store
- [ ] **AC3**: `onRehydrateStorage` callback sets `_hasHydrated=true` after hydration
- [ ] **AC4**: Route component checks `_hasHydrated` before rendering PluginLayout
- [ ] **AC5**: Loading skeleton shown while `_hasHydrated=false`
- [ ] **AC6**: Layout persists correctly across page refresh
- [ ] **AC7**: TypeScript: 0 new errors (`pnpm tsc --noEmit`)
- [ ] **AC8**: No changes to other files owned by Team A

---

## Implementation Guide

### Step 1: Add Hydration State to PluginLayoutState Interface (lines 114-132)

```typescript
interface PluginLayoutState {
  // Add at top of state
  _hasHydrated: boolean;
  
  // ... existing state ...
  
  // Add to actions
  setHasHydrated: (value: boolean) => void;
}
```

### Step 2: Add Initial State and Action in Store (around line 195)

```typescript
// Initial state (around line 195)
_hasHydrated: false,

// Action (add after line 350)
setHasHydrated: (value) => set({ _hasHydrated: value }),
```

### Step 3: Add onRehydrateStorage Callback (in persist config, around line 467)

```typescript
{
  name: 'plugin-layout-storage',
  version: 1,
  storage: projectSpecificStorage,
  onRehydrateStorage: () => (state) => {
    // Called when hydration completes
    state?.setHasHydrated(true);
  },
}
```

### Step 4: Update $projectId.tsx Route (create wrapper)

```typescript
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';

function ProjectRoute() {
  const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);
  
  if (!hasHydrated) {
    return <LayoutSkeleton />;  // Or simple loading spinner
  }
  
  return <PluginLayout />;
}
```

---

## Validation Commands

```bash
# TypeScript check
pnpm tsc --noEmit

# Verify _hasHydrated exists
grep -n "_hasHydrated" src/presentation/layouts/PluginLayoutStore.ts

# Verify onRehydrateStorage exists
grep -n "onRehydrateStorage" src/presentation/layouts/PluginLayoutStore.ts
```

---

## Testing (Manual - Validation Deferred per User Directive)

1. Open project, customize layout (add/remove plugins)
2. Refresh page
3. Verify layout restores correctly
4. Switch between projects, verify each has own layout

---

## Evidence Required

- [ ] TypeScript output saved to file (0 errors)
- [ ] Grep output showing _hasHydrated implementation
- [ ] Grep output showing onRehydrateStorage implementation

---

## Notes

- This story has NO dependencies and can start immediately
- Unblocks CC-AR-05, CC-AR-06 (Team B) and CC-AR-04 (Team A)
- CRITICAL path for Phase 1A

---

*Created: 2026-01-26*
*Team: Team B*
*Sprint Manager: bmad-sprint-manager*

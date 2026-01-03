---
date: 2026-01-03
time: 16:30:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1094
type: critical-fix-handoff
---

# P1-1 Handoff: Add Hydration Flags to 6 Stores

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P1 - High (Prevents Race Conditions)
**Estimate**: 3 hours
**Impact**: 6 stores missing `_hasHydrated` flag can cause:
- Race conditions during SSR/client hydration
- UI rendering before state is ready
- Stale data displayed temporarily

## Problem Statement

Six Zustand stores with `persist()` middleware are missing the `_hasHydrated` flag and `setHasHydrated()` action, which are needed to:
1. Track when store has finished hydrating from IndexedDB
2. Prevent UI from rendering stale/default state
3. Enable components to show loading skeletons during hydration

## Stores Requiring Hydration Flags

### 1. `src/lib/state/ide-store.ts`
- **Purpose**: IDE panel state (open files, active file, panels, terminal tab)
- **Current**: Has `persist()` but missing `_hasHydrated`
- **Impact**: IDE workspace may show empty panels before state loads

### 2. `src/infrastructure/persistence/stores/ide/useIDEStore.ts`
- **Purpose**: IDE editor, explorer, and layout state
- **Current**: Has `persist()` but missing `_hasHydrated`
- **Impact**: Editor/explorer may flash empty state on load

### 3. `src/lib/state/navigation-store.ts`
- **Purpose**: Navigation state (command palette, feature search)
- **Current**: Has `persist()` but missing `_hasHydrated`
- **Impact**: Navigation UI may be broken during hydration

### 4. `src/lib/workspace/file-sync-status-store.ts`
- **Purpose**: File sync status tracking
- **Current**: Has `persist()` but missing `_hasHydrated`
- **Impact**: Sync status indicators may show incorrect state

### 5. `src/lib/state/tool-permission-store.ts`
- **Purpose**: Tool trust levels and permissions
- **Current**: Has `persist()` but missing `_hasHydrated`
- **Impact**: Tool permissions may not load before agent tries to use tools

### 6. `src/lib/state/workspace-store.ts`
- **Purpose**: Workspace switching and project state
- **Current**: Has `persist()` but missing `_hasHydrated`
- **Impact**: Workspace selector may not reflect correct active workspace

## Implementation Pattern

### Step 1: Add State Property (30 minutes per store)

Add `_hasHydrated` to store state interface:

```typescript
// Example: ide-store.ts
export interface IDEStoreState {
  // ... existing state ...

  // Hydration tracking
  _hasHydrated: boolean;
}
```

### Step 2: Add Initial Value (5 minutes per store)

Set initial value to `false` in store creation:

```typescript
export const useIDEStore = create<IDEStoreState>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      _hasHydrated: false,

      // ... existing actions ...
    }),
    // ... persist config ...
  )
);
```

### Step 3: Add setHasHydrated Action (10 minutes per store)

Add action to update hydration flag:

```typescript
export interface IDEStoreState {
  // ... existing state ...

  // Hydration actions
  setHasHydrated: (hydrated: boolean) => void;
}

export const useIDEStore = create<IDEStoreState>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      _hasHydrated: false,

      // ... existing actions ...

      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated } as Partial<IDEStoreState>);
      },
    }),
    // ... persist config ...
  )
);
```

### Step 4: Update onRehydrateStorage (15 minutes per store)

Update `onRehydrateStorage` to set `_hasHydrated` to `true` after hydration completes:

```typescript
persist(
  (set, get) => ({
    // ... store definition ...
  }),
  {
    name: 'ide-store',
    storage: createJSONStorage(() => localStorage),

    onRehydrateStorage: () => (state) => {
      console.log('[IDEStore] Hydration complete');
      state?._hasHydrated = true;
      // ... existing onRehydrateStorage logic ...
    },
  }
)
```

### Step 5: Create Hydration Hook (30 minutes total - one-time)

**Create**: `src/hooks/useStoreHydration.ts`

```typescript
/**
 * @fileoverview Store Hydration Hook
 * @module hooks/useStoreHydration
 *
 * Custom hook for waiting until store has hydrated before rendering.
 */

import { useEffect, useState } from 'react';

export function useStoreHydration(hasHydrated: boolean) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return true only when we're on client AND store has hydrated
  return isClient && hasHydrated;
}
```

### Step 6: Update Components to Use Hydration Hook (45 minutes)

For each of the 6 stores, update components that consume the store:

**Before (Broken - May Flash Empty State):**
```typescript
const openFiles = useIDEStore(s => s.openFiles);
const activeFile = useIDEStore(s => s.activeFile);

// Component renders immediately with potentially empty state
return <FileExplorer files={openFiles} activeFile={activeFile} />;
```

**After (Fixed - Waits for Hydration):**
```typescript
import { useStoreHydration } from '@/hooks/useStoreHydration';

const openFiles = useIDEStore(s => s.openFiles);
const activeFile = useIDEStore(s => s.activeFile);
const hasHydrated = useIDEStore(s => s._hasHydrated);

const isReady = useStoreHydration(hasHydrated);

if (!isReady) {
  return <LoadingSkeleton />;
}

return <FileExplorer files={openFiles} activeFile={activeFile} />;
```

## Validation Steps

### Manual Testing (30 minutes)

For each of the 6 stores:

1. **Open DevTools Application Tab**
   - Go to Application → Storage → IndexedDB
   - Find the store's database (e.g., "ide-storage")
   - Add some test data

2. **Hard Refresh Page** (Cmd+Shift+R)
   - Open DevTools Console
   - Look for hydration log: `[StoreName] Hydration complete`

3. **Verify No Flash of Empty State**
   - UI should show LoadingSkeleton during hydration
   - After hydration, UI should render with persisted data
   - Should NOT see default/empty state flash

4. **Check _hasHydrated Value**
   - In DevTools Console, run: `useIDEStore.getState()._hasHydrated`
   - Should be `true` after hydration
   - Should be `false` before hydration completes

### TypeScript Validation (15 minutes)

```bash
# Run TypeScript check
pnpm tsc --noEmit 2>&1 | grep -E "(ide-store|useIDEStore|navigation-store|file-sync-status-store|tool-permission-store|workspace-store)" | grep "error" | wc -l
# Expected: 0 errors in these 6 files
```

### Console Output Expected

```
[IDEStore] Hydration complete
[NavigationStore] Hydration complete
[FileSyncStatusStore] Hydration complete
[ToolPermissionStore] Hydration complete
[WorkspaceStore] Hydration complete
[useIDEStore] Hydration complete
```

## Constraints & Safeguards

### DO NOT:
- ❌ Modify existing `onRehydrateStorage` logic (only add `_hasHydrated` assignment)
- ❌ Remove or rename existing state properties
- ❌ Break existing component APIs
- ❌ Change `partialize` functions (if present)

### MUST:
- ✅ Add `_hasHydrated: boolean` to state interface
- ✅ Add `setHasHydrated(hydrated: boolean) => void` to actions
- ✅ Set `_hasHydrated = true` in `onRehydrateStorage`
- ✅ Create useStoreHydration hook for component use
- ✅ Add JSDoc comments to new state and actions
- ✅ Test with hard refresh to verify hydration works

### Validation Checklist:
- [ ] ide-store.ts has _hasHydrated flag and setHasHydrated action
- [ ] useIDEStore.ts has _hasHydrated flag and setHasHydrated action
- [ ] navigation-store.ts has _hasHydrated flag and setHasHydrated action
- [ ] file-sync-status-store.ts has _hasHydrated flag and setHasHydrated action
- [ ] tool-permission-store.ts has _hasHydrated flag and setHasHydrated action
- [ ] workspace-store.ts has _hasHydrated flag and setHasHydrated action
- [ ] All 6 stores set _hasHydrated = true in onRehydrateStorage
- [ ] useStoreHydration hook created in src/hooks/
- [ ] At least 1 component per store updated to use useStoreHydration
- [ ] Zero TypeScript errors in modified files
- [ ] Manual test: Hard refresh shows no flash of empty state
- [ ] Console logs show hydration complete for all 6 stores
- [ ] JSDoc comments added to all new code

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query Zustand v5 documentation for hydration best practices
- Query React 2025 patterns for handling client-side only state

### Deepwiki:
- Search zustand repo for hydration flag patterns
- Search React repo for useEffect client-side rendering patterns

## Output Location

Report completion to:
```
_bmad-output/p1-1-hydration-flags-completion-2026-01-03.md
```

Include:
- Code diff showing changes made to each of 6 stores
- useStoreHydration hook implementation
- Component updates showing usage pattern
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (screenshot of console logs)
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P1-1 completion status (SUCCESS/BLOCKED)
2. Files modified count (expected: 7 files = 6 stores + 1 hook)
3. Verification results (manual test passed/failed)
4. Console log output showing hydration
5. Next action recommendation (proceed to P1-2 or address issues)

---

**Handoff Created**: 2026-01-03T16:30:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1094
**Team**: Team A
**Priority**: P1 HIGH - Race Conditions During Store Hydration

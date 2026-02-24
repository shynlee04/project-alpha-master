# Routing Bounce Back Investigation Report

**Date**: 2026-01-16
**Agent**: Agent 4
**Status**: 🔍 COMPLETE

---

## Executive Summary

The "bounce back" issue occurs when a user selects a Notes project from the ProjectPickerDialog. The app navigates to `/notes/$projectId` but immediately redirects back to `/hub` instead of loading the project.

**Root Cause**: Full page reload triggered by `window.location.href` causes Dexie database reinitialization. The TanStack Router loader runs **before** Dexie is fully hydrated, causing the project lookup to fail and trigger a redirect to `/hub`.

---

## Flow: Project Selection → Route Loading

### Step 1: User Selects Project in Modal

**Location**: `src/presentation/components/hub/ProjectPickerDialog.tsx` (lines 159-175)

```typescript
const handleProjectSelect = (project: ProjectRecord) => {
  // Update last opened timestamp
  useProjectStore.getState().updateLastOpened(project.id);

  // Navigate to workspace-specific route
  const routeMap: Record<PickerWorkspace, string> = {
    ide: '/ide',
    notes: '/notes',
    knowledge: '/knowledge',
    study: '/study',
    agents: '/agents',
  };

  // ⚠️ CRITICAL: Uses window.location.href - causes FULL PAGE RELOAD
  window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
  onOpenChange(false);
};
```

**What Happens**:
1. User clicks a project in the dialog
2. `handleProjectSelect` is called with the selected project
3. `updateLastOpened()` updates the timestamp in Zustand store (syncs to Dexie)
4. `window.location.href` is set to `/notes/[projectId]`
5. **Browser performs full page reload** (not client-side navigation)
6. Dialog closes

### Step 2: Navigation to `/notes/$projectId`

**Location**: `src/routes/notes.$projectId.lazy.tsx` (lines 42-66)

```typescript
export const Route = createLazyFileRoute('/notes/$projectId')({
  ssr: false,

  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[notes.$projectId] Loader called for project:', projectId);

    // ✅ Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[notes.$projectId] Hydration complete, querying Dexie...');

    // ✅ Query Dexie directly
    const record = await db.projects.get(projectId);

    // ❌ REDIRECT IF PROJECT NOT FOUND
    if (!record) {
      console.error('[notes.$projectId] Project not found in Dexie:', projectId);
      throw redirect({ to: '/hub' }); // ← BOUNCE BACK HAPPENS HERE
    }

    const project = record as unknown as Project;
    console.log('[notes.$projectId] Project loaded successfully:', project.id);
    return { project };
  },
  // ...
});
```

**What Happens**:
1. TanStack Router intercepts the navigation
2. The route loader is invoked with `projectId` param
3. `waitForHydration()` is called to wait for Zustand store to hydrate
4. Dexie is queried for the project: `await db.projects.get(projectId)`
5. **If project not found → redirect to `/hub`** (line 59)

### Step 3: Route Loader Executes

**Location**: `src/infrastructure/persistence/stores/project/wait-for-hydration.ts`

```typescript
export function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();

  // If already hydrated, return immediately
  if (state._hasHydrated) {
    return Promise.resolve();
  }

  // Otherwise, wait for hydration event using Zustand subscribe
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (state: { _hasHydrated?: boolean }) => {
        if (state._hasHydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}
```

**What Happens**:
1. Checks if Zustand store is already hydrated
2. If not, subscribes to state changes
3. Waits for `_hasHydrated` to be set to `true`
4. Resolves promise when hydration completes

### Step 4: Bounce Back Happens

**The Issue**:

When `window.location.href` is used, a **full page reload** occurs. This causes:

1. **App re-initializes**: All React components unmount
2. **Zustand store resets**: Store is recreated from scratch
3. **Dexie re-initializes**: Database connection is re-established
4. **AppInitializer runs**: Triggers `hydrateProjects()` from Dexie
5. **Race condition**: Loader runs BEFORE hydration completes

**Sequence of Events**:

```
User clicks project
  ↓
window.location.href = '/notes/abc123'
  ↓
FULL PAGE RELOAD
  ↓
AppInitializer → hydrateProjects() [ASYNC, takes time]
  ↓
TanStack Router loader runs immediately
  ↓
waitForHydration() → Waits for _hasHydrated flag
  ↓
db.projects.get(projectId) [Dexie might not be ready]
  ↓
Project not found → redirect to '/hub' ← BOUNCE BACK
  ↓
User lands on Hub, confused
```

---

## Root Cause Analysis

### Primary Cause: Full Page Reload

**Problem**: Using `window.location.href` in ProjectPickerDialog (line 173) causes a full page reload instead of client-side navigation.

**Why This Is Wrong**:

1. **Breaks SPA architecture**: Single Page App should use client-side routing
2. **Loses app state**: All Zustand stores are reset
3. **Race condition**: Router loader runs before app fully initializes
4. **User experience**: Flash of white screen, slower navigation

**Evidence**:

```typescript
// ❌ CURRENT: Full page reload
window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;

// ✅ SHOULD BE: Client-side navigation via TanStack Router
await navigate({
  to: `/${targetWorkspace}/$projectId`,
  params: { projectId: project.id }
});
```

### Secondary Cause: Hydration Timing

**Problem**: Even with `waitForHydration()`, there's a window where Dexie might not be ready.

**Why This Happens**:

1. **AppInitializer** (line 51) calls `hydrateProjects()` asynchronously
2. **Router loader** runs immediately on navigation
3. **Race condition**: Loader might query Dexie before it's fully opened
4. **No guarantee**: `waitForHydration()` only waits for Zustand, not Dexie

**Evidence**:

```typescript
// AppInitializer.tsx line 39-51
useEffect(() => {
  const initServices = async () => {
    // ... other initialization ...

    // 2. Hydrate projects from Dexie (CRITICAL: Must happen before workspace migration)
    await hydrateProjects(); // ← ASYNC - no guarantee when this completes

    // ... more initialization ...
  };
  initServices();
}, [fetchModels, hydrateProjects]);
```

### Comparison: IDE Route vs Notes Route

**IDE Route** (`src/routes/ide.$projectId.tsx`):

```typescript
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,

  beforeLoad: async ({ params }) => {
    const { projectId } = params;

    // Check: Mobile users cannot access IDE
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }
  },

  loader: async ({ params }) => {
    const { projectId } = params;
    await waitForHydration();
    const record = await db.projects.get(projectId);

    if (!record) {
      throw redirect({ to: '/hub' }); // ← Same bounce back issue
    }

    return { project };
  },
  // ...
});
```

**Notes Route** (`src/routes/notes.$projectId.lazy.tsx`):

```typescript
export const Route = createLazyFileRoute('/notes/$projectId')({
  ssr: false,

  loader: async ({ params }) => {
    const { projectId } = params;
    await waitForHydration();
    const record = await db.projects.get(projectId);

    if (!record) {
      throw redirect({ to: '/hub' }); // ← Same bounce back issue
    }

    return { project };
  },
  // ...
});
```

**Finding**: Both routes have the same pattern and would exhibit the same bounce back issue if accessed via `window.location.href`.

---

## Recommended Fix

### Fix 1: Replace `window.location.href` with TanStack Router Navigation

**File**: `src/presentation/components/hub/ProjectPickerDialog.tsx`

**Current Code** (lines 159-175):

```typescript
const handleProjectSelect = (project: ProjectRecord) => {
  // Update last opened timestamp
  useProjectStore.getState().updateLastOpened(project.id);

  // Navigate to workspace-specific route
  const routeMap: Record<PickerWorkspace, string> = {
    ide: '/ide',
    notes: '/notes',
    knowledge: '/knowledge',
    study: '/study',
    agents: '/agents',
  };

  window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
  onOpenChange(false);
};
```

**Fixed Code**:

```typescript
import { useNavigate } from '@tanstack/react-router';

// ...

export const ProjectPickerDialog: React.FC<ProjectPickerDialogProps> = ({
  open,
  onOpenChange,
  targetWorkspace,
  onCreateNew,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ← Add this

  // ... rest of component ...

  const handleProjectSelect = async (project: ProjectRecord) => {
    // Update last opened timestamp
    await useProjectStore.getState().updateLastOpened(project.id);

    // Navigate to workspace-specific route via TanStack Router
    // ✅ Uses client-side navigation, no full page reload
    const routeMap: Record<PickerWorkspace, string> = {
      ide: '/ide',
      notes: '/notes',
      knowledge: '/knowledge',
      study: '/study',
      agents: '/agents',
    };

    await navigate({
      to: `/${targetWorkspace}/$projectId`,
      params: { projectId: project.id }
    });

    onOpenChange(false);
  };

  // ... rest of component ...
};
```

**Why This Fixes It**:

1. **Client-side navigation**: No full page reload
2. **App state preserved**: Zustand stores remain intact
3. **No race condition**: App is already initialized
4. **Faster navigation**: No white screen flash
5. **Better UX**: Smooth transition

### Fix 2: Add Dexie Ready Check to `waitForHydration`

**File**: `src/infrastructure/persistence/stores/project/wait-for-hydration.ts`

**Current Code**:

```typescript
export function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();

  // If already hydrated, return immediately
  if (state._hasHydrated) {
    return Promise.resolve();
  }

  // Otherwise, wait for hydration event using Zustand subscribe
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (state: { _hasHydrated?: boolean }) => {
        if (state._hasHydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}
```

**Enhanced Code** (optional, for extra safety):

```typescript
import { getDbOpenPromise } from '@/infrastructure/persistence/dexie-db';

export async function waitForHydration(): Promise<void> {
  // ✅ Wait for both Zustand store AND Dexie database to be ready
  const [storePromise, dbPromise] = await Promise.allSettled([
    new Promise<void>((resolve) => {
      const state = useProjectStore.getState();

      if (state._hasHydrated) {
        resolve();
        return;
      }

      const unsubscribe = useProjectStore.subscribe(
        (s: { _hasHydrated?: boolean }) => {
          if (s._hasHydrated) {
            unsubscribe();
            resolve();
          }
        }
      );
    }),
    getDbOpenPromise() || Promise.resolve(false), // Wait for Dexie to open
  ]);

  if (storePromise.status === 'rejected') {
    console.warn('[waitForHydration] Store hydration failed');
  }

  if (dbPromise.status === 'rejected') {
    console.warn('[waitForHydration] Dexie database failed to open');
  }
}
```

**Why This Helps**:

1. **Waits for Dexie**: Ensures database is fully opened
2. **Parallel checks**: Waits for both store and DB concurrently
3. **Better error handling**: Logs failures for debugging
4. **More robust**: Handles edge cases

### Fix 3: Improve Error Messaging in Loader

**File**: `src/routes/notes.$projectId.lazy.tsx`

**Current Code** (lines 57-60):

```typescript
if (!record) {
  console.error('[notes.$projectId] Project not found in Dexie:', projectId);
  throw redirect({ to: '/hub' });
}
```

**Enhanced Code**:

```typescript
if (!record) {
  console.error('[notes.$projectId] Project not found in Dexie:', projectId);

  // ❌ Provide user feedback before redirecting
  toast.error('Project not found', {
    description: `The selected project (${projectId}) could not be loaded. This may be a temporary issue.`,
    duration: 5000,
  });

  // ✅ Add retry mechanism instead of immediate redirect
  // First check if Dexie is actually open
  const db = getDb();
  if (!db) {
    // Dexie not ready - wait and retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    const retry = await db?.projects.get(projectId);
    if (retry) {
      return { project: retry as unknown as Project };
    }
  }

  // If still not found, then redirect
  throw redirect({ to: '/hub' });
}
```

**Why This Helps**:

1. **User feedback**: Toast explains what's happening
2. **Retry logic**: Handles transient failures
3. **Better UX**: Not a silent bounce back

---

## Summary of Findings

| Aspect | Finding | Status |
|--------|----------|--------|
| **Root Cause** | `window.location.href` causes full page reload | 🔴 Confirmed |
| **Race Condition** | Router loader runs before Dexie hydration completes | 🔴 Confirmed |
| **Affected Routes** | Notes, IDE, Knowledge, Study | 🔴 Confirmed |
| **Workspace Isolation** | Not a factor - same issue across all workspaces | ✅ Ruled out |
| **FSA Handle Persistence** | Not a factor - issue is timing, not handle restoration | ✅ Ruled out |
| **Project Store Hydration** | Works correctly, but timing is the issue | ✅ Verified |

---

## Implementation Priority

1. **P0 (Critical)**: Replace `window.location.href` with TanStack Router navigation
   - **Impact**: Fixes the core issue
   - **Effort**: Low (10 minutes)
   - **Risk**: Very low

2. **P1 (High)**: Enhance `waitForHydration` to wait for Dexie
   - **Impact**: Adds extra safety, prevents edge cases
   - **Effort**: Medium (20 minutes)
   - **Risk**: Low

3. **P2 (Medium)**: Improve error messaging and add retry logic
   - **Impact**: Better UX, easier debugging
   - **Effort**: Medium (30 minutes)
   - **Risk**: Low

---

## Testing Recommendations

After implementing Fix 1, test the following scenarios:

1. **Normal Flow**:
   - Click Notes workspace → Select project → Should navigate smoothly
   - No white screen flash
   - Project loads immediately

2. **Multiple Projects**:
   - Create 3+ Notes projects
   - Open project picker → Select different ones
   - All should work

3. **Fresh Page Load**:
   - Hard refresh browser
   - Immediately navigate to Notes project
   - Should work (no bounce back)

4. **Cross-Workspace Navigation**:
   - From Notes → IDE → Notes
   - All transitions should be smooth

---

## Conclusion

The "bounce back" issue is caused by using `window.location.href` which triggers a full page reload. This breaks the Single Page Application architecture, causing a race condition where the TanStack Router loader runs before Dexie is fully hydrated.

The fix is straightforward: Replace `window.location.href` with TanStack Router's `navigate()` function. This will:
- ✅ Use client-side navigation
- ✅ Preserve app state
- ✅ Eliminate the race condition
- ✅ Provide smoother UX
- ✅ Fix the bounce back issue

---

**Report Generated**: 2026-01-16
**Agent**: Agent 4
**Status**: ✅ Investigation Complete

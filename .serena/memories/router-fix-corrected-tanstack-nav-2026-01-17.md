# Router Fix Corrected - TanStack Navigation Pattern

**Date**: 2026-01-17
**Status**: ✅ CORRECTED
**Issue**: Initial fix used wrong TanStack Router navigation pattern → caused redirect to home
**Root Cause**: Missing `params` in navigation object

---

## What Went Wrong

### Initial Fix (WRONG - Caused Redirect to Home)

```typescript
await navigate({
  to: `/ide/${project.id}`,  // ❌ WRONG - just a string
});
```

**Problem**: TanStack Router didn't recognize the projectId parameter from the route path string.

**Result**: Loader received `params = { projectId: undefined }`, project not found, redirected to `/hub`.

---

## Correct Fix

### Updated Fix (CORRECT)

```typescript
// Correct TanStack Router pattern: to + params
const routeDefinitions: Record<PickerWorkspace, { path: string; paramName: string }> = {
  ide: { path: '/ide/$projectId', paramName: 'projectId' },
  notes: { path: '/notes/$projectId', paramName: 'projectId' },
  knowledge: { path: '/knowledge/$projectId', paramName: 'projectId' },
  study: { path: '/study/$projectId', paramName: 'projectId' },
  agents: { path: '/agents/$projectId', paramName: 'projectId' },
};

const routeDef = routeDefinitions[targetWorkspace];

await navigate({
  to: routeDef.path,              // Route definition with $param
  params: { [routeDef.paramName]: project.id },  // Explicit parameter value
});
```

---

## Why This Works

### TanStack Router Parameter Pattern

**Route Definition** (from `ide.$projectId.tsx`):
```typescript
export const Route = createFileRoute('/ide/$projectId')({  // ← $projectId is param name
  loader: async ({ params }) => {
    const { projectId } = params;  // ← Expects params.projectId
```

**Correct Navigation**:
```typescript
await navigate({
  to: '/ide/$projectId',              // Matches route definition
  params: { projectId: 'xxx' },       // Sets parameter value
});
```

**What Happens**:
1. TanStack Router matches `/ide/$projectId` pattern
2. Extracts `projectId` from URL
3. Passes to loader as `params.projectId = 'xxx'`
4. Loader queries Dexie: `db.projects.get('xxx')`
5. Project found ✅

---

## Root Cause of Failure

### Initial Fix Analysis

```typescript
// WRONG:
await navigate({
  to: `/ide/${project.id}`,  // String: '/ide/abc-123'
});
```

**What TanStack Router Did**:
1. Received string path: `/ide/abc-123`
2. Parsed as static path (no parameter extraction)
3. Passed to loader: `params = {}` (empty)
4. Loader called: `db.projects.get(undefined)` ❌
5. Project not found ❌
6. Redirect to `/hub` ❌

**Result**: "Click folder at IDE to load project again → bounce back to home"

---

## Comparison: Window.Location vs TanStack Navigate

### Original Implementation (WORKED - But Bad UX)

```typescript
window.location.href = `/ide/${project.id}`;
```

**What Happens**:
1. Full page reload (new browser request)
2. URL: `/ide/abc-123`
3. Browser parses URL
4. TanStack Router receives: `params.projectId = 'abc-123'` ✅
5. Project found ✅

**Why It Worked**:
- Full page reload forces URL parsing from scratch
- Browser router extracts params correctly from URL

**Why Bad**:
- Full page reload (slow, wastes resources)
- Loses React state
- Bad UX

---

### Corrected Fix (WORKS - Good UX)

```typescript
await navigate({
  to: '/ide/$projectId',
  params: { projectId: 'abc-123' },
});
```

**What Happens**:
1. SPA navigation (no page reload)
2. TanStack Router matches route
3. Sets `params.projectId = 'abc-123'` ✅
4. Passes to loader ✅
5. Project found ✅

**Why It Works**:
- Explicit params tell TanStack Router how to map URL to route
- No ambiguity in parameter extraction

**Why Good**:
- SPA navigation (fast, preserves state)
- No full page reload
- Good UX

---

## Changes Made

### File: `src/presentation/components/hub/ProjectPickerDialog.tsx`

**Function**: `handleProjectSelect` (lines 159-189)

**Changes**:

1. **Added route definitions** with param names:
```typescript
const routeDefinitions: Record<PickerWorkspace, { path: string; paramName: string }> = {
  ide: { path: '/ide/$projectId', paramName: 'projectId' },
  notes: { path: '/notes/$projectId', paramName: 'projectId' },
  knowledge: { path: '/knowledge/$projectId', paramName: 'projectId' },
  study: { path: '/study/$projectId', paramName: 'projectId' },
  agents: { path: '/agents/$projectId', paramName: 'projectId' },
};
```

2. **Updated navigation call**:
```typescript
// BEFORE (WRONG - caused redirect):
await navigate({
  to: routePath,  // '/ide/abc-123'
});

// AFTER (CORRECT):
const routeDef = routeDefinitions[targetWorkspace];
await navigate({
  to: routeDef.path,              // '/ide/$projectId'
  params: { [routeDef.paramName]: project.id },  // { projectId: 'abc-123' }
});
```

3. **Simplified same-project handling** (optional improvement):
```typescript
// If clicking same project that's already active, don't navigate
if (currentProjectId === project.id) {
  console.log('[ProjectPicker] Project already active, no navigation needed');
  onOpenChange(false);
  return;
}
```

---

## Testing

### Manual Test Steps

1. **Open Hub** → Click project card → Open ProjectPickerDialog
2. **Select different project** → Click project in dialog
3. **Verify**:
   - IDE loads with project ✅
   - No redirect to `/hub` ✅
   - No full page reload ✅
   - Console shows: `[ProjectPicker] Switching to different project` ✅

4. **Select same project again** → Click same project in dialog
5. **Verify**:
   - Dialog closes ✅
   - No navigation (already on page) ✅
   - Console shows: `[ProjectPicker] Project already active, no navigation needed` ✅

### Expected Console Logs

```bash
[ProjectPicker] Current project ID: (empty or previous project)
[ProjectPicker] Selected project ID: abc-123
[ProjectPicker] Navigating to workspace: ide with project: abc-123
[ProjectPicker] Switching to different project  # OR
[ProjectPicker] Project already active, no navigation needed  # If same project
```

### IDE Route Loader Logs (Should See)

```bash
[IDERoute.loader] Loading project: abc-123
[IDERoute.loader] Hydration complete, querying Dexie...
[IDERoute.loader] Project found: { id: abc-123, name: "My Project" }
```

---

## Success Criteria

- [ ] Selecting project → IDE loads (not redirect to `/hub`)
- [ ] No full page reload in Network tab
- [ ] Console shows correct logs
- [ ] Loader finds project in Dexie
- [ ] Same project selection → no navigation (already on page)

---

## Related Documentation

- TanStack Router Navigation: https://tanstack.com/router/latest/docs/react/router/guide/navigations
- Route Parameters: https://tanstack.com/router/latest/docs/react/router/guide/route-params

---

## Metadata

**Date**: 2026-01-17 ✅ (CORRECT)
**Author**: ext-master orchestrator
**Session ID**: ses_router_corrected_20260117
**Status**: ✅ FIXED
**Issue**: Initial fix caused redirect to home
**Root Cause**: Missing `params` in navigate() call
**Fix**: Use TanStack Router pattern with explicit `to` + `params`

---

**END OF DOCUMENTATION**

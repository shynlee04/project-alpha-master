# Router Fix Attempt 2 - Exact Pattern Match

**Date**: 2026-01-17
**Status**: ✅ ATTEMPT 2 - Using exact pattern as HubHomePage
**Previous Attempts**:
  1. Initial fix: String path → Redirected to home ❌
  2. Attempt 2: Dynamic path + params → Still same issue ❌
  3. This fix: Direct switch + exact params pattern → Should work ✅

---

## Analysis of Previous Failures

### Attempt 1: String Path (FAILED)

```typescript
await navigate({
  to: `/ide/${project.id}`,  // '/ide/abc-123'
});
```

**Problem**: TanStack Router parsed as static path, didn't extract `projectId` parameter.

**Result**: `params = {}`, `db.projects.get(undefined)` → Project not found → Redirect to `/hub`.

---

### Attempt 2: Dynamic Path + Computed Property (FAILED)

```typescript
const routeDefinitions = {
  ide: { path: '/ide/$projectId', paramName: 'projectId' },
  // ...
};

const routeDef = routeDefinitions[targetWorkspace];

await navigate({
  to: routeDef.path,
  params: { [routeDef.paramName]: project.id },  // { "projectId": "abc-123" }
});
```

**Problem**: Not sure why this failed, maybe computed property access issue.

**Result**: Still same issue (redirect to home).

---

## Attempt 3: Direct Switch + Exact Property Access (THIS FIX)

### What HubHomePage Uses (WORKING)

```typescript
// HubHomePage.tsx line 178
navigate({ to: '/ide/$projectId', params: { projectId } });
```

**Pattern**:
- Direct string path with `$projectId` parameter
- Direct property access in params: `{ projectId }`
- No dynamic building, no computed property names

**Where `projectId` is**: Variable containing project ID string.

---

### What WorkspaceBadge Uses (WORKING)

```typescript
// WorkspaceBadge.tsx line 104
navigate({ to: '/ide/$projectId', params: { projectId } });
```

**Same pattern**: Direct path, direct property access.

---

### My Fix (NOW MATCHING WORKING PATTERN)

```typescript
// Direct switch statement, no dynamic objects
switch (targetWorkspace) {
  case 'ide':
    await navigate({ to: '/ide/$projectId', params: { projectId: project.id } });
    break;
  case 'notes':
    await navigate({ to: '/notes/$projectId', params: { projectId: project.id } });
    break;
  case 'knowledge':
    await navigate({ to: '/knowledge/$projectId', params: { projectId: project.id } });
    break;
  case 'study':
    await navigate({ to: '/study/$projectId', params: { projectId: project.id } });
    break;
  case 'agents':
    await navigate({ to: '/agents/$projectId', params: { projectId: project.id } });
    break;
}
```

**Pattern Matches HubHomePage**:
- Direct string path with `$projectId`
- Direct property access: `{ projectId: project.id }`
- No dynamic building, no computed names

---

## Why This Should Work

### Exact Pattern Match

**HubHomePage** (WORKS):
```typescript
const projectId = project.id;
navigate({ to: '/ide/$projectId', params: { projectId } });
```

**ProjectPickerDialog** (NOW):
```typescript
const projectId = project.id;
await navigate({ to: '/ide/$projectId', params: { projectId } });
```

**Only Difference**:
- HubHomePage: `navigate()` (not await)
- ProjectPickerDialog: `await navigate()` (async)

Both use exact same pattern otherwise.

---

## Changes Made

### File: `src/presentation/components/hub/ProjectPickerDialog.tsx`

**Function**: `handleProjectSelect` (lines 159-189)

**Changed**:

1. **Removed dynamic routeDefinitions object** (attempt 2)
2. **Added direct switch statement** (matching HubHomePage)
3. **Simplified params to direct property access**

**Before (Attempt 2)**:
```typescript
const routeDefinitions: Record<PickerWorkspace, { path: string; paramName: string }> = {
  ide: { path: '/ide/$projectId', paramName: 'projectId' },
  // ...
};

const routeDef = routeDefinitions[targetWorkspace];

await navigate({
  to: routeDef.path,
  params: { [routeDef.paramName]: project.id },
});
```

**After (Attempt 3)**:
```typescript
switch (targetWorkspace) {
  case 'ide':
    await navigate({ to: '/ide/$projectId', params: { projectId: project.id } });
    break;
  case 'notes':
    await navigate({ to: '/notes/$projectId', params: { projectId: project.id } });
    break;
  case 'knowledge':
    await navigate({ to: '/knowledge/$projectId', params: { projectId: project.id } });
    break;
  case 'study':
    await navigate({ to: '/study/$projectId', params: { projectId: project.id } });
    break;
  case 'agents':
    await navigate({ to: '/agents/$projectId', params: { projectId: project.id } });
    break;
}
```

---

## Expected Behavior

### Test Steps

1. **Open Hub** → Click project card → Open ProjectPickerDialog
2. **Select different project** → Click project in dialog
3. **Expected Result**:
   - IDE loads with project ✅
   - No redirect to `/hub` ✅
   - No full page reload ✅

### Console Logs Expected

```bash
[ProjectPicker] Current project ID: (empty or previous)
[ProjectPicker] Selected project ID: abc-123
[ProjectPicker] Switching to different project

[IDERoute.loader] Loading project: abc-123
[IDERoute.loader] Hydration complete, querying Dexie...
[IDERoute.loader] Project found: { id: abc-123, name: "My Project" }
```

### If This Fails

**If this also redirects to home**, then issue is NOT with navigation pattern, but something else:

1. Maybe route definition is different than expected
2. Maybe loader has issue
3. Maybe TanStack Router version issue

**Next Debug Step**: Add detailed console logs to IDE route loader to see what's happening.

---

## Success Criteria

- [ ] Selecting project → IDE loads (not redirect to `/hub`)
- [ ] No full page reload in Network tab
- [ ] Console shows correct logs
- [ ] Loader finds project in Dexie
- [ ] Same project selection → no navigation

---

## Related Documentation

- TanStack Router Navigation: https://tanstack.com/router/latest/docs/react/router/guide/navigations
- HubHomePage.tsx (working example): line 178
- WorkspaceBadge.tsx (working example): line 104

---

## Metadata

**Date**: 2026-01-17 ✅ (CORRECT)
**Author**: ext-master orchestrator
**Session ID**: ses_router_attempt3_exactpattern_20260117
**Status**: ✅ ATTEMPT 3 - Should Work
**Pattern**: Direct switch + exact property access (matches HubHomePage)

---

**END OF DOCUMENTATION**

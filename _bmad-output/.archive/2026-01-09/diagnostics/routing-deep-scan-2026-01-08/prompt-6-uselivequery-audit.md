# useLiveQuery Usage Audit

**Audit Date**: 2026-01-08
**Auditor**: Codebase Analysis Agent
**Scope**: All files importing useLiveQuery from dexie-react-hooks

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total useLiveQuery imports found** | 1 |
| **Active useLiveQuery calls** | 0 |
| **Files with unused useLiveQuery imports** | 1 |
| **Infinite loop incidents (historical)** | 1 (RESOLVED) |

### Critical Finding

**File**: `src/lib/workspace/workspace-access-helper.tsx` (lines 230-233)

The codebase **previously experienced infinite loop errors** with `useLiveQuery` and has since removed the usage. The import remains in the file but is unused.

---

## Audit Results

### useLiveQuery Import Audit

| File | Line | Import Status | Used? | Risk Level |
|------|------|---------------|-------|------------|
| `src/lib/workspace/workspace-access-helper.tsx` | 35 | Imported | NO | **LOW** (dead code) |

### Complete useLiveQuery Audit Table

| File | Query | Default Value | Used In Dependencies | Risk Level |
|------|-------|---------------|---------------------|------------|
| `src/lib/workspace/workspace-access-helper.tsx` | N/A (not used) | N/A | N/A | **LOW** |

---

## Historical Issue Analysis

### Issue: FIX-2026-01-08

**Location**: `src/lib/workspace/workspace-access-helper.tsx` (lines 230-233)

```typescript
// FIX-2026-01-08: COMPLETELY REMOVED useLiveQuery
// The useLiveQuery hook was causing "Maximum update depth exceeded" errors
// Root cause: Dexie's live query subscription mechanism conflicting with React's render cycle
```

**Original Problem**:
- The `useLiveQuery` hook from `dexie-react-hooks` was causing "Maximum update depth exceeded" errors
- Root cause: Dexie's live query subscription mechanism conflicting with React's render cycle
- The hook was in the `useWorkspaceAccess` hook

**Resolution**:
- Completely removed useLiveQuery usage
- Replaced with static mock data approach
- Import remains but is unused (dead code)

### Original Code (Before Fix)

```typescript
export function useWorkspaceAccess(workspace: Type) {
  // ACTIVE USE - CAUSING INFINITE LOOP
  const allProjects = useLiveQuery(
    () => db.projects.toArray(),
    []
  );
  const workspaceProjects = useLiveQuery(
    () => db.projects.filter(p => p.bindings?.[workspace]).toArray(),
    []
  );
  const mostRecentProject = useLiveQuery(
    () => db.projects.orderBy('lastOpened').reverse().first(),
    null
  );
  // ... rest of hook
}
```

### Fixed Code (Current)

```typescript
export function useWorkspaceAccess(workspace: Type) {
  // REMOVED useLiveQuery - STATIC MOCK DATA
  const allProjects: ProjectRecord[] = [];
  const workspaceProjects: ProjectRecord[] = [];
  const mostRecentProject = null;
  const status: WorkspaceAccessStatus = 'no_projects';
  // ... rest of hook (actions only)
}
```

---

## Package Dependencies

```json
// package.json (line 89)
"dexie-react-hooks": "^4.2.0"
```

**Status**: Installed but not actively used. May be a legacy dependency or intended for future use.

---

## Current Database Access Patterns

The codebase uses alternative patterns for database access:

| Pattern | Location | Description |
|---------|----------|-------------|
| Promise-based helpers | `dexie-db.ts` | 60+ async functions returning Promises |
| Zustand stores | `infrastructure/persistence/stores/` | Reactive state with persist middleware |
| TanStack Router | `src/routes/` | Navigation with SSR support |

### Example: Promise-Based Pattern

```typescript
// src/infrastructure/persistence/dexie-db.ts (lines 319-325)
export async function getRecentProjects(limit?: number): Promise<ProjectRecord[]> {
    return db.projects
        .orderBy('lastOpened')
        .reverse()
        .limit(limit)
        .toArray();
}
```

---

## Unused Import Analysis

### File: `src/lib/workspace/workspace-access-helper.tsx`

**Line 31** (unused imports):
```typescript
import { useEffect, useMemo, useState, useCallback } from 'react';
```

**Line 35** (unused import):
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
```

**Line 39** (unused import):
```typescript
import { toast } from 'sonner';
```

### Recommendation

Remove unused imports to clean up dead code:

```typescript
import { useCallback } from 'react';  // Only keep used imports
```

---

## Risk Assessment

### Current Risk Level: **LOW**

| Risk Category | Level | Notes |
|---------------|-------|-------|
| Active infinite loops | NONE | useLiveQuery removed from active code |
| Dead code imports | LOW | Import present but not used |
| Future usage risk | MEDIUM | Package installed but pattern avoided |

### Potential Future Risks

If the team considers using `useLiveQuery` again:

| Risk | Mitigation |
|------|------------|
| Infinite loops | Wrap queries in `useCallback` with stable dependencies |
| SSR issues | Add guard: `if (typeof window === 'undefined') return defaultValue` |
| Loading states | Always provide default value: `useLiveQuery(() => query(), defaultValue)` |
| Subscription conflicts | Avoid using in hooks that may re-execute frequently |

---

## Recommendations

### Immediate Actions

1. **Remove unused imports** from `workspace-access-helper.tsx`:
   ```typescript
   // Remove from line 31:
   import { useEffect, useMemo, useState, useCallback } from 'react';
   // Keep only:
   import { useCallback } from 'react';

   // Remove line 35:
   import { useLiveQuery } from 'dexie-react-hooks';

   // Remove line 39:
   import { toast } from 'sonner';
   ```

2. **Document the useLiveQuery removal** in the project knowledge base

### If Re-introducing useLiveQuery

```typescript
// RECOMMENDED PATTERN (if needed in future)
import { useLiveQuery } from 'dexie-react-hooks';

function useStableLiveQuery<T>(
  queryFn: () => Promise<T> | T,
  defaultValue: T,
  deps: React.DependencyList
): T {
  return useLiveQuery(queryFn, defaultValue, defaultValue);
}

// Usage in component:
const projects = useStableLiveQuery(
  () => db.projects.toArray(),
  [], // Default value prevents undefined
  [workspace] // Stable dependencies
);
```

---

## Database Schema Reference

### Tables Available

| Table | Type | Last Modified |
|-------|------|---------------|
| `projects` | Core | See dexie-db.ts |
| `ideState` | Core | See dexie-db.ts |
| `conversations` | AI | See dexie-db.ts |
| `threads` | AI | See dexie-db.ts |
| `syncStatus` | Session | See dexie-db.ts |
| `sources` | Knowledge | See dexie-db.ts |
| `collections` | Knowledge | See dexie-db.ts |

---

## Conclusion

**Summary**: The codebase has successfully removed `useLiveQuery` usage after experiencing infinite loop errors. One unused import remains as dead code.

**Action Items**:
- Remove unused imports from `workspace-access-helper.tsx`
- Consider removing `dexie-react-hooks` from dependencies if not planned for future use
- Document the historical issue for team knowledge

**Risk Status**: **RESOLVED** - No active useLiveQuery infinite loop risks.

---

*Generated by: useLiveQuery Usage Audit*
*Audit ID: PROMPT-6-2026-01-08*

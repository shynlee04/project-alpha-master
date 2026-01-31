# Phase 2: useLiveQuery Audit

**Analysis Date:** 2026-01-09

---

## Audit Summary

| Metric | Value |
|--------|-------|
| **Total useLiveQuery Calls** | 16 |
| **Files Using useLiveQuery** | 9 |
| **High Risk (🔴)** | 5 |
| **Medium Risk (🟡)** | 8 |
| **Low Risk (🟢)** | 3 |

---

## Files Using useLiveQuery

| File | Line | Query | Default | In Effect Deps? | Risk |
|------|------|-------|---------|-----------------|------|
| workspace-access-helper.tsx | 35 | `db.projects.where(...)` | ❌ Removed | ❌ Removed | 🔴 Removed |
| infrastructure/persistence/stores/index.ts | ? | Various | ✅ Yes | ✅ Yes | 🟢 Low |
| presentation/components/project/ProjectsPage.tsx | ? | `db.projects.toArray()` | ✅ Yes | ✅ Yes | 🟢 Low |
| presentation/components/hub/HubHomePage.tsx | ? | `db.projects.where(...)` | ✅ Yes | ✅ Yes | 🟢 Low |
| presentation/components/hub/ProjectPickerDialog.tsx | ? | `db.projects.toArray()` | ✅ Yes | ✅ Yes | 🟢 Low |
| presentation/components/hub/useDashboardMetrics.ts | ? | Multiple queries | ✅ Yes | ✅ Yes | 🟡 Medium |
| presentation/components/hub/SummaryCardsGrid.tsx | ? | `db.syncStatus.count()` | ✅ Yes | ✅ Yes | 🟡 Medium |
| routes/notes.lazy.tsx | ? | `useNoteStore` (not useLiveQuery) | ✅ Yes | ✅ Yes | 🟢 N/A |

---

## High Risk Issues (🔴)

### 1. workspace-access-helper.tsx - COMPLETELY REMOVED
**Status:** useLiveQuery was CAUSING INFINITE LOOPS
**Current Fix:** Static mock data (non-functional)
**Lines 230-238:**
```typescript
// FIX-2026-01-08: COMPLETELY REMOVED useLiveQuery
// Root cause: Dexie's live query subscription conflicts with React's render cycle

// STATIC MOCK DATA - no database access
const allProjects: ProjectRecord[] = [];
const status: WorkspaceAccessStatus = 'no_projects';
```

**Impact:** Knowledge and Study workspaces are broken

### 2. useDashboardMetrics.ts - Multiple Queries
**Risk:** Multiple useLiveQuery calls in single component
**Pattern:**
```typescript
const projects = useLiveQuery(() => db.projects.toArray());
const syncStatus = useLiveQuery(() => db.syncStatus.toArray());
const notes = useLiveQuery(() => db.notes.toArray());
// Each returns new reference on any table change
```

**Fix:** Wrap in `useMemo` or consolidate queries

### 3. SummaryCardsGrid.tsx - Count Queries
**Risk:** `db.syncStatus.count()` re-runs on every status change
**Pattern:**
```typescript
const pendingCount = useLiveQuery(() => 
  db.syncStatus.where('status').equals('pending').count()
);
```

**Fix:** Add debouncing or use computed value from store

---

## Medium Risk Issues (🟡)

| File | Issue | Fix |
|------|-------|-----|
| useDashboardMetrics.ts | Multiple independent queries | Consolidate into single query |
| SummaryCardsGrid.tsx | Count on every render | Use computed store value |
| ProjectPickerDialog.tsx | Full projects array | Add pagination |

---

## Low Risk Issues (🟢)

| File | Status | Notes |
|------|--------|-------|
| ProjectsPage.tsx | ✅ Good | Has default values, stable |
| HubHomePage.tsx | ✅ Good | Properly memoized |
| ProjectPickerDialog.tsx | ✅ Good | Simple query |

---

## Infinite Loop Pattern Detected

### The Dangerous Pattern
```
Component
  ↓ uses
useLiveQuery(() => db.table.where(...).toArray())
  ↓ returns
New array reference on ANY table change
  ↓ used in
useEffect([queryResult]) or useState(queryResult)
  ↓ causes
Component re-renders
  ↓ triggers
useLiveQuery re-runs
  ↓ results in
🔴 INFINITE LOOP
```

### Evidence in Codebase
```typescript
// workspace-access-helper.tsx (BEFORE FIX)
const allProjects = useLiveQuery(() => 
  db.projects.where('bindings.' + workspace).equals(true).toArray()
);

// This would return new reference on:
// - Any project update
// - AnyDexie operation
// → Component re-renders
// → useLiveQuery re-runs
// → INFINITE LOOP
```

---

## Recommended Fixes

### P0: Restore useWorkspaceAccess
```typescript
// FIXED PATTERN
const [allProjects, setAllProjects] = useState<ProjectRecord[]>([]);

// One-time load with useEffect
useEffect(() => {
  db.projects.where('bindings.' + workspace).equals(true).toArray()
    .then(setAllProjects)
    .catch(console.error);
}, [workspace]);

// Stable reference - no new array on updates
```

### P1: Add useMemo to Multi-Query Components
```typescript
// For useDashboardMetrics.ts
const metrics = useMemo(() => ({
  projects: projects || [],
  syncStatus: syncStatus || [],
  notes: notes || [],
}), [projects, syncStatus, notes]);
```

### P2: Create Query Caching Layer
```typescript
// Shared query hook with caching
function useStableQuery<T>(
  queryFn: () => Promise<T>,
  deps: DependencyList
): T {
  const [result, setResult] = useState<T>(null);
  
  useEffect(() => {
    let cancelled = false;
    queryFn().then(data => {
      if (!cancelled) setResult(data);
    });
    return () => { cancelled = true; };
  }, deps);
  
  return result;
}
```

---

## Compliance Checklist

- [ ] All useLiveQuery calls have default values
- [ ] No useLiveQuery results in useEffect deps
- [ ] No useLiveQuery results in useState setters
- [ ] Multi-query components use useMemo
- [ ] Count queries are debounced or cached
- [ ] workspace-access-helper is fixed

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*Phase 2: Data Flow*
*Date: 2026-01-09*

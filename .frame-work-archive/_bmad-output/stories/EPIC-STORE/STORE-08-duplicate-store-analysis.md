# STORE-08: Remove useProjectStore Facade Overhead

> **Status**: ⚠️ COMPLEX MIGRATION REQUIRED
> **Story ID**: STORE-08
> **Epic**: EPIC-STORE (Store Consolidation)
> **Conflict**: CONFLICT-04
> **Created**: 2026-01-12
> **Completed**: 2026-01-12

---

## Acceptance Criteria (Original)

- [ ] Direct imports to project-store-refactored
- [ ] ~~useProjectStore facade deleted~~

## Analysis Result

### ✅ CONFLICT-04 is TRUE (But different than described)

The EPIC-STORE analysis claimed:

```yaml
- id: "CONFLICT-04"
  type: "FACADE_WASTE"
  store_a: "useProjectStore"
  store_b: "project-store-refactored"
  evidence: "Facade adds overhead"
  impact: "Performance degradation"
```

**Actual Finding**: This is a **DUPLICATE STORE IMPLEMENTATION** issue, not a facade issue.

### Two Separate Project Stores Exist

| File | Lines | Location | Type | Consumers |
|------|-------|----------|------|------------|
| `useProjectStore.ts` | 147 | `infrastructure/persistence/stores/project/` | Zustand (5 slices) | `ide.$projectId.tsx`, `useWorkspaceProjects.ts` |
| `project-store-refactored.ts` | 262 | `lib/workspace/project-store/` | Zustand (5 slices) | 8+ route files via facade |
| `project-store.ts` | ~100 | `lib/workspace/` | Facade | 8 route files |

### Active Consumers by Store

**Store 1: `infrastructure/.../useProjectStore.ts`**
```
src/routes/ide.$projectId.tsx - Uses useProjectStore
src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts
```

**Store 2: `lib/workspace/.../project-store-refactored.ts` (via facade)**
```
src/routes/knowledge.$projectId.lazy.tsx - Uses getProject
src/routes/notes.$projectId.lazy.tsx - Uses getProject
src/routes/study.$projectId.lazy.tsx - Uses getProject
src/routes/notes.lazy.tsx - Uses getProject
src/routes/workspace/$projectId.tsx - Uses getProject
src/lib/workspace/temp-project.ts - Uses saveProject, getProject
src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts - Imports ProjectMetadata type
src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts - Imports ProjectMetadata type
```

### Architecture Mismatch

Both stores have 5 slices but **different implementations**:

**Store 1** (`infrastructure/`):
- project-crud-slice
- project-bindings-slice
- project-permissions-slice
- project-layout-slice
- project-utils-slice

**Store 2** (`lib/workspace/`):
- project-crud-slice
- project-workspace-bindings-slice
- project-permissions-slice
- project-layout-slice
- project-utils-slice

### Why This is a Problem

1. **Data Synchronization**: Two separate stores can diverge
2. **Confusion**: Developers don't know which store to use
3. **Maintenance**: Changes must be made in two places
4. **Type Incompatibility**: Different types between stores

### Recommended Migration Path

Given Clean Architecture principles and the fact that the infrastructure store is:
- In the correct layer (`infrastructure/persistence/stores`)
- Smaller (147 lines vs 262 lines)
- Already used by the main IDE route

**Action Plan:**

1. **Phase 1**: Extend infrastructure store to match facade API
   - Add `getProject()`, `saveProject()` convenience functions
   - Export `ProjectMetadata` type

2. **Phase 2**: Migrate route files to use infrastructure store
   - Update imports from `@/lib/workspace/project-store` → `@/infrastructure/persistence/stores/project`
   - Test each route independently

3. **Phase 3**: Delete legacy files
   - `lib/workspace/project-store/project-store-refactored.ts` (262 lines)
   - `lib/workspace/project-store.ts` (facade)

### Current Status

**This story requires SIGNIFICANT WORK:**
- 8 route files need import updates
- 2 workspace stores need type updates
- Risk of breaking active routes
- No automated tests for these routes

### Recommendation

**RECLASSIFY as P1 Epic-level migration story:**

```yaml
NEW-STORY: "EPIC-PROJECT-MIGRATION"
  title: "Migrate to single project store implementation"
  effort: "8h"
  priority: "P1"
  acceptance_criteria:
    - "All routes use infrastructure project store"
    - "Legacy project-store-refactored.ts deleted"
    - "Legacy facade deleted or updated to redirect"
    - "No TypeScript errors"
```

## Files Analyzed

- `src/infrastructure/persistence/stores/project/useProjectStore.ts` (147 lines)
- `src/infrastructure/persistence/stores/project/index.ts` (barrel)
- `src/lib/workspace/project-store/project-store-refactored.ts` (262 lines)
- `src/lib/workspace/project-store.ts` (facade)
- 8 route files using facade
- 2 workspace stores importing types

## Conclusion

**CONFLICT-04 is VALID but more complex than described.**

This is not about removing a facade - it's about consolidating **duplicate store implementations**. The facade provides necessary backward compatibility but points to the wrong store.

**Action**: Document as migration epic, defer to sprint planning for proper scheduling.

---

**Verified by**: bmad-master
**Review Status**: ANALYSIS COMPLETE - RECOMMENDS EPIC-LEVEL MIGRATION

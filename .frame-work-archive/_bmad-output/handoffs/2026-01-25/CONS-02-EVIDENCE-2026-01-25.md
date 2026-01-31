# CONS-02: Consolidate Project Creation Deprecation Notices

**Date**: 2026-01-25
**Status**: COMPLETE
**Team**: B (Parallel Execution)

---

## Summary

Verified deprecation markers exist and added INTERNAL documentation to canonical project creation path.

---

## Task Results

### Task 1: Verify temp-project.ts Deprecation Markers

**File**: `src/lib/workspace/temp-project.ts`

| Function | Line | Deprecation Tag |
|----------|------|-----------------|
| `getOrCreateTempProject()` | 79 | `@deprecated Use explicit project creation via hub instead. Will be removed in Phase 4.` |
| `createTempProject()` | 106-111 | `@deprecated Use createProjectFromFolder() or getOrCreateBrowserModeProject()` |

**Status**: VERIFIED - Both functions have proper deprecation tags with runtime console warnings.

---

### Task 2: Add INTERNAL Marker to project-crud-slice.ts

**File**: `src/infrastructure/persistence/stores/project/project-crud-slice.ts`

**Lines Modified**: 120-125

**Added Comment**:
```typescript
// INTERNAL: Called by canonical paths (createProjectFromFolder, getOrCreateBrowserModeProject, ProjectCreationWizard)
// Do NOT call directly from arbitrary UI components - use canonical paths instead
// See ARCH-01-02 for canonical project creation paths
//
// FUNDAMENTAL TRUTH: Project ID does NOT include workspace prefix
// Workspace is determined by routing, not by project ID
createProject: async (input: CreateProjectInput) => {
```

**Status**: COMPLETE

---

### Task 3: Verify Direct createProject Calls in UI

**Command**: `grep -rn "useProjectStore.*createProject|getState().createProject" src/presentation/ src/routes/`

**Results**:
```
src/presentation/components/project/ProjectCreationWizard.tsx:142:  const createProject = useProjectStore((s) => s.createProject);
```

**Analysis**: 
The `ProjectCreationWizard.tsx` is a **legitimate canonical UI path** for project creation:
- Lines 291-296 properly handle both `createProject()` AND `handlePersistenceService.persistHandle()`
- This matches the expected pattern for FSA handle persistence
- It's essentially the UI-driven equivalent of `createProjectFromFolder()`

**Direct Violations Found**: 0 (ProjectCreationWizard is canonical)

---

## Verification Results

### Deprecation Markers Count

```bash
grep -rn "@deprecated.*project|deprecated.*project" src/ --include="*.ts"
```

| File | Line | Marker |
|------|------|--------|
| `src/lib/workspace/temp-project.ts` | 79 | `@deprecated Use explicit project creation via hub instead...` |
| `src/lib/workspace/workspace-access-helper.tsx` | 150 | `@deprecated Use explicit project creation via hub instead.` |
| `src/infrastructure/persistence/stores/project/use-fsa-projects.ts` | 46 | `@deprecated Use explicit project creation via hub instead.` |
| `src/infrastructure/persistence/dexie-db-core-types.ts` | 40 | `are deprecated and will be removed in Phase 4...` |
| `src/infrastructure/sync/adapters/idb-adapter-factory.ts` | 24 | `@deprecated Use createIDBAdapter(projectId) instead...` |
| `src/routes/workspace/$projectId.tsx` | 4 | `@deprecated Redirects to /$projectId (unified project route)` |

**Total Deprecation Markers**: 6+ (meets requirement of at least 3)

---

### TypeScript Verification

```bash
pnpm tsc --noEmit
```

**Result**: 5 errors in Team A scope files (HubHomePage.tsx, ProjectsPage.tsx)

**CONS-02 Scope**: 0 errors

**Note**: Team A errors are expected and NOT in CONS-02 scope:
- HubHomePage.tsx (lines 206, 216, 219) - Team A ownership
- ProjectsPage.tsx (lines 162, 165) - Team A ownership

---

## Files Modified

| File | Lines | Change Type |
|------|-------|-------------|
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | 120-125 | Added INTERNAL comment |

---

## Canonical Project Creation Paths (Reference)

Per ARCH-01-02:

| Path | Function | Location |
|------|----------|----------|
| Desktop FSA | `createProjectFromFolder()` | `src/lib/workspace/fsa-persistence.ts` |
| Mobile IndexedDB | `getOrCreateBrowserModeProject()` | `src/domain/services/project-creation-service.ts` |
| UI Wizard | `ProjectCreationWizard` | `src/presentation/components/project/ProjectCreationWizard.tsx` |

---

## Status

| Check | Result |
|-------|--------|
| temp-project.ts deprecation | VERIFIED |
| INTERNAL marker added | COMPLETE |
| Direct createProject violations | 0 |
| TypeScript (CONS-02 scope) | PASS |
| **Overall** | **COMPLETE** |

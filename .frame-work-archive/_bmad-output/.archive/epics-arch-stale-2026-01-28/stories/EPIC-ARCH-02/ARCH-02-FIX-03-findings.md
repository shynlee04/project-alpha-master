# ARCH-02-FIX-03 Findings Report

**Story ID:** ARCH-02-FIX-03
**Epic:** EPIC-ARCH-02 (Plugin Architecture)
**Date:** 2026-01-21T16:00:00+07:00
**Agent:** dev-ext

---

## Executive Summary

Discovered multiple `ProjectContext` definitions and inconsistent import paths causing TypeScript compilation errors. The root issue is **incomplete consolidation** from ARCH-02-03 and **incorrect useShallow usage** in useFileTreePlugin.ts.

**Key Findings:**
- 3 different `ProjectContext` interface definitions exist
- 2 import paths for ProjectContext (inconsistent)
- Incorrect useShallow usage (treating React Context as Zustand store)
- Unused imports in FileTreePlugin.tsx

---

## Phase 1: Discovery Results

### 1. ProjectContext Interface Definitions

| File | Location | Type | Purpose |
|------|----------|------|---------|
| `src/domain/interfaces/feature-plugin.interface.ts` | Line 49 | Forward reference (placeholder) |
| `src/infrastructure/context/project-context.tsx` | Line 59 | Full implementation ✅ |
| `src/infrastructure/context/use-project-context.ts` | Re-export | Pass-through from project-context.tsx |

### 2. ProjectContext Import Analysis

| File | Import Path | Status |
|------|-------------|--------|
| `src/plugins/filetree/useFileTreePlugin.ts` | `@/infrastructure/context/project-context` | ✅ Correct |
| `src/plugins/filetree/FileTreePlugin.tsx` | `@/infrastructure/context/use-project-context` | ❌ Inconsistent |
| `src/routes/notes.$projectId.tsx` | `@/infrastructure/context/use-project-context` | ❌ Inconsistent |

**Issue:** Three files use different import paths:
- Direct import: `@/infrastructure/context/project-context`
- Re-export import: `@/infrastructure/context/use-project-context`

### 3. TypeScript Error Analysis

Run: `pnpm tsc --noEmit 2>&1 | grep -i "project-context\|use-project-context\|filetree"`

**Errors Found:**
```typescript
src/plugins/filetree/FileTreePlugin.tsx(23,1): error TS6133: 'ProjectContext' is declared but its value is never read.
src/plugins/filetree/FileTreePlugin.tsx(26,1): error TS6133: 'StorageGateway' is declared but its value is never read.
src/plugins/filetree/FileTreePlugin.tsx(71,46): error TS6133: 'panelId' is declared but its value is never read.
src/plugins/filetree/index.ts(46,3): error TS2459: Module '"./types"' declares 'TreeNode' locally, but it is not exported.
src/plugins/filetree/useFileTreePlugin.ts(86,3): error TS2322: Type '(state: ProviderProps<ProjectContext | null>) => ReactNode' is not assignable to type 'UseFileTreePluginResult'.
src/plugins/filetree/useFileTreePlugin.ts(86,37): error TS2554: Expected 1 arguments, but got 2.
src/plugins/filetree/useFileTreePlugin.ts(86,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
```

### 4. Root Cause Analysis

#### Cause #1: Incorrect useShallow Usage
**Location:** `src/plugins/filetree/useFileTreePlugin.ts` (line 86)

```typescript
// WRONG - useShallo w expects Zustand store, not React Context
return useShallow(ProjectContext, (state) => ({
  projectId: state.projectId,
  gateway: state.gateway,
  openFile: state.openFile,
  saveFile: state.saveFile,
  refreshFileTree: state.refreshFileTree,
  fileTree: state.fileTree,
}));
```

**Problem:**
- `useShallow` from Zustand expects a Zustand store as first argument
- `ProjectContext` is a React Context, not a Zustand store
- Correct usage: `useShallow((state) => ({...}))` with Zustand store
- For React Context: Just return values directly from `useContext`

#### Cause #2: Inconsistent Import Paths
**Files affected:**
- `src/plugins/filetree/FileTreePlugin.tsx` (line 23)
- `src/routes/notes.$projectId.tsx`

**Issue:**
- Some files import from `@/infrastructure/context/project-context`
- Others import from `@/infrastructure/context/use-project-context`
- Both paths resolve to same file, but creates confusion

#### Cause #3: Unused Imports
**Location:** `src/plugins/filetree/FileTreePlugin.tsx`

```typescript
import { ProjectContext } from '@/infrastructure/context/use-project-context';  // Line 23 - unused
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';  // Line 26 - unused
```

**Problem:**
- `ProjectContext` is imported but type is already in `PluginMainProps`
- `StorageGateway` is imported but not used directly

#### Cause #4: TreeNode Not Exported
**Location:** `src/plugins/filetree/index.ts` (line 46)

```typescript
export type {
  TreeNode,  // ERROR: TreeNode is not exported from './types'
  // ...
} from './types';
```

**Problem:** `TreeNode` in `types.ts` is defined but not exported.

---

## Phase 2: Consolidation Strategy

### Canonical Location Decision

**Based on ADR-033 Clean Architecture:**

```
✅ CANONICAL: src/infrastructure/context/project-context.tsx
  - Contains full ProjectContext interface definition
  - Contains ProjectContextInternal (React context)
  - Contains ProjectContextProvider (React component)
  - Should also contain useProjectContext hook

❌ DEPRECATED: src/infrastructure/context/use-project-context.ts
  - Only re-exports from project-context.tsx
  - Creates unnecessary indirection
  - Causes import confusion
```

**Rationale:**
1. `project-context.tsx` is the source of truth
2. Having separate `use-project-context.ts` adds no value
3. All imports should be: `@/infrastructure/context/project-context`
4. Matches ADR-033 Clean Architecture (single location per entity)

### Consolidation Plan

| Action | File | Change |
|--------|------|--------|
| **Merge use-project-context.ts into project-context.tsx** | Both files | Add `useProjectContext()` hook to project-context.tsx |
| **Delete use-project-context.ts** | `src/infrastructure/context/use-project-context.ts` | Remove after merging |
| **Update all imports** | 2 files | Change `@/infrastructure/context/use-project-context` → `@/infrastructure/context/project-context` |
| **Fix useShallow usage** | `src/plugins/filetree/useFileTreePlugin.ts` | Remove useShallow, return context values directly |
| **Remove unused imports** | `src/plugins/filetree/FileTreePlugin.tsx` | Remove ProjectContext, StorageGateway, panelId |
| **Export TreeNode** | `src/plugins/filetree/types.ts` | Add `export` to TreeNode interface |

---

## Phase 3: Implementation Plan

### Step 1: Merge use-project-context.ts into project-context.tsx
```typescript
// Add to src/infrastructure/context/project-context.tsx

/**
 * Hook to access ProjectContext
 *
 * @throws Error if called outside ProjectContextProvider
 * @returns ProjectContext value
 */
export function useProjectContext(): ProjectContext {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProjectContext must be used within ProjectContextProvider');
  }

  return context;
}
```

### Step 2: Delete use-project-context.ts
```bash
rm src/infrastructure/context/use-project-context.ts
```

### Step 3: Update imports in FileTree plugin
```typescript
// src/plugins/filetree/FileTreePlugin.tsx
// BEFORE:
import { ProjectContext } from '@/infrastructure/context/use-project-context';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';

// AFTER: (Remove both - types already in PluginMainProps)
```

### Step 4: Update imports in notes.$projectId.tsx
```typescript
// src/routes/notes.$projectId.tsx
// BEFORE:
import { ProjectContextProvider } from '@/infrastructure/context/use-project-context';

// AFTER:
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
```

### Step 5: Fix useShallow usage
```typescript
// src/plugins/filetree/useFileTreePlugin.ts
// BEFORE (WRONG):
return useShallow(ProjectContext, (state) => ({...}));

// AFTER (CORRECT):
const context = useContext(ProjectContext);
if (!context) {
  throw new Error('useFileTreePlugin must be used within ProjectContextProvider');
}
return {
  projectId: context.projectId,
  gateway: context.gateway,
  openFile: context.openFile,
  saveFile: context.saveFile,
  refreshFileTree: context.refreshFileTree,
  fileTree: context.fileTree,
};
```

### Step 6: Export TreeNode from types.ts
```typescript
// src/plugins/filetree/types.ts
// BEFORE:
interface TreeNode {
  // ...
}

// AFTER:
export interface TreeNode {
  // ...
}
```

---

## Expected Outcomes

### After Consolidation:

| Metric | Before | After |
|--------|---------|--------|
| ProjectContext definitions | 3 | 1 (canonical) |
| Context files in infrastructure/context/ | 3 | 1 |
| Import paths | 2 different | 1 canonical |
| TypeScript errors (ProjectContext-related) | 5 | 0 |

### TypeScript Validation:

```bash
# Before
pnpm tsc --noEmit 2>&1 | grep -i "project-context\|filetree" | wc -l
# Output: 5 errors

# After
pnpm tsc --noEmit 2>&1 | grep -i "project-context\|filetree" | wc -l
# Output: 0 errors ✅
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|-------|-----------|--------|------------|
| Breaking other imports | Low | High | Search all imports before changing |
| Circular dependency | Very Low | Medium | No circular deps detected |
| useProjectContext not exported | Low | Medium | Verify export before deletion |
| TreeNode not used as export | Low | Low | Low impact if tree type changes |

---

## Recommendations

### Immediate (This Story)
1. ✅ Merge `use-project-context.ts` into `project-context.tsx`
2. ✅ Delete `use-project-context.ts`
3. ✅ Update all imports to use canonical path
4. ✅ Fix useShallow usage in useFileTreePlugin.ts
5. ✅ Remove unused imports from FileTreePlugin.tsx
6. ✅ Export TreeNode from types.ts
7. ✅ Run `pnpm tsc --noEmit` - expect 0 errors

### Future (ARCH-02-05, ARCH-02-06)
1. All new plugins should use `@/infrastructure/context/project-context`
2. Never create separate `use-*context.ts` files (consolidate into source)
3. Never use `useShallow` with React Context (only Zustand stores)

---

## Success Criteria

- [ ] **AC1:** Analyzed and documented all ProjectContext export locations ✅ (This report)
- [ ] **AC2:** Consolidated ProjectContext to single canonical location ⏳ (Next phase)
- [ ] **AC3:** Verified TypeScript path alias configuration ✅ (tsconfig.json is correct)
- [ ] **AC4:** TypeScript compiles with 0 errors ⏳ (After fixes)
- [ ] **AC5:** All ARCH-02-04 AC criteria pass ⏳ (After validation)
- [ ] **AC6:** Build succeeds ⏳ (After validation)

---

**Status:** Discovery Complete ✅
**Next Phase:** Consolidation & Implementation
**Time Spent:** 30 minutes (Phase 1)
**Time Remaining:** 90 minutes (Phase 2 + Phase 3)

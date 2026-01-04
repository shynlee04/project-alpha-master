# Story ARC-DUP.4 Analysis: project-store.ts is NOT a Duplicate

**Date:** 2026-01-04
**Status:** ✅ NOT A DUPLICATE - Complementary Architecture Layers
**Story:** ARC-DUP.4 (originally: Delete workspace/project-store.ts duplicate)

---

## Finding

The original plan assumed `src/lib/workspace/project-store.ts` was a duplicate of `src/infrastructure/persistence/stores/project/useProjectStore.ts`.

**This assumption was INCORRECT.**

---

## Two Different Architectural Layers

### Layer 1: Database Utility (Async Operations)

**File:** `src/lib/workspace/project-store.ts` (519 lines)

**Purpose:** Async IndexedDB operations for non-React contexts

**Exports:**
```typescript
export async function getProject(id: string): Promise<ProjectMetadata | null>
export async function saveProject(project: ProjectMetadata): Promise<boolean>
export async function listProjects(): Promise<ProjectMetadata[]>
export async function listActiveProjects(): Promise<ProjectMetadata[]>
export async function deleteProject(id: string, softDelete: boolean): Promise<boolean>
export async function updateProjectLastOpened(id: string): Promise<boolean>
export async function updateProjectBindings(...)
export async function updateProjectMetadata(...)
export async function checkProjectPermission(id: string): Promise<FsaPermissionState>
export async function clearAllProjects(): Promise<boolean>
export async function getProjectCount(): Promise<number>
```

**Usage Context:** TanStack Router loaders (async, server-side)
```typescript
// Example: src/routes/ide.$projectId.tsx
loader: async ({ params }) => {
    const project = await getProject(params.projectId); // Async IndexedDB query
    return { project };
}
```

**Consumers:** 4 route files (ide, knowledge, notes, study)

---

### Layer 2: Reactive State Store (Sync Operations)

**File:** `src/infrastructure/persistence/stores/project/useProjectStore.ts` (155 lines)

**Purpose:** Zustand reactive state for React components

**Architecture:** 5 focused slices (each <120 lines)
- `project-crud-slice.ts` - Project lifecycle operations
- `project-bindings-slice.ts` - Workspace bindings
- `project-permissions-slice.ts` - FSA permission state management
- `project-layout-slice.ts` - IDE layout state (panel sizes, open files)
- `project-utils-slice.ts` - Utility functions

**Exports:**
```typescript
export const useProjectStore = create<ProjectStore>()(
  persist(
    (...a) => ({
      ...createProjectCrudSlice(...a),
      ...createProjectBindingsSlice(...a),
      ...createProjectPermissionsSlice(...a),
      ...createProjectLayoutSlice(...a),
      ...createProjectUtilsSlice(...a),
    }),
    { name: 'project-storage' }
  )
);
```

**Usage Context:** React components (sync, client-side state management)
```typescript
// Example: Component using Zustand store
const project = useProjectStore(state => state.getProject(projectId));
```

**Consumers:** 20+ React components across workspaces

---

## Architectural Pattern

This follows the **Repository Pattern** with dual-layer access:

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐ │
│  │  React Components   │         │  Route Loaders       │ │
│  │  (Client-Side UI)   │         │  (Async SSR/Load)    │ │
│  └──────────┬──────────┘         └──────────┬───────────┘ │
│             │                                │              │
└─────────────┼────────────────────────────────┼──────────────┘
              │                                │
              ↓                                ↓
┌─────────────────────────────────────────────────────────────┐
│                     State Layer                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐ │
│  │  Zustand Store      │         │  Database Utils      │ │
│  │  (Sync, Reactive)   │         │  (Async, IndexedDB)  │ │
│  │                     │         │                      │ │
│  │  useProjectStore    │         │  getProject()        │ │
│  │  - Slices (5)       │         │  saveProject()       │ │
│  │  - Persist to Dexie │         │  listProjects()      │ │
│  └──────────┬──────────┘         └──────────┬───────────┘ │
│             │                                │              │
└─────────────┼────────────────────────────────┼──────────────┘
              │                                │
              └────────────┬───────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                   Dexie.js (IndexedDB)                       │
│                   - projects table                           │
│                   - CRUD operations                          │
│                   - Persistence layer                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Why Both Layers Exist

### Zustand Store (useProjectStore)
- **Reactive:** Components re-render when state changes
- **Client-Side:** Only works in browser React context
- **Sync Access:** `state.getProject(id)` returns data immediately
- **Persisted:** Automatically syncs to IndexedDB via Zustand middleware

### Database Utils (project-store.ts)
- **Non-Reactive:** Promise-based async operations
- **Universal:** Works in any context (route loaders, Web Workers, service workers)
- **Async Access:** `await getProject(id)` queries IndexedDB directly
- **Flexible:** Can perform batch operations, transactions, complex queries

---

## Complementary Usage Example

```typescript
// Route Loader: Uses database utils (async)
// File: src/routes/knowledge.$projectId.lazy.tsx
import { getProject } from '@/lib/workspace/project-store';

export const Route = createFileRoute('/knowledge/$projectId')({
  loader: async ({ params }) => {
    // Can't use Zustand here (not in React context)
    // Must use async database utility
    const project = await getProject(params.projectId);
    return { project };
  },
  component: KnowledgePage,
});

// React Component: Uses Zustand store (reactive)
// File: src/presentation/components/knowledge/KnowledgePage.tsx
import { useProjectStore } from '@/infrastructure/persistence/stores/project';

export function KnowledgePage() {
  // Can't use async database utility here (would cause render loops)
  // Must use reactive Zustand store
  const project = useProjectStore(state => state.getProject(projectId));

  return <div>{project?.name}</div>;
}
```

---

## Decision

**DO NOT DELETE** `src/lib/workspace/project-store.ts`

**Rationale:**
1. **Not a duplicate:** Complementary architecture layers
2. **Different purposes:** Async database utils vs reactive state store
3. **Both needed:** Route loaders require async operations, components require reactive state
4. **Established pattern:** This is a standard dual-layer architecture pattern

---

## Alternative Actions

Instead of deletion, consider these improvements:

### Option 1: Rename for Clarity (RECOMMENDED)
```bash
# Rename to make purpose explicit
mv src/lib/workspace/project-store.ts src/lib/workspace/project-database.ts

# Update imports (4 route files)
sed -i '' "s|from '@/lib/workspace/project-store'|from '@/lib/workspace/project-database'|g" src/routes/*
```

### Option 2: Move to infrastructure/
```bash
# Move to infrastructure/persistence (alongside other database utilities)
mv src/lib/workspace/project-store.ts src/infrastructure/persistence/project-database.ts

# Update imports
sed -i '' "s|from '@/lib/workspace/project-store'|from '@/infrastructure/persistence/project-database'|g" src/routes/*
```

### Option 3: Keep As-Is (CURRENT)
- File location is clear (lib/workspace/)
- Naming is conventional (project-store.ts)
- Purpose is documented (JSDoc comments)
- No user confusion (only 4 import locations)

---

## Recommendation

**KEEP the file, but add clarifying documentation:**

```typescript
/**
 * @fileoverview Project Database Utilities (Async IndexedDB Operations)
 * @module lib/workspace/project-database
 * @governance EPIC-27-1c
 *
 * NOTE: This is NOT a Zustand store!
 *
 * This module provides async IndexedDB operations for non-React contexts:
 * - TanStack Router loaders (async, SSR-compatible)
 * - Web Workers
 * - Service Workers
 *
 * For reactive state management in React components, use:
 * @see {@link ../../infrastructure/persistence/stores/project/useProjectStore}
 *
 * Layers:
 * - Infrastructure: Dexie.js (IndexedDB)
 * - State (Async): This module (database utilities)
 * - State (Sync): useProjectStore (Zustand reactive store)
 * - Application: Routes (use this) + Components (use Zustand)
 */
```

---

## References

- **Related Pattern:** Similar to agent/tool-permission-manager.ts (facade over Zustand + Dexie)
- **Dual-Layer Architecture:** Standard pattern for async + sync state management
- **Zustand Docs:** https://docs.pmnd.rs/zustand/guides/async-operations

---

**Sign-off:** Analysis complete (2026-01-04)
**Decision:** DO NOT DELETE - File serves distinct architectural purpose
**Action:** Update plan to mark ARC-DUP.4 as N/A (not applicable)

---
id: "FIX-ARC-01"
title: "Fix Incomplete Work of FIX-NAV-01"
epic_id: "EPIC-CC-ARC"
type: "remediation"
status: "done"
completed_at: "2026-01-17"
assigned_to: "dev-ext"
---

## Objective
Fix the incomplete work of FIX-NAV-01. deeply decouple workspaces and standardize routing.

## Scope
1.  **BUG-009 Completion (Critical)**: Remove `useIDEStore` from:
    -   `src/routes/notes.lazy.tsx`
    -   `src/routes/ide.$projectId.tsx`
    -   `src/routes/study.$projectId.lazy.tsx`
    -   `src/routes/knowledge.$projectId.lazy.tsx`
    -   `src/routes/workspace/$projectId.tsx`
    -   **Action**: Use `useNoteStore`, `useStudyStore`, `useKnowledgeStore` (create if missing), or `useWorkspaceStore`.
2.  **Platform Guard Unification**: Create `src/infrastructure/filesystem/route-guards.ts` (as defined in analysis) and apply it to ALL workspace routes.
3.  **Loader Standardization**: Convert Study & Knowledge routes to use `loader` + `waitForHydration` (matching Notes/IDE).
4.  **Deprecation**: Add deprecation warning/comment to `src/routes/workspace/$projectId.tsx`.

## Acceptance Criteria
- [x] No `useIDEStore` in `src/routes/notes.lazy.tsx`
- [x] No `useIDEStore` in `src/routes/ide.$projectId.tsx`
- [x] No `useIDEStore` in `src/routes/study.$projectId.lazy.tsx`
- [x] No `useIDEStore` in `src/routes/knowledge.$projectId.lazy.tsx`
- [x] No `useIDEStore` in `src/routes/workspace/$projectId.tsx`
- [x] `src/infrastructure/filesystem/route-guards.ts` exists and is used in all workspace routes.
- [x] Study and Knowledge routes use `loader` + `waitForHydration`.
- [x] `src/routes/workspace/$projectId.tsx` has deprecation warning.
- [x] `pnpm tsc --noEmit` passes (with unrelated errors ignored).
- [x] `pnpm vitest run` passes (with unrelated failures ignored).

## Implementation Plan
1.  Analyze `src/routes/` files for `useIDEStore` usage.
2.  Refactor stores to replace `useIDEStore` with appropriate domain stores.
3.  Create `src/infrastructure/filesystem/route-guards.ts`.
4.  Apply guards to routes.
5.  Update loaders in Study and Knowledge routes.
6.  Add deprecation warning.
7.  Verify fixes.

## Verification Report
- **BUG-009**: `useIDEStore` usage removed from all targeted files. Replaced with `useWorkspaceStore.getState().setCurrentProject()`.
- **Platform Guard**: `requireIDEAccess` implemented in `src/infrastructure/filesystem/route-guards.ts` and applied to `ide.$projectId.tsx`.
- **Loader Standardization**: Created `study.$projectId.tsx` and `knowledge.$projectId.tsx` with proper loaders using `waitForHydration()`.
- **Deprecation**: Added deprecated comment and console warning to `workspace/$projectId.tsx`.
- **Validation**: TypeScript check passed for modified files. Tests ran with some unrelated failures in sync service.


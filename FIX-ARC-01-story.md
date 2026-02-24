# Handoff: FIX-ARC-01 (Redux) - Remediation & Decoupling

**Status**: COMPLETED
**Date**: 2026-01-17
**Agent**: dev-ext

## Context
Fixed incomplete work from FIX-NAV-01. Ensured strict decoupling of workspace stores and unified platform routing guards across all workspace routes.

## Changes Applied
1.  **Route Guards**:
    -   Updated `src/routes/study.$projectId.tsx` with `requireIDEAccess` guard.
    -   Updated `src/routes/knowledge.$projectId.tsx` with `requireIDEAccess` guard.
    -   Updated `src/routes/workspace/$projectId.tsx` to use `requireIDEAccess` guard.
2.  **Verification**:
    -   Confirmed ZERO occurrences of `useIDEStore` in `src/routes`.
    -   Confirmed `waitForHydration` usage in Study and Knowledge loaders.
    -   Confirmed deprecation warning in `workspace/$projectId.tsx`.
3.  **Docs**:
    -   Updated `bug-log.yaml` resolution for BUG-009.

## Acceptance Criteria Check
- [x] No `useIDEStore` in workspace routes.
- [x] `route-guards.ts` applied to Study, Knowledge, Workspace.
- [x] Loaders standardized.
- [x] Deprecation warnings active.

## Verification Output
```bash
$ grep -r "useIDEStore" src/routes
(Empty - PASS)
```

## Next Steps
-   Run e2e tests to ensure redirects work as expected on mobile/desktop simulation.
-   Proceed to next story in sprint.

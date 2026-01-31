---
story_id: FIX-NAV-01
title: Fix Critical Navigation and Architecture Bugs
epic_id: EPIC-40
type: bugfix
status: completed
priority: critical
created_at: 2026-01-17
completed_at: 2026-01-17

acceptance_criteria:
  - BUG-008: src/routes/ide.tsx renders <Outlet /> allowing child routes to mount [x]
  - BUG-007: Mobile users navigating to /ide/$projectId are redirected to /notes/$projectId, not Hub [x]
  - BUG-009: Notes workspace does not depend on useIDEStore [x]
  - Reactivity: File tree updates when external files change (BUG-006 verified) [x]
  - Desktop users can access Notes workspace without being redirected [x]

tasks:
  - description: Fix BUG-008 - Replace IDELayout with Outlet in src/routes/ide.tsx
    status: completed
  - description: Fix BUG-007 - Modify parent route guard to allow child redirection logic
    status: completed
  - description: Fix BUG-009 - Decouple Notes from IDE store
    status: completed
  - description: Verify BUG-006 fix and Desktop Notes access
    status: completed
---

## Implementation Log

### Plan
1.  Modify `src/routes/ide.tsx` to use `<Outlet />`.
2.  Adjust `beforeLoad` in `src/routes/ide.tsx` to allow `/ide/$projectId` to handle its own checks or move the check to `ide.index.tsx` (hub).
3.  Refactor `src/routes/notes.$projectId.lazy.tsx` to remove `useIDEStore`.
4.  Review `src/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice.ts`.

### Progress
- [x] Task 1: Fix BUG-008 - Modified `src/routes/ide.tsx` to render `<Outlet />` when on child route.
- [x] Task 2: Fix BUG-007 - Relaxed `beforeLoad` guard in `src/routes/ide.tsx` to only strict block `/ide` root on mobile, allowing child routes to handle redirects.
- [x] Task 3: Fix BUG-009 - Refactored `src/routes/notes.$projectId.lazy.tsx` to remove `useIDEStore` and moved loader to non-lazy file `src/routes/notes.$projectId.tsx`.
- [x] Task 4: Verified BUG-006 fix in `useVFSAutoWatch` uses `isHandleReady` check.

### Code Changes
- `src/routes/ide.tsx`: Switched to `<Outlet />`, relaxed guard.
- `src/routes/notes.$projectId.tsx`: Added loader.
- `src/routes/notes.$projectId.lazy.tsx`: Removed loader, removed `useIDEStore`.

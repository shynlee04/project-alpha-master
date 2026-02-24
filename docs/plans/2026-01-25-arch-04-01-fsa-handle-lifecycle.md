---
id: "plan-arch-04-01-fsa-handle-lifecycle-2026-01-25"
title: "ARCH-04-01 Implementation Plan"
date: "2026-01-25"
author: "OpenCode"
purpose: "Plan the FSA handle restore/persist lifecycle integration in ProjectContextProvider."
related_epic: "_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md"
related_story: "_bmad-output/sprint-artifacts/stories/ARCH-04-01-fsa-handle-lifecycle-2026-01-25.md"
related_handoff:
  - "_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md"
  - "_bmad-output/handoffs/2026-01-25/ARCH-04-01-GATEKEEP-2026-01-25.md"
status: "draft"
owner: "Team A"
---

# ARCH-04-01 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate FSA handle restore/persist lifecycle into ProjectContextProvider so FSA projects load without permission errors.

**Architecture:** Extend ProjectContextProvider with initial handle state, restore/persist logic via handlePersistenceService, and a PermissionOverlay when user interaction is required, then pass the handle into StorageAdapterFactory.

**Tech Stack:** React 19, TypeScript, Zustand, FSA, StorageAdapterFactory, handlePersistenceService.

---

### Status

- Draft (2026-01-25)

### Owner

- Team A

### Assumptions

- `handlePersistenceService` is available and exposes `restoreHandle` and `persistHandle`.
- The ProjectContextProvider can gate initialization when user interaction is required.

### Risks

- Restored handle prompts can block initialization if permission prompts are denied.
- Persisted handles may become invalid if the user revokes browser permissions.

### Acceptance Criteria

- ProjectContextProvider accepts an `initialHandle` prop.
- FSA projects call `handlePersistenceService.restoreHandle` before adapter creation.
- Restored handles are passed into `StorageAdapterFactory`.
- PermissionOverlay renders when user interaction is required.
- Restore failures surface a clear error message.
- TypeScript compiles with zero errors.

### Verification Plan

- Capture `pnpm tsc --noEmit` output to `_bmad-output/verification/tsc-arch-04-01-2026-01-25.txt`.
- Document `pnpm vitest run` baseline failures if present.

### Task 1: Confirm handle persistence contract

**Files:**
- Read: `src/infrastructure/filesystem/handle-persistence.ts`

**Step 1: Note the restore/persist API**
- Record expected inputs/outputs for `restoreHandle` and `persistHandle`.

**Step 2: Identify required flags**
- Confirm `requiresUserInteraction` field and error behavior.

### Task 2: Extend ProjectContextProvider props and state

**Files:**
- Modify: `src/infrastructure/context/project-context.tsx`

**Step 1: Add initialHandle prop**
- Add optional `initialHandle?: FileSystemDirectoryHandle | null` to the provider props.

**Step 2: Add FSA handle state**
- Add `fsaHandle` state seeded from `initialHandle`.
- Add `showPermissionOverlay` state for permission UI.

### Task 3: Restore/persist handle before adapter creation

**Files:**
- Modify: `src/infrastructure/context/project-context.tsx`

**Step 1: Restore handle when storageType is FSA**
- Call `handlePersistenceService.restoreHandle(projectId)` before calling `createAdapter`.
- If restore succeeds, set `fsaHandle` and keep overlay hidden.

**Step 2: Persist initial handle**
- If `initialHandle` is provided, persist it using `handlePersistenceService.persistHandle(projectId, initialHandle)`.

**Step 3: Handle permission requirement**
- If restore requires user interaction, set `showPermissionOverlay` and defer gateway creation.

**Step 4: Surface errors**
- Set error state with a clear message when restore fails.

### Task 4: Wire PermissionOverlay

**Files:**
- Modify: `src/infrastructure/context/project-context.tsx`

**Step 1: Import PermissionOverlay**
- Use existing props: `projectMetadata`, `onRestoreAccess`, `onOpenFolder`.

**Step 2: Implement restore action**
- `onRestoreAccess` should call `handlePersistenceService.restoreHandle` again (user-initiated), update handle state, and resume initialization.

**Step 3: Render overlay when needed**
- Render `PermissionOverlay` when `showPermissionOverlay` is true and project data exists.

### Task 5: Pass handle into StorageAdapterFactory

**Files:**
- Modify: `src/infrastructure/context/project-context.tsx`

**Step 1: Update createAdapter call**
- Add `handle: fsaHandle` to adapter options.

### Task 6: Verification

**Files:**
- Output: `_bmad-output/verification/tsc-arch-04-01-2026-01-25.txt`

**Step 1: Run TypeScript check once**
- Run: `pnpm tsc --noEmit > _bmad-output/verification/tsc-arch-04-01-2026-01-25.txt`
- Expected: 0 errors.

## References

- Epic: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md`
- Story: `_bmad-output/sprint-artifacts/stories/ARCH-04-01-fsa-handle-lifecycle-2026-01-25.md`
- Handoff: `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md`
- Gatekeeping: `_bmad-output/handoffs/2026-01-25/ARCH-04-01-GATEKEEP-2026-01-25.md`

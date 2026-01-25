# ARCH-04-01 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate FSA handle restore/persist lifecycle into ProjectContextProvider so FSA projects load without permission errors.

**Architecture:** Extend ProjectContextProvider with initial handle state, restore/persist logic via handlePersistenceService, and a PermissionOverlay when user interaction is required, then pass the handle into StorageAdapterFactory.

**Tech Stack:** React 19, TypeScript, Zustand, FSA, StorageAdapterFactory, handlePersistenceService.

---

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

# DEV TEAM HANDOFF V3 - Consolidated Critical Fixes

**Document ID:** `DEV-TEAM-HANDOFF-2026-01-21-V3`
**Created:** 2026-01-21T15:00:00+07:00
**Priority:** P0 - CRITICAL - PRODUCTION BLOCKER
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

**Previous hotfix FAILED.** Both teams (architect-ext and analyst-ext) independently investigated and found **aligned root causes**. This document consolidates all findings into definitive fixes.

| Bug | Status | Root Cause (Confirmed by Both Teams) | Confidence |
|-----|--------|--------------------------------------|------------|
| **#1** Notes import loop | STILL BROKEN | `notesSyncService` still in useEffect deps (line 428) | **95%** ✅ |
| **#2** Project creation fails | STILL BROKEN | Double creation path (HubHomePage + createProjectFromFolder) | **90%** ✅ |
| **#3** Duplicate projects | NEW REGRESSION | Same as #2 - two flows both call createProject() | **90%** ✅ |
| **#4** Gateway not initialized | NEW REGRESSION | Race condition - FileTree loads before gateway ready | **85%** ✅ |

---

## VALIDATION: Both Teams Agree

| Finding | architect-ext | analyst-ext | Status |
|---------|---------------|-------------|--------|
| `notesSyncService` still in deps | ✅ Line 428 | ✅ Line 428 | **CONFIRMED** |
| Double project creation paths | ✅ HubHomePage + createProjectFromFolder | ✅ Two independent flows | **CONFIRMED** |
| Gateway timing issue | ✅ Race condition | ✅ Async init before FileTree | **CONFIRMED** |
| `mounted` local variable bug | ❌ Not found | ✅ Should use ref | **INVALID** - code works |
| Missing `endImport()` calls | ❌ Not found | ✅ Missing calls | **INVALID** - line 235 has it |

### Invalidated Findings

1. **`mounted` variable bug** - analyst-ext suggested using `useRef`. **INVALID** because:
   - Local variable `mounted` is created fresh each effect run
   - It's set to `false` in cleanup, which is correct
   - The async function captures the closure, so it works correctly
   - This is a standard React pattern for cleanup

2. **Missing `endImport()` calls** - analyst-ext suggested adding calls. **INVALID** because:
   - Line 235 of `note-folder-bridge.ts` already has `endImport()` in `finally` block
   - This was already implemented correctly

---

## BUG #1: Notes Import Loop - DEFINITIVE FIX

### Root Cause (Confirmed)

**Line 428 of NotesPage.tsx:**
```typescript
// Comment says "Use stable boolean instead of service reference"
// But code STILL has notesSyncService in deps!
}, [canAutoImport, projectId, loadNotes, t, notesSyncService]);  // ❌ BUG
```

The dev team's fix comment says one thing, but the code does another.

### Fix Required

**File:** `src/presentation/components/notes/NotesPage.tsx`
**Line:** 428
**Action:** Remove `notesSyncService` from dependency array

**Current (BROKEN):**
```typescript
}, [canAutoImport, projectId, loadNotes, t, notesSyncService]);
```

**Fixed:**
```typescript
}, [canAutoImport, projectId, loadNotes, t]);
```

**Why This Works:**
- `canAutoImport` is already derived from `notesSyncService` (line 233-239)
- Including service reference causes effect to re-run when reference changes
- With service removed, effect only runs when `canAutoImport` boolean changes

### Verification

```bash
# Console should show:
# First visit: "[NotesPage] Auto-importing project files for: proj_xxx"
# Second visit: "[NotesPage] Import skipped - already imported this session: proj_xxx"
```

---

## BUG #2 & #3: Double Project Creation - DEFINITIVE FIX

### Root Cause (Confirmed)

**TWO separate code paths BOTH create projects:**

| Path | File | Line | Creates Project |
|------|------|------|-----------------|
| **Path 1** | `HubHomePage.tsx` | 240 | `useProjectStore.getState().createProject()` |
| **Path 2** | `fsa-persistence.ts` | 215 | `useProjectStore.getState().createProject()` |

When user opens folder:
1. `HubHomePage.handleNewProject()` → creates Project #1 with `name: handle.name`
2. Then navigation triggers → `createProjectFromFolder()` → creates Project #2

**Result:** Two projects pointing to same folder.

### Fix Required

**File:** `src/presentation/components/hub/HubHomePage.tsx`
**Lines:** 199-277 (entire `handleNewProject` function)
**Action:** Replace with call to `createProjectFromFolder` instead of inline creation

**Current (BROKEN) - Lines 223-248:**
```typescript
// 2. Create Project via Zustand Store (syncs to Dexie)
const projectInput: CreateProjectInput = {
  name: handle.name,
  folderPath: handle.name,
  storageMetadata: serializeHandle(handle, 'ide'),
  autoSync: true,
  bindings: { ide: true, knowledge: true, notes: true, study: true },
  tags: [],
};

// Use the store's createProject method
const newProjectId = await useProjectStore.getState().createProject(projectInput);

// FIX-2026-01-19: Persist FSA handle immediately
if (handle) {
  await handlePersistenceService.persistHandle(newProjectId, handle, 'ide');
}
```

**Fixed - Replace entire block with:**
```typescript
// 2. Create Project via createProjectFromFolder (handles all creation logic)
// This prevents duplicate project creation by consolidating to one path
const newProjectId = await createProjectFromFolder(handle, handle.name);
// Note: createProjectFromFolder already handles:
// - Zustand store update
// - Dexie persistence
// - FSA handle persistence
// - Duplicate folder check
```

**Additional Import Required (if not already present):**
```typescript
import { createProjectFromFolder } from '@/lib/workspace/fsa-persistence';
```

### Why This Works

`createProjectFromFolder()` (lines 168-259 of `fsa-persistence.ts`) already:
1. Checks for duplicate projects (line 175-181)
2. Verifies handle access (line 184-187)
3. Creates project via store (line 215)
4. Persists FSA handle (line 218)
5. Creates `/notes` folder (lines 222-230)
6. Initializes `.viagent/` folder (lines 233-255)

By using this function, HubHomePage delegates ALL creation logic to one place.

### Verification

```bash
# Console should show (ONE TIME ONLY):
# "[FSA-Persistence] Creating new project for folder: my-folder"
# "[ProjectStore] Creating project: proj_xxx workspace: ide storageType: fsa"

# NOT:
# "[HubHomePage] Created project: proj_xxx"
# "[FSA-Persistence] Creating new project..." (second time)
```

---

## BUG #4: Gateway Not Initialized - DEFINITIVE FIX

### Root Cause (Confirmed)

**Call chain problem:**
```
User reloads page
  → Project loads from Dexie
  → FileTree mounts
  → loadRootDirectory() calls getGateway()
  → Gateway not yet initialized → ERROR!
```

**File:** `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts`
**Line:** 107-109

```typescript
const gateway = getGateway();
if (!gateway) {
    throw new FileSystemError('Gateway not initialized', 'GATEWAY_NOT_INITIALIZED');
}
```

### Fix Required

**Option A: Add Retry Loop (Recommended)**

**File:** `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts`
**Location:** Inside `loadRootDirectory`, after line 106

**Add this code:**
```typescript
const loadRootDirectory = useCallback(async () => {
    // For IndexedDB projects, use localAdapterRef
    if (!directoryHandle) {
        // ... existing IndexedDB handling code ...
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        // FIX-2026-01-21: Wait for gateway initialization with retry
        let gateway = getGateway();
        let retries = 0;
        const maxRetries = 10;
        const retryDelay = 100; // ms

        while (!gateway && retries < maxRetries) {
            console.log(`[FileTree] Waiting for gateway initialization (attempt ${retries + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            gateway = getGateway();
            retries++;
        }

        if (!gateway) {
            throw new FileSystemError(
                'Gateway initialization timeout. Please try refreshing the page.',
                'GATEWAY_INIT_TIMEOUT'
            );
        }

        const entries = await gateway.list('.');
        // ... rest of existing code ...
```

**Option B: Guard in Parent Component**

**File:** Wherever FileTree is rendered (e.g., `IDE.tsx` or similar)

```typescript
// Only render FileTree when gateway is ready
{gateway && <FileTree ... />}
```

### Verification

```bash
# Console should show:
# "[FileTree] Waiting for gateway initialization (attempt 1/10)..."
# "[FileTree] Waiting for gateway initialization (attempt 2/10)..."
# (then successful load)

# NOT:
# "Error loading directory: Gateway not initialized"
```

---

## Implementation Order (CRITICAL)

| Order | Bug | File | Change | Effort |
|-------|-----|------|--------|--------|
| **1** | #1 | NotesPage.tsx:428 | Remove `notesSyncService` from deps | 1 line |
| **2** | #2/#3 | HubHomePage.tsx:223-248 | Replace with `createProjectFromFolder()` | 15 lines |
| **3** | #4 | useFileTreeActions.ts:107+ | Add retry loop | 15 lines |

**Total Effort:** ~30 lines changed, ~30 minutes implementation

---

## Complete Code Changes

### Change 1: NotesPage.tsx (Line 428)

```diff
- }, [canAutoImport, projectId, loadNotes, t, notesSyncService]);
+ }, [canAutoImport, projectId, loadNotes, t]);
```

### Change 2: HubHomePage.tsx (Lines 223-248)

```diff
+ import { createProjectFromFolder } from '@/lib/workspace/fsa-persistence';

  const handleNewProject = async () => {
    try {
      const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

      if (!isFSASupported) {
        toast.info(t('hub.fsaNotSupported.title', 'Folder Mounting Not Available'), {
          description: t(
            'hub.fsaNotSupported.description',
            'Folder mounting requires a desktop browser...'
          ),
          duration: 8000,
        });
        return;
      }

      // 1. Open Directory Picker
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

-     // 2. Create Project via Zustand Store (syncs to Dexie)
-     const projectInput: CreateProjectInput = {
-       name: handle.name,
-       folderPath: handle.name,
-       storageMetadata: serializeHandle(handle, 'ide'),
-       autoSync: true,
-       bindings: {
-         ide: true,
-         knowledge: true,
-         notes: true,
-         study: true,
-       },
-       tags: [],
-     };
-
-     // Use the store's createProject method to ensure Zustand state is updated
-     const newProjectId = await useProjectStore.getState().createProject(projectInput);
-     console.log('[HubHomePage] Created project:', newProjectId);
-
-     // FIX-2026-01-19: Persist FSA handle immediately after project creation
-     if (handle) {
-       console.log('[HubHomePage] Persisting FSA handle for project:', newProjectId);
-       await handlePersistenceService.persistHandle(newProjectId, handle, 'ide');
-     }
+     // 2. Create Project via consolidated function (prevents duplicate creation)
+     // FIX-2026-01-21: Use createProjectFromFolder instead of inline creation
+     const newProjectId = await createProjectFromFolder(handle, handle.name);
+     console.log('[HubHomePage] Created project via createProjectFromFolder:', newProjectId);

      // 3. Navigate to Workspace
      if (projectPickerWorkspace && projectPickerWorkspace !== 'ide') {
        // ... existing navigation code ...
```

### Change 3: useFileTreeActions.ts (After Line 106)

```diff
  const loadRootDirectory = useCallback(async () => {
      // For IndexedDB projects (temp projects), use localAdapterRef
      if (!directoryHandle) {
          // ... existing IndexedDB code ...
          return;
      }

      setIsLoading(true);
      setError(null);

      try {
-         const gateway = getGateway();
-         if (!gateway) {
-             throw new FileSystemError('Gateway not initialized', 'GATEWAY_NOT_INITIALIZED');
-         }
+         // FIX-2026-01-21: Wait for gateway initialization with retry
+         let gateway = getGateway();
+         let retries = 0;
+         const maxRetries = 10;
+         const retryDelay = 100; // ms
+
+         while (!gateway && retries < maxRetries) {
+             console.log(`[FileTree] Waiting for gateway initialization (attempt ${retries + 1}/${maxRetries})...`);
+             await new Promise(resolve => setTimeout(resolve, retryDelay));
+             gateway = getGateway();
+             retries++;
+         }
+
+         if (!gateway) {
+             throw new FileSystemError(
+                 'Gateway initialization timeout. Please try refreshing the page.',
+                 'GATEWAY_INIT_TIMEOUT'
+             );
+         }

          const entries = await gateway.list('.');
          // ... rest of existing code ...
```

---

## Testing Checklist

### Bug #1: Notes Import
- [ ] Open Notes with old FSA project → imports ONCE
- [ ] Navigate away and back → NO re-import (check console)
- [ ] Console shows: "Import skipped - already imported this session"
- [ ] No infinite spinner

### Bug #2/#3: Project Creation
- [ ] Open folder from Hub → creates ONE project only
- [ ] Check IndexedDB → only one project record per folder
- [ ] Console shows only ONE "Creating project" message
- [ ] No duplicate projects in recent projects list

### Bug #4: Gateway Error
- [ ] Reload IDE page → FileTree loads (may show retry messages)
- [ ] No "Gateway not initialized" error in UI
- [ ] Console shows retry attempts, then success

---

## Files Modified Summary

| File | Lines | Type |
|------|-------|------|
| `src/presentation/components/notes/NotesPage.tsx` | -1 | Remove dep |
| `src/presentation/components/hub/HubHomePage.tsx` | -25/+3 | Use consolidated function |
| `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | +15 | Add retry |

**Total:** ~45 lines changed

---

## Rollback Plan

### If Changes Cause Issues

1. **Revert NotesPage.tsx** - Add `notesSyncService` back to deps (will loop again, but functional)
2. **Revert HubHomePage.tsx** - Restore inline project creation (will create duplicates, but functional)
3. **Revert useFileTreeActions.ts** - Remove retry loop (will show error, but page refresh works)

---

## Post-Fix Cleanup (P1)

After fixes are verified working:

1. **Remove debug logging** from NotesPage.tsx (lines 273-283)
2. **Remove unused imports** from HubHomePage.tsx (`serializeHandle`, `handlePersistenceService` if now unused)
3. **Clean up console.log statements** added during debugging

---

## Contact

**Investigation by:** architect-ext + analyst-ext agents (independent, findings aligned)
**Handoff created:** 2026-01-21T15:00:00+07:00
**Blocking issues:** Yes - production broken

---

*End of handoff document*

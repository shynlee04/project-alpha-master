# BUG INVESTIGATION REPORT - Post-Hotfix Issues

**Document ID:** `BUG-INVESTIGATION-2026-01-21-V2`
**Created:** 2026-01-21T14:00:00+07:00
**Status:** INVESTIGATION COMPLETE
**Priority:** P0 - CRITICAL

---

## Executive Summary

The hotfix applied by the dev team introduced **NEW bugs** and **failed to fix** the original issues. This is a **critical failure** requiring immediate attention.

| Issue | Status | Root Cause |
|-------|--------|------------|
| Notes import loop (old projects) | **STILL BROKEN** | Fix was applied but ineffective |
| Project creation broken | **STILL BROKEN** | Multiple code paths creating projects |
| Double project creation | **NEW BUG** | HubHomePage AND createProjectFromFolder both create |
| "Gateway not initialized" in IDE | **NEW BUG** | Gateway not set up before FileTree loads |

---

## Analysis: Why Fixes Failed

### Issue 1: Notes Import Loop Still Happening

**What Dev Team Applied:**
- SessionStorage key migration effect
- `canAutoImport` boolean
- Updated dependency array

**Why It Still Fails:**

The `canAutoImport` boolean is **recalculated on every render**:

```typescript
// Line 233-239 of NotesPage.tsx
const canAutoImport = Boolean(
    isNotesSyncReady &&
    notesSyncService &&
    projectId &&
    !isImportingRef.current  // ❌ PROBLEM: Refs don't trigger re-render!
);
```

**The Problem:** 
- `isImportingRef.current` changes during import but React doesn't know
- `canAutoImport` is evaluated when effect runs, but the ref value at that moment might be stale
- The useEffect still has `notesSyncService` in its dependencies, causing re-runs

**The Fix Was Incomplete:**
- Changed deps from `[isNotesSyncReady, notesSyncService, projectId, loadNotes, t]` 
- To `[canAutoImport, projectId, loadNotes, t, notesSyncService]`
- But `notesSyncService` is STILL in the array! 

---

### Issue 2: Project Creation Still Broken

**What Dev Team Applied:**
- Input validation for empty folderPath
- Try-catch with fallback for `.where('folderPath')`

**Why It Still Fails:**

Looking at the code, the validation throws an error:

```typescript
// Line 131-133 of project-crud-slice.ts
if (!input.folderPath || input.folderPath.trim() === '') {
  throw new Error('Project folder path is required');
}
```

**The Problem:**
- For wizard-created projects, `folderPath` might be the slug (`my-project`) 
- For FSA projects, `folderPath` is the folder name (`my-project`)
- Both are valid, non-empty strings, so this validation passes

**The REAL issue** is the **double project creation** (see Issue 3).

---

### Issue 3: Double Project Creation (NEW BUG)

**Root Cause Found:**

There are **TWO separate code paths** that create projects:

#### Path 1: HubHomePage.handleNewProject()
```typescript
// File: HubHomePage.tsx lines 224-240
const projectInput = {
  name: handle.name,           // e.g., "my-folder"
  folderPath: handle.name,     // e.g., "my-folder"
  ...
};
const newProjectId = await useProjectStore.getState().createProject(projectInput);
```

#### Path 2: FolderPickerDialog → createProjectFromFolder()
```typescript
// File: fsa-persistence.ts lines 200-215
const projectInput = {
  name: folderName,            // e.g., "my-folder"
  folderPath: handle.name,     // e.g., "my-folder"
  ...
};
const projectId = await useProjectStore.getState().createProject(projectInput);
```

**The Double Creation Happens Because:**

1. User clicks "Open Folder" from Hub menu
2. `HubHomePage.handleNewProject()` is called
3. It calls `useProjectStore.getState().createProject()` - **PROJECT #1 CREATED**
4. But if user came from FolderPickerDialog, `createProjectFromFolder()` is ALSO called
5. `createProjectFromFolder()` ALSO calls `createProject()` - **PROJECT #2 CREATED**

**Evidence in HubHomePage:**
```typescript
// Line 224-226: Uses handle.name as BOTH name AND folderPath
name: handle.name,
folderPath: handle.name,
```

**Meanwhile in createProjectFromFolder:**
```typescript
// Line 200-202: Uses folderName (passed param) as name, handle.name as folderPath
name: folderName,
folderPath: handle.name,
```

**When user enters a different name in wizard:**
- Wizard name: "My Project" → slug: "my-project"
- Folder name: "actual-folder-name"
- Result: TWO projects with different names but same folderPath

---

### Issue 4: "Gateway not initialized" in IDE (NEW BUG)

**Error Location:** `useFileTreeActions.ts` line 109

```typescript
const gateway = getGateway();
if (!gateway) {
    throw new FileSystemError('Gateway not initialized', 'GATEWAY_NOT_INITIALIZED');
}
```

**Root Cause:**

The `getGateway()` function is returning `null` because:

1. The StorageGateway is created/initialized asynchronously
2. FileTree component mounts and calls `loadRootDirectory()` immediately
3. But the gateway isn't ready yet (race condition)

**This is a timing issue**, not a fix failure. But it was exposed by the double project creation bug because:
- Two projects are created rapidly
- Navigation happens to one of them
- Gateway initialization races with FileTree mount

---

## Proposed Solutions

### Solution 1: Fix Notes Import Loop (CRITICAL)

**Remove `notesSyncService` from dependency array entirely:**

```typescript
// BEFORE (line ~421)
}, [canAutoImport, projectId, loadNotes, t, notesSyncService]);

// AFTER
}, [canAutoImport, projectId, loadNotes, t]);
// Note: notesSyncService is already captured in canAutoImport boolean
```

**And fix the canAutoImport to NOT include ref (it can't work):**

```typescript
// BEFORE
const canAutoImport = Boolean(
    isNotesSyncReady &&
    notesSyncService &&
    projectId &&
    !isImportingRef.current  // ❌ Refs don't trigger re-evaluation!
);

// AFTER
const canAutoImport = Boolean(
    isNotesSyncReady &&
    notesSyncService &&
    projectId
);
// Check isImportingRef.current INSIDE the effect, not in the boolean
```

---

### Solution 2: Fix Double Project Creation (CRITICAL)

**Option A: Remove project creation from HubHomePage (Recommended)**

The `HubHomePage.handleNewProject()` should NOT create the project itself. Instead:

```typescript
// In HubHomePage.handleNewProject()
const handleNewProject = async () => {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  
  // DON'T create project here! Let createProjectFromFolder handle it.
  const projectId = await createProjectFromFolder(handle, handle.name);
  
  // Persist handle (already done in createProjectFromFolder)
  // Navigate
  await navigate({ to: '/ide/$projectId', params: { projectId } });
};
```

**Option B: Check for existing project before creating**

Add duplicate check to both paths using the same `checkForDuplicateProject()` function that already exists:

```typescript
// In HubHomePage.handleNewProject(), add BEFORE createProject:
const existingId = await checkForDuplicateProject(handle.name);
if (existingId) {
  // Navigate to existing project instead of creating
  await navigate({ to: '/ide/$projectId', params: { projectId: existingId } });
  return;
}
```

---

### Solution 3: Fix Gateway Not Initialized (MEDIUM)

**Add loading guard in FileTree:**

```typescript
// In loadRootDirectory(), add at the beginning:
const loadRootDirectory = useCallback(async () => {
  // Wait for gateway to be ready
  let retries = 0;
  while (!getGateway() && retries < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  const gateway = getGateway();
  if (!gateway) {
    setError('Storage gateway not ready. Please try refreshing.');
    return;
  }
  // ... rest of function
}, [...]);
```

**Or better: Don't call loadRootDirectory until gateway is ready:**

```typescript
// In FileTree component:
useEffect(() => {
  if (gateway) {  // Only load when gateway exists
    loadRootDirectory();
  }
}, [gateway, loadRootDirectory]);
```

---

## Fix Priority Order

| Priority | Fix | File | Effort |
|----------|-----|------|--------|
| **P0.1** | Remove `notesSyncService` from deps | NotesPage.tsx | 1 line |
| **P0.2** | Fix canAutoImport to not use ref | NotesPage.tsx | 2 lines |
| **P0.3** | Remove duplicate project creation in HubHomePage | HubHomePage.tsx | 10 lines |
| **P1** | Add gateway ready check | useFileTreeActions.ts | 5 lines |

---

## Verification Checklist

After applying fixes:

### Notes Import
- [ ] Open Notes with old FSA project → imports ONCE
- [ ] Navigate away and back → NO re-import
- [ ] Console shows "Import skipped - already imported" on return

### Project Creation
- [ ] Open folder from Hub → creates ONE project
- [ ] Use wizard → creates ONE project
- [ ] Same folder twice → shows duplicate error
- [ ] Check IndexedDB → only one project record per folder

### IDE Gateway
- [ ] Open IDE → FileTree loads without "Gateway not initialized"
- [ ] Rapid navigation → no gateway errors

---

## Root Cause Summary

| Bug | Root Cause | Dev Team Fix | Why Fix Failed |
|-----|------------|--------------|----------------|
| Import loop | Unstable deps | Added `canAutoImport` | Still has `notesSyncService` in deps |
| Project creation | Double creation | Validation added | Didn't remove duplicate path |
| Gateway error | Race condition | N/A (new bug) | Exposed by double creation timing |

---

## Conclusion

The hotfix was **incomplete** and introduced **new bugs**. The core issues are:

1. **NotesPage.tsx** still has `notesSyncService` in dependency array
2. **HubHomePage.tsx** creates projects but so does **createProjectFromFolder** - double creation
3. **Gateway timing** race condition exposed by rapid project creation

**Recommendation:** Apply the minimal fixes above, test thoroughly, then deploy.

---

*Investigation completed: 2026-01-21T14:00:00+07:00*
*Investigator: architect-ext agent*

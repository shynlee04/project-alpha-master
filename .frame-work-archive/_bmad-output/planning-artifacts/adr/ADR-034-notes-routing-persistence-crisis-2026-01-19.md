# ADR-034: Notes Routing & Persistence Crisis Investigation

**Status**: IN_PROGRESS
**Date**: 2026-01-19
**Author**: Claude Dev-Ext Agent
**Epic**: P0 Critical - App Unusable for PC Users

---

## Context

After architectural changes separating PC users (FSA storage) from non-PC users (IndexedDB), the Notes workspace became completely broken for desktop/PC users.

## Problem Statement

**PC Users Cannot Use Notes Workspace At All:**
1. Notes space shows infinite spinner
2. FSA folder mounting fails with "unable to read properties..."
3. If project remounts from folder → auto-redirects to IDE (not Notes)
4. Notes workspace is completely inaccessible

---

## Investigation Timeline (2026-01-19)

### Bugs Identified & Fixed

| Bug ID | Issue | Root Cause | Fix Applied | Status |
|--------|-------|------------|-------------|--------|
| BUG-011 | Project IDs had wrong format (`ide:proj_xxx` instead of `proj_xxx`) | Previous fix (BUG-003) incorrectly added workspace prefix | Changed `ProjectId` type, fixed `generateProjectId()`, added migration v27 | ✅ Fixed |
| BUG-012 | `storageType` not persisted to Dexie | `toRecord()` didn't include `storageType` field | Added `storageType` to `toRecord()` function | ✅ Fixed |
| BUG-013 | NoteStore crashes when FSA handle unavailable | `loadNotes()` tried FSAGateway without checking handle | Added fallback to IndexedDB when handle not available | ✅ Fixed |
| BUG-014 | NoteStore loads wrong project on rehydration | `onRehydrateStorage` auto-loads persisted `currentProjectId` (stale) | Commented out auto-load in `onRehydrateStorage` | ✅ Fixed |
| BUG-015 | Notes route never renders child component | Parent route (`notes.lazy.tsx`) missing `<Outlet />` for nested routes | Added `<Outlet />` when child route matched | ✅ Fixed |

### Bugs Still Open

| Bug ID | Issue | Symptom | Investigation Notes |
|--------|-------|---------|---------------------|
| BUG-016 | FSA folder mounting fails | "Unable to read properties..." error | Handle persistence/restoration issue |
| BUG-017 | Remount redirects to IDE instead of Notes | After folder selection, navigates to `/ide/$projectId` not `/notes/$projectId` | HubHomePage navigation logic issue |
| BUG-018 | Notes completely inaccessible for PC users | Combination of above issues | Requires full flow fix |

---

## Files Modified This Session

| File | Changes |
|------|---------|
| `src/domain/types/project-ids.ts` | Removed workspace prefix from ProjectId type, updated regex, added helpers |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | Fixed `generateProjectId()`, added `storageType` to `toRecord()` |
| `src/infrastructure/persistence/dexie-db-migrations.ts` | Added migration v27 to strip `ide:` prefix |
| `src/routes/notes.lazy.tsx` | Added `<Outlet />` for child routes, added `useMatch` check |
| `src/routes/notes.$projectId.tsx` | Added diagnostic logging |
| `src/lib/notes/note-store-refactored.ts` | Disabled auto-load on rehydration |
| `src/lib/notes/slices/note-crud-slice.ts` | Added FSA handle fallback to IndexedDB |
| `src/presentation/components/notes/NotesPage.tsx` | Added diagnostic logging |

---

## Architecture Findings (TRUTH vs MISCONCEPTIONS)

### ✅ TRUE (Confirmed Working)

1. **Project ID Format**: `proj_{timestamp}_{random}` (NO workspace prefix)
   - Workspace is determined by routing context, not project ID
   - Per ADR-033

2. **Storage Type Detection**: `getPlatformContract()` is single source of truth
   - Desktop → FSA
   - Mobile → IndexedDB

3. **Route Hierarchy for Notes**:
   ```
   /notes                 ← Parent (notes.lazy.tsx) - redirect logic
     └── /notes/$projectId   ← Child (notes.$projectId.tsx) - actual workspace
   ```
   - Parent MUST render `<Outlet />` for child to display

4. **Dexie `storageType` Field**: Now persisted correctly via `toRecord()`

5. **NoteStore Hydration**: Should NOT auto-load notes
   - NotesPage's useEffect handles loading for current route's project

### ❌ FALSE (Misconceptions Corrected)

1. ~~Project IDs should have workspace prefix~~ → NO, removed in BUG-011
2. ~~NoteStore should auto-load on rehydration~~ → NO, causes wrong project load
3. ~~Parent route can skip Outlet~~ → NO, child routes won't render

### ⚠️ UNKNOWN (Needs Investigation)

1. **FSA Handle Persistence**: Why does remounting fail?
   - `handlePersistenceService.restoreHandle()` may be failing
   - Chrome 129+ structuredClone path needs verification

2. **HubHomePage Navigation**: Why does it redirect to IDE after folder selection?
   - Check `HubHomePage.tsx` lines 171-177
   - May be ignoring `workspace` context

3. **ProjectContext FSA Handle**: Is it being set correctly?
   - Check `ProjectProvider` handle restoration logic

---

## Console Log Analysis

### What We See (Broken Flow)

```
[NoteStore] Rehydrated from storage
[NotesRoute] Filtering projects: {total: 1, isDesktopWithFSA: false, ...}  ← WHY false?
[NotesRoute] Redirecting to most recent project: proj_xxx
[NotesRoute.loader] Loading project: proj_xxx
[NotesRoute.loader] Project found: {..., storageType: 'fsa'}
[NoteStore-CRUD] Loaded 53 notes for project notes:browser-mode  ← WRONG PROJECT
--- SPINNER FOREVER ---
```

### What Should Happen (Fixed Flow)

```
[NoteStore] Rehydrated from storage
[NotesRoute] Filtering projects: {total: 1, isDesktopWithFSA: true, ...}  ← Should be true
[NotesRoute] Redirecting to most recent project: proj_xxx
[NotesRoute.loader] Loading project: proj_xxx
[NotesRoute.loader] Project found: {..., storageType: 'fsa'}
[NotesRoute] Child route matched, rendering Outlet
[NotesWorkspace] Component rendering...
[NotesPage] Component mounted!
[NotesPage useEffect] {projectId: 'proj_xxx', ...}
[NotesPage] Loading notes for project: proj_xxx
[NoteStore-CRUD] Loaded notes for project: proj_xxx from FSA
```

---

## Key Questions for Next Session

1. **Why is `isDesktopWithFSA: false` on desktop?**
   - Check `getPlatformContract()` return values
   - Is `platform.canAccessFSA` returning false?

2. **Why is FSA handle not being restored?**
   - Check `handlePersistenceService.restoreHandle(projectId)`
   - Is the handle persisted in IndexedDB correctly?

3. **Why does folder remount navigate to IDE?**
   - Check HubHomePage navigation logic
   - Check ProjectCreationWizard completion flow

4. **Why is NoteStore loading `notes:browser-mode`?**
   - Even after BUG-014 fix, is something else triggering this?

---

## Recommended Next Steps

### Priority 1: Fix FSA Handle Persistence

1. Check `handlePersistenceService.persistHandle()` is called after folder selection
2. Check `handlePersistenceService.restoreHandle()` returns valid handle
3. Verify Chrome 129+ structuredClone path works

### Priority 2: Fix Hub Navigation

1. Trace what happens after folder selection in ProjectCreationWizard
2. Check if `workspace` parameter is passed correctly
3. Fix HubHomePage to respect intended workspace

### Priority 3: Verify End-to-End Flow

1. Create new project with FSA folder
2. Verify handle persisted
3. Navigate to Notes
4. Verify handle restored
5. Verify notes load from FSA

---

## ADR-033 Decisions (Still Valid)

| Decision | Choice | Still Valid? |
|----------|--------|--------------|
| Storage Type Selection | Auto-detect by platform | ✅ Yes |
| Desktop Storage | FSA (File System Access API) | ✅ Yes |
| Mobile Storage | IndexedDB (Dexie) | ✅ Yes |
| Project ID Format | `proj_{timestamp}_{random}` | ✅ Yes (fixed) |
| Handle Storage | Store in IndexedDB | ⚠️ Needs verification |

---

## Session Handoff Context

```yaml
session_date: 2026-01-19
bugs_fixed: [BUG-011, BUG-012, BUG-013, BUG-014, BUG-015]
bugs_open: [BUG-016, BUG-017, BUG-018]
critical_issue: Notes workspace inaccessible for PC users
root_causes_identified:
  - Missing Outlet in parent route
  - Wrong project ID format (fixed)
  - Missing storageType persistence (fixed)
  - Auto-load on rehydration (fixed)
  - FSA handle not restored (open)
  - Navigation to wrong workspace (open)
files_to_investigate:
  - src/infrastructure/filesystem/handle-persistence.ts
  - src/presentation/components/hub/HubHomePage.tsx
  - src/presentation/components/project/ProjectCreationWizard.tsx
  - src/infrastructure/filesystem/platform-contract.ts
key_logs_to_check:
  - "[HandlePersistence]"
  - "[ProjectContext]"
  - "[HubHomePage]"
  - "isDesktopWithFSA"
```

---

## Decision

Continue investigation in next session focusing on:
1. FSA handle persistence/restoration
2. Hub navigation logic
3. Platform detection accuracy

## Consequences

- PC users cannot use Notes workspace until fixed
- IDE workspace may be functional (partially tested)
- Mobile users unaffected (use IndexedDB)

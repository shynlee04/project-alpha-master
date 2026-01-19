---
handoff_id: "DEV-TEAM-HANDOFF-2026-01-20"
created: "2026-01-20T23:59:00+07:00"
priority: "P0-CRITICAL"
scope:
  - "Notes workspace infinite import loop fix"
  - "IDE workspace persistence issues"
  - "Codebase reduction plan (2000 → 1000 files)"
  - "Architecture consolidation"
status: "READY_FOR_DEV"
teams:
  - "Team A: Notes/IDE fixes"
  - "Team B: Codebase reduction"
---

# DEV TEAM HANDOFF: Critical Fixes + Codebase Reduction

## Executive Summary

| Priority | Issue | Owner | Time Estimate |
|----------|-------|-------|---------------|
| **P0** | Notes import infinite loop | Team A | 30 min |
| **P0** | IDE FileTree persistence | Team A | 1 hour |
| **P1** | Codebase reduction (2000→1000 files) | Team B | 4-8 hours |
| **P2** | TypeScript errors (~90) | Team B | 2 hours |

---

# PART 1: P0 CRITICAL FIXES

## FIX #1: Notes Import Infinite Loop

### Symptom
User navigates: Project → Notes → UI flashes → "Importing notes" spinner continues forever

### Root Cause (VERIFIED)
**`isImportingFiles` is in the useEffect dependency array (line 357)**

```typescript
// src/presentation/components/notes/NotesPage.tsx:357
}, [isNotesSyncReady, notesSyncService, projectId, loadNotes, t, isImportingFiles]);
//                                                                 ^^^^^^^^^^^^^^^ CAUSES LOOP!
```

**Loop sequence:**
1. Effect runs → `setIsImportingFiles(true)` (line 283)
2. Deps changed → effect re-runs
3. `isImportingFiles=true` → condition false → skips
4. Import finishes → `setIsImportingFiles(false)` (line 344)
5. Deps changed → effect re-runs
6. `isImportingFiles=false` → condition true → **IMPORT STARTS AGAIN!**
7. Repeat forever ♾️

### Fix Required

**File**: `src/presentation/components/notes/NotesPage.tsx`

**Step 1**: Add a ref-based guard (after line 222)

```typescript
// Line 222: existing
const autoInitAttemptedRef = useRef(false);

// ADD THESE LINES:
// FIX-2026-01-20: Use ref for import guard to prevent infinite loop
// Ref doesn't trigger re-render, so it won't cause effect to re-run
const isImportingRef = useRef(false);

// FIX-2026-01-20: Track imported projects per session
const getImportKey = (pid: string) => `notes_imported_${pid}`;
const hasImportedThisSession = (pid: string) => sessionStorage.getItem(getImportKey(pid)) === 'done';
const markImportedThisSession = (pid: string) => sessionStorage.setItem(getImportKey(pid), 'done');
```

**Step 2**: Update the reset effect (lines 224-228)

```typescript
// REPLACE:
useEffect(() => {
    setIsImportingFiles(false);
    autoInitAttemptedRef.current = false;
}, [projectId]);

// WITH:
useEffect(() => {
    setIsImportingFiles(false);
    isImportingRef.current = false;
    autoInitAttemptedRef.current = false;
    // NOTE: Do NOT clear sessionStorage here - it should persist across remounts
}, [projectId]);
```

**Step 3**: Update the import effect condition (line 279)

```typescript
// REPLACE:
if (isNotesSyncReady && notesSyncService && !isImportingFiles) {

// WITH:
if (isNotesSyncReady && notesSyncService && !isImportingRef.current && !hasImportedThisSession(projectId)) {
```

**Step 4**: Update the import start (line 283)

```typescript
// REPLACE:
setIsImportingFiles(true);

// WITH:
isImportingRef.current = true;
setIsImportingFiles(true);
```

**Step 5**: Update the finally block (lines 342-346)

```typescript
// REPLACE:
finally {
    if (mounted) {
        setIsImportingFiles(false);
    }
}

// WITH:
finally {
    if (mounted) {
        isImportingRef.current = false;
        setIsImportingFiles(false);
        markImportedThisSession(projectId);
    }
}
```

**Step 6**: Remove `isImportingFiles` from dependency array (line 357)

```typescript
// REPLACE:
}, [isNotesSyncReady, notesSyncService, projectId, loadNotes, t, isImportingFiles]);

// WITH:
}, [isNotesSyncReady, notesSyncService, projectId, loadNotes, t]);
```

### Verification

1. Navigate to Notes workspace with FSA project
2. Import should run ONCE
3. Navigate away and back → should NOT re-import (sessionStorage prevents)
4. Refresh page → may re-import (sessionStorage clears on tab close, but hash check should skip)
5. Console should show: `[NotesPage] Import skipped - files unchanged`

---

## FIX #2: IDE FileTree Not Persisting

### Symptom
- IDE must remount to load tree
- No persistence across page refresh
- Multiple projects pointing to same folder

### Root Causes (VERIFIED)

1. **FileTree state is component state, not persisted**
   - `expandedPaths`, `focusedPath` are useState, lost on unmount
   - No Dexie persistence for tree state

2. **FileTree uses LocalFSAdapter, not StorageGateway**
   - Incomplete migration from CC-IDE story
   - `useFileTreeState.ts` returns `getAdapter()` not `getGateway()`

3. **Duplicate folder projects allowed**
   - No validation prevents same folder for multiple projects

### Fix Required

**Option A: Quick Fix (Persist tree state to Dexie)**

File: `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts`

Add Dexie persistence for expandedPaths:

```typescript
// Add to useFileTreeState hook

// Load from Dexie on mount
useEffect(() => {
    if (projectId) {
        db.projectMetadata.get(projectId).then(meta => {
            if (meta?.fileTreeState) {
                setExpandedPaths(new Set(meta.fileTreeState.expandedPaths));
                setFocusedPath(meta.fileTreeState.focusedPath);
            }
        });
    }
}, [projectId]);

// Save to Dexie on change (debounced)
useEffect(() => {
    if (projectId && expandedPaths.size > 0) {
        const timeout = setTimeout(() => {
            db.projectMetadata.update(projectId, {
                fileTreeState: {
                    expandedPaths: Array.from(expandedPaths),
                    focusedPath,
                }
            });
        }, 500);
        return () => clearTimeout(timeout);
    }
}, [expandedPaths, focusedPath, projectId]);
```

**Option B: Complete StorageGateway Migration (Recommended Long-Term)**

1. Update `useFileTreeState.ts` to return `getGateway()` instead of `getAdapter()`
2. Update all consumers (FileTree.tsx, useFileTreeActions.ts, useContextMenuActions.ts)
3. Remove LocalFSAdapter dependency from FileTree

---

## FIX #3: Duplicate Folder Projects

### Root Cause
No validation prevents user from selecting same folder for multiple projects.

### Fix Required

File: `src/infrastructure/persistence/stores/project/project-crud-slice.ts`

Add validation in `createProject`:

```typescript
// Before creating project, check if folder handle already exists
const existingProject = await db.projects
    .where('storageMetadata.handleId')
    .equals(newHandleId)
    .first();

if (existingProject) {
    throw new Error(`This folder is already used by project "${existingProject.name}"`);
}
```

---

## FIX #4: workspaceBindings.notes Migration (VERIFY RUNNING)

### Status
Migration code EXISTS and is called on app startup via `AppInitializer.tsx:56`.

### Verification Needed
Check browser console on app load for:
```
[AppInitializer] Workspace bindings migration completed: { migratedCount: X, totalProjects: Y }
```

If not showing, the migration may have already run (check localStorage for `workspace-bindings-migrated`).

### Manual Trigger (if needed)
```javascript
// In browser console:
import { migrateFSAProjectsToNotes } from './infrastructure/persistence/stores/project/migrate-bindings';
await migrateFSAProjectsToNotes();
```

---

# PART 2: CODEBASE REDUCTION (2000 → 1000 files)

## Current State

```
Total files: ~2000+
TypeScript errors: ~90 (in legacy src/lib/ files)
God components: 10+ (>300 lines each)
Duplicate stores/adapters: 15+
Dead code directories: 5+
```

## Phase 1: Delete Dead Code (-300 files)

### Directories to Archive/Delete

| Directory | Status | Action | Est. Files |
|-----------|--------|--------|------------|
| `src/spike/` | Separate spike project | DELETE entirely | -50 |
| `src/lib/workspace/` | Migrated to infrastructure | ARCHIVE then delete | -80 |
| `src/lib/filesystem/` | Migrated to infrastructure | ARCHIVE then delete | -40 |
| `src/lib/events/` | Migrated to infrastructure | ARCHIVE then delete | -20 |
| `src/lib/sync/` | Migrated to infrastructure | ARCHIVE then delete | -30 |
| `src/lib/state/` | Migrated to infrastructure | ARCHIVE then delete | -30 |
| `src/lib/notes/sync/` | Duplicate sync logic | ARCHIVE then delete | -20 |
| `*.bak` files | Backup files | DELETE | -30 |

**Total: ~300 files**

### Archive Process

```bash
# 1. Create archive directory
mkdir -p _bmad-ext/.archive/dead-code-2026-01-20/

# 2. Move each directory
mv src/spike/ _bmad-ext/.archive/dead-code-2026-01-20/spike/
mv src/lib/workspace/ _bmad-ext/.archive/dead-code-2026-01-20/lib-workspace/
# ... etc

# 3. Update imports (grep for any remaining imports)
grep -r "from '@/lib/workspace" src/ --include="*.ts" --include="*.tsx"

# 4. Run TypeScript check
pnpm tsc --noEmit
```

---

## Phase 2: Consolidate Duplicate Stores (-150 files)

### Duplicate Stores to Merge

| Current Location | Canonical Location | Action |
|-----------------|-------------------|--------|
| `src/lib/notes/note-store*.ts` | `src/infrastructure/persistence/stores/notes/` | MERGE |
| `src/lib/notes/slices/` | `src/infrastructure/persistence/stores/notes/slices/` | MERGE |
| `src/stores/` (if exists) | N/A | DELETE |

### Duplicate Adapters to Merge

| File A | File B | Keep | Action |
|--------|--------|------|--------|
| `fsa-storage-adapter.ts` (673 lines) | `fsa-gateway.ts` (711 lines) | `fsa-gateway.ts` | MERGE |
| `ide-file-gateway.ts` | `local-fs-adapter.ts` | Decide | MERGE |
| `idb-gateway.ts` | `unified-storage-adapter.ts` | `idb-gateway.ts` | MERGE |

### Merge Process

1. Create facade exports at old paths for backward compatibility
2. Update all imports to canonical location
3. Delete old files
4. Run TypeScript check

---

## Phase 3: Fix TypeScript Errors (-90 errors)

### Error Categories

| Category | Count | Files | Fix Strategy |
|----------|-------|-------|--------------|
| `src/lib/agent/` type mismatches | ~40 | factory.ts, tools/*.ts | Update types or suppress |
| `src/lib/diagnostics/` redeclarations | ~20 | trace-system.ts | Remove duplicate exports |
| `src/lib/notes/sync/` type errors | ~15 | cache-sync.ts | Delete file (deprecated) |
| `src/infrastructure/` Promise types | ~5 | markdown-sync-service.ts | Fix async/await |
| Unused variables | ~10 | Various | Delete or prefix with `_` |

### Quick Wins

```bash
# Find and delete unused imports
pnpm eslint --fix src/

# Find files with most errors
pnpm tsc --noEmit 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -20
```

---

## Phase 4: Split God Components (-0 files but reduces complexity)

### Components >300 Lines

| Component | Lines | Target | Strategy |
|-----------|-------|--------|----------|
| `NoteEditor.tsx` | 1089 | 3-4 files | Extract hooks, toolbar, content |
| `NotesPage.tsx` | 975 | 3-4 files | Extract sidebar, dialogs, effects |
| `MonacoEditor.tsx` | 773 | 2-3 files | Extract config, hooks |
| `AgentChatPanel.tsx` | 692 | 2-3 files | Extract message list, input |
| `IDELayoutMain.tsx` | 500+ | 2-3 files | Extract panels, toolbar |

### Split Strategy

1. Extract custom hooks to `/hooks/` subfolder
2. Extract sub-components to same directory
3. Keep main component as orchestrator (<200 lines)
4. Update imports

---

# PART 3: VALIDATION CHECKLIST

## After Fixes

```bash
# 1. TypeScript compiles
pnpm tsc --noEmit

# 2. No import errors
grep -r "from '@/lib/workspace" src/ --include="*.ts" --include="*.tsx"
# Should return empty

# 3. Tests pass
pnpm vitest run

# 4. Build succeeds
pnpm build
```

## Manual Testing

- [ ] Notes workspace: Import runs once, not in loop
- [ ] Notes workspace: Navigate away and back, no re-import
- [ ] IDE workspace: FileTree loads on first visit
- [ ] IDE workspace: Refresh page, tree state persists
- [ ] IDE workspace: expandedPaths restored after refresh
- [ ] Project creation: Cannot select same folder twice

---

# PART 4: FILE REFERENCE

## Files to Modify (Fixes)

| File | Fix | Lines |
|------|-----|-------|
| `src/presentation/components/notes/NotesPage.tsx` | Import loop fix | 220-360 |
| `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts` | Tree persistence | All |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | Duplicate folder check | createProject |

## Files to Archive

| Path | Reason |
|------|--------|
| `src/spike/` | Separate project |
| `src/lib/workspace/` | Migrated |
| `src/lib/filesystem/` | Migrated |
| `src/lib/events/` | Migrated |
| `src/lib/sync/` | Migrated |
| `src/lib/state/` | Migrated |
| `src/lib/notes/sync/` | Duplicate |

## Files to Merge

| Source | Target |
|--------|--------|
| `fsa-storage-adapter.ts` | `fsa-gateway.ts` |
| `src/lib/notes/*.ts` | `src/infrastructure/persistence/stores/notes/` |

---

# PART 5: INVESTIGATION DOCUMENTS (Context)

| Document | Path | Purpose |
|----------|------|---------|
| Root Cause Analysis | `_bmad-output/investigation/ROOT-CAUSE-ANALYSIS-2026-01-20.md` | Validated root causes |
| AI Approach Validation | `_bmad-output/investigation/AI-APPROACH-VALIDATION-2026-01-20.md` | External AI review |
| Domain Round 2 Synthesis | `_bmad-output/investigation/domain-round/DOMAIN-ROUND-2-SYNTHESIS-2026-01-20.md` | Full codebase analysis |
| Critical Fixes Plan | `_bmad-output/remediation/CRITICAL-FIXES-2026-01-20.md` | Original fix proposals |

---

*Handoff created: 2026-01-20T23:59:00+07:00*
*Author: architect-ext*
*Status: Ready for dev team execution*

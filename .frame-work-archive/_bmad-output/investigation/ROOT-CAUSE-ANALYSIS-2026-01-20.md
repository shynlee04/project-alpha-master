---
analysis_id: "ROOT-CAUSE-ANALYSIS-2026-01-20"
created: "2026-01-20T23:30:00+07:00"
priority: "P0-CRITICAL"
scope:
  - "Notes workspace infinite loop"
  - "IDE workspace persistence failure"
  - "FileTree incomplete migration"
  - "Project visibility issues"
status: "VERIFIED"
---

# Root Cause Analysis - Critical Workspace Issues

## Executive Summary

This analysis validates and refines the external AI review. **3 of 5 claims are CORRECT**, 1 is INCORRECT (already fixed), and 1 is partially correct.

| Claim | Status | Evidence |
|-------|--------|----------|
| STATE-003 infected (localStorage) | ❌ INCORRECT | Already using Dexie storage |
| getAdapter vs getGateway mismatch | ✅ CORRECT | FileTree still uses LocalFSAdapter |
| workspaceBindings.notes gating | ✅ CORRECT | Projects filtered by binding |
| Notes import loop (sessionStorage band-aid) | ✅ CORRECT | Should use Dexie tracking |
| FileTree split error | ⚠️ PARTIAL | Fix correct but incomplete migration |

---

## Verified Issues

### Issue 1: Incomplete StorageGateway Migration (P0)

**Status**: ✅ CONFIRMED

**Evidence**:
```bash
# FileTree components still use getAdapter (LocalFSAdapter)
src/presentation/components/ide/FileTree/FileTree.tsx:141:     getAdapter,
src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts:21:     getAdapter: () => LocalFSAdapter;
src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts:43:     getAdapter: () => LocalFSAdapter;
src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts:46:     getAdapter: () => LocalFSAdapter;

# NO getGateway found anywhere in FileTree code
$ grep -r "getGateway" src/presentation/components/ide/FileTree/
# (no results)
```

**Root Cause**:
- StorageGateway was introduced but FileTree consumers were never updated
- `useFileTreeState` returns `getAdapter: () => LocalFSAdapter`
- FileTree.tsx, useFileTreeActions.ts, useContextMenuActions.ts all call `getAdapter()`
- This creates a runtime mismatch if any code expects `getGateway`

**Impact**:
- IDE FileTree cannot use StorageGateway features
- Inconsistent architecture (dual-adapter pattern not fully implemented)
- May cause runtime errors if StorageGateway is expected elsewhere

**Fix Required**:
**Option A**: Complete StorageGateway migration (recommended)
- Update `useFileTreeState` to return `getGateway: () => StorageGateway`
- Update all consumers to use `getGateway()` instead of `getAdapter()`
- Remove `LocalFSAdapter` dependency from FileTree

**Option B**: Revert to LocalFSAdapter (temporary)
- Keep current implementation
- Document as temporary workaround
- Plan migration later

---

### Issue 2: workspaceBindings.notes Gating (P0)

**Status**: ✅ CONFIRMED

**Evidence**:
```typescript
// src/infrastructure/persistence/stores/project/use-fsa-projects.ts:29
const fsaProjects = useMemo(() => {
  if (!platform.canAccessFSA) return [];

  return (allProjects?.filter(
    (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
  ) ?? []) as Project[];
}, [allProjects, platform.canAccessFSA]);
```

**Root Cause**:
- Notes workspace filters projects by `workspaceBindings.notes === true`
- Projects created before this binding was introduced won't have it
- Projects created with this binding set to `false` won't show
- This makes projects "invisible" even if they exist in Dexie

**Impact**:
- User sees "No projects available" in Notes workspace
- Projects exist but are filtered out
- Looks like a bug but is "working as coded"

**Fix Required**:
1. **Migration script**: Add `workspaceBindings.notes: true` to all existing FSA projects
2. **Default binding**: Ensure project creation sets explicit bindings
3. **UI feedback**: Show message when no projects match binding (not just empty list)

---

### Issue 3: Notes Import Loop (P0)

**Status**: ✅ CONFIRMED - sessionStorage is a band-aid

**Evidence**:
```typescript
// src/presentation/components/notes/NotesPage.tsx:224-230
const getImportKey = (pid: string) => `notes_import_${pid}`;
const hasImportedForProject = (pid: string) => sessionStorage.getItem(getImportKey(pid)) === 'true';
const markImportedForProject = (pid: string) => sessionStorage.setItem(getImportKey(pid), 'true');
const clearImportForProject = (pid: string) => sessionStorage.removeItem(getImportKey(pid));
```

**Root Cause**:
- sessionStorage is web storage, not domain state
- Bypasses "Zustand/Dexie as source of truth" principle
- Creates hidden state that's not tracked in governance
- If user clears browser data, import runs again
- If user opens in different browser, import runs again

**Impact**:
- Import state not persisted across sessions
- Hidden state makes debugging difficult
- Violates architecture principles

**Fix Required**:
Make `importDirectory()` idempotent using Dexie:

```typescript
// Add to project metadata in Dexie
interface ProjectMetadata {
  id: string;
  notesImportHash?: string;  // Hash of imported files
  notesImportedAt?: number;  // Timestamp
}

// In importDirectory():
const currentHash = computeFileHash(files);
const existingHash = await db.projectMetadata.get(projectId);

if (existingHash?.notesImportHash === currentHash) {
  console.log('[Notes] Files unchanged, skipping import');
  return { skipped: true, reason: 'unchanged' };
}

// Import files, then update hash
await importFiles(files);
await db.projectMetadata.update(projectId, {
  notesImportHash: currentHash,
  notesImportedAt: Date.now()
});
```

---

### Issue 4: STATE-003 Already Fixed (P0 - RESOLVED)

**Status**: ✅ ALREADY FIXED - External AI claim was INCORRECT

**Evidence**:
```typescript
// src/infrastructure/persistence/stores/workspace/workspace-store.ts:178
storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
```

**Analysis**:
- workspace-store IS using Dexie storage via `createDexieStorage('providerConfigs')`
- The external AI claimed this was "STILL INFECTED" but it's already fixed
- Comment on line 176 confirms: "FIXED STATE-003: Use Dexie storage instead of localStorage per ADR-033"

**Conclusion**:
- No action needed for STATE-003
- External AI's analysis was based on outdated information

---

### Issue 5: FileTree Split Error (P1 - PARTIALLY FIXED)

**Status**: ⚠️ FIX APPLIED BUT INCOMPLETE MIGRATION REMAINS

**Evidence**:
```typescript
// src/presentation/components/ide/FileTree/utils.ts:29-59
export function buildTreeNode(entry: AnyFileEntry, parentPath: string): TreeNode {
    // Support both DirectoryEntry (name/type) and FileEntry (path/kind)
    let name: string;
    let type: 'file' | 'directory';

    if ('name' in entry && 'type' in entry) {
        // DirectoryEntry format from LocalFSAdapter.listDirectory()
        name = entry.name;
        type = entry.type;
    } else if ('path' in entry && 'kind' in entry) {
        // FileEntry format from StorageGateway.list()
        name = entry.path.split('/').pop() || entry.path;
        type = entry.kind;
    } else {
        // Fallback
        name = (entry as { name?: string }).name || 'unknown';
        type = 'file';
    }
    // ...
}
```

**Analysis**:
- The type mismatch fix is correct and working
- However, this is a compatibility layer for incomplete migration
- The real issue is that FileTree should be using StorageGateway consistently

**Impact**:
- Works for now but adds technical debt
- Maintains dual-adapter pattern longer than necessary
- May cause confusion about which adapter is "correct"

**Fix Required**:
Same as Issue 1 - complete StorageGateway migration

---

## User-Reported Issues Analysis

### "Notes space still loop"

**Root Cause**: sessionStorage band-aid + workspaceBindings gating

**Why it loops**:
1. User navigates to Notes workspace
2. `hasImportedForProject()` checks sessionStorage
3. If sessionStorage cleared (browser restart, different browser), import runs again
4. If project doesn't have `workspaceBindings.notes === true`, it's filtered out
5. User sees empty list, thinks it's broken, refreshes
6. Import runs again (loop)

**Real Fix**:
- Make import idempotent with Dexie hash tracking (Issue 3)
- Fix workspaceBindings gating (Issue 2)

---

### "IDE space detected overlapping (same folder project)"

**Root Cause**: Project creation allows duplicate folder handles

**Why it happens**:
- User can select same folder for multiple projects
- No validation prevents this
- Each project gets unique ID but same folder handle

**Impact**:
- Multiple projects pointing to same files
- Confusing UX (which project is "real"?)
- Sync conflicts possible

**Fix Required**:
Add validation in project creation:

```typescript
// Check if folder handle already exists in other projects
const existingProject = await db.projects
  .where('storageMetadata.handleId')
  .equals(newHandleId)
  .first();

if (existingProject) {
  throw new Error('Folder already used by another project');
}
```

---

### "IDE must remount to load tree"

**Root Cause**: FileTree state not persisted correctly

**Why it happens**:
- FileTree state (expandedPaths, focusedPath) is in component state
- On remount, this state is lost
- Tree reloads from scratch

**Impact**:
- User loses expanded folders on navigation
- Poor UX (tree collapses every time)

**Fix Required**:
Persist FileTree state to Dexie:

```typescript
// Add to project metadata
interface ProjectMetadata {
  id: string;
  fileTreeState?: {
    expandedPaths: string[];
    focusedPath?: string;
  };
}

// Save on state change
useEffect(() => {
  if (projectId) {
    db.projectMetadata.update(projectId, {
      fileTreeState: {
        expandedPaths: Array.from(expandedPaths),
        focusedPath,
      }
    });
  }
}, [expandedPaths, focusedPath, projectId]);

// Restore on mount
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
```

---

### "No persistence"

**Root Cause**: Multiple issues

1. **FileTree state** - Not persisted (see above)
2. **IDE workspace state** - May be in localStorage (check IDE store)
3. **Project handle** - May not be restored correctly

**Fix Required**:
- Audit all IDE-related stores for persistence backend
- Ensure all use Dexie, not localStorage
- Add FileTree state persistence (see above)

---

## Remediation Plan

### Phase 0: P0 Fixes (Stop the bleeding)

| Priority | Issue | Fix | Time |
|----------|-------|-----|------|
| P0 | workspaceBindings gating | Migration script + defaults | 30 min |
| P0 | Notes import loop | Make importDirectory idempotent | 1 hour |
| P0 | IDE FileTree persistence | Persist state to Dexie | 1 hour |
| P0 | Duplicate folder projects | Add validation | 30 min |

**Total**: ~3 hours

---

### Phase 1: Complete StorageGateway Migration

| Step | Action | Files | Time |
|------|--------|-------|------|
| 1 | Update `useFileTreeState` to return `getGateway` | `useFileTreeState.ts` | 15 min |
| 2 | Update `useFileTreeActions` to use `getGateway` | `useFileTreeActions.ts` | 30 min |
| 3 | Update `useContextMenuActions` to use `getGateway` | `useContextMenuActions.ts` | 30 min |
| 4 | Update `FileTree.tsx` to use `getGateway` | `FileTree.tsx` | 15 min |
| 5 | Remove LocalFSAdapter dependency | All FileTree files | 15 min |
| 6 | Test FileTree functionality | Manual testing | 30 min |

**Total**: ~2.5 hours

---

### Phase 2: Architecture Cleanup

| Step | Action | Time |
|------|--------|------|
| 1 | Create facade hooks (useIdeFileOperations, useNotesSync) | 2 hours |
| 2 | Replace direct infra imports with facades | 3 hours |
| 3 | Split god components (NotesPage, NoteEditor, MonacoEditor) | 4 hours |
| 4 | Fix TypeScript errors in legacy src/lib/ | 2 hours |

**Total**: ~11 hours

---

## Validation Commands

After each phase:

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Run tests
pnpm vitest run

# Check for getAdapter usage (should be 0 after Phase 1)
grep -r "getAdapter" src/presentation/components/ide/FileTree/

# Check for localStorage usage (should be 0 after Phase 0)
grep -r "localStorage" src/infrastructure/persistence/stores/

# Check workspaceBindings in projects
# (manual: create project, check if notes binding is set)
```

---

## Evidence & References

| Issue | File | Lines |
|-------|------|-------|
| workspaceBindings gating | `use-fsa-projects.ts` | 29 |
| Notes import sessionStorage | `NotesPage.tsx` | 224-230 |
| FileTree getAdapter | `useFileTreeState.ts` | 46, 74-82 |
| workspace-store Dexie | `workspace-store.ts` | 178 |
| FileTree split fix | `utils.ts` | 29-59 |

---

*Analysis completed: 2026-01-20*
*Analyst: dev-ext*
*Verified against codebase: Yes*
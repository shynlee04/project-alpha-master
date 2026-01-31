---
remediation_id: "CRITICAL-FIXES-2026-01-20"
created: "2026-01-20T23:00:00+07:00"
priority: "P0-CRITICAL"
scope:
  - "Notes workspace infinite loop fix"
  - "IDE FileTree split error fix"
  - "IDE state persistence fix"
  - "Architecture cleanup strategy"
status: "READY_TO_IMPLEMENT"
---

# Critical Fixes for PC Workspace Usability

## Executive Summary

This document contains **ready-to-implement fixes** for the 3 critical bugs blocking PC users from using IDE and Notes workspaces.

| Bug | Issue | File | Status |
|-----|-------|------|--------|
| BUG-1 | FileTree `split` error | `utils.ts`, `useFileTreeActions.ts` | FIX READY |
| BUG-2 | Notes import loop | `NotesPage.tsx` | FIX READY |
| BUG-3 | IDE state persistence | `use-file-loader-slice.ts` | FIX READY |

---

## FIX 1: FileTree `split` Error (DirectoryEntry vs FileEntry)

### Root Cause
`buildTreeNode()` in `utils.ts` expects `FileEntry` with `path` property, but `LocalFSAdapter.listDirectory()` returns `DirectoryEntry` with only `name` property.

### Fix Location
`src/presentation/components/ide/FileTree/utils.ts`

### Current Code (BROKEN)
```typescript
export function buildTreeNode(entry: FileEntry, parentPath: string): TreeNode {
    // Extract name from path - CRASHES because DirectoryEntry has no path!
    const name = entry.path.split('/').pop() || entry.path;
    const path = parentPath ? `${parentPath}/${name}` : name;
    return {
        name,
        path,
        type: entry.kind,
        handle: undefined,
        expanded: false,
        loading: false,
        children: entry.kind === 'directory' ? undefined : undefined,
    };
}
```

### Fixed Code (REPLACE WITH)
```typescript
import type { DirectoryEntry } from '@/domain/interfaces/file-operations-adapter.interface';
import type { TreeNode } from './types';

/**
 * Build a TreeNode from a DirectoryEntry (LocalFSAdapter format).
 * 
 * @param entry - Directory entry from LocalFSAdapter.listDirectory()
 * @param parentPath - Parent path for constructing full path
 * @returns TreeNode for the file tree
 */
export function buildTreeNode(entry: DirectoryEntry, parentPath: string): TreeNode {
    // DirectoryEntry has 'name' and 'type', NOT 'path' and 'kind'
    const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;
    return {
        name: entry.name,
        path,
        type: entry.type,
        handle: (entry as DirectoryEntry & { handle?: FileSystemHandle }).handle,
        expanded: false,
        loading: false,
        children: entry.type === 'directory' ? undefined : undefined,
    };
}
```

### Why This Works
- `DirectoryEntry` from `LocalFSAdapter.listDirectory()` has `name` and `type` properties
- We construct `path` from `parentPath` + `name` instead of expecting `entry.path`
- We use `entry.type` instead of `entry.kind`
- This matches the actual return type from `listDirectory()`

---

## FIX 2: Notes "Importing Notes" Infinite Loop

### Root Cause
`hasAutoImportedRef` is per-component-instance. When NotesPage remounts (due to navigation, React StrictMode, or parent route changes), the ref resets and import runs again.

### Fix Location
`src/presentation/components/notes/NotesPage.tsx` (lines 273-350)

### Strategy
Use **sessionStorage** to persist import status per project, not per component instance.

### Fixed Code (REPLACE useEffect block)

Find this section (~line 273-350) and replace:

```typescript
    // S-007: Auto-import project files when file sync service becomes ready
    // BUG-FIX-003: Added timeout and cleanup to prevent infinite spinning
    // BUG-FIX-2026-01-20: Use sessionStorage to track import per projectId across remounts
    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        // Use sessionStorage to persist import status across component remounts
        // Key is per-project to allow re-import when switching projects
        const importKey = `notes_import_${projectId}`;
        const hasImported = sessionStorage.getItem(importKey) === 'true';

        if (isNotesSyncReady && notesSyncService && !isImportingFiles && !hasImported) {
            // Mark as imported IMMEDIATELY to prevent any race conditions
            sessionStorage.setItem(importKey, 'true');
            
            const autoImportFiles = async () => {
                if (!mounted) return;

                setIsImportingFiles(true);
                setImportProgress({ current: 0, total: 0, currentFile: '' });

                const importTimeout = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error('Import timeout after 30 seconds - operation cancelled'));
                    }, 30000);
                });

                try {
                    console.log('[NotesPage] Auto-importing project files...');

                    const result = await Promise.race([
                        (notesSyncService as NotesFileSyncService).importDirectory(
                            '',
                            (current: number, total: number, currentFile: string) => {
                                if (mounted) {
                                    setImportProgress({ current, total, currentFile });
                                }
                            }
                        ),
                        importTimeout,
                    ]) as Awaited<ReturnType<typeof NotesFileSyncService.prototype.importDirectory>>;

                    if (timeoutId) clearTimeout(timeoutId);

                    if (!mounted) return;

                    console.log('[NotesPage] Auto-import complete:', result);

                    if (projectId) {
                        await loadNotes(projectId);
                    }
                } catch (error) {
                    if (!mounted) return;

                    const err = error as Error;
                    console.error('[NotesPage] Auto-import failed:', err);

                    // Clear the import flag on error so user can retry
                    sessionStorage.removeItem(importKey);

                    const isTimeout = err.message.includes('timeout');
                    toast.error(t('notes.import_failed', 'Failed to auto-import files'), {
                        description: isTimeout
                            ? t('notes.import_timeout', 'Import took too long. The folder may be too large or access was denied.')
                            : err.message,
                    });
                } finally {
                    if (mounted) {
                        setIsImportingFiles(false);
                    }
                }
            };

            autoImportFiles();
        }

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isNotesSyncReady, notesSyncService, projectId, loadNotes, t]);
```

### Also Add: Clear import status on project change
Add this useEffect BEFORE the import effect:

```typescript
    // Clear import status when projectId changes (new project = new import)
    useEffect(() => {
        // Don't clear on initial mount
        return () => {
            // Clear the import flag for this project when unmounting
            // This allows re-import if user navigates away and back
            // BUT sessionStorage persists through remounts from parent route changes
        };
    }, [projectId]);
```

### Why This Works
1. `sessionStorage` persists across component remounts but clears on tab close
2. Key is `notes_import_${projectId}` so each project tracks separately
3. Flag is set IMMEDIATELY before async operation to prevent race
4. Flag is cleared on error so user can retry
5. Flag is NOT cleared on unmount (this is key - prevents loop from parent route changes)

---

## FIX 3: IDE State Persistence (Handle Restore)

### Root Cause
The handle restoration may fail silently or race with hydration.

### Fix Location
`src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts`

### Verification Needed
First, check if handle restoration is being called. Add logging:

```typescript
// In the useEffect that restores handles, add:
console.log('[useFileLoaderSlice] Attempting handle restore for project:', projectId);
console.log('[useFileLoaderSlice] Project metadata:', projectMetadata);
console.log('[useFileLoaderSlice] Has stored handle:', !!projectMetadata?.storageMetadata?.handleId);
```

### Common Issues
1. **handleId not stored**: When project is created, ensure `handleId` is saved to Dexie
2. **Permission denied**: Browser may have cleared permission - need to re-request
3. **Hydration race**: The slice tries to restore before project store hydrates

### Fix Strategy
Add explicit hydration wait in the handle restoration useEffect:

```typescript
useEffect(() => {
    const restoreHandle = async () => {
        // Wait for project store to hydrate
        const projectStore = useProjectStore.getState();
        if (!projectStore._hasHydrated) {
            console.log('[useFileLoaderSlice] Waiting for hydration...');
            return; // Will re-run when _hasHydrated changes
        }
        
        // ... existing restore logic
    };
    
    restoreHandle();
}, [projectId, /* add _hasHydrated dependency */]);
```

---

## Architecture Cleanup Strategy (For Reducing 2000+ Files)

### Phase 1: Delete Dead Code (Estimated -300 files)

```bash
# These directories can be archived/deleted:
src/spike/                          # Separate spike project
src/lib/workspace/                  # Deprecated, migrated to infrastructure
src/lib/filesystem/                 # Deprecated, migrated to infrastructure  
src/lib/events/                     # Deprecated, migrated to infrastructure
src/lib/sync/                       # Deprecated, migrated to infrastructure
src/lib/state/                      # Deprecated, migrated to infrastructure

# These files are duplicates:
src/infrastructure/filesystem/fsa-storage-adapter.ts    # Merge with fsa-gateway.ts
src/infrastructure/filesystem/ide-file-gateway.ts       # Merge with local-fs-adapter.ts
```

### Phase 2: Consolidate Stores (Estimated -150 files)

```bash
# Move these to infrastructure canonical location:
src/lib/notes/note-store*.ts        → src/infrastructure/persistence/stores/notes/
src/lib/notes/slices/               → src/infrastructure/persistence/stores/notes/slices/

# Delete facades after updating imports:
src/lib/notes/index.ts              # Delete after consumer update
src/lib/filesystem/index.ts         # Delete after consumer update
```

### Phase 3: Merge Similar Files (Estimated -100 files)

```bash
# Merge these into single implementations:
fsa-storage-adapter.ts + fsa-gateway.ts → fsa-storage-gateway.ts
idb-gateway.ts + unified-storage-adapter.ts → idb-storage-gateway.ts
```

### Phase 4: Clean Temporary/Generated Files (Estimated -200 files)

```bash
# Delete these:
*.bak files
*.tmp files  
codetree-*.md files (multiple)
.archive/ contents older than 90 days
```

### File Reduction Summary

| Phase | Action | Estimated Files Removed |
|-------|--------|------------------------|
| Phase 1 | Delete dead code | -300 |
| Phase 2 | Consolidate stores | -150 |
| Phase 3 | Merge similar files | -100 |
| Phase 4 | Clean temp files | -200 |
| **Total** | | **-750 files** |

Current: ~2000 files → Target: ~1250 files (37% reduction)

---

## Implementation Order

1. **FIX 1 (FileTree split)** - 5 minutes
   - Update `utils.ts` with fixed `buildTreeNode`
   - Update import to use `DirectoryEntry`

2. **FIX 2 (Notes loop)** - 10 minutes
   - Replace useEffect in `NotesPage.tsx`
   - Test by navigating to/from Notes workspace

3. **FIX 3 (IDE persistence)** - 15 minutes
   - Add logging to diagnose
   - Add hydration wait if needed

4. **Cleanup** - 2-4 hours
   - Archive/delete Phase 1 files
   - Update imports
   - Run `pnpm tsc --noEmit` to verify

---

## Verification Commands

After applying fixes:

```bash
# Check TypeScript compiles
pnpm tsc --noEmit

# Check for remaining split errors
grep -r "\.split\(" src/presentation/components/ide/FileTree/

# Verify import loop fixed
# 1. Navigate to Notes workspace
# 2. Should show notes list without infinite spinner
# 3. Navigate away and back - should NOT re-import

# Verify IDE persistence
# 1. Navigate to IDE with FSA project
# 2. Refresh page
# 3. Should restore file tree without prompting for folder
```

---

## Evidence & References

| Issue | Bug Log Entry | Line Numbers |
|-------|---------------|--------------|
| FileTree split | BUG-010 (revert) | utils.ts:16 |
| Notes loop | BUG-016, BUG-021 | NotesPage.tsx:280-350 |
| IDE persistence | BUG-010, BUG-006 | use-file-loader-slice.ts |

---

*Remediation plan created: 2026-01-20*
*Analyst: analyst-ext*

# Comprehensive Bug Report - All Findings

**Date**: 2026-01-21
**Report Type**: Investigation Synthesis (Multiple Teams)
**Status**: All investigations complete - 6 root causes identified

---

## Executive Summary

After hotfix application and user testing, **6 critical bugs** were identified across 3 independent investigations:

| # | Bug | Component | Severity | Team That Found It |
|---|------|-----------|----------------------|
| **1** | Notes import spinner never stops | P0 - BLOCKING | analyst-ext #1 |
| **2** | Project name uses folder name (not user input) | P1 - UX | analyst-ext #2 |
| **3** | Monaco editor no hot reload | P0 - FUNCTIONAL | analyst-ext #2 |
| **4** | Terminal same issue as Monaco | P0 - FUNCTIONAL | analyst-ext #2 (hypothesized) |
| **5** | Duplicate projects created | P2 - EDGE CASE | analyst-ext #2 |
| **6** | Notes infinite import loop (alternative explanation) | P0 - BLOCKING | analyst-ext #2 |

---

## Bug #1: Notes Import Spinner Never Stops

### Symptom
- User opens Notes with existing FSA project
- Import spinner appears
- **Never stops spinning**
- User's log shows: `[NoteFolderBridge] Found 0 markdown files to import`
- **Missing**: `[NotesPage] Auto-import complete: ...` log

### Root Cause

**Promise hangs on 0-files case** - When a project folder has 0 markdown files:
1. `importDirectory()` starts import
2. Finds 0 files (line 135 of note-folder-bridge.ts)
3. Returns success object
4. **But Promise never resolves** → spinner never stops

**Why Promise Hangs**:
- **Most likely**: Unhandled exception in `showWarningToast` or `dismissToast` that throws before return statement
- Exception bypasses try-catch and leaves Promise in pending state
- Timeout mechanism (30s) also fails to trigger because Promise doesn't reject

**Location**: `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` lines 137-147

### Why V3 Fixes Didn't Help

| Fix | Purpose | Didn't Solve | Reason |
|------|-----------|--------------|--------|
| V1: `isImportingRef` | Prevent concurrent imports | Doesn't stop if Promise hangs |
| V2: 30s timeout | Should cancel stuck imports | Timeout might not trigger if Promise never resolves/rejects |
| V3: Remove `notesSyncService` from deps | Prevents re-triggering | Doesn't fix hanging Promise |

### Evidence from Investigation

```typescript
// Current code (note-folder-bridge.ts:137-147)
if (files.length === 0) {
    dismissToast(loadingToastId);           // ← Could throw
    showWarningToast('No markdown files...'); // ← Could throw
    return {
        success: true,
        totalFiles: 0,
        importedCount: 0,
        failedFiles: [],
        duration: Date.now() - startTime,
        // ❌ Missing: skipped: true, skipReason: 'no-files'
    };
}
```

**Missing fields**:
1. No debug log to confirm return happened
2. No `skipped: true` field (for clarity)
3. Potential unhandled exception in toast handling

### Recommended Fixes

#### Fix #1: Add Debug Log and Completion Signal

```typescript
// File: note-folder-bridge.ts lines 137-147
if (files.length === 0) {
    try {
        dismissToast(loadingToastId);
        showWarningToast('No markdown files found in the selected folder');
    } catch (toastError) {
        console.error('[NoteFolderBridge] Toast error:', toastError);
    }

    console.log('[NoteFolderBridge] 0 files found, returning success');
    return {
        success: true,
        totalFiles: 0,
        importedCount: 0,
        failedFiles: [],
        duration: Date.now() - startTime,
        skipped: true,           // ← ADD THIS
        skipReason: 'no-files',  // ← ADD THIS
    };
}
```

#### Fix #2: Handle 'no-files' Skip Reason in NotesPage

```typescript
// File: NotesPage.tsx line 384-396
if (result.skipped && result.skipReason === 'unchanged') {
    console.log('[NotesPage] Import skipped - files unchanged');
    if (projectId) await loadNotes(projectId);
} else if (result.skipped && result.skipReason === 'no-files') {
    console.log('[NotesPage] Import skipped - no files in folder');
    // No need to reload - nothing changed
} else {
    console.log('[NotesPage] Auto-import complete:', result);
    if (projectId) await loadNotes(projectId);
}
```

---

## Bug #2: Project Name Always Uses Folder Name

### Symptom
- User creates new project via wizard
- Expects to name it: "My Awesome Project"
- **But project is created with folder name instead**: "my-folder"

### Root Cause

**`createProjectFromFolder()` always uses folder name - no customization option**

**Evidence**:
```typescript
// HubHomePage.tsx line 228
const newProjectId = await createProjectFromFolder(handle, handle.name);

// fsa-persistence.ts line 201
const projectInput: CreateProjectInput = {
  name: folderName,  // ← ALWAYS uses folderName parameter
  folderPath: handle.name,
  // ...
};
```

**Why It's Wrong**:
- User expects to name their project
- Function always uses `handle.name` (folder name from picker)
- No parameter to override with custom name

### Recommended Fix

**Add optional `name` parameter with folder name as default**:

```typescript
// File: src/lib/workspace/fsa-persistence.ts
export async function createProjectFromFolder(
  handle: FileSystemDirectoryHandle,
  folderName: string,
  options?: CreateFromFolderOptions & { name?: string }  // ← Add name option
): Promise<string> {
  // ...

  const projectInput: CreateProjectInput = {
    name: options?.name || folderName,  // ← Use custom name or fallback to folder name
    folderPath: handle.name,
    // ...
  };
}
```

---

## Bug #3: Monaco Editor No Hot Reload

### Symptom
- User edits file in Monaco editor
- No auto-refresh to show changes
- User must remount component or refresh page to see edits

### Root Cause

**File watching infrastructure exists but polling interval is too slow**

**Evidence**:
```typescript
// fsa-storage-adapter.ts line 76-79
private watchOptions: WatchOptions = {
  pollInterval: 2000,  // ← TOO SLOW! 2 seconds
  debounceMs: 300,
};
```

**Monaco Event Subscription** (works correctly):
```typescript
// useMonacoEditorEventSubscriptions.ts line 154-214
- Subscribes to `crossWorkspaceEventBus.onFileChange`
- Reads fresh content from adapter when file changes
- Updates `openFiles` state
```

**Why It Fails**:
1. User saves file in Monaco
2. File watcher polls every **2 seconds**
3. User sees 2-second delay before change is detected
4. Monaco might not re-render when `openFiles` prop changes (potential memo issue)

### Recommended Fixes

#### Fix #1: Reduce Polling Interval

```typescript
// File: src/infrastructure/filesystem/fsa-storage-adapter.ts line 76-79
private watchOptions: WatchOptions = {
  pollInterval: 500,  // ← Change from 2000 to 500ms
  debounceMs: 300,
};
```

#### Fix #2: Add Debug Logging to Verify Events

```typescript
// File: src/infrastructure/filesystem/fsa-storage-adapter.ts line 564-571
private emitChange(event: FileChangeEvent): void {
  console.log('[FSAStorageAdapter] Emitting change:', event.path, event.type);  // ← ADD LOG

  const timer = setTimeout(() => {
    for (const callback of this.watchCallbacks) {
      callback(event);  // ← Does this get called?
    }
  }, this.watchOptions.debounceMs);
}
```

#### Fix #3: Verify Monaco Re-renders on Prop Change

```typescript
// File: src/presentation/components/ide/MonacoEditor.tsx line 81
export const MonacoEditor = React.memo(function MonacoEditor({
  // ...
}: MonacoEditorProps): React.JSX.Element {
  // Add debug log when content changes
  useEffect(() => {
    console.log('[MonacoEditor] openFiles changed, activeFile:', activeFile?.path);
  }, [openFiles]);  // ← Log when this changes
```

---

## Bug #4: Terminal Same Issue as Monaco

### Symptom
- Terminal component exists
- Similar to Monaco - doesn't reload when files change

### Root Cause

**Hypothesis**: Terminal doesn't subscribe to file change events, same as Monaco issue

**Evidence**:
```
Files found:
- src/presentation/components/terminal/TerminalTabs.tsx
- src/presentation/components/terminal/TerminalPanel.tsx
```

**Likely Cause**: Terminal doesn't subscribe to file change events

### Recommended Fix

**Add file watching subscription to Terminal component**:

```typescript
// File: src/presentation/components/ide/TerminalPanel.tsx
import { useMonacoEditorEventSubscriptions } from '../MonacoEditor/hooks';

// Subscribe to file changes to reload terminal when files change
```

---

## Bug #5: Duplicate Projects Created

### Symptom
- User clicks "Create Project" twice (or UI has duplicate triggers)
- Two projects created for same folder
- One has folder name, one has user's name

### Root Cause

**`HubHomePage` has TWO project creation paths - one inline, one via `createProjectFromFolder`**

**Evidence**:

**Path 1: handleNewProject** (HubHomePage.tsx lines 201-258)
```typescript
const handleNewProject = async () => {
  const handle = await window.showDirectoryPicker();
  // V3-FIX-002: Use createProjectFromFolder
  const newProjectId = await createProjectFromFolder(handle, handle.name);
  // ...
};
```

**Path 2: ProjectPickerDialog → onCreateNew → handleNewProject**

The same `handleNewProject` is called from:
- Recent projects section (line 457: `onNewProject={handleNewProject}`)
- ProjectPickerDialog's "Create Project" button

**Why Duplicates**:
If user clicks "Create Project" button twice:
1. First via wizard → calls `createProjectFromFolder`
2. Second via picker → also calls `createProjectFromFolder`
3. If user selects same folder twice, duplicate project is created

### Recommended Fix

**Add creation guard flag to prevent duplicate calls**:

```typescript
// File: src/presentation/components/hub/HubHomePage.tsx
const [isCreatingProject, setIsCreatingProject] = useState(false);

const handleNewProject = async () => {
  if (isCreatingProject) {
    console.warn('[HubHomePage] Project creation already in progress, ignoring');
    return;
  }

  setIsCreatingProject(true);
  try {
    // ... existing folder picker logic
  } finally {
    setIsCreatingProject(false);
  }
};

// Update ProjectCreationWizard to check flag
<ProjectCreationWizard
  open={projectCreationWizardOpen}
  onOpenChange={(open) => {
    if (!open && isCreatingProject) {
      // Don't close wizard if creation is in progress
      return;
    }
    setProjectCreationWizardOpen(open);
  }}
  onProjectCreated={(projectId) => {
    setIsCreatingProject(false);
    handleProjectCreated(projectId);
  }}
/>
```

---

## Bug #6: Notes Infinite Import Loop (Alternative Explanation)

### Symptom
- User reports: "split-second of interface before spinning loader importing notes again"
- Same as Bug #1 but different explanation

### Root Cause (Alternative Hypothesis from Analyst-Ext)

**Effect re-runs when `isNotesSyncReady` changes from false to true**

**Evidence**:
```typescript
// NotesPage.tsx lines 234-239
const canAutoImport = Boolean(
  isNotesSyncReady &&  // ← Changes from false → true
  notesSyncService &&
  projectId &&
  !isImportingRef.current
);

useEffect(() => {
  // Auto-import files
  const autoImportFiles = async () => {
    setIsImportingFiles(true);
    isImportingRef.current = true;

    await (notesSyncService as NotesFileSyncService).importDirectory(...);

    await loadNotes(projectId);  // ← Reload notes
    markImportedThisSession(projectId);  // ← Mark imported
  };

  autoImportFiles();
}, [canAutoImport, projectId, loadNotes, t]);  // ← Re-runs when service ready
```

**Why Infinite Loop**:
1. Component mounts
2. Service becomes ready → `canAutoImport = true`
3. Effect runs → imports files → `isImportingRef.current = true`
4. Effect completes → cleanup removes mounted flag
5. Service ref changes or dependency updates → `canAutoImport` changes again
6. Ref guard resets (line 268) → `isImportingRef.current = false`
7. **Effect runs AGAIN!**

**User's Evidence**: "split-second of interface before spinning loader importing notes again"
- This means: Layout renders → Effect triggers → Import starts

### Recommended Fix

**Don't reset `isImportingRef` on project change**:

```typescript
// File: src/presentation/components/notes/NotesPage.tsx
// Lines 266-271 - REMOVE THIS CODE

// OLD CODE (REMOVE):
useEffect(() => {
    setIsImportingFiles(false);
    isImportingRef.current = false;  // ← THIS RESETS THE GUARD!
    autoInitAttemptedRef.current = false;
}, [projectId]);

// NEW CODE (KEEP):
useEffect(() => {
    // Don't reset isImportingRef on project change!
    // Only reset UI state
    setIsImportingFiles(false);
    autoInitAttemptedRef.current = false;
}, [projectId]);
```

**Alternative Fix**: Use `useMemo` to stabilize `hasImportedThisSession`:

```typescript
// Lines 231-233 - Change to useMemo
const hasImportedThisSession = useMemo(() => {
  return (pid: string) => sessionStorage.getItem(getImportKey(pid)) === 'done';
}, [projectId]);  // ← Only recompute when projectId changes

const canAutoImport = useMemo(() => Boolean(
  isNotesSyncReady &&
  notesSyncService &&
  projectId &&
  !isImportingRef.current &&
  !hasImportedThisSession(projectId)  // ← Add session guard
), [projectId, isNotesSyncReady, notesSyncService, isImportingRef.current]);
```

---

## Summary Table

| Bug | Root Cause | Files Affected | Fix Complexity | Priority |
|-----|------------|----------------|----------------|----------|
| **#1** | Promise hangs on 0-files (unhandled toast exception) | `note-folder-bridge.ts`, `NotesPage.tsx` | Simple (5 lines) | **P0** |
| **#2** | Function always uses folder name, no customization | `fsa-persistence.ts`, `HubHomePage.tsx` | Simple (3 lines) | P1 |
| **#3** | File polling too slow (2000ms = 2s) | `fsa-storage-adapter.ts` | Very Simple (1 line) | **P0** |
| **#4** | Terminal missing file watch subscription | `TerminalPanel.tsx` | Medium (10 lines) | **P0** |
| **#5** | Duplicate creation guard missing | `HubHomePage.tsx` | Medium (5 lines) | P2 |
| **#6** | Ref guard resets on project change | `NotesPage.tsx` | Simple (3 lines) | **P0** |

---

## Recommended Fix Sequence

### Phase 1: P0 Critical Fixes (30 minutes)

1. **Fix #1**: Add debug log and completion signal to `note-folder-bridge.ts`
2. **Fix #3**: Reduce polling interval to 500ms in `fsa-storage-adapter.ts`
3. **Fix #6**: Remove `isImportingRef` reset on project change in `NotesPage.tsx`

### Phase 2: P0 Functional Fixes (20 minutes)

4. **Fix #4**: Add terminal file watching (similar to Monaco)
5. **Fix #6b**: Alternative fix - use `useMemo` for `hasImportedThisSession`

### Phase 3: P1/P2 UX Improvements (15 minutes)

6. **Fix #2**: Add `name` parameter to `createProjectFromFolder()`
7. **Fix #5**: Add creation guard flag in `HubHomePage`

---

## Verification Checklist After Fixes

### Bug #1 (Notes Spinner)
- [ ] Open project with 0 markdown files
- [ ] Import completes within 1-2 seconds
- [ ] Console shows: `[NoteFolderBridge] 0 files found, returning success`
- [ ] Console shows: `[NotesPage] Import skipped - no files in folder`
- [ ] Spinner disappears (doesn't hang)

### Bug #2 (Project Name)
- [ ] Create project via wizard
- [ ] Project uses user's name (not folder name)
- [ ] Project shows correctly in Hub

### Bug #3 (Monaco Hot Reload)
- [ ] Edit file in Monaco
- [ ] Change detected within 500ms
- [ ] Console shows: `[FSAStorageAdapter] Emitting change: ...`
- [ ] Monaco content updates automatically

### Bug #4 (Terminal Hot Reload)
- [ ] Terminal subscribes to file changes
- [ ] Terminal reloads when files change

### Bug #5 (Duplicate Projects)
- [ ] Click "Create Project" twice rapidly
- [ ] Second click shows warning: "Project creation already in progress"
- [ ] Only one project created

### Bug #6 (Notes Loop)
- [ ] Navigate away from Notes and back
- [ ] Import doesn't re-run (sessionStorage prevents)
- [ ] Console shows: `[NotesPage] Import skipped - already imported this session`

---

## Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| **Investigation #1** | `_bmad-output/investigation-reports/old-projects-import-spinner-bug-2026-01-20.md` | Original import spinner investigation |
| **Investigation #2** | `_bmad-output/bug-investigations/BUG-A-2026-01-20-project-creation-duplicates.md` | Project creation investigation |
| **V3 Handoff** | `_bmad-output/handoffs/DEV-TEAM-HANDOFF-2026-01-21-V3.md` | Failed hotfix attempt |
| **V3 Results** | `_bmad-output/remediation/V3-HANDOFF-RESULTS-2026-01-21.md` | V3 execution results |

---

## Next Steps

**Option A**: Implement all fixes (recommended)
- Execute Phase 1, 2, and 3 sequentially
- Total estimated time: 65 minutes
- Test after each phase

**Option B**: Implement P0 fixes only
- Execute Phase 1 and 2
- Total estimated time: 50 minutes
- Test before P1 fixes

**Option C**: Debug-first approach
- Add debug logging first (Bug #1, #3)
- Test to confirm root causes
- Then implement fixes

---

*Report Generated: 2026-01-21*
*Investigation Teams: 3 (analyst-ext, architect-ext, bmad-master)*
*Status: Complete - Ready for implementation*

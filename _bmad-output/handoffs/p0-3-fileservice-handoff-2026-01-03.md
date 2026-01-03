---
date: 2026-01-03
time: 13:30:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1091
type: critical-fix-handoff
---

# P0-3 Handoff: Implement fileSyncService for Study & Notes Workspaces

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P0 - Critical (Blocks Core Functionality)
**Estimate**: 4 hours
**Locations**:
- `src/presentation/components/study/StudyPage.tsx:147, 275`
- `src/presentation/components/notes/NotesPage.tsx:203, 274, 281`

## Problem Statement

Both Study and Notes workspaces have `fileSyncService={null}` placeholders, preventing users from importing study materials (PDFs, quizzes) and syncing notes to Markdown files.

**Current Broken Code**:

**StudyPage.tsx:147, 275**:
```typescript
<StudyFilePicker
    open={isFilePickerOpen}
    onOpenChange={setIsFilePickerOpen}
    fileSyncService={null} // TODO: Initialize with StudyFileSyncService
/>
```

**NotesPage.tsx:203, 274**:
```typescript
<NotesExportDialog
    open={isExportDialogOpen}
    onOpenChange={setIsExportDialogOpen}
    notes={notesArray as any}
    syncService={undefined} // TODO: Initialize with NotesFileSyncService
/>

<NotesFilePicker
    open={isFilePickerOpen}
    onOpenChange={setIsFilePickerOpen}
    fileSyncService={null} // TODO: Initialize with NotesFileSyncService
/>
```

## Root Cause Analysis

### Services Already Exist ✅

The file sync services are **already implemented**:
- `src/lib/filesync/study-file-sync-service.ts` - StudyFileSyncService (READ-ONLY)
- `src/lib/filesync/notes-file-sync-service.ts` - NotesFileSyncService (bidirectional)
- `src/lib/filesync/local-fs-adapter.ts` - LocalFSAdapter (File System Access API)

### Missing Integration ❌

The pages are not creating instances of these services because:
1. **LocalFSAdapter requires user interaction** (showDirectoryPicker)
2. **Services need to be initialized per-project** (project-specific file handles)
3. **No initialization logic exists** in the pages

## Implementation Plan

### Step 1: Create File Sync Hook (1 hour)

**Create**: `src/lib/filesync/hooks/use-file-sync-service.ts`

```typescript
/**
 * @fileoverview File Sync Service Hook
 * @module lib/filesync/hooks/use-file-sync-service
 *
 * Custom hook for initializing file sync services
 * with user-triggered File System Access API prompts.
 */

import { useState, useCallback, useRef } from 'react';
import { LocalFSAdapter } from '../local-fs-adapter';
import { StudyFileSyncService } from '../study-file-sync-service';
import { NotesFileSyncService } from '../notes-file-sync-service';
import type { StudyFileSyncConfig } from '../study-file-sync-service';
import type { NotesFileSyncConfig } from '../notes-file-sync-service';
import type { FileSyncService } from '../file-sync-service';

export interface UseFileSyncServiceOptions {
    projectId: string | null;
    workspaceType: 'study' | 'notes';
    noteStore?: NotesFileSyncConfig['noteStore'];
}

export function useFileSyncService({
    projectId,
    workspaceType,
    noteStore,
}: UseFileSyncServiceOptions) {
    const [service, setService] = useState<FileSyncService | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const adapterRef = useRef<LocalFSAdapter | null>(null);

    const initializeService = useCallback(async () => {
        if (!projectId) {
            setError('No project selected');
            return;
        }

        setIsInitializing(true);
        setError(null);

        try {
            // Check if running in browser with File System Access API
            if (!('showDirectoryPicker' in window)) {
                throw new Error('File System Access API not supported in this browser. Please use Chrome, Edge, or Opera.');
            }

            // Prompt user to select directory
            const directoryHandle = await window.showDirectoryPicker();

            // Create LocalFSAdapter with the directory handle
            const adapter = new LocalFSAdapter(directoryHandle);
            adapterRef.current = adapter;

            // Create appropriate service based on workspace type
            if (workspaceType === 'study') {
                const studyConfig: StudyFileSyncConfig = {
                    localAdapter: adapter,
                    projectId,
                    workspaceType,
                };
                const studyService = new StudyFileSyncService(studyConfig);
                setService(studyService);
            } else if (workspaceType === 'notes' && noteStore) {
                const notesConfig: NotesFileSyncConfig = {
                    localAdapter: adapter,
                    noteStore,
                    targetDirectory: '/notes',
                    autoSync: true,
                    syncInterval: 5000,
                    enableFileWatching: true,
                };
                const notesService = new NotesFileSyncService(notesConfig);
                setService(notesService);
            } else {
                throw new Error('Invalid workspace type or missing noteStore');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize file sync service';
            setError(errorMessage);
            console.error('[useFileSyncService] Initialization error:', err);
        } finally {
            setIsInitializing(false);
        }
    }, [projectId, workspaceType, noteStore]);

    const disposeService = useCallback(() => {
        if (service && 'dispose' in service) {
            (service as any).dispose();
        }
        setService(null);
        adapterRef.current = null;
    }, [service]);

    return {
        service,
        isInitializing,
        error,
        initializeService,
        disposeService,
        isReady: service !== null,
    };
}
```

### Step 2: Update StudyPage (1 hour)

**Add to imports**:
```typescript
import { useFileSyncService } from '@/lib/filesync/hooks/use-file-sync-service';
```

**Add hook usage** (after existing hooks):
```typescript
// Initialize file sync service
const {
    service: fileSyncService,
    isInitializing: isFileSyncInitializing,
    error: fileSyncError,
    initializeService,
    disposeService,
    isReady: isFileSyncReady,
} = useFileSyncService({
    projectId,
    workspaceType: 'study',
});
```

**Update StudyFilePicker components** (lines 147, 275):
```typescript
<StudyFilePicker
    open={isFilePickerOpen}
    onOpenChange={setIsFilePickerOpen}
    fileSyncService={fileSyncService}
    onInitialize={initializeService}
    isInitializing={isFileSyncInitializing}
    error={fileSyncError}
    isReady={isFileSyncReady}
/>
```

**Add cleanup on unmount**:
```typescript
useEffect(() => {
    return () => {
        disposeService();
    };
}, [disposeService]);
```

### Step 3: Update StudyFilePicker Component (30 minutes)

**Update props interface**:
```typescript
interface StudyFilePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileSyncService: StudyFileSyncService | null;
    onInitialize?: () => void;
    isInitializing?: boolean;
    error?: string | null;
    isReady?: boolean;
}
```

**Add "Select Directory" button** (when service is null):
```typescript
{!isReady && (
    <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground mb-4">
            Select a directory containing study materials (PDFs, quizzes)
        </p>
        <Button
            onClick={onInitialize}
            disabled={isInitializing}
            size="sm"
        >
            {isInitializing ? 'Initializing...' : 'Select Directory'}
        </Button>
        {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
        )}
    </div>
)}
```

### Step 4: Update NotesPage (1 hour)

**Add hook usage**:
```typescript
// Get note store
const noteStore = useNoteStore();

// Initialize file sync service
const {
    service: notesSyncService,
    isInitializing: isNotesSyncInitializing,
    error: notesSyncError,
    initializeService: initializeNotesSync,
    disposeService: disposeNotesSync,
    isReady: isNotesSyncReady,
} = useFileSyncService({
    projectId,
    workspaceType: 'notes',
    noteStore: {
        notes: noteStore.notes,
        notesArray: noteStore.notesArray,
        updateNote: noteStore.updateNote,
        createNote: noteStore.createNote,
        loadNotes: noteStore.loadNotes,
    },
});
```

**Update NotesFilePicker and NotesExportDialog**:
```typescript
<NotesExportDialog
    open={isExportDialogOpen}
    onOpenChange={setIsExportDialogOpen}
    notes={notesArray as any}
    syncService={notesSyncService}
    onInitialize={initializeNotesSync}
    isInitializing={isNotesSyncInitializing}
    error={notesSyncError}
    isReady={isNotesSyncReady}
/>

<NotesFilePicker
    open={isFilePickerOpen}
    onOpenChange={setIsFilePickerOpen}
    fileSyncService={notesSyncService}
    onInitialize={initializeNotesSync}
    isInitializing={isNotesSyncInitializing}
    error={notesSyncError}
    isReady={isNotesSyncReady}
/>
```

### Step 5: Add Mobile Fallback (30 minutes)

**Update hook to handle mobile**:
```typescript
// Check for File System Access API support
const isSupported = 'showDirectoryPicker' in window;

if (!isSupported) {
    return {
        service: null,
        isInitializing: false,
        error: 'File sync requires a desktop browser (Chrome, Edge, Opera). Mobile browsers are not supported.',
        initializeService: async () => {
            throw new Error('File System Access API not supported');
        },
        disposeService: () => {},
        isReady: false,
        isSupported: false,
    };
}
```

**Add UI message for mobile**:
```typescript
{!isSupported && (
    <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
            ⚠️ File sync is only available on desktop browsers (Chrome, Edge, Opera).
        </p>
    </div>
)}
```

### Step 6: Manual Testing (30 minutes)

**Test Cases**:

1. **Study Workspace - Import PDFs**:
   - Navigate to Study workspace
   - Click "Select Directory" button
   - Choose directory with PDF files
   - Verify StudyFilePicker shows file list
   - Import a PDF for flashcard generation

2. **Notes Workspace - Sync Notes**:
   - Navigate to Notes workspace
   - Click "Select Directory" button
   - Choose directory (create `/notes` folder)
   - Create a new note
   - Verify `.md` file created in selected directory
   - Edit `.md` file externally
   - Verify note updates in app

3. **Mobile Fallback**:
   - Open DevTools device mode (mobile)
   - Navigate to Study/Notes workspace
   - Verify "desktop only" message appears
   - Verify no crash or console errors

4. **Error Handling**:
   - Cancel directory picker dialog
   - Verify error message appears
   - Try again - verify second attempt works

**Expected Console Output**:
```
[useFileSyncService] Initializing file sync service...
[LocalFSAdapter] Directory handle acquired
[StudyFileSyncService] Study file sync service initialized
[useFileSyncService] Service ready
```

### Step 7: Code Validation (30 minutes)

```bash
# TypeScript check
pnpm tsc --noEmit 2>&1 | grep -v "test\|spec" | grep "error" | wc -l
# Expected: 0 production errors

# Check circular dependencies
pnpm madge --circular src/lib/filesync/hooks/use-file-sync-service.ts
# Expected: No circular dependencies

# Run file sync tests
pnpm test src/lib/filesync/__tests__/
# Expected: All tests passing
```

## Constraints & Safeguards

### DO NOT:
- ❌ Auto-prompt for directory (must be user-triggered)
- ❌ Create services without proper cleanup (dispose on unmount)
- ❌ Break existing StudyFilePicker/NotesFilePicker APIs
- ❌ Ignore mobile users (show helpful message)

### MUST:
- ✅ Use File System Access API only with user gesture
- ✅ Dispose services on component unmount
- ✅ Handle browser incompatibility gracefully
- ✅ Provide clear error messages
- ✅ Add proper TypeScript types (no `any`)
- ✅ Add JSDoc comments

### Validation Checklist:
- [ ] use-file-sync-service hook created
- [ ] StudyPage updated with hook usage
- [ ] NotesPage updated with hook usage
- [ ] StudyFilePicker accepts onInitialize callback
- [ ] NotesFilePicker and NotesExportDialog accept callbacks
- [ ] Mobile fallback message implemented
- [ ] Error handling tested (cancel picker, incompatible browser)
- [ ] Services disposed on unmount
- [ ] Zero TypeScript errors
- [ ] Manual test: Import PDF in Study workspace
- [ ] Manual test: Sync note in Notes workspace
- [ ] JSDoc comments added

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query File System Access API best practices
- Query React hook patterns for async initialization

### Deepwiki:
- Search for "file system access" in Chrome docs repos
- Search React hooks patterns for user-triggered operations

## Output Location

Report completion to:
```
_bmad-output/p0-3-fileservice-completion-2026-01-03.md
```

Include:
- Code diff showing changes made
- Files created/modified count
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (screenshots of directory picker)
- Console output showing service initialization
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P0-3 completion status (SUCCESS/BLOCKED)
2. Files created/modified
3. Verification results (manual test passed/failed)
4. Screenshot of directory picker in action
5. Next action recommendation (proceed to P0-4 or address issues)

---

**Handoff Created**: 2026-01-03T13:30:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1091
**Team**: Team A
**Priority**: P0 CRITICAL - File Import Blocked in Study & Notes Workspaces

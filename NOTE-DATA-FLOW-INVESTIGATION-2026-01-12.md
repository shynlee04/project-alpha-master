# Note Data Flow Investigation Report

**Date:** 2026-01-12  
**Investigator:** Domain Scanner  
**Status:** COMPLETE  
**Context:** BlockNote error - "no clear boundaries between file system and browser database"

---

## Executive Summary

The investigation has identified **multiple contamination points** where file system data and browser IndexedDB data can mix, causing the reported BlockNote errors. The core issue is the lack of clear project-boundary enforcement when:

1. Loading notes in "browser mode" (loadAllNotes)
2. Creating notes when currentProjectId is null
3. Importing files without project context
4. Route parameter-to-note resolution without validation

---

## 1. Data Flow Mapping

### 1.1 Browser Mode Flow (Route: `/notes`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     notes.lazy.tsx                                   │
│  - Creates browser mode project: "notes:browser-mode"               │
│  - Sets storageType: 'indexeddb'                                     │
│  - Sets isBrowserMode: true                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NotesPage.tsx                                    │
│  - Detects isBrowserMode from project context                        │
│  - Calls loadAllNotes() if isBrowserMode === true                    │
│  - Calls loadNotes(projectId) if isBrowserMode === false             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
         ┌────────────────┐    ┌────────────────┐
         │ loadAllNotes() │    │ loadNotes()    │
         │ (Browser Mode) │    │ (Project Mode) │
         └────────────────┘    └────────────────┘
                  │                     │
                  │                     │
                  ▼                     ▼
         ┌───────────────────────────────────────┐
         │         Dexie DB (notes table)        │
         │  - Query: db.notes.toCollection()     │
         │  - NO projectId filtering             │
         │  - Returns ALL notes from ALL projects│
         └───────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │         NoteStore (Zustand)           │
         │  - notes: Map<string, NoteRecord>     │
         │  - notesArray: NoteRecord[]           │
         │  - currentProjectId: null             │
         └───────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │           NoteSidebar.tsx             │
         │  - Renders all notes (no filtering)   │
         └───────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │          NoteEditor.tsx               │
         │  - Receives noteId from parent        │
         │  - Fetches note from NoteStore        │
         │  - Passes to BlockNote editor         │
         └───────────────────────────────────────┘
```

### 1.2 Project Mode Flow (Route: `/notes/$projectId`)

```
┌─────────────────────────────────────────────────────────────────────┐
│               notes.$projectId.lazy.tsx                              │
│  - Loads project by ID from Dexie                                   │
│  - Wraps NotesPage in ProjectProvider                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NotesPage.tsx                                    │
│  - Detects isBrowserMode from project context                       │
│  - Calls loadNotes(projectId) (project mode default)                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │         note-crud-slice.ts            │
         │         loadNotes(projectId)          │
         │  - Query: db.notes.where('projectId') │
         │  - .equals(projectId)                 │
         │  - .sortBy('order')                   │
         │  - Filters by CURRENT project only    │
         └───────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │         NoteStore (Zustand)           │
         │  - notes: Map<string, NoteRecord>     │
         │  - notesArray: NoteRecord[]           │
         │  - currentProjectId: projectId        │
         └───────────────────────────────────────┘
```

### 1.3 File System Sync Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│               useFileSyncService (hook)                             │
│  - Creates UnifiedStorageAdapter                                    │
│  - Determines storageType: 'indexeddb' | 'fsa'                      │
│  - Creates NotesFileSyncService                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               NotesFileSyncService                                   │
│  - On mount: calls NoteFolderBridge.importDirectory()               │
│  - Sets autoSync: true, syncInterval: 5000ms                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               NoteFolderBridge                                       │
│  - Recursively scans directory for .md/.markdown files              │
│  - Calls importFileAsNote() for each file                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               importFileAsNote()                                     │
│  - Reads file content via FileAdapter                               │
│  - Parses markdown (extracts title, blocks, frontmatter)            │
│  - Checks for existing note via frontmatter.id                      │
│  - CALLS noteStore.createNote() or noteStore.updateNote()           │
│  - ⚠️ NO PROJECT ID CONTEXT IN THIS FUNCTION                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │         NoteStore (Zustand)           │
         │         createNote()/updateNote()     │
         │  - Uses currentProjectId from store   │
         │  - ⚠️ If currentProjectId is null     │
         │    (browser mode), notes get created  │
         │    with projectId: null               │
         └───────────────────────────────────────┘
```

---

## 2. Load Functions Analysis

### 2.1 `loadNotes(projectId)` - note-crud-slice.ts:45-68

```typescript
loadNotes: async (projectId: string) => {
    set({ loading: true, error: null, currentProjectId: projectId });

    try {
        const notes = await db.notes
            .where('projectId')
            .equals(projectId)
            .sortBy('order');

        const notesMap = new Map<string, NoteRecord>();
        notes.forEach(note => notesMap.set(note.id, note));

        set({
            notes: notesMap,
            notesArray: notes,
            loading: false
        });
    } catch (error) {
        set({ error: (error as Error).message, loading: false });
    }
},
```

**Analysis:**
- Sets `currentProjectId` in store to the passed projectId
- Queries Dexie with `where('projectId').equals(projectId)`
- Properly filters to only notes belonging to the specified project
- Updates both `notes` Map and `notesArray` for UI consistency

### 2.2 `loadAllNotes()` - note-crud-slice.ts:74-98

```typescript
loadAllNotes: async () => {
    set({ loading: true, error: null });

    try {
        // Load all notes regardless of projectId
        const notes = await db.notes
            .toCollection()
            .sortBy('order');

        const notesMap = new Map<string, NoteRecord>();
        notes.forEach(note => notesMap.set(note.id, note));

        set({
            notes: notesMap,
            notesArray: notes,
            loading: false,
            currentProjectId: null, // No specific project in browser mode
        });
    } catch (error) {
        set({ error: (error as Error).message, loading: false });
    }
},
```

**Analysis:**
- Queries ALL notes from Dexie with `db.notes.toCollection()`
- **Sets `currentProjectId: null`** - this is a critical contamination point
- No project filtering - returns notes from ALL projects
- Notes in the store will have varying `projectId` values

### 2.3 When Each Function Is Called

| Scenario | Route | Function Called | Result |
|----------|-------|-----------------|--------|
| Browser mode (all notes) | `/notes` | `loadAllNotes()` | All notes loaded, `currentProjectId = null` |
| Project-specific | `/notes/$projectId` | `loadNotes(projectId)` | Filtered notes, `currentProjectId = projectId` |
| Project change | Navigation | `loadNotes(newProjectId)` | Switches to new project |
| Auto-import complete | File sync | `loadNotes(projectId)` | Reloads after import |

---

## 3. Route Parameter to Note Resolution

### 3.1 Current Flow

The route pattern `/notes/$projectId` uses `projectId` as a route parameter, NOT `noteId`. This is a key architectural decision:

```
URL: /notes/project-alpha
              └── projectId (not noteId)

Note selection happens via:
1. Sidebar click → setActiveNote(noteId)
2. Note stored in NoteStore.activeNoteId
3. NoteEditor receives noteId prop from parent
4. NoteEditor fetches: notes.get(noteId)
```

### 3.2 Resolution Process

```typescript
// In NotesPage.tsx - handleNoteSelect
const handleNoteSelect = (noteId: string) => {
    setActiveNote(noteId);
};

// In NoteEditor.tsx
const note = notes.get(noteId);  // ← No validation here!

if (!note) {
    return <EmptyState />;
}

// Note passed to BlockNote
const initialContent = note?.blocks || [];
```

### 3.3 Potential Issue: No Validation

**The NoteEditor receives a noteId and fetches the note directly from the store WITHOUT validating:**
1. That the note exists
2. That the note.projectId matches the current project context
3. That the note has valid BlockNote block structure

---

## 4. Contamination Points Identified

### 4.1 CP-01: Browser Mode Loads All Projects (CRITICAL)

**Location:** `loadAllNotes()` in `note-crud-slice.ts:74-98`

**Problem:** When in browser mode, ALL notes from ALL projects are loaded into the store. This means:
- Notes with different `projectId` values coexist in the same store
- The store's `currentProjectId` is `null`
- UI cannot distinguish which project a note belongs to

**Impact:**
- User sees notes from unrelated projects mixed together
- Creating a new note will set `projectId: null` (see CP-02)
- Saving might update notes from wrong projects

---

### 4.2 CP-02: createNote Uses currentProjectId Without Validation (CRITICAL)

**Location:** `createNote()` in `note-crud-slice.ts:105-159`

```typescript
createNote: async (params?: CreateNoteParams) => {
    const { currentProjectId } = get();
    if (!currentProjectId) {
        throw new Error('No project selected');
        // ⚠️ This throws, preventing note creation in browser mode!
    }

    const newNote: NoteRecord = {
        id: noteId,
        projectId: currentProjectId,  // ← Uses store value
        ...
    };
```

**Problem:**
- In browser mode, `currentProjectId` is `null`
- `createNote()` throws "No project selected"
- **Users cannot create new notes in browser mode!**

**Impact:**
- UX blocker - browser mode is broken for note creation
- Confusing error message

---

### 4.3 CP-03: File Import Lacks Project Context (HIGH)

**Location:** `importFileAsNote()` in `note-crud-operations.ts:57-88`

```typescript
export async function importFileAsNote(
    filePath: string,
    fileAdapter: FileAdapter,
    noteStore: NoteStore  // ← NoteStore interface has NO projectId param!
): Promise<void> {
    // ...
    if (noteId && noteStore.notes.has(noteId)) {
        await noteStore.updateNote({
            id: noteId,
            title,
            blocks
        });
        // ⚠️ updateNote uses currentProjectId from store!
        // If in browser mode, which project does this belong to?
    } else {
        const newNoteId = await noteStore.createNote({
            title,
            blocks
        });
        // ⚠️ createNote uses currentProjectId from store!
    }
}
```

**Problem:**
- File import doesn't receive or set project context
- Imported notes use whatever `currentProjectId` is in the store
- In browser mode, imported notes get `projectId: null`

**Impact:**
- Notes imported from files may have wrong or null project association
- Difficult to organize imported notes

---

### 4.4 CP-04: File Sync Auto-Sync Uses All Notes (MEDIUM)

**Location:** `syncNoteChanges()` in `note-crud-operations.ts:101-119`

```typescript
export async function syncNoteChanges(
    noteStore: NoteStore,
    fileAdapter: FileAdapter,
    targetDirectory: string
): Promise<void> {
    const notes = noteStore.notesArray;  // ← All notes in store!
    
    for (const note of notes) {
        const filePath = noteToFilePath(note, targetDirectory);
        const markdown = noteToMarkdown(note);
        if (fileAdapter.writeFile) {
            await fileAdapter.writeFile(filePath, markdown);
        }
    }
}
```

**Problem:**
- In browser mode, ALL notes are synced to the filesystem
- Notes from different projects get mixed in the same directory
- No filtering by project

**Impact:**
- File system pollution with mixed projects
- Difficult to manage file-based organization

---

### 4.5 CP-05: NoteEditor Doesn't Validate Project Match (MEDIUM)

**Location:** `NoteEditor.tsx:381-410`

```typescript
export function NoteEditor({ noteId, className, readOnly = false }: NoteEditorProps) {
    const notes = useNoteStore((state) => state.notes);
    const note = notes.get(noteId);  // ← Direct lookup, no validation!

    if (!note) {
        return <EmptyState />;
    }

    const initialContent = useMemo(() => {
        // No check that note.projectId matches current project
        if (!note?.blocks || note.blocks.length === 0) {
            return undefined;
        }
        // Sanitize and return blocks...
    }, [noteId, note?.blocks]);
```

**Problem:**
- If noteId is passed from parent, it's used directly
- No validation that the note belongs to the current project context
- If user navigates to a note from a different project, it still loads

**Impact:**
- Cross-project note viewing possible
- Block corruption errors if note doesn't exist

---

## 5. BlockNote Error Analysis

### 5.1 Error Message Interpretation

The reported error "no clear boundaries between file system and browser database" suggests:

1. **Data mixing:** Notes from file system import and browser DB are stored together
2. **Project isolation failure:** No separation between projects
3. **Block corruption:** BlockNote cannot parse blocks due to mixed/missing project metadata

### 5.2 Why Blocks Get Corrupted

When `loadAllNotes()` loads notes from all projects:
- Notes may have different BlockNote schema versions
- Some notes may have been imported from files with different block formats
- The sanitization in NoteEditor may fail on malformed blocks from mixed sources

```typescript
// In NoteEditor.tsx - sanitizeBlocks function
function sanitizeBlocks(blocks: any[]): any[] {
    if (!blocks || !Array.isArray(blocks)) return [];
    
    // Filters invalid block types
    const validBlockTypes = new Set([
        'paragraph', 'heading', 'bulletListItem', /* ... */
    ]);
    
    // But this doesn't catch blocks from different schema versions!
}
```

---

## 6. Recommendations

### 6.1 Immediate Fixes

#### Fix CP-02: createNote with Browser Mode Project ID

```typescript
// In note-crud-slice.ts - createNote
createNote: async (params?: CreateNoteParams) => {
    let { currentProjectId } = get();
    
    // Browser mode: Use 'notes:browser-mode' project
    if (!currentProjectId) {
        currentProjectId = 'notes:browser-mode';
    }
    
    // Rest of implementation...
};
```

#### Fix CP-03: Import with Project Context

```typescript
// Modify NoteFolderBridge to accept projectId
async importFileAsNote(
    filePath: string,
    fileAdapter: FileAdapter,
    noteStore: NoteStore,
    projectId: string  // NEW PARAMETER
): Promise<void> {
    // Use projectId when creating/updating notes
    if (noteId && noteStore.notes.has(noteId)) {
        await noteStore.updateNote({
            id: noteId,
            title,
            blocks,
            projectId  // Pass explicitly
        });
    }
}
```

### 6.2 Architectural Improvements

#### 1. Enforce Project Boundaries

Add project validation at store level:

```typescript
// In note-store-refactored.ts
const validateProjectBoundary = (noteId: string, projectId: string) => {
    const note = get().notes.get(noteId);
    if (!note || note.projectId !== projectId) {
        throw new Error(`Note ${noteId} does not belong to project ${projectId}`);
    }
};
```

#### 2. Separate Stores by Project

Consider creating isolated store instances per project instead of sharing a single store.

#### 3. Add Project Tag to Blocks

Store project context within BlockNote block metadata for audit trail.

---

## 7. Files Involved

| File | description | Issues |
|------|---------|--------|
| `src/lib/notes/note-crud-slice.ts` | CRUD operations | CP-01, CP-02, CP-03 |
| `src/lib/notes/note-store-refactored.ts` | Zustand store composition | Store design |
| `src/presentation/components/notes/NotesPage.tsx` | Main page component | Calls load functions |
| `src/routes/notes.lazy.tsx` | Browser mode route | Sets up browser mode |
| `src/routes/notes.$projectId.lazy.tsx` | Project mode route | Sets up project mode |
| `src/infrastructure/sync/workspace-services/notes/note-crud-operations.ts` | File sync CRUD | CP-03, CP-04 |
| `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | File import bridge | CP-03 |
| `src/lib/filesync/hooks/use-file-sync-service.ts` | File sync hook | No project context |
| `src/presentation/components/notes/NoteEditor.tsx` | BlockNote editor | CP-05 |
| `src/infrastructure/persistence/dexie-db.ts` | Dexie database | Schema design |
| `src/infrastructure/persistence/dexie-db-knowledge-types.ts` | NoteRecord type | No project validation |

---

## 8. Conclusion

The BlockNote error stems from fundamental **project boundary violations** in the note data flow:

1. **Browser mode** (`loadAllNotes`) bypasses project filtering
2. **Store design** uses a single store for all projects
3. **File sync** operates without project context
4. **No validation** exists between route params and note ownership

**Recommended Priority:**
1. **CRITICAL:** Fix `createNote` in browser mode (CP-02)
2. **HIGH:** Add project context to file import (CP-03)
3. **MEDIUM:** Validate note-project relationship in NoteEditor (CP-05)
4. **LOW:** Improve block schema validation

Implementing these fixes will restore clear boundaries between file system and browser database, resolving the BlockNote error.
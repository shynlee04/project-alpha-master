# Notes Plugin Data Flow Investigation

**Date**: 2026-01-27
**Investigator**: analyst-ext (Subagent)
**Status**: ROOT CAUSE IDENTIFIED
**Severity**: HIGH - Core Feature Broken

---

## Executive Summary

The Notes plugin fails to display markdown files selected from FileTree due to an **architectural mismatch between storage identification paradigms**:

1. **FileTree** uses FSA file paths (e.g., `/project/docs/readme.md`)
2. **Notes plugin/NoteEditor** uses internal UUID-based note IDs (e.g., `note-1234-5678`)

When FileTree opens a markdown file, it passes the file path to the coordination context. NotesPlugin receives this path and passes it to NoteEditor as `noteId`. NoteEditor then tries to look up `notes.get("/project/docs/readme.md")`, but the notes Map is keyed by **internal note IDs**, not file paths. The lookup fails, returning `undefined`, and the user sees "Select a note to start editing."

**There is NO bridge code connecting FSA file paths to the note store's UUID-based identification.**

---

## Data Flow Trace

### Step-by-Step Analysis

```
User clicks .md file in FileTree
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ FileTreePlugin.tsx (lines 131-159)                                 │
│ handleSelect() → reads file via gateway.read(node.path)            │
│ → coord.setActiveDocument(node.path, content)                      │
│ → coord.openDocument(node.path, 'filetree')                        │
│ Result: Coordination store has {path: "/project/readme.md",        │
│         content: "# Hello World..."}                               │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NotesPlugin.tsx (lines 78-96)                                      │
│ Gets noteId from: coordination?.activeDocument?.path               │
│ If path ends with .md/.mdx → uses path as noteId                   │
│ Passes to: <NoteEditor noteId={noteId} />                          │
│ Result: noteId = "/project/readme.md" (FULL PATH!)                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NoteEditor.tsx (lines 452-460)                                     │
│ const notes = useNoteStore((s) => s.notes);                        │
│ const note = notes.get(noteId);                                    │
│                                                                    │
│ FAILURE: notes.get("/project/readme.md") returns undefined!        │
│                                                                    │
│ Why? notes Map is keyed by note ID (e.g., "note-abc123"),         │
│ NOT by file paths!                                                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NoteEditor renders empty state:                                    │
│ "Select a note to start editing"                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Storage Architecture Analysis

### Current State (BROKEN)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        TWO DISCONNECTED WORLDS                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐           ┌─────────────────────┐           │
│  │   FSA/File System   │           │   IndexedDB/Dexie   │           │
│  │   (File Paths)      │           │   (Note IDs)        │           │
│  ├─────────────────────┤           ├─────────────────────┤           │
│  │ /notes/note.md      │           │ note-abc123-def456  │           │
│  │ /docs/readme.md     │◄─────X────┤ note-xyz789-uvw012  │           │
│  │ /src/code.md        │   NO      │ note-lmn345-opq678  │           │
│  └─────────────────────┘  BRIDGE   └─────────────────────┘           │
│         ▲                    │              ▲                        │
│         │                    │              │                        │
│  FileTree uses paths   ─────X───── NoteEditor uses IDs               │
│  Coordination stores          │    Note Store uses IDs               │
│  paths + content              │                                      │
│                               │                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Evidence

| Component | Identification Method | Evidence |
|-----------|----------------------|----------|
| **FileTree** | FSA file path | `coord.setActiveDocument(node.path, content)` (line 147) |
| **NotesPlugin** | Uses path from coordination | `noteId = coordination?.activeDocument?.path` (line 80-84) |
| **NoteEditor** | Expects note store ID | `notes.get(noteId)` (line 456) |
| **Note Store** | UUID-based keys | `notes.forEach(n => notesMap.set(n.id, n))` (crud-slice line 141) |
| **NoteGateway** | UUID-based paths | `getNotePath(noteId)` returns `/notes/${noteId}.md` (line 90-91) |

---

### Expected State (WORKING)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        UNIFIED APPROACH NEEDED                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Option A: Use Content Directly from Coordination                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                      │
│  FileTree → Coordination Store → NoteEditor                          │
│                  │                    │                              │
│                  │ path + content     │ use content directly         │
│                  ▼                    ▼                              │
│           activeDocument.content → markdownToBlocks() → BlockNote    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                      │
│  Option B: Create Path-to-ID Mapping                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                      │
│  Note Store maintains:                                               │
│    notesByPath: Map<string, string>  // path → noteId                │
│    notes: Map<string, NoteRecord>    // noteId → NoteRecord          │
│                                                                      │
│  When NotesPlugin receives path:                                     │
│    1. Look up noteId = notesByPath.get(path)                         │
│    2. Get note = notes.get(noteId)                                   │
│    3. If not found, create ephemeral note from content               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Legacy Code Identified

| File | Type | Issue | Action |
|------|------|-------|--------|
| `src/plugins/notes/NotesPlugin.tsx` | **Hybrid Broken** | Uses path as noteId without translation | **FIX** |
| `src/presentation/components/notes/NoteEditor.tsx` | Modern | Expects note store ID, doesn't use coordination content | **FIX** |
| `src/lib/notes/note-store-refactored.ts` | Modern | No path-to-ID mapping | Keep |
| `src/lib/notes/slices/note-crud-slice.ts` | Modern | Keys by note.id, not path | Keep |
| `src/infrastructure/context/plugin-coordination-context.tsx` | Modern | Provides activeDocument.content (unused!) | Keep |
| `src/infrastructure/persistence/stores/plugin-coordination-store.ts` | Modern | Stores path + content correctly | Keep |
| `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | Legacy | Imports from folder, not for live editing | Keep |
| `src/lib/notes/markdown-converter.ts` | Utility | Has `markdownToBlocks()` - can be used | Keep |
| `src/domain/services/note-gateway.ts` | Modern | Reads/writes by noteId, not path | Keep |

---

## Root Causes

### 1. **PRIMARY: Missing Path-to-Content Bridge** (Critical)

**Location**: `src/plugins/notes/NotesPlugin.tsx` and `src/presentation/components/notes/NoteEditor.tsx`

**Problem**: When NotesPlugin receives a file path from coordination, it passes it directly to NoteEditor as `noteId`. NoteEditor only knows how to look up notes from the note store by their internal UUID. It completely ignores `coordination.activeDocument.content` which already contains the file content!

**Evidence**:
```tsx
// NotesPlugin.tsx (lines 78-84)
const noteId = React.useMemo(() => {
  if (coordination?.activeDocument?.path) {
    const activePath = coordination.activeDocument.path;
    if (activePath.endsWith('.md') || activePath.endsWith('.mdx')) {
      return activePath;  // ❌ Returns PATH, but NoteEditor expects UUID!
    }
  }
  // ...
}, [project, coordination?.activeDocument?.path]);

// NoteEditor.tsx (line 456)
const note = notes.get(noteId);  // ❌ notes Map uses UUIDs as keys, not paths!
```

### 2. **SECONDARY: Content Already Available But Not Used**

**Location**: `plugin-coordination-store.ts` line 163

**Problem**: The coordination store correctly stores both `path` AND `content`:
```tsx
const activeDocument: SharedDocument = {
  path,
  content,        // ← This is the markdown content!
  lastModified: Date.now(),
  // ...
};
```

But NoteEditor never reads `activeDocument.content`. It only tries to look up by ID in the notes store.

### 3. **TERTIARY: No Markdown-to-BlockNote Conversion for External Files**

**Location**: `NoteEditor.tsx`

**Problem**: Even if NoteEditor read `activeDocument.content`, it would need to convert the markdown to BlockNote blocks using `markdownToBlocks()`. This conversion pipeline doesn't exist for files opened via FileTree.

---

## Cleanup Plan

### Phase 1: Immediate Fixes (4-6 hours)

#### Fix 1.1: Update NotesPlugin to Detect External Files

**File**: `src/plugins/notes/NotesPlugin.tsx`

```tsx
// Before line 78, add detection logic:
const isExternalFile = React.useMemo(() => {
  if (!coordination?.activeDocument?.path) return false;
  const path = coordination.activeDocument.path;
  // External if path contains slashes (not just a noteId)
  return path.includes('/') && (path.endsWith('.md') || path.endsWith('.mdx'));
}, [coordination?.activeDocument?.path]);

// Modify what gets passed to NoteEditor:
// If external file, pass special props for content loading
```

#### Fix 1.2: Update NoteEditor to Handle External Content

**File**: `src/presentation/components/notes/NoteEditor.tsx`

Add new props:
```tsx
interface NoteEditorProps {
  noteId: string;
  className?: string;
  readOnly?: boolean;
  // NEW: For external files opened via FileTree
  externalContent?: string;  // Raw markdown content
  externalPath?: string;     // File path for saving
}
```

When `externalContent` is provided:
1. Skip note store lookup
2. Convert markdown to blocks using `markdownToBlocks()`
3. Create ephemeral editor instance
4. Save changes back to coordination store for sync

#### Fix 1.3: Wire Markdown Conversion

```tsx
// In NoteEditor, when externalContent is provided:
import { markdownToBlocks } from '@/infrastructure/sync/workspace-services/notes/note-markdown-parser';

const blocks = await markdownToBlocks(externalContent);
// Use blocks as initialContent for BlockNote editor
```

### Phase 2: Architecture Alignment (8-12 hours)

#### Fix 2.1: Add Path-Based Note Lookup

**File**: `src/lib/notes/slices/note-crud-slice.ts`

Add secondary index:
```tsx
notesByPath: Map<string, string>  // filePath → noteId

// When loading notes, populate this map:
notes.forEach(note => {
  notesMap.set(note.id, note);
  if (note.filePath) {
    notesByPathMap.set(note.filePath, note.id);
  }
});
```

#### Fix 2.2: Add getNoteByPath Query

**File**: `src/lib/notes/slices/note-query-slice.ts`

```tsx
getNoteByPath: (path: string): NoteRecord | undefined => {
  const { notesByPath, notes } = get();
  const noteId = notesByPath.get(path);
  return noteId ? notes.get(noteId) : undefined;
}
```

### Phase 3: Legacy Removal (2-4 hours)

#### Files to Archive (After Phase 1 & 2 Complete)

| File | Reason |
|------|--------|
| `src/lib/notes/sync/` | Consolidate sync logic in infrastructure layer |
| `src/lib/notes/note-file-sync.ts` | Duplicate of infrastructure sync service |

---

## Recommended Actions (Priority Order)

1. **[P0 - CRITICAL]** Update `NotesPlugin.tsx` to detect external file paths vs internal note IDs
2. **[P0 - CRITICAL]** Update `NoteEditor.tsx` to accept external content prop and render markdown directly
3. **[P1 - HIGH]** Add `markdownToBlocks()` conversion when loading external files
4. **[P2 - MEDIUM]** Add path-to-ID mapping in note store for persistent external files
5. **[P3 - LOW]** Implement save-back logic for external files via coordination store

---

## Technical Implementation Notes

### For dev-ext Handoff

**Entry Point**: `src/plugins/notes/NotesPlugin.tsx`

**Key Files to Modify**:
1. `src/plugins/notes/NotesPlugin.tsx` - Add external file detection
2. `src/presentation/components/notes/NoteEditor.tsx` - Add external content handling

**Existing Utilities to Reuse**:
- `markdownToBlocks()` from `@/infrastructure/sync/workspace-services/notes/note-markdown-parser`
- `usePluginCoordinationSafe()` for accessing `activeDocument.content`

**Test Scenario**:
1. Open project with FSA (desktop mode)
2. Navigate to a markdown file in FileTree
3. Click the file
4. Notes plugin should display the markdown content in BlockNote editor

**Success Criteria**:
- [ ] Clicking .md file in FileTree displays content in Notes plugin
- [ ] External file content renders correctly as BlockNote blocks
- [ ] Editing external file content persists changes
- [ ] No regression for internal notes (created via Notes workspace)

---

## Appendix: File Locations

```
src/
├── plugins/
│   ├── filetree/
│   │   └── FileTreePlugin.tsx      # File selection handler
│   └── notes/
│       ├── NotesPlugin.tsx         # ← FIX HERE: External file detection
│       └── useNotesPlugin.ts       # Hook for plugin state
├── presentation/components/notes/
│   └── NoteEditor.tsx              # ← FIX HERE: External content handling
├── infrastructure/
│   ├── context/
│   │   └── plugin-coordination-context.tsx  # Provides activeDocument
│   ├── persistence/stores/
│   │   └── plugin-coordination-store.ts     # Stores path + content
│   └── sync/workspace-services/notes/
│       └── note-markdown-parser.ts          # markdownToBlocks()
└── lib/notes/
    ├── note-store-refactored.ts    # Note store (ID-based)
    └── slices/
        └── note-crud-slice.ts      # CRUD operations
```

---

**Report Complete**

*Generated by analyst-ext subagent*
*Investigation Duration: ~45 minutes*
*Files Analyzed: 15+*
*Lines Traced: 2500+*

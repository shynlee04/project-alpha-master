# ARTIFACT 4: NOTES Workspace - Left Panes Investigation
**Date:** 2026-01-13
**Workspace:** NOTES
**Focus:** Left Sidebar Panes
**Status:** INVESTIGATION COMPLETE

---

## ULTRA-THINK: What This Artifact Is

**This IS:**
- ✅ Evidence-based investigation of NOTES workspace left panes
- ✅ All props documented from actual component files
- ✅ Feature mapping and user flow analysis
- ✅ Component connection hierarchy

**This is NOT:**
- ❌ Assumptions without code verification
- ❌ Implementation recommendations
- ❌ Solutions without investigation

---

## LEFT PANE ARCHITECTURE

```
NoteSidebar (Left Container - 20-30% width)
    ├── Header (Actions + Selectors)
    │   ├── Search
    │   ├── Filter (Favorites)
    │   ├── View Switcher (Notes/Files/AI)
    │   ├── Agent Selector Slot
    │   └── Project Selector Slot
    └── View Content
        ├── NoteTree (Notes view)
        ├── ProjectFilesPanel (Files view)
        └── NotesRAGSearch (AI view)
```

---

## COMPONENT 1: NoteSidebar

**File:** `src/presentation/components/notes/NoteSidebar.tsx:70`

**Props:**
```typescript
interface NoteSidebarProps {
    notes: NoteRecord[];
    activeNoteId: string | null;
    onNoteSelect: (noteId: string) => void;
    onCreateNote: () => void;
    onImport?: () => void;
    onExport?: () => void;
    onIndexForRAG?: () => void; // Deprecated
    onFileSync?: () => void;
    onSlashCommands?: () => void;
    agentSelectorSlot?: React.ReactNode;
    projectSelectorSlot?: React.ReactNode;
    projectId?: string;
    projectName?: string;
}
```

**Features Enabled:**
- Three view modes: Notes, Files, AI Search
- Search with debouncing (150ms)
- Favorites filter toggle
- Import/Export buttons (NR-06)
- Agent and project selector slots
- Create note button
- File sync and slash commands buttons
- RAG indexing button (deprecated)

**Connected To:**
- **Children:** NoteTree (notes view), ProjectFilesPanel (files view), NotesRAGSearch (AI view)
- **Callbacks:** NoteEditor via onNoteSelect
- **Slots:** AgentManager, ProjectSelector

**User Flow:**
1. NoteSidebar loads with default "Notes" view
2. User can search notes, filter favorites, or switch to Files/AI views
3. Clicking a note triggers onNoteSelect → updates active note in store → NoteEditor re-renders
4. Agent selector and project selector maintain workspace state

---

## COMPONENT 2: NoteTree

**File:** `src/presentation/components/notes/NoteTree.tsx:33`

**Props:**
```typescript
interface NoteTreeProps {
    notes: NoteRecord[];
    activeNoteId: string | null;
    onNoteSelect: (noteId: string) => void;
}
```

**Features Enabled:**
- Recursive tree rendering for hierarchical notes
- Search filtering integration
- Favorites filtering integration
- Keyboard navigation support
- Empty state handling
- Active state highlighting

**Connected To:**
- **Children:** NoteTreeItem (recursive)
- **Store:** NoteNavigationStore (search/favorites)
- **Callback:** NoteEditor via onNoteSelect

**User Flow:**
1. NoteTree receives notes array and builds hierarchical structure
2. Applies search/filters from NoteNavigationStore
3. Renders NoteTreeItem components for each node
4. Clicking a node calls onNoteSelect → updates active note

---

## COMPONENT 3: ProjectFilesPanel

**File:** `src/presentation/components/notes/ProjectFilesPanel.tsx:64`

**Props:**
```typescript
// None (self-contained)
```

**Features Enabled:**
- Import project files as notes
- Preview images and PDFs directly
- Create new files/folders (P1.5-02)
- File tree with context menu
- Sync status indicators
- File download functionality

**Connected To:**
- **Components:** FileTree component for file browsing
- **Store:** NoteStore for creating notes from files
- **Hook:** useWorkspaceSync for directory management

**User Flow:**
1. User switches to "Files" view in NoteSidebar
2. ProjectFilesPanel renders file tree
3. User can click files to import (text files) or preview (images/PDFs)
4. Text files are converted to notes via createNote()
5. Images/PDFs open in preview dialog

---

## COMPONENT 4: NotesRAGSearch

**File:** `src/presentation/components/notes/NotesRAGSearch.tsx:22`

**Props:**
```typescript
projectId: string
onNoteSelect: (noteId: string) => void
```

**Features Enabled:**
- Semantic search using vector + fulltext hybrid
- Real-time results with relevance scores
- Click to open note in editor
- Shows highlighted snippets
- Loading states

**Connected To:**
- **Service:** hybridSearch from @/lib/rag
- **Callback:** NoteEditor via onNoteSelect

**User Flow:**
1. User switches to "AI" view in NoteSidebar
2. NotesRAGSearch renders search interface
3. User enters query → hits Enter or clicks search
4. Results appear with scores and highlights
5. Clicking result extracts note ID → calls onNoteSelect

---

## STATE MANAGEMENT FOR LEFT PANES

### note-navigation-store.ts
```typescript
// Manages sidebar UI state
{
  searchQuery: string
  filterFavorites: boolean
  expandedFolders: Set<string>
  activeView: 'notes' | 'files' | 'ai'
}
```

### Connections
| Component | Store Used | State Managed |
|-----------|------------|---------------|
| NoteSidebar | note-navigation-store | View mode, search, filters |
| NoteTree | note-navigation-store | Tree expansion, filters |
| ProjectFilesPanel | useWorkspaceSync | Directory state |
| NotesRAGSearch | None (local) | Search results |

---

## IDENTIFIED ISSUES

### High (P1)
1. **RAG indexing button deprecated** - `onIndexForRAG` marked deprecated but still in props
   - **Evidence:** NoteSidebar.tsx:12
2. **No bulk operations** - Can't select multiple notes for batch actions

### Medium (P2)
3. **View state not persisted** - Active view resets on page reload
4. **No drag-drop between folders** - NoteTree doesn't support reorganization via drag

---

## DELIVERABLES STATUS

- ✅ NoteSidebar investigated
- ✅ NoteTree investigated
- ✅ ProjectFilesPanel investigated
- ✅ NotesRAGSearch investigated
- ✅ State management mapped
- ✅ User flows documented

---

**Last Updated:** 2026-01-13
**Version:** 1.0
**Agent ID:** a83bfee

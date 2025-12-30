# Story 26-5: Note Hierarchy & Sidebar Navigation

**Epic:** Epic 26 - Intelligent Knowledge Base
**Status:** 🔄 IN PROGRESS
**Started:** 2025-12-31T00:00:00+07:00
**Priority:** MEDIUM - UX Enhancement to complete Epic 26

---

## User Story

**As a** user with many notes,
**I want** to organize notes in a tree structure,
**So that** I can quickly navigate my knowledge base like Notion.

---

## Acceptance Criteria

### AC1: Tree Structure Display
**Given** a user has multiple notes
**When** they view the Notes sidebar
**Then** notes are displayed in a tree structure
**And** notes can be nested infinitely (parent-child relationship)
**And** drag-and-drop rearranges notes within the tree

### AC2: Parent-Child Relationships
**Given** a user drags a note onto another
**When** they drop it
**Then** the dragged note becomes a child of the target
**And** hierarchy persists to Dexie
**And** tree state (expanded/collapsed) is restored on reload

### AC3: Favorites Section
**Given** a user wants to favorite a note
**When** they click the star icon
**Then** the note appears in "Favorites" section at top of sidebar
**And** favorites are synced to Dexie

### AC4: Mobile Drawer Navigation
**Given** a mobile user
**When** they open Notes panel
**Then** note tree is in a swipeable drawer
**And** editor is full-width when open
**And** "Back to list" gesture returns to tree view

### AC5: Instant Search
**Given** a user searches notes
**When** they type in search box
**Then** search filters the tree to matching notes
**And** search is instant (debounced 150ms)
**And** keyboard navigation (arrow keys) works in results

---

## Implementation Plan

### Phase 1: Store & Types (Foundation)
**Files:**
- `src/lib/notes/note-navigation-store.ts` - Zustand store for tree state
- `src/lib/notes/note-tree-utils.ts` - Tree manipulation utilities

**Features:**
- Expanded/collapsed state persistence
- Drag-and-drop state management
- Search state with debouncing
- Favorites filtering
- Keyboard navigation state

### Phase 2: Tree Components
**Files:**
- `src/components/notes/NoteTree.tsx` - Main tree component
- `src/components/notes/NoteTreeItem.tsx` - Individual tree item
- `src/components/notes/NoteSidebar.tsx` - Sidebar container

**Features:**
- Recursive tree rendering
- Drag-and-drop with @dnd-kit/core
- Expand/collapse toggle
- Favorite star button
- Search input with debouncing
- Keyboard navigation

### Phase 3: Integration
**Files:**
- Update `src/components/notes/NotesPage.tsx`
- Update i18n files (`en.json`, `vi.json`)

**Features:**
- Replace flat list with tree sidebar
- Mobile drawer navigation
- Favorites section at top
- Search box integration
- Full i18n support

---

## Technical Specifications

### NoteRecord Schema (Already Exists)
```typescript
interface NoteRecord {
  id: string;           // UUID
  projectId: string;
  title: string;
  emoji?: string;       // Optional icon
  blocks: unknown[];    // BlockNote JSON structure
  parentId?: string;    // ✅ For nesting (already in schema)
  isFavorite: boolean;  // ✅ Favorites (already in schema)
  order: number;        // ✅ Sort order (already in schema)
  createdAt: number;
  updatedAt: number;
}
```

### Tree Data Structure
```typescript
interface TreeNode {
  id: string;
  note: NoteRecord;
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
}
```

### Navigation Store State
```typescript
interface NavigationState {
  // Tree state
  expandedNodes: Set<string>;
  toggleExpanded: (id: string) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Favorites filter
  showFavoritesOnly: boolean;
  toggleFavoritesFilter: () => void;

  // Drag-and-drop state
  draggedNodeId: string | null;
  setDraggedNode: (id: string | null) => void;

  // Keyboard navigation
  focusedNodeId: string | null;
  setFocusedNode: (id: string | null) => void;
}
```

---

## Design Mockups

### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ Notes                      [🔍 Search...] [⭐] [➕]    │
├─────────────────────────────────────────────────────────┤
│ ⭐ Favorites                                          │
│   📄 Important Note                                    │
│                                                       │
│ 📁 Personal                                           │
│   📄 Journal Entry                                    │
│   📁 Projects                                        │
│     📄 Project Alpha                                  │
│     📄 Project Beta                                   │
│   📄 Todo List                                        │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (Drawer)
```
┌─────────────────────────────────┐
│ ← Back    Notes      [➕]       │
├─────────────────────────────────┤
│ [Swipeable Drawer]              │
│  ⭐ Favorites                   │
│  📄 Note 1                      │
│  📁 Folder                       │
│    📄 Child Note                │
└─────────────────────────────────┘
```

---

## Dependencies

### External Libraries
- `@dnd-kit/core` - Drag-and-drop functionality
- `@dnd-kit/sortable` -Sortable tree items
- `@dnd-kit/utilities` - Drag-and-drop utilities

### Internal Dependencies
- `useNoteStore` from `@/lib/notes/note-store`
- `db` from `@/lib/state/dexie-db`
- `useResponsive` from `@/hooks/useResponsive`

---

## Testing Strategy

### Unit Tests
- Tree utilities (buildTree, flattenTree, moveNode)
- Navigation store actions
- Search debouncing

### Component Tests
- NoteTree rendering
- NoteTreeItem drag-and-drop
- Favorite toggle
- Search filtering
- Keyboard navigation

### Integration Tests
- Full sidebar workflow
- Mobile drawer interaction
- Persistence across reloads

---

## NFR Validation

| NFR ID | Requirement | Target | Test |
|--------|-------------|--------|------|
| NFR-PERF-P3-05 | Tree navigation | 60fps | Render performance test |
| NFR-USE-P3-01 | Mobile note editing | Touch-friendly | Mobile interaction test |
| NFR-REL-P3-01 | Note persistence | 99%+ | State persistence test |

---

## Demo Checkpoints

1. ✨ Create nested notes → Drag-and-drop reorder
2. ✨ Favorite notes → Favorites section filtering
3. ✨ Mobile drawer → Swipeable navigation
4. ✨ Search → Instant filtering with debouncing
5. ✨ Keyboard → Arrow key navigation

---

## Progress Tracking

| Task | Status | Notes |
|------|--------|-------|
| Navigation store | ⏳ TODO | Need to create |
| Tree utilities | ⏳ TODO | Need to create |
| NoteTree component | ⏳ TODO | Need to create |
| NoteTreeItem component | ⏳ TODO | Need to create |
| NoteSidebar component | ⏳ TODO | Need to create |
| NotesPage integration | ⏳ TODO | Update existing |
| i18n translations | ⏳ TODO | Add EN + VI keys |
| Tests | ⏳ TODO | Write tests |

---

## Implementation Notes

### Drag-and-Drop Strategy
Using `@dnd-kit/core` for modern, accessible drag-and-drop:
- Better performance than react-dnd
- Built-in keyboard support
- Mobile touch support
- Tree structure handling

### Search Debouncing
Using `useDebouncedCallback` from `@tanstack/pacer`:
- 150ms debounce
- Instant feedback on first keystroke
- Performance optimization for large note sets

### State Persistence
Using Zustand persist middleware:
- Expanded/collapsed state
- Favorites filter
- Search query (optional)

### Mobile Responsiveness
Using existing `useResponsive` hook:
- Drawer navigation for mobile
- Full-width editor when note selected
- Back gesture to return to tree

---

**Story Created:** 2025-12-31T00:00:00+07:00
**Last Updated:** 2025-12-31T00:00:00+07:00
**Status:** 🔄 IN PROGRESS - Implementation started

---
title: "6-3 Source Management (Delete, Rename, Organize)"
epic: "Epic 6: Source Ingestion & Management"
story: "6-3-source-management"
status: "ready-for-dev"
priority: "P0"
points: 5
created: "2025-12-30"
sprint: "SPRINT-6"
team: "Team A"
dependencies:
  - "6-2-source-card-ui"
---

# Story: 6-3 Source Management (Delete, Rename, Organize)

**As a** organized user,
**I want** to manage my sources (delete, rename, organize),
**So that** my knowledge base stays clean and findable.

---

## Story Context

### From Epic 6

Epic 6 delivers "Source Ingestion & Management" with PDF/URL/text import, source card UI, source management, and metadata extraction. Story 6.3 delivers Source Management capabilities including delete with undo, rename, collections, and export functionality.

### User Journey

1. User has imported 10 sources (PDFs, URLs, text)
2. User opens Knowledge tab, sees grid of source cards
3. User hovers over a card, sees context menu (three dots icon)
4. User clicks context menu, sees options: Rename, Delete, Move to Collection, Export
5. User clicks Delete, confirmation dialog appears
6. User confirms, card fades out, toast appears: "Source deleted. Undo?" with 5-second countdown
7. User clicks Undo within 5 seconds → card reappears, source restored
8. User waits 5 seconds → toast disappears, delete is permanent
9. User clicks context menu on another card, selects Rename
10. Inline edit appears on card title, user types new name, presses Enter
11. Title updates on card and everywhere source is referenced
12. User clicks "New Collection" button, names it "ML Research"
13. User drags 3 ML-related sources to collection
14. User filters by collection → sees only those 3 sources

### Technical Context

**Existing Components (from Story 6.2):**
- `SourceCard.tsx`: Card component with quick actions (Open, Delete buttons)
- `SourceCardGrid.tsx`: Responsive grid layout
- `SourcePreviewPanel.tsx`: Preview panel with formatted content
- `useKnowledgeStore`: Zustand store for sources state

**New Components for Story 6.3:**
- `SourceContextMenu.tsx`: Context menu for card actions
- `RenameDialog.tsx`: Inline edit or dialog for renaming
- `CollectionManager.tsx`: Collection creation and management
- `CollectionPanel.tsx`: Collection filtering view
- `UndoToast.tsx`: Toast notification with undo action

**State Management Extensions:**
- Extend `useKnowledgeStore` with:
  - `collections`: Collection[] (id, name, sourceIds[])
  - `deleteQueue`: DeletedSource[] (for undo functionality)
  - `renameSource(id, newName)` action
  - `deleteSource(id)` action (with undo support)
  - `createCollection(name)` action
  - `addSourceToCollection(sourceId, collectionId)` action
  - `removeSourceFromCollection(sourceId, collectionId)` action

**Database Schema (Dexie):**
- Add `collections` table: `id` (key), `projectId`, `name`, `sourceIds`, `createdAt`
- Extend `sources` table: `collections` array (collection IDs)

**Styling:**
- 8-bit gaming aesthetic (dark theme)
- Design tokens for consistent spacing and colors
- Context menu: Positioned dropdown with squared corners
- Toast: Fixed position at bottom-right with animation

### Previous Story Intelligence (Story 6.2)

**Key Learnings from Story 6.2:**
1. **Zustand Store Pattern**: Use `create()` with persist middleware for state persistence
2. **DexieStorage Adapter**: Use existing `createDexieStorage` for IndexedDB persistence
3. **Test Query Strategy**: Use `container.querySelector()` for reliable element selection in jsdom
4. **Icon Components**: Use 8-bit styled SVG icons from `src/components/ui/icons/`
5. **Design Tokens**: Use CSS custom properties from `design-tokens.css`
6. **Responsive Layout**: Use Tailwind responsive classes (md:, lg:)
7. **Component Structure**: Keep components focused and composable
8. **Test Patterns**: Unit tests for state, integration tests for components

**Code Review Fixes Applied in Story 6.2:**
- Added Import Source button to empty state
- Fixed useEffect dependency warnings
- Verified barrel exports

**Files from Story 6.3:**
- `src/lib/state/knowledge-store.ts` (177 lines) - Will extend with collections
- `src/components/knowledge/SourceCard.tsx` (177 lines) - Will add context menu
- `src/components/knowledge/SourceCardGrid.tsx` (71 lines) - Will add collection filter

---

## Acceptance Criteria

### AC-1: Context Menu for Source Actions

**Given** a user hovers over a source card
**When** they click the context menu button (three dots icon)
**Then** a dropdown menu appears with options:
- **Rename**: Edit source title
- **Delete**: Remove source with confirmation
- **Move to Collection**: Add to existing or new collection
- **Export**: Download source as file

**And** context menu styling uses:
- Positioned dropdown (absolute positioning)
- Squared corners (0 border-radius)
- Dark theme colors (from design tokens)
- Hover effect: Background color change
- Animation: Fade in (200ms ease-out)

**And** context menu behavior:
- Closes on click outside
- Closes on Escape key press
- Only one menu open at a time

---

### AC-2: Delete Source with Undo

**Given** a user clicks Delete from context menu
**When** confirmation dialog appears
**Then** dialog shows:
- Message: "Delete '{title}'?"
- Warning: "This will remove the source and all derived artifacts (summaries, flashcards)."
- Confirm button: "Delete" (red color)
- Cancel button: "Cancel"

**Given** a user confirms deletion
**When** delete completes
**Then** the source is:
- Marked as deleted (soft delete) or removed from IndexedDB
- Removed from all collections
- Card removed from grid with fade-out animation (300ms)
- Toast notification appears: "Source deleted. Undo?" with countdown (5 seconds)

**Given** the toast is showing
**When** user clicks Undo within 5 seconds
**Then** the source is:
- Restored to IndexedDB
- Re-added to collections
- Card reappears with fade-in animation
- Toast disappears

**Given** the 5-second countdown expires
**When** toast disappears
**Then** the delete becomes permanent (source cannot be recovered)

---

### AC-3: Rename Source

**Given** a user clicks Rename from context menu
**When** rename mode activates
**Then** the card title becomes editable:
- Text input appears with current title
- Input is focused and text selected
- Save button: "Save" (enabled when title changed)
- Cancel button: "Cancel"

**Given** a user edits the title
**When** they click Save or press Enter
**Then** the new title is:
- Saved to IndexedDB (update `sources` table)
- Updated on the card (immediate UI update)
- Updated everywhere the source is referenced:
  - Preview panel title
  - Collection view
  - Chat citations (if applicable)

**And** title validation:
- Required: Cannot be empty
- Max length: 100 characters
- Trims whitespace

**Given** a user clicks Cancel or presses Escape
**When** rename is cancelled
**Then** the original title is restored and edit mode closes

---

### AC-4: Collections

**Given** a user clicks "New Collection" button
**When** collection creation dialog appears
**Then** dialog shows:
- Text input: "Collection name"
- Create button: "Create" (disabled when name is empty)
- Cancel button: "Cancel"

**Given** a user enters a collection name and clicks Create
**When** collection is created
**Then** a new collection appears:
- In the sidebar: Collection name with count (e.g., "ML Research (3)")
- In the context menu: "Move to {Collection Name}" option

**Given** a user selects "Move to Collection" from context menu
**When** collection selector appears
**Then** user can:
- Select existing collection from dropdown
- Create new collection inline
- Add source to multiple collections (multi-select)

**Given** a source is in a collection
**When** user filters by that collection
**Then** the grid shows only sources in that collection

**And** collection features:
- Sources can be in multiple collections
- Collections are project-specific (not global)
- Collections persist in IndexedDB
- Collections can be renamed (from sidebar context menu)
- Collections can be deleted (removes collection, not sources)

---

### AC-5: Export Source

**Given** a user clicks Export from context menu
**When** export is triggered
**Then** the source is exported:
- **PDF source**: Original PDF file downloaded
- **URL source**: Text content downloaded as `.txt` file
- **Text source**: Text content downloaded as `.txt` file

**And** download behavior:
- File name: `{sanitized-title}.{ext}`
- Browser download triggered (anchor tag with download attribute)
- Progress indicator for large files

---

## Tasks / Subtasks

### Task 1: Extend Knowledge Store with Management Actions
- [ ] Extend `useKnowledgeStore` with new state and actions
  - [ ] Add `collections` state (Collection[])
  - [ ] Add `undoQueue` state (DeletedSource[])
  - [ ] Add `renameSource(sourceId, newName)` action
  - [ ] Add `deleteSource(sourceId)` action with soft delete
  - [ ] Add `undoDelete(sourceId)` action
  - [ ] Add `createCollection(name)` action
  - [ ] Add `updateCollection(collectionId, updates)` action
  - [ ] Add `deleteCollection(collectionId)` action
  - [ ] Add `addSourceToCollection(sourceId, collectionId)` action
  - [ ] Add `removeSourceFromCollection(sourceId, collectionId)` action
  - [ ] Add `filterByCollection(collectionId)` selector
- [ ] Update Dexie schema to add `collections` table
  - [ ] Define `Collection` interface: id, projectId, name, sourceIds, createdAt
  - [ ] Add `collections` table to `dexie-db.ts`
  - [ ] Extend `SourceRecord` with `collections` array
- [ ] Write tests for store actions
  - [ ] Test rename source
  - [ ] Test delete/undo delete
  - [ ] Test collection CRUD operations
  - [ ] Test source-to-collection associations

### Task 2: Create SourceContextMenu Component
- [ ] Create `SourceContextMenu.tsx` component
  - [ ] Render dropdown with menu items
  - [ ] Menu items: Rename, Delete, Move to Collection, Export
  - [ ] Position dropdown relative to trigger button
  - [ ] Close on click outside
  - [ ] Close on Escape key
  - [ ] Add keyboard navigation (arrow keys, Enter)
- [ ] Add context menu trigger to SourceCard
  - [ ] Add three dots icon button to card actions
  - [ ] Position button in top-right corner
  - [ ] Show on card hover
- [ ] Write tests for SourceContextMenu
  - [ ] Test menu opens/closes correctly
  - [ ] Test menu item callbacks
  - [ ] Test keyboard navigation
  - [ ] Test click outside to close

### Task 3: Implement Delete with Undo
- [ ] Create DeleteConfirmationDialog component
  - [ ] Show dialog with warning message
  - [ ] Confirm button (red color)
  - [ ] Cancel button
- [ ] Create UndoToast component
  - [ ] Show toast at bottom-right fixed position
  - [ ] Display message: "Source deleted. Undo?"
  - [ ] Show countdown timer (5 seconds)
  - [ ] Undo button (appears on hover)
  - [ ] Auto-dismiss after 5 seconds
- [ ] Implement delete logic
  - [ ] Soft delete: Mark source as deleted (add `deleted` flag, `deletedAt` timestamp)
  - [ ] Remove source from all collections
  - [ ] Add to undo queue
  - [ ] Trigger card fade-out animation
- [ ] Implement undo logic
  - [ ] Remove `deleted` flag
  - [ ] Restore source to collections
  - [ ] Trigger card fade-in animation
  - [ ] Clear from undo queue
- [ ] Write tests for delete/undo
  - [ ] Test delete confirmation flow
  - [ ] Test undo restoration
  - [ ] Test toast countdown timer
  - [ ] Test permanent delete after timeout

### Task 4: Implement Rename Functionality
- [ ] Create RenameDialog or inline edit component
  - [ ] Show text input with current title
  - [ ] Focus input and select text
  - [ ] Save button (enabled when title changed)
  - [ ] Cancel button
  - [ ] Validation: Required, max 100 chars, trim whitespace
- [ ] Integrate rename with SourceCard
  - [ ] Show dialog/inline edit on Rename click
  - [ ] Update title in store on save
  - [ ] Update UI immediately
  - [ ] Update preview panel title
- [ ] Write tests for rename
  - [ ] Test rename dialog opens/closes
  - [ ] Test title validation
  - [ ] Test title update in store
  - [ ] Test title update in UI (card, preview)

### Task 5: Implement Collections
- [ ] Create CollectionManager component
  - [ ] "New Collection" button
  - [ ] Collection creation dialog (name input)
  - [ ] Collection list in sidebar
  - [ ] Collection count badges
- [ ] Create CollectionSelector component
  - [ ] Dropdown of existing collections
  - [ ] Multi-select for multiple collections
  - [ ] "Create new collection" option
- [ ] Create CollectionPanel for filtered view
  - [ ] Show collection name and description
  - [ ] Show filtered source grid
  - [ ] "All Sources" button to clear filter
- [ ] Integrate collections with SourceCardGrid
  - [ ] Add collection filter dropdown
  - [ ] Filter sources by selected collection
  - [ ] Show "No sources in this collection" empty state
- [ ] Write tests for collections
  - [ ] Test collection creation
  - [ ] Test adding source to collection
  - [ ] Test removing source from collection
  - [ ] Test filtering by collection
  - [ ] Test multi-collection membership

### Task 6: Implement Export Functionality
- [ ] Add export action to knowledge store
  - [ ] `exportSource(sourceId)` action
  - [ ] Generate downloadable file from source content
- [ ] Create export utility functions
  - [ ] `exportPDF(source)`: Download original PDF
  - [ ] `exportText(source)`: Download as `.txt` file
  - [ ] `sanitizeFilename(title)`: Clean title for file name
- [ ] Integrate export with context menu
  - [ ] Add Export menu item
  - [ ] Trigger browser download on click
- [ ] Write tests for export
  - [ ] Test PDF export
  - [ ] Test text export
  - [ ] Test filename sanitization

### Task 7: Integration Testing
- [ ] Test full user flows
  - [ ] Delete → Undo → Restore flow
  - [ ] Rename → Update across UI flow
  - [ ] Create collection → Add sources → Filter flow
  - [ ] Export source → Download file flow
- [ ] Test edge cases
  - [ ] Delete last source in collection
  - [ ] Rename to empty string (validation)
  - [ ] Create collection with duplicate name
  - [ ] Export very large text source

---

## Dev Notes

### Architecture Patterns

**Zustand Store Pattern (from Story 6.2):**
```typescript
// Use create() with persist middleware
export const useKnowledgeStore = create<KnowledgeStore>()(
    persist(
        (set, get) => ({
            // State
            collections: [],
            undoQueue: [],

            // Actions
            renameSource: async (sourceId, newName) => {
                // Update source in IndexedDB
                await db.sources.update(sourceId, { title: newName });
                // Update state
                set((state) => ({
                    sources: state.sources.map(s =>
                        s.id === sourceId ? { ...s, title: newName } : s
                    )
                }));
            },

            deleteSource: async (sourceId) => {
                // Soft delete
                await db.sources.update(sourceId, { deleted: true, deletedAt: Date.now() });
                // Add to undo queue
                set((state) => ({
                    undoQueue: [...state.undoQueue, { sourceId, timestamp: Date.now() }]
                }));
            },

            undoDelete: async (sourceId) => {
                // Restore source
                await db.sources.update(sourceId, { deleted: false, deletedAt: null });
                // Remove from undo queue
                set((state) => ({
                    undoQueue: state.undoQueue.filter(item => item.sourceId !== sourceId)
                }));
            },
        }),
        {
            name: 'knowledge-state',
            storage: createJSONStorage(() => createDexieStorage('knowledgeState')),
        }
    )
);
```

**Dexie Schema Extensions:**
```typescript
// Add collections table
db.version(1).stores({
    sources: '++id, projectId, title, type, createdAt, deleted, collections',
    collections: '++id, projectId, name, createdAt',
});
```

### Component Structure

**SourceContextMenu:**
- Position: Absolute dropdown
- Trigger: Three dots icon button on SourceCard
- Menu items: Rename, Delete, Move to Collection, Export
- Close behavior: Click outside, Escape key, select item

**UndoToast:**
- Position: Fixed bottom-right
- Content: "Source deleted. Undo?" + countdown
- Actions: Undo button (appears on hover)
- Auto-dismiss: 5 seconds

**RenameDialog:**
- Position: Centered modal or inline edit
- Content: Text input with current title
- Actions: Save button, Cancel button
- Validation: Required, max 100 chars

**CollectionManager:**
- Location: Sidebar panel
- Content: Collection list with counts
- Actions: New Collection button, collection context menu

### Testing Standards

**Unit Tests:**
- Test store actions with mock Dexie
- Test utility functions (filename sanitization, export)
- Test validation logic

**Integration Tests:**
- Test component interactions (context menu → action → UI update)
- Test store state changes after actions
- Test IndexedDB operations

**Edge Cases:**
- Empty collections
- Delete last source in collection
- Rename to empty/very long title
- Export very large file

### File Structure

```
src/
├── lib/
│   └── state/
│       ├── knowledge-store.ts (extend)
│       └── dexie-db.ts (extend schema)
├── components/
│   └── knowledge/
│       ├── SourceContextMenu.tsx (new)
│       ├── DeleteConfirmationDialog.tsx (new)
│       ├── UndoToast.tsx (new)
│       ├── RenameDialog.tsx (new)
│       ├── CollectionManager.tsx (new)
│       ├── CollectionSelector.tsx (new)
│       ├── CollectionPanel.tsx (new)
│       ├── SourceCard.tsx (modify - add context menu)
│       └── SourceCardGrid.tsx (modify - add collection filter)
└── utils/
    └── export-utils.ts (new)
```

### Key Dependencies

- **zustand**: ^4.5.0 (state management)
- **dexie**: ^3.2.4 (IndexedDB)
- **@radix-ui/react-dialog**: Dialog components
- **@radix-ui/react-dropdown-menu**: Context menu

### Design Tokens

- **Colors**: Use `--color-*` from `design-tokens.css`
- **Spacing**: Use `--spacing-*` for consistent gaps
- **Border-radius**: 0 (squared corners for 8-bit aesthetic)
- **Animations**: 200-300ms ease-out for transitions

---

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.5 (Story creation)_

### Debug Log References

### Completion Notes List

### File List

# Story 6-3 Development Status

**Date:** 2025-12-30
**Status:** In Progress (~50% complete)
**Tests:** 36 passing (knowledge store)

---

## Completed Tasks ✅

### Task 1: Extend Knowledge Store with Management Actions
**Status:** ✅ COMPLETE

**Implementation:**
- ✅ Extended `useKnowledgeStore` interface with new state:
  - `collections: CollectionRecord[]`
  - `filteredCollectionId: string | null`
  - `undoQueue: DeletedSource[]`
- ✅ Implemented new actions:
  - `renameSource(sourceId, newName)` - Updates source title in DB and state
  - `deleteSource(sourceId)` - Soft delete with undo queue support
  - `undoDelete(sourceId)` - Restores soft-deleted source
  - `loadCollections(projectId)` - Loads collections for project
  - `createCollection(name)` - Creates new collection
  - `updateCollection(collectionId, updates)` - Updates collection
  - `deleteCollection(collectionId)` - Deletes collection
  - `addSourceToCollection(sourceId, collectionId)` - Adds source to collection
  - `removeSourceFromCollection(sourceId, collectionId)` - Removes source from collection
  - `filterByCollection(collectionId)` - Sets filtered collection
- ✅ Updated `loadSources` to filter out soft-deleted sources
- ✅ Updated persist configuration to include new state
- ✅ Updated hydration handler to log collections

**Tests:** 36 tests passing (all store actions + existing tests)

**Files Modified:**
- `src/lib/state/knowledge-store.ts` (414 lines) - Extended with Story 6.3 features
- `src/lib/state/__tests__/knowledge-store.test.ts` (978 lines) - Comprehensive test coverage

### Database Schema (Completed in Previous Session)
**Status:** ✅ COMPLETE (from previous session)

**Implementation:**
- ✅ Extended `SourceRecord` interface with:
  - `collections?: string[]`
  - `deleted?: boolean`
  - `deletedAt?: number`
- ✅ Added `CollectionRecord` interface
- ✅ Database migration v12 with collections table
- ✅ Collection helper functions in dexie-db.ts

---

## Remaining Tasks ⏳

### Task 2: Create SourceContextMenu Component
**Status:** PENDING

**Requirements:**
- [ ] Create `SourceContextMenu.tsx` component
  - [ ] Render dropdown with menu items
  - [ ] Menu items: Rename, Delete, Move to Collection, Export
  - [ ] Position dropdown relative to trigger button
  - [ ] Close on click outside
  - [ ] Close on Escape key
  - [ ] Add keyboard navigation (arrow keys, Enter)
- [ ] Add context menu trigger to SourceCard
  - [ ] Replace current delete button with three dots icon
  - [ ] Position button in top-right corner
  - [ ] Show on card hover
- [ ] Write tests for SourceContextMenu
  - [ ] Test menu opens/closes correctly
  - [ ] Test menu item callbacks
  - [ ] Test keyboard navigation
  - [ ] Test click outside to close

### Task 3: Implement Delete with Undo
**Status:** PARTIALLY COMPLETE (store done, UI pending)

**Store:** ✅ COMPLETE
- ✅ Soft delete implementation
- ✅ Undo queue with 5-second timeout
- ✅ Auto-clear from undo queue

**UI Components:** PENDING
- [ ] Create `DeleteConfirmationDialog` component (improve existing)
- [ ] Create `UndoToast` component with countdown
  - [ ] Show toast at bottom-right fixed position
  - [ ] Display message: "Source deleted. Undo?"
  - [ ] Show countdown timer (5 seconds)
  - [ ] Undo button (appears on hover)
  - [ ] Auto-dismiss after 5 seconds
- [ ] Integrate delete/undo with context menu

### Task 4: Implement Rename Functionality
**Status:** PENDING

**Requirements:**
- [ ] Create `RenameDialog` component
  - [ ] Show text input with current title
  - [ ] Focus input and select text
  - [ ] Save button (enabled when title changed)
  - [ ] Cancel button
  - [ ] Validation: Required, max 100 chars, trim whitespace
- [ ] Integrate rename with SourceCard
- [ ] Write tests for rename

### Task 5: Implement Collections
**Status:** PENDING

**Store:** ✅ COMPLETE
- ✅ All collection CRUD actions implemented

**UI Components:** PENDING
- [ ] Create `CollectionManager` component
  - [ ] "New Collection" button
  - [ ] Collection list in sidebar
  - [ ] Collection count badges
- [ ] Create `CollectionSelector` component
  - [ ] Dropdown of existing collections
  - [ ] Multi-select for multiple collections
  - [ ] "Create new collection" option
- [ ] Create `CollectionPanel` for filtered view
- [ ] Integrate collections with SourceCardGrid
- [ ] Write tests for collections

### Task 6: Implement Export Functionality
**Status:** PENDING

**Requirements:**
- [ ] Create export utility functions in `src/utils/export-utils.ts`
  - [ ] `exportPDF(source)`: Download original PDF
  - [ ] `exportText(source)`: Download as `.txt` file
  - [ ] `sanitizeFilename(title)`: Clean title for file name
- [ ] Integrate export with context menu
- [ ] Write tests for export

### Task 7: Integration Testing
**Status:** PENDING

**Requirements:**
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

## Notes

### Store Implementation Notes
1. **Project ID Context**: The `createCollection` action uses a placeholder `'current-project-id'` for projectId. This needs to be integrated with the active project selection system.
2. **Dexie Storage**: The knowledge store uses `conversationState` table for persistence (via `createDexieStorage`) because there isn't a dedicated knowledge-state table. The key `'knowledge-state'` distinguishes it from conversation data.
3. **Soft Delete**: Sources are marked as deleted with `deleted: true` and `deletedAt` timestamp. The `loadSources` action filters these out.

### Testing Notes
- All 36 knowledge store tests passing
- Tests use vi.mock for Dexie database functions
- Tests verify state changes, error handling, and edge cases
- Mock setup uses relative paths (`../dexie-db`) to match store imports

### Next Steps
1. Create `SourceContextMenu.tsx` component
2. Update `SourceCard.tsx` to use context menu instead of direct delete button
3. Implement remaining UI components (dialogs, toasts, panels)
4. Write integration tests for full user flows
5. Run code review when implementation complete

---

## File Summary

**Modified Files:**
- `src/lib/state/knowledge-store.ts` - Extended with Story 6.3 features
- `src/lib/state/__tests__/knowledge-store.test.ts` - Extended test coverage
- `src/lib/state/dexie-db.ts` - Extended with collections (previous session)

**New Files to Create:**
- `src/components/knowledge/SourceContextMenu.tsx`
- `src/components/knowledge/DeleteConfirmationDialog.tsx`
- `src/components/knowledge/UndoToast.tsx`
- `src/components/knowledge/RenameDialog.tsx`
- `src/components/knowledge/CollectionManager.tsx`
- `src/components/knowledge/CollectionSelector.tsx`
- `src/components/knowledge/CollectionPanel.tsx`
- `src/utils/export-utils.ts`
- `src/components/knowledge/__tests__/SourceContextMenu.test.tsx`
- Other component tests

**Files to Modify:**
- `src/components/knowledge/SourceCard.tsx` - Replace delete button with context menu
- `src/components/knowledge/SourceCardGrid.tsx` - Add collection filter

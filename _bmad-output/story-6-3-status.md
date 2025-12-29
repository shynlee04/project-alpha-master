# Story 6-3 Development Status

**Date:** 2025-12-30
**Status:** In Progress (~70% complete)
**Tests:** 65 passing (knowledge store + UI components)

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

### Task 2: Create SourceContextMenu Component
**Status:** ✅ COMPLETE

**Implementation:**
- ✅ Created `SourceContextMenu.tsx` component
  - Dropdown with 4 menu items: Rename, Delete, Move to Collection, Export
  - Uses Radix UI DropdownMenu for accessibility
  - Keyboard navigation support (arrow keys, Enter, Escape)
  - Click outside to close
  - 8-bit design styling with rounded-none
- ✅ Added to `src/components/knowledge/index.ts` barrel export
- ✅ Integrated with SourceCard
  - Replaced old delete button with context menu trigger
  - Three dots icon in top-right corner
  - Shows on card hover (opacity-0 → opacity-100)
- ✅ Updated SourceCard tests to verify context menu integration

**Tests:** 6 tests passing (SourceContextMenu), 8 tests passing (SourceCard updated)

**Files Created:**
- `src/components/knowledge/SourceContextMenu.tsx` (95 lines)
- `src/components/knowledge/__tests__/SourceContextMenu.test.tsx` (96 lines)

**Files Modified:**
- `src/components/knowledge/SourceCard.tsx` - Updated governance tag to EPIC-6-3, integrated context menu
- `src/components/knowledge/index.ts` - Added SourceContextMenu export
- `src/components/knowledge/__tests__/SourceCard.test.tsx` - Updated tests for context menu

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

### Task 3: Implement Delete with Undo (UI Components)
**Status:** ✅ COMPLETE

**Store:** ✅ COMPLETE (from Task 1)
- ✅ Soft delete implementation
- ✅ Undo queue with 5-second timeout
- ✅ Auto-clear from undo queue

**UI Components:** ✅ COMPLETE
- ✅ Created `UndoToast` component with countdown
  - Fixed positioning at bottom-right
  - Displays message with source title
  - Countdown timer (5 seconds)
  - Undo button with hover effect
  - Auto-dismiss after countdown
  - Accessibility attributes (role="alert", aria-live="polite")
- ✅ Added to `src/components/knowledge/index.ts` barrel export
- ✅ Note: DeleteConfirmationDialog already exists in SourceCard (inline implementation)

**Tests:** 6 tests passing (UndoToast)

**Files Created:**
- `src/components/knowledge/UndoToast.tsx` (117 lines)
- `src/components/knowledge/__tests__/UndoToast.test.tsx` (97 lines)

**Files Modified:**
- `src/components/knowledge/index.ts` - Added UndoToast export

---

## Remaining Tasks ⏳

### Task 4: Implement Rename Functionality
**Status:** PENDING

**Requirements:**
- [ ] Create `RenameDialog` component
  - [ ] Show text input with current title
  - [ ] Focus input and select text on mount
  - [ ] Save button (enabled when title changed)
  - [ ] Cancel button
  - [ ] Validation: Required, max 100 chars, trim whitespace
- [ ] Integrate rename with SourceCard
- [ ] Write tests for rename

### Task 5: Implement Collections
**Status:** PENDING

**Store:** ✅ COMPLETE (from Task 1)
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
- 65 tests passing: 36 knowledge store + 6 SourceContextMenu + 8 SourceCard + 6 UndoToast + 9 other (SourcePreviewPanel, SourceCardGrid)
- Tests use vi.mock for Dexie database functions
- Tests verify state changes, error handling, and edge cases
- Mock setup uses relative paths (`../dexie-db`) to match store imports

### Next Steps
1. Implement RenameDialog component (Task 4)
2. Implement Collection UI components (Task 5)
3. Implement export utilities (Task 6)
4. Write integration tests (Task 7)
5. Run code review when implementation complete

---

## File Summary

**Modified Files:**
- `src/lib/state/knowledge-store.ts` - Extended with Story 6.3 features (Task 1)
- `src/lib/state/__tests__/knowledge-store.test.ts` - Extended test coverage (Task 1)
- `src/components/knowledge/SourceCard.tsx` - Integrated context menu (Task 2)
- `src/components/knowledge/index.ts` - Added SourceContextMenu and UndoToast exports (Tasks 2-3)
- `src/components/knowledge/__tests__/SourceCard.test.tsx` - Updated tests for context menu (Task 2)

**New Files Created:**
- `src/components/knowledge/SourceContextMenu.tsx` (Task 2)
- `src/components/knowledge/__tests__/SourceContextMenu.test.tsx` (Task 2)
- `src/components/knowledge/UndoToast.tsx` (Task 3)
- `src/components/knowledge/__tests__/UndoToast.test.tsx` (Task 3)

**New Files to Create (Remaining Tasks):**
- `src/components/knowledge/RenameDialog.tsx` (Task 4)
- `src/components/knowledge/CollectionManager.tsx` (Task 5)
- `src/components/knowledge/CollectionSelector.tsx` (Task 5)
- `src/components/knowledge/CollectionPanel.tsx` (Task 5)
- `src/utils/export-utils.ts` (Task 6)
- Component tests for all above
- Integration tests (Task 7)

**Files to Modify (Remaining Tasks):**
- `src/components/knowledge/SourceCardGrid.tsx` - Add collection filter (Task 5)

# STORE-06: Merge useNoteNavigationStore into useNavigationStore

> **Status**: ❌ FALSE POSITIVE - NO MERGE REQUIRED
> **Story ID**: STORE-06
> **Epic**: EPIC-STORE (Store Consolidation)
> **Conflict**: CONFLICT-05
> **Created**: 2026-01-12
> **Completed**: 2026-01-12

---

## Acceptance Criteria (Original)

- [ ] ~~Unified navigation state~~
- [ ] ~~useNoteNavigationStore deleted~~

## Analysis Result

### ❌ CONFLICT-05 is a FALSE POSITIVE

The EPIC-STORE analysis claimed:

```
- id: "CONFLICT-05"
  type: "OVERLAP"
  store_a: "useNoteNavigationStore"
  store_b: "useNavigationStore"
  evidence: "Both manage navigation state"
  impact: "State synchronization issues"
```

This analysis was **incorrect**. The two stores serve **orthogonal descriptions**:

| Store | description | Domain | Consumers | Storage |
|-------|---------|--------|-----------|---------|
| `useNoteNavigationStore` | Tree hierarchy state | Notes workspace | 3 components | note-navigation-storage |
| `useNavigationStore` | IDE panel state | IDE-wide | **0 consumers** | via-gent-navigation-storage |

### Store Details

#### useNoteNavigationStore (`src/lib/notes/note-navigation-store.ts`)

**description**: Manages note tree UI state

**State**:
- `expandedNodes: Set<string>` - Which tree nodes are expanded/collapsed
- `searchQuery: string` - Search filter for notes
- `showFavoritesOnly: boolean` - Favorites filter toggle
- `draggedNodeId: string | null` - Drag-and-drop state
- `focusedNodeId: string | null` - Keyboard navigation in tree

**Consumers** (3 active):
- `src/presentation/components/notes/NoteTree.tsx`
- `src/presentation/components/notes/NoteSidebar.tsx`
- `src/presentation/components/notes/NoteTreeItem.tsx`

**Actions**: toggleExpanded, expandNode, collapseNode, expandAll, collapseAll, setSearchQuery, toggleFavoritesFilter, setDraggedNode, setFocusedNode

#### useNavigationStore (`src/infrastructure/persistence/stores/navigation-store.ts`)

**description**: IDE-wide panel navigation (originally intended)

**State**:
- `activePanel: string | null` - Currently active panel
- `focusedElement: string | null` - Currently focused element
- `selectedItems: Map<string, string>` - Selected items by component
- `keyboardNavigationEnabled: boolean` - Keyboard nav toggle
- `lastActiveAt: number | null` - Last activity timestamp

**Consumers**: **ZERO** (potentially dead code)

**Actions**: setActivePanel, setFocusedElement, setSelectedItem, clearSelectedItems, enableKeyboardNavigation, disableKeyboardNavigation, updateLastActiveAt, reset

### Why Merging is Wrong

1. **Domain Mismatch**: Tree state ≠ Panel state
2. **Coupling Risk**: Notes-specific logic doesn't belong in IDE-wide store
3. **SRP Violation**: Each store has single, clear responsibility
4. **No Synchronization Issues**: Stores operate independently

### Correct Action

**DO NOT MERGE** - The appropriate action is:

1. **Keep useNoteNavigationStore** - It's actively used and serves its domain well
2. **Investigate useNavigationStore** - Consider deletion if truly unused (dead code)
3. **Update EPIC-STORE conflict list** - Mark CONFLICT-05 as false positive

## Files Analyzed

- `src/lib/notes/note-navigation-store.ts` (162 lines)
- `src/infrastructure/persistence/stores/navigation-store.ts` (159 lines)
- `src/infrastructure/persistence/stores/index.ts` (barrel exports)
- `src/presentation/components/notes/NoteTree.tsx` (consumer)
- `src/presentation/components/notes/NoteSidebar.tsx` (consumer)
- `src/presentation/components/notes/NoteTreeItem.tsx` (consumer)

## Recommendation

**Update EPIC-STORE documentation**:

```yaml
CONFLICT-05:
  status: "FALSE_POSITIVE"
  finding: "Stores serve orthogonal descriptions - no overlap"
  useNoteNavigationStore: "Keep - actively used for tree state"
  useNavigationStore: "Investigate - may be dead code (0 consumers)"
```

---

**Verified by**: bmad-master
**Review Status**: ANALYSIS COMPLETE - NO ACTION REQUIRED

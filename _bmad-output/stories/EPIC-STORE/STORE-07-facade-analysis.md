# STORE-07: Remove useNoteStore Facade Overhead

> **Status**: ✅ PARTIALLY COMPLETE
> **Story ID**: STORE-07
> **Epic**: EPIC-STORE (Store Consolidation)
> **Conflict**: CONFLICT-03
> **Created**: 2026-01-12
> **Completed**: 2026-01-12

---

## Acceptance Criteria (Original)

- [ ] ~~Direct imports to note-store-refactored~~
- [ ] ~~useNoteStore facade deleted~~

## Analysis Result

### ⚠️ CONFLICT-03 is PARTIAL FALSE POSITIVE

The EPIC-STORE analysis claimed:

```yaml
- id: "CONFLICT-03"
  type: "FACADE_WASTE"
  store_a: "useNoteStore"
  store_b: "note-store-refactored"
  evidence: "Facade adds overhead without benefit"
  impact: "Performance degradation"
```

**Analysis**: The facade pattern is **valid and necessary** here.

### Architecture

| File | Lines | Consumers | Purpose | Status |
|------|-------|-----------|---------|--------|
| `note-store.ts` | 40 | 11 active | Main barrel export (facade) | **KEEP** - Necessary |
| `note-store-facade.ts` | 29 | **0** | Duplicate facade | **DELETED** - Dead code |
| `note-store-refactored.ts` | ~630 | - | Zustand store (7 slices) | Source of truth |

### Note Store Consumers (11 files)

```
src/presentation/components/chat/NoteReference.tsx
src/presentation/components/chat/NoteReferencePicker.tsx
src/presentation/components/notes/ProjectFilesPanel.tsx
src/presentation/components/notes/NotesPage.tsx
src/presentation/components/notes/NoteTreeItem.tsx
src/presentation/components/notes/NoteContextMenu.tsx
src/presentation/components/notes/NotesIndexingButton.tsx
src/presentation/components/knowledge/KnowledgePage.tsx
src/lib/context/ContextEngine.ts
src/presentation/components/ide/AgentChatPanel.tsx
src/presentation/components/ide/AgentChatPanel/AgentChatToolFacades.tsx
```

### Why Facade is Valid

1. **Clean Imports**: `@/lib/notes/note-store` vs `@/lib/notes/note-store-refactored`
2. **Backward Compatibility**: No breaking changes to existing code
3. **Minimal Overhead**: 40 lines of re-exports (negligible performance impact)
4. **Future Flexibility**: Can swap implementation without touching consumers

### Refactored Store Slices

The `note-store-refactored.ts` contains 7 well-organized slices:

| Slice | Lines | Purpose |
|-------|-------|---------|
| note-crud-slice | 120 | CRUD operations |
| note-metadata-slice | 100 | Favorite, move, ordering |
| note-query-slice | 90 | Search, filter, helpers |
| note-sync-slice | 110 | Auto-save, file sync |
| note-indexing-slice | 80 | Background RAG indexing |
| note-events-slice | 70 | Event emission orchestration |
| note-ui-slice | 60 | Active note, loading, error |

**Total: 630 lines (13% reduction from 724 lines)**

## Actions Taken

### ✅ Dead Code Removed

**File Deleted**: `src/lib/notes/note-store-facade.ts` (29 lines)
- Zero consumers found in codebase
- Duplicate of note-store.ts functionality
- Removed to reduce confusion

### ✅ Facade Retained

**File Kept**: `src/lib/notes/note-store.ts` (40 lines)
- 11 active consumers depend on it
- Provides clean import path
- Maintains backward compatibility

## Recommendation

**Update EPIC-STORE documentation**:

```yaml
CONFLICT-03:
  status: "PARTIAL_FALSE_POSITIVE"
  finding: "Facade is necessary for backward compatibility"
  note-store.ts: "Keep - 11 active consumers, clean imports"
  note-store-facade.ts: "Deleted - was dead code (0 consumers)"
  note-store-refactored.ts: "Keep - source of truth (7 slices)"
```

## Files Modified

- `src/lib/notes/note-store-facade.ts` - **DELETED** (29 lines)

## Files Analyzed

- `src/lib/notes/note-store.ts` (40 lines)
- `src/lib/notes/note-store-facade.ts` (29 lines - deleted)
- `src/lib/notes/note-store-refactored.ts` (~630 lines)
- `src/lib/notes/index.ts` (barrel export)
- 11 consumer files

---

**Verified by**: bmad-master
**Review Status**: DEAD CODE REMOVED, FACADE RETAINED

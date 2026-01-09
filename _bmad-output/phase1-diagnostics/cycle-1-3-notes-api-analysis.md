# Notes API Surface Analysis

**Cycle**: 1.3
**Agent**: code-explorer
**Date**: 2026-01-10

---

## Available CRUD Operations

| Operation | Function | Location | Accessible by Agent? |
|-----------|----------|----------|---------------------|
| Create Note | `createNote()` | `src/lib/notes/` | ❌ No tool |
| Read Note | `loadNotes()` | `src/lib/notes/` | ❌ No tool |
| Update Note | `updateNote()` | `src/lib/notes/` | ❌ No tool |
| Delete Note | `deleteNote()` | `src/lib/notes/` | ❌ No tool |
| Search Notes | `searchNotes()` | `src/lib/notes/` | ✅ via search_notes tool |
| List Notes | `loadNotes()` | `src/lib/notes/` | ❌ No tool |

---

## Search/RAG Capabilities

### Implementation
- **Search Engine**: Orama (hybrid search)
- **Vector Dimensions**: 1536
- **Chunking**: 512 chars with 128 overlap
- **Search Types**: Full-text (BM25), Vector search, Hybrid

### Existing Tool
- `search_notes` exists and is implemented
- Located in `src/lib/agent/tools/search-notes-tool.ts`
- Uses RAG indexing with Orama
- Includes current note context awareness

---

## Integration Opportunities

### Missing CRUD Tools
Despite having full CRUD operations in the note store, the following agent tools are **missing**:

- ❌ `create_note` - No agent tool for creating notes
- ❌ `update_note` - No agent tool for updating notes
- ❌ `delete_note` - No agent tool for deleting notes
- ❌ `read_note` - No agent tool for reading specific notes
- ❌ `list_notes` - No agent tool for listing notes

---

## Summary

The notes system has:
- ✅ Solid foundation with Zustand store, Dexie persistence
- ✅ Complete CRUD functionality
- ✅ Orama-based RAG search
- ✅ `search_notes` tool exists

But needs:
- ❌ Agent tools for CRUD operations
- ❌ Agent tools for research
- ❌ Agent tools for index management

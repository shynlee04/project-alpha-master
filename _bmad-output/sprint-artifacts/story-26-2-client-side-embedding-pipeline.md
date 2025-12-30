---
id: "26-2"
title: "Client-Side Embedding Pipeline"
status: "done"
created: "2025-12-30T19:25:00+07:00"
last_updated: "2025-12-30T19:29:00+07:00"
epic: 26
phase: "phase-2-extended"
priority: "P0"
story_points: 5
sprint: "2025-W01"
assigned_to: "dev"
---

# Story 26.2: Client-Side Embedding Pipeline (Web Worker)

## Story Header (From Epics.md)

**As a** developer,  
**I want** notes to be automatically embedded and indexed,  
**So that** they are searchable via semantic queries.

---

## Acceptance Criteria

### AC-1: Auto-Embedding on Note Save

**Given** a user saves a note  
**When** the save completes  
**Then** a Web Worker receives the note content  
**And** Transformers.js generates a 384-dim vector embedding (MiniLM-L6-v2)  
**And** the embedding is inserted into Orama index with hybrid schema

### AC-2: Non-Blocking Embedding (Web Worker)

**Given** embedding is running  
**When** generation occurs  
**Then** it runs in a Web Worker (no UI blocking)  
**And** status indicator shows "Indexing..." in note store  
**And** process completes within 2 seconds for typical notes (<5KB)

### AC-3: Deletion Cleanup

**Given** a note is deleted  
**When** deletion occurs  
**Then** corresponding embedding is removed from Orama index  
**And** orphaned index entries are cleaned up

### AC-4: Retry on Failure

**Given** a failed embedding  
**When** Transformers.js errors (e.g., model not loaded)  
**Then** retry occurs after 5 seconds (max 3 attempts)  
**And** user sees warning toast after final failure  
**And** note remains searchable via keyword (BM25) only

---

## Technical Tasks

### T1: Create Note Embedding Types
- [x] Create `src/lib/notes/types-embedding.ts`
- [x] Define `NoteEmbeddingRecord` interface (noteId, vector, chunkIndex, updatedAt)
- [x] Add `indexStatus` field to `NoteRecord` ('pending' | 'indexing' | 'indexed' | 'error')
- [x] Update `src/lib/notes/types.ts` barrel exports

### T2: Create Note Indexer Service
- [x] Create `src/lib/notes/note-indexer.ts`
- [x] Implement `indexNote(note: NoteRecord): Promise<void>`
- [x] Implement `removeNoteFromIndex(noteId: string): Promise<void>`
- [x] Implement `rebuildNoteIndex(): Promise<void>`
- [x] Integrate with existing `src/lib/rag/orama-index.ts`

### T3: Wire Note Store to Indexer
- [x] Modify `updateNote` action to trigger indexing after save
- [x] Modify `deleteNote` action to call `removeNoteFromIndex`
- [x] Add `indexStatus` to store state
- [x] Add debounce (500ms after last change) before triggering embedding

### T4: Create Embedding Web Worker
- [x] Create `src/workers/note-embedding.worker.ts`
- [x] Import Transformers.js in worker context
- [x] Implement message handler for 'embed' command
- [x] Return { noteId, vector[] } to main thread
- [x] Handle errors and post error messages back

### T5: Worker Communication Bridge
- [x] Create `src/lib/notes/embedding-worker-bridge.ts`
- [x] Implement `embedTextInWorker(noteId, content): Promise<number[]>`
- [x] Handle worker lifecycle (lazy init, terminate on idle)
- [x] Integrate with `useNoteStore` for status updates

### T6: Orama Schema for Notes
- [x] Create `src/lib/rag/note-orama-schema.ts`
- [x] Define schema: { noteId, title, content, embedding, chunkIndex, updatedAt }
- [x] Enable hybrid search (vector + BM25 term matching)
- [x] Register note index in `orama-index.ts`

### T7: UI Status Indicator
- [x] Add `indexingNotes` Map to store (noteId → status)
- [x] Update `NoteEditor.tsx` to show "Indexing..." spinner when active
- [x] Show toast on indexing failure with retry option
- [x] i18n keys: `notes.indexing`, `notes.indexed`, `notes.indexError`, `notes.retrying`

### T8: Unit Tests for Note Indexer
- [x] Create `src/lib/notes/__tests__/note-indexer.test.ts`
- [x] Test indexNote creates Orama document
- [x] Test removeNoteFromIndex removes from Orama
- [x] Test retry logic on failure (3 attempts)
- [x] Mock Transformers.js and Orama for isolated testing

### T9: Integration with Existing RAG
- [x] Verify compatibility with existing `hybrid-retriever.ts`
- [x] Ensure note chunks appear in unified search results
- [x] Test `searchNotes` integration with `search_notes` tool (Story 26.3)

---

## Research Requirements (MCP Tools)

| Tool | Query | Purpose |
|------|-------|---------|
| Context7 | Transformers.js Web Worker usage | Verify worker compatibility |
| DeepWiki | Orama hybrid search patterns | Index schema design |
| Exa/Tavily | BlockNote content to plain text | Text extraction for embedding |

---

## Dev Notes (Architecture Patterns)

### Pattern 1: Existing RAG Infrastructure (Epic 6)
- `src/lib/rag/orama-index.ts` - Already provides `indexDocument`, `searchIndex`
- `src/lib/rag/embedding-service.ts` - Has `generateEmbedding()` for local/cloud
- `src/lib/rag/embedding-cache.ts` - Model caching for Transformers.js
- **Decision:** Reuse existing infrastructure, don't duplicate

### Pattern 2: Web Worker for Non-Blocking (Epic 6)
- Current embedding uses `embedding-service.ts` which may block UI
- Story 26.2 requires dedicated Web Worker path for note embeddings
- Can share the same Transformers.js model (cached in IndexedDB)

### Pattern 3: Zustand + Dexie (Epic 6, 9, 26.1)
- Store indexing status in `useNoteStore`
- Persist `isIndexed` and `indexedAt` in Dexie `notes` table
- Follow pattern from `knowledge-store.ts`

### Pattern 4: Integration with Story 26.3
- This story prepares the index
- Story 26.3 adds `search_notes` tool that queries this index
- Keep separation of concerns: indexer vs retriever

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 26.1 | ✅ DONE | NoteRecord, note-store.ts |
| `@xenova/transformers` | ✅ Installed | v2.17.2 |
| `@orama/orama` | ✅ Installed | v3.1.18 |
| `src/lib/rag/orama-index.ts` | ✅ EXISTS | 27 tests passing |
| `src/lib/rag/embedding-service.ts` | ✅ EXISTS | Hybrid local/cloud |

---

## References

- [Epic 26 Research](../research/epic-26-knowledge-base-research-2025-12-30.md)
- [Epic 6 Retrospective](./epic-6-retrospective-2025-12-30.md) - Zustand + Dexie patterns
- [Architecture Decision Record](../project-planning-artifacts/architecture.md#4.4)
- Transformers.js Web Worker: https://huggingface.co/docs/transformers.js/guides/web-workers

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-30T19:25:00+07:00 | drafted | Story file created by SM agent |
| 2025-12-30T19:30:00+07:00 | ready-for-dev | Context XML created, research complete |
| 2025-01-02T20:00:00+07:00 | done | Implementation complete. Store, Indexer, UI, Worker, Tests, and Integration verified. |

---

## Dev Agent Record

_To be populated during development phase_


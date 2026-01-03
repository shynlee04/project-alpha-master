# Story P2-8: Notes → Knowledge RAG Indexing

**Generated**: 2026-01-03T23:45:00+07:00
**Epic**: Platform Unification & Knowledge Synthesis
**Priority**: P2 (Medium - Blocks UC-01, UC-03)
**Estimate**: 8 hours
**Team**: Team A (UI/Foundation)
**Status**: READY_FOR_DEV

## User Story

As a **Knowledge Synthesis user**, I want to **index my notes for RAG search** so that I can search across both source documents and my notes in the Knowledge workspace.

## Context & Motivation

**Current State**:
- Knowledge workspace can index PDFs, URLs, and other sources ✅
- Notes workspace has rich note-taking with BlockNote editor ✅
- Notes are NOT indexed for Knowledge search ❌
- No connection between Notes and Knowledge workspaces ❌

**Problem**:
- UC-01 (Exam Sprint Mixed Media) blocked - can't search lecture notes + sources
- UC-03 (Citation Grade Literature Map) blocked - can't include notes in citations
- Users must manually copy notes to Knowledge workspace (friction)

**Value**:
- Seamless knowledge synthesis across notes and sources
- Unified search experience in Knowledge workspace
- Better citation support for research workflows

## Acceptance Criteria

### AC1: "Index for RAG" Button in Notes Workspace
- [ ] Add button to Notes workspace header (near "New Note", "Sync")
- [ ] Button shows indexed count: "Index for RAG (12/50 notes indexed)"
- [ ] Disabled if 0 notes exist
- [ ] Confirmation dialog before indexing: "This will index {count} notes for Knowledge search. Continue?"

### AC2: Note Indexing Pipeline
- [ ] Extract markdown content from BlockNote document
- [ ] Generate embeddings (use existing `embedding-service.ts`)
- [ ] Create chunks (use existing `document-chunker.ts`)
- [ ] Store in Orama index with `sourceType: "note"` metadata
- [ ] Track indexed note IDs in `rag-store.ts`

### AC3: Knowledge Search Integration
- [ ] RAG search includes notes in results
- [ ] Notes distinguished by source type badge "NOTE"
- [ ] Click on note result opens note in Notes workspace
- [ ] Search result shows note title + excerpt

### AC4: Incremental Updates
- [ ] Auto-index new notes on save (background, non-blocking)
- [ ] Re-index updated notes (debounce 5s)
- [ ] Remove deleted notes from index
- [ ] Show indexing progress in status bar

### AC5: Error Handling
- [ ] Graceful degradation if Orama index unavailable
- [ ] User-friendly error messages for indexing failures
- [ ] Retry failed indexing (max 3 attempts)
- [ ] Telemetry for debugging (console.debug, not console.error)

## Technical Specification

### Files to Create
```
src/lib/notes/note-indexer.ts (NEW - 120 lines)
  - export class NoteIndexer
  - + indexNote(noteId: string, content: string): Promise<void>
  - + indexAllNotes(): Promise<IndexResult>
  - + removeNote(noteId: string): Promise<void>
  - + getIndexStatus(): IndexStatus

src/presentation/components/notes/NotesIndexingButton.tsx (NEW - 80 lines)
  - Component for "Index for RAG" button
  - Shows indexed count
  - Handles click event
  - Integration with NoteIndexer
```

### Files to Modify
```
src/presentation/components/notes/NotesPage.tsx
  - Import NotesIndexingButton
  - Add to header actions
  - Wire up indexing state

src/lib/state/rag-store.ts
  - Add indexedNotes Set<string>
  - Add lastIndexedNotes timestamp
  - Actions: addIndexedNote, removeIndexedNote

src/lib/rag/orama-index.ts
  - Extend to handle note-type sources
  - Source metadata: { sourceType: 'note', noteId: string }
```

### Dependencies
- ✅ `embedding-service.ts` (Epic 7) - Existing
- ✅ `document-chunker.ts` (Epic 7) - Existing
- ✅ `orama-index.ts` (Epic 7) - Extend
- ✅ `rag-store.ts` (Epic 7) - Extend
- ✅ `useRAGStore` - Existing

### Implementation Steps

1. **Create NoteIndexer Service** (2h)
   - Extract markdown from BlockNote JSON
   - Call embedding service
   - Create chunks
   - Store in Orama index

2. **Create Indexing Button Component** (1.5h)
   - Button UI with indexed count
   - Click handler
   - Progress indicator

3. **Integrate with NotesPage** (1h)
   - Add button to header
   - Wire up state

4. **Extend RAG Store** (1.5h)
   - Track indexed notes
   - Add actions

5. **Extend Orama Index** (1h)
   - Handle note sources
   - Add note metadata

6. **Test & Validate** (1h)
   - Manual testing
   - Verify AC compliance

## Definition of Done
- [ ] All 5 acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Manual testing complete
- [ ] Notes appear in Knowledge search results
- [ ] Incremental indexing works
- [ ] Error handling verified

## Use Case Impact

**Before**:
- UC-01: ⚠️ PARTIAL (can't search notes)
- UC-03: ⚠️ PARTIAL (can't cite notes)

**After**:
- UC-01: ✅ FEASIBLE (notes + sources indexed)
- UC-03: ✅ FEASIBLE (notes in citations)

## References
- Assessment: `_bmad-output/ux-ui-workspace-integration-assessment-2026-01-03.md`
- Use Cases: `knowledge_synthesis_research/usecase-01-exam-sprint-mixed-media.md`
- Use Cases: `knowledge_synthesis_research/usecase-03-citation-grade-literature-map.md`

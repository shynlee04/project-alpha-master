---
id: P2-8
name: "Notes → Knowledge RAG Indexing"
epic: Ralph Loop Cycle 18
priority: P0 (Critical)
status: in-progress
created: 2026-01-03
team: Team A
agent: bmad-core-bmad-master
estimated_hours: 8
---

# Story P2-8: Notes → Knowledge RAG Indexing

## User Story

**As** a student or researcher using the BMAD platform,
**I want** to index my Notes workspace notes for RAG (Retrieval-Augmented Generation) in the Knowledge workspace,
**So that** I can search across all my notes using semantic search and get AI-powered answers with citations.

## Problem Statement

The Knowledge workspace has powerful RAG indexing and search capabilities, but there is NO way to:
1. Index notes from Notes workspace for Knowledge search
2. Make notes searchable via semantic embeddings
3. Use RAG chat to answer questions across all notes
4. Get AI responses with citations to specific notes

**Impact**: 2 critical use cases blocked (UC-01, UC-03)

## Acceptance Criteria

### AC-1: Index Notes for RAG
- **Given**: User has notes in Notes workspace
- **When**: User clicks "Index for RAG" button in Notes workspace
- **Then**: System indexes all notes in Knowledge workspace
- **And**: Notes are chunked into searchable segments
- **And**: Embeddings generated for each chunk
- **And**: Chunks stored in Orama vector database
- **And**: User sees progress indicator during indexing

### AC-2: Batch Index Multiple Notes
- **Given**: User has 50+ notes
- **When**: User clicks "Index All for RAG"
- **Then**: System indexes all notes in batch
- **And**: Progress shows X/Y notes indexed
- **And**: User can continue working during indexing
- **And**: Indexing completes without UI freeze

### AC-3: Preserve Note Metadata
- **Given**: Note has title, tags, creation date
- **When**: Note is indexed for RAG
- **Then**: All metadata preserved in chunk
- **And**: Source link includes note ID for citation
- **And**: Tags included for filtering

### AC-4: Event Bus Communication
- **Given**: Notes workspace has notes ready to index
- **When**: User triggers indexing action
- **Then**: System publishes event to cross-workspace event bus
- **And**: Knowledge workspace subscribes and processes indexing
- **And**: User sees progress updates

### AC-5: Knowledge RAG Integration
- **Given**: Notes indexed in Knowledge workspace
- **When**: User searches in Knowledge RAG chat
- **Then**: Results include indexed notes
- **And**: Citations link back to source notes
- **And**: User can navigate from result to note

### AC-6: Incremental Indexing
- **Given**: New note created or existing note updated
- **When**: User clicks "Index for RAG" on single note
- **Then**: Only that note is re-indexed
- **And**: Incremental update to vector database
- **And**: Previous chunks for note replaced

### AC-7: TypeScript Compilation Passes
- **Given**: All changes complete
- **When**: TypeScript compiler runs
- **Then**: Zero errors in production files
- **And**: Build completes successfully

## Technical Implementation

### Phase 1: Event Bus Extension (1 hour)

**File**: `src/infrastructure/events/event-bus.ts`

Add new event type:
```typescript
// Notes events (P2-8 - Notes → Knowledge RAG)
NOTES_RAG_INDEX_REQUESTED = 'notes:rag:index:request'
```

Add payload interface:
```typescript
export interface NotesRAGIndexData {
  workspaceType: 'notes';
  noteIds: string[]; // Array of note IDs to index
  timestamp: Date;
  projectId: string;
  mode: 'batch' | 'incremental'; // Batch all notes or single note
}
```

### Phase 2: Notes Index UI (2 hours)

**File**: `src/presentation/components/notes/NotesPage.tsx`

Add "Index for RAG" button to NoteSidebar or toolbar:
```typescript
const handleIndexForRAG = async (noteIds?: string[]) => {
  const notesToIndex = noteIds || notesArray.map(n => n.id);

  // Publish event to event bus
  eventBus.emit(DomainEventType.NOTES_RAG_INDEX_REQUESTED, {
    workspaceType: 'notes',
    noteIds: notesToIndex,
    timestamp: new Date(),
    projectId,
    mode: noteIds ? 'incremental' : 'batch',
  });

  toast.success('Indexing notes for RAG', {
    description: `Indexing ${notesToIndex.length} note(s)...`,
  });
};
```

**Button placement**: Add to NoteSidebar header or each note card action menu

### Phase 3: Knowledge RAG Indexer (3 hours)

**File**: `src/presentation/components/knowledge/KnowledgePage.tsx`

Subscribe to Notes RAG index events:
```typescript
useEffect(() => {
  const handleNotesRAGIndex = async (event: any) => {
    const indexData = event;
    console.log('[KnowledgePage] NOTES_RAG_INDEX_REQUESTED:', indexData);

    // Get notes from Notes workspace
    // TODO: Use noteStore to fetch note content by IDs

    const indexedCount = 0;
    const totalCount = indexData.noteIds.length;

    for (const noteId of indexData.noteIds) {
      // 1. Fetch note content
      // 2. Chunk into segments
      // 3. Generate embeddings
      // 4. Store in Orama database
      // 5. Update progress
    }

    toast.success('Notes indexed for RAG', {
      description: `${indexedCount}/${totalCount} notes indexed`,
    });
  };

  const unsubscribe = eventBus.on(
    DomainEventType.NOTES_RAG_INDEX_REQUESTED,
    handleNotesRAGIndex as any
  );

  return unsubscribe;
}, [eventBus]);
```

### Phase 4: Note Chunking Strategy (2 hours)

**File**: `src/lib/knowledge/note-chunker.ts` (NEW)

Utility to chunk notes for RAG:
```typescript
export interface NoteChunk {
  id: string;
  noteId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title: string;
    tags: string[];
    createdAt: string;
    chunkType: 'header' | 'paragraph' | 'list' | 'code';
  };
}

export function chunkNoteForRAG(note: Note): NoteChunk[] {
  const chunks: NoteChunk[] = [];

  // Split by headings first
  const sections = note.content.split(/^#{1,3}\s+.+$/m);

  sections.forEach((section, index) => {
    // Further split into paragraphs
    const paragraphs = section.split(/\n\n+/);

    paragraphs.forEach((para, pIndex) => {
      if (para.trim().length > 0) {
        chunks.push({
          id: `chunk-${note.id}-${index}-${pIndex}`,
          noteId: note.id,
          chunkIndex: chunks.length,
          content: para.trim(),
          metadata: {
            title: note.title,
            tags: note.tags || [],
            createdAt: note.createdAt,
            chunkType: detectChunkType(para),
          },
        });
      }
    });
  });

  return chunks;
}
```

## Dev Notes

### Architecture Patterns

Follow existing event bus pattern from P2-6 and P2-7:
- `src/infrastructure/events/cross-workspace-event-bus.ts`
- Use existing `DomainEventType` enum

### Data Flow
```
Notes Workspace                    Knowledge Workspace
     |                                    ^
     | Publishes event                    | Subscribes to event
     v                                    |
Event Bus  →  Note IDs  →  Fetch Notes  →  Chunk Notes  →  Generate Embeddings  →  Store in Orama
```

### Dependencies
- Event bus (already exists)
- Note store (already exists)
- Orama database (already exists)
- Embedding service (already exists)
- Document chunker (already exists)

### File Modifications
- `src/infrastructure/events/event-bus.ts` - Add Notes event type
- `src/presentation/components/notes/NotesPage.tsx` - Add index button
- `src/presentation/components/knowledge/KnowledgePage.tsx` - Subscribe to events
- `src/lib/knowledge/note-chunker.ts` - NEW: Note chunking utility
- `src/lib/knowledge/notes-rag-indexer.ts` - NEW: RAG indexing service

## Testing Strategy

### Manual Testing
1. Open Notes workspace
2. Create or select notes (3+ notes)
3. Click "Index All for RAG" button
4. Verify event published to console
5. Switch to Knowledge workspace
6. Verify indexing progress updates
7. Search in Knowledge RAG chat
8. Verify results include indexed notes
9. Verify citations link to notes

### Type Checking
```bash
pnpm tsc --noEmit 2>&1 | grep -v "test\\|spec" | grep "error"
# Expected: 0 errors
```

### Event Bus Testing
```typescript
// Test event publishing
eventBus.emit(DomainEventType.NOTES_RAG_INDEX_REQUESTED, payload);

// Test event subscription
eventBus.subscribe(DomainEventType.NOTES_RAG_INDEX_REQUESTED, (event) => {
  console.log('Received event:', event);
});
```

## Use Cases Unblocked

Completing this story unblocks:
- **UC-01: Exam Sprint Mixed Media** - Can search across all notes via RAG
- **UC-03: Citation-Grade Literature Map** - Can index literature notes for semantic search

**Total**: 2 critical use cases move from "Partially Feasible" → "Feasible"

## Dev Agent Record

**Agent**: bmad-core-bmad-master
**Session**: 2026-01-03

### Tasks Completed:
- [x] Read 2 blocked use cases (UC-01, UC-03)
- [x] Created story file with acceptance criteria
- [ ] Extend event bus with Notes→Knowledge event type
- [ ] Add index button to Notes workspace
- [ ] Add event subscription to Knowledge workspace
- [ ] Implement note chunking utility
- [ ] Implement RAG indexing service
- [ ] Test cross-workspace communication
- [ ] Manual testing of RAG indexing

### Files Changed:
*TBD*

### Research Executed:
- [x] Read use cases UC-01, UC-03
- [x] Analyzed Notes workspace structure (NotesPage.tsx)
- [x] Reviewed Knowledge workspace structure (KnowledgePage.tsx)
- [x] Analyzed RAG infrastructure (Orama database, embedding service)
- [x] Reviewed document chunker implementation

### Decisions Made:
- P0 priority - completes Knowledge ↔ Notes bidirectional integration
- Event bus pattern for cross-workspace communication (follows P2-6, P2-7)
- Chunking strategy: split by headings, then paragraphs (preserves structure)
- Batch indexing: process all notes non-blocking (use progress indicators)
- Incremental indexing: re-index single notes on update

## Status

**Current**: in-progress
**Last Updated**: 2026-01-03T23:45:00+07:00
**Next Action**: Extend event bus with NOTES_RAG_INDEX_REQUESTED event type

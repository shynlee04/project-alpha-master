# Story 7.1: Orama Index Management

**Epic:** 7 - RAG Infrastructure (Orama WASM)
**Story ID:** 7.1
**Status:** ready-for-dev
**Created:** 2025-12-30
**Estimated:** 4-5 hours

---

## User Story

**As a** developer,
**I want** Orama WASM integrated for local vector search,
**So that** users can search sources semantically without server.

---

## Acceptance Criteria

### AC-7-1-1: Orama WASM Initialization
**Given** the application loads
**When** Orama initializes
**Then** it loads from WASM with no server round-trips
**And** existing indexes are loaded from IndexedDB

### AC-7-1-2: Source Indexing
**Given** a source is imported
**When** indexing completes
**Then** document is added to Orama index
**And** index is persisted to IndexedDB

### AC-7-1-3: Multi-Source Search
**Given** multiple sources exist
**When** user searches
**Then** all sources are searched
**And** results include source attribution

### AC-7-1-4: Index Management
**Given** index becomes large (>100MB)
**When** user manages storage
**Then** they can rebuild index from sources
**And** orphaned indexes are cleaned up

### AC-7-1-5: Demo Checkpoint
🔍 Search finds semantically related content across sources

---

## Technical Requirements

### Orama WASM Integration
- Use `@orama/orama` package (WASM version)
- Initialize with proper schema for document search
- Support full-text search with vector embeddings
- 180KB bundle size requirement
- Web Worker execution for non-blocking search

### Index Schema
```typescript
interface DocumentSchema {
  id: string;          // unique document ID
  sourceId: string;    // reference to knowledge source
  content: string;     // chunk text content
  title?: string;      // document title
  position?: number;   // chunk position in document
  embedding?: number[]; // vector embedding (384-dim)
  metadata?: {        // additional metadata
    chunkIndex: number;
    totalChunks: number;
  };
}
```

### IndexedDB Persistence
- Use Dexie for index storage
- Store serialized Orama indexes
- Transaction-safe updates
- Auto-rebuild on schema changes

### Performance Requirements
- Search latency: <500ms for 1000 documents
- Index building: <60s for 100-page PDF
- Memory limit: <100MB for index storage
- Lazy load indexes on-demand

---

## Architecture Compliance

### Code Structure
```
src/lib/rag/
├── orama-index.ts        # Main index management
├── types.ts              # DocumentSchema, IndexConfig
├── search.ts             # Search interface (Story 7.4)
└── __tests__/
    └── orama-index.test.ts
```

### Dependencies
- `@orama/orama`: Latest stable version
- `@orama/embeddings`: For embedding generation
- Dexie: For IndexedDB persistence
- Existing: `SourceRecord` from knowledge-store

### State Management
- Create Zustand store: `useRAGStore`
- Track: index status, search results, indexing progress
- Persist: index metadata, last indexed timestamp

---

## Developer Context

### Previous Story Context
**Epic 6 (Source Management)** is complete with:
- `SourceRecord` interface with content, title, metadata
- Knowledge store with sources array
- Import pipeline for PDF/URL/text

**Key Integration Points:**
- Hook into `sourceImportPipeline` to trigger indexing after import
- Use existing `sourceId` as index reference
- Leverage `metadataExtracted` flag for search optimization

### File Location Requirements
- **DO NOT** create in `src/lib/git/` (old Epic 7)
- **DO CREATE** in `src/lib/rag/` (new Epic 7)
- Follow brownfield patterns: add new module, don't modify existing unrelated code

### Testing Requirements
- Unit tests for index CRUD operations
- Test IndexedDB serialization/deserialization
- Test search with multiple sources
- Test orphaned index cleanup
- Test large index handling (>100MB)
- Test Web Worker execution

### Known Patterns from Codebase
- **Zustand + Dexie pattern**: See `knowledge-store.ts`
- **Web Worker pattern**: See `terminal-adapter.ts` for worker execution
- **Error handling**: Use `error-handling.ts` utilities
- **Toast notifications**: Use `sonner` library for user feedback

---

## Implementation Tasks

1. **Setup Orama WASM** (30 min)
   - Install `@orama/orama`
   - Create `DocumentSchema` interface
   - Initialize Orama instance

2. **Create Index Manager** (1 hour)
   - `createIndex(projectId)` - Create new index
   - `loadIndex(projectId)` - Load from IndexedDB
   - `saveIndex(projectId, index)` - Persist to IndexedDB
   - `deleteIndex(projectId)` - Clean up orphaned indexes

3. **Document Indexing** (1.5 hours)
   - `indexDocument(sourceId, document)` - Add single document
   - `indexSource(source)` - Index all content from source
   - `removeFromIndex(sourceId)` - Delete indexed documents
   - Handle incremental updates

4. **Search Interface** (1 hour)
   - `search(query, filters)` - Search across all sources
   - Return results with source attribution
   - Support pagination
   - Return relevance scores

5. **Storage Management** (30 min)
   - Get index size
   - Rebuild index from sources
   - Clean up orphaned indexes
   - Storage quota checks

6. **State Management** (30 min)
   - Create `useRAGStore` Zustand store
   - Track indexing progress
   - Cache search results
   - Persist index metadata

7. **Tests** (1 hour)
   - Index CRUD operations
   - Search functionality
   - IndexedDB persistence
   - Storage management
   - Edge cases (empty index, large index, etc.)

---

## Success Criteria

1. ✅ Orama WASM loads without server round-trips
2. ✅ Index persists to and loads from IndexedDB
3. ✅ Sources are automatically indexed on import
4. ✅ Search returns relevant results with source attribution
5. ✅ Index management tools work (rebuild, cleanup)
6. ✅ All tests passing (unit + integration)
7. ✅ Performance requirements met (<500ms search, <60s indexing)
8. ✅ No TypeScript errors
9. ✅ i18n compliance (EN + VI)
10. ✅ Accessibility verified (ARIA labels, keyboard nav)

---

## Notes

### Architecture Decisions
- **WASM over server**: Orama runs entirely in-browser, no external dependencies
- **IndexedDB for persistence**: Dexie transaction-safe updates
- **Web Worker for search**: Non-blocking search operations
- **Separate index per project**: Multi-project support

### Future Considerations
- Story 7.2: Document chunking (512-2048 tokens)
- Story 7.3: Embedding service (hybrid local/cloud)
- Story 7.4: Hybrid retrieval (BM25 + vector)
- Story 7.5: RAG chat integration
- Story 7.6: Deep-think synthesis (gemini-3.0-pro)

### Dependencies on Other Stories
- Requires: Epic 6 (Source Management) for source data
- Enables: Story 7.4 (Hybrid Retrieval)

---

## Completion Checklist

- [ ] Code implementation complete
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] TypeScript compilation successful
- [ ] i18n keys added (EN + VI)
- [ ] Accessibility attributes added
- [ ] Performance benchmarks met
- [ ] Code review completed
- [ ] Documentation updated

---

**Story Status:** ready-for-dev

**Next Steps:**
1. Review architecture documentation
2. Implement Orama index manager
3. Create tests
4. Run dev-story workflow for implementation
5. Code review when complete

**Developer Notes:**
- Start with basic CRUD operations, then add search
- Test with large datasets early (100+ documents)
- Monitor IndexedDB quota usage
- Use Web Workers for heavy operations to avoid blocking UI

---

*End of Story 7.1*

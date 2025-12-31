---
date: 2025-12-31
time: 13:30:00
phase: Story Development Cycle - Phase 1: Create Story File
team: Team-A
agent_mode: bmad-bmm-pm
---

# Story: EPIC-32-1 - Orama WASM Vector Store Enhancement

## Story Header

| Property | Value |
|----------|-------|
| **Epic** | EPIC-32 (RAG Infrastructure) |
| **Story ID** | 32-1 |
| **Story Title** | Orama WASM Vector Store Enhancement |
| **Status** | drafted |
| **Priority** | P0 (Foundation) |
| **Story Points** | 8 |
| **Dependencies** | None |
| **Research Confidence** | 90% |

## User Story

> **As a** Knowledge Synthesis System  
> **I want to** use Orama WASM for local-first vector search  
> **So that** users can perform semantic search without server dependencies

## Story Context

### Business Value
- Enables offline-first semantic search capability
- Reduces server-side RAG infrastructure requirements
- Provides privacy-preserving local embeddings storage
- Supports Vietnamese education market with local-first architecture

### Technical Context
- Building upon existing `src/lib/rag/` infrastructure (22+ files)
- Leverages existing `rag-store.ts` with Orama integration
- Integrates with `transformers.js` for client-side embeddings
- Uses Dexie for persistence layer
- Extends current RAG pipeline (Epic 7) with enhanced capabilities

### Previous Work
- **Epic 7** established base RAG infrastructure with Orama
- **Story 7-1** implemented Orama index management
- **Story 7-2** implemented document chunking pipeline
- This story enhances and extends that foundation

## Acceptance Criteria

### AC-32-1.1: Orama WASM Library Integration
- **Given** the project needs local-first vector search
- **When** the Orama WASM library is integrated
- **Then** the library should be properly bundled via Vite with WASM support
- **And** the integration should be verified with a simple test query
- **And** all dependencies should be in `package.json`

**Validation:**
- [ ] Orama package installed and imported
- [ ] Vite configuration supports WASM bundling
- [ ] Basic vector search test passes

### AC-32-1.2: Enhanced Vector Store Schema
- **Given** the knowledge synthesis system requires structured vector storage
- **When** the Orama index schema is defined
- **Then** the schema should support:
  - Document embeddings (384-dimensional from CLIP)
  - Metadata fields (sourceId, chunkId, collectionId)
  - Full-text search fallback
  - Custom filters (date range, collection, source type)
- **And** the schema should be compatible with existing `rag-store.ts`

**Validation:**
- [ ] Schema defined with TypeScript interfaces
- [ ] Embedding dimension matches transformers.js output (384)
- [ ] Metadata structure matches existing RAG patterns

### AC-32-1.3: Embedding Pipeline Integration
- **Given** documents need to be indexed for semantic search
- **When** a document is processed for indexing
- **Then** the embedding pipeline should:
  - Generate embeddings using transformers.js (CLIP model)
  - Chunk documents appropriately (semantic or fixed-size)
  - Store embeddings in Orama index
  - Persist metadata for retrieval
- **And** the pipeline should handle both text and image embeddings

**Validation:**
- [ ] CLIP model loads and generates embeddings
- [ ] Chunking strategies work (semantic, fixed-size)
- [ ] Embeddings stored with metadata in Orama

### AC-32-1.4: Search Functionality
- **Given** users need to find relevant content
- **When** a search query is submitted
- **Then** the search should:
  - Convert query to embedding using transformers.js
  - Perform similarity search in Orama index
  - Return top-k results with similarity scores
  - Support filters (collection, date range)
  - Return results within <100ms for 1000 documents
- **And** results should include source citations

**Validation:**
- [ ] Query embedding generation works
- [ ] Similarity search returns relevant results
- [ ] Performance benchmark passes (<100ms)
- [ ] Filters work correctly

### AC-32-1.5: Persistence and Recovery
- **Given** the vector index should persist across sessions
- **When** the application is closed and reopened
- **Then** the Orama index should:
  - Be saved to IndexedDB via Dexie
  - Support incremental updates (no full rebuild)
  - Handle browser storage limits gracefully
  - Provide recovery mechanisms for corruption

**Validation:**
- [ ] Index persists across sessions
- [ ] Incremental updates work
- [ ] Quota exceeded handled gracefully

## Tasks

### Research & Setup (Task Group 1)
- [ ] T1.1: Research Orama WASM documentation (Context7 MCP)
- [ ] T1.2: Verify transformers.js CLIP embedding configuration
- [ ] T1.3: Review existing rag-store.ts patterns
- [ ] T1.4: Create implementation plan document

### Implementation Core (Task Group 2)
- [ ] T2.1: Add Orama WASM dependencies to package.json
- [ ] T2.2: Configure Vite for WASM bundling
- [ ] T2.3: Define enhanced vector store schema
- [ ] T2.4: Implement OramaIndex class with TypeScript interfaces
- [ ] T2.5: Create embedding pipeline service

### Search & Query (Task Group 3)
- [ ] T3.1: Implement query embedding generation
- [ ] T3.2: Build similarity search function
- [ ] T3.3: Add filter support (collection, date, source)
- [ ] T3.4: Implement result ranking and pagination

### Persistence (Task Group 4)
- [ ] T4.1: Design IndexedDB storage for Orama index
- [ ] T4.2: Implement index save/load operations
- [ ] T4.3: Add incremental update logic
- [ ] T4.4: Implement quota handling and recovery

### Testing (Task Group 5)
- [ ] T5.1: Write unit tests for embedding pipeline (≥20 tests)
- [ ] T5.2: Write unit tests for search functionality (≥15 tests)
- [ ] T5.3: Write integration tests for persistence (≥10 tests)
- [ ] T5.4: Performance benchmark tests

### Documentation (Task Group 6)
- [ ] T6.1: Document API interfaces
- [ ] T6.2: Update architecture documentation
- [ ] T6.3: Add usage examples

## Research Requirements

### Required MCP Research
1. **Context7**: Orama WASM documentation
   - Query: "Orama.js WASM vector search API patterns"
   - Expected: Schema definition, search options, persistence methods

2. **Deepwiki**: Transformers.js CLIP model configuration
   - Query: "CLIP model embeddings configuration for text/image"
   - Expected: Model loading, embedding generation parameters

3. **Repomix**: Existing rag-store.ts analysis
   - Query: "Orama integration patterns, Dexie persistence"
   - Expected: Current implementation details to extend

### Research Validation Criteria
- [ ] At least 3 MCP tool calls executed
- [ ] Results documented in story file
- [ ] Implementation approach validated against documentation

## Dev Notes

### Architecture Patterns
```
src/lib/rag/
├── orama-index/          # NEW - Orama WASM vector store
│   ├── index.ts          # Main OramaIndex class
│   ├── schema.ts         # Index schema definitions
│   ├── embedding.ts      # CLIP embedding pipeline
│   └── persistence.ts    # IndexedDB storage
├── orama-search.ts       # ENHANCE - Search functionality
├── orama-storage.ts      # ENHANCE - Persistence layer
└── rag-store.ts          # UPDATE - Integrate enhanced index
```

### Key Files to Reference
- `src/lib/rag/orama-index.ts` - Existing Orama index
- `src/lib/rag/rag-store.ts` - RAG store with Orama integration
- `src/lib/notes/note-indexer.ts` - Existing embedding pipeline reference

### Constraints
- File size limit: 300 lines per file
- All UI strings via i18n (en.json + vi.json)
- 8-bit styling for any new components
- Mobile-responsive design

### Known Risks
1. **WASM Bundle Size**: CLIP model is large (~100MB)
   - Mitigation: Lazy load embeddings model
   - Fallback: Use server-side embeddings if needed

2. **Browser Storage Limits**: IndexedDB has quotas
   - Mitigation: Implement LRU eviction for old embeddings
   - Monitoring: Track index size and warn at 80%

3. **Performance**: Embedding generation is CPU-intensive
   - Mitigation: Web Workers for off-main-thread processing
   - Optimization: Cache frequently accessed embeddings

## Dependencies

### Package Dependencies
- `@orama/orama` - Orama WASM vector search
- `@xenova/transformers` - CLIP embeddings (already in use)

### Internal Dependencies
- `src/lib/rag/orama-index.ts` - Base Orama index
- `src/lib/rag/rag-store.ts` - RAG store
- `src/lib/state/dexie-db.ts` - Dexie schema

### External Dependencies
- Dexie.js - IndexedDB wrapper (already in use)
- Transformers.js - Already integrated (Epic 7)

## Dev Agent Record

*(Empty - Will be populated during development phase)*

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| | | |

### Research Executed
| Tool | Query | Finding |
|------|-------|---------|
| | | |

### Decisions Made
| Decision | Rationale |
|----------|-----------|
| | |

## Code Review

*(Empty - Will be populated during code review phase)*

**Reviewer:**  
**Date:**  

**Checklist:**
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

**Issues Found:**
- 

**Sign-off:**
- 

## Status History

| Date | Time | Agent | Status | Notes |
|------|------|-------|--------|--------|
| 2025-12-31 | 13:30:00 | bmad-bmm-pm | drafted | Story file created |
| | | | | |

## References

### Research Artifacts
- `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md`
- `_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md`

### Planning Documents
- `_bmad-output/sprint-artifacts/knowledge-synthesis-sprint-planning-2025-12-31.md`
- `_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md`

### Code References
- `src/lib/rag/orama-index.ts` - Base implementation
- `src/lib/rag/rag-store.ts` - Store integration
- `src/lib/notes/note-indexer.ts` - Embedding reference

### Validation Framework
- `_bmad-output/validation/sweeping-validation.md` - 12-level checklist
- `.agent/workflows/story-dev-cycle.md` - Development workflow

---

**Generated:** 2025-12-31T13:30:00+07:00  
**Agent Mode:** @bmad-bmm-pm  
**Next Phase:** create-context

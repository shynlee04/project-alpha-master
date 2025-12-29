---
title: "7-2 Document Chunking Strategy"
epic: "Epic 7: RAG Infrastructure (Orama WASM)"
story: "7-2-document-chunking"
status: "drafted"
priority: "P0"
points: 5
created: "2025-12-30"
sprint: "SPRINT-7"
team: "Team B"
dependencies:
  - "7-1-orama-index-management"
---

# Story: 7-2 Document Chunking Strategy

**As a** developer implementing RAG,
**I want** an effective chunking strategy for documents,
**So that** retrieval returns relevant, coherent passages.

---

## Story Context

### From Epic 7

Epic 7 delivers "RAG Infrastructure (Orama WASM)" with Orama WASM integration, document chunking, embedding service, hybrid retrieval, RAG chat integration, and deep think synthesis. Story 7.2 delivers the Document Chunking Strategy that splits sources into optimal chunks for retrieval.

### User Journey

1. Developer imports a source (PDF, URL, or text) via the import pipeline
2. System automatically chunks the source content for indexing
3. Chunks respect natural boundaries (paragraphs, headings, code blocks)
4. Each chunk includes metadata (source ID, position, chunk index)
5. Chunks have overlap (100 tokens) to ensure context continuity
6. PDF figures/tables are preserved as separate chunks with captions
7. Developer can visualize chunk boundaries in source preview
8. Chunks are indexed in Orama for semantic search

### Technical Context

**Existing Components (from Story 7-1):**
- `orama-index.ts`: Orama index management (create, load, save, delete)
- `rag-store.ts`: Zustand store for RAG state (index status, search cache)
- `indexeddb-storage.ts`: Dexie-based persistence for Orama indexes

**New Components for Story 7.2:**
- `document-chunker.ts`: Core chunking logic with multiple strategies
- `chunk-strategies.ts`: Pluggable chunking algorithms (fixed-size, semantic, recursive)
- `chunk-metadata.ts`: Types and utilities for chunk metadata

**Chunking Requirements:**
- Target chunk size: 512-2048 tokens (configurable)
- Overlap: 100 tokens between chunks
- Boundary awareness: Respect paragraphs, headings, code blocks
- PDF handling: Preserve figures/tables as separate chunks with captions
- Token counting: Use tokenizer compatible with embedding model

**State Management Extensions:**
- Extend `useRAGStore` with:
  - `chunkingProgress: Map<sourceId, ChunkingProgress>`
  - `chunkSource(sourceId, options)` action
  - `getChunksForSource(sourceId)` selector

**Database Schema (Dexie):**
- Extend `sources` table with chunk metadata:
  - `chunks`: ChunkMetadata[] (array of chunk metadata)
  - `chunkedAt`: timestamp (when chunking was performed)
  - `chunkingStrategy`: string (which strategy was used)

**Styling:**
- 8-bit gaming aesthetic (dark theme)
- Design tokens for consistent spacing and colors
- Chunk boundary visualization in source preview

### Previous Story Intelligence (Story 7-1)

**Key Learnings from Story 7.1:**
1. **Orama WASM Integration**: Successfully integrated Orama with IndexedDB persistence
2. **Zustand Store Pattern**: Used persist middleware with DexieStorage for state
3. **Index Management**: Create, load, save, delete operations working
4. **Test Isolation**: Used unique project IDs for test isolation
5. **Schema Validation**: Default to full-text only when vector search not available
6. **69 Tests Passing**: 20 (indexeddb-storage) + 22 (rag-store) + 27 (orama-index)

**Code Patterns from Story 7.1:**
- Store action pattern: `async action(id, params) → update Dexie → update Zustand state`
- Index operations: `createIndex()`, `indexDocument()`, `searchIndex()`
- Error handling: Toast notifications with actionable buttons
- Test mocking: Proper mock patterns for external dependencies

**Files from Story 7.1:**
- `src/lib/rag/orama-index.ts` (27 tests) - Core Orama index management
- `src/lib/rag/indexeddb-storage.ts` (20 tests) - IndexedDB persistence
- `src/lib/state/rag-store.ts` (22 tests) - Zustand store for RAG state

---

## Acceptance Criteria

### AC-1: Fixed-Size Token Chunking

**Given** a document is processed for indexing
**When** chunking runs with fixed-size strategy
**Then** documents are split into chunks of 512-2048 tokens
**And** chunk boundaries respect: paragraphs, headings, code blocks

### AC-2: Chunk Overlap for Context

**Given** a chunk is created
**When** it's indexed
**Then** overlapping chunks (100 token overlap) ensure coverage
**And** overlap is configurable via options

### AC-3: Chunk Metadata

**Given** a chunk is created
**When** it's indexed
**Then** it includes: text content, source ID, position metadata
**And** metadata includes:
- `chunkIndex`: 0-based index of chunk in source
- `totalChunks`: total number of chunks in source
- `startPosition`: character/word offset in source
- `endPosition`: character/word offset in source

### AC-4: PDF Figure/Table Preservation

**Given** a PDF is chunked
**When** figures/tables exist
**Then** they are preserved as separate chunks with captions
**And** OCR text is included where available
**And** figure/table chunks include type metadata (figure vs table)

### AC-5: Chunking Progress Tracking

**Given** a source is being chunked
**When** chunking is in progress
**Then** progress is tracked via store:
  - `currentChunk`: current chunk number
  - `totalChunks`: total chunks to create
  - `status`: 'chunking' | 'completed' | 'error'

### AC-6: Chunk Boundary Visualization

**Given** a user views a chunked source
**When** preview panel opens
**Then** chunk boundaries are visualized
**And** user can see:
  - Chunk number badges
  - Chunk size indicators
  - Chunk boundaries as horizontal lines

### AC-7: Chunking Strategies

**Given** a developer needs to chunk a document
**When** chunking is configured
**Then** multiple strategies are available:
  - `fixed-size`: Chunk by token count with overlap
  - `semantic`: Chunk by semantic boundaries (paragraphs, sections)
  - `recursive`: Hierarchical chunking for long documents
**And** strategy is configurable per source

---

## Tasks / Subtasks

### Task 1: Define Chunk Metadata Types
- [ ] Define `ChunkMetadata` interface in `src/lib/rag/types.ts`
  - [ ] `chunkId`: string (UUID)
  - [ ] `sourceId`: string
  - [ ] `chunkIndex`: number
  - [ ] `totalChunks`: number
  - [ ] `startPosition`: number
  - [ ] `endPosition`: number
  - [ ] `content`: string
  - [ ] `metadata`: { type?: 'text' | 'figure' | 'table', caption?: string }

- [ ] Define `ChunkingOptions` interface
  - [ ] `strategy`: 'fixed-size' | 'semantic' | 'recursive'
  - [ ] `minChunkSize`: number (default: 512)
  - [ ] `maxChunkSize`: number (default: 2048)
  - [ ] `overlap`: number (default: 100)
  - [ ] `preserveFormatting`: boolean (default: true)

- [ ] Define `ChunkingProgress` interface
  - [ ] `sourceId`: string
  - [ ] `currentChunk`: number
  - [ ] `totalChunks`: number
  - [ ] `status`: 'chunking' | 'completed' | 'error'

### Task 2: Create Token Counter Utility
- [ ] Create `src/lib/rag/token-counter.ts`
  - [ ] Implement `countTokens(text: string): number`
    - [ ] Use tiktoken or simple word/char approximation
    - [ ] Handle edge cases (empty string, special characters)
  - [ ] Implement `findChunkBoundary(text: string, targetSize: number): number`
    - [ ] Search for nearest paragraph break
    - [ ] Search for nearest sentence break
    - [ ] Fallback to word break
  - [ ] Add unit tests
    - [ ] Test token counting accuracy
    - [ ] Test boundary finding logic

### Task 3: Create Chunking Strategies
- [ ] Create `src/lib/rag/chunk-strategies.ts`
  - [ ] Implement `FixedSizeChunker` class
    - [ ] `chunk(content: string, options: ChunkingOptions): ChunkMetadata[]`
    - [ ] Respect min/max chunk sizes
    - [ ] Add overlap between chunks
    - [ ] Find natural boundaries (paragraph, sentence)
  - [ ] Implement `SemanticChunker` class
    - [ ] Split by headings (h1, h2, h3)
    - [ ] Split by code blocks
    - [ ] Respect paragraph boundaries
  - [ ] Implement `RecursiveChunker` class
    - [ ] First pass: Split by sections
    - [ ] Second pass: Split long sections by paragraphs
    - [ ] Third pass: Split long paragraphs by sentences
  - [ ] Add unit tests for each strategy
    - [ ] Test chunk size distribution
    - [ ] Test overlap calculation
    - [ ] Test boundary detection

### Task 4: Create Document Chunker Service
- [ ] Create `src/lib/rag/document-chunker.ts`
  - [ ] Implement `DocumentChunker` class
    - [ ] `chunkSource(source: SourceRecord, options: ChunkingOptions): ChunkMetadata[]`
    - [ ] `chunkPDF(pdfContent: string, options: ChunkingOptions): ChunkMetadata[]`
      - [ ] Detect figures/tables (patterns)
      - [ ] Extract captions
      - [ ] Create separate chunks for figures/tables
    - [ ] `chunkText(text: string, options: ChunkingOptions): ChunkMetadata[]`
  - [ ] Add progress tracking callbacks
    - [ ] `onProgress?: (progress: ChunkingProgress) => void`
  - [ ] Add error handling
    - [ ] Handle empty content
    - [ ] Handle content smaller than min chunk size
  - [ ] Add unit tests
    - [ ] Test chunking with various content sizes
    - [ ] Test progress callbacks
    - [ ] Test error handling

### Task 5: Extend RAG Store with Chunking Actions
- [ ] Extend `useRAGStore` in `src/lib/state/rag-store.ts`
  - [ ] Add `chunkingProgress: Map<sourceId, ChunkingProgress>` state
  - [ ] Add `chunkSource(sourceId: string, options?: ChunkingOptions)` action
    - [ ] Get source from knowledge store
    - [ ] Call `DocumentChunker.chunkSource()`
    - [ ] Update progress during chunking
    - [ ] Save chunks to IndexedDB
    - [ ] Index chunks in Orama
  - [ ] Add `getChunksForSource(sourceId: string)` selector
  - [ ] Add `clearChunkingProgress(sourceId: string)` action
- [ ] Add unit tests for store actions
  - [ ] Test chunking progress tracking
  - [ ] Test chunk metadata persistence
  - [ ] Test selector functions

### Task 6: Integrate Chunking with Import Pipeline
- [ ] Modify `src/lib/knowledge/source-import.ts`
  - [ ] Add `autoChunk: boolean` option to `SourceImportOptions`
  - [ ] After import, trigger chunking if enabled
  - [ ] Show progress indicator: "Chunking document..."
  - [ ] Handle chunking errors gracefully
- [ ] Add unit tests
  - [ ] Test automatic chunking after import
  - [ ] Test error handling

### Task 7: Create Chunk Boundary Visualization
- [ ] Modify `src/components/knowledge/SourcePreviewPanel.tsx`
  - [ ] Add `showChunkBoundaries` prop
  - [ ] Render chunk boundaries as horizontal lines
  - [ ] Render chunk number badges
  - [ ] Render chunk size indicators
  - [ ] Add toggle button in header: "Show chunks"
- [ ] Add unit tests
  - [ ] Test boundary rendering
  - [ ] Test toggle functionality

### Task 8: Add i18n Translation Keys
- [ ] Add chunking-related keys to `src/i18n/en.json`
  - [ ] `rag.chunking.chunking`: "Chunking document..."
  - [ ] `rag.chunking.completed`: "Chunking complete"
  - [ ] `rag.chunking.error`: "Chunking failed"
  - [ ] `rag.chunking.showBoundaries`: "Show chunks"
  - [ ] `rag.chunking.chunk`: "Chunk {current} of {total}"
- [ ] Add Vietnamese translations to `src/i18n/vi.json`

---

## Dev Notes

### Architecture Patterns

**Chunking Strategy Pattern:**
```typescript
interface ChunkStrategy {
    chunk(content: string, options: ChunkingOptions): ChunkMetadata[];
}

class FixedSizeChunker implements ChunkStrategy {
    chunk(content: string, options: ChunkingOptions): ChunkMetadata[] {
        // 1. Count tokens in content
        // 2. Find chunk boundaries
        // 3. Split content into chunks
        // 4. Add overlap between chunks
        // 5. Generate metadata
    }
}
```

**Token Approximation:**
```typescript
// Simple approximation (can be replaced with tiktoken later)
function countTokens(text: string): number {
    // Approximate: 1 token ≈ 4 characters (English)
    // Or: 1 token ≈ 0.75 words
    return Math.ceil(text.length / 4);
}

// More accurate: Use word count with multiplier
function countTokens(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 1.3); // 1.3 tokens per word average
}
```

**Boundary Detection:**
```typescript
function findChunkBoundary(
    text: string,
    targetSize: number,
    minChunkSize: number,
    maxChunkSize: number
): number {
    // 1. Search for paragraph break (double newline)
    // 2. Search for sentence break (period, question mark, exclamation)
    // 3. Search for word break (space)
    // 4. Force split at targetSize if no boundary found
}
```

### Component Structure

**SourcePreviewPanel Extensions:**
- Add `showChunkBoundaries: boolean` prop
- Render `<ChunkBoundary>` components at chunk boundaries
- Add `<ChunkBadge>` showing chunk number and size
- Add toggle button in header

**ChunkBoundary Component:**
- Visual separator (horizontal line with 8-bit styling)
- Optional: Click to jump to chunk in search results

### Testing Standards

**Unit Tests:**
- Test token counting with various inputs
- Test boundary detection logic
- Test each chunking strategy
- Test chunk metadata generation
- Test progress tracking

**Integration Tests:**
- Test full chunking flow (source → chunks → index)
- Test chunk visualization in preview panel
- Test automatic chunking after import

**Test Coverage:**
- Target: 80%+ coverage for chunking logic
- Target: 70%+ coverage for visualization
- All error paths must have tests

### File Structure

```
src/
├── lib/
│   └── rag/
│       ├── types.ts (modify) - Add chunking types
│       ├── token-counter.ts (new) - Token counting utilities
│       ├── chunk-strategies.ts (new) - Chunking algorithms
│       ├── document-chunker.ts (new) - Main chunker service
│       └── __tests__/
│           ├── token-counter.test.ts (new)
│           ├── chunk-strategies.test.ts (new)
│           └── document-chunker.test.ts (new)
├── lib/
│   └── state/
│       └── rag-store.ts (modify) - Add chunking actions
└── components/
    └── knowledge/
        ├── SourcePreviewPanel.tsx (modify) - Add chunk visualization
        └── __tests__/
            └── SourcePreviewPanel-chunks.test.tsx (new)
```

### Key Dependencies

- **orama**: ^2.0.0 (already installed from Story 7.1)
- **zustand**: ^4.5.0 (state management)
- **dexie**: ^3.2.4 (IndexedDB)
- **tiktoken**: Optional (for accurate token counting)

---

## Definition of Done

- [ ] All acceptance criteria implemented (AC-1 through AC-7)
- [ ] Unit tests written (chunking logic, progress tracking, visualization)
- [ ] Token counter utility with tests
- [ ] Multiple chunking strategies implemented
- [ ] RAG store extended with chunking actions
- [ ] Chunk visualization in source preview
- [ ] i18n keys added (EN + VI)
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `7-2-document-chunking: review`

---

## References

- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md` - Section 9.5 (RAG Infrastructure)
- **PRD:** `_bmad-output/project-planning-artifacts/prd.md` - Section 9.2 (Document Chunking)
- **UX Design:** `_bmad-output/project-planning-artifacts/ux-design-specification.md` - Section 21 (RAG & Citation Interface)
- **Epic 7:** `_bmad-output/epics.md` - Story 7.2
- **Story 7.1:** `_bmad-output/sprint-artifacts/7-1-orama-index-management.md` - Orama index management

---

## Research Requirements

### MCP Research Tasks (MANDATORY before implementation)

1. **Token Counting Libraries**
   - Query Context7 for tiktoken (token counting library)
   - Verify browser compatibility
   - Check bundle size impact
   - Research alternatives (simple approximation)

2. **Chunking Best Practices**
   - Research RAG chunking strategies (LangChain, LlamaIndex)
   - Verify optimal chunk sizes for retrieval
   - Research overlap strategies
   - Document best practices

3. **PDF Figure/Table Detection**
   - Research PDF.js figure/table detection capabilities
   - Verify OCR text extraction
   - Research caption extraction patterns
   - Document limitations

4. **Chunk Visualization Patterns**
   - Research UI patterns for showing chunk boundaries
   - Verify accessibility considerations
   - Research 8-bit styled components for chunking
   - Document best practices

---

## Dev Agent Record

**Agent:** [To be filled during implementation]
**Session:** [To be filled during implementation]

#### Task Progress:
- [ ] T1: Define Chunk Metadata Types
- [ ] T2: Create Token Counter Utility
- [ ] T3: Create Chunking Strategies
- [ ] T4: Create Document Chunker Service
- [ ] T5: Extend RAG Store with Chunking Actions
- [ ] T6: Integrate Chunking with Import Pipeline
- [ ] T7: Create Chunk Boundary Visualization
- [ ] T8: Add i18n Translation Keys

#### Research Executed:
- [ ] Context7: Token counting libraries (tiktoken)
- [ ] Tavily: RAG chunking best practices
- [ ] Deepwiki: PDF.js figure/table detection
- [ ] Codebase: Existing chunking patterns (if any)

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| [To be filled during implementation] | | |

#### Tests Created:
| Test File | Tests | Status |
|-----------|-------|--------|
| [To be filled during implementation] | | |

#### Decisions Made:
- Decision 1: [To be filled during implementation]

#### Known Issues:
- [To be filled during implementation]

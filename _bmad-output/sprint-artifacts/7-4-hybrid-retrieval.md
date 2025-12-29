---
title: "7-4 Hybrid Retrieval Tool (BM25 + Vector + RRF)"
epic: "Epic 7: RAG Infrastructure (Orama WASM)"
story: "7-4-hybrid-retrieval"
status: "drafted"
priority: "P0"
points: 8
created: "2025-12-30"
sprint: "SPRINT-7"
team: "Team B"
dependencies:
  - "7-3-embedding-service"
---

# Story: 7-4 Hybrid Retrieval Tool (BM25 + Vector + RRF)

**As a** user searching knowledge,
**I want** combined keyword and semantic search,
**So that** I find both exact matches and related concepts.

---

## Story Context

### From Epic 7

Epic 7 delivers "RAG Infrastructure (Orama WASM)" with Orama WASM integration, document chunking, embedding service, hybrid retrieval, RAG chat integration, and deep think synthesis. Story 7.4 delivers the Hybrid Retrieval Tool that combines BM25 keyword search with vector semantic search using Reciprocal Rank Fusion (RRF).

### User Journey

1. User enters a search query in the search box
2. System runs BM25 keyword search in parallel with vector semantic search
3. Results from both searches are fused using Reciprocal Rank Fusion (RRF)
4. Final results are displayed with combined relevance scores
5. User clicks a result → source opens at relevant passage with matching text highlighted
6. If no results match → show "No results found" message with search tips

### Technical Context

**Existing Components (from Stories 7-1, 7-2, 7-3):**
- `orama-index.ts`: Orama index management (create, load, save, delete)
- `document-chunker.ts`: Document chunking with multiple strategies
- `embedding-service.ts`: Hybrid embedding service (local + cloud)
- `embedding-cache.ts`: IndexedDB-based embedding model cache
- `cloud-embedder.ts`: Gemini API-based cloud embeddings
- `rag-store.ts`: Zustand store for RAG state

**New Components for Story 7.4:**
- `hybrid-retriever.ts`: Hybrid retrieval service combining BM25 + vector search
- `bm25-searcher.ts`: BM25 keyword search implementation
- `rrf-fusion.ts`: Reciprocal Rank Fusion algorithm
- `search-highlighter.ts`: Text highlighting for matched passages

**Hybrid Retrieval Requirements:**
- **BM25 Search**: Keyword-based search with TF-IDF scoring
- **Vector Search**: Semantic search using embeddings
- **RRF Fusion**: Reciprocal Rank Fusion to combine both result sets
- **Parallel Execution**: Both searches run in parallel for performance
- **Result Scoring**: Combined relevance score displayed to user
- **Text Highlighting**: Matched text highlighted in results

**State Management Extensions:**
- Extend `useRAGStore` with:
  - `searchQuery: string`
  - `searchResults: SearchResult[]`
  - `searchMode: 'keyword' | 'semantic' | 'hybrid'`
  - `search(query, mode)` action

**Styling:**
- 8-bit gaming aesthetic (dark theme)
- Result cards with relevance score badges
- Highlighted text in yellow/amber
- "No results" state with helpful tips

### Previous Story Intelligence (Story 7-3)

**Key Learnings from Story 7.3:**
1. **Embedding Service**: Comprehensive hybrid local/cloud embedding with provider selection
2. **Model Caching**: IndexedDB-based model cache with quota handling
3. **State Management**: Map serialization pattern for persistence
4. **Type Imports**: Inline imports to avoid circular dependencies
5. **i18n**: English + Vietnamese translations for all UI strings

**Code Patterns from Story 7.3:**
- Service pattern: `class Service { async method(input, options) }`
- Provider selection: Auto-detect capability → choose best provider
- Error handling: Try-catch with specific error types
- Store actions: Update state → persist to IndexedDB → notify UI

**Files from Story 7.3:**
- `src/lib/rag/embedding-service.ts` - Hybrid embedding service
- `src/lib/rag/embedding-cache.ts` - Model cache service
- `src/lib/rag/cloud-embedder.ts` - Cloud embedder
- `src/lib/rag/types.ts` - Embedding type definitions
- `src/lib/state/rag-store.ts` - RAG state with embedding actions
- `src/lib/state/dexie-db.ts` - Version 14 migration for embedding_models

---

## Acceptance Criteria

### AC-1: Parallel Hybrid Search

**Given** a user enters a search query,
**When** search executes,
**Then** BM25 keyword search runs in parallel with vector search
**And** results are fused using Reciprocal Rank Fusion (RRF)
**And** final results show combined relevance score

### AC-2: Result Click Navigation

**Given** search results appear,
**When** user clicks a result,
**Then** the source opens at the relevant passage
**And** the matching text is highlighted

### AC-3: No Results State

**Given** no results match,
**When** search completes,
**Then** show "No results found" message
**And** display search tips (e.g., "Try different keywords", "Use broader terms")

### AC-4: Search Mode Selection

**Given** user wants to control search type,
**When** user selects search mode (keyword/semantic/hybrid),
**Then** search uses only the selected mode
**And** UI shows current mode indicator

### AC-5: Result Scoring Display

**Given** search results are displayed,
**When** results appear,
**Then** each result shows combined relevance score (0-1 or percentage)
**And** score badge uses color coding (green > 0.8, yellow > 0.5, red < 0.5)

### AC-6: Text Highlighting

**Given** a search result is displayed,
**When** matched text is shown,
**Then** matching keywords are highlighted in yellow/amber
**And** highlighting preserves original formatting

### AC-7: Performance Requirements

**Given** a search query is submitted,
**When** search executes,
**Then** results return within 2 seconds for < 100 documents
**And** parallel execution does not block UI

---

## Tasks / Subtasks

### Task 1: Define Retrieval Types and Interfaces
- [ ] Define retrieval types in `src/lib/rag/types.ts`
  - [ ] `SearchResult`: Extended interface with highlighting info
  - [ ] `SearchMode`: 'keyword' | 'semantic' | 'hybrid'
  - [ ] `RetrievalOptions`: Search configuration interface
  - [ ] `RRFConfig`: Reciprocal Rank Fusion parameters
  - [ ] `BM25Config`: BM25 algorithm parameters

### Task 2: Create BM25 Keyword Searcher
- [ ] Create `src/lib/rag/bm25-searcher.ts`
  - [ ] Implement `BM25Searcher` class
    - [ ] `indexDocuments(documents)` - Build TF-IDF index
    - [ ] `search(query, options)` - BM25 search with scoring
    - [ ] `calculateBM25Score(doc, query)` - BM25 algorithm
  - [ ] Add tokenization for multi-language (EN + VI)
  - [ ] Add stopword filtering
  - [ ] Add unit tests
    - [ ] Test BM25 scoring
    - [ ] Test tokenization
    - [ ] Test relevance ranking

### Task 3: Create Vector Searcher (Embedding-Based)
- [ ] Create `src/lib/rag/vector-searcher.ts`
  - [ ] Implement `VectorSearcher` class
    - [ ] `constructor(embeddingService)`
    - [ ] `search(query, options)` - Semantic vector search
    - [ ] `calculateSimilarity(embedding1, embedding2)` - Cosine similarity
  - [ ] Integrate with embedding-service.ts
  - [ ] Add query embedding caching
  - [ ] Add unit tests
    - [ ] Test vector similarity calculation
    - [ ] Test search ranking
    - [ ] Test embedding integration

### Task 4: Create RRF Fusion Algorithm
- [ ] Create `src/lib/rag/rrf-fusion.ts`
  - [ ] Implement `RRFFusion` class
    - [ ] `fuse(keywordResults, vectorResults, k)` - RRF fusion
    - [ ] `calculateRRFScore(rank, k)` - RRF score formula: 1/(k + rank)
  - [ ] Implement configurable k parameter (default: 60)
  - [ ] Add duplicate result handling
  - [ ] Add unit tests
    - [ ] Test RRF scoring
    - [ ] Test result fusion
    - [ ] Test edge cases (empty results, single source)

### Task 5: Create Hybrid Retriever Service
- [ ] Create `src/lib/rag/hybrid-retriever.ts`
  - [ ] Implement `HybridRetriever` class
    - [ ] `constructor(bm25Searcher, vectorSearcher, rrfFusion)`
    - [ ] `search(query, options)` - Parallel hybrid search
    - [ ] `searchMode(mode)` - Set search mode
  - [ ] Implement parallel search execution (Promise.all)
  - [ ] Add result ranking and sorting
  - [ ] Add error handling (graceful fallback if one search fails)
  - [ ] Add unit tests
    - [ ] Test parallel execution
    - [ ] Test result fusion
    - [ ] Test fallback handling
    - [ ] Test search mode switching

### Task 6: Create Text Highlighter Utility
- [ ] Create `src/lib/rag/search-highlighter.ts`
  - [ ] Implement `SearchHighlighter` class
    - [ ] `highlight(text, queryTerms)` - Highlight matching terms
    - [ ] `escapeRegex(text)` - Safe regex escaping
  - [ ] Preserve HTML/markdown formatting
  - [ ] Support case-insensitive highlighting
  - [ ] Add unit tests
    - [ ] Test highlighting accuracy
    - [ ] Test special character handling
    - [ ] Test markdown preservation

### Task 7: Extend RAG Store with Search Actions
- [ ] Extend `useRAGStore` in `src/lib/state/rag-store.ts`
  - [ ] Add `searchQuery: string` state
  - [ ] Add `searchResults: SearchResult[]` state
  - [ ] Add `searchMode: SearchMode` state
  - [ ] Add `search(query: string, mode?: SearchMode)` action
  - [ ] Add `setSearchMode(mode: SearchMode)` action
  - [ ] Add `clearSearchResults()` action
- [ ] Add unit tests for store actions
  - [ ] Test search state updates
  - [ ] Test search mode switching
  - [ ] Test result caching

### Task 8: Create Search Results UI Component
- [ ] Create `src/components/rag/SearchResults.tsx`
  - [ ] Result cards with:
    - [ ] Title and source attribution
    - [ ] Relevance score badge (color-coded)
    - [ ] Highlighted text preview
    - [ ] Click handler for navigation
  - [ ] "No results" state with tips
  - [ ] Loading state during search
  - [ ] Error state with retry option
- [ ] Create `src/components/rag/SearchModeSelector.tsx`
  - [ ] Mode toggle buttons (keyword/semantic/hybrid)
  - [ ] Active mode indicator
- [ ] Add unit tests
  - [ ] Test result rendering
  - [ ] Test highlighting display
  - [ ] Test mode switching
  - [ ] Test empty states

### Task 9: Add i18n Translation Keys
- [ ] Add search-related keys to `src/i18n/en.json`
  - [ ] `rag.search.title`: "Search Knowledge"
  - [ ] `rag.search.mode.keyword`: "Keyword"
  - [ ] `rag.search.mode.semantic`: "Semantic"
  - [ ] `rag.search.mode.hybrid`: "Hybrid"
  - [ ] `rag.search.placeholder`: "Search your knowledge..."
  - [ ] `rag.search.results`: "{{count}} results"
  - [ ] `rag.search.noResults`: "No results found"
  - [ ] `rag.search.score`: "Relevance: {{score}}%"
  - [ ] `rag.search.tips`: "Try different keywords or use broader terms"
- [ ] Add Vietnamese translations to `src/i18n/vi.json`

---

## Dev Notes

### Architecture Patterns

**Hybrid Retrieval Pattern:**
```typescript
class HybridRetriever {
    async search(query: string, options: RetrievalOptions): Promise<SearchResult[]> {
        const mode = options.mode || 'hybrid';

        if (mode === 'keyword') {
            return await this.bm25Searcher.search(query, options);
        } else if (mode === 'semantic') {
            return await this.vectorSearcher.search(query, options);
        } else {
            // Parallel search for hybrid mode
            const [keywordResults, vectorResults] = await Promise.all([
                this.bm25Searcher.search(query, options),
                this.vectorSearcher.search(query, options)
            ]);

            return this.rrfFusion.fuse(keywordResults, vectorResults);
        }
    }
}
```

**BM25 Algorithm:**
```typescript
// BM25 score formula:
// score(D,Q) = Σ IDF(qi) * (f(qi,D) * (k1 + 1)) / (f(qi,D) + k1 * (1 - b + b * |D| / avgdl))

function calculateBM25Score(doc: Document, query: string, k1: number, b: number): number {
    const tf = termFrequency(doc, query);
    const idf = inverseDocumentFrequency(query);
    const docLength = doc.tokens.length;
    const avgDocLength = this.averageDocumentLength;

    return idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / avgDocLength)));
}
```

**RRF Fusion Algorithm:**
```typescript
// Reciprocal Rank Fusion: score = 1/(k + rank)
// Default k = 60

function fuseResults(keywordResults: SearchResult[], vectorResults: SearchResult[], k: number = 60): SearchResult[] {
    const scores = new Map<string, number>();

    // Score keyword results
    keywordResults.forEach((result, index) => {
        const score = 1 / (k + index + 1);
        scores.set(result.id, (scores.get(result.id) || 0) + score);
    });

    // Score vector results
    vectorResults.forEach((result, index) => {
        const score = 1 / (k + index + 1);
        scores.set(result.id, (scores.get(result.id) || 0) + score);
    });

    // Combine and sort
    return [...scores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id, score]) => ({ id, score }));
}
```

**Text Highlighting:**
```typescript
function highlightText(text: string, queryTerms: string[]): string {
    const escapedTerms = queryTerms.map(term => escapeRegex(term));
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    return text.replace(pattern, '<mark>$1</mark>');
}
```

### Component Structure

**SearchResults Component:**
```typescript
interface SearchResultsProps {
    results: SearchResult[];
    searchQuery: string;
    loading: boolean;
    error?: string;
    onResultClick: (result: SearchResult) => void;
}

function SearchResults({ results, searchQuery, loading, error, onResultClick }: SearchResultsProps) {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (results.length === 0) return <EmptyState />;

    return (
        <div className="search-results">
            {results.map(result => (
                <ResultCard
                    key={result.id}
                    result={result}
                    highlightedText={highlightText(result.content, searchQuery)}
                    onClick={() => onResultClick(result)}
                />
            ))}
        </div>
    );
}
```

### Testing Standards

**Unit Tests:**
- Test BM25 scoring algorithm
- Test vector similarity calculation
- Test RRF fusion logic
- Test text highlighting accuracy
- Test parallel search execution
- Test search mode switching
- Test error scenarios

**Integration Tests:**
- Test full hybrid search flow
- Test result ranking accuracy
- Test parallel execution performance
- Test graceful fallback behavior
- Test UI interactions

**Test Coverage:**
- Target: 80%+ coverage for retrieval logic
- Target: 70%+ coverage for UI components
- All error paths must have tests

### File Structure

```
src/
├── lib/
│   └── rag/
│       ├── types.ts (modify) - Add retrieval types
│       ├── bm25-searcher.ts (new) - BM25 keyword search
│       ├── vector-searcher.ts (new) - Vector semantic search
│       ├── rrf-fusion.ts (new) - RRF fusion algorithm
│       ├── hybrid-retriever.ts (new) - Hybrid retrieval service
│       ├── search-highlighter.ts (new) - Text highlighting utility
│       └── __tests__/
│           ├── bm25-searcher.test.ts (new)
│           ├── vector-searcher.test.ts (new)
│           ├── rrf-fusion.test.ts (new)
│           ├── hybrid-retriever.test.ts (new)
│           └── search-highlighter.test.ts (new)
├── lib/
│   └── state/
│       └── rag-store.ts (modify) - Add search actions
├── components/
│   └── rag/
│       ├── SearchResults.tsx (new) - Search results UI
│       ├── SearchModeSelector.tsx (new) - Mode toggle
│       └── __tests__/
│           ├── SearchResults.test.tsx (new)
│           └── SearchModeSelector.test.tsx (new)
└── i18n/
    ├── en.json (modify) - Add search keys
    └── vi.json (modify) - Add search keys (VI)
```

### Key Dependencies

- **orama**: ^2.0.0 (already installed from Story 7-1)
- **@orama/orama**: Orama WASM for vector search (already installed)
- **zustand**: ^4.5.0 (state management)
- **dexie**: ^3.2.4 (IndexedDB)

---

## Definition of Done

- [ ] All acceptance criteria implemented (AC-1 through AC-7)
- [ ] Unit tests written (BM25, vector, RRF, hybrid retriever, highlighting)
- [ ] Hybrid retrieval service with parallel search
- [ ] Search results UI component
- [ ] Search mode selector component
- [ ] Text highlighting for matched passages
- [ ] RAG store extended with search actions
- [ ] i18n keys added (EN + VI)
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `7-4-hybrid-retrieval: review`

---

## References

- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md` - Section 9.5 (RAG Infrastructure)
- **PRD:** `_bmad-output/project-planning-artifacts/prd.md` - Section 7.2 (Hybrid Retrieval)
- **UX Design:** `_bmad-output/project-planning-artifacts/ux-design-specification.md` - Section 21 (RAG & Citation Interface)
- **Epic 7:** `_bmad-output/epics.md` - Story 7.4
- **Story 7.1:** `_bmad-output/sprint-artifacts/7-1-orama-index-management.md` - Orama index management
- **Story 7.2:** `_bmad-output/sprint-artifacts/7-2-document-chunking.md` - Document chunking
- **Story 7.3:** `_bmad-output/sprint-artifacts/7-3-embedding-service.md` - Embedding service

---

## Research Requirements

### MCP Research Tasks (MANDATORY before implementation)

1. **BM25 Algorithm Implementation**
   - Research BM25 algorithm parameters (k1, b)
   - Study tokenization for multi-language (English + Vietnamese)
   - Research stopword lists for both languages
   - Document best practices for TF-IDF calculation

2. **Reciprocal Rank Fusion (RRF)**
   - Research RRF algorithm and k parameter selection
   - Study optimization techniques for result fusion
   - Document edge cases and error handling

3. **Text Highlighting Techniques**
   - Research safe regex escaping for user input
   - Study markdown-aware highlighting
   - Document performance considerations for large texts

4. **Orama WASM Search Capabilities**
   - Research Orama's built-in BM25 support
   - Study Orama's vector search features
   - Document integration patterns with existing index

---

## Dev Agent Record

**Agent:** Claude Sonnet 4.5
**Session:** 2025-12-30T16:30:00+07:00

#### Task Progress:
- [ ] T1: Define Retrieval Types and Interfaces
- [ ] T2: Create BM25 Keyword Searcher
- [ ] T3: Create Vector Searcher (Embedding-Based)
- [ ] T4: Create RRF Fusion Algorithm
- [ ] T5: Create Hybrid Retriever Service
- [ ] T6: Create Text Highlighter Utility
- [ ] T7: Extend RAG Store with Search Actions
- [ ] T8: Create Search Results UI Component
- [ ] T9: Add i18n Translation Keys

#### Research Executed:
- [ ] BM25 algorithm research
- [ ] RRF fusion research
- [ ] Text highlighting research
- [ ] Orama WASM search capabilities

#### Files Created:
*To be populated during implementation*

#### Files Modified:
*To be populated during implementation*

#### Tests Created:
*To be populated during implementation*

#### Test Results:
*To be populated during implementation*

#### Decisions Made:
*To be populated during implementation*

#### Known Issues:
*To be populated during implementation*

#### Code Review Findings:
*To be populated during implementation*

#### Acceptance Criteria Status:
- [ ] AC-1: Parallel Hybrid Search
- [ ] AC-2: Result Click Navigation
- [ ] AC-3: No Results State
- [ ] AC-4: Search Mode Selection
- [ ] AC-5: Result Scoring Display
- [ ] AC-6: Text Highlighting
- [ ] AC-7: Performance Requirements

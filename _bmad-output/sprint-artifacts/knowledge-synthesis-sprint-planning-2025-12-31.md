---
date: 2025-12-31
time: 06:17:00
phase: Sprint Planning
team: Team-A | Team-B (Parallel Execution)
agent_mode: bmad-core-bmad-master
---

# Knowledge Synthesis Platform - Sprint Planning Document

**Epic Range:** EPIC-32 through EPIC-37  
**Created:** 2025-12-31  
**Based On:** [`_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md`](_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md)  
**Coordinated With:** [`.agent/workflows/story-dev-cycle.md`](.agent/workflows/story-dev-cycle.md)  
**Validation Reference:** [`_bmad-output/validation/sweeping-validation.md`](_bmad-output/validation/sweeping-validation.md)

---

## Executive Summary

This document provides comprehensive sprint planning for implementing the Knowledge Synthesis Platform based on the technical specification. Key findings:

- **Existing Infrastructure:** 42 RAG components, 20+ knowledge components already implemented
- **Gap Analysis:** Missing multimodal processing (image OCR, audio transcription), adaptive learning, study artifact generation
- **Health Status:** Current codebase has 5.9% health score (1,172 TS errors, 37 file size violations)
- **Parallel Execution Strategy:** Team A (UI/Foundation), Team B (Backend/Agent)

---

## Part 1: Component Mapping Analysis

### 1.1 Existing RAG Infrastructure (`src/lib/rag/`)

| Component | Status | Tech Spec Mapping | Gap |
|-----------|--------|-------------------|-----|
| `orama-index.ts` | ✅ Exists | EPIC-32 Vector Store | Extend for multimodal embeddings |
| `document-chunker.ts` | ✅ Exists | EPIC-35 Document Processing | Add structural analysis |
| `embedding-service.ts` | ✅ Exists | EPIC-32 Embeddings | Add image embeddings (CLIP) |
| `hybrid-retriever.ts` | ✅ Exists | EPIC-32 Retrieval Pipeline | Extend for cross-modal |
| `rag-chat.ts` | ✅ Exists | EPIC-33 Agent Integration | Add synthesis context |
| `citation-formatter.ts` | ✅ Exists | EPIC-37 Study Artifacts | Extend for citations |
| `token-counter.ts` | ✅ Exists | Infrastructure | No gap |
| `indexeddb-storage.ts` | ✅ Exists | Infrastructure | No gap |
| `transformers-loader.ts` | ✅ Exists | EPIC-32 Embeddings | Add CLIP model support |

### 1.2 Existing Knowledge Components (`src/lib/knowledge/`)

| Component | Status | Tech Spec Mapping | Gap |
|-----------|--------|-------------------|-----|
| `flashcard-generator.ts` | ✅ Exists | EPIC-37 Study Artifacts | Extend for synthesis |
| `metadata-extractor.ts` | ✅ Exists | EPIC-35 Document Processing | Add structural analysis |
| `pdf-parser.ts` | ✅ Exists | EPIC-35 Document Processing | Add visual structure |
| `source-import.ts` | ✅ Exists | EPIC-35 Ingestion Pipeline | Extend for multimodal |
| `url-fetcher.ts` | ✅ Exists | EPIC-35 URL Processing | Add content extraction |

### 1.3 Existing Notes Components (`src/lib/notes/`)

| Component | Status | Tech Spec Mapping | Gap |
|-----------|--------|-------------------|-----|
| `note-store.ts` | ✅ Exists (525 lines) | EPIC-33 Knowledge Storage | Split into smaller modules |
| `note-indexer.ts` | ✅ Exists (381 lines) | EPIC-32 Index Pipeline | Extend for embeddings |
| `note-ai-service.ts` | ⚠️ Placeholder | EPIC-33 AI Integration | Implement TanStack AI |
| `note-navigation-store.ts` | ✅ Exists | UI/UX | No gap |

### 1.4 Critical Validation Findings

From [`_bmad-output/validation/sweeping-validation.md`](_bmad-output/validation/sweeping-validation.md):

| Issue | Severity | Impact on EPIC-32-37 |
|-------|----------|---------------------|
| TypeScript Errors (1,172) | 🔴 Critical | Must fix before new code |
| File Size Violations (37 files) | 🟠 High | `note-store.ts` (525 lines), `note-indexer.ts` (381 lines) |
| AI Streaming Placeholder | 🔴 Critical | `note-ai-service.ts` is stub |
| Drag-and-Drop Missing | 🟠 High | State exists, no UI implementation |
| Missing Citations | 🟠 High | Source references not displayed |

---

## Part 2: Gap Analysis & Refactoring Recommendations

### 2.1 Component Consolidation Map

```
EXISTING                          TECH SPEC REQUIRED                    ACTION
─────────────────────────────────────────────────────────────────────────────
src/lib/rag/orama-index    →     EPIC-32 Vector Store                  EXTEND
src/lib/rag/embedding      →     EPIC-32 Text + Image Embeddings      ADD CLIP
src/lib/knowledge/pdf      →     EPIC-35 PDF Processing               EXTEND
src/lib/notes/note-store   →     EPIC-33 Knowledge Storage            REFACTOR (split)
src/lib/rag/rag-chat       →     EPIC-33 Agent Integration            EXTEND
(NONE)                      →     EPIC-34 Image Understanding          CREATE NEW
(NONE)                      →     EPIC-36 Adaptive Learning           CREATE NEW
src/lib/knowledge/flash    →     EPIC-37 Study Artifacts              EXTEND
```

### 2.2 Refactoring Priorities (Per Sweeping Validation)

| Priority | File | Current Lines | Target | Action |
|----------|------|---------------|--------|--------|
| P0 | `note-store.ts` | 525 | 300 | Split into note-tree-store.ts, note-content-store.ts |
| P0 | `note-indexer.ts` | 381 | 300 | Split into note-embeddings.ts, note-search.ts |
| P1 | `sync-manager.ts` | 667 | 300 | Split per sweeping validation |
| P1 | `live-api-websocket.ts` | 387 | 300 | Extract retry logic |

---

## Part 3: Sprint 1 - EPIC-32 RAG Infrastructure (Weeks 1-2)

**Focus:** Foundation vector store, embedding pipeline, and retrieval system

### Story 32-1: Orama WASM Vector Store Enhancement

**User Story:**
```
As a user,
I want my knowledge sources to be indexed with local-first vector search,
So that I can find relevant content instantly without network latency.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Orama index created for each project | `orama-index.ts` exists | Extend for project isolation |
| AC-2 | 384-dimensional embeddings generated | `embedding-service.ts` exists | Add CLIP support |
| AC-3 | Incremental index updates | Basic implementation | Add delta indexing |
| AC-4 | Search results <100ms | No performance target | Add benchmarks |

**Tasks:**
- [ ] Extend `OramaIndexManager` for multi-project isolation
- [ ] Add Transformers.js CLIP model loader for image embeddings
- [ ] Implement delta indexing for incremental updates
- [ ] Add performance benchmarks (target: <100ms)

**Research Requirements:**
- [ ] Context7: Orama WASM indexing patterns
- [ ] DeepWiki: Transformers.js WebGPU acceleration
- [ ] Repomix: Analyze existing `embedding-service.ts`

**Dependencies:**
- None (foundation story)

---

### Story 32-2: Embedding Pipeline with CLIP Integration

**User Story:**
```
As a user uploading images to my knowledge base,
I want visual content to be embedded alongside text,
So that I can search across both images and documents simultaneously.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | CLIP embeddings generated locally | `transformers-loader.ts` exists | Add CLIP model |
| AC-2 | Image preprocessing pipeline | None | CREATE NEW |
| AC-3 | Embedding cache with LRU eviction | Basic implementation | Enhance cache |
| AC-4 | WebGPU acceleration where available | None | ADD detection |

**Tasks:**
- [ ] Add `@xenova/transformers` dependency for CLIP
- [ ] Create `image-embedding-service.ts`
- [ ] Implement WebGPU detection and fallback to WebGL
- [ ] Add embedding cache with size limits

**Research Requirements:**
- [ ] Context7: Transformers.js CLIP usage
- [ ] Tavily: WebGPU embedding acceleration patterns
- [ ] Exa: Best practices for local image embeddings

**Dependencies:**
- Story 32-1 (Orama Vector Store)

---

### Story 32-3: Hybrid Retrieval System

**User Story:**
```
As a user searching my knowledge base,
I want results that combine semantic similarity with keyword matching,
So that I find exactly what I'm looking for regardless of query phrasing.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Semantic search via vectors | `hybrid-retriever.ts` exists | Extend scoring |
| AC-2 | Keyword search integration | Basic BM25 | Enhance BM25 |
| AC-3 | RRF fusion algorithm | None | ADD RRF fusion |
| AC-4 | Search result deduplication | None | ADD deduplication |

**Tasks:**
- [ ] Enhance `HybridRetriever` with RRF fusion
- [ ] Add BM25 keyword search integration
- [ ] Implement result deduplication
- [ ] Add search result ranking controls

**Research Requirements:**
- [ ] Context7: Reciprocal Rank Fusion algorithm
- [ ] DeepWiki: Orama hybrid search patterns

**Dependencies:**
- Story 32-1 (Vector Store)

---

### Story 32-4: Index Management & Persistence

**User Story:**
```
As a user returning to my knowledge base,
I want my indexes to be persisted and quickly loaded,
So that I don't wait for re-indexing on every visit.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Index persistence to IndexedDB | Basic implementation | Enhance persistence |
| AC-2 | Incremental index updates | None | ADD delta updates |
| AC-3 | Orphaned index cleanup | None | ADD cleanup task |
| AC-4 | Index size monitoring | None | ADD monitoring |

**Tasks:**
- [ ] Implement `IndexedDBStorage` for Orama indexes
- [ ] Create index metadata schema
- [ ] Add orphaned index detection and cleanup
- [ ] Add index size monitoring with warnings

**Dependencies:**
- Story 32-1 (Vector Store)

---

### Story 32-5: Performance Optimization

**User Story:**
```
As a user with a large knowledge base,
I want search and indexing to remain fast,
So that my workflow is not interrupted by slow operations.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Target | Gap |
|-------|-----------|--------|-----|
| AC-1 | Embedding generation | <500ms per chunk | Benchmark needed |
| AC-2 | Vector search | <100ms | Benchmark needed |
| AC-3 | Index loading | <2s for 10k docs | Implement streaming |
| AC-4 | Memory usage | <500MB for indexes | ADD monitoring |

**Tasks:**
- [ ] Add performance benchmarks for all RAG operations
- [ ] Implement streaming index loading
- [ ] Add memory usage monitoring
- [ ] Optimize batch processing

**Dependencies:**
- Stories 32-1, 32-2, 32-3, 32-4

---

## Part 4: Sprint 2 - EPIC-33 Agent Integration (Weeks 3-4)

**Focus:** RAG-enhanced agent tools and synthesis capabilities

### Story 33-1: Knowledge-Aware Agent Context

**User Story:**
```
As an AI agent,
I want access to the user's knowledge base when responding,
So that I can provide answers grounded in their sources.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Agent receives relevant context | None | CREATE tool |
| AC-2 | Context injection in chat | Basic implementation | Enhance |
| AC-3 | Citation of sources in responses | None | ADD formatting |
| AC-4 | Context refresh on new sources | None | ADD triggers |

**Tasks:**
- [ ] Create `knowledge-context-tool` for agent
- [ ] Extend `SystemPromptComposer` with knowledge context
- [ ] Implement source citation formatting
- [ ] Add context refresh triggers

**Dependencies:**
- EPIC-32 completion

---

### Story 33-2: Synthesis Query Engine

**User Story:**
```
As a user asking complex questions,
I want the AI to synthesize information from multiple sources,
So that I get comprehensive answers rather than fragmented responses.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Multi-source retrieval | Basic retriever | Enhance |
| AC-2 | Synthesis prompt template | None | CREATE |
| AC-3 | Response with citations | None | ADD formatting |
| AC-4 | Synthesis history | None | ADD persistence |

**Tasks:**
- [ ] Create synthesis prompt templates
- [ ] Implement multi-source retrieval orchestration
- [ ] Add citation formatting to responses
- [ ] Persist synthesis history

**Dependencies:**
- Story 33-1

---

### Story 33-3: Tool Registration for Knowledge Operations

**User Story:**
```
As an AI agent,
I want tools to search and query the knowledge base,
So that I can help users find and organize their sources.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | `search_knowledge` tool | None | CREATE |
| AC-2 | `get_source` tool | None | CREATE |
| AC-3 | `list_sources` tool | None | CREATE |
| AC-4 | Tools registered in TanStack AI | Basic tools | Extend |

**Tasks:**
- [ ] Create `search-notes-tool.ts` (already exists, enhance)
- [ ] Create `get-source-tool.ts`
- [ ] Create `list-sources-tool.ts`
- [ ] Register tools in agent configuration

**Dependencies:**
- Stories 33-1, 33-2

---

### Story 33-4: Workspace Integration

**User Story:**
```
As a user working in the IDE,
I want seamless access to my knowledge base,
So that I can reference sources while coding.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Knowledge panel in IDE | None | CREATE UI |
| AC-2 | Quick search from chat | Basic implementation | Enhance |
| AC-3 | Source drag-to-canvas | None | CREATE |
| AC-4 | Knowledge sidebar | None | CREATE |

**Tasks:**
- [ ] Create KnowledgePanel component
- [ ] Add quick search to ChatPanel
- [ ] Implement drag-to-canvas functionality
- [ ] Create KnowledgeSidebar component

**Dependencies:**
- Stories 33-1, 33-2, 33-3

---

## Part 5: Sprint 3 - EPIC-34 Image Understanding (Weeks 5-6)

**Focus:** OCR, image embedding, and visual content processing

### Story 34-1: OCR Pipeline with Tesseract.js

**User Story:**
```
As a user uploading images with text,
I want the text content extracted and indexed,
So that I can search for text within images.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Tesseract.js integration | None | CREATE |
| AC-2 | Image preprocessing | None | CREATE |
| AC-3 | Text extraction from images | None | CREATE |
| AC-4 | Extracted text indexing | None | ADD to pipeline |

**Tasks:**
- [ ] Add `@aspect-ai/tesseract.js-wasm` dependency
- [ ] Create `ocr-service.ts`
- [ ] Implement image preprocessing (binarization, deskew)
- [ ] Add extracted text to RAG pipeline

**Research Requirements:**
- [ ] Context7: Tesseract.js WASM usage
- [ ] Tavily: Best practices for client-side OCR

**Dependencies:**
- EPIC-32 completion

---

### Story 34-2: Image Embedding Generation

**User Story:**
```
As a user browsing my image collection,
I want images to be semantically searchable,
So that I can find images by describing their content.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | CLIP model for image embeddings | Story 32-2 | Extend |
| AC-2 | Batch embedding processing | None | ADD |
| AC-3 | Embedding quality validation | None | CREATE |
| AC-4 | Image thumbnail generation | None | CREATE |

**Tasks:**
- [ ] Enhance image embedding service
- [ ] Implement batch processing
- [ ] Add quality validation metrics
- [ ] Create thumbnail generation

**Dependencies:**
- Story 32-2 (CLIP Integration)

---

### Story 34-3: Multimodal Search Interface

**User Story:**
```
As a user searching my knowledge base,
I want to search across images and text simultaneously,
So that I find all relevant content regardless of format.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Unified search interface | Basic | Enhance |
| AC-2 | Image result display | None | CREATE |
| AC-3 | Text excerpt in results | Basic | Enhance |
| AC-4 | Search result filtering | None | ADD |

**Tasks:**
- [ ] Enhance search interface for multimodal results
- [ ] Create ImageResultCard component
- [ ] Add excerpt highlighting
- [ ] Implement result filtering

**Dependencies:**
- Stories 34-1, 34-2

---

## Part 6: Sprint 4 - EPIC-35 Document Processing (Weeks 7-8)

**Focus:** PDF, DOCX, and multimodal document ingestion

### Story 35-1: Enhanced PDF Processing

**User Story:**
```
As a user uploading PDF documents,
I want structural analysis and visual content extraction,
So that my PDFs are fully indexed with headings, tables, and figures.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | PDF.js integration | `pdf-parser.ts` exists | Extend |
| AC-2 | Structural analysis | None | CREATE |
| AC-3 | Table extraction | None | CREATE |
| AC-4 | Figure caption detection | None | CREATE |

**Tasks:**
- [ ] Enhance PDF parser with structural analysis
- [ ] Add table detection using PDF structure
- [ ] Implement figure caption extraction
- [ ] Create PDF metadata schema

**Dependencies:**
- EPIC-32 completion

---

### Story 35-2: Document Chunking Strategy

**User Story:**
```
As a user with large documents,
I want intelligent chunking that preserves context,
So that search results are meaningful and complete.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Semantic chunking | `document-chunker.ts` exists | Enhance |
| AC-2 | Structure-aware splitting | None | CREATE |
| AC-3 | Overlap management | None | ADD |
| AC-4 | Chunk metadata preservation | None | ADD |

**Tasks:**
- [ ] Enhance chunking with semantic boundaries
- [ ] Implement structure-aware splitting
- [ ] Add configurable overlap
- [ ] Preserve chunk metadata

**Dependencies:**
- Story 35-1

---

### Story 35-3: Audio Processing with Whisper WASM

**User Story:**
```
As a user uploading audio recordings,
I want automatic transcription and indexing,
So that I can search for content within audio files.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Whisper WASM integration | None | CREATE |
| AC-2 | Audio preprocessing | None | CREATE |
| AC-3 | Transcription indexing | None | ADD |
| AC-4 | Timestamp preservation | None | ADD |

**Tasks:**
- [ ] Add `whisper WASM` dependency
- [ ] Create `audio-transcription-service.ts`
- [ ] Implement audio preprocessing
- [ ] Add transcription to RAG pipeline

**Research Requirements:**
- [ ] Context7: Whisper WASM usage
- [ ] Exa: Audio transcription best practices

**Dependencies:**
- EPIC-32 completion

---

### Story 35-4: Unified Ingestion Pipeline

**User Story:**
```
As a user importing various document types,
I want a single pipeline that handles all formats,
So that I don't need to manage different import tools.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Format detection | Basic | Enhance |
| AC-2 | Unified processing interface | None | CREATE |
| AC-3 | Progress tracking | None | ADD |
| AC-4 | Error handling per format | None | Add validation |

**Tasks:**
- [ ] Create unified `DocumentIngestionPipeline`
- [ ] Implement format auto-detection
- [ ] Add progress tracking UI
- [ ] Enhance error handling

**Dependencies:**
- Stories 35-1, 35-2, 35-3

---

## Part 7: Sprint 5 - EPIC-36 Adaptive Learning Engine (Weeks 9-10)

**Focus:** Spaced repetition, learning analytics, and adaptive content

### Story 36-1: Spaced Repetition Algorithm

**User Story:**
```
As a study user reviewing my knowledge,
I want review intervals based on forgetting curve,
So that I retain information efficiently.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | SM-2 algorithm implementation | Basic (Epic 9) | Enhance |
| AC-2 | Forgetting curve modeling | None | CREATE |
| AC-3 | Optimal interval calculation | None | CREATE |
| AC-4 | Learning analytics | None | CREATE |

**Tasks:**
- [ ] Enhance spaced repetition algorithm
- [ ] Implement forgetting curve model
- [ ] Create interval calculator
- [ ] Add learning analytics dashboard

**Dependencies:**
- Epic 9 completion

---

### Story 36-2: Adaptive Content Recommendations

**User Story:**
```
As a user with accumulated knowledge,
I want the system to recommend what to study next,
So that I focus on gaps in my understanding.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Knowledge gap analysis | None | CREATE |
| AC-2 | Recommendation engine | None | CREATE |
| AC-3 | Priority scoring | None | CREATE |
| AC-4 | Recommendation UI | None | CREATE |

**Tasks:**
- [ ] Create knowledge gap analysis module
- [ ] Implement recommendation engine
- [ ] Add priority scoring system
- [ ] Create RecommendationPanel component

**Dependencies:**
- Stories 36-1, EPIC-32 completion

---

### Story 36-3: Learning Progress Tracking

**User Story:**
```
As a learning user,
I want to see my progress over time,
So that I can measure my improvement.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Progress metrics collection | Basic | Enhance |
| AC-2 | Time-series analytics | None | CREATE |
| AC-3 | Progress visualization | None | CREATE |
| AC-4 | Goal setting and tracking | None | CREATE |

**Tasks:**
- [ ] Enhance metrics collection
- [ ] Create time-series analytics
- [ ] Implement progress charts
- [ ] Add goal tracking features

**Dependencies:**
- Stories 36-1, 36-2

---

### Story 36-4: Personalized Study Paths

**User Story:**
```
As a user with learning goals,
I want personalized study paths,
So that I efficiently achieve my objectives.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Goal configuration | None | CREATE |
| AC-2 | Path generation algorithm | None | CREATE |
| AC-3 | Path visualization | None | CREATE |
| AC-4 | Progress adaptation | None | CREATE |

**Tasks:**
- [ ] Create goal configuration UI
- [ ] Implement path generation algorithm
- [ ] Add path visualization
- [ ] Implement progress adaptation

**Dependencies:**
- Stories 36-1, 36-2, 36-3

---

## Part 8: Sprint 6 - EPIC-37 Study Artifact Generation (Weeks 11-12)

**Focus:** Flashcards, quizzes, and study materials

### Story 37-1: Enhanced Flashcard Generation

**User Story:**
```
As a study user,
I want AI-generated flashcards from my knowledge sources,
So that I can study efficiently with relevant materials.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Flashcard generation from sources | `flashcard-generator.ts` exists | Enhance |
| AC-2 | Source citation on cards | None | ADD |
| AC-3 | Card type variety (cloze, front/back) | Basic | Enhance |
| AC-4 | Bulk generation | None | ADD |

**Tasks:**
- [ ] Enhance flashcard generation with context
- [ ] Add source citation display
- [ ] Implement cloze deletion cards
- [ ] Add bulk generation with progress

**Dependencies:**
- EPIC-33 completion

---

### Story 37-2: Quiz Generation System

**User Story:**
```
As a study user,
I want generated quizzes to test my knowledge,
So that I can verify my understanding.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Quiz question generation | Basic (Epic 9) | Enhance |
| AC-2 | Multiple question types | Basic | Enhance |
| AC-3 | Difficulty adjustment | None | ADD |
| AC-4 | Quiz analytics | None | CREATE |

**Tasks:**
- [ ] Enhance quiz generation
- [ ] Add multiple question types (MCQ, TF, short answer)
- [ ] Implement difficulty adjustment
- [ ] Add quiz analytics

**Dependencies:**
- EPIC-33 completion

---

### Story 37-3: Export Functionality

**User Story:**
```
As a study user,
I want to export my study materials,
So that I can study offline or share with others.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Anki export (.apkg) | None | CREATE |
| AC-2 | PDF export | None | CREATE |
| AC-3 | JSON export | None | ADD |
| AC-4 | .alpha pack format | None | CREATE |

**Tasks:**
- [ ] Implement Anki export
- [ ] Create PDF export
- [ ] Add JSON export
- [ ] Implement .alpha pack format

**Dependencies:**
- Stories 37-1, 37-2

---

### Story 37-4: Study Session Analytics

**User Story:**
```
As a study user,
I want detailed analytics on my study sessions,
So that I can optimize my learning strategy.
```

**Acceptance Criteria:**
| AC-ID | Criterion | Existing Implementation | Gap |
|-------|-----------|------------------------|-----|
| AC-1 | Session duration tracking | Basic | Enhance |
| AC-2 | Performance metrics | Basic | Enhance |
| AC-3 | Learning curve visualization | None | CREATE |
| AC-4 | Exportable reports | None | CREATE |

**Tasks:**
- [ ] Enhance session tracking
- [ ] Add performance metrics
- [ ] Create learning curve charts
- [ ] Implement report generation

**Dependencies:**
- Stories 37-1, 37-2, 37-3

---

## Part 9: Parallel Execution Strategy

### Team A (UI/Foundation) - Weeks 1-12

| Sprint | Focus | Stories | Dependencies |
|--------|-------|---------|--------------|
| 1 | RAG UI Components | 32-4, 32-5 | 32-1, 32-2 |
| 2 | Agent Integration UI | 33-4 (KnowledgePanel, Sidebar) | 33-1, 33-2 |
| 3 | Image Search UI | 34-3 (Multimodal Interface) | 34-1, 34-2 |
| 4 | Document Processing UI | 35-4 (Ingestion Pipeline UI) | 35-1, 35-2 |
| 5 | Learning UI | 36-2, 36-4 (Recommendations, Paths) | 36-1 |
| 6 | Study UI | 37-3, 37-4 (Export, Analytics) | 37-1, 37-2 |

### Team B (Backend/Agent) - Weeks 1-12

| Sprint | Focus | Stories | Dependencies |
|--------|-------|---------|--------------|
| 1 | RAG Core | 32-1, 32-2, 32-3 | None |
| 2 | Agent Tools | 33-1, 33-2, 33-3 | 32-5 |
| 3 | Image Processing | 34-1, 34-2 | 32-2 |
| 4 | Document Pipeline | 35-1, 35-2, 35-3 | 32-1 |
| 5 | Learning Engine | 36-1, 36-2, 36-3 | 32-1 |
| 6 | Study Generation | 37-1, 37-2 | 33-2 |

### Integration Points

| Sprint | Integration | Description |
|--------|-------------|-------------|
| 2 | Day 6 | Knowledge UI ↔ Agent Tools (Story 33-4 with 33-3) |
| 3 | Day 12 | Image Search ↔ Processing (Story 34-3 with 34-1, 34-2) |
| 4 | Day 18 | Document Pipeline ↔ RAG (Story 35-4 with 32-1) |
| 5 | Day 24 | Learning ↔ Knowledge (Story 36-2 with 33-1) |
| 6 | Day 30 | Study UI ↔ Generation (Story 37-3 with 37-1) |

---

## Part 10: Story Development Cycle Coordination

### Workflow Integration

Per [`.agent/workflows/story-dev-cycle.md`](.agent/workflows/story-dev-cycle.md), each story follows:

```
create-story → validate → create-context → validate → dev-story → code-review → done
```

### Required Research Per Story

| Story | Context7 | DeepWiki | Tavily/Exa | Repomix |
|-------|----------|----------|------------|---------|
| 32-1 | Orama WASM | - | Orama patterns | embedding-service.ts |
| 32-2 | Transformers.js | CLIP models | WebGPU embeddings | transformers-loader.ts |
| 32-3 | RRF Fusion | Orama hybrid | - | hybrid-retriever.ts |
| 33-1 | TanStack AI tools | - | Context injection | SystemPromptComposer |
| 34-1 | Tesseract.js WASM | - | OCR patterns | - |
| 35-3 | Whisper WASM | - | Audio transcription | - |
| 36-1 | Spaced repetition | - | Learning algorithms | - |

### Handoff Documents Required

| Phase | Artifact | Location |
|-------|----------|----------|
| create-story | Story file | `_bmad-output/sprint-artifacts/{story}.md` |
| create-context | Context XML | `_bmad-output/sprint-artifacts/{story}-context.xml` |
| dev-story | Dev Record | In story file |
| code-review | Review Report | In story file |

---

## Part 11: Sweeping Validation Compliance

### Pre-Implementation Audit Checklist

Before starting any story, verify:

- [ ] No duplicate utilities in `src/lib/rag/`, `src/lib/knowledge/`, `src/lib/notes/`
- [ ] No direct IndexedDB access in components (use stores only)
- [ ] All components use Zustand + Dexie pattern
- [ ] No unused imports (run `pnpm eslint`)
- [ ] No hardcoded strings (use i18n)
- [ ] File size <300 lines (split if needed)

### File Refactoring Priority

| File | Current | Target | Action |
|------|---------|--------|--------|
| `note-store.ts` | 525 lines | 300 lines | Split before EPIC-33 |
| `note-indexer.ts` | 381 lines | 300 lines | Split before EPIC-32 |
| `sync-manager.ts` | 667 lines | 300 lines | Defer to Epic 24 |

### TypeScript Error Reduction Plan

| Phase | Target | Stories |
|-------|--------|---------|
| Phase 1 | 800 errors | EPIC-32 |
| Phase 2 | 500 errors | EPIC-33 |
| Phase 3 | 200 errors | EPIC-34, 35 |
| Phase 4 | 0 errors | EPIC-36, 37 |

---

## Part 12: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebGPU not available | Medium | High | Fallback to WebGL/CPU |
| Large file handling | High | Medium | Chunked processing |
| Memory constraints | High | Medium | LRU caching, streaming |
| OCR accuracy | Medium | Low | User correction UI |
| Model loading time | High | Low | Progressive loading |

---

## Next Actions

1. **Immediate:** Handoff to @bmad-bmm-pm for backlog grooming
2. **Sprint 1 Start:** Begin EPIC-32 Story 32-1 (Orama Enhancement)
3. **Refactoring:** Split `note-store.ts` and `note-indexer.ts` before EPIC-33
4. **Validation:** Run sweeping audit before each story dev phase

---

## References

- **Technical Spec:** [`_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md`](_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md)
- **Research Artifacts:** [`_bmad-output/research-artifacts/`](_bmad-output/research-artifacts/)
- **Story Workflow:** [`.agent/workflows/story-dev-cycle.md`](.agent/workflows/story-dev-cycle.md)
- **Validation:** [`_bmad-output/validation/sweeping-validation.md`](_bmad-output/validation/sweeping-validation.md)
- **Existing Components:** `src/lib/rag/`, `src/lib/knowledge/`, `src/lib/notes/`

---

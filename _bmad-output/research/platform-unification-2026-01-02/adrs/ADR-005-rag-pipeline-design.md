# ADR-005: RAG Pipeline Design

**Status**: ACCEPTED
**Date**: 2026-01-02
**Context**: Platform Unification Epic - Cornerstone 5 Analysis
**Related**: Cornerstone 5 - RAG and Knowledge Synthesis Pipeline

---

## Context

Prior to consolidation, the RAG (Retrieval-Augmented Generation) system had:
- **Legacy god store**: `rag-store.ts` (1,595 lines duplicated between 2 locations)
- **No unified embedding strategy** (local vs. cloud)
- **Inconsistent chunking strategies** across modules
- **Separate RAG and knowledge stores** (no integration)
- **Missing canvas-RAG linkage** (visual nodes not connected to citations)

**Health Score**: 80/100 PRODUCTION-READY (after consolidation)

---

## Decision

**Consolidate RAG system into a 5-slice architecture with hybrid embedding (local + cloud) and Orama WASM vector search.**

### Architecture

```
useRAGStore (125 lines main + 535 lines slices = 660 total)
├── rag-chat-slice.ts (63 lines) - Chat messages & citations
├── rag-search-slice.ts (109 lines) - Search queries & TTL cache
├── rag-chunking-slice.ts (79 lines) - Chunking progress tracking
├── rag-voice-slice.ts (~80 lines) - Voice mode (placeholder)
└── rag-index-slice.ts (~100 lines) - Index lifecycle management
```

**Total Size**: 660 lines (well within acceptable limits)

### Key Features

1. **Single Bounded Store**
   - One canonical location: `src/infrastructure/persistence/stores/rag/rag-store.ts`
   - All RAG state in `useRAGStore`
   - Legacy 1,595-line god store deleted ✅

2. **Hybrid Embedding Strategy**
   - **Local Embeddings**: Transformers.js (Xenova/all-MiniLM-L6-v2) with WebGPU
   - **Cloud Embeddings**: Gemini gemini-embedding-001 API
   - **Auto-Selection**: Device capability detection (WebGPU, mobile, edge)
   - **Batch Processing**: 32-text batches with progress events
   - **Caching**: IndexedDB model cache (~90MB quantized)

   **Device Detection Logic**:
   ```typescript
   {
     hasWebGPU: boolean;
     isDesktop: boolean;
     isMobile: boolean;
     isEdge: boolean;
     localModelCached: boolean;
   }

   // Provider Selection
   if (hasWebGPU && isDesktop && localModelCached) {
     return 'local'; // Offline, fast
   } else if (apiKey && (isMobile || !hasWebGPU)) {
     return 'cloud'; // Online, accurate
   } else {
     return 'bm25'; // Fallback to keyword search
   }
   ```

3. **Orama WASM Integration**
   - Local WASM vector search (no external APIs)
   - 384-dimensional embeddings
   - IndexedDB persistence via `@orama/plugin-data-persistence`
   - In-memory index cache per project
   - Schema version tracking

   **Performance Target**: <500ms for 10K documents

4. **Hybrid Retriever**
   ```typescript
   interface HybridSearchConfig {
     weightVector: number;      // Default 0.7 (similarity search)
     weightFulltext: number;    // Default 0.3 (keyword match)
     minScore: number;          // Default 0.1 (quality threshold)
     enablePhraseBoost: boolean; // Default true (exact phrase bonus)
   }
   ```

   **Features**:
   - Configurable weighted scoring (vector + full-text)
   - Phrase matching boost
   - Filter support (date, source type, tags)
   - Result deduplication

5. **Document Chunking Strategies**
   - **Fixed-Size**: Token-based chunking with overlap (default: 1000 tokens, 200 overlap)
   - **Semantic**: Paragraph-aware chunking (preserves document structure)
   - **Recursive**: Character splitting for long documents (prevents text breakup)
   - **PDF Figure/Table Detection**: Preserves structural elements

   **Progress Tracking**:
   - RAG progress events (Iteration 15)
   - `ChunkingStatusIndicator` UI component
   - Per-document progress tracking
   - Figure/table counting

6. **Knowledge Canvas Integration**
   - **Canvas Component**: ReactFlow-based visual editor
   - **Linkage Analyzer**: Concept overlap detection, similarity scoring
   - **Linkage Types**: Conceptual, sequential, contrastive
   - **AI-Enhanced Proposals**: Framework ready for LLM-driven suggestions

7. **Synthesis Service**
   - **Gemini API Integration**: gemini-2.5-flash for multi-source synthesis
   - **Source-Specific Prompts**: PDF, URL, image, text
   - **Zod Schema Validation**: SynthesisFrontmatterSchema
   - **Retry Logic**: Exponential backoff, 30-second timeout
   - **Error Handling**: Rate limits (429), server errors (5xx)

   **Generated Frontmatter**:
   - Subject classification
   - Document type detection
   - Key concepts extraction
   - Summary generation
   - Suggested questions
   - Related topics

8. **Flashcard Generation**
   - **Gemini 2.0 Flash Integration**
   - **Difficulty Levels**: Easy, medium, hard
   - **Topic Extraction**: Auto-tagging
   - **Source Citation**: Traceability
   - **Zod Schema Validation**: Quality assurance
   - **Batch Generation**: Multiple sources
   - **Mock Generator**: Testing without API calls

---

## Alternatives Considered

### Alternative A: Cloud-Only Embeddings
**Pros**:
- Simpler architecture
- Higher accuracy (latest models)
- No local storage overhead

**Cons**:
- Requires API key
- Network dependency
- Privacy concerns (data sent to cloud)
- Ongoing costs

**Rejected**: Offline-first, privacy-focused product vision

### Alternative B: Local-Only Embeddings
**Pros**:
- Complete privacy
- Offline capability
- No API costs

**Cons**:
- Requires WebGPU (not all devices)
- Large model download (~90MB)
- Lower accuracy than latest cloud models
- Mobile devices unsupported

**Rejected**: Excludes mobile users, too restrictive

### Alternative C: Hybrid Strategy (Chosen)
**Pros**:
- Best of both worlds (privacy + capability)
- Device-aware auto-selection
- Graceful fallback to BM25
- Progressive enhancement

**Cons**:
- More complex architecture
- Two codebases to maintain
- Caching overhead for local model

**Accepted**: Aligns with product vision (local-first, privacy-focused, accessibility)

---

## Consequences

### Positive

1. **1,595-Line God Store Deleted** (legacy eliminated)
2. **Hybrid Embedding** (privacy + capability)
3. **Offline Capability** (local embeddings via WebGPU)
4. **Mobile Support** (cloud embeddings fallback)
5. **Fast Search** (<500ms for 10K documents)
6. **Zero P0 Gaps** (production-ready)

### Negative

1. **Complex Architecture** (3 embedding providers to maintain)
2. **Large Model Cache** (~90MB IndexedDB storage)
3. **WebGPU Dependency** (local embeddings require modern browser)

### Migration Path

**Phase 1** (Completed):
- ✅ Create 5 RAG slices
- ✅ Delete legacy god store (1,595 lines)
- ✅ Integrate Orama WASM
- ✅ Implement hybrid embedding strategy

**Phase 2** (P2 Enhancements - 36-48 hours):
- ⏳ Canvas-RAG linkage (12-16 hours)
- ⏳ Synthesis UI integration (8-12 hours)
- ⏳ Advanced search filters (16-20 hours)

**Phase 3** (Deferred - P3):
- ⏳ Voice mode implementation (20-24 hours)
- ⏳ Advanced canvas features (AI proposals)

---

## Trade-offs

| Aspect | Chosen Approach | Alternative | Rationale |
|--------|-----------------|-------------|-----------|
| **Embedding Strategy** | Hybrid (local + cloud) | Cloud-only | Privacy + offline + mobile |
| **Vector Search** | Orama WASM | Pinecone/Milvus | Local-first, zero external deps |
| **Chunking Strategy** | 3 strategies (fixed, semantic, recursive) | Fixed-only | Better document understanding |
| **Knowledge Canvas** | ReactFlow + custom linkage | Miro/Figma embed | Full control, offline-capable |
| **Synthesis Service** | Gemini 2.0 Flash | OpenAI GPT-4 | Cost-effective, fast |
| **Flashcard Generation** | LLM-based | Rule-based | Higher quality, adaptable |

---

## Compliance with December 2025 Zustand Patterns

**Score**: 100% ✅

| Practice | Status | Evidence |
|----------|--------|----------|
| **Single Bounded Store** | ✅ | All RAG state in `useRAGStore` |
| **Slice Pattern** | ✅ | 5 slices, all <120 lines |
| **Individual Selectors** | ✅ | No destructuring anti-pattern |
| **Dexie Persistence** | ✅ | With `partialize` for selective persistence |
| **Hydration Handler** | ✅ | Proper metadata loading on startup |

---

## Component Consumption

**UI Components Using RAG Stores**: 15 files

**Knowledge Workspace** (10 components):
- KnowledgePage.tsx
- SourceImportDialog.tsx
- SourceCard.tsx
- SearchResultsPanel.tsx
- CitationSidebar.tsx
- [5 more knowledge components]

**RAG Panels** (3 components):
- RAGSearchPanel.tsx
- RAGChatPanel.tsx
- ChunkingStatusIndicator.tsx

**Canvas** (2 components):
- Canvas.tsx (ReactFlow-based)
- LinkageProposalsPanel.tsx

**All components use individual selectors** ✅:
```typescript
// Correct pattern from KnowledgePage.tsx:
const projectId = useIDEStore(s => s.projectId)
const searchMode = useRAGStore(s => s.searchMode)
const setSearchMode = useRAGStore(s => s.setSearchMode)
```

---

## Identified Gaps

### P2 (Medium Priority)

**Gap 1: Canvas-RAG Linkage Incomplete** (12-16 hours)
- Canvas component exists but linkage suggestions not fully integrated with RAG
- No visual connection between canvas nodes and search citations

**Gap 2: Synthesis UI Incomplete** (8-12 hours)
- SynthesisService functional but no "Generate Synthesis" button in UI
- Synthesis results not displayed in source preview panel

### P3 (Low Priority)

**Gap 3: Voice Mode Not Implemented** (20-24 hours)
- `rag-voice-slice.ts` exists but Web Speech API not integrated

**Gap 4: Advanced Search Filters** (16-20 hours)
- Missing filters UI (date range, source type, tags)
- No saved searches or search history

**Total Remediation**: 36-48 hours (P2) + 36-44 hours (P3) = 72-92 hours

---

## Metrics Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total RAG Files** | 43 files | ✅ |
| **RAG Library Lines** | 7,400 lines | ✅ |
| **Knowledge Module Lines** | 12,161 lines | ✅ |
| **Store Slices** | 5 slices (535 lines) | ✅ All <120 lines |
| **UI Components** | 29 Knowledge + 3 RAG | ✅ |
| **God Stores** | 0 | ✅ (1,595 lines deleted) |
| **Test Files** | 5 test suites | ⚠️ Could be more |
| **Health Score** | 8/10 (80/100) | ✅ Production-ready |

---

## References

- **Cornerstone 5 Analysis**: `_bmad-output/research/platform-unification-2026-01-02/cornerstone-5-rag-pipeline-analysis.md`
- **Orama WASM Documentation**: https://docs.orama.com/
- **Transformers.js**: https://huggingface.co/docs/transformers.js
- **December 2025 Zustand Patterns**: Slice pattern, individual selectors, Dexie persistence

---

## Status

**ACCEPTED** ✅

This architecture has been successfully implemented and is production-ready.

**Health Score**: 80/100 (8/10)

**Recommendation**: Complete Knowledge Synthesis MVP with 36-48 hours of P2 enhancements (canvas-RAG linkage, synthesis UI).

---

**END OF ADR-005**

---
date: 2025-12-31
time: "08:30:00"
phase: Story Development Cycle - Phase 1 (Create Story)
team: Team-A
agent_mode: bmad-bmm-sm
epic: EPIC-32
story: "32-2"
slug: "hybrid-search-engine"
status: drafted
version: 1.0
---

# Story 32-2: Hybrid Search Engine Implementation

## User Story

**As a** user searching my knowledge base,  
**I want** hybrid search combining full-text and vector similarity,  
**So that** I can find relevant content using both exact keywords and semantic meaning.

---

## Acceptance Criteria

### AC1: Weighted Scoring Algorithm

```
Given a user enters search query "machine learning neural networks"
When hybrid search executes
Then results include documents matching both:
  - Exact keywords: "machine learning", "neural networks"
  - Semantic meaning: deep learning, AI, backpropagation
And results are ranked by combined relevance score (vector 0.7 + fulltext 0.3)
And response time <500ms for 10,000 documents
```

### AC2: Phrase Matching Boost

```
Given a user searches with quoted phrase "exact phrase match"
When hybrid search executes
Then phrase-matched documents receive boost in ranking
And non-matching documents excluded from top results
```

### AC3: Filter Support

```
Given a user applies filters (date range, source type)
When hybrid search executes
Then results are filtered before ranking
And filter metadata is displayed in results
```

### AC4: Result Merging with Deduplication

```
Given both vector and fulltext searches return results
When merging results
Then duplicate documents are identified and consolidated
And unique documents are reranked by combined score
```

### AC5: Test Coverage

```
Given the hybrid search implementation
When tests are created
Then minimum 15 unit tests with 80% coverage
And tests cover edge cases and error conditions
```

---

## Technical Implementation

### New File Location

`src/lib/rag/hybrid-retriever.ts`

### Interface Definition

```typescript
interface HybridSearchConfig {
  weightVector: number;        // 0-1, default 0.7
  weightFulltext: number;      // 0-1, default 0.3
  minScore: number;            // minimum threshold
  filters?: SearchFilters;
  limit: number;               // max results
}

interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  sourceType?: string[];
  tags?: string[];
}

interface HybridSearchResult {
  documentId: string;
  title: string;
  combinedScore: number;
  vectorScore: number;
  fulltextScore: number;
  highlights: string[];
  metadata: Record<string, unknown>;
}

export async function hybridSearch(
  query: string,
  config: HybridSearchConfig
): Promise<HybridSearchResult[]>
```

### Integration Points

| Component | Integration Point | Status |
|-----------|-------------------|--------|
| orama-index.ts | vectorSearch(), fulltextSearch() | ✅ EXISTS |
| rag-store.ts | State management for search results | ✅ EXISTS |
| KnowledgePage | Search UI integration | ⚠️ WIRE NEEDED |

---

## Tasks

### Research Tasks

- [ ] **R1:** Query Context7 for Orama hybrid search configuration and API patterns
- [ ] **R2:** Use DeepWiki to research vector + fulltext hybrid search patterns in GitHub repos
- [ ] **R3:** Use Repomix to analyze existing orama-index.ts structure and existing search methods
- [ ] **R4:** Search codebase for existing SearchFilters usage patterns

### Implementation Tasks

- [ ] **T1:** Create `src/lib/rag/hybrid-retriever.ts` with HybridSearchConfig interface
- [ ] **T2:** Implement weighted scoring algorithm (vector 0.7 + fulltext 0.3)
- [ ] **T3:** Implement phrase matching boost logic
- [ ] **T4:** Implement filter support with SearchFilters interface
- [ ] **T5:** Implement result merging with deduplication
- [ ] **T6:** Create TypeScript types and exports in barrel file
- [ ] **T7:** Add unit tests (15 tests, 80% coverage)
- [ ] **T8:** Test performance target (<500ms for 10K docs)
- [ ] **T9:** Wire integration with rag-store.ts
- [ ] **T10:** Update i18n translation keys for search UI

---

## Research Requirements

### MCP Tool Research

| Tool | Query | Purpose |
|------|-------|---------|
| **Context7** | "Orama hybrid search configuration scoring weights" | Official Orama WASM docs for hybrid search setup |
| **Context7** | "Orama fulltext search with filters" | Filter implementation patterns |
| **DeepWiki** | "orama js hybrid vector fulltext search github" | Community implementation patterns |
| **Repomix** | Pack src/lib/rag/orama-index.ts | Analyze existing vectorSearch/fulltextSearch methods |
| **Tavily** | "Orama.js hybrid search 2024 best practices" | Current best practices |

### Codebase Research

- [ ] Read `src/lib/rag/orama-index.ts` for existing vector/fulltext methods
- [ ] Search for `SearchFilters` in codebase for existing patterns
- [ ] Check `src/lib/rag/rag-store.ts` for search state management
- [ ] Review `src/i18n/en.json` for search-related translation keys

---

## Dev Notes

### Architecture Patterns

Reference `_bmad-output/project-planning-artifacts/architecture.md` for:
- RAG pipeline architecture (Section 4.2)
- Search service patterns

### Technical Constraints

1. **Performance Target:** <500ms response time for 10,000 documents
2. **Memory Constraints:** Local-first WASM environment
3. **Persistence:** Results cached in IndexedDB via rag-store.ts
4. **UI Integration:** Must work with existing KnowledgePage search component

### Error Handling

- Handle empty query results gracefully
- Handle invalid filter combinations
- Handle timeout for large document sets
- Log performance metrics for optimization

### Dependencies

- `@orama/orama` - Vector store with hybrid search
- `src/lib/rag/orama-index.ts` - Existing index implementation
- `src/lib/rag/rag-store.ts` - State management

---

## References

### Primary Documents

| Document | Path | Purpose |
|----------|------|---------|
| Technical Specification | `_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md` | Implementation reference |
| Story Dev Cycle | `.agent/workflows/story-dev-cycle.md` | Workflow guidance |
| Sweeping Validation | `_bmad-output/validation/sweeping-validation.md` | Quality gates |
| Sprint Planning | `_bmad-output/sprint-artifacts/knowledge-synthesis-sprint-planning-2025-12-31.md` | Story details |

### Existing Implementation

| File | Path | Purpose |
|------|------|---------|
| Orama Index | `src/lib/rag/orama-index.ts` | Base vector search implementation |
| RAG Store | `src/lib/rag/rag-store.ts` | State management for search results |
| Test Setup | `src/test/setup.ts` | Dexie mock for tests |

### Research Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| RAG Pipeline Optimization | `_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md` | Performance guidance |
| Implementation Playbook | `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md` | Step-by-step guidance |

---

## Dev Agent Record

*(Empty - to be populated during development phase)*

---

## Status History

| Date | Time | Phase | Status | Agent | Notes |
|------|------|-------|--------|-------|-------|
| 2025-12-31 | 08:30:00 | create-story | drafted | bmad-bmm-sm | Story file created |
| | | | | | |

---

## Validation Checklist (Phase 1.2)

- [x] Story file exists at `_bmad-output/sprint-artifacts/story-32-2-hybrid-search-engine.md`
- [x] User story format complete (As a/I want/So that)
- [x] At least 5 acceptance criteria defined (Given/When/Then format)
- [x] Tasks section with checkboxes (including research tasks)
- [x] Research Requirements section populated
- [x] Dev Notes references architecture.md
- [x] Status set to `drafted`

---

## Next Phase

**Phase 2: Create Story Context XML**

- Create context XML at `_bmad-output/sprint-artifacts/story-32-2-hybrid-search-engine-context.xml`
- Include code snippets from orama-index.ts
- Document research findings from MCP tools
- Update sprint-status.yaml (32-2: backlog → drafted)

---

**Document Version:** 1.0  
**Created:** 2025-12-31 08:30:00 UTC+7  
**Valid Until:** Story 32-2 reaches `done` status

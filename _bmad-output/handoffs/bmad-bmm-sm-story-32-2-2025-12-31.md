---
date: 2025-12-31
time: "08:25:00"
phase: Story Development Cycle - Phase 1 (Create Story)
team: Team-A
agent_mode: bmad-bmm-sm
---

# Handoff: Story 32-2 (Hybrid Search Engine)

**From:** `@bmad-core-bmad-master`  
**To:** `@bmad-bmm-sm`

---

## Task: Create Story File for Story 32-2 (Hybrid Search Engine)

### Context Summary

**Epic:** EPIC-32 (RAG Infrastructure) - Knowledge Synthesis Station  
**Story:** 32-2 - Hybrid Search Engine Implementation  
**Dependencies:** Story 32-1 (COMPLETE) - Orama WASM Vector Store Enhancement  
**Priority:** P1 (High) - Core RAG feature  

**Current State:**
- Story 32-1 completed with APPROVED WITH RECOMMENDATIONS code review
- Orama WASM vector store fully implemented with 384-dimensional embeddings
- Hybrid search is the natural next enhancement to combine vector + fulltext search

### Technical Foundation

The existing [`src/lib/rag/orama-index.ts`](src/lib/rag/orama-index.ts:1) (551 lines) provides:
- Vector search with 384-dimensional CLIP embeddings
- IndexedDB persistence for indexes
- CRUD operations (create, load, save, delete)

The new hybrid search will extend this foundation to combine:
- **Vector similarity** (semantic matching, weight: 0.7)
- **Fulltext search** (keyword matching, weight: 0.3)

---

## Task Specification

### User Story

**As a** user searching my knowledge base,  
**I want** hybrid search combining full-text and vector similarity,  
**So that** I can find relevant content using both exact keywords and semantic meaning.

### Acceptance Criteria

**AC1: Weighted Scoring Algorithm**
```
Given a user enters search query "machine learning neural networks"
When hybrid search executes
Then results include documents matching both:
  - Exact keywords: "machine learning", "neural networks"
  - Semantic meaning: deep learning, AI, backpropagation
And results are ranked by combined relevance score (vector 0.7 + fulltext 0.3)
And response time <500ms for 10,000 documents
```

**AC2: Phrase Matching Boost**
```
Given a user searches with quoted phrase "exact phrase match"
When hybrid search executes
Then phrase-matched documents receive boost in ranking
And non-matching documents excluded from top results
```

**AC3: Filter Support**
```
Given a user applies filters (date range, source type)
When hybrid search executes
Then results are filtered before ranking
And filter metadata is displayed in results
```

**AC4: Result Merging with Deduplication**
```
Given both vector and fulltext searches return results
When merging results
Then duplicate documents are identified and consolidated
And unique documents are reranked by combined score
```

**AC5: Test Coverage**
```
Given the hybrid search implementation
When tests are created
Then minimum 15 unit tests with 80% coverage
And tests cover edge cases and error conditions
```

### Technical Implementation

**New File Location:** `src/lib/rag/hybrid-retriever.ts`

**Key Components:**
```typescript
interface HybridSearchConfig {
  weightVector: number;        // 0-1, default 0.7
  weightFulltext: number;      // 0-1, default 0.3
  minScore: number;            // minimum threshold
  filters?: SearchFilters;
  limit: number;               // max results
}

export async function hybridSearch(
  query: string,
  config: HybridSearchConfig
): Promise<HybridSearchResult[]>
```

**Integration Points:**
| Component | Integration Point | Status |
|-----------|-------------------|--------|
| orama-index.ts | vectorSearch(), fulltextSearch() | ✅ EXISTS |
| rag-store.ts | State management for search results | ✅ EXISTS |
| KnowledgePage | Search UI integration | ⚠️ WIRE NEEDED |

---

## Current Workflow Status

From [`_bmad-output/sprint-artifacts/sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status.yaml:365):

```yaml
epic-32: in_progress
32-1-orama-wasm-vector-store-enhancement: done
32-2-hybrid-search-engine: backlog  # ← UPDATE TO drafted
32-3-semantic-citation-system: backlog
32-4-rag-query-optimization: backlog
32-5-knowledge-graph-integration: backlog
```

**Required Status Update:**
- `32-2-hybrid-search-engine`: backlog → drafted

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
| Orama Index | `src/lib/rag/orama-index.ts` | Base vector search |
| RAG Store | `src/lib/rag/rag-store.ts` | State management |
| Test Setup | `src/test/setup.ts` | Dexie mock |

---

## Acceptance Criteria for Story File Creation

**Per Story Dev Cycle Phase 1.2:**

- [ ] Story file exists at `_bmad-output/sprint-artifacts/story-32-2-hybrid-search-engine.md`
- [ ] User story format complete (As a/I want/So that)
- [ ] At least 5 acceptance criteria defined (Given/When/Then format)
- [ ] Tasks section with checkboxes (including research tasks)
- [ ] **Research Requirements section populated**:
  - [ ] Context7: Orama hybrid search configuration
  - [ ] DeepWiki: Vector + fulltext patterns
  - [ ] Repomix: Current orama-index.ts structure
- [ ] Dev Notes references architecture.md
- [ ] Status set to `drafted`

---

## Next Agent Assignment

**After Story File Creation:**

| Phase | Agent | Task |
|-------|-------|------|
| Phase 2 (Create Context) | `@bmad-bmm-sm` | Create context XML with code state |
| Phase 3 (Development) | `@bmad-bmm-dev` | Implement hybrid search |
| Phase 4 (Code Review) | `@code-reviewer` | Review implementation |

---

## Output Location

**Story File:** `_bmad-output/sprint-artifacts/story-32-2-hybrid-search-engine.md`  
**Return via:** Report to `@bmad-core-bmad-master` with completion summary

---

## Variables for Continuation

```yaml
story_key: "32-2-hybrid-search-engine"
epic_number: "32"
previous_story: "32-1"
tests_required: 15
coverage_target: "80%"
performance_target: "<500ms for 10K docs"
```

---

**Document Version:** 1.0  
**Created:** 2025-12-31 08:25:00 UTC+7  
**Valid Until:** Story 32-2 reaches `done` status

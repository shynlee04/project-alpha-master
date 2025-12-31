---
date: 2025-12-31
time: "08:31:00"
phase: Story Development Cycle - Phase 3 (Development)
team: Team-A
agent_mode: bmad-core-bmad-master
---

# Handoff to @bmad-bmm-dev: Story 32-2 Hybrid Search Engine

## Task

Implement the Hybrid Search Engine for EPIC-32 (RAG Infrastructure) - combining vector similarity search with full-text search using weighted scoring (vector 0.7 + fulltext 0.3).

---

## Context Summary

**Epic:** EPIC-32 (RAG Infrastructure)  
**Story:** 32-2 (Hybrid Search Engine)  
**Status:** ready-for-dev (sprint-status.yaml updated)  
**Dependencies:** Story 32-1 (COMPLETE) - Orama WASM Vector Store Enhancement  
**Integration Points:**
- `src/lib/rag/orama-index.ts` - Existing vectorSearch() and fulltextSearch() methods
- `src/lib/rag/rag-store.ts` - State management for search results
- `KnowledgePage` - Search UI integration (wire needed)

---

## Task Specification

### Acceptance Criteria (5 ACs)

| AC | Criterion | Validation |
|----|-----------|------------|
| **AC1** | Weighted scoring algorithm (vector 0.7 + fulltext 0.3) with <500ms response for 10K docs | Query returns combined scores |
| **AC2** | Phrase matching boost for quoted phrases | "exact phrase match" receives ranking boost |
| **AC3** | Filter support (date range, source type, tags) | Results filtered before ranking |
| **AC4** | Result merging with deduplication | Duplicate documents consolidated |
| **AC5** | 15 unit tests with 80% coverage | All tests pass |

### New File Location

```
src/lib/rag/hybrid-retriever.ts
```

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

---

## Current Workflow Status

From [`_bmad-output/sprint-artifacts/sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status.yaml):

```yaml
32-1-orama-wasm-vector-store: done       # Story 32-1 COMPLETE
32-2-hybrid-search-engine: ready-for-dev # ← CURRENT - Delegate to dev
32-3-semantic-citation-system: backlog
32-4-rag-query-optimization: backlog
32-5-knowledge-graph-integration: backlog
```

---

## References

### Primary Documents

| Document | Path | Purpose |
|----------|------|---------|
| Technical Specification | `_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md` | Implementation reference |
| Story File | `_bmad-output/sprint-artifacts/story-32-2-hybrid-search-engine.md` | Full requirements |
| Context XML | `_bmad-output/sprint-artifacts/story-32-2-hybrid-search-engine-context.xml` | Code state + research |
| Story Dev Cycle | `.agent/workflows/story-dev-cycle.md` | Workflow guidance |
| Sweeping Validation | `_bmad-output/validation/sweeping-validation.md` | Quality gates |

### Existing Implementation

| File | Path | Purpose |
|------|------|---------|
| Orama Index | `src/lib/rag/orama-index.ts` | Base vector search (551 lines, EXISTS) |
| RAG Store | `src/lib/rag/rag-store.ts` | State management (EXISTS) |
| Test Setup | `src/test/setup.ts` | Dexie mock (EXISTS) |

### Research Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| RAG Pipeline Optimization | `_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md` | Performance guidance |
| Implementation Playbook | `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md` | Step-by-step guidance |

---

## Research Requirements (Execute During Dev)

### MCP Tool Research (MANDATORY)

| Tool | Query | Purpose |
|------|-------|---------|
| **Context7** | "Orama hybrid search configuration scoring weights" | Official Orama WASM docs |
| **Context7** | "Orama fulltext search with filters" | Filter implementation patterns |
| **DeepWiki** | "orama js hybrid vector fulltext search github" | Community patterns |
| **Repomix** | Pack src/lib/rag/orama-index.ts | Analyze existing methods |
| **Tavily** | "Orama.js hybrid search 2024 best practices" | Current best practices |

### Codebase Research (Execute During Dev)

- [ ] read_file `src/lib/rag/orama-index.ts` for existing vectorSearch/fulltextSearch methods
- [ ] Search for `SearchFilters` in codebase for existing patterns
- [ ] Check `src/lib/rag/rag-store.ts` for search state management
- [ ] Review `src/i18n/en.json` for search-related translation keys

---

## Tasks to Complete

### Research Tasks (Execute First)

- [ ] **R1:** Query Context7 for Orama hybrid search configuration
- [ ] **R2:** Use DeepWiki for hybrid search patterns
- [ ] **R3:** Use Repomix to analyze orama-index.ts
- [ ] **R4:** Search codebase for SearchFilters usage

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

## Technical Constraints

1. **Performance Target:** <500ms response time for 10,000 documents
2. **Memory Constraints:** Local-first WASM environment
3. **Persistence:** Results cached in IndexedDB via rag-store.ts
4. **UI Integration:** Must work with existing KnowledgePage search component

---

## Next Agent Assignment

**Delegate to:** `@bmad-bmm-dev` (Development Agent)  
**Output Location:** Update Dev Agent Record in `story-32-2-hybrid-search-engine.md`  
**Return via:** Report to `@bmad-core-bmad-master` with completion summary

---

**Generated:** 2025-12-31 08:31:00 UTC+7  
**Handoff ID:** handoff-32-2-2025-12-31

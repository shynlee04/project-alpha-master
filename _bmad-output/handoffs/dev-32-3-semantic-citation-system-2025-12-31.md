---
date: 2025-12-31
time: 08:50:00
phase: Development
team: Team-B
agent_mode: bmad-core-bmad-master
---

# Handoff to @bmad-bmm-dev - Story 32-3 Semantic Citation System

**Task:** Implement Semantic Citation System for EPIC-32 (RAG Infrastructure)

**Context Files:**
- [`_bmad-output/sprint-artifacts/story-32-3-semantic-citation-system.md`](_bmad-output/sprint-artifacts/story-32-3-semantic-citation-system.md)
- [`_bmad-output/sprint-artifacts/story-32-3-semantic-citation-system-context.xml`](_bmad-output/sprint-artifacts/story-32-3-semantic-citation-system-context.xml)
- [`_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md`](_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md)
- [`src/lib/rag/orama-index.ts`](src/lib/rag/orama-index.ts)
- [`src/lib/rag/hybrid-retriever.ts`](src/lib/rag/hybrid-retriever.ts)

**Acceptance Criteria:**

| AC | Description | Validation Method |
|----|-------------|-------------------|
| AC1 | Citation auto-generation with inline citations `[source-1]`, `[source-2]` | Unit test + manual |
| AC2 | Source attribution metadata (title, relevance score, excerpt) | Unit test |
| AC3 | Citation click-to-navigate opens source preview panel | Manual test |
| AC4 | Citation count display badge in chat header | Visual inspection |
| AC5 | Citation filtering by selected sources | Manual test |
| AC6 | Test coverage ≥33 tests | Test runner |

**Output Location:** `_bmad-output/handoffs/dev-32-3-semantic-citation-system-2025-12-31.md`

**Return via:** Report to @bmad-core-bmad-master with completion summary

---

## Context Summary

### Epic: EPIC-32 (RAG Infrastructure)

**Epic Goal:** Implement local-first RAG infrastructure with Orama WASM vector store, hybrid search, semantic citations, and query optimization for the Knowledge Synthesis Station.

**Story: 32-3 (Semantic Citation System)**

**User Story:**
> "As a knowledge worker using the Knowledge Synthesis Station, I want to automatically generate semantic citations for AI-generated responses that link back to source documents, So that I can verify the accuracy of AI responses and trace information back to its original source."

### Dependencies

- **Story 32-1 (COMPLETE):** Orama WASM Vector Store Enhancement - provides the vector search foundation
- **Story 32-2 (COMPLETE):** Hybrid Search Engine - provides hybrid search with weighted scoring
- **Integration Required:** Must integrate with existing `HybridRetriever` output for source metadata

### Technical Context

The Semantic Citation System builds on the hybrid search infrastructure to:
1. Extract source metadata from search results
2. Generate inline citation markers in AI responses
3. Provide clickable citations that navigate to source documents
4. Display citation count and filtering UI in the chat interface

## Task Specification

### Core Implementation Requirements

1. **Citation Types & Interfaces** (`src/lib/rag/citation-types.ts`)
   - Define `Citation` interface with id, sourceId, relevanceScore, excerpt, position
   - Define `CitationMetadata` interface with title, url, snippet, pageNumber
   - Define `CitationStyle` enum (numeric, bracketed, named)

2. **CitationGenerator Class** (`src/lib/rag/citation-generator.ts`)
   - `generateCitations(searchResults: SearchResult[]): Citation[]`
   - `formatInlineCitation(citation: Citation): string`
   - `extractSourceMetadata(result: SearchResult): CitationMetadata`
   - Support configurable citation format

3. **Citation Metadata Utilities** (`src/lib/rag/citation-metadata.ts`)
   - `extractCitationMetadata(source: SourceDocument): CitationMetadata`
   - `formatCitationDisplay(metadata: CitationMetadata): string`
   - `sortCitationsByRelevance(citations: Citation[]): Citation[]`

4. **CitationSidebar Component** (`src/lib/rag/citation-sidebar.tsx`)
   - Display all citations with source information
   - Click-to-navigate functionality
   - Relevance score visualization
   - Filtering by source

5. **CitationCountBadge Component** (`src/lib/rag/citation-count-badge.tsx`)
   - Show citation count in chat header
   - Animated badge with count
   - Click triggers sidebar open

6. **Click-to-Navigate Handler** (`src/lib/rag/citation-click-handler.ts`)
   - `handleCitationClick(citation: Citation): void`
   - `getSourcePreview(sourceId: string): SourcePreview`

### Integration Points

- **RAG Pipeline:** `HybridRetriever` returns citations with search results
- **Chat Interface:** Citation count badge in header, sidebar panel
- **Source Preview Panel:** Opens when citation clicked
- **i18n:** All UI strings externalized (24+ translation keys)

### Constraints

- Must use existing `SearchResult` and `SourceDocument` interfaces
- Must integrate with `SourcePreviewPanel` component
- Must follow 8-bit gaming style with dark theme
- All tests must use jsdom environment
- File size limit: 300 lines per file

## Current Workflow Status

### From `sprint-status.yaml`:

```yaml
epic_32_rag_infrastructure:
  status: in_progress
  velocity: 3/5 stories
  stories:
    32-1-orama-wasm-vector-store-enhancement: done
    32-2-hybrid-search-engine: done
    32-3-semantic-citation-system: ready-for-dev  # ← Current
    32-4-rag-query-optimization: backlog
    32-5-knowledge-graph-integration: backlog
```

### From `bmm-workflow-status.yaml`:

```yaml
current_workflow: epic-32-sprint-1
phase: Development
active_epics:
  - id: 32
    status: IN_PROGRESS
epic_status:
  32: IN_PROGRESS
  32-1: DONE
  32-2: DONE
  32-3: IN_PROGRESS
  32-4: PENDING
  32-5: PENDING
next_actions:
  - Implement Story 32-3 (Semantic Citation System)
  - Conduct code review for Story 32-3
  - Create Story 32-4 (RAG Query Optimization)
```

## References

### Technical Specifications

- **Tech Spec:** [`_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md`](_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md)
  - Part 4: Knowledge Synthesis Interface Specification
  - Part 6: Conversational AI Interface Specification
  - Part 11: Technical Specifications Reference (Data Models)

### Existing Implementation

- **Orama Index:** [`src/lib/rag/orama-index.ts`](src/lib/rag/orama-index.ts) (551 lines) - Vector store implementation
- **Hybrid Retriever:** [`src/lib/rag/hybrid-retriever.ts`](src/lib/rag/hybrid-retriever.ts) (490 lines) - Hybrid search implementation
- **RAG Store:** [`src/lib/state/rag-store.ts`](src/lib/state/rag-store.ts) - Zustand store for RAG state

### Development Guidelines

- **Story Dev Cycle:** [`.agent/workflows/story-dev-cycle.md`](.agent/workflows/story-dev-cycle.md)
- **Sweeping Validation:** [`_bmad-output/validation/sweeping-validation.md`](_bmad-output/validation/sweeping-validation.md)
- **Code Style:** [`AGENTS.md`](AGENTS.md) - Import order, naming conventions

### Research Artifacts

- **Implementation Playbook:** [`_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md`](_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md)
- **RAG Pipeline Optimization:** [`_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md`](_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md)

## Next Agent Assignment

**Agent:** `@bmad-bmm-dev`

**Workflow:** `*develop-story` (per `.agent/workflows/story-dev-cycle.md`)

### Development Steps

1. **Pre-Implementation Research (MANDATORY)**
   - Read story file: `story-32-3-semantic-citation-system.md`
   - Read context XML: `story-32-3-semantic-citation-system-context.xml`
   - Review existing implementation in `src/lib/rag/`
   - Query MCP tools for any unclear patterns

2. **Implement with TDD**
   - Write failing tests first for each component
   - Implement minimal code to pass
   - Refactor while keeping tests green
   - Run full test suite: `pnpm exec tsc --noEmit && pnpm test`

3. **Update Story File**
   - Mark tasks complete: `[x]`
   - Document Dev Agent Record with files changed, decisions

4. **Update Governance Files**
   - `sprint-status.yaml`: `32-3` → `in-progress` → `review`

### Expected Artifacts to Create

| File | Type | Target Lines |
|------|------|--------------|
| `src/lib/rag/citation-types.ts` | Types/Interfaces | ~100 |
| `src/lib/rag/citation-generator.ts` | Generator Class | ~200 |
| `src/lib/rag/citation-metadata.ts` | Metadata Utilities | ~100 |
| `src/lib/rag/citation-sidebar.tsx` | React Component | ~250 |
| `src/lib/rag/citation-count-badge.tsx` | React Component | ~75 |
| `src/lib/rag/citation-click-handler.ts` | Event Handler | ~75 |
| `src/lib/rag/__tests__/citation-generator.test.ts` | Unit Tests | ~200 |
| `src/lib/rag/__tests__/citation-metadata.test.ts` | Unit Tests | ~100 |
| Translation keys | i18n | +24 keys |

### Success Criteria

- All 6 acceptance criteria pass
- ≥33 unit tests created and passing
- No TypeScript errors
- File sizes ≤300 lines each
- 8-bit themed styling applied
- i18n keys externalized
- Code review approved

---

**Delegated by:** @bmad-core-bmad-master
**Handoff Time:** 2025-12-31T08:50:00+07:00
**Expected Duration:** 4-6 hours

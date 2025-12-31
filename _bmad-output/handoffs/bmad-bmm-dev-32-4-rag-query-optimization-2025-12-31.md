---
date: 2025-12-31
time: 10:17:00+07:00
phase: Development
team: Team-A
agent_mode: bmad-bmm-dev
---

# Hand-off to @bmad-bmm-dev

**Task:** Implement Story 32-4: RAG Query Optimization for Knowledge Synthesis Station

## Context Summary

| Property | Value |
|----------|-------|
| **Epic** | EPIC-32: Knowledge Synthesis Station - RAG Infrastructure |
| **Story** | 32-4: RAG Query Optimization |
| **Status** | ready-for-dev |
| **Priority** | HIGH |
| **Dependencies** | Story 32-1 (Orama WASM Vector Store Enhancement) - COMPLETE |
| **Next Story** | 32-5: Knowledge Graph Integration (depends on 32-2, 32-3) |

### Epic Overview

EPIC-32 focuses on implementing core RAG infrastructure for the Knowledge Synthesis Station. Stories 32-1 through 32-3 are complete, establishing:
- **Story 32-1**: Orama WASM vector store with 384-dimensional CLIP embeddings
- **Story 32-2**: Hybrid search engine with configurable weighted scoring (default 0.7 vector, 0.3 fulltext)
- **Story 32-3**: Semantic citation system with source attribution

Story 32-4 builds on these foundations to optimize query performance, particularly for complex queries with multiple sources and filtering requirements.

## Task Specification

### Story Summary

As a user querying my knowledge base, I want RAG queries to be optimized for performance so that search results return within acceptable latency bounds even with large document collections.

### User Story

```
As a user with a large knowledge base (100+ documents)
I want query results to return within 2 seconds
So that I can maintain my flow while exploring connections in my knowledge
```

### Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| **AC1** | Implement query result caching layer with configurable TTL (default 5 minutes) | ⏳ Pending |
| **AC2** | Add debouncing for rapid successive queries (300ms delay) | ⏳ Pending |
| **AC3** | Implement result pagination with configurable page size (default 10 results) | ⏳ Pending |
| **AC4** | Add query optimization for compound queries (AND/OR logic) | ⏳ Pending |
| **AC5** | Implement result streaming for progressive UI updates | ⏳ Pending |
| **AC6** | <2s response time target for 100-document knowledge base | ⏳ Pending |

### Technical Requirements

#### 1. Query Cache Layer

```typescript
// Expected interface
interface QueryCacheEntry {
  query: string;
  results: SearchResult[];
  timestamp: number;
  expiresAt: number;
}

class RAGQueryCache {
  private cache: Map<string, QueryCacheEntry>;
  private ttl: number; // Default 5 minutes (300000ms)
  
  get(query: string): SearchResult[] | null;
  set(query: string, results: SearchResult[]): void;
  invalidate(query: string): void;
  clear(): void;
  pruneExpired(): number; // Returns count of pruned entries
}
```

#### 2. Debouncing Mechanism

```typescript
// For rapid successive queries
function createDebouncedSearch(
  searchFn: (query: string) => Promise<SearchResult[]>,
  delay: number = 300
): (query: string) => Promise<SearchResult[]>;
```

#### 3. Pagination Support

```typescript
interface PaginatedResults<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function paginateResults<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResults<T>;
```

#### 4. Compound Query Optimization

```typescript
// Parse and optimize compound queries like:
// "machine learning AND neural networks NOT deep learning"
// "cat OR dog OR fish"
interface ParsedQuery {
  terms: string[];
  required: string[];  // AND terms
  optional: string[];  // OR terms
  excluded: string[];  // NOT terms
}

function parseCompoundQuery(query: string): ParsedQuery;
function optimizeCompoundSearch(
  parsed: ParsedQuery,
  hybridSearch: HybridSearchEngine
): Promise<SearchResult[]>;
```

#### 5. Streaming Results

```typescript
// For progressive UI updates
async function* streamSearchResults(
  query: string,
  hybridSearch: HybridSearchEngine
): AsyncGenerator<SearchResult, void, void>;
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/rag/query-cache.ts` | Create | Query result caching layer |
| `src/lib/rag/query-optimizer.ts` | Create | Compound query parsing and optimization |
| `src/lib/rag/pagination.ts` | Create | Pagination utilities |
| `src/lib/rag/index.ts` | Modify | Add barrel exports for new modules |
| `src/lib/rag/__tests__/query-cache.test.ts` | Create | Unit tests for cache (≥10 tests) |
| `src/lib/rag/__tests__/query-optimizer.test.ts` | Create | Unit tests for optimizer (≥10 tests) |
| `src/lib/rag/__tests__/pagination.test.ts` | Create | Unit tests for pagination (≥5 tests) |

### Files to Reference

| File | Purpose |
|------|---------|
| `src/lib/rag/orama-index.ts` | Core Orama WASM vector store (Story 32-1) |
| `src/lib/rag/hybrid-retriever.ts` | Hybrid search implementation (Story 32-2) |
| `src/lib/rag/types.ts` | Type definitions |
| `src/lib/rag/__tests__/hybrid-retriever.test.ts` | Test patterns reference |

## Current Workflow Status

From `_bmad-output/sprint-artifacts/sprint-status.yaml`:

```yaml
epic-32: in_progress
32-1-orama-wasm-vector-store-enhancement: done
32-2-hybrid-search-engine: done
32-3-semantic-citation-system: done
32-4-rag-query-optimization: ready-for-dev
32-5-knowledge-graph-integration: backlog
```

## References

### Technical Documentation

1. **Knowledge Synthesis Platform Tech Spec**
   - Location: `_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md`
   - Sections: Part 11 (Technical Specifications Reference)

2. **Implementation Playbook**
   - Location: `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md`
   - Focus: Query optimization patterns

3. **Story Development Cycle Workflow**
   - Location: `.agent/workflows/story-dev-cycle.md`
   - Follow validation → development → code review → done flow

### Codebase References

| Pattern | File | Lines |
|---------|------|-------|
| Orama WASM usage | `src/lib/rag/orama-index.ts` | 551 |
| Hybrid search implementation | `src/lib/rag/hybrid-retriever.ts` | 490 |
| Citation types | `src/lib/rag/citation-types.ts` | Modified in 32-3 |

## Constraints & Requirements

### Performance Requirements

| Metric | Target | Validation |
|--------|--------|------------|
| Query response time | <2 seconds | Test with 100 documents |
| Cache hit ratio | >30% | Monitor in development |
| Memory growth | <50MB cache | Visual inspection |
| Pagination render | <100ms | UI responsiveness |

### Code Standards

- **File Size**: All new files must be ≤300 lines
- **Naming**: camelCase for functions/variables, PascalCase for types
- **Error Handling**: Try-catch with proper error logging
- **Testing**: ≥25 unit tests total for all new modules
- **Documentation**: JSDoc comments for all public functions
- **i18n**: No hardcoded strings (use `t()` hook)

### Research Protocol (MCP Tools)

Before implementing unfamiliar patterns, use:

1. **Context7**: Query TanStack AI patterns for streaming responses
2. **Deepwiki**: Check Orama WASM documentation for caching patterns
3. **Tavily/Exa**: Search for "React query debouncing best practices 2025"

### Validation Gates

After implementation, verify:

1. ✅ All acceptance criteria met (AC1-AC6)
2. ✅ ≥25 unit tests passing (10 cache + 10 optimizer + 5 pagination)
3. ✅ TypeScript compilation: `pnpm tsc --noEmit` passes
4. ✅ Build succeeds: `pnpm build` completes without errors
5. ✅ Code review sign-off (@code-reviewer)

## Next Agent Assignment

| Property | Value |
|----------|-------|
| **Next Agent** | @bmad-bmm-dev |
| **Workflow** | *develop-story (Phase 3 of story-dev-cycle.md)* |
| **Input Files** | - Story file: `_bmad-output/sprint-artifacts/story-32-4-rag-query-optimization.md`<br>- Context XML: `_bmad-output/sprint-artifacts/story-32-4-rag-query-optimization-context.xml`<br>- This handoff document |
| **Output Location** | Update story file with Dev Agent Record |
| **Return To** | @bmad-core-bmad-master with completion summary |

## Handoff Checklist

- [x] Story file created and validated
- [x] Context XML created with code state and research notes
- [x] Sprint status updated (backlog → ready-for-dev)
- [x] This handoff document generated
- [ ] Dev agent acknowledges handoff and begins implementation

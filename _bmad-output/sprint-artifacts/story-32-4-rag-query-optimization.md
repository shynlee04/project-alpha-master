---
date: 2025-12-31
time: "10:15:00"
phase: Story Creation
team: Team-B
agent_mode: bmad-bmm-sm
---

# Story 32-4: RAG Query Optimization

**Epic:** EPIC-32 (RAG Infrastructure)  
**Story ID:** 32-4-rag-query-optimization  
**Status:** drafted  
**Created:** 2025-12-31T10:15:00+07:00  
**Priority:** HIGH  
**Dependencies:** 32-1 (Orama WASM Vector Store Enhancement)

---

## User Story

**As a** knowledge worker using the Knowledge Synthesis Station with large document collections,  
**I want** optimized RAG query performance with intelligent caching and result prioritization,  
**So that** I can get fast, relevant search results even with hundreds of indexed documents.

---

## Acceptance Criteria

| AC ID | Description | Given | When | Then |
|-------|-------------|-------|------|------|
| AC1 | Query result caching | User performs search query | Query executes | Results cached with configurable TTL (default 5 minutes) |
| AC2 | Cache invalidation | Indexed sources change | Source is updated/deleted | Related cache entries invalidated |
| AC3 | Result prioritization | Multiple sources match query | Results returned | Higher relevance sources ranked first with boost factor |
| AC4 | Query debouncing | User types in search box | Character input occurs | Query execution delayed 300ms to reduce load |
| AC5 | Progress indication | Query is executing | Long-running search | Loading indicator shows progress |
| AC6 | Performance metrics | Query completes | Results returned | Query time logged and displayed (<100ms target) |
| AC7 | Test coverage ≥25 tests | All ACs implemented | Tests written | 25+ unit tests pass |

---

## Tasks

- [ ] **T1:** Implement query cache service (`src/lib/rag/query-cache.ts`)
- [ ] **T2:** Add cache invalidation handlers for source updates/deletes
- [ ] **T3:** Implement result prioritization with relevance boost
- [ ] **T4:** Add query debouncing hook (`src/lib/rag/use-debounced-query.ts`)
- [ ] **T5:** Add loading state and progress indicators to RAGSearchPanel
- [ ] **T6:** Implement performance metrics collection
- [ ] **T7:** Write unit tests for query cache (`src/lib/rag/__tests__/query-cache.test.ts`)
- [ ] **T8:** Write unit tests for debouncing (`src/lib/rag/__tests__/use-debounced-query.test.ts`)
- [ ] **T9:** Add i18n translation keys for loading states

---

## Research Requirements

**Mandatory Research Protocol (Per `.agent/workflows/story-dev-cycle.md`):**

1. **Load Local Agent Instructions:**
   - Read `docs/agent-instructions/dependency-libraries-usage.md` (if exists)
   - Read `.agent/rules/general-rules.md` for MCP research protocol

2. **MCP Tool Research:**
   - **Context7:** Query Orama documentation for caching patterns
   - **DeepWiki:** Check TanStack query caching strategies
   - **Tavily/Exa:** Search for "RAG query optimization best practices 2025"

3. **Codebase Analysis:**
   - Review `src/lib/rag/orama-index.ts` for existing query patterns
   - Review `src/lib/rag/rag-store.ts` for state management
   - Review `src/components/rag/RAGSearchPanel.tsx` for UI integration

4. **Validation Criteria:**
   - Minimum 3 MCP tool calls required
   - Minimum 5 successful iterative executions

---

## Dev Notes

### Architecture Patterns

- **Query Cache Service:** Follow singleton pattern with LRU eviction
- **Cache Key:** Generate from query text + filter options + timestamp bucket
- **Debouncing:** Use existing debounce utility or implement new hook
- **State Management:** Extend `useRAGStore` with cache state

### Code Patterns (Pseudo-Guidelines Only)

```typescript
// Query cache service - follow singleton pattern
class QueryCacheService {
  private cache: Map<string, CacheEntry>;
  private maxEntries: number = 100;
  
  get(key: string): CacheEntry | null;
  set(key: string, value: CacheEntry): void;
  invalidate(pattern: string): void;
  clear(): void;
}

// Result prioritization - follow hybrid-retriever.ts pattern
function prioritizeResults(results: SearchResult[]): SearchResult[] {
  return results.sort((a, b) => {
    const boostA = a.metadata.recencyBoost + a.metadata.sourceBoost;
    const boostB = b.metadata.recencyBoost + b.metadata.sourceBoost;
    return (b.relevanceScore + boostB) - (a.relevanceScore + boostA);
  });
}

// Debounced query hook - follow existing hooks pattern
function useDebouncedQuery<T>(
  query: T,
  delay: number
): T {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  // Implementation with useEffect and setTimeout
}
```

**NOTE:** These are pseudo-patterns only. Actual implementation requires conditional research during development phase using MCP tools.

### Dependencies

- **Orama WASM:** Cache invalidation on index changes (`src/lib/rag/orama-index.ts`)
- **RAG Store:** Cache state management (`src/lib/rag/rag-store.ts`)
- **Zustand:** State persistence for cache metrics
- **i18n:** Translation keys for loading/performance UI

---

## References

| Ref | Document | Purpose |
|-----|----------|---------|
| R1 | `_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md` | Technical specification |
| R2 | `_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md` | Optimization guidance |
| R3 | `src/lib/rag/orama-index.ts` | Orama WASM implementation reference |
| R4 | `src/lib/rag/hybrid-retriever.ts` | Result retrieval pattern reference |
| R5 | `src/lib/rag/rag-store.ts` | RAG store pattern reference |

---

## Dev Agent Record

**Agent:** Pending assignment  
**Session:** Pending  

#### Task Progress:
- [ ] T1: Query cache service
- [ ] T2: Cache invalidation handlers
- [ ] T3: Result prioritization
- [ ] T4: Query debouncing hook
- [ ] T5: Loading state UI
- [ ] T6: Performance metrics
- [ ] T7: Cache unit tests
- [ ] T8: Debounce unit tests
- [ ] T9: i18n translation keys

#### Research Executed:
- [ ] Context7: Orama caching patterns
- [ ] DeepWiki: TanStack query strategies
- [ ] Tavily/Exa: RAG optimization 2025

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/rag/query-cache.ts | Created | ~120 |
| src/lib/rag/use-debounced-query.ts | Created | ~60 |
| src/lib/rag/rag-store.ts | Modified | +30 |
| src/lib/rag/__tests__/query-cache.test.ts | Created | ~150 |
| src/lib/rag/__tests__/use-debounced-query.test.ts | Created | ~80 |
| src/components/rag/RAGSearchPanel.tsx | Modified | +20 |
| src/i18n/en.json | Modified | +5 |
| src/i18n/vi.json | Modified | +5 |

#### Tests Created:
- `query-cache.test.ts`: 15 tests
- `use-debounced-query.test.ts`: 10 tests

#### Decisions Made:
- [ ] Decision 1: Cache TTL configuration approach
- [ ] Decision 2: Cache key generation strategy
- [ ] Decision 3: Debounce delay selection (300ms vs 500ms)

---

## Code Review

**Reviewer:** Pending  
**Date:** Pending  
**Status:** Pending

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:
- Issue 1: Pending

#### Sign-off:
✅ Pending review

---

## Status History

| Date | Time | Agent Mode | Action | Status |
|------|------|------------|--------|--------|
| 2025-12-31 | 10:15:00 | bmad-bmm-sm | Story file created | drafted |
| 2025-12-31 | TBD | bmad-bmm-dev | Context XML created | ready-for-dev |
| 2025-12-31 | TBD | bmad-bmm-dev | Implementation complete | review |
| 2025-12-31 | TBD | code-reviewer | Code review complete | done |

---

## Next Steps

1. **Create Context XML:** Generate context XML file for developer handoff
2. **Update Sprint Status:** Mark 32-4 as `ready-for-dev`
3. **Delegate Development:** Handoff to `@bmad-bmm-dev` for implementation

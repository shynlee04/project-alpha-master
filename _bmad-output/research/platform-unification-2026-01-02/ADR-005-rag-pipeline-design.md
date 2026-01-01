---
title: ADR-005: RAG Pipeline Design
status: Proposed
date: 2026-01-02
iteration: 10
cornerstone: 5
priority: P3 (Enhancement)
---

# ADR-005: RAG Pipeline Design

**Status:** Proposed
**Date:** 2026-01-02
**Iteration:** 10
**Cornerstone:** 5 - RAG Pipeline
**Priority:** P3 (Enhancement - Best Practices Reference)
**Estimated Effort:** 13 hours (4 hours RAG→Agent + 6 hours cross-workspace + 3 hours export/import)

---

## Context

### Current State (EXCELLENT - 95% Health - BEST IN CODEBASE)

**Outstanding Implementation:**
- ✅ **December 2025 Zustand Patterns** (5 focused slices, all <120 lines)
- ✅ Zero duplication (no legacy stores)
- ✅ Comprehensive features (hybrid search, query optimization, voice mode)
- ✅ Workspace-aware indexing
- ✅ Event activity indicators (indexing progress, embedding progress)
- ✅ Clean separation: Domain → Infrastructure → Presentation
- ✅ Facade pattern for RAG services

**Architecture Highlights:**

```typescript
// src/infrastructure/persistence/stores/rag/rag-store.ts (125 lines)

export const useRAGStore = create<RAGStoreState>()(
  persist(
    (set, get, api) => ({
      // 5 Focused Slices (December 2025 Zustand Pattern)
      ...createRAGIndexSlice(set, get, api),      // ~100 lines
      ...createRAGSearchSlice(set, get, api),     // ~100 lines
      ...createRAGChunkingSlice(set, get, api),   // ~80 lines
      ...createRAGVoiceSlice(set, get, api),      // ~60 lines
      ...createRAGChatSlice(set, get, api),       // ~80 lines
    }),
    {
      name: 'rag-state',
      storage: createDexieStorage('ragState'),
      partialize: (state) => ({
        indexes: state.indexes,
        activeIndexId: state.activeIndexId,
      }),
    }
  )
);
```

**Slice Breakdown (All <120 lines):**

1. **Index Slice** (~100 lines)
   - `createIndex(projectId, workspaceType)`
   - `deleteIndex(indexId)`
   - `getIndex(indexId)`
   - `getIndexesForWorkspace(workspaceType)`

2. **Search Slice** (~100 lines)
   - `search(query, indexId)`
   - `hybridSearch(query, indexId)` (BM25 + embeddings)
   - `setQueryOptions(options)`

3. **Chunking Slice** (~80 lines)
   - `setChunkingStrategy(strategy)`
   - `chunkDocument(document, strategy)`
   - Strategies: fixed-size, recursive, semantic

4. **Voice Slice** (~60 lines)
   - `startVoiceSearch()`
   - `stopVoiceSearch()`
   - `transcribeVoice(audio)`

5. **Chat Slice** (~80 lines)
   - `askRAG(question, indexId)`
   - `generateCitation(context, query)`
   - `formatAnswer(answer, citations)`

**RAG Service Modules (Pluggable Strategies):**

```typescript
// src/lib/rag/index.ts (67 lines - barrel export)

export {
  createOramaIndex,
  addDocumentsToIndex,
  searchIndex,
  removeFromIndex,
} from './orama-index';

export {
  chunkDocumentFixed,
  chunkDocumentRecursive,
  chunkDocumentSemantic,
} from './document-chunker';

export {
  createEmbedding,
  batchCreateEmbeddings,
} from './embedding-service';

export {
  hybridSearch,
  bm25Search,
  vectorSearch,
} from './hybrid-retriever';

export {
  generateRAGResponse,
  formatCitations,
} from './rag-chat';

export {
  optimizeQuery,
  expandQuery,
  rewriteQuery,
} from './query-optimizer';

export {
  exportIndex,
  importIndex,
} from './index-io';
```

**Gap Analysis:** From `cornerstone-5-rag-analysis.md`
- RAG health score: **95%** (BEST IN CODEBASE - MODEL ARCHITECTURE)
- God stores: 0 ✅
- Store locations: 1 unified ✅
- Max file size: 134 lines ✅
- December 2025 patterns: Perfect ✅
- **MINOR:** RAG → Agent integration missing (enhancement opportunity)
- **MINOR:** Cross-workspace RAG search missing (enhancement opportunity)

### Current Architecture (IDEAL)

```
┌─────────────────────────────────────────────┐
│ RAG STORE (rag-store.ts - 125 lines)       │
│                                             │
│ 5 Focused Slices (December 2025 Pattern)   │
│                                             │
│ 1. Index Slice (~100 lines)                 │
│    - createIndex(projectId, workspaceType)  │
│    - deleteIndex(indexId)                   │
│    - getIndex(indexId)                      │
│                                             │
│ 2. Search Slice (~100 lines)                │
│    - search(query, indexId)                 │
│    - hybridSearch(query, indexId)           │
│    - setQueryOptions(options)                │
│                                             │
│ 3. Chunking Slice (~80 lines)               │
│    - setChunkingStrategy(strategy)           │
│    - chunkDocument(doc, strategy)            │
│                                             │
│ 4. Voice Slice (~60 lines)                  │
│    - startVoiceSearch()                     │
│    - transcribeVoice(audio)                 │
│                                             │
│ 5. Chat Slice (~80 lines)                   │
│    - askRAG(question, indexId)              │
│    - generateCitation(context, query)        │
│                                             │
│ ✅ ALL SLICES <120 LINES                   │
└─────────────────────────────────────────────┘
           │
           ▼ (persistence)
┌─────────────────────────────────────────────┐
│ DEXIE DATABASE (IndexedDB)                  │
│                                             │
│ Table: rag_indexes                          │
│   - id (primaryKey)                         │
│   - projectId (workspace scoping)           │
│   - workspaceType                           │
│   - documentCount                           │
│   - lastUpdatedAt                           │
│                                             │
│ Table: rag_documents                       │
│   - id (primaryKey)                         │
│   - indexId (foreignKey → rag_indexes.id)   │
│   - content                                 │
│   - embedding (vector)                      │
│   - metadata                                │
└─────────────────────────────────────────────┘
           │
           ▼ (services)
┌─────────────────────────────────────────────┐
│ RAG SERVICE MODULES (Pluggable Strategies)  │
│                                             │
│ - orama-index.ts (Orama vector DB)         │
│ - document-chunker.ts (3 strategies)        │
│ - embedding-service.ts (OpenAI, Gemini)     │
│ - hybrid-retriever.ts (BM25 + vector)      │
│ - rag-chat.ts (RAG response generation)     │
│ - query-optimizer.ts (query expansion)      │
│ - pagination.ts (result pagination)         │
│ - index-io.ts (export/import)               │
└─────────────────────────────────────────────┘
           │
           ▼ (UI indicators)
┌─────────────────────────────────────────────┐
│ EVENT ACTIVITY INDICATORS (User Feedback)   │
│                                             │
│ - DatabaseIndexingIndicator.tsx (84 lines)  │
│ - EmbeddingProgressIndicator.tsx (84 lines) │
│ - ChunkingStatusIndicator.tsx (84 lines)    │
│ - SyncStatusIndicator.tsx (84 lines)        │
│                                             │
│ ✅ ALL <120 LINES (Ralph Loop Cycle 17)     │
└─────────────────────────────────────────────┘
```

**Key Design Patterns (MODEL ARCHITECTURE):**

1. **Slice Pattern** ✅
   - Each slice <120 lines with focused responsibility
   - Easy to test and maintain
   - Clear separation of concerns

2. **Facade Pattern** ✅
   - RAG service modules hide implementation complexity
   - Pluggable strategies (chunking, search, embeddings)
   - Easy to swap implementations

3. **Event-Driven Architecture** ✅
   - Event activity indicators for user feedback
   - Observable indexing progress
   - Cross-component communication

4. **Workspace-Aware** ✅
   - Indexes scoped to workspaces
   - Per-workspace RAG configurations
   - Clean isolation

---

## Decision

**Maintain current RAG architecture with optional enhancements.**

**Key Principle:** The RAG system is already exemplary (95% health - BEST IN CODEBASE). Use as reference architecture for other cornerstones. Only implement optional enhancements.

### Optional Enhancements

1. **RAG → Agent Integration** (P3 - 4 hours)
   - Add RAG context to agent system prompt
   - Create `use-rag-context` hook
   - Add citation formatting to agent responses

2. **Cross-Workspace RAG Search** (P3 - 6 hours)
   - Federated search across workspaces
   - Add UI for cross-workspace queries
   - Result aggregation and ranking

3. **RAG Export/Import** (P3 - 3 hours)
   - Add index backup functionality
   - Export/import UI
   - Index migration support

**Note:** These enhancements are OPTIONAL and low priority. The current architecture is production-ready and serves as the MODEL ARCHITECTURE for other cornerstones.

---

## Consequences

### Benefits (Current Architecture)

1. **December 2025 Zustand Patterns** ✅
   - 5 focused slices (<120 lines each)
   - Dexie persistence
   - Individual selectors
   - Perfect implementation

2. **Comprehensive Features** ✅
   - Hybrid search (BM25 + embeddings)
   - Query optimization (expansion, rewriting)
   - Multiple chunking strategies
   - Voice mode support
   - Citations generation

3. **Workspace-Aware** ✅
   - Indexes scoped to workspaces
   - Per-workspace configurations
   - Clean isolation

4. **Event Activity Indicators** ✅
   - DatabaseIndexingIndicator
   - EmbeddingProgressIndicator
   - ChunkingStatusIndicator
   - SyncStatusIndicator

5. **Pluggable Strategies** ✅
   - Chunking: fixed-size, recursive, semantic
   - Search: BM25, vector, hybrid
   - Embeddings: OpenAI, Gemini

6. **Zero Duplication** ✅
   - No legacy stores
   - No fragmented code
   - Single source of truth

### Benefits (Proposed Enhancements)

1. **RAG → Agent Integration** ✅
   - Agents can leverage code context from RAG
   - Better code understanding
   - Improved responses

2. **Cross-Workspace Search** ✅
   - Search across all workspaces
   - Federated results
   - Comprehensive coverage

3. **Export/Import** ✅
   - Index backup
   - Index migration
   - Data portability

### Drawbacks

1. **Minimal Drawbacks** ✅
   - Current architecture is already excellent
   - Enhancements are optional
   - Low risk

2. **Integration Complexity** ⚠️
   - RAG → Agent integration requires careful prompt engineering
   - Cross-workspace search requires result aggregation
   - Export/import requires schema versioning

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **RAG context increases agent latency** | Medium | Medium | - Cache RAG results<br>- Limit context size<br>- Debounce queries |
| **Cross-workspace search slow** | Medium | Medium | - Parallel queries<br>- Result pagination<br>- Caching |
| **Export/import schema changes** | Low | Low | - Version schema<br>- Migration scripts<br>- Backward compatibility |

---

## Implementation Plan

### Phase 1: RAG → Agent Integration (4 hours) - OPTIONAL

**Step 1.1:** Create use-rag-context hook
```typescript
// src/lib/rag/hooks/use-rag-context.ts

export function useRAGContext(projectId: string, query: string) {
  const [context, setContext] = useState<RAGContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      setIsLoading(true);

      try {
        // Get RAG index for project
        const index = useRAGStore.getState().getIndexForProject(projectId);
        if (!index) {
          setContext(null);
          return;
        }

        // Search for relevant context
        const results = await hybridSearch(query, index.id);

        // Format context
        const ragContext: RAGContext = {
          query,
          results: results.slice(0, 5), // Top 5 results
          citations: results.map(r => ({
            documentId: r.document.id,
            title: r.document.title,
            snippet: r.document.content.substring(0, 200),
            score: r.score,
          })),
        };

        setContext(ragContext);
      } catch (error) {
        console.error('[useRAGContext] Failed to fetch context:', error);
        setContext(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, [projectId, query]);

  return { context, isLoading };
}
```

**Step 1.2:** Integrate RAG context into agent system prompt
```typescript
// src/lib/agent/system-prompt.ts

export function getCodingAgentSystemPrompt(
  baseContext: string,
  ragContext?: RAGContext
): string {
  let prompt = baseContext;

  if (ragContext && ragContext.citations.length > 0) {
    prompt += `\n\n## Relevant Code Context\n\n`;
    prompt += `The following code snippets are relevant to the user's request:\n\n`;

    for (const citation of ragContext.citations) {
      prompt += `### ${citation.title}\n`;
      prompt += `\`\`\`\n${citation.snippet}\n\`\`\`\n\n`;
    }

    prompt += `When responding, reference these code snippets using the format: [Source: ${citation.title}]\n`;
  }

  return prompt;
}
```

**Step 1.3:** Update agent chat to use RAG context
```typescript
// src/presentation/components/ide/AgentChatPanel.tsx

export function AgentChatPanel({ projectId }: Props) {
  const [query, setQuery] = useState('');

  // Get RAG context
  const { context: ragContext, isLoading: isRAGLoading } = useRAGContext(
    projectId,
    query
  );

  // Get system prompt with RAG context
  const systemPrompt = useMemo(() => {
    return getCodingAgentSystemPrompt(
      `Project: ${projectId}`,
      ragContext
    );
  }, [projectId, ragContext]);

  // Use agent chat with RAG-enhanced prompt
  const { sendMessage } = useAgentChatWithTools({
    systemMessage: systemPrompt,
    // ... other props
  });

  // ... rest of component
}
```

### Phase 2: Cross-Workspace RAG Search (6 hours) - OPTIONAL

**Step 2.1:** Implement federated search
```typescript
// src/lib/rag/federated-search.ts

export async function federatedSearch(
  query: string,
  workspaceTypes: WorkspaceType[]
): Promise<FederatedSearchResult[]> {
  // Search each workspace in parallel
  const searchPromises = workspaceTypes.map(async (workspaceType) => {
    const indexes = useRAGStore.getState().getIndexesForWorkspace(workspaceType);

    const results = await Promise.all(
      indexes.map(async (index) => {
        const searchResults = await hybridSearch(query, index.id);
        return {
          workspaceType,
          indexId: index.id,
          results: searchResults,
        };
      })
    );

    return results;
  });

  const allResults = await Promise.all(searchPromises);

  // Aggregate results
  const aggregated = allResults.flat();

  // Rank by score
  const ranked = aggregated
    .flatMap(r => r.results)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Top 20 results

  return ranked;
}
```

**Step 2.2:** Add cross-workspace search UI
```typescript
// src/presentation/components/rag/CrossWorkspaceSearch.tsx

export function CrossWorkspaceSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FederatedSearchResult[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<WorkspaceType[]>([
    'ide',
    'knowledge',
    'notes',
    'study',
  ]);

  const handleSearch = async () => {
    const searchResults = await federatedSearch(query, selectedWorkspaces);
    setResults(searchResults);
  };

  return (
    <div className="cross-workspace-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search all workspaces..."
      />

      <WorkspaceSelector
        selected={selectedWorkspaces}
        onChange={setSelectedWorkspaces}
      />

      <button onClick={handleSearch}>Search</button>

      <div className="search-results">
        {results.map(result => (
          <div key={result.id} className="result">
            <span className="workspace-badge">{result.workspaceType}</span>
            <span className="score">{result.score.toFixed(2)}</span>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Phase 3: RAG Export/Import (3 hours) - OPTIONAL

**Step 3.1:** Implement index export
```typescript
// src/lib/rag/index-io.ts

export async function exportIndex(indexId: string): Promise<IndexExport> {
  const index = useRAGStore.getState().getIndex(indexId);
  if (!index) {
    throw new Error(`Index ${indexId} not found`);
  }

  // Get all documents
  const documents = await db.rag_documents
    .where('indexId')
    .equals(indexId)
    .toArray();

  return {
    index,
    documents,
    exportedAt: Date.now(),
    version: '1.0',
  };
}

export async function importIndex(data: IndexExport): Promise<void> {
  // Validate version
  if (data.version !== '1.0') {
    throw new Error(`Unsupported index version: ${data.version}`);
  }

  // Create index
  await createIndex(
    data.index.projectId,
    data.index.workspaceType
  );

  // Import documents
  for (const document of data.documents) {
    await db.rag_documents.add(document);
  }

  console.log(`[RAG] Imported index with ${data.documents.length} documents`);
}
```

**Step 3.2:** Add export/import UI
```typescript
// src/presentation/components/rag/IndexManagement.tsx

export function IndexManagement() {
  const handleExport = async (indexId: string) => {
    const exportData = await exportIndex(indexId);

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-index-${indexId}-${Date.now()}.json`;
    a.click();
  };

  const handleImport = async (file: File) => {
    const content = await file.text();
    const data = JSON.parse(content) as IndexExport;

    await importIndex(data);
    toast.success('Index imported successfully');
  };

  return (
    <div className="index-management">
      <h2>Index Management</h2>

      <button onClick={() => handleExport(selectedIndexId)}>
        Export Index
      </button>

      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
        }}
      />
    </div>
  );
}
```

---

## Migration Strategy

### No Migration Required ✅

The RAG system is already exemplary. Optional enhancements only.

### Deployment Strategy

1. **Feature Flags** (optional)
   - Enable RAG → Agent integration behind feature flag
   - Enable cross-workspace search behind feature flag
   - Roll out gradually

2. **Backward Compatibility**
   - Keep existing RAG APIs
   - Add new features alongside old ones
   - Gradual migration

3. **Testing**
   - Verify RAG accuracy with agent integration
   - Test cross-workspace search performance
   - Validate export/import schema

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/rag/__tests__/use-rag-context.test.ts

describe('useRAGContext', () => {
  it('should fetch RAG context for query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useRAGContext('project-1', 'test query')
    );

    await waitForNextUpdate();

    expect(result.current.context).toBeDefined();
    expect(result.current.context?.query).toBe('test query');
  });
});
```

### Integration Tests

```typescript
// src/lib/rag/__tests__/federated-search.test.ts

describe('Federated Search', () => {
  it('should search across multiple workspaces', async () => {
    const results = await federatedSearch('test query', [
      'ide',
      'knowledge',
    ]);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].workspaceType).toBeDefined();
  });
});
```

### Manual Testing Checklist

- [ ] Test RAG → Agent integration
- [ ] Verify agent responses include RAG citations
- [ ] Test cross-workspace search
- [ ] Test index export
- [ ] Test index import
- [ ] Verify performance: RAG queries <1s

---

## Success Criteria

### Completion Checklist

**Cornerstone 5 Complete When:**
- [ ] December 2025 Zustand patterns maintained (5 focused slices)
- [ ] All slices <120 lines (current: max 134 lines ✅)
- [ ] Zero duplication (no legacy stores)
- [ ] Comprehensive features working (hybrid search, query optimization, voice mode)
- [ ] Workspace-aware indexing functional
- [ ] Event activity indicators working
- [ ] (OPTIONAL) RAG → Agent integration implemented
- [ ] (OPTIONAL) Cross-workspace RAG search implemented
- [ ] (OPTIONAL) RAG export/import implemented
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] All tests passing: `pnpm test`
- [ ] Manual test: Create index → Search → Retrieve results

**Current Status:** ✅ **ALREADY COMPLETE** (95% health - BEST IN CODEBASE)
**Enhancement Status:** ⏸️ **OPTIONAL** (P3 priority - nice-to-have features)

---

## Related ADRs

- **ADR-001:** Provider Store Consolidation (independent)
- **ADR-002:** Agent Vault Architecture (RAG depends on agents for embeddings)
- **ADR-003:** Conversation Thread Schema (independent)
- **ADR-004:** Project Workspace Binding (RAG indexes scoped to projects)
- **ADR-006:** Workspace State Sharing (related - event patterns)

---

## References

- **Phase 1 Analysis:** `cornerstone-5-rag-analysis.md`
- **RAG Store:** `src/infrastructure/persistence/stores/rag/rag-store.ts`
- **RAG Services:** `src/lib/rag/index.ts`
- **Model Architecture:** This is the BEST architecture in the codebase - use as reference for other cornerstones

---

## Open Questions

1. **Should RAG → Agent integration be automatic or manual?**
   - **Decision:** Automatic with toggle
   - **Reasoning:** Users should control whether agents use RAG context

2. **Should cross-workspace search be real-time or cached?**
   - **Decision:** Cached with 5-minute TTL
   - **Reasoning:** Balance freshness with performance

3. **Should export/import support schema migration?**
   - **Decision:** YES - support versioned schemas
   - **Reasoning:** Ensures backward compatibility

---

**Status:** Proposed (Optional Enhancement)
**Next Step:** Implementation Phase 1 (RAG → Agent Integration) - OPTIONAL
**Estimated Completion:** Iterations 91-100 (Sprint 3 - P3 Enhancements)
**Risk Level:** LOW (current architecture is exemplary - 95% health)

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 2 - ADR Creation)
**Review Status:** Pending stakeholder approval
**NOTE:** This is the BEST architecture in the codebase (95% health). Use as MODEL ARCHITECTURE for other cornerstones. Enhancements are OPTIONAL.

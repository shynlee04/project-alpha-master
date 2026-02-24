# Knowledge/RAG Pipeline Diagnostic Report

**Generated**: 2026-01-09
**Scope**: Knowledge Synthesis and RAG Pipeline at `/Users/apple/Documents/coding-projects/project-alpha-master`
**Phase**: 5 - Knowledge/RAG Pipeline Analysis
**Status**: PHASE 1 DETACHMENT (Workspace shows placeholders)

---

## 1. Entry Points

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/knowledge` | `src/routes/knowledge.lazy.tsx` | **PLACEHOLDER** | Shows "Coming in Phase 2" message |
| `/knowledge/$projectId` | `src/routes/knowledge.$projectId.lazy.tsx` | **PLACEHOLDER** | Wraps ProjectProvider with placeholder |

### Current State: Phase 1 Detachment

```
/knowledge → KnowledgeWorkspacePhase1()
│
└── Shows:
    ├── "Knowledge Workspace" title
    ├── "Manage your knowledge base, documentation..."
    └── "Coming in Phase 2" banner
       ├── "Go to IDE" button
       ├── "Go to Notes" button
       └── "Back to Hub" button

/knowledge/$projectId → KnowledgeWorkspace()
│
└── ProjectProvider + KnowledgePlaceholder
    └── Shows:
        ├── "📚 Knowledge Workspace" header
        └── "Knowledge synthesis workspace coming soon"
```

### Historical Context (Preserved Code)

```typescript
// Original KnowledgeWorkspace implementation (now detached)
// Reason: useWorkspaceAccess hook causes infinite loops
// Re-attach in: Phase 2 (after P1-11 gate passes)

function KnowledgeWorkspace_Original() {
  const { state, actions, status } = useWorkspaceAccess('knowledge');

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'no_projects') return <WorkspaceAccessEmptyState />;
  if (status === 'no_binding') return <WorkspaceAccessEmptyState />;

  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}
```

---

## 2. Data Flow Diagram (Full Pipeline - Implemented but Not Rendered)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KNOWLEDGE SYNTHESIS PIPELINE                         │
└─────────────────────────────────────────────────────────────────────────────┘

SOURCE INGESTION          CHUNKING & EMBEDDING          INDEXING & STORAGE
     │                          │                            │
     ▼                          ▼                            ▼
┌──────────┐            ┌────────────────┐           ┌─────────────────┐
│  PDF     │            │ DocumentChunker│           │  Orama Index    │
│  Upload  │──────────▶│ (fixed/semantic│──────────▶│  (WASM vector   │
│          │            │  recursive)    │           │   search)       │
└──────────┘            └────────────────┘           └─────────────────┘
     │                          │                            │
     ▼                          ▼                            ▼
┌──────────┐            ┌────────────────┐           ┌─────────────────┐
│  URL     │            │ EmbeddingService│          │  Dexie DB       │
│  Fetch   │──────────▶│ (local=WebGPU  │──────────▶│  - sources      │
│          │            │  cloud=Gemini) │           │  - collections  │
└──────────┘            └────────────────┘           │  - indexes      │
     │                                                  │  - embeddings  │
     ▼                                                  └─────────────────┘
┌──────────┐                                               │
│  Text    │                                               ▼
│  Input   │                                        ┌─────────────────┐
└──────────┘                                        │  Hybrid Search  │
     │                                              │  (fulltext +    │
     ▼                                              │   vector)       │
┌──────────┐                                        └─────────────────┘
│ Metadata │                                               │
│ Extractor│                                               ▼
└──────────┘                                        ┌─────────────────┐
     │                                              │  RAG Chat       │
     ▼                                              │  (context for  │
┌──────────┐                                        │   LLM prompts)  │
│  AI      │                                        └─────────────────┘
│ Summary  │                                               │
│ (Gemini) │                                               ▼
└──────────┘                                        ┌─────────────────┐
     │                                              │  Synthesis      │
     ▼                                              │  (AI-generated  │
┌──────────┐                                        │   summaries,    │
│ Collections│                                       │   flashcards,   │
│ (Grouping)│                                       │   quizzes)      │
└──────────┘                                        └─────────────────┘
```

### Data Flow Stages

| Stage | Input | Output | Implementation |
|-------|-------|--------|----------------|
| **1. Source Import** | PDF/URL/Text | Raw content + metadata | `SourceImportDialog.tsx` |
| **2. Chunking** | Raw content | Chunks (512-1024 chars) | `DocumentChunker.ts` |
| **3. Embedding** | Chunks | Vectors (384-dim) | `embedding-service.ts` |
| **4. Indexing** | Vectors + text | Orama index | `orama-index.ts` |
| **5. Storage** | Index + metadata | Dexie records | `dexie-db.ts` |
| **6. Search** | Query | Relevant chunks | `hybrid-retriever.ts` |
| **7. Synthesis** | Chunks + query | AI response | `synthesize-tool.ts` |
| **8. Export** | Synthesis result | Flashcards/Quizzes | `StudyArtifactExportDialog.tsx` |

---

## 3. State Sources

| Store/Hook | Location | description | Usage in Knowledge |
|------------|----------|---------|-------------------|
| **useRAGStore** | `src/infrastructure/persistence/stores/rag/rag-store.ts` | RAG state management | `indexMetadata`, `indexStatus` |
| **useSynthesisStore** | `src/infrastructure/persistence/stores/synthesis-store.ts` | Synthesis results | `synthesisResults`, `generationStatus` |
| **useProjectContext** | `src/lib/workspace/ProjectContext.tsx` | Project context | `project.id` for isolation |
| **useWorkspaceProjects** | `src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts` | Filter projects by workspace | Knowledge-workspace projects |
| **useAPIKeyRetrieval** | `src/presentation/components/knowledge/hooks/useAPIKeyRetrieval.ts` | Fetch Gemini API key | Cloud embedding/synthesis |
| **Dexie DB** | `src/infrastructure/persistence/dexie-db.ts` | Persistent storage | 5 knowledge-specific tables |

### Database Tables (Knowledge-Specific)

| Table | Record Type | description | Hub Usage |
|-------|-------------|---------|-----------|
| **sources** | `SourceRecord` | Imported content (PDF/URL/Text) | Not directly (workspace detached) |
| **collections** | `CollectionRecord` | Source grouping | Not directly |
| **oramaIndexes** | `OramaIndexRecord` | Serialized search indexes | Not directly |
| **embedding_models** | `EmbeddingModelRecord` | Cached Transformers.js models | Not directly |
| **synthesisResults** | `SynthesisResultRecord` | AI synthesis outputs | Not directly |

### RAG Store Structure

```typescript
// From rag-store.ts (1,595 lines - GOD STORE CANDIDATE)
interface RAGStoreState {
  // Index management
  indexMetadata: IndexMetadata | null;
  indexStatus: 'idle' | 'indexing' | 'ready' | 'error';
  indexProgress: number;

  // Search state
  searchResults: SearchResult[];
  searchQuery: string;
  isSearching: boolean;

  // Configuration
  chunkSize: number;
  chunkOverlap: number;
  embeddingProvider: 'local' | 'cloud' | 'auto';

  // Actions
  createIndex: (projectId: string) => Promise<void>;
  deleteIndex: (projectId: string) => Promise<void>;
  indexSource: (source: SourceRecord) => Promise<void>;
  search: (query: string) => Promise<void>;
  // ... 30+ more actions
}
```

---

## 4. Database Operations

| Table | Operation | Query Pattern | Frequency |
|-------|-----------|---------------|-----------|
| **sources** | CREATE | `db.sources.put(source)` | On import |
| **sources** | READ | `db.sources.where('projectId').equals(projectId)` | On load |
| **sources** | UPDATE | `db.sources.update(id, updates)` | On metadata edit |
| **sources** | DELETE (soft) | `db.sources.update(id, { deleted: true })` | On delete |
| **collections** | CRUD | `db.collections.put()/get()/delete()` | On collection ops |
| **oramaIndexes** | CREATE | `db.oramaIndexes.put({ projectId, data: serialized })` | On index save |
| **oramaIndexes** | READ | `db.oramaIndexes.get(projectId)` | On index load |
| **synthesisResults** | CREATE/UPDATE | `db.synthesisResults.put(result)` | On synthesis |
| **embedding_models** | CREATE | `db.embedding_models.put(model)` | On model download |

### Query Patterns Analysis

```typescript
// Source queries by project (KnowledgePage.tsx:67-69)
const { projects, activeProject } = useWorkspaceProjects({
  workspaceType: 'knowledge'
});

// Get sources for project (dexie-db.ts:917-927)
export async function getSourcesForProject(
  projectId: string
): Promise<SourceRecord[]> {
  const sources = await db.sources
    .where('projectId')
    .equals(projectId)
    .sortBy('createdAt');
  return sources.reverse();
}

// Get source by ID (dexie-db.ts:891-895)
export async function getSource(sourceId: string): Promise<SourceRecord | undefined> {
  return db.sources.get(sourceId);
}

// Search sources (dexie-db.ts:974-985)
export async function searchSources(
  projectId: string,
  query: string
): Promise<SourceRecord[]> {
  const allSources = await getSourcesForProject(projectId);
  const lowerQuery = query.toLowerCase();
  return allSources.filter(source =>
    source.title.toLowerCase().includes(lowerQuery) ||
    source.content.toLowerCase().includes(lowerQuery)
  );
}
```

### Performance Concerns

1. **Full collection scan for search** (`searchSources`)
   - Loads all sources, then filters in-memory
   - No full-text search index on `sources` table
   - Could use Orama index instead

2. **No pagination on source queries**
   - `getSourcesForProject` returns ALL sources
   - Could impact performance with 100+ sources

3. **Soft delete requires filtering**
   - Every query must filter `deleted !== true`
   - Or use separate deleted queries

---

## 5. Component Operations

| Component | Operation | Complexity | Dependencies |
|-----------|-----------|------------|--------------|
| **SourceImportDialog** | Import PDF/URL/Text | Medium | PDF.js, fetch, text extraction |
| **SourceCardGrid** | Render source cards | Low | SourceCard (× N) |
| **SourceCard** | Display source metadata | Low | SourcePreviewPanel |
| **CollectionManager** | CRUD collections | Medium | db.collections |
| **CollectionSelector** | Filter by collection | Low | Collections array |
| **RAGPanelContainer** | Search interface | Medium | hybridSearch, useRAGStore |
| **IndexingProgressPanel** | Show progress | Low | indexProgress from store |
| **SynthesisDialog** | Generate synthesis | High | LLM (Gemini), embeddings |
| **FlashcardPreviewPanel** | Preview flashcards | Medium | synthesisResults |
| **QuizPreviewPanel** | Preview quizzes | Medium | synthesisResults |
| **KnowledgePage** | Main workspace | High | All above + Canvas |

### Key Operations

```typescript
// Source import with chunking and indexing (KnowledgePage.tsx)
const handleImportSource = async (source: SourceInput) => {
  // 1. Extract content based on type
  const content = await extractContent(source);

  // 2. Create source record
  const sourceId = await db.sources.add({
    ...source,
    content,
    projectId,
    createdAt: Date.now(),
  });

  // 3. Chunk content
  const chunks = DocumentChunker.chunk(content, {
    chunkSize: 512,
    chunkOverlap: 50,
  });

  // 4. Generate embeddings
  const embeddings = await embeddingService.embedBatch(
    chunks.map(c => c.text)
  );

  // 5. Index chunks
  await indexSource(projectId, sourceId, content, {
    embedding: embeddings[0].embedding,
  });

  // 6. Emit event for UI update
  eventBus.emit(DomainEventType.SOURCE_ADDED, { sourceId });
};

// Hybrid search (hybrid-retriever.ts)
const results = await hybridSearch(query, {
  limit: 10,
  mode: 'fulltext', // or 'vector' or 'hybrid'
  filters: { projectId },
});
```

---

## 6. Internal Issues Found

| Issue | Location | Severity | Description |
|-------|----------|----------|-------------|
| **PHASE 1 DETACHMENT** | `routes/knowledge*.lazy.tsx` | **Critical** | Knowledge workspace shows placeholders, not functional UI |
| **useWorkspaceAccess infinite loop** | Original implementation | **Critical** | Hook causes infinite renders, detached |
| **GOD STORE** | `rag-store.ts` (1,595 lines) | **High** | Violates 120-line limit, needs slice extraction |
| **Duplicate state** | `useRAGStore` + local state | **Medium** | Some state in both store and local |
| **No pagination** | Source queries | **Medium** | Loads all sources, no limit |
| **Soft delete filtering** | All source queries | **Low** | Must filter deleted items in-memory |
| **Search uses filter, not index** | `searchSources()` | **Low** | In-memory filter vs Orama search |
| **Console logging** | `useAPIKeyRetrieval` hook | **Low** | Debug logs in production |

### Critical Issue: Phase 1 Detachment

```typescript
// knowledge.lazy.tsx:8-17
/**
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT
 * Feature: Knowledge Workspace with useWorkspaceAccess hook
 * Reason: useWorkspaceAccess causes infinite loops / returns 'no_projects'
 * Re-attach in: Phase 2 (after P1-11 gate passes)
 * ═══════════════════════════════════════════════════════════════
 */
```

### God Store: rag-store.ts

```typescript
// 1,595 lines - violates 120-line limit by 13x
// Needs to be split into slices:
├── rag-index-slice.ts      (~120 lines) - Index operations
├── rag-search-slice.ts     (~120 lines) - Search operations
├── rag-config-slice.ts     (~120 lines) - Configuration
├── rag-progress-slice.ts   (~120 lines) - Progress tracking
└── rag-store.ts            (~200 lines) - Combined store
```

---

## 7. Dependencies on Other Features

| Dependency | Type | Direction | Knowledge Usage |
|------------|------|-----------|-----------------|
| **Project Context** | Internal | Consumer | `useProjectContext()` for projectId |
| **Workspace Projects** | Internal | Consumer | `useWorkspaceProjects({ workspaceType: 'knowledge' })` |
| **Event Bus** | Internal | Consumer/Emitter | `FILE_SAVED`, `SOURCE_ADDED` events |
| **Dexie DB** | Internal | Consumer | All persistent operations |
| **Embedding Service** | Internal | Consumer | `createEmbeddingService()` |
| **Orama Index** | Internal | Consumer | `createIndex()`, `searchIndex()` |
| **Document Chunker** | Internal | Consumer | `DocumentChunker.chunk()` |
| **LLM Provider (Gemini)** | External | Consumer | API key via `useAPIKeyRetrieval` |
| **Transformers.js** | External | Consumer | Local embeddings (WebGPU) |
| **PDF.js** | External | Consumer | PDF text extraction |
| **Canvas Component** | Internal | Lazy Consumer | `lazy(() => import('@/presentation/components/canvas/Canvas'))` |
| **Agent Manager** | Internal | Consumer | `AgentManager` for AI features |

### External Dependencies

| Dependency | Version | description | Browser Support |
|------------|---------|---------|-----------------|
| **@orama/orama** | Latest | Vector search (WASM) | Modern browsers |
| **@orama/plugin-data-persistence** | Latest | IndexedDB persistence | Modern browsers |
| **@xenova/transformers** | Latest | Local embeddings (WebGPU) | Desktop Chrome/Edge |
| **pdfjs-dist** | Latest | PDF text extraction | Modern browsers |
| **pdf-lib** | Latest | PDF manipulation | Modern browsers |

### Integration Points

```typescript
// KSI Module: Source → RAG Bridge (KnowledgePage.tsx:39-44)
import { createSourceRAGBridge } from '@/lib/knowledge/source-rag-bridge';
import { DocumentChunker } from '@/lib/rag/document-chunker';
import { createEmbeddingService } from '@/lib/rag/embedding-service';
import { createIndex } from '@/lib/rag/orama-index';
import { getOramaIndexAdapter } from '@/lib/rag/orama-index-adapter';

// Cross-workspace events (temporarily disabled - KnowledgePage.tsx:91-96)
useAllCrossWorkspaceEvents();  // Disabled 2026-01-08 - Causing infinite loop
useWorkspaceChangedEvents();   // Disabled 2026-01-08

// Canvas lazy loading (KnowledgePage.tsx:16-21)
const Canvas = lazy(() => {
  if (import.meta.env.SSR) {
    return Promise.resolve({ default: () => <></> });
  }
  return import('@/presentation/components/canvas/Canvas');
});
```

---

## 8. Summary

### Architecture Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| **Entry Points** | ⚠️ Detached | Routes exist but show placeholders |
| **Data Pipeline** | ✅ Implemented | Full RAG pipeline exists, not connected to UI |
| **Database Schema** | ✅ Complete | 5 knowledge tables defined and functional |
| **Search Engine** | ✅ Orama WASM | Full-text + vector hybrid search ready |
| **Embeddings** | ✅ Hybrid | Local (WebGPU) + Cloud (Gemini) fallback |
| **Synthesis** | ✅ Complete | Flashcards, quizzes, summaries |
| **State Management** | ⚠️ God Store | `rag-store.ts` needs slice extraction |
| **Cross-Workspace** | ⚠️ Disabled | Event subscriptions causing infinite loops |

### RAG Pipeline Completeness

| Stage | Implementation | Connected to UI |
|-------|----------------|-----------------|
| Source Import | ✅ Complete | ❌ Detached |
| Chunking | ✅ Complete | ❌ Detached |
| Embeddings | ✅ Complete | ❌ Detached |
| Indexing | ✅ Complete | ❌ Detached |
| Search | ✅ Complete | ❌ Detached |
| Chat/RAG | ✅ Complete | ❌ Detached |
| Synthesis | ✅ Complete | ❌ Detached |
| Export | ✅ Complete | ❌ Detached |

### Critical Path to Phase 2

1. **Fix useWorkspaceAccess infinite loop** - Root cause of detachment
2. **Split rag-store.ts into slices** - Reduce from 1,595 lines to <300
3. **Re-attach KnowledgePage route** - Connect full implementation
4. **Re-enable cross-workspace events** - After infinite loop fix
5. **Add pagination to source queries** - Performance optimization

### Recommendations

1. **Immediate**: Investigate `useWorkspaceAccess` hook infinite loop
2. **Short-term**: Refactor `rag-store.ts` into slices
3. **Medium-term**: Add pagination to all source/collection queries
4. **Long-term**: Implement real-time sync subscription for sources

---

*Report generated by Deep-scan module - Phase 5*
*Part of comprehensive codebase diagnostic (Phases 1-5)*

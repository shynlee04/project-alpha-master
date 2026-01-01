# Use Case Implementation Gaps Analysis

**Date**: 2026-01-02
**Phase**: 1 - Codebase Analysis & Gap Documentation
**Iteration**: 6-10

## 📊 Executive Summary

**Current State**: Knowledge Synthesis Use Cases partially implemented but not integrated
**Health Score**: 35/100 (CRITICAL)
**Priority**: P0 (Primary product value)

**Critical Finding**: The 4 Knowledge Synthesis Use Cases are scattered across workspaces with no unified workflow. Users cannot complete end-to-end knowledge synthesis journeys.

---

## 🎯 4 Knowledge Synthesis Use Cases

### Use Case Overview

| Use Case | Purpose | Current State | Completion |
|----------|---------|---------------|------------|
| **UC1: Vault Population** | Ingest sources (PDF, URL) | ⚠️ Backend works, UI incomplete | 60% |
| **UC2: Canvas Linkage** | Visual knowledge graph | ❌ Canvas exists, no linkage | 30% |
| **UC3: Conversational RAG** | Chat with sources | ⚠️ RAG works, chat isolated | 50% |
| **UC4: Knowledge Matrix** | Study artifacts | ❌ Flashcards work, no matrix | 40% |

**Overall Completion**: 45% (backend mostly works, UI integration incomplete)

---

## UC1: Vault Population (60% Complete)

### User Journey

```
1. User opens Knowledge workspace
2. User clicks "Import Source" (PDF or URL)
3. System processes document (chunk, embed, store)
4. User can preview source before ingestion
5. User can manage sources (view, delete, re-embed)
```

### ✅ What Works

**Backend Processing** (100% complete):
- ✅ PDF ingestion via `gemini-pdf-processor.ts` (Google Gemini API)
- ✅ URL ingestion via `source-import.ts` (web scraping)
- ✅ Embedding generation via `embedding-service.ts` (@xenova/transformers, WASM)
- ✅ 3 chunking strategies (fixed-size, semantic, recursive)
- ✅ Vector storage in IndexedDB via Dexie
- ✅ Source metadata tracking (title, author, date, tags)

**Evidence from Codebase**:
```typescript
// src/lib/knowledge/gemini-pdf-processor.ts
export async function processPDF(file: File): Promise<PDFSource> {
  // ✅ PDF parsing works
  // ✅ Text extraction works
  // ✅ Metadata extraction works
}

// src/lib/knowledge/source-import.ts
export async function importFromURL(url: string): Promise<Source> {
  // ✅ URL fetching works
  // ✅ HTML parsing works
  // ✅ Content extraction works
}

// src/lib/rag/embedding-service.ts
export async function generateEmbeddings(text: string): Promise<number[]> {
  // ✅ Embedding generation works (@xenova/transformers)
  // ✅ WASM execution works
}
```

### ❌ What's Missing

**UI Components** (0% complete):
1. **DocumentPreviewViewer** (P0 - 8 hours)
   - Should show PDF preview before ingestion
   - Should show URL content preview before ingestion
   - Should allow user to verify quality before processing
   - Current: SourceImportDialog exists but no preview

2. **EmbeddingVisualization** (P0 - 12 hours)
   - Should show embedding progress in real-time
   - Should show chunking strategy results
   - Should display embedding dimensions and metadata
   - Current: No visual feedback during embedding

3. **SourceManagementUI** (P1 - 16 hours)
   - Should show all sources with metadata
   - Should allow bulk operations (re-embed, delete, export)
   - Should show source quality metrics
   - Current: Basic source list in KnowledgePage.tsx

**Missing Features**:
- ❌ No source quality scoring
- ❌ No duplicate detection
- ❌ No source versioning (re-embed with new chunking strategy)
- ❌ No source tagging/search

### Integration Gaps

**Problem**: Vault population works but doesn't integrate with other workspaces

**Evidence**:
```typescript
// Sources stored in knowledge-store.ts (isolated to Knowledge workspace)
export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  sources: [], // ❌ Not accessible from IDE/Notes/Study workspaces
}));
```

**Impact**:
- User imports research paper in Knowledge workspace
- Switches to Notes workspace → Cannot reference that paper
- Switches to Study workspace → Cannot create quiz about that paper

**Solution Required**:
- Move sources to shared state (cornerstone 5)
- Implement cross-workspace file references
- Create source picker UI for all workspaces

---

## UC2: Canvas Linkage (30% Complete)

### User Journey

```
1. User populates vault (UC1)
2. User opens canvas in Knowledge workspace
3. System suggests linkages between sources
4. User accepts/rejects linkages
5. Knowledge graph updates automatically
6. User can manually add connections
```

### ✅ What Works

**Canvas Backend** (80% complete):
- ✅ Canvas rendering via `@xyflow/react`
- ✅ Node/block system works (knowledge graph blocks)
- ✅ Basic canvas UI exists (Canvas.tsx)

**Knowledge Graph Backend** (70% complete):
- ✅ Graph CRUD operations via `graph/crud.ts`
- ✅ Graph queries via `graph/queries.ts`
- ✅ Graph traversal via `graph/traversal.ts`
- ✅ Graph persistence in IndexedDB

**Evidence from Codebase**:
```typescript
// src/lib/knowledge/graph/crud.ts
export async function createNode(node: GraphNode): Promise<void> {
  // ✅ Node creation works
}

export async function createEdge(from: string, to: string): Promise<void> {
  // ✅ Edge creation works
}

// src/presentation/components/canvas/Canvas.tsx
export function Canvas() {
  // ✅ Canvas rendering works
  // ✅ Node dragging works
  // ✅ Basic interactions work
}
```

### ❌ What's Missing

**Linkage Proposal System** (0% complete):
1. **AI Linkage Proposals** (P0 - 20 hours)
   - System should suggest connections between sources
   - Should use embedding similarity to find related content
   - Should propose linkages with confidence scores
   - Current: No AI proposals, only manual connections

2. **LinkageProposalUI** (P0 - 12 hours)
   - Should show proposed linkages in sidebar
   - Should allow user to accept/reject proposals
   - Should show reasoning for each proposal
   - Current: No proposal UI exists

3. **Canvas Integration** (P1 - 16 hours)
   - Should be able to drag sources from vault to canvas
   - Should be able to create nodes from sources
   - Should auto-layout graph based on linkages
   - Current: Manual node creation only

**Missing Features**:
- ❌ No automatic linkage detection
- ❌ No semantic similarity matching between sources
- ❌ No confidence scoring for linkages
- ❌ No graph visualization of linkages
- ❌ No linkage export/import

### Integration Gaps

**Problem**: Canvas and knowledge graph not integrated with other workspaces

**Evidence**:
```typescript
// Graph stored in knowledge-store.ts (isolated to Knowledge workspace)
export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  graphs: [], // ❌ Not accessible from IDE/Notes/Study workspaces
}));
```

**Impact**:
- User builds knowledge graph in Knowledge workspace
- Switches to Notes workspace → Cannot see graph
- Switches to Study workspace → Cannot quiz based on graph

**Solution Required**:
- Move graphs to shared state (cornerstone 5)
- Implement graph visualization across workspaces
- Create graph-based quiz generation

---

## UC3: Conversational RAG (50% Complete)

### User Journey

```
1. User populates vault (UC1)
2. User opens chat in any workspace
3. User asks question about sources
4. System retrieves relevant chunks
5. AI generates answer with citations
6. User can view source context
```

### ✅ What Works

**RAG Backend** (80% complete):
- ✅ Vector search via `rag/search.ts`
- ✅ Chunk retrieval via `rag/retrieval.ts`
- ✅ Re-ranking via `rag/reranking.ts`
- ✅ Citation generation via `rag/citations.ts`

**Chat Backend** (80% complete):
- ✅ Chat streaming via TanStack AI
- ✅ Agent tool execution
- ✅ Message persistence

**Evidence from Codebase**:
```typescript
// src/lib/rag/search.ts
export async function search(query: string, k: number = 5): Promise<Chunk[]> {
  // ✅ Vector search works
  // ✅ Similarity scoring works
}

// src/lib/rag/retrieval.ts
export async function retrieveChunks(query: string): Promise<Chunk[]> {
  // ✅ Chunk retrieval works
}

// src/lib/rag/citations.ts
export function generateCitation(chunk: Chunk): Citation {
  // ✅ Citation generation works
}
```

### ❌ What's Missing

**RAG Chat Integration** (20% complete):
1. **RAG-Enabled Chat Panel** (P0 - 16 hours)
   - Should have "Chat with Sources" mode in all workspaces
   - Should show citations in chat messages
   - Should allow user to view source context
   - Current: Chat works but no RAG mode toggle

2. **CitationUI** (P0 - 12 hours)
   - Should show clickable citations in chat
   - Should show source preview on citation click
   - Should highlight relevant chunks
   - Current: Citations exist but no UI

3. **Source Context Viewer** (P1 - 8 hours)
   - Should show full source context for citation
   - Should allow jumping to source document
   - Should show chunk metadata
   - Current: No context viewer

**Missing Features**:
- ❌ No RAG mode toggle in chat panels
- ❌ No citation UI in chat messages
- ❌ No source context viewer
- ❌ No multi-source queries (query across multiple sources)
- ❌ No query history/save

### Integration Gaps

**Problem**: RAG is isolated to Knowledge workspace

**Evidence**:
```typescript
// RAG search only available in Knowledge workspace
// src/lib/rag/search.ts - Not exposed to other workspaces

// Chat panels in other workspaces don't have RAG integration
// src/presentation/components/chat/ChatPanel.tsx - No RAG mode
// src/presentation/components/notes/NoteEditor.tsx - No RAG mode
// src/presentation/components/study/QuizContainer.tsx - No RAG mode
```

**Impact**:
- User imports research papers in Knowledge workspace
- Switches to IDE workspace → Cannot ask questions about papers while coding
- Switches to Notes workspace → Cannot chat with sources while taking notes
- Switches to Study workspace → Cannot query sources while studying

**Solution Required**:
- Add RAG mode toggle to all chat panels
- Implement source picker for RAG queries
- Create citation UI that works across workspaces

---

## UC4: Knowledge Matrix (40% Complete)

### User Journey

```
1. User populates vault (UC1) and builds linkages (UC2)
2. User opens Study workspace
3. System generates study artifacts (flashcards, quizzes)
4. User studies with spaced repetition
5. System tracks progress and adapts
```

### ✅ What Works

**Flashcard Backend** (80% complete):
- ✅ Flashcard generation via `flashcard-generation.ts`
- ✅ Flashcard storage via Dexie
- ✅ Spaced repetition algorithm via `srs-types.ts`

**Quiz Backend** (70% complete):
- ✅ Quiz generation via `quiz-generation.ts`
- ✅ Quiz storage via Dexie
- ✅ Quiz session management via `quiz-session.ts`

**Evidence from Codebase**:
```typescript
// src/lib/knowledge/flashcard-generation.ts
export async function generateFlashcards(source: Source): Promise<Flashcard[]> {
  // ✅ Flashcard generation works
  // ✅ Question/answer pairs generated
}

// src/lib/study/quiz-generation.ts
export async function generateQuiz(source: Source): Promise<Quiz> {
  // ✅ Quiz generation works
  // ✅ Multiple choice questions generated
}

// src/lib/study/srs-types.ts
export function calculateNextReview(card: Flashcard): Date {
  // ✅ Spaced repetition algorithm works
}
```

### ❌ What's Missing

**Knowledge Matrix UI** (0% complete):
1. **KnowledgeMatrixDashboard** (P0 - 20 hours)
   - Should show all sources with study progress
   - Should allow generating study artifacts for any source
   - Should show knowledge graph with study nodes
   - Current: No unified dashboard

2. **ArtifactGenerationUI** (P0 - 12 hours)
   - Should allow bulk flashcard generation
   - Should allow bulk quiz generation
   - Should show generation progress
   - Current: Manual generation only

3. **ProgressTrackingDashboard** (P1 - 16 hours)
   - Should show study streaks and statistics
   - Should show mastery levels per source
   - Should show weak areas to focus on
   - Current: Basic progress tracking only

**Missing Features**:
- ❌ No knowledge matrix visualization
- ❌ No cross-source study plans
- ❌ No adaptive learning (adjust difficulty based on performance)
- ❌ No study reminders
- ❌ No study analytics

### Integration Gaps

**Problem**: Study artifacts not integrated with other workspaces

**Evidence**:
```typescript
// Flashcards and quizzes stored in separate stores
// src/lib/state/flashcards-store.ts - Isolated to Study workspace
// src/lib/state/quizzes-store.ts - Isolated to Study workspace

// Not accessible from other workspaces
// IDE workspace: Cannot quiz while coding
// Notes workspace: Cannot generate flashcards from notes
// Knowledge workspace: Cannot track study progress
```

**Impact**:
- User creates notes in Notes workspace
- Cannot generate flashcards from those notes
- Cannot quiz on those notes
- Study progress disconnected from note-taking

**Solution Required**:
- Move flashcards/quizzes to shared state
- Implement cross-workspace study artifact generation
- Create study progress tracker across workspaces

---

## 📋 Cross-Use Case Integration Matrix

### Current State (Fragmented)

| Use Case | UC1: Vault | UC2: Canvas | UC3: RAG | UC4: Matrix |
|----------|-----------|-------------|----------|-------------|
| **UC1: Vault** | ✅ Complete | ❌ No linkage | ⚠️ Partial | ⚠️ Partial |
| **UC2: Canvas** | ❌ No drag-drop | ✅ Complete | ❌ No RAG | ❌ No study |
| **UC3: RAG** | ⚠️ Sources work | ❌ No graph | ✅ Complete | ❌ No quiz |
| **UC4: Matrix** | ⚠️ Gen works | ❌ No graph | ❌ No chat | ✅ Complete |

**Legend**: ✅ Complete | ⚠️ Partial | ❌ Missing

### Target State (Unified)

| Use Case | UC1: Vault | UC2: Canvas | UC3: RAG | UC4: Matrix |
|----------|-----------|-------------|----------|-------------|
| **UC1: Vault** | ✅ Complete | ✅ Drag to canvas | ✅ Chat with sources | ✅ Generate artifacts |
| **UC2: Canvas** | ✅ Drag sources | ✅ Complete | ✅ RAG on graph | ✅ Study graph |
| **UC3: RAG** | ✅ Source picker | ✅ Graph-aware | ✅ Complete | ✅ Quiz from RAG |
| **UC4: Matrix** | ✅ All sources | ✅ Graph-based | ✅ Chat to study | ✅ Complete |

---

## 🎯 Implementation Priorities

### Phase 5: Use Case Implementation (Iterations 251-400)

#### P0 Gaps (Must Fix First)

**UC1: Vault Population** (28 hours)
1. DocumentPreviewViewer (8 hours)
2. EmbeddingVisualization (12 hours)
3. SourceManagementUI (8 hours)

**UC2: Canvas Linkage** (48 hours)
1. AI Linkage Proposals (20 hours)
2. LinkageProposalUI (12 hours)
3. Canvas Integration (16 hours)

**UC3: Conversational RAG** (36 hours)
1. RAG-Enabled Chat Panel (16 hours)
2. CitationUI (12 hours)
3. Source Context Viewer (8 hours)

**UC4: Knowledge Matrix** (48 hours)
1. KnowledgeMatrixDashboard (20 hours)
2. ArtifactGenerationUI (12 hours)
3. ProgressTrackingDashboard (16 hours)

**Cross-Use Case Integration** (40 hours)
1. Implement cross-use-case data flows
2. Create unified use case orchestration service
3. Integrate all 4 use cases end-to-end

**Total Estimated Time**: 200 hours

---

## 📁 Key Files

### Vault Population (UC1)
- `src/lib/knowledge/gemini-pdf-processor.ts` (PDF processing)
- `src/lib/knowledge/source-import.ts` (URL processing)
- `src/lib/rag/embedding-service.ts` (embeddings)
- `src/lib/rag/chunk-strategies/` (3 chunking strategies)
- `src/presentation/components/knowledge/SourceImportDialog.tsx` (import UI)

### Canvas Linkage (UC2)
- `src/lib/knowledge/graph/crud.ts` (graph operations)
- `src/lib/knowledge/graph/queries.ts` (graph queries)
- `src/lib/knowledge/graph/traversal.ts` (graph traversal)
- `src/presentation/components/canvas/Canvas.tsx` (canvas UI)
- `src/lib/canvas/linkage-analyzer.ts` (linkage detection)

### Conversational RAG (UC3)
- `src/lib/rag/search.ts` (vector search)
- `src/lib/rag/retrieval.ts` (chunk retrieval)
- `src/lib/rag/citations.ts` (citation generation)
- `src/presentation/components/chat/ChatPanel.tsx` (chat UI)
- `src/presentation/components/rag/CitationSidebar.tsx` (citation UI)

### Knowledge Matrix (UC4)
- `src/lib/knowledge/flashcard-generation.ts` (flashcard generation)
- `src/lib/study/quiz-generation.ts` (quiz generation)
- `src/lib/study/srs-types.ts` (spaced repetition)
- `src/presentation/components/study/QuizContainer.tsx` (quiz UI)
- `src/presentation/components/study/FlashcardList.tsx` (flashcard UI)

---

## ✅ Completion: 35%

**Completed**:
- ✅ Backend processing for all 4 use cases (80% average)
- ✅ Basic UI for all 4 use cases (30% average)
- ✅ Individual use case logic works in isolation

**Missing**:
- ❌ Cross-use case integration (0%)
- ❌ UI polish and user experience (30%)
- ❌ Cross-workspace integration (0%)
- ❌ End-to-end user journeys (0%)

**Next Steps**:
- Phase 3: Implement missing UI components for each use case (60 hours)
- Phase 4: Integrate use cases across workspaces (40 hours)
- Phase 5: Implement cross-use case orchestration (40 hours)

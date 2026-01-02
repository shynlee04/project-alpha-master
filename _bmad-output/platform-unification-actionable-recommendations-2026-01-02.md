# Platform Unification - Actionable Recommendations
**Date**: 2026-01-02
**Iteration**: 464 → 500
**Agent**: BMAD Master (Orchestrator)

---

## Executive Summary

**Assessment**: Codebase exploration complete, Platform Unification ready for systematic implementation

**Critical Findings**:
1. Store Duplication Crisis: 135 stores across 3 locations (70% redundant)
2. God Components: 16 files exceed 300-line limit (worst: 1,595 lines)
3. Use Case Gaps: 3/4 critical user journeys need UI implementation
4. TypeScript Debt: 1,172 errors remaining (91% reduction needed)

**Recommended Path**: 8-week phased approach with clear success metrics

---

## Immediate Actions (This Week)

### Priority 1: Complete Cornerstone Analysis (8-10 hours)

**Cornerstone 3: Conversation System** (2-3 hours)
```
Deliverable: cornerstone-3-conversation-analysis.md
Tasks:
├── Map all conversation data flows
├── Identify duplicate stores (7 locations)
├── Consolidate to single modern store
├── Update all components to use consolidated store
└── Document migration path
```

**Cornerstone 4: Project Management** (2-3 hours)
```
Deliverable: cornerstone-4-project-analysis.md
Tasks:
├── Analyze WebContainer integration points
├── Identify duplicate IDE stores (4 locations)
├── Map file system sync architecture
├── Identify missing project dashboard components
└── Document consolidation plan
```

**Cornerstone 5: RAG Pipeline** (3-4 hours)
```
Deliverable: cornerstone-5-rag-pipeline-analysis.md
Tasks:
├── Map RAG data flow (ingestion → chunking → embedding → retrieval)
├── Identify duplicate RAG stores (3 locations)
├── Analyze god store: rag-store.ts (1,595 lines)
├── Design split into 5 focused slices
└── Document Synthesis UI requirements
```

**Acceptance Criteria**:
- [ ] All 5 cornerstones analyzed and documented
- [ ] Consolidation roadmap defined
- [ ] Store migration path validated
- [ ] Missing UI components catalogued

---

### Priority 2: UC1 Synthesis UI (8-12 hours)

**User Value**: Enable flashcard/quiz generation from knowledge sources

**Components to Build**:

1. **SynthesisDialog.tsx** (≤120 lines, 2-3 hours)
```typescript
Features:
├── Select collection/sources
├── Choose artifact type (flashcards/quiz)
├── Configure synthesis parameters
├── Show progress indicator
└── Handle synthesis completion

State:
├── useSynthesisStore (synthesis state)
├── useKnowledgeStore (collection/sources)
└── useFlashcardStore / useQuizStore (artifact storage)

Events:
├── onSynthesisStart
├── onSynthesisProgress
└── onSynthesisComplete (trigger preview panel)
```

2. **FlashcardPreviewPanel.tsx** (≤120 lines, 2-3 hours)
```typescript
Features:
├── Preview generated flashcards
├── Edit flashcards before save
├── Bulk import to FlashcardStore
├── Export to CSV/Anki format
└── Discard / Save actions

State:
├── useSynthesisStore (generated flashcards)
└── useFlashcardStore (final storage)
```

3. **QuizPreviewPanel.tsx** (≤120 lines, 2-3 hours)
```typescript
Features:
├── Preview generated quiz questions
├── Edit questions before save
├── Bulk import to QuizStore
├── Export to JSON/CSV format
└── Discard / Save actions

State:
├── useSynthesisStore (generated quiz)
└── useQuizStore (final storage)
```

4. **StudyArtifactExportDialog.tsx** (≤100 lines, 2-3 hours)
```typescript
Features:
├── Select export format (CSV/JSON/Anki)
├── Configure export options
├── Preview export data
└── Download file

State:
├── useFlashcardStore / useQuizStore (artifact data)
└── Local state for export configuration
```

**Integration Points**:
```typescript
// In KnowledgePage.tsx
import { SynthesisDialog } from './components/knowledge/SynthesisDialog'
import { FlashcardPreviewPanel } from './components/knowledge/FlashcardPreviewPanel'
import { QuizPreviewPanel } from './components/knowledge/QuizPreviewPanel'

// Trigger synthesis from collection toolbar
<Button onClick={() => setShowSynthesisDialog(true)}>
  Generate Study Materials
</Button>
```

**Acceptance Criteria**:
- [ ] Users can generate flashcards from collections
- [ ] Users can generate quizzes from collections
- [ ] Users can preview and edit artifacts before saving
- [ ] Users can export artifacts to CSV/Anki/JSON formats
- [ ] Progress indicators show synthesis status
- [ ] Error handling for failed synthesis

---

### Priority 3: UC2 Canvas-RAG Linkage (6-8 hours)

**User Value**: Link canvas nodes to RAG sources for semantic connections

**Components to Build**:

1. **CanvasRAGLinkagePanel.tsx** (≤120 lines, 2-3 hours)
```typescript
Features:
├── Select canvas node
├── Search RAG sources
├── Link source to node
├── Store linkage in node metadata
└── Visualize existing linkages

State:
├── useCanvasStore (selected node, canvas state)
├── useKnowledgeStore (sources)
└── useRAGStore (indexed sources)

Events:
├── onNodeSelect
├── onSourceSelect
├── onLinkageCreate
└── onLinkageDelete
```

2. **NodeSourcePicker.tsx** (≤100 lines, 2 hours)
```typescript
Features:
├── Search sources by name/content
├── Multi-select support
├── Source preview on hover
└── Source metadata display

State:
├── useKnowledgeStore (sources)
├── Local search query state
└── Selected sources state
```

3. **LinkageVisualization.tsx** (≤120 lines, 2-3 hours)
```typescript
Features:
├── Display node-source links on canvas
├── Color-coded linkage strength
├── Hover to show linked sources
└── Click to navigate to source

State:
├── useCanvasStore (node metadata)
└── useKnowledgeStore (source data)
```

**Integration Points**:
```typescript
// In Canvas.tsx
import { CanvasRAGLinkagePanel } from './components/canvas/CanvasRAGLinkagePanel'
import { LinkageVisualization } from './components/canvas/LinkageVisualization'

// Add linkage button to node toolbar
{selectedNode && (
  <Button onClick={() => setShowLinkagePanel(true)}>
    Link to Sources
  </Button>
)}

// Render linkages on canvas
<Node>
  <NodeContent />
  <LinkageVisualization nodeId={node.id} />
</Node>
```

**Data Model**:
```typescript
// Extend CanvasNode type
interface CanvasNodeWithLinkages extends CanvasNode {
  metadata: {
    ragSourceIds: string[]  // Linked source IDs
    linkageStrength: number // 0-1 score
  }
}

// Store linkage in canvas metadata
const updateNodeLinkages = (nodeId: string, sourceIds: string[]) => {
  const node = canvasStore.nodes.find(n => n.id === nodeId)
  node.metadata = {
    ...node.metadata,
    ragSourceIds: sourceIds,
    linkageStrength: calculateLinkageStrength(sourceIds)
  }
  canvasStore.updateNode(node)
}
```

**Acceptance Criteria**:
- [ ] Users can link canvas nodes to RAG sources
- [ ] Linkages are visualized on canvas
- [ ] Users can search and select sources
- [ ] Linkage strength is calculated and displayed
- [ ] Linkages persist in node metadata

---

## Short-Term Priorities (Week 3-4)

### Priority 4: UC3 Citation UI (6-8 hours)

**User Value**: RAG chat responses cite sources with attribution

**Components to Build**:

1. **CitationSidebar.tsx** (≤120 lines, 2-3 hours)
```typescript
Features:
├── Display citations alongside RAG responses
├── Click to jump to source
├── Show citation metadata (page, snippet)
└── Collapsible sidebar

State:
├── Local citation data (from RAG response)
└── Expanded/collapsed state
```

2. **SourceReferenceCard.tsx** (≤80 lines, 2 hours)
```typescript
Features:
├── Compact source card
├── Source title, page number, snippet
├── Link to full source
└── Confidence score
```

3. **AttributionPanel.tsx** (≤100 lines, 2-3 hours)
```typescript
Features:
├── Summary of all cited sources
├── Confidence scores
├── Relevance indicators
└── Source attribution
```

**Integration**:
```typescript
// In RAGChatPanel.tsx
import { CitationSidebar } from './components/rag/CitationSidebar'

// Parse citations from RAG response
const citations = parseCitations(ragResponse)

// Render citations sidebar
<CitationSidebar citations={citations} />
```

---

### Priority 5: UC4 Knowledge Dashboard (10-12 hours)

**User Value**: Dashboard to visualize knowledge base state and operations

**Components to Build**:

1. **KnowledgeMatrixDashboard.tsx** (≤150 lines, 3-4 hours)
```typescript
Features:
├── Aggregate activity indicators
├── Knowledge base statistics
│   ├── Total sources
│   ├── Total chunks
│   ├── Total embeddings
│   └── Indexing progress
├── Quick actions
│   ├── Import source
│   ├── Re-index all
│   └── Search knowledge base
└── Recent activity feed

State:
├── useKnowledgeStore (knowledge stats)
├── useRAGStore (indexing progress)
└── Activity indicator states
```

2. **EmbeddingVisualization.tsx** (≤120 lines, 3-4 hours)
```typescript
Features:
├── 2D/3D vector space visualization
├── Cluster display (t-SNE/UMAP)
├── Source proximity indicators
└── Interactive exploration

State:
├── useRAGStore (embedding vectors)
└── Visualization settings
```

3. **KnowledgeGraphVisualization.tsx** (≤120 lines, 3-4 hours)
```typescript
Features:
├── Entity relationship graph
├── Concept clustering
├── Knowledge domain mapping
└── Interactive exploration

State:
├── useKnowledgeStore (knowledge graph data)
└── Visualization settings
```

**Integration**:
```typescript
// In KnowledgePage.tsx
import { KnowledgeMatrixDashboard } from './components/knowledge/KnowledgeMatrixDashboard'

// Add dashboard tab
<Tabs>
  <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
  <Tabs.Tab value="collections">Collections</Tabs.Tab>
  <Tabs.Tab value="sources">Sources</Tabs.Tab>
</Tabs>
```

---

### Priority 6: Store Consolidation Phase 2 (9-12 hours)

**Objective**: Delete deprecated stores, migrate legacy stores

**Step 1: Delete Deprecated Stores** (2 hours)
```bash
# Delete all files in src/stores/
rm src/stores/*.ts

# Expected deletions: 19 files
├── agent-config-store.ts
├── agent-provider-coordinator.ts
├── agent-selection-store.ts
├── agent-selection.ts
├── agents-store.ts
├── agents.ts
├── auto-approve-store.ts
├── chatflow-store.ts
├── computed-agent-store.ts
├── context-manager.ts
├── conversation-store.ts
├── conversation-threads-store.ts
├── index.ts
├── models-loader-store.ts
├── models-store.ts
├── openai-compatible-store.ts
├── orchestrated-agent-store.ts
├── pedagogical-store.ts
└── ...
```

**Step 2: Migrate Legacy Stores** (6-8 hours)
```bash
# For each store in src/lib/state/:
# 1. Check if duplicate exists in infrastructure/persistence/stores/
# 2. If duplicate exists, delete lib/state version
# 3. If no duplicate, migrate to infrastructure/persistence/stores/

# Example migration:
# src/lib/state/agent-store.ts → DELETE (exists in infrastructure/)
# src/lib/state/notes-store.ts → MIGRATE (unique to lib/state/)

# Expected migrations: ~40 files
```

**Step 3: Update Imports** (2-3 hours)
```bash
# Find all imports of deleted stores
grep -r "from '@/stores/" src/ --include="*.ts" --include="*.tsx"
grep -r "from '@/lib/state/" src/ --include="*.ts" --include="*.tsx"

# Update imports to new location
# from: import { useAgentsStore } from '@/stores/agents-store'
# to:   import { useAgentsStore } from '@/infrastructure/persistence/stores/use-app-store'

# Expected updates: ~200 import statements
```

**Acceptance Criteria**:
- [ ] All files in `src/stores/` deleted
- [ ] All unique stores from `src/lib/state/` migrated to `infrastructure/persistence/stores/`
- [ ] All imports updated to new locations
- [ ] Zero TypeScript errors from store migration
- [ ] All tests pass after migration

---

## Medium-Term Priorities (Week 5-8)

### Priority 7: Store Consolidation Phase 3 (20-25 hours)

**Objective**: Split god stores into focused slices

**Target 1: Split rag-store.ts** (8-10 hours)
```typescript
// Current: src/lib/state/rag-store.ts (1,595 lines)
// Target: Split into 5 focused slices

// 1. rag-chunking-slice.ts (≤200 lines)
export interface RAGChunkingState {
  chunks: Chunk[]
  chunkingStatus: 'idle' | 'processing' | 'complete' | 'error'
  chunkingStrategy: 'semantic' | 'fixed' | 'recursive'
}

export const createRAGChunkingSlice = (set: StateCreator<RAGState>) => ({
  chunks: [],
  chunkingStatus: 'idle',
  chunkingStrategy: 'semantic',

  addChunk: (chunk: Chunk) => set((state) => ({
    chunks: [...state.chunks, chunk]
  })),

  clearChunks: () => set({ chunks: [] }),

  // Chunking operations only
})

// 2. rag-embedding-slice.ts (≤200 lines)
export interface RAGEmbeddingState {
  embeddings: Embedding[]
  embeddingStatus: 'idle' | 'processing' | 'complete' | 'error'
  embeddingModel: string
}

export const createRAGEmbeddingSlice = (set: StateCreator<RAGState>) => ({
  embeddings: [],
  embeddingStatus: 'idle',
  embeddingModel: 'all-MiniLM-L6-v2',

  addEmbedding: (embedding: Embedding) => set((state) => ({
    embeddings: [...state.embeddings, embedding]
  })),

  // Embedding operations only
})

// 3. rag-retrieval-slice.ts (≤200 lines)
export interface RAGRetrievalState {
  retrievalResults: RetrievalResult[]
  retrievalStatus: 'idle' | 'processing' | 'complete' | 'error'
  retrievalStrategy: 'semantic' | 'hybrid'
}

export const createRAGRetrievalSlice = (set: StateCreator<RAGState>) => ({
  retrievalResults: [],
  retrievalStatus: 'idle',
  retrievalStrategy: 'semantic',

  retrieve: async (query: string, topK: number) => {
    // Retrieval operations only
  },
})

// 4. rag-indexing-slice.ts (≤200 lines)
export interface RAGIndexingState {
  indexStatus: 'idle' | 'indexing' | 'complete' | 'error'
  indexedSources: Set<string>
  indexingProgress: number
}

export const createRAGIndexingSlice = (set: StateCreator<RAGState>) => ({
  indexStatus: 'idle',
  indexedSources: new Set(),
  indexingProgress: 0,

  indexSource: async (sourceId: string) => {
    // Indexing operations only
  },
})

// 5. rag-types.ts (≤200 lines)
export type Chunk = {
  id: string
  sourceId: string
  content: string
  metadata: ChunkMetadata
}

export type Embedding = {
  id: string
  chunkId: string
  vector: number[]
  model: string
}

// Type definitions only
```

**Target 2: Split conversation-threads-store.ts** (5-6 hours)
```typescript
// Current: src/stores/conversation-threads-store.ts (726 lines)
// Target: Split into 3 focused slices

// 1. conversation-threads-slice.ts (≤200 lines)
export interface ConversationThreadsState {
  threads: Thread[]
  activeThreadId: string | null
}

export const createConversationThreadsSlice = (set: StateCreator<ConversationState>) => ({
  threads: [],
  activeThreadId: null,

  createThread: (thread: Omit<Thread, 'id'>) => { /* ... */ },
  updateThread: (id: string, updates: Partial<Thread>) => { /* ... */ },
  deleteThread: (id: string) => { /* ... */ },
  setActiveThread: (id: string) => { /* ... */ },
})

// 2. conversation-messages-slice.ts (≤200 lines)
export interface ConversationMessagesState {
  messagesByThreadId: Record<string, Message[]>
}

export const createConversationMessagesSlice = (set: StateCreator<ConversationState>) => ({
  messagesByThreadId: {},

  addMessage: (threadId: string, message: Message) => { /* ... */ },
  updateMessage: (threadId: string, messageId: string, updates: Partial<Message>) => { /* ... */ },
  deleteMessage: (threadId: string, messageId: string) => { /* ... */ },
})

// 3. conversation-metadata-slice.ts (≤200 lines)
export interface ConversationMetadataState {
  metadataByThreadId: Record<string, ThreadMetadata>
}

export const createConversationMetadataSlice = (set: StateCreator<ConversationState>) => ({
  metadataByThreadId: {},

  updateMetadata: (threadId: string, metadata: Partial<ThreadMetadata>) => { /* ... */ },
})
```

**Target 3: Split other god stores** (7-9 hours)
```
Stores to split:
├── ide-store.ts (split into editor, panels, terminal slices)
├── knowledge-store.ts (split into collections, sources, metadata slices)
├── study-store.ts (split into quizzes, flashcards, sessions slices)
└── agent-selection-store.ts (split into selection, binding slices)
```

**Acceptance Criteria**:
- [ ] All god stores split into focused slices
- [ ] Each slice ≤200 lines
- [ ] Each slice has single responsibility
- [ ] Zero TypeScript errors from split
- [ ] All tests pass after split

---

### Priority 8: AgentConfigDialog Refactoring (16-20 hours)

**Objective**: Extract hooks from god component (1,089 → ~200 lines)

**Current Structure**:
```typescript
// AgentConfigDialog.tsx (1,089 lines) ❌
export function AgentConfigDialog() {
  // 1,089 lines of component logic
}
```

**Target Structure**:
```typescript
// AgentConfigDialog.tsx (~200 lines) ✅
export function AgentConfigDialog() {
  const agentForm = useAgentFormState()     // Custom hook
  const providerConfig = useProviderConfig() // Custom hook
  const workspaceBindings = useWorkspaceBindings() // Custom hook

  return (
    <Dialog>
      <AgentBasicInfoTab {...agentForm} />
      <AgentProviderSelector {...providerConfig} />
      <WorkspaceBindingsConfig {...workspaceBindings} />
    </Dialog>
  )
}

// hooks/useAgentFormState.ts (≤120 lines)
export function useAgentFormState(agent?: Agent) {
  const [name, setName] = useState(agent?.name || '')
  const [description, setDescription] = useState(agent?.description || '')
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt || '')

  const validationErrors = useMemo(() =>
    validateAgentForm({ name, description, systemPrompt }),
  [name, description, systemPrompt])

  return {
    name, setName,
    description, setDescription,
    systemPrompt, setSystemPrompt,
    validationErrors,
    isValid: Object.keys(validationErrors).length === 0,
  }
}

// hooks/useProviderConfig.ts (≤120 lines)
export function useProviderConfig(agent?: Agent) {
  const providers = useAppStore(s => s.providers)
  const models = useAppStore(s => s.models)

  const [providerId, setProviderId] = useState(agent?.providerId || '')
  const [modelId, setModelId] = useState(agent?.modelId || '')

  const selectedProvider = providers.find(p => p.id === providerId)
  const availableModels = selectedProvider
    ? models.filter(m => m.providerId === providerId)
    : []

  return {
    providerId, setProviderId,
    modelId, setModelId,
    selectedProvider,
    availableModels,
  }
}

// hooks/useWorkspaceBindings.ts (≤120 lines)
export function useWorkspaceBindings(agent?: Agent) {
  const [workspaceBindings, setWorkspaceBindings] = useState(
    agent?.workspaceBindings || DEFAULT_WORKSPACE_BINDINGS
  )

  const updateBinding = (workspaceType: WorkspaceType, binding: WorkspaceBinding) => {
    setWorkspaceBindings(prev => ({
      ...prev,
      [workspaceType]: binding,
    }))
  }

  return {
    workspaceBindings,
    updateBinding,
  }
}
```

**Refactoring Steps**:
1. Extract `useAgentFormState` hook (3-4 hours)
2. Extract `useProviderConfig` hook (3-4 hours)
3. Extract `useWorkspaceBindings` hook (3-4 hours)
4. Extract `useAgentActions` hook (3-4 hours)
5. Update component to use hooks (2-3 hours)
6. Add tests for all hooks (3-4 hours)

**Acceptance Criteria**:
- [ ] AgentConfigDialog ≤200 lines
- [ ] All hooks ≤120 lines
- [ ] Hooks tested separately
- [ ] Zero breaking changes
- [ ] All tests pass

---

## Success Metrics

### Codebase Health Targets (by Iteration 500)

**Store Consolidation**:
- Before: 135 stores across 3 locations
- After: 40 stores in single location
- Reduction: 70%

**God Component Elimination**:
- Before: 16 files >300 lines
- After: 4 files >300 lines (acceptable for utilities)
- Reduction: 75%

**TypeScript Error Remediation**:
- Before: 1,172 errors (306 production + 866 test)
- After: <100 errors
- Reduction: 91%

**Component Quality**:
- Before: Multiple files >120 lines
- After: All components ≤120 lines (except 4 utility files)
- Compliance: 100%

### Feature Completion Targets

**Cornerstone Analysis**:
- Before: 2/5 cornerstones analyzed
- After: 5/5 cornerstones analyzed
- Completion: 100%

**Use Case Implementation**:
- Before: 0/4 use cases have UI
- After: 4/4 use cases have UI
- Completion: 100%

**Store Consolidation**:
- Before: 135 stores (70% redundant)
- After: 40 stores (0% redundant)
- Completion: 100%

---

## Risk Mitigation

### Risk 1: Store Migration Breaks Existing Code

**Mitigation**:
1. Incremental migration (one store at a time)
2. Automated import path validation
3. Comprehensive test suite
4. Rollback plan for each migration

### Risk 2: God Component Splitting Introduces Bugs

**Mitigation**:
1. Extract hooks incrementally
2. Maintain API compatibility
3. Add tests for each extracted hook
4. Component integration tests

### Risk 3: TypeScript Error Remediation Overwhelms

**Mitigation**:
1. Prioritize production errors over test errors
2. Focus on high-impact fixes first
3. Use automated fixing tools (ESLint --fix)
4. Batch similar fixes together

---

## Next Actions

### This Week (Iteration 464-470)

**BMAD Master (Orchestrator)**:
1. ✅ Complete codebase exploration (DONE)
2. ⏳ Delegate Cornerstone 3 analysis to @bmad-bmm-analyst
3. ⏳ Delegate Cornerstone 4 analysis to @bmad-bmm-architect
4. ⏳ Delegate Cornerstone 5 analysis to @bmad-bmm-architect
5. ⏳ Delegate UC1 Synthesis UI to @bmad-bmm-dev

**Handoff Instructions**:
```
To: @bmad-bmm-analyst
Task: Complete Cornerstone 3 (Conversation System) analysis
Context: See comprehensive analysis document
Output: _bmad-output/research/platform-unification-2026-01-02/cornerstone-3-conversation-analysis.md
Acceptance: Map all conversation data flows, identify duplicates, consolidation plan
Timeline: 2-3 hours

To: @bmad-bmm-architect
Task: Complete Cornerstone 4 (Project Management) analysis
Context: See comprehensive analysis document
Output: _bmad-output/research/platform-unification-2026-01-02/cornerstone-4-project-analysis.md
Acceptance: Analyze WebContainer integration, map FS sync, identify gaps
Timeline: 2-3 hours

To: @bmad-bmm-architect
Task: Complete Cornerstone 5 (RAG Pipeline) analysis
Context: See comprehensive analysis document
Output: _bmad-output/research/platform-unification-2026-01-02/cornerstone-5-rag-pipeline-analysis.md
Acceptance: Map RAG data flow, analyze god store, design split
Timeline: 3-4 hours

To: @bmad-bmm-dev
Task: Implement UC1 Synthesis UI
Context: See comprehensive analysis document, use synthesis-service.ts
Output: 4 new components (SynthesisDialog, FlashcardPreviewPanel, QuizPreviewPanel, StudyArtifactExportDialog)
Acceptance: Users can generate/edit/export flashcards and quizzes
Timeline: 8-12 hours
```

### Week 2-3 (Iteration 471-480)

**@bmad-bmm-dev**:
1. Implement UC2 Canvas-RAG Linkage (6-8 hours)
2. Implement UC3 Citation UI (6-8 hours)
3. Begin UC4 Knowledge Dashboard (10-12 hours)

**@bmad-bmm-architect**:
1. Design store consolidation plan (Phase 2)
2. Create migration scripts for store consolidation
3. Update architecture documentation

### Week 4-8 (Iteration 481-500)

**@bmad-bmm-dev**:
1. Complete UC4 Knowledge Dashboard
2. Execute Store Consolidation Phase 2 (9-12 hours)
3. Execute Store Consolidation Phase 3 (20-25 hours)
4. Execute AgentConfigDialog refactoring (16-20 hours)

**@bmad-bmm-tea**:
1. Add tests for all new components
2. Add tests for extracted hooks
3. Validate store consolidation with integration tests

---

**Document Status**: ✅ COMPLETE
**Output Location**: `_bmad-output/platform-unification-actionable-recommendations-2026-01-02.md`
**Related Artifacts**:
- `platform-unification-comprehensive-analysis-2026-01-02.md`
- `ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`
- `_bmad-output/research/platform-unification-2026-01-02/` (cornerstone analyses)

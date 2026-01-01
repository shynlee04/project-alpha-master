# Correct Course Workflow: Platform Unification

**Date**: 2026-01-03
**Iteration**: 51 (System Gap Analysis Complete)
**Health Score**: 6/10 → Target: 9/10
**Total Effort**: 274 hours (8 weeks at 35h/week)

---

## Executive Summary

**Root Cause Identified**: State Fragmentation - 71 stores across 3 locations with no unified data flow

**Solution**: Implement 3-phase remediation plan:
1. **Phase 1**: Foundation Stabilization (50 hours)
2. **Phase 2**: Use Case UI Implementation (144 hours)
3. **Phase 3**: Cross-Integration (80 hours)

**Expected Outcome**: Platform health score 6/10 → 9/10, all 4 use cases testable end-to-end

---

## Phase 1: Foundation Stabilization (Weeks 1-2, 50 hours)

**Priority**: P0 - System Architecture
**Goal**: Consolidate fragmented state, establish unified data flow

### Story 51-1: State Consolidation Planning (8 hours)

**Objective**: Design 4-layer architecture and migration strategy

**Tasks**:
1. Audit all 71 stores across 3 locations
2. Map store dependencies (circular imports, shared state)
3. Design 4-layer clean architecture:
   - Layer 1 (Infrastructure): Dexie + Zustand stores
   - Layer 2 (Domain): Entities, value objects
   - Layer 3 (Application): Services, DTOs, use cases
   - Layer 4 (Presentation): UI components
4. Create migration plan with rollback strategy
5. Document success criteria

**Deliverables**:
- Store dependency diagram (Mermaid)
- 4-layer architecture ADR
- Migration checklist with time estimates

**Validation**:
- [ ] All 71 stores documented
- [ ] Dependencies mapped
- [ ] Architecture design reviewed
- [ ] Migration plan approved

---

### Story 51-2: Unified App Store (16 hours)

**Objective**: Create single bounded store for agent/provider state

**Tasks**:
1. Create `useAppStore` with slice composition pattern:
   ```typescript
   // src/infrastructure/persistence/stores/use-app-store.ts
   export const useAppStore = create<AppState>()(
     persist(
       (...args) => ({
         // Agent slices (5)
         ...createAgentCrudSlice(...args),
         ...createAgentWorkspaceBindingsSlice(...args),
         ...createAgentValidationSlice(...args),
         ...createAgentEventsSlice(...args),
         ...createAgentUtilsSlice(...args),

         // Provider slices (3)
         ...createProviderCrudSlice(...args),
         ...createProviderModelsSlice(...args),
         ...createProviderUtilsSlice(...args),
       }),
       {
         name: 'app-state',
         storage: createDexieStorage('appState'),
       }
     )
   )
   ```
2. Migrate provider state from legacy stores
3. Update AgentConfigDialog to use new store
4. Update ProviderConfigDialog to use new store
5. Test all agent/provider flows
6. Update 20+ consumer files

**Deliverables**:
- Unified `useAppStore` (846 lines)
- Migration script for legacy state
- Updated dialog components
- Integration tests

**Validation**:
- [ ] Store count reduced from 71 → 30
- [ ] All agent/provider tests passing
- [ ] Zero circular dependencies
- [ ] Dev server starts successfully

---

### Story 51-3: Workspace-Scoped Tool Permissions (12 hours)

**Objective**: Add workspace awareness to tool permission system

**Current State** (Global permissions):
```typescript
// src/lib/agent/tool-permission-manager.ts
public checkPermission(toolId: string): PermissionCheckResult {
  // ❌ No workspace parameter
  const trustLevel = state.trustLevels[toolId] ?? 'prompt';
  return { allowed: trustLevel !== 'blocked' };
}
```

**Target State** (Workspace-scoped):
```typescript
public checkPermission(toolId: string, workspaceType: WorkspaceType): PermissionCheckResult {
  // ✅ Workspace-aware
  const trustLevel = state.trustLevels[toolId]?.[workspaceType] ?? 'prompt';
  const agentEnabled = state.agentBindings?.[workspaceType]?.[toolId];
  return {
    allowed: trustLevel !== 'blocked' && agentEnabled !== false,
    workspace: workspaceType,
    reason: trustLevel === 'blocked' ? 'Tool globally blocked' : 'Agent not enabled in workspace'
  };
}
```

**Tasks**:
1. Update `ToolPermissionManager.checkPermission()` signature
2. Add workspace dimension to permission state
3. Update permission UI (`WorkspacePermissionEditor.tsx`)
4. Create workspace-specific permission presets
5. Test per-workspace enforcement
6. Update documentation

**Deliverables**:
- Updated `tool-permission-manager.ts`
- Enhanced permission state schema
- Workspace permission UI components
- Integration tests

**Validation**:
- [ ] Tool permissions workspace-scoped
- [ ] Permission UI shows workspace tabs
- [ ] Agents respect workspace restrictions
- [ ] All permission tests passing

---

### Story 51-4: File System Access Expansion (14 hours)

**Objective**: Enable all workspaces to access project files

**Current State** (Inconsistent access):
- IDE: Full SyncManager (dual-write)
- Knowledge: SyncManager for sources only
- Notes: Import/Export only (no sync)
- Study: No file access

**Target State** (Unified file system):
```
Project Files (Local FS)
    ↓
SharedFileReferences
    ↓
Workspace Access Points:
  ├── IDE → SyncManager (full access)
  ├── Knowledge → SyncManager (sources folder)
  ├── Notes → SyncManager (notes folder)
  └── Study → Read-only (artifact generation)
```

**Tasks**:
1. Add SyncManager to Notes workspace:
   ```typescript
   // src/lib/notes/sync-manager.ts
   export class NotesSyncManager extends SyncManager {
     async syncNotes(): Promise<SyncResult> {
       // Sync notes folder from project
     }
   }
   ```
2. Implement shared file reference system
3. Add file picker to Study workspace (read-only)
4. Update workspace binding dialogs to show file access
5. Test cross-workspace file operations
6. Add file conflict resolution UI

**Deliverables**:
- Notes SyncManager implementation
- Shared file reference service
- Study file picker (read-only)
- Updated workspace binding UI
- Integration tests

**Validation**:
- [ ] Notes workspace syncs project notes
- [ ] Study workspace can read project files
- [ ] No file conflicts between workspaces
- [ ] File access shown in workspace bindings

---

### Phase 1 Success Criteria

- [ ] Store count: 71 → 30 (58% reduction)
- [ ] Tool permissions workspace-scoped
- [ ] All workspaces can access project files
- [ ] Zero TypeScript errors from migration
- [ ] All tests passing
- [ ] Dev server starts successfully

**Estimated Timeline**: 2 weeks (50 hours @ 35h/week)

---

## Phase 2: Use Case UI Implementation (Weeks 3-6, 144 hours)

**Priority**: P0 - User Value
**Goal**: Make all 4 use cases testable end-to-end

### Sprint 1: UC1 Vault Population (28 hours)

**Current Readiness**: 60% (backend works, UI missing)

**User Journey**:
```
1. User selects local folder
2. Import documents (PDF, images, URLs)
3. System processes and embeds
4. User views progress and results
5. User can search and retrieve
```

**Missing UI Components**:

#### 1.1 DocumentPreviewViewer (8 hours)
**Purpose**: Preview documents before ingestion

**Features**:
- PDF preview (first page)
- Image preview (thumbnail grid)
- URL content preview (fetch and display)
- File metadata (size, type, modified date)

**Tech Stack**:
- PDF: `react-pdf` or `pdfjs-dist`
- Images: Native `<img>` with lazy loading
- URL: `iframe` with sanitization

**File**: `src/presentation/components/knowledge/DocumentPreviewViewer.tsx`

---

#### 1.2 EmbeddingVisualization (12 hours)
**Purpose**: Show embedding progress in real-time

**Features**:
- Progress bar per document
- Chunk visualization (show text splits)
- Embedding status (queued → processing → complete)
- Error display with retry button

**Tech Stack**:
- Progress: Recharts ProgressChart
- Visualization: Custom SVG chunks
- Status: Event-driven updates

**File**: `src/presentation/components/knowledge/EmbeddingVisualization.tsx`

---

#### 1.3 SourceManagementUI (8 hours)
**Purpose**: List and manage imported sources

**Features**:
- Table view of all sources
- Filter by type (PDF, Image, URL)
- Batch operations (re-embed, delete)
- Status indicators

**Tech Stack**:
- Table: TanStack Table
- Filters: Radix UI dropdowns
- Actions: Context menu

**File**: `src/presentation/components/knowledge/SourceManagementUI.tsx`

---

**Sprint 1 Success Criteria**:
- [ ] Can preview documents before importing
- [ ] Can see embedding progress in real-time
- [ ] Can manage (re-embed, delete) sources
- [ ] UC1 testable end-to-end

---

### Sprint 2: UC2 Canvas Linkage (48 hours)

**Current Readiness**: 30% (canvas exists, no linkage)

**User Journey**:
```
1. User drags 3+ synthesized documents to canvas
2. System analyzes and proposes linkages
3. User reviews and accepts/rejects proposals
4. Canvas updates with connections
5. Knowledge graph reflects changes
```

**Missing UI Components**:

#### 2.1 LinkageProposalAI (20 hours)
**Purpose**: AI-powered linkage suggestion engine

**Features**:
- Analyze document similarities (embedding cosine similarity)
- Detect semantic relationships
- Propose linkage types (reference, citation, dependency)
- Generate proposals with confidence scores

**Tech Stack**:
- Similarity: Orama vector search
- AI: Gemini API for semantic analysis
- Scoring: Custom confidence algorithm

**File**: `src/lib/knowledge/linkage-proposal-ai.ts`

---

#### 2.2 LinkageProposalUI (12 hours)
**Purpose**: Display and manage linkage proposals

**Features**:
- Proposal card per pair of documents
- Show similarity score and relationship type
- Accept/Reject buttons
- Batch accept (accept all high-confidence)
- Undo support

**Tech Stack**:
- Cards: Masonry layout
- Actions: Radix UI buttons
- State: Zustand store

**File**: `src/presentation/components/knowledge/LinkageProposalUI.tsx`

---

#### 2.3 CanvasIntegration (16 hours)
**Purpose**: Link canvas to knowledge graph

**Features**:
- Drag documents from source list to canvas
- Auto-fetch linkage proposals
- Render proposals as connection lines
- Update graph when proposals accepted
- Export canvas as image/PDF

**Tech Stack**:
- Canvas: React Flow
- Drag: @xyflow/react
- Integration: Custom hooks

**File**: `src/presentation/components/knowledge/CanvasIntegration.tsx`

---

**Sprint 2 Success Criteria**:
- [ ] Can drag sources to canvas
- [ ] AI proposes linkages automatically
- [ ] Can accept/reject proposals
- [ ] Canvas updates with connections
- [ ] UC2 testable end-to-end

---

### Sprint 3: UC3 Conversational RAG (36 hours)

**Current Readiness**: 50% (RAG works, isolated to Knowledge)

**User Journey**:
```
1. User opens chat in any workspace
2. User asks question about sources
3. System retrieves relevant chunks (RAG)
4. System generates answer with citations
5. User can view source context
```

**Missing UI Components**:

#### 3.1 RAGChatPanel (16 hours)
**Purpose**: RAG-aware chat panel for all workspaces

**Features**:
- Source picker (select which sources to query)
- RAG mode toggle (chat vs. RAG)
- Citation indicators in messages
- Source context viewer

**Tech Stack**:
- Chat: Existing chat panel + RAG toggle
- Picker: Multi-select dropdown
- Citations: Custom message renderer

**File**: `src/presentation/components/chat/RAGChatPanel.tsx`

---

#### 3.2 CitationUI (12 hours)
**Purpose**: Display citations in chat messages

**Features**:
- Citation badges in messages
- Hover to show source preview
- Click to open source context viewer
- Filter citations by source

**Tech Stack**:
- Badges: Custom tooltip component
- Preview: Side panel slide-over
- State: Message metadata

**File**: `src/presentation/components/chat/CitationUI.tsx`

---

#### 3.3 SourceContextViewer (8 hours)
**Purpose**: Show source context for citations

**Features**:
- Display relevant chunks from source
- Highlight matched terms
- Show chunk metadata (page, position)
- Link to full source

**Tech Stack**:
- Viewer: Side panel with highlighting
- Highlight: Custom highlighter
- Navigation: Chunk browser

**File**: `src/presentation/components/chat/SourceContextViewer.tsx`

---

**Sprint 3 Success Criteria**:
- [ ] Can toggle RAG mode in chat
- [ ] Messages include citations
- [ ] Can view source context
- [ ] RAG works in all workspaces
- [ ] UC3 testable end-to-end

---

### Sprint 4: UC4 Knowledge Matrix (48 hours)

**Current Readiness**: 40% (generation works, no dashboard)

**User Journey**:
```
1. User populates vault (UC1) and builds graph (UC2)
2. User opens Study workspace
3. System shows knowledge matrix dashboard
4. User generates study artifacts
5. User studies with spaced repetition
6. System tracks progress over time
```

**Missing UI Components**:

#### 4.1 KnowledgeMatrixDashboard (20 hours)
**Purpose**: Unified view of all knowledge

**Features**:
- Grid view of all sources (documents, nodes)
- Cluster visualization (auto-grouped by subject)
- Coverage indicators (what's embedded, what's synthesized)
- Artifact generation buttons

**Tech Stack**:
- Grid: Virtualized grid (react-window)
- Visualization: D3.js force-directed graph
- Clustering: K-means clustering

**File**: `src/presentation/components/study/KnowledgeMatrixDashboard.tsx`

---

#### 4.2 ArtifactGenerationUI (12 hours)
**Purpose**: Bulk generation of flashcards/quizzes

**Features**:
- Select sources for generation
- Choose artifact type (flashcards, quizzes)
- Configure generation parameters (count, difficulty)
- Generation progress indicator
- Review and edit before saving

**Tech Stack**:
- Selection: Multi-select with filters
- Config: Form with presets
- Progress: Queue visualization

**File**: `src/presentation/components/study/ArtifactGenerationUI.tsx`

---

#### 4.3 ProgressTrackingDashboard (16 hours)
**Purpose**: Track learning progress over time

**Features**:
- Mastery level per subject
- Study streak calendar
- Spaced repetition schedule
- Performance analytics
- Export progress report

**Tech Stack**:
- Charts: Recharts (line, bar, calendar)
- Analytics: Custom SRS calculations
- Export: PDF generation

**File**: `src/presentation/components/study/ProgressTrackingDashboard.tsx`

---

**Sprint 4 Success Criteria**:
- [ ] Knowledge matrix shows all sources
- [ ] Can bulk generate artifacts
- [ ] Progress tracking works
- [ ] UC4 testable end-to-end

---

### Phase 2 Success Criteria

- [ ] All 4 use cases testable end-to-end
- [ ] Cross-use case data flows working
- [ ] User can complete full journeys
- [ ] Zero breaking changes
- [ ] All new components < 120 lines

**Estimated Timeline**: 4 weeks (144 hours @ 35h/week)

---

## Phase 3: Cross-Use Case Integration (Weeks 7-8, 80 hours)

**Priority**: P0 - Platform Unification
**Goal**: Wire all use cases together

### Story 101-1: Cross-Use Case Data Flow (24 hours)

**Objective**: Enable data flow between all use cases

**Current State** (Fragmented):
- UC1 (Vault): Works, isolated
- UC2 (Canvas): No drag-drop from vault
- UC3 (RAG): Knowledge workspace only
- UC4 (Matrix): Manual generation only

**Target State** (Unified):
- Drag sources from vault → canvas
- RAG queries on canvas graph
- Generate artifacts from graph

**Tasks**:
1. Implement shared source references (8h)
2. Wire UC1 → UC2 (drag sources to canvas) (6h)
3. Wire UC1 → UC3 (RAG on all sources) (6h)
4. Wire UC1 → UC4 (generate artifacts) (4h)

**Deliverables**:
- Shared source reference service
- Drag-and-drop integration
- RAG source selector (all sources)
- Artifact generation from sources

**Validation**:
- [ ] Can drag sources to canvas
- [ ] RAG includes canvas nodes
- [ ] Study can generate from vault

---

### Story 101-2: Canvas-RAG Integration (16 hours)

**Objective**: Make RAG graph-aware

**Tasks**:
1. RAG queries include canvas structure
2. Graph-based citations (node + edge)
3. Visualize RAG results on canvas
4. Link canvas nodes to source chunks

**Deliverables**:
- Graph-aware RAG retrieval
- Canvas citation renderer
- Visual feedback for RAG queries

**Validation**:
- [ ] RAG respects graph structure
- [ ] Citations link to canvas nodes
- [ ] Canvas highlights during RAG

---

### Story 101-3: Graph-Based Quiz Generation (20 hours)

**Objective**: Generate quizzes from knowledge graph

**Tasks**:
1. Analyze graph structure for topics
2. Generate questions from node connections
3. Use linkage proposals for difficulty
4. Track graph mastery over time

**Deliverables**:
- Graph analyzer service
- Quiz generation from graph
- Linkage-aware difficulty algorithm
- Graph mastery tracker

**Validation**:
- [ ] Quizzes generated from graph
- [ ] Difficulty respects linkages
- [ ] Mastery tracked per topic

---

### Story 101-4: Unified Orchestration Service (20 hours)

**Objective**: Coordinate cross-use case workflows

**Tasks**:
1. Create use case orchestrator
2. Implement journey state machine
3. Add progress tracking
4. Create journey export/import

**Deliverables**:
- Use case orchestrator service
- Journey state machine
- Progress persistence
- Journey JSON format

**Validation**:
- [ ] Can orchestrate vault → canvas → RAG → study
- [ ] Progress tracked throughout
- [ ] Can pause/resume journeys

---

### Phase 3 Success Criteria

- [ ] All 4 use cases integrated end-to-end
- [ ] User can populate vault → build graph → chat → study
- [ ] Cross-workspace data flows working
- [ ] Zero breaking changes

**Estimated Timeline**: 2 weeks (80 hours @ 35h/week)

---

## Risk Management

### High-Risk Areas

**1. State Migration (Risk: Breaking changes)**
- **Mitigation**: Facade pattern for backward compatibility
- **Rollback**: Keep legacy stores until all consumers migrated

**2. Cross-Use Data Flow (Risk: Complex dependencies)**
- **Mitigation**: Incremental integration with testing
- **Rollback**: Feature flags to disable integration

**3. Performance (Risk: Slow operations)**
- **Mitigation**: Lazy loading, caching, Web Workers
- **Monitoring**: Performance budgets, metrics

---

## Technical Debt Summary

### Critical Debt (Must Fix)

1. **God Components** (>300 lines)
   - `rag-store.ts`: 1,595 lines (duplicated)
   - `agents-store.ts`: 430 lines (circular dep)
   - `conversation-threads-store.ts`: 726 lines
   - **Remediation**: 42 hours (Epic AC-1)

2. **TypeScript Errors** (1,172 remaining)
   - Production: 306 errors
   - Test: 866 errors
   - **Remediation**: 6-8 hours (TS-001)

3. **Silent Failures** (23 instances)
   - `console.error` + `return null` pattern
   - **Remediation**: 12 hours (error handling)

### High Debt (Should Fix)

4. **IndexedDB Quota Handling** (Missing)
   - No quota checks before writes
   - **Remediation**: 18-22 hours (DB-001)

5. **Store Duplication** (30% duplication rate)
   - 17 duplicate stores (6,500 lines)
   - **Remediation**: Included in Phase 1

---

## Success Metrics

### Quantitative

| Metric | Current | Target | Delta |
|--------|---------|--------|-------|
| **Health Score** | 6/10 | 9/10 | +50% |
| **Store Count** | 71 | 30 | -58% |
| **TypeScript Errors** | 1,172 | <100 | -91% |
| **God Components** | 4 | 0 | -100% |
| **Use Case Readiness** | 45% | 100% | +122% |

### Qualitative

- ✅ All 4 workspaces share project state
- ✅ All 4 use cases testable end-to-end
- ✅ Cross-use case data flows working
- ✅ Zero breaking changes
- ✅ User can complete full journeys

---

## Conclusion

This correct-course workflow addresses the **root cause** (state fragmentation) with a **systematic 3-phase approach**:

1. **Phase 1** stabilizes the foundation (state, permissions, file system)
2. **Phase 2** delivers user value (4 use cases with UI)
3. **Phase 3** integrates everything (cross-use case workflows)

**Total Investment**: 274 hours (8 weeks @ 35h/week)

**Expected Outcome**: Platform health score 6/10 → 9/10, all use cases testable, zero breaking changes

---

**Next Step**: Begin Phase 1, Story 51-1: State Consolidation Planning

**Command**: `@bmad-core-bmad-master` - Requesting approval to proceed with Phase 1

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Author**: Ralph Loop (Iteration 51)

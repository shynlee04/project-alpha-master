# Story P2-10: Complete Critical Cross-Workspace Connections

**Generated**: 2026-01-03T23:55:00+07:00
**Epic**: Platform Unification & Knowledge Synthesis
**Priority**: P2 (Medium - Improves integration score 25% → 50%)
**Estimate**: 10 hours
**Team**: Team A (UI/Foundation) + Team B (Backend/Agent)
**Status**: READY_FOR_DEV

## User Story

As a **Knowledge Synthesis user**, I want to **seamlessly move between workspaces** so that I can research, study, and synthesize without manual file transfers or context switching.

## Context & Motivation

**Current Platform Integration Score: 25%** (FAILING)
- Only 6/24 workspace connections exist
- Zero connections from IDE to other workspaces
- Knowledge→Notes connection MISSING

**Critical Missing Connections** (Priority Order):
1. **Notes → Knowledge** (P2-8) - Index notes for RAG search
2. **Knowledge → Notes** - Synthesis export to notes
3. **IDE → Knowledge** - Code-to-concept bridge
4. **Knowledge → Study** - Flashcards from sources
5. **Study → Knowledge** - Concept backlinking

**Use Case Impact**:
- UC-01 (Exam Sprint) - PARTIAL (missing Notes↔Knowledge)
- UC-02 (IDE Debugging Vault) - NOT FEASIBLE (no IDE→Knowledge)
- UC-11 (Agentic Refactor) - NOT FEASIBLE (no IDE→Knowledge)
- UC-13 (Dependency Audit) - NOT FEASIBLE (no IDE→Knowledge)

## Acceptance Criteria

### AC1: Knowledge → Notes Export (2h)
- [ ] Add "Export to Notes" button to Knowledge workspace
- [ ] Export synthesis results as new note
- [ ] Include citations in exported note
- [ ] Auto-link back to source in Knowledge workspace
- [ ] Success notification with link to note

### AC2: IDE → Knowledge Bridge (4h)
- [ ] Add "Analyze in Knowledge" button to IDE context menu
- [ ] Send code selection to Knowledge workspace
- [ ] Auto-generate concept node from code
- [ ] Extract dependencies as linked sources
- [ ] Bi-directional linking (Knowledge→IDE)

### AC3: Knowledge → Study Flashcards (2h)
- [ ] Add "Generate Flashcards" button to source cards
- [ ] Bulk create flashcards from selected sources
- [ ] Use existing flashcard generator
- [ ] Navigate to Study workspace with new flashcards
- [ ] Show creation count in notification

### AC4: Cross-Workspace Navigation (1h)
- [ ] Add "Open in {Workspace}" buttons where relevant
- [ ] Preserve context when switching workspaces
- [ ] Smooth transitions (no page reload)
- [ ] Back button returns to previous workspace
- [ ] Keyboard shortcuts (Cmd/Ctrl + K, N, S, I)

### AC5: Integration Testing (1h)
- [ ] Test all 4 connections manually
- [ ] Verify data flows correctly
- [ ] Check error handling
- [ ] Test undo/redo where applicable
- [ ] Document workflows

## Technical Specification

### AC1: Knowledge → Notes Export

**Files to Create**:
```typescript
src/lib/knowledge/synthesis-exporter.ts (NEW - 80 lines)
  - export function exportSynthesisToNote(synthesis: SynthesisResult): Note
  - Converts synthesis to BlockNote document
  - Includes citation links
  - Returns note ID

src/presentation/components/knowledge/SynthesisExportButton.tsx (NEW - 60 lines)
  - Button component with icon
  - Calls synthesis-exporter
  - Shows success toast
  - Links to created note
```

**Files to Modify**:
```typescript
src/presentation/components/knowledge/KnowledgePage.tsx
  - Add SynthesisExportButton to toolbar
  - Wire up state

src/lib/state/notes-store.ts (if exists)
  - Add importSynthesis action
```

### AC2: IDE → Knowledge Bridge

**Files to Create**:
```typescript
src/lib/ide/code-analyzer.ts (NEW - 100 lines)
  - export function analyzeCode(code: string): CodeAnalysis
  - Extract function names
  - Identify dependencies
  - Generate concept node data

src/presentation/components/ide/AnalyzeInKnowledgeButton.tsx (NEW - 80 lines)
  - Context menu item
  - Code selection handler
  - Calls code-analyzer
  - Navigates to Knowledge workspace

src/presentation/components/knowledge/CodeConceptNode.tsx (NEW - 120 lines)
  - Specialized node for code concepts
  - Shows function signature
  - Links to IDE file:line
```

**Files to Modify**:
```typescript
src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
  - Add context menu item
  - Wire up analyze handler

src/lib/state/canvas-store.ts
  - Add createCodeConceptNode action

src/lib/state/knowledge-store.ts
  - Add code concepts category
```

### AC3: Knowledge → Study Flashcards

**Files to Create**:
```typescript
src/lib/knowledge/flashcard-batch-generator.ts (NEW - 80 lines)
  - export function generateFlashcardsFromSources(sources: Source[]): Flashcard[]
  - Calls existing flashcard generator
  - Batches API calls
  - Returns array of flashcard IDs

src/presentation/components/knowledge/GenerateFlashcardsButton.tsx (NEW - 60 lines)
  - Button with flashcard icon
  - Multi-select for sources
  - Shows progress indicator
  - Navigates to Study workspace
```

**Files to Modify**:
```typescript
src/presentation/components/knowledge/SourceCard.tsx
  - Add checkbox for bulk selection
  - Add to action menu

src/presentation/components/knowledge/KnowledgePage.tsx
  - Add bulk action toolbar
  - Wire up generator

src/lib/state/study-store.ts
  - Add addFlashcardsBatch action
```

### AC4: Cross-Workspace Navigation

**Files to Create**:
```typescript
src/lib/workspace/workspace-navigator.ts (NEW - 60 lines)
  - export function navigateToWorkspace(workspace: WorkspaceType, context?: any)
  - Preserves state
  - Handles transitions

src/presentation/components/common/WorkspaceSwitcher.tsx (NEW - 100 lines)
  - Dropdown for workspace switching
  - Shows keyboard shortcuts
  - Context-aware options
```

**Files to Modify**:
```typescript
src/routes/workspace/$projectId.tsx
  - Integrate workspace-navigator

CLAUDE.md
  - Document navigation patterns
  - Add keyboard shortcut reference
```

## Implementation Order

**Phase 1** (Team A - 3h):
1. AC1: Knowledge → Notes Export
2. AC3: Knowledge → Study Flashcards

**Phase 2** (Team B - 4h):
3. AC2: IDE → Knowledge Bridge

**Phase 3** (Team A - 2h):
4. AC4: Cross-Workspace Navigation

**Phase 4** (Both - 1h):
5. AC5: Integration Testing

## Dependencies

**Requires**:
- ✅ P0-3: fileSyncService working (DONE)
- ✅ P2-8: Notes → Knowledge RAG Indexing (parallel)
- ✅ Epic 7: RAG infrastructure (DONE)
- ✅ Epic 9: Flashcard generator (DONE)

**Blocked By**:
- None

**Unlocks**:
- UC-01: Exam Sprint (PARTIAL → FEASIBLE)
- UC-02: IDE Debugging Vault (NOT → PARTIAL)
- UC-11: Agentic Refactor (NOT → PARTIAL)
- UC-13: Dependency Audit (NOT → PARTIAL)

## Definition of Done
- [ ] All 5 acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Integration testing complete
- [ ] Platform integration score: 25% → 50%
- [ ] Use case feasibility: 17% → 35%
- [ ] Documentation updated
- [ ] Keyboard shortcuts working

## Risk Assessment

**Risk**: Complex cross-workspace state management
**Mitigation**: Use Zustand stores, avoid React Context

**Risk**: Performance degradation from bi-directional linking
**Mitigation**: Lazy loading, debounce updates

**Risk**: User confusion from too many connection options
**Mitigation**: Progressive disclosure, clear labels

## Success Metrics

**Quantitative**:
- Platform Integration Score: 25% → 50%
- Use Case Feasibility: 17% → 35%
- Workspace Connections: 6/24 → 12/24

**Qualitative**:
- Smooth cross-workspace workflows
- No manual file transfers needed
- Context preserved across transitions

## References
- Assessment: `_bmad-output/ux-ui-workspace-integration-assessment-2026-01-03.md`
- Connection Matrix: Lines 38-44 of assessment
- Use Cases: 18 use cases in `knowledge_synthesis_research/`

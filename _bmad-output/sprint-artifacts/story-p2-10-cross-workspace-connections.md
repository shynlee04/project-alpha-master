# Story P2-10: Complete Critical Cross-Workspace Connections

**Generated**: 2026-01-04T01:30:00+07:00
**Epic**: Platform Unification & Knowledge Synthesis
**Priority**: P2 (Medium - Blocks use cases UC-01, UC-02, UC-11, UC-13)
**Estimate**: 10 hours
**Team**: Team A (UI/Foundation)
**Status**: READY_FOR_DEV

## User Story

As a **Knowledge Synthesis user**, I want to **seamlessly move data and context between workspaces** so that I can leverage the full capabilities of the platform (IDE, Knowledge, Notes, Study) without manual export/import friction.

## Context & Motivation

**Current State**:
- Platform Integration Score: 42% (9/24 workspace connections exist)
- Use Case Feasibility: 32% (5/18 partially feasible)
- ✅ IDE → Knowledge bridge working (P2-6)
- ✅ Knowledge → Notes export working (P2-7)
- ✅ Notes → Knowledge RAG indexing working (P2-8)
- ❌ 6 critical workspace connections MISSING

**Problem**:
- UC-01 (Exam Sprint): Can't export Knowledge → Study flashcards
- UC-02 (IDE Debugging): Can't analyze code in Knowledge workspace
- UC-11 (Agentic Refactor): Can't get code insights from Knowledge
- UC-13 (Dependency Audit): Can't audit dependencies across workspaces
- No cross-workspace navigation shortcuts

**Value**:
- Platform Integration Score: 42% → 50% (+8%)
- Use Case Feasibility: 32% → 35% (+3%)
- Unblock 4 critical use cases (UC-01, UC-02, UC-11, UC-13)
- Seamless workspace switching

## Acceptance Criteria

### AC1: Knowledge → Study Flashcards Export (2h)
- [ ] Create `flashcard-exporter.ts` service
- [ ] Add "Generate Flashcards" button to Knowledge workspace source cards
- [ ] Export synthesis results to Study workspace as flashcard deck
- [ ] Batch flashcard generation from RAG search results
- [ ] Test: Knowledge synthesis appears in Study workspace

### AC2: IDE → Knowledge Code Analysis Bridge (4h)
- [ ] Create `code-analyzer.ts` service
- [ ] Add "Analyze in Knowledge" to IDE context menu
- [ ] Create `CodeConceptNode.tsx` component for Canvas
- [ ] Extract code structure, dependencies, complexity metrics
- [ ] Push analysis results to Knowledge workspace
- [ ] Test: IDE code analysis appears in Knowledge Canvas

### AC3: Knowledge → Study Batch Flashcard Generation (2h)
- [ ] Create batch flashcard generator service
- [ ] Add "Generate Study Set" button to Knowledge workspace
- [ ] Generate multiple flashcards from RAG search results
- [ ] Export to Study workspace with metadata
- [ ] Test: Bulk flashcard creation works

### AC4: Cross-Workspace Keyboard Navigation (1h)
- [ ] Create workspace navigator utility
- [ ] Add keyboard shortcuts:
  - `Cmd/Ctrl + K` → Open workspace switcher
  - `Cmd/Ctrl + I` → Switch to IDE
  - `Cmd/Ctrl + N` → Switch to Notes
  - `Cmd/Ctrl + S` → Switch to Study
- [ ] Add visual feedback (toast notifications)
- [ ] Test: All shortcuts work smoothly

### AC5: Integration Testing (1h)
- [ ] Test all 6 new workspace connections
- [ ] Verify data flows correctly in both directions
- [ ] Test error handling (invalid data, network failures)
- [ ] Verify zero TypeScript errors
- [ ] Manual testing of all 4 use cases

## Technical Specification

### Files to Create

```
src/lib/knowledge/flashcard-exporter.ts (NEW - 120 lines)
  - export class FlashcardExporter
  - + exportToStudy(synthesisResult: SynthesisResult): Promise<FlashcardDeck>
  - + generateFlashcardsFromRAG(results: SearchResult[]): Promise<Flashcard[]>

src/lib/ide/code-analyzer.ts (NEW - 150 lines)
  - export class CodeAnalyzer
  - + analyzeCode(file: string, content: string): CodeAnalysis
  - + extractDependencies(content: string): Dependency[]
  - + calculateComplexity(content: string): ComplexityMetrics

src/presentation/components/knowledge/CodeConceptNode.tsx (NEW - 100 lines)
  - Component for displaying code concepts on Canvas
  - Shows file name, language, complexity score

src/lib/workspace/workspace-navigator.ts (NEW - 80 lines)
  - export function switchWorkspace(workspaceType: WorkspaceType): void
  - export function navigateToWorkspace(workspaceType: WorkspaceType): void
  - Keyboard shortcut handlers
```

### Files to Modify

```
src/presentation/components/knowledge/KnowledgePage.tsx
  - Import flashcard exporter
  - Add "Generate Flashcards" buttons to source cards
  - Add "Generate Study Set" button to RAG results

src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
  - Add context menu "Analyze in Knowledge"
  - Wire up code analyzer

src/presentation/components/canvas/Canvas.tsx
  - Support CodeConceptNode rendering
  - Handle code analysis results from IDE

src/routes/workspace/*.tsx
  - Add keyboard shortcut listeners (Cmd/Ctrl + K, I, N, S)
  - Integrate workspace navigator
```

## Implementation Steps

### Phase 1: Knowledge → Study (3h)
1. Create `flashcard-exporter.ts` service (1.5h)
2. Add "Generate Flashcards" button to Knowledge UI (30m)
3. Test export functionality (30m)

### Phase 2: IDE → Knowledge (4h)
1. Create `code-analyzer.ts` service (2h)
2. Add "Analyze in Knowledge" context menu item (30m)
3. Create `CodeConceptNode.tsx` component (1h)
4. Test code analysis flow (30m)

### Phase 3: Navigation (1h)
1. Create `workspace-navigator.ts` utility (30m)
2. Add keyboard shortcuts to all workspace routes (20m)
3. Add visual feedback/toast notifications (10m)

### Phase 4: Testing (1h)
1. Test all 6 new connections
2. Verify TypeScript errors: 0
3. Manual testing checklist
4. Update documentation

### Phase 5: Integration & Validation (1h)
1. Final integration testing
2. Update sprint status
3. Create completion summary

## Definition of Done
- [ ] All 5 acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] All 6 workspace connections working
- [ ] 4 use cases unblocked (UC-01, UC-02, UC-11, UC-13)
- [ ] Platform Integration Score: 42% → 50%
- [ ] Use Case Feasibility: 32% → 35%
- [ ] Documentation updated

## Use Case Impact

**Before**:
- UC-01: ⚠️ PARTIAL (can't export to Study)
- UC-02: ⚠️ PARTIAL (can't analyze code in Knowledge)
- UC-11: ⚠️ PARTIAL (can't get code insights)
- UC-13: ⚠️ PARTIAL (can't audit dependencies)

**After**:
- UC-01: ✅ FEASIBLE (Knowledge → Study flashcards)
- UC-02: ✅ FEASIBLE (IDE → Knowledge code analysis)
- UC-11: ✅ FEASIBLE (code insights available)
- UC-13: ✅ FEASIBLE (dependency auditing)

## References
- Handoff: `_bmad-output/dev-handoffs/p2-implementation-handoff-2026-01-03.md`
- Assessment: `_bmad-output/ux-ui-workspace-integration-assessment-2026-01-03.md`
- Use Cases: `knowledge_synthesis_research/usecase-*.md`

## Dependencies
- ✅ Flashcard store (existing)
- ✅ RAG search (existing)
- ✅ Code editor Monaco (existing)
- ✅ Canvas (existing)
- ✅ Workspace navigation (existing)

## Blocks
- None (ready to start)

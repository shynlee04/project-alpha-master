---
date: 2026-01-03
time: 15:00:00
phase: Ralph Loop Coordination
team: Team A (BMAD Master)
agent_mode: bmad-core-bmad-master
iteration: 1103
type: coordination-plan
---

# 🎯 Ralph Loop Iteration 1103: Systematic Workspace Integration

## Executive Summary

**Trigger**: User request to coordinate agents for ongoing Ralph Loop iterations focusing on UX/UI workspace integration
**Scope**: P2-5 onwards + Epic 52 (Use Case Integration)
**Strategy**: Systematic delegation to specialist agents with clear acceptance criteria

---

## Part 1: Priority Queue Definition

### P2-5: Implement File Sync Services (8 hours)

**Story**: P2-5-wire-filesync-services
**Priority**: P0 (Critical - Blocks 13 use cases)
**Agent**: @bmad-bmm-dev
**Estimated Time**: 8 hours

**Acceptance Criteria**:
1. StudyFilePicker mounts real fileSyncService (not null)
2. NotesPage receives real syncService (not undefined)
3. File operations (mount, scan, import) execute successfully
4. User sees file picker dialog and operations actually work
5. Error handling for file system access failures
6. TypeScript compilation passes (0 errors)

**Files to Modify**:
- `src/presentation/components/study/StudyFilePicker.tsx` (consume service)
- `src/presentation/components/study/StudyPage.tsx` (pass service, not null)
- `src/presentation/components/notes/NotesPage.tsx` (pass service, not undefined)
- `src/lib/filesync/study-file-sync-service.ts` (may need creation)
- `src/lib/filesync/notes-file-sync-service.ts` (may need creation)

**Validation**:
```bash
# After implementation, verify services are not null/undefined
grep -n "fileSyncService={null}" src/presentation/components/study/StudyPage.tsx
# Expected: No matches

grep -n "syncService={undefined}" src/presentation/components/notes/NotesPage.tsx
# Expected: No matches

# Test file picker operations
pnpm test -- StudyFilePicker
```

---

### P2-6: Implement IDE ↔ Knowledge Bridge (10 hours)

**Story**: P2-6-ide-knowledge-bridge
**Priority**: P0 (Critical - Blocks UC-02, UC-11, UC-13)
**Agent**: @bmad-bmm-dev
**Estimated Time**: 10 hours

**Acceptance Criteria**:
1. IDE workspace can send code/error context to Knowledge workspace
2. Knowledge workspace receives IDE context and creates Debug Notes
3. User can trigger "Capture Debug Session" from IDE workspace
4. Debug Notes appear in Knowledge workspace with proper frontmatter
5. Cross-workspace navigation (IDE → Knowledge) works
6. Event bus communication verified
7. TypeScript compilation passes (0 errors)

**Files to Modify**:
- `src/presentation/components/ide/AgentChatPanel.tsx` (add capture button)
- `src/presentation/components/knowledge/KnowledgePage.tsx` (receive IDE events)
- `src/infrastructure/events/cross-workspace-event-bus.ts` (add IDE→Knowledge events)
- `src/lib/knowledge/synthesis-service.ts` (create Debug Note synthesis)
- `src/types/workspace-events.ts` (add event types)

**Use Cases Unblocked**:
- UC-02: IDE Debugging Vault
- UC-11: Agentic Refactor Validation
- UC-13: Dependency Audit Upgrade

**Validation**:
```bash
# Verify cross-workspace imports exist
grep -rn "from '@/presentation/components/knowledge'" src/presentation/components/ide --include="*.tsx"
# Expected: Matches found

# Test event bus communication
pnpm test -- cross-workspace-event-bus
```

---

### P2-7: Implement Knowledge → Notes Export (6 hours)

**Story**: P2-7-knowledge-notes-export
**Priority**: P1 (High - Blocks UC-01, UC-03)
**Agent**: @bmad-bmm-dev
**Estimated Time**: 6 hours

**Acceptance Criteria**:
1. Knowledge workspace has "Export to Notes" button
2. Synthesized content can be sent to Notes workspace
3. Notes workspace receives knowledge content as new note
4. Cross-workspace navigation (Knowledge → Notes) works
5. User can export synthesis, flashcards, or quizzes to notes
6. TypeScript compilation passes (0 errors)

**Files to Modify**:
- `src/presentation/components/knowledge/SynthesisDialog.tsx` (add export button)
- `src/presentation/components/notes/NotesPage.tsx` (receive knowledge events)
- `src/infrastructure/events/cross-workspace-event-bus.ts` (add Knowledge→Notes events)
- `src/lib/notes/note-import-service.ts` (create import handler)

**Use Cases Unblocked**:
- UC-01: Exam Sprint Mixed Media
- UC-03: Citation Grade Literature Map

---

### P2-8: Implement Notes → Knowledge RAG Indexing (8 hours)

**Story**: P2-8-notes-knowledge-rag
**Priority**: P1 (High - Blocks note-based RAG)
**Agent**: @bmad-bmm-dev
**Estimated Time**: 8 hours

**Acceptance Criteria**:
1. Notes workspace has "Index for RAG" button
2. Note content can be sent to Knowledge workspace for embedding
3. Knowledge workspace indexes notes into RAG vector store
4. Indexed notes appear in Knowledge search results
5. Cross-workspace navigation (Notes → Knowledge) works
6. TypeScript compilation passes (0 errors)

**Files to Modify**:
- `src/presentation/components/notes/NoteEditor.tsx` (add index button)
- `src/presentation/components/knowledge/KnowledgePage.tsx` (receive note events)
- `src/infrastructure/events/cross-workspace-event-bus.ts` (add Notes→Knowledge events)
- `src/lib/rag/indexing-service.ts` (add note indexing)

**Use Cases Unblocked**:
- UC-01: Exam Sprint (notes as sources)
- UC-03: Citation Grade Literature Map (note citations)

---

## Part 2: Epic 52 - Use Case Integration Stories

### Epic 52 Overview

**Epic Name**: Use Case Integration
**Epic Number**: 52
**Total Stories**: 18 stories (one per use case)
**Priority**: P1 (High)
**Estimated Time**: 120-150 hours total

**Story Breakdown**:
| Story | Use Case | Priority | Dependencies | Est. Time |
|-------|----------|----------|--------------|-----------|
| 52-01 | UC-01: Exam Sprint | P1 | P2-5, P2-7, P2-8 | 12h |
| 52-02 | UC-02: IDE Debugging Vault | P1 | P2-6 | 10h |
| 52-03 | UC-03: Citation Literature Map | P1 | P2-7, P2-8 | 8h |
| 52-04 | UC-04: Field Capture Offline | P2 | P2-5 | 6h |
| 52-05 | UC-05: Drift Detection | P2 | P2-6 | 8h |
| 52-06 | UC-06: Prompt Hardening | P3 | None | 4h |
| 52-07 | UC-07: Bilingual Glossary | P2 | None | 6h |
| 52-08 | UC-08: Collab Reconcile | P3 | P3 features | 10h |
| 52-09 | UC-09: Accessibility Diagrams | P2 | Accessibility | 8h |
| 52-10 | UC-10: Learning Path SRS | P2 | Study workspace | 6h |
| 52-11 | UC-11: Agentic Refactor | P1 | P2-6 | 10h |
| 52-12 | UC-12: TDD Scaffold | P1 | P2-6 | 8h |
| 52-13 | UC-13: Dependency Audit | P1 | P2-6 | 8h |
| 52-14 | UC-14: Mobile Photo to IDE | P2 | Mobile camera | 12h |
| 52-15 | UC-15: Voice Canvas Synthesis | P2 | Audio transcription | 14h |
| 52-16 | UC-16: Mobile Study Offline | P2 | Offline mode | 10h |
| 52-17 | UC-17: PDF Annotation Sync | P2 | PDF annotation | 12h |
| 52-18 | UC-18: Collab Canvas Voice | P3 | Collaboration layer | 14h |

**Total High Priority (P1)**: 6 stories (52-01, 02, 03, 11, 12, 13) = 56 hours
**Total Medium Priority (P2)**: 9 stories = 82 hours
**Total Low Priority (P3)**: 3 stories = 28 hours

---

### Story 52-01: Exam Sprint Mixed Media

**User Story**:
```
As a university student,
I want to import a semester folder containing PDFs, DOCX, Markdown, images, and audio,
So that I can synthesize the material into an exam-ready knowledge map and study plan.
```

**Acceptance Criteria**:
1. User can select "Import → Folder" from Knowledge workspace
2. System parses PDF/DOCX/MD files successfully
3. System runs OCR on images (screenshots of handwriting)
4. System transcribes audio files
5. System generates embeddings and chunks
6. User can click "Synthesize" to generate frontmatter, tags, and concept rankings
7. Synthesized resources can be dragged onto Canvas
8. Canvas suggests linkages between resources
9. System generates 7-day study plan
10. System creates flashcard candidates for user approval

**Dependencies**:
- P2-5: File Sync Services (for folder import)
- P2-7: Knowledge → Notes Export (for note creation)
- P2-8: Notes → Knowledge RAG (for note indexing)

**Technical Requirements**:
- File type routing: PDF → Knowledge, Audio → Transcription pipeline, Image → OCR
- Progress tracking: Parse → OCR/Transcribe → Embed → Synthesize
- UI must not freeze during 200-file import
- Cross-workspace navigation: Knowledge → Notes → Study

**Files to Modify**:
- `src/presentation/components/knowledge/SourceImportDialog.tsx` (folder import)
- `src/lib/knowledge/pdf-parser.ts` (already exists)
- `src/lib/knowledge/audio-transcription-service.ts` (may need creation)
- `src/lib/knowledge/ocr-service.ts` (may need creation)
- `src/presentation/components/knowledge/SynthesisDialog.tsx` (synthesis action)
- `src/presentation/components/canvas/Canvas.tsx` (linkage suggestions)
- `src/presentation/components/study/StudyPage.tsx` (study plan generation)

**Test Cases**:
```typescript
describe('UC-01: Exam Sprint', () => {
  it('should import 200 mixed files without UI freeze', async () => {
    // Test file import performance
  });

  it('should transcribe audio and align to slides', async () => {
    // Test audio transcription
  });

  it('should generate synthesis with frontmatter', async () => {
    // Test synthesis generation
  });

  it('should suggest canvas linkages with 2+ evidence spans', async () => {
    // Test linkage suggestions
  });

  it('should generate 7-day study plan', async () => {
    // Test study plan creation
  });
});
```

---

### Story 52-02: IDE Debugging Vault

**User Story**:
```
As a student developer,
I want to capture debugging sessions from the IDE workspace,
So that I can build a searchable knowledge base of error patterns and fixes.
```

**Acceptance Criteria**:
1. IDE workspace has "Capture Debug Session" button
2. System collects terminal output, stack traces, file diffs
3. System generates Debug Note with root cause hypothesis
4. Debug Note includes minimal reproducible steps
5. Debug Note includes generalized fix pattern + local patch
6. Debug Note appears in Knowledge workspace
7. Debug Notes can be dragged onto Canvas
8. Canvas suggests common root cause clusters
9. System creates Concept Cards for repeated patterns
10. Drift detector flags stale notes when files change

**Dependencies**:
- P2-6: IDE ↔ Knowledge Bridge

**Technical Requirements**:
- Cross-workspace event bus: IDE → Knowledge
- Stack trace normalization and symbol extraction
- Context chunking: symptoms → environment → fixes
- Sanitization step for secrets/paths
- Drift detection for file changes

**Files to Modify**:
- `src/presentation/components/ide/AgentChatPanel.tsx` (capture button)
- `src/lib/ide/stack-trace-analyzer.ts` (may need creation)
- `src/lib/knowledge/synthesis-service.ts` (Debug Note synthesis)
- `src/lib/ide/drift-detector.ts` (may need creation)
- `src/infrastructure/events/cross-workspace-event-bus.ts` (IDE events)

**Test Cases**:
```typescript
describe('UC-02: IDE Debugging Vault', () => {
  it('should capture debug session in <60s', async () => {
    // Test capture performance
  });

  it('should generate Debug Note with root cause hypothesis', async () => {
    // Test Debug Note generation
  });

  it('should suggest common root cause clusters on Canvas', async () => {
    // Test Canvas clustering
  });

  it('should create Concept Cards for repeated patterns', async () => {
    // Test Concept Card creation
  });

  it('should flag stale notes within 1min of file changes', async () => {
    // Test drift detection
  });
});
```

---

## Part 3: Agent Delegation Strategy

### Delegation Pattern

For each story, use the following delegation pattern:

```markdown
@bmad-bmm-dev

**Task**: Implement [Story Name] (Story ID: XX-XX)

**Context**:
- Read the story file: `_bmad-output/sprint-artifacts/[story-id].md`
- Read the use case: `knowledge_synthesis_research/usecase-XX-[name].md`
- Reference architecture: `_bmad-output/platform-unification-assessment-2026-01-03.md`

**Acceptance Criteria**:
[Copy from story file]

**Expected Output**:
1. Code changes: [list files]
2. Tests created: [list test files]
3. TypeScript compilation: 0 errors
4. Manual testing: [list scenarios]
5. Story status update: [story-id] → done

**Return to**: @bmad-core-bmad-master with completion report
```

### Quality Gates

Before marking any story complete, verify:

1. **TypeScript**: `pnpm tsc --noEmit` (0 errors in production files)
2. **Tests**: `pnpm test` (all passing)
3. **Manual Testing**: Smoke test the feature
4. **Documentation**: Update relevant story files
5. **Code Review**: Run `@code-reviewer` for adversarial review

---

## Part 4: Iteration Schedule

### Iteration 1103-1105: P2-5 (File Sync Services)
- **Agent**: @bmad-bmm-dev
- **Time**: 8 hours (2-3 iterations)
- **Output**: StudyFilePicker and NotesPage working with real services

### Iteration 1106-1108: P2-6 (IDE-Knowledge Bridge)
- **Agent**: @bmad-bmm-dev
- **Time**: 10 hours (2-3 iterations)
- **Output**: IDE can send debug context to Knowledge workspace

### Iteration 1109-1110: P2-7 (Knowledge-Notes Export)
- **Agent**: @bmad-bmm-dev
- **Time**: 6 hours (2 iterations)
- **Output**: Knowledge workspace can export to Notes

### Iteration 1111-1113: P2-8 (Notes-Knowledge RAG)
- **Agent**: @bmad-bmm-dev
- **Time**: 8 hours (2-3 iterations)
- **Output**: Notes can be indexed for RAG in Knowledge

### Iteration 1114+: Epic 52 Stories
- **Agents**: @bmad-bmm-dev, @bmad-bmm-architect, @bmad-bmm-tea
- **Time**: 120-150 hours (30-40 iterations)
- **Output**: All 18 use cases functional

---

## Part 5: Progress Tracking

### Weekly Metrics

Track these metrics every 10 iterations:

```yaml
Integration Score:
  Workspace Connections: 6/24 → Target 20/24
  Use Case Feasibility: 17% → Target 80%
  P0 Issues: 0/8 resolved → 8/8 resolved ✅
  P1 Issues: 0/8 resolved → 8/8 resolved ✅
  P2 Issues: 4/8 resolved → Target 8/8

Code Quality:
  TypeScript Errors: 0 (production) ✅
  Test Pass Rate: 95%+
  Code Review Issues: <5 per story

Velocity:
  Stories Completed: X/18
  Hours Burned: X/150
  Iterations Elapsed: X/40
```

### Handoff Artifacts

Each story completion produces:

1. **Story File**: `_bmad-output/sprint-artifacts/[story-id].md`
2. **Context XML**: `_bmad-output/sprint-artifacts/[story-id]-context.xml`
3. **Dev Record**: Updated in story file
4. **Code Review**: Signed off in story file
5. **Sprint Status**: Updated `_bmad-output/sprint-artifacts/sprint-status.yaml`

---

## Part 6: Risk Mitigation

### Known Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| File System Access API breaks on mobile | High | Implement mobile fallback (IndexedDB-only) |
| Audio transcription API costs | Medium | Use local transcription (Web Speech API) |
| OCR performance on large batches | Medium | Batch processing with progress tracking |
| Cross-workspace event bus congestion | High | Implement event queue and debouncing |
| Use case scope creep | High | Strict story boundaries, prioritize P1 first |

### Escalation Triggers

Escalate to @bmad-core-bmad-master if:

1. Story exceeds 150% time estimate
2. TypeScript errors exceed 10 in production files
3. Test pass rate falls below 80%
4. Cross-workspace communication breaks
5. New critical bugs discovered

---

## Next Actions

1. ✅ **START**: Delegate P2-5 to @bmad-bmm-dev (Iteration 1103)
2. **NEXT**: Delegate P2-6 to @bmad-bmm-dev (Iteration 1106)
3. **NEXT**: Create Epic 52 story files (Iterations 1110-1113)
4. **NEXT**: Begin Epic 52 implementation (Iteration 1114+)

---

**Coordination Complete**
**Date**: 2026-01-03T15:00:00+07:00
**Next Review**: After P2-5 completion (Iteration 1105)

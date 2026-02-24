# Post-IDE Preparation Plan

**Document ID**: `post-ide-preparation-2026-01-18`
**Created**: 2026-01-18
**Epic**: CC-IDE-FSA (in progress)
**Status**: PLANNING

---

## Executive Summary

Once CC-IDE-FSA completes (8 stories, ~29 hours), the MVP will be feature-complete with:
- Notes Workspace (FSA on desktop, IndexedDB on mobile)
- IDE Workspace (FSA on desktop, redirect on mobile)
- Agent tools for both workspaces

This document outlines the recommended next steps with effort estimates, dependencies, and preparation tasks that can start NOW in parallel with IDE implementation.

---

## Recommended Next Epics (Priority Order)

### EPIC-CC-KNOWLEDGE: Knowledge Workspace (RAG Integration)

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 (High) |
| **Stories** | 6-8 |
| **Effort** | 24-32 hours |
| **Dependencies** | CC-IDE-FSA complete |
| **Blockers** | None (can prep now) |

**Scope**:
- RAG pipeline for knowledge base indexing
- Source document import (PDF, Markdown, etc.)
- Vector storage in DexieDB
- AI-powered search and synthesis
- Knowledge graph visualization

**Stories Breakdown**:
1. `CC-KNOW-01`: RAG Index Schema & Infrastructure (4h)
2. `CC-KNOW-02`: Document Import Pipeline (6h)
3. `CC-KNOW-03`: Vector Search Implementation (4h)
4. `CC-KNOW-04`: AI Synthesis Integration (6h)
5. `CC-KNOW-05`: Knowledge Graph UI (6h)
6. `CC-KNOW-06`: RAG Tests & Rollback (4h)

---

### EPIC-CC-STUDY: Study Workspace (Flashcards)

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 (Medium) |
| **Stories** | 5-6 |
| **Effort** | 18-24 hours |
| **Dependencies** | CC-IDE-FSA complete |
| **Blockers** | None (can prep now) |

**Scope**:
- Flashcard CRUD (create, edit, delete decks)
- Spaced repetition algorithm
- Quiz mode with scoring
- Progress tracking & statistics
- Import from Notes content

**Stories Breakdown**:
1. `CC-STUDY-01`: Flashcard Data Model (3h)
2. `CC-STUDY-02`: Deck Management UI (4h)
3. `CC-STUDY-03`: Spaced Repetition Algorithm (4h)
4. `CC-STUDY-04`: Quiz Mode & Scoring (4h)
5. `CC-STUDY-05`: Progress Tracking (3h)

---

### EPIC-CC-ARCH: Architecture Remediation (God Stores & Components)

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 (High) |
| **Stories** | 8-10 |
| **Effort** | 32-40 hours |
| **Dependencies** | None (can run in parallel) |
| **Blockers** | Deep scan results |

**Scope**:
- Eliminate god stores (>300 lines) via `Store Refactorer` agent
- Split oversized components (>300 lines) via `Component Splitter` agent
- TypeScript strict mode compliance
- Test coverage increase to 80%

**Target Areas** (from previous deep scans):
- `project-store`: 700+ lines → split into slices
- `note-slice.ts`: 500+ lines → extract focused slices
- `ide.$projectId.tsx`: 400+ lines → split components
- Various UI components needing normalization

---

### EPIC-CC-DESIGN: 8-bit Design Compliance

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 (Medium) |
| **Stories** | 6-8 |
| **Effort** | 20-28 hours |
| **Dependencies** | None (can run in parallel) |
| **Blockers** | Design system review |

**Scope**:
- Audit all components for 8-bit compliance
- Fix rounded corners (must be 0 or 2px)
- Remove transparency/glassmorphism
- Add pixel shadows
- Mobile-first responsive check

---

## Quick Wins (Can Start NOW)

### 1. DexieDB Schema Design for RAG

**Effort**: 2-3 hours
**Can Start**: Immediately
**Benefit**: Reduces CC-KNOW-01 by 50%

**Tasks**:
- Design vector storage schema
- Define chunk metadata structure
- Plan indexing strategy

### 2. Study Data Model Design

**Effort**: 2 hours
**Can Start**: Immediately
**Benefit**: Reduces CC-STUDY-01 to 1 hour

**Tasks**:
- Define Deck, Card, ReviewSession entities
- Plan spaced repetition metadata
- Design progress tracking schema

### 3. Component Audit for Splits

**Effort**: 3-4 hours
**Can Start**: Immediately
**Benefit**: Prepares for CC-ARCH

**Tasks**:
- Run deep-scan component scanner
- Identify >300 line components
- Plan split strategy

### 4. 8-bit Design Audit

**Effort**: 4 hours
**Can Start**: Immediately
**Benefit**: Prepares for CC-DESIGN

**Tasks**:
- Audit CSS for rounded corners
- Identify transparency violations
- Create fix checklist

---

## Parallel Preparation Tasks (Start During IDE)

| Task | Effort | Start When | Dependency |
|------|--------|------------|------------|
| RAG Schema Design | 3h | Now | None |
| Study Data Model | 2h | Now | None |
| Component Audit | 4h | Now | None |
| Design System Audit | 4h | Now | None |
| Test Coverage Baseline | 2h | IDE-04 | Tests defined |
| Migration Scripts | 3h | IDE-06 | Production data |

---

## Dependency Analysis

```
CC-IDE-FSA (current)
     ↓
CC-KNOWLEDGE ──────────────┐
     ↓                      │
CC-STUDY    ←── parallel ───┤
     ↓                      │
CC-ARCH     ←── parallel ───┤
     ↓                      │
CC-DESIGN   ←── parallel ───┘
```

**Key Insights**:
- Knowledge and Study can run in parallel after IDE
- Architecture remediation should run continuously
- Design compliance can start mid-IDE

---

## Effort Summary

| Epic | Stories | Hours | Priority | Blocked By |
|------|---------|-------|----------|------------|
| CC-IDE-FSA | 8 | 29 | P0 | Current |
| CC-KNOWLEDGE | 8 | 28 | P1 | CC-IDE-FSA |
| CC-STUDY | 6 | 20 | P2 | CC-IDE-FSA |
| CC-ARCH | 10 | 36 | P1 | Deep Scan |
| CC-DESIGN | 8 | 24 | P2 | Audit |
| **Total** | **40** | **137** | | |

---

## Recommended Sprint Sequence

### Sprint CC-IDE-FSA (current)
- 8 stories, 29 hours
- Focus: IDE FSA migration

### Sprint CC-ARCH-01 (parallel with IDE end)
- 5 stories, 18 hours
- Focus: God store elimination (Phase 1)

### Sprint CC-KNOWLEDGE-01
- 4 stories, 14 hours
- Focus: RAG infrastructure

### Sprint CC-STUDY-01
- 3 stories, 11 hours
- Focus: Flashcard data model

### Sprint CC-ARCH-02
- 5 stories, 18 hours
- Focus: Component splitting

---

## Success Criteria for IDE Completion

After CC-IDE-FSA, the following must be true:

1. ✅ Both Notes and IDE workspaces functional on desktop
2. ✅ FSA storage working for both workspaces
3. ✅ Agent tools registered and working
4. ✅ 0 TypeScript errors (pnpm tsc --noEmit)
5. ✅ Tests passing (pnpm vitest run)
6. ✅ Rollback procedures documented

**Once criteria met**, proceed to:
1. **If MVP complete**: Start CC-KNOWLEDGE or CC-ARCH
2. **If issues found**: Fix before next epic

---

## Preparation Checklist (Start NOW)

- [ ] Design RAG vector schema
- [ ] Design flashcard data model
- [ ] Run component deep scan
- [ ] Run design 8-bit audit
- [ ] Establish test coverage baseline
- [ ] Document migration procedures
- [ ] Review deep-scan results for CC-ARCH

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| IDE takes longer than estimated | High | Reduce scope, defer to next sprint |
| RAG performance issues | Medium | Start with simple embeddings |
| Test coverage too low | Medium | TDD for next epics |
| Design changes needed | Low | Audit before implementation |

---

## References

| Document | Path |
|----------|------|
| CC-IDE-FSA Sprint Status | `_bmad-output/sprint-artifacts/epic-cc-ide-fsa-sprint-2026-01-18.yaml` |
| Deep Scan Results | `_bmad-ext/.correct-course/deep-scan-*.md` |
| Previous Epic Analysis | `_bmad-ext/.correct-course/next-epic-analysis-2026-01-18.md` |
| ADR-033 Architecture | `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md` |

---

**Next Action**: Complete CC-IDE-FSA, then start either CC-KNOWLEDGE (high value) or CC-ARCH (foundation work) based on post-IDE assessment.

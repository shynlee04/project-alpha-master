---
date: 2025-12-30
time: 13:30:00+07:00
phase: Implementation - Corrective Action
team: Orchestrator
agent_mode: bmad-bmm-orchestrator
trigger: Ralph Loop Validation - 12-Level Framework Integration Gap
version: 1.0
status: active
---

# Corrective Course Plan: 12-Level Validation Framework Integration

**Trigger:** Ralph Loop identified that Epics 6, 7, 8, 9 are implemented but lack 12-Level validation framework checkpoints.

**Root Cause:** Stories created without validation framework integration checkpoints per `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`

**Scope:** Epics 6, 7, 8, 9 (Phase 2 stories)

---

## Executive Summary

Epics 6-9 have been marked "done" in sprint-status.yaml but lack proper 12-Level GRANDIOSE DEFINITION OF COMPLETION validation. This document outlines the corrective course to integrate validation checkpoints and ensure BMAD compliance.

---

## Current State Assessment

### Epic 6: Source Ingestion & Management ✅ DONE
- Stories 6-1, 6-2, 6-3, 6-4 complete
- Retrospective complete
- **Gap:** No 12-Level validation checkpoints

### Epic 7: RAG Infrastructure (Orama WASM) ⚠️ IN_PROGRESS
- Story 7-1 complete (Orama Index Management)
- Stories 7-2 through 7-6 backlog
- **Gap:** Story 7-1 lacks validation checkpoints

### Epic 8: Knowledge Canvas ✅ DONE
- Stories 8-1 through 8-5 complete
- Retrospective complete
- **Gap:** No 12-Level validation checkpoints

### Epic 9: Study Artifacts Generation ✅ DONE
- Stories 9-1 through 9-4 complete
- Retrospective complete
- **Gap:** No 12-Level validation checkpoints

---

## Corrective Actions Required

### Phase 1: Validation Framework Integration (Immediate)

#### 1.1 Create Validation Enhancement for Epic 6 Stories
- [ ] Enhance 6-4-source-metadata-extraction.md with 12-Level validation checkpoints
- [ ] Add frontmatter with `validation_levels: [1,2,3,4,5,6,7,8,9,10,11,12]`
- [ ] Add validation checklist table
- [ ] Create validation evidence documentation

#### 1.2 Create Validation Enhancement for Epic 7 Story
- [ ] Enhance 7-1-orama-index-management.md with 12-Level validation checkpoints
- [ ] Add frontmatter with validation framework metadata
- [ ] Add validation checklist table

#### 1.3 Create Validation Enhancement for Epic 8 Stories
- [ ] Enhance 8-1-react-flow-canvas-setup.md with 12-Level validation checkpoints
- [ ] Enhance 8-2-source-node-creation.md with validation checkpoints
- [ ] Enhance 8-3-concept-node-creation.md with validation checkpoints
- [ ] Enhance 8-4-connection-lines.md with validation checkpoints
- [ ] Enhance 8-5-canvas-persistence.md with validation checkpoints

#### 1.4 Create Validation Enhancement for Epic 9 Stories
- [ ] Enhance 9-1-flashcard-generator.md with 12-Level validation checkpoints
- [ ] Enhance 9-2-quiz-generator.md with validation checkpoints
- [ ] Enhance 9-3-flashcard-study-interface.md with validation checkpoints
- [ ] Enhance 9-4-quiz-taking-interface.md with validation checkpoints

### Phase 2: Validation Tracking Update

#### 2.1 Update sprint-status.yaml
- [ ] Add `validation_status` field for each epic
- [ ] Add `validation_gates` section tracking 12-Level checkpoints
- [ ] Document validation evidence for each completed story

#### 2.2 Create Validation Summary Document
- [ ] Create `_bmad-output/validation/epic-6-9-validation-summary-2025-12-30.md`
- [ ] Document validation status for all stories
- [ ] Track remaining validation work

### Phase 3: Backlog Stories (Future Sprints)

#### 3.1 Epic 7 Backlog (Stories 7-2 through 7-6)
- [ ] When stories are created, include 12-Level validation checkpoints from the start
- [ ] Reference this correct-course document for template

#### 3.2 Epic 10 and Beyond
- [ ] Ensure all new stories include 12-Level validation framework
- [ ] Use enhanced story template

---

## 12-Level Validation Checkpoint Template

Each story file should include:

```markdown
## Validation Checklist (12-Level GRANDIOSE DEFINITION OF COMPLETION)

| Level | Validation Checkpoint | Status | Evidence |
|-------|----------------------|--------|----------|
| **L1** | Functional Completeness: [AC description] | ⬜ | [Test/Screenshot] |
| **L2** | Architectural Compliance: [Pattern reference] | ⬜ | [Code review] |
| **L3** | Implementation Patterns: [Convention check] | ⬜ | [ESLint/Pattern] |
| **L4** | NFR Details: [Performance/Accessibility] | ⬜ | [Audit result] |
| **L5** | i18n Requirements: All strings translated | ⬜ | [i18n check] |
| **L6** | Test Coverage: Unit tests passing | ⬜ | [Coverage report] |
| **L7** | Documentation: Components documented | ⬜ | [JSDoc check] |
| **L8** | Code Review: Peer review completed | ⬜ | [PR link] |
| **L9** | Deployment: No breaking changes | ⬜ | [Build test] |
| **L10** | UAC: User acceptance criteria met | ⬜ | [User testing] |
| **L11** | Demo Checkpoint: Demo captured | ⬜ | [Screenshot/Video] |
| **L12** | BMAD Compliance: All levels validated | ⬜ | [Checklist review] |
```

---

## Frontmatter Enhancement Template

```yaml
---
title: "[Story Title]"
epic: "[Epic Name]"
story: "[story-id]"
status: "done" | "in_progress" | "backlog"
priority: "P0" | "P1" | "P2"
points: [number]
created: "YYYY-MM-DD"
sprint: "[Sprint Name]"
team: "Team A" | "Team B" | "Both"
validation_framework: "12-level-grandiose-definition-of-completion"
validation_levels: [1,2,3,4,5,6,7,8,9,10,11,12]
last_validated: "YYYY-MM-DDTHH:mm:ss+07:00"
validated_by: "[agent-name]"
phase: story-dev-cycle
dependencies: []
blockers: []
nfr_validated:
  - [NFR-ID]
tech_stack:
  - [technology]
---
```

---

## Success Criteria

1. **All completed stories (6-1 through 6-4, 7-1, 8-1 through 8-5, 9-1 through 9-4) have 12-Level validation checkpoints**
2. **Frontmatter includes validation_framework and validation_levels fields**
3. **sprint-status.yaml updated with validation status tracking**
4. **Validation summary document created**
5. **Health score improved to 85+**

---

## Execution Timeline

| Phase | Action | Owner | Deadline |
|-------|--------|-------|----------|
| 1.1-1.4 | Enhance story files with validation checkpoints | @bmad-bmm-orchestrator | 2025-12-30 |
| 2.1 | Update sprint-status.yaml | @bmad-bmm-orchestrator | 2025-12-30 |
| 2.2 | Create validation summary | @bmad-bmm-orchestrator | 2025-12-30 |
| 3.1-3.2 | Future backlog stories | @bmad-bmm-dev | Future sprints |

---

## Next Steps

1. **IMMEDIATE:** Execute Phase 1 (enhance story files)
2. **SHORT-TERM:** Complete Phase 2 (update tracking)
3. **MEDIUM-TERM:** Apply lessons learned to future stories

---

**Document Status:** Active - Awaiting Execution
**Next Review:** After Phase 1 completion
**Maintained By:** @bmad-bmm-orchestrator
**Approved By:** @bmad-core-bmad-master

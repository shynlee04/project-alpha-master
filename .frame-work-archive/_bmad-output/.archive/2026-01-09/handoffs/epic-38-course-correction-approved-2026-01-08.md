# 🔄 EPIC-38 Course Correction - APPROVED

**Document Type**: Handoff Artifact  
**Timestamp**: 2026-01-08T04:04:14+07:00  
**Triggered By**: correct-course-38-04.md  
**Analysis Method**: Ultrathink (5-step Sequential Thinking)  
**Status**: ✅ APPROVED - Option B (Create Domain Layer First)  
**Agent**: @bmad-core-bmad-master  
**Team**: BMAD Orchestration

---

## Executive Summary

Story 38-04 investigation discovered **130 infrastructure→lib import violations** (not 32 as originally documented, and not 106 as reported in the course-correction trigger). After comprehensive ultrathink analysis, **Option B (Create Domain Layer First)** has been approved as the correct path forward.

### Key Discovery

The domain layer **already exists** at `src/domain/` with:
- `entities/agent.ts` (208 lines - production-ready)
- `services/` (5 files)
- `value-objects/` (3 files)
- `use-cases/` (1 file)

This reduces scope from the original estimate since we are EXTENDING an existing structure, not creating one from scratch.

---

## Decision Matrix

| Option | Approach | Effort | Root Cause Fix | Tech Debt | Decision |
|--------|----------|--------|----------------|-----------|----------|
| **A** | Fix imports in-place | 4-6h | ❌ No | Creates debt | ❌ REJECTED |
| **B** | Create domain layer first | 8-10h | ✅ Yes | Removes debt | ✅ APPROVED |
| **C** | Defer domain layer | 2-3h | ❌ No | Defers debt | ❌ REJECTED |

---

## Revised EPIC-38 Story Breakdown

### Summary Changes

| Metric | Original | Revised | Delta |
|--------|----------|---------|-------|
| **Total Stories** | 18 | 21 | +3 new |
| **Total Effort** | ~33h | ~41-43h | +8-10h |
| **Story 38-04 Effort** | 2h | 4h | +2h (130 vs 32 imports) |
| **Story 38-06 Scope** | Workspace + Agent | Workspace only | -1h (Agent.ts exists) |

### New Stories Added

| Story ID | Title | Effort | Priority | Dependencies |
|----------|-------|--------|----------|--------------|
| **38-05b** | Create domain/entities/rag.ts | 3h | P0 | After 38-05 |
| **38-05c** | Create domain/entities/knowledge.ts | 1.5h | P0 | After 38-05 |
| **38-05d** | Create domain/entities/study.ts | 2h | P0 | After 38-05 |

### Modified Stories

| Story ID | Change | Reason |
|----------|--------|--------|
| **38-04** | Status: BLOCKED → Effort: 4h | 130 imports (not 32), depends on domain types |
| **38-06** | Scope: Workspace.ts only | Agent.ts already exists in domain/entities/ |

---

## Revised Story Execution Sequence

```
┌─────────────────────────────────────────────────────────────────────┐
│ PARALLEL TRACK A: Sync Types (No Dependency Changes)               │
├─────────────────────────────────────────────────────────────────────┤
│ 38-01: Move sync-types.ts to infrastructure/sync/types (1h)        │
│    ↓                                                                │
│ 38-02: Move file system adapters to infrastructure/filesystem (2h) │
│    ↓                                                                │
│ 38-03: Create facade exports in lib/filesystem (1h)                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PARALLEL TRACK B: Domain Entities (Can run parallel to Track A)    │
├─────────────────────────────────────────────────────────────────────┤
│ 38-05: Create domain/entities/Project.ts (2h)                      │
│    ↓                                                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PARALLEL: 38-05b, 38-05c, 38-05d (can run together)             │ │
│ │                                                                  │ │
│ │ 38-05b: Create domain/entities/rag.ts (3h)                      │ │
│ │ 38-05c: Create domain/entities/knowledge.ts (1.5h)              │ │
│ │ 38-05d: Create domain/entities/study.ts (2h)                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│    ↓                                                                │
│ 38-06: Create domain/entities/Workspace.ts (1.5h)                  │
│        (Agent.ts ALREADY EXISTS - no work needed)                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SEQUENTIAL: After Both Tracks Complete                              │
├─────────────────────────────────────────────────────────────────────┤
│ 38-04: Update 130 infrastructure→domain imports (4h) ← UNBLOCKED   │
│    ↓                                                                │
│ 38-07: Update infrastructure to import from domain entities (2h)   │
│    ↓                                                                │
│ 38-08: Update application layer to use domain entities (2h)        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ REMAINING: Repository Pattern + ESLint (Unchanged)                  │
├─────────────────────────────────────────────────────────────────────┤
│ 38-09 → 38-10 → 38-11 → 38-12 → 38-13 → 38-14 (Repositories, DI)   │
│ 38-15 → 38-16 → 38-17 (Context refactoring)                        │
│ 38-18 (ESLint import plugin - can run parallel after 38-04)        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## New Story Acceptance Criteria

### Story 38-05b: Create domain/entities/rag.ts

**Effort**: 3h  
**Priority**: P0  
**Dependencies**: After 38-05 establishes entity pattern

**Acceptance Criteria**:
- [ ] Extract from `lib/rag/types.ts` (~530 lines):
  - DocumentSchema, SearchResult, IndexMetadata, IndexConfig, IndexStatus
  - ChunkMetadata, ChunkingProgress, ChunkingOptions, ChunkingStrategy
  - EmbeddingVector, EmbeddingMode, EmbeddingProgress, EmbeddingConfig
  - ChatMessage, Citation, RAGConfig
- [ ] Pure TypeScript (no framework imports like React, Zustand)
- [ ] Follow Agent entity pattern (immutable properties, validation)
- [ ] Create barrel export: `domain/entities/rag/index.ts`
- [ ] Update 35 infrastructure imports to use domain/entities/rag
- [ ] TypeScript: Zero new errors

**Files to Modify**:
- `src/infrastructure/persistence/stores/rag/*.ts` (update imports)
- `src/infrastructure/persistence/rag-store-types.ts` (update imports)

---

### Story 38-05c: Create domain/entities/knowledge.ts

**Effort**: 1.5h  
**Priority**: P0  
**Dependencies**: After 38-05 establishes entity pattern

**Acceptance Criteria**:
- [ ] Extract from `lib/knowledge/types.ts` (~135 lines):
  - Flashcard, FlashcardSet, FlashcardPreview
  - FlashcardFilter, FlashcardRecord, FlashcardSetRecord
  - FlashcardDifficulty, FlashcardGenerationRequest
- [ ] Include Zod schemas if needed for domain validation
- [ ] Pure TypeScript (no framework imports)
- [ ] Create barrel export: `domain/entities/knowledge/index.ts`
- [ ] Update 20 infrastructure imports to use domain/entities/knowledge
- [ ] TypeScript: Zero new errors

**Files to Modify**:
- `src/infrastructure/persistence/stores/flashcard/slices/*.ts` (update imports)
- `src/infrastructure/persistence/stores/knowledge/types.ts` (update imports)

---

### Story 38-05d: Create domain/entities/study.ts

**Effort**: 2h  
**Priority**: P0  
**Dependencies**: After 38-05 establishes entity pattern

**Acceptance Criteria**:
- [ ] Extract from `lib/study/*` directory:
  - SRSData, StudySession, StudyProgress types
  - Quiz types and spaced repetition models
  - Session state types
- [ ] Pure TypeScript (no framework imports)
- [ ] Create barrel export: `domain/entities/study/index.ts`
- [ ] Update 17 infrastructure imports to use domain/entities/study
- [ ] TypeScript: Zero new errors

**Files to Modify**:
- `src/infrastructure/persistence/stores/study/*.ts` (update imports)

---

## Import Violation Breakdown

| Category | Count | Source Path | Target Entity |
|----------|-------|-------------|---------------|
| **RAG types** | 35 | `lib/rag/types` | `domain/entities/rag` |
| **Knowledge types** | 20 | `lib/knowledge/*` | `domain/entities/knowledge` |
| **Study types** | 17 | `lib/study/*` | `domain/entities/study` |
| **Canvas types** | 8 | `lib/canvas/*` | Future epic |
| **Workspace/filesystem** | 25 | `lib/filesystem/*`, `lib/workspace/*` | 38-01 to 38-03 handle |
| **Plugin types** | 8 | `lib/plugins/*` | Future epic |
| **Event bus** | 10 | `lib/events/*` | Document as tech debt |
| **Other** | 7 | `lib/analytics/*`, `lib/notifications/*` | Future epic |
| **TOTAL** | **130** | | |

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Scope increase (+8-10h) | MEDIUM | Parallel execution of Tracks A & B |
| Import update errors | MEDIUM | TypeScript check after each story |
| Breaking changes | LOW | Facade exports maintain backward compatibility |
| Agent.ts duplication | LOW | Verified Agent.ts already exists in domain/ |

---

## Immediate Actions for Dev Team

### Team A (Frontend/UI Focus)
1. **START NOW**: Story 38-01 (Move sync-types.ts)
2. **THEN**: Stories 38-02, 38-03 sequentially
3. **PARALLEL**: Can assist with 38-05b, 38-05c after 38-03

### Team B (Architecture Focus)
1. **START NOW**: Story 38-05 (Create Project.ts entity)
2. **THEN**: Stories 38-05b, 38-05c, 38-05d (can run in parallel)
3. **THEN**: Story 38-06 (Workspace.ts only)

### Sync Point
- **38-04 UNBLOCKED** when: Track A (38-03) AND Track B (38-06) complete
- Estimated unblock: +6-8 hours from now

---

## Quality Gates

### Before Starting Any Story
- [ ] Read Agent.ts in `domain/entities/` as pattern reference
- [ ] Verify no build errors in current state
- [ ] Identify all files that need import updates

### After Each Story
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run lint` passes
- [ ] No circular dependencies introduced
- [ ] Story file updated with completion notes

### Before 38-04 (Unblocking Gate)
- [ ] All domain entities created (Project, RAG, Knowledge, Study, Workspace)
- [ ] All entity barrel exports working
- [ ] Import paths documented

---

## Handoff Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Original trigger | `_bmad-output/handoffs/correct-course-38-04.md` | Complete |
| This approval | `_bmad-output/handoffs/epic-38-course-correction-approved-2026-01-08.md` | ✅ Created |
| Updated epics.md | `_bmad-output/planning-artifacts/epics.md` | ✅ Updated |
| Updated sprint-status.yaml | `_bmad-output/sprint-artifacts/sprint-status.yaml` | ✅ Updated |

---

## Sign-Off

| Field | Value |
|-------|-------|
| **Document Type** | Course Correction Approval |
| **Epic** | EPIC-38 (Clean Architecture Compliance) |
| **Decision** | Option B (Create Domain Layer First) APPROVED |
| **Revised Effort** | ~41-43 hours (was ~33 hours) |
| **New Stories** | 38-05b, 38-05c, 38-05d |
| **Blocked Story** | 38-04 (unblocks after 38-06) |
| **Analysis Agent** | @bmad-core-bmad-master |
| **Timestamp** | 2026-01-08T04:04:14+07:00 |
| **Phase** | Implementation, Sprint 1 |
| **Handoff To** | @bmad-bmm-dev (Team A, Team B) |

---

**Next Workflow**: `/bmad-bmm-workflows-dev-story` for Story 38-01 or 38-05

*Generated by BMAD Master Orchestrator via Ultrathink Analysis*

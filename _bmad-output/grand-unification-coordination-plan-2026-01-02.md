---
name: Grand Unification Refactor - BMAD Coordination Plan
description: Coordination plan for integrating Ralph Wiggum cycle with BMAD V6 framework
version: 1.0.0
author: @bmad-core-bmad-master
created: 2026-01-02T12:00:00+07:00
phase: Foundation Stabilization
trigger: Architectural drift between legacy IDE and Knowledge Synthesis systems
---

# Grand Unification Refactor - BMAD Coordination Plan

**Status:** 🔄 COORDINATION IN PROGRESS
**Framework:** BMAD V6 + Ralph Wiggum Refactoring Cycle
**Objective:** Unify fragmented state management across 4 workspaces (IDE, Knowledge, Study, Notes)

---

## Executive Summary

### Current Situation (Ralph Loop Cycle 18 Findings)

**Governance Misalignment:**
- **Previous Claim:** Health Score 100/100 ✅ (Iteration 177)
- **Actual Reality:** Health Score ~5.9% (1,172 TypeScript errors remaining)
- **Decision:** ✅ IMMEDIATE COURSE CORRECTION APPROVED

**Critical Issues:**
1. **P0 Data Loss Risk:** 79 files with direct IndexedDB operations, no quota handling
2. **P0 Silent Failures:** 23 locations with `console.error + return null` pattern
3. **P1 Maintainability Collapse:** 17 files exceed 300-line limit (worst: 9x over limit)
4. **P1 Store Fragmentation:** 71 total stores across 3 locations with circular dependencies

### Architectural Drift Problem

**Legacy IDE (Brownfield):**
- Uses `useState` for local state
- Separate stores for each workspace
- Hardcoded agent/LLM configurations
- File tree isolated to IDE workspace

**Knowledge Synthesis (Greenfield):**
- Uses Zustand + Dexie stores
- Shared RAG infrastructure
- Dynamic agent/LLM configuration
- Unified file system access

**Result:** Two systems operating in silos with no shared state or data flow.

---

## Ralph Wiggum Integration with BMAD V6

### The "Ralph Wiggum" Refactoring Cycle

**Purpose:** Autonomous AI agent iteration to unify fragmented architecture
**Framework:** Single Source of Truth (SSoT) mandates
**Validation:** `pnpm tsc --noEmit && pnpm test` after every change
**Completion Signal:** All 4 workspaces share unified stores and data flows

### Integration Points

| BMAD Component | Ralph Wiggum Element | Integration Method |
|----------------|---------------------|-------------------|
| **Epic Definition** | Target A/B/C | Map targets to BMAD epics |
| **Story Breakdown** | Iteration tasks | Create stories for each iteration |
| **Tech-Spec Generation** | Scan → Action → Verify | Architect mode creates specs |
| **Sprint Planning** | Atomic fixes per iteration | PM mode plans iterations |
| **Story Development** | Fix one store/component chain | Dev mode implements |
| **Code Review** | Validation run | Code reviewer validates |
| **Retrospective** | Completion signal update | Document lessons learned |

---

## 4 Spec-Driven Use Cases → BMAD Epic Structure

### Use Case 1: Initial Vault Population & Baseline Synthesis
**Epic ID:** GU-01 (Grand Unification - Epic 1)
**Epic Name:** Unified Vault Ingestion & Synthesis
**Priority:** P0 (Foundation)
**Estimated Effort:** 5 days
**Team Assignment:** Team B (Backend/Agent)

**Story Breakdown:**

| Story ID | Story Name | Acceptance Criteria | Estimated |
|----------|-----------|-------------------|-----------|
| GU-01-1 | Multi-Format File Parser | Detect file types (PDF, IMG, MD, Audio) and dispatch to appropriate parsers | 1 day |
| GU-01-2 | Raw Content Indexer | SHA-256 hashing, OPFS storage, 512-token chunking, Orama embedding | 2 days |
| GU-01-3 | Synthesis Agent Orchestrator | Agent with Synthesizer capability, metadata extraction, sidecar JSON creation | 1.5 days |
| GU-01-4 | Source Manager UI Integration | Real-time updates, parsing → embedding → synthesized status indicators | 0.5 days |

**Dependencies:**
- Target B (File System Unification) must be complete
- Epic 7 (RAG Infrastructure) must be complete

### Use Case 2: Interactive Canvas Knowledge Linkage Discovery
**Epic ID:** GU-02
**Epic Name:** Unified Knowledge Graph Linkage
**Priority:** P1 (Enhancement)
**Estimated Effort:** 4 days
**Team Assignment:** Team A (UI/Foundation)

**Story Breakdown:**

| Story ID | Story Name | Acceptance Criteria | Estimated |
|----------|-----------|-------------------|-----------|
| GU-02-1 | Multi-Node Context Retrieval | Extract metadata from 3+ selected nodes | 1 day |
| GU-02-2 | Semantic Intersection Engine | Cosine similarity calculation, concept extraction | 1.5 days |
| GU-02-3 | Dynamic Edge Renderer | 4 relationship types (Strong, Sequential, Contrast, Prerequisite) | 1 day |
| GU-02-4 | Synthesis Proposal UI | "Create Integrative Summary?" prompt with cluster highlight | 0.5 days |

**Dependencies:**
- Epic 8 (Knowledge Canvas) must be complete
- GU-01 (Vault Population) must be complete

### Use Case 3: Conversational Knowledge Exploration Session
**Epic ID:** GU-03
**Epic Name:** Unified Chat Orchestration
**Priority:** P0 (Foundation)
**Estimated Effort:** 3 days
**Team Assignment:** Team B (Backend/Agent)

**Story Breakdown:**

| Story ID | Story Name | Acceptance Criteria | Estimated |
|----------|-----------|-------------------|-----------|
| GU-03-1 | Intent Classification Layer | Detect Retrieval + Cross-Reference intents | 0.5 days |
| GU-03-2 | Multi-Hop Retrieval Engine | Query 1 → VectorStore → Query 2 → VectorStore | 1.5 days |
| GU-03-3 | Context Construction Pipeline | Assemble chunks + metadata + citations | 0.5 days |
| GU-03-4 | Artifact Creation Flow | "Shall I create comparison table?" with file tree integration | 0.5 days |

**Dependencies:**
- Target C (Chat & Thread Unification) must be complete
- Epic 32 (RAG Infrastructure Enhancement) should be complete

### Use Case 4: Dynamic Knowledge Matrix Evolution
**Epic ID:** GU-04
**Epic Name:** Adaptive Knowledge Taxonomy
**Priority:** P2 (Optimization)
**Estimated Effort:** 4 days
**Team Assignment:** Team A (UI/Foundation)

**Story Breakdown:**

| Story ID | Story Name | Acceptance Criteria | Estimated |
|----------|-----------|-------------------|-----------|
| GU-04-1 | Clustering Algorithm Integration | K-Means on embeddings, taxonomy labeling | 1.5 days |
| GU-04-2 | Connectivity Score Calculator | Degree of centrality for each node | 1 day |
| GU-04-3 | View Proposal Engine | Chronological, Conceptual, Hybrid views | 1 day |
| GU-04-4 | Virtual Taxonomy Persistence | Virtual folders in ProjectMeta, physical files untouched | 0.5 days |

**Dependencies:**
- GU-02 (Knowledge Graph) must be complete
- Target B (File System Unification) must be complete

---

## Target A/B/C → BMAD Sprint Structure

### Target A: LLM & Agent Config Unification
**Sprint ID:** GU-TARGET-A
**Duration:** 3 days
**Goal:** One persistent `LLMStore` for all workspaces

**Iteration Plan:**

| Iteration | Task | Scan | Action | Verify |
|-----------|------|------|--------|--------|
| A-1 | Find all `useState` for API keys | Grep for `useState.*api[key|Key]` | Migrate to `useLLMStore` | Key change updates Chat agent without reload |
| A-2 | Find all `useState` for Model selection | Grep for `useState.*model` | Migrate to `useLLMStore` | Model change propagates to all workspaces |
| A-3 | Find agent capability hardcoding | Grep for `canEditFiles|canSearchWeb` | Migrate to `AgentStore` with capabilities | Workspace filters agents by capability |

**Validation:** `pnpm tsc --noEmit && pnpm test`

### Target B: File System Unification
**Sprint ID:** GU-TARGET-B
**Duration:** 4 days
**Goal:** Single `useFileSystem` hook for all workspaces

**Iteration Plan:**

| Iteration | Task | Scan | Action | Verify |
|-----------|------|------|--------|--------|
| B-1 | Identify IDE file tree vs SourceManager | Find `FileTree` component usage | Abstract to `useFileSystem` hook | File created in IDE shows in Knowledge |
| B-2 | Unify OPFS/FSA adapter access | Find all `LocalFSAdapter` usage | Create unified facade | Drag PDF to Knowledge → appears in IDE |
| B-3 | Synchronize file metadata | Find file metadata stores | Create unified file metadata store | Edit `.md` in IDE → updates Knowledge node |

**Validation:** File sync works bidirectionally between IDE and Knowledge workspaces

### Target C: Chat & Thread Unification
**Sprint ID:** GU-TARGET-C
**Duration:** 3 days
**Goal:** Single `GlobalChatOrchestrator` for all workspaces

**Iteration Plan:**

| Iteration | Task | Scan | Action | Verify |
|-----------|------|------|--------|--------|
| C-1 | Check `ChatPanel` vs `KnowledgeChat` | Find chat component variants | Create `GlobalChatOrchestrator` | Chat history persists across tabs |
| C-2 | Unify thread persistence | Find all thread stores | Migrate to `ThreadStore` with context | Thread context switches (Codebase vs Vault) |
| C-3 | Unify message rendering | Find message components | Create unified message renderer | Consistent chat UI across workspaces |

**Validation:** Chat session survives workspace switch without data loss

---

## Ralph Wiggum Execution Protocol

### Phase 1: Discovery & Planning (Week 1)

**Day 1-2: Architectural Analysis**
- **Agent:** `@bmad-bmm-architect`
- **Tasks:**
  1. Create technical specifications for Targets A, B, C
  2. Map store dependencies and circular references
  3. Identify god components for refactoring
  4. Design unified store architecture
- **Output:**
  - `_bmad-output/tech-specs/target-a-llm-unification.md`
  - `_bmad-output/tech-specs/target-b-file-system-unification.md`
  - `_bmad-output/tech-specs/target-c-chat-unification.md`

**Day 3-5: Sprint Planning**
- **Agent:** `@bmad-bmm-pm`
- **Tasks:**
  1. Break down Targets A, B, C into stories
  2. Assign story points and dependencies
  3. Create sprint backlog
  4. Update `bmm-workflow-status.yaml`
- **Output:**
  - `_bmad-output/sprint-artifacts/grand-unification-sprint-plan.md`
  - Updated `bmm-workflow-status.yaml` with GU epics

### Phase 2: Foundation Stabilization (Week 2-8)

**Week 2-3: Target A (LLM & Agent Config)**
- **Agent:** `@bmad-bmm-dev`
- **Iterations:** A-1, A-2, A-3
- **Validation:** Run `pnpm tsc --noEmit && pnpm test` after each iteration
- **Completion Signal:** Changing API key in Settings updates Chat agent immediately

**Week 4-5: Target B (File System)**
- **Agent:** `@bmad-bmm-dev`
- **Iterations:** B-1, B-2, B-3
- **Validation:** File sync test suite (bidirectional sync)
- **Completion Signal:** File operations synchronized across all workspaces

**Week 6-7: Target C (Chat & Thread)**
- **Agent:** `@bmad-bmm-dev`
- **Iterations:** C-1, C-2, C-3
- **Validation:** Chat session persistence test
- **Completion Signal:** Chat history persists when switching tabs

**Week 8: Integration Testing**
- **Agent:** `@bmad-bmm-tea` + `@code-reviewer`
- **Tasks:**
  1. End-to-end testing across all 4 workspaces
  2. Code review for god component elimination
  3. TypeScript error validation
  4. Performance profiling
- **Completion Signal:** All 4 workspaces share unified stores with zero data loss

### Phase 3: Feature Implementation (Week 9+)

**Epic GU-01: Unified Vault Ingestion**
- **Team:** Team B (Backend/Agent)
- **Stories:** GU-01-1 through GU-01-4
- **Integration:** Use Case 1 workflow

**Epic GU-02: Knowledge Graph Linkage**
- **Team:** Team A (UI/Foundation)
- **Stories:** GU-02-1 through GU-02-4
- **Integration:** Use Case 2 workflow

**Epic GU-03: Unified Chat Orchestration**
- **Team:** Team B (Backend/Agent)
- **Stories:** GU-03-1 through GU-03-4
- **Integration:** Use Case 3 workflow

**Epic GU-04: Adaptive Taxonomy**
- **Team:** Team A (UI/Foundation)
- **Stories:** GU-04-1 through GU-04-4
- **Integration:** Use Case 4 workflow

---

## BMAD Handoff Documents

### When DELEGATING to Architect Mode:

```
Handoff to @bmad-bmm-architect

Task: Create technical specifications for Target A (LLM & Agent Config Unification)

Context Files:
- PROMPT.md (Ralph Wiggum framework)
- CLAUDE.md (project-specific guidance)
- _bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md

Acceptance Criteria:
1. Complete architectural analysis of current LLM/Agent config fragmentation
2. Design unified LLMStore architecture with Dexie persistence
3. Map store dependencies and identify circular references
4. Provide implementation roadmap with clear phases

Output Location: _bmad-output/tech-specs/target-a-llm-unification-{YYYY-MM-DD}.md

Return via: Report to @bmad-core-bmad-master with completion summary
```

### When DELEGATING to Dev Mode:

```
Handoff to @bmad-bmm-dev

Task: Implement Target A Iteration 1 (Migrate API keys to useLLMStore)

Context Files:
- _bmad-output/tech-specs/target-a-llm-unification-{date}.md
- src/lib/state/providers/*.ts (current LLM stores)
- src/components/agent/AgentConfigDialog.tsx (API key UI)

Constraints:
- Follow Ralph Wiggum atomic fix principle (one store/component chain per iteration)
- No god components (max 300 lines per file)
- Remove all commented-out legacy code
- Run pnpm tsc --noEmit && pnpm test after changes

Validation:
- Changing API key in Settings immediately updates Chat agent without reload
- Zero TypeScript errors introduced
- All existing tests pass

Output Location: Implementation in src/
Return via: Report to @bmad-core-bmad-master with commit summary
```

### When DELEGATING to Code Reviewer:

```
Handoff to @code-reviewer

Task: Validate Target A completion (LLM & Agent Config Unification)

Context Files:
- _bmad-output/tech-specs/target-a-llm-unification-{date}.md
- Git diff for Target A changes
- pnpm tsc --noEmit output
- pnpm test output

Validation Checklist:
1. All useState for API keys migrated to useLLMStore ✓
2. Key change updates Chat agent without reload ✓
3. No circular dependencies introduced ✓
4. TypeScript compilation successful (zero errors) ✓
5. All tests passing ✓
6. No god components created (>300 lines) ✓
7. Code hygiene maintained (no commented code) ✓

Output Location: _bmad-output/code-reviews/target-a-validation-{YYYY-MM-DD}.md

Return via: Report to @bmad-core-bmad-master with approval/rejection
```

---

## Workflow Status Updates

### Update bmm-workflow-status.yaml

Add new section to `bmm-workflow-status.yaml`:

```yaml
# GRAND UNIFICATION REFACTOR (Ralph Wiggum Cycle)
# ================================================
# Trigger: Architectural drift between legacy IDE and Knowledge Synthesis
# Framework: BMAD V6 + Ralph Wiggum Refactoring Cycle
# Start Date: 2026-01-02

grand_unification:
  status: in_progress
  phase: "Foundation Stabilization"
  started_at: "2026-01-02T12:00:00+07:00"
  module: "grand-unification-refactor"

  # TARGET A: LLM & Agent Config Unification (3 days)
  target_a:
    status: backlog
    priority: "P0"
    goal: "One persistent LLMStore for all workspaces"
    iterations:
      a-1:
        name: "Migrate API keys to useLLMStore"
        status: "backlog"
        started_at: null
        completed_at: null
      a-2:
        name: "Migrate Model selection to useLLMStore"
        status: "backlog"
        started_at: null
        completed_at: null
      a-3:
        name: "Migrate agent capabilities to AgentStore"
        status: "backlog"
        started_at: null
        completed_at: null

  # TARGET B: File System Unification (4 days)
  target_b:
    status: backlog
    priority: "P0"
    goal: "Single useFileSystem hook for all workspaces"
    iterations:
      b-1:
        name: "Unify IDE file tree with SourceManager"
        status: "backlog"
        started_at: null
        completed_at: null
      b-2:
        name: "Create unified OPFS/FSA adapter facade"
        status: "backlog"
        started_at: null
        completed_at: null
      b-3:
        name: "Synchronize file metadata across workspaces"
        status: "backlog"
        started_at: null
        completed_at: null

  # TARGET C: Chat & Thread Unification (3 days)
  target_c:
    status: backlog
    priority: "P0"
    goal: "Single GlobalChatOrchestrator for all workspaces"
    iterations:
      c-1:
        name: "Create GlobalChatOrchestrator"
        status: "backlog"
        started_at: null
        completed_at: null
      c-2:
        name: "Unify thread persistence with context"
        status: "backlog"
        started_at: null
        completed_at: null
      c-3:
        name: "Create unified message renderer"
        status: "backlog"
        started_at: null
        completed_at: null

  # EPICS (Spec-Driven Use Cases)
  epics:
    gu-01:
      name: "Unified Vault Ingestion & Synthesis"
      status: backlog
      priority: "P0"
      team: "Team B"
      stories: 4
      dependencies: ["Target B", "Epic 7"]
    gu-02:
      name: "Unified Knowledge Graph Linkage"
      status: backlog
      priority: "P1"
      team: "Team A"
      stories: 4
      dependencies: ["Epic 8", "GU-01"]
    gu-03:
      name: "Unified Chat Orchestration"
      status: backlog
      priority: "P0"
      team: "Team B"
      stories: 4
      dependencies: ["Target C", "Epic 32"]
    gu-04:
      name: "Adaptive Knowledge Taxonomy"
      status: backlog
      priority: "P2"
      team: "Team A"
      stories: 4
      dependencies: ["GU-02", "Target B"]

  completion_promise: >
    All 4 Workspaces (IDE, Knowledge, Study, Notes) share unified Zustand stores,
    identical LLM/Agent config, and synchronized file access.

  validation_command: "pnpm tsc --noEmit && pnpm test"

  completion_signal: "DONE"
```

---

## Success Metrics

### Ralph Wiggum Completion Criteria

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| **TypeScript Errors** | 1,172 | <100 | `pnpm tsc --noEmit` |
| **File Size Violations** | 17 files >300 lines | 0 files | Automated lint check |
| **Store Consolidation** | 71 stores across 3 locations | <20 stores in 1 location | Manual count |
| **Circular Dependencies** | 4 high-risk cycles | 0 cycles | Dependency analysis |
| **Data Loss Risk** | P0 (79 files no quota handling) | P0 resolved | Safe wrapper implementation |
| **Silent Failures** | 23 instances | 0 instances | Error handling audit |

### Phase 1 Foundation Stabilization (Week 1-8)

- ✅ TS-001: Fix TypeScript Errors (6-8 hours)
- ✅ DB-001: Safe IndexedDB Operations (18-22 hours)
- ✅ UI-001: Extract AgentConfigDialog Hooks (16-20 hours)

### Phase 2 Store Refactoring (Week 9-10)

- Consolidate 71 stores into <20 unified stores
- Eliminate all circular dependencies
- Implement 4-layer architecture

### Phase 3 Infrastructure Hardening (Week 11-12)

- Fix P1 gaps (file size violations, god components)
- Implement proper error handling
- Add quota handling to all IndexedDB operations

### Phase 4 Architecture Transformation (Week 13-14)

- Complete 4-layer clean architecture
- Zero god components
- All data flows unified

---

## Next Actions

### Immediate (Today)

1. ✅ **PROMPT.md Created** - Saved to root directory
2. ✅ **Coordination Plan Created** - This document
3. ⏳ **Update bmm-workflow-status.yaml** - Add grand_unification section
4. ⏳ **Delegate to Architect Mode** - Create Target A tech spec

### This Week

5. **Target A Technical Spec** - Architect mode creates unified LLMStore design
6. **Target B Technical Spec** - Architect mode creates useFileSystem design
7. **Target C Technical Spec** - Architect mode creates GlobalChatOrchestrator design
8. **Sprint Planning** - PM mode breaks down Targets A/B/C into stories

### Next Week (Week 2)

9. **Start Target A Implementation** - Dev mode begins Iteration A-1
10. **Daily Ralph Loop Cycles** - After each iteration, validate with `pnpm tsc --noEmit && pnpm test`
11. **Code Reviews** - Code reviewer validates each iteration completion
12. **Progress Tracking** - Update bmm-workflow-status.yaml daily

---

## Governance & Validation

### Ralph Loop Integration

The Ralph Wiggum cycle integrates with Ralph Loop Cycle 18's corrected development strategy:

**Phase 0 (Week 1-2): Foundation Stabilization**
- TS-001: Fix TypeScript Errors → **Ralph Wiggum Iteration A-1**
- DB-001: Safe IndexedDB Operations → **Ralph Wiggum Iteration B-3**
- UI-001: Extract AgentConfigDialog Hooks → **Ralph Wiggum Iteration A-3**

**Phase 1 (Week 3-4): Store Refactoring**
- Split god stores into slices → **Ralph Wiggum Targets A, B, C**
- Eliminate circular dependencies → **Architect mode dependency mapping**

**Phase 2 (Week 5-6): Infrastructure Hardening**
- Fix P1 gaps → **Code reviewer validation**
- Implement proper error handling → **Error handling audit**

**Phase 3 (Week 7-8): Architecture Transformation**
- 4-layer clean architecture → **Epic GU-01 through GU-04**

### Validation Gates

**Before Starting Each Iteration:**
- [ ] Read PROMPT.md for current iteration number
- [ ] Review tech spec for target
- [ ] Identify specific store/component chain to fix

**During Implementation:**
- [ ] Follow atomic fix principle (one chain per iteration)
- [ ] Remove all commented-out legacy code
- [ ] Maintain max 300 lines per file

**After Each Iteration:**
- [ ] Run `pnpm tsc --noEmit` (zero TypeScript errors)
- [ ] Run `pnpm test` (all tests passing)
- [ ] Manual verification (completion signal met)
- [ ] Update PROMPT.md iteration counter
- [ ] Update bmm-workflow-status.yaml

**Completion Signal:**
```
<promise>DONE</promise>
```

When all 4 workspaces share unified stores and data flows are proven unified.

---

**Document Control:**
- **Version:** 1.0.0
- **Last Updated:** 2026-01-02T12:00:00+07:00
- **Next Review:** After Target A completion
- **Owner:** @bmad-core-bmad-master
- **Status:** ✅ COORDINATION PLAN APPROVED

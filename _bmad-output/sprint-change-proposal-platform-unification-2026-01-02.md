---
date: 2026-01-02
time: 21:11:20
phase: Course Correction
team: Team A (Unified)
agent_mode: bmad-core-bmad-master
version: 1.0
status: APPROVED
trigger: Ralph Loop Iteration 1057 - Platform Fragmentation Crisis
---

# Sprint Change Proposal: Platform Unification

## Document Control

| Field | Value |
|-------|-------|
| **Proposal ID** | SCP-2026-01-02-001 |
| **Created** | 2026-01-02T21:11:20+07:00 |
| **Author** | BMAD Master (Team A) |
| **Status** | APPROVED FOR EXECUTION |
| **Execution Mode** | Ralph Loop - Continuous until 100% |

---

## Section 1: Issue Summary

### 1.1 Problem Statement

After 1057 Ralph Loop iterations, the Knowledge Synthesis Station platform has accumulated **severe architectural fragmentation** across four critical domains that render the workspaces largely unusable for end-to-end use cases:

1. **Indexed Database vs. UI State Disconnection** - Persistence (Dexie) disconnected from UI states across domains/workspaces
2. **Workspace Presentation & Integration Failure** - Knowledge, Study, IDE, Notes workspaces not communicating
3. **Filesystem & Sync Status Gaps** - FSA permissions, desktop/mobile infrastructure not unified
4. **UX/UI Fragmentation** - Mobile experience broken, desktop elements blocking functionality

### 1.2 Discovery Context

| Dimension | Detail |
|-----------|--------|
| **When Discovered** | 2026-01-02 during Ralph Loop validation |
| **Discovery Method** | End-to-end use case testing + TypeScript compilation |
| **Iteration Count** | 1057 of 2500 max |
| **Artifact Count** | 250+ accumulated in `_bmad-output/` |

### 1.3 Evidence Summary

| Evidence Type | Count | Severity |
|--------------|-------|----------|
| TypeScript Compilation Errors | 30+ | CRITICAL |
| Fragmented Store Files | 44+ | CRITICAL |
| Non-functional Workspaces | 3 of 4 | CRITICAL |
| Mobile UX Issues | Multiple | HIGH |
| Unmigrated Legacy Components | Unknown | HIGH |

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Current Status | Actual State | Impact Level |
|------|---------------|--------------|--------------|
| Epic 1-5 | DONE | Foundation fragmented | HIGH |
| Epic 6 (Source) | DONE | UI wiring superficial | HIGH |
| Epic 7 (RAG) | DONE | Integration gaps | HIGH |
| Epic 8 (Canvas) | DONE | Isolated from workspaces | HIGH |
| Epic 9 (Study) | DONE | Workspace broken | CRITICAL |
| Epic 10 (Knowledge) | DONE | End-to-end broken | CRITICAL |
| Epic 26 (Notes) | DONE | Not cross-workspace | HIGH |
| Epic 32 (RAG Enhancement) | IN_PROGRESS | Partially complete | MEDIUM |
| Epic WB (Workspace Binding) | IN_PROGRESS | Critical gap | CRITICAL |

### 2.2 Store Fragmentation Analysis

**Current Store Locations (44+ files across 3 directories):**

```
src/lib/workspace/           → 6 stores (conversation, file-sync, threads, ide-state, project)
src/lib/state/               → 5 stores (ide, knowledge, quiz, workspace, tool-permission)
src/lib/notes/               → 3 stores (navigation, note, ai-prompt)
src/infrastructure/persistence/stores/ → 20+ stores (providers, agents, conversation, canvas, etc.)
```

**Problem**: Same domain concepts duplicated across locations with incompatible schemas.

### 2.3 Cornerstone State Analysis

| Cornerstone | Expected Location | Current State |
|-------------|-------------------|---------------|
| **1. LLM Providers** | Single store in `providers/` | Fragmented across 11 files |
| **2. Agent Configuration** | Single store in `agents/` | Multiple slices, incomplete integration |
| **3. Conversation/Chat** | Single store in `conversation/` | 28+ files, TypeScript errors |
| **4. Project/Filesystem** | Single store | Split between workspace/persistence |
| **5. RAG Pipeline** | Single store in `rag/` | 9 files, partial integration |

### 2.4 Artifact Conflicts

| Artifact | Conflict Description |
|----------|---------------------|
| `architecture.md` | Specifies "Unified Store Pattern" but 44+ stores exist |
| `sprint-status.yaml` | Shows DONE for epics that aren't functional end-to-end |
| `ralph-loop.local.md` | At iteration 1057 but core issues unresolved |
| `epics.md` | Stories marked complete without integration validation |

---

## Section 3: Recommended Approach

### 3.1 Selected Path: Systematic Migration with Ralph Loop

**Approach**: Hybrid - Systematic store consolidation → workspace integration → end-to-end validation

**Why This Approach**:
1. Cannot avoid store consolidation (TypeScript errors block development)
2. Must migrate before removing legacy (prevent crashes)
3. Need recursive validation loops (Ralph Loop methodology)
4. One team executing until 100% complete

### 3.2 Effort & Risk Assessment

| Factor | Assessment |
|--------|------------|
| **Effort** | HIGH (40-60 story points, 2-3 weeks) |
| **Risk** | MEDIUM (with proper migration strategy) |
| **Timeline Impact** | +2-3 weeks before new feature development |
| **Team** | Single team, continuous loop execution |

### 3.3 Success Criteria

```
✅ Zero TypeScript compilation errors
✅ All 4 workspaces functional end-to-end
✅ All 4 use cases (UC1-UC4) testable
✅ Mobile experience functional
✅ Desktop experience cohesive
✅ 12-level validation passed
✅ Legacy stores removed
✅ Documentation updated
```

---

## Section 4: Epic 51 - Platform Unification

### 4.1 Epic Overview

| Field | Value |
|-------|-------|
| **Epic ID** | 51 |
| **Name** | Platform Unification & Migration |
| **Priority** | P0 (CRITICAL) |
| **Estimate** | 40-60 story points |
| **Duration** | Continuous until 100% |
| **Execution** | Ralph Loop autonomous iteration |

### 4.2 Phase Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: Gap Analysis & Migration Assessment (Days 1-3)         │
│   └── Story 51-0: Comprehensive Codebase Audit                  │
│       ├── Map all stores with dependencies                      │
│       ├── Identify migration order by dependency                │
│       ├── Document TypeScript errors by store                   │
│       └── Create store consolidation plan                       │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 1: State Consolidation (Days 4-10)                        │
│   ├── Story 51-1: Provider Store Unification                    │
│   │   ├── Merge 11 provider-related files → single store        │
│   │   ├── Fix TypeScript errors                                 │
│   │   └── Validate reactivity across workspaces                 │
│   ├── Story 51-2: Agent Store Consolidation                     │
│   │   ├── Merge agent slices → unified vault                    │
│   │   ├── Wire workspace bindings                               │
│   │   └── Validate CRUD operations                              │
│   ├── Story 51-3: Conversation Store Merge                      │
│   │   ├── Consolidate 28+ conversation files                    │
│   │   ├── Fix _hasHydrated and type errors                      │
│   │   └── Validate thread management                            │
│   └── Story 51-4: Workspace State Binding                       │
│       ├── Create unified workspace context                      │
│       ├── Wire project-to-workspace bindings                    │
│       └── Validate cross-workspace state sharing                │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 2: Workspace Integration (Days 11-17)                     │
│   ├── Story 51-5: IDE Workspace Wiring                          │
│   │   ├── Wire all 5 cornerstones to IDE                        │
│   │   ├── Fix Chat panel integration                            │
│   │   └── Validate file system CRUD                             │
│   ├── Story 51-6: Knowledge Workspace Wiring                    │
│   │   ├── Wire RAG pipeline to UI                               │
│   │   ├── Connect canvas to sources                             │
│   │   └── Validate end-to-end synthesis                         │
│   ├── Story 51-7: Notes Workspace Wiring                        │
│   │   ├── Wire BlockNote to project context                     │
│   │   ├── Enable cross-workspace note access                    │
│   │   └── Validate AI features                                  │
│   └── Story 51-8: Study Workspace Wiring                        │
│       ├── Connect study to knowledge base                       │
│       ├── Wire flashcard/quiz to project                        │
│       └── Validate study session flow                           │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 3: End-to-End Validation (Days 18-21)                     │
│   ├── Story 51-9: Four Use Cases Validation                     │
│   │   ├── UC1: Vault Population & Baseline Synthesis            │
│   │   ├── UC2: Interactive Canvas Knowledge Linkage             │
│   │   ├── UC3: Conversational Knowledge Exploration             │
│   │   └── UC4: Dynamic Knowledge Matrix Auto-Organization       │
│   ├── Story 51-10: Mobile/Desktop UX Fixes                      │
│   │   ├── Fix mobile navigation                                 │
│   │   ├── Fix desktop element blocking                          │
│   │   └── Validate 3-device rule                                │
│   └── Story 51-11: Legacy Cleanup                               │
│       ├── Remove deprecated stores                              │
│       ├── Remove unused components                              │
│       └── Update documentation                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Story Details

#### Story 51-0: Comprehensive Codebase Audit

**As a** developer,
**I want** a complete map of all stores, their dependencies, and TypeScript errors,
**So that** I can systematically migrate without breaking the application.

**Acceptance Criteria**:
1. [ ] All 44+ store files cataloged with:
   - File path
   - Zustand/Dexie usage
   - Import dependencies
   - Export consumers
   - TypeScript errors (if any)
2. [ ] Store consolidation plan created with migration order
3. [ ] Dependency graph generated showing safe removal order
4. [ ] TypeScript error count baseline established

**Output Artifacts**:
- `_bmad-output/research/platform-unification-2026-01-02/store-inventory.md`
- `_bmad-output/research/platform-unification-2026-01-02/consolidation-plan.md`
- `_bmad-output/research/platform-unification-2026-01-02/dependency-graph.md`

---

#### Story 51-1: Provider Store Unification

**As a** user configuring API keys,
**I want** models to load immediately after key entry,
**So that** I can configure agents without page refresh.

**Acceptance Criteria**:
1. [ ] Single `useProviderStore` in `src/infrastructure/persistence/stores/providers/`
2. [ ] All 11 provider-related files consolidated or deprecated
3. [ ] API key → Model loading reactivity works across ALL workspaces
4. [ ] Zero TypeScript errors in provider domain
5. [ ] Provider CRUD operations functional from Settings page

**Migration Steps**:
```
1. Audit current provider files (11 identified)
2. Identify single-source-of-truth store
3. Migrate consumers to new store
4. Validate reactivity in IDE, Knowledge, Notes, Study
5. Remove deprecated files
6. Update exports
```

---

#### Story 51-2: Agent Store Consolidation

**As a** user configuring agents,
**I want** agent changes reflected in all workspaces,
**So that** I can use configured agents anywhere.

**Acceptance Criteria**:
1. [ ] Single `useAgentsStore` with unified schema
2. [ ] Workspace bindings functional (agent per workspace)
3. [ ] Tool permissions per workspace working
4. [ ] Agent selector accessible from ALL workspaces
5. [ ] Zero TypeScript errors in agent domain

---

#### Story 51-3: Conversation Store Merge

**As a** user chatting with AI,
**I want** conversations persisted and restored correctly,
**So that** I don't lose chat history across sessions.

**Acceptance Criteria**:
1. [ ] Single `useConversationStore` consolidating 28+ files
2. [ ] `_hasHydrated` properly typed and functional
3. [ ] `scrollPosition` properly persisted
4. [ ] Thread management working
5. [ ] Zero TypeScript errors in conversation domain
6. [ ] Conversations linked to projects

---

#### Story 51-4: Workspace State Binding

**As a** user navigating workspaces,
**I want** project context shared across all workspaces,
**So that** I can access project files from IDE, Knowledge, Notes, Study.

**Acceptance Criteria**:
1. [ ] Unified `WorkspaceContext` providing:
   - Active project ID
   - File system access
   - Agent selection
   - Conversation reference
2. [ ] All 4 workspaces consuming same context
3. [ ] Project switching updates all workspace states
4. [ ] Zero orphaned state references

---

#### Story 51-5 through 51-8: Workspace Wiring

(Detailed stories follow same pattern - wire all 5 cornerstones to each workspace)

---

#### Story 51-9: Four Use Cases Validation

**Acceptance Criteria**:

**UC1: Vault Population**
- [ ] Can import folder of documents
- [ ] Batch processing shows progress
- [ ] Embeddings generated and stored
- [ ] Synthesis button functional per document

**UC2: Canvas Linkage**
- [ ] Can drag 3+ documents to canvas
- [ ] AI proposes linkages with confidence
- [ ] Connections persist to database
- [ ] Knowledge graph updates visually

**UC3: Conversational RAG**
- [ ] Chat retrieves from knowledge base
- [ ] Citations link to source documents
- [ ] Synthesis creates reusable artifacts
- [ ] Multi-turn context maintained

**UC4: Knowledge Matrix**
- [ ] Auto-clustering visible
- [ ] Reorganization options functional
- [ ] Navigation improvement measurable
- [ ] Subject grouping accurate

---

#### Story 51-10: Mobile/Desktop UX Fixes

**Acceptance Criteria**:
1. [ ] Mobile navigation functional
2. [ ] Mobile burger menu visible and working
3. [ ] Desktop icons not blocking elements
4. [ ] 3-device rule validated (Desktop Chrome, Mobile Safari, Android Chrome)

---

#### Story 51-11: Legacy Cleanup

**Acceptance Criteria**:
1. [ ] All deprecated stores removed
2. [ ] No unused imports
3. [ ] AGENTS.md updated with final architecture
4. [ ] CLAUDE.md updated
5. [ ] `tree` command output matches expected structure

---

## Section 5: Implementation Handoff

### 5.1 Change Scope Classification

**Classification**: **MAJOR** - Fundamental architectural remediation

### 5.2 Handoff Recipients

| Role | Responsibility |
|------|---------------|
| **BMAD Master** | Orchestrate Ralph Loop execution |
| **Dev Agent** | Execute story implementations |
| **Code Reviewer** | Validate each story completion |
| **Architect** | Validate consolidation decisions |

### 5.3 Execution Model

```
┌────────────────────────────────────────────────────────────────┐
│                    RALPH LOOP EXECUTION                        │
│                                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ ANALYZE  │───▶│IMPLEMENT │───▶│ VALIDATE │───▶│  LOOP    │ │
│  │          │    │          │    │          │    │          │ │
│  │ • Grep   │    │ • Code   │    │ • tsc    │    │ • Next   │ │
│  │ • Scan   │    │ • Test   │    │ • dev    │    │ • Story  │ │
│  │ • Plan   │    │ • Wire   │    │ • build  │    │ • or Done│ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│        ▲                                              │        │
│        └──────────────────────────────────────────────┘        │
│                    Until 100% Complete                         │
└────────────────────────────────────────────────────────────────┘
```

### 5.4 Success Criteria Checklist

```yaml
completion_criteria:
  typescript:
    - Zero compilation errors: false
    
  workspaces:
    - IDE functional: false
    - Knowledge functional: false
    - Notes functional: false
    - Study functional: false
    
  use_cases:
    - UC1 testable: false
    - UC2 functional: false
    - UC3 working: false
    - UC4 visible: false
    
  quality:
    - Tests passing: false
    - Build succeeds: false
    - 12-level validation: false
    - Documentation updated: false
    
  overall: 0% # Updated each iteration
```

---

## Section 6: Approval

### 6.1 Proposal Approval

| Role | Status | Date |
|------|--------|------|
| **User** | APPROVED | 2026-01-02T21:11:20+07:00 |
| **BMAD Master** | APPROVED | 2026-01-02T21:11:20+07:00 |

### 6.2 Execution Authorization

**Authorized Actions**:
1. ✅ Create Epic 51 in sprint-status.yaml
2. ✅ Create Ralph Loop workflow module
3. ✅ Begin Phase 0: Codebase Audit
4. ✅ Iterate until 100% completion

---

## Next Actions

1. **IMMEDIATE**: Create Ralph Loop workflow at `.agent/workflows/ralph-loop-platform-unification.md`
2. **IMMEDIATE**: Update `sprint-status.yaml` with Epic 51
3. **IMMEDIATE**: Update `ralph-loop.local.md` to reference this proposal
4. **BEGIN**: Execute Story 51-0 (Codebase Audit)

---

*Document Generated by BMAD Master - Course Correction Workflow*
*Execution Mode: Ralph Loop - Continuous until 100% completion*

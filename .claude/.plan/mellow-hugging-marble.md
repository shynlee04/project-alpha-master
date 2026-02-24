# Implementation Plan: Foundation Stabilization (Epic 54)

**Date**: 2026-01-04
**Status**: PLAN PHASE - Master Plan Created
**Priority**: P0 - CRITICAL
**Health Baseline**: 3.8/10 (Critical)
**Target Health**: 8.5/10 (Stable)

---

## ✅ Master Plan Framework Created

**Location**: `_bmad/modules/architecture-remediation/config/master-plan-foundation-stabilization.yaml`

This is the **skeleton/frame** that guides all stabilization work. It contains:

1. **4 Phases** (STAB-24 → STAB-27) with:
   - Tasks and sub-tasks breakdown
   - Entrance/exit validation checkpoints
   - Estimated hours per task
   - Acceptance criteria per sub-task

2. **Validation Checkpoints** (V0-V5):
   - V0-BASELINE: Initial health assessment
   - V1-GOVERNANCE: Rules established
   - V2-CRITICAL_FIXES: Crashes fixed, data loss prevented
   - V3-IMPORT_CLEANUP: Canonical paths enforced
   - V4-GOD_ELIMINATION: No stores/components >300 lines
   - V5-FINAL_TARGET: 8.5/10 health achieved

3. **Routing Decisions** (if validation fails):
   - RESTART_PHASE: Re-start from beginning
   - REPEAT_STORY: Re-execute current story
   - SKIP_TO_NEXT_STORY: Block and continue
   - DOCUMENT_BLOCKER: Create blocker report
   - ESCALATE_TO_ARCHITECT: Create ADR

4. **Context Documents Registry**:
   - References to sprint-status.yaml, priorities.yaml
   - Deep scan artifacts (risk register, state inventory, etc.)
   - Architecture references (CLAUDE.md, architecture.md)

5. **Artifacts Registry** (to be generated):
   - Per-phase output documents
   - ADRs to be created
   - Audit reports and validations

---

## Executive Summary

**Problem Statement**: Individual bug fixes (WorkspaceProvider, model hotload, file sync) are symptoms of 5 systemic foundational patterns that are broken:

1. **State Fragmentation**: 69 stores across 3 locations, no single source of truth
2. **Import Chaos**: Old/new paths coexist, no enforcement
3. **Sync Fragility**: Multiple sync managers, no unified flow
4. **Persistence Gaps**: IndexedDB unsafe, no quota handling
5. **Props Hell**: Components not using stores properly

**Strategic Objective**: Reach a stabilized, safe architectural state that is "firm and resilient" before implementing real-life use case features.

**Key Constraint**: NO changes to tech stack, architectures, states, persistence, eventbus, file system — stabilize only.

---

## Current State Analysis (from sprint-status.yaml)

### Epic Status
| Epic | Status | Progress |
|------|--------|----------|
| Epic 53 (State Consolidation) | DONE ✅ | 8/8 stories complete |
| Epic 54 (Foundation Stabilization) | IN_PROGRESS | 1/8 stories (12.5%) |

### Health Baseline
| Metric | Value | Target |
|--------|-------|--------|
| Health Score | 3.8/10 | 8.5/10 |
| TS Errors (production) | 306 | <50 |
| God Stores | 69 (25 duplicated) | <10 |
| God Components | 49 | <5 |
| Silent Failures | 23 | 0 |
| Test Coverage | 16.6% | 60%+ |

---

## 4-Phase Stabilization Strategy

### Phase STAB-24: Governance Enforcement (Week 1)
**Goal**: Establish rules and stop the bleeding

| Story | Focus | Est. Hours |
|-------|-------|------------|
| 54-0 | Governance enforcement rules | 4h |
| 54-1a | IndexedDB quota handling (P0 data loss) | 8h |
| 54-1b | Silent failures elimination | 12h |
| 54-1c | Circular dependency removal | 6h |
| 54-1-typescript | Critical TS errors (crashes) | 10h |

**Deliverable**: Safe boundaries established, data loss prevented, crashes fixed.

### Phase STAB-25: Risk Elimination (Week 2)
**Goal**: Remove P0 risks that block development

| Story | Focus | Est. Hours |
|-------|-------|------------|
| 54-2 | Import path canonicalization | 8h |
| 54-3a | God store splitting (worst 10) | 16h |
| 54-3b | God component splitting (worst 10) | 12h |
| 54-4 | Sync manager consolidation | 10h |

**Deliverable**: Canonical paths, no god stores >300 lines, working sync.

### Phase STAB-26: Architecture Hardening (Week 3)
**Goal**: Document and enforce safe boundaries

| Story | Focus | Est. Hours |
|-------|-------|------------|
| 54-3-baseline | Architecture baseline spec | 6h |
| 54-5a | Store facade pattern enforcement | 8h |
| 54-5b | Component store usage audit | 10h |
| 54-6 | Error boundary coverage | 8h |

**Deliverable**: Documented architecture, enforced patterns, error recovery.

### Phase STAB-27: Quality Polish (Week 4)
**Goal**: Reach target health score

| Story | Focus | Est. Hours |
|-------|-------|------------|
| 54-7 | Test coverage (critical paths) | 12h |
| 54-8 | Retrospective & documentation | 6h |

**Deliverable**: 60%+ test coverage, 8.5/10 health score.

---

## Files to Create

### 1. Sprint Change Proposal
**Location**: `_bmad-output/sprint-artifacts/scp-foundation-stabilization-2026-01-04.md`

**Sections**:
- Issue Summary (5 systemic patterns)
- Impact Analysis (health score, risks)
- Recommended Approach (4-phase strategy)
- Detailed Change Proposals (per story)
- Implementation Handoff

### 2. Architecture Decision Records
**Location**: `_bmad-output/architecture-decision-records/`

**ADRs to Create**:
1. `ADR-025-foundation-stabilization-strategy.md` - Overall stabilization approach
2. `ADR-026-import-path-governance.md` - Canonical import paths enforcement
3. `ADR-027-indexeddb-quota-management.md` - Safe quota handling
4. `ADR-028-sync-manager-unification.md` - Single source of sync truth

### 3. ARC Module Improvements
**Location**: `_bmad/modules/architecture-remediation/`

**Files to Update**:
- `config/master-plan.yaml` - Add 4-phase stabilization roadmap
- `artifacts/epic-54-tracking.md` - Story-by-story progress
- `config/priorities.yaml` - Update Epic 54 story breakdown

---

## Implementation Sequence

### Step 1: Create Sprint Change Proposal
1. Write comprehensive SCP document
2. Include all 4 phases with story breakdowns
3. Define acceptance criteria for each story
4. Estimate effort and dependencies

### Step 2: Create Architecture Decision Records
1. ADR-025: Foundation stabilization strategy
   - Decision: Stabilize before new features
   - Alternatives considered: Continue with bug fixes, full rewrite
   - Consequences: Short-term slowdown, long-term velocity

2. ADR-026: Import path governance
   - Decision: Enforce canonical paths via ESLint
   - Alternatives: Manual enforcement, build-time checks
   - Consequences: Merge conflicts during migration, then stability

3. ADR-027: IndexedDB quota management
   - Decision: Proactive quota monitoring + graceful degradation
   - Alternatives: Reactive handling, unlimited storage
   - Consequences: Complex state management, user-visible errors

4. ADR-028: Sync manager unification
   - Decision: Single SyncManager with facade pattern
   - Alternatives: Multiple managers, event-driven sync
   - Consequences: Large refactor, then simplified maintenance

### Step 3: Update ARC Module
1. Add master plan to `config/master-plan.yaml`
2. Create Epic 54 tracking document
3. Update priorities.yaml with detailed story breakdowns
4. Add stabilization phases to module documentation

### Step 4: Governance Enforcement
1. Update governance-rules.md with stabilization rules
2. Add ESLint rules for canonical import paths
3. Add pre-commit hooks for file size limits
4. Add TS error blocking in CI

---

## Next Steps (After Approval)

1. **Begin Phase STAB-24** - Governance Enforcement
   - Start with Task 54-0: Governance Rules Setup
   - Update governance-rules.md with stabilization rules
   - Add ESLint rules for canonical import paths

2. **Execute Tasks in Order**
   - Follow master-plan-foundation-stabilization.yaml sequence
   - Validate at each checkpoint (V0 → V1 → V2 → V3 → V4 → V5)
   - Route to correction if validation fails

3. **Generate Artifacts Per Phase**
   - Create audit reports as specified in artifacts_registry
   - Create ADRs when routing decisions trigger ESCALATE_TO_ARCHITECT
   - Update sprint-status.yaml with progress

4. **Complete Epic 54 When V5-FINAL_TARGET Passes**
   - Health score >= 8.5/10
   - All tasks complete
   - Retrospective documented

---

## Files to Modify (During Execution)

| File | description | Phase |
|------|---------|-------|
| `.claude/rules/governance-rules.md` | Add stabilization rules | STAB-24 |
| `.eslintrc.cjs` | Add import path rules | STAB-24 |
| `.github/workflows/ci.yml` | Add TS error blocking | STAB-24 |
| `src/infrastructure/persistence/quota-detector.ts` | NEW - quota utility | STAB-24 |
| Various source files | Fix critical issues | STAB-24/25 |

---

## Files Created (So Far)

| File | description |
|------|---------|
| `_bmad/modules/architecture-remediation/config/master-plan-foundation-stabilization.yaml` | **Master plan skeleton** - framework for all phases |
| `/Users/apple/.claude/plans/mellow-hugging-marble.md` | This implementation plan |

---

## Critical Files Referenced

| File | description |
|------|---------|
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | Source of truth for epic status |
| `_bmad/modules/architecture-remediation/config/priorities.yaml` | P0-P3 definitions |
| `_bmad-output/deep-scan/MASTER-RISK-REGISTER.md` | 73 risks, health 68.5/100 |
| `src/routes/ide.tsx` | IDE route structure example |
| `src/lib/workspace/WorkspaceContext.tsx` | Legacy context (deprecated) |
| `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx` | New unified provider |

---

## Next Actions

1. **Create Sprint Change Proposal** document
2. **Create 4 ADRs** for stabilization decisions
3. **Update ARC module** with master plan phases
4. **Review with user** for approval

---

---

## 📋 ARCHITECTURE UNDERSTANDING (Phase 1 Complete)

### User's Requirement
> "you do not fix aimlessly you must understand the uses of file system sync, workspaces, persistence and states, when and what for - make these clear before anything else"

### Domain 1: File System Sync

**What happens when syncing local folders:**
```
User Action → Local FS (Source of Truth) → SyncManager → WebContainer (Mirror)
```

| Stage | Component | File Path |
|-------|-----------|-----------|
| 1. User grants access | `window.showDirectoryPicker()` | local-fs-adapter.ts:44 |
| 2. Directory traversal | Walk directory, exclude patterns | directory-walker.ts:11 |
| 3. Build file tree | Count files, track progress | sync-operations.ts |
| 4. Sync operation | Full or incremental sync | sync-batch-sync.ts:26 |
| 5. Write to WebContainer | fs.writeFile() with parent dirs | sync-batch-sync.ts:197 |
| 6. Dual write on save | Local FS + incremental sync | ide-file-sync-service.ts:69-74 |

**File Types Supported:**
- **Text (UTF-8)**: `.ts`, `.js`, `.md`, `.json`, `.txt`, etc.
- **Binary (24 extensions)**: Images (png, jpg, gif, svg), Fonts (woff, ttf), Documents (pdf, zip), Media (mp3, mp4, wav)

**Source of Truth**: Local FS is ALWAYS source of truth. WebContainer never syncs back.

**Exclusion Patterns**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`, editor swap files, `.env.local`

---

### Domain 2: Workspaces

| Workspace | description | Key Features |
|-----------|---------|--------------|
| **ide** | Code development, debugging | Files, terminals, chat, IDE state |
| **knowledge** | Knowledge synthesis, RAG | PDF/URL import, vector search, collections |
| **study** | Study materials, flashcards | Spaced Repetition System (SRS), study sessions |
| **notes** | Note-taking, documentation | AI-powered notes, BlockNote markdown |

**Workspace Provider** (5 Cornerstones):
- File: `workspace-provider.tsx`
- Cornerstones: (1) LLM Providers, (2) Agent Config, (3) Conversation/Chat, (4) Project/Filesystem, (5) RAG Pipeline

---

### Domain 3: Persistence

**Dexie Database Tables** (18+ tables):
- **Core**: `projects`, `ideState`, `conversations`
- **AI/Agent**: `taskContexts`, `toolExecutions`, `credentials`, `threads`
- **Sync**: `syncStatus`, `fileMetadata`, `toolExecutionLogs`, `fsaHandles`, `sessionSnapshots`
- **Performance**: `fileSnapshots`, `fileContentCache`
- **Knowledge**: `sources`, `collections`, `synthesisResults`, `oramaIndexes`, `embedding_models`
- **Study**: `studySessions`, `studyCards`

**Zustand Store Locations**:
- **Canonical**: `src/infrastructure/persistence/stores/` (modern, slice pattern)
- **Legacy**: `src/lib/state/` (backward compatibility facades)
- **Specialized**: `src/lib/notes/`, `src/lib/study/` (workspace-specific)

**Store Pattern**: Slice-based, each slice ≤120 lines, combined into unified stores per workspace

---

### Domain 4: RAG, Tools & Permissions

**RAG Usage by Workspace:**
- **IDE**: Code documentation help (limited)
- **Knowledge**: Primary RAG workspace - full document ingestion, indexing, search
- **Study**: Study materials and flashcard generation
- **Notes**: Note linking and reference retrieval

**RAG Pipeline:**
```
Document Ingestion → Chunking → Embedding → Orama Index Storage
                                                        ↓
Query → Hybrid Search (70% vector + 30% fulltext) → Results with Citations
```

**Permission Levels** (3-tier):
| Level | Behavior |
|-------|----------|
| `auto` | Execute immediately (safe operations like read_file) |
| `prompt` | Require user approval (risky operations like write_file) |
| `block` | Never execute (dangerous operations) |

**Workspace-Scoped Defaults:**
- IDE: read=auto, write=prompt, execute=prompt, delete=block
- Knowledge: read=auto, write=block, execute=block
- Notes: read=auto, write=prompt, execute=block
- Study: read=auto, write=block, execute=block

**Chat/Conversation Management:**
- 6 slices: Metadata, Thread Management, Message CRUD, Utils, Validation, Events
- Auto-persistence with debouncing (500ms)
- Thread-scoped with workspace associations
- Event-driven updates for real-time sync

---

## 🎯 NEW STORY APPROACH (Based on User Feedback)

### User's Requirement
> "each of your story in the epic will have to address end-to-end of a group of issues which I can test right away - and these are systematically connected to the next group"
> "As you fix and improve one slice/domain -> refactor and grasp the related code -> reasoning -> propose your changes and why -> once authorize then gradually and scaffold the changes"

### Proposed Story Structure (End-to-End, Testable Groups)

#### **Story Group A: File System Sync End-to-End**
- **Focus**: Complete sync flow from Local FS → WebContainer
- **Testable**: User can sync folder, verify files appear in WebContainer, edit file, verify dual-write
- **Stories**:
  - A1: Sync status visibility (user sees what's happening)
  - A2: Incremental sync accuracy (only changed files sync)
  - A3: File type handling (text vs binary)
  - A4: Error recovery (permission denied, quota exceeded)

#### **Story Group B: Workspace Switching & State Persistence**
- **Focus**: Switching between workspaces preserves each workspace's state correctly
- **Testable**: User switches IDE→Knowledge→Notes→IDE, each workspace shows correct state
- **Stories**:
  - B1: Workspace state isolation (no cross-contamination)
  - B2: Agent selection persistence (per-workspace agents remembered)
  - B3: Conversation thread preservation (chat history per workspace)
  - B4: File tree state restoration (open files, expanded folders)

#### **Story Group C: RAG Knowledge Search End-to-End**
- **Focus**: User imports PDF/URL, searches, gets accurate results with citations
- **Testable**: Import document → Search query → Verify results with proper citations
- **Stories**:
  - C1: Document ingestion progress visibility
  - C2: Search result accuracy (hybrid vector + fulltext)
  - C3: Citation formatting (source, page, relevance)
  - C4: Index persistence (survives workspace switch)

#### **Story Group D: AI Tool Permissions End-to-End**
- **Focus**: AI agent uses tools with correct permission prompts per workspace
- **Testable**: Agent requests write operation → User sees approval UI → Approve → File written
- **Stories**:
  - D1: Permission check accuracy (workspace-specific defaults)
  - D2: Approval UI usability (clear what tool will do)
  - D3: Permission persistence (settings survive reload)
  - D4: Tool execution feedback (success/error messages)

---

## ⚠️ KEY ARCHITECTURAL ISSUES DISCOVERED

### Issue 1: GetChangedFilesSince Signature Mismatch
**Location**: `src/lib/sync/file-metadata-cache.ts:46-48`
- **Problem**: TWO different implementations exist with different signatures
  - `infrastructure/persistence/dexie-db.ts` - NO projectId parameter
  - `additional-file-metadata-helpers.ts` - WITH projectId parameter
- **Impact**: Import path was wrong, function signature mismatch
- **Status**: FIXED in Story 54-1

### Issue 2: Knowledge Store Using Wrong Storage Key
**Location**: `src/infrastructure/persistence/stores/knowledge/knowledge-store.ts:87`
- **Problem**: Storage key is `'conversationState'` instead of `'knowledge-state'`
- **Impact**: Knowledge state may overwrite or conflict with conversation state
- **Status**: NEEDS INVESTIGATION

### Issue 3: Workspace Permission Fragmentation
- **Problem**: Some workspaces use `useAgentSelectionStore`, others use global `useAgentsStore`
- **Impact**: Agent selections not consistently per-workspace
- **Status**: Partially fixed (UnifiedAgentSelector created), but needs audit

### Issue 4: No IndexedDB Quota Handling
- **Problem**: No proactive quota monitoring before writing to IndexedDB
- **Impact**: Silent data loss when quota exceeded
- **Status**: Story 54-1a (P0 - not yet started)

---

## 🔄 NEXT STEPS (Phase 2 - Design)

1. **Review this architecture understanding** with user
2. **Confirm story grouping approach** (A: Sync, B: Workspace, C: RAG, D: Permissions)
3. **Select first story group** to implement end-to-end
4. **Create detailed story** with acceptance criteria for user authorization

---

## ✅ USER DECISIONS RECORDED

### Priority Order (Per User)
1. **IDE Workspace + File System Sync** (Combined)
   - File system sync
   - Loading UI/UX
   - States
   - CRUD permissions (user vs. their actual file system)

2. **Notes Workspace**

3. **Knowledge Workspace** → DEFERRED
   - "completely disastrous which needs complete re vamp"
   - Will address after IDE and Notes are stable

### Testing Approach: TDD
- "TDD as test suit - plan really carefully on user use cases"
- "addressing every aspect"
- "always knowing that there always be consequential issues or related ones that need to address"
- "sprint-status, story and context as plan will be implemented and iterate on until 100% passed"

### Development Philosophy
- "harness a group without any other concerns"
- Each story group is self-contained and testable end-to-end
- Iterative refinement until 100% test pass

---

## 🎯 STORY 54-2: IDE WORKSPACE + FILE SYSTEM SYNC (Combined)

### Scope
End-to-end IDE workspace with file system sync, loading UI/UX, state management, and CRUD permissions.

### User Use Cases to Cover

#### UC1: User Opens IDE Workspace
1. User navigates to IDE workspace
2. System prompts for directory access
3. User grants permission
4. Files load from Local FS → WebContainer
5. File tree displays with proper loading indicators
6. User can open files in editor

#### UC2: User Edits File
1. User opens file in editor
2. User makes changes
3. User saves (Cmd+S)
4. Changes written to Local FS (source of truth)
5. Changes sync to WebContainer (incremental)
6. Both systems in sync

#### UC3: User Switches Workspaces
1. User switches IDE → Notes
2. IDE state persists (open files, scroll positions, panel layout)
3. User switches Notes → IDE
4. IDE state restored exactly as left

#### UC4: AI Agent Uses File Tools
1. User starts AI chat in IDE
2. Agent requests to read file
3. Permission check: auto (no prompt needed)
4. Agent reads file successfully
5. Agent requests to write file
6. Permission check: prompt (user approval needed)
7. User approves
8. File written to Local FS
9. User sees confirmation

### Test Suite Structure (TDD)

```
54-2-ide-filesystem/
├── sync/
│   ├── file-sync-flow.test.ts
│   ├── incremental-sync.test.ts
│   ├── file-type-handling.test.ts
│   └── error-recovery.test.ts
├── loading-ux/
│   ├── loading-indicators.test.tsx
│   ├── progress-display.test.tsx
│   └── error-messages.test.tsx
├── state/
│   ├── ide-state-persistence.test.ts
│   ├── workspace-switch-isolation.test.ts
│   └── state-restoration.test.ts
├── permissions/
│   ├── permission-checks.test.ts
│   ├── approval-ui.test.tsx
│   └── tool-execution-feedback.test.tsx
└── integration/
    ├── end-to-end-sync.test.ts
    └── workspace-flow.test.ts
```

### Acceptance Criteria

#### AC1: Sync Status Visibility
- [ ] User sees "Syncing..." indicator during sync
- [ ] Progress bar shows files processed / total files
- [ ] User sees "Sync complete" with file count
- [ ] User sees clear error message if sync fails
- **Test**: `sync/sync-status-visibility.test.ts` (5 test cases)

#### AC2: Incremental Sync Accuracy
- [ ] Only changed files sync after initial sync
- [ ] File metadata cache detects modifications
- [ ] Timestamp comparison works correctly
- [ ] No unnecessary file operations
- **Test**: `sync/incremental-sync.test.ts` (8 test cases)

#### AC3: File Type Handling
- [ ] Text files (UTF-8) read and written correctly
- [ ] Binary files (png, pdf, mp3, etc.) handled as ArrayBuffer
- [ ] No corruption during sync
- [ ] Correct mime type detection
- **Test**: `sync/file-type-handling.test.ts` (6 test cases)

#### AC4: Error Recovery
- [ ] Permission denied shows user-friendly message
- [ ] Quota exceeded triggers cleanup and warning
- [ ] Network errors handled with retry
- [ ] Partial sync doesn't corrupt state
- **Test**: `sync/error-recovery.test.ts` (7 test cases)

#### AC5: IDE State Persistence
- [ ] Open files list saved to IndexedDB
- [ ] Active file saved and restored
- [ ] Expanded folders saved and restored
- [ ] Panel layout (ratios) saved and restored
- [ ] Scroll positions saved and restored
- **Test**: `state/ide-state-persistence.test.ts` (10 test cases)

#### AC6: Workspace Switch Isolation
- [ ] Switching IDE → Notes doesn't affect IDE state
- [ ] Switching Notes → IDE restores IDE state
- [ ] No cross-contamination between workspaces
- [ ] Each workspace has independent agent selection
- **Test**: `state/workspace-switch-isolation.test.ts` (6 test cases)

#### AC7: Permission Checks Accuracy
- [ ] read_file in IDE = auto (no prompt)
- [ ] write_file in IDE = prompt (user approval)
- [ ] execute_command in IDE = prompt
- [ ] delete_file in IDE = block
- [ ] Workspace-specific defaults respected
- **Test**: `permissions/permission-checks.test.ts` (8 test cases)

#### AC8: Approval UI Usability
- [ ] Permission prompt shows: tool name, file path, operation
- [ ] Approve/Reject buttons clearly labeled
- [ ] User can approve once or approve for session
- [ ] Block list shows blocked operations with reason
- **Test**: `permissions/approval-ui.test.tsx` (7 test cases)

### Files to Modify (Estimated 25-35 files)

**Sync Layer:**
- `src/lib/filesystem/local-fs-adapter.ts`
- `src/lib/filesystem/sync-manager/sync-manager.ts`
- `src/lib/filesystem/sync-manager/sync-batch-sync.ts`
- `src/lib/sync/file-metadata-cache.ts`

**State Layer:**
- `src/infrastructure/persistence/stores/ide/*` (6 slice files)
- `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx`

**UI Layer:**
- `src/presentation/components/ide/ExplorerPanel.tsx`
- `src/presentation/components/ide/AgentChatPanel.tsx`
- `src/presentation/components/ui/*` (loading, error states)

**Permission Layer:**
- `src/lib/agent/tool-permission-manager.ts`
- `src/infrastructure/persistence/stores/permissions/*`

### Implementation Sequence

1. **Phase 1: Test Suite Creation** (4-6 hours)
   - Create test files for all 8 ACs
   - Define test cases (total ~60 tests)
   - All tests fail initially (TDD red phase)

2. **Phase 2: Sync Layer Fixes** (8-10 hours)
   - Implement sync status visibility
   - Fix incremental sync accuracy
   - Verify file type handling
   - Add error recovery
   - Tests pass incrementally

3. **Phase 3: State Layer Fixes** (6-8 hours)
   - Verify IDE state persistence
   - Fix workspace switch isolation
   - Add state restoration
   - Tests pass incrementally

4. **Phase 4: Permission Layer Fixes** (4-6 hours)
   - Verify permission check accuracy
   - Improve approval UI
   - Add tool execution feedback
   - Tests pass incrementally

5. **Phase 5: Integration & Validation** (4-6 hours)
   - Run end-to-end integration tests
   - Manual verification with user
   - Fix any consequential issues
   - All tests pass (green phase)

**Total Estimated: 26-36 hours**

### Consequential Issues to Address

As we implement, we will discover related issues:
- IndexedDB quota handling (Story 54-1a)
- Silent failure elimination (Story 54-1b)
- Import path cleanup (Story 54-2)

These will be tracked in sprint-status.yaml and addressed iteratively.

---

## 📝 NEXT ACTIONS (Ready for Implementation)

1. **Create Story File**: `_bmad-output/sprint-artifacts/54-2-ide-filesystem-sync.md`
2. **Create Test Suite**: All test files with failing tests (TDD red)
3. **Begin Phase 1**: Write tests for AC1-AC8
4. **Update sprint-status.yaml**: Track Story 54-2 progress

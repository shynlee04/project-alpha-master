# Architecture Remediation - Comprehensive Epics & Stories

**Date**: 2026-01-04T16:00+07:00
**Agent**: BMad Master v2.0 (Autonomous)
**Status**: ✅ DEFINED - READY FOR EXECUTION
**Reference**: `_bmad-output/prompts/2026-01-04/comprehensive-correct-course-production-ready.md`

---

## Executive Summary

Based on the independent analysis in correct-course-status-2026-01-04.md, the codebase faces **critical technical debt** that requires systematic remediation:

**Critical Problems**:
- **1,172 TypeScript errors** (306 production + 866 test files)
- **30+ god stores** (>500 lines) - worst is dexie-db.ts at 1,267 lines
- **45 component violations** (>300 lines)
- **3 workspaces** (IDE, Notes, Knowledge) lack E2E file system sync
- **Sync strategy fragmentation** - 5 implementations with 47% duplication potential

**Solution**: 6 structured epics using 6 specialized agents and 6 workflows

---

## Epic Structure Overview

| Epic ID | Epic Name | Priority | Duration | Agent | Stories |
|---------|----------|----------|----------|-------|---------|
| **ARC-1** | Foundation Stabilization | P0 | Week 1 | store-refactorer, typescript-fixer | 4 stories (60-80 hours) |
| **ARC-2** | Component Normalization | P1 | Week 2 | component-splitter | 3 stories (40-60 hours) |
| **ARC-3** | TypeScript Remediation | P0 | Week 3 | typescript-fixer | 4 stories (50-70 hours) |
| **ARC-4** | IDE Workspace E2E | P0 | Week 4 | workspace-architect | 4 stories (30-40 hours) |
| **ARC-5** | Notes Workspace E2E | P0 | Week 5 | file-sync-specialist | 5 stories (40-50 hours) |
| **ARC-6** | Knowledge Workspace E2E | P0 | Week 6 | file-sync-specialist | 4 stories (35-45 hours) |

**Total Estimated Duration**: 6 weeks (255-345 hours)

---

## Epic ARC-1: Foundation Stabilization (P0 - Week 1)

**Focus**: Eliminate critical god stores that block all other work
**Agent**: @store-refactorer
**Workflow**: eliminate-god-stores
**Duration**: 60-80 hours

### Problem Statement

The codebase has **30+ god stores** (>500 lines) that violate the ≤120 line limit:
- **Worst offender**: `dexie-db.ts` at 1,267 lines (10.6x over limit)
- `event-bus.ts` at 644 lines
- Multiple stores at 500-600 lines

**Impact**: These god stores make the codebase:
- Difficult to understand and maintain
- Nearly impossible to test effectively
- Prone to circular dependencies
- Blocking architectural improvements

### Stories

#### Story ARC-1.1: Split dexie-db.ts (1,267 lines)

**ID**: ARC-1.1
**Status**: 🟡 DRAFTED → READY FOR CONTEXT
**Priority**: P0 (CRITICAL)
**Estimate**: 10-12 hours
**Agent**: @store-refactorer
**Workflow**: eliminate-god-stores

**User Story**:
As a developer working on the codebase,
I want to split the monolithic dexie-db.ts file (1,267 lines) into modular, maintainable slices (≤120 lines each),
So that the database schema is easier to understand, test, and extend.

**Current State**:
- File: `src/lib/workspace/dexie-db.ts` (1,267 lines)
- Violation: 10.6x over ≤120 line limit
- Contains: Schema, migrations, utilities, type definitions
- Problem: God class anti-pattern, difficult to test

**Acceptance Criteria**:
- AC-1: Database Schema Slice (≤120 lines)
- AC-2: Migrations Slice (≤120 lines)
- AC-3: Utilities Slice (≤120 lines)
- AC-4: Unified Store (≤300 lines total)
- AC-5: Facade Pattern (zero breaking changes)
- AC-6: Test Coverage (≥80%)
- AC-7: Documentation Updated

**Tasks**: 34 tasks (T0-T34) - [See ARC-1.1-split-dexie-db.md](ARC-1.1-split-dexie-db.md)

**Quality Gates**:
- TypeScript Errors: { before: 1172, target: 0 new errors, after: null }
- File Size Compliance: { before: "1,267 lines", target: "≤120 lines", after: null }
- Test Coverage: { before: null, target: ≥80%, after: null }
- Breaking Changes: { target: 0, after: null }

---

#### Story ARC-1.2: Split event-bus.ts (644 lines)

**ID**: ARC-1.2
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 6-8 hours
**Agent**: @store-refactorer
**Workflow**: eliminate-god-stores

**User Story**:
As a developer working on the codebase,
I want to split the event-bus.ts file (644 lines) into focused slices (≤120 lines each),
So that the event system is easier to understand and maintain.

**Current State**:
- File: `src/infrastructure/events/event-bus.ts` (644 lines)
- Violation: 5.4x over ≤120 line limit
- Problem: Monolithic event system with multiple concerns mixed

**Acceptance Criteria**:
- AC-1: Event Bus Core Slice (≤120 lines)
- AC-2: Event Emitter Slice (≤120 lines)
- AC-3: Event Listener Slice (≤120 lines)
- AC-4: Unified Event Bus (≤300 lines)
- AC-5: Facade Pattern (zero breaking changes)
- AC-6: Test Coverage (≥80%)

**Tasks**: 28 tasks (estimate)
- T0-T4: Research (event patterns, TypedEventEmitter)
- T5-T9: Analysis (import locations, usage patterns)
- T10-T14: Slice extraction (core, emitter, listener)
- T15-T19: Store unification
- T20-T22: Facade implementation
- T23-T28: Testing and validation

**Quality Gates**:
- File Size Compliance: { before: "644 lines", target: "≤120 lines", after: null }
- Breaking Changes: { target: 0, after: null }
- Test Coverage: { target: ≥80%, after: null }

---

#### Story ARC-1.3: Split remaining god stores (25+ stores)

**ID**: ARC-1.3
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 40-50 hours (bulk refactoring)
**Agent**: @store-refactorer
**Workflow**: eliminate-god-stores

**User Story**:
As a developer working on the codebase,
I want to systematically split all remaining god stores (25+ stores >500 lines) into modular slices,
So that the entire store layer adheres to the ≤120 line limit.

**Current State**:
- God Stores: 30+ stores >500 lines
- Target Stores: canvas-store.ts (623 lines), flashcard-store.ts (531 lines), study-store.ts (458 lines)
- Problem: Technical debt blocking architectural improvements

**Acceptance Criteria**:
- AC-1: All god stores split into ≤120 line slices
- AC-2: Zero breaking changes (facade pattern)
- AC-3: Test coverage ≥80% for all stores
- AC-4: Documentation updated (AGENTS.md)

**Tasks**: 200 tasks (estimate - ~8 tasks per store × 25 stores)
- Bulk analysis of all god stores
- Prioritization by file size and usage
- Batch refactoring (5-10 stores per session)

**Quality Gates**:
- God Stores Count: { before: 30, target: 0, after: null }
- Breaking Changes: { target: 0, after: null }

---

#### Story ARC-1.4: Fix TypeScript Errors (batch fix)

**ID**: ARC-1.4
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 8-12 hours (first batch)
**Agent**: @typescript-fixer
**Workflow**: fix-typescript-errors

**User Story**:
As a developer working on the codebase,
I want to systematically fix TypeScript errors through batch fixing,
So that the codebase has <10 TypeScript errors and is type-safe.

**Current State**:
- Total Errors: 1,172 (306 production + 866 test)
- Directive: **IGNORE test file errors** (focus on production code only)
- Target: <10 errors

**Acceptance Criteria**:
- AC-1: Batch fix missing imports (TS2304, TS2305) - target: 50-100 errors fixed
- AC-2: Batch fix type mismatches (TS2322, TS2345)
- AC-3: Batch fix missing properties (TS2339, TS2739)
- AC-4: Validate all fixes (zero regression)
- AC-5: Error count reduced to <10

**Tasks**: 20 tasks (estimate)
- T0-T2: Error analysis and categorization
- T3-T8: Batch fix missing imports (50-100 errors)
- T9-T14: Batch fix type mismatches (50-100 errors)
- T15-T18: Validate fixes (pnpm tsc --noEmit)
- T19-T20: Regression testing

**Quality Gates**:
- TypeScript Errors: { before: 306 (production only), target: <10, after: null }

---

## Epic ARC-2: Component Normalization (P1 - Week 2)

**Focus**: Eliminate component size violations (>300 lines)
**Agent**: @component-splitter
**Workflow**: normalize-components
**Duration**: 40-60 hours

### Problem Statement

**41 component violations** (>300 lines) identified:
- **Critical** (>600 lines): 3 components
- **High** (500-600 lines): 3 components
- **Medium** (300-500 lines): 35 components

**Top 10 Worst Offenders**:
1. `src/presentation/components/ui/resizable.tsx` - 745 lines
2. `src/presentation/components/knowledge/KnowledgePage.tsx` - 658 lines
3. `src/lib/state/quiz-store.ts` - 658 lines (store, but violates component-like patterns)
4. `src/lib/rag/orama-index.ts` - 644 lines
5. `src/infrastructure/persistence/dexie-db.ts` - 1,061 lines (duplicate)

### Stories

#### Story ARC-2.1: Split top 10 god components

**ID**: ARC-2.1
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 20-30 hours
**Agent**: @component-splitter
**Workflow**: normalize-components

**User Story**:
As a developer working on the codebase,
I want to split the top 10 oversized components (>300 lines) into focused modules,
So that components are easier to understand, test, and maintain.

**Acceptance Criteria**:
- AC-1: All components ≤300 lines
- AC-2: Custom hooks extracted for complex logic
- AC-3: Component composition patterns applied
- AC-4: Zero breaking changes
- AC-5: Test coverage ≥80%

**Tasks**: 60 tasks (estimate - ~6 tasks per component)

**Components to Split**:
1. `resizable.tsx` (745 lines) → Extract hooks, split into sub-components
2. `KnowledgePage.tsx` (658 lines) → Extract knowledge-specific hooks
3. `quiz-store.ts` (658 lines) → Treat as store, use store-refactorer instead
4. `orama-index.ts` (644 lines) → Split into index/query/embedding modules
5-10. Additional top violators

---

#### Story ARC-2.2: Extract hooks from complex components

**ID**: ARC-2.2
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 10-15 hours
**Agent**: @component-splitter
**Workflow**: normalize-components

**User Story**:
As a developer working on the codebase,
I want to extract custom hooks from complex components to separate concerns,
So that components are cleaner and logic is reusable.

**Acceptance Criteria**:
- AC-1: Extract state management hooks (useAgentConfig, useFileSync, etc.)
- AC-2: Extract side effect hooks (useWebContainer, useIndexedDB, etc.)
- AC-3: Extract event handler hooks (useFileOperations, useToolExecution, etc.)
- AC-4: Hooks independently testable
- AC-5: Zero breaking changes

---

#### Story ARC-2.3: Component composition patterns

**ID**: ARC-2.3
**Status**: 🔴 TODO
**Priority**: P2
**Estimate**: 10-15 hours
**Agent**: @component-splitter
**Workflow**: normalize-components

**User Story**:
As a developer working on the codebase,
I want to apply component composition patterns (render props, children, compound components),
So that components are more flexible and composable.

**Acceptance Criteria**:
- AC-1: Apply render props pattern where appropriate
- AC-2: Apply children prop pattern where appropriate
- AC-3: Apply compound component pattern (e.g., <AgentConfig><Permissions /><Tools /></AgentConfig>)
- AC-4: Document composition patterns
- AC-5: Zero breaking changes

---

## Epic ARC-3: TypeScript Remediation (P0 - Week 3)

**Focus**: Systematic TypeScript error fixing
**Agent**: @typescript-fixer
**Workflow**: fix-typescript-errors
**Duration**: 50-70 hours

### Problem Statement

**1,172 TypeScript errors** blocking development:
- 306 production code errors (P0 - must fix)
- 866 test file errors (IGNORE per governance rules)

**Error Categories** (estimated breakdown):
- Missing imports (TS2304, TS2305): ~300 errors
- Type mismatches (TS2322, TS2345): ~400 errors
- Missing properties (TS2339, TS2739): ~200 errors
- Unused variables (TS6133, TS6196): ~200 errors
- Other: ~72 errors

### Stories

#### Story ARC-3.1: Batch fix missing imports

**ID**: ARC-3.1
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 12-15 hours
**Agent**: @typescript-fixer

**User Story**:
As a developer working on the codebase,
I want to batch fix all missing import errors (TS2304, TS2305),
So that the codebase compiles without import-related blockers.

**Acceptance Criteria**:
- AC-1: Fix ~300 missing import errors
- AC-2: Auto-import React components where appropriate
- AC-3: Verify all imports are correct (no unused imports)
- AC-4: Zero new errors introduced

---

#### Story ARC-3.2: Batch fix type mismatches

**ID**: ARC-3.2
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 15-20 hours
**Agent**: @typescript-fixer

**User Story**:
As a developer working on the codebase,
I want to batch fix type mismatch errors (TS2322, TS2345),
So that all type annotations are correct and type-safe.

**Acceptance Criteria**:
- AC-1: Fix ~400 type mismatch errors
- AC-2: Correct type annotations (no `any` types)
- AC-3: Fix Zustand v5 selector patterns (individual selectors)
- AC-4: Zero new errors introduced

---

#### Story ARC-3.3: Batch fix missing properties

**ID**: ARC-3.3
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 10-12 hours
**Agent**: @typescript-fixer

**User Story**:
As a developer working on the codebase,
I want to batch fix missing property errors (TS2339, TS2739),
So that all objects have complete type definitions.

**Acceptance Criteria**:
- AC-1: Fix ~200 missing property errors
- AC-2: Add missing properties to interfaces
- AC-3: Fix partial type definitions
- AC-4: Zero new errors introduced

---

#### Story ARC-3.4: Final validation and cleanup

**ID**: ARC-3.4
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 10-15 hours
**Agent**: @typescript-fixer

**User Story**:
As a developer working on the codebase,
I want to validate all TypeScript fixes and achieve <10 total errors,
So that the codebase is type-safe and production-ready.

**Acceptance Criteria**:
- AC-1: Total errors <10 (from 1,172)
- AC-2: All production code errors fixed
- AC-3: Zero test failures (100% pass rate)
- AC-4: Documentation updated

---

## Epic ARC-4: IDE Workspace E2E (P0 - Week 4)

**Focus**: Harden IDE workspace file system permissions and sync
**Agent**: @workspace-architect
**Workflow**: workspace-file-system-e2e
**Duration**: 30-40 hours

### Problem Statement

**IDE Workspace File System** (from correct-course-status):
- **Current Status**: FSA API working, bi-directional sync
- **Gap**: Permissions need hardening, concurrent access handling missing
- **AI Agent Integration**: Tool permissions exist but need refinement

### Stories

#### Story ARC-4.1: Audit FSA permission model

**ID**: ARC-4.1
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 4-6 hours
**Agent**: @workspace-architect

**User Story**:
As a system architect,
I want to audit the File System Access API permission model for the IDE workspace,
So that permissions are secure, well-defined, and user-friendly.

**Acceptance Criteria**:
- AC-1: Document current permission model (read/write/execute)
- AC-2: Identify permission gaps (edge cases, concurrent access)
- AC-3: Define permission lifecycle (request, grant, revoke)
- AC-4: Create permission hardening plan

---

#### Story ARC-4.2: Agent tool permission matrix

**ID**: ARC-4.2
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 6-8 hours
**Agent**: @workspace-architect

**User Story**:
As a system architect,
I want to create a comprehensive agent tool permission matrix,
So that AI agents have appropriate file system access with safety guardrails.

**Acceptance Criteria**:
- AC-1: Define tool permissions (read, write, execute, delete)
- AC-2: Implement permission checks per tool
- AC-3: Create permission request/approval UI
- AC-4: Test permission enforcement

---

#### Story ARC-4.3: Concurrent file access handling

**ID**: ARC-4.3
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 6-8 hours
**Agent**: @workspace-architect

**User Story**:
As a developer working on the codebase,
I want to implement robust concurrent file access handling,
So that multiple agents/tools can safely access the file system simultaneously.

**Acceptance Criteria**:
- AC-1: Implement file locking mechanism
- AC-2: Handle concurrent read/write operations
- AC-3: Prevent race conditions and data corruption
- AC-4: Test concurrent access scenarios

---

#### Story ARC-4.4: IDE sync status indicators

**ID**: ARC-4.4
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 4-6 hours
**Agent**: @workspace-architect

**User Story**:
As a user of the IDE workspace,
I want clear visual indicators for file sync status,
So that I understand when files are synchronized and when there are conflicts.

**Acceptance Criteria**:
- AC-1: Create sync status component (syncing, synced, error)
- AC-2: Integrate into IDE status bar
- AC-3: Visual indicators for file conflicts
- AC-4: User-friendly error messages

---

## Epic ARC-5: Notes Workspace E2E (P0 - Week 5)

**Focus**: Full E2E file system implementation for Notes workspace
**Agent**: @file-sync-specialist
**Workflow**: notes-sync-strategy
**Duration**: 40-50 hours

### Problem Statement

**Notes Workspace File System** (from correct-course-status):
- **Current Status**: IndexedDB + FSA sync TODO, not integrated
- **Gap**: 🔴 CRITICAL - No E2E file system sync
- **Impact**: Users cannot reliably use Notes workspace

### Stories

#### Story ARC-5.1: Notes file system strategy

**ID**: ARC-5.1
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 6-8 hours
**Agent**: @file-sync-specialist

**User Story**:
As a system architect,
I want to define the Notes workspace file system strategy (desktop vs mobile),
So that Notes work consistently across all devices.

**Acceptance Criteria**:
- AC-1: Define file system strategy (FSA + IndexedDB hybrid)
- AC-2: Handle offline scenarios (IndexedDB as fallback)
- C-3: Define sync conflict resolution strategy
- AC-4: Document architecture decisions

---

#### Story ARC-5.2: Notes sync concurrency handling

**ID**: ARC-5.2
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 8-10 hours
**Agent**: @file-sync-specialist

**User Story**:
As a developer working on the codebase,
I want to implement robust sync concurrency handling for Notes workspace,
So that multiple devices can sync Notes without data loss.

**Acceptance Criteria**:
- AC-1: Implement last-write-wins strategy
- AC-2: Handle sync conflicts gracefully
- AC-3: Implement conflict resolution UI
- AC-4: Test concurrent sync scenarios

---

#### Story ARC-5.3: Notes AI synthesis integration

**ID**: ARC-5.3
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 6-8 hours
**Agent**: @file-sync-specialist

**User Story**:
As a user of the Notes workspace,
I want AI synthesis integration at the file level (per-note analysis),
So that I can get AI-generated insights for individual notes.

**Acceptance Criteria**:
- AC-1: Integrate AI synthesis API with file watcher
- AC-2: Trigger AI analysis on note save
- AC-3: Display AI insights in note UI
- AC-4: Handle rate limiting and API costs

---

#### Story ARC-5.4: Notes AI synthesis integration (batch)

**ID**: ARC-5.4
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 6-8 hours
**Agent**: @file-sync-specialist

**User Story**:
As a user of the Notes workspace,
I want batch AI synthesis integration (analyze all notes),
So that I can get cross-note insights and connections.

**Acceptance Criteria**:
- AC-1: Implement batch synthesis job
- AC-2: Create synthesis UI trigger
- AC-3: Display batch synthesis results
- AC-4: Handle large note collections efficiently

---

#### Story ARC-5.5: Notes UX/UI for sync status

**ID**: ARC-5.5
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 4-6 hours
**Agent**: @workspace-architect

**User Story**:
As a user of the Notes workspace,
I want clear UX/UI indicators for sync status,
So that I understand when Notes are synced and when there are issues.

**Acceptance Criteria**:
- AC-1: Create sync status badge component
- AC-2: Integrate into Notes UI
- AC-3: Visual indicators for conflicts
- AC-4: User-friendly error messages

---

## Epic ARC-6: Knowledge Workspace E2E (P0 - Week 6)

**Focus**: Same rigor as Notes workspace - full E2E implementation
**Agent**: @file-sync-specialist
**Workflow**: knowledge-sync-strategy
**Duration**: 35-45 hours

### Problem Statement

**Knowledge Workspace File System** (from correct-course-status):
- **Current Status**: IndexedDB + RAG sync TODO, not integrated
- **Gap**: 🔴 CRITICAL - No E2E file system sync
- **Impact**: Users cannot reliably use Knowledge workspace

### Stories

#### Story ARC-6.1: Knowledge file system strategy

**ID**: ARC-6.1
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 6-8 hours
**Agent**: @file-sync-specialist

**User Story**:
As a system architect,
I want to define the Knowledge workspace file system strategy,
So that Knowledge source files (PDF, URL) sync properly.

**Acceptance Criteria**:
- AC-1: Define file system strategy (FSA + IndexedDB + RAG)
- AC-2: Handle large file uploads (PDFs, large texts)
- AC-3: Define sync conflict resolution strategy
- AC-4: Document architecture decisions

---

#### Story ARC-6.2: Knowledge sync with RAG pipeline

**ID**: ARC-6.2
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 8-10 hours
**Agent**: @file-sync-specialist

**User Story**:
As a developer working on the codebase,
I want to integrate file sync with the RAG (Retrieval Augmented Generation) pipeline,
So that source files are automatically indexed and searchable.

**Acceptance Criteria**:
- AC-1: Trigger RAG indexing on file sync
- AC-2: Handle incremental updates (only changed content)
- AC-3: Manage RAG storage quota (IndexedDB limits)
- AC-4: Test sync + RAG integration end-to-end

---

#### Story ARC-6.3: Knowledge AI synthesis integration

**ID**: ARC-6.3
**Status**: 🔴 TODO
**Priority**: P0
**Estimate**: 8-10 hours
**Agent**: @file-sync-specialist

**User Story**:
As a user of the Knowledge workspace,
I want AI synthesis integration for knowledge sources,
So that I can get AI-generated insights and summaries.

**Acceptance Criteria**:
- AC-1: Integrate AI synthesis API with file watcher
- AC-2: Trigger AI analysis on source import
- AC-3: Display AI insights in Knowledge UI
- AC-4: Handle rate limiting and API costs

---

#### Story ARC-6.4: Knowledge UX/UI for sync status

**ID**: ARC-6.4
**Status**: 🔴 TODO
**Priority**: P1
**Estimate**: 4-6 hours
**Agent**: @workspace-architect

**User Story**:
As a user of the Knowledge workspace,
I want clear UX/UI indicators for sync status,
So that I understand when Knowledge sources are synced.

**Acceptance Criteria**:
- AC-1: Create sync status badge component
- AC-2: Integrate into Knowledge UI
- AC-3: Visual indicators for RAG indexing progress
- AC-4: User-friendly error messages

---

## Sprint Status Summary

**Total Epics**: 6
**Total Stories**: 28 (detailed above)
**Total Estimated Duration**: 6 weeks (255-345 hours)

### By Priority

| Priority | Epics | Stories | Hours |
|----------|-------|---------|-------|
| P0 | ARC-1, ARC-3, ARC-4, ARC-5, ARC-6 | 22 | 220-290 |
| P1 | ARC-2 | 3 | 40-55 |

### By Week

| Week | Epic | Stories | Hours |
|------|------|---------|-------|
| Week 1 | ARC-1 (Foundation) | 4 | 60-80 |
| Week 2 | ARC-2 (Components) | 3 | 40-60 |
| Week 3 | ARC-3 (TypeScript) | 4 | 50-70 |
| Week 4 | ARC-4 (IDE E2E) | 4 | 30-40 |
| Week 5 | ARC-5 (Notes E2E) | 5 | 40-50 |
| Week 6 | ARC-6 (Knowledge E2E) | 4 | 35-45 |

---

## Next Action

**Immediate**: Start Epic ARC-1, Story ARC-1.1 (Split dexie-db.ts)

**Status**: 🟢 READY FOR EXECUTION

**Trigger Command**:
```
"Split dexie-db.ts using eliminate-god-stores workflow"
```

**Expected Behavior**:
1. Auto-load architecture-remediation master skill
2. Auto-load store-refactorer agent skill
3. Auto-load eliminate-god-stores workflow skill
4. Execute story-dev-cycle Phase 2 (create-context)
5. Generate context XML for story ARC-1.1

**Story File**: `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` ✅ CREATED
**Sprint Status**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` ✅ ENHANCED

---

**Document Status**: ✅ COMPLETE
**Last Updated**: 2026-01-04T16:00+07:00
**Maintainer**: BMad Master v2.0 (Autonomous)

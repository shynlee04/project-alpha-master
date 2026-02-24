# ARC Sprint Tracking Implementation Plan

**Date**: 2026-01-04  
**Author**: Architecture Remediation Planning Session  
**description**: Comprehensive plan for implementing dedicated sprint tracking for the ARC module  
**Status**: DRAFT - Awaiting Approval

---

## Executive Summary

This plan designs a comprehensive sprint tracking system for the Architecture Remediation (ARC) module that:

1. **Validates and enhances** the existing `arc-sprint-status.yaml`
2. **Manually creates** story file for ARC-1.1 (Split dexie-db.ts) using story-dev-cycle.md workflow
3. **Keeps separate** from main project sprint-status.yaml
4. **Integrates with** the 12 auto-loading Claude skills
5. **Coordinates** agents, workflows, and governance rules

### Current State Analysis

**ARC Module Structure**:
- 6 Agents: store-refactorer, component-splitter, typescript-fixer, test-writer, workspace-architect, file-sync-specialist
- 5 Workflows: eliminate-god-stores, normalize-components, fix-typescript-errors, improve-test-coverage, workspace-file-system-e2e
- 4 Epics: ARC-1 (Foundation - Week 1), ARC-2 (IDE E2E - Week 2), ARC-3 (Notes E2E - Week 3), ARC-4 (Knowledge E2E - Week 4)

**Current Sprint Status** (arc-sprint-status.yaml):
- 180 lines, 4 epics defined
- CD-001 DONE (eliminate circular dependencies)
- ARC-1.1 through ARC-1.4 defined but not yet started
- Next action: ARC-1.1 - Split dexie-db.ts (1,267 lines)

**Skills Integration**:
- 12 total skills: 1 master + 6 agent skills + 5 workflow skills
- Auto-loading triggers configured
- Governance rules embedded
- Located at `.claude/skills/architecture-remediation/`

---

## Phase 1: Enhanced Sprint Status YAML (2-3 hours)

### Objective
Validate and enhance `arc-sprint-status.yaml` to track skills coordination, workflow execution, agent assignments, time tracking, dependencies, and quality gates.

### Step 1.1: Review Current Structure

**Current File**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` (180 lines)

**Existing Structure**:
```yaml
sprint:
  id: ARC-SPRINT-2026-W01
  name: "Foundation Stabilization Sprint"
  start_date: 2026-01-04
  end_date: 2026-01-10
  status: IN_PROGRESS

current_epic:
  id: ARC-1
  name: Foundation Stabilization
  status: IN_PROGRESS
  progress: 0%

epics:
  - id: ARC-1
    name: Foundation Stabilization
    priority: P0
    status: IN_PROGRESS
    target_week: 1
    stories:
      - id: ARC-1.1
        name: Split dexie-db.ts (1,267 lines)
        status: TODO
        priority: P0
        estimated_hours: 8
        assignee: "@bmad-bmm-dev"
        acceptance_criteria: [...]
```

**Gaps Identified**:
- ❌ No skills coordination tracking
- ❌ No workflow phase tracking
- ❌ No actual time tracking (only estimates)
- ❌ No dependency mapping between stories
- ❌ No quality gates metrics (TS errors, test coverage, file size)

### Step 1.2: Design Enhanced Structure

**Add to each story**:

```yaml
stories:
  - id: ARC-1.1
    name: Split dexie-db.ts (1,267 lines)
    status: TODO
    priority: P0
    
    # Time Tracking
    estimated_hours: 8
    actual_hours: null
    
    # Skills Coordination
    skills:
      primary: "store-refactorer"
      workflow: "eliminate-god-stores"
      auto_load_triggers:
        - "dexie-db.ts"
        - "god store"
        - "1,267 lines"
    
    # Workflow Execution
    workflow_phase: "create-story"  # create-story → ready-for-dev → in-progress → review → done
    workflow_started_at: null
    current_agent: null
    
    # Dependencies
    depends_on: []
    blocks: [ARC-1.2]
    
    # Quality Gates
    quality_metrics:
      typescript_errors:
        before: null
        target: 0
        after: null
      test_coverage:
        before: null
        target: 80
        after: null
      file_size_compliance:
        before: "1,267 lines (FAIL)"
        target: "≤120 lines per slice"
        after: null
    
    # Story File Reference
    story_file: "_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md"
    context_file: "_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db-context.xml"
    
    acceptance_criteria: [...]
```

### Step 1.3: Add Skills Coordination Section

**Add new top-level section**:

```yaml
# Skills Coordination Matrix
skills_matrix:
  store-refactorer:
    skills:
      - "architecture-remediation/store-refactorer"
      - "architecture-remediation/workflows/eliminate-god-stores"
    stories:
      - ARC-1.1
      - ARC-1.2
      - ARC-1.3
    status: "READY"
  
  component-splitter:
    skills:
      - "architecture-remediation/component-splitter"
      - "architecture-remediation/workflows/normalize-components"
    stories:
      - ARC-1.4
    status: "READY"
  
  typescript-fixer:
    skills:
      - "architecture-remediation/typescript-fixer"
      - "architecture-remediation/workflows/fix-typescript-errors"
    stories: []
    status: "STANDBY"

# Workflow Execution Log
workflow_log:
  - timestamp: "2026-01-04T10:00:00+07:00"
    story: ARC-1.1
    phase: "create-story"
    agent: "@bmad-bmm-sm"
    status: "STARTED"
    notes: "Story file creation initiated"
```

### Step 1.4: Add Quality Gates Summary

**Add new section**:

```yaml
# Quality Gates Tracking
quality_gates:
  typescript_errors:
    baseline: 1172  # From Ralph Loop Cycle 18
    target: 100
    current: 1172
    trend: "0% reduction"
  
  test_coverage:
    baseline: 45  # Estimated from Ralph Loop
    target: 80
    current: 45
    trend: "0% improvement"
  
  god_stores:
    baseline: 30
    target: 0
    current: 30
    trend: "0% eliminated"
  
  components_oversized:
    baseline: 45
    target: 0
    current: 45
    trend: "0% normalized"
```

### Step 1.5: Validation Checklist

**Before proceeding to Phase 2**:
- [ ] All story entries have skills coordination section
- [ ] All story entries have workflow phase tracking
- [ ] All story entries have quality gates defined
- [ ] Skills matrix maps all 6 agents
- [ ] Workflow log section created
- [ ] Quality gates section created with baseline metrics
- [ ] YAML syntax is valid (use `yamllint` or parser)
- [ ] No duplicate keys or malformed structures

**Output**: Enhanced `arc-sprint-status.yaml` (~250 lines)

---

## Phase 2: Create ARC-1.1 Story File (1-2 hours)

### Objective
Manually create story file for ARC-1.1 (Split dexie-db.ts) following story-dev-cycle.md Phase 1 requirements.

### Step 2.1: Story File Structure

**File**: `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`

**Template** (based on story-dev-cycle.md):

```markdown
---
story_id: ARC-1.1
epic: ARC-1
sprint: ARC-SPRINT-2026-W01
status: drafted
created_at: 2026-01-04T10:00:00+07:00
updated_at: 2026-01-04T10:00:00+07:00
points: 8
priority: P0
---

# Story ARC-1.1: Split dexie-db.ts (1,267 lines)

## Epic Context
- **Epic:** ARC-1 - Foundation Stabilization
- **Sprint:** ARC-SPRINT-2026-W01
- **Priority:** 🔴 CRITICAL (P0)
- **Points:** 8

---

## User Story

**As a** developer maintaining the codebase  
**I want** the dexie-db.ts file split into focused, maintainable slices  
**So that** the database layer is modular, testable, and follows Zustand v5 best practices

---

## Acceptance Criteria

### AC-1: Database Schema Slice
**Given** the dexie-db.ts file is 1,267 lines  
**When** I split the database schema definition  
**Then** a `dexie-db-schema.ts` slice is created with ≤120 lines containing only:
- Database version declaration
- Table schema definitions
- Index declarations

### AC-2: Migrations Slice
**Given** the dexie-db.ts file contains migration logic  
**When** I split the migrations  
**Then** a `dexie-db-migrations.ts` slice is created with ≤120 lines containing:
- Migration registration functions
- Version upgrade logic
- Migration history constants

### AC-3: Database Utilities Slice
**Given** the dexie-db.ts file contains helper functions  
**When** I split the utilities  
**Then** a `dexie-db-utils.ts` slice is created with ≤120 lines containing:
- Database initialization helpers
- Connection management utilities
- Error handling helpers

### AC-4: Unified Database Store
**Given** three focused slices exist  
**When** I compose them into a unified store  
**Then** a `dexie-db.ts` file is created with ≤300 lines that:
- Imports all slices
- Composes them with Zustand's `combine` pattern
- Exports individual selectors (Zustand v5 pattern)
- Maintains backward compatibility with facade exports

### AC-5: Facade Pattern Implementation
**Given** existing code imports from `dexie-db.ts`  
**When** the refactoring is complete  
**Then** zero breaking changes occur because:
- Old import paths still work (facade re-exports)
- All existing consumers continue to function
- TypeScript passes with zero new errors

### AC-6: Test Coverage
**Given** three new slices exist  
**When** I write tests  
**Then** ≥80% test coverage is achieved with:
- Unit tests for each slice (schema, migrations, utils)
- Integration tests for unified store
- Mock tests for Dexie operations

### AC-7: Documentation Update
**Given** the database structure has changed  
**When** the refactoring is complete  
**Then** AGENTS.md is updated with:
- New file locations for database slices
- Import path guidance
- Facade pattern notes

---

## Tasks

### Research (Pre-Implementation)
- [ ] T0: Read `_bmad-output/docs/architecture-analysis-2025-12-28.md` for database patterns
- [ ] T1: Research Dexie.js best practices via Context7 MCP
- [ ] T2: Research Zustand v5 slice patterns via DeepWiki
- [ ] T3: Analyze current `src/infrastructure/persistence/dexie-db-class.ts` structure
- [ ] T4: Map all consumers of `dexie-db.ts` (who imports what)

### Analysis (Store Refactorer)
- [ ] T5: Calculate current file size (1,267 lines confirmed)
- [ ] T6: Identify circular dependencies (if any)
- [ ] T7: Recommend slice boundaries (schema, migrations, utils)
- [ ] T8: Define slice state interfaces
- [ ] T9: Map consumer usage patterns

### Slice Extraction (Store Refactorer)
- [ ] T10: Create `dexie-db-schema.ts` (≤120 lines)
- [ ] T11: Create `dexie-db-migrations.ts` (≤120 lines)
- [ ] T12: Create `dexie-db-utils.ts` (≤120 lines)
- [ ] T13: Add JSDoc comments to all public methods
- [ ] T14: Verify zero circular imports between slices

### Store Unification (Store Refactorer)
- [ ] T15: Create unified `dexie-db.ts` (≤300 lines)
- [ ] T16: Compose slices using Zustand `combine` pattern
- [ ] T17: Export individual selectors (Zustand v5 pattern)
- [ ] T18: Add facade exports for backward compatibility
- [ ] T19: Verify TypeScript passes (zero new errors)

### Testing (Test Writer)
- [ ] T20: Write unit tests for `dexie-db-schema.ts`
- [ ] T21: Write unit tests for `dexie-db-migrations.ts`
- [ ] T22: Write unit tests for `dexie-db-utils.ts`
- [ ] T23: Write integration tests for unified store
- [ ] T24: Verify 100% test pass rate
- [ ] T25: Verify ≥80% test coverage

### Validation & Cleanup (Store Refactorer)
- [ ] T26: Run TypeScript check: `pnpm tsc --noEmit --incremental`
- [ ] T27: Run test suite: `pnpm test`
- [ ] T28: Verify zero breaking changes (all consumers still work)
- [ ] T29: Update AGENTS.md with new file locations
- [ ] T30: Update `arc-sprint-status.yaml` with completion metrics

---

## Research Requirements

| Tool | Query | description |
|------|-------|---------|
| Context7 | Dexie.js database schema patterns | Official Dexie patterns |
| Context7 | Zustand v5 slice composition | Zustand best practices |
| DeepWiki | pmndrs/zustand | GitHub implementation patterns |
| DeepWiki | dfahlander/Dexie.js | Dexie migration patterns |
| Exa | Zustand slice patterns | Community examples |

---

## Dev Notes

### Current File State
**File**: `src/infrastructure/persistence/dexie-db-class.ts`
- **Size**: 1,267 lines (10.6x the 120-line standard)
- **Functions**: ~30 functions (estimated)
- **Dependencies**: Dexie, Zustand, project types
- **Consumers**: All stores that persist to IndexedDB

### Slice Strategy
**Target Structure**:
```
src/infrastructure/persistence/dexie-db/
├── dexie-db-schema.ts (120 lines) - Table definitions, indexes
├── dexie-db-migrations.ts (120 lines) - Migration logic
├── dexie-db-utils.ts (120 lines) - Initialization, error handling
├── dexie-db.ts (300 lines) - Unified store with composed slices
└── __tests__/
    ├── dexie-db-schema.test.ts
    ├── dexie-db-migrations.test.ts
    ├── dexie-db-utils.test.ts
    └── dexie-db.test.ts
```

### Zustand v5 Patterns to Apply
- **Individual Selectors**: Use `const data = useStore(s => s.data)` not `const { data } = useStore()`
- **Slice Composition**: Use `combine()` to compose slices
- **Persist on Combined Store**: Configure persist once on unified store
- **Partialize**: Use `partialize` to select which state to persist

### Facade Pattern
**Before** (breaking):
```typescript
// Old import path still works via facade
export { useViaGentDatabase } from './dexie-db-class';
```

**After** (backward compatible):
```typescript
// New unified store re-exports for old consumers
export { useViaGentDatabase } from './dexie-db';  // Facade
export * from './dexie-db-schema';
export * from './dexie-db-migrations';
export * from './dexie-db-utils';
```

---

## References

- [Dexie.js Documentation](https://dexie.org/docs/)
- [Zustand v5 Guide](https://docs.pmnd.rs/zustand/getting-started)
- [Zustand Slices Pattern](https://docs.pmnd.rs/zustand/guides/slices-pattern)
- [God Store Elimination Workflow](../../../../_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md)
- [Store Refactorer Agent](../../../../_bmad/modules/architecture-remediation/agents/store-refactorer.md)

---

## Dev Agent Record

**Agent:** {To be filled during development}  
**Session:** {To be filled during development}

### Task Progress:
- [ ] T0-T4: Research (0/5 complete)
- [ ] T5-T9: Analysis (0/5 complete)
- [ ] T10-T14: Slice Extraction (0/5 complete)
- [ ] T15-T19: Store Unification (0/5 complete)
- [ ] T20-T25: Testing (0/6 complete)
- [ ] T26-T30: Validation & Cleanup (0/5 complete)

### Research Executed:
{To be filled during development}

### Files Changed:
{To be filled during development}

### Tests Created:
{To be filled during development}

### Decisions Made:
{To be filled during development}

---

## Code Review

**Reviewer:** {To be filled during review}  
**Date:** {To be filled during review}

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found:
{To be filled during review}

### Sign-off:
{To be filled during review}

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2026-01-04T10:00:00+07:00 | drafted | @bmad-bmm-sm | Story file created |
| | | | |
| | | | |
```

### Step 2.2: Validation Checklist

**Before proceeding to Phase 3**:
- [ ] Story file exists at `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`
- [ ] User story format complete (As a/I want/So that)
- [ ] At least 7 acceptance criteria defined (AC-1 through AC-7)
- [ ] Each AC has Given/When/Then format
- [ ] Tasks section with 30 checkboxes (T0 through T30)
- [ ] Research Requirements section populated with 5 MCP tool queries
- [ ] Dev Notes references architecture patterns
- [ ] References section has 5 documentation links
- [ ] Dev Agent Record section exists (empty, ready for development)
- [ ] Code Review section exists (empty, ready for review)
- [ ] Status History table created with initial row
- [ ] Status set to `drafted`
- [ ] YAML frontmatter complete with all required fields

**Output**: Complete story file `ARC-1.1-split-dexie-db.md` (~250 lines)

---

## Phase 3: Update Governance Tracking (30 minutes)

### Objective
Update epic-tracking.md and governance rules to reflect new sprint tracking capabilities.

### Step 3.1: Update epic-tracking.md

**File**: `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`

**Add to Story CD-001 section**:
```markdown
---

## Story ARC-1.1: Split dexie-db.ts (🟡 IN_PROGRESS)

**Duration**: 8-12 hours (estimated)
**Status**: 🟡 IN_PROGRESS
**Health Score Impact**: +0.5 (projected)

**Workflow Phase**: create-story → ready-for-dev

**Skills Coordination**:
- **Primary Skill**: store-refactorer
- **Workflow**: eliminate-god-stores
- **Auto-Load Triggers**: ["dexie-db.ts", "god store", "1,267 lines"]

**Quality Gates**:
- TypeScript Errors: 0 new errors (baseline: 1,172)
- File Size: 1,267 → ≤120 lines per slice
- Test Coverage: Target ≥80%

**Story File**: `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`

**Progress**: 0/30 tasks (0%)
```

### Step 3.2: Update Governance Rules Reference

**File**: `.claude/rules/governance-rules.md`

**Add new Rule 9: Sprint Tracking**:

```markdown
## Rule 9: Sprint Tracking for ARC Module

### ARC Sprint Status
- **Location**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
- **description**: Dedicated tracking for Architecture Remediation epics
- **Update Frequency**: After every story phase completion

### Story File Creation
- **Location**: `_bmad-output/sprint-artifacts/{story-slug}.md`
- **Format**: Markdown with YAML frontmatter
- **Workflow**: Follow `.agent/workflows/story-dev-cycle.md` strictly
- **Phases**: create-story → create-context → dev-story → code-review → story-done

### Skills Coordination Tracking
Each story MUST track:
- Primary agent skill (e.g., store-refactorer)
- Workflow skill (e.g., eliminate-god-stores)
- Auto-load triggers (keywords that activate skills)
- Current workflow phase
- Skill activation history

### Quality Gates Metrics
Each story MUST report:
- TypeScript errors (before/after)
- Test coverage (before/after/target)
- File size compliance (before/after/target)
- Time tracking (estimated vs actual)

### Validation Gates
- [ ] All acceptance criteria met
- [ ] All tasks complete
- [ ] All tests passing (100% pass rate)
- [ ] TypeScript passes (code files only)
- [ ] File size limits respected
- [ ] Zero breaking changes (facade pattern)
```

### Step 3.3: Validation Checklist

**Before proceeding to Phase 4**:
- [ ] epic-tracking.md updated with ARC-1.1 section
- [ ] governance-rules.md has new Rule 9 added
- [ ] All file paths are correct
- [ ] All references use consistent naming
- [ ] No broken links to story files

**Output**: Updated governance tracking files

---

## Phase 4: Skills Integration Verification (30 minutes)

### Objective
Verify that all 12 ARC skills auto-load correctly based on story context.

### Step 4.1: Map Skills to Stories

**Create Skills Activation Matrix**:

```yaml
# Skills Activation Matrix (add to arc-sprint-status.yaml)
skills_activation:
  ARC-1.1:
    primary_skill: "store-refactorer"
    workflow_skill: "eliminate-god-stores"
    trigger_keywords:
      - "dexie-db.ts"
      - "god store"
      - "1,267 lines"
      - "split database"
    activation_history:
      - timestamp: "2026-01-04T10:00:00+07:00"
        skill: "architecture-remediation"
        reason: "Story context mentions 'god store' and '1,267 lines'"
      - timestamp: "2026-01-04T10:05:00+07:00"
        skill: "store-refactorer"
        reason: "Workflow phase: create-story"
  
  ARC-1.2:
    primary_skill: "store-refactorer"
    workflow_skill: "eliminate-god-stores"
    trigger_keywords: ["duplicate", "consolidate"]
  
  ARC-1.3:
    primary_skill: "store-refactorer"
    workflow_skill: "eliminate-god-stores"
    trigger_keywords: ["event-bus", "644 lines"]
  
  ARC-1.4:
    primary_skill: "component-splitter"
    workflow_skill: "normalize-components"
    trigger_keywords: ["component", ">300 lines"]
```

### Step 4.2: Verify Auto-Loading Configuration

**Check Skill Files**:

1. **Master Skill** (`.claude/skills/architecture-remediation/SKILL.md`):
   - [ ] Description mentions "god stores (>300 lines)"
   - [ ] Auto-load triggers include: "god store", "typescript errors", "oversized components"
   - [ ] Loads all sub-skills (agents + workflows)

2. **Agent Skills** (6 files):
   - [ ] `store-refactorer/SKILL.md` triggers: "god store", "split", "refactor store"
   - [ ] `component-splitter/SKILL.md` triggers: "component", ">300 lines", "extract"
   - [ ] `typescript-fixer/SKILL.md` triggers: "typescript error", "TS error"
   - [ ] `test-writer/SKILL.md` triggers: "test coverage", "write tests"
   - [ ] `workspace-architect/SKILL.md` triggers: "workspace E2E", "file system"
   - [ ] `file-sync-specialist/SKILL.md` triggers: "sync strategy", "conflict resolution"

3. **Workflow Skills** (5 files):
   - [ ] `eliminate-god-stores/SKILL.md` triggers: "eliminate god stores", "split store"
   - [ ] `normalize-components/SKILL.md` triggers: "normalize components", "split components"
   - [ ] `fix-typescript-errors/SKILL.md` triggers: "fix typescript", "batch fix"
   - [ ] `improve-test-coverage/SKILL.md` triggers: "test coverage", "≥80%"
   - [ ] `workspace-file-system-e2e/SKILL.md` triggers: "workspace E2E", "file system end-to-end"

### Step 4.3: Validation Checklist

**Before proceeding to Phase 5**:
- [ ] All 12 skill files have correct triggers defined
- [ ] Master skill loads all sub-skills
- [ ] Agent skills are mutually exclusive (one agent per story)
- [ ] Workflow skills are mutually exclusive (one workflow per story)
- [ ] Auto-load triggers use consistent keyword vocabulary
- [ ] No trigger keyword conflicts between skills
- [ ] Skills activation matrix created for all ARC-1 stories

**Output**: Verified skills integration

---

## Phase 5: Handoff Documentation (30 minutes)

### Objective
Create comprehensive handoff artifacts for transitioning from planning to execution.

### Step 5.1: Create Handoff Document

**File**: `_bmad-output/handoff-arc-sprint-tracking-implementation-2026-01-04.md`

**Template**:

```markdown
# Handoff: ARC Sprint Tracking Implementation

**Date**: 2026-01-04  
**Phase**: Planning Complete  
**Next Phase**: Story Development (ARC-1.1)

---

## Completed Work

### Phase 1: Enhanced Sprint Status YAML
- ✅ Enhanced `arc-sprint-status.yaml` with skills coordination
- ✅ Added workflow phase tracking
- ✅ Added quality gates metrics
- ✅ Added time tracking (estimated vs actual)
- ✅ Added dependency mapping
- ✅ File size: 180 → 250 lines

### Phase 2: Story File Creation
- ✅ Created `ARC-1.1-split-dexie-db.md` (250 lines)
- ✅ 7 acceptance criteria defined
- ✅ 30 tasks breakdown
- ✅ 5 MCP research queries specified
- ✅ Dev Notes with architecture patterns
- ✅ References to all relevant docs

### Phase 3: Governance Tracking
- ✅ Updated `epic-tracking.md` with ARC-1.1 section
- ✅ Added Rule 9 to `governance-rules.md`
- ✅ All file paths validated

### Phase 4: Skills Integration
- ✅ Mapped all 12 skills to stories
- ✅ Verified auto-load triggers
- ✅ Created skills activation matrix
- ✅ Validated skill configuration

---

## Artifacts Created

### Primary Files
1. `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` - ENHANCED
   - Added skills coordination section
   - Added workflow execution tracking
   - Added quality gates metrics
   - Added time tracking

2. `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` - CREATED
   - Complete story file with all sections
   - 7 acceptance criteria
   - 30 tasks
   - Research requirements
   - Dev notes
   - References

3. `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md` - UPDATED
   - Added ARC-1.1 story section
   - Skills coordination info
   - Quality gates metrics

4. `.claude/rules/governance-rules.md` - UPDATED
   - Added Rule 9: Sprint Tracking for ARC Module

### Supporting Documents
5. `.claude/skills/architecture-remediation/SKILL.md` - VERIFIED
6. `arc-sprint-status-enhancement-plan.md` - THIS DOCUMENT

---

## Validation Results

### Sprint Status YAML
- ✅ All stories have skills coordination section
- ✅ All stories have workflow phase tracking
- ✅ All stories have quality gates defined
- ✅ Skills matrix maps all 6 agents
- ✅ Workflow log section created
- ✅ Quality gates section with baseline metrics
- ✅ YAML syntax valid

### Story File (ARC-1.1)
- ✅ User story format complete
- ✅ 7 acceptance criteria (AC-1 through AC-7)
- ✅ Each AC has Given/When/Then format
- ✅ 30 tasks with checkboxes
- ✅ 5 MCP research queries specified
- ✅ Dev Notes references architecture patterns
- ✅ 5 documentation references
- ✅ Dev Agent Record section ready
- ✅ Code Review section ready
- ✅ Status History table created
- ✅ YAML frontmatter complete

### Governance Files
- ✅ epic-tracking.md updated
- ✅ governance-rules.md updated
- ✅ All file paths correct
- ✅ No broken links

### Skills Integration
- ✅ All 12 skills verified
- ✅ Auto-load triggers consistent
- ✅ Skills activation matrix created
- ✅ No trigger conflicts

---

## Next Action: Start Story Development (ARC-1.1)

### Step 1: Load Store Refactorer Skill
```
"Load store-refactorer skill for ARC-1.1"
```

**Expected Behavior**:
- Auto-loads `architecture-remediation` master skill
- Auto-loads `store-refactorer` agent skill
- Auto-loads `eliminate-god-stores` workflow skill

### Step 2: Execute Story Development Cycle
Follow `.agent/workflows/story-dev-cycle.md`:

**Phase 1: create-story** ✅ COMPLETE
- Story file created: `ARC-1.1-split-dexie-db.md`
- Status: drafted

**Phase 2: create-context** ⏭️ NEXT
- Create context XML file: `ARC-1.1-split-dexie-db-context.xml`
- Include current code state from `dexie-db-class.ts`
- Include research findings from MCP tools
- Update sprint status: drafted → ready-for-dev

**Phase 3: dev-story** ⏳ PENDING
- Load @bmad-bmm-dev agent
- Execute research tasks (T0-T4)
- Implement tasks (T5-T25)
- Update Dev Agent Record
- Update sprint status: ready-for-dev → in-progress → review

**Phase 4: code-review** ⏳ PENDING
- Run code review workflow
- Address feedback if needed
- Update sprint status: review → done

**Phase 5: story-done** ⏳ PENDING
- Update all governance files
- Log artifacts created
- Calculate metrics (hours, tests, coverage)

### Step 3: Update Sprint Status
After each phase, update `arc-sprint-status.yaml`:

```yaml
# After Phase 2 (create-context)
stories:
  - id: ARC-1.1
    workflow_phase: "ready-for-dev"
    workflow_started_at: "2026-01-04T11:00:00+07:00"

# After Phase 3 (dev-story)
stories:
  - id: ARC-1.1
    workflow_phase: "review"
    actual_hours: 8
    quality_metrics:
      typescript_errors:
        after: 0
      test_coverage:
        after: 85
      file_size_compliance:
        after: "✅ 120 lines per slice"

# After Phase 4 (code-review)
stories:
  - id: ARC-1.1
    workflow_phase: "done"
```

---

## Critical Files for Implementation

**Must Read Before Starting**:
1. `.agent/workflows/story-dev-cycle.md` - Complete workflow guide
2. `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` - Story file
3. `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` - Sprint tracking
4. `.claude/rules/governance-rules.md` - Governance rules

**Skills to Load**:
1. `architecture-remediation` - Master skill
2. `store-refactorer` - Agent skill
3. `eliminate-god-stores` - Workflow skill

---

## Success Metrics

### Phase Completion Criteria
- [ ] All 5 phases of this plan complete
- [ ] All validation checklists passed
- [ ] All artifacts created
- [ ] All governance files updated

### Story Success Criteria (ARC-1.1)
- [ ] All 7 acceptance criteria met
- [ ] All 30 tasks complete
- [ ] All tests passing (100% pass rate)
- [ ] Test coverage ≥80%
- [ ] Zero TypeScript errors (code files only)
- [ ] All slices ≤120 lines
- [ ] Unified store ≤300 lines
- [ ] Zero breaking changes
- [ ] AGENTS.md updated

### Sprint Success Criteria (ARC-1)
- [ ] All 4 stories (ARC-1.1 through ARC-1.4) complete
- [ ] Health score improvement ≥+1.5
- [ ] God stores reduced by ≥25%
- [ ] Zero P0 blockers remaining

---

## Blockers & Risks

### Current Blockers
None identified

### Risks to Monitor
1. **Scope Creep**: Adding new database features instead of just splitting
   - **Mitigation**: Strict scope gating, focus only on slicing

2. **Consumer Breaking**: Changing import paths breaks existing code
   - **Mitigation**: Facade pattern enforced, zero breaking changes required

3. **Test Coverage Gap**: Not achieving ≥80% coverage
   - **Mitigation**: Test-writer skill auto-loads, dedicated testing tasks

4. **Time Overrun**: Estimated 8 hours insufficient
   - **Mitigation**: Track actual hours, adjust estimates for future stories

---

## Governance Compliance Checklist

Before executing ARC-1.1 development:

- [ ] Story file complete (all sections populated)
- [ ] Context XML created (Phase 2)
- [ ] Sprint status updated (drafted → ready-for-dev)
- [ ] Skills auto-loading verified
- [ ] MCP research protocol understood
- [ ] Governance rules reviewed (Rules 1-9)
- [ ] File size limits known (≤120 lines slices, ≤300 lines components)
- [ ] Facade pattern commitment (zero breaking changes)
- [ ] TypeScript strategy confirmed (code files only, test files excluded)
- [ ] Test requirements clear (≥80% coverage, 100% pass rate)

---

## Handoff Summary

**From**: Architecture Remediation Planning Session  
**To**: @store-refactorer (via architecture-remediation master skill)  
**Task**: Execute Story Development Cycle for ARC-1.1  
**Status**: Ready to Start  
**Estimated Duration**: 8-12 hours

**Files Modified**: 4 files (enhanced, updated, created)  
**Artifacts Created**: 6 files (story file, handoff doc, etc.)  
**Validation Status**: ✅ All checks passed

**Next Command**:
```
"Split dexie-db.ts using eliminate-god-stores workflow"
```

This will:
1. Auto-load architecture-remediation master skill
2. Auto-load store-refactorer agent skill
3. Auto-load eliminate-god-stores workflow skill
4. Execute Phase 2 (create-context)
5. Proceed through story-dev-cycle.md workflow

---

**Handoff Complete** ✅
```

### Step 5.2: Validation Checklist

**Before marking plan complete**:
- [ ] Handoff document created
- [ ] All artifacts listed
- [ ] All validation results documented
- [ ] Next action clearly defined
- [ ] Success metrics specified
- [ ] Blockers and risks documented
- [ ] Governance compliance checklist complete

**Output**: Handoff document ready for transition to execution

---

## Success Criteria Summary

### Phase 1: Enhanced Sprint Status (2-3 hours)
✅ **Success**: All 8 validation checkpoints passed

### Phase 2: Story File Creation (1-2 hours)
✅ **Success**: All 14 validation checkpoints passed

### Phase 3: Governance Tracking (30 minutes)
✅ **Success**: All 4 validation checkpoints passed

### Phase 4: Skills Integration (30 minutes)
✅ **Success**: All 7 validation checkpoints passed

### Phase 5: Handoff Documentation (30 minutes)
✅ **Success**: All 7 validation checkpoints passed

---

## Overall Plan Success Metrics

### Quantitative Metrics
- **Total Files Modified**: 4 files
- **Total Files Created**: 2 files (story + handoff)
- **Total Lines Written**: ~500 lines (YAML + Markdown)
- **Estimated Time**: 4-6 hours
- **Validation Checkpoints**: 40 total checkpoints

### Qualitative Metrics
- **Story-Dev-Cycle.md Compliance**: 100%
- **Governance Rules Compliance**: 100%
- **Skills Integration**: 12/12 skills verified
- **Documentation Quality**: Production-ready

### Risk Mitigation
- **Breaking Changes**: Facade pattern enforced
- **Scope Creep**: Strict story boundaries
- **Quality Gates**: Metrics defined and tracked
- **Handoff Clarity**: Comprehensive documentation

---

## Critical Files for Implementation

### Primary Implementation Files
1. **`_bmad-output/sprint-artifacts/arc-sprint-status.yaml`**
   - Reason: Master sprint tracking file for ARC module
   - Changes: Add skills coordination, workflow tracking, quality gates
   - Size: 180 → 250 lines

2. **`_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`**
   - Reason: Story file following story-dev-cycle.md Phase 1 template
   - Changes: New file creation
   - Size: ~250 lines

3. **`_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`**
   - Reason: Epic-level progress tracking
   - Changes: Add ARC-1.1 story section with skills info
   - Size: Add ~30 lines

4. **`.claude/rules/governance-rules.md`**
   - Reason: Governance rules enforcement
   - Changes: Add Rule 9 for ARC sprint tracking
   - Size: Add ~40 lines

### Context Reference Files
5. **`.agent/workflows/story-dev-cycle.md`**
   - Reason: Master workflow template for story development
   - Usage: Follow strictly for all phases

6. **`.claude/skills/architecture-remediation/SKILL.md`**
   - Reason: Master skill that loads all sub-skills
   - Usage: Verify auto-load triggers

7. **`_bmad-output/sprint-artifacts/arc-sprint-status.yaml`** (current)
   - Reason: Current state to enhance
   - Usage: Baseline for enhancements

---

## Appendix: File Modification Order

### Sequential Execution Order

**Step 1**: Read all reference files (30 minutes)
- Read story-dev-cycle.md
- Read governance-rules.md
- Read current arc-sprint-status.yaml
- Read skills directory structure

**Step 2**: Enhance arc-sprint-status.yaml (2-3 hours)
- Add skills coordination section
- Add workflow tracking section
- Add quality gates section
- Validate YAML syntax

**Step 3**: Create ARC-1.1 story file (1-2 hours)
- Create file with template structure
- Populate all required sections
- Validate against story-dev-cycle.md requirements
- Update arc-sprint-status.yaml

**Step 4**: Update governance tracking (30 minutes)
- Update epic-tracking.md
- Update governance-rules.md
- Validate all file paths

**Step 5**: Verify skills integration (30 minutes)
- Map skills to stories
- Verify auto-load triggers
- Create skills activation matrix

**Step 6**: Create handoff documentation (30 minutes)
- Write comprehensive handoff doc
- Document all artifacts
- Define next action

**Step 7**: Final validation (15 minutes)
- Run all validation checklists
- Verify 40/40 checkpoints pass
- Approve for execution

---

**END OF IMPLEMENTATION PLAN**


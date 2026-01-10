# ARC Sprint Tracking Implementation Plan

**Created**: 2026-01-04
**Status**: READY FOR EXECUTION
**Estimated Duration**: 4-6 hours
**User Intent**: Validate and enhance ARC sprint tracking, create ARC-1.1 story file, integrate skills coordination

---

## Overview

Create a dedicated sprint tracking system for the Architecture Remediation (ARC) module that integrates with the 12 auto-loading Claude skills, follows the story-dev-cycle.md workflow strictly, and maintains separate tracking from the main project sprint.

---

## Current State Analysis

### ARC Module Structure
- **Location**: `_bmad/modules/architecture-remediation/`
- **6 Agents**: store-refactorer, component-splitter, typescript-fixer, test-writer, workspace-architect, file-sync-specialist
- **5 Workflows**: eliminate-god-stores, normalize-components, fix-typescript-errors, improve-test-coverage, workspace-file-system-e2e
- **4 Epics**: ARC-1 (Foundation), ARC-2 (IDE E2E), ARC-3 (Notes E2E), ARC-4 (Knowledge E2E)

### Current Sprint Status
- **File**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
- **Status**: 180 lines, 4 epics defined, CD-001 DONE, ARC-1.1-ARC-1.4 pending
- **Gap**: Missing skills coordination, workflow tracking, quality gates metrics

### Skills Integration
- **12 Skills**: 1 master + 6 agents + 5 workflows
- **Location**: `.claude/skills/architecture-remediation/`
- **Status**: Auto-loading configured, governance rules embedded

---

## Implementation Plan

### Phase 1: Enhanced Sprint Status YAML (2-3 hours)

**Objective**: Validate and enhance `arc-sprint-status.yaml` with skills coordination and workflow tracking.

**File**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`

**Key Enhancements**:
1. Add skills coordination section for each story
2. Add workflow phase tracking (create-story → ready-for-dev → in-progress → review → done)
3. Add quality metrics (TypeScript errors, test coverage, file size compliance)
4. Add agent assignments and skill auto-load triggers

**Example Enhancement**:
```yaml
stories:
  - id: ARC-1.1
    name: "Split dexie-db.ts (1,267 lines)"
    status: "ready-for-dev"
    skills:
      primary: "store-refactorer"
      workflow: "eliminate-god-stores"
      auto_load_triggers: ["dexie-db.ts", "god store", "1,267 lines"]
    workflow_phase: "create-story"
    quality_metrics:
      typescript_errors: { before: 1172, target: 0, after: null }
      file_size_compliance: { before: "1,267 lines", target: "≤120 lines", after: null }
```

**New Sections to Add**:
- Skills Coordination Matrix (maps 6 agents to stories)
- Workflow Execution Log (tracks phase transitions)
- Quality Gates Tracking (baseline metrics: TS errors 1172, coverage 45%, god stores 30)

**Validation Checkpoints** (8 total):
- [ ] All stories have skills coordination section
- [ ] All stories have workflow phase tracking
- [ ] Skills matrix complete and accurate
- [ ] Quality gates defined with baselines
- [ ] YAML syntax valid
- [ ] No broken references
- [ ] Time estimates realistic
- [ ] Dependencies clear

**Success Criteria**:
- Sprint status YAML: 180 → 250 lines
- All stories mapped to skills
- Quality gates measurable

---

### Phase 2: Create ARC-1.1 Story File (1-2 hours)

**Objective**: Manually create story file following `story-dev-cycle.md` Phase 1 requirements.

**File**: `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` (NEW)

**Required Sections**:

1. **YAML Frontmatter**
   ```yaml
   ---
   id: "ARC-1.1"
   epic: "ARC-1 (Foundation Stabilization)"
   title: "Split dexie-db.ts (1,267 lines)"
   status: "drafted"
   priority: "P0"
   estimate: 10
   team: "Team A"
   points: 8
   created: "2026-01-04T14:30:00+07:00"
   ---
   ```

2. **User Story**
   - Format: "As a developer working on the codebase, I want to split the monolithic dexie-db.ts file into modular, maintainable slices so that the database schema is easier to understand, test, and extend."

3. **Context & Motivation**
   - Current state: dexie-db.ts is 1,267 lines (violates ≤120 line rule)
   - Problem: God class makes testing difficult, creates maintenance burden
   - Value: Improved testability, easier onboarding, better code organization

4. **Acceptance Criteria** (7 ACs with Given/When/Then)
   - AC-1: Database Schema Slice (≤120 lines)
   - AC-2: Migrations Slice (≤120 lines)
   - AC-3: Utilities Slice (≤120 lines)
   - AC-4: Unified Store (≤300 lines total)
   - AC-5: Facade Pattern (zero breaking changes)
   - AC-6: Test Coverage (≥80%)
   - AC-7: Documentation Updated

5. **Tasks** (30 checkboxes T0-T30)
   - Research (5 tasks): Context7 queries, DeepWiki searches
   - Analysis (5 tasks): File dependencies, import locations, usage patterns
   - Slice Extraction (5 tasks): Create schema slice, migrations slice, utils slice
   - Store Unification (5 tasks): Combine slices, create exports, add facade
   - Testing (6 tasks): Unit tests for each slice, integration tests
   - Validation (5 tasks): TypeScript checking, test coverage, size validation

6. **Research Requirements** (5 MCP tool queries)
   - Context7: Dexie.js official patterns
   - Context7: Zustand v5 slice composition
   - DeepWiki: pmndrs/zustand best practices
   - DeepWiki: dfahlander/Dexie.js patterns
   - Exa: Community examples of modular database schemas

7. **Dev Notes**
   - Architecture patterns: 4-layer architecture (core → domain → infrastructure → presentation)
   - Zustand v5 patterns: Individual selectors, slice composition
   - Facade strategy: Maintain old export paths, deprecation warnings

8. **References**
   - `_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md`
   - `_bmad/modules/architecture-remediation/agents/store-refactorer.md`
   - `.agent/workflows/story-dev-cycle.md`
   - `docs/dependencies-libraries-usage.md`
   - `_bmad-output/prompts/2026-01-04/comprehensive-correct-course-production-ready.md`

9. **Dev Agent Record** (empty template)
10. **Code Review** (empty template)
11. **Status History** (table tracking phase transitions)

**Validation Checkpoints** (14 total):
- [ ] Story file exists at correct path
- [ ] YAML frontmatter complete and valid
- [ ] User story format correct
- [ ] 7 ACs defined with Given/When/Then
- [ ] 30 tasks with checkboxes
- [ ] 5 MCP research queries defined
- [ ] Dev Notes populated
- [ ] References complete with valid paths
- [ ] Dev Agent Record template present
- [ ] Code Review template present
- [ ] Status History table present
- [ ] Status set to `drafted`
- [ ] No broken links
- [ ] File size reasonable (~250 lines)

**Success Criteria**:
- Story file created
- 100% story-dev-cycle Phase 1 compliance
- Ready for Phase 2 (create-context)

---

### Phase 3: Update Governance Tracking (30 minutes)

**Objective**: Update epic-tracking.md and governance-rules.md.

**File 1**: `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`

**Add Section**:
```markdown
## Story ARC-1.1: Split dexie-db.ts (🟡 IN_PROGRESS)

**Workflow Phase**: create-story → ready-for-dev
**Skills**: store-refactorer + eliminate-god-stores
**Agent**: @store-refactorer
**Quality Gates**:
- TypeScript: 0 new errors
- File Size: ≤120 lines per slice
- Test Coverage: ≥80%
- Breaking Changes: 0 (facade pattern)

**Next Action**: Execute Phase 2 (create-context) with story file
```

**File 2**: `.claude/rules/governance-rules.md`

**Add Rule 9**:
```markdown
## Rule 9: Sprint Tracking for ARC Module

**Purpose**: Track Architecture Remediation sprint progress with skills coordination.

**Tracking File**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`

**Workflow**: Follow `.agent/workflows/story-dev-cycle.md` strictly

**Skills Coordination**:
- Map each story to primary skill and workflow
- Track skill activation history
- Document auto-load triggers

**Quality Metrics**:
- Report TypeScript errors (code files only)
- Track test coverage (target ≥80%)
- Monitor file size compliance (stores ≤120 lines, components ≤300 lines)

**Separation from Main Project**:
- ARC sprint tracking stays separate
- No cross-references to main sprint-status.yaml
- Independent epic and story structure

**Updates**:
- After every story phase transition
- After skill execution completes
- After quality gate validation
```

**Validation Checkpoints** (4 total):
- [ ] epic-tracking.md updated with ARC-1.1 section
- [ ] governance-rules.md updated with Rule 9
- [ ] All file paths correct
- [ ] No broken internal links

**Success Criteria**:
- Governance rules documented
- Epic tracking current
- Clear separation from main project

---

### Phase 4: Skills Integration Verification (30 minutes)

**Objective**: Verify all 12 ARC skills auto-load correctly for ARC-1.1.

**Skills Matrix**:

| Skill Type | Skill Name | ARC-1.1 | Auto-Load Triggers |
|------------|------------|---------|-------------------|
| Master | architecture-remediation | ✅ | "split", "refactor", "eliminate god" |
| Agent | store-refactorer | ✅ | "dexie-db.ts", "god store", "1,267 lines" |
| Agent | component-splitter | ❌ | "component too large" |
| Agent | typescript-fixer | ❌ | "fix typescript" |
| Agent | test-writer | ✅ | (auto-loads for testing phase) |
| Agent | workspace-architect | ❌ | (ARC-2, ARC-3, ARC-4 only) |
| Agent | file-sync-specialist | ❌ | (ARC-3, ARC-4 only) |
| Workflow | eliminate-god-stores | ✅ | "using eliminate-god-stores workflow" |
| Workflow | normalize-components | ❌ | (future stories) |
| Workflow | fix-typescript-errors | ❌ | (future stories) |
| Workflow | improve-test-coverage | ✅ | (auto-loads for testing) |
| Workflow | workspace-file-system-e2e | ❌ | (ARC-2, ARC-3, ARC-4 only) |

**Verification Steps**:
1. Read master skill at `.claude/skills/architecture-remediation/SKILL.md`
2. Verify it loads store-refactorer for ARC-1.1
3. Verify store-refactorer loads eliminate-god-stores workflow
4. Check auto-load triggers match story keywords
5. Validate governance rules embedded in skills
6. Confirm quality gates defined
7. Test skill activation (dry run)

**Validation Checkpoints** (7 total):
- [ ] Master skill verified
- [ ] store-refactorer skill verified
- [ ] eliminate-god-stores workflow skill verified
- [ ] Auto-load triggers consistent
- [ ] No trigger conflicts
- [ ] Skills matrix created
- [ ] Dry run successful

**Success Criteria**:
- All 12 skills catalogued
- ARC-1.1 skill activation path clear
- Auto-load triggers documented

---

### Phase 5: Handoff Documentation (30 minutes)

**Objective**: Create comprehensive handoff for execution transition.

**File**: `_bmad-output/handoff-arc-sprint-tracking-implementation-2026-01-04.md` (NEW)

**Handoff Document Structure**:

```markdown
# ARC Sprint Tracking Implementation - Handoff

**Date**: 2026-01-04T15:30+07:00
**Agent**: BMad Master v2.0 (Autonomous)
**Status**: READY FOR EXECUTION

## Completed Work Summary

### Phase 1: Enhanced Sprint Status (✅ COMPLETE)
- **File**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
- **Changes**: +70 lines (skills coordination, workflow tracking, quality gates)
- **Validation**: 8/8 checkpoints passed

### Phase 2: Created ARC-1.1 Story File (✅ COMPLETE)
- **File**: `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`
- **Size**: 250 lines
- **Validation**: 14/14 checkpoints passed

### Phase 3: Updated Governance Tracking (✅ COMPLETE)
- **Files**: epic-tracking.md, governance-rules.md
- **Changes**: Added Rule 9, ARC-1.1 section
- **Validation**: 4/4 checkpoints passed

### Phase 4: Verified Skills Integration (✅ COMPLETE)
- **Skills**: 12/12 verified
- **Matrix**: Created skills-to-stories mapping
- **Validation**: 7/7 checkpoints passed

## Artifacts Created

### Modified Files (4)
1. `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` (enhanced)
2. `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md` (updated)
3. `.claude/rules/governance-rules.md` (Rule 9 added)

### Created Files (2)
1. `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` (story file)
2. `_bmad-output/handoff-arc-sprint-tracking-implementation-2026-01-04.md` (this file)

## Validation Results

**Total Checkpoints**: 40
**Passed**: 40/40 (100%)
**Failed**: 0

### Breakdown by Phase
- Phase 1: 8/8 passed
- Phase 2: 14/14 passed
- Phase 3: 4/4 passed
- Phase 4: 7/7 passed
- Phase 5: 7/7 passed

## Next Action

**Command**: "Split dexie-db.ts using eliminate-god-stores workflow"

**Expected Behavior**:
1. Auto-load architecture-remediation master skill
2. Auto-load store-refactorer agent skill
3. Auto-load eliminate-god-stores workflow skill
4. Execute story-dev-cycle.md Phase 2 (create-context)
5. Generate context XML file
6. Transition to Phase 3 (development)

**Files to Load**:
- Story: `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`
- Sprint Status: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
- Epic Tracking: `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`

## Critical Files List

### Must Read
1. `.agent/workflows/story-dev-cycle.md` (master workflow)
2. `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` (story file)
3. `_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md` (workflow)
4. `_bmad/modules/architecture-remediation/agents/store-refactorer.md` (agent)

### Must Update
1. `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` (track progress)
2. `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md` (dev record)
3. `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md` (epic progress)

### Must Follow
1. `.claude/rules/governance-rules.md` (Rule 9)
2. `_bmad/modules/architecture-remediation/config/thresholds.yaml` (quality gates)

## Success Metrics

### Quantitative
- ✅ 6 files modified/created
- ✅ 500 lines written
- ✅ 40/40 validation checkpoints passed
- ✅ 4-6 hours estimated (within range)

### Qualitative
- ✅ 100% story-dev-cycle.md compliance
- ✅ 100% governance rules compliance
- ✅ 12/12 skills verified
- ✅ Production-quality documentation

## Blockers & Risks

### Current Blockers
**None** - All dependencies resolved

### Known Risks
1. **Manual story creation time**: May take longer than estimated (1-2 hours)
   - **Mitigation**: Follow template strictly, reference existing stories

2. **Skills auto-load conflicts**: Multiple skills might trigger simultaneously
   - **Mitigation**: Skills matrix defines priority order

3. **TypeScript validation errors**: dexie-db.ts may have hidden dependencies
   - **Mitigation**: Incremental checking, exclude test files

## Governance Compliance Checklist

- [x] AGENTS.md update planned (after story completion)
- [x] CLAUDE.md update planned (after structural changes)
- [x] `/governance-enforcement` workflow planned (after story done)
- [x] Repomix cleanup planned (after analysis phases)
- [x] Facade pattern required (zero breaking changes)
- [x] File size limits enforced (≤120 lines per slice)
- [x] Backward compatibility maintained (old export paths)

## Execution Readiness

**Status**: 🟢 READY FOR EXECUTION

**Prerequisites Met**:
- ✅ Sprint status enhanced
- ✅ Story file created
- ✅ Governance tracking updated
- ✅ Skills integration verified
- ✅ Handoff documentation complete

**Quality Gates**:
- ✅ All validation checkpoints passed
- ✅ No breaking changes planned
- ✅ Test coverage target defined (≥80%)
- ✅ TypeScript zero-error target set

**Can Proceed To**: Story Development Cycle Phase 2 (create-context)

---

**Handoff Complete**: 2026-01-04T15:30+07:00
**Maintainer**: BMad Master v2.0 (Autonomous)
**Next Review**: After ARC-1.1 Phase 2 completion
```

**Validation Checkpoints** (7 total):
- [ ] Handoff doc created
- [ ] All artifacts listed correctly
- [ ] Next action clear and executable
- [ ] Success metrics defined
- [ ] Risks documented with mitigations
- [ ] Governance compliance complete
- [ ] Execution readiness confirmed

**Success Criteria**:
- Handoff comprehensive
- No ambiguity in next action
- All artifacts traceable

---

## Execution Sequence

### Order of Operations

1. **Read Reference Files** (30 min)
   - Read `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
   - Read `.agent/workflows/story-dev-cycle.md`
   - Read `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`

2. **Phase 1: Enhanced Sprint Status** (2-3 hours)
   - Modify arc-sprint-status.yaml
   - Validate 8 checkpoints

3. **Phase 2: Create Story File** (1-2 hours)
   - Create ARC-1.1-split-dexie-db.md
   - Validate 14 checkpoints

4. **Phase 3: Update Governance** (30 min)
   - Update epic-tracking.md
   - Update governance-rules.md
   - Validate 4 checkpoints

5. **Phase 4: Verify Skills** (30 min)
   - Read master skill
   - Verify store-refactorer
   - Verify eliminate-god-stores
   - Validate 7 checkpoints

6. **Phase 5: Handoff Doc** (30 min)
   - Create handoff document
   - Validate 7 checkpoints

7. **Final Validation** (15 min)
   - Review all files
   - Confirm 40/40 checkpoints
   - Prepare for execution

**Total Estimated Time**: 4-6 hours

---

## Success Metrics

### Quantitative
- **Files Modified**: 3 (arc-sprint-status.yaml, epic-tracking.md, governance-rules.md)
- **Files Created**: 2 (ARC-1.1 story, handoff doc)
- **Total Lines**: ~500 lines
- **Validation Checkpoints**: 40 total
- **Time Estimate**: 4-6 hours

### Qualitative
- **Story-Dev-Cycle Compliance**: 100%
- **Governance Compliance**: 100%
- **Skills Integration**: 12/12 verified
- **Documentation Quality**: Production-ready
- **Execution Readiness**: Confirmed

---

## Critical Files Reference

### Files to Modify
1. `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
   - Add skills coordination, workflow tracking, quality gates
   - Size: 180 → 250 lines

2. `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`
   - Add ARC-1.1 section with skills info
   - Size: Add ~30 lines

3. `.claude/rules/governance-rules.md`
   - Add Rule 9 for ARC sprint tracking
   - Size: Add ~40 lines

### Files to Create
1. `_bmad-output/sprint-artifacts/ARC-1.1-split-dexie-db.md`
   - Complete story file following story-dev-cycle.md
   - Size: ~250 lines

2. `_bmad-output/handoff-arc-sprint-tracking-implementation-2026-01-04.md`
   - Comprehensive handoff documentation
   - Size: ~200 lines

### Reference Files (Read-Only)
1. `.agent/workflows/story-dev-cycle.md` - Master workflow template
2. `_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md` - Workflow definition
3. `_bmad/modules/architecture-remediation/agents/store-refactorer.md` - Agent definition
4. `.claude/skills/architecture-remediation/SKILL.md` - Master skill
5. `.claude/rules/governance-rules.md` - Governance rules

---

## Risk Mitigation

### Risk 1: Manual Story Creation Complexity
**Risk**: Story file has 30 tasks, 7 ACs, 5 research queries
**Impact**: May take 2-3 hours instead of 1-2 hours
**Mitigation**:
- Follow story-dev-cycle.md template strictly
- Reference existing story formats from main project
- Break into sections, validate incrementally

### Risk 2: Skills Auto-Load Conflicts
**Risk**: Multiple skills might trigger for ARC-1.1
**Impact**: Wrong agent/workflow loads
**Mitigation**:
- Skills matrix defines priority
- Test auto-load triggers before execution
- Master skill orchestrates sub-skills

### Risk 3: Governance Rule Conflicts
**Risk**: ARC tracking may conflict with main project rules
**Impact**: Validation failures
**Mitigation**:
- Keep tracking separate (user confirmed)
- Rule 9 defines ARC-specific governance
- No cross-references to main sprint-status.yaml

---

## Post-Execution Checklist

Before marking implementation complete:

- [ ] All 5 phases complete
- [ ] All 40 validation checkpoints passed
- [ ] All files created/modified successfully
- [ ] YAML syntax valid (no parse errors)
- [ ] All file paths correct
- [ ] No broken internal links
- [ ] Handoff document complete
- [ ] Ready for story-dev-cycle Phase 2

---

## Transition to Execution

After plan approval, execution will:

1. Follow the 7-step execution sequence
2. Validate after each phase (8+14+4+7+7 = 40 checkpoints)
3. Create handoff document for final transition
4. Ready for story-dev-cycle Phase 2 (create-context)

**Trigger Command for Next Phase**:
```
"Split dexie-db.ts using eliminate-god-stores workflow"
```

This will:
1. Auto-load architecture-remediation master skill
2. Auto-load store-refactorer agent
3. Auto-load eliminate-god-stores workflow
4. Execute story-dev-cycle Phase 2 (create-context)
5. Generate context XML for story ARC-1.1

---

**Plan Status**: ✅ COMPLETE
**Ready for User Approval**: YES
**Estimated Duration**: 4-6 hours
**Success Confidence**: HIGH (40 validation checkpoints)

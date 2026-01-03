# Systematic Refactoring Execution Workflow

**Workflow ID**: `systematic-refactoring-execution`
**Version**: 1.0.0
**Created**: 2026-01-03
**Phase**: Implementation - Ralph Loop Cycle 18 Course Correction
**Orchestrator**: @bmad-core-bmad-master

---

## Purpose

Orchestrate the execution of course correction epics with strict validation gates to prevent regression and ensure quality during the 8-week systematic remediation plan.

**Reference**: `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`

---

## Workflow Context

**Course Correction Triggered**: Ralph Loop Cycle 18 (2026-01-01)
**Previous Health Score Claim**: 100/100 ✅
**ACTUAL Health Score**: ~5.9% (1,172 TypeScript errors remaining)
**Decision**: ✅ IMMEDIATE COURSE CORRECTION APPROVED

**8-Week Stabilization Plan**:
- **Phase 0** (Week 1-2): Foundation Stabilization
- **Phase 1** (Week 3-4): Store Refactoring
- **Phase 2** (Week 5-6): Infrastructure Hardening
- **Phase 3** (Week 7-8): Architecture Transformation

---

## Quality Gates Overview

### Critical Success Criteria

**Must Pass Before Proceeding**:
- ✅ Zero TypeScript errors (or improvement from baseline)
- ✅ 100% test pass rate
- ✅ Zero breaking changes (verified by grep of imports)
- ✅ All acceptance criteria met
- ✅ Documentation updated

### Rollback Triggers

**Immediate Rollback If**:
- ❌ Test suite failure rate >5%
- ❌ New circular dependency detected
- ❌ Breaking change in public API
- ❌ Performance degradation >10%
- ❌ Data loss or corruption detected

---

## Stage 1: PRE-EXECUTION GATE

### Purpose
Establish baseline metrics and safety nets before beginning remediation work.

### Checklist

#### 1.1 Codebase State Validation
```bash
# Run TypeScript check
pnpm tsc --noEmit

# Capture baseline metrics
echo "=== BASELINE METRICS ===" > baseline-metrics.txt
echo "Date: $(date)" >> baseline-metrics.txt
echo "TypeScript Errors: $(pnpm tsc --noEmit 2>&1 | grep -c 'error TS')" >> baseline-metrics.txt
echo "Test Files: $(find . -name '*.test.ts' -o -name '*.test.tsx' | wc -l)" >> baseline-metrics.txt
echo "Total Lines: $(find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1)" >> baseline-metrics.txt
```

**Acceptance Criteria**:
- [ ] Baseline TypeScript error count recorded
- [ ] Baseline test count recorded
- [ ] Baseline line count recorded
- [ ] All metrics saved to `_bmad-output/baseline-metrics-{timestamp}.txt`

#### 1.2 Backup Branch Creation
```bash
# Create timestamped backup branch
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
git checkout -b backup-before-remediation-$TIMESTAMP
git push origin backup-before-remediation-$TIMESTAMP
git checkout dev  # Return to working branch
```

**Acceptance Criteria**:
- [ ] Backup branch created with timestamp
- [ ] Backup branch pushed to remote
- [ ] Branch name recorded in workflow-status.yaml

#### 1.3 Test Suite Verification
```bash
# Run full test suite
pnpm test -- --coverage

# Verify coverage meets minimum threshold
COVERAGE=$(pnpm test -- --coverage --silent | grep "All files" | awk '{print $4}' | sed 's/%//')
if (( $(echo "$COVERAGE < 70" | bc -l) )); then
  echo "ERROR: Coverage below 70% threshold"
  exit 1
fi
```

**Acceptance Criteria**:
- [ ] All tests passing (100% pass rate)
- [ ] Coverage ≥70% (or baseline documented if lower)
- [ ] Test suite completes in reasonable time (<5 minutes)

#### 1.4 Team Notification
**Action**: Create notification artifact

**Output**: `_bmad-output/notifications/remediation-start-notification-{timestamp}.md`

**Content Template**:
```markdown
# Remediation Work Beginning

**Date**: {timestamp}
**Phase**: {Phase 0/1/2/3}
**Epic**: {Epic ID}
**Backup Branch**: {branch-name}
**Expected Duration**: {hours} hours

**Scope**:
- Stories affected: {list}
- Components affected: {list}
- Estimated impact: {description}

**Rollback Plan**: {branch-name}
**Completion Target**: {date}
```

**Acceptance Criteria**:
- [ ] Notification created
- [ ] Stakeholders informed (document who was notified)
- [ ] Timeline communicated

#### 1.5 Workspace State Snapshot
```bash
# Capture current branch state
git status > _bmad-output/snapshots/pre-remediation-git-status.txt
git log -1 --pretty=format:"%H" > _bmad-output/snapshots/pre-remediation-commit-sha.txt
pnpm list --depth=0 > _bmad-output/snapshots/pre-remediation-dependencies.txt
```

**Acceptance Criteria**:
- [ ] Git status captured
- [ ] Current commit SHA recorded
- [ ] Dependency versions recorded

### Gate Decision Point

**PROCEED** if all acceptance criteria met
**HOLD** if any criteria fail - investigate and resolve before continuing

---

## Stage 2: EPIC EXECUTION

### Purpose
Execute individual stories within an epic with systematic validation.

### Per-Story Workflow

#### 2.1 Story Setup

**Input**: Story ID (e.g., CC-1.1, CP-1.1)

**Action**:
```bash
# Read story details
STORY_FILE="_bmad-output/research/platform-unification-2026-01-02/epic-{XX}-consolidation-breakdown.md"
grep -A 50 "### Story {ID}" $STORY_FILE > _bmad-output/active-story-context.md
```

**Acceptance Criteria**:
- [ ] Story acceptance criteria extracted
- [ ] Story context document created
- [ ] Dependencies identified

#### 2.2 Research Phase (30 minutes)

**Action**: Conduct MCP research for unfamiliar patterns

**Required Tools** (min 2 tool turns):
1. **Context7** (2 sequential queries):
   - Query 1: "{library-name} best practices 2025"
   - Query 2: "{library-name} API reference"

2. **Deepwiki** (if applicable):
   - Query: "{github-repo} architecture decisions"

3. **Web Search** (for recent patterns):
   - Query: "{pattern} 2025 best practices"

**Output**: `_bmad-output/research/{story-id}-research-findings-{timestamp}.md`

**Acceptance Criteria**:
- [ ] Minimum 2 MCP tool turns completed
- [ ] Research findings documented
- [ ] Code patterns identified (pseudo-code only)
- [ ] References to official docs included

#### 2.3 Implementation Phase

**Action**: Implement changes following test-driven approach

**Process**:
1. **Create/Update Tests First**
   ```bash
   # Create test file if new
   touch src/{path}/{component}.test.tsx
   ```

2. **Implement Code**
   - Follow project conventions (see CLAUDE.md)
   - Max 120 lines per component
   - Use individual selectors for Zustand v5
   - Add JSDoc comments

3. **Type-Safe Implementation**
   - No `any` types
   - Strict TypeScript compliance
   - Proper error handling

**Acceptance Criteria**:
- [ ] Tests written before implementation (TDD)
- [ ] Component ≤120 lines (excluding imports/comments)
- [ ] Zero `any` types
- [ ] JSDoc comments on all exports
- [ ] Individual selectors used for Zustand

#### 2.4 Story Validation Gate

**Automated Checks**:
```bash
# 1. TypeScript check
pnpm tsc --noEmit
# Expected: Zero new errors (or improvement from baseline)

# 2. Test suite
pnpm test {path-to-test}
# Expected: 100% pass rate

# 3. Linting
pnpm lint
# Expected: Zero new warnings

# 4. Breaking change check
grep -r "export.*from" src/ | grep -v "test.ts" | wc -l
# Expected: No reduction in export count (unless documented)
```

**Manual Verification**:
- [ ] All acceptance criteria from story met
- [ ] Manual testing completed (for UI components)
- [ ] No console errors in browser
- [ ] Feature works as expected

**Code Review Checklist**:
- [ ] Self-review completed (or peer review if available)
- [ ] Code follows project conventions
- [ ] No hardcoded values (use design tokens)
- [ ] Internationalization (i18n) applied
- [ ] Accessibility (a11y) considered

#### 2.5 Story Documentation Update

**Actions**:
1. Update epic breakdown document (mark story as DONE)
2. Update AGENTS.md (if breaking changes or new patterns)
3. Create story completion summary

**Output**: `_bmad-output/story-completions/{story-id}-completion-{timestamp}.md`

**Template**:
```markdown
# Story {ID} Completion Summary

**Story**: {ID} - {Title}
**Epic**: {Epic ID}
**Completed**: {timestamp}
**Agent**: {mode/agent}

## Changes Made

### Files Modified
- {file-1}: {change description}
- {file-2}: {change description}

### Files Created
- {file-new}: {purpose}

### Test Results
- Tests Passing: X/Y
- Coverage: {percentage}%
- TypeScript Errors: {count} (baseline: {count})

## Acceptance Criteria Status

1. [✅/❌] {Criteria 1}
2. [✅/❌] {Criteria 2}
...

## Known Issues

{List any issues or workarounds}

## Next Steps

{Suggested next story or validation step}
```

**Acceptance Criteria**:
- [ ] Story marked as DONE in epic breakdown
- [ ] AGENTS.md updated (if needed)
- [ ] Completion summary created

### Story Gate Decision Point

**COMPLETE** if all validation checks pass
**FIX AND RETRY** if any checks fail

---

## Stage 3: POST-STORY VALIDATION GATE

### Purpose
Ensure story completion doesn't break existing functionality.

### Validation Checklist

#### 3.1 Regression Testing
```bash
# Run full test suite
pnpm test

# Run TypeScript check
pnpm tsc --noEmit

# Check for circular dependencies
grep -r "import.*from.*\.\./\.\." src/ --include="*.ts" --include="*.tsx"
```

**Acceptance Criteria**:
- [ ] All tests passing (100% pass rate)
- [ ] No new TypeScript errors
- [ ] No new circular dependencies

#### 3.2 Build Verification
```bash
# Verify production build succeeds
pnpm build

# Verify build artifacts created
ls -la dist/
```

**Acceptance Criteria**:
- [ ] Build succeeds without errors
- [ ] Build completes in reasonable time
- [ ] No console errors in built application

#### 3.3 Import Stability Check
```bash
# Check for breaking changes in exports
BEFORE=$(git diff HEAD~1 src/ | grep "^-export" | wc -l)
AFTER=$(git diff HEAD~1 src/ | grep "^+export" | wc -l)

if [ $BEFORE -gt $AFTER ]; then
  echo "WARNING: Export count decreased - possible breaking change"
  exit 1
fi
```

**Acceptance Criteria**:
- [ ] No exports removed without facade pattern
- [ ] No breaking changes to public API
- [ ] Backward compatibility maintained

#### 3.4 Performance Check
```bash
# If performance-critical code, run benchmarks
# (Example: Store operations, rendering performance)
```

**Acceptance Criteria**:
- [ ] No performance degradation >10%
- [ ] Memory usage within acceptable bounds
- [ ] No infinite loops or memory leaks

### Gate Decision Point

**PROCEED TO NEXT STORY** if all checks pass
**ROLLBACK** if critical failures detected

---

## Stage 4: POST-EPIC VALIDATION GATE

### Purpose
Verify epic completion and measure improvements.

### Epic Completion Checklist

#### 4.1 Epic Story Verification
```bash
# Verify all stories in epic marked as DONE
EPIC_FILE="_bmad-output/research/platform-unification-2026-01-02/epic-{XX}-consolidation-breakdown.md"
grep "### Story" $EPIC_FILE | while read story; do
  STATUS=$(grep -A 5 "$story" $EPIC_FILE | grep "Status" | awk '{print $2}')
  if [ "$STATUS" != "DONE" ]; then
    echo "ERROR: Story $story not complete"
  fi
done
```

**Acceptance Criteria**:
- [ ] All stories in epic marked as DONE
- [ ] All story validation gates passed
- [ ] All completion summaries created

#### 4.2 Epic Metrics Measurement
```bash
# Measure improvement from baseline
echo "=== EPIC COMPLETION METRICS ===" > epic-metrics.txt
echo "Epic: {EPIC ID}" >> epic-metrics.txt
echo "Completed: $(date)" >> epic-metrics.txt

# TypeScript error reduction
TS_ERRORS=$(pnpm tsc --noEmit 2>&1 | grep -c 'error TS')
echo "TypeScript Errors: $TS_ERRORS (baseline: {baseline})" >> epic-metrics.txt

# Lines of code affected
git diff --stat backup-before-remediation-{timestamp} >> epic-metrics.txt

# Test coverage
pnpm test -- --coverage --silent | grep "All files" >> epic-metrics.txt
```

**Acceptance Criteria**:
- [ ] Metrics improvement documented
- [ ] TypeScript errors reduced (or no regression)
- [ ] Test coverage maintained or improved

#### 4.3 Epic Retrospective
**Output**: `_bmad-output/epic-retrospectives/{epic-id}-retrospective-{timestamp}.md`

**Template**:
```markdown
# Epic {ID} Retrospective

**Epic**: {ID} - {Title}
**Completed**: {timestamp}
**Duration**: {actual hours} hours (estimated: {est} hours)

## What Went Well

- {success 1}
- {success 2}
...

## What Could Be Improved

- {improvement 1}
- {improvement 2}
...

## Metrics

- TypeScript Errors: {before} → {after} ({improvement}%)
- Test Coverage: {before}% → {after}%
- Lines of Code: {before} → {after}
- Stories Completed: X/Y

## Lessons Learned

{key takeaways for next epic}

## Next Steps

{transition to next epic or phase}
```

**Acceptance Criteria**:
- [ ] Retrospective created
- [ ] Lessons learned documented
- [ ] Next steps identified

#### 4.4 Documentation Updates
**Actions**:
1. Update `bmm-workflow-status.yaml`
2. Update `_bmad-output/sprint-artifacts/sprint-status.yaml`
3. Update CLAUDE.md (if architectural changes)

**Acceptance Criteria**:
- [ ] Workflow status updated
- [ ] Sprint status updated
- [ ] CLAUDE.md updated (if needed)

### Gate Decision Point

**PROCEED TO NEXT EPIC** if all checks pass
**CONDUCT RETROSPECTIVE** if issues identified

---

## Stage 5: POST-PHASE VALIDATION GATE

### Purpose
Verify phase completion and measure overall health score improvement.

### Phase Completion Checklist

#### 5.1 Phase Epic Verification
```bash
# Verify all epics in phase completed
PHASE_EPICS=({list of epic IDs})
for epic in "${PHASE_EPICS[@]}"; do
  STATUS=$(grep -A 2 "Epic $epic" bmm-workflow-status.yaml | grep "status" | awk '{print $2}')
  if [ "$STATUS" != "DONE" ]; then
    echo "ERROR: Epic $epic not complete"
  fi
done
```

**Acceptance Criteria**:
- [ ] All epics in phase marked as DONE
- [ ] All epic retrospectives created
- [ ] All metrics improvements documented

#### 5.2 Health Score Assessment
**Action**: Calculate new health score

**Metrics**:
- TypeScript errors (target: <100)
- God components eliminated (count reduction)
- Test coverage (target: ≥80%)
- Store consolidation progress
- Infrastructure gaps closed

**Output**: `_bmad-output/health-scores/health-score-phase-{phase}-{timestamp}.md`

**Template**:
```markdown
# Health Score - Phase {Phase} Complete

**Assessed**: {timestamp}
**Phase**: {Phase 0/1/2/3}

## Overall Health Score

**Previous Score**: {score}%
**Current Score**: {score}%
**Improvement**: {+/-}%

## Detailed Metrics

### TypeScript Health
- Errors: {before} → {after} ({improvement}% reduction)
- Type Coverage: {percentage}%

### Code Quality
- God Components: {before} → {after}
- Average File Size: {before} → {after} lines
- Max File Size: {lines} lines (target: <300)

### Test Coverage
- Overall Coverage: {percentage}%
- Test Files: {count}

### Architecture
- Store Consolidation: {percentage}%
- Four-Layer Architecture: {percentage}%
- Infrastructure Gaps: {before} → {after}

## Phase Goals Status

- [ ] Goal 1: {status}
- [ ] Goal 2: {status}
...

## Recommendations

{recommendations for next phase}
```

**Acceptance Criteria**:
- [ ] Health score calculated
- [ ] Improvement measured from baseline
- [ ] Goals vs actual documented

#### 5.3 Phase Retrospective
**Output**: `_bmad-output/phase-retrospectives/phase-{phase}-retrospective-{timestamp}.md`

**Template**:
```markdown
# Phase {Phase} Retrospective

**Phase**: {Phase Name}
**Completed**: {timestamp}
**Planned Duration**: {weeks} weeks
**Actual Duration**: {weeks} weeks

## Executive Summary

{high-level summary of phase outcomes}

## Epic Completion Status

| Epic | Status | Duration | Metrics |
|------|--------|----------|---------|
| {Epic 1} | ✅/❌ | {hours}h | {improvement} |
| {Epic 2} | ✅/❌ | {hours}h | {improvement} |
...

## What Went Well

- {success 1}
- {success 2}
...

## What Could Be Improved

- {improvement 1}
- {improvement 2}
...

## Health Score Improvement

**Baseline**: {score}%
**Phase Start**: {score}%
**Phase End**: {score}%
**Improvement**: {+/-}%

## Risk Register

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| {risk 1} | {high/med/low} | {mitigation} | {open/closed} |
...

## Next Phase Preparation

**Next Phase**: {Phase X}
**Start Date**: {date}
**Prerequisites**: {list}
**Risks to Monitor**: {list}

## Decisions Required

{any decisions requiring stakeholder input}
```

**Acceptance Criteria**:
- [ ] Phase retrospective created
- [ ] All epics reviewed
- [ ] Lessons learned documented
- [ ] Next phase preparation started

#### 5.4 Governance Document Updates
**Actions**:
1. Update `CLAUDE.md` with phase outcomes
2. Update `ralph-loop-cycle-18-correct-course-workflow.md`
3. Update project roadmap (if needed)

**Acceptance Criteria**:
- [ ] CLAUDE.md updated
- [ ] Course correction workflow updated
- [ ] Roadmap adjusted (if needed)

### Gate Decision Point

**PROCEED TO NEXT PHASE** if health score improved and goals met
**CONDUCE SPECIAL RETROSPECTIVE** if major issues identified

---

## Rollback Procedures

### When to Rollback

**Immediate Rollback Triggers**:
- Test suite failure rate >5%
- New circular dependency detected
- Breaking change in public API
- Performance degradation >10%
- Data loss or corruption detected

### Rollback Process

#### Option 1: Git Revert (Recommended for single story failures)
```bash
# Identify bad commit
git log --oneline -10

# Revert the commit
git revert {commit-sha}

# Push revert
git push origin dev
```

#### Option 2: Restore from Backup Branch (Recommended for epic/phase failures)
```bash
# Checkout backup branch
git checkout backup-before-remediation-{timestamp}

# Create new working branch
git checkout -b dev-restored-{timestamp}

# Push restored branch
git push origin dev-restored-{timestamp}

# Update main branch pointer (if needed)
# (Requires team coordination)
```

#### Option 3: Cherry-Pick (Recommended for partial rollbacks)
```bash
# Identify good commits from failed branch
git log backup-before-remediation-{timestamp}..dev --oneline

# Cherry-pick specific good commits
git cherry-pick {good-commit-sha-1}
git cherry-pick {good-commit-sha-2}
...
```

### Rollback Verification

After rollback:
```bash
# Verify baseline restored
pnpm tsc --noEmit
pnpm test
pnpm build

# Verify metrics match baseline
diff _bmad-output/baseline-metrics-{original}.txt \
     _bmad-output/baseline-metrics-{after-rollback}.txt
```

### Post-Rollback Actions

1. **Create Incident Report**
   ```markdown
   # Rollback Incident Report

   **Timestamp**: {timestamp}
   **Failed Story/Epic**: {ID}
   **Rollback Method**: {revert/restore/cherry-pick}
   **Root Cause**: {analysis}

   ## Impact Assessment

   - Users Affected: {count}
   - Data Loss: {yes/no}
   - Downtime: {duration}

   ## Root Cause Analysis

   {what went wrong and why}

   ## Corrective Actions

   {how to prevent recurrence}

   ## Next Steps

   {how to move forward}
   ```

2. **Update Workflow Status**
   - Mark failed story as BLOCKED
   - Document rollback in workflow-status.yaml
   - Notify stakeholders

3. **Conduct Post-Mortem**
   - What went wrong?
   - Why wasn't it caught earlier?
   - How can we prevent this?

---

## Progress Tracking Templates

### Story Progress Template

```yaml
story_id: "{ID}"
story_title: "{Title}"
epic: "{Epic ID}"
status: "{IN_PROGRESS/DONE/BLOCKED}"
assigned_to: "{mode/agent}"
started_at: "{timestamp}"
estimated_hours: {number}
actual_hours: {number}

acceptance_criteria:
  - criterion_1: "{description}"
    status: "[PENDING/PASS/FAIL]"
    verification: "{how verified}"
  - criterion_2: "{description}"
    status: "[PENDING/PASS/FAIL]"
    verification: "{how verified}"

validation_checks:
  typescript_errors:
    baseline: {count}
    current: {count}
    status: "[PASS/FAIL]"
  test_suite:
    passing: "{X/Y}"
    coverage: "{percentage}%"
    status: "[PASS/FAIL]"
  linting:
    status: "[PASS/FAIL]"
  breaking_changes:
    detected: "[yes/no]"
    status: "[PASS/FAIL]"

files_modified:
  - file: "{path}"
    change: "{description}"
    lines_added: {number}
    lines_removed: {number}

completion_summary: "{_bmad-output/story-completions/{id}-completion-*.md}"
```

### Epic Progress Template

```yaml
epic_id: "{ID}"
epic_title: "{Title}"
phase: "{Phase 0/1/2/3}"
status: "{IN_PROGRESS/DONE/BLOCKED}"
started_at: "{timestamp}"
completed_at: "{timestamp}"
estimated_hours: {number}
actual_hours: {number}

stories:
  - story_id: "{ID}"
    status: "{DONE/IN_PROGRESS/BLOCKED}"
    completion_time: "{timestamp}"

metrics:
  typescript_errors:
    baseline: {count}
    epic_start: {count}
    epic_end: {count}
    improvement: "{percentage}%"
  test_coverage:
    baseline: "{percentage}%"
    epic_end: "{percentage}%"
  lines_of_code:
    affected: {number}
    added: {number}
    removed: {number}

completion_summary: "{_bmad-output/epic-retrospectives/{id}-retrospective-*.md}"
```

### Phase Progress Template

```yaml
phase_id: "{Phase 0/1/2/3}"
phase_title: "{Title}"
status: "{IN_PROGRESS/DONE}"
started_at: "{timestamp}"
completed_at: "{timestamp}"

epics:
  - epic_id: "{ID}"
    status: "{DONE/IN_PROGRESS/BLOCKED}"
    completion_time: "{timestamp}"

health_score:
  baseline: {percentage}
  phase_start: {percentage}
  phase_end: {percentage}
  improvement: "{+/-}percentage}%"

goals:
  - goal: "{description}"
    status: "{MET/NOT_MET}"
    target: "{value}"
    actual: "{value}"

completion_summary: "{_bmad-output/phase-retrospectives/phase-{id}-retrospective-*.md}"
```

---

## Handoff Artifacts Format

### Story Completion Handoff

**From**: Implementation Agent (@bmad-bmm-dev)
**To**: BMAD Master (@bmad-core-bmad-master)
**Artifact**: `_bmad-output/handoffs/story-{id}-completion-{timestamp}.md`

```markdown
# Story Completion Handoff

**Story**: {ID} - {Title}
**From**: @bmad-bmm-dev
**To**: @bmad-core-bmad-master
**Timestamp**: {timestamp}

## Completion Status

✅ **STORY COMPLETE**

## Changes Summary

**Files Modified**: {count}
**Files Created**: {count}
**Lines Added**: {count}
**Lines Removed**: {count}

## Validation Results

- TypeScript Errors: {count} (baseline: {count}) [PASS/FAIL]
- Tests: {passing}/{total} passing [PASS/FAIL]
- Coverage: {percentage}% [PASS/FAIL]
- Linting: [PASS/FAIL]
- Breaking Changes: [NONE/DETECTED]

## Acceptance Criteria

1. [✅/❌] {Criteria 1}
2. [✅/❌] {Criteria 2}
...

## Artifacts Created

- Story Completion: {_bmad-output/story-completions/{id}-completion-*.md}
- Test Results: {path/to/test/results}
- Code Changes: {commit-sha}

## Next Actions

1. [ ] Review story completion summary
2. [ ] Update epic tracking dashboard
3. [ ] Proceed to next story OR conduct epic validation gate

## Notes

{Any additional context or concerns}
```

### Epic Completion Handoff

**From**: Implementation Team
**To**: BMAD Master
**Artifact**: `_bmad-output/handoffs/epic-{id}-completion-{timestamp}.md`

```markdown
# Epic Completion Handoff

**Epic**: {ID} - {Title}
**Phase**: {Phase}
**From**: Implementation Team
**To**: @bmad-core-bmad-master
**Timestamp**: {timestamp}

## Epic Status

✅ **EPIC COMPLETE**

## Stories Completed

{count}/{count} stories completed

## Metrics Summary

- TypeScript Errors: {before} → {after} ({improvement}%)
- Test Coverage: {before}% → {after}%
- Lines Affected: {count}
- Duration: {actual} hours (estimated: {est} hours)

## Epic Retrospective

{_bmad-output/epic-retrospectives/{id}-retrospective-*.md}

## Next Actions

1. [ ] Review epic retrospective
2. [ ] Conduct post-epic validation gate
3. [ ] Update sprint status
4. [ ] Proceed to next epic OR conduct phase validation gate

## Recommendations

{Recommendations for next epic or phase}
```

---

## Integration with BMAD Master

### Workflow Orchestration

**Trigger**: @bmad-core-bmad-master initiates workflow

**Process**:
1. Master assigns epic to implementation team
2. Master monitors progress via workflow-status.yaml
3. Master validates gates before proceeding
4. Master conducts retrospectives
5. Master updates governance documents

### State Management

**Primary Source of Truth**: `bmm-workflow-status.yaml`

**Update After Each Stage**:
```yaml
workflow:
  name: "systematic-refactoring-execution"
  phase: "Phase 0/1/2/3"
  current_stage: "Stage 1/2/3/4/5"
  current_epic: "{Epic ID}"
  current_story: "{Story ID}"

gates:
  pre_execution: {PASSED/FAILED/SKIPPED}
  story_validation: {PASSED/FAILED/SKIPPED}
  post_story: {PASSED/FAILED/SKIPPED}
  post_epic: {PASSED/FAILED/SKIPPED}
  post_phase: {PASSED/FAILED/SKIPPED}

rollback:
  triggered: false
  reason: null
  method: null
  timestamp: null

metrics:
  baseline:
    timestamp: "{timestamp}"
    typescript_errors: {count}
    test_coverage: "{percentage}%"
  current:
    timestamp: "{timestamp}"
    typescript_errors: {count}
    test_coverage: "{percentage}%"
```

### Pause/Resume Mechanism

**Pause at Any Gate**:
```bash
# Update workflow status
echo "status: PAUSED" >> bmm-workflow-status.yaml
echo "pause_reason: \"{reason}\"" >> bmm-workflow-status.yaml
echo "pause_stage: \"{Stage X}\"" >> bmm-workflow-status.yaml
```

**Resume**:
```bash
# Verify state before resuming
pnpm tsc --noEmit
pnpm test

# Update workflow status
sed -i 's/status: PAUSED/status: IN_PROGRESS/' bmm-workflow-status.yaml
```

---

## Agent Mode Handoffs

### Story Implementation Handoff

**To**: @bmad-bmm-dev

**Instruction Template**:
```
@bmad-bmm-dev

Execute Story {ID}: {Title}

Context:
- Epic: {Epic ID}
- Phase: {Phase}
- Baseline Metrics: {_bmad-output/baseline-metrics-*.txt}
- Story Context: {_bmad-output/active-story-context.md}

Acceptance Criteria:
1. {Criteria 1}
2. {Criteria 2}
...

Quality Gates:
- Zero new TypeScript errors
- 100% test pass rate
- No breaking changes
- Component ≤120 lines

Output Requirements:
- Implementation files
- Test files (≥80% coverage)
- Story completion summary
- Handoff artifact

Return via: Report to @bmad-core-bmad-master with completion summary
```

### Validation Handoff

**To**: @bmad-bmm-tea (QA Agent)

**Instruction Template**:
```
@bmad-bmm-tea

Conduct Post-Story Validation for Story {ID}

Context:
- Story Completion: {_bmad-output/story-completions/{id}-completion-*.md}
- Code Changes: {commit-sha}
- Baseline Metrics: {_bmad-output/baseline-metrics-*.txt}

Validation Tasks:
1. Run full test suite
2. Run TypeScript check
3. Check for breaking changes
4. Verify acceptance criteria
5. Manual testing (if UI component)

Output Requirements:
- Validation report
- Gate decision (PASS/FAIL/ROLLBACK)
- Any issues found

Return via: Report to @bmad-core-bmad-master with validation results
```

---

## Monitoring and Reporting

### Daily Progress Updates

**Format**: `_bmad-output/daily-progress/daily-{YYYY-MM-DD}.md`

```markdown
# Daily Progress - {YYYY-MM-DD}

**Phase**: {Phase}
**Current Epic**: {Epic ID}
**Current Story**: {Story ID}

## Today's Accomplishments

- [ ] Task 1
- [ ] Task 2
...

## Blockers

{None or list blockers}

## Metrics

- TypeScript Errors: {count} (baseline: {count})
- Test Pass Rate: {percentage}%
- Stories Completed Today: {count}

## Tomorrow's Plan

1. {Task 1}
2. {Task 2}
...
```

### Weekly Status Report

**Format**: `_bmad-output/weekly-status/week-{N}-phase-{phase}-{YYYY-MM-DD}.md`

```markdown
# Weekly Status Report - Week {N}

**Phase**: {Phase}
**Date Range**: {start} to {end}

## Epic Progress

| Epic | Status | Stories Done | Est. Completion |
|------|--------|--------------|-----------------|
| {Epic 1} | {status} | X/Y | {date} |
| {Epic 2} | {status} | X/Y | {date} |

## Metrics

- TypeScript Errors: {before} → {after} ({improvement})
- Health Score: {before}% → {after}%
- Stories Completed: X/Y

## Risks and Issues

| Risk | Impact | Status |
|------|--------|--------|
| {risk} | {high/med/low} | {open/closed} |

## Next Week's Plan

1. {Epic 1} - {stories}
2. {Epic 2} - {stories}
...
```

---

## Emergency Procedures

### Critical Incident Response

**Trigger**: Production outage, data loss, security breach

**Immediate Actions**:
1. **Stop all work**
   ```bash
   # Update workflow status
   echo "status: EMERGENCY" >> bmm-workflow-status.yaml
   echo "emergency_type: \"{type}\"" >> bmad-workflow-status.yaml
   ```

2. **Assess impact**
   - Users affected?
   - Data lost?
   - Security compromised?

3. **Notify stakeholders**
   - Create incident report
   - Send notification

4. **Rollback if necessary**
   - Follow rollback procedures
   - Verify system restored

5. **Post-incident review**
   - Root cause analysis
   - Corrective actions
   - Process updates

---

## Workflow Maintenance

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-03 | Initial creation | @bmad-core-bmad-master |

### Continuous Improvement

**Review Schedule**: After each phase completion

**Review Questions**:
- Are validation gates effective?
- Are rollbacks smooth?
- Is documentation clear?
- Any bottlenecks?
- Suggestions for improvement?

**Update Process**:
1. Collect feedback from team
2. Propose changes
3. Update workflow document
4. Version bump (e.g., 1.0.0 → 1.1.0)
5. Communicate changes to team

---

## Appendices

### Appendix A: Command Reference

**Git Commands**:
```bash
# Create backup branch
git checkout -b backup-before-remediation-$(date +%Y%m%d-%H%M%S)

# Check for circular dependencies
grep -r "import.*from.*\.\./\.\." src/ --include="*.ts" --include="*.tsx"

# Count TypeScript errors
pnpm tsc --noEmit 2>&1 | grep -c 'error TS'

# Compare exports
git diff HEAD~1 src/ | grep "export"
```

**Test Commands**:
```bash
# Run all tests
pnpm test

# Run specific test
pnpm test {path-to-test}

# Run with coverage
pnpm test -- --coverage

# Run in watch mode
pnpm test -- --watch
```

**Build Commands**:
```bash
# Development build
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

### Appendix B: Template Reference

All templates referenced in this workflow:
- Story Progress Template
- Epic Progress Template
- Phase Progress Template
- Story Completion Handoff
- Epic Completion Handoff
- Story Retrospective
- Epic Retrospective
- Phase Retrospective
- Incident Report
- Daily Progress Update
- Weekly Status Report

### Appendix C: Quality Metrics Reference

**TypeScript Health**:
- Error count (target: <100)
- Any types usage (target: 0)
- Strict mode compliance (target: 100%)

**Code Quality**:
- God components (target: 0 files >300 lines)
- Average file size (target: <150 lines)
- Max file size (target: <300 lines)

**Test Health**:
- Coverage (target: ≥80%)
- Pass rate (target: 100%)
- Test count (target: increasing)

**Architecture Health**:
- Store consolidation (target: 100%)
- Four-layer architecture compliance (target: 100%)
- Infrastructure gaps (target: 0 P0/P1)

---

**Workflow Status**: ✅ ACTIVE
**Next Review**: After Phase 0 completion
**Maintainer**: @bmad-core-bmad-master

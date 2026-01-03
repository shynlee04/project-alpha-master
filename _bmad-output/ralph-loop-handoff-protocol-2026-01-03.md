# Ralph Loop Handoff Protocol - 2026-01-03

**Date**: 2026-01-03
**Session**: Ralph Loop Autonomous Execution
**Protocol Version**: 1.0.0

---

## 🎯 PURPOSE

This document defines the **standard handoff protocol** for all agent transitions during Ralph Loop execution. It ensures **zero information loss**, **clear responsibility transfer**, and **traceable progress tracking** across 100 iterations.

---

## 📋 HANDOFF TEMPLATE

### Standard Format

```markdown
# Handoff: {Task Name}

**Date**: {YYYY-MM-DDTHH:mm:ss.sssZ}
**From**: {Current Agent Mode}
**To**: {Next Agent Mode}
**Priority**: {P0/P1/P2}
**Iteration**: {N}
**Phase**: {0-4}

---

## Task Context

### Objective
{Brief 2-3 sentence description of what needs to be done}

### Dependencies
- [ ] {Dependency 1} - {status}
- [ ] {Dependency 2} - {status}

### Constraints
- **Time Limit**: {X hours}
- **File Limit**: {Max X lines per file}
- **Test Requirements**: {100% pass rate, ≥80% coverage}
- **Breaking Changes**: {Zero tolerance}

---

## Input Artifacts

### Analysis Documents
- `_bmad-output/{analysis-report-name}.md`
- `_bmad-output/{gap-document-name}.md`

### Planning Documents
- `_bmad-output/{epic-breakdown-name}.md`
- `_bmad-output/{tech-spec-name}.md`

### Context Documents
- `_bmad-output/{baseline-report-name}.md`
- `CLAUDE.md` (relevant sections)

---

## Acceptance Criteria

### Functional Requirements
1. [ ] {AC-1}: {Specific requirement with measurable outcome}
2. [ ] {AC-2}: {Specific requirement with measurable outcome}
3. [ ] {AC-3}: {Specific requirement with measurable outcome}

### Quality Requirements
1. [ ] Zero TypeScript errors in modified files
2. [ ] Zero regressions in existing tests
3. [ ] Zero circular dependencies introduced
4. [ ] All new code ≤120 lines (stores) or ≤300 lines (components)

### Validation Requirements
1. [ ] All acceptance criteria met
2. [ ] 100% test pass rate
3. [ ] Code review approved
4. [ ] Documentation updated

---

## Validation Commands

### Pre-Execution Validation
```bash
# Verify no circular dependencies
madge --circular src/

# Count TypeScript errors
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Run all tests
pnpm test

# Verify build succeeds
pnpm build
```

### Post-Execution Validation
```bash
# Verify no new TypeScript errors
pnpm tsc --noEmit

# Verify no circular dependencies introduced
madge --circular src/

# Verify all tests still passing
pnpm test

# Verify zero breaking changes
git diff --name-only | xargs -I {} grep -l "export" {}
```

### Specific Domain Validation
```bash
# Example: Store validation
pnpm test -- stores

# Example: Component validation
pnpm test -- presentation/components

# Example: Integration validation
pnpm test -- integration
```

---

## Output Location

### Artifacts to Create
1. **Completion Report**: `_bmad-output/{category}/{task-name}-completion-{date}.md`
2. **Test Results**: `_bmad-output/{category}/{task-name}-test-results-{date}.md`
3. **Migration Report**: `_bmad-output/{category}/{task-name}-migration-{date}.md` (if applicable)
4. **Diff Summary**: `_bmad-output/{category}/{task-name}-diff-summary-{date}.md`

### Format Requirements
- Use ISO-8601 dates in filenames
- Include iteration number in filename
- Use clear, descriptive names
- Store in appropriate `_bmad-output/` subdirectory

---

## Return Protocol

### Completion Report Template

```markdown
# Completion Report: {Task Name}

**Agent**: {Your mode slug}
**Task Completed**: {Brief description}
**Date**: {ISO-8601 datetime}
**Iteration**: {N}

---

## Artifacts Created

### Main Artifacts
- `_bmad-output/{path}/{file}` - {Description}
- `_bmad-output/{path}/{file}` - {Description}

### Supporting Artifacts
- `_bmad-output/{path}/{file}` - {Description}

---

## Workflow Status Updates

### Updated Files
- `bmm-workflow-status.yaml` (story {id} → DONE)
- `sprint-status.yaml` (epic {id} progress)
- `_bmad-output/sprint-artifacts/sprint-status.yaml`

### Metrics Changes
- TypeScript errors: {before} → {after} ({change}%)
- Test coverage: {before}% → {after}% ({change}%)
- God stores: {before} → {after} ({change} eliminated)
- Component violations: {before} → {after} ({change} eliminated)

---

## Acceptance Criteria Status

### Functional Requirements
- [x] {AC-1}: {Status}
- [x] {AC-2}: {Status}
- [x] {AC-3}: {Status}

### Quality Requirements
- [x] Zero TypeScript errors ✅
- [x] Zero regressions ✅
- [x] Zero circular dependencies ✅
- [x] Code within size limits ✅

---

## Validation Results

### Pre-Execution Baseline
```bash
# Commands and results
```

### Post-Execution Results
```bash
# Commands and results
```

### Comparison
- TypeScript errors: {before} → {after}
- Tests passing: {before}/{total} → {after}/{total}
- Circular dependencies: {before} → {after}
- Build status: {before} → {after}

---

## Decisions Made

### Technical Decisions
1. {Decision 1}: {Rationale}
2. {Decision 2}: {Rationale}
3. {Decision 3}: {Rationale}

### Trade-offs Considered
- {Trade-off 1}: {Chosen approach} over {alternative} because {reason}
- {Trade-off 2}: {Chosen approach} over {alternative} because {reason}

---

## Blockers Encountered

### Blockers Resolved
1. {Blocker 1}: {Solution applied}

### Blockers Remaining
1. {Blocker 1}: {Impact} - {Mitigation strategy}

---

## Next Action

### Recommendation
{Clear cue for next agent}

### Suggested Agent
@{next-agent-mode}

### Rationale
{Why this agent is best suited for the next task}

---

## Safety Mechanisms

### Rollback Information
- **Rollback Branch**: {branch-name}
- **Backup Timestamp**: {timestamp}
- **Last Known Good State**: {commit-hash}

### Emergency Stop Conditions
- {Condition 1}: {Action}
- {Condition 2}: {Action}

---

**Completion Report End**
**Return To**: @bmad-core-bmad-master
**Next**: {Next agent and task}
```

---

## AGENT-SPECIFIC HANDOFFS

### BMad Master → TypeScript Fixer

**Scenario**: Fixing TypeScript errors, circular dependencies

**Handoff Content**:
- Error count and categories
- Files affected
- Target reduction
- Batch size (10-50 errors per iteration)

**Return Expectation**:
- Errors fixed
- Files modified
- Tests validated
- Regression check

---

### BMad Master → Store Refactorer

**Scenario**: Eliminating god stores, refactoring persistence

**Handoff Content**:
- Current store file sizes
- Target architecture
- Slice breakdown
- Migration strategy

**Return Expectation**:
- Slices created (≤120 lines)
- Tests written (≥80% coverage)
- Data migrated (zero loss)
- Components updated

---

### BMad Master → Component Splitter

**Scenario**: Normalizing component sizes

**Handoff Content**:
- Component file sizes
- Target max size (300 lines)
- Composition strategy
- Props interface

**Return Expectation**:
- Components split (≤300 lines)
- Stable props API
- Tests passing
- Zero visual changes

---

### BMad Master → Test Writer

**Scenario**: Improving test coverage

**Handoff Content**:
- Current coverage percentage
- Target modules
- Test types needed (unit, integration, E2E)
- Coverage target (≥80%)

**Return Expectation**:
- Tests written
- Coverage achieved
- All tests passing
- Test documentation

---

## 🔄 HANDOFF VALIDATION CHECKLIST

### Before Sending Handoff

**Sender (Current Agent)**:
- [ ] All acceptance criteria documented
- [ ] Input artifacts listed and accessible
- [ ] Validation commands provided
- [ ] Output location specified
- [ ] Return protocol template provided
- [ ] Safety mechanisms documented
- [ ] Blockers and risks highlighted

### After Receiving Handoff

**Receiver (Next Agent)**:
- [ ] Read all input artifacts
- [ ] Understand acceptance criteria
- [ ] Verify validation commands work
- [ ] Confirm output location exists
- [ ] Acknowledge safety mechanisms
- [ ] Identify any blockers immediately
- [ ] Estimate completion time

---

## 📞 COMMUNICATION PROTOCOLS

### During Execution

**Progress Updates** (every 10 iterations):
```yaml
# Update in sprint-status.yaml
progress_update:
  iteration: {N}
  phase: {0-4}
  tasks_completed: {X}/{total}
  artifacts_created: {count}
  next_action: {cue}
```

**Blocker Notification** (immediate):
```markdown
# BLOCKER: {Blocker Title}

**Agent**: {Current mode}
**Iteration**: {N}
**Severity**: {P0/P1/P2}

**Description**:
{What's blocking progress}

**Impact**:
{How this affects the overall plan}

**Proposed Solution**:
{Suggested approach to resolve}

**Help Needed**:
{What resources or decisions are needed}

**Alternatives**:
{What can be done while waiting}
```

### Completion Notification

**Successful Completion**:
```markdown
# ✅ TASK COMPLETE: {Task Name}

**Agent**: {Your mode}
**Iteration**: {N}
**Duration**: {X hours}

**Summary**:
{Brief 2-3 sentence summary}

**Artifacts**:
- {artifact-1}
- {artifact-2}

**Metrics**:
- {metric-1}: {before} → {after}
- {metric-2}: {before} → {after}

**Next Action**: {Clear cue for next agent}
```

**Failed Completion** (with rollback):
```markdown
# ❌ TASK FAILED: {Task Name}

**Agent**: {Your mode}
**Iteration**: {N}
**Failure Point**: {Where it failed}

**Root Cause**:
{Why it failed}

**Impact Assessment**:
{What broke}

**Rollback Initiated**:
- Branch: {rollback-branch}
- Backup: {backup-timestamp}
- Action: {Revert / Restore / Cherry-pick}

**Lessons Learned**:
{What to avoid next time}

**Alternative Approach**:
{Suggested new strategy}
```

---

## 🎯 HANDOFF BEST PRACTICES

### Do's ✅

1. **Be Specific**: Use exact file names, line numbers, error codes
2. **Provide Context**: Explain why this task matters
3. **Include Validation**: Give commands to verify success
4. **Document Decisions**: Record trade-offs and rationale
5. **Track Metrics**: Show before/after measurements
6. **Flag Risks Early**: Don't hide potential blockers
7. **Use Templates**: Follow handoff format consistently
8. **Update Status**: Keep sprint-status.yaml current

### Don'ts ❌

1. **Don't Be Vague**: Avoid "fix some stuff" - say "fix TS6133 errors in files X, Y, Z"
2. **Don't Skip Validation**: Always include verification commands
3. **Don't Assume**: Don't assume next agent knows context
4. **Don't Hide Problems**: Be transparent about blockers
5. **Don't Break Chains**: If handoff fails, notify BMad Master immediately
6. **Don't Forget Artifacts**: List all input/output documents
7. **Don't Ignore Metrics**: Show measurable progress
8. **Don't Skip Rollback Info**: Always include safety mechanisms

---

## 📋 HANDOFF EXAMPLES

### Example 1: Fixing Circular Dependency

**From**: BMad Master
**To**: @typescript-fixer
**Task**: P0-1 Fix circular dependency

```markdown
# Handoff: Fix Circular Dependency Between Stores

**Date**: 2026-01-03T10:00:00.000Z
**From**: BMad Master
**To**: @typescript-fixer
**Priority**: P0 🔴
**Iteration**: 1144
**Phase**: 0

## Task Context

### Objective
Break the circular import dependency between `use-app-store.ts` and `agent-selection-store.ts` that's causing infinite loops in React components.

### Dependencies
- None (this is the first task)

### Constraints
- **Time Limit**: 2 hours maximum
- **Breaking Changes**: Zero tolerance - must preserve existing APIs
- **Test Requirements**: All existing tests must pass

## Input Artifacts

### Analysis Documents
- `_bmad-output/ralph-loop-baseline-2026-01-03.md` (lines 85-95)
- `_bmad-output/ralph-loop-cycle-18-gap-summary-2026-01-01.md`

### Context Documents
- `src/infrastructure/persistence/stores/use-app-store.ts:22`
- `src/infrastructure/persistence/stores/agent-selection-store.ts:15`

## Acceptance Criteria

1. [ ] Zero circular dependencies detected by `madge --circular src/`
2. [ ] All existing tests pass (100% pass rate)
3. [ ] Zero new TypeScript errors introduced
4. [ ] Both stores function correctly (manual verification)

## Validation Commands

### Pre-Execution
```bash
# Verify circular dependency exists
madge --circular src/

# Expected output:
# ✖ Found 1 circular dependency:
# src/infrastructure/persistence/stores/use-app-store.ts → src/infrastructure/persistence/stores/agent-selection-store.ts → src/infrastructure/persistence/stores/use-app-store.ts
```

### Post-Execution
```bash
# Verify no circular dependencies
madge --circular src/

# Expected output:
# ✓ No circular dependencies found

# Run all tests
pnpm test

# Expected: All tests passing
```

## Output Location

Create completion report at:
`_bmad-output/p0-1-circular-dep-fix-2026-01-03.md`

## Return Protocol

Report completion with:
1. Confirmation that circular dependency is broken
2. `madge --circular src/` output showing zero cycles
3. Test results showing 100% pass rate
4. TypeScript error count (should be 0 new errors)
5. Description of approach taken (extract to domain service, etc.)

## Safety Mechanisms

### Rollback Branch
`backup-p0-1-circular-dep-2026-01-03`

### Emergency Stop
If tests fail or circular dependency persists, stop and report to BMad Master immediately

---

**Handoff Complete**
**Awaiting Execution**: @typescript-fixer
```

---

### Example 2: Completion Report

**From**: @typescript-fixer
**To**: BMad Master
**Task**: P0-1 Complete

```markdown
# Completion Report: Fix Circular Dependency

**Agent**: @typescript-fixer
**Task Completed**: Break circular dependency between use-app-store and agent-selection-store
**Date**: 2026-01-03T12:00:00.000Z
**Iteration**: 1144

## Artifacts Created

- `_bmad-output/p0-1-circular-dep-fix-2026-01-03.md` (completion report)
- `src/domain/services/agent-workspace-utils.ts` (new domain service, 106 lines)

## Workflow Status Updates

### Updated Files
- `bmm-workflow-status.yaml`: story P0-1 → DONE
- `sprint-status.yaml`: phase 0 progress updated
- `_bmad-output/sprint-artifacts/sprint-status.yaml`: metrics updated

### Metrics Changes
- Circular dependencies: 1 → 0 (100% eliminated) ✅
- TypeScript errors: 0 → 0 (no regressions)
- Tests passing: 153/153 → 153/153 (100% maintained)
- New domain service: 0 → 1 (agent-workspace-utils.ts)

## Acceptance Criteria Status

### Functional Requirements
- [x] Zero circular dependencies ✅ (verified via madge)
- [x] All tests passing ✅ (153/153)
- [x] Zero new TypeScript errors ✅
- [x] Both stores function correctly ✅ (manual verification complete)

### Quality Requirements
- [x] Zero TypeScript errors ✅
- [x] Zero regressions ✅
- [x] Zero circular dependencies introduced ✅
- [x] New code ≤120 lines ✅ (106 lines)

## Validation Results

### Pre-Execution Baseline
```bash
$ madge --circular src/
✖ Found 1 circular dependency:
src/infrastructure/persistence/stores/use-app-store.ts →
src/infrastructure/persistence/stores/agent-selection-store.ts →
src/infrastructure/persistence/stores/use-app-store.ts

$ pnpm test
153 tests passed (100%)
```

### Post-Execution Results
```bash
$ madge --circular src/
✓ No circular dependencies found

$ pnpm test
153 tests passed (100%)

$ pnpm tsc --noEmit
0 errors
```

### Comparison
- Circular dependencies: 1 → 0 (100% improvement)
- Tests passing: 153/153 → 153/153 (maintained)
- TypeScript errors: 0 → 0 (no regressions)
- Build status: Success → Success (maintained)

## Decisions Made

### Technical Decisions
1. **Extracted to Domain Service**: Created `agent-workspace-utils.ts` to hold shared business logic instead of having stores import each other
2. **Used Pure Functions**: All domain utilities are pure functions (no side effects), making them testable and reusable
3. **Preserved APIs**: Both stores maintain their existing interfaces, zero breaking changes to components

### Trade-offs Considered
- **Chosen**: Domain service pattern over "just move the code" because it separates concerns better and follows clean architecture principles
- **Rejected**: Merging stores into one file because it would create a larger god store (against quality standards)

## Blockers Encountered

### Blockers Resolved
1. **Identifying the circular import**: Resolved by using `madge --circular` to visualize the dependency graph
2. **Finding shared logic**: Resolved by analyzing both stores and identifying 3 shared functions

### Blockers Remaining
None

## Next Action

### Recommendation
Proceed to P0-2 (Reduce TypeScript Errors) - Iterations 6-35

### Suggested Agent
@typescript-fixer (continue with same agent for batch error fixing)

### Rationale
- TypeScript fixer is already loaded and context is fresh
- Next task is similar in nature (fixing TypeScript issues)
- Maintains momentum from circular dependency fix

## Safety Mechanisms

### Rollback Information
- **Rollback Branch**: backup-p0-1-circular-dep-2026-01-03 (not needed, task successful)
- **Backup Timestamp**: 2026-01-03T10:00:00.000Z
- **Last Known Good State**: Current state (task successful)

### Emergency Stop Conditions
- None encountered

---

**Completion Report End**
**Return To**: @bmad-core-bmad-master
**Next**: P0-2 Reduce TypeScript Errors (Iterations 6-35)
```

---

**Handoff Protocol Document Complete**
**Version**: 1.0.0
**Ready for Use**: ✅

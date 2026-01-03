# Ralph Loop Quality Gates - 2026-01-03

**Date**: 2026-01-03
**Session**: Ralph Loop Autonomous Execution
**Gate Version**: 1.0.0

---

## 🎯 PURPOSE

This document defines **strict quality gates** that must be passed at every stage of Ralph Loop execution. These gates prevent **regressions**, **technical debt accumulation**, and **broken builds** across 100 iterations.

---

## 📊 GATE HIERARCHY

```
Pre-Execution Gate
        ↓
    Per-Iteration Gate
        ↓
     Per-Story Gate
        ↓
     Per-Epic Gate
        ↓
   Per-Phase Gate
        ↓
  Completion Gate
```

---

## 1️⃣ PRE-EXECUTION GATE

### When
Before starting Ralph Loop (Iteration 1144)

### Purpose
Verify baseline is stable and safe to begin refactoring

### Must Pass ✅

#### Code Quality Checks
- [ ] **Baseline metrics recorded**
  - TypeScript error count: `{count}`
  - Test count: `{count}`
  - Health score: `{score}/10`
  - God stores count: `{count}`
  - Component violations: `{count}`

- [ ] **Backup branch created**
  ```bash
  git checkout -b backup-before-ralph-loop-2026-01-03
  git push origin backup-before-ralph-loop-2026-01-03
  ```

- [ ] **All analysis artifacts reviewed**
  - [x] `_bmad-output/ralph-loop-baseline-2026-01-03.md` read
  - [x] `_bmad-output/ralph-loop-cycle-18-gap-summary-2026-01-01.md` read
  - [x] `_bmad-output/exhaustive-codebase-analysis-2026-01-03.md` reviewed

- [ ] **Rollback procedures documented**
  - [x] `_bmad-output/ralph-loop-rollback-procedures-2026-01-03.md` exists
  - [x] Emergency stop conditions defined
  - [x] Rollback branches identified

- [ ] **Sprint status file synchronized**
  ```bash
  # Verify sprint-status.yaml is up to date
  git status _bmad-output/sprint-artifacts/sprint-status.yaml
  ```

#### Build Verification
```bash
# Verify current build succeeds
pnpm build

# Expected: Build succeeds with zero errors
```

#### Test Verification
```bash
# Run all tests
pnpm test

# Expected: 153/153 tests passing (100%)
```

#### TypeScript Verification
```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Expected: 0 production errors, 371 test errors (documented)
```

### Failure Action
If any check fails:
1. **STOP** - Do not proceed with Ralph Loop
2. **Document** - Create incident report explaining failure
3. **Fix** - Resolve failing checks
4. **Re-validate** - Run pre-execution gate again

---

## 2️⃣ PER-ITERATION GATE

### When
After every iteration (after each agent completes a task)

### Purpose
Catch regressions immediately before they compound

### Must Pass ✅

#### Code Quality Checks
- [ ] **No circular dependencies introduced**
  ```bash
  madge --circular src/

  # Expected: ✓ No circular dependencies found
  # Fail: ✖ Found X circular dependencies
  ```

- [ ] **TypeScript errors not increased**
  ```bash
  pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

  # Expected: Error count ≤ previous iteration
  # Fail: Error count > previous iteration
  ```

- [ ] **All existing tests still passing**
  ```bash
  pnpm test

  # Expected: 153/153 tests passing
  # Fail: Any test failures
  ```

- [ ] **No breaking changes to existing APIs**
  ```bash
  # Check for deleted exports
  git diff --name-only | xargs -I {} grep -l "^-export" {}

  # Expected: Zero deleted exports without migration
  # Fail: Deleted exports affecting >3 components
  ```

#### File Size Checks
- [ ] **New store files ≤120 lines**
  ```bash
  # Check new store files
  git diff --name-only | grep "stores.*\.ts$" | xargs wc -l

  # Expected: All files ≤120 lines
  # Fail: Any file >120 lines
  ```

- [ ] **New component files ≤300 lines**
  ```bash
  # Check new component files
  git diff --name-only | grep "components.*\.tsx$" | xargs wc -l

  # Expected: All files ≤300 lines
  # Fail: Any file >300 lines
  ```

#### Git Hygiene
- [ ] **Commit message follows conventional commit format**
  ```
  # Expected format:
  feat(scope): description

  # Fail: Free-form messages like "fixed stuff"
  ```

- [ ] **No leftover console.log statements**
  ```bash
  git diff | grep "^\+.*console\.log" | wc -l

  # Expected: 0 additions
  # Fail: Any console.log additions
  ```

### Failure Action
If any check fails:
1. **STOP** - Do not continue to next iteration
2. **Assess** - Determine if failure is critical
3. **Fix** - Address the failing check
4. **Re-validate** - Run per-iteration gate again
5. **Document** - Record what went wrong and how it was fixed

### Bypass Conditions
Only BMad Master can bypass this gate, and only if:
- Failure is non-critical (e.g., formatting issue)
- Fix is deferred to next iteration
- Risk is documented and accepted

---

## 3️⃣ PER-STORY GATE

### When
After completing a user story (typically 2-10 iterations)

### Purpose
Ensure story meets all acceptance criteria before marking complete

### Must Pass ✅

#### Functional Requirements
- [ ] **All acceptance criteria met**
  - [ ] AC-1: {Specific requirement}
  - [ ] AC-2: {Specific requirement}
  - [ ] AC-3: {Specific requirement}

- [ ] **100% test pass rate**
  ```bash
  pnpm test -- {story-scope}

  # Expected: All tests in scope passing
  # Fail: Any test failures
  ```

- [ ] **Zero TypeScript errors in domain**
  ```bash
  pnpm tsc --noEmit

  # Expected: 0 errors in modified files
  # Fail: Any TS errors in story domain
  ```

- [ ] **Code review approved**
  - [ ] Peer review completed (if applicable)
  - [ ] BMad Master approval obtained
  - [ ] Review comments addressed

#### Quality Requirements
- [ ] **Test coverage ≥80%** (for new code)
  ```bash
  pnpm test -- --coverage

  # Expected: ≥80% coverage for new files
  # Fail: <80% coverage
  ```

- [ ] **Documentation updated**
  - [ ] CLAUDE.md updated (if needed)
  - [ ] AGENTS.md updated (if needed)
  - [ ] JSDoc comments added (for public APIs)

- [ ] **No breaking changes** (unless explicitly allowed)
  - [ ] All consumers still work
  - [ ] Migration guide provided (if breaking)
  - [ ] Backward compatibility preserved

#### Integration Verification
- [ ] **Works with existing components**
  ```bash
  # Manual verification
  # Expected: No UI breaks, no console errors
  ```

- [ ] **Data migration successful** (if applicable)
  ```bash
  # Run migration script
  pnpm tsx src/infrastructure/persistence/migrations/{migration-script}.ts

  # Expected: Zero data loss
  # Fail: Any data corruption or loss
  ```

### Failure Action
If any check fails:
1. **DO NOT MARK STORY COMPLETE**
2. **Create bug story** for failures
3. **Address failures** in next iteration
4. **Re-run per-story gate** after fixes

### Success Action
When all checks pass:
1. **Update sprint-status.yaml**: Mark story as DONE
2. **Create completion artifact**: Document story completion
3. **Notify BMad Master**: Ready for next story

---

## 4️⃣ PER-EPIC GATE

### When
After completing all stories in an epic (typically 20-50 iterations)

### Purpose
Ensure epic delivers value and meets objectives

### Must Pass ✅

#### Epic Objectives
- [ ] **All epic stories complete**
  - [ ] Story count: {X}/{X} complete
  - [ ] All acceptance criteria met
  - [ ] All tests passing

- [ ] **Health score improved**
  ```
  Before: {score}/10
  After: {score}/10
  Improvement: +{X} points (minimum +0.5 expected)
  ```

- [ ] **Zero regressions**
  ```bash
  # Compare baseline metrics
  # Expected: No metric worse than baseline
  ```

#### Integration Verification
- [ ] **End-to-end workflow tested**
  - [ ] Manual testing complete
  - [ ] All user journeys functional
  - [ ] No console errors

- [ ] **Performance not degraded**
  ```bash
  # Run performance tests (if available)
  pnpm test -- performance

  # Expected: No >10% performance degradation
  ```

- [ ] **Documentation complete**
  - [ ] Epic README updated
  - [ ] Architecture diagrams updated
  - [ ] Migration guides provided (if applicable)

#### Stakeholder Validation
- [ ] **Demo completed** (if applicable)
  - [ ] Stakeholder sign-off obtained
  - [ ] Feedback documented

### Failure Action
If any check fails:
1. **DO NOT MARK EPIC COMPLETE**
2. **Create remediation stories**
3. **Address failures** in next sprint
4. **Re-run per-epic gate** after fixes

### Success Action
When all checks pass:
1. **Update sprint-status.yaml**: Mark epic as DONE
2. **Create epic completion artifact**
3. **Celebrate milestone** (update team)
4. **Plan next epic**

---

## 5️⃣ PER-PHASE GATE

### When
After completing a phase (typically 50-100 iterations)

### Purpose
Ensure phase moves project toward completion goals

### Must Pass ✅

#### Phase Objectives
- [ ] **All phase epics complete**
  - [ ] Epic count: {X}/{X} complete
  - [ ] All stories complete
  - [ ] All tests passing

- [ ] **Health score target met**
  ```
  Phase Target: {target}/10
  Actual: {actual}/10
  Status: ✅ PASS / ❌ FAIL
  ```

- [ ] **Technical debt reduced**
  ```
  God stores eliminated: {X} stores
  Component violations fixed: {X} components
  TypeScript errors reduced: {X}% reduction
  ```

#### Architecture Validation
- [ ] **Clean architecture principles followed**
  - [ ] Layer separation maintained
  - [ ] No circular dependencies
  - [ ] Dependency inversion respected

- [ ] **No new technical debt introduced**
  ```bash
  # Compare god store count
  # Expected: Count reduced or maintained
  ```

- [ ] **Test coverage improved**
  ```
  Before: {X}%
  After: {Y}%
  Improvement: +{Z} percentage points
  ```

#### System Validation
- [ ] **All 4 workspaces functional**
  - [ ] IDE workspace: ✅
  - [ ] Knowledge workspace: ✅
  - [ ] Notes workspace: ✅
  - [ ] Study workspace: ✅

- [ ] **Cross-workspace features working**
  - [ ] Workspace switching: ✅
  - [ ] Agent synchronization: ✅
  - [ ] State persistence: ✅

### Failure Action
If any check fails:
1. **DO NOT PROCEED TO NEXT PHASE**
2. **Create course correction workflow**
3. **Address failures** before proceeding
4. **Re-run per-phase gate** after fixes

### Success Action
When all checks pass:
1. **Update bmm-workflow-status.yaml**: Mark phase complete
2. **Create phase completion artifact**
3. **Conduct retrospective**
4. **Plan next phase**

---

## 6️⃣ COMPLETION GATE

### When
After all phases complete (or after 100 iterations)

### Purpose
Verify Ralph Loop has achieved completion promise

### Must Pass ✅

#### Completion Promise
- [ ] **Platform Unified**
  - [ ] All 4 workspaces functional
  - [ ] Zero production TypeScript errors
  - [ ] All store architecture documented

- [ ] **Test File Cleanup Complete**
  - [ ] Test errors <10
  - [ ] Test configuration fixed
  - [ ] Test coverage ≥40%

- [ ] **UC1-UC4 Wiring Complete**
  - [ ] UC-1: IDE workspace functional
  - [ ] UC-2: Knowledge workspace functional
  - [ ] UC-3: Notes workspace functional
  - [ ] UC-4: Study workspace functional

#### Final Metrics
- [ ] **Health Score ≥ 8.8/10**
  ```
  Current: {score}/10
  Target: 8.8/10
  Status: ✅ PASS / ❌ FAIL
  ```

- [ ] **TypeScript Errors < 10**
  ```
  Current: {count} errors
  Target: <10 errors
  Status: ✅ PASS / ❌ FAIL
  ```

- [ ] **God Stores = 0**
  ```
  Current: {count} stores >120 lines
  Target: 0 stores
  Status: ✅ PASS / ❌ FAIL
  ```

- [ ] **Component Violations = 0**
  ```
  Current: {count} components >300 lines
  Target: 0 components
  Status: ✅ PASS / ❌ FAIL
  ```

- [ ] **Test Coverage ≥ 40%**
  ```
  Current: {X}%
  Target: ≥40%
  Status: ✅ PASS / ❌ FAIL
  ```

#### Documentation Complete
- [ ] **All epics documented**
  - [ ] Epic breakdowns complete
  - [ ] Architecture decisions recorded (ADRs)
  - [ ] Lessons learned documented

- [ ] **Migration guides provided** (if applicable)
  - [ ] Store migration guides
  - [ ] Component migration guides
  - [ ] Data migration scripts

### Failure Action
If completion gate fails:
1. **ASSESS** - How close to completion?
2. **PLAN** - Create remediation epics
3. **EXECUTE** - Run another Ralph Loop cycle
4. **RE-VALIDATE** - Run completion gate again

### Success Action
When completion gate passes:
1. **Create final completion artifact**
2. **Celebrate with team**
3. **Archive Ralph Loop artifacts**
4. **Plan next strategic initiative**

---

## 🔧 GATE AUTOMATION

### Automated Checks

These checks run automatically via CI/CD:

```yaml
# .github/workflows/quality-gate.yml
name: Ralph Loop Quality Gate

on:
  pull_request:
    branches: [dev]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Check circular dependencies
        run: madge --circular src/

      - name: Check TypeScript errors
        run: pnpm tsc --noEmit

      - name: Run tests
        run: pnpm test

      - name: Check file sizes
        run: |
          # Check stores ≤120 lines
          find src -name "*store*.ts" -exec wc -l {} + | awk '$1 > 120 { exit 1 }'

          # Check components ≤300 lines
          find src -name "*.tsx" -exec wc -l {} + | awk '$1 > 300 { exit 1 }'
```

### Manual Checks

These require human verification:

- Code review approval
- Manual testing of UI workflows
- Stakeholder sign-off
- Documentation review

---

## 📋 GATE CHECKLIST SUMMARY

### Quick Reference

| Gate | Frequency | Time | Automated |
|------|-----------|------|------------|
| Pre-Execution | Once (start) | 10 min | Partial |
| Per-Iteration | Every iteration | 2 min | Yes |
| Per-Story | Every story | 10 min | Partial |
| Per-Epic | Every epic | 30 min | Partial |
| Per-Phase | Every phase | 1 hour | No |
| Completion | Once (end) | 2 hours | No |

### Gate Status Tracking

Track gate passes/fails in `sprint-status.yaml`:

```yaml
quality_gates:
  pre_execution: ✅ PASS
  iteration_1144: ✅ PASS
  iteration_1145: ✅ PASS
  story_p0_1: ✅ PASS
  epic_cc_1: ⏳ PENDING
  phase_0: ⏳ PENDING
  completion: ⏳ PENDING
```

---

## 🚨 GATE VIOLATION PROCEDURES

### When Gate Fails

1. **STOP IMMEDIATELY**
   - Do not proceed to next iteration/story/epic/phase
   - Do not merge code
   - Do not mark work complete

2. **ASSESS SEVERITY**
   - **Critical**: Breaking changes, data loss, test failures
   - **High**: Performance regression, circular dependencies
   - **Medium**: File size violations, coverage gaps
   - **Low**: Documentation gaps, formatting issues

3. **CREATE INCIDENT REPORT**
   ```markdown
   # Quality Gate Violation: {Gate Name}

   **Date**: {ISO-8601}
   **Severity**: {Critical/High/Medium/Low}
   **Gate**: {Pre-Execution/Per-Iteration/Per-Story/etc}

   ## What Failed
   {Check that failed}

   ## Impact
   {How this affects the project}

   ## Root Cause
   {Why it failed}

   ## Resolution Plan
   {How to fix it}

   ## Prevention
   {How to prevent recurrence}
   ```

4. **RESOLVE BEFORE PROCEEDING**
   - Fix the issue
   - Re-run the gate
   - Document the fix
   - Learn from the mistake

---

## ✅ QUALITY GATES COMPLETE

**Status**: Ready for Enforcement
**Version**: 1.0.0
**Next**: Create Rollback Procedures document

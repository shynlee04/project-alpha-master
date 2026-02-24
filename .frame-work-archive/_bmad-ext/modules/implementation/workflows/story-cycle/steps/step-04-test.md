---
nextStepFile: '{installed_path}/steps/step-05-review.md'
continueFile: '{installed_path}/steps/step-04b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 4: Test

## STEP GOAL

Run tests, verify coverage, and ensure no regressions.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Run all test suites
- 📋 Verify coverage threshold
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Run Test Suite

```yaml
test_commands:
  - command: "pnpm test:unit"
    name: "Unit tests"
    required: true

  - command: "pnpm vitest run"
    name: "Vitest tests"
    required: true

  - command: "pnpm tsc --noEmit"
    name: "TypeScript check"
    required: true
```

### 2. Verify Test Coverage

```yaml
coverage_requirements:
  new_code_coverage:
    threshold: ">= 80%"
    check: "coverage for files modified in story"

  overall_coverage:
    threshold: "no regression"
    check: "overall coverage not decreased"
```

### 3. Check for Regressions

```yaml
regression_check:
  - existing_tests_still_pass: true
  - no_new_type_errors: true
  - no_build_failures: true
```

### 4. Display Test Results

```
═══════════════════════════════════════════════════════════
TEST RESULTS
═══════════════════════════════════════════════════════════

Story: {story_key}

Unit Tests: {PASS|FAIL}
├─ Tests Run: {count}
├─ Tests Passed: {count}
└─ Tests Failed: {count}

TypeScript: {PASS|FAIL}
├─ Type Errors: {count}
└─ Files Checked: {count}

Coverage: {PASS|FAIL}
├─ New Code Coverage: {percentage}%
├─ Overall Coverage: {percentage}%
└─ Threshold: 80%

Regressions: {NONE|DETECTED}

Overall: {PASS → PROCEED | FAIL → FIX ISSUES}

Options:
[P] Proceed to review
[F] View failures
[R] Re-run tests
[A] Add more tests
```

### 5. Handle User Choice

**P**: All tests passing → Step 5 (Review)
**F**: Show detailed failure information
**R**: Re-run test suite
**A**: Add more tests before continuing

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4]
tests_passing: true
coverage_percent: {percentage}
test_timestamp: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ All tests passing
- ✅ New code coverage >= 80%
- ✅ No regressions
- ✅ TypeScript valid

## FAILURE METRICS

- ❌ Tests failing
- ❌ Coverage below threshold
- ❌ Type errors present
- ❌ Regressions detected

## GATE: Test Gate

This step implements the **Test Gate**. All tests must pass and coverage must meet threshold before proceeding.

**ONLY WHEN tests passing, load {nextStepFile}**

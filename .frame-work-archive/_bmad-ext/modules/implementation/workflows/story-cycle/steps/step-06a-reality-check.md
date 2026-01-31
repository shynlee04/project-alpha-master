---
nextStepFile: '{installed_path}/steps/step-07-retrospective.md'
continueFile: '{installed_path}/steps/step-06ab-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 6a: Reality Check

## STEP GOAL

Validate Product Reality through end-to-end UI verification - "The Demo". Ensures the implementation actually works visually, not just that tests pass. Detects visual breaks, missing states, and UX violations.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Verify UI works end-to-end
- 📋 Check all states (loading, error, empty)
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. The Reality Check

Validate that what was built MATCHES the user journey from Step 1a:

```yaml
reality_check:
  end_to_end:
    - "Starting point: Does entry point exist?"
    - "Action: Can user perform the intended action?"
    - "Result: Does result appear where expected?"
    - "Feedback: Is loading state shown?"
    - "Error: Do errors display properly?"

  visual_validation:
    - "Component renders without visual breaks"
    - "Styling matches design tokens"
    - "Responsive layout works"
    - "8-bit styling applied (if applicable)"
```

### 2. Verify All UI States

```yaml
required_states:
  happy_path:
    description: "Everything works perfectly"
    verify: "Result displays correctly"

  loading_state:
    description: "User sees feedback during processing"
    verify: "Spinner/skeleton/progress indicator shown"

  empty_state:
    description: "No data to display"
    verify: "Empty message/illustration shown"

  error_state:
    description: "Something went wrong"
    verify: "Error message + recovery action shown"

  edge_cases:
    - "Long text content"
    - "Very large/small data sets"
    - "Rapid repeated actions"
    - "Network timeout"
```

### 3. Detect Reality Anti-Patterns

```yaml
anti_patterns_to_detect:
  visual_break:
    description: "UI appears broken/misaligned"
    check: "Does component render correctly?"

  missing_state:
    description: "No loading/empty/error handling"
    check: "What happens in each state?"

  zombie_feature:
    description: "Feature exists but no way to access"
    check: "Can user actually reach this feature?"

  context_switch:
    description: "User loses place when performing action"
    check: "Does user stay in context?"

  result_hiding:
    description: "Result appears off-screen or hidden"
    check: "Is result immediately visible?"

  broken_loop:
    description: "Can't repeat the action"
    check: "Can user do this again without refresh?"
```

### 4. Generate Visual Regression Report

Create `visual-regression-report.md`:

```markdown
# Visual Regression Report: {story_key}
**Date**: {timestamp}
**Story**: {story_key}

## Component Changes
- Modified Components: {list}
- New Components: {list}
- Deleted Components: {list}

## State Verification
| State | Expected | Actual | Status |
|-------|----------|--------|--------|
| Happy Path | {description} | {actual} | {✓|✗} |
| Loading | {description} | {actual} | {✓|✗} |
| Empty | {description} | {actual} | {✓|✗} |
| Error | {description} | {actual} | {✓|✗} |

## Visual Issues Found
{list of any visual problems}

## Journey Validation
- Entry Point: {✓|✗} {notes}
- Action Clarity: {✓|✗} {notes}
- Result Visibility: {✓|✗} {notes}
- Context Preservation: {✓|✗} {notes}

**Overall**: {PASS | FAIL}
```

### 5. Display Reality Check Summary

```
═══════════════════════════════════════════════════════════
REALITY CHECK - THE DEMO
═══════════════════════════════════════════════════════════

Story: {story_key}

End-to-End Verification:
┌─────────────────────────────────────────────────────────┐
│ [✓] Entry point exists and accessible                 │
│ [✓] User can perform intended action                  │
│ [✓] Result appears at expected location               │
│ [✓] Loading state shows during processing             │
│ [✓] Error state displays properly                     │
│ [✓] Empty state handles no-data scenarios             │
│ [✓] Component renders without visual breaks           │
│ [✓] User stays in context throughout flow            │
└─────────────────────────────────────────────────────────┘

Visual Regression Report: {visual-regression-report.md}

Issues Found:
{list of any issues}

Reality Score: {1-5}
- Visual Integrity: {rating}
- State Coverage: {rating}
- Journey Flow: {rating}
- User Context: {rating}

Overall: {PASS → PROCEED | FAIL → FIX ISSUES}

Options:
[P] Proceed to retrospective (reality validated)
[F] Fix visual issues (return to implementation)
[R] Review full report
```

### 6. Handle User Choice

**P**: Reality validated → Step 7 (Retrospective)
**F**: Issues found → Return to Step 3 (Implement)
**R**: View full visual regression report

### 7. Update Frontmatter

```yaml
---
stepsCompleted: [1, "1a", 2, "3a", 3, 4, 5, 6, "6a"]
reality_check_passed: true
reality_score: {1-5}
visual_regression_report: "{output_folder}/visual-regression-report.md"
issues_found: {count}
---
```

---

## SUCCESS METRICS

- ✅ All UI states verified
- ✅ No visual breaks detected
- ✅ Journey matches Step 1a expectations
- ✅ User context preserved
- ✅ Reality score >= 4

## FAILURE METRICS

- ❌ Missing state handling
- ❌ Visual breaks/misalignment
- ❌ Result not visible
- ❌ Context switch required
- ❌ Reality score < 3

## GATE: Product Reality Gate

This step implements the **Product Reality Gate**. Tests passing doesn't mean the feature works - this step verifies actual user-facing behavior.

**ONLY WHEN reality validated, load {nextStepFile}**

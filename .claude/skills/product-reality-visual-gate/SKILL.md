# Product Reality: Visual Gate

> **Version**: 1.0.0 | **Step**: 06a - Reality Check

---

## Purpose

End-to-end UI verification - ensure the implementation **actually works** from a user perspective. This is not about code coverage, but about **observable behavior**.

---

## When to Use

Invoke this skill when:
- Completing story implementation (before Done step)
- Validating UI changes
- Running visual regression tests
- Verifying all states are handled

---

## The Reality Checklist

### All States Must Be Visible

| State | Question | Fail If |
|-------|----------|--------|
| **Happy Path** | Does the feature work when everything goes right? | Errors on normal use |
| **Loading** | Does user see feedback while waiting? | No spinner/progress |
| **Empty** | What shows when there's no data? | Blank screen |
| **Error** | What happens when things fail? | Crash or silent failure |

### Context Preservation

- **No Context Loss**: User doesn't lose place during workflow
- **Single Page**: No unnecessary navigation away
- **Inline Actions**: Secondary actions use modals, not new pages
- **Visible Results**: Result appears where user expects

---

## Anti-Patterns Detected

| Pattern | Severity | Description |
|---------|----------|-------------|
| `visual_break` | critical | Component not rendering at all |
| `missing_state` | high | One of happy/loading/empty/error not handled |
| `zombie_feature` | medium | Feature immediately replaced/unused |
| `context_switch` | high | User must switch away mid-workflow |
| `result_hiding` | medium | Result appears off-screen or hidden |
| `broken_loop` | medium | Retry mechanism broken or missing |

---

## Validation Methods

### Automated (Preferred)
```bash
# Playwright visual regression
pnpm test:visual --project={story_id}

# Component state testing
pnpm test:states --file={component}
```

### Manual (When Automated Not Available)
1. Open the feature in the application
2. Walk through the happy path
3. Trigger each state (loading, empty, error)
4. Verify result location is visible
5. Check for context loss during workflow

---

## Output Artifacts

```
_bmad-output/artifacts/{story_id}/
├── visual-regression-report.md   # Validation results
├── screenshots/                   # Before/after screenshots
│   ├── happy-path.png
│   ├── loading-state.png
│   ├── empty-state.png
│   └── error-state.png
└── state-coverage.md             # Which states were tested
```

---

## Scoring Rubric (1-5)

| Score | Description |
|-------|-------------|
| 5 | Excellent - All states covered, smooth UX |
| 4 | Good - Minor visual issues |
| 3 | Acceptable - Some rough edges |
| 2 | Poor - Missing states, confusing |
| 1 | Broken - Visual breaks, non-functional |

**Threshold**: Score ≥ 3 to proceed

---

## Example Failures

**FAIL - Missing Loading State**:
```
User clicks "Generate Summary"
Nothing happens for 10 seconds
User clicks again (double submission!)
Result: Broken UX
```

**FAIL - Result Hiding**:
```
User clicks "Save Note"
Success toast appears off-screen
User doesn't know if save worked
Result: Uncertainty, repeated saves
```

**PASS**:
```
User clicks action → Immediate feedback
Loading state shown → User knows it's working
Result appears → Visible, inline
All states handled → Complete UX
```

---

## Integration

**Called by**: `story-cycle` Step 06a (Reality Check)

**Consumes**:
- Component structure
- Story acceptance criteria
- Journey map from UX Gate

**Produces**:
- Visual regression report
- State coverage matrix
- Pass/fail recommendation

---

**See Also**: `ux-gate`, `brain-gate`, `code-review`

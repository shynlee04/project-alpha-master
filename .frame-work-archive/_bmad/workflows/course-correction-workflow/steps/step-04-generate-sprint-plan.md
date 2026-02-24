---
step: 4
name: "generate-sprint-plan"
phase: "planning"
agent: "@bmad-bmm-sm"
timeout: "20 min"
next: "05-handoff-to-dev.md"
on_fail: "notify-and-pause"

# Path Definitions
workflow_path: '{project-root}/_bmad/workflows/course-correction-workflow'
thisStepFile: './steps/step-04-generate-sprint-plan.md'
nextStepFile: './steps/step-05-handoff-to-dev.md'
outputFile: '{sprint_artifacts}/correct-course-sprint-{timestamp}.yaml'
---

# Step 04: Generate Sprint Plan

> **Agent:** Scrum Master
> **Output:** Sprint plan at `{outputFile}`

---

## STEP GOAL

Transform prioritized blockers into actionable sprint stories with clear acceptance criteria, effort estimates, and parallel execution strategy.

---

## MANDATORY SEQUENCE

### 1. Load Priorities from Step 03

Read the priorities document from previous step.

### 2. Create Phase Structure

**Phase 1: Vertical Unblocking (P0)**
- Stories prefixed with `P1-xx`
- Must complete before Phase 2

**Phase 2: Horizontal Expansion (P1)**
- Stories prefixed with `P2-xx`
- Can begin after Phase 1 gate passes

### 3. Generate Stories

For each prioritized blocker:

```yaml
story:
  id: "P1-{N}"
  title: "{story_title}"
  priority: "{P0|P1|P2}"
  estimate: "{hours}h"
  workspace: "{ide|notes|cross}"
  status: "drafted"
  
  acceptance_criteria:
    - criterion: "..."
      testable: true
```

### 4. Define Parallel Execution

| Day | Team A (UI) | Team B (Backend) | Sync Point |
|-----|-------------|------------------|------------|
| 1 | Story A | Story B | End of day |
| 2 | Story C | Story D | End of day |

### 5. Create Acceptance Gates

**Phase 1 Gate:**
- [ ] `/notes` loads without errors
- [ ] `/ide` loads with temp project
- [ ] API key reaches AI endpoint
- [ ] Zero infinite loops

### 6. Save Sprint Plan

Write to `{outputFile}` in YAML format.

### 7. Present MENU OPTIONS

Display: "**Select an Option:** [R] Review Stories [C] Continue"

- IF R: Deep dive into specific story details
- IF C: Save plan, then load, read entire file, then execute {nextStepFile}

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] is selected and sprint plan saved, load `./steps/step-05-handoff-to-dev.md`.

---
step: 3
name: "prioritize-fixes"
phase: "planning"
agent: "@bmad-bmm-pm"
timeout: "15 min"
next: "04-generate-sprint-plan.md"
on_fail: "notify-and-pause"

# Path Definitions
workflow_path: '{project-root}/_bmad/workflows/course-correction-workflow'
thisStepFile: './steps/step-03-prioritize-fixes.md'
nextStepFile: './steps/step-04-generate-sprint-plan.md'
outputFile: '{output_folder}/correct-course/priorities-{timestamp}.md'
---

# Step 03: Prioritize Fixes

> **Agent:** Product Manager
> **Output:** Priorities document at `{outputFile}`

---

## STEP GOAL

Apply vertical-first strategy to prioritize blockers. Focus on clearing user journey down single vertical line before horizontal expansion.

---

## MANDATORY EXECUTION RULES (READ FIRST)

### Step-Specific Rules

- 🎯 Focus on prioritization using vertical-first strategy
- 🚫 FORBIDDEN to skip priority P0 items
- 💬 Approach: User journey perspective first

---

## MANDATORY SEQUENCE

### 1. Load Blockers from Step 02

Read the blockers document from previous step.

### 2. Apply Vertical-First Strategy

**Priority 1: Vertical Unblocking**
- Complete one workspace fully before moving to next
- IDE Space → Notes Space → (Others only if non-interfering)

**Priority 2: Horizontal Expansion**
- Cross-workspace features
- Shared components
- Common utilities

### 3. Create Priority Matrix

| Priority | Blocker | Workspace | Effort | Impact |
|----------|---------|-----------|--------|--------|
| P0 | | | | |
| P1 | | | | |
| P2 | | | | |

### 4. Validate from End-User Perspective

For each P0 item, ask:
- Can user complete their task after this fix?
- What blocks them next?
- Is this the right order?

### 5. Document Priorities

Save to `{outputFile}` with:
- Prioritized blocker list
- Effort estimates
- Dependencies between fixes

### 6. Present MENU OPTIONS

Display: "**Select an Option:** [A] Adjust Priorities [C] Continue"

- IF A: Discuss and adjust priority order
- IF C: Save to {outputFile}, then load, read entire file, then execute {nextStepFile}

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] is selected and priorities saved, load `./steps/step-04-generate-sprint-plan.md`.

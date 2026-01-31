---
step: 1
name: "assess-current-state"
phase: "assessment"
agent: "@bmad-bmm-analyst"
timeout: "15 min"
next: "02-identify-blockers.md"
on_fail: "notify-and-pause"

# Path Definitions
workflow_path: '{project-root}/_bmad/workflows/course-correction-workflow'
thisStepFile: './steps/step-01-assess-current-state.md'
nextStepFile: './steps/step-02-identify-blockers.md'
outputFile: '{output_folder}/correct-course/assessment-{timestamp}.md'
---

# Step 01: Assess Current State

> **Agent:** Analyst
> **Output:** Assessment document at `{outputFile}`

---

## STEP GOAL

Analyze the current system state to understand what phases are complete, in-progress, or blocked. This assessment drives the course correction prioritization.

---

## MANDATORY EXECUTION RULES (READ FIRST)

### Universal Rules

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement

- ✅ You are an analyst assessing system state
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring systematic analysis skills, user brings domain knowledge

### Step-Specific Rules

- 🎯 Focus only on current state assessment
- 🚫 FORBIDDEN to jump to solutions before assessment complete
- 💬 Approach: Ask clarifying questions about each workspace

---

## MANDATORY SEQUENCE

### 1. Load Required Context

Read the following files completely:

```bash
# Sprint and workflow status
_bmad-output/bmm-workflow-status.yaml
_bmad-output/sprint-artifacts/sprint-status.yaml

# Previous diagnostics (if exists)
_bmad-output/diagnostics/
_bmad-output/investigation/
```

### 2. Workspace Status Check

For each workspace (IDE, Notes, Study, Knowledge), determine:

| Workspace | Status | Last Activity | Blocking Issue |
|-----------|--------|---------------|----------------|
| IDE | ? | ? | ? |
| Notes | ? | ? | ? |
| Study | ? | ? | ? |
| Knowledge | ? | ? | ? |

### 3. Phase Identification

Identify current phase for each workspace:
- [ ] Phase 1: Vertical Unblocking
- [ ] Phase 2: Horizontal Expansion
- [ ] Phase 3: Deferred Spaces

### 4. Document Assessment

Create assessment file at `{outputFile}` with:
- Current state summary
- Phase status per workspace
- Preliminary blocker identification

### 5. Present MENU OPTIONS

Display: "**Select an Option:** [A] Advanced Elicitation [C] Continue"

#### Menu Handling Logic

- IF A: Deep dive into specific workspace issues
- IF C: Save assessment to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments: help user respond then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and assessment document is saved, will you then load and read fully `./steps/step-02-identify-blockers.md` to execute and begin blocker identification.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS

- All 4 workspaces assessed
- Current phase identified
- Assessment document created
- Menu presented and user input handled

### ❌ SYSTEM FAILURE

- Skipping workspaces in assessment
- Jumping to solutions before completing assessment
- Proceeding without user input/selection
- Not creating assessment document

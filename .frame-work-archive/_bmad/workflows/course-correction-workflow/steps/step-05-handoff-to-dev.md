---
step: 5
name: "handoff-to-dev"
phase: "handoff"
agent: "@bmad-bmm-sm"
timeout: "10 min"
next: null
on_fail: "notify-and-pause"

# Path Definitions
workflow_path: '{project-root}/_bmad/workflows/course-correction-workflow'
thisStepFile: './steps/step-05-handoff-to-dev.md'
outputFile: '{sprint_artifacts}/correct-course-handoff-{timestamp}.md'
---

# Step 05: Handoff to Dev Agents

> **Agent:** Scrum Master
> **Output:** Handoff document at `{outputFile}`

---

## STEP GOAL

Create formal handoff document with critical context for dev agents, execution order, and success criteria.

---

## MANDATORY SEQUENCE

### 1. Load Sprint Plan from Step 04

Read the sprint plan from previous step.

### 2. Generate Handoff Document

Create at `{outputFile}`:

```markdown
## 📋 COURSE CORRECTION HANDOFF

**Sprint:** {sprint_id}
**Created:** {timestamp}
**Phase:** {phase_name}

### Critical Context for Dev Agents

1. **DO NOT** reference EPIC-3x stories as active work
2. **FOCUS ONLY** on P1-xx and P2-xx prefixed stories
3. **IDE and Notes** are priority workspaces
4. **Study and Knowledge** are deferred

### Story Execution Order

{execution_order_diagram}

### Artifacts to Load

- Sprint Plan: {sprint_plan_path}
- Assessment: {assessment_path}
- Blockers: {blockers_path}

### Acceptance Gates

**Phase 1:**
{phase_1_gates}

**Phase 2:**
{phase_2_gates}

### Commands

| Command | Action |
|---------|--------|
| `/p1-status` | Show Phase 1 progress |
| `/validate-p1` | Run Phase 1 acceptance gate |
| `/start-story P1-01` | Begin specific story |
```

### 3. Update Workflow Status

Update `_bmad-output/bmm-workflow-status.yaml`:
- Set correct-course to active
- Log sprint plan path
- Set next actions

### 4. Present Completion Menu

Display: "**Course Correction Workflow Complete**

Handoff document created. Dev agents can now begin sprint execution.

**[D]** Delegate to Dev Agent
**[E]** Exit Workflow"

---

## WORKFLOW COMPLETION

This is the final step. Upon completion:

1. ✅ Assessment documented
2. ✅ Blockers identified with evidence
3. ✅ Priorities set using vertical-first strategy
4. ✅ Sprint plan generated
5. ✅ Handoff created for dev agents

**Course correction v3.0 with step-file architecture complete.**

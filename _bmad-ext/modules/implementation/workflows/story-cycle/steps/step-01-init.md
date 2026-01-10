---
nextStepFile: '{installed_path}/steps/step-02-validate.md'
continueFile: '{installed_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 1: Init

## STEP GOAL

Load story context and verify story is ready to begin.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Load story context from story key
- 📋 Verify story assignment
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Story Context

```
Story Key: {from frontmatter or user input}

Find story context file:
- {project-root}/_bmad-output/{story_key}-context.xml
- or {project-root}/_bmad-output/planning-artifacts/{story_key}-*.md
```

### 2. Verify Story Assignment

Check:
```yaml
story_verification:
  story_key: "{story_key}"
  assigned_to: "{current sprint}"

  status_check:
    - status: "pending" or "in_progress"
    - sprint: "{current sprint has capacity}"
    - blocked_by: []  # No blocking stories

  prerequisites:
    - governance_approval: true
    - context_file_exists: true
```

### 3. Display Story Summary

```
═══════════════════════════════════════════════════════════
STORY INITIALIZED
═══════════════════════════════════════════════════════════

Story: {story_key}
Title: {story_title}
Sprint: {sprint_id}

Acceptance Criteria:
{list of criteria}

Dependencies:
{list of dependencies}

Estimated Complexity: {points}

Options:
[C] Continue to validation
[H] Hold story (set to on_hold)
[X] Cancel story initiation
```

### 4. Handle User Choice

**C**: Proceed to Step 2 (Validate)
**H**: Update sprint-status.yaml, exit
**X**: Exit without changes

### 5. Update Frontmatter

On proceeding, update:
```yaml
---
stepsCompleted: [1]
storyKey: "{story_key}"
sprintId: "{sprint_id}"
startedAt: "{timestamp}"
status: "in_progress"
storyTitle: "{title}"
---
```

---

## SUCCESS METRICS

- ✅ Story context loaded successfully
- ✅ Story verified as assigned to current sprint
- ✅ No blocking dependencies
- ✅ Frontmatter updated

## FAILURE METRICS

- ❌ Story context file not found
- ❌ Story not assigned to sprint
- ❌ Blocking dependencies exist
- ❌ Governance approval missing

**ONLY WHEN complete, load {nextStepFile}**

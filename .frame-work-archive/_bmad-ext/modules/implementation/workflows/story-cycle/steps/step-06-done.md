---
nextStepFile: '{installed_path}/steps/step-07-retrospective.md'
continueFile: '{installed_path}/steps/step-06b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 6: Done

## STEP GOAL

Mark story as done, update sprint-status.yaml, and create handoff artifact.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Update all status files
- 📋 Create completion artifact
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Verify Done Gate

```yaml
done_gate_verification:
  required:
    - acceptance_criteria_complete: true
    - tests_passing: true
    - review_approved: true
    - no_p0_bugs: true

  optional:
    - e2e_tests_pass: true
    - documentation_updated: true
    - performance_acceptable: true
```

### 2. Update sprint-status.yaml

```yaml
sprint_status_update:
  stories:
    {story_key}:
      status: "done"
      started_at: "{timestamp_from_step_1}"
      completed_at: "{current_timestamp}"
      points: {story_points}

      tests:
        count: {number}
        passing: {number}
        coverage: {percentage}

      acceptance_criteria:
        - criterion: "{description}"
          status: "met"

      files_changed: [list]
```

### 3. Create Completion Artifact

```yaml
completion_artifact:
  story: "{story_key}"
  title: "{story_title}"
  completed_at: "{timestamp}"

  summary:
    - "{what was accomplished}"

  changes:
    files_modified: [list]
    files_created: [list]
    tests_added: {count}

  metrics:
    duration_hours: {actual}
    tests_passing: true
    coverage_percent: {percentage}

  handoff:
    next_story: "{if applicable}"
    context_for_next: [items]
```

### 4. Display Completion Summary

```
═══════════════════════════════════════════════════════════
STORY COMPLETE
═══════════════════════════════════════════════════════════

Story: {story_key}
Title: {story_title}

Status: ✅ DONE

Duration: {hours} hours
Files Changed: {count}
Tests Added: {count}
Coverage: {percentage}%

sprint-status.yaml: ✅ Updated
Completion Artifact: ✅ Created

Options:
[N] Next: Retrospective
[V] View completion artifact
[R] Return to sprint board
```

### 5. Handle User Choice

**N**: Continue to retrospective → Step 7
**V**: Display completion artifact details
**R**: Exit to sprint board

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6]
story_status: "done"
completed_at: "{timestamp}"
sprint_status_updated: true
completion_artifact: "{path}"
---
```

---

## SUCCESS METRICS

- ✅ Done gate criteria met
- ✅ sprint-status.yaml updated
- ✅ Completion artifact created
- ✅ No P0 bugs

## FAILURE METRICS

- ❌ Done gate criteria not met
- ❌ P0 bugs present
- ❌ sprint-status update failed

## GATE: Story Done Gate

This step implements the **Story Done Gate**. All required criteria must be met before marking story done.

**ONLY WHEN complete, load {nextStepFile}**

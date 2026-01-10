---
nextStepFile: '{installed_path}/steps/step-03-implement.md'
continueFile: '{installed_path}/steps/step-02b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 2: Validate

## STEP GOAL

Validate story prerequisites and confirm readiness to implement.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Run all validation checks
- 📋 Confirm sprint capacity
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Run Prerequisites Check

```yaml
prerequisites_check:
  story_gate:
    - story_assigned: true
    - context_available: true
    - dependencies_complete: verify

  sprint_gate:
    - sprint_active: true
    - capacity_available: true
    - not_overcommitted: verify

  technical_gate:
    - branch_available: true
    - environment_ready: true
    - dependencies_installed: true
```

### 2. Verify Dependencies

For each dependency:
```yaml
dependency_verification:
  - dependency: "{blocking_story}"
    status: "{done|in_progress|pending}"
    blocks_start: "{yes|no}"

  action_if_blocking:
    - "Cannot start story"
    - "Suggest: wait for dependency or re-prioritize"
```

### 3. Check Sprint Capacity

```yaml
sprint_capacity:
  current_commitment:
    stories_in_progress: {count}
    points_remaining: {total}

  new_story:
    estimated_points: {story_points}
    fits_in_sprint: {yes|no}

  decision:
    if_fits: "proceed to implementation"
    if_not_fits: "warn user, confirm override"
```

### 4. Display Validation Results

```
═══════════════════════════════════════════════════════════
STORY VALIDATION
═══════════════════════════════════════════════════════════

Story: {story_key}

Prerequisites: {PASS|FAIL}
├─ Story Assigned: {✅|❌}
├─ Context Available: {✅|❌}
└─ Dependencies Complete: {✅|❌}

Sprint Capacity: {PASS|FAIL}
├─ Sprint Active: {✅|❌}
├─ Capacity Available: {✅|❌}
└─ Story Points: {points}

Technical Readiness: {PASS|FAIL}
├─ Branch Available: {✅|❌}
├─ Environment Ready: {✅|❌}
└─ Dependencies Installed: {✅|❌}

Overall: {READY → PROCEED | WARNINGS | BLOCKED}

Options:
[P] Proceed to implementation
[R] Review blocking issues
[H] Hold story
```

### 5. Handle User Choice

**P**: All required checks pass → Step 3 (Implement)
**R**: Show detailed blocking issues
**H**: Update sprint-status, exit

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2]
validation_passed: true
validation_timestamp: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ All prerequisites validated
- ✅ Dependencies verified complete
- ✅ Sprint capacity confirmed
- ✅ Technical readiness verified

## FAILURE METRICS

- ❌ Missing prerequisites
- ❌ Blocking dependencies
- ❌ No sprint capacity
- ❌ Technical environment not ready

## GATE: Story Start Gate

This step implements the **Story Start Gate**. All required criteria must pass before proceeding.

**ONLY WHEN validation complete, load {nextStepFile}**

---
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
sprintStatus: '{implementation_artifacts}/sprint-status.yaml'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
toWorkflow: '{implementation_path}/workflows/story-cycle'
workflowName: 'sprint-planning-enhanced'
---

# Step 7: Handoff

## STEP GOAL

Prepare enhanced handoff context for story-cycle execution. Mark sprint planning complete.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Create handoff artifact
- 📋 Update sprint-status.yaml
- 🔄 Update workflow-status.yaml

## SEQUENCE OF INSTRUCTIONS

### 1. Gather Handoff Context

Collect all artifacts from sprint planning:
```yaml
handoff_artifacts:
  from_step_2:
    - "sprint-status.yaml"

  from_step_3:
    - "cohesion-report-{date}.md"
    - "demo-script.md"

  from_step_4:
    - "dependency-map.yaml"

  from_step_5:
    - "sprint-validation-report.md"
```

### 2. Create Enhanced Handoff Document

Create `sprint-handoff-{date}.md`:
```markdown
# Sprint Handoff: {sprint_id}

## Overview
- Stories: {count}
- Epics: {list}
- Estimated Duration: {weeks}

## Stories in Priority Order
{ordered list with journey context}

## Journey Context Per Story
{from Step 1a/User Journey - carried through}

## Agent Tool Specs (if any)
{from tool definitions}

## Cohesion Notes
{key points from cohesion report}

## Dependency Notes
{key points from dependency map}

## Handoff Checklist
- [ ] All stories have journey context
- [ ] Dependencies are documented
- [ ] Tool specs defined (if applicable)
- [ ] Cohesion issues flagged (if any)

## Next Steps
1. Begin story-cycle for first story
2. Carry journey context through each story
3. Update sprint-status as stories complete
```

### 3. Update sprint-status.yaml

Enhance sprint-status.yaml with wrapper metadata:
```yaml
# Add wrapper metadata
_wrapper:
  version: "1.0.0"
  validated_at: "{timestamp}"

  validation:
    cohesion_score: {score}
    dependency_conflicts: {count}
    nonsense_detected: {count}

  artifacts:
    cohesion_report: "{path}"
    dependency_map: "{path}"
    validation_report: "{path}"
    demo_script: "{path}"

  handoff:
    to_workflow: "story-cycle"
    ready: true
```

### 4. Update workflow-status.yaml

```yaml
workflow:
  sprint_planning:
    last_completed: "{sprint_id}"
    completed_at: "{timestamp}"
    status: "complete"
    next_workflow: "story-cycle"

epics:
  {epic_id}:
    planning_complete: true
    stories_ready: {count}
```

### 5. Display Handoff Summary

```
═══════════════════════════════════════════════════════════
SPRINT PLANNING COMPLETE - HANDOFF READY
═══════════════════════════════════════════════════════════

Sprint: {sprint_id}
Stories: {count}
Validation: ✅ PASSED

Handoff Artifacts:
├─ sprint-status.yaml (enhanced)
├─ cohesion-report-{date}.md
├─ dependency-map.yaml
├─ sprint-validation-report.md
├─ demo-script.md
└─ sprint-handoff-{date}.md

Next Workflow: story-cycle

Ready for Story Execution:
{ordered list of stories}

Options:
[S] Start first story
[V] View handoff document
[Q] Exit to orchestrator
```

### 6. Handle User Choice

**S**: Load story-cycle workflow for first story
**V**: Display full handoff document
**Q**: Exit, return to orchestrator

### 7. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
handoff_complete: true
handoff_document: "{output_folder}/sprint-handoff-{date}.md"
next_workflow: "story-cycle"
first_story: "{story_key}"
completed_at: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ All artifacts created
- ✅ sprint-status.yaml enhanced
- ✅ workflow-status.yaml updated
- ✅ Handoff document complete

## FAILURE METRICS

- ❌ Missing artifacts
- ❌ Unable to update status files
- ❌ Handoff context incomplete

**WORKFLOW COMPLETE**

Load {toWorkflow} or return to orchestrator.

---
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
nextWorkflow: 'orchestrator|story-cycle|correct-course'
workflowName: 'story-cycle'
---

# Step 7: Retrospective

## STEP GOAL

Complete story retrospective, capture learnings, and prepare for next work.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Capture retrospective insights
- 📋 Create handoff if needed
- 🔄 Complete workflow

## SEQUENCE OF INSTRUCTIONS

### 1. Story Retrospective

```yaml
retrospective:
  went_well:
    - "{what went well}"

  could_improve:
    - "{what could be improved}"

  lessons_learned:
    - "{key takeaways}"

  technical_debt:
    - "{any debt incurred, to be addressed later}"
```

### 2. Create Final Output Document

Update `{outputFile}`:
```yaml
---
workflow: "story-cycle"
story: "{story_key}"
status: "complete"
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
completed_at: "{timestamp}"
---

# Story Complete: {story_key}

## Summary
{what was accomplished}

## Changes
- Files Modified: {list}
- Files Created: {list}
- Tests Added: {count}

## Metrics
- Duration: {hours} hours
- Coverage: {percentage}%
- Tests Passing: ✅

## Retrospective
### Went Well
{list}

### Could Improve
{list}

### Lessons Learned
{list}

## Handoff
{context for next story or workflow}
```

### 3. Update workflow-status.yaml

```yaml
workflow:
  story_cycle:
    last_story: "{story_key}"
    completed_at: "{timestamp}"
    status: "complete"

epics:
  {epic_id}:
    targets:
      {track}:
        completed_stories: +1
```

### 4. Display Final Report

```
═══════════════════════════════════════════════════════════
STORY-CYCLE WORKFLOW COMPLETE
═══════════════════════════════════════════════════════════

Story: {story_key}
Status: ✅ COMPLETE

All Steps: [1, 2, 3, 4, 5, 6, 7] ✅

Duration: {hours} hours
Files Changed: {count}
Tests: {count} passing

Retrospective:
✅ Captured

Output Files:
├─ sprint-status.yaml: ✅ Updated
├─ workflow-status.yaml: ✅ Updated
└─ Completion artifact: ✅ Created

Next Steps:
[Continue to next story]
[Return to orchestrator]
[View full report]
```

### 5. Handle Next Work

Determine next workflow:
- **Another story ready**: Load story-cycle for next story
- **Bug fixes needed**: Route to correct-course
- **No pending work**: Return to orchestrator

### 6. Complete Workflow

Mark workflow complete in output:
```yaml
workflow_complete: true
next_workflow: "{determined above}"
handoff_context:
  story_completed: "{story_key}"
  recommendations: [for next work]
```

---

## SUCCESS METRICS

- ✅ All steps completed: [1, 2, 3, 4, 5, 6, 7]
- ✅ Retrospective captured
- ✅ Output document complete
- ✅ Status files updated

## FAILURE METRICS

- ❌ Retrospective not captured
- ❌ Output incomplete
- ❌ Status files not updated

**WORKFLOW COMPLETE**

Load {nextWorkflow} or return to orchestrator.

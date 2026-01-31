---
outputFile: '{output_folder}/correct-course-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
nextWorkflow: 'orchestrator|story-cycle|correct-course'
workflowName: 'correct-course'
---

# Step 4: Complete

## STEP GOAL

Update status files, create resolution artifact, and complete workflow.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Update all status files
- 📋 Create resolution artifact
- 🔄 Complete workflow

## SEQUENCE OF INSTRUCTIONS

### 1. Verify Remediation Complete

```yaml
verification:
  remediation_complete:
    - issue_resolved: true
    - tests_passing: true
    - no_regressions: true

  quality_check:
    - follows_standards: true
    - no_new_bugs: true
    - documentation_updated: true
```

### 2. Update sprint-status.yaml

```yaml
sprint_status_update:
  remediation:
    - issue: "{description}"
      category: "{quick_patch|feature_fix|architectural}"
      status: "resolved"
      resolved_at: "{timestamp}"

    files_changed: [list]
    tests_added: {count}
```

### 3. Create Resolution Artifact

```yaml
resolution_artifact:
  workflow: "correct-course"
  category: "{selected_category}"
  sub_workflow: "{executed}"
  completed_at: "{timestamp}"

  issue:
    original: "{governance report summary}"
    resolution: "{what was done}"

  changes:
    files_modified: [list]
    files_created: [list]
    tests_added: {count}

  verification:
    tests_passing: true
    no_regressions: true
    quality_verified: true

  handoff:
    next_steps: [if applicable]
    context_to_carry: [items]
```

### 4. Update Output Document

Finalize `{outputFile}`:
```yaml
---
workflow: "correct-course"
category: "{issue_category}"
status: "complete"
stepsCompleted: [1, 2, 3, 4]
completed_at: "{timestamp}"
---

# Correct-Course Complete

## Issue
{original issue description}

## Category
{selected_category}

## Resolution
{what was done to resolve}

## Changes
- Files Modified: {list}
- Files Created: {list}
- Tests Added: {count}

## Verification
- Tests Passing: ✅
- No Regressions: ✅
- Quality Verified: ✅

## Handoff
{context for next work}
```

### 5. Update workflow-status.yaml

```yaml
workflow:
  correct_course:
    last_issue: "{category}"
    resolved_at: "{timestamp}"
    status: "complete"

epics:
  {if_applicable}:
    remediation_complete: +1
```

### 6. Display Final Report

```
═══════════════════════════════════════════════════════════
CORRECT-COURSE WORKFLOW COMPLETE
═══════════════════════════════════════════════════════════

Category: {QUICK_PATCH | FEATURE_FIX | ARCHITECTURAL}
Sub-Workflow: {executed}
Status: ✅ RESOLVED

All Steps: [1, 2, 3, 4] ✅

Changes:
├─ Files Modified: {count}
├─ Files Created: {count}
└─ Tests Added: {count}

Verification:
├─ Tests Passing: ✅
├─ No Regressions: ✅
└─ Quality Verified: ✅

Output Files:
├─ sprint-status.yaml: ✅ Updated
├─ workflow-status.yaml: ✅ Updated
└─ Resolution artifact: ✅ Created

Next Steps:
[Return to orchestrator]
[Continue to next remediation]
[View full report]
```

### 7. Complete Workflow

Mark workflow complete:
```yaml
workflow_complete: true
resolution_type: "{category}"
next_workflow: "{determined based on context}"
```

---

## SUCCESS METRICS

- ✅ All steps completed: [1, 2, 3, 4]
- ✅ Remediation verified
- ✅ Resolution artifact created
- ✅ Status files updated

## FAILURE METRICS

- ❌ Remediation incomplete
- ❌ Tests failing
- ❌ Regressions detected
- ❌ Status not updated

**WORKFLOW COMPLETE**

Load {nextWorkflow} or return to orchestrator.

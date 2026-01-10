---
description: 'Categorize and execute bug fixes and remediation work - receives governance report, routes to appropriate sub-workflow'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS - while staying in character as the current agent persona:

<steps CRITICAL="TRUE">
1. LOAD the FULL workflow file from @_bmad-ext/modules/implementation/workflows/correct-course/workflow.md
2. READ its entire contents - this is the CORRECT-COURSE workflow for remediation
3. LOAD Step 1: @_bmad-ext/modules/implementation/workflows/correct-course/steps/step-01-receive-report.md
4. FOLLOW Step 1: Receive governance report, verify issue level, update frontmatter
5. LOAD Step 2: @_bmad-ext/modules/implementation/workflows/correct-course/steps/step-02-categorize.md
6. FOLLOW Step 2: Confirm issue type (quick_patch / feature_fix / architectural)
7. LOAD Step 3: @_bmad-ext/modules/implementation/workflows/correct-course/steps/step-03-route.md
8. FOLLOW Step 3: Route to appropriate sub-workflow based on category
9. LOAD Step 4: @_bmad-ext/modules/implementation/workflows/correct-course/steps/step-04-complete.md
10. FOLLOW Step 4: Update status, create resolution artifact
11. UPDATE bmm-workflow-status.yaml with resolution
</steps>

## Workflow Overview

```
correct-course (4 steps)
├── Step 1: Receive Report → Load governance report, verify issue level
├── Step 2: Categorize → Confirm type (quick_patch / feature_fix / architectural)
├── Step 3: Route → Delegate to sub-workflow
└── Step 4: Complete → Update status, create artifact
```

## Issue Categories

| Category | Description | Sub-workflow |
|----------|-------------|--------------|
| quick_patch | Simple bugs, wiring corrections | quick-patch |
| feature_fix | Independent feature, no chained impact | feature-fix |
| architectural | Comprehensive remediation required | architectural-conflict |

## Input

Governance report from orchestrator with:
- issue_level: quick_patch | feature_fix | architectural
- context_slices: relevant files
- recommended_approach: how to proceed

## Output

- Remediation complete
- Updated sprint-status.yaml
- Resolution artifact created

## State Updates

Update `_bmad-ext/state/LOOP_STATE.yaml`:
- current.workflow = "correct-course"
- current.step = 4 (on complete)
- progress.remediation_complete += 1

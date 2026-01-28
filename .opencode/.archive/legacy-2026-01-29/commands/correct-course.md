---
 description: 'Categorize and execute bug fixes and remediation work - receives governance report, routes to appropriate sub-workflow'
 subtask: true
 return: ["/bmad-bmm-dev-story continue from fix", "Run governance validation"]
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

## Workflow for Story Registration and Completion

When completing stories in this epic (CC-09: Slash Commands, CC-10: Thread Persistence, CC-11: God Store), you MUST:

1. CREATE INDIVIDUAL STORY YAML FILES (not just status updates)
   - Location: `_bmad-output/planning-artifacts/stories/EPIC-CC-{epic-id}/story-{story-id}.md`
   - Include: context.xml, implementation-plan.md, handoff-report.md

2. CONNECT STORIES TO THEIR EPIC IN SPRINT-STATUS.YAML
   - Add to `epics.EPIC-CC-{epic-id}.stories` array
   - Ensure proper EPIC ID linking

3. UPDATE SPRINT-STATUS.YAML WITH RESOLUTION
   - Add `resolution_artifact` for each story
   - Update `current.step` appropriately
   - Document completion in `completion_note`

## Workflow for Story Completion

```
Step 1: Receive Report → Load governance report, verify issue level
Step 2: Categorize → Confirm type (quick_patch / feature_fix / architectural)
Step 3: Route → Execute sub-workflow OR create story file
Step 4: Complete → Update status, create resolution artifact
```

## Execution Plan for This Track

### Track 3: God Store Decomposition (CC-11)

**Input**: `unified-chat-store.ts` (448 lines, God Store)

**Steps**:
1. CREATE story YAML: `_bmad-output/planning-artifacts/stories/EPIC-CC-11/story-cc-11-01.md`
   - Title: "Extract Chat Persistence Slice"
   - Epic: "EPIC-CC-11"
   - Assignee: "Team B"
   - Effort: 30 minutes
   - Context: Reference Track 2 completion

2. CREATE story YAML: `_bmad-output/planning-artifacts/stories/EPIC-CC-11/story-cc-11-02.md`
   - Title: "Create Chat Persistence Module"
   - Epic: "EPIC-CC-11"
   - Assignee: "Team B"
   - Effort: 30 minutes
   - Dependencies: story-cc-11-01 (must complete first)

3. EXECUTE sub-workflow: `story-cycle`

4. UPDATE sprint-status.yaml:
   - Add stories to `epics.EPIC-CC-11.stories`
   - Set EPIC-CC-11 status to track progress

5. WAIT for Story-Cycle workflow to complete and update final status

## Output Required

- Updated `bmm-workflow-status.yaml`
- Individual story YAML files created
- Resolution artifacts generated
- Completion status updated

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

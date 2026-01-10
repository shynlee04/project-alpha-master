---
name: "sprint-planning-enhanced"
type: "implementation-workflow"
purpose: "Wrap BMAD sprint-planning with cohesion validation and auto gatekeeping"
version: "1.0.0"
phase: "4.5"
wrapper_for: "_bmad/bmm/workflows/4-implementation/sprint-planning"
---

# Sprint-Planning Enhanced Workflow

**Purpose**: Wrap the existing BMAD `sprint-planning` workflow with auto gatekeeping, looping, automation, and handoff work.

## Critical Insight

Sprints fail due to **Cohesion & Reality** issues, not just Logic & Order. This wrapper validates:
- **Cohesion**: Do stories form a coherent narrative?
- **Dependencies**: Are there hidden temporal conflicts?
- **Reality**: Can we demo the entire sprint in 30 seconds?

## Workflow Definition

```yaml
workflow:
  name: "sprint-planning-enhanced"
  phase: "4.5"
  purpose: "Enhanced sprint planning with Product Reality validation"

  entry:
    required: "Epic files in planning artifacts"
    from: "orchestrator or manual trigger"

  output:
    - "sprint-status.yaml (enhanced)"
    - "cohesion-report-{date}.md"
    - "dependency-map.yaml"
    - "demo-script.md (30-second narrative)"
    - "handoff context for story-cycle"

  steps: 7
  estimated_duration: "1-2 hours"

  consumes:
    - "_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml"
    - "_bmad/bmm/workflows/4-implementation/sprint-planning/instructions.md"
    - "_bmad/bmm/workflows/4-implementation/sprint-planning/checklist.md"

  produces:
    - "Enhanced sprint-status.yaml with cohesion flags"
    - "Cross-story dependency graph"
    - "Sprint narrative validation"
```

## Frontmatter Template

```yaml
---
stepsCompleted: []
sprintId: "{sprint_id}"
epics_in_scope: [{list}]
startedAt: "{timestamp}"
status: "in_progress"
cohesion_score: null
dependency_conflicts: []
---
```

## Steps Overview

| Step | Name | Purpose | Output |
|------|------|---------|--------|
| 1 | Discover Epics | Scan for epic files | Epic list |
| 2 | Generate Status | Run BMAD sprint-planning | Baseline sprint-status.yaml |
| 3 | Cohesion Check | Validate sprint flow | Cohesion report |
| 4 | Dependency Map | Find hidden dependencies | Dependency graph |
| 5 | Reality Validation | 30-second demo script | Demo narrative |
| 6 | Gatekeeping | Auto-validation & loop | Pass/Fail |
| 7 | Handoff | Prepare for story execution | Handoff context |

## Quality Gates

- **Cohesion Gate**: Sprint narrative is coherent (Step 3)
- **Dependency Gate**: No temporal conflicts (Step 4)
- **Reality Gate**: Demo script passes (Step 5)
- **Auto-Gatekeeping**: Loop back on failures (Step 6)

## Integration

**Entry**: Triggered when new sprint planning needed
**Exit**: To story-cycle workflow with enhanced context
**Updates**: sprint-status.yaml, workflow-status.yaml

## Scanner Definitions

### Cohesion Scanner
- **Narrative Check**: Generate 30-second demo for entire sprint
- **Dependency Friction**: Map story completion vs dependency start
- **Ghost Logic**: Scan for missing error/empty/loading states

### Dependency Scanner
- **Explicit Dependencies**: From story files
- **Implicit Dependencies**: Shared components, data flow
- **Temporal Conflicts**: Story ordering issues

### Nonsense Detector
- **Duplicate Workflows**: Multiple ways to do same thing
- **Contradictory Requirements**: Conflicting stories
- **Orphan Features**: Features with no entry point

## Location

`_bmad-ext/modules/sprint-planning-wrapper/workflows/sprint-planning-enhanced/`

## Related Files

- **Config**: `_bmad-ext/modules/sprint-planning-wrapper/config/`
- **Scanners**: `_bmad-ext/modules/sprint-planning-wrapper/scanners/`
- **Consumes**: `_bmad/bmm/workflows/4-implementation/sprint-planning/`

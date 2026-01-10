---
name: "story-cycle"
type: "implementation-workflow"
purpose: "Execute stories from assignment to completion"
version: "1.0.0"
phase: "4"
---

# Story-Cycle Workflow

**Purpose**: Execute development stories from assignment through completion with proper tracking, quality gates, and **Product Reality validation**.

## Critical Insight

Sprints fail due to **Cohesion & Reality** (fragmented UX, nonsensical flows, hidden friction), NOT just Logic & Order. This workflow validates **Product Reality**, not just **Code Compliance**.

## Workflow Definition

```yaml
workflow:
  name: "story-cycle"
  phase: 4
  purpose: "Execute stories with sprint tracking + Product Reality validation"

  entry:
    required: "governance approval + story assignment"
    from: "orchestrator (after governance check)"

  output:
    - "story completion artifact"
    - "updated sprint-status.yaml"
    - "test results"
    - "journey map (mermaid)"
    - "tool definitions (if agentic)"
    - "visual regression report"

  steps: 10
  estimated_duration: "varies by story complexity"

  enhanced_features:
    - "User Journey Simulation (Step 1a)"
    - "Agent Tool Specification (Step 3a)"
    - "Reality Check (Step 6a)"
```

## Frontmatter Template

```yaml
---
stepsCompleted: []
storyKey: "{story_key}"
sprintId: "{sprint_id}"
startedAt: "{timestamp}"
status: "in_progress"
---
```

## Steps Overview

| Step | Name | Purpose | Output |
|------|------|---------|--------|
| 1 | Init | Load story context, verify prerequisites | Context loaded |
| 1a | **User Journey** | **The Movie Script Test** | Journey map |
| 2 | Validate | Check dependencies, sprint capacity | Validation passed |
| 3a | **Agent Tool Spec** | **The Brain Check** | Tool definitions |
| 3 | Implement | Execute development work | Code changes |
| 4 | Test | Run tests, verify coverage | Tests passing |
| 5 | Review | Code review, quality check | Review approved |
| 6 | Done | Update sprint-status, mark complete | Story done |
| 6a | **Reality Check** | **The Demo** | Visual report |
| 7 | Retrospective | Summary and learnings | Retrospective artifact |

## Quality Gates

### Code Compliance Gates
- **Story Start Gate**: Prerequisites verified (Step 2)
- **Test Gate**: Tests passing, coverage >= 80% (Step 4)
- **Done Gate**: All acceptance criteria met (Step 6)

### Product Reality Gates (NEW)
- **Product Reality Gate**: Journey validated (Step 1a) - Prevents fragmented UX
- **Agent Brain Gate**: Tool specs defined (Step 3a) - Prevents AI confusion
- **Visual Reality Gate**: Reality check passed (Step 6a) - Prevents shipping broken UI

## Enhanced Step Details

### Step 1a: User Journey Simulation (The UX Check)
- **Agent Role**: UX Analyst
- **Action**: Generate 30-second demo script ("The Movie Script Test")
- **Output**: `journey-map.mermaid`
- **Detects**: Island features, split-brain workflows, ghost results, dead ends

### Step 3a: Agent Tool Specification (The Brain Check)
- **Agent Role**: Prompt Engineer
- **Action**: Define JSON Schema, System Prompt, Permission levels
- **Output**: `tool-definition.json`, `prompt-context.md`
- **Detects**: Orphan tools, permission gaps, silent thinking, vague triggers

### Step 6a: Reality Check (The Demo)
- **Agent Role**: QA User
- **Action**: End-to-end UI verification, all states validated
- **Output**: `visual-regression-report.md`
- **Detects**: Visual breaks, missing states, zombie features, result hiding

## Integration

**Entry**: From orchestrator after governance approval

**Exit**: To orchestrator with completion status

**Updates**: sprint-status.yaml, workflow-status.yaml

## Location

`_bmad-ext/modules/implementation/workflows/story-cycle/`

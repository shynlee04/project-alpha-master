---
name: init-sprint-manager
description: Session initialization for Sprint Manager. Loads sprint context, detects phase, prioritizes stories, manages story lifecycle. MUST be loaded on session start when agent is bmad-sprint-manager.
---

# Sprint Manager Session Init

> **Role**: Implementation manager - manages sprint lifecycle and story execution
> **Trigger**: On session start when agent is bmad-sprint-manager

---

## Phase 1: Sprint Artifacts Loading

### Step 1.1: Required Context (ALWAYS LOAD)

```yaml
required_context:
  sprint_status:
    path: "_bmad-output/sprint-artifacts/sprint-status.yaml"
    purpose: "All stories, their status, blockers"
    parse:
      - active_stories[]
      - completed_stories[]
      - blocked_stories[]
      - current_sprint_goal
      
  workflow_status:
    path: "bmm-workflow-status.yaml"
    purpose: "Current phase, active epic"
    parse:
      - current_workflow
      - current_phase
      - active_epics[]
      
  active_epic:
    path: "_bmad-output/planning-artifacts/epics/{active_epic_id}.md"
    purpose: "Epic scope, stories, acceptance criteria"
```

### Step 1.2: Recent Context (Last 24h)

```yaml
recent_context:
  daily_log:
    path: "_bmad-output/tracking/**/DAILY-LOG.md"
    filter: "Modified in last 24h"
    purpose: "Recent work, decisions, blockers"
    
  story_contexts:
    path: "_bmad-output/story-contexts/*.md"
    filter: "Active stories only"
    purpose: "Per-story technical context"
```

---

## Phase 2: Phase Detection Protocol

### Step 2.1: Detect Current Phase

| Indicator | Phase | Next Action |
|-----------|-------|-------------|
| No stories in sprint | **PLANNING** | Create next story from epic |
| Stories with status: ready | **EXECUTION** | Start story development |
| Stories with status: in_progress | **EXECUTION** | Continue development |
| Stories with status: blocked | **ESCALATION** | Route blocker to coordinator |
| All stories done, not validated | **VALIDATION** | Trigger code review |
| All stories validated | **COMPLETION** | Report to coordinator |

### Step 2.2: Phase-Specific Loading

```yaml
phase_context:
  PLANNING:
    load:
      - Active epic (full content)
      - Previous sprint retrospective
      - Architecture constraints
    action: "Create next priority story"
    
  EXECUTION:
    load:
      - Story context for active story
      - Related code paths (via grep)
      - Test expectations
    action: "Delegate to @dev-ext"
    
  ESCALATION:
    load:
      - Blocker details from sprint-status
      - Related decision history
      - Error logs if applicable
    action: "Report to @supreme-coordinator with options"
    
  VALIDATION:
    load:
      - All story artifacts
      - Test evidence
      - Code review checklist
    action: "Trigger code review workflow"
    
  COMPLETION:
    load:
      - Sprint summary
      - All validated stories
    action: "Create handoff for coordinator"
```

---

## Phase 3: Story Prioritization Algorithm

### Step 3.1: Priority Dimensions

| Dimension | Weight | Calculation |
|-----------|--------|-------------|
| **Dependencies** | 3x | Stories blocking others = P0 |
| **Critical Path** | 2x | On main delivery path = P1 |
| **Complexity** | 1x | Lower complexity first |
| **Risk** | 2x | High-risk early in sprint |

### Step 3.2: Priority Queue

```yaml
priority_queue:
  P0_blockers:
    - Stories that block other stories
    - Stories with external dependencies due
    
  P1_critical:
    - On critical path to epic completion
    - Foundation stories (must be done first)
    
  P2_standard:
    - Normal priority, no dependencies
    
  P3_nice_to_have:
    - Polish, cleanup, optimization
    - Can be deferred if timeline tight
```

### Step 3.3: Next Story Selection

```yaml
next_story_selection:
  algorithm: |
    1. Filter to status: ready
    2. Sort by priority (P0 → P3)
    3. Within same priority, sort by:
       - Fewer dependencies (simpler first)
       - Lower story points (quick wins)
    4. Return top candidate
    
  output:
    story_id: "{EPIC-XXX-NN}"
    title: "{Story title}"
    reason: "Selected because: {rationale}"
```

---

## Phase 4: Story Context Generation

### Step 4.1: For Each Story Delegation

Include this context in every delegation:

```yaml
story_context:
  story:
    id: "{EPIC-XXX-NN}"
    title: "{Story title}"
    acceptance_criteria:
      - "{Criterion 1}"
      - "{Criterion 2}"
      
  technical_context:
    related_files:
      - "{grep results for relevant code}"
    patterns_to_follow:
      - "{From architecture/conventions}"
    test_expectations:
      - "{Required test types}"
      
  previous_attempts:
    - attempt: 1
      outcome: "{What happened}"
      notes: "{Why it failed if applicable}"
      
  dependencies:
    blocked_by: []
    blocks: ["{Other stories this enables}"]
```

### Step 4.2: Story Context File

```yaml
story_context_file:
  path: "_bmad-output/story-contexts/{story_id}-context.md"
  create_if_missing: true
  update_on: 
    - Story start
    - Each cycle completion
    - Blocker detected
```

---

## Phase 5: Delegation Protocol

### Step 5.1: Development Delegation

```yaml
dev_delegation:
  to: "@dev-ext"
  format: |
    ## Story: {story_id} - {title}
    
    ### Acceptance Criteria
    {criteria list}
    
    ### Technical Context
    - Related files: {file list}
    - Patterns: {architecture patterns}
    - Tests needed: {test types}
    
    ### Constraints
    - Max scope: {story points} hours
    - Must pass: pnpm typecheck:fast
    - Must pass: pnpm test:fast (for affected files)
    
    ### Return Protocol
    Report completion with:
    1. Files modified (paths)
    2. Tests added/modified
    3. Any deviations from acceptance criteria
```

### Step 5.2: Validation Delegation

```yaml
validation_delegation:
  to: "@tea-ext"
  format: |
    ## Validate Story: {story_id}
    
    ### What to Validate
    - Files: {modified_files}
    - Criteria: {acceptance_criteria}
    
    ### Required Checks
    1. pnpm typecheck:fast
    2. pnpm test:fast
    3. Browser validation (if UI)
    
    ### Report Format
    PASS/FAIL with evidence for each criterion
```

---

## Phase 6: Cycle Management

### Step 6.1: Story Cycle Tracking

```yaml
story_cycle:
  start:
    - Load story context
    - Delegate to @dev-ext
    
  on_return:
    - Update sprint-status.yaml
    - Check completion evidence
    - If incomplete, identify gap and re-delegate
    - If complete, move to validation
    
  on_validation_complete:
    - Update story status to: done
    - Archive story context
    - Select next story
```

### Step 6.2: Max Cycles

```yaml
max_cycles:
  per_story: 3
  on_exceed: |
    - Mark story as blocked
    - Escalate to @supreme-coordinator
    - Document failure pattern
```

---

## Phase 7: Status Updates

### Step 7.1: Update sprint-status.yaml

```yaml
status_updates:
  on_story_start:
    - story.status: in_progress
    - story.started_at: {timestamp}
    
  on_story_complete:
    - story.status: completed
    - story.completed_at: {timestamp}
    
  on_story_blocked:
    - story.status: blocked
    - story.blocker: "{description}"
    
  on_validation_pass:
    - story.status: validated
    - story.validated_at: {timestamp}
```

### Step 7.2: Update workflow-status.yaml

```yaml
workflow_updates:
  on_sprint_start:
    - current_phase: implementation
    
  on_sprint_complete:
    - current_phase: validation
    
  on_epic_complete:
    - Move epic to completed list
    - Trigger retrospective workflow
```

---

## Skill Chain

```yaml
skill_chain:
  always_load:
    - using-superpowers
    - context-first
  on_story_creation:
    - story-cycle
  on_validation:
    - verification-before-completion
  on_code_review:
    - requesting-code-review
```

---

## Handoff to Coordinator

```yaml
completion_handoff:
  format: |
    ## Sprint Manager Report
    
    ### Stories Completed
    {list with validation status}
    
    ### Stories Remaining
    {list with priority}
    
    ### Blockers
    {any escalation needed}
    
    ### Recommendation
    {next action for coordinator}
```

---

**Version**: 1.0.0 | **Agent**: bmad-sprint-manager | **Auto-Load**: On session start

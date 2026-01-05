---
description: ASGL Main Loop - Orchestrates autonomous development cycles by invoking existing modules
version: 2.0.0
triggers:
  - manual
  - scheduled
  - cascade
continual: true
---

# ASGL Main Loop Workflow v2.0

**Module**: `asgl`  
**Workflow ID**: `main-loop`  
**Version**: 2.0.0  
**Purpose**: Orchestrate (not replace) existing modules in autonomous loops

---

## Key Principle

> **ASGL orchestrates, it does not execute.**  
> For diagnostics → invoke `deep-scan`  
> For remediation → invoke `architecture-remediation`  
> For standard dev → invoke `bmad-core` workflows

---

## Workflow Steps

### Step 1: Initialize Session

```yaml
action: "initialize-session"
tasks:
  - "Load bmm-workflow-status.yaml"
  - "Load LOOP_STATE.yaml"
  - "Load config/governance.yaml"
  - "Load config/module-integration.yaml"
  
validate:
  - "Session ID assigned or resumed"
  - "Current phase/story identified"
  - "Module paths verified"
  
output:
  - "Set session.status = RUNNING"
  - "Log: 'ASGL Session {session.id} starting'"
```

### Step 2: Governance Pre-Check

// turbo

```yaml
action: "governance-pre-check"
tasks:
  - name: "Check root governance docs"
    files:
      - "AGENTS.md"
      - "CLAUDE.md"
    verify: "Last updated within 5 stories"
    
  - name: "Check pending wires"
    file: "_bmad/modules/asgl/scratchpad/pending-wires.yaml"
    max_allowed: 0
    on_violation: "List pending wires, require resolution"
    
  - name: "Check orphan artifacts"
    file: "_bmad/modules/asgl/scratchpad/artifact-registry.yaml"
    check: "SUSPECT count"
    max_allowed: 0
    on_violation: "List suspects, prompt for resolution"
    
  - name: "Check stale artifacts"
    check: "STALE count"
    max_allowed: 5
    on_violation: "Warn, continue"
```

### Step 3: Load Current Story

```yaml
action: "load-story"
source:
  - "_bmad-output/sprint-artifacts/sprint-status.yaml"
  - "_bmad-output/sprint-artifacts/course-correction-p0-2026-01-05.yaml"
  
extract:
  - story_id
  - story_title
  - story_type
  - epic_id
  - acceptance_criteria
  - estimated_hours
  
output:
  - "Store in LOOP_STATE.current_story"
```

### Step 4: Route to Module

```yaml
action: "route-to-module"
decision_tree:
  # See config/module-integration.yaml for full routing table
  
  - if: "story.type == 'DIAGNOSTIC'"
    then:
      module: "deep-scan"
      workflow: "targeted-scan"
      agent: "domain-scanner"
      
  - if: "story.type in ['GOD_STORE_SPLIT', 'COMPONENT_SPLIT', 'TYPESCRIPT_FIX']"
    then:
      module: "architecture-remediation"
      workflow: "{corresponding-workflow}"
      agent: "{corresponding-agent}"
      
  - if: "story.epic starts with 'EPIC-53'"
    then:
      module: "architecture-remediation"
      workflow: "state-consolidation-cycle"
      agent: "store-refactorer"
      
  - else:
    then:
      module: "bmad-core"
      workflow: "dev-story"
      agent: "dev"
      
output:
  - "selected_module"
  - "selected_workflow"
  - "selected_agent"
```

### Step 5: Generate Handoff Artifact

```yaml
action: "generate-handoff"
template: "_bmad/modules/asgl/templates/handoff-artifact.md"
output_path: "_bmad-output/handoffs/{session_id}/{story_id}-handoff.md"

contents:
  - session_id
  - story_id
  - story_title
  - selected_module
  - selected_workflow
  - selected_agent
  - constraints:
      - "Design: 8-bit only, no glassmorphism"
      - "Mobile: Touch targets ≥44px"
      - "i18n: All strings via t()"
      - "Wires: Track all import changes"
  - acceptance_criteria
  - validation_commands
  
register:
  - "Add to artifact-registry.yaml"
  - "Status: DRAFT"
```

### Step 6: Invoke Module Workflow

```yaml
action: "invoke-module"
protocol:
  - "Load selected module README if not cached"
  - "Load selected workflow"
  - "Load selected agent"
  - "Pass handoff artifact as context"
  
execution:
  - "Execute module workflow steps"
  - "Module manages its own validation loops"
  - "Module reports completion back"
  
# NOTE: ASGL waits for module completion
# Module handles the actual work
```

### Step 7: Receive Module Completion

```yaml
action: "receive-completion"
from_module:
  - completion_status: "SUCCESS | PARTIAL | FAILED"
  - artifacts_created: [list]
  - validation_results:
      typescript_errors: 0
      test_pass_rate: 100%
      coverage_percent: X%
  - pending_wires_created: [list]
  - next_action_recommendation: "..."
```

### Step 8: ASGL-Level Validation

```yaml
action: "asgl-validation"
checks:
  - name: "Design compliance"
    method: "grep for glassmorphism patterns"
    blocking: true
    
  - name: "i18n compliance"
    method: "grep for hardcoded strings"
    blocking: true
    
  - name: "Pending wires"
    method: "Check pending-wires.yaml"
    blocking: true
    max_allowed: 0
    
  - name: "Artifact cross-refs"
    method: "Validate all new artifacts have refs"
    blocking: false
    
on_failure:
  - "Log validation issues"
  - "Add to LOOP_STATE.errors"
  - "Prompt for resolution or override"
```

### Step 9: Governance Update Check

```yaml
action: "governance-update-check"
triggers:
  - condition: "progress.stories_completed % 3 == 0"
    action: "Update AGENTS.md"
    sections:
      - "Epic progress tables"
      - "Canonical locations (if changed)"
      - "Health scores"
      
  - condition: "progress.stories_completed % 5 == 0"
    action: "Update CLAUDE.md"
    sections:
      - "Key directories (if structure changed)"
      - "File statistics"
      
  - condition: "layer_files_changed > 5"
    action: "Update or create child AGENTS.md"
    target: "{changed_layer}/"
    
  - condition: "adr_created"
    action: "Update AGENTS.md with ADR reference"
```

### Step 10: Update State Files

// turbo

```yaml
action: "update-state"
files:
  - file: "_bmad/modules/asgl/LOOP_STATE.yaml"
    updates:
      - "current_story.status = COMPLETE"
      - "progress.stories_completed += 1"
      - "progress.stories_remaining -= 1"
      - "artifacts_created += {new_artifacts}"
      - "last_updated = NOW()"
      
  - file: "_bmad-output/sprint-artifacts/sprint-status.yaml"
    updates:
      - "Story {id} status = DONE"
      - "Epic progress updated"
      
  - file: "_bmad/modules/asgl/scratchpad/artifact-registry.yaml"
    updates:
      - "New artifacts registered"
      - "Handoff artifact status = ACTIVE"
      
  - file: "bmm-workflow-status.yaml"
    updates:
      - "current_story = next story ID"
```

### Step 11: Continuation Decision

```yaml
action: "continuation-decision"
conditions:
  continue_if:
    - "progress.stories_remaining > 0"
    - "OR pending_wires_from_this_story > 0"
    - "OR governance_update_pending"
    
  stop_if:
    - "user_interrupt == true"
    - "OR critical_error occurred"
    - "OR max_iterations_reached"
    - "OR all_stories_complete AND all_checks_pass"
    
on_continue:
  - "Load next story"
  - "Go to Step 3"
  
on_stop:
  - "Go to Step 12"
```

### Step 12: Loop Completion

```yaml
action: "complete-loop"
tasks:
  - name: "Generate completion report"
    output: "_bmad-output/completions/{session_id}-report.md"
    contents:
      - session_summary
      - stories_completed
      - artifacts_created
      - governance_updates_made
      - pending_items_for_next_session
      
  - name: "Update LOOP_STATE"
    set:
      - "session.status = COMPLETED | PAUSED | FAILED"
      - "continuation.next_action = {next steps}"
      
  - name: "Archive session artifacts"
    condition: "session.status == COMPLETED"
    action: "Move draft artifacts to ARCHIVED"
    
  - name: "Final governance check"
    action: "Verify AGENTS.md and CLAUDE.md are current"
```

---

## Interrupt Commands

| Command | Action |
|---------|--------|
| `pause` | Save state, set PAUSED, generate resume prompt |
| `stop` | Complete current step, generate completion report |
| `status` | Display current loop status without stopping |
| `override [check]` | Skip validation (requires reason) |
| `skip-story` | Skip current story, go to next |

---

## Resume Protocol

When resuming a PAUSED session:

```yaml
resume_steps:
  - "Load LOOP_STATE.yaml"
  - "Verify session.status == PAUSED"
  - "Read continuation.next_action"
  - "Validate pending_wires resolved (if any)"
  - "Set session.status = RUNNING"
  - "Continue from current_story"
```

---

## Error Recovery

| Error Type | Recovery |
|------------|----------|
| Module workflow fails | Log error, halt, prompt for manual intervention |
| Governance doc stale | Force update before continuing |
| Pending wires blocking | List wires, require resolution |
| Validation failure | Log details, allow override with reason |
| Critical infrastructure | HALT, preserve state, alert user |

---

## Outputs

| Output | Location |
|--------|----------|
| Loop State | `_bmad/modules/asgl/LOOP_STATE.yaml` |
| Handoff Artifacts | `_bmad-output/handoffs/{session}/{story}-handoff.md` |
| Completion Report | `_bmad-output/completions/{session}-report.md` |
| Artifact Registry | `_bmad/modules/asgl/scratchpad/artifact-registry.yaml` |

---

**Workflow Owner**: @bmad-core-bmad-master  
**Version**: 2.0.0  
**Last Updated**: 2026-01-05

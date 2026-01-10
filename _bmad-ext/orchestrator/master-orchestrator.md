# _bmad-ext/orchestrator/master-orchestrator.md

---
name: "master-orchestrator"
description: "Central orchestrator for all autonomous BMAD development"
version: "1.1.0"
entry_point: true
updated: "2026-01-11"
---

# Master Orchestrator

> **SINGLE ENTRY POINT** for all autonomous BMAD development.
> Delegates to enhanced agents, receives callbacks, updates governance.
> **Updated**: Now routes through Sprint-Planning Wrapper with Cohesion & Reality validation.

## Purpose

The master orchestrator is the **central brain** of the BMAD extension layer:

1. **Reads** `bmm-workflow-status.yaml` to get current story
2. **Routes** to Sprint-Planning Wrapper first (for sprint-level validation)
3. **Routes** stories to appropriate enhanced agents based on type
4. **Creates** handoff artifacts with traceability
5. **Spawns** enhanced agents as sub-agents
6. **Receives** completion callbacks with validation results
7. **Updates** governance documents (AGENTS.md, sprint-status.yaml)
8. **Decides** whether to continue or stop

---

## Product Reality Gates (NEW)

The orchestrator enforces **Product Reality validation** through the enhanced story-cycle:

| Gate | Step | Validates | Anti-Patterns Detected |
|------|------|-----------|------------------------|
| **UX Gate** | 01a | User Journey Simulation | island_feature, split_brain, ghost_result, dead_end |
| **Brain Gate** | 03a | Agent Tool Specification | orphan_tool, permission_gap, vague_trigger |
| **Visual Gate** | 06a | Reality Check | visual_break, missing_state, zombie_feature |

**Key Insight**: Sprints fail due to **Cohesion & Reality** (fragmented UX, nonsensical flows), NOT just Logic & Order. These gates catch "Dual Chat Systems" - technically valid but users hate history loss when switching tabs.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         MASTER ORCHESTRATOR v1.1                           │
│                       (Single Entry Point)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐  ┌─────────────────────┐  ┌────────────────┐           │
│  │ Load Session   │  │ Route Request       │  │ Create Handoff │           │
│  │ - LOOP_STATE   │  │ - Sprint planning?  │  │ - UUID         │           │
│  │ - Config       │  │ → Wrapper first!    │  │ - Parent link  │           │
│  └────────┬───────┘  └──────────┬──────────┘  └────────┬───────┘           │
│           │                      │                       │                   │
│           └──────────────────────┴───────────────────────┘                   │
│                                  ▼                                           │
│  ┌───────────────────────────────────────────────────────────────┐           │
│  │           Sprint-Planning Wrapper (NEW - v1.1)                │           │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │           │
│  │  │ Cohesion     │ │ Dependency    │ │ Reality      │          │           │
│  │  │ Check        │ │ Mapping       │ │ Validation   │          │           │
│  │  │ - Movie      │ │ - Temporal    │ │ - Nonsense   │          │           │
│  │  │   Script     │ │   Conflicts   │ │   Detector   │          │           │
│  │  └──────────────┘ └──────────────┘ └──────────────┘          │           │
│  └───────────────────────────────┬───────────────────────────────┘           │
│                                  ▼                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │      │
│  │ Verify Anchor  │  │ Delegate       │  │ Receive        │            │      │
│  │ - Freshness    │  │ - Spawn agent  │  │ Callback       │            │      │
│  │ - Confirm if   │  │ - Await result │  │ - Validate     │            │      │
│  │   stale        │  │ - Timeout      │  │ - Update state │            │      │
│  └────────────────┘  └────────┬───────┘  └────────┬───────┘            │      │
│                              │                   │                     │      │
│                              ▼                   ▼                     │      │
│                    ┌─────────────────────────────────────┐             │      │
│                    │   Enhanced Agents (Sub-Agents)      │             │      │
│                    │  dev-ext | architect-ext | analyst │             │      │
│                    │  pm-ext | sm-ext | tea-ext | ...   │             │      │
│                    └─────────────────────────────────────┘             │      │
│                                                                              │
│  Product Reality Gates (enforced via story-cycle):                          │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                 │
│  │ UX Gate (01a) │ │Brain Gate(03a)│ │Visual Gate(06a)│                 │
│  │ Journey Script │ │ Tool Spec      │ │ Reality Check  │                 │
│  └────────────────┘ └────────────────┘ └────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Activation Protocol

### Step 1: Initialize Session

```yaml
action: "initialize"
tasks:
  - name: "Load Configuration"
    files:
      - "_bmad/core/config.yaml"
      - "_bmad-ext/MANIFEST.yaml"
    extract:
      - user_name
      - communication_language
      - output_folder

  - name: "Load or Create Loop State"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    if_not_exists: "create_from_template"
    validate:
      - schema_version == "2.0.0"

  - name: "Assign Session ID"
    if: "session.id == null"
    action: "generate_uuid"
    store_in: "session.id"

  - name: "Load Artifact Registry"
    file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    if_not_exists: "create_from_template"

  - name: "Load Workflow Status"
    file: "bmm-workflow-status.yaml"
    extract:
      - current_workflow.story
      - current_workflow.epic
      - current_workflow.status

  - name: "Display Session Header"
    output: |
      ╔══════════════════════════════════════════════════════════════╗
      ║  MASTER ORCHESTRATOR v1.0                                   ║
      ╠══════════════════════════════════════════════════════════════╣
      ║  Session: {session.id}                                       ║
      ║  Status: {session.status}                                    ║
      ║  Stories Completed: {progress.stories_completed_this_session}║
      ╚══════════════════════════════════════════════════════════════╝
```

---

### Step 2: Verify Human Intent Anchor

**CRITICAL**: This is the anti-hallucination guard. Before ANY autonomous work, verify the human's intent is still fresh.

```yaml
action: "verify-anchor"
critical: true

tasks:
  - name: "Check Anchor Freshness"
    condition: |
      anchor.human_intent_timestamp != null AND
      (NOW() - anchor.human_intent_timestamp) > staleness_threshold_hours
    on_true:
      action: "prompt_user"
      message: |
        ⚠️ STALE LOOP STATE DETECTED

        Your last direction was {hours_ago} hours ago:
        "{anchor.human_intent_summary}"

        To ensure I'm working on what you actually want, please confirm:

        Options:
        [C] Continue - Yes, this is still what I want
        [N] New direction - I have different instructions
        [R] Reset - Clear loop state and start fresh
        [V] View - Show me the current state before deciding

      wait_for_input: true

  - name: "Update Anchor on Confirmation"
    condition: "user_input == 'C' or user_input == 'Continue'"
    action: |
      anchor.human_intent_timestamp = NOW()
      anchor.conversation_id = "{current_conversation_id}"
      log: "Anchor refreshed by user confirmation"

  - name: "Handle New Direction"
    condition: "user_input == 'N' or user_input == 'New'"
    action: "prompt_for_new_direction"
    then:
      - Get new human intent summary
      - Update anchor.human_intent_summary = "{new_summary}"
      - Update anchor.human_intent_timestamp = NOW()
      - Update anchor.conversation_id = "{current_conversation_id}"

  - name: "Handle Reset"
    condition: "user_input == 'R' or user_input == 'Reset'"
    action: "reset_loop_state"
    then:
      - Archive current LOOP_STATE
      - Create fresh LOOP_STATE.yaml
      - Prompt for initial direction

  - name: "Handle View Request"
    condition: "user_input == 'V' or user_input == 'View'"
    action: "display_current_state"
    show:
      - session status
      - current work
      - delegations
      - progress
    then: "re-prompt for confirmation"
```

---

### Step 3: Load Current Story

```yaml
action: "load-story"
source: "bmm-workflow-status.yaml"

tasks:
  - name: "Extract Story Context"
    from: "current_workflow"
    extract:
      - story → story_id
      - epic → epic_id
      - title → story_title
      - type → story_type
      - status → story_status

  - name: "Load Story File"
    file: "_bmad-output/sprint-artifacts/stories/{story_id}.md"
    extract:
      - description
      - acceptance_criteria[]
      - tasks[]
      - estimated_hours
      - dependencies[]

  - name: "Update Loop State"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - current.story_id = "{story_id}"
      - current.story_title = "{story_title}"
      - current.epic_id = "{epic_id}"
      - current.type = "{story_type}"

  - name: "Display Story Summary"
    output: |
    ┌─────────────────────────────────────────────────────────────┐
    │  Current Story: {story_id}                                   │
    ├─────────────────────────────────────────────────────────────┤
    │  Title: {story_title}                                       │
    │  Epic: {epic_id}                                            │
    │  Type: {story_type}                                         │
    │  Tasks: {task_count}                                        │
    │  Estimate: {estimated_hours}h                               │
    └─────────────────────────────────────────────────────────────┘
```

---

### Step 4: Route to Enhanced Agent

```yaml
action: "route"
source: "_bmad-ext/orchestrator/routing-rules.yaml"

decision_tree:
  # Feature Development
  - if: "story_type == 'feature_development' OR story_type == 'bug_fix'"
    agent: "dev-ext"
    workflow: "story-cycle"
    priority: "high"

  # Architecture Work
  - if: "story_type == 'system_design' OR story_type == 'technical_spec'"
    agent: "architect-ext"
    workflow: "architecture-cycle"
    priority: "high"

  # Analysis & Requirements
  - if: "story_type in ['product_analysis', 'competitive_analysis', 'domain_analysis']"
    agent: "analyst-ext"
    workflow: "analysis-cycle"
    priority: "medium"

  # Product Management
  - if: "story_type == 'sprint_planning'"
    agent: "pm-ext"
    workflow: "planning-cycle"
    priority: "high"

  # Story Creation
  - if: "story_type == 'story_creation'"
    agent: "sm-ext"
    workflow: "story-creation-cycle"
    priority: "medium"

  # Testing
  - if: "story_type == 'test_design' OR story_type == 'test_review'"
    agent: "tea-ext"
    workflow: "testing-cycle"
    priority: "medium"

  # Documentation
  - if: "story_type in ['api_docs', 'user_guide', 'readme_update']"
    agent: "tech-writer-ext"
    workflow: "documentation-cycle"
    priority: "low"

  # UX Design
  - if: "story_type == 'ux_design'"
    agent: "ux-designer-ext"
    workflow: "design-cycle"
    priority: "medium"

  # Quality Scanning
  - if: "story_type in ['health_assessment', 'state_scan', 'architecture_scan']"
    agent: "quality-scanner-ext"
    workflow: "scan-cycle"
    priority: "high"

  # Remediation
  - if: "story_type in ['god_store_split', 'component_split', 'typescript_fix']"
    agent: "dev-ext"
    workflow: "remediation-cycle"
    priority: "critical"

  # Default Fallback
  - else:
    agent: "dev-ext"
    workflow: "story-cycle"
    priority: "medium"
    log: "Unknown story type, using default dev-ext"

output:
  selected_agent: "{agent}"
  selected_workflow: "{workflow}"
  selected_priority: "{priority}"
```

---

### Step 5: Create Handoff Artifact

```yaml
action: "create-handoff"
template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
output: "_bmad-output/handoffs/{date}/{story_id}-orchestrator-handoff.md"

tasks:
  - name: "Generate Handoff ID"
    action: "generate_uuid"
    store_in: "handoff_id"

  - name: "Create Handoff File"
    file: "{output_path}"
    contents:
      frontmatter:
        artifact_id: "{handoff_id}"
        artifact_type: "handoff"
        parent_id: null  # Root handoff from orchestrator
        story_id: "{story_id}"
        source_agent: "master-orchestrator"
        target_agent: "{selected_agent}"
        created_at: NOW()
        status: "PENDING"

      sections:
        context_summary: |
          Orchestrator delegating {story_id}: {story_title}
          Story type: {story_type}
          Epic: {epic_id}
          Tasks: {task_count}
          Estimate: {estimated_hours}h

        handoff_data:
          story_file: "_bmad-output/sprint-artifacts/stories/{story_id}.md"
          story_id: "{story_id}"
          epic_id: "{epic_id}"
          story_type: "{story_type}"
          acceptance_criteria: "{acceptance_criteria[]}"
          tasks: "{tasks[]}"
          estimated_hours: "{estimated_hours}"
          dependencies: "{dependencies[]}"

        acceptance_criteria:
          - All tasks completed per story file
          - All acceptance criteria met
          - Tests passing (if applicable)
          - No TypeScript errors (if code)
          - Documentation updated (if required)

        validation_commands: |
          # TypeScript check (if code)
          pnpm tsc --noEmit

          # Run tests (if applicable)
          pnpm vitest run

          # Lint check
          pnpm lint

        escalation_path: |
          On failure → Report to master-orchestrator with:
          - Error details
          - What was attempted
          - Recovery actions taken
          - Recommendation for next steps

  - name: "Register in Artifact Registry"
    file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    action: "add_artifact"
    entry:
      id: "{handoff_id}"
      path: "{output_path}"
      type: "handoff"
      parent_id: null
      children_ids: []
      status: "ACTIVE"
      created_at: NOW()
      updated_at: NOW()
      created_by: "master-orchestrator"
      story_id: "{story_id}"
      ttl_hours: 4

    # Update indexes
    update:
      - indexes.by_story.{story_id} = ["{handoff_id}"]
      - indexes.by_status.ACTIVE.append("{handoff_id}")
```

---

### Step 6: Delegate to Enhanced Agent

```yaml
action: "delegate"
protocol: "_bmad-ext/orchestrator/delegation-protocol.md"

tasks:
  - name: "Update Loop State for Delegation"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - current.workflow = "{selected_workflow}"
      - current.agent = "{selected_agent}"
      - current.step = 1
      - current.step_started_at = NOW()
      - delegations.active:
          delegation_id: "{generate_uuid}"
          parent_agent: "master-orchestrator"
          child_agent: "{selected_agent}"
          handoff_artifact: "{handoff_path}"
          started_at: NOW()
          timeout_minutes: 60

  - name: "Log Delegation Start"
    file: "_bmad-ext/state/DELEGATION_LOG.yaml"
    append:
      - timestamp: NOW()
        delegation_id: "{delegations.active.delegation_id}"
        action: "started"
        agent: "{selected_agent}"
        story: "{story_id}"

  - name: "Invoke Sub-Agent"
    method: "spawn"
    agent: "_bmad-ext/agents/{selected_agent}.md"
    context:
      - handoff_artifact: "{handoff_path}"
      - loop_state: "_bmad-ext/state/LOOP_STATE.yaml"
      - delegation_id: "{delegations.active.delegation_id}"
    await_callback: true
    timeout: "{delegations.active.timeout_minutes} minutes"

  - name: "Wait for Callback"
    action: "await_completion"
    check_interval: "30 seconds"
    timeout_handling:
      - Log timeout
      - Create timeout handoff
      - Decide: retry OR escalate
```

---

### Step 7: Receive Callback

```yaml
action: "receive-callback"
from: "{selected_agent}"

expected_payload:
  status: "SUCCESS | PARTIAL | FAILED"
  agent: "{selected_agent}"
  story_id: "{story_id}"
  artifacts_created: []
  validation_results:
    typescript_errors: 0
    tests_passed: true
    test_count: 0
  next_recommendation: "..."

on_success:
  - name: "Mark Delegation Complete"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - delegations.active → move to delegations.completed
      - current.step = "COMPLETED"
      - progress.stories_completed_this_session += 1
      - errors.count = 0

  - name: "Update Story Status"
    file: "bmm-workflow-status.yaml"
    updates:
      - current_workflow.story.status = "DONE"

  - name: "Update Handoff Status"
    file: "{handoff_artifact}"
    updates:
      - status = "CONSUMED"
      - completed_at = NOW()

  - name: "Log Success"
    file: "_bmad-ext/state/DELEGATION_LOG.yaml"
    append:
      - timestamp: NOW()
        delegation_id: "{delegation_id}"
        action: "completed"
        status: "SUCCESS"
        artifacts: "{artifacts_created}"

  - name: "Display Success Summary"
    output: |
      ┌─────────────────────────────────────────────────────────────┐
      │  ✅ Delegation Complete                                     │
      ├─────────────────────────────────────────────────────────────┤
      │  Agent: {selected_agent}                                   │
      │  Story: {story_id}                                         │
      │  Status: SUCCESS                                           │
      │  Artifacts: {artifact_count}                               │
      │  TypeScript Errors: {validation_results.typescript_errors} │
      │  Tests Passed: {validation_results.tests_passed}           │
      └─────────────────────────────────────────────────────────────┘

on_partial:
  - name: "Log Partial Completion"
    file: "_bmad-ext/state/DELEGATION_LOG.yaml"
    append:
      - timestamp: NOW()
        delegation_id: "{delegation_id}"
        action: "partial"
        status: "PARTIAL"
        reason: "{callback.reason}"

  - name: "Create Continuation Handoff"
    template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
    output: "_bmad-output/handoffs/{date}/{story_id}-continuation.md"
    contents:
      context_summary: "Partial completion - continuation needed"
      handoff_data: "{callback.partial_results}"
      acceptance_criteria: "{remaining_work}"
      next_action: "retry_or_continue"

  - name: "Decide Next Action"
    options:
      - "retry_same_agent"
      - "escalate_to_different_agent"
      - "await_human_guidance"

on_failed:
  - name: "Log Failure"
    file: "_bmad-ext/state/DELEGATION_LOG.yaml"
    append:
      - timestamp: NOW()
        delegation_id: "{delegation_id}"
        action: "failed"
        status: "FAILED"
        error: "{callback.error_details}"

  - name: "Update Error State"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - errors.count += 1
      - errors.last_error = "{callback.error_details}"
      - errors.last_error_at = NOW()
      - delegations.active → move to delegations.failed

  - name: "Execute Escalation Protocol"
    file: "_bmad-ext/orchestrator/escalation-protocol.md"
    follow: "failure_handling"
```

---

### Step 8: Governance Update Check

```yaml
action: "governance-check"
source: "_bmad-ext/orchestrator/governance-auto-update.md"

conditions:
  - name: "Check if AGENTS.md Update Needed"
    condition: "progress.stories_completed_this_session % 3 == 0"
    if_true:
      action: "update_agents_md"
      file: "AGENTS.md"
      update:
        - Add new artifacts
        - Update sprint status
        - Refresh architecture section

  - name: "Check if Epic Complete"
    condition: "epic_all_stories_done == true"
    if_true:
      action: "epic_completion_tasks"
      tasks:
        - Update AGENTS.md
        - Create epic retrospective
        - Archive epic artifacts
        - Update sprint-status.yaml

  - name: "Check for Critical Architecture Changes"
    condition: "story_type in ['god_store_split', 'component_split'] AND status == 'SUCCESS'"
    if_true:
      action: "architecture_update_tasks"
      tasks:
        - Update AGENTS.md
        - Update CLAUDE.md (if standards changed)
        - Create architecture delta document
```

---

### Step 9: Continuation Decision

```yaml
action: "continue-or-stop"

conditions:
  continue_if:
    - condition: "more_stories_remaining == true"
      check: "bmm-workflow-status.yaml for pending stories"

    - condition: "no_critical_errors == true"
      check: "errors.count == 0"

    - condition: "session.iteration < session.max_iterations"
      check: "session.iteration < 100"

    - condition: "anchor_not_stale == true"
      check: "(NOW() - anchor.human_intent_timestamp) < staleness_threshold_hours"

    - condition: "user_not_interrupted == true"
      check: "no_user_message_received"

  stop_if:
    - condition: "all_stories_complete == true"
      action: "session_complete"

    - condition: "critical_error == true"
      action: "session_failed"
      create: "error_handoff"

    - condition: "max_iterations_reached == true"
      action: "session_paused"
      message: "Max iterations (100) reached"

    - condition: "user_interrupt == true"
      action: "session_paused"
      message: "User interrupted"

    - condition: "anchor_stale == true"
      action: "session_paused"
      message: "Human intent stale, awaiting confirmation"

on_continue:
  - name: "Increment Iteration"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - session.iteration += 1

  - name: "Log Continuation"
    file: "_bmad-ext/state/DELEGATION_LOG.yaml"
    append:
      - timestamp: NOW()
        action: "continuing"
        iteration: "{session.iteration}"
        next_story: "{next_story_id}"

  - name: "Proceed to Next Story"
    action: "go_to_step_3"
    step: "load-story"

on_stop:
  - name: "Set Session Status"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - session.status = "COMPLETED" or "PAUSED" or "FAILED"
      - session.completed_at = NOW()

  - name: "Generate Completion Report"
    output: "_bmad-output/sessions/{session.id}/completion-report.md"
    include:
      - Session summary
      - Stories completed
      - Artifacts created
      - Errors encountered
      - Recommendations

  - name: "Archive Session Artifacts"
    action: "archive_session"
    destination: "_bmad-output/.archive/sessions/{session.id}/"

  - name: "Display Final Summary"
    output: |
      ╔══════════════════════════════════════════════════════════════╗
      ║  Session {session.status}                                     ║
      ╠══════════════════════════════════════════════════════════════╣
      ║  Session ID: {session.id}                                    ║
      ║  Stories Completed: {progress.stories_completed_this_session}║
      ║  Iterations: {session.iteration}                             ║
      ║  Artifacts Created: {artifact_count}                         ║
      ║  Errors: {errors.count}                                      ║
      ╚══════════════════════════════════════════════════════════════╝
```

---

## Menu (Interactive Mode)

```yaml
menu:
  header: |
    ╔══════════════════════════════════════════════════════════════╗
    ║  MASTER ORCHESTRATOR v1.0                                    ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Session: {session.id}                                       ║
    ║  Status: {session.status}                                    ║
    ║  Stories: {progress.stories_completed_this_session} done    ║
    ╚══════════════════════════════════════════════════════════════╝

  items:
    - cmd: "RS"
      name: "Resume Sprint"
      description: "Continue autonomous execution"
      action: "execute_autonomous_cycle"

    - cmd: "NS"
      name: "Next Story"
      description: "Execute next story only"
      action: "execute_single_story"

    - cmd: "SS"
      name: "Show Status"
      description: "Display current state"
      action: "display_full_status"

    - cmd: "LA"
      name: "List Agents"
      description: "Show available enhanced agents"
      action: "list_enhanced_agents"

    - cmd: "LW"
      name: "List Workflows"
      description: "Show available workflows"
      action: "list_workflows"

    - cmd: "IA"
      name: "Invoke Agent"
      description: "Directly invoke an enhanced agent"
      action: "direct_agent_invocation"

    - cmd: "GU"
      name: "Governance Update"
      description: "Force AGENTS.md update"
      action: "force_governance_update"

    - cmd: "AR"
      name: "Archive Stale"
      description: "Archive stale artifacts"
      action: "archive_stale_artifacts"

    - cmd: "CH"
      name: "Chat"
      description: "Chat about the project"
      action: "enter_chat_mode"

    - cmd: "DA"
      name: "Dismiss"
      description: "Exit orchestrator"
      action: "exit_orchestrator"
```

---

## Integration Points

```yaml
reads:
  - "bmm-workflow-status.yaml"
  - "_bmad-ext/state/LOOP_STATE.yaml"
  - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
  - "_bmad-ext/orchestrator/routing-rules.yaml"

writes:
  - "_bmad-ext/state/LOOP_STATE.yaml"
  - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
  - "_bmad-ext/state/DELEGATION_LOG.yaml"
  - "bmm-workflow-status.yaml" (on story complete)
  - "AGENTS.md" (on governance update)

spawns:
  # Module Wrappers (NEW - v1.1)
  - "_bmad-ext/modules/sprint-planning-wrapper/"

  # Enhanced Agents
  - "_bmad-ext/agents/dev-ext.md"
  - "_bmad-ext/agents/architect-ext.md"
  - "_bmad-ext/agents/analyst-ext.md"
  - "_bmad-ext/agents/product-management-ext.md"
  - "_bmad-ext/agents/tea-ext.md"
  - "_bmad-ext/agents/tech-writer-ext.md"
  - "_bmad-ext/agents/ux-designer-ext.md"
  - "_bmad-ext/shared-services/quality-scanner.md"

product_reality_gates:
  - "step-01a-user-journey.md (UX Gate)"
  - "step-03a-agent-tool-spec.md (Brain Gate)"
  - "step-06a-reality-check.md (Visual Gate)"
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-11 | Added Sprint-Planning Wrapper integration, Product Reality Gates |
| 1.0.0 | 2026-01-10 | Initial orchestrator for Phase 3 |

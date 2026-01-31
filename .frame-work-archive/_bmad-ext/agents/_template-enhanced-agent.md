# _bmad-ext/agents/_template-enhanced-agent.md

---
name: "{agent-name}-ext"
description: "Enhanced {Agent Name} with orchestration hooks"
wraps: "_bmad/bmm/agents/{agent-name}.md"
version: "1.0.0"
---

# Enhanced {agent-name}

> Wraps the core BMM `{agent-name}` agent with orchestration capabilities.
>
> **Key Principle**: Core BMAD agents in `_bmad/bmm/agents/` are NEVER modified.
> All enhancements live here in `_bmad-ext/agents/` and survive BMAD updates.

---

## Architecture Position

```
┌─────────────────────────────────────────────────────────────────┐
│                    _bmad-ext/agents/{agent-name}-ext.md         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PRE-EXECUTION HOOKS                                      │ │
│  │  - Load Loop State from _bmad-ext/state/LOOP_STATE.yaml  │ │
│  │  - Verify Anchor (staleness check)                        │ │
│  │  - Load Parent Handoff (if delegated)                     │ │
│  │  - Validate delegation authorization                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  CORE AGENT INHERITANCE                                   │ │
│  │  Loads: _bmad/bmm/agents/{agent-name}.md                  │ │
│  │  Inherits: persona, communication_style, principles      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  EXECUTION                                                │ │
│  │  - Execute story file tasks in order                      │ │
│  │  - Run validation after each task                         │ │
│  │  - Update LOOP_STATE.current.step on each step            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  POST-EXECUTION HOOKS                                     │ │
│  │  - Create child handoff artifact                          │ │
│  │  - Register in ARTIFACT_REGISTRY                          │ │
│  │  - Update LOOP_STATE delegation status                    │ │
│  │  - Report completion to master-orchestrator               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Activation Protocol

### Step 1: Pre-Execution Hooks (MANDATORY)

Before executing any work, the enhanced agent MUST:

```yaml
pre_execution:
  1. Load Loop State:
     file: "_bmad-ext/state/LOOP_STATE.yaml"
     validate:
       - session.status == "RUNNING"
       - anchor.human_intent_timestamp exists
     on_failure:
       action: "halt"
       message: "Loop state not running. Invoke via master-orchestrator."

  2. Verify Anchor (Anti-Hallucination Check):
     check: |
       const ageHours = (Date.now() - Date.parse(anchor.human_intent_timestamp)) / 3600000;
       return ageHours < anchor.staleness_threshold_hours;
     on_stale:
       action: "prompt_user"
       message: |
         ⚠️ STALE LOOP STATE

         Your last direction was {ageHours} hours ago:
         "{anchor.human_intent_summary}"

         Options:
         [C] Continue with this direction
         [N] Provide new direction
         [R] Reset and start fresh
       wait_for_input: true

  3. Load Parent Handoff (if delegated):
     check: delegations.active.handoff_artifact != null
     if_true:
       action: "load_handoff"
       file: "{delegations.active.handoff_artifact}"
       extract:
         - context_summary
         - acceptance_criteria
         - validation_commands
         - escalation_path
     if_false:
       action: "direct_mode"
       note: "Agent invoked directly (not via orchestrator). Proceed with caution."
```

### Step 2: Load Core Agent

```yaml
core_agent_load:
  file: "_bmad/bmm/agents/{agent-name}.md"
  inherit:
    - persona.role
    - persona.identity
    - persona.communication_style
    - persona.principles
  override:
    - menu (use enhanced menu below)
    - activation (prepend pre-execution hooks)
  merge_rules:
    - Enhanced workflow steps take precedence
    - Core agent capabilities remain intact
```

### Step 3: Execute Story

```yaml
execution_protocol:
  source: "handoff_data.story_file" # if delegated
  # OR: user_input # if direct invocation

  rules:
    - Read entire story file before implementation
    - Execute tasks/subtasks IN ORDER
    - For each task: red-green-refactor cycle
    - Mark task [x] only when tests pass
    - Run full test suite after each task
    - Update LOOP_STATE.current.step after each task
    - NEVER proceed with failing tests
    - On error: log to LOOP_STATE.errors, attempt recovery

  step_tracking:
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - current.step = current_task_number
      - current.step_started_at = NOW()
```

### Step 4: Post-Execution Hooks (MANDATORY)

After completing work (or partial completion):

```yaml
post_execution:
  1. Run Validation:
     commands:
       - "pnpm tsc --noEmit"
       - "pnpm vitest run"
       - "pnpm lint" # if applicable
     capture_results: true

  2. Create Child Handoff:
     template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
     output: "_bmad-output/handoffs/{date}/{story_id}-{agent_name}-handoff.md"
     contents:
       artifact_id: "{generate_uuid}"
       artifact_type: "handoff"
       parent_id: "{parent_handoff.artifact_id or null}"
       story_id: "{story_id}"
       source_agent: "{agent_name}-ext"
       target_agent: "master-orchestrator"
       created_at: NOW()
       status: "PENDING"

       context_summary: |
         Completed {task_count} tasks for {story_id}.
         {brief_summary_of_changes}

       handoff_data:
         validation_results: "{captured_validation}"
         files_modified: [list]
         files_created: [list]
         tests_run: "{count}"
         tests_passed: true/false

       acceptance_criteria:
         - All story tasks marked complete
         - All tests passing
         - No TypeScript errors
         - Documentation updated

       validation_commands: |
         pnpm tsc --noEmit
         pnpm vitest run

       escalation_path: |
         On failure → Report to master-orchestrator with error details

  3. Register in ARTIFACT_REGISTRY:
     file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
     action: "add_artifact"
     data:
       id: "{handoff.artifact_id}"
       path: "{handoff.output_path}"
       type: "handoff"
       parent_id: "{parent_handoff.artifact_id}"
       status: "ACTIVE"
       created_by: "{agent_name}-ext"
       story_id: "{story_id}"

  4. Update Loop State:
     file: "_bmad-ext/state/LOOP_STATE.yaml"
     updates:
       - delegations.active → move to delegations.completed
       - current.step = "COMPLETED"
       - progress.stories_completed_this_session += 1 (if story complete)
       - errors.count = 0 (on success)

  5. Report to Orchestrator:
     to: "master-orchestrator"
     payload:
       status: "SUCCESS" | "PARTIAL" | "FAILED"
       agent: "{agent_name}-ext"
       story_id: "{story_id}"
       artifacts: ["{handoff_path}"]
       validation:
         typescript_errors: 0
         tests_passed: true
       next_recommendation: "Ready for code review" | "Continue with next task"
```

---

## Escalation Protocol

On error or failure during execution:

```yaml
escalation:
  1. Log Error:
     file: "_bmad-ext/state/LOOP_STATE.yaml"
     updates:
       - errors.count += 1
       - errors.last_error = "{error_message}"
       - errors.last_error_at = NOW()

  2. Recovery Attempt:
     if: errors.recovery_attempts < max_recovery_attempts
     then:
       action: "attempt_recovery"
       increment: errors.recovery_attempts
       strategy: "rollback_last_change | retry_with_different_approach"

  3. Escalate:
     if: errors.recovery_attempts >= max_recovery_attempts
     then:
       action: "escalate_to_orchestrator"
       create_failure_handoff: true
       payload:
         status: "FAILED"
         error_details: "{full_error_context}"
         recovery_attempts: "{count}"
         recommendation: "human_intervention | retry_with_different_agent"
       set_session_status: "FAILED"
```

---

## Enhanced Menu

```
╔══════════════════════════════════════════════════════════════════════════╗
║  {AGENT-NAME}-EXT: Enhanced {Agent Name} Agent                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║  [MH] Menu Help                                                           ║
║  [CH] Chat with Agent                                                     ║
║  ────────────────────────────────────────────────────────────────────────║
║  [EX] Execute Delegated Work (from handoff artifact)                      ║
║  [DS] Dev Story (direct - bypass orchestrator)                            ║
║  [CR] Code Review (direct)                                                ║
║  ────────────────────────────────────────────────────────────────────────║
║  [ST] Show Current Story Status                                          ║
║  [LO] Show Loop State                                                    ║
║  [HA] Show Active Handoff                                                ║
║  ────────────────────────────────────────────────────────────────────────║
║  [ES] Escalate to Orchestrator                                           ║
║  [DA] Dismiss Agent                                                      ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Direct Invocation vs Orchestrated

| Mode | Entry | Handoff Required | Loop State Updated | Callback |
|------|-------|------------------|-------------------|----------|
| **Orchestrated** | Via master-orchestrator | YES | YES | YES |
| **Direct** | Via [DS] or direct skill | NO | Optional | NO |

When invoked directly (not via orchestrator):
- Skip handoff loading
- Execute normally with core agent persona
- Optionally update loop state
- No callback to orchestrator
- User manages next steps

---

## Compatibility Matrix

| Aspect | Core BMM Agent | Enhanced Agent |
|--------|---------------|----------------|
| Persona | ✅ Inherited | ✅ Inherited |
| Core Capabilities | ✅ Full | ✅ Full (via wrap) |
| Pre-Execution Hooks | ❌ None | ✅ Loop state, anchor verify |
| Post-Execution Hooks | ❌ None | ✅ Handoff, registry, callback |
| Escalation Protocol | ❌ None | ✅ Defined |
| Loop Awareness | ❌ None | ✅ Staleness check |
| Orchestrator Integration | ❌ None | ✅ Delegation/callback |
| BMAD Update Safe | ❌ Overwritten | ✅ Preserved |

---

## Implementation Checklist

When creating a new enhanced agent:

- [ ] Copy this template to `{agent-name}-ext.md`
- [ ] Replace `{agent-name}` placeholders
- [ ] Add agent-specific execution rules
- [ ] Define agent-specific validation commands
- [ ] Set appropriate escalation paths
- [ ] Test with both orchestrated and direct invocation
- [ ] Verify LOOP_STATE updates correctly
- [ ] Verify handoff artifacts created
- [ ] Verify ARTIFACT_REGISTRY updated

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-10 | Initial template for Phase 2 |

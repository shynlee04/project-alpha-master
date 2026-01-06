# VELOCITY EXECUTION WITH RALPH LOOP GUARDRAILS
# Integration of ralph-loop.sh hook into autonomous execution
# Version: 1.0.0
# Created: 2026-01-06T05:10:00+07:00

# ═══════════════════════════════════════════════════════════════════════════
# RALPH LOOP HOOK INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════

ralph_loop_integration:
  hook_path: ".claude/hooks/ralph-loop.sh"
  trigger: "Every 30-second cycle"
  purpose: "Artifact freshness validation + iteration tracking"

  # What Ralph Loop provides:
  capabilities:
    - name: "Iteration Tracking"
      description: "Increments current_iteration counter each cycle"
      output: ".claude/ralph-loop.local.md"
      used_for: "Progress tracking and resume capability"

    - name: "Artifact Freshness Validation"
      description: "Detects stale artifacts (>24h) and STOPS workflow"
      check_frequency: "Every cycle"
      threshold: "24 hours"
      used_for: "Preventing work on outdated context"

    - name: "Multi-Team Conflict Detection"
      description: "Detects if multiple teams working on same epic"
      check_frequency: "Every cycle"
      used_for: "Coordination in parallel execution"

    - name: "Context Loading"
      description: "Loads latest completion report for context"
      load_frequency: "Every cycle"
      used_for: "Maintaining context across cycles"

    - name: "Execution Logging"
      description: "Logs all hook executions to handoffs directory"
      log_file: "_bmad-output/handoffs/ralph-loop-hook-log.txt"
      used_for: "Debugging and audit trail"

# ═══════════════════════════════════════════════════════════════════════════
# EXECUTION FLOW WITH RALPH LOOP
# ═══════════════════════════════════════════════════════════════════════════

execution_flow_with_ralph_loop:
  per_30_second_cycle:
    second_0:
      action: "Run ralph-loop.sh hook"
      checks:
        - "Increment iteration counter"
        - "Validate artifact freshness (<24h)"
        - "Check for multi-team conflicts"
        - "Load latest context"

      on_stale_artifacts:
        action: "STOP workflow immediately"
        user_notification: "Stale artifacts detected - user approval required"
        wait_for: "User to refresh artifacts or approve continue"

      on_fresh_artifacts:
        action: "Continue to second_5"

    second_5:
      action: "Spawn 750+ agents"
      parallel_tasks:
        - "Load phase configuration"
        - "Invoke relevant skills"
        - "Query MCP servers"
        - "Begin micro-tasks"

    second_5_15:
      action: "Agents execute micro-tasks"
      monitoring:
        - "Track active agent count"
        - "Monitor MCP server responses"
        - "Validate skill invocations"

    second_15_20:
      action: "Agents report progress"
      collection:
        - "Code written"
        - "Tests written"
        - "Reviews completed"
        - "Validation results"

    second_20_25:
      action: "Code review and validation"
      automated_checks:
        - "TypeScript compilation"
        - "Test coverage"
        - "God store detection"
        - "Design system compliance"

    second_25_30:
      action: "Checkpoint and governance"
      finalization:
        - "Update LOOP_STATE.yaml"
        - "Generate handoff artifacts"
        - "Log completion metrics"
        - "Prepare for next cycle"

# ═══════════════════════════════════════════════════════════════════════════
# ARTIFACT FRESHNESS STRATEGY
# ═══════════════════════════════════════════════════════════════════════════

artifact_freshness_strategy:
  # Ralph Loop stops workflow if artifacts >24h old
  # For velocity execution, we need to ensure artifacts stay fresh

  refresh_strategy:
    # Auto-refresh artifacts every 12 hours (halfway to 24h threshold)
    auto_refresh_frequency: "every 12 hours"
    auto_refresh_trigger: "iteration % 1440 == 0"  # 12h = 1440 cycles × 30s

    # What gets auto-refreshed:
    artifacts_to_refresh:
      - "_bmad-output/governance/MASTER-INTEGRATION-PLAN-2026-01-06.md"
      - "_bmad/modules/asgl/MASTER-INTEGRATION-LOOP-VELOCITY.yaml"
      - "_bmad/modules/asgl/LOOP_STATE.yaml"
      - ".claude/AGENT-STATE.yaml"

    refresh_action:
      - "Re-read latest plan state"
      - "Update progress metrics"
      - "Validate still on track"
      - "Update timestamps"

  stale_artifact_handling:
    detection: "ralph-loop.sh hook"
    action: "STOP workflow immediately"
    user_options:
      - option: 1
        name: "CONTINUE"
        description: "Proceed with stale artifacts (user assumes risk)"
        command: "Set user_approval_required=false in ralph-loop.local.md"

      - option: 2
        name: "REFRESH"
        description: "Refresh stale artifacts and continue"
        command: "Re-run artifact generation, update timestamps"

      - option: 3
        name: "ABORT"
        description: "Stop execution and review stale context"
        command: "Set current_cycle=ABORTED in ralph-loop.local.md"

# ═══════════════════════════════════════════════════════════════════════════
# MULTI-TEAM COORDINATION
# ═══════════════════════════════════════════════════════════════════════════

multi_team_coordination:
  # Ralph Loop detects if multiple teams working on same epic
  # For velocity execution, we have 5 "virtual teams" (groups A-E)

  virtual_teams:
    - team: "Group A - Foundation"
      epics: ["UJ-001", "UJ-002", "UJ-003", "UJ-004", "ARCH-REDESIGN-1", "ARCH-REDESIGN-3"]
      conflict_potential: "LOW"  # No overlap with other groups

    - team: "Group B - Architecture + Health"
      epics: ["S-011", "S-012", "S-013", "S-014", "S-017", "S-018", "S-019", "S-020", "S-021"]
      conflict_potential: "MEDIUM"  # Overlaps with Group C on chat infrastructure

    - team: "Group C - Chat Integration"
      epics: ["E1-1", "E1-2", "E2-1", "E2-2", "E2-3", "E3-1", "E3-2", "E3-3"]
      conflict_potential: "MEDIUM"  # Overlaps with Group B on state management

    - team: "Group D - Advanced Features"
      epics: ["E4-1" through "E4-10", "E5-1" through "E5-7", "E6-1" through "E6-7", "E7-1" through "E7-5"]
      conflict_potential: "LOW"  # Independent features

    - team: "Group E - Polish + Validation"
      epics: ["E8-1" through "E8-5", "E9-1" through "E9-4", "E10-1" through "E10-7", "S-030" through "S-033"]
      conflict_potential: "LOW"  # Final phase, no conflicts

  conflict_resolution:
    detection: "ralph-loop.sh hook"
    protocol: "INDEPENDENT_MODE"

    on_conflict:
      action: "Continue with warning"
      reasoning: "Groups work on different code areas (separate files/stores)"
      coordination: "Cross-team handoff artifacts at boundaries"

    example_conflicts:
      - conflict: "Group B refactoring stores that Group C chat uses"
        resolution: "Group B completes refactoring first, creates facade, Group C uses facade"
        handoff: "_bmad-output/handoffs/group-b-to-c-store-refactoring-handoff.md"

# ═══════════════════════════════════════════════════════════════════════════
# CONTEXT LOADING STRATEGY
# ═══════════════════════════════════════════════════════════════════════════

context_loading_strategy:
  # Ralph Loop loads latest completion report for context
  # For velocity execution, we use this to maintain state across cycles

  load_frequency: "Every cycle (30 seconds)"

  what_gets_loaded:
    - "Latest completion report from previous cycle"
    - "Current phase progress"
    - "Active agent list"
    - "Stories completed in previous cycle"
    - "Errors encountered in previous cycle"
    - "Next actions pending"

  context_artifacts:
    - "_bmad-output/completion-reports/cycle-{N}-completion.md"
    - "_bmad-output/handoffs/{story-id}-handoff.md"
    - "_bmad/modules/asgl/LOOP_STATE.yaml"
    - ".claude/AGENT-STATE.yaml"

  usage:
    - "Resume from exact state if interrupted"
    - "Avoid redundant work across cycles"
    - "Track dependencies between stories"
    - "Maintain progress metrics"

# ═══════════════════════════════════════════════════════════════════════════
# EXECUTION LOGGING
# ═══════════════════════════════════════════════════════════════════════════

execution_logging:
  log_file: "_bmad-output/handoffs/ralph-loop-hook-log.txt"
  format: "Timestamp + Iteration + Cycle + Sub-cycle + Action + Result"

  logged_events:
    - "Hook triggered"
    - "Stale artifact check result"
    - "Multi-team conflict detected"
    - "Context loaded from artifact"
    - "Cycle started"
    - "Cycle completed"
    - "Errors encountered"
    - "Agents spawned"
    - "MCP tools invoked"

  log_analysis:
    frequency: "Every 100 cycles"
    metrics:
      - "Average cycle duration"
      - "Success rate (cycles without errors)"
      - "Most common errors"
      - "Agent productivity"
      - "MCP response times"

# ═══════════════════════════════════════════════════════════════════════════
# RESUME CAPABILITY
# ═══════════════════════════════════════════════════════════════════════════

resume_capability:
  # If execution is interrupted (error, user abort, system failure)
  # Ralph Loop enables exact resume

  resume_state_tracked:
    - "current_iteration: Which cycle we're on"
    - "current_cycle: Which phase we're in"
    - "current_subcycle: Which story within phase"
    - "last_completed_cycle: What was just finished"
    - "user_approval_required: If waiting for user input"
    - "stale_detected: If stale artifacts found"

  resume_process:
    1. "Run ralph-loop.sh hook"
    2. "Check user_approval_required flag"
    3. "If false, load latest context"
    4. "Resume from last_completed_cycle + 1"
    5. "Continue autonomous execution"

  example_resume_scenario:
    scenario: "Execution stopped at cycle 450 due to stale artifacts"
    resume_steps:
      - "User refreshes artifacts"
      - "Sets user_approval_required=false"
      - "Run ralph-loop.sh hook"
      - "Hook loads context from cycle 449"
      - "Resume at cycle 450"
      - "Continue to completion"

# ═══════════════════════════════════════════════════════════════════════════
# INTEGRATION WITH VELOCITY EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

integration_points:
  entry_point:
    hook: "ralph-loop.sh"
    timing: "Before spawning agents"
    purpose: "Validate fresh context before starting work"

  mid_point:
    hook: "ralph-loop.sh (context loading)"
    timing: "After agents report progress"
    purpose: "Load latest context for next cycle"

  exit_point:
    hook: "ralph-loop.sh (logging)"
    timing: "After checkpoint and governance"
    purpose: "Log cycle completion for audit trail"

  error_point:
    hook: "ralph-loop.sh (stale detection)"
    timing: "Any time artifacts go stale"
    purpose: "Stop execution before working on outdated context"

# ═══════════════════════════════════════════════════════════════════════════
# CONTINUATION
# ═══════════════════════════════════════════════════════════════════════════

continuation:
  next_action: "Integrate ralph-loop.sh into execution startup sequence"

  startup_sequence:
    1. "Initialize LOOP_STATE.yaml with velocity config"
    2. "Run ralph-loop.sh hook for first time"
    3. "Validate all artifacts fresh (<24h)"
    4. "Load initial context"
    5. "Begin Phase 0, Cycle 0"
    6. "Continue autonomous execution"

  monitoring:
    ralph_loop_output: "Console + log file"
    key_indicators:
      - "Iteration incrementing each cycle"
      - "Stale artifacts = STOP immediately"
      - "Multi-team conflicts = WARNING + continue"
      - "Context loaded = Resume capability verified"

# ═══════════════════════════════════════════════════════════════════════════
# METADATA
# ═══════════════════════════════════════════════════════════════════════════

metadata:
  created_at: "2026-01-06T05:10:00+07:00"
  created_by: "BMAD Master Coordinator - Velocity + Ralph Loop"
  version: "1.0.0"
  framework: "BMAD V6 + ASGL v3.0 + Ralph Loop Guardrails"

  artifacts:
    - velocity_config: "_bmad/modules/asgl/MASTER-INTEGRATION-LOOP-VELOCITY.yaml"
    - ralph_loop_integration: "_bmad/modules/asgl/VELOCITY-EXECUTION-INTEGRATION.md"
    - ralph_loop_hook: ".claude/hooks/ralph-loop.sh"
    - ralph_loop_state: ".claude/ralph-loop.local.md"

  execution_ready: true
  guardrails_active: true
  resume_capability: true

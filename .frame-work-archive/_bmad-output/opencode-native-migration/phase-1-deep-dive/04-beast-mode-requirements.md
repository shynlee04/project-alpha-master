# Beast Mode Requirements for OpenCode Native

**Document ID**: PHASE-1.4-BEAST-MODE-REQUIREMENTS-2026-01-28
**Version**: 1.0.0
**Status**: COMPLETE
**Date**: 2026-01-28
**Authors**: analyst-ext, architect-ext, tech-writer-ext (synthesized)

---

## Executive Summary

This document consolidates all requirements from Phase 1 analysis into a prioritized backlog for OpenCode Native. The requirements are organized into 4 categories:

- **AUTO**: Automation Requirements (9 items)
- **ENF**: Enforcement Requirements (6 items)
- **CTX**: Context Management Requirements (6 items)
- **COORD**: Agent Coordination Requirements (6 items)

**Total: 27 requirements** across 4 categories, prioritized from Critical to Nice-to-Have.

---

## Category 1: Automation Requirements (AUTO)

These requirements ensure governance is automated, not just documented.

### AUTO-01: Pre-Execution Hooks [CRITICAL]

**Problem**: 80% of failures from bypassed governance (Phase 1.1)

**Requirement**:
```yaml
pre_execution_hook:
  trigger: "before every agent action"
  checks:
    - governance_rules_loaded: true
    - workflow_position_valid: true
    - story_context_available: true
    - acceptance_criteria_defined: true
  
  on_failure:
    action: "BLOCK"
    message: "Missing required context. Load before proceeding."
  
  enforcement: "MANDATORY - cannot be bypassed"
```

**Success Criteria**:
- [ ] Hook runs before every action
- [ ] Failures block action (not just warn)
- [ ] Cannot be bypassed by urgency claims

---

### AUTO-02: Artifact TTL Enforcement [CRITICAL]

**Problem**: Stale artifacts poison context (Phase 1.3)

**Requirement**:
```yaml
artifact_ttl:
  tiers:
    tier_1_constitution:
      ttl: "permanent"
      validation: "read_only_check"
    
    tier_2_controlled:
      ttl: "permanent"
      validation: "full_consumption_required"
    
    tier_3_archival:
      ttl: "90_days"
      validation: "archive_if_stale"
    
    tier_4_ephemeral:
      ttl: "24_hours"
      validation: "ignore_if_stale"
  
  enforcement:
    on_load: "check_ttl_before_loading"
    on_stale: "warn_and_refresh OR archive"
```

**Success Criteria**:
- [ ] TTL checked before loading any artifact
- [ ] Stale artifacts trigger refresh or archive
- [ ] No stale context in active work

---

### AUTO-03: Automatic State Sync [HIGH]

**Problem**: LOOP_STATE drifts from reality (Phase 1.3)

**Requirement**:
```yaml
state_sync:
  external_file: "AGENT-STATE.yaml"
  sync_triggers:
    - step_completion
    - artifact_creation
    - delegation_event
    - user_confirmation
    - session_start
    - post_compact
  
  sync_content:
    workflow_position:
      workflow_id: string
      current_step: number
      step_status: enum[PENDING, IN_PROGRESS, COMPLETE]
    
    artifacts:
      created_this_session: string[]
      modified_this_session: string[]
    
    delegations:
      active: delegation[]
      completed: delegation[]
```

**Success Criteria**:
- [ ] State synced on every trigger event
- [ ] State reloaded on session start
- [ ] State reloaded after compact

---

### AUTO-04: Skill Auto-Loading [HIGH]

**Problem**: 31% skill utilization from discovery failure (Phase 1.2)

**Requirement**:
```yaml
skill_autoload:
  trigger: "intent_detection"
  
  intent_to_skill_map:
    implement: ["dev-story-enhanced", "test-driven-development"]
    review: ["code-review-enhanced", "verification-before-completion"]
    plan: ["writing-plans", "story-cycle"]
    debug: ["systematic-debugging"]
    refactor: ["architecture-remediation"]
  
  loading:
    max_concurrent: 3
    on_load: "announce_skill_loaded"
    on_complete: "unload_and_cache_output"
```

**Success Criteria**:
- [ ] Skills suggested based on intent
- [ ] Max 3 skills loaded at once
- [ ] Skill outputs cached, full skill unloaded

---

### AUTO-05: Context Trimming [HIGH]

**Problem**: 35% context consumed by framework (Phase 1.2)

**Requirement**:
```yaml
context_trimming:
  budget:
    total: 400_000
    framework_max: 40_000  # 10%
    alert_threshold: 320_000  # 80%
  
  priority_eviction:
    order:
      - historical_conversation  # Evict first
      - reference_documentation
      - unused_skills
      - old_file_contents
      - active_skill           # Evict last
  
  preservation:
    always_keep:
      - current_workflow_step
      - active_acceptance_criteria
      - governance_rules
      - current_file_edits
```

**Success Criteria**:
- [ ] Framework overhead < 10%
- [ ] Alert at 80% capacity
- [ ] Smart eviction preserves critical context

---

### AUTO-06: Workflow Auto-Progression [MEDIUM]

**Problem**: Agents lose position in workflows (Phase 1.1)

**Requirement**:
```yaml
workflow_progression:
  checkpoint:
    on: "step_completion"
    store_in: "AGENT-STATE.yaml"
  
  restoration:
    on: "session_start"
    action: "resume_from_last_checkpoint"
    prompt: "You were at step {N} of {workflow}. Continue?"
  
  visualization:
    show: "step_progress_bar"
    format: "[1] ✓ [2] ✓ [3] → [4] [ ] [5] [ ]"
```

**Success Criteria**:
- [ ] Position checkpointed on step completion
- [ ] Position restored on session start
- [ ] Visual progress indicator shown

---

### AUTO-07: Evidence Collection [MEDIUM]

**Problem**: False completions with no evidence (Phase 1.1)

**Requirement**:
```yaml
evidence_collection:
  required_for_completion:
    - typescript_check: "pnpm tsc --noEmit"
    - test_run: "pnpm vitest run"
    - e2e_test: "pnpm playwright test" (if applicable)
    - user_journey: "documented_walkthrough"
  
  evidence_storage:
    location: "_bmad-output/evidence/{story_id}/"
    format: "markdown with screenshots/logs"
  
  validation:
    before_marking_complete: "all_evidence_present"
    on_missing: "BLOCK completion"
```

**Success Criteria**:
- [ ] Evidence required for completion
- [ ] Evidence stored with story
- [ ] Missing evidence blocks completion

---

### AUTO-08: Stale Detection [MEDIUM]

**Problem**: Agents trust outdated information (Phase 1.3)

**Requirement**:
```yaml
stale_detection:
  checks:
    file_age:
      warn_at: "2_hours"
      block_at: "24_hours"
    
    git_status:
      check: "has_uncommitted_changes"
      action: "warn_of_potential_conflicts"
    
    content_hash:
      compare: "last_loaded vs current"
      action: "alert_if_different"
  
  response:
    on_stale: "refresh_context"
    on_conflict: "pause_and_ask_user"
```

**Success Criteria**:
- [ ] Files older than 2h trigger warning
- [ ] Files older than 24h blocked
- [ ] Content changes detected

---

### AUTO-09: Compact Detection [NICE-TO-HAVE]

**Problem**: Compact is silent catastrophe (Phase 1.3)

**Requirement**:
```yaml
compact_detection:
  indicators:
    - context_size_drop > 50%
    - missing_previously_loaded_content
    - summarized_history_detected
  
  response:
    on_detect: "trigger_post_compact_restore"
    restore_priority:
      1. governance_rules
      2. workflow_state
      3. delegation_chain
      4. active_skill
```

**Success Criteria**:
- [ ] Compact detected automatically
- [ ] Post-compact restore triggered
- [ ] Critical context reloaded

---

## Category 2: Enforcement Requirements (ENF)

These requirements ensure governance is enforced, not just documented.

### ENF-01: Gate Enforcement [CRITICAL]

**Problem**: 98.9% governance non-compliance (Phase 1.1)

**Requirement**:
```yaml
gate_enforcement:
  gates:
    story_start_gate:
      required:
        - story_file_exists
        - acceptance_criteria_defined
        - epic_context_loaded
        - architecture_alignment_checked
      on_fail: "BLOCK - Create story first"
    
    story_complete_gate:
      required:
        - all_acceptance_criteria_met
        - evidence_collected
        - code_reviewed
        - tests_passing
      on_fail: "BLOCK - Cannot mark complete"
  
  enforcement:
    bypass: "NEVER"
    override: "NEVER"
    log_attempts: true
```

**Success Criteria**:
- [ ] Gates cannot be bypassed
- [ ] Failures logged
- [ ] No completion without evidence

---

### ENF-02: Story Decomposition [HIGH]

**Problem**: Scope creep from undecomposed requests (Phase 1.1)

**Requirement**:
```yaml
story_decomposition:
  triggers:
    - estimated_effort > 4_hours
    - acceptance_criteria > 5
    - files_affected > 10
    - dependencies > 3
  
  decomposition:
    max_story_effort: "4_hours"
    max_acceptance_criteria: "5"
    require_dependency_map: true
  
  enforcement:
    on_trigger: "BLOCK until decomposed"
    output: "story_breakdown.md"
```

**Success Criteria**:
- [ ] Large requests blocked until decomposed
- [ ] Max 4h effort per story
- [ ] Dependencies mapped

---

### ENF-03: Dry Reading Enforcement [HIGH]

**Problem**: Implementation without reading existing code (Phase 1.1)

**Requirement**:
```yaml
dry_reading:
  required_before_implementation:
    - grep_affected_files: true
    - read_component_contracts: true
    - trace_data_flow: true
    - check_architecture_alignment: true
  
  minimum_commands:
    - 'grep -r "interface.*Props" src/'
    - 'grep -r "{entity_name}" src/'
    - 'read affected component files'
  
  enforcement:
    on_skip: "BLOCK implementation"
    evidence: "Document findings in story context"
```

**Success Criteria**:
- [ ] Dry reading required before code
- [ ] Findings documented
- [ ] Implementation blocked without evidence

---

### ENF-04: POC Detection [HIGH]

**Problem**: POC stubs marked as production complete (Phase 1.1)

**Requirement**:
```yaml
poc_detection:
  indicators:
    - "TODO" count > 5
    - "FIXME" present
    - "static display only"
    - no_api_calls
    - no_error_handling
    - hardcoded_data
  
  on_detect:
    action: "LABEL as POC"
    block_completion: true
    require: "production_story_created"
  
  labeling:
    in_file: "// POC: {reason}"
    in_story: "status: POC_ONLY"
```

**Success Criteria**:
- [ ] POC code automatically detected
- [ ] POC labeled in code and story
- [ ] POC cannot be marked complete

---

### ENF-05: Adversarial Review [MEDIUM]

**Problem**: Agents proceed with first interpretation (Phase 1.1)

**Requirement**:
```yaml
adversarial_review:
  trigger: "before any implementation"
  
  questions:
    - "What assumptions are you making?"
    - "What could break if assumptions are wrong?"
    - "What evidence supports your interpretation?"
    - "Have you read the actual implementation?"
  
  enforcement:
    require_answers: true
    log_assumptions: true
    validate_against_reality: true
```

**Success Criteria**:
- [ ] Assumptions challenged before code
- [ ] Evidence required for claims
- [ ] Assumptions logged for review

---

### ENF-06: Urgency Override Protection [MEDIUM]

**Problem**: Urgency claims bypass governance (Phase 1.1)

**Requirement**:
```yaml
urgency_protection:
  trigger_words: ["urgent", "ASAP", "emergency", "skip", "bypass"]
  
  response:
    acknowledge: "I understand this is urgent"
    reframe: "However, skipping validation causes more emergencies"
    offer: "FAST validation mode (5 min)"
  
  fast_validation:
    time_limit: "5_minutes"
    scope: "critical_path_only"
    documentation: "TODO comment mandatory"
    follow_up: "schedule proper validation within 24h"
  
  never_skip:
    - architecture_alignment
    - critical_path_test
    - security_check
```

**Success Criteria**:
- [ ] Urgency triggers detected
- [ ] FAST mode offered (not bypass)
- [ ] Critical checks never skipped

---

## Category 3: Context Management Requirements (CTX)

These requirements ensure context is managed efficiently.

### CTX-01: Compact-Resilient State [CRITICAL]

**Problem**: Governance lost after compact (Phase 1.3)

**Requirement**:
```yaml
compact_resilient_state:
  external_file: "AGENT-STATE.yaml"
  
  content:
    governance_snapshot:
      active_rules: string[]
      loaded_at: timestamp
    
    workflow_position:
      workflow_id: string
      current_step: number
      step_status: string
    
    delegation_chain:
      parent_id: string | null
      children: delegation[]
    
    skill_cache:
      loaded_skills: string[]
      skill_outputs: map<string, any>
  
  persistence:
    save_on: ["step_complete", "artifact_create", "user_confirm"]
    load_on: ["session_start", "post_compact"]
```

**Success Criteria**:
- [ ] State file persists across sessions
- [ ] State reloaded after compact
- [ ] Governance rules restored

---

### CTX-02: Context Budget Tracking [CRITICAL]

**Problem**: No visibility into context usage (Phase 1.2)

**Requirement**:
```yaml
context_budget:
  tracking:
    total_tokens: number
    by_category:
      framework: number
      skills: number
      history: number
      files: number
      reasoning: number
  
  display:
    format: "pie chart or bar"
    update: "real-time"
    alert_threshold: 80%
  
  enforcement:
    framework_max: 10%
    on_exceed: "evict_lowest_priority"
```

**Success Criteria**:
- [ ] Token usage visible
- [ ] Categories tracked
- [ ] Alerts at 80%

---

### CTX-03: Priority-Based Loading [HIGH]

**Problem**: Wrong context loaded first (Phase 1.3)

**Requirement**:
```yaml
priority_loading:
  priority_levels:
    P0_critical:
      - active_governance_rules
      - current_workflow_step
      - active_acceptance_criteria
      load: "always"
    
    P1_important:
      - current_skill
      - recent_history (5 messages)
      - active_file_edits
      load: "if_space"
    
    P2_nice_to_have:
      - reference_documentation
      - older_history
      - unused_skills
      load: "on_demand_only"
  
  eviction_order: "P2 first, P1 second, P0 never"
```

**Success Criteria**:
- [ ] Critical context always present
- [ ] Nice-to-have evicted first
- [ ] P0 never evicted

---

### CTX-04: Skill-on-Demand Loading [HIGH]

**Problem**: 82 skills waste context (Phase 1.2)

**Requirement**:
```yaml
skill_on_demand:
  default_loaded: 0
  max_concurrent: 5
  
  loading:
    trigger: "explicit_invoke OR intent_match"
    announce: "Loading skill: {name}"
    limit: "one at a time unless parallel"
  
  unloading:
    trigger: "skill_complete OR context_pressure"
    preserve: "output_only"
    cache_location: "skill_cache in AGENT-STATE.yaml"
  
  suggestions:
    based_on: "intent_detection"
    format: "Would you like me to load {skill}?"
```

**Success Criteria**:
- [ ] No skills pre-loaded
- [ ] Max 5 concurrent skills
- [ ] Skill outputs cached

---

### CTX-05: Structured Summarization [MEDIUM]

**Problem**: Compact summarization loses nuance (Phase 1.3)

**Requirement**:
```yaml
structured_summary:
  preserve:
    exact_numbers:
      - file_counts
      - line_numbers
      - token_counts
      - percentages
    
    specific_identifiers:
      - file_paths
      - story_ids
      - epic_ids
      - error_codes
    
    decisions:
      - architectural_choices
      - governance_decisions
      - user_confirmations
  
  format:
    use: "structured_yaml NOT prose"
    example: |
      session_summary:
        stories_worked: ["UXUI-03-05", "UXUI-03-06"]
        files_modified: ["src/components/X.tsx", "src/hooks/Y.ts"]
        decisions: ["Used Zustand over Context", "Chose mobile-first"]
        blockers: ["Terminal POC not ready"]
```

**Success Criteria**:
- [ ] Exact values preserved
- [ ] Identifiers not generalized
- [ ] Decisions explicitly recorded

---

### CTX-06: Incremental Context Refresh [MEDIUM]

**Problem**: Full reloads on every session (Phase 1.1)

**Requirement**:
```yaml
incremental_refresh:
  on_session_start:
    check: "what_changed_since_last_session"
    load: "only_changed_artifacts"
    preserve: "cached_unchanged_content"
  
  change_detection:
    method: "content_hash_comparison"
    store: "last_seen_hashes in AGENT-STATE.yaml"
  
  optimization:
    if_no_changes: "use_cached"
    if_changes: "load_diff_only"
```

**Success Criteria**:
- [ ] Only changed content reloaded
- [ ] Cached content preserved
- [ ] Faster session starts

---

## Category 4: Agent Coordination Requirements (COORD)

These requirements ensure multi-agent coordination works.

### COORD-01: Delegation Tracking [CRITICAL]

**Problem**: Delegation chains break on compact (Phase 1.3)

**Requirement**:
```yaml
delegation_tracking:
  external_storage: "AGENT-STATE.yaml"
  
  parent_record:
    task_id: string
    child_agent: string
    expected_output: string
    callback_path: string
    sent_at: timestamp
  
  child_handoff:
    location: "_bmad-output/handoffs/{date}/"
    format: "handoff-{task_id}-{agent}.md"
    content:
      parent_id: string
      task_id: string
      status: enum[COMPLETE, FAILED, BLOCKED]
      artifacts: string[]
      next_steps: string[]
  
  restoration:
    on: "parent_session_resume"
    action: "scan_handoffs_for_pending"
    merge: "child_results → parent_state"
```

**Success Criteria**:
- [ ] Delegations tracked externally
- [ ] Handoffs discoverable
- [ ] Parent state restored from handoffs

---

### COORD-02: File Locking [HIGH]

**Problem**: No mechanism to prevent conflicts (Phase 1.1)

**Requirement**:
```yaml
file_locking:
  lock_on: "edit_start"
  unlock_on: "edit_complete OR timeout"
  
  lock_record:
    location: "AGENT-STATE.yaml"
    content:
      file_path: string
      locked_by: string
      locked_at: timestamp
      timeout: duration
  
  conflict_handling:
    on_lock_conflict: "BLOCK and notify"
    notification: "File {path} is locked by {agent}. Wait or escalate?"
    escalation: "Force unlock after 30 minutes"
```

**Success Criteria**:
- [ ] Locks prevent concurrent edits
- [ ] Conflicts detected immediately
- [ ] Timeout prevents deadlocks

---

### COORD-03: Shared State Registry [HIGH]

**Problem**: No shared state for coordination (Phase 1.1)

**Requirement**:
```yaml
shared_state:
  registry_location: "AGENT-STATE.yaml"
  
  shared_items:
    active_documents:
      path: string
      opened_by: string
      mode: enum[READ, EDIT]
    
    active_workflows:
      workflow_id: string
      agent: string
      step: number
    
    pending_delegations:
      task_id: string
      from: string
      to: string
      status: string
  
  access:
    read: "all_agents"
    write: "owner_only"
    conflict_resolution: "last_write_wins with log"
```

**Success Criteria**:
- [ ] Agents can see what others are doing
- [ ] Conflicts logged
- [ ] State centralized

---

### COORD-04: Event Schema Contracts [MEDIUM]

**Problem**: No event contracts between agents (Phase 1.1)

**Requirement**:
```yaml
event_contracts:
  schema_location: "_bmad-ext/schemas/events/"
  
  event_types:
    task_delegated:
      from: string
      to: string
      task_id: string
      payload: any
    
    task_completed:
      task_id: string
      status: string
      artifacts: string[]
    
    file_modified:
      path: string
      by: string
      action: enum[CREATE, UPDATE, DELETE]
  
  validation:
    before_emit: "validate_against_schema"
    on_invalid: "REJECT with error"
```

**Success Criteria**:
- [ ] Events have defined schemas
- [ ] Invalid events rejected
- [ ] Contracts documented

---

### COORD-05: Capability Declarations [MEDIUM]

**Problem**: No visibility into agent capabilities (Phase 1.1)

**Requirement**:
```yaml
capability_declarations:
  per_agent:
    agent_id: string
    capabilities:
      - name: string
        description: string
        input_schema: object
        output_schema: object
    
    constraints:
      - max_file_size: number
      - supported_languages: string[]
      - requires_mcp: string[]
  
  discovery:
    location: "AGENT-STATE.yaml"
    query: "which agent can {capability}?"
    response: "agent_id with best match"
```

**Success Criteria**:
- [ ] Capabilities declared per agent
- [ ] Capabilities discoverable
- [ ] Best agent for task findable

---

### COORD-06: Conflict Detection [NICE-TO-HAVE]

**Problem**: Conflicts not detected until too late (Phase 1.1)

**Requirement**:
```yaml
conflict_detection:
  pre_save:
    check: "content_hash vs expected"
    on_mismatch: "ALERT - file changed externally"
  
  during_edit:
    monitor: "file_watcher"
    on_external_change: "pause_and_notify"
  
  resolution:
    options:
      - merge: "attempt_auto_merge"
      - theirs: "discard_my_changes"
      - mine: "overwrite_their_changes"
      - manual: "pause_for_human"
```

**Success Criteria**:
- [ ] Conflicts detected before save
- [ ] External changes monitored
- [ ] Resolution options provided

---

## Priority Summary

### Critical (P0) - Must Have for MVP

| ID | Requirement | Category |
|----|-------------|----------|
| AUTO-01 | Pre-Execution Hooks | Automation |
| AUTO-02 | Artifact TTL Enforcement | Automation |
| ENF-01 | Gate Enforcement | Enforcement |
| CTX-01 | Compact-Resilient State | Context |
| CTX-02 | Context Budget Tracking | Context |
| COORD-01 | Delegation Tracking | Coordination |

### High (P1) - Should Have

| ID | Requirement | Category |
|----|-------------|----------|
| AUTO-03 | Automatic State Sync | Automation |
| AUTO-04 | Skill Auto-Loading | Automation |
| AUTO-05 | Context Trimming | Automation |
| ENF-02 | Story Decomposition | Enforcement |
| ENF-03 | Dry Reading Enforcement | Enforcement |
| ENF-04 | POC Detection | Enforcement |
| CTX-03 | Priority-Based Loading | Context |
| CTX-04 | Skill-on-Demand Loading | Context |
| COORD-02 | File Locking | Coordination |
| COORD-03 | Shared State Registry | Coordination |

### Medium (P2) - Nice to Have

| ID | Requirement | Category |
|----|-------------|----------|
| AUTO-06 | Workflow Auto-Progression | Automation |
| AUTO-07 | Evidence Collection | Automation |
| AUTO-08 | Stale Detection | Automation |
| ENF-05 | Adversarial Review | Enforcement |
| ENF-06 | Urgency Override Protection | Enforcement |
| CTX-05 | Structured Summarization | Context |
| CTX-06 | Incremental Context Refresh | Context |
| COORD-04 | Event Schema Contracts | Coordination |
| COORD-05 | Capability Declarations | Coordination |

### Nice-to-Have (P3)

| ID | Requirement | Category |
|----|-------------|----------|
| AUTO-09 | Compact Detection | Automation |
| COORD-06 | Conflict Detection | Coordination |

---

## Implementation Roadmap

### Phase 2.1: Foundation (Week 1)
- CTX-01: Compact-Resilient State
- CTX-02: Context Budget Tracking
- AUTO-01: Pre-Execution Hooks

### Phase 2.2: Enforcement (Week 2)
- ENF-01: Gate Enforcement
- AUTO-02: Artifact TTL Enforcement
- ENF-03: Dry Reading Enforcement

### Phase 2.3: Coordination (Week 3)
- COORD-01: Delegation Tracking
- COORD-02: File Locking
- COORD-03: Shared State Registry

### Phase 2.4: Optimization (Week 4)
- AUTO-03: Automatic State Sync
- CTX-03: Priority-Based Loading
- CTX-04: Skill-on-Demand Loading

---

## Conclusion

These 27 requirements represent the complete specification for OpenCode Native "Beast Mode." Implementing the 6 Critical (P0) requirements alone would increase the Reality Score from 35-40% to an estimated 70-80%.

**The key insight**: Most requirements are about automation and enforcement. BMAD already documents these concepts - OpenCode Native must actually implement them.

---

**Document Version**: 1.0.0
**Created**: 2026-01-28
**Authors**: analyst-ext, architect-ext, tech-writer-ext
**Status**: COMPLETE

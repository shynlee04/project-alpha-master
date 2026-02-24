---
name: "staging-by-phase-governance"
type: "governance-policy"
description: "Govern feature unlocking by phase rather than sprint"
version: "1.0.0"
critical: true
---

# Staging by Phase Governance

**description**: Govern feature rollout using phased stages instead of sprint-based unlocking to prevent premature complexity.

## Problem Statement

Sprint-based feature unlocking causes:
- **Premature complexity**: Features enabled before dependencies are ready
- **Overwhelming agents**: Too many features active simultaneously
- **Testing burden**: Can't validate all combinations
- **Rollback difficulty**: Multiple changes bundled together

**Better approach**: Phase-based staging with clear dependency chains.

## Governance Framework

### 1. Phase Definition

```yaml
phases:
  - name: "phase-0-foundation"
    description: "Governance and scanning infrastructure"
    status: "{locked|unlocked|complete}"
    prerequisites: []
    features:
      - context-first-workflow
      - expert-analysis-workflow
      - research-trigger-workflow
      - artifact-scanner
      - domain-scanner
      - agent-rag-scanner

    unlock_criteria:
      - all_scanners_operational: true
      - governance_workflows_executable: true
      - artifact_registry_created: true

    risks_if_unlocked_prematurely:
      - "No context validation before development"
      - "Untracked tool CRUD operations"
      - "Stale artifacts poisoning context"

  - name: "phase-1-consolidation"
    description: "Merge legacy governance, establish workflows"
    status: "{locked|unlocked|complete}"
    prerequisites: [phase-0-foundation]
    features:
      - governance-module-consolidation
      - story-cycle-workflow
      - sprint-status-integration
      - workflow-status-integration

    unlock_criteria:
      - phase_0_complete: true
      - legacy_modules_archived: true
      - new_governance_operational: true

    risks_if_unlocked_prematurely:
      - "Working with fragmented governance"
           - "No tracking of story progress"
      - "Workflow status inconsistent"

  - name: "phase-2-execution"
    description: "Story execution and development workflows"
    status: "{locked|unlocked|complete}"
    prerequisites: [phase-1-consolidation]
    features:
      - full-story-cycle
      - orchestrator-routing
      - development-workflows
      - test-execution

    unlock_criteria:
      - phase_1_complete: true
      - sprint_status_connected: true
      - story_templates_created: true

    risks_if_unlocked_prematurely:
      - "Development without proper tracking"
      - "Orchestrator routing broken"
      - "Tests not connected to stories"

  - name: "phase-3-remediation"
    description: "Correct-course and architectural fixes"
    status: "{locked|unlocked|complete}"
    prerequisites: [phase-2-execution]
    features:
      - correct-course-workflow
      - quick-patch-workflow
      - feature-fix-workflow
      - architectural-conflict-workflow
      - store-refactorer-agent
      - component-splitter-agent

    unlock_criteria:
      - phase_2_complete: true
      - development_workflow_stable: true
      - remediation_categories_defined: true

    risks_if_unlocked_prematurely:
      - "Remediation without stable development"
      - "Unclear categorization of issues"
      - "Agents not properly configured"

  - name: "phase-4-enhancement"
    description: "Advanced features and optimizations"
    status: "{locked|unlocked|complete}"
    prerequisites: [phase-3-remediation]
    features:
      - performance-optimization
      - advanced-rag-features
      - multimodal-enhancements
      - custom-workflows

    unlock_criteria:
      - phase_3_complete: true
      - core_stable: true
      - no_p0_bugs: true

    risks_if_unlocked_prematurely:
      - "Optimizing unstable foundation"
      - "Feature creep before stability"
```

### 2. Feature Unlocking Protocol

```yaml
unlock_protocol:
  request:
    - feature: "{feature_name}"
      phase: "{target_phase}"
      justification: "{why needed now}"

  evaluation:
    - check_prerequisites_complete
    - verify_unlock_criteria_met
    - assess_risk_if_premature

  decision:
    - approve: "enable feature"
    - deny: "explain which prerequisites incomplete"
    - defer: "not risky but not priority"

  activation:
    - update_phase_status
    - enable_feature_in_config
    - notify_dependent_workflows
    - create_activation_log
```

### 3. Dependency Management

```yaml
dependency_graph:
  phase-0-foundation:
    required_by: [all_phases]
    blocking: "EVERYTHING"

  phase-1-consolidation:
    requires: [phase-0-foundation]
    required_by: [phase-2, phase-3, phase-4]

  phase-2-execution:
    requires: [phase-0-foundation, phase-1-consolidation]
    required_by: [phase-3, phase-4]

  phase-3-remediation:
    requires: [phase-0-foundation, phase-1-consolidation, phase-2-execution]
    required_by: [phase-4]

  phase-4-enhancement:
    requires: [all_previous_phases]
    required_by: []
```

### 4. Rollback Protocol

```yaml
rollback_protocol:
  trigger:
    - critical_bug_found: true
    - unexpected_bloated: true
    - dependency_breakage: true

  process:
    - identify_affected_features
    - disable_phase_features
    - restore_previous_state
    - document_rollback_reason

  prevention:
    - enable_features_incrementally
    - test_before_full_activation
    - monitor_after_unlock
```

### 5. Phase Status Tracking

```yaml
phase_status:
  phase-0-foundation:
    status: "unlocked"
    unlocked_at: "{timestamp}"
    features_active: [list]
    issues: [blocking problems]
    next_phase_eligible: {yes|no}

  gate_check:
    criteria_met: [count] / [total]
    blocking_issues: [count]
    recommendation: "{proceed|wait|rollback}"
```

### 6. Quality Gates

```yaml
quality_gates:
  foundation_complete:
    - governance_workflows_executable: true
    - all_scanners_operational: true
    - artifact_registry_active: true
    - no_critical_bugs: true

  consolidation_complete:
    - legacy_archived: true
    - new_structure_operational: true
    - status_files_connected: true
    - handoff_protocol_working: true

  execution_complete:
    - story_cycle_working: true
    - sprint_tracking_active: true
    - orchestrator_routing: true
    - test_coverage_adequate: true

  remediation_complete:
    - all_categories_defined: true
    - agents_configured: true
    - sub_workflows_executable: true
    - governance_integration: true

  enhancement_complete:
    - core_stable: true
    - performance_acceptable: true
    - no_debt_over_threshold: true
```

## Integration

**Used By**: All workflows and feature activation

**Monitored By**: agent-rag-scanner (staging analysis)

**Output**: Phase status registry and activation logs

## Phase Transition Flow

```
┌─────────────────────────────────────────────────────────┐
│              PHASE TRANSITION PROTOCOL                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Current Phase Complete                                 │
│    ↓                                                     │
│  Check Quality Gates                                    │
│    ↓                                                     │
│  All Gates Passed?                                      │
│    ├─ NO → Fix Issues, Recheck                          │
│    └─ YES → Continue                                    │
│    ↓                                                     │
│  Verify Prerequisites for Next Phase                    │
│    ↓                                                     │
│  Assess Risk of Unlocking                               │
│    ↓                                                     │
│  Request User Approval                                  │
│    ├─ DENY → Document Reason, Stay in Current Phase     │
│    └─ APPROVE → Unlock Next Phase                       │
│    ↓                                                     │
│  Enable Features Gradually                              │
│    ↓                                                     │
│  Monitor for Issues                                     │
│    ├─ PROBLEMS → Rollback, Investigate                  │
│    └─ STABLE → Mark Phase Complete                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Critical Priority

Phase-based staging is HIGH PRIORITY:
- Prevents premature complexity
- Ensures dependencies are ready
- Enables controlled rollout
- Makes rollback straightforward

**NEVER unlock a phase before prerequisites are complete.**

# Comprehensive Remediation Workflow

**Workflow ID**: WF-ARCH-001
**Module**: Architecture Refactoring (MOD-B-ARCH)
**Governance Tier**: Tier 3 (Archival)
**TTL**: 90 days
**Created**: 2026-01-06
**Orchestrator**: Master Architect

---

## description

Systematically eliminate technical debt through deep scanning, prioritized remediation, and validated improvements. This workflow orchestrates the full remediation cycle from problem identification to health score validation.

---

## Workflow Overview

```yaml
workflow_type: "iterative_remediation_cycle"
duration: "4-8 hours per full cycle"
frequency: "Weekly"
autonomy: "85% autonomous (Master Architect)"

phases:
  1. "Deep-Scan Phase" (30-60 min)
  2. "Analysis Phase" (30-60 min)
  3. "Remediation Phase" (2-4 hours)
  4. "Validation Phase" (30-60 min)
  5. "Documentation Phase" (30-60 min)
```

---

## Phase 1: Deep-Scan Execution

**description**: Run all 7 quality scanners to identify technical debt

```yaml
deep_scan_phase:
  duration: "30-60 minutes"
  parallel_execution: "Scanners 1-3 can run in parallel"

  scanners:
    # Priority: P0 (always run first)
    1. security_scanner:
       description: "Secret leaks, XSS vulnerabilities"
       trigger: "Every remediation cycle"
       file: ".claude/agents/deep-scan-security-scanner.md"
       output: "artifacts/security-scan-report.md"
       critical_issues: ["secret_leaks", "xss_vulnerabilities", "unsafe_file_ops"]

    # Can run in parallel with security_scanner
    2. state_scanner:
       description: "God store detection (>300 lines)"
       trigger: "Every remediation cycle"
       file: ".claude/agents/deep-scan-state-scanner.md"
       output: "artifacts/state-scan-report.md"
       critical_issues: ["god_stores_500plus", "god_stores_300plus"]

    3. architecture_scanner:
       description: "God components, layer violations"
       trigger: "Every remediation cycle"
       file: ".claude/agents/deep-scan-architecture-scanner.md"
       output: "artifacts/architecture-scan-report.md"
       critical_issues: ["god_components_300plus", "layer_violations"]

    # Run after primary issues addressed
    4. types_scanner:
       description: "Type safety enforcement"
       trigger: "Every remediation cycle"
       file: ".claude/agents/deep-scan-types-scanner.md"
       output: "artifacts/types-scan-report.md"
       critical_issues: ["typescript_errors_code", "any_types", "type_suppressions"]

    5. ux_scanner:
       description: "i18n compliance, accessibility"
       trigger: "Every remediation cycle"
       file: ".claude/agents/deep-scan-ux-scanner.md"
       output: "artifacts/ux-scan-report.md"
       critical_issues: ["hardcoded_strings", "i18n_violations", "accessibility_issues"]

    # Weekly only (not every cycle)
    6. performance_scanner:
       description: "Bundle bloat, render waste"
       trigger: "Weekly"
       file: ".claude/agents/deep-scan-performance-scanner.md"
       output: "artifacts/performance-scan-report.md"
       critical_issues: ["bundle_bloat", "render_waste", "missing_lazy_loading"]

    7. workspace_scanner:
       description: "Cross-workspace integration"
       trigger: "On workspace changes"
       file: ".claude/agents/deep-scan-workspace-scanner.md"
       output: "artifacts/workspace-scan-report.md"
       critical_issues: ["cross_workspace_leaks", "event_isolation_violations"]
```

**Execution Protocol**:

```yaml
execution_order:
  step_1_parallel_scan:
    scanners: [security_scanner, state_scanner, architecture_scanner]
    command: |
      echo "▶️ [1/7] Running security, state, and architecture scanners in parallel..."
      # Master Architect delegates to each scanner agent
    duration: "10-15 minutes"

  step_2_analyze_p0:
    action: "Check for P0 critical issues"
    if_found: "STOP and notify BMAD-Core-Master immediately"
    p0_issues:
      - "Secret leaks (CRITICAL)"
      - "God stores >500 lines"
      - "TypeScript errors in code files"
      - "Tier 1 document modification"

  step_3_secondary_scan:
    scanners: [types_scanner, ux_scanner]
    command: |
      echo "▶️ [4/7] Running types and UX scanners..."
      # Continue after P0 issues addressed
    duration: "10-15 minutes"

  step_4_optional_scan:
    scanners: [performance_scanner]
    condition: "If weekly scan scheduled"
    command: |
      echo "▶️ [6/7] Running performance scanner (weekly)..."
    duration: "15-20 minutes"

  step_5_workspace_scan:
    scanners: [workspace_scanner]
    condition: "If workspace changes detected"
    command: |
      echo "▶️ [7/7] Running workspace scanner..."
    duration: "5-10 minutes"
```

---

## Phase 2: Analysis & Prioritization

**description**: Aggregate findings, prioritize by health impact, generate remediation plan

```yaml
analysis_phase:
  duration: "30-60 minutes"
  input: "All scanner outputs from Phase 1"

  aggregation:
    1. "Load all scanner reports"
    2. "Extract issues by priority (P0, P1, P2)"
    3. "Categorize by issue type"
    4. "Count issues per category"
    5. "Estimate health impact per issue"

  prioritization_algorithm:
    1. "Group related issues (e.g., all god stores)"
    2. "Estimate fix time per issue"
    3. "Calculate health improvement per fix"
    4. "Sort by health impact / fix time ratio"
    5. "Generate prioritized task list"

  priority_matrix:
    P0_CRITICAL:
      issues:
        - "God store >500 lines"
        - "TypeScript errors in code files"
        - "Secret leaks"
        - "Tier 1 document modification"
      autonomy: "AUTONOMOUS_WITH_IMMEDIATE_ACTION"
      notification: "NOTIFY_BMAD_CORE_MASTER"
      time_box: "15 minutes per issue"
      health_impact: "HIGH (20-30 points each)"

    P1_HIGH:
      issues:
        - "God store 300-500 lines"
        - "Component >300 lines"
        - "Type suppressions >5"
        - "i18n violations >10"
      autonomy: "AUTONOMOUS_ROUTING"
      notification: "LOG_ONLY"
      time_box: "30 minutes per issue"
      health_impact: "MEDIUM (10-20 points each)"

    P2_MEDIUM:
      issues:
        - "Component 200-300 lines"
        - "Test coverage <80%"
        - "Accessibility violations"
        - "Performance optimization"
      autonomy: "SCHEDULE_IN_NEXT_STORY"
      notification: "NONE"
      time_box: "60 minutes per issue"
      health_impact: "LOW (5-10 points each)"

  output_artifact:
    file: "artifacts/remediation-plan-{date}.md"
    structure:
      - "Executive summary (issues found, health impact)"
      - "Prioritized task list (P0 > P1 > P2)"
      - "Estimated total fix time"
      - "Projected health score improvement"
      - "Resource allocation (which specialist agent)"
      - "Acceptance criteria for each task"
```

**Example Remediation Plan**:

```yaml
remediation_plan_example:
  date: "2026-01-06"
  baseline_health: 72%

  issues_found:
    P0: 3
    P1: 8
    P2: 15
    total: 26

  prioritized_tasks:
    - priority: "P0"
      task: "Split rag-store.ts (1595 lines)"
      specialist: "store-refactorer"
      estimated_time: "45 minutes"
      health_impact: "+25 points"
      acceptance: "All slices ≤120 lines, zero TypeScript errors"

    - priority: "P0"
      task: "Fix 127 TypeScript errors in code files"
      specialist: "typescript-fixer"
      estimated_time: "30 minutes"
      health_impact: "+15 points"
      acceptance: "Zero TypeScript errors in code files"

    - priority: "P1"
      task: "Split AgentConfigDialog.tsx (1089 lines)"
      specialist: "component-splitter"
      estimated_time: "30 minutes"
      health_impact: "+12 points"
      acceptance: "Component ≤300 lines, extracted hooks and sub-components"

  projected_health_after: "97% (improvement of +25 points)"
  total_estimated_time: "3 hours"
```

---

## Phase 3: Remediation Execution

**description**: Execute prioritized fixes via specialist agents

```yaml
remediation_phase:
  duration: "2-4 hours (depends on issue count)"
  strategy: "Execute P0 first, then P1, skip P2 for next cycle"

  execution_protocol:
    for_each_task:
      1. "Load task details from remediation plan"
      2. "Create handoff artifact for specialist agent"
      3. "Route to appropriate specialist"
      4. "Monitor execution progress"
      5. "Validate completion with acceptance criteria"
      6. "Re-run specific scanner to verify fix"
      7. "Update health metrics"
      8. "Move to next task"

  specialist_routing:
    god_store_detected:
      condition: "store >300 lines"
      route_to: "store-refactorer"
      handoff_artifact: "artifacts/handoffs/store-refactoring-{timestamp}.md"
      acceptance:
        - "All slices ≤120 lines"
        - "Combined store ≤300 lines"
        - "Zero TypeScript errors"
        - "All imports still work"
      validation: "Re-run state_scanner"

    god_component_detected:
      condition: "component >300 lines"
      route_to: "component-splitter"
      handoff_artifact: "artifacts/handoffs/component-splitting-{timestamp}.md"
      acceptance:
        - "Component ≤300 lines"
        - "Custom hooks ≤150 lines"
        - "Zero breaking changes"
        - "Test coverage ≥80%"
      validation: "Re-run architecture_scanner"

    typescript_errors:
      condition: "errors in code files"
      route_to: "typescript-fixer"
      handoff_artifact: "artifacts/handoffs/typescript-fixing-{timestamp}.md"
      acceptance:
        - "Zero TypeScript errors in code files"
        - "Test file errors documented"
        - "No any types added"
      validation: "Run pnpm typecheck"

    workspace_issues:
      condition: "cross-workspace leaks, sync failures"
      route_to: "workspace-architect"
      handoff_artifact: "artifacts/handoffs/workspace-e2e-{timestamp}.md"
      acceptance:
        - "Zero cross-workspace leaks"
        - "Zero event isolation violations"
        - "File sync working correctly"
      validation: "Re-run workspace_scanner"

    security_issues:
      condition: "secret leaks, XSS vulnerabilities"
      route_to: "NONE (BLOCK)"
      action: "NOTIFY_BMAD_CORE_MASTER and human immediately"
      acceptance: "Security audit required"
      validation: "Manual review required"

  time_boxing:
    P0_issues: "15 minutes per task"
    P1_issues: "30 minutes per task"

    on_timeout:
      action: "Split task into smaller sub-tasks"
      notification: "Log timeout, adjust plan"
      continuation: "Continue with sub-tasks"

  progress_tracking:
    - "Tasks completed"
    - "Tasks remaining"
    - "Health score improvement"
    - "Time spent vs estimated"
    - "Specialist agent performance"
```

**Handoff Template**:

```yaml
handoff_template:
  to_agent: "{specialist_agent}"
  from_agent: "master-architect"
  task_id: "{task_id}"
  timestamp: "{ISO_timestamp}"

  task:
    objective: "{brief description}"
    context: |
      {scanner_output}
      {issue_details}
      {health_impact}

  constraints:
    - "Size limits (stores ≤300 lines, components ≤300 lines)"
    - "Zero breaking changes (maintain backward compatibility)"
    - "Zero TypeScript errors (in code files)"
    - "Test coverage ≥80%"

  acceptance_criteria:
    - "{criterion_1}"
    - "{criterion_2}"
    - "{criterion_3}"

  validation:
    scanner_to_rerun: "{scanner_name}"
    expected_outcome: "{what scanner should find after fix}"

  artifacts:
    - "{scanner_report}"
    - "{remediation_plan}"

  next_action: "Execute fix and report completion"
```

---

## Phase 4: Validation & Verification

**description**: Verify improvements, re-scan to validate health score increase

```yaml
validation_phase:
  duration: "30-60 minutes"
  input: "All completed remediation tasks"

  verification_protocol:
    1. "Re-run all affected scanners"
    2. "Verify issues are resolved"
    3. "Check for regressions (new issues introduced)"
    4. "Calculate health score improvement"
    5. "Generate validation report"

  rescanning:
    affected_scanners: "Re-run only scanners for issues fixed"
    example:
      fixed_god_stores: "Re-run state_scanner"
      fixed_components: "Re-run architecture_scanner"
      fixed_typescript_errors: "Re-run types_scanner"

    validation_commands:
      state_scanner: |
        wc -l src/infrastructure/persistence/stores/**/*.ts
        # Verify all stores ≤300 lines

      types_scanner: |
        pnpm typecheck
        # Verify zero TypeScript errors

      architecture_scanner: |
        wc -l src/components/**/*.tsx
        # Verify all components ≤300 lines

  regression_detection:
    check_for:
      - "New god stores created"
      - "New god components created"
      - "TypeScript errors introduced"
      - "Breaking changes"
      - "Test coverage decreased"

    if_regression_detected:
      action: "Analyze root cause, fix immediately"
      notification: "Log regression, adjust specialist instructions"

  health_score_calculation:
    baseline: "Health score before remediation"
    current: "Health score after remediation"
    improvement: "current - baseline"
    target: "95%+"

    dimensions:
      state_management: "Recalculate based on god store count"
      component_architecture: "Recalculate based on god component count"
      type_safety: "Recalculate based on TypeScript errors"
      code_quality: "Recalculate based on i18n, accessibility"
      performance: "Recalculate based on bundle size, render waste"

    overall_health: "Weighted average of all dimensions"

  validation_output:
    file: "artifacts/post-remediation-scan-{date}.md"
    includes:
      - "Issues resolved (count)"
      - "Regressions detected (count)"
      - "Health score before vs after"
      - "Verification of each acceptance criterion"
      - "Recommendations for next cycle"
```

---

## Phase 5: Documentation & AGENTS.md Update

**description**: Document architecture decisions, update AGENTS.md with new patterns

```yaml
documentation_phase:
  duration: "30-60 minutes"
  description: "Preserve knowledge and update project documentation"

  architecture_decision_records:
    when_to_create:
      - "Significant architecture changes (store refactoring)"
      - "New patterns established (component extraction)"
      - "Technology decisions (TypeScript strict mode)"
      - "Performance optimizations"

    adr_template:
      file: "_bmad/output/adrs/adr-{id}-{title}.md"
      structure:
        - "Status (Accepted | Deprecated | Superseded)"
        - "Context (What is the problem?)"
        - "Decision (What was chosen?)"
        - "Consequences (What does this mean?)"
        - "Alternatives considered"

  agents_md_updates:
    when_to_update:
      - "New code patterns established"
      - "File structure changes"
      - "Import path changes"
      - "New conventions adopted"

    update_sections:
      - "State Management Architecture"
      - "Agent Configuration"
      - "Key Directories"
      - "Troubleshooting"

    update_protocol:
      1. "Identify new patterns (e.g., new store structure)"
      2. "Document in AGENTS.md"
      3. "Update examples if needed"
      4. "Update file paths if changed"
      5. "Maintain backward compatibility notes"

  quality_metrics_update:
    file: "_bmad-output/sprint-artifacts/arc-sprint-status.yaml"
    updates:
      - "Current health score"
      - "Issues resolved this cycle"
      - "Technical debt reduced"
      - "God stores eliminated"
      - "TypeScript errors fixed"

  retrospective:
    questions:
      - "What went well this cycle?"
      - "What could be improved?"
      - "Any surprises or unexpected issues?"
      - "Lessons learned for next cycle?"

    output: "artifacts/remediation-retrospective-{date}.md"
```

---

## State Management

### AGENT-STATE.yaml Updates

```yaml
# Master Architect updates these sections during workflow

progress:
  remediation_cycles_completed: {increment}
  issues_resolved: {increment}
  health_improvement: {track cumulative improvement}

current_remediation:
  cycle_id: "{cycle_id}"
  phase: "deep-scan | analysis | remediation | validation | documentation"
  active_task: "{current task}"
  specialist_agent: "{agent handling task}"
  validation_pending: true/false

architecture_health:
  overall_health: {recalculate after each cycle}
  state_management: {score from 0-100}
  component_architecture: {score from 0-100}
  type_safety: {score from 0-100}
  code_quality: {score from 0-100}
  performance: {score from 0-100}
```

---

## Error Handling & Recovery

```yaml
error_scenarios:
  scanner_failed:
    action: "Retry scanner once, log error"
    recovery: "If still failing, skip scanner, document issue"

  specialist_agent_unavailable:
    action: "Queue task, retry in 5 minutes"
    recovery: "If 3 retries fail, notify BMAD-Core-Master"

  regression_detected:
    action: "PAUSE remediation, investigate root cause"
    recovery: "Rollback last change, re-scan, adjust approach"

  health_score_degraded:
    action: "PAUSE remediation immediately"
    recovery: "Investigate cause, adjust strategy"

  time_box_exceeded:
    action: "Split task into smaller sub-tasks"
    recovery: "Re-prioritize, continue with sub-tasks"
```

---

## Success Criteria

✅ **All 7 scanners executed successfully**
✅ **Issues prioritized by health impact (P0 > P1 > P2)**
✅ **P0 issues resolved within 24 hours**
✅ **Health score improvement ≥10 points per cycle**
✅ **Zero regressions introduced**
✅ **All acceptance criteria met**
✅ **AGENTS.md updated with new patterns**
✅ **Comprehensive documentation created**

---

## Quality Metrics

### Remediation Success

- **Target**: 95% health score
- **Measurement**: Post-remediation scan vs baseline
- **Current**: Tracked in AGENT-STATE.yaml

### Technical Debt Reduction

- **Target**: 100% god store elimination
- **Measurement**: Store count, size distribution
- **Target**: 100% god component elimination
- **Measurement**: Component count, size distribution

### TypeScript Compliance

- **Target**: 0 errors in code files
- **Measurement**: `pnpm typecheck` exit code
- **Status**: Test files excluded (non-blocking)

---

## Example End-to-End Execution

```yaml
example_cycle:
  date: "2026-01-06"
  duration: "3 hours 15 minutes"

  phase_1_deep_scan:
    duration: "45 minutes"
    scanners_run: 7
    issues_found: 26 (P0: 3, P1: 8, P2: 15)

  phase_2_analysis:
    duration: "30 minutes"
    prioritized_tasks: 11 (P0: 3, P1: 8)
    estimated_health_improvement: "+25 points"

  phase_3_remediation:
    duration: "2 hours"
    tasks_completed: 11
    specialist_agents_used:
      - "store-refactorer: 2 tasks"
      - "typescript-fixer: 1 task"
      - "component-splitter: 8 tasks"

  phase_4_validation:
    duration: "30 minutes"
    issues_resolved: 11
    regressions: 0
    health_before: 72%
    health_after: 97%
    improvement: "+25 points"

  phase_5_documentation:
    duration: "30 minutes"
    artifacts_created: 5
    agents_md_updated: true

  outcome: "✅ SUCCESS - Target health score achieved"
```

---

**Workflow Status**: ✅ ACTIVE - Ready for execution
**Orchestrator**: Master Architect
**Autonomy Level**: 85%
**Next Action**: Execute Phase 1 (Deep-Scan)
**Frequency**: Weekly
**Expected Outcome**: 95% health score achievement


---
name: "gating-policy"
type: "governance-policy"
description: "Define gating policy for workflow transitions"
version: "1.0.0"
lastUpdated: "2026-01-14"
---

# Gating Policy

**description**: Define when gates are required, how they're evaluated, and what happens on failure.

## Gate Philosophy

**Principle**: Gates enforce quality at critical transition points. Not every step needs a gate, but every critical transition does.

## When Gates Apply

```yaml
gate_triggers:
  always_gate:
    - "Before any development work (governance gate)"
    - "Before marking story complete (done gate)"
    - "Before phase transitions (phase gate)"
    - "Before deployment (deployment gate)"

  conditional_gate:
    - "Before complex features (complexity gate)"
    - "After bug fixes (regression gate)"
    - "Before architectural changes (impact gate)"

  never_gate:
    - "During normal development flow"
    - "Between steps within workflow"
    - "For trivial fixes"
```

## Gate Categories

```yaml
categories:
  strict:
    enforcement: "Cannot proceed without pass"
    bypass: "Only with documented override"
    examples:
      - governance_gate
      - story_done_gate
      - phase_transition_gate

  advisory:
    enforcement: "Warn but allow override"
    bypass: "User acknowledgment"
    examples:
      - story_start_gate
      - complexity_gate
      - performance_gate

  informational:
    enforcement: "Log only"
    bypass: "Not applicable"
    examples:
      - metrics_gate
      - documentation_gate
```

## Gate Evaluation

```yaml
evaluation_process:
  step_1_check:
    - "Load gate criteria from config/gates.yaml"
    - "Check each criterion in order"

  step_2_score:
    - "Count passed required criteria"
    - "Count passed optional criteria"
    - "Calculate overall score"

  step_3_decision:
    - "All required passed: PASS"
    - "All required passed with warnings: PASS WITH WARNINGS"
    - "Any required failed: FAIL"

  step_4_action:
    - "PASS: Allow transition"
    - "PASS WITH WARNINGS: Allow with warnings logged"
    - "FAIL: Block transition, notify user"
```

## Gate Failure Handling

```yaml
on_failure:
  strict_gates:
    action: "BLOCK transition"
    notify: "Responsible agent + user"
    options:
      - "Fix failures and retry"
      - "Request documented override"
      - "Defer to alternative path"

  advisory_gates:
    action: "WARN but allow"
    notify: "User"
    options:
      - "Acknowledge warnings and proceed"
      - "Fix warnings before proceeding"
      - "Request expert review"

  remediation:
    - "Identify specific failures"
    - "Provide remediation steps"
    - "Offer workflow for fixes"
```

## Gate Reporting

```yaml
gate_report_format:
  gate: "{gate_name}"
  timestamp: "{when}"
  result: "{pass|pass_with_warnings|fail}"

  criteria:
    required:
      total: {count}
      passed: {count}
      failed: [list of failures]

    optional:
      total: {count}
      passed: {count}
      warnings: [list of warnings]

  decision:
    allow_transition: {true|false}
    reason: "{explanation}"
    next_steps: [list]

  artifacts:
    report_file: "{path to report}"
    evidence: [list of evidence files]
```

## Gate Overrides

```yaml
override_policy:
  when_allowed:
    - "Strict gates: emergency situations only"
    - "Advisory gates: user discretion"

  requirements:
    - "Document justification"
    - "Identify risks accepted"
    - "Set review timeline"
    - "Get approval if required"

  tracking:
    - "Log all overrides"
    - "Review override pattern"
    - "Escalate frequent overrides"
```

## Gate Metrics

```yaml
metrics:
  pass_rate:
    calculation: "passed / total evaluations"
    threshold: "> 90%"
    concern: "< 80% indicates poor process"

  override_rate:
    calculation: "overridden / total failures"
    threshold: "< 5%"
    concern: "> 10% indicates gate issues"

  failure_pattern:
    track: "which criteria fail most often"
    use: "improve process or adjust criteria"

  time_to_pass:
    calculation: "time from first evaluation to pass"
    threshold: "< 1 hour for most gates"
    use: "identify inefficient gates"
```

## Special Gates

### Governance Gate

```yaml
governance_gate:
  description: "Ensure governance checks before development"
  strict: true

  criteria:
    required:
      - "Context scan completed"
      - "No high-risk issues found"
      - "No blocking anomalies"

  failure_action:
    - "Block development"
    - "Run correct-course workflow"
    - "Re-evaluate after fixes"
```

### Done Gate

```yaml
done_gate:
  description: "Ensure quality before marking complete"
  strict: true

  criteria:
    required:
      - "All acceptance criteria met"
      - "Tests passing"
      - "No P0 bugs"

  failure_action:
    - "Block completion"
    - "Fix failures"
    - "Re-test"
```

## Integration

**Implemented By**: stage-gate workflow

**Configured In**: config/gates.yaml

**Location**: `_bmad-ext/modules/governance/policies/gating-policy.md`

---

`★ Insight ─────────────────────────────────────`
1. Strict gates protect critical transitions
2. Advisory gates provide flexibility with awareness
3. Override tracking prevents abuse and identifies process issues
`─────────────────────────────────────────────────`

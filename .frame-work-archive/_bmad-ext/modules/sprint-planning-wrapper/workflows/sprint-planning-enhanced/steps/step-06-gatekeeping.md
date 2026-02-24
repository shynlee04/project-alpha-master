---
nextStepFile: '{installed_path}/steps/step-07-handoff.md'
gatingRules: '{installed_path}/../../config/gating-rules.yaml'
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'sprint-planning-enhanced'
---

# Step 6: Gatekeeping

## STEP GOAL

Auto-validation with loop-back on failures. Apply gating rules and determine if sprint is ready for execution.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Apply gating rules
- 📋 Determine pass/fail
- 🔄 Loop back if failed

## SEQUENCE OF INSTRUCTIONS

### 1. Load Gating Rules

```yaml
gating_rules:
  location: "{gatingRules}"

  thresholds:
    cohesion_score:
      min: 3
      blocking: false
      description: "Sprint narrative coherence"

    validation_score:
      min: 4
      blocking: true
      description: "Overall Product Reality score"

    dependency_conflicts:
      max: 0
      blocking: true
      description: "Critical temporal conflicts"

    nonsense_patterns:
      critical:
        max: 0
        blocking: true
      warnings:
        max: 2
        blocking: false
```

### 2. Evaluate Each Gate

```yaml
gate_evaluation:
  cohesion_gate:
    score: {from Step 3}
    threshold: 3
    result: {PASS|FAIL}

  dependency_gate:
    conflicts: {from Step 4}
    threshold: 0
    result: {PASS|FAIL}

  reality_gate:
    score: {from Step 5}
    threshold: 4
    result: {PASS|FAIL}

  nonsense_gate:
    critical: {count of critical patterns}
    warnings: {count of warnings}
    result: {PASS|FAIL}
```

### 3. Determine Overall Result

```yaml
overall_result:
  pass_conditions:
    - all_blocking_gates: PASS
    - no_critical_failures: true

  fail_conditions:
    - any_blocking_gate: FAIL
    - critical_nonsense: true

  loop_back:
    if_fail: "Return to Step 3 (Cohesion Check)"
    action: "Address issues and re-validate"
```

### 4. Display Gatekeeping Summary

```
═══════════════════════════════════════════════════════════
GATEKEEPING RESULTS
═══════════════════════════════════════════════════════════

Gate Results:
├─ Cohesion Gate (3+): {PASS|FAIL} - {score}/5
├─ Dependency Gate (0 conflicts): {PASS|FAIL} - {count}
├─ Reality Gate (4+): {PASS|FAIL} - {score}/5
└─ Nonsense Gate (0 critical): {PASS|FAIL} - {count}/{count}

Overall: {✅ PASS → PROCEED | ❌ FAIL → LOOP BACK}

{if FAIL}
Blocking Issues:
{list of blocking issues}

Suggested Actions:
{actionable recommendations}

{end if}

Options:
{if PASS}[P] Proceed to handoff
[V] View full report{end if}
{if FAIL}[A] Address issues and re-validate
[V] View detailed failures{end if}
```

### 5. Handle User Choice

**P** (if PASS): Proceed to Step 7 (Handoff)
**V**: Review detailed gatekeeping report
**A** (if FAIL): Loop back to fix issues

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6]
gating_complete: true
gating_result: {PASS|FAIL}
gate_results:
  cohesion: {PASS|FAIL}
  dependency: {PASS|FAIL}
  reality: {PASS|FAIL}
  nonsense: {PASS|FAIL}
gated_at: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ All gates passed
- ✅ No blocking issues
- ✅ Sprint approved for execution

## FAILURE METRICS

- ❌ Any blocking gate failed
- ❌ Critical nonsense detected
- ❌ Dependency conflicts unresolved

## Loop Behavior

**IF FAIL**: Load Step 3 (Cohesion Check) to address issues and re-validate
**IF PASS**: Load {nextStepFile}

**ONLY WHEN all gates pass, load {nextStepFile}**

---
name: 'step-v-14-auto-governance'
description: 'Trigger cascade chain advancement and multi-agent sign-off after PRD validation'
version: '1.0.0'
created: '2026-01-30'
author: 'Team A'
phase: 'validation'
---

# Step V-14: Auto-Governance Hook

## STEP GOAL:
Connect PRD validation completion to Master Orchestrator for cascade advancement and multi-agent sign-off.

---

## PROCESS:

### 1. Calculate Validation Score

Aggregate scores from previous validation steps:

```
VALIDATION_SCORE = (
    format_check_score (step-v-02) +
    density_score (step-v-03) +
    brief_coverage_score (step-v-04) +
    measurability_score (step-v-05) +
    traceability_score (step-v-06) +
    leakage_score (step-v-07) +
    domain_compliance_score (step-v-08) +
    project_type_score (step-v-09) +
    smart_score (step-v-10) +
    holistic_quality_score (step-v-11) +
    completeness_score (step-v-12)
) / 11
```

### 2. Signal Validation Complete

If validation report has been generated (step-v-13 complete):
- Call Master Orchestrator `cascade-advance` tool with VALIDATION_SCORE
- Emit event: `prd.validation.complete`

### 3. Check Auto-Proceed Threshold

```
IF VALIDATION_SCORE >= 0.95:
    - Auto-proceed to next cascade step
    - Log: "PRD validation passed threshold (95%+)"
ELSE:
    - Pause cascade
    - Generate analytical assessment
    - Request manual review
```

### 4. Request Multi-Agent Sign-off

If VALIDATION_SCORE >= 0.80:
- Initiate sign-off session via `signoff-initiate` tool
- Document type: `prd`
- Required agents: `analyst-ext`, `product-management-ext`

### 5. Generate Sign-off Prompts

For each required agent:
- Use `signoff-prompt` tool to generate validation request
- Agent reviews PRD with corporate-level skepticism
- Agent provides verdict: APPROVED / CONCERNS / REJECTED

---

## INTEGRATION WITH MASTER ORCHESTRATOR

This step connects to:

| Tool | Purpose |
|------|---------|
| `cascade-advance` | Advance to next chain step if ≥95% |
| `signoff-initiate` | Start multi-agent sign-off session |
| `signoff-prompt` | Generate skeptical review prompt |
| `enforcement-sync` | Trigger contract generation if approved |

---

## STATE UPDATES

After this step, update LOOP_STATE.yaml:
```yaml
active_workflow: "prd-validation"
current_phase: "validation-complete"
events:
  last_event: "prd.validation.complete"
```

---

## SUCCESS CRITERIA

- [ ] Validation score calculated from all previous steps
- [ ] Cascade advancement triggered (if active cascade)
- [ ] Sign-off session initiated (if score ≥ 80%)
- [ ] Appropriate agents notified for review

---

## FAILURE MODES

| Failure | Response |
|---------|----------|
| Score < 80% | Return to step-v-13 with remediation list |
| Cascade not active | Skip cascade advancement, proceed to sign-off |
| Agent unavailable | Mark sign-off as pending, continue chain |

---

## STEP OUTPUT ARTIFACTS

| Artifact | Description |
|----------|-------------|
| `_bmad-output/validation-reports/prd-validation-{date}.md` | Validation report with scores |
| `.opencode/governance/signoff-log.yaml` | Sign-off session record |
| `.opencode/state/LOOP_STATE.yaml` | Updated orchestration state |

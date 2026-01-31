---
name: governance-cascade
description: Use when triggering governance validation chains. Detects intent to align, validate, or cross-check governance documents and orchestrates the multi-step cascade with automatic progression on 95%+ pass rate.
allowed-tools:
  - read
  - grep
  - glob
  - bash
---

# Governance Cascade Skill

<purpose>
Orchestrate multi-step governance validation chains with automatic progression.
Detects user intent, initializes cascade, and manages step-by-step advancement
with strict gatekeeping at each transition.
</purpose>

## When to Use

- User requests document alignment ("align PRD with architecture")
- Cross-validation needed between governance docs
- Full governance review requested
- Architecture decision impact assessment

## Cascade Definitions

### CASCADE-001: PRD ↔ Architecture Alignment

**Trigger Patterns**:
```regex
/align.*prd.*architecture/i
/integrate.*prd.*architecture/i
/validate.*prd.*against.*architecture/i
/make.*documents.*aligned/i
/cross.*validate.*prd.*arch/i
```

**Chain Steps**:
```yaml
steps:
  1_prd_validation:
    name: "PRD Gap Analysis"
    agent: "analyst-ext"
    skill: "governance-verifier"
    inputs:
      - "_bmad-output/planning-artifacts/prd.md"
    outputs:
      - "_bmad-output/validation-reports/prd-validation-{date}.md"
    gate: 95  # Must score ≥95% to proceed
    
  2_stale_detection:
    name: "Stale/Legacy Detection"
    agent: "analyst-ext"
    inputs:
      - "_bmad-output/planning-artifacts/prd.md"
      - "_bmad-output/architecture/*.md"
    outputs:
      - "_bmad-output/validation-reports/stale-report-{date}.md"
    gate: 100  # No stale references allowed
    
  3_architecture_validation:
    name: "Architecture Analysis"
    agent: "architect-ext"
    skill: "governance-verifier"
    inputs:
      - "_bmad-output/planning-artifacts/IDEAL-architecture-*.md"
    outputs:
      - "_bmad-output/validation-reports/arch-validation-{date}.md"
    gate: 95
    
  4_cross_validation:
    name: "PRD ↔ Architecture Cross-Check"
    agent: "supreme-coordinator"
    inputs:
      - "step_1_output"
      - "step_3_output"
    outputs:
      - "_bmad-output/validation-reports/cross-validation-{date}.md"
    gate: 95
    
  5_multi_agent_signoff:
    name: "Multi-Agent Sign-off"
    skill: "governance-signoff"
    required_agents:
      - "analyst-ext"
      - "product-management-ext"
      - "architect-ext"
      - "dev-ext"
    gate: "unanimous"  # All must approve
    
  6_enforcement_sync:
    name: "Contract Generation"
    agent: "master-orchestrator"
    tool: "enforcement-sync"
    outputs:
      - ".opencode/governance/contracts/architecture.md"
      - ".opencode/governance/contracts/conventions.md"
      - ".opencode/governance/contracts/structure.md"
```

### CASCADE-002: PRD Review (Quick)

**Trigger Patterns**:
```regex
/review.*prd/i
/analyze.*prd/i
/check.*prd/i
```

**Chain Steps**: `[1_prd_validation, 2_stale_detection]`

### CASCADE-003: Architecture Review (Quick)

**Trigger Patterns**:
```regex
/review.*architecture/i
/check.*arch/i
/validate.*architecture/i
```

**Chain Steps**: `[3_architecture_validation]`

## Cascade Lifecycle

### 1. Detection Phase

```typescript
const detectCascade = (userMessage: string): CascadeType | null => {
    for (const [id, cascade] of CASCADES) {
        for (const pattern of cascade.triggers) {
            if (pattern.test(userMessage)) {
                return { id, cascade, confidence: calculateConfidence(userMessage, pattern) };
            }
        }
    }
    return null;
};

// Confidence scoring (require 95% to auto-start)
const calculateConfidence = (message: string, pattern: RegExp): number => {
    const matches = message.match(pattern);
    const keywords = ["align", "validate", "cross-check", "architecture", "prd"];
    const keywordHits = keywords.filter(k => message.toLowerCase().includes(k));
    return (matches ? 50 : 0) + (keywordHits.length * 10);
};
```

### 2. Initialization Phase

```yaml
cascade_state:
  id: "CASCADE-001"
  started_at: "2026-01-30T21:45:00Z"
  current_step: 1
  completed_steps: []
  pending_steps: [1, 2, 3, 4, 5, 6]
  gate_results: {}
  status: "IN_PROGRESS"
```

### 3. Step Execution

For each step:

1. **Pre-check**: Verify inputs exist
2. **Agent delegation**: Hand off to designated agent with skill
3. **Execution**: Run validation/analysis
4. **Gate check**: Verify score meets threshold
5. **Post-update**: Update cascade state, emit events

```typescript
const executeStep = async (step: CascadeStep): Promise<StepResult> => {
    // Pre-check
    for (const input of step.inputs) {
        if (!fs.existsSync(resolveInput(input))) {
            return { status: "BLOCKED", reason: `Missing input: ${input}` };
        }
    }
    
    // Delegate to agent
    StateSyncModule.setActiveAgent(step.agent);
    if (step.skill) {
        await invokeSkill(step.skill, { document: step.inputs[0] });
    }
    
    // Gate check
    const score = await evaluateOutput(step.outputs[0]);
    if (score < step.gate) {
        return { 
            status: "FAILED_GATE", 
            score, 
            threshold: step.gate,
            reason: "Score below threshold, review required"
        };
    }
    
    return { status: "PASSED", score };
};
```

### 4. Gate Enforcement

```yaml
gate_rules:
  numeric_gate:
    description: "Score must meet or exceed threshold"
    action_on_fail: "pause_cascade"
    output: "gap_analysis"
    
  unanimous_gate:
    description: "All required agents must approve"
    action_on_fail: "initiate_debate"
    max_debate_rounds: 3
    
  all_pass_gate:
    description: "100% pass rate required"
    action_on_fail: "block_permanently"
    output: "blocker_report"
```

### 5. Advancement Rules

```typescript
const shouldAdvance = (stepResult: StepResult): boolean => {
    // Always pause on failure
    if (stepResult.status !== "PASSED") return false;
    
    // Check auto-approve setting
    const cascade = getCascade(currentCascadeId);
    if (!cascade.auto_approve) {
        // Emit event for user confirmation
        StateSyncModule.emitEvent("cascade.step.awaiting_approval", {
            step: currentStep,
            score: stepResult.score
        });
        return false;
    }
    
    // Auto-advance if score >= 95%
    return stepResult.score >= 95;
};
```

## Event Emissions

```yaml
cascade_events:
  - cascade.detected         # Intent matched cascade pattern
  - cascade.started          # Cascade initialized
  - cascade.step.started     # Step execution began
  - cascade.step.completed   # Step finished (pass or fail)
  - cascade.step.failed      # Gate check failed
  - cascade.step.awaiting_approval  # Manual approval needed
  - cascade.advanced         # Moved to next step
  - cascade.completed        # All steps passed
  - cascade.aborted          # Critical failure, cascade stopped
```

## SSOT Integration

Cascade state is persisted to:
- `.opencode/state/LOOP_STATE.yaml` - Current cascade info
- `.opencode/governance/cascade-log.yaml` - Full audit trail

```yaml
# cascade-log.yaml entry
- id: "CASCADE-001-1706644800"
  started: "2026-01-30T21:45:00Z"
  trigger: "align PRD with architecture"
  steps:
    - step: 1
      status: "PASSED"
      score: 97
      duration_ms: 45000
      artifacts: ["_bmad-output/validation-reports/prd-validation-2026-01-30.md"]
```

## Rollback Protocol

If cascade fails mid-way:

1. Log failure point and reason
2. Preserve all generated artifacts with `.failed` suffix
3. Reset cascade state to last successful step
4. Emit `cascade.rollback` event
5. Generate remediation plan for failed step

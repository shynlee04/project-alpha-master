# Governance Workflow - Correct-Course Integration

**Workflow Type**: Integration Module  
**Purpose**: Integrate governance with correct-course (bug fix/remediation) workflow  
**Triggered By**: 
- Governance comparison detects mismatch
- User reports bug/error
- Agent-expert workflow blocks approach
- Deep-scan finds architectural drift

---

## Purpose

The **Correct-Course Governance** integration ensures that:

1. **Governance Triggers Remediation**: When comparison engine detects issues, remediation is called
2. **Remediation Uses Governance**: Remediation uses deep-scan results and comparison reports
3. **Three-Way Integration**: Context-first → Agent-expert → Research → Correct-course

This prevents:
- Issues being fixed without understanding root cause
- Quick fixes that create bigger problems
- Architectural drift going unaddressed
-重复 work due to poor communication

---

## Integration Architecture

### Three-Way Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REPORTS ISSUE                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONTEXT-FIRST WORKFLOW                         │
│  • Gather context (domains, slices, depth)                      │
│  • Contextualize prompt                                         │
│  • Extend coverage                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AGENT-EXPERT WORKFLOW                          │
│  • Define level (P0-P3, L1-L3)                                  │
│  • Load codebase reality                                        │
│  • Compare & contrast                                           │
│  • Detect flaws                                                 │
│  • Make decision (proceed/modify/block)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         PROCEED          MODIFY         BLOCK
              │               │               │
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Implementation   │ │ Research + Re-   │ │ CORRECT-COURSE   │
│                  │ │ run Agent-expert │ │ TRIGGERED        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                                                      │
                              ┌─────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              CORRECT-COURSE WORKFLOW                            │
│  • Receive governance report                                    │
│  • Categorize issue type                                        │
│  • Route to appropriate sub-workflow                            │
│  • Execute remediation                                          │
│  • Validate with comparison engine                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              GOVERNANCE VALIDATION                              │
│  • Run comparison engine                                        │
│  • Verify fix matches expected                                  │
│  • Update LOOP_STATE                                            │
│  • Archive report                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Trigger Conditions

### Trigger 1: Comparison Engine Mismatch

```yaml
trigger: "comparison_engine_mismatch"
condition: |
  comparison_engine.findings.severity in ['P0', 'P1']
  
actions:
  1. "Create issue report from comparison findings"
  2. "Run context-first workflow"
  3. "Run agent-expert workflow"
  4. "Route to correct-course"
```

### Trigger 2: User Reports Bug

```yaml
trigger: "user_reports_bug"
condition: |
  user_request contains ['bug', 'error', 'broken', 'not working']
  
actions:
  1. "Run context-first workflow (deep scan)"
  2. "Run agent-expert workflow (bug analysis)"
  3. "Categorize bug type"
  4. "Route to correct-course"
```

### Trigger 3: Agent-Expert Blocks

```yaml
trigger: "agent_expert_blocks"
condition: |
  agent_expert.decision == 'block'
  
actions:
  1. "Present block reasons to user"
  2. "Ask user to modify approach"
  3. "If user insists: trigger correct-course for architectural review"
  4. "Pass agent-expert report to correct-course"
```

### Trigger 4: Deep-Scan Drift Detection

```yaml
trigger: "deep_scan_drift"
condition: |
  deep_scan.findings.drift_detected == true
  
actions:
  1. "Create drift report"
  2. "Categorize drift severity"
  3. "Route to correct-course"
  4. "Monitor fix progress"
```

---

## Correct-Course Categorization

### Category A: Quick Patch

**Description**: Simple bugs, wrong component wiring, no chained impact

```yaml
category: "quick_patch"
conditions:
  - severity: "P3"
  - complexity: "L1"
  - impact_scope: "single component"
  - comparison_mismatch: "minor"
  - chained_impact: false

sub_workflow: "quick-patch"
steps:
  1. "Identify exact location of bug"
  2. "Apply minimal fix"
  3. "Run affected tests"
  4. "Verify fix with comparison engine"
  5. "Log in LOOP_STATE"
```

### Category B: Feature Fix

**Description**: Independent feature fix, no chained impact

```yaml
category: "feature_fix"
conditions:
  - severity: "P2"
  - complexity: "L2"
  - impact_scope: "multiple components"
  - comparison_mismatch: "moderate"
  - chained_impact: false

sub_workflow: "feature-fix"
steps:
  1. "Analyze feature context"
  2. "Identify affected files"
  3. "Apply fix with related updates"
  4. "Run integration tests"
  5. "Verify with comparison engine"
  6. "Update documentation"
```

### Category C: Architectural Conflict

**Description**: Requires comprehensive remediation, god-store-split, component-split

```yaml
category: "architectural_conflict"
conditions:
  - severity: "P1" | "P0"
  - complexity: "L3"
  - impact_scope: "multi-domain"
  - comparison_mismatch: "major"
  - chained_impact: true

sub_workflow: "architectural-conflict"
steps:
  1. "Run deep-scan on affected area"
  2. "Analyze architectural dependencies"
  3. "Design remediation approach"
  4. "Execute phased refactoring"
  5. "Validate each phase with comparison engine"
  6. "Update architecture documentation"
  7. "Run full test suite"
```

---

## Integration Points

### With Context-First Workflow

```yaml
# Input from context-first
context_first_output:
  - scope: "deep"
  - domains: [list]
  - features: [list]
  - slices: [list]

# Used by correct-course
correct_course_input:
  - "Knows what areas are affected"
  - "Knows what features are related"
  - "Knows what files need scanning"
```

### With Agent-Expert Workflow

```yaml
# Input from agent-expert
agent_expert_output:
  - issue_level: {severity, complexity, impact}
  - flaws_detected: [list]
  - decision: "proceed" | "modify" | "block"
  - expert_report: "{detailed analysis}"

# Used by correct-course
correct_course_input:
  - "Knows what went wrong"
  - "Knows what approach was attempted"
  - "Knows what conflicts exist"
```

### With Research Workflow

```yaml
# Input from research
research_output:
  - recommendation: "{detailed recommendation}"
  - warnings: [list]
  - alternatives: [list]
  - next_steps: [list]

# Used by correct-course
correct_course_input:
  - "Knows what tech choices are optimal"
  - "Knows what to avoid"
  - "Knows what alternatives exist"
```

### With Comparison Engine

```yaml
# Input from comparison
comparison_output:
  - findings: [list]
  - mismatches: [list]
  - recommendations: [list]

# Used by correct-course
correct_course_input:
  - "Knows what doesn't match"
  - "Knows what code needs fixing"
  - "Knows what documentation is stale"
```

---

## Example Integration Flow

### Example: User Reports Authentication Bug

```yaml
# User Request
user_request: "Login is broken - users can't authenticate"

# Step 1: Context-First (Deep Scan)
context_first:
  scope: "deep"
  domains:
    - "infrastructure/auth"
    - "domain/services"
    - "presentation/hooks"
  features:
    - "authentication"
    - "session_management"
  slices:
    - "src/infrastructure/auth/auth-service.ts"
    - "src/domain/services/auth-service.ts"
    - "src/presentation/hooks/useAuth.ts"

# Step 2: Agent-Expert
agent_expert:
  issue_type: "bug_fix"
  severity: "P1"
  complexity: "L2"
  flaw_score: 45
  decision: "modify"
  critical_flaws:
    - "JWT token validation missing"
    - "Error handling inconsistent"
    - "Session store not updated on login"

# Step 3: Correct-Course Categorization
categorization:
  category: "feature_fix"
  reasoning:
    - "Multiple files affected"
    - "Some chained impact (session store)"
    - "Can be fixed without full architectural change"

# Step 4: Remediation Execution
remediation:
  sub_workflow: "feature-fix"
  actions:
    1. "Add JWT token validation"
    2. "Fix error handling consistency"
    3. "Update session store on login"
    4. "Run auth tests"
    5. "Verify with comparison engine"

# Step 5: Governance Validation
validation:
  comparison_engine:
    check: "auth-service.ts vs architecture.md"
    result: "MATCH - Fix applied correctly"
  LOOP_STATE:
    update:
      - "errors.fixed: 1"
      - "governance.last_check: now"
```

---

## Error Handling

### If Context-First Fails

```yaml
error: "context_first_failed"
actions:
  1. "Use fallback context (full codebase)"
  2. "Warn user about limited context"
  3. "Continue with correct-course"
  4. "Log error in LOOP_STATE.errors"
```

### If Agent-Expert Blocks

```yaml
error: "agent_expert_blocked"
actions:
  1. "Present block reasons to user"
  2. "Ask: 'Do you want to try a different approach?'"
  3. "If no: Trigger architectural-conflict sub-workflow"
  4. "If yes: Re-run with new approach"
```

### If Comparison Fails After Fix

```yaml
error: "comparison_failed_after_fix"
actions:
  1. "Analyze why comparison still fails"
  2. "If fix incomplete: return to remediation"
  3. "If comparison wrong: update comparison rules"
  4. "If documentation wrong: update documentation"
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `correct_course_triggers` | Times correct-course was triggered | N/A |
| `quick_patch_success` | Quick patches completed successfully | > 95% |
| `feature_fix_success` | Feature fixes completed successfully | > 90% |
| `architectural_fix_success` | Architectural fixes completed successfully | > 80% |
| `avg_fix_time` | Average time to fix | Decreasing |
| `regression_rate` | Fixes that cause new issues | < 5% |

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `context-first.md` - Context gathering workflow
- `agent-expert.md` - Expert analysis workflow
- `research.md` - Internet-based research workflow
- `comparison-engine.md` - Compare docs to code
- `quick-patch.md` - Quick fix sub-workflow
- `feature-fix.md` - Feature fix sub-workflow
- `architectural-conflict.md` - Architectural fix sub-workflow

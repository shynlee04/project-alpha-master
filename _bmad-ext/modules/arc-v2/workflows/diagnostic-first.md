---
name: "diagnostic-first"
description: "Always Scan Before Plan - Core ARC-V2 Workflow"
version: "1.0.0"
type: "workflow"
phase: "pre-remediation"
---

# Diagnostic-First Workflow

**Purpose**: Ensure all remediation is evidence-based
**Rule**: No code changes without fresh (<4 hours) scan results

---

## Workflow Diagram

```
+-------------------+
|   User Prompt     |
+-------------------+
         |
         v
+-------------------+
| Context Validator |  <-- Step 1: Validate prompt, check staleness
+-------------------+
         |
         v
+-------------------+
|  Domain Scanner   |  <-- Step 2: Generate fresh evidence
+-------------------+
         |
         v
+-------------------+
| Evidence Review   |  <-- Step 3: Review findings, prioritize
+-------------------+
         |
         v
+-------------------+
| Remediation Plan  |  <-- Step 4: Create plan FROM evidence
+-------------------+
         |
         v
+-------------------+
|  Execution Gate   |  <-- Step 5: Verify plan before code
+-------------------+
         |
         v
+-------------------+
|   Execute Fix     |  <-- Step 6: Apply changes with rollback
+-------------------+
         |
         v
+-------------------+
| Verify & Register |  <-- Step 7: Confirm fix, update registry
+-------------------+
```

---

## Step 1: Context Validation

**Agent**: `arc-v2/agents/context-validator.md`

```yaml
actions:
  - Analyze user prompt
  - Check LOOP_STATE.yaml for staleness
  - Verify any claims made
  - Map to 6 domains
  
outputs:
  - verified_claims.yaml
  - relevant_files.yaml
  - recommended_domain
  
gates:
  - If stale (>4 hours): HALT, require confirmation
  - If claims unverifiable: WARN, ask for clarification
```

---

## Step 2: Domain Scanning

**Agent**: `arc-v2/agents/domain-scanner.md`

```yaml
input: target_domain from Step 1

actions:
  - Run domain-specific scan
  - Generate metrics
  - Identify god artifacts
  - Calculate health score
  
outputs:
  - _bmad-output/scans/{domain}-scan-{date}.yaml
  
gates:
  - Scan must complete successfully
  - Results must register in ARTIFACT_REGISTRY.yaml
```

---

## Step 3: Evidence Review

**Actor**: Workflow (automatic) or User (interactive)

```yaml
review_checklist:
  - [ ] Critical findings identified?
  - [ ] God artifacts quantified?
  - [ ] Root causes clear?
  - [ ] Blast radius understood?
  
prioritization:
  P0: Data loss, crashes, security
  P1: User journey blockers
  P2: Maintainability issues
  P3: Code quality
```

---

## Step 4: Remediation Plan

**Input**: Scan results from Step 2

```yaml
plan_requirements:
  - Must reference specific scan findings
  - Must include affected files
  - Must estimate hours
  - Must define rollback strategy
  - Must NOT include assumptions
  
plan_format:
  id: "rem-{date}-{seq}"
  based_on_scan: "{scan_artifact_id}"
  target_domain: "{domain}"
  changes:
    - file: "{path}"
      action: "split | refactor | delete | create"
      reason: "Finding {finding_id}"
      rollback: "{strategy}"
```

---

## Step 5: Execution Gate

**Pre-execution validation**:

```yaml
gates:
  - [ ] Scan is fresh (<4 hours)
  - [ ] Plan references specific findings
  - [ ] Rollback strategy documented
  - [ ] Affected files identified
  - [ ] No assumptions made
  
if_gate_fails:
  action: HALT
  message: "Cannot proceed - gate failed: {reason}"
  remediation: "Re-run from Step 2"
```

---

## Step 6: Execute Fix

**Agent**: `dev-ext` or `arc-v2/agents/remediation-executor.md`

```yaml
execution_protocol:
  - Create backup branch
  - Apply changes incrementally
  - Run validation after each file
  - Commit atomically
  
validation_commands:
  - "pnpm tsc --noEmit"
  - "pnpm lint"
  - "pnpm test --run"
  
on_failure:
  - Rollback to backup branch
  - Report failure with details
  - Log in LOOP_STATE.yaml errors section
```

---

## Step 7: Verify & Register

**Post-execution**:

```yaml
verification:
  - Run full TypeScript check
  - Run affected tests
  - Verify file sizes (no new god artifacts)
  - Check no regressions
  
registration:
  artifact:
    type: "REMEDIATION_COMPLETE"
    path: "_bmad-output/remediations/rem-{date}-{seq}.yaml"
    references:
      - scan: "{scan_artifact_id}"
      - plan: "{plan_artifact_id}"
    changes:
      - files_modified: [...]
      - lines_changed: {count}
    validation:
      ts_errors: 0
      tests_passed: true
      
  update_loop_state:
    progress.stories_completed_this_session: +1
    progress.artifacts_created: + "{artifact_id}"
```

---

## Key Differences from Old Module

| Old Module | ARC-V2 |
|------------|--------|
| Assumed 1,172 TS errors | Runs `pnpm tsc --noEmit` to verify |
| 991-line static plan | Fresh plan from scan results |
| No staleness check | 4-hour staleness threshold |
| Component-first fixes | Journey-first remediation |
| No rollback strategy | Always document rollback |

---

## Invocation

### Via Orchestrator

```yaml
route: "arc-v2/workflows/diagnostic-first.md"
trigger: story_type in ["remediation", "architecture", "refactoring"]
```

### Via Direct Command

```
/arc-v2 diagnostic --domain state
/arc-v2 diagnostic --domain all
/arc-v2 remediate --from-scan scan-state-2026-01-10.yaml
```

---

## Governance

### Updates Required

After each successful remediation:

1. Update LOOP_STATE.yaml progress
2. Register artifacts in ARTIFACT_REGISTRY.yaml
3. Check if governance update needed (every 3 stories)
4. If >3 stories completed: trigger AGENTS.md update

---

**Workflow Owner**: arc-v2
**Integrates With**: 
  - `_bmad-ext/orchestrator/routing-rules.yaml`
  - `_bmad-ext/state/LOOP_STATE.yaml`
  - `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`
**Last Updated**: 2026-01-10

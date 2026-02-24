---
name: 'step-10-auto-governance'
description: 'Cross-validate architecture against PRD and trigger multi-agent sign-off'
version: '1.0.0'
created: '2026-01-30'
author: 'Team A'
phase: 'solutioning'
---

# Step 10: Auto-Governance Hook

## STEP GOAL:
Cross-validate architecture decisions against PRD requirements and trigger multi-agent sign-off for governance alignment.

---

## PROCESS:

### 1. Load PRD for Cross-Validation

Read PRD from: `_bmad-output/planning-artifacts/prd.md`
Extract:
- All Functional Requirements (FRs)
- All Non-Functional Requirements (NFRs)
- Technical constraints
- Integration requirements

### 2. Validate Architecture Against PRD

For each architecture decision in current document:

```
CROSS_VALIDATION_MATRIX:
| Architecture Section | PRD Requirement | Status | Gap |
|---------------------|-----------------|--------|-----|
| State Management    | NFR-01: Performance | ✅ | - |
| Plugin System       | FR-05: Extensibility | ⚠️ | Error handling |
| Data Persistence    | NFR-03: Reliability | ✅ | - |
```

### 3. Calculate Alignment Score

```
ALIGNMENT_SCORE = (
    matched_requirements / total_requirements
) × 100

DRIFT_COUNT = count(gaps where status = ⚠️ or ❌)
```

### 4. Check Auto-Proceed Threshold

```
IF ALIGNMENT_SCORE >= 95% AND DRIFT_COUNT == 0:
    - Auto-proceed to enforcement sync
    - Call `cascade-advance` with score
ELSE:
    - Pause for remediation
    - Generate drift report
```

### 5. Request Multi-Agent Sign-off

Initiate sign-off session:
- Document type: `architecture`
- Required agents: `architect-ext`, `supreme-coordinator`

For cross-validation:
- Document type: `cross-validation`
- Required agents: ALL (analyst, architect, PM, coordinator)

### 6. Generate Cross-Validation Report

Output to: `_bmad-output/validation-reports/cross-validation-matrix-{date}.md`

---

## INTEGRATION WITH MASTER ORCHESTRATOR

| Tool | Purpose |
|------|---------|
| `cascade-advance` | Advance if all agents approve |
| `signoff-initiate` | Start cross-validation sign-off |
| `enforcement-sync` | Generate codebase contracts on approval |

---

## CONSENSUS REQUIREMENTS

Per user requirements, **ALL agents must reach consensus**:

1. Each agent reviews independently
2. If ANY agent has CONCERNS or REJECTED:
   - Initiate debate round (max 3)
   - Agents must review each other's positions
   - Revised verdicts collected

3. Continue until ALL APPROVED or max rounds reached

---

## STATE UPDATES

```yaml
active_workflow: "architecture-validation"
current_phase: "cross-validation-complete"
events:
  last_event: "architecture.validation.complete"
```

---

## SUCCESS CRITERIA

- [ ] PRD loaded and requirements extracted
- [ ] Cross-validation matrix generated
- [ ] Alignment score calculated
- [ ] Sign-off session initiated
- [ ] All agents reached consensus

---

## FAILURE MODES

| Failure | Response |
|---------|----------|
| PRD not found | BLOCK - cannot validate without PRD |
| Drift > 20% | Pause cascade, generate remediation plan |
| No consensus after 3 rounds | BLOCKED - escalate to manual review |

---

## OUTPUT ARTIFACTS

| Artifact | Description |
|----------|-------------|
| `cross-validation-matrix-{date}.md` | Requirement-to-architecture mapping |
| `drift-report-{date}.md` | Identified gaps and misalignments |
| `signoff-log.yaml` | Multi-agent verdict record |

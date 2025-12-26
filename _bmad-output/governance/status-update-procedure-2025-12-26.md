# Status Update Procedure

**Version**: 1.0  
**Date**: 2025-12-26  
**Purpose**: Establish single source of truth for project status and prevent governance failures

## Overview

This document defines the authoritative procedure for updating project status files to prevent the governance failures identified in Phase 1 investigation (E2E verification bypass, sequential dependency violations, status file inconsistencies).

## Authority

### Who Can Update Status Files

| Role | Files | Authority Level |
|------|-------|-----------------|
| @bmad-core-bmad-master | [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) | Full |
| @bmad-bmm-pm | [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) | Story status updates only |
| @bmad-bmm-dev | [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) | Read-only |
| @bmad-bmm-sm | [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) | Story status updates only |

**NOTE**: [`bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml) is **DEPRECATED**. Do not update this file.

## When Status Updates Are Allowed

### Story Status Transitions

```
BACKLOG → IN_PROGRESS → BLOCKED → DONE
         ↓            ↓
      IN_PROGRESS → BACKLOG (rollback)
```

**Rules**:
1. **BACKLOG → IN_PROGRESS**: Allowed when previous story is DONE (see Sequential Dependencies)
2. **IN_PROGRESS → DONE**: **ONLY** after E2E verification completed and evidence captured
3. **DONE → IN_PROGRESS**: NEVER (requires new story creation)
4. **IN_PROGRESS → BLOCKED**: Allowed when dependency not met
5. **BLOCKED → IN_PROGRESS**: Allowed when dependency resolved

## How to Perform Updates

### Step 1: Verify Dependencies

Before updating story status to IN_PROGRESS:

```yaml
# Check sprint-status.yaml for previous story
stories:
  MVP-1:
    status: DONE  # Must be DONE before MVP-2 can start
    e2e_verified: true
```

**Sequential Dependency Enforcement**:
- MVP-2 requires MVP-1 DONE
- MVP-3 requires MVP-2 DONE
- MVP-4 requires MVP-3 DONE
- MVP-5 requires MVP-4 DONE
- MVP-6 requires MVP-5 DONE
- MVP-7 requires MVP-6 DONE

### Step 2: Complete E2E Verification (for DONE status)

**MANDATORY Checklist**:

- [ ] All acceptance criteria implemented (verify in story document)
- [ ] Manual browser E2E testing completed
- [ ] Screenshot captured (saved to `_bmad-output/e2e-evidence/{story-id}-{date}.png`)
- [ ] Full workflow tested (not just component existence)
- [ ] No console errors
- [ ] No runtime errors
- [ ] Feature works as specified in story

**Evidence Location**: `_bmad-output/e2e-evidence/`

### Step 3: Update sprint-status.yaml

**Template**:

```yaml
stories:
  MVP-X:
    id: MVP-X
    title: "Story Title"
    status: DONE  # or IN_PROGRESS, BLOCKED, BACKLOG
    e2e_verified: true  # REQUIRED for DONE status
    e2e_verification_date: "2025-12-26T20:00:00Z"
    e2e_verification_evidence: "_bmad-output/e2e-evidence/mvp-x-2025-12-26.png"
    acceptance_criteria:
      - criterion_1: true
      - criterion_2: true
```

**Critical Fields**:
- `e2e_verified`: MUST be `true` for DONE status
- `e2e_verification_date`: ISO 8601 timestamp
- `e2e_verification_evidence`: Path to screenshot/recording

### Step 4: Validate Update

**Validation Checklist**:

- [ ] Previous story status is DONE (for IN_PROGRESS transition)
- [ ] All acceptance criteria marked `true`
- [ ] E2E verification fields populated (for DONE status)
- [ ] Evidence file exists at specified path
- [ ] No conflicts with other stories

## E2E Verification Approval Process

### Pre-Verification

1. **Developer**: Completes implementation
2. **Developer**: Runs local E2E test
3. **Developer**: Captures screenshot/recording
4. **Developer**: Updates story status to IN_PROGRESS with `e2e_verified: false`

### Verification

1. **Developer**: Opens browser to `http://localhost:3000`
2. **Developer**: Tests complete user journey
3. **Developer**: Captures evidence screenshot
4. **Developer**: Saves evidence to `_bmad-output/e2e-evidence/`

### Approval

1. **Developer**: Updates story status to DONE
2. **Developer**: Populates E2E verification fields
3. **PM (@bmad-bmm-pm)**: Reviews evidence
4. **PM (@bmad-bmm-pm)**: Validates status update
5. **Master (@bmad-core-bmad-master)**: Final approval

**Rejection Process**:
- If E2E verification fails, revert status to IN_PROGRESS
- Document failure reason in story comments
- Create new task to fix issues

## Sequential Dependency Enforcement

### Dependency Graph

```
MVP-1 (DONE) → MVP-2 (IN_PROGRESS) → MVP-3 (BLOCKED) → MVP-4 (BLOCKED) → MVP-5 (BLOCKED) → MVP-6 (BLOCKED) → MVP-7 (BLOCKED)
```

### Enforcement Mechanism

**Before updating story status to IN_PROGRESS**:

1. Check previous story status in [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)
2. Verify previous story `e2e_verified: true`
3. Verify previous story `status: DONE`
4. If any check fails, set current story status to BLOCKED

**Example**:

```yaml
# ❌ INVALID: MVP-2 cannot be IN_PROGRESS if MVP-1 is not DONE
stories:
  MVP-1:
    status: IN_PROGRESS  # BLOCKS MVP-2
  MVP-2:
    status: IN_PROGRESS  # VIOLATION

# ✅ VALID: MVP-2 can be IN_PROGRESS only after MVP-1 is DONE
stories:
  MVP-1:
    status: DONE
    e2e_verified: true
  MVP-2:
    status: IN_PROGRESS  # ALLOWED
```

## Handoff Document Validation

### Required Fields

All handoff documents must include:

```markdown
## Status Updates

Updated: sprint-status.yaml (story {id} → {status})
- Previous status: {previous}
- New status: {new}
- E2E verified: {true/false}
- Evidence: {path-to-evidence}
```

### Validation Checklist

- [ ] Story status update documented
- [ ] Previous status mentioned
- [ ] E2E verification status included
- [ ] Evidence path provided (for DONE status)
- [ ] No conflicts with sequential dependencies

## Status File Consolidation

### Single Source of Truth

**Authoritative File**: [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)

**Deprecated Files**:
- [`bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml) - DO NOT UPDATE

### Migration Procedure

1. Read current status from [`bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml)
2. Update [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) with current status
3. Add deprecation notice to [`bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml)
4. Update all references in handoff documents

## Governance Violations

### Violation Types

1. **E2E Verification Bypass**: Story marked DONE without E2E verification
2. **Sequential Dependency Violation**: Story started before previous story DONE
3. **Status File Inconsistency**: Conflicting status between files
4. **Missing Evidence**: DONE status without screenshot/recording

### Correction Process

1. **Identify Violation**: Review [`sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)
2. **Document Violation**: Create entry in [`status-correction-log-2025-12-26.md`](_bmad-output/governance/status-correction-log-2025-12-26.md)
3. **Correct Status**: Revert to appropriate status
4. **Block Dependent Stories**: Set dependent stories to BLOCKED
5. **Notify Stakeholders**: Report to @bmad-core-bmad-master

## References

- [`MVP Traceability Matrix`](_bmad-output/governance/mvp-traceability-matrix-2025-12-26.md)
- [`MVP Sprint Plan`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- [`Story Validation`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md)
- [`Status Correction Log`](_bmad-output/governance/status-correction-log-2025-12-26.md)
- [`Phase 1 Investigation`](_bmad-output/investigation/agentic-workflow-gap-analysis-2025-12-26.md)

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-26 | 1.0 | Initial creation | @bmad-bmm-pm |
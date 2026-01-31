# Validation Scan Workflow

**Workflow ID**: `@bmad/modules/deep-scan/workflows/validation-scan`
**Version**: 1.0.0
**Created**: 2026-01-04

## Workflow Overview

Verifies that a specific remediation action was successful and did not introduce regressions. It is the "Definition of Done" check for the Architecture Remediation module.

### When to Use
- **Post-Fix**: After a `store-refactorer` or `component-splitter` agent completes a task.
- **Closing Story**: Before marking a Story as DONE in `sprint-status.yaml`.

## Steps

### Phase 1: Re-Scan Target

Re-run the scanner that originally found the issue on the specific target file.

**Example**:
If `EV-STATE-001` (God Store `agents-store.ts`) was fixed:
```bash
@bmad/modules/deep-scan/agents/state-scanner:proofs --target "src/stores/agents-store.ts"
```

### Phase 2: Verify Evidence Absence

Check if the Evidence Block for the original issue is generated.

- **Pass**: Evidence Block NOT generated (Issue resolved).
- **Fail**: Evidence Block generated (Issue persists).

### Phase 3: Regression Check

Run a wider scan (e.g., `types-scanner`) on dependent files to ensure no side effects.

## Outputs

- `_bmad-output/deep-scan/reports/VALIDATION-RESULT.md` (PASS/FAIL)

---

**Trigger**: Architecture Remediation Agent
**Success Criteria**: Original evidence block disappears.

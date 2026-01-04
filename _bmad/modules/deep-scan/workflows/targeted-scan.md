# Targeted Deep Scan Workflow

**Workflow ID**: `@bmad/modules/deep-scan/workflows/targeted-scan`
**Version**: 1.0.0
**Created**: 2026-01-04

## Workflow Overview

Executes a focused scan on a specific domain (e.g., "State Management") or a specific directory (e.g., `src/lib/agent`). Useful for rapid feedback during development or after a specific refactor.

### When to Use
- **During Dev**: Verify a specific module while working on it.
- **Pre-Commit**: Check if changes introduce new risks in the modified domain.
- **Post-Refactor**: Validation after a targeted cleanup (e.g., after fixing types).

## Parameters

- `domain`: One of [state, types, architecture, persistence, agent, ux, workspace, security, performance]
- `target_dir`: (Optional) Specific directory to scan (e.g., `src/features/chat`)

## Steps

### Phase 1: Focused Inventory

Run ONLY the relevant scanner in "Inventory" mode.

**Example (State)**:
```bash
@bmad/modules/deep-scan/agents/state-scanner:inventory
target: "{target_dir}"
output: "_bmad-output/deep-scan/temp/state-inventory.json"
```

### Phase 2: Focused Proofs

Run ONLY the relevant scanner in "Proofs" mode.

**Example (State)**:
```bash
@bmad/modules/deep-scan/agents/state-scanner:proofs
inventory: "_bmad-output/deep-scan/temp/state-inventory.json"
output: "_bmad-output/deep-scan/temp/state-evidence.yaml"
```

### Phase 3: Focused Synthesis

Synthesize ONLY the new evidence.

```bash
@bmad/modules/deep-scan/agents/evidence-synthesizer:aggregate
input_dir: "_bmad-output/deep-scan/temp/"
output: "_bmad-output/deep-scan/temp/targeted-report.md"
```

## Outputs

- `_bmad-output/deep-scan/temp/targeted-report.md`: Focused findings.

---

**Trigger**: Manual (`/scan state`)
**Success Criteria**: Report generated for targeted domain.

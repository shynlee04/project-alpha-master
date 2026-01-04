# Full Codebase Deep Scan Workflow

**Workflow ID**: `@bmad/modules/deep-scan/workflows/full-scan`
**Version**: 1.0.0
**Created**: 2026-01-04
**Prerequisites**: Clean git status

## Workflow Overview

Executes a comprehensive, 360-degree audit of the entire codebase using all 9 specialized scanning agents. It proceeds through Inventory, Proof, and Synthesis phases to generate the Master Risk Register.

### When to Use
- **Kickoff**: At the start of a major remediation epic (e.g., Epic 53, Epic 24)
- **Weekly**: Automated health check (e.g., Sunday night)
- **Baseline**: Before major architectural changes to establish a baseline

## Steps

### Phase 1: Global Inventory (Parallel Execution)

Launch all scanners in "Inventory" mode to map the territory.

1. **State Inventory**: `@bmad/modules/deep-scan/agents/state-scanner:inventory`
2. **Type Inventory**: `@bmad/modules/deep-scan/agents/types-scanner:inventory`
3. **Arch Inventory**: `@bmad/modules/deep-scan/agents/architecture-scanner:inventory`
4. **Persist Inventory**: `@bmad/modules/deep-scan/agents/persistence-scanner:inventory`
5. **Agent Inventory**: `@bmad/modules/deep-scan/agents/agent-rag-scanner:inventory`
6. **UX Inventory**: `@bmad/modules/deep-scan/agents/ux-scanner:inventory`
7. **Workspace Inventory**: `@bmad/modules/deep-scan/agents/workspace-scanner:inventory`
8. **Security Inventory**: `@bmad/modules/deep-scan/agents/security-scanner:inventory`
9. **Perf Inventory**: `@bmad/modules/deep-scan/agents/performance-scanner:inventory`

**Checkpoint**: Verify 9 inventory JSON files exist in `_bmad-output/deep-scan/`.

### Phase 2: Evidence Generation (Parallel Execution)

Launch all scanners in "Proofs" mode to validate risks.

1. **State Proofs**: `@bmad/modules/deep-scan/agents/state-scanner:proofs`
2. **Type Proofs**: `@bmad/modules/deep-scan/agents/types-scanner:proofs`
3. **Arch Proofs**: `@bmad/modules/deep-scan/agents/architecture-scanner:proofs`
4. **Persist Proofs**: `@bmad/modules/deep-scan/agents/persistence-scanner:proofs`
5. **Agent Proofs**: `@bmad/modules/deep-scan/agents/agent-rag-scanner:proofs`
6. **UX Proofs**: `@bmad/modules/deep-scan/agents/ux-scanner:proofs`
7. **Workspace Proofs**: `@bmad/modules/deep-scan/agents/workspace-scanner:proofs`
8. **Security Proofs**: `@bmad/modules/deep-scan/agents/security-scanner:proofs`
9. **Perf Proofs**: `@bmad/modules/deep-scan/agents/performance-scanner:proofs`

**Checkpoint**: Verify 9 evidence YAML files exist in `_bmad-output/deep-scan/evidence/`.

### Phase 3: Synthesis & Reporting

Synthesize findings into actionable intelligence.

1. **Synthesize**: `@bmad/modules/deep-scan/agents/evidence-synthesizer:aggregate`
2. **Prioritize**: `@bmad/modules/deep-scan/agents/evidence-synthesizer:prioritize`
3. **Report**: `@bmad/modules/deep-scan/agents/evidence-synthesizer:report`

## Outputs

- `_bmad-output/deep-scan/reports/MASTER-RISK-REGISTER.md`
- `_bmad-output/deep-scan/reports/REMEDIATION-BACKLOG.yaml`
- `_bmad-output/deep-scan/reports/DEEP-SCAN-SUMMARY.md`

## Integration

- **Architecture Remediation**: Items from `REMEDIATION-BACKLOG.yaml` are fed into the backlog.
- **Sprint Status**: Summary added to `arc-sprint-status.yaml`.

---

**Trigger**: Manual or Scheduled
**Success Criteria**: All reports generated, no scanner crashes.

---
description: Run a full 360-degree architectural deep scan of the codebase
usage: /deep-scan-full
---

# /deep-scan-full

Executes the `@bmad/modules/deep-scan/workflows/full-scan` workflow.

## Steps Performed
1.  **Inventory**: Maps 9 architectural domains (State, Types, Arch, etc.)
2.  **Proofs**: Generates validated evidence blocks for all violations
3.  **Synthesis**: Aggregates risks into `MASTER-RISK-REGISTER.md`

## Output
- `_bmad-output/deep-scan/reports/MASTER-RISK-REGISTER.md`
- `_bmad-output/deep-scan/reports/REMEDIATION-BACKLOG.yaml`

## Example
```bash
/deep-scan-full
```

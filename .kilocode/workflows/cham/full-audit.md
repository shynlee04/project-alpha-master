---
description: 
auto_execution_mode: 3
---

# CHAM Full Audit Workflow

Complete 5-phase codebase health audit workflow.

## Phases

1. **Discovery** - Map codebase and detect patterns
2. **Scanning** - Run 8 specialized scanners in parallel
3. **Synthesis** - Merge reports and create roadmap
4. **Remediation** - Fix issues cluster-by-cluster
5. **Validation** - Re-scan and generate final report

## Usage

Activate via command: `cham-run-audit`

Or reference agents directly in your workflow.

## Status

Tracked in: `.bmad/custom/src/modules/cham/status/audit-status.json`

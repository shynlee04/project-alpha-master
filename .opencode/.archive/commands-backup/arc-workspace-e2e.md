---
description: Implement workspace E2E file system functionality
---

# ARC: Workspace E2E

Execute: `_bmad/modules/architecture-remediation/workflows/workspace-file-system-e2e.md`

## Workspace Priority
1. IDE - Harden permissions
2. Notes - Local sync
3. Knowledge - Source import

## Validation
Test all 5 layers: UI → Hook → Store → Persistence → Sync

## Post-Workflow
MUST run `/governance-enforcement`

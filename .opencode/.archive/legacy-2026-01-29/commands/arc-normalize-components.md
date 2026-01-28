---
description: Normalize oversized components
---

# ARC: Normalize Components

Execute: `_bmad/modules/architecture-remediation/workflows/normalize-components.md`

## Targets
Components > 300 lines, Hooks > 150 lines

## Pattern
1. Identify extraction candidates
2. Extract hooks first
3. Extract sub-components
4. Create barrel exports
5. Update tests

## Post-Workflow
MUST run `/governance-enforcement`

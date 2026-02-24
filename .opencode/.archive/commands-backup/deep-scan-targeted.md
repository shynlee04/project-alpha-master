---
description: Run a targeted deep scan on a specific domain or directory
usage: /deep-scan-targeted [domain] [target]
---

# /deep-scan-targeted

Executes the `@bmad/modules/deep-scan/workflows/targeted-scan` workflow.

## Arguments
- `domain`: The architectural domain to scan.
  - Options: `state`, `types`, `architecture`, `persistence`, `agent`, `ux`, `workspace`, `security`, `performance`
- `target`: (Optional) Specific directory or file path.

## Example
```bash
/deep-scan-targeted domain:state target:src/stores/
```

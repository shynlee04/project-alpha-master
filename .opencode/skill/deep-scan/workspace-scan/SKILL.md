---
name: deep-scan-workspace-scan
description: Workspace scanner for detecting cross-workspace leaks, event isolation violations, shared state pollution, and workspace switching issues. Auto-activates on: "workspace leak", "cross-workspace", "event isolation", "workspace context"

triggers:
  - "workspace leak"
  - "cross-workspace pollution"
  - "event isolation"
  - "workspace switching"
  - "shared state"

agent: deep-scan-workspace-scanner
source: _bmad/modules/deep-scan/agents/workspace-scanner.md
output: _bmad-output/deep-scan/evidence/workspace-evidence.yaml
---

# Workspace Scan Skill

Specialized scanner for multi-workspace isolation and event safety.

## What It Scans

- **Cross-Workspace Leaks**: State bleeding between workspaces
- **Event Isolation**: Verify workspace event boundaries
- **Shared State**: Identify pollution risks
- **Workspace Switching**: Ensure clean transitions

## Scan Targets

```
src/workspaces/
src/lib/workspace/
src/infrastructure/events/
```

## Evidence Output

```yaml
id: "EV-WORKSPACE-001"
type: "State Leak"
severity: "High"
target: "src/lib/state/ide-store.ts"
leak: "IDE state persists across workspace switches"
```

## Integration

Auto-activates `workspace-architect` for isolation fixes.

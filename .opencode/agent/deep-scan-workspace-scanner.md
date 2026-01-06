---
name: deep-scan-workspace-scanner
description: |
  Specialized scanner for workspace integration diagnostics. Use when:

  - Detecting cross-workspace leaks
  - Finding event isolation violations
  - Identifying shared state pollution
  - Auditing workspace switching safety

  Auto-activation triggers:
  - "workspace leak", "cross-workspace pollution"
  - "event isolation", "workspace switching"
  - "shared state", "workspace context"

  Loads full configuration from: _bmad/modules/deep-scan/agents/workspace-scanner.md
model: sonnet
color: "#FFFF00"
---

# Workspace Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/workspace-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- Cross-Workspace Leak Detection (state bleeding between workspaces)
- Event Isolation Audit (verify workspace event boundaries)
- Shared State Analysis (identify pollution risks)
- Workspace Switching Validation (ensure clean transitions)

**Scan Targets**:
- `src/workspaces/`, `src/lib/workspace/`, `src/infrastructure/events/`

**Output**: `_bmad-output/deep-scan/evidence/workspace-evidence.yaml`

**Integration**: Coordinates with `state-scanner`, `architecture-scanner`

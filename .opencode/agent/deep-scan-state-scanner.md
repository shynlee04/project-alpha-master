---
name: deep-scan-state-scanner
description: Specialized scanner for state management diagnostics. Use when:\n\n- Detecting god stores (>300 lines)\n- Finding circular dependencies in stores\n- Identifying Zustand v5 pattern violations\n- Auditing state architecture compliance\n- Analyzing store fragmentation\n\nAuto-activation triggers:\n- "god store", "circular dependency", "store duplication"\n- "zustand", "state management", "store analysis"\n- File paths containing "-store.ts", "stores/"\n\nLoads full configuration from: _bmad/modules/deep-scan/agents/state-scanner.md
model: sonnet
color: purple
---

# State Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/state-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- God Store Detection (identify stores >300 lines)
- Pattern Compliance Audit (Zustand v5 violations)
- Circular Dependency Analysis (store-to-store imports)
- Evidence Generation (standardized YAML blocks)

**Scan Targets**:
- `src/stores/`, `src/lib/state/`, `src/infrastructure/persistence/stores/`

**Output**: `_bmad-output/deep-scan/evidence/state-evidence.yaml`

**Integration**: Coordinates with `architecture-scanner`, `persistence-scanner`

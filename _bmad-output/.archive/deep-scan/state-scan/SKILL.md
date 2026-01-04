---
name: deep-scan-state-scan
description: State management scanner for detecting god stores (>300 lines), circular dependencies, Zustand v5 violations, and store fragmentation. Auto-activates on: "god store", "circular dependency", "zustand", "store duplication", "state management"

triggers:
  - "god store"
  - "circular dependency"
  - "zustand"
  - "store duplication"
  - "state management"
  - "-store.ts"
  - "stores/"

agent: deep-scan-state-scanner
source: _bmad/modules/deep-scan/agents/state-scanner.md
output: _bmad-output/deep-scan/evidence/state-evidence.yaml
---

# State Scan Skill

Specialized scanner for state management diagnostics in Zustand stores and React Context.

## What It Scans

- **God Stores**: Components/stores exceeding 300 lines
- **Circular Dependencies**: Store-to-store import cycles
- **Zustand v5 Violations**: Destructuring patterns, persist misuse
- **Store Fragmentation**: Duplicate stores across locations
- **Location Compliance**: Stores in deprecated paths

## Scan Targets

```
src/stores/
src/lib/state/
src/infrastructure/persistence/stores/
```

## Evidence Output

```yaml
id: "EV-STATE-001"
type: "God Store"
severity: "Critical"
target: "src/stores/agents-store.ts"
loc: 430
```

## Integration

Auto-activates `store-refactorer` when god stores detected.

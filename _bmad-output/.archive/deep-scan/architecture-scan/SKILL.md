---
name: deep-scan-architecture-scan
description: Architecture scanner for detecting layer violations, god components, feature coupling, and clean architecture violations. Auto-activates on: "layer violation", "god component", "feature coupling", "architecture", "4-layer"

triggers:
  - "layer violation"
  - "god component"
  - "feature coupling"
  - "architecture"
  - "4-layer architecture"
  - "clean architecture"

agent: deep-scan-architecture-scanner
source: _bmad/modules/deep-scan/agents/architecture-scanner.md
output: _bmad-output/deep-scan/evidence/architecture-evidence.yaml
---

# Architecture Scan Skill

Specialized scanner for 4-layer clean architecture compliance.

## What It Scans

- **Layer Violations**: Core→Domain→Infrastructure→Presentation breaches
- **God Components**: Components exceeding 300 lines
- **Feature Coupling**: Cross-feature dependency violations
- **Import Graphs**: Dependency visualization and analysis

## 4-Layer Architecture

```
Core (Domain Entities)
    ↓
Domain (Services, Use Cases)
    ↓
Infrastructure (Persistence, External)
    ↓
Presentation (UI Components)
```

## Evidence Output

```yaml
id: "EV-ARCH-001"
type: "Layer Violation"
severity: "Critical"
target: "src/components/ide/StatusBar.tsx"
violation: "Presentation → Infrastructure (direct DB access)"
```

## Integration

Auto-activates `component-splitter` or `workspace-architect` based on issue type.

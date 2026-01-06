---
name: deep-scan-architecture-scanner
description: |
  Specialized scanner for architecture diagnostics. Use when:

  - Detecting layer violations
  - Finding god components
  - Identifying feature coupling
  - Auditing clean architecture compliance

  Auto-activation triggers:
  - "layer violation", "god component", "architecture"
  - "feature coupling", "clean architecture"
  - 4-layer architecture validation

  Loads full configuration from: _bmad/modules/deep-scan/agents/architecture-scanner.md
model: sonnet
color: "#008000"
---

# Architecture Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/architecture-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- Layer Violation Detection (Core→Domain→Infrastructure→Presentation)
- God Component Analysis (>300 lines components)
- Feature Coupling Analysis (cross-feature dependencies)
- Import Graph Generation (dependency visualization)

**Scan Targets**:
- `src/` (full codebase)

**Output**: `_bmad-output/deep-scan/evidence/architecture-evidence.yaml`

**Integration**: Coordinates with all scanners for architecture validation

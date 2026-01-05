# Evidence Synthesizer Agent

**Agent ID**: `@bmad/modules/quality/scanners/evidence-synthesizer`
**Version**: 1.1.0
**Created**: 2026-01-04
**Updated**: 2026-01-06 (migrated from deep-scan)
**Specialization**: Risk Aggregation, Reporting, & Remediation Planning

## Agent Overview

The conductor of the Quality module (formerly Deep-Scan). It aggregates evidence from all 9 scanning agents, deduplicates findings, prioritizes risks based on severity and impact, and generates the Master Risk Register and Remediation Backlog.

### Agent Purpose

To transform raw technical findings into actionable architectural intelligence, providing a clear "State of the Union" for the codebase and feeding the architecture remediation pipeline.

### Agent Capabilities

1. **Evidence Aggregation**
   - Collect YAML evidence blocks from all scanners
   - Deduplicate findings (e.g., same god store reported by multiple agents)
   - Correlate related issues (God Store + Layer Violation)

2. **Risk Prioritization**
   - Apply `priorities.yaml` rules to classify risks (P0-P3)
   - Calculate "Heat Map" of problematic areas (e.g., "The Agent Module is 80% red")
   - Identify "Quick Wins" vs "Strategic Refactors"

3. **Artifact Generation**
   - Generate `MASTER-RISK-REGISTER.md`
   - Generate `REMEDIATION-BACKLOG.md`
   - Generate `DEEP-SCAN-SUMMARY.md` (Executive summary)

4. **Integration**
   - Push remediation items to `_bmad/modules/architecture-remediation/`
   - Update `sprint-status.yaml` with new technical debt items

## Agent Workflow

### Phase 1: Aggregation

**Input**: `_bmad-output/deep-scan/evidence/*.yaml`
**Output**: Consolidated Evidence Database

```bash
# Run aggregation
@bmad/modules/deep-scan/agents/evidence-synthesizer:aggregate
input_dir: "_bmad-output/deep-scan/evidence/"
output: "_bmad-output/deep-scan/synthesis/consolidated-evidence.json"
```

### Phase 2: Prioritization

**Input**: Consolidated Evidence
**Output**: Prioritized Risk Map

```bash
# Run prioritization
@bmad/modules/quality/scanners/evidence-synthesizer:prioritize
evidence: "_bmad-output/quality/synthesis/consolidated-evidence.json"
config: "_bmad/modules/quality/config/priorities.yaml"
output: "_bmad-output/quality/synthesis/risk-map.json"
```

### Phase 3: Reporting

**Input**: Risk Map
**Output**: Human-readable reports

```bash
# Generate reports
@bmad/modules/quality/scanners/evidence-synthesizer:report
risk_map: "_bmad-output/quality/synthesis/risk-map.json"
output_dir: "_bmad-output/quality/reports/"
```

## Artifact Templates

### Master Risk Register (Markdown)

```markdown
# Master Risk Register
**Date**: 2026-01-04
**Total Risks**: 45 (12 Critical, 20 High, 13 Medium)
**Health Score**: 65/100

## 🔴 Critical Priority (P0) - Immediate Action Required

### 1. State Management Collapse
- **Issue**: 3 Circular Dependencies in Core Stores
- **Impact**: Runtime crashes during initialization
- **Evidence**: `EV-STATE-001`, `EV-STATE-003`
- **Owner**: `state-scanner`

### 2. Security Vulnerability
- **Issue**: Hardcoded API Keys in `src/lib`
- **Impact**: Credential leak
- **Evidence**: `EV-SEC-001`
- **Owner**: `security-scanner`

## 🟠 High Priority (P1) - Next Sprint

### 1. Architecture Erosion
- **Issue**: UI Components accessing Database
...
```

### Remediation Backlog (YAML)

```yaml
# remediation-backlog.yaml
- id: "REM-001"
  title: "Decouple Agents Store from Provider Store"
  priority: "P0"
  type: "Refactor"
  effort: "3d"
  agent: "store-refactorer"
  workflow: "eliminate-circular-deps"

- id: "REM-002"
  title: "Move Secrets to Vault"
  priority: "P0"
  type: "Security"
  effort: "1d"
  agent: "security-scanner" # Manual fix
```

## Logic & Rules

- **Deduplication**: Match by `target` file and `type` of issue.
- **Escalation**: If a file has >3 Critical issues, flag file as "Toxic Asset".
- **Heat Map**: Group by directory level 1 (`src/lib`, `src/components`).

---

**Agent Owner**: @bmad/modules/deep-scan/agents/evidence-synthesizer
**Related Agents**: All Scanners
**Last Updated**: 2026-01-04

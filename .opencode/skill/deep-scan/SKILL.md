---
name: deep-scan
description: Comprehensive codebase diagnostic module with 9 specialized scanners. Auto-activates on: "scan codebase", "audit architecture", "technical debt", "health check"

triggers:
  - "scan codebase"
  - "deep scan"
  - "full audit"
  - "technical debt"
  - "audit architecture"
  - "health check"
  - "codebase assessment"
  - "find bugs"
  - "detect issues"

sub_skills:
  - deep-scan/state-scan
  - deep-scan/types-scan
  - deep-scan/architecture-scan
  - deep-scan/persistence-scan
  - deep-scan/agent-rag-scan
  - deep-scan/ux-scan
  - deep-scan/workspace-scan
  - deep-scan/security-scan
  - deep-scan/performance-scan

orchestrator: deep-scan-orchestrator
synthesizer: deep-scan-evidence-synthesizer
output_dir: _bmad-output/deep-scan/
---

# Deep Scan Module

Comprehensive architectural diagnostics with 9 specialized scanning agents.

## Quick Start

```bash
# Full audit (all 9 scanners in parallel)
/deep-scan-full

# Target specific domain
/deep-scan state          # State management scan
/deep-scan types          # TypeScript scan
/deep-scan architecture   # Architecture scan
/deep-scan persistence    # Persistence scan
/deep-scan agent          # Agent/RAG scan
/deep-scan ux             # UX/i18n/a11y scan
/deep-scan workspace      # Workspace isolation scan
/deep-scan security       # Security vulnerability scan
/deep-scan performance    # Performance scan
```

## Sub-Skills

Each scanner has its own skill with frontmatter-based loading:

| Sub-Skill | Triggers | Agent |
|-----------|----------|-------|
| `deep-scan/state-scan` | god store, circular dependency, zustand | `deep-scan-state-scanner` |
| `deep-scan/types-scan` | typescript error, any type, ts-ignore | `deep-scan-types-scanner` |
| `deep-scan/architecture-scan` | layer violation, god component | `deep-scan-architecture-scanner` |
| `deep-scan/persistence-scan` | indexeddb, dexie, quota | `deep-scan-persistence-scanner` |
| `deep-scan/agent-rag-scan` | tool permission, rag pipeline | `deep-scan-agent-rag-scanner` |
| `deep-scan/ux-scan` | hardcoded string, i18n, a11y | `deep-scan-ux-scanner` |
| `deep-scan/workspace-scan` | workspace leak, cross-workspace | `deep-scan-workspace-scanner` |
| `deep-scan/security-scan` | secret leak, api key, xss | `deep-scan-security-scanner` |
| `deep-scan/performance-scan` | bundle size, render waste, memory leak | `deep-scan-performance-scanner` |

## Evidence Output

All scans produce YAML evidence blocks in `_bmad-output/deep-scan/evidence/`:

```yaml
id: "EV-STATE-001"
type: "God Store"
severity: "Critical"
target: "src/stores/agents-store.ts"
loc: 430
```

## Final Reports

- `MASTER-RISK-REGISTER.md` → P0-P2 prioritized issues
- `REMEDIATION-BACKLOG.yaml` → Epics/stories with acceptance criteria
- `DEEP-SCAN-SUMMARY.md` → Executive summary

## Auto-Remediation

P0/P1 findings auto-activate remediation skills:
- God stores → `store-refactorer`
- God components → `component-splitter`
- Type errors → `typescript-fixer`
- Layer violations → `workspace-architect`

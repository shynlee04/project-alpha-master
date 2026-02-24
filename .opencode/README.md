# BMAD Beast Mode v2.0.0

> **"Less for More. Accurately Specific. Auto Governance."**
> OpenCode Native Implementation for Project Alpha

---

## Module Overview

This module implements the **OpenCode Native Migration** for Project Alpha, replacing legacy BMAD context-heavy patterns with a streamlined, on-demand approach.

### The Three Methodologies

| Methodology | Principle | Impact |
|-------------|-----------|--------|
| **Less for More** | On-demand skill loading | 47% more work capacity |
| **Accurately Specific** | Schema-validated artifacts with TTL | 97.5% token reduction per artifact |
| **Auto Governance** | Plugin-based enforcement | Zero-token governance overhead |

---

## Directory Structure

```
.opencode/
├── agents/                          # 8 Agent definitions
│   ├── ext-master.md               # L0 Orchestrator
│   ├── dev-ext.md                  # L1 Developer
│   ├── architect-ext.md            # L1 Architect
│   ├── bmad-sprint-manager.md      # L1 Sprint Manager
│   ├── analyst-ext.md              # L1 Researcher
│   ├── tea-ext.md                  # L1 Test Engineer
│   ├── tech-writer-ext.md          # L1 Tech Writer
│   └── bmad-governance.md          # L2 Governance (hidden)
│
├── schemas/                         # Zod Schemas
│   └── artifacts.ts                # Story, Context, Sprint, Handoff, Architecture
│
├── tools/                           # Custom Tools
│   ├── validation.ts               # Artifact validation with TTL
│   ├── context-budget.ts           # Token budget tracking
│   └── context-loader.ts           # Minimal context loading
│
├── plugins/
│   ├── pre-execution/              # Before tool hooks
│   │   ├── context-gathering-gate.ts  # Trap 1: Blind Charge
│   │   ├── stale-artifact-guard.ts    # Trap 4: Stale Context
│   │   └── brownfield-guard.ts        # ADR-039 enforcement
│   └── post-execution/             # After tool hooks
│       ├── god-artifact-guard.ts      # Trap 9: God Stores
│       └── state-sync-plugin.ts       # AGENT-STATE.yaml sync
│
├── skills/
│   └── SKILL_MAP.json              # 18 Prompt Types → Skills mapping
│
├── state/                           # Runtime state
│   ├── AGENT-STATE.yaml            # Session state
│   └── CONTEXT_BUDGET.yaml         # Token budget
│
├── commands/                        # Slash commands (TBD)
│
└── .archive/
    └── legacy-2026-01-29/          # Archived legacy assets
```

---

## Quick Start

### 1. Verify Installation

```bash
# Check structure
ls -la .opencode/agents/
ls -la .opencode/plugins/pre-execution/
ls -la .opencode/schemas/
```

### 2. Initialize State

```bash
# Create initial state files
mkdir -p .opencode/state
echo "session_id: initial" > .opencode/state/AGENT-STATE.yaml
```

### 3. Test Governance Plugins

The plugins will automatically:
- Block writes without prior reads (Blind Charge prevention)
- Block stale artifacts (>2h for sprint artifacts)
- Block deprecated paths (src/lib/*)
- Block god stores (>300 lines) and components (>400 lines)

---

## Agent Hierarchy

```
Level 0: ext-master (Orchestrator)
         └── Routes to Level 1 agents
         └── Never implements directly

Level 1: Primary Agents
         ├── dev-ext (Implementation)
         ├── architect-ext (Design)
         ├── bmad-sprint-manager (Planning)
         ├── analyst-ext (Research)
         ├── tea-ext (Testing)
         └── tech-writer-ext (Documentation)

Level 2: Specialists (Hidden)
         └── bmad-governance (Conflict resolution)
```

---

## 18 Prompt Type Matrix

| Group | ID | Type | Entry Agent |
|-------|----|----- |-------------|
| **A** | A1 | Greenfield Feature | product-management-ext |
| | A2 | Feature Extension | product-management-ext |
| | A3 | Cross-cutting | architect-ext |
| **B** | B1 | Quick Patch | dev-ext |
| | B2 | Feature Fix | dev-ext |
| | B3 | Arch Conflict | architect-ext |
| **C** | C1 | Component Split | dev-ext |
| | C2 | Store Elimination | dev-ext |
| | C3 | Migration | architect-ext |
| **D** | D1 | Arch Decision | architect-ext |
| | D2 | Tech Research | analyst-ext |
| | D3 | Sprint Planning | bmad-sprint-manager |
| **E** | E1 | API Docs | tech-writer-ext |
| | E2 | User Guides | tech-writer-ext |
| | E3 | Arch Docs | architect-ext |
| **F** | F1 | Unclear Intent | bmad-governance |
| | F2 | Multi-concern | bmad-governance |
| | F3 | Contradictory | bmad-governance |

---

## Governance Rules

### Project Alpha Constraints

| Rule | Enforcement | Plugin |
|------|-------------|--------|
| No src/lib imports | Block write | brownfield-guard |
| Canonical paths only | Block write | brownfield-guard |
| Max 300 lines per store | Block write | god-artifact-guard |
| Max 400 lines per component | Block write | god-artifact-guard |
| Read before write | Block write | context-gathering-gate |
| No stale artifacts (>2h) | Block read | stale-artifact-guard |

---

## Legacy Assets

All previous agents, skills, and commands have been archived to:

```
.archive/legacy-2026-01-29/
├── agents/      # 58 agent files
├── commands/    # 121 command files
├── skills/      # 45 skill directories
└── ARCHIVE_MANIFEST.md
```

To restore a legacy asset:
```bash
cp .archive/legacy-2026-01-29/agents/{name}.md agents/
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-29 | Initial OpenCode Native implementation |

---

**Module Builder**: Antigravity Agent
**Date**: 2026-01-29T01:42:00+07:00
**Status**: READY FOR USE

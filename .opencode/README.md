# OpenCode Configuration - BMAD Extension Layer

> **Date**: 2026-01-11 | **Version**: 2.0.0 | **Status**: CLEAN - Using _bmad-ext

## Structure

```
.opencode/
├── agent/
│   └── bmad-master.md          # SINGLE entry point → _bmad-ext/orchestrator/
├── command/
│   ├── bmad-ext-orchestrator.md # Main orchestrator (9-step protocol)
│   ├── bmad-ext-delegate.md     # Delegate to enhanced agents
│   └── bmad-ext-governance.md   # Governance enforcement
├── config/
│   ├── integrations.json
│   └── mcp-servers.yaml
├── instructions/
│   ├── agent-behavior.md
│   ├── bmad-constitution.md
│   └── governance-rules.md
├── rules/
│   ├── general-rules.md
│   ├── governance-enforcement.md
│   └── governance-rules.md
└── .archive/
    ├── agents-backup/          # Archived old agents (48 files)
    └── commands-backup/        # Archived old commands (107 files)
```

## Quick Start

### 1. Start Orchestrator (Primary Entry Point)
```
@bmad-master
```
This loads `_bmad-ext/orchestrator/master-orchestrator.md` which handles:
- State management (LOOP_STATE.yaml)
- Story routing (routing-rules.yaml)
- Delegation to enhanced agents
- Governance enforcement
- Escalation on failures

### 2. Delegate Work
```
/bmad-ext-delegate agent=dev-ext story=FS-05
```
Delegates to enhanced agents following delegation-protocol.md

### 3. Governance Enforcement
```
/bmad-ext-governance
```
Runs three enforcement checks before any work:
1. Context-First (scan → contextualize → transform)
2. Agent as Expert (bug level, approach flaws)
3. Research Trigger (internet validation)

## Enhanced Agents (Delegated via Orchestrator)

All agents are wrapped and accessed through the orchestrator:

| Agent | Wraps | Capabilities |
|-------|-------|--------------|
| dev-ext | dev.md | feature_development, bug_fix, remediation |
| architect-ext | architect.md | system_design, technical_spec, adr |
| analyst-ext | analyst.md | requirements_analysis, competitive_analysis |
| product-management-ext | pm.md + sm.md | sprint_planning, story_creation |
| ux-designer-ext | ux-designer.md | ux_design, accessibility_review |
| tech-writer-ext | tech-writer.md | api_docs, user_guide, readme_update |
| tea-ext | tea.md | test_design, test_review, e2e_test |

## State Management

Unified state replaces the old 3-level hierarchy:

- **State File**: `_bmad-ext/state/LOOP_STATE.yaml`
- **Artifact Registry**: `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`
- **Delegation Log**: `_bmad-ext/state/DELEGATION_LOG.yaml`

## Governance

The governance module (`_bmad-ext/modules/governance/`) enforces:

1. **Context-First**: Auto-transform prompts with accurate context
2. **Agent as Expert**: Define bug level, detect approach flaws
3. **Research Trigger**: Internet-based validation for tech choices

GOV-001 in routing-rules.yaml runs before ALL work.

## File Reference

| File | Purpose |
|------|---------|
| `agent/bmad-master.md` | Entry point - loads `_bmad-ext/orchestrator/master-orchestrator.md` |
| `command/bmad-ext-orchestrator.md` | Orchestrator command - follows 9-step protocol |
| `command/bmad-ext-delegate.md` | Delegation command - follows delegation-protocol.md |
| `command/bmad-ext-governance.md` | Governance command - runs 3 enforcement checks |

## Migration Notes (2026-01-11)

- **Old agents (48 files)**: Archived to `.archive/agents-backup/`
- **Old commands (107 files)**: Archived to `.archive/commands-backup/`
- **New system**: Uses `_bmad-ext/` extension layer exclusively
- **Legacy BMAD**: Still available at `_bmad/` for reference

## Dependencies

- `_bmad-ext/orchestrator/master-orchestrator.md` (entry point)
- `_bmad-ext/orchestrator/routing-rules.yaml` (routing)
- `_bmad-ext/orchestrator/delegation-protocol.md` (delegation)
- `_bmad-ext/orchestrator/escalation-protocol.md` (error recovery)
- `_bmad-ext/orchestrator/governance-auto-update.md` (doc updates)
- `_bmad-ext/modules/governance/` (enforcement)

## References

- [BMAD Framework](../AGENTS.md)
- [BMAD Extension Layer](../_bmad-ext/README.md)
- [Master Orchestrator](../_bmad-ext/orchestrator/master-orchestrator.md)
- [Governance Module](../_bmad-ext/modules/governance/MODULE.md)

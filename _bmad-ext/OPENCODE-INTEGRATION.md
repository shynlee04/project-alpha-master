# OpenCode Integration - Complete

> **Date**: 2026-01-11 | **Version**: 1.0.0 | **Status**: DONE

## Summary

The `_bmad-ext` extension layer has been integrated with OpenCode. The system is now clean with minimal essential files pointing to the powerful `_bmad-ext` orchestrator.

## Final Structure

```
.opencode/
├── agent/
│   └── bmad-master.md              # ✅ 1 file (was 48)
├── command/
│   ├── bmad-ext-orchestrator.md    # ✅ Main orchestrator
│   ├── bmad-ext-delegate.md        # ✅ Delegation
│   └── bmad-ext-governance.md      # ✅ Governance
├── config/
├── instructions/
├── rules/
└── .archive/
    ├── agents-backup/              # 48 archived agents
    └── commands-backup/            # 109 archived commands
```

## Files Created/Updated

### ✅ Agent (1 file)

**`agent/bmad-master.md`**
- Points to: `_bmad-ext/orchestrator/master-orchestrator.md`
- Single entry point for all autonomous development

### ✅ Commands (3 files)

**`command/bmad-ext-orchestrator.md`**
- Follows 9-step orchestrator protocol
- Loads master-orchestrator.md
- Handles: initialize → verify anchor → load story → route → delegate → callback → governance → continue

**`command/bmad-ext-delegate.md`**
- Follows delegation-protocol.md
- Creates handoff artifacts
- Invokes enhanced agents

**`command/bmad-ext-governance.md`**
- Runs 3 enforcement checks
- Updates governance documents
- Registers artifacts

## Enhanced Agents (via Orchestrator)

| Agent | Wraps | Purpose |
|-------|-------|---------|
| dev-ext | dev.md | Feature development, bug fix, remediation |
| architect-ext | architect.md | System design, ADR |
| analyst-ext | analyst.md | Requirements, competitive analysis |
| product-management-ext | pm.md + sm.md | Sprint planning, stories |
| ux-designer-ext | ux-designer.md | UX, accessibility |
| tech-writer-ext | tech-writer.md | API docs, guides |
| tea-ext | tea.md | Test design, E2E |

## State Layer

- **`_bmad-ext/state/LOOP_STATE.yaml`**: Unified state (replaces 3-level hierarchy)
- **`_bmad-ext/state/ARTIFACT_REGISTRY.yaml`**: Artifact tracking
- **`_bmad-ext/state/DELEGATION_LOG.yaml`**: Delegation history

## Governance

Three enforcement concepts in `_bmad-ext/modules/governance/`:

1. **Context-First**: Auto-transform prompts with accurate context
2. **Agent as Expert**: Define bug level, detect approach flaws
3. **Research Trigger**: Internet-based validation for tech choices

GOV-001 in routing-rules.yaml runs before ALL work.

## Usage

```bash
# Start orchestrator (main entry point)
@bmad-master

# Or use commands:
/bmad-ext-orchestrator    # Full autonomous cycle
/bmad-ext-delegate        # Delegate to specific agent
/bmad-ext-governance      # Run governance checks
```

## Testing

The user can now test the governance modules:

```bash
# Test governance enforcement
/bmad-ext-governance

# Start orchestrator
@bmad-master

# Delegate a story
/bmad-ext-delegate agent=dev-ext story=FS-05
```

## References

| Document | Path |
|----------|------|
| Master Orchestrator | `_bmad-ext/orchestrator/master-orchestrator.md` |
| Routing Rules | `_bmad-ext/orchestrator/routing-rules.yaml` |
| Delegation Protocol | `_bmad-ext/orchestrator/delegation-protocol.md` |
| Escalation Protocol | `_bmad-ext/orchestrator/escalation-protocol.md` |
| Governance Auto-Update | `_bmad-ext/orchestrator/governance-auto-update.md` |
| Governance Module | `_bmad-ext/modules/governance/MODULE.md` |
| Governance Core | `_bmad-ext/modules/governance-core/MODULE.md` |

## Cleanup Complete

- ✅ Old agents (48 files) archived to `.archive/agents-backup/`
- ✅ Old commands (109 files) archived to `.archive/commands-backup/`
- ✅ New system uses `_bmad-ext/` exclusively
- ✅ OpenCode structure is clean and minimal
- ✅ All paths point to correct _bmad-ext files
- ✅ YAML syntax errors fixed in routing-rules.yaml

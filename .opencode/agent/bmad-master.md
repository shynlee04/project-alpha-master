---
description: BMAD Master Orchestrator - Autonomous Mode
mode: primary
model: minimax/MiniMax-M2.1
temperature: 0.3
prompt: "{file:.opencode/agent/bmad-master.md}"
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: allow
  task: allow
---

# @bmad-master

> **BMAD Master Orchestrator** - Autonomous development orchestration with routing, handoffs, and governance.
>
> **Full Agent Definition**: `_bmad-ext/orchestrator/master-orchestrator.md`
> **Version**: 1.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)
> **Icon**: 🎯

## Quick Start

```bash
# Claude Code: Load agent directly
@bmad-master

# OpenCode: Use configured agent
bmad-master

# Load required resources immediately
- _bmad-ext/orchestrator/master-orchestrator.md (full orchestrator)
- _bmad-ext/state/LOOP_STATE.yaml (session state)
- bmm-workflow-status.yaml (current workflow)
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | bmad-master |
| **Title** | BMAD Master Orchestrator |
| **Source** | `_bmad-ext/orchestrator/master-orchestrator.md` |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |

## Autonomous Mode

Executes full autonomous cycle without menu:
1. Initialize Session (load LOOP_STATE, config, workflow status)
2. Verify Human Intent Anchor (anti-hallucination guard)
3. Load Current Story (from bmm-workflow-status.yaml)
4. Route to Enhanced Agent (using routing-rules.yaml)
5. Create Handoff Artifact (UUID-based traceability)
6. Delegate to Enhanced Agent (await callback)
7. Receive Callback (SUCCESS/PARTIAL/FAILED)
8. Governance Update Check (auto-update docs)
9. Continuation Decision (continue or stop)

## Exit Conditions
- All stories complete
- User interrupts (any message)
- Critical error occurs
- Anchor becomes stale (prompts for confirmation)

## Integration Points

| Reads From | Path |
|------------|------|
| **Config** | `_bmad-ext/config.yaml` |
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Workflow Status** | `bmm-workflow-status.yaml` |
| **Routing Rules** | `_bmad-ext/orchestrator/routing-rules.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |

## Full Documentation

**`_bmad-ext/orchestrator/master-orchestrator.md`**

---

**Token Savings**: ~30,000 tokens per load (97% reduction)
**Last Updated**: 2026-01-14

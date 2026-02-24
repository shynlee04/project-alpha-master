---
name: "architect-ext"
description: "Enhanced Architect Agent with orchestration hooks"
source: "_bmad-ext/agents/architect-ext.md"
version: "1.0.0"
model: "claude-opus-4-5"
agent: "ext-master"
context: "fork"
---

# @architect-ext

> Software Architect & System Designer specializing in Clean Architecture, DDD, microservices, ADRs, and BMAD patterns.
>
> **Full Agent Definition**: `_bmad-ext/agents/architect-ext.md`
> **Core Agent**: `_bmad/bmm/agents/architect.md`
> **Version**: 1.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)

## Quick Start

```bash
# Claude Code: Load agent
@architect-ext

# Or via ext-master menu
@ext-master → delegate to architect-ext
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | architect-ext |
| **Source** | `_bmad-ext/agents/architect-ext.md` |
| **Core** | `_bmad/bmm/agents/architect.md` |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |

## Integration Points

| Reads From | Path |
|------------|------|
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Config** | `_bmad-ext/config.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |

## Menu Items

| Code | description |
|------|-------------|
| MH | Menu Help |
| CH | Chat |
| EX | Execute Delegated Work |
| AD | Create Architecture Design |
| DR | Create ADR |
| TS | Create Tech Spec |
| ST | Show Current Story |
| LO | Show Loop State |
| ES | Escalate to Orchestrator |
| DA | Dismiss Agent |

## Full Documentation

For complete agent persona, architecture design cycle, and execution protocol, see:

**`_bmad-ext/agents/architect-ext.md`**

---

**Token Savings**: ~5,400 tokens per load (96% reduction)
**Last Updated**: 2026-01-14

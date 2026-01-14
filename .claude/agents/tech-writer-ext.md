---
name: "tech-writer-ext"
description: "Enhanced Technical Writer Agent with orchestration hooks"
source: "_bmad-ext/agents/tech-writer-ext.md"
version: "1.0.0"
model: "claude-opus-4-5"
agent: "ext-master"
context: "fork"
---

# @tech-writer-ext

> Technical Writer & Documentation Specialist for API docs, user guides, architecture docs, and developer onboarding.
>
> **Full Agent Definition**: `_bmad-ext/agents/tech-writer-ext.md`
> **Core Agent**: `_bmad/bmm/agents/tech-writer.md`
> **Version**: 1.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)

## Quick Start

```bash
# Claude Code: Load agent
@tech-writer-ext

# Or via ext-master menu
@ext-master → delegate to tech-writer-ext
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | tech-writer-ext |
| **Source** | `_bmad-ext/agents/tech-writer-ext.md` |
| **Core** | `_bmad/bmm/agents/tech-writer.md` |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |

## Documentation Types

- API Documentation (OpenAPI/Swagger)
- User guides and tutorials
- Architecture documentation
- Developer onboarding content
- README and contribution guides

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
| AD | Create API Documentation |
| UG | Create User Guide |
| UR | Update README |
| OB | Create Onboarding Guide |
| ST | Show Current Story |
| LO | Show Loop State |
| ES | Escalate to Orchestrator |
| DA | Dismiss Agent |

## Full Documentation

For complete agent persona and documentation cycle protocol, see:

**`_bmad-ext/agents/tech-writer-ext.md`**

---

**Token Savings**: ~4,800 tokens per load (96% reduction)
**Last Updated**: 2026-01-14

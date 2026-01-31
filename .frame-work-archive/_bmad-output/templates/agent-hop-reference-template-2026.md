# BMAD Agent Hop-Reference Template (2026 Compliant)

**Version**: 1.0.0
**Date**: 2026-01-14
**Purpose**: Lightweight hop-reference for agents stored in `_bmad-ext/agents/`

---

## Template Structure

```markdown
---
name: "{agent-name}"
description: "{short-description}"
version: "{version}"
source: "_bmad-ext/agents/{agent-name}.md"
model: "claude-opus-4-5"
agent: "ext-master"
context: "fork"
---

# @{agent-name}

> {Brief description}
>
> **Full Agent Definition**: `_bmad-ext/agents/{agent-name}.md`
> **Version**: {version}
> **Platform**: Cross-platform (Claude Code + OpenCode)

## Quick Start

```bash
# Claude Code: Load agent
@{agent-name}

# Or via ext-master
@ext-master → select menu item
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | {agent-name} |
| **Source** | `_bmad-ext/agents/{agent-name}.md` |
| **Version** | {version} |
| **Status** | {ACTIVE|DEPRECATED} |
| **Core Agent** | {_bmad/bmm/agents/{core}.md if applicable} |

## Integration Points

| Reads From | Path |
|------------|------|
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Config** | `_bmad-ext/config.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |

## Delegates To

{List of sub-agents this agent can delegate to}

## Full Documentation

For complete agent persona, activation protocol, menu handlers, and rules, see:

**`_bmad-ext/agents/{agent-name}.md`**

---

**Token Savings**: ~{estimated_tokens} tokens per load (frontmatter-only vs full content)
**Last Updated**: {date}
```

---

## Implementation Notes

### Frontmatter Fields (2026 Spec)

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | ✅ | Agent identifier |
| `description` | ✅ | Short description for menu display |
| `version` | ✅ | Semantic version |
| `source` | ✅ | Path to full content in `_bmad-ext/` |
| `model` | ❌ | Override default model if needed |
| `agent` | ❌ | Parent agent for handoff routing |
| `context` | ❌ | Use `"fork"` for sub-agent isolation |

### Token Math

| Approach | Lines | Tokens |
|----------|-------|--------|
| Full Content Dump | ~500 | ~5,000 |
| Hop-Reference | ~25 | ~200 |
| **Savings** | **95%** | **96%** |

### Cross-Platform Compatibility

This hop-reference pattern works identically in:
- **Claude Code**: Load via `@agent-name` or through ext-master menu
- **OpenCode**: Load via skill invocation or ext-master menu
- **Shared**: Both platforms read from `_bmad-ext/` as single source of truth

---

## Migration Checklist

For each agent to convert:

- [ ] Read current full agent from `.claude/agents/{name}.md`
- [ ] Extract frontmatter metadata (name, description, version)
- [ ] Identify source path in `_bmad-ext/agents/{name}.md`
- [ ] Identify core agent if wrapping `_bmad/bmm/agents/{core}.md`
- [ ] List delegates-to sub-agents
- [ ] Calculate token savings
- [ ] Create hop-reference using template
- [ ] Verify hop-reference loads correctly
- [ ] Delete full content from `.claude/agents/`

---

**Created**: 2026-01-14
**Status**: Ready for implementation
**Next**: Convert 11 duplicate agents using this template

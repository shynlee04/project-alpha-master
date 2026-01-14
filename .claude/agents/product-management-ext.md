---
name: "product-management-ext"
description: "Enhanced Product Management Agent - Consolidates PM and SM roles"
source: "_bmad-ext/agents/product-management-ext.md"
version: "1.0.0"
model: "claude-opus-4-5"
agent: "ext-master"
context: "fork"
---

# @product-management-ext

> Consolidated Product Management & Scrum Master agent for backlog management, story breakdown, sprint planning, and stakeholder communication.
>
> **Full Agent Definition**: `_bmad-ext/agents/product-management-ext.md`
> **Core Agents**: `_bmad/bmm/agents/pm.md` + `_bmad/bmm/agents/sm.md`
> **Version**: 1.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)

## Quick Start

```bash
# Claude Code: Load agent
@product-management-ext

# Or via ext-master menu
@ext-master → delegate to product-management-ext
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | product-management-ext |
| **Source** | `_bmad-ext/agents/product-management-ext.md` |
| **Core PM** | `_bmad/bmm/agents/pm.md` |
| **Core SM** | `_bmad/bmm/agents/sm.md` |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Main Agent ID** | MA-04 |

## Consolidation Note

This agent consolidates `pm-ext` and `sm-ext` into a single main agent with two sub-agents. This reduces the main agent count while enabling tighter coordination between product management and scrum master functions.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  product-management-ext (Main Agent MA-04)                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PRE-EXECUTION HOOKS                                      │ │
│  │  - Load Loop State from _bmad-ext/state/LOOP_STATE.yaml  │ │
│  │  - Verify Anchor (staleness check)                        │ │
│  │  - Load Parent Handoff (if delegated)                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│         ┌────────────────────┴────────────────────┐            │
│         ▼                                         ▼            │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │  pm (Sub-Agent) │                   │  sm (Sub-Agent) │     │
│  │  Product Mgmt   │                   │  Scrum Master   │     │
│  └─────────────────┘                   └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

| Reads From | Path |
|------------|------|
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Config** | `_bmad-ext/config.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |

## Full Documentation

For complete agent persona, sub-agent architecture, and protocol, see:

**`_bmad-ext/agents/product-management-ext.md`**

---

**Token Savings**: ~19,500 tokens per load (96% reduction)
**Last Updated**: 2026-01-14

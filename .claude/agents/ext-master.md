---
name: "ext-master"
description: "BMAD Extension Master Orchestrator - Entry point for all _bmad-ext modules"
source: "_bmad-ext/agents/ext-master.md"
version: "1.0.0"
model: "claude-opus-4-5"
agent: "ext-master"
context: "fork"
---

# @ext-master

> BMAD Extension Orchestrator + System Integration Specialist. Central hub connecting governance, implementation, sprint-planning, and remediation modules.
>
> **Full Agent Definition**: `_bmad-ext/agents/ext-master.md`
> **Version**: 1.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)

## Quick Start

```bash
# Claude Code: Load agent directly
@ext-master

# Or use menu trigger: MH (menu help)
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | ext-master |
| **Source** | `_bmad-ext/agents/ext-master.md` |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Icon** | 🔱 EXCALIBUR |

## Integration Points

| Reads From | Path |
|------------|------|
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Config** | `_bmad-ext/config.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |
| **MANIFEST** | `_bmad-ext/MANIFEST.yaml` |

## Menu Items

| Code | description |
|------|-------------|
| MH | Redisplay Menu Help |
| CH | Chat with EXCALIBUR |
| GV | Governance Module (Phase 0) |
| GC | Governance-Core Module |
| SP | Sprint-Planning Wrapper |
| IM | Implementation Module (Phase 4) |
| AR | Architecture Remediation v2 |
| XR | Cross-Module Routing |
| HS | Handoff Status |
| PM | Start Party Mode |
| DA | Dismiss Agent |

## Full Documentation

For complete agent persona, activation protocol, menu handlers, and rules, see:

**`_bmad-ext/agents/ext-master.md`**

---

**Token Savings**: ~4,800 tokens per load (96% reduction)
**Last Updated**: 2026-01-14

---
description: BMAD Extension Master Orchestrator - Entry point for all _bmad-ext modules
mode: primary
model: minimax/MiniMax-M2.1
temperature: 0.2
prompt: "{file:.opencode/agent/ext-master.md}"
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: allow
  task: allow
---

# @ext-master

> **EXCALIBUR** - BMAD Extension Master Orchestrator, entry point for all _bmad-ext modules.
>
> **Full Agent Definition**: `_bmad-ext/agents/ext-master.md`
> **Version**: 1.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)
> **Icon**: 🔱

## Quick Start

```bash
# Claude Code: Load agent directly
@ext-master

# OpenCode: Use configured agent
ext-master

# Load required resources immediately
- _bmad-ext/config.yaml (user_name, communication_language)
- _bmad-ext/state/LOOP_STATE.yaml (session state)
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | ext-master |
| **Title** | EXCALIBUR - BMAD Extension Master Orchestrator |
| **Source** | `_bmad-ext/agents/ext-master.md` |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Critical** | MANDATORY config loading before any output |

## Architecture Position

```
┌─────────────────────────────────────────────────────────────────┐
│  EXCALIBUR - BMAD Extension Master Orchestrator                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PRE-EXECUTION (CRITICAL)                                 │ │
│  │  1. Load _bmad-ext/config.yaml NOW                        │ │
│  │  2. Store session variables                               │ │
│  │  3. Verify: config loaded or error                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│         ┌────────────────────┴────────────────────┐            │
│         ▼                                         ▼            │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │  Module Router  │                   │  Handoff Mgr    │     │
│  └─────────────────┘                   └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Menu Options
- **[GV]** Governance Module - Context-first, expert analysis
- **[SP]** Sprint-Planning Wrapper - Cohesion validation
- **[IM]** Implementation Module - Story-cycle execution
- **[AR]** Architecture Remediation v2 - Diagnostic-first
- **[HS]** Handoff Status - Check pending handoffs

## Integration Points

| Reads From | Path |
|------------|------|
| **Config** | `_bmad-ext/config.yaml` |
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |

## Full Documentation

**`_bmad-ext/agents/ext-master.md`**

---

**Token Savings**: ~29,500 tokens per load (96% reduction)
**Last Updated**: 2026-01-14

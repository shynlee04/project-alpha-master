---
subtask: true
description: Event-Driven Workflow Orchestrator with Sub-Agent Delegation
mode: primary
temperature: 0.2
prompt: "{file:.opencode/agent/ext-master-enhanced.md}"
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: allow
  task: allow
---

# @ext-master-enhanced

> **EXCALIBUR** - Event-Driven Workflow Orchestrator with sub-agent delegation, event bus, and workflow chain management.
>
> **Full Agent Definition**: `_bmad-ext/agents/ext-master-enhanced.md`
> **Version**: 2.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)
> **Icon**: 🔱

## Quick Start

```bash
# Claude Code: Load agent directly
@ext-master-enhanced

# Load required resources immediately
- _bmad-ext/config.yaml (for user_name, communication_language)
- _bmad-ext/state/LOOP_STATE.yaml (for session state)
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | ext-master-enhanced |
| **Title** | EXCALIBUR - BMAD Extension Master Orchestrator |
| **Source** | `_bmad-ext/agents/ext-master-enhanced.md` |
| **Version** | 2.0.0 |
| **Status** | ACTIVE |
| **Critical** | MANDATORY config loading before output |

## Architecture Position

```
┌─────────────────────────────────────────────────────────────────┐
│  EXCALIBUR - Event-Driven Workflow Orchestrator                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PRE-EXECUTION (CRITICAL)                                 │ │
│  │  1. Load _bmad-ext/config.yaml NOW                        │ │
│  │  2. Load _bmad-ext/state/LOOP_STATE.yaml NOW              │ │
│  │  3. Initialize Event Bus from event-bus.yaml              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│         ┌────────────────────┴────────────────────┐            │
│         ▼                                         ▼            │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │  Event Handler  │                   │  Sub-Agent      │     │
│  │  Dispatch       │                   │  Delegation      │     │
│  └─────────────────┘                   └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

1. **Event Bus Architecture** - Load event handlers from `_bmad-ext/orchestrator/event-bus.yaml`
2. **Workflow Chain Management** - Sequential workflow execution with handoffs
3. **Sub-Agent Delegation** - Delegate to bmad-master for specialized tasks
4. **Event Queue** - Priority-based event handling
5. **Handoff Protocol** - Traceable handoff artifacts

## Menu Options
- **[EW]** Execute Workflow Chain - Run multiple workflows in sequence
- **[SW]** Switch Workflow - Event-driven workflow transition
- **[EV]** Event Queue - View and manage triggered events
- **[DL]** Delegate Sub-Agent - Validation, Context, Investigation, Research
- **[VL]** Validate with bmad-master - Coordinate critical decisions
- **[HD]** Handoff Status - Check active handoffs and workflow transitions

## Integration Points

| Reads From | Path |
|------------|------|
| **Config** | `_bmad-ext/config.yaml` |
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **Event Bus** | `_bmad-ext/orchestrator/event-bus.yaml` |
| **Handoffs** | `_bmad-ext/.handoffs/` |

## Full Documentation

For complete activation protocol, event handling, and workflow chain management, see:

**`_bmad-ext/agents/ext-master-enhanced.md`**

---

**Token Savings**: ~29,600 tokens per load (96% reduction)
**Last Updated**: 2026-01-14

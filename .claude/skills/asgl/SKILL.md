---
name: asgl
description: Autonomous Self-Governing Loop Orchestrator - BMAD Master Agent
version: 3.0.0
last_updated: 2026-01-07
---

# ASGL - Autonomous Self-Governing Loop Orchestrator

**Purpose**: Orchestrate autonomous development cycles using the BMAD framework with multi-level loop governance.

## Quick Start

Invoke the BMAD Master Orchestrator:
- `/bmad:core:agents:bmad-master` - Start the orchestrator

## Modes

### Interactive Mode (default)
- Active when `ralph-loop.local.md` has `active: false`
- Shows smart menu with context-aware options
- Waits for user input

### Autonomous Mode
- Active when `ralph-loop.local.md` has `active: true`
- Automatically executes LOOP_STATE next_action
- Continues until exit condition or user interrupt

## State Files

| File | Purpose |
|------|---------|
| `.claude/ralph-loop.local.md` | Project-local loop control (active, iteration, max) |
| `_bmad/modules/asgl/LOOP_STATE-grandparent.yaml` | Strategic: sprint, quarterly goals |
| `_bmad/modules/asgl/LOOP_STATE-parent.yaml` | Tactical: epics, course correction |
| `_bmad/modules/asgl/LOOP_STATE-child.yaml` | Operational: current story, next action |
| `.claude/AGENT-STATE.yaml` | Session-level state |

## Exit Conditions

- Set `active: false` in ralph-loop.local.md
- Max iterations reached
- All stories complete
- Send any message (interrupts autonomous mode)
- Critical error requiring manual intervention

## Usage Examples

### Start autonomous loop:
```bash
# 1. Enable autonomous mode
sed -i '' 's/active: false/active: true/' .claude/ralph-loop.local.md

# 2. Invoke
/bmad:core:agents:bmad-master
```

### Pause autonomous loop:
```bash
# Set active: false in ralph-loop.local.md
# Or send any message during autonomous execution
```

## Commands

| Command | Action |
|---------|--------|
| `/bmad:core:agents:bmad-master` | Load BMAD master agent |
| `/bmad:core:workflows:main-loop` | Execute main loop workflow |
| `/bmad:core:workflows:governance-update` | Update governance documents |

## Integration

This skill integrates with:
- `.claude/hooks/stop-hook.sh` - Loop continuation control
- `.claude/hooks/context-bridge.sh` - Context threshold detection
- `.claude/hooks/session-start-hook.sh` - Session initialization

## Constraints

1. **Design**: 8-bit only, NO glassmorphism
2. **Mobile**: Touch targets ≥44px
3. **i18n**: All strings via t()
4. **Wires**: Track migrations in pending-wires.yaml
5. **Governance**: Update AGENTS.md every 3 stories

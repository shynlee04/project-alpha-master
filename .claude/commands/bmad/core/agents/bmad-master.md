---
name: 'bmad-master'
description: 'BMAD Master Orchestrator - Autonomous Development with Loop Governance'
version: '3.0.0'
---

You must fully embody this agent's persona and follow all activation instructions exactly.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad/core/agents/bmad-master.md
2. CHECK Ralph Loop status from @.claude/ralph-loop.local.md
3. LOAD LOOP_STATE hierarchy:
   - @_bmad/modules/asgl/LOOP_STATE-grandparent.yaml
   - @_bmad/modules/asgl/LOOP_STATE-parent.yaml
   - @_bmad/modules/asgl/LOOP_STATE-child.yaml
4. ENTER mode based on ralph-loop.active status
5. Execute according to mode (autonomous or interactive)
</agent-activation>

## Quick Reference

| Mode | Trigger | Behavior |
|------|--------|----------|
| **Autonomous** | `active: true` | Execute LOOP_STATE without asking |
| **Interactive** | `active: false` | Show menu, wait for input |

## State Files

- `.claude/ralph-loop.local.md` - Loop control (active, iteration)
- `_bmad/modules/asgl/LOOP_STATE-*.yaml` - Hierarchy (grandparent, parent, child)
- `.claude/AGENT-STATE.yaml` - Session state

## Commands

To start autonomous mode:
```bash
sed -i '' 's/active: false/active: true/' .claude/ralph-loop.local.md
/bmad:core:agents:bmad-master
```

To pause:
```bash
sed -i '' 's/active: true/active: false/' .claude/ralph-loop.local.md
```

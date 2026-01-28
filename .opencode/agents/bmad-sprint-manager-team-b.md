---
subtask: true
description: "Sprint Manager (Team-B) - Alternative model for simpler sprint tasks"
mode: all
model: chutes/zai-org/GLM-4.7-FP8
temperature: 0.2

tools:
  write: true
  edit: true
  bash: true
  glob: true
  grep: true
  read: true

permission:
  edit: allow
  bash: allow
  task:
    "*": allow
    "explore": deny
    "skill": deny

phase: "4"
status: "active"
category: "coordination"
parent_agent: "ext-master"
team: "B"
updated: "2026-01-29"

integration_points:
  receives_from:
    - "ext-master"
  sends_to:
    - "ext-master"
  coordinates_with:
    - "bmad-sprint-manager"
    - "dev-ext-team-b"

entry_points:
  commands:
    - "/sprint-team-b"
  aliases:
    - "/sm-b"

triggers:
  - "simple sprint task"
  - "story tracking"
---

# bmad-sprint-manager-team-b: Sprint Manager (Team-B)

> **Model**: `chutes/zai-org/GLM-4.7-FP8`
> **Purpose**: Simpler sprint tasks, parallel offloading

---

## Sprint Cycle

Same as Team-A but for simpler scope:
1. Sprint Planning (focused)
2. Story Development
3. Status Tracking
4. Handoff

---

## Menu

```
╔═════════════════════════════════════════════════════════════╗
║  SPRINT-MANAGER-TEAM-B: Manager (Alternative Model)         ║
╠═════════════════════════════════════════════════════════════╣
║  [SP] Sprint Planning                                       ║
║  [SS] Sprint Status                                         ║
║  [ES] Escalate to Orchestrator                              ║
║  [DA] Dismiss Agent                                         ║
╚═════════════════════════════════════════════════════════════╝
```

---

**Lines**: ~80
**Last Updated**: 2026-01-29

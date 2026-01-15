---
description: Enhanced agent template - base pattern for creating orchestrated subagents
mode: subagent
temperature: 0.2
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: allow
  task: allow
---

# _template-enhanced-agent (Template)

> Template for creating enhanced agents with orchestration hooks and LOOP_STATE integration.

## Purpose
Core BMAD agents in `_bmad/` are NEVER modified. All enhancements live in `_bmad-ext/agents/` and survive BMAD updates.

## Architecture Position
```
┌─────────────────────────────────────────────────────────────────┐
│  PRE-EXECUTION HOOKS                                            │
│  - Load LOOP_STATE from _bmad-ext/state/LOOP_STATE.yaml        │
│  - Verify Anchor (staleness check)                             │
│  - Load Parent Handoff (if delegated)                          │
│  - Validate delegation authorization                            │
├─────────────────────────────────────────────────────────────────┤
│  CORE AGENT INHERITANCE                                         │
│  - Load core agent from _bmad/agents/{name}.md                 │
│  - Inherit: persona, communication_style, principles           │
├─────────────────────────────────────────────────────────────────┤
│  EXECUTION                                                       │
│  - Execute story tasks in order                                │
│  - Run validation after each task                             │
│  - Update LOOP_STATE.current.step                             │
├─────────────────────────────────────────────────────────────────┤
│  POST-EXECUTION HOOKS                                           │
│  - Create child handoff artifact                               │
│  - Register in ARTIFACT_REGISTRY                               │
│  - Update LOOP_STATE delegation status                         │
│  - Report completion to master-orchestrator                    │
└─────────────────────────────────────────────────────────────────┘
```

## Activation Protocol

### Pre-Execution (MANDATORY)
```yaml
pre_execution:
  1. Load Loop State: _bmad-ext/state/LOOP_STATE.yaml
  2. Verify Anchor: Check staleness (< 4 hours)
  3. Load Parent Handoff: If delegated, extract context/criteria
  4. Validate: Check session.status == "RUNNING"
```

### Post-Execution (MANDATORY)
```yaml
post_execution:
  1. Run Validation: pnpm tsc --noEmit && pnpm vitest run
  2. Create Child Handoff: Generate UUID-based artifact
  3. Register in ARTIFACT_REGISTRY: Add with metadata
  4. Update Loop State: Move delegation to completed
  5. Report to Orchestrator: SUCCESS/PARTIAL/FAILED status
```

## Enhanced Menu Options
- **[EX]** Execute Delegated Work (from handoff)
- **[DS]** Dev Story (direct - bypass orchestrator)
- **[ST]** Show Current Story Status
- **[LO]** Show Loop State
- **[HA]** Show Active Handoff
- **[ES]** Escalate to Orchestrator

## Direct vs Orchestrated

| Mode | Entry | Handoff | Callback |
|------|-------|----------|----------|
| Orchestrated | Via master | YES | YES |
| Direct | Skill invoke | NO | NO |

## Implementation Checklist
When creating a new enhanced agent:
- [ ] Copy this template to `{agent-name}-ext.md`
- [ ] Replace `{agent-name}` placeholders
- [ ] Add agent-specific execution rules
- [ ] Define validation commands
- [ ] Set escalation paths
- [ ] Test orchestrated and direct invocation

## Integration Points

| Resource | Path |
|----------|------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` |
| ARTIFACT_REGISTRY | `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` |
| Handoffs | `_bmad-ext/.handoffs/` |
| Handoff Schema | `_bmad-ext/schemas/handoff-artifact.schema.yaml` |

## Full Documentation
See: `_bmad-ext/agents/_template-enhanced-agent.md`

---

**Lines**: 103 (was 348 = 70% reduction)
**Last Updated**: 2026-01-14

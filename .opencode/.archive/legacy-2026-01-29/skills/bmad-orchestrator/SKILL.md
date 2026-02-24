---
name: bmad-orchestrator
description: Use this skill when the user asks to "run BMAD", "autonomous loop", "coordinate agents", "orchestrate", "run sprint", or "execute BMAD workflow". Also for general BMAD framework coordination including loading agents, managing workflows, tracking progress, and updating state files.
version: 3.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: bmad
parent: null
children:
  - asgl
  - architecture-remediation
priority: 50
agents:
  - bmad-master
  - bmad-coordinator
triggers:
  - run BMAD
  - autonomous loop
  - coordinate agents
  - orchestrate
  - run sprint
  - execute workflow
  - load bmad-master
---

# BMAD Orchestrator Skill

**description**: Orchestrate the BMAD framework - load agents, manage workflows, track progress, and coordinate autonomous development cycles.

## Activation Triggers

Use this skill when:
- User says "run BMAD" or "run autonomous loop"
- User asks to "coordinate agents" or "orchestrate workflows"
- User mentions "run sprint" or "execute BMAD workflow"
- User asks to "load bmad-master" or "activate bmad-master"

## Core Responsibilities

### 1. Framework Loading
- Load BMAD Master agent from `_bmad/core/agents/bmad-master.md`
- Load module manifests from `_bmad/modules/config.yaml`
- Initialize workflow state from `_bmad/modules/asgl/LOOP_STATE.yaml`
- Load user configuration from `{project-root}/_bmad/core/config.yaml`

### 2. Agent Orchestration
- Route to appropriate specialized agents based on task type
- Spawn parallel agents for independent tasks
- Manage agent handoffs and state transitions
- Track active subagents and their completion status

### 3. Workflow Management
- Load workflows from `_bmad/core/workflows/` and `_bmad/modules/*/workflows/`
- Execute workflow steps in sequence
- Validate workflow completion against acceptance criteria
- Update sprint status and governance documents

### 4. State Tracking
- Update `.claude/AGENT-STATE.yaml` after each significant action
- Update `_bmad/modules/asgl/LOOP_STATE.yaml` with loop progress
- Create handoff artifacts at `_bmad-output/handoffs/` when agents handoff
- Archive artifacts older than TTL

### 5. Governance Enforcement
- Run governance checks after structural changes
- Update AGENTS.md when file structure changes
- Create/update sprint-status.yaml after story completion
- Run quality gates (TypeScript, build, test) before merging

## Available Agents

| Agent | Location | description |
|-------|----------|---------|
| bmad-master | `_bmad/core/agents/bmad-master.md` | Master orchestrator |
| architect | `_bmad/bmm/agents/architect.md` | System design |
| analyzer | `.claude/agents/analyzer.md` (after consolidation) | Deep scan & analyze |
| implementer | `_bmad/bmm/agents/dev.md` | Feature implementation |
| refactorer | `_bmad/bmm/agents/dev.md` (via skill) | Code refactoring |

## Available Workflows

| Workflow | Location | description |
|----------|----------|---------|
| Main Loop | `_bmad/modules/asgl/workflows/main-loop.md` | Autonomous sprint loop |
| Spec Writing | `_bmad/bmm/workflows/2-plan-workflows/` | Spec generation |
| Implementation | `_bmad/bmm/workflows/3-solutioning/` | Feature implementation |
| Brainstorming | `_bmad/core/workflows/brainstorming/` | Ideation sessions |
| Architecture Remediation | `_bmad/modules/architecture-remediation/workflows/` | Technical debt remediation |

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   BMAD ORCHESTRATOR EXECUTION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Load Configuration                                           │
│     • Read _bmad/core/config.yaml                           │
│     • Read _bmad/modules/config.yaml                         │
│     • Identify user_name and communication_language               │
│                                                                  │
│  2. Load BMAD Master Agent                                        │
│     • Source: _bmad/core/agents/bmad-master.md                 │
│     • Activate with greeting using user_name                    │
│     • Display numbered menu of available workflows/agents          │
│                                                                  │
│  3. Route to Appropriate Agent/Workflow                         │
│     • If user input is fuzzy match → show menu                 │
│ │     │• If specific task → route to specialist agent      │
│ │     │• If workflow → execute workflow step                │
│ │     │• If exit command → dismiss agent                    │
│ │     │•                                                │
│ │     └──► Check permissions and execute                     │
│ │     │     ┌─────────────────────────────────────────┐   │
│ │     │     │ Agent execution with full context           │   │
│ │     │     │ - Load relevant files                  │   │
│ │     │     │ - Execute task                         │   │
│ │     │     │ - Create artifacts                     │   │
│ │     │     └─────────────────────────────────────────┘   │
│ │     │                                                        │
│ │     └──► Update governance documents                           │
│ │             • AGENT-STATE.yaml                               │
│ │             • LOOP_STATE.yaml                                │
│ │             • sprint-status.yaml                             │
│ │             • AGENTS.md (if structure changed)               │
│ │             • Create handoff artifact                        │
│ │     │                                                        │
│ │     └──► Loop to next workflow/agent                              │
│ │                                                                │
└────────────────────────────────────────────────────────────────────────┘
```

## Quality Gates

Before completing any workflow execution:
1. **Validation Gate**: All acceptance criteria met?
2. **TypeScript Gate**: Zero new TypeScript errors (production files)
3. **Test Gate**: All tests passing
4. **Documentation Gate**: AGENTS.md updated if structure changed

## Governance Standards

- **4-Tier Categorization**: Enforce document/artifact tiers
- **TTL Enforcement**: Ignore artifacts older than 24 hours (unless manually loaded)
- **Frontmatter Parsing**: Read only headers before consuming full artifact
- **Metadata Validation**: Check status (validated/outdated) before using artifacts
- **Time-boxing**: Story implementation max 30 minutes

## Module Consolidation

Current modules (10) → Target (4):
- **Orchestration Core**: core-governance + governance + asgl
- **Architecture**: architecture-remediation + architecture-refactoring + quality
- **Sprint Execution**: sprint-execution + BMM agents
- **Integration**: integration-testing

## Integration with Claude Code

- **Hooks**: Configure hooks in `.claude/settings.json` for SessionStart/Stop/UserPromptSubmit
- **Skills**: Register skills in `.claude/skills/` with proper YAML frontmatter
- **Commands**: Create commands in `.claude/commands/bmad/` for common workflows
- **Platform Parity**: Mirror hooks/commands to `.opencode/` directory

## Quick Commands Reference

| Command | Action |
|---------|--------|
| `/bmad:core:agents:bmad-master` | Load BMAD Master orchestrator |
| `/bmad:bmm:workflows:main-loop` | Start autonomous sprint loop |
| `/bmad:bmm:workflows:brainstorming` | Start ideation session |
| `/bmad:arc-eliminate-god-stores` | Eliminate god components |
| `/bmad:arc-normalize-components` | Normalize component sizes |
| `/bmad:arc-workspace-file-system-e2e` | Fix workspace file sync |

## Exit Conditions

### Success
- All acceptance criteria met
- Governance documents updated
- Handoff artifact created
- Next action identified

### Failure
- Blocking TypeScript errors (>10 new errors)
- Breaking changes detected
- Data loss risk identified
- User aborts execution

---

**Version**: 3.0.0
**Last Updated**: 2026-01-07
**Module**: BMAD Core Orchestration

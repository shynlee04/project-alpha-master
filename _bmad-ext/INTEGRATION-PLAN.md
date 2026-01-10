# _bmad-ext Integration Plan

> **Version**: 1.0.0 | **Date**: 2026-01-11 | **Status**: Ready for Execution

## Executive Summary

This document defines the integration plan for replacing legacy BMAD orchestration with the new `_bmad-ext` extension layer. The new system provides platform-agnostic delegation, enhanced agents with hooks, and unified state management.

## Conflict Analysis

### Legacy System vs New System

| Aspect | Legacy (v3.2) | New (_bmad-ext) | Action |
|--------|---------------|-----------------|--------|
| **State Management** | 3-level LOOP_STATE hierarchy | Single unified LOOP_STATE.yaml | REPLACE |
| **Autonomous Control** | Ralph Loop (`.claude/ralph-loop.local.md`) | Integrated in LOOP_STATE.yaml | REPLACE |
| **Agent State** | AGENT-STATE.yaml | Integrated in LOOP_STATE.yaml | REPLACE |
| **Story Routing** | MODULE-ROUTING.yaml (316 lines) | routing-rules.yaml (515 lines) | REPLACE |
| **Orchestration** | bmad-master.md (331 lines) | master-orchestrator.md (800 lines) | REPLACE |
| **Delegation** | Implicit in bmad-master | Explicit delegation-protocol.md | NEW |
| **Escalation** | Implicit in bmad-master | Explicit escalation-protocol.md | NEW |
| **Governance Updates** | Manual updates | governance-auto-update.md | NEW |
| **Enhanced Agents** | Does not exist | Wrappers with pre/post hooks | CREATE |
| **Governance Module** | Core governance | _bmad-ext/modules/governance/ | INTEGRATE |

## Migration Path

### Phase 1: State Layer Migration

**Objective**: Replace 3-level hierarchy with unified LOOP_STATE.yaml

**Files to Create/Update**:
```bash
_bmad-ext/state/
├── LOOP_STATE.yaml              # NEW: Unified state (replaces 3 files)
├── ARTIFACT_REGISTRY.yaml       # NEW: Track all artifacts
└── DELEGATION_LOG.yaml          # NEW: Track delegations
```

**Migration Steps**:
1. Read all 3 legacy LOOP_STATE files
2. Consolidate into single LOOP_STATE.yaml
3. Map legacy fields to new structure:
   - `session` from AGENT-STATE.yaml
   - `current` from LOOP_STATE-child.yaml
   - `strategic` from LOOP_STATE-grandparent.yaml
   - `tactical` from LOOP_STATE-parent.yaml
4. Archive legacy files to `_bmad-output/.archive/2026-01-11/`

### Phase 2: Routing Migration

**Objective**: Replace MODULE-ROUTING.yaml with routing-rules.yaml

**Conflict Resolution**:
- MODULE-ROUTING.yaml has 316 lines, routing-rules.yaml has 515 lines
- routing-rules.yaml includes governance enforcement as first rule
- routing-rules.yaml consolidates pm-ext + sm-ext → product-management-ext
- routing-rules.yaml moves quality-scanner to shared services

**Action**: Create alias
```bash
# Deprecate old file
mv _bmad/core/MODULE-ROUTING.yaml _bmad-output/.archive/2026-01-11/

# Create redirect
echo "# DEPRECATED: Use _bmad-ext/orchestrator/routing-rules.yaml" > _bmad/core/MODULE-ROUTING.yaml
```

### Phase 3: Orchestrator Migration

**Objective**: Replace bmad-master.md with master-orchestrator.md

**Key Differences**:
| Aspect | bmad-master | master-orchestrator |
|--------|-------------|---------------------|
| Steps | Implicit (9 steps) | Explicit (9 steps) |
| Menu | 6 options | 11 options |
| Routing | MODULE-ROUTING | routing-rules.yaml |
| State | 3 files | 1 file |
| Governance | Manual | Auto-update |

**Action**: Create wrapper
```bash
# Keep bmad-master.md for backward compatibility
# Add redirect at top
_bmad/core/agents/bmad-master.md:
  # DEPRECATED: Use _bmad-ext/orchestrator/master-orchestrator.md
```

### Phase 4: Enhanced Agent Creation

**Objective**: Create wrapper agents with pre/post hooks

**Agents to Create**:
```bash
_bmad-ext/agents/
├── dev-ext.md              # Wraps _bmad/bmm/agents/dev.md
├── architect-ext.md        # Wraps _bmad/bmm/agents/architect.md
├── analyst-ext.md          # Wraps _bmad/bmm/agents/analyst.md
├── product-management-ext.md  # Wraps pm.md + sm.md (CONSOLIDATED)
├── ux-designer-ext.md      # Wraps _bmad/bmm/agents/ux-designer.md
├── tech-writer-ext.md      # Wraps _bmad/bmm/agents/tech-writer.md
└── tea-ext.md              # Wraps _bmad/bmm/agents/tea.md
```

**Agent Structure**:
```yaml
# Each enhanced agent follows this template
---
name: "{name}-ext"
wraps: "{legacy_agent_path}"
version: "1.0.0"
---

# Pre-execution Hook
1. Load parent context from LOOP_STATE.yaml
2. Verify anchor freshness
3. Load handoff artifact

# Execute Legacy Agent
4. Call wrapped agent with enhanced context

# Post-execution Hook
5. Create handoff artifact
6. Update LOOP_STATE.yaml
7. Report to orchestrator

# Escalation
8. On failure → escalation-protocol.md
```

### Phase 5: Governance Integration

**Objective**: Integrate _bmad-ext/modules/governance/ with orchestrator

**Three Enforcement Concepts**:
1. **Context-First**: Auto-transform prompts with accurate context
2. **Agent as Expert**: Define bug level, detect approach flaws
3. **Research Trigger**: Internet-based validation for tech choices

**Integration Point**:
```yaml
# In routing-rules.yaml, rule GOV-001 applies to ALL work
- rule_id: "GOV-001"
  name: "Governance Enforcement"
  if: "true"  # Always applies
  agent: "governance-core"
  workflow: "correct-course"
  priority: "critical"
```

## OpenCode Integration

### Command Mapping

OpenCode only understands agents, sub-agents, and commands. Map orchestrator protocols:

| Legacy Command | OpenCode Equivalent | Action |
|----------------|---------------------|--------|
| `/bmad:core:agents:bmad-master` | `/bmad-ext:orchestrator:master` | Invoke orchestrator |
| `/bmad:bmm:agents:dev` | `/bmad-ext:agents:dev-ext` | Invoke enhanced dev agent |
| `/bmad:core:workflows:correct-course` | `/bmad-ext:governance:correct-course` | Invoke governance |

### OpenCode-Compatible Entrypoint

Create `/Users/apple/Documents/coding-projects/project-alpha-master/.opencode/commands/bmad-ext-orchestrator.md`:

```markdown
# BMAD Extension Orchestrator

> **Platform**: OpenCode | **Agents**: Enhanced Agents | **Commands**: Delegation

## Commands

### /bmad-ext:orchestrator:start
Start autonomous session with unified state management.

**Action**: Initialize LOOP_STATE.yaml, verify anchor, begin execution

### /bmad-ext:orchestrator:delegate
Delegate work to enhanced agent.

**Parameters**:
- `agent`: Enhanced agent name (dev-ext, architect-ext, etc.)
- `story`: Story ID from bmm-workflow-status.yaml
- `workflow`: Workflow to execute

### /bmad-ext:orchestrator:status
Show current session status.

**Output**: Session ID, stories completed, delegations active, errors

### /bmad-ext:orchestrator:governance:update
Force governance document update.

**Action**: Update AGENTS.md, sprint-status.yaml, artifact registry

### /bmad-ext:orchestrator:pause
Pause autonomous execution.

**Action**: Set session.status = PAUSED, preserve LOOP_STATE

### /bmad-ext:orchestrator:resume
Resume paused session.

**Action**: Verify anchor, continue from paused state

## Enhanced Agents (Sub-Agents)

Sub-agents available to OpenCode:

| Agent | Wraps | Capabilities |
|-------|-------|--------------|
| `dev-ext` | dev.md | feature_development, bug_fix, remediation |
| `architect-ext` | architect.md | system_design, technical_spec, adr |
| `analyst-ext` | analyst.md | requirements_analysis, competitive_analysis |
| `product-management-ext` | pm.md + sm.md | sprint_planning, story_creation |
| `ux-designer-ext` | ux-designer.md | ux_design, accessibility_review |
| `tech-writer-ext` | tech-writer.md | api_docs, user_guide, readme_update |
| `tea-ext` | tea.md | test_design, test_review, e2e_test |

## Usage

```bash
# Start orchestrator
/bmad-ext:orchestrator:start

# Delegate to enhanced agent
/bmad-ext:orchestrator:delegate agent=dev-ext story=FS-05 workflow=story-cycle

# Check status
/bmad-ext:orchestrator:status

# Force governance update
/bmad-ext:orchestrator:governance:update

# Pause/resume
/bmad-ext:orchestrator:pause
/bmad-ext:orchestrator:resume
```

## Integration with Legacy BMAD

The orchestrator reads legacy files:
- `bmm-workflow-status.yaml` (unchanged)
- `_bmad/core/config.yaml` (unchanged)

The orchestrator updates legacy files:
- `AGENTS.md` (on governance update)
- `bmm-workflow-status.yaml` (on story complete)

## Handoff Protocol

Every agent-to-agent transition creates handoff artifact:
- Location: `_bmad-output/handoffs/{date}/{story_id}-handoff.md`
- Format: UUID-based traceability
- Chain: orchestrator → agent → output

## Escalation Path

On failure:
1. Retry with same agent (1st attempt)
2. Retry with different agent (2nd attempt)
3. Break down task (3rd attempt)
4. Human intervention (4th attempt)
```

## File Conflict Map

### Files to Create

```bash
_bmad-ext/
├── state/
│   ├── LOOP_STATE.yaml.template
│   ├── ARTIFACT_REGISTRY.yaml.template
│   └── DELEGATION_LOG.yaml.template
├── agents/
│   ├── dev-ext.md
│   ├── architect-ext.md
│   ├── analyst-ext.md
│   ├── product-management-ext.md
│   ├── ux-designer-ext.md
│   ├── tech-writer-ext.md
│   └── tea-ext.md
├── workflows/
│   ├── story-cycle/
│   ├── remediation-cycle/
│   └── architecture-cycle/
├── shared-services/
│   └── quality-scanner.md
└── schemas/
    └── handoff-artifact.schema.yaml

.opencode/commands/
└── bmad-ext-orchestrator.md
```

### Files to Archive (Deprecate)

```bash
_bmad/
├── core/
│   ├── agents/bmad-master.md           # REPLACED by _bmad-ext/orchestrator/
│   └── MODULE-ROUTING.yaml             # REPLACED by routing-rules.yaml
├── bmm/agents/
│   ├── pm.md                           # CONSOLIDATED into product-management-ext.md
│   └── sm.md                           # CONSOLIDATED into product-management-ext.md
└── modules/
    └── quality/scanners/               # CONSOLIDATED into shared-services/

.claude/
├── ralph-loop.local.md                 # INTEGRATED into LOOP_STATE.yaml
└── AGENT-STATE.yaml                    # INTEGRATED into LOOP_STATE.yaml
```

### Files to Update (Reference New System)

```bash
AGENTS.md                               # Add _bmad-ext integration notes
CLAUDE.md                               # Add _bmad-ext reference
bmm-workflow-status.yaml                # Unchanged format
```

## Testing Strategy

### Unit Tests

1. **State Migration Test**: Verify 3-level → 1-level conversion
2. **Routing Test**: Verify routing-rules.yaml handles all story types
3. **Delegation Test**: Verify handoff artifact creation
4. **Escalation Test**: Verify recovery strategies work

### Integration Tests

1. **Orchestrator Test**: Full cycle: initialize → delegate → callback → continue
2. **Governance Test**: Verify enforcement checks run before any work
3. **OpenCode Test**: Verify commands work in OpenCode environment

### End-to-End Tests

1. **Story Execution**: Complete story from bmm-workflow-status.yaml to done
2. **Multi-Agent Collaboration**: Delegation chain: orchestrator → dev-ext → tea-ext
3. **Failure Recovery**: Verify escalation protocol handles errors

## Rollback Plan

If integration fails:

1. **State Rollback**: Restore LOOP_STATE hierarchy from archive
2. **Routing Rollback**: Restore MODULE-ROUTING.yaml
3. **Orchestrator Rollback**: Restore bmad-master.md as primary
4. **Agent Rollback**: Remove enhanced agents, use legacy agents

Rollback command:
```bash
./scripts/rollback-bmad-ext.sh
```

## Success Criteria

- [ ] All legacy routing rules covered by routing-rules.yaml
- [ ] Enhanced agents created for all 7 main agents
- [ ] State migration complete (3-level → 1-level)
- [ ] Delegation protocol functional
- [ ] Escalation protocol tested
- [ ] Governance auto-update working
- [ ] OpenCode commands functional
- [ ] All tests passing
- [ ] Documentation updated

## Timeline

| Phase | Duration | Owner | Dependencies |
|-------|----------|-------|--------------|
| Phase 1: State Layer | 2 hours | Orchestrator | None |
| Phase 2: Routing | 1 hour | Orchestrator | Phase 1 |
| Phase 3: Orchestrator | 2 hours | Orchestrator | Phase 2 |
| Phase 4: Enhanced Agents | 4 hours | Agent Builder | Phase 3 |
| Phase 5: Governance | 2 hours | Governance | Phase 3 |
| Testing | 4 hours | QA | All phases |
| **Total** | **15 hours** | | |

## References

- Master Orchestrator: `_bmad-ext/orchestrator/master-orchestrator.md`
- Routing Rules: `_bmad-ext/orchestrator/routing-rules.yaml`
- Delegation Protocol: `_bmad-ext/orchestrator/delegation-protocol.md`
- Escalation Protocol: `_bmad-ext/orchestrator/escalation-protocol.md`
- Governance Auto-Update: `_bmad-ext/orchestrator/governance-auto-update.md`
- Governance Module: `_bmad-ext/modules/governance/MODULE.md`
- Legacy bmad-master: `_bmad/core/agents/bmad-master.md`

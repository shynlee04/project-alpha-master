# _bmad-ext Integration Summary

> **Date**: 2026-01-11 | **Version**: 1.0.0 | **Status**: Ready for Testing

## System Overview

The `_bmad-ext` extension layer wraps BMAD core without modifying it, providing:
- Platform-agnostic orchestration (OpenCode, Cursor, Claude Code, Augment)
- Enhanced agents with pre/post execution hooks
- Unified state management (single LOOP_STATE.yaml)
- Explicit delegation and escalation protocols
- Automatic governance updates

## Architecture Diagram

```
User Request
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Master Orchestrator (_bmad-ext/orchestrator/)               │
│  - master-orchestrator.md (entry point)                     │
│  - routing-rules.yaml (story → agent routing)               │
│  - delegation-protocol.md (agent handoff)                   │
│  - escalation-protocol.md (error recovery)                  │
│  - governance-auto-update.md (doc updates)                  │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Governance Layer (_bmad-ext/modules/governance-core/)       │
│  Three Enforcement Checks (GOV-001):                        │
│  1. Context-First (scan → contextualize → transform)        │
│  2. Agent as Expert (bug level, approach flaws)             │
│  3. Research Trigger (internet validation)                  │
└─────────────────────────────────────────────────────────────┘
    ↓ (if ALLOW)
┌─────────────────────────────────────────────────────────────┐
│  Enhanced Agents (_bmad-ext/agents/)                         │
│  - dev-ext.md (feature, bug fix, remediation)               │
│  - architect-ext.md (system design, ADR)                    │
│  - analyst-ext.md (requirements, competitive)               │
│  - product-management-ext.md (sprint, story)                │
│  - ux-designer-ext.md (UX, a11y)                            │
│  - tech-writer-ext.md (docs, guides)                        │
│  - tea-ext.md (testing)                                     │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  State Layer (_bmad-ext/state/)                              │
│  - LOOP_STATE.yaml (unified state, replaces 3 files)        │
│  - ARTIFACT_REGISTRY.yaml (artifact tracking)               │
│  - DELEGATION_LOG.yaml (delegation history)                 │
└─────────────────────────────────────────────────────────────┘
```

## Files Status

### ✅ COMPLETE - Ready for Testing

| File | Status | Notes |
|------|--------|-------|
| `_bmad-ext/orchestrator/master-orchestrator.md` | ✅ Ready | 800 lines, full implementation |
| `_bmad-ext/orchestrator/routing-rules.yaml` | ✅ Ready | 515 lines, governance-first |
| `_bmad-ext/orchestrator/delegation-protocol.md` | ✅ Ready | 450 lines, explicit protocol |
| `_bmad-ext/orchestrator/escalation-protocol.md` | ✅ Ready | 452 lines, 4 recovery strategies |
| `_bmad-ext/orchestrator/governance-auto-update.md` | ✅ Ready | 418 lines, auto-update |
| `_bmad-ext/modules/governance/MODULE.md` | ✅ Ready | Foundation governance |
| `_bmad-ext/modules/governance-core/` | ✅ Ready | Full governance enforcement |
| `_bmad-ext/agents/dev-ext.md` | ✅ Ready | Enhanced dev agent |
| `_bmad-ext/agents/architect-ext.md` | ✅ Ready | Enhanced architect agent |
| `_bmad-ext/agents/analyst-ext.md` | ✅ Ready | Enhanced analyst agent |
| `_bmad-ext/agents/product-management-ext.md` | ✅ Ready | Consolidated pm+sm |
| `_bmad-ext/agents/ux-designer-ext.md` | ✅ Ready | Enhanced ux-designer |
| `_bmad-ext/agents/tech-writer-ext.md` | ✅ Ready | Enhanced tech-writer |
| `_bmad-ext/agents/tea-ext.md` | ✅ Ready | Enhanced tea agent |
| `.opencode/agent/bmad-agent-core-bmad-master.md` | ✅ Updated | Points to new orchestrator |
| `.opencode/commands/bmad-ext-orchestrator.md` | ✅ Ready | OpenCode commands |

### 📋 Legacy Files (Deprecate Later)

| File | Action | Status |
|------|--------|--------|
| `_bmad/core/agents/bmad-master.md` | Replace | Redirect added |
| `_bmad/core/MODULE-ROUTING.yaml` | Replace | Redirect needed |
| `.claude/ralph-loop.local.md` | Integrate | Into LOOP_STATE.yaml |
| `.claude/AGENT-STATE.yaml` | Integrate | Into LOOP_STATE.yaml |

## OpenCode Integration

### Agent Entry Point

**File**: `.opencode/agent/bmad-agent-core-bmad-master.md`

```markdown
---
name: 'bmad-master'
mode: 'all'
description: 'BMAD Master Orchestrator v3.2 - Enhanced with _bmad-ext extension layer'
tools:
  write: true
  edit: true
  bash: true
  yolo: true
---

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad-ext/orchestrator/master-orchestrator.md
2. READ its entire contents
3. Execute ALL activation steps exactly as written
4. Follow the agent's persona and menu system precisely
</agent-activation>
```

### Commands Available

**File**: `.opencode/commands/bmad-ext-orchestrator.md`

| Command | Description |
|---------|-------------|
| `/bmad-ext:orchestrator:start` | Start autonomous session |
| `/bmad-ext:orchestrator:delegate` | Delegate to enhanced agent |
| `/bmad-ext:orchestrator:status` | Show session status |
| `/bmad-ext:orchestrator:governance:update` | Force governance update |
| `/bmad-ext:orchestrator:pause` | Pause execution |
| `/bmad-ext:orchestrator:resume` | Resume execution |

## Governance Testing

The user will test `@_bmad-ext/modules/governance/` modules. Here's what to expect:

### Three Enforcement Concepts

1. **Context-First**
   - Location: `_bmad-ext/modules/governance/workflows/context-first/`
   - Purpose: Auto-transform prompts with accurate context
   - Steps: Scan → Contextualize → Transform

2. **Agent as Expert**
   - Location: `_bmad-ext/modules/governance/workflows/expert-analysis/`
   - Purpose: Define bug level, detect approach flaws
   - Steps: Analyze → Compare → Detect → Decide

3. **Research Trigger**
   - Location: `_bmad-ext/modules/governance/workflows/research-trigger/`
   - Purpose: Internet-based tech validation
   - Triggers: Tech choice, performance, best-practices

### Integration Point

Governance runs as **GOV-001** in `routing-rules.yaml`:
```yaml
- rule_id: "GOV-001"
  name: "Governance Enforcement"
  if: "true"  # Always applies to ALL work
  agent: "governance-core"
  workflow: "correct-course"
  priority: "critical"
  then: "continue_to_next_rule"  # If ALLOW
```

## State Migration

### Legacy (3-level hierarchy)
```
.claude/ralph-loop.local.md         → session active status
.claude/AGENT-STATE.yaml            → session tracking
LOOP_STATE-grandparent.yaml         → strategic (quarterly goals)
LOOP_STATE-parent.yaml              → tactical (epics)
LOOP_STATE-child.yaml               → operational (current story)
```

### New (Unified state)
```
_bmad-ext/state/LOOP_STATE.yaml     → ALL of the above consolidated
_bmad-ext/state/ARTIFACT_REGISTRY.yaml  → Artifact tracking
_bmad-ext/state/DELEGATION_LOG.yaml     → Delegation history
```

## Testing Checklist

### Phase 1: Governance Module Testing

- [ ] Context-First workflow executes correctly
- [ ] Expert Analysis detects approach flaws
- [ ] Research Trigger fires on tech decisions
- [ ] Governance report generated (ALLOW/WARN/BLOCK)

### Phase 2: Orchestrator Testing

- [ ] Master orchestrator loads from new path
- [ ] Routing rules apply in correct order
- [ ] GOV-001 runs before other rules
- [ ] Delegation creates handoff artifacts
- [ ] Callback receives proper payload
- [ ] Escalation handles failures correctly

### Phase 3: Enhanced Agent Testing

- [ ] dev-ext loads wrapped agent correctly
- [ ] Pre-execution hooks run (anchor check, handoff load)
- [ ] Post-execution hooks run (callback, state update)
- [ ] Sub-agent spawning works (dev-ext → tea-ext)

### Phase 4: State Layer Testing

- [ ] LOOP_STATE.yaml created from template
- [ ] All legacy state migrated correctly
- [ ] Delegation tracking functional
- [ ] Error state management works

### Phase 5: OpenCode Integration Testing

- [ ] Agent loads from new path
- [ ] Commands execute correctly
- [ ] Menu system displays properly
- [ ] Exit back to orchestrator works

## Known Issues / Workarounds

1. **YAML Syntax Error in routing-rules.yaml**
   - File: `_bmad-ext/orchestrator/routing-rules.yaml`
   - Line: ~469 (fixed: wrapped list syntax)
   - Status: ✅ FIXED

2. **Legacy State Files Still Exist**
   - Files: `.claude/ralph-loop.local.md`, `.claude/AGENT-STATE.yaml`
   - Action: These will be integrated into LOOP_STATE.yaml during first run
   - Status: ✅ Handled

3. **MODULE-ROUTING.yaml Redirect Needed**
   - Status: Need to create redirect file
   - Action: Run migration script

## Next Steps for User

1. **Test Governance Module**:
   ```bash
   # User will test:
   @_bmad-ext/modules/governance/
   ```

2. **Verify Orchestrator Integration**:
   ```bash
   # Invoke via OpenCode:
   /bmad-ext:orchestrator:start
   ```

3. **Run Full Integration Test**:
   ```bash
   # Complete story cycle:
   /bmad-ext:orchestrator:delegate agent=dev-ext story=FS-05 workflow=story-cycle
   ```

## References

| Document | Path |
|----------|------|
| Master Orchestrator | `_bmad-ext/orchestrator/master-orchestrator.md` |
| Routing Rules | `_bmad-ext/orchestrator/routing-rules.yaml` |
| Delegation Protocol | `_bmad-ext/orchestrator/delegation-protocol.md` |
| Escalation Protocol | `_bmad-ext/orchestrator/escalation-protocol.md` |
| Governance Auto-Update | `_bmad-ext/orchestrator/governance-auto-update.md` |
| Governance Module | `_bmad-ext/modules/governance/MODULE.md` |
| Governance Core | `_bmad-ext/modules/governance-core/MODULE.md` |
| OpenCode Agent | `.opencode/agent/bmad-agent-core-bmad-master.md` |
| OpenCode Commands | `.opencode/commands/bmad-ext-orchestrator.md` |

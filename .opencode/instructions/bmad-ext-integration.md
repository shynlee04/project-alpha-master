# BMAD Extension Layer Integration - OpenCode

**Version**: 1.0.0
**Created**: 2026-01-11
**description**: Enable OpenCode to use the BMAD Extension Layer

## Overview

OpenCode can now integrate with the BMAD Extension Layer (`_bmad-ext/`) to access:
- Enhanced agents with LOOP_STATE integration
- Unified governance module
- Sprint planning wrapper with cohesion checks
- Implementation workflows with user journey validation

## Quick Start

### 1. Load Master Orchestrator

```bash
# In OpenCode, use the ext-master agent
/ext-master
# Select: [OR] Master Orchestrator (recommended)
```

### 2. Available Commands

| Command | Description |
|---------|-------------|
| `/bmad-ext` | Master orchestrator - central entry point |
| `/module-builder-ext` | Enhanced module builder with governance |
| `/workflow-builder-ext` | Enhanced workflow builder with handoffs |
| `/governance-ext` | Unified governance module |
| `/sprint-planning-ext` | Enhanced sprint planning |
| `/implementation-ext` | Story cycle and correct-course |

### 3. Platform Integration

OpenCode integrates with the extension layer via:

```
.opencode/instructions/
├── bmad-constitution.md          # Core constitution
├── bmad-ext-integration.md       # This file
├── governance-rules.md           # Governance rules
└── agent-behavior.md             # Agent behavior guidelines
```

## Key Files

### State Files (Extension Layer)

| File | description |
|------|---------|
| `_bmad-ext/state/LOOP_STATE.yaml` | Global session state |
| `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | Artifact tracking |
| `_bmad-ext/MANIFEST.yaml` | Extension layer registry |

### Core Modules

| Module | Path | description |
|--------|------|---------|
| Orchestrator | `_bmad-ext/orchestrator/master-orchestrator.md` | Central orchestration |
| Governance | `_bmad-ext/modules/governance/MODULE.md` | Self-governance |
| Sprint Planning | `_bmad-ext/modules/sprint-planning-wrapper/MODULE.md` | Sprint validation |
| Implementation | `_bmad-ext/modules/implementation/MODULE.md` | Story workflows |

## Usage Patterns

### Pattern 1: Autonomous Development Loop

```bash
# 1. Load master orchestrator
/ext-master
# Select: [OR] Master Orchestrator

# 2. Orchestrator will:
#    - Load LOOP_STATE
#    - Check anchor freshness
#    - Load current story
#    - Route to appropriate agent
#    - Create handoff artifact
#    - Delegate to enhanced agent
#    - Receive callback
#    - Update governance
#    - Continue to next story
```

### Pattern 2: Manual Module Creation

```bash
# 1. Load enhanced module builder
/module-builder-ext

# 2. Select option:
#    [BM] Brainstorm new module
#    [CM] Create complete module
#    [EM] Edit existing module
#    [VM] Validate module

# 3. Module builder will:
#    - Load LOOP_STATE
#    - Register intent
#    - Create module structure
#    - Register artifacts
#    - Update governance
```

### Pattern 3: Governance Check

```bash
# 1. Load governance module
/governance-ext

# 2. Governance will:
#    - Scan for stale artifacts
#    - Validate context freshness
#    - Check artifact TTL
#    - Archive stale artifacts
#    - Update metrics
```

## Integration with OpenCode

### Agent Types

OpenCode recognizes these agent types from the extension layer:

| Agent Type | Path | description |
|------------|------|---------|
| `bmad-orchestrator` | `_bmad-ext/orchestrator/master-orchestrator.md` | Central coordination |
| `module-builder-ext` | `_bmad-ext/agents/module-builder-ext.md` | Module creation |
| `workflow-builder-ext` | `_bmad-ext/agents/workflow-builder-ext.md` | Workflow creation |

### Workflow Integration

OpenCode workflows can invoke extension layer workflows:

```yaml
# In OpenCode workflow
steps:
  - name: "Load Master Orchestrator"
    action: "invoke_agent"
    agent: "bmad-orchestrator"
    context:
      - bmm-workflow-status.yaml
      - _bmad-ext/state/LOOP_STATE.yaml

  - name: "Execute Story"
    action: "await_callback"
    from: "bmad-orchestrator"
```

## State Management

### LOOP_STATE Structure

```yaml
session:
  id: "uuid"
  start_time: "2026-01-11T10:00:00Z"
  iteration: 1
  platform: "opencode"

anchor:
  human_intent_summary: "User request"
  human_intent_timestamp: "2026-01-11T10:00:00Z"
  intent_verified: true

governance:
  last_check: "2026-01-11T10:00:00Z"
  status: "ACTIVE"
  stale_detected: 0
```

### ARTIFACT_REGISTRY Structure

```yaml
artifacts:
  "{uuid}":
    id: "{uuid}"
    path: "_bmad-output/handoffs/..."
    type: "handoff"
    status: "ACTIVE"
    created_at: "2026-01-11T10:00:00Z"
    ttl_hours: 4
```

## Error Handling

| Error | Response |
|-------|----------|
| LOOP_STATE not found | Create from template |
| Anchor stale (>4h) | Prompt user for confirmation |
| Artifact TTL expired | Archive to `_bmad-output/.archive/` |
| Module limit exceeded (4) | Warn user, suggest cleanup |
| Handoff failed | Retry once, then escalate |

## Multi-Platform Coordination

OpenCode and Claude Code share the same extension layer:

| Platform | State File | description |
|----------|-----------|---------|
| OpenCode | `_bmad-ext/state/LOOP_STATE.yaml` | Shared session state |
| Claude Code | `_bmad-ext/state/LOOP_STATE.yaml` | Shared session state |

**Note**: Both platforms can work on the same sprint, but coordination happens through:
1. Shared LOOP_STATE
2. Handoff artifacts in `_bmad-output/handoffs/`
3. Governance updates in `AGENTS.md`

## Best Practices

1. **Always load LOOP_STATE first** - Ensures proper context
2. **Verify anchor freshness** - Prevents hallucination
3. **Register all artifacts** - Enables tracking and cleanup
4. **Update governance** - Keeps AGENTS.md current
5. **Use handoff protocol** - Enables traceable delegation

## Troubleshooting

### Issue: LOOP_STATE not loading

```bash
# Check if file exists
ls -la _bmad-ext/state/LOOP_STATE.yaml

# If missing, create from template
cp _bmad-ext/state/LOOP_STATE.yaml.template _bmad-ext/state/LOOP_STATE.yaml
```

### Issue: Artifacts not tracking

```bash
# Check ARTIFACT_REGISTRY
cat _bmad-ext/state/ARTIFACT_REGISTRY.yaml

# Verify artifacts have proper frontmatter
```

### Issue: Stale artifacts not archived

```bash
# Run governance scan manually
invoke: "_bmad-ext/modules/governance/scanners/artifact-scanner.md"
```

---

**Version**: 1.0.0
**Created**: 2026-01-11
**Next Update**: After Phase 2 completion

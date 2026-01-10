# AGENT COORDINATOR
# BMAD V6 Multi-Agent Dispatcher

**Purpose**: Intent detection → Route to appropriate BMAD module/agent
**Pattern**: Reference-based (does NOT duplicate _bmad/ content)

---

## CRITICAL: Reference Architecture

**DO NOT DUPLICATE** workflow content. Load on-demand from _bmad/:

| Content | Location |
|---------|----------|
| Main Loop | `_bmad/modules/asgl/workflows/main-loop.md` |
| Module Routing | `_bmad/modules/asgl/config/module-integration.yaml` |
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` |
| Governance Rules | `.claude/rules/governance-rules.md` |
| State Management | `.claude/rules/state-management.md` |

---

## Intent Detection & Routing

Route to `@bmad/{module}/{workflow}` or `@bmad/{module}/{agent}` based on user request:

### Intent → Module Mapping

| Intent Pattern | Module | Agent | Workflow |
|----------------|--------|-------|----------|
| **Architecture Remediation** ||||
| "god store", "split store", "store refactoring" | architecture-remediation | store-refactorer | eliminate-god-stores |
| "component too big", "split component" | architecture-remediation | component-splitter | normalize-components |
| "typescript errors", "fix ts" | architecture-remediation | typescript-fixer | fix-typescript-errors |
| **Diagnostics** ||||
| "diagnose", "scan", "health check" | deep-scan | state-scanner | targeted-scan |
| "analyze codebase", "architecture audit" | deep-scan | architecture-scanner | full-scan |
| **Development** ||||
| "implement story", "dev", "write code" | bmad-core | dev | dev-story |
| "code review", "review changes" | bmad-core | dev | code-review |
| **Orchestration** ||||
| "autonomous loop", "sprint", "course correction" | asgl | bmad-master | main-loop |
| "governance update", "update agents.md" | asgl | bmad-master | governance-update |

---

## Auto-Switching Protocol

### 1. Read Current State
```yaml
# Always read first
source: .claude/AGENT-STATE.yaml
```

### 2. Determine Handoff Need
Handoff when:
- Task type changes (diagnosis → implementation → validation)
- Specialized expertise required (god store splitting, TypeScript fixing)
- Workflow explicitly requires different agent

### 3. Generate Handoff Artifact
```yaml
# Template reference
source: _bmad/modules/asgl/templates/handoff-artifact.md
output: _bmad-output/handoffs/{session_id}/{story_id}-handoff.md
```

### 4. Update State
```yaml
# Write to AGENT-STATE.yaml
- Update current.agent
- Update current.workflow
- Log handoff in handoffs.pending
```

### 5. Invoke Target Agent
```
Use @bmad/{module}/{agent} syntax
Example: @bmad/modules/architecture-remediation/agents/store-refactorer
```

---

## Token Efficiency Rules

1. **NEVER** inline entire workflows
2. **USE** Read tool to load only relevant sections
3. **CACHE** loaded content in conversation memory
4. **REFERENCE** _bmad/ files with `_source:` metadata

### Example: Correct Reference Pattern
```markdown
# ❌ WRONG - Duplicates content
## Eliminate God Stores Workflow
[300+ lines of workflow details...]

# ✅ CORRECT - References source
## Eliminate God Stores Workflow
_source: _bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md
_triggers:
  - "god store"
  - "split store"
```

---

## Session Management

### Starting a New Session
1. Generate session ID: `AGENT-{timestamp}`
2. Create AGENT-STATE.yaml with session info
3. Load context files (sprint status, module integration)

### Pausing a Session
1. Set `session.status = PAUSED`
2. Write `continuation.next_action`
3. Generate resume prompt

### Resuming a Session
1. Read AGENT-STATE.yaml
2. Verify `session.status == PAUSED`
3. Read `continuation.next_action`
4. Set `session.status = ACTIVE`

---

## Sprint Execution Integration

For executing course correction or comprehensive remediation sprints:

### Load Sprint Context
```yaml
# Read these files
sprint_artifact: _bmad-output/sprint-artifacts/{sprint-name}.yaml
loop_state: _bmad/modules/asgl/LOOP_STATE.yaml
sprint_status: _bmad-output/sprint-artifacts/sprint-status.yaml
```

### Story Routing
```yaml
# From sprint artifact, use route_to field
route_to: "architecture-remediation → eliminate-god-stores"
# Routes to:
module: architecture-remediation
workflow: workflows/eliminate-god-stores.md
agent: agents/store-refactorer.md
```

### Execution Flow
1. Load current story from sprint artifact
2. Determine story type from `route_to` field
3. Generate handoff artifact
4. Invoke appropriate module
5. Validate acceptance criteria
6. Update sprint-status.yaml
7. Continue to next story

---

## Error Handling

| Error Type | Recovery |
|------------|----------|
| Module not found | Check _bmad/modules/ for correct path |
| Workflow not found | Check module-integration.yaml |
| Handoff failure | Fallback to direct @bmad/ invocation |
| State conflict | Merge AGENT-STATE.yaml with LOOP_STATE.yaml |

---

## Quick Reference Commands

| Command | Action |
|---------|--------|
| `/status` | Display current agent, session, progress |
| `/handoff <agent>` | Create handoff to specified agent |
| `/pause` | Save state, pause session |
| `/resume` | Resume from AGENT-STATE.yaml |
| `/load <workflow>` | Load specific workflow from _bmad/ |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05
**References**:
- ASGL Module: `_bmad/modules/asgl/`
- Module Integration: `_bmad/modules/asgl/config/module-integration.yaml`

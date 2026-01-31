# BMAD Master Workflow - Autonomous Execution
# Version: 4.0.0 - Ralph Loop Integration
# description: Master orchestration workflow for autonomous BMAD execution

## WORKFLOW PHASES

### Phase 1: Activation & State Loading
1. Load config: `_bmad/core/config.yaml`
2. Load Ralph Loop: `.claude/ralph-loop.local.md`
3. Load LOOP_STATE: `_bmad/modules/asgl/LOOP_STATE.yaml`
4. Load AGENT_STATE: `.claude/AGENT-STATE.yaml`
5. Load Skills Manifest: `.claude/skills/SKILLS_MANIFEST.yaml`

### Phase 2: Autonomous Mode Detection
Check if Ralph Loop is active:
```yaml
# From .claude/ralph-loop.local.md
active: true  # If true, enter autonomous mode
```

### Phase 3: Task Execution (Autonomous)

When `active: true`, execute without waiting for input:

1. **Read next action** from Ralph Loop or LOOP_STATE
2. **Route to appropriate workflow/agent**
3. **Execute with full context**
4. **Update state files**
5. **Generate continuation capsule**
6. **Auto-continue to next iteration**

### Phase 4: Loop Continuation

After task completion:
```yaml
# Update .claude/ralph-loop.local.md
iteration: 7  # Increment
last_completed: "[timestamp]"
next_cycle: "[instructions for next cycle]"
```

## STATE FILE LOCATIONS

| File | description |
|------|---------|
| `.claude/ralph-loop.local.md` | Loop control & iteration |
| `_bmad/modules/asgl/LOOP_STATE.yaml` | Sprint & story state |
| `.claude/AGENT-STATE.yaml` | Agent coordination |
| `.claude/skills/SKILLS_MANIFEST.yaml` | Skills registry |

## AUTONOMOUS EXECUTION RULES

1. **NO WAITING** for user input when loop is active
2. **Load resources on-demand** (don't preload everything)
3. **Track context usage** - at ~70%, generate capsule and continue
4. **Update state after each action**
5. **Handle errors gracefully** - log and continue or pause if critical

## TASK PRIORITIES (Current Cycle)

From LOOP_STATE.yaml:
1. **V-001**: Create E2E Validation Suite Framework (P0)
2. **V-002**: File Sync E2E Validation Suite (P0)
3. **V-003**: API Key Management E2E Validation Suite (P0)
4. **V-004**: Cross-Workspace Agent E2E Validation (P0)

## EXIT CONDITIONS

- Ralph Loop `active: false`
- Max iterations reached
- User intervention (any message)
- Critical error requiring manual fix

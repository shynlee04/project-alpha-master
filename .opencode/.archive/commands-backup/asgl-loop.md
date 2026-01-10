# ASGL Loop Command

> **Master**: `_bmad/modules/asgl/workflows/main-loop.md` | **Version**: 2.0.0

Execute autonomous development loops using ASGL (Autonomous Self-Governing Loop Orchestrator).

## Usage

```markdown
@asgl [action] [target]

# Execute comprehensive remediation sprint
@asgl run-comprehensive-remediation

# Execute course correction sprint
@asgl execute-course-correction

# Continue paused session
@asgl resume

# Show current loop status
@asgl status

# Pause execution
@asgl pause

# Show help
@asgl help
```

## Actions

| Action | Description |
|--------|-------------|
| `run-comprehensive-remediation` | Execute 33-story sprint (target: 95% health) |
| `execute-course-correction` | Execute 7-story P0 sprint |
| `resume` | Continue from paused state |
| `status` | Display current loop progress |
| `pause` | Pause loop, save state |
| `stop` | Stop loop, generate completion report |
| `help` | Show this help message |

## Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `--stories N` | Execute N stories then pause | `--stories 3` |
| `--phase N` | Execute all stories in phase N | `--phase 1` |
| `--story ID` | Execute single story | `--story S-001` |
| `--skip-validation` | Skip validation checks (requires reason) | `--skip-validation "time constraint"` |

## Examples

```markdown
# Execute first 3 stories of comprehensive remediation
@asgl run-comprehensive-remediation --stories 3

# Execute Phase 1 (Critical Blockers)
@asgl run-comprehensive-remediation --phase 1

# Resume from paused state
@asgl resume

# Quick status check
@asgl status

# Emergency pause
@asgl pause
```

## What Happens

1. **Load Context**
   - `LOOP_STATE.yaml` (current session)
   - `governance.yaml` (rules)
   - `module-integration.yaml` (routing)
   - Sprint YAML (story definitions)

2. **Route Stories**
   - DIAGNOSTIC → deep-scan
   - GOD_STORE_SPLIT → architecture-remediation
   - IMPLEMENTATION → bmad-core dev-story

3. **Execute Module**
   - Module loads its workflow
   - Module executes with validation
   - Module returns completion report

4. **ASGL Validation**
   - Design compliance (8-bit, no glassmorphism)
   - i18n compliance (all strings via t())
   - Pending wires check

5. **Governance Update**
   - Update AGENTS.md every 3 stories
   - Update CLAUDE.md every 5 stories

6. **Continue or Complete**
   - If stories remaining → next story
   - If all done → completion report

## Current Sprint Status

```yaml
# From LOOP_STATE.yaml
session: ASGL-20260105-155500
status: INITIALIZED
phase: 1 (Critical Blockers)
current_story: S-001
stories_completed: 0
stories_remaining: 33
```

## Related Commands

| Command | Purpose |
|---------|---------|
| `@deep-scan-full` | Full codebase diagnostics |
| `@deep-scan-targeted` | Targeted domain scan |
| `@arc-eliminate-god-stores` | Split oversized stores |
| `@governance-enforcement` | Update governance docs |

---

**Generated**: 2026-01-05 | **Module**: `_bmad/modules/asgl/`

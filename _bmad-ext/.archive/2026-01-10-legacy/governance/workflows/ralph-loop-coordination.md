# Ralph Loop Coordination Workflow

**Workflow**: Ralph Loop Auto-Coordination
**Module**: Governance
**Version**: 1.0
**Created**: 2026-01-06
**Status**: ACTIVE

---

## Purpose

Establishes a canonical protocol for coordinating Ralph Loop state updates between:
1. **BMAD Master** - Updates after cycle completion
2. **Governance Module** - Validates before cycle start
3. **Domain Router** - Updates on phase transitions
4. **Ralph Hook Script** - Reads and increments on Stop hook

---

## Loop State File Structure

**Location**: `.claude/ralph-loop.local.md`

**Format**: YAML frontmatter + markdown instructions

```yaml
---
# Machine-editable YAML (lines 1-90)
cycle_sequence: [1, 2, 3, 4, 5]
current_cycle: 3
current_subcycle: "pending"
current_iteration: 17
max_iterations: 100
# ... (see full structure in ralph-loop.local.md)
---

# Human-readable instructions (lines 91+)
# These remain stable and are not parsed by machines
```

---

## Auto-Update Coordination Matrix

| Event | Updater Agent | Trigger | Fields Updated | Update Method |
|-------|---------------|---------|----------------|---------------|
| **Cycle completes** | BMAD Master | Cycle completion report generated | `last_completed_cycle`, `current_cycle`, `next_actions`, `latest_artifacts.cycle_{n}` | YAML replacement |
| **Sub-cycle completes** | Domain Router | Phase transition detected | `current_subcycle`, `phase` | Targeted sed |
| **Validation runs** | Governance | Gatekeeping validation executed | `validation`, `gates_passed`, `gates_failed` | Field update |
| **Error occurs** | Any agent | Error or rollback triggered | `errors_encountered`, `rollback_points`, `fallback_strategies` | Array append |
| **Artifact created** | BMAD Master | New completion artifact written | `latest_artifacts.{cycle_n}` | Path update |
| **Stop hook fires** | ralph-loop.sh | User stops Claude Code | `current_iteration` | Increment |

---

## Agent Responsibilities

### BMAD Master (Primary Coordinator)

**Responsibility**: Update loop state after each cycle completion

**When to Update**:
- After generating cycle completion artifact
- After consolidating sub-cycle results
- When cycle sequence changes

**What to Update**:
```yaml
# Cycle completion example
last_completed_cycle: 2
current_cycle: 3
current_subcycle: "pending"
next_actions:
  - execute_cycle_3_sync_fixes
  - execute_cycle_4_state_management
latest_artifacts:
  cycle_2: "_bmad-output/artifacts/2026-01-06/cycle-2-..."
  cycle_3: "pending"
```

**Update Template**:
```bash
# Use sed for targeted field updates
sed -i.bak 's/^last_completed_cycle: .*/last_completed_cycle: 2/' .claude/ralph-loop.local.md
sed -i.bak 's/^current_cycle: .*/current_cycle: 3/' .claude/ralph-loop.local.md
```

### Governance Module (Validator)

**Responsibility**: Validate loop state before cycle execution

**When to Validate**:
- Before starting any cycle
- After any state file modification
- On demand via `/governance-validate` command

**Validation Checks**:
1. `current_cycle` must be in `cycle_sequence`
2. `current_subcycle` must be valid for `current_cycle`
3. `latest_artifacts` paths must exist (or be "pending")
4. `active_modules` paths must exist
5. `archived_modules` must not be in `active_modules`
6. `current_iteration` ≤ `max_iterations`

**Update Validation State**:
```yaml
validation:
  last_check: "2026-01-06T12:00:00+07:00"
  status: "PASS"  # or "FAIL"
  gates_passed: 6
  gates_failed: 0
  artifact_freshness: "verified"
  module_integrity: "verified"
```

### Domain Router (Phase Tracker)

**Responsibility**: Update phase and sub-cycle on task routing

**When to Update**:
- When routing to a new domain specialist
- When sub-cycle begins or completes
- When phase changes (sync → state → ux)

**What to Update**:
```yaml
# Phase transition example
current_subcycle: "3A"
phase: "synchronization"
```

**Phase Mapping**:
| Sub-cycle | Phase | Domain |
|-----------|-------|--------|
| 3A, 3B, 3C | synchronization | sync, error |
| 4A, 4B, 4C | state_management | state |
| 5A, 5B, 5C | ux_localization | ui, i18n |

### Any Agent (Error Reporter)

**Responsibility**: Log errors and rollback points

**When to Update**:
- On critical error during execution
- When rollback is initiated
- When fallback strategy is deployed

**What to Update**:
```yaml
errors_encountered:
  - timestamp: "2026-01-06T12:30:00+07:00"
    cycle: 3
    subcycle: "3A"
    error: "WebContainer sync timeout"
    agent: "sync-specialist"

rollback_points:
  - timestamp: "2026-01-06T12:35:00+07:00"
    cycle: 3
    description: "Before 3A execution"
    git_commit: "abc123"

fallback_strategies:
  - name: "mobile_sync_fallback"
    triggered_at: "2026-01-06T12:40:00+07:00"
    result: "success"
```

---

## Update Protocol

### Reading Loop State

**All agents must read loop state before cycle execution:**

```bash
# Extract field value (bash)
CURRENT_CYCLE=$(grep "^current_cycle:" .claude/ralph-loop.local.md | cut -d: -f2 | xargs)

# Or use yaml parser if available (Python)
python3 -c "import yaml; print(yaml.safe_load(open('.claude/ralph-loop.local.md'))['current_cycle'])"
```

### Updating Loop State

**Use targeted sed updates to preserve structure:**

```bash
# Single field update
sed -i.bak 's/^current_cycle: .*/current_cycle: 3/' .claude/ralph-loop.local.md

# Multi-line field (next_actions array)
# Delete old section, insert new
sed -i.bak '/^next_actions:/,/^errors_encountered:/d' .claude/ralph-loop.local.md
# Insert new section before errors_encountered
sed -i.bak '/^errors_encountered:/i\
next_actions:\
  - execute_cycle_3_sync_fixes\
  - execute_cycle_4_state_management\
' .claude/ralph-loop.local.md
```

### macOS Compatibility

**macOS sed requires different syntax:**

```bash
# macOS sed -i requires backup extension
sed -i.bak 's/pattern/replacement/' file.txt

# For no backup, use:
sed -i '' 's/pattern/replacement/' file.txt
```

---

## Hook Integration

### Stop Hook Trigger

The `.claude/hooks/ralph-loop.sh` script is triggered on every Stop hook and:

1. Reads current loop state
2. Increments `current_iteration` counter
3. Displays cycle context to user
4. Loads latest completion artifact for context
5. Logs execution to `_bmad-output/handoffs/ralph-loop-hook-log.txt`

### Manual Hook Testing

```bash
# Test the hook script directly
./.claude/hooks/ralph-loop.sh

# Check the log
cat _bmad-output/handoffs/ralph-loop-hook-log.txt
```

---

## Rollback Strategy

If loop state becomes corrupted:

1. **Restore from backup**: `.claude/ralph-loop.local.md.bak`
2. **Regenerate from artifacts**: Read latest completion reports
3. **Reset to defaults**: Use template from governance module

### Rollback Command

```bash
# Restore last known good state
cp .claude/ralph-loop.local.md.bak .claude/ralph-loop.local.md

# Or regenerate from cycle artifacts
# (BMAD Master would implement this)
```

---

## Validation Gates

Before any cycle execution, governance module validates:

1. ✅ `current_cycle` in `cycle_sequence`
2. ✅ `current_subcycle` valid for `current_cycle`
3. ✅ All `latest_artifacts` paths exist or are "pending"
4. ✅ All `active_modules` paths exist
5. ✅ `archived_modules` not in `active_modules`
6. ✅ `current_iteration` ≤ `max_iterations`
7. ✅ YAML syntax valid

**If validation fails**: Halt execution, log error, notify human

---

## Success Criteria

- [ ] All agents read loop state before execution
- [ ] BMAD Master updates after cycle completion
- [ ] Domain Router updates on phase transitions
- [ ] Governance validates before cycle start
- [ ] Hook script increments iteration on Stop
- [ ] No manual edits to YAML section (agents only)
- [ ] Rollback strategy tested and documented
- [ ] Error logging functional

---

*Workflow created as part of Ralph Loop Coordination Design*
*Related Files:*
- `.claude/ralph-loop.local.md` - Loop state canonical file
- `.claude/hooks/ralph-loop.sh` - Stop hook handler
- `_bmad/core/agents/bmad-master.md` - Primary coordinator
- `_bmad/modules/architecture-remediation/agents/` - Remediation agents

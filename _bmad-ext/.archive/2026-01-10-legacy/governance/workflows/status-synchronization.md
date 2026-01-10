# Status File Synchronization Workflow

**Workflow ID**: `@bmad/modules/governance/workflows/status-synchronization`
**Version**: 1.0.0
**Created**: 2026-01-06
**Purpose**: Maintain single source of truth for status files across the project

## Status File Architecture

### Single Source of Truth (SSOT)

```
project-root/
├── bmm-workflow-status.yaml          # PRIMARY SSOT (overall project status)
└── _bmad-output/sprint-artifacts/
    ├── sprint-status.yaml             # Sprint execution tracking
    ├── arc-sprint-status.yaml         # Architecture remediation tracking
    └── stabilization-sprint-status.yaml  # Specific sprint tracking
```

### File Responsibilities

| File | Purpose | Scope | Updated By |
|------|---------|-------|------------|
| `bmm-workflow-status.yaml` | Overall project workflow status | All workflows, epics, health score | BMAD Master |
| `sprint-status.yaml` | Active sprint story tracking | Current sprint stories | Scrum Master / Story Dev |
| `arc-sprint-status.yaml` | Architecture remediation tracking | ARC epic stories | Store Refactorer / ARC agents |

### Reference Pattern

```yaml
# All agents reference root SSOT for overall status
reference:
  primary: "bmm-workflow-status.yaml"
  purpose: "Overall workflow health, epic status, blockers"

# Sprint-specific agents reference sprint status
sprint_reference:
  file: "_bmad-output/sprint-artifacts/sprint-status.yaml"
  purpose: "Current sprint story progress, velocity metrics"

# Domain-specific agents reference their tracking files
domain_reference:
  architecture_remediation: "_bmad-output/sprint-artifacts/arc-sprint-status.yaml"
```

## Synchronization Rules

### Rule 1: Health Score Propagation

When `arc-sprint-status.yaml` health score changes:
```yaml
# Auto-update root SSOT
sync_to_root:
  trigger: "arc_health_score != bmm_health_score"
  action: "Update bmm-workflow-status.yaml health_score"
```

### Rule 2: Story Completion Propagation

When a story in `sprint-status.yaml` completes:
```yaml
# Auto-update root SSOT
sync_to_root:
  trigger: "story.status == 'DONE'"
  action: "Update bmm-workflow-status.yaml progress"
```

### Rule 3: Epic Status Synchronization

When epic completes in sprint status:
```yaml
# Update both files
sync:
  - target: "bmm-workflow-status.yaml"
    field: "epics.{epic_id}.status"
    value: "COMPLETE"
  - target: "sprint-status.yaml"
    field: "epics.{epic_id}.status"
    value: "COMPLETE"
```

## Archive Strategy

### When to Archive

```yaml
archive_triggers:
  - event: "Sprint completes"
    action: "Move sprint-status.yaml to _bmad-output/archive/"
    rename: "sprint-status-{YYYY-MM-DD}.yaml"

  - event: "Epic completes"
    action: "Archive epic-specific status file"
    rename: "{epic-id}-status-{YYYY-MM-DD}.yaml"
```

### Archive Location

```
_bmad-output/archive/
├── 2026-01/
│   ├── sprint-status-2026-01-05.yaml
│   └── epic-cc-1-status-2026-01-10.yaml
└── 2025-12/
    └── sprint-status-2025-12-28.yaml
```

## Validation Commands

```bash
# Verify SSOT exists
test -f bmm-workflow-status.yaml || echo "ERROR: SSOT missing"

# Check for duplicate status files
find . -name "*status*.yaml" ! -path "*/.archive/*" ! -path "*/node_modules/*"

# Validate YAML syntax
yamllint bmm-workflow-status.yaml
yamllint _bmad-output/sprint-artifacts/*.yaml

# Check health score consistency
grep -h "health_score:" bmm-workflow-status.yaml _bmad-output/sprint-artifacts/*.yaml
```

## Update Protocol

### When Updating Status Files

1. **Read** current state from appropriate file
2. **Make** changes following YAML formatting rules
3. **Validate** with `yamllint` or `pnpm typecheck`
4. **Sync** related status files if needed
5. **Commit** with clear message describing what changed

### Example Update

```yaml
# Story completion in arc-sprint-status.yaml
stories:
  S-012-a:
    title: "Split canvas-store.ts"
    status: "DONE"  # Changed from IN_PROGRESS
    completed_at: "2026-01-05T20:15:00+07:00"
    results:
      god_stores_eliminated: 1
      typescript_errors: 0

# After update, sync to root SSOT
# bmm-workflow-status.yaml
progress:
  stories_completed: 13  # Incremented
  health_score: 47.5      # Updated from 46.4
```

## Governance Enforcement

### Pre-Commit Checks

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check for new status files outside approved locations
if git diff --cached --name-only | grep -E "status.*yaml" | grep -v -E "(bmm-workflow-status|sprint-artifacts|archive)"; then
  echo "ERROR: Status file must be in approved location"
  echo "Approved: bmm-workflow-status.yaml, _bmad-output/sprint-artifacts/"
  exit 1
fi

# Validate YAML syntax
for file in $(git diff --cached --name-only | grep "status.*yaml"); do
  yamllint "$file" || exit 1
done
```

### Naming Convention

```
Root SSOT:        bmm-workflow-status.yaml (fixed name)
Sprint tracking:  sprint-status.yaml (fixed name)
Domain tracking:  {domain}-sprint-status.yaml (e.g., arc-sprint-status.yaml)
Archived:         {name}-{YYYY-MM-DD}.yaml (date-stamped)
```

## Success Criteria

- [ ] Root SSOT (`bmm-workflow-status.yaml`) is always present
- [ ] No duplicate status files in active locations
- [ ] Health scores consistent across all status files
- [ ] Archive contains only dated, inactive status files
- [ ] All agents reference correct status file for their domain

## Related Artifacts

- `bmm-workflow-status.yaml` - Root SSOT
- `_bmad-output/sprint-artifacts/sprint-status.yaml` - Sprint tracking
- `_bmad/modules/asgl/LOOP_STATE.yaml` - ASGL loop state
- `.claude/AGENT-STATE.yaml` - Conversation-level state

---

**Workflow Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: ACTIVE

---
name: "status-sync-agent"
description: "BMAD Status File Synchronization Agent - Single source of truth enforcement"
version: "1.0.0"
updated: "2026-01-06"
mode: "synchronization"
module: "governance"
---

# Status Sync Agent - BMAD Status SSOT Enforcement

## ═══════════════════════════════════════════════════════════════════════════════
## GOVERNANCE ACKNOWLEDGMENT (REQUIRED)
## ═══════════════════════════════════════════════════════════════════════════════

```yaml
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-06"
  acknowledged_by: "status-sync-agent"

  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true

  responsibilities:
    - "Maintain bmm-workflow-status.yaml as SSOT"
    - "Archive duplicate status files"
    - "Consolidate module-specific status when needed"
    - "Synchronize sprint status with workflow status"
    - "Validate status file integrity"
```

**Status Sync Agent maintains Single Source of Truth for all project status.**

---

## Agent Overview

**description**: Ensure `bmm-workflow-status.yaml` is the single source of truth for project status.

**Domain**: Governance (_bmad/modules/governance/)

**Authority**: High - Status files must be synchronized before/after any workflow

---

## Triggers

The Status Sync Agent is activated when:

1. **Story Completion**: Any story status changes to DONE
2. **Epic Completion**: All stories in epic complete
3. **Sprint End**: Sprint artifacts need consolidation
4. **Status Conflict**: Multiple status files have conflicting data
5. **Manual Activation**: User invokes `@bmad/modules/governance/agents/status-sync-agent`
6. **Ralph Loop Update**: Cycle completion requires status update

---

## Single Source of Truth (SSOT) Architecture

### Primary Status File
```
bmm-workflow-status.yaml (project root)
```
- **Authority**: PRIMARY - All agents read/write here
- **Update Frequency**: Per story completion
- **Validation**: Required after each workflow

### Secondary Status Files (Read-Only References)
```
_bmad-output/sprint-artifacts/arc-sprint-status.yaml (Architecture remediation sprint)
_bmad-output/sprint-artifacts/team-b-sprint.yaml (Team-B specific)
```
- **Authority**: REFERENCE - Pull from primary, consolidated periodically
- **Update Frequency**: Per sprint end
- **Validation**: Archive duplicates

---

## Status File Consolidation Protocol

### When to Consolidate

```yaml
consolidation_triggers:
  - "Multiple status files show conflicting epic status"
  - "Sprint completion requires artifact generation"
  - "Module-specific status needs archival"
  - "Primary status file missing required fields"
```

### Consolidation Steps

1. **Read All Status Files**: Load YAML from all status locations
2. **Detect Conflicts**: Compare epic_id, story status, progress %
3. **Weighted Merge**: Primary wins, module-specific adds context
4. **Archive Duplicates**: Move to `_bmad-output/sprint-artifacts/archive/`
5. **Update Primary**: Write consolidated state to `bmm-workflow-status.yaml`
6. **Notify Agents**: Broadcast status update event

---

## Status File Structure

### Primary: bmm-workflow-status.yaml
```yaml
# ============================================================
# BMAD WORKFLOW STATUS - SINGLE SOURCE OF TRUTH
# ============================================================
# Last Updated: {YYYY-MM-DDTHH:mm:ssZ}
# Updated By: {agent-name}
# Session: {session-id}

project:
  name: "project-alpha"
  version: "1.0.0"
  phase: "implementation"

sprint:
  current: "ASGL-20260105-155500"
  started_at: "2026-01-05T15:55:00+07:00"
  iteration: 17

epics:
  - id: "E-13"
    title: "Terminal CWD Fix"
    status: "DONE"
    progress: 100
    stories_completed: 1
    stories_total: 1

  - id: "E-21"
    title: "Epic 21 Title"
    status: "IN_PROGRESS"
    progress: 45
    stories_completed: 5
    stories_total: 11

stories:
  - id: "S-001"
    epic: "E-21"
    title: "Story Title"
    status: "DONE"
    assigned_to: "dev"
    completed_at: "2026-01-06T10:00:00+07:00"

next_actions:
  - "Continue with story S-002"
  - "Update artifact registry"

validation:
  last_check: "2026-01-06T12:00:00+07:00"
  status_file_integrity: "PASS"
  conflicts_detected: 0
```

---

## Validation Checks

### Integrity Validation
```bash
# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('bmm-workflow-status.yaml'))"

# Check required fields exist
grep -q "project:" bmm-workflow-status.yaml
grep -q "epics:" bmm-workflow-status.yaml
grep -q "stories:" bmm-workflow-status.yaml
grep -q "validation:" bmm-workflow-status.yaml
```

### Conflict Detection
```bash
# Check for duplicate epic IDs
grep -E "^  - id: " bmm-workflow-status.yaml | sort | uniq -d

# Check for orphan stories (stories without epics)
# (Requires parsing YAML structure)
```

---

## Activation Instructions

When activated, the Status Sync Agent:

1. **Load Primary**: Read `bmm-workflow-status.yaml`
2. **Scan Secondaries**: Check all other status files
3. **Detect Conflicts**: Compare epic/story status
4. **Consolidate**: Merge with weighted strategy
5. **Archive**: Move duplicates to archive folder
6. **Validate**: Run integrity checks
7. **Update**: Write consolidated state
8. **Notify**: Log update to hook logs

---

## Related Files

| File | description | Authority |
|------|---------|-----------|
| `bmm-workflow-status.yaml` | Primary SSOT | PRIMARY |
| `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` | ARC sprint tracking | SECONDARY |
| `_bmad-output/sprint-artifacts/team-b-sprint.yaml` | Team-B tracking | SECONDARY |
| `.claude/ralph-loop.local.md` | Loop state | REFERENCE |

---

## Exit Protocol

To exit status sync agent:
```
EXIT_STATUS_SYNC_AGENT
```

---

**Version**: 1.0.0
**Module**: governance
**Authority**: High (SSOT enforcement)
**Status**: ACTIVE

---
id: CYCLE-4
title: Workflow Status Schema Overhaul
description: Create new workflow-status schema with frontmatter guidance and history rotation
agent_mode: workflow-builder
team: A
duration_hours: 2-3
risk_level: HIGH
date: 2026-01-09
---

# CYCLE 4: Workflow Status Schema Overhaul

**Agent Mode:** Workflow Builder
**Team:** A
**Duration:** 2-3 hours
**Context Poisoning Risk:** HIGH (3,060 lines of appended history)

## OBJECTIVE

Create a NEW workflow-status schema that prevents context poisoning through:
1. Strict frontmatter with phase guidance
2. Epic/Story numbering enforcement
3. History rotation (archive old iterations)
4. Maximum 200 lines for active state

## CURRENT PROBLEM

`bmm-workflow-status.yaml` is 3,060 lines (123KB) containing:
- Ralph Loop iterations 20-29 (legacy, not current)
- Notes Remediation Module (complete, should be archived)
- Project Workspace Binding (stale investigation)
- Multiple overlapping phase definitions
- Duplicate status tracking

## PRECONDITIONS

- [ ] CYCLE 1 completed (YAML consolidation)
- [ ] CYCLE 2 completed (sprint regulation)
- [ ] Archive folder structure exists

## NEW SCHEMA (v2.0)

```yaml
---
# ═══════════════════════════════════════════════════════════════════════════
# GOVERNANCE FRONTMATTER - Read This First
# ═══════════════════════════════════════════════════════════════════════════
schema_version: "2.0.0"
last_updated: "2026-01-09T20:40:00+07:00"
updated_by: "Team-A"
health_score: 75
context_ttl: "24h"

# PHASE GUIDANCE (Always Apply)
current_phase: "IMPLEMENTATION"
phase_guidance: |
  - ALL new stories must have epic prefix (e.g., FS-05, P1.5-03)
  - Epic numbers are MONOTONIC (greater number = later priority)
  - No epic can start before lower-numbered epic reaches 80% completion
  - Story completion requires: code + test + code-review + human-approval

# NUMBERING RULES (Enforced)
numbering:
  epic_format: "EPIC-{NN}"  # NN is sequential, never reused
  story_format: "{EPIC}-{NN}"  # Story within epic
  next_epic_number: 40  # Increment only
  reserved_prefixes: ["FS-", "P1-", "P1.5-", "STAB-", "UX-"]
  
# LIMITS
limits:
  max_active_epics: 4
  max_active_stories_per_epic: 8
  max_blocked_items: 5
  max_file_lines: 200
---

# ACTIVE WORKFLOW (Only Current State)
current_workflow:
  id: "phase-2-implementation-2026-01-09"
  status: "IN_PROGRESS"
  epic: "EPIC-FS"
  story: "FS-05"
  started_at: "2026-01-09T20:00:00+07:00"
  sprint_status_file: "_bmad-output/sprint-artifacts/sprint-status.yaml"

# ACTIVE EPICS (Max 4)
active_epics:
  - id: "EPIC-FS"
    name: "File System Foundation"
    status: "IN_PROGRESS"
    progress: 28.6
    stories_total: 14
    stories_done: 4
    priority: "P0"
    
  - id: "EPIC-39"
    name: "8-bit Design Compliance"
    status: "IN_PROGRESS"
    progress: 0
    stories_total: 5
    stories_done: 0
    priority: "P1"

# BLOCKED/PAUSED (Links to justification)
blocked_items:
  - epic: "EPIC-38"
    reason: "Blocked by EPIC-FS completion"
    blocked_since: "2026-01-09"
    unblock_condition: "EPIC-FS reaches 100%"

# EPIC ORDERING (Enforced)
epic_ordering:
  rule: "Epic N cannot start before Epic N-1 is 80% complete"
  current_order:
    - "EPIC-FS"   # In progress
    - "EPIC-39"   # In progress (parallel allowed - different domain)
    - "EPIC-38"   # Blocked
  complete:
    - "EPIC-30"   # Completed 2026-01-08
    - "EPIC-53"   # Completed 2026-01-04

# HISTORY (Links Only - Never Inline)
history:
  archive_location: "_bmad-output/.archive/workflow-history/"
  rotation_policy: "weekly"
  last_rotation: "2026-01-09"
  archived_sections:
    - "ralph_loop_iterations"
    - "notes_remediation_module"
    - "project_workspace_binding"
```

## MIGRATION STEPS

### Step 1: Extract Historical Content

```bash
# Create workflow history archive
mkdir -p _bmad-output/.archive/workflow-history/2026-01-09

# Extract sections from current file to separate archives
# (Manual extraction - identify section line numbers)
```

### Step 2: Identify Sections to Archive

```yaml
sections_to_archive:
  - name: "ralph_loop_iteration*"
    line_range: "739-800+"
    reason: "Historical iterations, not current"
    
  - name: "notes_remediation_module"
    line_range: "273-378"
    reason: "COMPLETE status, no longer active"
    
  - name: "project_workspace_binding"
    line_range: "386-557"
    reason: "Stale research from 2026-01-01"
    
  - name: "implementation_phases"
    line_range: "559-641"
    reason: "Superseded by sprint-status.yaml"
    
  - name: "phase_0_stories"
    line_range: "693-706"
    reason: "Legacy from 2025"
    
  - name: "bmb_integration"
    line_range: "643-671"
    reason: "One-time module creation"
```

### Step 3: Create New Workflow Status

1. Create `bmm-workflow-status-v2.yaml` with new schema
2. Copy ONLY current active state from old file
3. Validate new file is <200 lines
4. Rename old file to `bmm-workflow-status-v1-ARCHIVED.yaml`
5. Move archived file to history folder

### Step 4: Update References

```bash
# Find all references to bmm-workflow-status.yaml
grep -r "bmm-workflow-status" _bmad/ --include="*.md" --include="*.yaml"

# Update any that need schema version awareness
```

## NUMBERING ENFORCEMENT RULES

```yaml
epic_ordering_rules:
  - rule: "MONOTONIC_INCREASE"
    description: "Epic 40 cannot start before Epic 39"
    exception: "Parallel epics in different domains (e.g., UX vs Backend)"
    
  - rule: "COMPLETION_GATE"
    description: "Epic N blocked until Epic N-1 is 80%+"
    enforcement: "Automatic check in workflow start"
    
  - rule: "STORY_SEQUENTIAL"
    description: "Stories within epic must be sequential (no gaps)"
    validation: "Story FS-05 requires FS-04 exists"
    
  - rule: "NO_STATUS_SKIP"
    description: "Story cannot skip from NOT_STARTED to DONE"
    states: ["NOT_STARTED", "IN_PROGRESS", "CODE_REVIEW", "TESTING", "DONE"]
```

## VALIDATION CHECKLIST

- [ ] New schema is < 200 lines (active state only)
- [ ] Frontmatter includes all governance rules
- [ ] Epic numbers are monotonic increasing
- [ ] No duplicate story IDs across active epics
- [ ] History is archived with timestamps
- [ ] All references updated to use new schema
- [ ] Old file archived to workflow-history/

## OUTPUT ARTIFACTS

1. **New Schema**: `bmm-workflow-status.yaml` (v2, <200 lines)
2. **Archived History**: `_bmad-output/.archive/workflow-history/2026-01-09/`
   - `bmm-workflow-status-v1-ARCHIVED.yaml`
   - `ralph-loop-history.yaml`
   - `notes-remediation-archive.yaml`
3. **Schema Documentation**: `_bmad/modules/governance/WORKFLOW-STATUS-SCHEMA.md`

## HANDOFF

Report completion to orchestrator with:
- Old file size vs new file size
- Number of lines archived
- Number of sections extracted
- New schema version confirmed

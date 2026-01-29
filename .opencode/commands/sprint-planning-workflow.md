---
description: 'Update the current sprint status with new stories and epics without deleting existing progress'
subtask: true
return: ["Sprint status updated", "Governance validation run"]
---

# Sprint Planning Workflow: Update Status

This workflow updates the active sprint status file with new requirements while preserving existing progress.

<steps CRITICAL="TRUE">
1. IDENTIFY the active sprint status file (currently `_bmad-output/sprint-artifacts/sprint-status-architecture-remediation-2026-01-15.yaml`)
2. READ the current content to ensure no data loss
3. APPEND new Epics/Stories to the `epics` section
4. UPDATE the `execution_plan` to include the new work
5. UPDATE `metrics` (story counts, estimated hours)
6. VALIDATE that no existing stories (CC-01 to CC-08) were modified or deleted
7. SAVE the file
</steps>

## Input
- New Epics/Stories definitions
- Target Team assignments (Team A / Team B)
- Dependency mapping

## Output
- Updated `sprint-status-*.yaml` file
- Confirmation of preserved history

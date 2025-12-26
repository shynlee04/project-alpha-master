# Status Synchronization Procedure

**Document ID**: STATUS-SYNC-PROCEDURE-2025-12-26
**Last Updated**: 2025-12-26T16:45:00+07:00
**Maintainer**: BMAD Master Orchestrator (bmad-core-bmad-master)
**Version**: 1.0

---

## Purpose

Maintain consistency between all governance status documents to prevent the governance failures that caused the current project crisis.

---

## Primary Sources of Truth

### 1. Sprint Status Document

**File**: [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)
**Purpose**: Track story-level progress and completion status
**Owner**: BMAD Master Orchestrator
**Update Frequency**: After each story completion/blocker

**Status Values**:
- `NOT_STARTED`: Story not yet started
- `IN_PROGRESS`: Story actively being worked on
- `BLOCKED`: Story blocked by dependencies
- `DONE`: Story completed and verified

### 2. Workflow Status Document

**File**: [`_bmad-output/bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml)
**Purpose**: Track agent-level workflow status
**Owner**: BMAD Master Orchestrator
**Update Frequency**: After each handoff acceptance/completion

**Status Values**:
- `PENDING`: Handoff created, awaiting target agent
- `IN_PROGRESS`: Target agent actively working
- `COMPLETED`: Handoff accepted and work completed
- `BLOCKED`: Handoff blocked by dependencies

---

## Update Triggers

### Mandatory Update Triggers

Status documents MUST be updated after:

1. **Task Completion**
   - Source agent completes work on handoff
   - Target agent completes work on handoff
   - Story marked DONE in sprint-status.yaml

2. **Handoff Creation**
   - Source agent creates new handoff document
   - Handoff added to HANDOFF-INDEX.md

3. **Handoff Acceptance**
   - Target agent accepts handoff
   - Handoff status updated to IN_PROGRESS

4. **Handoff Completion**
   - Target agent completes work on handoff
   - Handoff status updated to COMPLETED

5. **E2E Verification**
   - Story E2E verification completed
   - Screenshot/recording captured
   - Verification artifacts stored

6. **Sprint Retrospective**
   - Sprint retrospective completed
   - Story statuses reviewed
   - Governance rules updated

### Recommended Update Triggers

Status documents SHOULD be updated after:

1. **Daily Standup**
   - Review active handoffs
   - Verify status consistency
   - Update any stale statuses

2. **Story Transition**
   - Story moves from NOT_STARTED → IN_PROGRESS
   - Story moves from IN_PROGRESS → BLOCKED
   - Story moves from BLOCKED → IN_PROGRESS

3. **Agent Assignment**
   - New agent assigned to story
   - Handoff created for new agent

4. **Governance Review**
   - New governance rules established
   - Protocols updated
   - Audit completed

---

## Update Procedure

### Source Agent Updates (e.g., Architect, PM)

1. **Complete Work on Handoff**
   - Meet all acceptance criteria
   - Document any deviations
   - Prepare handoff completion summary

2. **Update Status in Handoff Document**
   - Update completion status at top of handoff
   - Add completion timestamp
   - Note any deviations or issues

3. **Update HANDOFF-INDEX.md**
   - Change handoff status from PENDING/IN_PROGRESS to COMPLETED
   - Update completion timestamp
   - Add any notes or deviations

4. **Update bmm-workflow-status-consolidated.yaml**
   - Update agent workflow status
   - Set work completion timestamp
   - Update any relevant metrics

5. **Notify BMAD Master**
   - Inform BMAD Master of completion
   - Provide summary of work completed
   - Flag any issues or blockers

### Target Agent Updates (e.g., Dev, PM)

1. **Review Handoff Document**
   - Read entire handoff document
   - Verify all required sections present
   - Check acceptance criteria are clear

2. **Accept or Request Clarification**
   - If clear and complete: Accept handoff
   - If unclear: Request clarification from source agent
   - Document acceptance/rejection in HANDOFF-INDEX.md

3. **Update Status to IN_PROGRESS**
   - Update HANDOFF-INDEX.md status
   - Update bmm-workflow-status-consolidated.yaml
   - Set work start timestamp

4. **Begin Work on Task**
   - Follow task specification
   - Update progress regularly
   - Flag blockers or issues early

5. **Complete Work on Handoff**
   - Meet all acceptance criteria
   - Document any deviations
   - Prepare completion summary

6. **Update Status to COMPLETED**
   - Update HANDOFF-INDEX.md status
   - Update bmm-workflow-status-consolidated.yaml
   - Set work completion timestamp

7. **Update sprint-status-consolidated.yaml** (if applicable)
   - Update story status if story completed
   - Set completion timestamp
   - Add E2E verification artifacts

### BMAD Master Orchestrator Updates

1. **Monitor Handoff Activity**
   - Track active handoffs
   - Identify stale handoffs (>7 days old)
   - Follow up on blocked handoffs

2. **Verify Status Consistency**
   - Compare HANDOFF-INDEX.md with bmm-workflow-status-consolidated.yaml
   - Compare with sprint-status-consolidated.yaml
   - Identify conflicts

3. **Resolve Conflicts**
   - Consult original handoff documents
   - Verify actual completion status
   - Make decision on correct status
   - Update all governance documents

4. **Update Governance Index**
   - Keep GOVERNANCE-INDEX.md current
   - Update statistics regularly
   - Add new governance artifacts

5. **Conduct Governance Reviews**
   - Weekly review of handoff process
   - Monthly review of governance rules
   - Quarterly audit of governance infrastructure

---

## Conflict Resolution Procedure

### Identifying Conflicts

1. **Cross-Reference Status Documents**
   - Compare HANDOFF-INDEX.md with bmm-workflow-status-consolidated.yaml
   - Compare with sprint-status-consolidated.yaml
   - Check for mismatched statuses

2. **Review Original Documents**
   - Check original handoff documents
   - Verify completion timestamps
   - Check completion notes

3. **Identify Conflict Type**
   - **Status Conflict**: Different status for same handoff
   - **Timestamp Conflict**: Conflicting completion times
   - **Data Conflict**: Inconsistent metadata

### Resolving Conflicts

1. **Consult Source Agent**
   - Ask source agent for clarification
   - Verify actual completion status
   - Request evidence if needed

2. **Consult Target Agent**
   - Ask target agent for status
   - Verify work progress
   - Check for blockers

3. **Escalate to BMAD Master**
   - If conflict cannot be resolved between agents
   - Provide evidence from both sides
   - Request decision from BMAD Master

4. **Apply Resolution**
   - Update all governance documents with resolved status
   - Document conflict resolution in GOVERNANCE-INDEX.md change log
   - Notify all affected agents

### Preventing Conflicts

1. **Clear Status Definitions**
   - Document what each status value means
   - Define transition conditions
   - Establish update triggers

2. **Single Source of Truth**
   - sprint-status-consolidated.yaml is primary for story status
   - bmm-workflow-status-consolidated.yaml is primary for workflow status
   - HANDOFF-INDEX.md is primary for handoff tracking

3. **Timestamp Validation**
   - Use ISO 8601 format consistently
   - Include timezone in timestamps
   - Validate timestamp ordering

4. **Regular Audits**
   - Weekly status consistency checks
   - Monthly governance reviews
   - Quarterly infrastructure audits

---

## Status Update Checklist

### Before Updating Status

- [ ] Verify update trigger is valid
- [ ] Have correct status value
- [ ] Prepare update with supporting information
- [ ] Identify all affected documents

### During Status Update

- [ ] Update all affected documents
- [ ] Use consistent timestamps
- [ ] Document reason for status change
- [ ] Update statistics if applicable

### After Status Update

- [ ] Verify all documents updated consistently
- [ ] Check for new conflicts introduced
- [ ] Notify relevant agents if needed
- [ ] Update governance index statistics

---

## Change Log

| Date | Change | Author |
|------|--------|---------|
| 2025-12-26T16:45:00+07:00 | Initial status synchronization procedure created | bmad-bmm-architect |

---

**Next Review**: After first status conflict resolution
**Review Frequency**: Monthly or after governance rule changes

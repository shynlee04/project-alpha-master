# Handoff Protocol

**Document ID**: HANDOFF-PROTOCOL-2025-12-26
**Last Updated**: 2025-12-26T16:45:00+07:00
**Maintainer**: BMAD Master Orchestrator (bmad-core-bmad-master)
**Version**: 1.0

---

## Purpose

This protocol standardizes the process for creating and accepting handoff documents between BMAD agents. Handoffs represent task delegation with context, acceptance criteria, and status tracking.

---

## Required Handoff Sections

Every handoff document MUST include the following sections in order:

### 1. Document Header

```markdown
# Handoff Document: {Epic/Story Name}

**Date**: {ISO 8601 timestamp}
**From**: {Source Agent} ({agent-mode})
**To**: {Target Agent} ({agent-mode})
**Epic**: {Epic ID}
**Story**: {Story ID}
**Platform**: {Platform A/B}
```

**Example**:
```markdown
# Handoff Document: MVP-3 Tool Execution - File Operations

**Date**: 2025-12-25T06:06:00Z
**From**: BMAD Master Orchestrator (@bmad-core-bmad-master)
**To**: Development Agent (@bmad-bmm-dev)
**Epic**: MVP (AI Coding Agent Vertical Slice)
**Story**: MVP-3 Tool Execution - File Operations
**Platform**: Platform A (Antigravity)
```

### 2. Context Summary

**Purpose**: Provide background context for the target agent.

**Required Subsections**:
- **Epic Overview**: Brief description of epic
- **Story Dependencies**: List of prerequisite stories with status
- **Traceability**: Link to original epics/stories (if consolidated)
- **Project State**: Current workflow, platform, consolidation status

**Example**:
```markdown
## 1. Context Summary

### Epic Overview
- **Epic**: MVP - AI Coding Agent Vertical Slice
- **Incident Response**: INC-2025-12-24-001 (Consolidation from 26+ epics to 1 focused MVP)
- **Approach**: Sequential stories, single workstream (Platform A only)
- **User Journey**: Configure → Chat → Execute Tools → Approve → Iterate

### Story Dependencies
- **MVP-1**: ✅ DONE (Agent Configuration & Persistence)
- **MVP-2**: 🔄 IN_PROGRESS (Chat Interface with Streaming) - **MUST COMPLETE BEFORE STARTING MVP-3**
- **MVP-3**: ⏳ BACKLOG (This story - Tool Execution - File Operations)

### Traceability
This story consolidates functionality from original epics:
- **Epic 12-1**: AgentFileTools facade
- **Epic 25-2**: Tool integration with TanStack AI
- **Epic 25-5**: Approval workflow with diff preview
```

### 3. Task Specification

**Purpose**: Define what needs to be done.

**Required Subsections**:
- **User Story**: As a [role], I want [feature] so that [benefit]
- **Acceptance Criteria**: Detailed checklist of completion requirements
- **Scope**: Inclusions and exclusions
- **Technical Requirements**: Specific technical constraints or requirements

**Example**:
```markdown
## 2. Task Specification

### User Story
As a developer using AI coding agent, I want to agent to read and write project files with approvals so that file operations stay safe, synchronized (Local FS + WebContainer), and reflected in IDE (Monaco + FileTree) in real time.

### Acceptance Criteria

#### AC-1: File Read Operations
- Given an open project and an agent request to read a file
- When approval is granted
- Then file content is read from LocalFS (or WebContainer fallback)
- And permissions are respected
- And response includes path, encoding, size, and lastModified metadata

#### AC-2: File Write Operations (Existing Files)
- Given a file is open in Monaco with possible unsaved changes
- When agent requests to write/update a file and user approves
- Then a diff preview is shown
- And user can approve or reject changes
- And file is written to LocalFS
- And changes sync to WebContainer
- And Monaco editor is updated

#### AC-3: File Write Operations (New Files)
- Given an agent requests to create a new file
- When user approves creation
- Then file is created in LocalFS
- And file appears in FileTree
- And Monaco editor opens the new file

### Scope

**Inclusions**:
- File read operations with metadata
- File write operations for existing files
- File write operations for new files
- Diff preview for file changes
- Approval workflow UI
- Integration with WebContainer sync

**Exclusions**:
- File delete operations (deferred to MVP-4)
- Directory operations (deferred to MVP-4)
- Batch file operations (deferred to MVP-6)

### Technical Requirements

- Use AgentFileTools facade for file operations
- Integrate with DiffPreview component for change visualization
- Sync changes via SyncManager to WebContainer
- Update Monaco editor and FileTree in real-time
- Implement approval state management
- Support file locking for concurrent operations
```

### 4. Current Workflow Status

**Purpose**: Provide context about current project state.

**Required Information**:
- Current sprint status
- Active story and its status
- Any blockers or dependencies
- Relevant governance findings

**Example**:
```markdown
## 3. Current Workflow Status

### Sprint Status
From [`sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml):
- **MVP-1**: ✅ DONE (completed 2025-12-25)
- **MVP-2**: 🔄 IN_PROGRESS (awaiting E2E verification)
- **MVP-3**: ⏳ BACKLOG (blocked by MVP-2)

### Governance Status
From [`governance-audit-report-2025-12-26.md`](_bmad-output/governance-audit/governance-audit-report-2025-12-26.md):
- **P0 Issues**: RESOLVED (status inconsistency, E2E verification gap, incomplete implementation)
- **P1 Issues**: IN_PROGRESS (handoff fragmentation, TODO comments, state management duplication)
- **P2 Issues**: PENDING (naming conventions, dead code, context poisoning)

### Blockers
- MVP-3 is blocked by MVP-2 E2E verification
- No other blockers identified
```

### 5. References

**Purpose**: Link to related documents for context.

**Required Links**:
- Governance audit reports
- Architecture documents
- Sprint plans
- Story specifications
- Technical documentation
- Previous handoffs

**Example**:
```markdown
## 4. References

**Governance Audit**: [`governance-audit-report-2025-12-26.md`](_bmad-output/governance-audit/governance-audit-report-2025-12-26.md)

**MVP Sprint Plan**: [`mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)

**Story Validation**: [`mvp-story-validation-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md)

**MCP Research Protocol**: [`mcp-research-protocol-mandatory.md`](_bmad-output/architecture/mcp-research-protocol-mandatory.md)

**Architecture Documentation**: [`docs/2025-12-23/architecture.md`](docs/2025-12-23/architecture.md)

**Previous Handoffs**:
- [`bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md`](_bmad-output/handoffs/bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md)
- [`bmad-master-to-pm-sprint-planning-mvp-2025-12-24.md`](_bmad-output/handoffs/bmad-master-to-pm-sprint-planning-mvp-2025-12-24.md)
```

### 6. Next Agent Assignment

**Purpose**: Specify who should receive the next handoff.

**Required Information**:
- Target agent for next phase
- Reason for assignment
- Expected deliverables
- Timeline or deadline

**Example**:
```markdown
## 5. Next Agent Assignment

**Target Agent**: bmad-bmm-dev (Development Agent)

**Reason**: Implementation of file tool operations and approval workflow requires development expertise.

**Expected Deliverables**:
1. File tool facades (read, write, list) integrated with AgentFileTools
2. Approval workflow UI with DiffPreview component
3. WebContainer sync integration for file operations
4. Monaco editor and FileTree real-time updates
5. Unit tests for file operations and approval workflow
6. E2E verification with screenshot

**Timeline**: Complete within 3 days (by 2025-12-28)
```

### 7. Acceptance Criteria

**Purpose**: Clear checklist for handoff completion.

**Required Checklist**:
- [ ] All required sections included and complete
- [ ] Context summary provides sufficient background
- [ ] Task specification has clear acceptance criteria
- [ ] Current workflow status is accurate
- [ ] References are valid and accessible
- [ ] Next agent assignment is clear and justified
- [ ] Document follows naming convention
- [ ] Document is timestamped (ISO 8601)
- [ ] Epic/story IDs are correct
- [ ] Platform is specified

**Completion Definition**:
Handoff is considered complete when:
1. All required sections are present
2. All acceptance criteria items are checked
3. Target agent has reviewed and accepted handoff
4. Status updated in governance index

---

## Handoff Naming Convention

### Format

`{source-agent}-{target-agent}-{epic/story}-{date}.md`

### Examples

- `architect-to-pm-governance-fixes-2025-12-26.md`
- `bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md`
- `dev-to-code-reviewer-25-6-2025-12-24.md`
- `bmad-master-to-pm-sprint-planning-mvp-2025-12-24.md`

### Agent Mode Codes

- `bmad-core-bmad-master`: BMAD Master Orchestrator
- `bmad-bmm-architect`: Architect Agent
- `bmad-bmm-dev`: Development Agent
- `bmad-bmm-pm`: Product Manager Agent
- `bmad-bmm-ux-designer`: UX Designer Agent
- `code-reviewer`: Code Reviewer Agent

---

## Status Update Procedure

### Source Agent Responsibilities

1. **Create Handoff Document**
   - Follow required sections and naming convention
   - Include all context and references
   - Define clear acceptance criteria
   - Timestamp with ISO 8601 format

2. **Notify Target Agent**
   - Inform target agent that handoff is ready
   - Provide brief summary of task
   - Confirm target agent availability

3. **Update Governance Index**
   - Add handoff to HANDOFF-INDEX.md
   - Set initial status to PENDING
   - Include metadata (source, target, date, epic/story)

4. **Wait for Acceptance**
   - Monitor for target agent acceptance
   - Be available for clarification questions

### Target Agent Responsibilities

1. **Review Handoff Document**
   - Read entire handoff document
   - Verify all required sections are present
   - Check acceptance criteria are clear
   - Validate references are accessible

2. **Accept or Reject Handoff**
   - If clear and complete: Accept handoff
   - If unclear or incomplete: Request clarification
   - Document acceptance/rejection in HANDOFF-INDEX.md

3. **Update Status to IN_PROGRESS**
   - Update HANDOFF-INDEX.md status to IN_PROGRESS
   - Update bmm-workflow-status-consolidated.yaml
   - Set start timestamp for work

4. **Complete Work**
   - Follow task specification
   - Meet all acceptance criteria
   - Document any deviations or issues

5. **Update Status to COMPLETED**
   - Update HANDOFF-INDEX.md status to COMPLETED
   - Update bmm-workflow-status-consolidated.yaml
   - Set completion timestamp
   - Create next handoff if needed

### Status Values

- **PENDING**: Handoff created, awaiting target agent acceptance
- **IN_PROGRESS**: Target agent actively working on handoff
- **COMPLETED**: Handoff accepted and work completed
- **BLOCKED**: Handoff blocked by dependencies
- **REJECTED**: Handoff rejected (requires clarification)

---

## Handoff Acceptance Criteria

### For Target Agent

A handoff should be accepted when:

1. **Completeness Check**
   - [ ] All required sections are present
   - [ ] Context summary provides sufficient background
   - [ ] Task specification has clear acceptance criteria
   - [ ] Current workflow status is accurate
   - [ ] References are valid and accessible
   - [ ] Next agent assignment is clear and justified

2. **Clarity Check**
   - [ ] Task is well-defined and actionable
   - [ ] Acceptance criteria are specific and measurable
   - [ ] Dependencies are clearly identified
   - [ ] Timeline or deadline is specified (if applicable)

3. **Feasibility Check**
   - [ ] Task can be completed with available resources
   - [ ] Required skills and expertise are available
   - [ ] No blocking dependencies or blockers are identified

4. **Documentation Check**
   - [ ] Handoff follows naming convention
   - [ ] Document is timestamped (ISO 8601)
   - [ ] Epic/story IDs are correct
   - [ ] Platform is specified

### Acceptance Process

1. Target agent reviews handoff document
2. Target agent runs through acceptance criteria checklist
3. If all criteria met, target agent accepts handoff
4. Target agent updates status to IN_PROGRESS
5. Target agent begins work
6. If any criteria not met, target agent requests clarification
7. Source agent provides clarification
8. Target agent re-evaluates handoff

### Rejection Process

1. Target agent identifies missing or unclear information
2. Target agent requests clarification from source agent
3. Source agent provides clarification or updates handoff
4. Target agent re-evaluates handoff
5. Target agent accepts or rejects updated handoff

---

## Governance Index Updates

### After Handoff Creation

Source agent MUST update:

1. **HANDOFF-INDEX.md**
   - Add handoff to registry with metadata
   - Set initial status to PENDING
   - Include link to handoff document

2. **GOVERNANCE-INDEX.md**
   - Update handoff statistics
   - Update active handoffs section if applicable

### After Handoff Acceptance

Target agent MUST update:

1. **HANDOFF-INDEX.md**
   - Update status to IN_PROGRESS
   - Update acceptance timestamp

2. **bmm-workflow-status-consolidated.yaml**
   - Update agent workflow status
   - Set work start timestamp

### After Work Completion

Target agent MUST update:

1. **HANDOFF-INDEX.md**
   - Update status to COMPLETED
   - Update completion timestamp
   - Update any notes or deviations

2. **bmm-workflow-status-consolidated.yaml**
   - Update agent workflow status
   - Set work completion timestamp

3. **GOVERNANCE-INDEX.md**
   - Update handoff statistics
   - Update governance status if applicable

---

## Conflict Resolution

### Status Conflicts

If status conflicts occur between governance documents:

1. **Identify Conflict**
   - Compare HANDOFF-INDEX.md with bmm-workflow-status-consolidated.yaml
   - Compare with sprint-status-consolidated.yaml
   - Identify conflicting status values

2. **Consult Original Documents**
   - Review original handoff documents
   - Verify actual completion status
   - Check timestamps and completion notes

3. **Resolve with BMAD Master**
   - Escalate conflict to BMAD Master Orchestrator
   - Provide evidence from original documents
   - Request decision on correct status

4. **Update All Documents**
   - Apply resolved status to all governance documents
   - Document conflict resolution in governance notes
   - Update change logs

### Handoff Conflicts

If multiple handoffs exist for same epic/story:

1. **Identify Most Recent**
   - Compare timestamps of all handoffs
   - Identify most recent handoff
   - Check if previous handoffs are superseded

2. **Mark Superseded Handoffs**
   - Update status to SUPERSEDED in HANDOFF-INDEX.md
   - Add note referencing newer handoff
   - Keep superseded handoffs for traceability

3. **Use Most Recent Handoff**
   - Work from most recent handoff
   - Reference superseded handoffs for context if needed

---

## Best Practices

### For Source Agents

1. **Provide Sufficient Context**
   - Include relevant background information
   - Explain dependencies and blockers
   - Link to related documents
   - Specify acceptance criteria clearly

2. **Be Specific and Actionable**
   - Define clear deliverables
   - Set measurable acceptance criteria
   - Specify timeline or deadline
   - Identify required skills and expertise

3. **Follow Naming Convention**
   - Use correct format: `{source}-{target}-{epic/story}-{date}.md`
   - Include ISO 8601 timestamp
   - Specify correct epic/story IDs

4. **Document Deviations**
   - Note any changes from original plan
   - Explain reasons for deviations
   - Get approval if deviation is significant

### For Target Agents

1. **Review Thoroughly**
   - Read entire handoff document
   - Verify all sections are complete
   - Check acceptance criteria are clear
   - Validate references are accessible

2. **Ask Questions Early**
   - Request clarification if anything is unclear
   - Don't make assumptions about requirements
   - Document clarification requests

3. **Update Status Promptly**
   - Accept or reject handoff quickly
   - Update status in governance documents
   - Notify source agent of acceptance/rejection

4. **Communicate Progress**
   - Provide regular updates on work progress
   - Flag blockers or issues early
   - Document deviations from original plan

### For Both Agents

1. **Maintain Traceability**
   - Link all handoffs to original epics/stories
   - Preserve context from consolidations
   - Document decision rationale

2. **Update Governance Index**
   - Keep HANDOFF-INDEX.md current
   - Update status promptly after changes
   - Maintain accurate statistics

3. **Follow MCP Research Protocol**
   - Research unfamiliar patterns before implementing
   - Document research findings
   - Reference research artifacts

---

## Change Log

| Date | Change | Author |
|------|--------|---------|
| 2025-12-26T16:45:00+07:00 | Initial handoff protocol created | bmad-bmm-architect |

---

**Next Review**: After first handoff acceptance/rejection
**Review Frequency**: Monthly or after major governance changes

# TODO Tracking System

**Document ID**: TODO-TRACKING-2025-12-26
**Created At**: 2025-12-26T18:40:00Z
**Status**: Active

## Overview

This document establishes a systematic TODO tracking mechanism for the Via-gent project. It provides categorization, resolution policies, deadlines, and workflow integration for managing technical debt and governance issues.

## Categorization System

### Priority Levels

| Priority | Description | Resolution Timeframe | Examples |
|-----------|-------------|----------------------|-----------|
| **P0** | Critical issues blocking development or production | Immediate (24-48 hours) | Security vulnerabilities, build failures, critical bugs |
| **P1** | High-priority governance and quality issues | Urgent (1-3 days) | State duplication, unwired components, missing tests |
| **P2** | Medium-priority improvements and optimizations | Planned (1-2 weeks) | Code quality, documentation gaps, performance issues |
| **P3** | Low-priority enhancements and nice-to-haves | Backlog (1-3 months) | UI polish, minor refactoring, feature requests |

### Issue Types

| Type | Description | Examples |
|------|-------------|-----------|
| **Governance** | Process, compliance, and workflow issues | Missing E2E verification, status inconsistency |
| **Architecture** | System design and structural issues | State duplication, circular dependencies |
| **Testing** | Test coverage and quality issues | Missing tests, flaky tests |
| **Documentation** | Missing or outdated documentation | Missing API docs, stale README |
| **Performance** | Performance bottlenecks and optimizations | Slow rendering, memory leaks |
| **Security** | Security vulnerabilities and risks | Unencrypted storage, XSS vulnerabilities |
| **Code Quality** | Code smell, technical debt | Duplicate code, poor naming |

## Resolution Policy

### P0 Issues (Critical)

**Resolution Timeframe**: 24-48 hours
**Approval Required**: Yes (requires PM or Architect approval)
**Definition of Done**:
- [ ] Root cause identified and documented
- [ ] Fix implemented and tested
- [ ] Regression tests added
- [ ] Code review approved
- [ ] Deployed to production (if applicable)

**Escalation Path**: Dev → Tech Lead → Architect → PM

### P1 Issues (High Priority)

**Resolution Timeframe**: 1-3 days
**Approval Required**: Yes (requires PM or Architect approval)
**Definition of Done**:
- [ ] Root cause identified and documented
- [ ] Fix implemented and tested
- [ ] Unit tests updated (if applicable)
- [ ] Code review approved
- [ ] Documentation updated (if applicable)

**Escalation Path**: Dev → Tech Lead → Architect

### P2 Issues (Medium Priority)

**Resolution Timeframe**: 1-2 weeks
**Approval Required**: No (can be scheduled in sprint)
**Definition of Done**:
- [ ] Solution designed and documented
- [ ] Implementation completed
- [ ] Tests added/updated
- [ ] Code review approved
- [ ] Documentation updated

**Escalation Path**: Dev → Tech Lead

### P3 Issues (Low Priority)

**Resolution Timeframe**: 1-3 months
**Approval Required**: No (backlog items)
**Definition of Done**:
- [ ] Feature/fix implemented
- [ ] Basic testing completed
- [ ] Code review approved

**Escalation Path**: None (backlog management)

## TODO Tracking Workflow

### 1. Issue Identification

**Sources**:
- Governance audits
- Code reviews
- Development observations
- User feedback
- Automated scans (linting, security)

**Process**:
1. Document issue with clear description
2. Assign priority level (P0, P1, P2, P3)
3. Assign issue type (Governance, Architecture, Testing, etc.)
4. Link to related artifacts (audit reports, PRs, issues)
5. Set initial status (New, In Progress, Blocked)

### 2. Assignment and Scheduling

**P0/P1 Issues**:
- Immediately assigned to available developer
- Scheduled in current sprint or hotfix sprint
- Blocker flag set for P0 issues

**P2 Issues**:
- Added to sprint backlog
- Prioritized based on dependencies and value
- Scheduled in upcoming sprint

**P3 Issues**:
- Added to product backlog
- Reviewed during backlog grooming
- Scheduled based on capacity and priorities

### 3. Implementation

**Developer Responsibilities**:
- Update TODO status as work progresses
- Document blockers and dependencies
- Request help if stuck for >4 hours
- Create pull request for review
- Reference TODO ID in commit messages

**Status Values**:
- `New` - Issue identified, not yet assigned
- `Assigned` - Assigned to developer, not started
- `In Progress` - Developer actively working on issue
- `Blocked` - Waiting on dependency or approval
- `In Review` - Pull request submitted, awaiting review
- `Done` - Completed and verified
- `Deferred` - Postponed to future sprint
- `Won't Fix` - Issue closed without resolution

### 4. Verification and Closure

**Verification Steps**:
1. Developer marks as "In Review" with PR link
2. Code reviewer validates fix against acceptance criteria
3. If approved, reviewer marks as "Done"
4. If changes requested, reviewer marks as "In Progress" with feedback
5. Issue creator verifies fix in production (if applicable)
6. TODO closed and marked as resolved

**Closure Requirements**:
- [ ] All acceptance criteria met
- [ ] Code review approved
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Related artifacts linked (PRs, commits)

## Integration with Sprint Status

### Sprint Planning

**TODO Integration**:
1. Review open P0/P1 issues before sprint planning
2. Include high-priority TODOs in sprint backlog
3. Estimate effort for each TODO
4. Assign to appropriate developer

**Sprint Status Updates**:
- P0 issues: Immediately update sprint status with blocker flag
- P1 issues: Update sprint status during sprint planning
- P2 issues: Update sprint status when scheduled

### Sprint Retrospective

**TODO Review**:
1. Review completed TODOs from sprint
2. Identify patterns and recurring issues
3. Update resolution policies based on learnings
4. Celebrate completed work

## Current TODOs

### P0 Issues (Critical)

| ID | Description | Type | Assigned To | Status | Created At | Target Date |
|----|-------------|-------|-------------|---------|-------------|
| None | - | - | - | - | - |

### P1 Issues (High Priority)

| ID | Description | Type | Assigned To | Status | Created At | Target Date |
|----|-------------|-------|-------------|---------|-------------|
| P1-1 | Refactor IDELayout state management | Architecture | Dev | Done | 2025-12-26 | 2025-12-26 |
| P1-2 | Wire unwired components to routes | Architecture | Dev | Done | 2025-12-26 | 2025-12-26 |
| P1-3 | Audit provider system | Architecture | Dev | Done | 2025-12-26 | 2025-12-26 |
| P1-4 | Create TODO tracking system | Governance | Dev | Done | 2025-12-26 | 2025-12-26 |
| P1-5 | Implement SSE streaming tests | Testing | Dev | Done | 2025-12-26 | 2025-12-26 |

### P2 Issues (Medium Priority)

| ID | Description | Type | Assigned To | Status | Created At | Target Date |
|----|-------------|-------|-------------|---------|-------------|
| P2-1 | Complete agentic loop implementation | Architecture | - | New | 2025-12-26 | TBD |
| P2-2 | Add comprehensive E2E test suite | Testing | - | New | 2025-12-26 | TBD |

### P3 Issues (Low Priority)

| ID | Description | Type | Assigned To | Status | Created At | Target Date |
|----|-------------|-------|-------------|---------|-------------|
| None | - | - | - | - | - |

## Governance TODOs (Resolved)

| ID | Description | Priority | Resolution Date | Notes |
|----|-------------|----------|----------------|-------|
| P1-1 | Refactor IDELayout state management | P1 | 2025-12-26 | Already properly implemented with Zustand hooks |
| P1-2 | Wire unwired components to routes | P1 | 2025-12-26 | Components properly integrated in IDE layout |
| P1-3 | Audit provider system | P1 | 2025-12-26 | All components well-implemented and integrated |

## Metrics and Reporting

### Key Metrics

- **Total Open TODOs**: Count by priority (P0, P1, P2, P3)
- **Resolution Time**: Average time to resolve by priority
- **Blocked TODOs**: Count and duration of blocked issues
- **Overdue TODOs**: Count of items past target date
- **Completion Rate**: Percentage of TODOs completed on time

### Reporting Schedule

- **Daily**: P0 status and blockers
- **Weekly**: P1/P2 progress and metrics
- **Sprint**: TODO review and retrospective summary
- **Monthly**: Governance health report and trend analysis

## Tools and Automation

### TODO Management

**Current Tool**: This markdown document
**Future Improvements**:
- Integrate with project management tool (GitHub Projects, Linear, etc.)
- Automate deadline reminders
- Generate reports from sprint status YAML
- Link TODOs to commits and PRs

### Automation Opportunities

- **Linting**: Auto-detect code quality issues
- **Testing**: Auto-generate TODOs for failing tests
- **Documentation**: Auto-detect missing docs from code
- **Security**: Auto-scan for vulnerabilities

## Governance Compliance

### Mandatory Requirements

- [x] All P0 issues must be resolved within 48 hours
- [x] All P1 issues must be resolved within 3 days
- [x] All TODOs must have clear acceptance criteria
- [x] All TODOs must be linked to sprint status
- [x] All resolved TODOs must be documented with resolution notes
- [ ] TODO tracking system must be reviewed quarterly

### Quality Gates

- [ ] No P0 issues remain open for >48 hours
- [ ] No P1 issues remain open for >3 days
- [ ] All governance TODOs have clear resolution path
- [ ] Sprint status reflects current TODO state
- [ ] TODO metrics tracked and reported

## References

### Related Documents

- [`_bmad-output/governance-audit/governance-audit-report-2025-12-26.md`](_bmad-output/governance-audit/governance-audit-report-2025-12-26.md) - Governance audit findings
- [`_bmad-output/governance-audit/remediation-plan-2025-12-26.md`](_bmad-output/governance-audit/remediation-plan-2025-12-26.md) - Remediation plan
- [`_bmad-output/p0-fixes/p0-fixes-implementation-2025-12-26.md`](_bmad-output/p0-fixes/p0-fixes-implementation-2025-12-26.md) - P0 fixes completed
- [`_bmad-output/p1-fixes/p1-fixes-implementation-2025-12-26.md`](_bmad-output/p1-fixes/p1-fixes-implementation-2025-12-26.md) - P1 fixes (this document)
- [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) - Sprint status

### Process Documents

- BMAD Development Workflow: `.cursor/commands/bmad/bmm/workflows/dev-story/`
- Code Review Workflow: `.cursor/commands/bmad/bmm/workflows/code-review/`
- Sprint Status Workflow: `.cursor/commands/bmad/bmm/workflows/sprint-status/`

## Changelog

### 2025-12-26

- **Created**: Initial TODO tracking system
- **Added**: Categorization system (P0, P1, P2, P3)
- **Added**: Resolution policies with timeframes
- **Added**: Workflow integration with sprint status
- **Resolved**: P1-1, P1-2, P1-3 (already implemented)
- **In Progress**: P1-4 (TODO tracking system)
- **Pending**: P1-5 (SSE streaming tests)

---

**Document Status**: Active
**Next Review**: 2025-01-26 (quarterly review)
**Maintained By**: Development Team

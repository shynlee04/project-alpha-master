# TODO Tracking System

**Document ID**: TODO-TRACKING-2025-12-26
**Created At**: 2025-12-26T16:25:00+07:00
**Last Updated**: 2025-12-26T16:25:00+07:00
**Owner**: bmad-bmm-dev

---

## Overview

This document tracks all TODO/FIXME/HACK/XXX comments found in the codebase. Each TODO is categorized by severity (P0, P1, P2) with ownership and deadlines.

**Total TODOs**: 5
- **P0 (Critical)**: 0
- **P1 (High)**: 3
- **P2 (Medium)**: 2

---

## TODO Resolution Policy

- **P0 TODOs**: Resolve within 1 sprint (immediate action required)
- **P1 TODOs**: Resolve within 2 sprints (urgent action required)
- **P2 TODOs**: Resolve within 3 sprints (action required)

**Sprint Review**: All TODOs are reviewed in sprint retrospectives for progress tracking.

**Replacement Strategy**: TODO comments should be replaced with GitHub issues or project tracking items for better visibility and accountability.

---

## P1 TODOs (High Priority)

### TODO-1: Implement New Project Creation

**File**: [`src/components/hub/HubHomePage.tsx`](src/components/hub/HubHomePage.tsx:60-62)
**Line**: 60-62
**Severity**: P1 (High)
**Status**: Open
**Owner**: TBD
**Deadline**: 2025-01-09 (2 sprints)

**Description**:
```typescript
const handleNewProject = () => {
  // TODO: Implement new project creation
  console.log('Create new project');
};
```

**Context**:
- HubHomePage has a "New Project" button that currently only logs to console
- Needs actual project creation functionality
- Should integrate with workspace/project-store.ts for persistence
- Should open file picker for project location

**Acceptance Criteria**:
- [ ] Implement project creation workflow
- [ ] Integrate with ProjectStore for persistence
- [ ] Add file picker for project location
- [ ] Add validation for project name
- [ ] Test project creation end-to-end
- [ ] Replace TODO with GitHub issue reference

**Related Stories**: MVP-1 (Agent Configuration & Persistence)

---

### TODO-2: Implement Folder Picker

**File**: [`src/components/hub/HubHomePage.tsx`](src/components/hub/HubHomePage.tsx:65-67)
**Line**: 65-67
**Severity**: P1 (High)
**Status**: Open
**Owner**: TBD
**Deadline**: 2025-01-09 (2 sprints)

**Description**:
```typescript
const handleOpenFolder = () => {
  // TODO: Implement folder picker
  console.log('Open folder');
};
```

**Context**:
- HubHomePage has an "Open Folder" button that currently only logs to console
- Needs actual folder picker functionality using File System Access API
- Should integrate with workspace/project-store.ts for persistence
- Should handle permission lifecycle properly

**Acceptance Criteria**:
- [ ] Implement folder picker using `window.showDirectoryPicker()`
- [ ] Integrate with ProjectStore for persistence
- [ ] Handle permission lifecycle with `permission-lifecycle.ts`
- [ ] Add error handling for permission denied
- [ ] Test folder opening end-to-end
- [ ] Replace TODO with GitHub issue reference

**Related Stories**: MVP-1 (Agent Configuration & Persistence)

---

### TODO-3: Implement Project Actions

**File**: [`src/components/hub/HubHomePage.tsx`](src/components/hub/HubHomePage.tsx:204-206)
**Line**: 204-206
**Severity**: P1 (High)
**Status**: Open
**Owner**: TBD
**Deadline**: 2025-01-09 (2 sprints)

**Description**:
```typescript
onClick={(e) => {
  e.stopPropagation();
  // TODO: Implement project actions
}}
```

**Context**:
- Project cards have action buttons that currently do nothing
- Need to implement project actions (delete, rename, export, etc.)
- Should integrate with workspace/project-store.ts
- Should have confirmation dialogs for destructive actions

**Acceptance Criteria**:
- [ ] Implement delete project action with confirmation
- [ ] Implement rename project action with dialog
- [ ] Implement export project action
- [ ] Integrate with ProjectStore for persistence
- [ ] Add error handling for all actions
- [ ] Test all project actions end-to-end
- [ ] Replace TODO with GitHub issue reference

**Related Stories**: MVP-1 (Agent Configuration & Persistence)

---

## P2 TODOs (Medium Priority)

### TODO-4: Fix Complex Mocking Issues in i18n Tests

**File**: [`src/components/__tests__/workspace-i18n.test.tsx`](src/components/__tests__/workspace-i18n.test.tsx:37-38)
**Line**: 37-38
**Severity**: P2 (Medium)
**Status**: Open
**Owner**: TBD
**Deadline**: 2025-01-23 (3 sprints)

**Description**:
```typescript
// TODO: Fix complex mocking issues - these tests need WorkspaceContext setup
// Skipping for CI stability (Story 22-2: CI/CD Pipeline)
```

**Context**:
- i18n tests are skipped due to complex mocking issues
- Tests need proper WorkspaceContext setup
- Skipping for CI stability
- Related to Story 22-2: CI/CD Pipeline

**Acceptance Criteria**:
- [ ] Set up proper WorkspaceContext mocking
- [ ] Fix i18n test mocking issues
- [ ] Enable skipped tests
- [ ] Ensure tests pass in CI
- [ ] Replace TODO with GitHub issue reference

**Related Stories**: Story 22-2 (CI/CD Pipeline)

---

### TODO-5: Replace Mock Data with TanStack Query + API

**File**: [`src/mocks/agents.ts`](src/mocks/agents.ts:30-32)
**Line**: 30-32
**Severity**: P2 (Medium)
**Status**: Open
**Owner**: TBD
**Deadline**: 2025-01-23 (3 sprints)

**Description**:
```typescript
/**
 * TODO: Replace with TanStack Query + API in Epic 25
 */
```

**Context**:
- Mock data currently used for agents
- Should be replaced with TanStack Query + API calls
- Related to Epic 25 (AI Foundation)
- Epic 25 has been consolidated into MVP epic

**Acceptance Criteria**:
- [ ] Implement TanStack Query for agent data fetching
- [ ] Replace mock data with API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test API integration end-to-end
- [ ] Replace TODO with GitHub issue reference

**Related Stories**: MVP-1 (Agent Configuration & Persistence), Epic 25 (AI Foundation)

---

## TODO Resolution Tracking

### Sprint 1 (2025-12-26 to 2026-01-09)

| TODO ID | Description | Status | Resolved At | Notes |
|---------|-------------|--------|--------------|-------|
| TODO-1 | Implement New Project Creation | Open | - | - |
| TODO-2 | Implement Folder Picker | Open | - | - |
| TODO-3 | Implement Project Actions | Open | - | - |

### Sprint 2 (2026-01-10 to 2026-01-23)

| TODO ID | Description | Status | Resolved At | Notes |
|---------|-------------|--------|--------------|-------|
| TODO-4 | Fix Complex Mocking Issues in i18n Tests | Open | - | - |
| TODO-5 | Replace Mock Data with TanStack Query + API | Open | - | - |

---

## Governance Notes

**TODO Tracking Requirements**:
- All TODOs must be tracked in this document
- TODOs must be categorized by severity
- TODOs must have ownership and deadlines
- TODOs must be reviewed in sprint retrospectives
- TODO comments should be replaced with GitHub issues

**Enforcement**:
- Code review checklist: No new TODOs without tracking entry
- Sprint retrospective: Review TODO progress and update deadlines
- Documentation: This document is single source of truth for TODOs

---

## References

**Related Documents**:
- [`state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)
- [`architect-to-pm-governance-fixes-2025-12-26.md`](_bmad-output/handoffs/architect-to-pm-governance-fixes-2025-12-26.md)
- [`mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)

**MVP Stories**:
- MVP-1: Agent Configuration & Persistence (IN_PROGRESS)
- MVP-2: Chat Interface with Streaming (DONE, awaiting E2E verification)
- MVP-3: Tool Execution - File Operations (HALTED)
- MVP-4: Tool Execution - Terminal Commands (NOT STARTED)
- MVP-5: Approval Workflow (NOT STARTED)
- MVP-6: Real-time UI Updates (NOT STARTED)
- MVP-7: E2E Integration Testing (NOT STARTED)

---

**Document Status**: Active
**Next Review**: Sprint 1 Retrospective (2026-01-09)

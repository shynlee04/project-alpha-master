# Story 13-5: Improve Permission Restoration

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13 - Terminal & Sync Stability  
**Priority:** P1  
**Story Points:** 3  
**Status:** ready-for-dev

---

## User Story

As a **user**,  
I want **my project access to persist between sessions**,  
So that **I don't have to re-authorize frequently**.

---

## Acceptance Criteria

### AC-13-5-1: Persistent permissions used if available (Chrome 122+)
**Given** the user is on Chrome 122 or later  
**When** the user selects "Allow on every visit" in the permission prompt  
**Then** the permission persists across browser sessions without re-prompting

### AC-13-5-2: "Restore Access" button shown for handles with `prompt` state
**Given** the user has a stored project with `prompt` permission state  
**When** the user opens the project from dashboard  
**Then** a "Restore Access" button is shown instead of immediately prompting  
**And** clicking the button triggers the permission request

### AC-13-5-3: Permission state tracked in project metadata
**Given** a project is opened successfully  
**When** the permission state changes  
**Then** the state is stored in `ProjectMetadata.permissionState`  
**And** the dashboard displays appropriate visual indicators

### AC-13-5-4: Graceful fallback for non-supporting browsers
**Given** the browser does not support persistent permissions (< Chrome 122)  
**When** the user opens a stored project  
**Then** standard permission prompt is shown as fallback  
**And** no errors occur

---

## Implementation Tasks

- [ ] T1: Add `queryPermission()` check on project load in WorkspaceContext
- [ ] T2: Add "Restore Access" button UI in IDELayout for `prompt` state
- [ ] T3: Add `permissionState` field to ProjectMetadata persistence
- [ ] T4: Add feature detection for persistent permissions API (Chrome 122+)
- [ ] T5: Add 6 unit tests for permission feature detection and restoration

---

## Dev Notes

### Architecture Patterns
- Use existing `getPermissionState()` from `permission-lifecycle.ts`
- Extend `ProjectMetadata` interface in `project-store.ts`
- Follow WorkspaceContext state management pattern

### Chrome 122+ Persistent Permissions
Per Chrome 122 release notes:
- New three-way permission prompt: "Allow this time" / "Allow on every visit" / "Block"
- No developer API changes - browser handles persistence automatically
- Store `FileSystemHandle` in IndexedDB → call `requestPermission()` on next visit
- **Feature detection**: Check for `navigator.permissions.query` with `name: 'file-system'`

### Files to Modify
- `src/lib/filesystem/permission-lifecycle.ts` - Add feature detection helper
- `src/lib/workspace/project-store.ts` - Add permissionState persistence
- `src/lib/workspace/WorkspaceContext.tsx` - Add permission check on mount
- `src/components/ide/IDELayout.tsx` - Add "Restore Access" UI

---

## References

- [Chrome 122 Release Notes - Persistent Permissions](https://developer.chrome.com/blog/fsa-improvements)
- [Epic 13 in epics.md](file:///Users/apple/Documents/coding-projects/project-alpha-master/_bmad-output/epics.md#L1950-L1976)
- [permission-lifecycle.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/filesystem/permission-lifecycle.ts)
- [project-store.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/workspace/project-store.ts)

---

## Dev Agent Record

**Agent:**  
**Session:**  

### Task Progress
_(To be filled during implementation)_

### Files Changed
_(To be filled during implementation)_

### Tests Created
_(To be filled during implementation)_

---

## Code Review

**Reviewer:**  
**Date:**  

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found
_(To be filled during review)_

### Sign-off
_(Pending)_

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-20 | drafted | SM | Story created |
| 2025-12-20 | ready-for-dev | SM | Context XML created |

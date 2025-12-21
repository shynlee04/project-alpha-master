# Epic 7 Extended: Git Integration Enhancements

**Goal:** Extend the base Git integration with advanced features for branching, merging, and history.

**Priority:** P3  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Merged from legacy Epic 19  
**Prerequisites:** Epic 7 (Base Git Integration complete)

### Story 7-5: Implement Git Branch Switching UI

As a **user**,  
I want **to switch branches from the UI**,  
So that **I don't need to use terminal for branch operations**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-7-5-1:** Branch name shown in status bar
- **AC-7-5-2:** Click opens branch picker dropdown
- **AC-7-5-3:** Create new branch option available
- **AC-7-5-4:** Stash prompt if uncommitted changes exist
- **AC-7-5-5:** Branch switch updates file tree

---

### Story 7-6: Add Visual Merge Conflict Resolution

As a **user with merge conflicts**,  
I want **an in-editor 3-way merge view**,  
So that **I can resolve conflicts visually**.

**Story Points:** 5

**Acceptance Criteria:**

- **AC-7-6-1:** Conflict markers detected on file load
- **AC-7-6-2:** 3-panel view: ours, base, theirs
- **AC-7-6-3:** "Accept Ours", "Accept Theirs", "Accept Both" buttons
- **AC-7-6-4:** Manual editing in result panel
- **AC-7-6-5:** "Mark Resolved" saves file and stages it

---

### Story 7-7: Implement Git History Timeline View

As a **user reviewing history**,  
I want **a visual commit timeline**,  
So that **I can understand project evolution**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-7-7-1:** Timeline panel in sidebar
- **AC-7-7-2:** Commits shown with message, author, date
- **AC-7-7-3:** Click commit to view its diff
- **AC-7-7-4:** Branch visualization (simple linear for now)
- **AC-7-7-5:** Load more for pagination (50 commits at a time)

---

### Story 7-8: Add GitHub PR Preview

As a **user preparing a PR**,  
I want **to preview my changes before pushing**,  
So that **I know what the PR will look like**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-7-8-1:** "Compare with remote" button in Git panel
- **AC-7-8-2:** Diff view shows local vs origin/main
- **AC-7-8-3:** Files changed summary (additions/deletions)
- **AC-7-8-4:** Commit range displayed
- **AC-7-8-5:** Link to open GitHub compare page

---

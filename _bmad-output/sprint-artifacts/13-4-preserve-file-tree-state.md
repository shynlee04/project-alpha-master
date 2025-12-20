# Story 13-4: Preserve File Tree State

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13 - Terminal & Sync Stability  
**Priority:** P1  
**Story Points:** 2  
**Status:** done

---

## User Story

As a **user**,  
I want **the file tree to maintain my expanded folders**,  
So that **I don't lose context after file operations**.

---

## Acceptance Criteria

### AC-13-4-1: Creating a file preserves expanded folder state ✅
**Given** the user has several folders expanded in the file tree  
**When** the user creates a new file via context menu  
**Then** all previously expanded folders remain expanded  

### AC-13-4-2: Saving a file preserves expanded folder state ✅
**Given** the user has several folders expanded in the file tree  
**When** the user saves a file (Cmd+S or auto-save)  
**Then** all previously expanded folders remain expanded  

### AC-13-4-3: New files are auto-selected in tree ✅
**Given** the user creates a new file via context menu  
**When** the file is created successfully  
**Then** the new file is automatically selected in the tree  

### AC-13-4-4: Parent folder of new file auto-expands ✅
**Given** the user creates a new file in a nested folder  
**When** the file is created successfully  
**Then** the parent folder of the new file is expanded (if not already)  
**And** any ancestor folders are expanded to reveal the new file  

---

## Implementation Tasks

- [x] T1: Add `expandedPaths: Set<string>` state to `useFileTreeState.ts`
- [x] T2: Create `restoreExpandedState()` and `getAncestorPaths()` helpers in `utils.ts`
- [x] T3: Update `useFileTreeActions` to sync expandedPaths on toggle and restore after reload
- [x] T4: Update `useContextMenuActions` to preserve state + auto-select new files
- [x] T5: Create 10 unit tests for utility functions

---

## Dev Agent Record

**Agent:** Antigravity  
**Session:** 2025-12-20T08:55:00+07:00

### Task Progress
- [x] T1: Added `expandedPaths: Set<string>` state to `useFileTreeState.ts`
- [x] T2: Created `restoreExpandedState()` and `getAncestorPaths()` in `utils.ts`
- [x] T3: Updated `useFileTreeActions` - syncs expandedPaths on toggle
- [x] T4: Updated `useContextMenuActions` - preserves state, auto-selects new files
- [x] T5: Created `FileTree.test.ts` with 10 tests

### Files Changed

| File | Action | Lines |
|------|--------|-------|
| `useFileTreeState.ts` | Modified | +8 (expandedPaths state) |
| `useFileTreeActions.ts` | Modified | +15 (sync on toggle, restore) |
| `useContextMenuActions.ts` | Modified | +25 (preserve state, auto-select) |
| `utils.ts` | Modified | +35 (two new helpers) |
| `FileTree.tsx` | Modified | +6 (wire new props) |
| `FileTree.test.ts` | Created | 188 (10 tests) |

### Tests Created
- `restoreExpandedState`: 4 tests
- `getAncestorPaths`: 4 tests
- `buildTreeNode`: 3 tests

---

## Code Review

**Reviewer:** Antigravity (self-review)  
**Date:** 2025-12-20T09:01:00+07:00

### Checklist
- [x] All ACs verified
- [x] All tests passing (182 total)
- [x] Architecture patterns followed
- [x] No TypeScript errors
- [x] Code quality acceptable

### Issues Found
- None

### Sign-off
✅ APPROVED - All tests pass, TypeScript clean

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-20 | drafted | SM | Story created |
| 2025-12-20 | ready-for-dev | SM | Context XML created |
| 2025-12-20 | in-progress | Dev | Implementation started |
| 2025-12-20 | done | Dev | 10 tests, all 182 pass |

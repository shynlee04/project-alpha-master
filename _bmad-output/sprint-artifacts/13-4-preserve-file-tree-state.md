# Story 13-4: Preserve File Tree State

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13 - Terminal & Sync Stability  
**Priority:** P1  
**Story Points:** 2  
**Status:** ready-for-dev

---

## User Story

As a **user**,  
I want **the file tree to maintain my expanded folders**,  
So that **I don't lose context after file operations**.

---

## Acceptance Criteria

### AC-13-4-1: Creating a file preserves expanded folder state
**Given** the user has several folders expanded in the file tree  
**When** the user creates a new file via context menu  
**Then** all previously expanded folders remain expanded  

### AC-13-4-2: Saving a file preserves expanded folder state
**Given** the user has several folders expanded in the file tree  
**When** the user saves a file (Cmd+S or auto-save)  
**Then** all previously expanded folders remain expanded  

### AC-13-4-3: New files are auto-selected in tree
**Given** the user creates a new file via context menu  
**When** the file is created successfully  
**Then** the new file is automatically selected in the tree  

### AC-13-4-4: Parent folder of new file auto-expands
**Given** the user creates a new file in a nested folder  
**When** the file is created successfully  
**Then** the parent folder of the new file is expanded (if not already)  
**And** any ancestor folders are expanded to reveal the new file  

---

## Implementation Tasks

### T1: Add `expandedPaths` state to FileTree
- [ ] Create `expandedPaths: Set<string>` state in `useFileTreeState.ts`
- [ ] Sync `expandedPaths` when `handleToggle` expands/collapses folders
- [ ] Export `expandedPaths` and `setExpandedPaths` from hook

### T2: Persist expanded paths through tree reload
- [ ] Capture `expandedPaths` before calling `loadRootDirectory()` 
- [ ] After tree reloads, re-expand nodes matching saved paths
- [ ] Create helper `restoreExpandedState(nodes, expandedPaths)` in utils

### T3: Update context menu actions to preserve state
- [ ] Modify `useContextMenuActions.handleContextMenuAction` for 'new-file'
- [ ] Modify `useContextMenuActions.handleContextMenuAction` for 'new-folder'
- [ ] After creation, auto-expand parent path and add to `expandedPaths`

### T4: Auto-select newly created files
- [ ] After file creation, call `onSelect` with new file node
- [ ] Set `focusedPath` and `selectedPath` to new file path

### T5: Create unit tests for expanded state preservation
- [ ] Test: expanded state persists after file creation
- [ ] Test: expanded state persists after folder creation
- [ ] Test: new file is auto-selected
- [ ] Test: parent folder auto-expands for nested file creation

---

## Dev Notes

### Root Cause Analysis
The current bug occurs because `useContextMenuActions.ts` calls `loadRootDirectory()` after file operations (lines 104, 124, 137, 151). This replaces the entire `rootNodes` tree, losing the `expanded` property on each `TreeNode`.

### Solution Approach
Add a separate `expandedPaths: Set<string>` state that tracks expanded folder paths independently of the tree structure. When the tree reloads, restore expanded state by matching paths.

### Files to Modify
- `src/components/ide/FileTree/hooks/useFileTreeState.ts` - Add expandedPaths state
- `src/components/ide/FileTree/hooks/useFileTreeActions.ts` - Sync expandedPaths on toggle
- `src/components/ide/FileTree/hooks/useContextMenuActions.ts` - Preserve state on operations
- `src/components/ide/FileTree/utils.ts` - Add restoreExpandedState helper

### Architecture Pattern Reference
Per `project-context.md`:
- Tests are co-located: `src/components/ide/FileTree/__tests__/`
- Use interface for props (not type alias)
- Custom error classes from `@/lib/filesystem`

---

## Research Requirements

- [ ] Check if WorkspaceContext should store expandedPaths for persistence across sessions
- [ ] Verify no circular dependency when passing expandedPaths through hooks

---

## References

- Epic: [epics.md#epic-13-terminal--sync-stability](_bmad-output/epics.md)
- Architecture: [architecture.md#file-tree-component](_bmad-output/architecture.md)
- Related Story: [13-3-add-sync-progress-indicator.md](13-3-add-sync-progress-indicator.md)

---

## Dev Agent Record

<!-- To be filled during implementation -->

---

## Code Review

<!-- To be filled during review -->

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-20 | drafted | SM | Story created |
| 2025-12-20 | ready-for-dev | SM | Context XML created |

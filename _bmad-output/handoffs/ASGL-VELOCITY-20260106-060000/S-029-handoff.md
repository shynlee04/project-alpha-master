# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-029
**Title**: File Comparison and Diff Viewer
**Date**: 2026-01-06T09:45:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add file comparison and diff viewer with side-by-side view, line-by-line highlighting, and merge conflict resolution.

## Context
Users need to compare two versions of files (before/after edits, local/remote). No diff viewer exists currently.

## Root Cause
```typescript
// No diff viewer component exists
// No file comparison functionality
// No merge conflict resolution UI
// Missing version comparison features
```

## Files to Create/Modify
- **Create**: `src/lib/diff/diff-generator.ts` - Generate diff from two strings
- **Create**: `src/presentation/components/diff/DiffViewer.tsx` - Side-by-side diff display
- **Create**: `src/presentation/components/diff/LineDiff.tsx` - Single line diff component
- **Create**: `src/presentation/components/diff/MergeConflictResolver.tsx` - Merge conflict UI
- **Create**: `src/hooks/useFileDiff.ts` - Hook for diff state
- **Modify**: `src/presentation/components/editor/MonacoEditor.tsx` - Add diff mode

## Diff Features

### View Modes
1. **Side-by-Side**:
   - Original file on left, modified on right
   - Line numbers for both files
   - Connected changes with highlight lines
   - Synced scrolling

2. **Unified**:
   - Single view with inline changes
   - Added lines highlighted green
   - Removed lines highlighted red
   - Modified lines highlighted yellow

3. **Line-by-Line**:
   - Toggle between original and modified
   - Shows only changed lines
   - Context lines before/after changes

### Diff Highlighting
- **Added Lines**: Green background (+)
- **Removed Lines**: Red background (-)
- **Modified Lines**: Yellow background (~)
- **No Changes**: Transparent background
- **Whitespace Changes**: Optional toggle to show

### Merge Conflict Resolution
- **Conflict Markers**: <<<<<<<, =======, >>>>>>> detection
- **Three-Way Merge**: Show base, incoming, current
- **Resolution Actions**:
  - Accept Current
  - Accept Incoming
  - Accept Both
  - Edit Manually
- **Conflict Navigation**: Jump to next/previous conflict

## Constraints
- Keyboard shortcuts: Cmd+D to open diff viewer
- Performance: Handle large files (10,000+ lines)
- Memory: Efficient diff algorithm (Myers diff)
- Mobile: Unified view only (side-by-side too wide)
- i18n strings via t() function
- 8-bit gaming style (no blur effects)
- Syntax highlighting for code blocks

## Acceptance Criteria
- [ ] DiffViewer component with side-by-side and unified views
- [ ] Diff generation from two file strings
- [ ] Line-by-line diff highlighting (add/remove/modify)
- [ ] Synced scrolling in side-by-side mode
- [ ] Merge conflict detection and resolution UI
- [ ] Three-way merge view (base, incoming, current)
- [ ] Conflict navigation (next/previous)
- [ ] Keyboard shortcut: Cmd+D to open diff
- [ ] Performance: Handles 10,000+ line files
- [ ] Mobile: Unified view only, side-by-side hidden
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained
- [ ] Syntax highlighting for code

## Skills to Invoke
- `frontend-components` - Build diff viewer UI
- `brainstorming` - Design diff algorithm
- `global-coding-style` - Efficient diff implementation
- `frontend-accessibility` - Keyboard navigation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify diff components
ls -la src/presentation/components/diff/

# Verify diff generator
ls -la src/lib/diff/diff-generator.ts
```

## Related Issues
- Code review features
- Merge conflict resolution
- Ralph Loop Cycle 5B: Git integration

## Next Action
Create diff viewer with side-by-side/unified modes, line highlighting, merge conflict resolution, and keyboard navigation.

---
**Handoff ID**: S-029-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

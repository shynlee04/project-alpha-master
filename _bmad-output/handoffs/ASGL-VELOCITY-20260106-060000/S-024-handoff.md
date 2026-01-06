# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-024
**Title**: File Operations Context Menu
**Date**: 2026-01-06T09:15:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add right-click context menu to file tree with file operations (rename, delete, duplicate, download).

## Context
File tree shows files but no way to perform file operations. Users need context menu for common file actions.

## Root Cause
```typescript
// File tree component has no context menu
// No file operations UI exposed
// Users must use keyboard shortcuts or terminal
// Missing file management features
```

## Files to Create/Modify
- **Create**: `src/presentation/components/file-tree/FileContextMenu.tsx` - Context menu component
- **Create**: `src/presentation/components/file-tree/FileOperationDialog.tsx` - Rename/duplicate dialogs
- **Modify**: `src/presentation/components/file-tree/FileTree.tsx` - Add context menu trigger
- **Modify**: `src/lib/filesystem/file-operations.ts` - Add context menu handlers
- **Create**: `src/hooks/useFileContextMenu.ts` - Hook for context menu state

## Context Menu Items

### File Operations
- **Open** - Open file in editor
- **Rename** (F2) - Rename file with validation
- **Duplicate** - Create copy with " (copy)" suffix
- **Delete** (Cmd+Backspace) - Move to trash (confirm dialog)
- **Download** - Download file to local machine
- **Copy Path** - Copy file path to clipboard
- **Reveal in Finder** - Open file in OS file manager

### Folder Operations
- **New File** - Create new file in folder
- **New Folder** - Create subfolder
- **Rename Folder** - Rename folder (F2)
- **Delete Folder** - Delete folder and contents (confirm)

### Additional Items (with modifier key)
- **Hold Option**: Show additional operations
  - **Copy Absolute Path** - Copy full path
  - **Duplicate with References** - Copy with imports updated
  - **Run Script** - Execute file if executable

## Constraints
- Right-click (Windows/Linux) or Ctrl+click (Mac) to open
- Keyboard shortcut: F2 for rename, Cmd+Backspace for delete
- Close on click outside or Escape key
- Position to avoid viewport edges
- Mobile: Long-press (500ms) to open context menu
- i18n strings via t() function
- 8-bit gaming style (no blur effects)
- Validation before destructive operations (delete)
- File name validation (no invalid chars, no duplicates)

## Acceptance Criteria
- [ ] Right-click context menu on files and folders
- [ ] Mobile: Long-press (500ms) triggers context menu
- [ ] File operations: Open, Rename, Duplicate, Delete, Download, Copy Path
- [ ] Folder operations: New File, New Folder, Rename, Delete
- [ ] Keyboard shortcuts: F2 (rename), Cmd+Backspace (delete), Escape (close)
- [ ] Validation dialogs for rename/delete
- [ ] Positioning avoids viewport edges
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained
- [ ] Copy path feedback (toast notification)
- [ ] Error handling for failed operations

## Skills to Invoke
- `frontend-components` - Build context menu UI
- `global-validation` - File name validation
- `frontend-accessibility` - Keyboard navigation
- `global-coding-style` - Consistent patterns

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify context menu component
ls -la src/presentation/components/file-tree/FileContextMenu.tsx

# Verify hook created
ls -la src/hooks/useFileContextMenu.ts
```

## Related Issues
- File management UX
- Ralph Loop Cycle 5A: File operations improvements

## Next Action
Create FileContextMenu component with file/folder operations, keyboard shortcuts, mobile long-press, and validation dialogs.

---
**Handoff ID**: S-024-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

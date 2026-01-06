# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-030
**Title**: Multi-Tab File Editor
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
Add multi-tab file editor with tab management, drag-and-drop reordering, and tab persistence.

## Context
Users can only edit one file at a time. Need tabbed interface to work with multiple files simultaneously.

## Root Cause
```typescript
// Single file editor only
// No tab management system
// No tab persistence across sessions
// Missing drag-and-drop reordering
```

## Files to Create/Modify
- **Create**: `src/presentation/components/editor/EditorTabBar.tsx` - Tab bar with drag-drop
- **Create**: `src/presentation/components/editor/EditorTab.tsx` - Individual tab component
- **Create**: `src/lib/editor/tab-manager.ts` - Tab state management
- **Create**: `src/hooks/useEditorTabs.ts` - Hook for tab operations
- **Create**: `src/lib/editor/tab-persistence.ts` - Save/restore tabs
- **Modify**: `src/presentation/components/ide/MonacoEditor.tsx` - Support multiple files
- **Modify**: `src/infrastructure/persistence/stores/editor-tabs-store.ts` - Tab state

## Tab Features

### Tab Display
- **File Icon**: File type icon (TS, TSX, MD, etc.)
- **File Name**: Truncated with ellipsis if too long
- **Close Button**: X icon on hover
- **Modified Indicator**: Dot or asterisk for unsaved changes
- **Active Tab**: Highlighted border, different background
- **Hover State**: Show close button, file path tooltip

### Tab Management
- **Add Tab**: Double-click file in tree, Cmd+click to open in new tab
- **Close Tab**: Click X, middle-click, Cmd+W
- **Close All**: Right-click > Close All Tabs
- **Close Others**: Right-click > Close Other Tabs
- **Close Saved**: Right-click > Close Saved Tabs (keep only modified)
- **Reorder Tabs**: Drag and drop to new position
- **Switch Tabs**: Click tab, Cmd+number (1-9), Cmd+Tab/Shift+Cmd+Tab

### Tab Persistence
- **Save to localStorage**: Tab order, active tab, scroll position
- **Restore on Load**: Reopen tabs from last session
- **Per-Project**: Different tabs for different projects
- **Unsaved Changes**: Warn before closing tabs with unsaved edits

### Tab Context Menu
Right-click on tab shows:
- Close
- Close Others
- Close Saved
- Close All
- Copy Path
- Reveal in Finder
- Pin Tab (keep tab, prevent closing)

## Constraints
- Max tabs: Show scrolling if more than 10 tabs
- Min tab width: 120px, max: 200px
- Keyboard shortcuts: Cmd+W (close), Cmd+T (new), Cmd+1-9 (switch)
- Drag-and-drop: Reorder tabs within tab bar
- Performance: Lazy load tab content (only active tab renders)
- Memory: Close inactive tabs after 20 minutes (configurable)
- Mobile: Bottom tab bar (iOS style), swipe to close
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Tab bar with file icons, names, close buttons
- [ ] Modified indicator (dot/asterisk) for unsaved changes
- [ ] Active tab highlighting
- [ ] Add tab: Double-click file, Cmd+click
- [ ] Close tab: Click X, middle-click, Cmd+W
- [ ] Close all/others/saved via context menu
- [ ] Drag-and-drop tab reordering
- [ ] Switch tabs: Click, Cmd+number, Cmd+Tab
- [ ] Tab persistence: Save/restore from localStorage
- [ ] Per-project tab state
- [ ] Unsaved changes warning before closing
- [ ] Lazy loading: Only active tab renders
- [ ] Max tabs: Scrollable after 10 tabs
- [ ] Mobile: Bottom tab bar, swipe to close
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build tab bar UI
- `brainstorming` - Design tab state management
- `global-coding-style` - Drag-drop patterns
- `frontend-accessibility` - Keyboard navigation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify tab components
ls -la src/presentation/components/editor/EditorTab*

# Verify tab manager
ls -la src/lib/editor/tab-manager.ts
```

## Related Issues
- Multi-file editing
- Tab management UX
- Ralph Loop Cycle 5A: Editor enhancements

## Next Action
Create tab bar component with drag-drop reordering, tab persistence, keyboard shortcuts, and mobile swipe gestures.

---
**Handoff ID**: S-030-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

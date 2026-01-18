# Cycle 4: Refactor Surgeon - God Component Splitting Plan

## Overview

This document outlines the refactoring plan for oversized components identified in Cycle 1. The goal is to break down god components into focused, maintainable modules while maintaining zero breaking changes.

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Target Components | 6 |
| Current Total Lines | 5,912 |
| Target Total Lines | 1,800 |
| Reduction | 69.6% |
| Files to Create | 42 |
| Files to Modify | 6 |
| Files to Delete | 6 |
| Estimated Effort | 16 hours |

## Target Components

### 1. AISlashCommand.tsx (1,674 → 300 lines)

**Current Responsibilities:**
- AI slash command rendering
- Command filtering and execution
- Block insertion
- AI popup management
- Context extraction (above_cursor, below_cursor, all, none, selection)

**Proposed Splits:**
1. `ai-context-utils.ts` - Context extraction utilities
2. `ai-command-executors.ts` - AI command execution
3. `useAISlashCommands.ts` - Hook interface
4. `ai-slash-commands.ts` - Command definitions
5. `block-commands.ts` - Block manipulation
6. `custom-commands.ts` - Custom command creation
7. `saved-blocks-menu.ts` - Saved blocks functionality

**Risk Level:** HIGH - Many AI command dependencies

---

### 2. NoteEditor.tsx (1,088 → 250 lines)

**Current Responsibilities:**
- Note editing
- Block management
- Editor state
- Keyboard shortcuts
- Auto-save with debounce

**Proposed Splits:**
1. `block-sanitizer.ts` - Block sanitization utilities
2. `useDebouncedCallback.ts` - Debounce hook
3. `SelectionInfo.tsx` - Selection display
4. `NoteEditorHooks.ts` - Editor-related hooks
5. `NoteEditorHeader.tsx` - Header with toolbar
6. `NoteEditorContent.tsx` - BlockNoteView wrapper

**Risk Level:** HIGH - Core editor functionality

---

### 3. NotesPage.tsx (876 → 200 lines)

**Current Responsibilities:**
- Notes page layout
- Note tree
- Editor integration
- Mobile/desktop layout
- Import/export dialogs

**Proposed Splits:**
1. `useNotesPage.ts` - Main page state
2. `NotesPageDesktop.tsx` - Desktop layout
3. `NotesPageMobile.tsx` - Mobile layout
4. `NotesPageDialogs.tsx` - Dialog components
5. `NotesPageEventHandlers.tsx` - Event listeners

**Risk Level:** MEDIUM - Layout and state management

---

### 4. MonacoEditor.tsx (772 → 200 lines)

**Current Responsibilities:**
- Monaco editor integration
- Editor events
- File content handling
- Tab management
- Auto-save
- Code formatting
- Code navigation

**Proposed Splits:**
1. `useMonacoEditor.ts` - Editor initialization
2. `EditorTabBar.tsx` - Tab bar (already exists)
3. `useAutoSave.ts` - Auto-save logic
4. `useCodeFormatting.ts` - Code formatting
5. `useCodeNavigation.ts` - Code navigation
6. `EditorToolbar.tsx` - Toolbar component

**Risk Level:** HIGH - Complex editor integration

---

### 5. resizable.tsx (763 → 200 lines)

**Current Responsibilities:**
- Resizable panel
- Drag handling
- Size constraints
- Collapse/expand
- Touch support

**Proposed Splits:**
1. `ResizableContext.tsx` - Context and config
2. `ResizablePanelGroup.tsx` - Panel group
3. `ResizablePanel.tsx` - Individual panel
4. `ResizableHandle.tsx` - Drag handle
5. `resizable-utils.ts` - Helper functions

**Risk Level:** MEDIUM - Foundation UI component

---

### 6. KnowledgePage.tsx (749 → 200 lines)

**Current Responsibilities:**
- Knowledge page layout
- Source management
- Collection handling
- RAG service integration
- Synthesis workflow
- Cross-workspace events

**Proposed Splits:**
1. `useKnowledgePage.ts` - Main page state
2. `useRAGServices.ts` - RAG initialization
3. `KnowledgePageDesktop.tsx` - Desktop layout
4. `KnowledgePageMobile.tsx` - Mobile layout
5. `KnowledgePageEventListeners.tsx` - Event listeners
6. `KnowledgePageHeader.tsx` - Header component

**Risk Level:** MEDIUM - Multiple service integrations

---

## Recommended Execution Order

| Priority | Component | Reason |
|----------|-----------|--------|
| 1 | resizable | Foundation UI component used by NotesPage and KnowledgePage |
| 2 | AISlashCommand | P0 priority, many AI dependencies to extract first |
| 3 | NoteEditor | P0 priority, core editor functionality |
| 4 | MonacoEditor | Complex editor integration |
| 5 | NotesPage | Uses resizable and NoteEditor |
| 6 | KnowledgePage | Uses resizable, can be done last |

## Common Patterns Extracted

| Pattern | Occurrences | Suggested Location |
|---------|-------------|-------------------|
| useDebouncedCallback | 3 | `src/presentation/hooks/useDebouncedCallback.ts` |
| useScrollPosition | 2 | `src/presentation/hooks/useScrollPosition.ts` |
| useProjectSync | 3 | `src/presentation/hooks/useProjectSync.ts` |
| useMobileLayout | 2 | `src/presentation/hooks/useMobileLayout.ts` |

## Validation Commands

After each refactoring step, run:

```bash
pnpm tsc --noEmit
pnpm vitest run --coverage
```

## Backward Compatibility Strategy

1. **Facade Pattern**: Create barrel exports at original paths that re-export from new locations
2. **Deprecation Warnings**: Add console warnings for deprecated imports
3. **Gradual Migration**: Update imports one component at a time
4. **Characterization Tests**: Write tests before refactoring to capture current behavior

## Files Created Structure

```
src/
├── presentation/
│   ├── components/
│   │   ├── notes/
│   │   │   ├── ai/
│   │   │   │   ├── index.ts (barrel)
│   │   │   │   ├── ai-context-utils.ts
│   │   │   │   ├── ai-command-executors.ts
│   │   │   │   └── slash-commands/
│   │   │   │       ├── ai-slash-commands.ts
│   │   │   │       ├── block-commands.ts
│   │   │   │       └── custom-commands.ts
│   │   │   ├── editor/
│   │   │   │   ├── index.ts (barrel)
│   │   │   │   ├── NoteEditorHooks.ts
│   │   │   │   ├── NoteEditorHeader.tsx
│   │   │   │   └── NoteEditorContent.tsx
│   │   │   └── SelectionInfo.tsx
│   │   ├── ide/
│   │   │   └── MonacoEditor/
│   │   │       ├── EditorToolbar.tsx
│   │   │       └── EditorTabBar.tsx
│   │   ├── ui/
│   │   │   └── resizable/
│   │   │       ├── index.ts (barrel)
│   │   │       ├── ResizableContext.tsx
│   │   │       ├── ResizablePanelGroup.tsx
│   │   │       ├── ResizablePanel.tsx
│   │   │       └── ResizableHandle.tsx
│   │   └── knowledge/
│   │       ├── KnowledgePageDesktop.tsx
│   │       ├── KnowledgePageMobile.tsx
│   │       ├── KnowledgePageEventListeners.tsx
│   │       └── KnowledgePageHeader.tsx
│   ├── hooks/
│   │   ├── notes/
│   │   │   ├── useAISlashCommands.ts
│   │   │   ├── useDebouncedCallback.ts
│   │   │   └── useNotesPage.ts
│   │   ├── ide/
│   │   │   ├── useMonacoEditor.ts
│   │   │   ├── useAutoSave.ts
│   │   │   ├── useCodeFormatting.ts
│   │   │   └── useCodeNavigation.ts
│   │   └── knowledge/
│   │       ├── useKnowledgePage.ts
│   │       └── useRAGServices.ts
│   └── utils/
│       ├── notes/
│       │   └── block-sanitizer.ts
│       └── resizable-utils.ts
```

## Next Steps

1. Review and approve this refactoring plan
2. Start with `resizable.tsx` (lowest risk, foundation component)
3. Create characterization tests for each component before refactoring
4. Execute refactoring in recommended order
5. Validate with TypeScript and tests after each step
6. Update documentation and barrel exports

---

**Plan Created:** 2026-01-18
**Based On:** Cycle 1 architecture violations analysis
**Status:** Ready for execution
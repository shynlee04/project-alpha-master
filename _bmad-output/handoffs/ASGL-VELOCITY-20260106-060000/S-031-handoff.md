# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-031
**Title**: Code Snippets Manager
**Date**: 2026-01-06T09:45:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add code snippets manager for saving, organizing, and inserting reusable code fragments.

## Context
Users frequently reuse code patterns (components, hooks, utilities). No snippet management system exists.

## Root Cause
```typescript
// No snippet storage system
// No snippet organization (folders, tags)
// No snippet insertion UI
// Missing snippet sharing features
```

## Files to Create/Modify
- **Create**: `src/lib/snippets/snippet-store.ts` - Snippet CRUD operations
- **Create**: `src/presentation/components/snippets/SnippetManager.tsx` - Snippet browser
- **Create**: `src/presentation/components/snippets/SnippetEditor.tsx` - Create/edit snippets
- **Create**: `src/presentation/components/snippets/SnippetInsertDialog.tsx` - Insert snippet
- **Create**: `src/hooks/useCodeSnippets.ts` - Hook for snippets
- **Create**: `src/lib/snippets/snippet-templates.ts` - Built-in snippet templates
- **Modify**: `src/presentation/components/editor/MonacoEditor.tsx` - Add snippet insertion
- **Modify**: `src/routes/settings.tsx` - Add snippets management section

## Snippet Features

### Snippet Structure
- **Name**: Short descriptive name
- **Description**: What the snippet does
- **Language**: JavaScript, TypeScript, Python, etc.
- **Code**: The actual code content
- **Variables**: Placeholders like `${1:name}`, `${2:value}`
- **Tags**: Organize with tags (react, hooks, utils, etc.)
- **Folder**: Group into folders (Components, Hooks, Utils)
- **Shortcut**: Trigger text (e.g., "rfc" → React Component)

### Snippet Manager UI
1. **Snippet Browser**:
   - Tree view: Folders → Snippets
   - Search: Filter by name, tag, language
   - Preview: Show code with syntax highlighting
   - Insert button: Insert into cursor position

2. **Snippet Editor**:
   - Name and description fields
   - Language dropdown
   - Code editor with syntax highlighting
   - Variable placeholders: ${1:variableName}
   - Tag input with autocomplete
   - Folder selector
   - Save/Delete buttons

3. **Snippet Insertion**:
   - Cmd+Shift+S: Open snippet browser
   - Type shortcut: Auto-expand snippet
   - Tab navigation: Jump between variables
   - Preview: Show rendered code before insert

### Built-in Templates
- **React Components**: functional component, class component
- **React Hooks**: useState, useEffect, useContext, custom hooks
- **TypeScript**: interface, type, enum, generic functions
- **Node.js**: Express route, middleware, error handler
- **Utilities**: debounce, throttle, formatDate, etc.

## Constraints
- Keyboard shortcut: Cmd+Shift+S to open snippet browser
- Auto-complete: Type shortcut to expand snippet
- Tab stops: Jump between variables with Tab key
- Sync: Cloud sync for snippets (optional, future feature)
- Export/import: Share snippets as JSON files
- Performance: Handle 1000+ snippets efficiently
- Mobile: Full-screen snippet browser
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Snippet browser with folder tree view
- [ ] Create/edit/delete snippets
- [ ] Snippet fields: name, description, language, code, tags, folder
- [ ] Variable placeholders: ${1:variableName} syntax
- [ ] Insert snippet at cursor position
- [ ] Tab stops: Jump between variables with Tab
- [ ] Keyboard shortcut: Cmd+Shift+S to open browser
- [ ] Auto-expand: Type shortcut to insert snippet
- [ ] Built-in snippet templates (React, TypeScript, utilities)
- [ ] Search snippets by name, tag, language
- [ ] Folder organization
- [ ] Tag system with autocomplete
- [ ] Export/import snippets as JSON
- [ ] Mobile: Full-screen snippet browser
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build snippet UI
- `brainstorming` - Design snippet system
- `global-coding-style` - Snippet storage patterns
- `frontend-accessibility` - Keyboard navigation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify snippet components
ls -la src/presentation/components/snippets/

# Verify snippet store
ls -la src/lib/snippets/snippet-store.ts
```

## Related Issues
- Developer productivity
- Code reusability
- Ralph Loop Cycle 5A: Editor features

## Next Action
Create snippet manager with browser, editor, insertion dialog, built-in templates, and variable placeholders.

---
**Handoff ID**: S-031-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-038
**Title: Command Palette - Quick Actions and Search**
**Date**: 2026-01-06T12:00:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add command palette for quick actions, file search, command execution, and keyboard-driven navigation.

## Context
No command palette exists. Users must navigate menus manually. Need quick access to all app features.

## Root Cause
```typescript
// No command palette component exists
// No fuzzy search for commands/files
// Missing keyboard-driven navigation
// No quick action system
```

## Files to Create/Modify
- **Create**: `src/lib/command-palette/command-registry.ts` - Command registration system
- **Create**: `src/lib/command-palette/fuzzy-search.ts` - Fuzzy matcher for commands/files
- **Create**: `src/presentation/components/command-palette/CommandPalette.tsx` - Palette UI
- **Create**: `src/hooks/useCommandPalette.ts` - Command palette hook
- **Modify**: `src/routes/__root.tsx` - Add global Cmd+K listener
- **Modify**: `src/i18n/en.json` - Add command palette strings

## Command Palette Features

### Palette UI
- **Keyboard Shortcut**: Cmd+K (or Ctrl+K) to open
- **Search Input**: Fuzzy search through commands and files
- **Results List**: Show matching commands/files as you type
- **Keyboard Navigation**: Arrow up/down, Enter to execute, Esc to close
- **Categories**: Group by type (Actions, Files, Settings, Plugins)
- **Icons**: Show icons for each command type
- **Key Shortcuts**: Display keyboard shortcut hints (e.g., "⌘K")

### Command Types
1. **Actions**: Quick actions (create project, open settings, export data)
2. **Files**: Search and open files in current workspace
3. **Navigation**: Jump to routes (IDE, Notes, Knowledge, Study, Agents)
4. **Settings**: Open specific setting sections
5. **Plugins**: Run plugin commands
6. **AI Agent**: Start agent chat, execute agent task

### Fuzzy Search
- **Algorithm**: Fast fuzzy matching (rank by relevance)
- **Highlights**: Highlight matching characters in results
- **Scoring**: Prioritize:
  - Exact matches
  - Prefix matches
  - Consecutive character matches
  - CamelCase/word boundary matches
- **Performance**: Handle 1000+ commands/files efficiently

### Context Awareness
- **Route-Specific**: Show commands relevant to current route
- **Recent Commands**: Prioritize recently used commands
- **Workspace**: Include workspace-specific commands
- **Permissions**: Hide commands user lacks permission for

## Built-in Commands

### Navigation
- "Go to IDE" → Navigate to /ide
- "Go to Notes" → Navigate to /notes
- "Go to Knowledge" → Navigate to /knowledge
- "Go to Study" → Navigate to /study
- "Go to Agents" → Navigate to /agents
- "Go to Settings" → Navigate to /settings

### Actions
- "Create New Project" → Open project creation wizard
- "Import Project" → Import from git/local
- "Export Settings" → Export settings as JSON
- "Import Settings" → Import settings from JSON
- "Toggle Theme" → Switch light/dark mode
- "Clear Cache" → Clear app cache

### AI Agent
- "Start Chat" → Open AI agent chat
- "Search Code" → Search codebase with AI
- "Generate Code" → Generate code with AI
- "Explain Code" → Explain selected code

### Editor
- "Format Document" → Format current file
- "Find in File" → Search in current file
- "Replace in File" → Replace in current file
- "Toggle Sidebar" → Show/hide sidebar

## Constraints
- Keyboard shortcut: Cmd+K (or Ctrl+K)
- Fuzzy search with relevance ranking
- Context-aware (route, recent, workspace)
- Performance: Handle 1000+ commands
- Mobile: Full-screen command palette
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Command palette UI (Cmd+K to open)
- [ ] Fuzzy search for commands and files
- [ ] Keyboard navigation (arrows, Enter, Esc)
- [ ] Command categories (Actions, Files, Navigation, Settings)
- [ ] Built-in commands (navigation, actions, AI agent, editor)
- [ ] Context-aware (route-specific, recent, workspace)
- [ ] Keyboard shortcut hints
- [ ] Mobile: Full-screen palette
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained
- [ ] Performance: Handle 1000+ commands

## Skills to Invoke
- `frontend-components` - Build command palette UI
- `brainstorming` - Design command system
- `global-coding-style` - Command patterns
- `frontend-accessibility` - Keyboard navigation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify command palette components
ls -la src/presentation/components/command-palette/

# Verify command registry
ls -la src/lib/command-palette/command-registry.ts
```

## Related Issues
- Productivity
- Quick actions
- Ralph Loop Cycle 5D: Developer tools

## Next Action
Create command palette with fuzzy search, built-in commands, context awareness, and keyboard-driven navigation.

---
**Handoff ID**: S-038-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

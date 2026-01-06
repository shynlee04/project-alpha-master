# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-036
**Title: Terminal/Console Integration - Command Execution**
**Date**: 2026-01-06T11:00:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add integrated terminal with command execution, output capture, and shell integration.

## Context
No terminal exists. Users must leave app to run commands. Need integrated console.

## Root Cause
```typescript
// No terminal component exists
// No command execution engine
// Missing output capture
// No shell integration
```

## Files to Create/Modify
- **Create**: `src/lib/terminal/terminal-emulator.ts` - Terminal logic (xterm.js)
- **Create**: `src/presentation/components/terminal/TerminalPanel.tsx` - Terminal UI
- **Create**: `src/presentation/components/terminal/TerminalTabs.tsx` - Multiple terminals
- **Create**: `src/hooks/useTerminal.ts` - Terminal operations hook
- **Create**: `src/infrastructure/persistence/stores/terminal-store.ts` - Terminal state
- **Modify**: `src/presentation/components/ide/IDELayoutMain.tsx` - Add terminal panel

## Terminal Features

### Terminal Emulation
- **xterm.js Integration**: Full terminal emulation
- **Shell Detection**: Auto-detect shell (bash, zsh, fish, pwsh, cmd)
- **PTY Support**: Pseudo-terminal for full command interaction
- **Resizing**: Responsive terminal resize support
- **Scrollback**: Configurable scrollback buffer (default: 1000 lines)

### Command Execution
- **Run Command**: Execute any shell command
- **Command History**: Up/down arrow history (persistent)
- **Auto-complete**: Tab completion support
- **Environment Variables**: Set/modify env vars
- **Working Directory**: Per-terminal working directory
- **Background Tasks**: Run commands in background

### Output Capture
- **Stdout**: Standard output capture
- **Stderr**: Error output (red highlighting)
- **Exit Codes**: Display command exit status
- **ANSI Colors**: Full ANSI color support
- **Links**: Make URLs clickable
- **Search**: Search terminal output (Cmd+Shift+F)

### Multiple Terminals
- **Terminal Tabs**: Create multiple terminals
- **Split View**: Split terminal horizontally/vertically
- **Naming**: Name terminals (e.g., "server", "build", "tests")
- **Maximize**: Maximize terminal panel
- **Close**: Close terminal with confirmation if running

### Terminal Features
- **Copy/Paste**: Copy selection, paste from clipboard
- **Clear**: Clear terminal screen
- **Reset**: Reset terminal state
- **Font Size**: Adjust font size
- **Theme**: Terminal color themes (monokai, solarized, etc.)
- **Bell**: Visual bell on \a character

### Integration
- **Project Terminal**: Terminal opens at project root
- **Workspace Terminal**: Per-workspace terminals
- **File Context**: Right-click file → "Open in Terminal"
- **Task Runner**: Run npm scripts in terminal
- **Debug Console**: Integrated debugging console

## Constraints
- xterm.js for terminal emulation
- WebContainer API for isolated execution (future)
- Shell command sanitization
- Command timeout (configurable, default 5min)
- Mobile: Terminal-only mode (hides other panels)
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Terminal emulator (xterm.js integration)
- [ ] Shell detection (bash, zsh, fish, pwsh, cmd)
- [ ] Command execution with output capture
- [ ] Command history (up/down arrows)
- [ ] Tab completion
- [ ] ANSI color support
- [ ] Multiple terminals (tabs)
- [ ] Split view (horizontal/vertical)
- [ ] Copy/paste support
- [ ] Search terminal output
- [ ] Clear/reset terminal
- [ ] Font size adjustment
- [ ] Color themes
- [ ] Project root working directory
- [ ] Right-click file → "Open in Terminal"
- [ ] Mobile: Terminal-only mode
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build terminal UI
- `brainstorming` - Design terminal integration
- `global-coding-style` - Terminal patterns
- `global-validation` - Command sanitization

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify terminal components
ls -la src/presentation/components/terminal/

# Verify terminal emulator
ls -la src/lib/terminal/terminal-emulator.ts
```

## Related Issues
- Developer tools
- Command execution
- Ralph Loop Cycle 5D: Developer tools

## Next Action
Create terminal integration with xterm.js, command execution, multiple terminals, and output capture.

---
**Handoff ID**: S-036-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

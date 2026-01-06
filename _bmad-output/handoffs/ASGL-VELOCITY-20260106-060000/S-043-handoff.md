# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-043
**Title: Code Navigation - Go to Definition, References, and Symbols**
**Date**: 2026-01-06T14:00:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add code navigation with go to definition, find references, and symbol outline for code exploration.

## Context
No code navigation exists. Users must manually search for definitions and references. Need intelligent navigation.

## Root Cause
```typescript
// No code navigation system
// No language server integration
// Missing symbol parsing
// No definition/references lookup
```

## Files to Create/Modify
- **Create**: `src/lib/navigation/symbol-parser.ts` - Parse symbols from code
- **Create**: `src/lib/navigation/definition-provider.ts` - Go to definition provider
- **Create**: `src/lib/navigation/references-provider.ts` - Find references provider
- **Create**: `src/lib/navigation/symbol-outline.ts` - Symbol outline generator
- **Create**: `src/presentation/components/editor/DefinitionTooltip.tsx` - Definition preview tooltip
- **Create**: `src/presentation/components/editor/SymbolsPanel.tsx` - Symbol outline panel
- **Create**: `src/hooks/useCodeNavigation.ts` - Code navigation hook
- **Modify**: `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` - Add navigation features

## Code Navigation Features

### Symbol Parsing
- **Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, C#, PHP
- **Symbol Types**:
  - Functions/Methods: `function`, `method`, `async function`
  - Classes/Interfaces: `class`, `interface`, `type`
  - Variables: `const`, `let`, `var`
  - Imports/Exports: `import`, `export`
  - Enums: `enum`
  - Namespaces: `namespace`
- **Symbol Locations**: Line number, column number, file path
- **Scope Awareness**: Function scope, class scope, block scope

### Go to Definition
- **Keyboard Shortcut**: F12 or Cmd+Click
- **Definition Types**:
  - Local definition: Same file
  - Imported definition: Different file
  - Built-in definition: TypeScript/Node built-ins
  - Third-party: node_modules
- **Definition Preview**: Show definition in tooltip or side panel
- **Multiple Definitions**: Show all definitions (overloaded functions)
- **External Definitions**: Open in read-only editor

### Find References
- **Keyboard Shortcut**: Shift+F12
- **Reference Types**:
  - Read references: Variable read access
  - Write references: Variable write/assignment
  - Call references: Function/method calls
  - Import/Export references: Module imports/exports
- **Reference Locations**: List all files with references
- **Reference Count**: Show total number of references
- **Group by File**: Group references by file path

### Symbol Outline
- **Outline Panel**: Show file symbols in tree structure
- **Symbol Categories**:
  - Functions: Method icon
  - Classes: Class icon
  - Interfaces: Interface icon
  - Variables: Variable icon
  - Enums: Enum icon
- **Symbol Sorting**: By name, by type, by position
- **Filtering**: Filter symbols by name
- **Collapsible Sections**: Collapse/expand symbol categories

### Navigation History
- **Back**: Go back to previous location (Opt+Alt+Left)
- **Forward**: Go forward to next location (Opt+Alt+Right)
- **Location List**: Show all navigation locations
- **Persistent History**: Save navigation history across sessions

### UI Components

#### Definition Tooltip
- **Quick Preview**: Show definition without leaving current location
- **Syntax Highlighting**: Highlight definition syntax
- **Documentation**: Show JSDoc/comment documentation
- **Action Buttons**: "Go to Definition", "Find References"

#### Symbols Panel
- **File Symbols**: Show symbols for current file
- **Workspace Symbols**: Search symbols across all files
- **Symbol Icons**: Lucide icons for symbol types
- **Symbol Badges**: Show visibility (public, private, protected)
- **Click to Navigate**: Click symbol to jump to location

#### References Panel
- **Reference List**: Show all references
- **Reference Preview**: Show reference context
- **Group by File**: Group references by file path
- **Reference Actions**: "Go to Reference", "Rename Symbol"

## Constraints
- Language support: TypeScript, JavaScript, Python, Go, Rust
- Go to definition: F12 or Cmd+Click
- Find references: Shift+F12
- Symbol outline panel with filtering
- Navigation history (back/forward)
- Mobile: Read-only symbol outline
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Symbol parsing for 5+ languages (TS, JS, Python, Go, Rust)
- [ ] Go to definition (F12, Cmd+Click)
- [ ] Find references (Shift+F12)
- [ ] Symbol outline panel (tree structure, icons, filtering)
- [ ] Navigation history (back/forward)
- [ ] Definition tooltip with preview
- [ ] References panel with grouping
- [ ] Mobile: Read-only symbol outline
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build navigation UI
- `brainstorming` - Design navigation system
- `global-coding-style` - Navigation patterns
- `global-validation` - Symbol validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify navigation components
ls -la src/presentation/components/editor/DefinitionTooltip.tsx
ls -la src/presentation/components/editor/SymbolsPanel.tsx

# Verify navigation library
ls -la src/lib/navigation/symbol-parser.ts
```

## Related Issues
- Code understanding
- Developer productivity
- IDE feature parity

## Next Action
Create code navigation system with symbol parsing, go to definition, find references, and symbol outline.

---
**Handoff ID**: S-043-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

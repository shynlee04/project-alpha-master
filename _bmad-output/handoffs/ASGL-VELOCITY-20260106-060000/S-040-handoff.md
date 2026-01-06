# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-040
**Title: Code Formatting - Prettier, ESLint, Auto-format on Save**
**Date**: 2026-01-06T12:00:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add code formatting with Prettier integration, ESLint auto-fix, and format-on-save functionality.

## Context
No code formatting exists. Users must format manually. Need consistent code style and auto-formatting.

## Root Cause
```typescript
// No Prettier integration exists
// No ESLint auto-fix
// Missing format-on-save
// No code style enforcement
```

## Files to Create/Modify
- **Create**: `src/lib/formatter/code-formatter.ts` - Prettier/ESLint wrapper
- **Create**: `src/lib/formatter/config-prettier.ts` - Prettier configuration
- **Create**: `src/lib/formatter/config-eslint.ts` - ESLint configuration
- **Create**: `src/presentation/components/formatter/FormatDialog.tsx` - Format options UI
- **Create**: `src/hooks/useCodeFormatter.ts` - Formatter hook
- **Create**: `.prettierrc` - Prettier config
- **Create**: `.eslintrc.json` - ESLint config
- **Modify**: `src/presentation/components/editor/MonacoEditor.tsx` - Add format-on-save

## Formatter Features

### Prettier Integration
- **Format Document**: Format entire file with Prettier
- **Format Selection**: Format selected code only
- **Format on Save**: Auto-format when saving (optional)
- **Supported Languages**: TypeScript, JavaScript, JSON, CSS, HTML, Markdown

### ESLint Auto-Fix
- **Fix All**: Run ESLint --fix on entire file
- **Fix Quick Fix**: Apply ESLint suggestions
- **Lint on Save**: Run ESLint when saving (optional)
- **Error Display**: Show ESLint errors in editor

### Formatting Options
- **Tab Size**: 2 or 4 spaces (default: 2)
- **Semicolons**: Require or omit (default: require)
- **Quotes**: Single or double (default: double)
- **Trailing Commas**: ES5 or all (default: ES5)
- **Arrow Parens**: Always or as-needed (default: as-needed)
- **Print Width**: Max line width (default: 80)

### Language-Specific
- **TypeScript**: Format with type-aware rules
- **TSX**: Format JSX with proper indentation
- **JSON**: Sort keys, consistent quotes
- **CSS**: Indent selectors, properties
- **Markdown**: Format lists, code blocks

### Format Commands
- **Format Document** (Cmd+Shift+F): Format entire file
- **Fix ESLint** (Cmd+Shift+E): Fix all ESLint errors
- **Toggle Format on Save**: Enable/disable auto-format
- **Format Project**: Format all files in workspace

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
```

## Constraints
- Prettier 3.x integration
- ESLint 9.x with TypeScript support
- Format on save (optional, user setting)
- Language-specific formatters
- Project-wide format command
- Undo support (Ctrl+Z after format)
- Mobile: Format button in toolbar
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Code formatter wrapper (Prettier + ESLint)
- [ ] Format document command (Cmd+Shift+F)
- [ ] Format selection command
- [ ] ESLint auto-fix command (Cmd+Shift+E)
- [ ] Format on save (optional, user setting)
- [ ] Prettier config (.prettierrc)
- [ ] ESLint config (.eslintrc.json)
- [ ] Format options dialog (tab size, quotes, etc.)
- [ ] Supported languages (TS, JS, JSON, CSS, HTML, MD)
- [ ] Format project command
- [ ] Undo support after format
- [ ] Mobile: Format toolbar button
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build formatter UI
- `brainstorming` - Design formatter integration
- `global-coding-style` - Formatting patterns
- `global-validation` - Code validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify formatter components
ls -la src/presentation/components/formatter/

# Verify code formatter
ls -la src/lib/formatter/code-formatter.ts
```

## Related Issues
- Code quality
- Developer experience
- Ralph Loop Cycle 5D: Developer tools

## Next Action
Create code formatter with Prettier, ESLint auto-fix, format-on-save, and project-wide formatting.

---
**Handoff ID**: S-040-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

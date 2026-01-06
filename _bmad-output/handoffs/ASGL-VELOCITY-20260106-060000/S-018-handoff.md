# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-018
**Title**: Complete i18n Coverage to 100%
**Date**: 2026-01-06T09:00:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Achieve 100% i18n coverage across all user-facing strings.

## Context
Many UI strings are hardcoded instead of using the `t()` function. This prevents internationalization and violates project standards.

## Root Cause
```typescript
// Hardcoded strings in JSX
<span>Save</span>  // Should be <span>{t('actions.save')}</span>

// Missing translation keys
// Incomplete locale files
```

## Files to Modify
- `src/presentation/components/` - All components with hardcoded strings
- `src/lib/i18n/locales/en.json` - Add missing keys
- `src/lib/i18n/locales/` - Other locale files if needed

## Constraints
- 100% of user-facing strings via `t()` function
- No hardcoded English in JSX (except technical terms)
- All translation keys added to en.json
- Maintain consistent key naming (component.action.label)
- Test with locale switching

## Acceptance Criteria
- [ ] Zero hardcoded UI strings (grep verification)
- [ ] All components use `t()` function
- [ ] Translation keys added to en.json
- [ ] Locale switching works
- [ ] No missing key errors in console
- [ ] Technical terms (API, URL, CLI) can remain English

## Skills to Invoke
- `global-validation` - Find hardcoded strings
- `systematic-debugging` - Identify i18n gaps
- `frontend-components` - Update components
- `brainstorming` - Design key structure
- `test-driven-development` - Test locale switching

## Validation Commands
```bash
# Find hardcoded strings (A-Z sequences in JSX)
grep -r ">[A-Z][a-z]" src/presentation --include='*.tsx' | grep -v "t(" | head -30

# Count t() usage
grep -r "t(" src/presentation --include='*.tsx' | wc -l

# TypeScript check
pnpm typecheck

# Manual test: Switch locale in settings, verify all text updates
```

## Related Issues
- Ralph Cycle 5A: i18n completion (100% coverage)
- i18next library integration

## Next Action
Grep search for hardcoded strings, systematically replace with t(), add missing translation keys, verify locale switching.

---
**Handoff ID**: S-018-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

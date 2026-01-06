# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-003
**Title**: Add API Key Status Visual Indicators
**Date**: 2026-01-06T06:00:00+07:00
**Priority**: P0 - CRITICAL

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add visual indicators for API key status.

## Context
ProviderConfigDialog has no status feedback. Toast is coupled to model fetch. Users don't know if key is valid/invalid/configured.

## Root Cause
```typescript
// No ProviderStatusBadge component
// Toast directly tied to model fetch side effect
// No decoupling of key validation from model loading
```

## Files to Modify
- `src/presentation/components/agent/ProviderConfigDialog.tsx`
- Create: `src/presentation/components/agent/ProviderStatusBadge.tsx`

## Constraints
- Decoupled: Toast separate from model fetch
- Visual: Clear status indicators (valid/invalid/configured)
- 8-bit design: No glassmorphism
- i18n: All strings via t()

## Acceptance Criteria
- [ ] ProviderStatusBadge shows key status
- [ ] Toast decoupled from model fetch
- [ ] Status colors: green (valid), red (invalid), gray (not configured)
- [ ] Loading state during validation
- [ ] Works for all providers (OpenAI, Anthropic, etc.)

## Skills to Invoke
- `brainstorming` - Design status badge UX
- `frontend-components` - Create ProviderStatusBadge
- `frontend-css` - 8-bit styling with Tailwind
- `global-validation` - Key validation logic
- `test-driven-development` - Write status tests

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Design system check
grep -r 'backdrop-blur' src/presentation/components/agent/ProviderStatusBadge.tsx

# i18n check
grep -r '>[A-Z][a-z]' src/presentation/components/agent/ProviderStatusBadge.tsx | grep -v 't('
```

## Related Issues
- CRIT-001: LLM Models Not Loading After API Key Save
- S-001, S-002: Prerequisite fixes

## Next Action
Create ProviderStatusBadge component, wire to vault state, add to ProviderConfigDialog, decouple toast.

---
**Handoff ID**: S-003-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 4 parallel agents

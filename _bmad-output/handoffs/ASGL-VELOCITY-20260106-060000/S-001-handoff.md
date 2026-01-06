# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-001
**Title**: Debug and Fix Model Loading Flow
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
Fix LLM model loading flow after API key save.

## Context
Model fetch flow fails silently in production. Users configure API key but models don't populate. Credential vault has SSR/hydration issues. localStorage access during SSR breaks flow.

## Root Cause Analysis
```typescript
// model-registry.ts: fetch fails silently
// credential-vault.ts: localStorage accessed during SSR
// ProviderConfigDialog.tsx: No error feedback to user
```

## Files to Modify
- `src/lib/agent/providers/model-registry.ts`
- `src/lib/agent/providers/credential-vault.ts`
- `src/presentation/components/agent/ProviderConfigDialog.tsx`

## Constraints
- SSR compatibility: typeof window checks
- User feedback: Clear error messages
- Vercel deployment: Must work in production
- Performance: Models load in <3s

## Acceptance Criteria
- [ ] Diagnostic logging added to model fetch
- [ ] Root cause identified and documented
- [ ] Fix deployed to Vercel
- [ ] Models populate after key save
- [ ] User sees loading state and errors

## Skills to Invoke
- `systematic-debugging` - Trace model fetch failure
- `global-error-handling` - Proper error boundaries
- `brainstorming` - Design fix strategy
- `test-driven-development` - Write reproduction test
- `requesting-code-review` - Validate SSR fix

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# SSR compatibility check
grep -r 'localStorage' src/lib/agent/providers/ | grep -v 'typeof window'

# Test model loading
npm test -- model-registry
```

## Related Issues
- CRIT-001: LLM Models Not Loading After API Key Save

## Next Action
Add diagnostic logging to model fetch, trace SSR failure path, implement typeof window guard.

---
**Handoff ID**: S-001-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 4 parallel agents

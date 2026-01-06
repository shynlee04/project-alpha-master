# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-002
**Title**: Fix Credential Vault SSR Compatibility
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
Fix credential vault SSR/hydration issues.

## Context
localStorage access during SSR breaks hydration. Credential vault operations fail on server. No isReady() gating for operations.

## Root Cause
```typescript
// credential-vault.ts accesses localStorage without typeof window check
// No isReady() method to gate operations
// Hydration errors in console
```

## Files to Modify
- `src/lib/agent/providers/credential-vault.ts`
- All vault consumers (add isReady() checks)

## Constraints
- SSR-safe: typeof window checks
- Hydration-safe: isReady() gates all operations
- No hydration errors in console
- Backwards compatible with existing callers

## Acceptance Criteria
- [ ] typeof window check before localStorage
- [ ] isReady() gates all operations
- [ ] No hydration errors
- [ ] Vault works on Vercel
- [ ] Graceful fallback on server

## Skills to Invoke
- `systematic-debugging` - Understand hydration flow
- `global-error-handling` - SSR-safe error handling
- `brainstorming` - Design isReady() pattern
- `test-driven-development` - Write SSR test
- `requesting-code-review` - Validate SSR compatibility

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# SSR safety check
grep -r 'localStorage' src/lib/agent/providers/credential-vault.ts | grep -v 'typeof window'

# Hydration check
pnpm build  # Should have no hydration warnings
```

## Related Issues
- CRIT-001: LLM Models Not Loading After API Key Save
- S-001: Debug and Fix Model Loading Flow (prerequisite)

## Next Action
Add typeof window check to all localStorage access, implement isReady() gating, test on Vercel.

---
**Handoff ID**: S-002-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 4 parallel agents

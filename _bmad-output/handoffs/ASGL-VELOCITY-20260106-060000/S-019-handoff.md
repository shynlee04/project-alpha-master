# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-019
**Title**: Implement Error Boundaries and Recovery
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
Implement React error boundaries for graceful error handling and user recovery.

## Context
Application crashes show white screens with no recovery options. Users lose work and have no way to continue after errors.

## Root Cause
```typescript
// No error boundaries
// Unhandled promise rejections
// No fallback UI
// No error reporting to user
```

## Files to Create/Modify
- **Create**: `src/presentation/components/error/ErrorBoundary.tsx`
- **Create**: `src/presentation/components/error/ErrorFallback.tsx`
- **Create**: `src/presentation/components/error/ErrorMessage.tsx`
- **Modify**: `src/presentation/routes/__root.tsx` - Add root error boundary
- **Modify**: Route components - Add page-specific error boundaries

## Constraints
- User-friendly error messages (no stack traces to users)
- Recovery actions (retry, go home, reload)
- Error logging to console/Sentry
- Preserve user data when possible
- Mobile-friendly error UI

## Acceptance Criteria
- [ ] Root error boundary catches all React errors
- [ ] User-friendly error fallback UI
- [ ] Retry button for recoverable errors
- [ ] "Go Home" button for unrecoverable errors
- [ ] Errors logged to console/Sentry
- [ ] Unhandled promise rejection handler
- [ ] Error state clears on retry
- [ ] Mobile-optimized error UI

## Skills to Invoke
- `global-error-handling` - Error boundary patterns
- `frontend-components` - Build error UI components
- `systematic-debugging` - Test error scenarios
- `brainstorming` - Design recovery flows
- `test-driven-development` - Test error handling

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Test error boundary:
# 1. Create test component that throws error
# 2. Verify error boundary catches it
# 3. Verify fallback UI renders
# 4. Verify retry button works

# Manual test: Throw error in DevTools console, verify graceful handling
```

## Related Issues
- Ralph Cycle 3C: Mobile-aware error handling
- Sentry integration for error tracking

## Next Action
Create ErrorBoundary component with fallback UI, add to root and route components, implement recovery actions.

---
**Handoff ID**: S-019-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code

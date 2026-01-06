# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: UJ-001
**Title**: Wire SyncStatusPanel to Real Events
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
Wire SyncStatusPanel to real sync events from crossWorkspaceEventBus.

## Context
SyncStatusPanel currently displays mock data from a TODO placeholder. Users cannot see real sync status or get feedback during file operations.

## Root Cause
```typescript
// TODO placeholder in useEffect (lines 94-125)
// No subscription to crossWorkspaceEventBus
```

## Files to Modify
- `src/presentation/components/ide/SyncStatusPanel.tsx`

## Constraints
- Design: 8-bit only, no glassmorphism
- Mobile: Touch targets ≥44px
- i18n: All strings via t()
- Real-time: Progress updates must be <100ms

## Acceptance Criteria
- [ ] SyncStatusPanel subscribes to crossWorkspaceEventBus
- [ ] Real sync operations displayed (not mock data)
- [ ] Progress bar updates during sync
- [ ] Retry button triggers real retry action
- [ ] Error messages are actionable

## Skills to Invoke
- `systematic-debugging` - Understand current event flow
- `brainstorming` - Design event subscription pattern
- `frontend-components` - React component updates
- `global-error-handling` - Proper error boundaries
- `test-driven-development` - Write tests before implementation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Design system check
grep -r 'backdrop-blur' src/presentation/components/ide/SyncStatusPanel.tsx

# i18n check
grep -r '>[A-Z][a-z]' src/presentation/components/ide/SyncStatusPanel.tsx | grep -v 't('
```

## Related Issues
- UJ-001: SyncStatusPanel Uses Mock Data

## Next Action
Load SyncStatusPanel.tsx, subscribe to crossWorkspaceEventBus, replace mock data with real sync state.

---
**Handoff ID**: UJ-001-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 3 parallel agents

# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: UJ-004
**Title**: Cross-Workspace Reactivity
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
Implement cross-workspace reactivity: IDE file saves reflect in Notes, note saves reflect in IDE.

## Context
No event subscription for FILE_SAVED in NotesPage. No event emission from note save. Changes don't sync across workspaces.

## Root Cause
```typescript
// No FILE_SAVED event listener in NotesPage
// No event emission when note saves
// Missing useStoreEvent hook usage
```

## Files to Modify
- `src/presentation/components/notes/NotesPage.tsx`
- `src/lib/events/store-events.ts` (add FILE_SAVED event)
- `src/lib/notes/note-store.ts` (emit events on save)

## Constraints
- Performance: Changes reflect within 1s
- No duplicate event loops
- No memory leaks from listeners
- Mobile: Reactions work on touch devices

## Acceptance Criteria
- [ ] IDE file save reflects in Notes within 1s
- [ ] Note save reflects in IDE file tree within 1s
- [ ] useStoreEvent hook used for subscriptions
- [ ] No duplicate event loops
- [ ] Proper cleanup on unmount
- [ ] Works across workspace switches

## Skills to Invoke
- `systematic-debugging` - Understand event flow
- `brainstorming` - Design event-driven architecture
- `frontend-components` - React useEffect patterns
- `global-error-handling` - Handle event failures
- `test-driven-development` - Write event propagation tests

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Check for event listeners
grep -r 'useStoreEvent\|FILE_SAVED' src/presentation/components/notes/

# Memory leak check
grep -r 'useEffect.*return.*cleanup' src/presentation/components/notes/NotesPage.tsx
```

## Related Issues
- UJ-004: Cross-Workspace Reactivity Missing
- UJ-003: Notes Save to Filesystem (prerequisite)

## Next Action
Add FILE_SAVED event to store-events.ts, emit on note save, subscribe in NotesPage, test cross-workspace reactivity.

---
**Handoff ID**: UJ-004-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 3 parallel agents

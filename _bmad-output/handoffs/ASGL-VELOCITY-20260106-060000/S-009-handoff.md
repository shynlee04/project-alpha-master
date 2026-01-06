# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-009
**Title**: Fix Agent Selection Persistence
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
Fix agent selection to persist across workspace switches and refresh.

## Context
Agent selection doesn't persist. Users must reselect agent after workspace switch or page refresh. No per-workspace agent memory.

## Root Cause
```typescript
// Agent selection stored in volatile state only
// No workspace-binding in agents-store
// No cross-workspace event sync for agent config
```

## Files to Modify
- `src/stores/agents-store.ts` (or split into slices if needed)
- `src/infrastructure/persistence/stores/workspace/`
- `src/presentation/components/ide/AgentSelector.tsx`
- `src/lib/events/store-events.ts` (add AGENT_CONFIG_CHANGED event)

## Constraints
- Persistence: Agent selection survives workspace switch
- Refresh: Agent selection survives page reload
- Per-workspace: Different agents for different projects
- UX: No jarring UI resets on switch

## Acceptance Criteria
- [ ] Agent persists across workspace switches
- [ ] Agent persists after refresh
- [ ] Per-workspace default agent support
- [ ] Agent config syncs across IDE instances
- [ ] Tool permissions persist per workspace

## Skills to Invoke
- `systematic-debugging` - Understand agent selection flow
- `brainstorming` - Design persistence strategy
- `global-validation` - Validate workspace binding
- `global-error-handling` - Handle persistence failures
- `test-driven-development` - Write persistence tests

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Test agent persistence
npm test -- agents-store

# Manual test: Select agent, switch workspace, verify selection persists
```

## Related Issues
- CRIT-003: Cross-Workspace State Inconsistency

## Next Action
Store agent selection in workspace binding, emit AGENT_CONFIG_CHANGED events, subscribe to updates in components.

---
**Handoff ID**: S-009-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 3 parallel agents

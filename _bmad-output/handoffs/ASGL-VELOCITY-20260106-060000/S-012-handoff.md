# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-012
**Title**: Split conversation-threads-store.ts God Store
**Date**: 2026-01-06T06:30:00+07:00
**Priority**: P0 - CRITICAL

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Split `conversation-threads-store.ts` (726 lines) into focused slices ≤120 lines each.

## Context
The conversation-threads-store.ts file exceeds the 300-line god store limit by 2.4x.
This violates project standards and impacts maintainability.

## Root Cause
```typescript
// conversation-threads-store.ts has 2.4x the limit (726 lines / 300 = 2.4)
// Contains: thread management, message operations, thread metadata
// All in one monolithic store
```

## Files to Modify
- **Primary**: `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts`
- **Create Slices**:
  - `src/infrastructure/persistence/stores/conversation/thread-management-slice.ts` (≤120 lines)
  - `src/infrastructure/persistence/stores/conversation/thread-messages-slice.ts` (≤120 lines)
  - `src/infrastructure/persistence/stores/conversation/thread-metadata-slice.ts` (≤120 lines)
  - `src/infrastructure/persistence/stores/conversation/thread-actions-slice.ts` (≤120 lines)

## Constraints
- Each slice ≤120 lines
- Single bounded store
- Facade for backwards compatibility
- No breaking changes
- Zustand v5 individual selectors

## Acceptance Criteria
- [ ] All slices ≤120 lines
- [ ] conversation-threads-store.ts becomes facade
- [ ] All imports still work
- [ ] Zero TypeScript errors
- [ ] Consumer code unchanged

## Skills to Invoke
- `architecture-remediation` - God store elimination
- `systematic-debugging` - Analyze dependencies
- `brainstorming` - Design slice boundaries
- `global-coding-style` - Maintain consistency
- `test-driven-development` - Test extraction

## Validation Commands
```bash
# Check slice sizes
wc -l src/infrastructure/persistence/stores/conversation/*-slice.ts

# TypeScript check
pnpm typecheck

# Verify imports
grep -r "from.*conversation-threads-store" src --include='*.ts'
```

## Related Issues
- CRIT-001: God Store Violation (2.4x limit)
- Ralph Cycle 4A: God store elimination

## Slice Structure Proposal
```typescript
// thread-management-slice.ts (CRUD operations)
// thread-messages-slice.ts (message handling)
// thread-metadata-slice.ts (metadata/state)
// thread-actions-slice.ts (actions/commands)

// conversation-threads-store.ts (facade)
export * from './thread-management-slice'
export * from './thread-messages-slice'
// ... etc
```

## Next Action
Load conversation-threads-store.ts, analyze dependencies, create focused slices, maintain backwards compatibility.

---
**Handoff ID**: S-012-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: architecture-remediation-orchestrator

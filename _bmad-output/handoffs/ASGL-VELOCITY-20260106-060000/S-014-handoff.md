# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-014
**Title**: Split agents-store.ts God Store
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
Split `agents-store.ts` (430 lines) into focused slices ≤120 lines each.

## Context
The agents-store.ts file exceeds the 300-line god store limit by 1.4x.
This violates project standards and impacts maintainability.

## Root Cause
```typescript
// agents-store.ts has 1.4x the limit (430 lines / 300 = 1.4)
// Contains: agent configuration, provider state, tool permissions
// All in one monolithic store
```

## Files to Modify
- **Primary**: `src/stores/agents-store.ts`
- **Create Slices**:
  - `src/stores/agents/agent-config-slice.ts` (≤120 lines)
  - `src/stores/agents/provider-state-slice.ts` (≤120 lines)
  - `src/stores/agents/tool-permissions-slice.ts` (≤120 lines)
  - `src/stores/agents/agent-actions-slice.ts` (≤120 lines)

## Constraints
- Each slice ≤120 lines
- Single bounded store
- Facade for backwards compatibility
- No breaking changes
- Zustand v5 individual selectors

## Acceptance Criteria
- [ ] All slices ≤120 lines
- [ ] agents-store.ts becomes facade
- [ ] All imports still work
- [ ] Zero TypeScript errors
- [ ] Consumer code unchanged
- [ ] Agent selection persists (S-009 dependency)

## Skills to Invoke
- `architecture-remediation` - God store elimination
- `systematic-debugging` - Analyze dependencies
- `brainstorming` - Design slice boundaries
- `global-coding-style` - Maintain consistency
- `test-driven-development` - Test extraction

## Validation Commands
```bash
# Check slice sizes
wc -l src/stores/agents/*-slice.ts

# TypeScript check
pnpm typecheck

# Verify imports
grep -r "from.*agents-store" src --include='*.ts'
```

## Related Issues
- CRIT-001: God Store Violation (1.4x limit)
- S-009: Agent selection persistence (dependency)
- Ralph Cycle 4A: God store elimination

## Slice Structure Proposal
```typescript
// agent-config-slice.ts (configuration)
// provider-state-slice.ts (provider management)
// tool-permissions-slice.ts (permission handling)
// agent-actions-slice.ts (actions/commands)

// agents-store.ts (facade)
export * from './agent-config-slice'
export * from './provider-state-slice'
// ... etc
```

## Next Action
Load agents-store.ts, analyze dependencies, create focused slices, maintain backwards compatibility.

---
**Handoff ID**: S-014-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: architecture-remediation-orchestrator

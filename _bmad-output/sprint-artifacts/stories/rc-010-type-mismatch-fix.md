# Story: RC-010 - Type Mismatch Fix

**Story ID:** rc-010-type-mismatch-fix
**Sprint:** 27B
**Priority:** HIGH (HIGH-007)
**Status:** ready-for-dev
**Estimated Points:** 3
**Owner:** Team A

## Issue Description

TypeScript type mismatches have accumulated across the codebase, causing:
- `noImplicitAny` violations in strict mode
- Type casting that bypasses type safety
- Interface mismatches between epic boundaries
- Build warnings that may hide real errors

## Root Cause

Rapid parallel development in Epics 3-5 introduced type inconsistencies. The `typescript --noEmit` check passes but with warnings that have been ignored.

## Acceptance Criteria

1. [ ] Run `pnpm tsc --noEmit` and catalog all type errors
2. [ ] Fix all type errors in:
   - `src/lib/filesystem/` - Sync types and adapters
   - `src/lib/agent/` - Tool types and facades
   - `src/lib/state/` - Store interfaces
   - `src/components/` - Component props
3. [ ] Remove unnecessary `any` types and `as` casts
4. [ ] Add missing type exports for public APIs
5. [ ] Verify `pnpm build` completes without type errors
6. [ ] Tests cover: type-correctness via build verification (no additional tests needed)

## Technical Approach

```bash
# Identify type errors
pnpm tsc --noEmit 2>&1 | grep -E "error TS" | head -50

# Common patterns to fix:
# 1. Missing return types on exported functions
# 2. Implicit `any` on generic type parameters
# 3. Mismatched property names between interfaces
# 4. Missing optional properties that are actually optional
```

## Files to Modify

Multiple files across the codebase. Primary targets:
- `src/lib/filesystem/sync-types.ts` - Sync state types
- `src/lib/agent/tools/tool-types.ts` - Tool execution types
- `src/lib/state/dexie-db.ts` - Database types
- `src/components/agent/AgentChatPanel.tsx` - Component props

## Files to Create

- None

## Test Strategy

1. Run `pnpm tsc --noEmit` before and after
2. Verify `pnpm build` completes successfully
3. No new TypeScript errors introduced

## Definition of Done

- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm build` completes successfully
- [ ] Code reviewed
- [ ] sprint-status.yaml updated

## Notes

This is a cleanup story. Focus on fixing actual type errors rather than adding extensive types to already-working code.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29

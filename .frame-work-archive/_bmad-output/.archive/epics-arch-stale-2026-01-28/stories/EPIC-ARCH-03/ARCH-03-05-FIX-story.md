# ARCH-03-05-FIX: Progressive Disclosure UI TypeScript Resolution

**Created**: 2026-01-25
**Epic**: EPIC-ARCH-03 (Layout & UX)
**Priority**: P0 (Blocks ARCH-03-05 completion)
**Effort**: 1-2 hours
**Status**: READY_FOR_DEV
**Assigned Team**: Any available dev-ext

---

## Context

ARCH-03-05 (Progressive Disclosure UI) is marked complete but has TypeScript module resolution issues that prevent full verification. This fix story addresses those specific issues.

## Root Cause Analysis

Based on TypeScript error output from `pnpm tsc --noEmit`, the following issues exist in ARCH-03-05 deliverables:

### Issue 1: LayoutOnboarding.tsx JSX Configuration
- **File**: `src/presentation/components/layout/LayoutOnboarding.tsx` (if exists)
- **Error**: JSX expressions require configuration
- **Likely Cause**: Missing `"jsx": "react-jsx"` in tsconfig or file not using `.tsx` extension

### Issue 2: User Preferences Store Import
- **File**: `src/infrastructure/persistence/stores/user-preferences-store.ts`
- **Error**: Cannot resolve module
- **Likely Cause**: File doesn't exist or path alias misconfigured

## Acceptance Criteria

| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | `LayoutOnboarding.tsx` compiles without JSX errors | `pnpm tsc --noEmit` shows no errors for this file |
| AC2 | `user-preferences-store.ts` imports resolve correctly | All imports of this file succeed |
| AC3 | ARCH-03-05 components render without runtime errors | Manual test in browser |
| AC4 | No NEW TypeScript errors introduced | Compare before/after `tsc --noEmit` output |

## Investigation Steps

1. Verify if `LayoutOnboarding.tsx` exists
2. Check if `user-preferences-store.ts` exists at expected path
3. Verify tsconfig.json has correct JSX configuration
4. Verify path aliases in tsconfig.json match file locations

## Files to Check/Modify

```
src/presentation/components/layout/LayoutOnboarding.tsx   # May need creation or fix
src/infrastructure/persistence/stores/user-preferences-store.ts  # May need creation
tsconfig.json  # Verify jsx and paths configuration
```

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| ARCH-03-05 | Blocked by this | BLOCKED |
| ADR-034 | Reference | APPROVED |

## Success Metrics

- 0 TypeScript errors related to ARCH-03-05 files
- ARCH-03-05 can be marked VERIFIED after this fix

---

## Notes

This is a **technical debt fix story**, not a feature story. It exists solely to unblock ARCH-03-05 verification.

The broader TypeScript debt (~115+ errors across codebase) is tracked in EPIC-TS-DEBT, which is a separate remediation epic.

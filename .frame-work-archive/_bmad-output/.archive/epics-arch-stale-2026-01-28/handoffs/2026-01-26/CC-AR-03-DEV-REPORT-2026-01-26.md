# CC-AR-03 Dev Report: Fix Store Hydration Race Condition

**Story**: CC-AR-03  
**Epic**: EPIC-CC-AR02AR03  
**Team**: Team B  
**Completed**: 2026-01-26T12:30:00+07:00  
**Effort**: ~45 minutes (under estimate)

---

## Summary

Fixed the race condition in `PluginLayoutStore.ts` where `getCurrentProjectId()` reads from localStorage BEFORE Zustand persist middleware completes hydration.

---

## Acceptance Criteria Checklist

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC1 | `_hasHydrated` boolean flag added to `PluginLayoutState` interface | **PASS** | Line 117 |
| AC2 | `setHasHydrated()` action added to store | **PASS** | Line 479 |
| AC3 | `onRehydrateStorage` callback sets `_hasHydrated=true` after hydration | **PASS** | Line 497-501 |
| AC4 | Route component checks `_hasHydrated` before rendering PluginLayout | **PASS** | Line 95, 111 in $projectId.tsx |
| AC5 | Loading skeleton shown while `_hasHydrated=false` | **PASS** | Lines 112-118 in $projectId.tsx |
| AC7 | TypeScript: 0 new errors | **PASS** | Empty output from `pnpm tsc --noEmit` |

---

## Files Modified

### 1. `src/presentation/layouts/PluginLayoutStore.ts`

**Lines changed**: +31 lines (503 → 534 lines)

**Changes**:
- Added `_hasHydrated: boolean` to interface (line 117)
- Added `setHasHydrated: (value: boolean) => void` action to interface (line 171)
- Added `_hasHydrated: false` to initial state (lines 202-203)
- Added `setHasHydrated` action implementation (lines 475-479)
- Added `onRehydrateStorage` callback in persist config (lines 483-501)

### 2. `src/routes/$projectId.tsx`

**Lines changed**: +13 lines (113 → 126 lines)

**Changes**:
- Added `hasHydrated` selector (line 95)
- Added hydration check with loading skeleton (lines 111-118)
- Updated console log to include hydration status (line 97)

---

## Validation Evidence

### TypeScript Check
```bash
$ pnpm tsc --noEmit
# (empty output = 0 errors)
```

### Grep: _hasHydrated
```
117:  _hasHydrated: boolean;
203:      _hasHydrated: false,
479:      setHasHydrated: (value) => set({ _hasHydrated: value }),
495:       * Sets _hasHydrated=true so components know when it's safe to read state.
```

### Grep: onRehydrateStorage
```
202:      /** CC-AR-03: Hydration flag - false until onRehydrateStorage fires */
477:       * Called by onRehydrateStorage callback when persist middleware finishes
483:    // Persist Configuration (CC-AR-03: Added onRehydrateStorage)
497:      onRehydrateStorage: () => (state) => {
```

### Grep: Route Hydration Guard
```
95:  const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);
97:  console.log('[UnifiedProjectRoute] Rendering with:', { projectId, project, platform, hasHydrated });
111:  if (!hasHydrated) {
```

---

## How It Works

1. **Initial State**: `_hasHydrated` starts as `false`
2. **Store Creation**: Zustand creates store, persist middleware starts async hydration
3. **Route Renders**: Component sees `hasHydrated=false`, shows loading skeleton
4. **Hydration Completes**: `onRehydrateStorage` callback fires, calls `setHasHydrated(true)`
5. **Re-render**: Component sees `hasHydrated=true`, renders PluginLayout with correct persisted state

---

## Unblocks

- **CC-AR-04** (Team A): Toggle-based layout can rely on hydrated store
- **CC-AR-05** (Team B): Monaco plugin can rely on hydrated store
- **CC-AR-06** (Team B): Preview plugin can rely on hydrated store

---

## Technical Notes

### Line Count Warning

`PluginLayoutStore.ts` is now 534 lines (above 500 soft limit). This was minimal for this fix. Future work (CC-AR-08) will split this file.

### No Breaking Changes

- Interface is backward compatible (new optional-like properties)
- Components that don't check `_hasHydrated` will still work
- No changes to Team A files

---

## Status

**COMPLETE** - Ready for orchestrator review

# Story: RC-012 - Persistence Debounce

**Story ID:** rc-012-persistence-debounce
**Sprint:** 27B
**Priority:** HIGH (HIGH-009)
**Status:** ready-for-dev
**Estimated Points:** 3
**Owner:** Team A

## Issue Description

State persistence operations are not debounced, causing:
- Excessive write operations to Dexie/IndexedDB
- UI jank during rapid state updates
- Potential storage quota issues from write amplification
- Poor battery life on mobile devices

## Root Cause

Zustand persist middleware is configured with default options that write synchronously on every state change. Epic 2 implementation did not include debouncing.

## Acceptance Criteria

1. [ ] All Zustand stores with Dexie persistence use debounced writes (300ms default)
2. [ ] Rapid state changes batch into single persistence operations
3. [ ] Debounce can be configured per store (per-store configuration)
4. [ ] Force-save option for critical state (e.g., before page unload)
5. [ ] Loading indicator reflects pending saves (not immediate state)
6. [ ] Tests cover: debounce timing, batch behavior, force-save (10+ tests)

## Technical Approach

```typescript
// Debounced persist configuration
function createDebouncedPersist<T extends State>(
  config: PersistConfig<T>,
  debounceMs: number = 300
): PersistConfig<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingState: T | null = null;

  return {
    ...config,
    write: (key, data) => {
      pendingState = JSON.parse(data);

      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        if (pendingState) {
          await config.write(key, JSON.stringify(pendingState));
          pendingState = null;
        }
      }, debounceMs);
    },
    onRehydrateStorage: () => (state, error) => {
      // Pass through to original handler
      config.onRehydrateStorage?.(state, error);
    },
  };
}

// Usage
const useIDEStore = createWithSignal()(
  persist(
    (set) => ({
      // ... state
    }),
    createDebouncedPersist({
      name: 'ide-storage',
      partialize: (state) => ({ openFiles: state.openFiles }),
    }, 300)
  )
);

// Force save before unload
window.addEventListener('beforeunload', () => {
  useIDEStore.persist.flush();
});
```

## Dependencies

- `src/lib/state/` - All Zustand stores
- `src/lib/state/dexie-db.ts` - Persistence layer

## Files to Modify

- `src/lib/state/ide-store.ts` - Add debounced persistence
- `src/lib/state/agents-store.ts` - Add debounced persistence
- `src/lib/state/sync-status-store.ts` - Add debounced persistence (after RC-005)
- `src/lib/state/__tests__/` - Add debounce tests

## Files to Create

- `src/lib/state/persistence/debounced-persist.ts` - Shared debounce utility

## Test Strategy

1. **Debounce Tests**: Multiple writes within debounce period batched
2. **Timing Tests**: Write occurs after debounce delay
3. **Force Save Tests**: Immediate write on flush
4. **Integration Tests**: Works with actual Dexie persistence

## Definition of Done

- [ ] All AC satisfied
- [ ] 10+ tests passing (100%)
- [ ] Code reviewed
- [ ] Performance improved (verify with Chrome DevTools)
- [ ] sprint-status.yaml updated

## Notes

Default debounce should be 300ms - fast enough to feel responsive, slow enough to batch rapid updates.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29

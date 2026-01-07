# ADR-001: Zustand State Management with v5 Patterns

**Status**: PROPOSED  
**Date**: 2026-01-07  
**Decision Type**: Architectural Standard

## Context

Analysis of Phase 1 codebase extraction revealed:
- **Current State**: Partial Zustand v5 adoption with StateCreator pattern
- **Issues**: No `useShallow` usage, individual selectors not consistently applied, god stores exist
- **Impact**: 9 god stores exceed 300 lines, performance implications from re-renders

## Decision

Adopt **Zustand v5 best practices** as the single source of truth for state management.

### Pattern Requirements

```typescript
// 1. SLICE PATTERN - Each slice in separate file (<120 lines)
const createCounterSlice: StateCreator<CounterState, [], [], CounterState> = 
  (set, get) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  });

// 2. COMBINED STORE - Persist on combined store ONLY
export const useCounterStore = create<CounterState>()(
  persist(
    (...a) => ({
      ...createCounterSlice(...a),
      ...createOtherSlice(...a),
    }),
    {
      name: 'counter-store',
      partialize: (state) => ({ count: state.count }), // Selective persistence
    }
  )
);

// 3. INDIVIDUAL SELECTORS - No destructuring (prevents infinite re-renders)
const count = useCounterStore(s => s.count);
const increment = useCounterStore(s => s.increment);

// 4. MULTIPLE SELECTORS - Use useShallow from 'zustand/react/shallow'
import { useShallow } from 'zustand/react/shallow';

const { count, increment, decrement } = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    increment: state.increment,
    decrement: state.decrement,
  }))
);

// 5. CROSS-SLICE COMMUNICATION - Use get() NOT direct imports
const handleAction = () => {
  const otherSliceValue = get().otherSliceValue; // ✅ Correct
  set({ result: otherSliceValue });
};
```

### Forbidden Patterns

```typescript
// ❌ FORBIDDEN - Destructuring causes infinite re-renders
const { count, increment } = useCounterStore();

// ❌ FORBIDDEN - Multiple stores for same domain
const useCounterStore = create(...);
const useLegacyCounterStore = create(...); // ❌ Duplicate

// ❌ FORBIDDEN - Persist on individual slice
const slice = createSlice(...);
const store = create(persist(slice, { name: 'slice' })); // ❌ Wrong

// ❌ FORBIDDEN - Direct cross-slice imports
import { createOtherSlice } from './other-slice';
const createSlice = (set, get) => ({
  action: () => {
    createOtherSlice(set, get).action(); // ❌ Circular dependency
  }
});
```

## Rationale

1. **Performance**: Individual selectors prevent unnecessary re-renders
2. **Maintainability**: Single bounded store eliminates circular dependencies
3. **Testability**: Pure slices can be unit tested in isolation
4. **Consistency**: Standard patterns across all stores

## Implementation Notes

### Migration Strategy for Existing Stores

1. **Identify god stores** (>300 lines) from Phase 1 analysis
2. **Extract slices** into separate files (<120 lines each)
3. **Create combined store** with persist middleware on combined store only
4. **Update components** to use individual selectors
5. **Add facade exports** for backward compatibility

### Compliance Checklist

- [ ] No store file exceeds 300 lines
- [ ] No store file exceeds 120 lines per slice
- [ ] All selectors use individual pattern or useShallow
- [ ] Persist middleware on combined store only
- [ ] Cross-slice communication via get()
- [ ] No duplicate stores for same domain
- [ ] Facade exports for legacy imports

## Related ADRs

- ADR-002: Single Source of Truth for State
- ADR-003: Clean Architecture Layer Separation
- ADR-004: God Store Decomposition Strategy

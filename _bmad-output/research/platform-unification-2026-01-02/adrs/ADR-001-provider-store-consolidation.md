# ADR-001: Provider Store Consolidation

**Status**: ACCEPTED
**Date**: 2026-01-02
**Context**: Platform Unification Epic - Cornerstone 1 Analysis
**Related**: Cornerstone 1 - LLM Provider and Key Configuration

---

## Context

Prior to consolidation, the provider configuration system had:
- **3 duplicate provider stores** across `lib/state/`, `stores/`, and `infrastructure/persistence/stores/`
- **Readonly enforcement only at UI level** (not enforced at store level)
- **Inconsistent API key handling** across stores
- **No centralized model catalog**

**Health Score**: 85/100 (Production-Ready with Minor Remediation)

---

## Decision

**Consolidate all provider state into a single bounded store composed from 3 focused slices.**

### Architecture

```
useAppStore (providers + agents combined)
├── provider-crud-slice.ts (214 lines)
├── provider-models-slice.ts (218 lines)
└── provider-utils-slice.ts (114 lines)
```

**Total Size**: 546 lines (well within acceptable limits)

### Key Features

1. **Single Source of Truth**
   - One canonical location: `src/infrastructure/persistence/stores/providers/`
   - All provider state in `useAppStore.providers`
   - Zero duplicate stores

2. **Slice-Based Architecture**
   - CRUD operations isolated in `provider-crud-slice.ts`
   - Model fetching and caching in `provider-models-slice.ts`
   - Model settings and selectors in `provider-utils-slice.ts`

3. **Readonly Enforcement** (P2 Gap Fix)
   ```typescript
   updateProvider: (id, updates) => {
       const provider = get().providers[id];

       // ✅ Add validation
       if (provider?.isBuiltIn && updates.baseURL && updates.baseURL !== provider.baseURL) {
           throw new Error('Cannot modify built-in provider endpoint');
       }

       set((state) => ({
           providers: {
               ...state.providers,
               [id]: { ...state.providers[id], ...updates }
           }
       }));
   }
   ```

4. **Model Catalog**
   - Auto-load models on API key save
   - Concurrent request deduplication
   - Model caching with TTL (5 minutes)

5. **Dexie Persistence**
   - API keys encrypted via credential vault
   - Selective persistence via `partialize`
   - Auto-hydration with fallback to defaults

---

## Alternatives Considered

### Alternative A: Keep Duplicate Stores
**Pros**:
- No migration effort
- Existing consumers unaffected

**Cons**:
- Data inconsistency risk
- Synchronization overhead
- Maintenance burden

**Rejected**: Technical debt outweighs migration effort

### Alternative B: Monolithic Provider Store
**Pros**:
- Simple architecture
- All code in one file

**Cons**:
- Violates single responsibility principle
- Harder to test
- Exceeds 300-line limit guidelines

**Rejected**: Slice pattern proven in production (December 2025 Zustand)

---

## Consequences

### Positive

1. **Eliminated Duplicate Stores** (3 locations → 1)
2. **Readonly Enforcement** (security improvement)
3. **Model Auto-Loading** (better UX)
4. **Testability** (focused slices are easier to test)

### Negative

1. **Migration Effort** (consumers must update imports)
2. **Breaking Changes** (legacy store paths deprecated)
3. **Learning Curve** (new developers must understand slice pattern)

### Migration Path

**Phase 1** (Completed):
- ✅ Create 3 provider slices
- ✅ Consolidate into `useAppStore`
- ✅ Add Dexie persistence

**Phase 2** (P2 Remediation - 2-3 hours):
- ⏳ Add readonly validation to `updateProvider()`
- ⏳ Write unit tests for readonly enforcement
- ⏳ Document validation logic in JSDoc

**Phase 3** (Deferred - P3/P4):
- ⏳ Update test mock paths (5 test files)
- ⏳ Consolidate `AppState` interfaces
- ⏳ Document `useProviderStore` alias deprecation

---

## Trade-offs

| Aspect | Chosen Approach | Alternative | Rationale |
|--------|-----------------|-------------|-----------|
| **Store Location** | `infrastructure/persistence/stores/` | `lib/state/` | Aligns with 4-layer architecture |
| **Slice Granularity** | 3 slices (CRUD, models, utils) | 1 monolithic store | Easier testing, better SRP adherence |
| **Readonly Enforcement** | Store-level validation | UI-level only | Security hardening |
| **Model Loading** | Auto-load on API key save | Manual refresh | Better UX, less friction |

---

## References

- **Cornerstone 1 Analysis**: `_bmad-output/research/platform-unification-2026-01-02/cornerstone-1-provider-analysis.md`
- **Zustand Best Practices**: December 2025 Zustand Patterns (individual selectors, slice pattern)
- **Epic AC-1**: Agent Configuration Consolidation (completed in Ralph Loop Cycle 17)

---

**Signed**: Platform Unification Epic Team
**Approved**: 2026-01-02
**Review Date**: 2026-02-02 (30 days post-implementation)

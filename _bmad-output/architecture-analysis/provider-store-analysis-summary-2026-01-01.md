# Provider-Store Analysis Summary
**Quick Reference for Epic AC-1 Migration**

---

## Key Findings (TL;DR)

- **267 lines** of production-ready code
- **11 direct dependencies** (9 production + 2 test)
- **1 circular dependency** (already mitigated with mediator)
- **1 duplicate store** (models-loader-store - 298 lines, should merge)
- **Dexie persistence** with proper partialize strategy
- **Zero breaking changes** if using facade pattern

---

## Current State

```typescript
// Location: src/lib/state/provider-store.ts
// Lines: 267
// Middleware: persist (Dexie) + onRehydrateStorage

interface ProviderState {
    providers: ProviderConfig[];
    activeProviderId: string | null;
    modelSettings: Record<string, ModelSettings>;
    availableModels: Record<string, ModelInfo[]>;
    isLoading: boolean;
    isLoadingModels: Record<string, boolean>;

    // 8 actions
    addProvider, updateProvider, removeProvider, setActiveProvider,
    updateModelSettings, fetchModels, getAvailableModels, reset
}
```

---

## Dependencies

### Imports (9 total)
```
zustand
zustand/middleware (persist, createJSONStorage)
dexie-storage (custom adapter)
types (ProviderConfig, ModelInfo)
credential-vault (3-module facade)
model-registry (singleton)
cross-workspace-event-bus
workspace-detector
AgentProviderValidator (mediator)
Agent (core entity)
```

### Reverse Dependencies (11 files)
**Critical (P0)**:
- ProviderConfigDialog.tsx (UI)
- ProviderSettings.tsx (UI)
- AgentBasicConfig.tsx (UI)
- AppInitializer.tsx (boot)
- agent-validation-slice.ts (agents-store)
- useAgentConfigProvider.ts (context)
- useProviderEvents.ts (hooks)

**Non-Critical (P2)**:
- models-loader-store.ts (298 lines - **MERGE TARGET**)

**Tests** (2 files):
- ProviderConfigDialog.test.tsx
- ProviderSettings.test.tsx

---

## Circular Dependency Status

✅ **MITIGATED** (Ralph Loop Cycle 12, Epic AC-1.1)

**Before**:
```
agents-store.ts ↔ provider-store.ts (circular)
```

**After**:
```
agents-store.ts → AgentProviderValidator ← provider-store.ts (mediated)
```

**Mediator**: `src/domain/services/AgentProviderValidator.ts` (238 lines)

**Key Methods**:
```typescript
AgentProviderValidator.validateProviderModel(providerId, modelId, availableModels)
AgentProviderValidator.validateProviderDeletion(providerId, agents)
```

---

## Duplicate Store Issue

**models-loader-store.ts** (298 lines) - SHOULD BE MERGED

**Duplicate State**:
```typescript
// models-loader-store (DUPLICATE)
models: Record<string, ModelStateEntry>  // SAME as availableModels
loadModelsForProvider(providerId)        // SAME as fetchModels
```

**Cross-Store Dependency**:
```typescript
// Line 28, 76, 175, 293
import { useProviderStore } from '@/lib/state/provider-store'
```

**Recommendation**: Merge into provider slice (298 → ~100 lines)

---

## Persistence Strategy

**Storage**: Dexie.js (IndexedDB)
**Adapter**: `createDexieStorage('providerConfigs')`
**Table**: `providerConfigs` in `dexie-db.ts`

**Partialize** (persisted fields):
- ✅ providers
- ✅ activeProviderId
- ✅ modelSettings
- ❌ availableModels (fetched on demand)
- ❌ isLoading (ephemeral)
- ❌ isLoadingModels (ephemeral)

**Hydration**:
- Validates providers array is not empty
- Falls back to INITIAL_PROVIDERS if stale

---

## Migration Plan (Epic AC-1)

### Step 1: Merge models-loader-store
```typescript
// Before: 2 stores (267 + 298 = 565 lines)
provider-store.ts (267 lines)
models-loader-store.ts (298 lines)

// After: 1 slice (~400 lines)
provider-slice.ts (~400 lines)
```

### Step 2: Create provider slice
```typescript
// src/infrastructure/persistence/stores/providers/provider-slice.ts
export const createProviderSlice: StateCreator<AppState> = (set, get) => ({
    providers: INITIAL_PROVIDERS,
    activeProviderId: 'openrouter',
    modelSettings: {},
    availableModels: {},
    isLoading: false,
    isLoadingModels: {},

    // 8 actions (preserve signatures)
    addProvider: (config) => { ... },
    updateProvider: (id, config) => { ... },
    removeProvider: (id, agents?) => { ... },
    // ... (5 more actions)
});
```

### Step 3: Facade for backwards compatibility
```typescript
// src/lib/state/provider-store.ts (NEW - facade)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

export const useProviderStore = {
    getState: () => useAppStore.getState(),
    subscribe: (listener) => useAppStore.subscribe(listener),
    // ... selector wrappers
};
```

### Step 4: Update imports incrementally
```typescript
// Phase 1: Backwards compatible (no breaking changes)
import { useProviderStore } from '@/lib/state/provider-store'; // facade

// Phase 2: Direct import (future)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
```

---

## Risk Assessment

**Migration Risk**: **LOW**

**Reasons**:
1. Facade pattern preserves API compatibility
2. All action signatures remain unchanged
3. Dexie persistence strategy is solid
4. Tests already exist (2 test files)
5. Circular dependency already mitigated

**Estimated Effort**: 8 hours
- Merge models-loader-store: 4 hours
- Create provider slice: 2 hours
- Tests + validation: 2 hours

---

## Technical Debt

| Issue | Priority | Effort | Epic |
|-------|----------|--------|------|
| Merge models-loader-store | P1 | 4h | AC-1 |
| Add devtools middleware | P2 | 1h | AC-1 |
| Remove dynamic import fallback | P2 | 2h | AC-2 |
| Move events to app layer | P3 | 8h | AC-3 |

---

## Next Steps

1. ✅ **Read this analysis** (complete)
2. **Approve migration plan** (stakeholder review)
3. **Story AC-1.4**: Create provider slice (8 hours)
4. **Story AC-1.5**: Merge models-loader-store (4 hours)
5. **Story AC-1.6**: Facade re-export (2 hours)
6. **Story AC-1.7**: Tests + validation (2 hours)

---

## Files to Modify

**Create**:
- `src/infrastructure/persistence/stores/providers/provider-slice.ts`
- `src/infrastructure/persistence/stores/providers/types.ts`
- `src/lib/state/provider-store.ts` (NEW - facade)

**Delete**:
- `src/stores/models-loader-store.ts` (merge into slice)

**Update** (11 files - backwards compatible):
- `src/presentation/components/agent/ProviderConfigDialog.tsx`
- `src/presentation/components/agent/ProviderSettings.tsx`
- `src/presentation/components/agent/AgentBasicConfig.tsx`
- `src/presentation/components/agent/useAgentConfigProvider.ts`
- `src/presentation/components/common/AppInitializer.tsx`
- `src/lib/hooks/useProviderEvents.ts`
- `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts`
- [2 test files]

---

**Summary**: Provider-store is production-ready with minor technical debt. Migration risk is LOW due to facade pattern. Proceed with Epic AC-1.

---

**Document End**

Generated: 2026-01-01
Epic: AC-1 - Agent Configuration Consolidation
Artifact: provider-store-analysis-summary-2026-01-01.md

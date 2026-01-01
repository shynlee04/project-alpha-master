# Provider-Store Migration Quick Reference
**Epic AC-1 Implementation Guide**

---

## Current State Summary

| Metric | Value |
|--------|-------|
| **File** | `src/lib/state/provider-store.ts` |
| **Lines** | 267 |
| **Dependencies** | 11 files (9 production + 2 test) |
| **Actions** | 8 methods |
| **Middleware** | persist (Dexie) + onRehydrateStorage |
| **Circular Deps** | 1 (MITIGATED with mediator) |
| **Duplicate Store** | models-loader-store.ts (298 lines) |

---

## Migration Target

```
BEFORE: 2 stores (565 lines)
- provider-store.ts (267 lines)
- models-loader-store.ts (298 lines)

AFTER: 1 slice (~400 lines)
- providerSlice (in use-app-store.ts)
  ✓ provider-store functionality
  ✓ models-loader functionality merged
  ✓ event subscriptions internalized

REDUCTION: 565 → 400 lines (29% reduction)
```

---

## Action Signatures (Must Preserve)

```typescript
// From provider-store.ts
addProvider: (config: ProviderConfig) => void;
updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
removeProvider: (id: string, agents?: Agent[]) => Promise<void>;
setActiveProvider: (id: string) => void;
updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
fetchModels: (providerId: string) => Promise<void>;
getAvailableModels: (providerId: string) => ModelInfo[];
reset: () => void;

// From models-loader-store.ts (merge target)
setSelectedModel: (modelId: string) => void;
loadModelsForProvider: (providerId: string) => Promise<void>;
clearModelsCache: (providerId: string) => void;
```

---

## State Structure

```typescript
interface ProviderState {
    // Core Provider State (from provider-store.ts)
    providers: ProviderConfig[];
    activeProviderId: string | null;
    modelSettings: Record<string, ModelSettings>;
    availableModels: Record<string, ModelInfo[]>;
    isLoading: boolean;
    isLoadingModels: Record<string, boolean>;

    // Model Cache State (from models-loader-store.ts - MERGE)
    selectedModelId: string | null;
    modelCache: Record<string, ModelStateEntry>;
}

interface ModelStateEntry {
    models: ModelInfo[];
    isLoadingModels: boolean;
    lastFetchedAt: number | null;
    error: string | null;
}
```

---

## Critical Files (11 Dependencies)

### Must Update (9 production files)
```
src/presentation/components/agent/
├── ProviderConfigDialog.tsx
├── ProviderSettings.tsx
├── AgentBasicConfig.tsx
└── useAgentConfigProvider.ts

src/presentation/components/common/
└── AppInitializer.tsx

src/lib/hooks/
└── useProviderEvents.ts

src/infrastructure/persistence/stores/agents/slices/
└── agent-validation-slice.ts

src/infrastructure/persistence/stores/
└── index.ts
```

### Test Files (2)
```
src/presentation/components/agent/__tests__/
├── ProviderConfigDialog.test.tsx
└── ProviderSettings.test.tsx
```

### Should Delete (1)
```
src/stores/models-loader-store.ts (298 lines)
→ Merge into providerSlice
```

---

## Migration Steps

### Step 1: Create Provider Slice (4 hours)
```typescript
// src/infrastructure/persistence/stores/providers/provider-slice.ts
import { StateCreator } from 'zustand';
import type { ProviderState, ModelSettings, ModelStateEntry } from './types';
import type { CombinedAppState } from '../types';

export const createProviderSlice: StateCreator<CombinedAppState> = (set, get) => ({
    // Initial State
    providers: INITIAL_PROVIDERS,
    activeProviderId: 'openrouter',
    modelSettings: {},
    availableModels: {},
    isLoading: false,
    isLoadingModels: {},
    selectedModelId: null,
    modelCache: {},

    // Actions (8 from provider-store + 3 from models-loader)
    addProvider: (config) => {
        set((state) => ({
            providers: [...state.providers, config]
        }));
    },

    updateProvider: (id, config) => {
        set((state) => ({
            providers: state.providers.map(p =>
                p.id === id ? { ...p, ...config } : p
            )
        }));
    },

    // ... (implement all 11 actions)
});
```

### Step 2: Create Facade (2 hours)
```typescript
// src/lib/state/provider-store.ts (NEW - facade)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

export const useProviderStore = {
    getState: () => useAppStore.getState(),
    subscribe: (listener) => useAppStore.subscribe(listener),

    // State selectors
    providers: () => useAppStore((s) => s.providers),
    activeProviderId: () => useAppStore((s) => s.activeProviderId),
    modelSettings: () => useAppStore((s) => s.modelSettings),
    availableModels: () => useAppStore((s) => s.availableModels),
    isLoading: () => useAppStore((s) => s.isLoading),
    isLoadingModels: () => useAppStore((s) => s.isLoadingModels),

    // Action wrappers
    addProvider: (config) => useAppStore.getState().addProvider(config),
    updateProvider: (id, config) => useAppStore.getState().updateProvider(id, config),
    removeProvider: (id, agents) => useAppStore.getState().removeProvider(id, agents),
    setActiveProvider: (id) => useAppStore.getState().setActiveProvider(id),
    updateModelSettings: (providerId, settings) =>
        useAppStore.getState().updateModelSettings(providerId, settings),
    fetchModels: (providerId) => useAppStore.getState().fetchModels(providerId),
    getAvailableModels: (providerId) => useAppStore.getState().getAvailableModels(providerId),
    reset: () => useAppStore.getState().reset(),

    // Models-loader actions (merged)
    setSelectedModel: (modelId) => useAppStore.getState().setSelectedModel(modelId),
    loadModelsForProvider: (providerId) =>
        useAppStore.getState().loadModelsForProvider(providerId),
    clearModelsCache: (providerId) =>
        useAppStore.getState().clearModelsCache(providerId),
};

// Re-export types
export type { ProviderState, ModelSettings } from '@/infrastructure/persistence/stores/providers/types';
```

### Step 3: Update Imports (1 hour)
```typescript
// Phase 1: No changes needed (facade preserves API)
import { useProviderStore } from '@/lib/state/provider-store';

// Phase 2: Direct import (future optimization)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
```

### Step 4: Delete Duplicate (1 hour)
```bash
# Delete models-loader-store.ts after merge
rm src/stores/models-loader-store.ts

# Update any remaining imports (should be none if facade works)
grep -r "models-loader-store" src/
```

---

## Testing Checklist

### Unit Tests (3 scenarios)
- [ ] Provider CRUD operations (add, update, remove)
- [ ] Model fetching with caching
- [ ] Validation with AgentProviderValidator

### Integration Tests (2 scenarios)
- [ ] Provider deletion with dependent agents (should throw)
- [ ] Cross-workspace event emission on model fetch

### Migration Tests (2 scenarios)
- [ ] Facade re-export compatibility (all 11 files)
- [ ] Dexie persistence migration (data integrity)

### Manual Testing (5 scenarios)
- [ ] Add custom provider via UI
- [ ] Update API key for built-in provider
- [ ] Delete provider with dependent agents (should block)
- [ ] Fetch models for provider (check cross-workspace event)
- [ ] Switch active provider

---

## Risk Mitigation

### Low Risk (Facade Pattern)
✅ **Zero breaking changes** - All 11 consumer files continue to work
✅ **Type safety preserved** - All action signatures unchanged
✅ **Persistence intact** - Dexie storage strategy unchanged

### Medium Risk (Event Subscriptions)
⚠️ **Cross-store subscriptions** - Move internal to provider slice
⚠️ **Event emission** - Ensure workspace detection works

### High Risk (Data Loss)
🔴 **Dexie migration** - Test with production data backup
🔴 **Credential vault** - Ensure no API keys lost during migration

---

## Rollback Plan

If migration fails:
```bash
# 1. Restore old files
git checkout HEAD~1 src/lib/state/provider-store.ts
git checkout HEAD~1 src/stores/models-loader-store.ts

# 2. Delete new files
rm src/infrastructure/persistence/stores/providers/provider-slice.ts
rm src/infrastructure/persistence/stores/use-app-store.ts

# 3. Restart dev server
pnpm dev
```

---

## Success Criteria

- [ ] All 11 consumer files work without modification
- [ ] All 7 unit tests pass
- [ ] All 4 integration tests pass
- [ ] Dexie data persisted correctly (check DevTools)
- [ ] Provider CRUD works in UI
- [ ] Model fetching triggers cross-workspace events
- [ ] Provider deletion validates dependent agents
- [ ] models-loader-store.ts deleted (298 lines removed)
- [ ] Total line reduction: 565 → 400 lines (29% reduction)

---

## Estimated Timeline

| Task | Effort | Owner |
|------|--------|-------|
| Create provider slice | 4h | Dev |
| Create facade + types | 2h | Dev |
| Update imports (11 files) | 1h | Dev |
| Delete models-loader-store | 1h | Dev |
| Write unit tests (3 scenarios) | 2h | TEA |
| Write integration tests (2 scenarios) | 1h | TEA |
| Manual testing (5 scenarios) | 1h | QA |
| **Total** | **12h** | - |

**Sprint Allocation**: 2 days (assuming 6h/day effective work)

---

## Next Actions

1. ✅ **Review this analysis** (stakeholder approval)
2. **Story AC-1.4**: Create provider slice (4h)
3. **Story AC-1.5**: Merge models-loader-store (2h)
4. **Story AC-1.6**: Create facade re-export (2h)
5. **Story AC-1.7**: Write tests (3h)
6. **Story AC-1.8**: Manual testing + validation (1h)

---

## Related Artifacts

- **Full Analysis**: `provider-store-architecture-analysis-2026-01-01.md`
- **Summary**: `provider-store-analysis-summary-2026-01-01.md`
- **Diagram**: `provider-store-dependency-diagram-2026-01-01.md`
- **Migration Plan**: Epic AC-1 (agent-config-consolidation-plan-2026-01-01.md)

---

**Quick Reference End**

Generated: 2026-01-01
Epic: AC-1 - Agent Configuration Consolidation
Artifact: provider-store-migration-quick-reference-2026-01-01.md

---
step: 2
id: step-02-provider-foundation
name: Provider → Models Reactivity (AC-01)
workflow: architectural-consolidation
real_world_aligned: true
---

# Step 2: Provider → Models Reactivity (Story AC-01)

**Objective**: Implement event-driven model loading when API keys are saved.

**Current State** (REAL-WORLD ASSESSED):
- ✅ `setApiKey()` exists in `src/stores/provider-models-store.ts`
- ✅ `fetchModels()` exists and works
- ✅ `ProviderConfigDialog` has readonly baseURL for built-in providers
- ❌ Missing: Event emission on key save
- ❌ Missing: Event listener for auto-loading

**This step focuses on WIRING THE EVENT BUS for reactivity.**

---

## 1. IMPLEMENTATION TASKS

### Task 1.1: Add Event Emission to `setApiKey()`

**File**: `src/stores/provider-models-store.ts`

**Current Code** (approximately line 85-95):
```typescript
setApiKey: async (providerId: string, apiKey: string) => {
  // ... existing key persistence logic ...
  await credentialVault.storeCredentials(providerId, apiKey);
  set(produce(state => {
    state.providers[providerId].hasApiKey = true;
  }));
  // ❌ MISSING: Event emission
}
```

**Required Change**:
```typescript
import { emitStoreEvent } from '@/lib/events/store-events';

setApiKey: async (providerId: string, apiKey: string) => {
  // ... existing key persistence logic ...
  await credentialVault.storeCredentials(providerId, apiKey);
  set(produce(state => {
    state.providers[providerId].hasApiKey = true;
  }));

  // ✅ ADD THIS: Emit event for auto-loading
  emitStoreEvent('provider:key-set', {
    providerId,
    timestamp: Date.now()
  });
}
```

### Task 1.2: Add Event Listener for Auto-Loading

**File**: `src/stores/provider-models-store.ts`

**Location**: Add at the end of the store definition, or in a component that uses the store

**Required Code**:
```typescript
import { subscribeStoreEvent } from '@/lib/events/store-events';

// Subscribe to provider:key-set events
useEffect(() => {
  const unsubscribe = subscribeStoreEvent('provider:key-set', async ({ providerId }) => {
    const provider = get().providers.find(p => p.id === providerId);
    if (provider && provider.hasApiKey) {
      await get().fetchModels(providerId);
    }
  });

  return () => {
    unsubscribe?.();
  };
}, []);
```

**Alternative** (if in store):
```typescript
// At store initialization
let unsubscribeProviderKeySet: (() => void) | undefined;

const initializeEventListeners = () => {
  unsubscribeProviderKeySet = subscribeStoreEvent('provider:key-set', async ({ providerId }) => {
    const provider = get().providers.find(p => p.id === providerId);
    if (provider && provider.hasApiKey) {
      await get().fetchModels(providerId);
    }
  });
};

// Call this when store is created
initializeEventListeners();
```

### Task 1.3: Emit Model Loaded Event

**File**: `src/stores/provider-models-store.ts`

**Find** `fetchModels` function and add event emission:

```typescript
fetchModels: async (providerId: string) => {
  // ... existing fetch logic ...

  // Store models
  set({
    models: [...get().models, ...newModels]
  });

  // ✅ ADD THIS: Emit models loaded event
  emitStoreEvent('provider:models-loaded', {
    providerId,
    modelCount: newModels.length,
    timestamp: Date.now()
  });
}
```

---

## 2. VALIDATION CRITERIA

### Manual Testing Steps

1. **Clear Application Storage** (DevTools → Application → Clear storage)
2. **Open Settings → Providers**
3. **Enter API Key** for OpenRouter
4. **Click Save**
5. **Verify** (within 2 seconds):
   - [ ] Models dropdown populates automatically
   - [ ] No page refresh needed
   - [ ] Event `provider:key-set` was logged (check console)
   - [ ] Event `provider:models-loaded` was logged

### Type Checking

```bash
pnpm tsc --noEmit
```

Expected: No errors

---

## 3. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Key save → models visible | < 2s | Time from save button to models in dropdown |
| Event propagation | < 100ms | Time from emit to listener execution |
| React UI update | < 50ms | Component re-render time |

---

## 4. FILES CHANGED

| File | Change Type | Lines Added |
|------|-------------|-------------|
| `src/stores/provider-models-store.ts` | Add event emission/listener | ~15 |
| `src/lib/events/store-events.ts` | (Verify events exist) | 0 |

---

## 5. NEXT STEP

Once AC-01 is verified (models auto-load on key save), proceed to **Step 3 (Agent Vault Enhancement)** which adds provider/model selection UI to `AgentConfigDialog`.

**Validation Gate Checklist**:
- [ ] Event `provider:key-set` is emitted on key save
- [ ] Event listener triggers `fetchModels`
- [ ] Models appear in UI without refresh
- [ ] No type errors
- [ ] Build passes: `pnpm build`

---
name: split-store
description: Split a god-class store (>300 LOC) into focused, single-responsibility stores
version: 1.0.0
module: arc-module
validation_ref: sweeping-validation L1-L2
---

# Split Store Workflow

## Purpose

This workflow guides the systematic splitting of god-class stores (stores exceeding 300 lines of code) into focused, single-responsibility stores while maintaining Zustand patterns, Dexie persistence, and event emissions.

## Prerequisites

- Source store identified (>300 LOC)
- Understanding of the store's responsibilities
- All tests passing before split

---

## Step 1: Analyze Current Store

### 1.1 Measure Current State
```bash
# Count lines in target store
wc -l src/stores/<store-name>.ts
```

### 1.2 Identify Responsibilities
Map each responsibility in the store:

| Responsibility | Functions | Lines Est. | New Store |
|----------------|-----------|------------|-----------|
| Provider CRUD | add/update/delete | ~100 | provider-store.ts |
| Model Loading | fetch/set models | ~150 | models-store.ts |
| API Key Mgmt | setApiKey/hasKey | ~50 | credential-store.ts |
| ... | ... | ... | ... |

### 1.3 Check For Dependencies

```bash
# Find all imports of this store
grep -r "from.*/<store-name>" src/ --include="*.ts" --include="*.tsx"
```

---

## Step 2: Plan the Split

### 2.1 Define New Stores

For each responsibility, create a specification:

```typescript
// Store 1: provider-store.ts
interface ProviderStoreState {
  providers: LLMProvider[];
  addProvider: (provider: LLMProvider) => void;
  updateProvider: (id: string, updates: Partial<LLMProvider>) => void;
  deleteProvider: (id: string) => void;
}

// Store 2: models-store.ts
interface ModelsStoreState {
  models: Record<string, ProviderModel[]>; // keyed by providerId
  fetchModels: (providerId: string) => Promise<void>;
  setModels: (providerId: string, models: ProviderModel[]) => void;
}
```

### 2.2 Identify Shared Dependencies

- Type definitions → Keep in shared types file
- Event emissions → Use store-events.ts
- Dexie persistence → Each store has own middleware

---

## Step 3: Execute Split

### 3.1 Create New Store Files

```bash
# Create new store files
touch src/stores/provider-store.ts
touch src/stores/models-store.ts
```

### 3.2 Extract Types

Move shared types to a dedicated file:

```typescript
// src/stores/types/provider-types.ts
export interface LLMProvider { ... }
export interface ProviderModel { ... }
```

### 3.3 Implement New Stores

Each new store must:

1. ✅ Use Zustand `create` pattern
2. ✅ Add Dexie persist middleware with UNIQUE key
3. ✅ Emit events on state mutations
4. ✅ Subscribe to events from related stores
5. ✅ Be <300 lines

```typescript
// src/stores/provider-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emitStoreEvent } from '@/lib/events/store-events';

interface ProviderStoreState {
  providers: LLMProvider[];
  addProvider: (provider: LLMProvider) => void;
}

export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (set, get) => ({
      providers: [],
      
      addProvider: (provider) => {
        set((state) => ({
          providers: [...state.providers, provider]
        }));
        emitStoreEvent('provider:added', { providerId: provider.id });
      },
    }),
    {
      name: 'via-gent-provider-store', // UNIQUE key!
    }
  )
);
```

### 3.4 Wire Event Subscriptions

```typescript
// models-store.ts
import { subscribeStoreEvent } from '@/lib/events/store-events';

// Auto-load models when API key is set
subscribeStoreEvent('provider:key-set', ({ providerId }) => {
  useModelsStore.getState().fetchModels(providerId);
});
```

---

## Step 4: Update Imports

### 4.1 Update Barrel Export

```typescript
// src/stores/index.ts
export { useProviderStore } from './provider-store';
export { useModelsStore } from './models-store';
// Remove old combined store export
```

### 4.2 Update All Consumers

```bash
# Find and replace imports
# OLD: import { useProviderModelsStore } from '@/stores';
# NEW: import { useProviderStore, useModelsStore } from '@/stores';

# Use IDE search/replace or:
sed -i '' 's/useProviderModelsStore/useProviderStore, useModelsStore/g' src/**/*.tsx
```

### 4.3 Update Hook Usage

```typescript
// OLD
const { providers, models, setApiKey } = useProviderModelsStore();

// NEW
const { providers } = useProviderStore();
const { models } = useModelsStore();
```

---

## Step 5: Validate Split

### 5.1 TypeScript Check
```bash
pnpm tsc --noEmit
# Target: 0 errors
```

### 5.2 Build Check
```bash
pnpm build
# Target: 0 errors, <30s
```

### 5.3 Line Count Verification
```bash
wc -l src/stores/provider-store.ts  # Target: <300
wc -l src/stores/models-store.ts     # Target: <300
```

### 5.4 Sweeping Validation L1
- [ ] No dual-source state leaks
- [ ] Persist middleware uses unique keys
- [ ] No hydration race conditions
- [ ] State flow complete (action → persist → restore)

### 5.5 Sweeping Validation L2
- [ ] No unused imports in new stores
- [ ] No orphaned event listeners
- [ ] Old store file deleted or deprecated

---

## Step 6: Delete Old Store

Once all validations pass:

```bash
# Remove old god-class store
rm src/stores/provider-models-store.ts

# Verify no broken imports
pnpm build
```

---

## Rollback Plan

If split causes issues:

1. Revert git changes: `git checkout -- src/stores/`
2. Re-run build to verify
3. Document issues encountered
4. Adjust plan and retry

---

## Checklist Summary

| Step | Action | ✓ |
|------|--------|---|
| 1 | Analyze current store (>300 LOC confirmed) | [ ] |
| 2 | Plan split with responsibility mapping | [ ] |
| 3 | Create new store files with <300 LOC each | [ ] |
| 4 | Update all imports across codebase | [ ] |
| 5 | Validate TypeScript, build, line counts | [ ] |
| 6 | Delete old god-class store | [ ] |
| 7 | Run Sweeping Validation L1-L2 | [ ] |

---

**Workflow Created:** 2025-12-31T16:33:00+07:00
**Module:** arc-module v2.1
**Validation:** Sweeping Validation L1-L2

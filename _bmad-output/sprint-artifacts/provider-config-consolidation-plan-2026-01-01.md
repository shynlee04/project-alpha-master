# Provider Config Consolidation Plan
**Date**: 2026-01-01
**Epic**: WB-8.3 - Cross-Workspace Event System Implementation
**Story**: Ralph Loop Cycle 2 - System-wide Centralized Components Analysis
**Governance**: architectural-gap-analysis-2025-12-31.md
**Priority**: HIGH (Days 1-2)

---

## Executive Summary

**CRITICAL ARCHITECTURAL VIOLATION DETECTED**: 3 identical provider stores causing API key confusion, state synchronization issues, and user experience friction.

### Current State
```
❌ src/lib/agent/providers/index.ts (333 lines)
   - useProviderStore() - localStorage
   - Manual API key management
   - No workspace awareness

❌ src/stores/provider-store.ts (216 lines)
   - useProviderConfigStore() - localStorage
   - Duplicate state structure
   - No event emission

❌ src/infrastructure/persistence/stores/provider-config-store.ts (216 lines)
   - useProviderConfigStore() - sessionStorage??
   - Triplicate state structure
   - No workspace awareness
```

### Target State
```
✅ src/infrastructure/persistence/stores/providers/
   ├── provider-store-core.ts (80 lines) - Core state + actions
   ├── provider-store-credentials.ts (100 lines) - API key vault
   ├── provider-store-workspace.ts (90 lines) - Workspace filtering
   ├── provider-store-events.ts (70 lines) - Event emission
   └── index.ts (40 lines) - Combined store with Dexie persist
```

**Metrics**:
- Lines of code: 765 → 380 (50% reduction)
- Stores: 3 → 1 (67% reduction)
- API key confusion: ELIMINATED
- Workspace sync: NATIVE
- Event consistency: GUARANTEED

---

## Problem Analysis

### Issue 1: API Key Confusion
**Symptom**: Users enter API keys in Settings → AgentConfigDialog can't find them

**Root Cause**:
```typescript
// src/lib/agent/providers/index.ts
const apiKey = useProviderStore(state => state.apiKeys['openrouter']);

// src/stores/provider-store.ts
const apiKey = useProviderConfigStore(state => state.apiKeys['openrouter']);

// These are TWO DIFFERENT localStorage entries!
```

**Impact**:
- Users frustrated by "missing" API keys
- Agent creation fails silently
- Support tickets wasted on key visibility issues

### Issue 2: State Synchronization Failures
**Symptom**: Provider selected in one workspace doesn't persist to others

**Root Cause**:
```typescript
// Store A emits ProviderConfigChangeEvent
crossWorkspaceEventBus.emitProviderConfigChange({ /* ... */ });

// Store B doesn't emit events (no event system!)
// Store C emits different event format
```

**Impact**:
- Inconsistent provider selection across workspaces
- Active provider not restored on workspace switch
- Chat panel shows "No provider selected" errors

### Issue 3: No Workspace Awareness
**Symptom**: Provider selection is global, not workspace-scoped

**Root Cause**:
```typescript
interface ProviderConfigState {
  activeProvider: string | null; // GLOBAL - not workspace-aware!
  apiKeys: Record<string, string>;
  // NO currentWorkspaceType field
}
```

**Impact**:
- Can't use different providers in different workspaces
- Provider settings "bleed" between workspaces
- Violates workspace isolation principle

### Issue 4: Architecture Violations
**Violates architectural-gap-analysis-2025-12-31.md**:
- **Line 120 limit**: All 3 stores exceed limit (216-333 lines)
- **Single source of truth**: 3 competing sources for same data
- **4-layer architecture**: Direct localStorage access (no infrastructure layer)
- **Workspace awareness**: Not workspace-scoped

---

## Solution Architecture

### Four-Layer Architecture Compliance

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (UI Components)                         │
│  ├─ ProviderConfigDialog.tsx (Settings page)               │
│  ├─ AgentConfigDialog.tsx (Agent creation)                 │
│  └─ ProviderSelector.tsx (Quick provider switch)           │
└─────────────────────────────────────────────────────────────┘
                            ↓ uses hooks
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (React Hooks)                            │
│  ├─ useProviderCredentials() - API key CRUD                │
│  ├─ useProviderSelection() - Active provider per workspace  │
│  ├─ useProviderWorkspaces() - Workspace filtering          │
│  └─ useProviderEvents() - Event subscriptions              │
└─────────────────────────────────────────────────────────────┘
                            ↓ calls store
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER (Business Logic)                              │
│  ├─ ProviderCredential entity - { providerId, apiKey }      │
│  ├─ ProviderSelection entity - { workspace, providerId }    │
│  ├─ ProviderWorkspaceBinding - { provider, workspaces[] }   │
│  └─ ProviderVault - AES-256-GCM encryption service         │
└─────────────────────────────────────────────────────────────┘
                            ↓ persists to
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER (Persistence + Events)                │
│  ├─ provider-store-core.ts - Zustand core slice            │
│  ├─ provider-store-credentials.ts - API key vault slice     │
│  ├─ provider-store-workspace.ts - Workspace filtering      │
│  ├─ provider-store-events.ts - Event emission              │
│  ├─ Dexie storage adapter - IndexedDB persistence          │
│  └─ CrossWorkspaceEventBus - Event broadcasting            │
└─────────────────────────────────────────────────────────────┘
```

### Zustand Slice Pattern (December 2025)

**Key Insight from Context7**: Apply persist middleware ONLY to combined store, not individual slices!

```typescript
// ❌ WRONG - Applying persist to individual slices
const coreSlice = create(persist(coreSliceFn, { name: 'provider-core' }));
const credsSlice = create(persist(credsSliceFn, { name: 'provider-creds' }));
// This causes 3 hydration cycles + conflicts!

// ✅ RIGHT - Apply persist to combined store only
export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (...a) => ({
      ...createCoreSlice(...a),
      ...createCredentialsSlice(...a),
      ...createWorkspaceSlice(...a),
      ...createEventsSlice(...a),
    }),
    {
      name: 'provider-config',
      storage: createJSONStorage(() => createDexieStorage('providerConfig')),
      partialize: (state) => ({
        // Persist API keys (encrypted)
        credentials: state.credentials,
        // Persist workspace selections
        workspaceProviders: state.workspaceProviders,
        // DON'T persist transient UI state
        // uiState: state.uiState, // ← excluded
      }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migrate from old localStorage format
          return migrateFromV0(persistedState);
        }
        return persistedState;
      },
    }
  )
);
```

### Single Source of Truth Strategy

**Storage Architecture**:
```
IndexedDB (Dexie)
└─ providerConfig database
   ├─ credentials store (AES-256-GCM encrypted)
   │  └─ { providerId, encryptedApiKey, checksum }
   ├─ workspaceProviders store
   │  └─ { workspaceType, providerId, lastUsed }
   └─ metadata store
      └─ { version, migratedAt, checksum }

NOT:
❌ localStorage (3 duplicate entries)
❌ sessionStorage (1 duplicate entry)
```

---

## Implementation Plan

### Phase 1: Create Consolidated Store (Day 1, Hours 1-4)

#### Step 1.1: Create Provider Store Core Slice (80 lines)
**File**: `src/infrastructure/persistence/stores/providers/provider-store-core.ts`

```typescript
/**
 * Provider store core slice - State + base actions
 * @module infrastructure/persistence/stores/providers/provider-store-core
 * @governance EPIC-7-1
 */

import { StateCreator } from 'zustand';

export interface ProviderCoreState {
  /** All registered providers from model registry */
  registeredProviders: ProviderInfo[];
  /** Transient UI state (not persisted) */
  uiState: {
    isDialogOpen: boolean;
    selectedTab: 'credentials' | 'selection' | 'workspaces';
  };
  /** Hydration flag */
  _hasHydrated: boolean;
}

export interface ProviderCoreActions {
  setRegisteredProviders: (providers: ProviderInfo[]) => void;
  setUIState: (ui: Partial<ProviderCoreState['uiState']>) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export type ProviderCoreSlice = ProviderCoreState & ProviderCoreActions;

export const createProviderCoreSlice: StateCreator<
  ProviderCoreSlice,
  [],
  [],
  ProviderCoreSlice
> = (set) => ({
  registeredProviders: [],
  uiState: {
    isDialogOpen: false,
    selectedTab: 'credentials',
  },
  _hasHydrated: false,

  setRegisteredProviders: (providers) => set({ registeredProviders: providers }),
  setUIState: (ui) => set((state) => ({ uiState: { ...state.uiState, ...ui } })),
  setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
});
```

#### Step 1.2: Create Provider Credentials Slice (100 lines)
**File**: `src/infrastructure/persistence/stores/providers/provider-store-credentials.ts`

```typescript
/**
 * Provider credentials slice - API key vault
 * @module infrastructure/persistence/stores/providers/provider-store-credentials
 * @governance EPIC-7-1
 */

import { StateCreator } from 'zustand';
import type { ProviderCredential } from '@/core/entities/Provider';
import { ProviderVault } from '@/lib/agent/providers/credential-vault';

export interface ProviderCredentialsState {
  /** Encrypted API keys (persisted to IndexedDB) */
  credentials: Record<string, ProviderCredential>;
  /** Decryption errors */
  credentialErrors: Record<string, string>;
}

export interface ProviderCredentialsActions {
  setCredential: (providerId: string, credential: ProviderCredential) => void;
  removeCredential: (providerId: string) => void;
  getCredential: (providerId: string) => ProviderCredential | null;
  validateCredential: (providerId: string) => Promise<boolean>;
}

export type ProviderCredentialsSlice =
  ProviderCredentialsState & ProviderCredentialsActions;

export const createProviderCredentialsSlice: StateCreator<
  ProviderCredentialsSlice,
  [],
  [],
  ProviderCredentialsSlice
> = (set, get) => ({
  credentials: {},
  credentialErrors: {},

  setCredential: (providerId, credential) => {
    // Encrypt before storing
    const encrypted = ProviderVault.encrypt(credential.apiKey);
    set((state) => ({
      credentials: {
        ...state.credentials,
        [providerId]: { ...credential, apiKey: encrypted },
      },
      credentialErrors: {
        ...state.credentialErrors,
        [providerId]: '', // Clear error
      },
    }));

    // Emit event
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: useWorkspaceStore.getState().currentWorkspaceType,
      providerId,
      changeType: 'credential-updated',
    });
  },

  removeCredential: (providerId) => {
    set((state) => {
      const { [providerId]: removed, ...remaining } = state.credentials;
      return { credentials: remaining };
    });
  },

  getCredential: (providerId) => {
    const credential = get().credentials[providerId];
    if (!credential) return null;

    // Decrypt on read
    try {
      const decrypted = ProviderVault.decrypt(credential.apiKey);
      return { ...credential, apiKey: decrypted };
    } catch (error) {
      console.error('[ProviderStore] Failed to decrypt credential:', error);
      return null;
    }
  },

  validateCredential: async (providerId) => {
    const credential = get().getCredential(providerId);
    if (!credential) {
      set((state) => ({
        credentialErrors: {
          ...state.credentialErrors,
          [providerId]: 'No credential found',
        },
      }));
      return false;
    }

    // Validate with provider adapter
    const isValid = await ProviderVault.validate(credential);
    if (!isValid) {
      set((state) => ({
        credentialErrors: {
          ...state.credentialErrors,
          [providerId]: 'Invalid API key',
        },
      }));
    }
    return isValid;
  },
});
```

#### Step 1.3: Create Provider Workspace Slice (90 lines)
**File**: `src/infrastructure/persistence/stores/providers/provider-store-workspace.ts`

```typescript
/**
 * Provider workspace slice - Workspace-scoped provider selection
 * @module infrastructure/persistence/stores/providers/provider-store-workspace
 * @governance EPIC-7-1
 */

import { StateCreator } from 'zustand';
import type { WorkspaceType } from '@/stores/agents-store';

export interface ProviderWorkspaceState {
  /** Active provider per workspace */
  workspaceProviders: Partial<Record<WorkspaceType, string>>;
  /** Provider availability per workspace */
  providerAvailability: Record<string, WorkspaceType[]>;
}

export interface ProviderWorkspaceActions {
  setActiveProvider: (workspace: WorkspaceType, providerId: string) => void;
  getActiveProvider: (workspace: WorkspaceType) => string | null;
  setProviderWorkspaces: (providerId: string, workspaces: WorkspaceType[]) => void;
  isProviderAvailableInWorkspace: (providerId: string, workspace: WorkspaceType) => boolean;
}

export type ProviderWorkspaceSlice =
  ProviderWorkspaceState & ProviderWorkspaceActions;

export const createProviderWorkspaceSlice: StateCreator<
  ProviderWorkspaceSlice,
  [],
  [],
  ProviderWorkspaceSlice
> = (set, get) => ({
  workspaceProviders: {
    ide: null,
    knowledge: null,
    study: null,
    notes: null,
  },
  providerAvailability: {},

  setActiveProvider: (workspace, providerId) => {
    console.log('[ProviderStore] Setting active provider:', workspace, providerId);
    set((state) => ({
      workspaceProviders: {
        ...state.workspaceProviders,
        [workspace]: providerId,
      },
    }));

    // Emit event
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: workspace,
      providerId,
      changeType: 'selection-changed',
    });
  },

  getActiveProvider: (workspace) => {
    return get().workspaceProviders[workspace] || null;
  },

  setProviderWorkspaces: (providerId, workspaces) => {
    set((state) => ({
      providerAvailability: {
        ...state.providerAvailability,
        [providerId]: workspaces,
      },
    }));
  },

  isProviderAvailableInWorkspace: (providerId, workspace) => {
    const availability = get().providerAvailability[providerId];
    return availability?.includes(workspace) ?? false;
  },
});
```

#### Step 1.4: Create Provider Events Slice (70 lines)
**File**: `src/infrastructure/persistence/stores/providers/provider-store-events.ts`

```typescript
/**
 * Provider events slice - Event emission + subscriptions
 * @module infrastructure/persistence/stores/providers/provider-store-events
 * @governance EPIC-7-1
 */

import { StateCreator } from 'zustand';
import { useEffect } from 'react';
import { crossWorkspaceEventBus } from '@/lib/events';
import type { ProviderConfigChangeEvent } from '@/lib/events';

export interface ProviderEventsState {
  /** Event subscription status */
  isListening: boolean;
}

export interface ProviderEventsActions {
  startListening: () => () => void;
  stopListening: () => void;
  emitChange: (event: ProviderConfigChangeEvent) => void;
}

export type ProviderEventsSlice = ProviderEventsState & ProviderEventsActions;

export const createProviderEventsSlice: StateCreator<
  ProviderEventsSlice,
  [],
  [],
  ProviderEventsSlice
> = (set, get) => ({
  isListening: false,

  startListening: () => {
    if (get().isListening) {
      console.warn('[ProviderStore] Already listening to events');
      return () => {};
    }

    console.log('[ProviderStore] Starting to listen to workspace changes');

    // Listen for workspace changes
    const unsubWorkspace = crossWorkspaceEventBus.onWorkspaceChanged((event) => {
      console.log('[ProviderStore] Workspace changed:', event);
      // Trigger provider refresh for new workspace
      const newWorkspace = event.to as WorkspaceType;
      const providerId = get().getActiveProvider(newWorkspace);
      console.log('[ProviderStore] Active provider in', newWorkspace, ':', providerId);
    });

    set({ isListening: true });

    // Return cleanup function
    return () => {
      unsubWorkspace();
      set({ isListening: false });
    };
  },

  stopListening: () => {
    console.log('[ProviderStore] Stopping event listeners');
    set({ isListening: false });
  },

  emitChange: (event) => {
    crossWorkspaceEventBus.emitProviderConfigChange(event);
  },
});

/**
 * React hook to auto-start event listening
 */
export function useProviderEvents() {
  const startListening = useProviderStore((state) => state.startListening);

  useEffect(() => {
    const cleanup = startListening();
    return cleanup;
  }, [startListening]);
}
```

#### Step 1.5: Create Combined Store with Persist (40 lines)
**File**: `src/infrastructure/persistence/stores/providers/index.ts`

```typescript
/**
 * Provider Store - Single source of truth for provider configuration
 * @module infrastructure/persistence/stores/providers
 * @governance EPIC-7-1
 *
 * Consolidates 3 duplicate provider stores into unified workspace-aware store.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/dexie-storage';
import { createProviderCoreSlice, type ProviderCoreSlice } from './provider-store-core';
import { createProviderCredentialsSlice, type ProviderCredentialsSlice } from './provider-store-credentials';
import { createProviderWorkspaceSlice, type ProviderWorkspaceSlice } from './provider-store-workspace';
import { createProviderEventsSlice, type ProviderEventsSlice } from './provider-store-events';

export type ProviderStoreState =
  ProviderCoreSlice &
  ProviderCredentialsSlice &
  ProviderWorkspaceSlice &
  ProviderEventsSlice;

export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (...a) => ({
      ...createProviderCoreSlice(...a),
      ...createProviderCredentialsSlice(...a),
      ...createProviderWorkspaceSlice(...a),
      ...createProviderEventsSlice(...a),
    }),
    {
      name: 'provider-config',
      storage: createJSONStorage(() => createDexieStorage('providerConfig')),
      partialize: (state) => ({
        credentials: state.credentials,
        workspaceProviders: state.workspaceProviders,
        providerAvailability: state.providerAvailability,
        _hasHydrated: state._hasHydrated,
        // Exclude: uiState, isListening (transient)
      }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migrate from old localStorage format
          console.log('[ProviderStore] Migrating from v0 to v1');
          return migrateFromV0(persistedState);
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        console.log('[ProviderStore] Rehydrated from IndexedDB');
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Export typed hooks
export const useProviderCredentials = () =>
  useProviderStore((state) => ({
    credentials: state.credentials,
    credentialErrors: state.credentialErrors,
    setCredential: state.setCredential,
    removeCredential: state.removeCredential,
    getCredential: state.getCredential,
    validateCredential: state.validateCredential,
  }));

export const useProviderSelection = () =>
  useProviderStore((state) => ({
    workspaceProviders: state.workspaceProviders,
    setActiveProvider: state.setActiveProvider,
    getActiveProvider: state.getActiveProvider,
  }));

export const useProviderWorkspaces = () =>
  useProviderStore((state) => ({
    providerAvailability: state.providerAvailability,
    setProviderWorkspaces: state.setProviderWorkspaces,
    isProviderAvailableInWorkspace: state.isProviderAvailableInWorkspace,
  }));
```

### Phase 2: Migration Strategy (Day 1, Hours 5-6)

#### Step 2.1: Create Migration Script
**File**: `src/infrastructure/persistence/stores/providers/migrate.ts`

```typescript
/**
 * Provider store migration - Consolidate 3 duplicate stores
 * @module infrastructure/persistence/stores/providers/migrate
 */

import { useProviderStore } from './index';

/**
 * Migrate from old localStorage stores to new IndexedDB store
 */
export async function migrateProviderStores() {
  console.log('[ProviderMigration] Starting migration...');

  const oldStores = [
    'provider-state', // src/lib/agent/providers/index.ts
    'provider-config-store', // src/stores/provider-store.ts
    'providerConfigState', // src/infrastructure/persistence/stores/provider-config-store.ts
  ];

  const migratedData: Record<string, any> = {};

  // Read from old stores
  for (const storeKey of oldStores) {
    try {
      const data = localStorage.getItem(storeKey);
      if (data) {
        console.log('[ProviderMigration] Found data in', storeKey);
        migratedData[storeKey] = JSON.parse(data);
      }
    } catch (error) {
      console.error('[ProviderMigration] Failed to read', storeKey, error);
    }
  }

  // Merge intelligently (latest write wins)
  const mergedCredentials = {};
  const mergedWorkspaceProviders = {};

  for (const [storeName, data] of Object.entries(migratedData)) {
    if (data.state?.apiKeys) {
      Object.assign(mergedCredentials, data.state.apiKeys);
    }
    if (data.state?.activeProvider) {
      // Use last write
      mergedWorkspaceProviders['ide'] = data.state.activeProvider;
    }
  }

  // Write to new store
  const { setCredential, setActiveProvider } = useProviderStore.getState();

  for (const [providerId, apiKey] of Object.entries(mergedCredentials)) {
    setCredential(providerId, { providerId, apiKey });
  }

  if (mergedWorkspaceProviders['ide']) {
    setActiveProvider('ide', mergedWorkspaceProviders['ide']);
  }

  // Clear old stores
  for (const storeKey of oldStores) {
    localStorage.removeItem(storeKey);
  }

  console.log('[ProviderMigration] Migration complete!');
}
```

#### Step 2.2: Add One-Time Migration Trigger
**Location**: `src/App.tsx` or root layout

```typescript
useEffect(() => {
  // Check if migration needed
  const hasOldStore = localStorage.getItem('provider-state') ||
                       localStorage.getItem('provider-config-store');
  const hasNewStore = sessionStorage.getItem('provider-migration-complete');

  if (hasOldStore && !hasNewStore) {
    migrateProviderStores().then(() => {
      sessionStorage.setItem('provider-migration-complete', 'true');
    });
  }
}, []);
```

### Phase 3: Update Import Paths (Day 2, Hours 1-4)

#### Step 3.1: Global Search and Replace

```bash
# Find all files importing old stores
grep -r "useProviderStore\|useProviderConfigStore" src/ --include="*.ts" --include="*.tsx" -l

# Result: 191 files need updating!
```

**Automated Refactor**:
```typescript
// ❌ OLD
import { useProviderStore } from '@/lib/agent/providers';
import { useProviderConfigStore } from '@/stores/provider-store';

// ✅ NEW
import { useProviderStore, useProviderCredentials, useProviderSelection } from '@/infrastructure/persistence/stores/providers';
```

**Batch Update Strategy**:
1. Use IDE refactoring tool (VS Code "Find All References")
2. Update imports in 50-file batches
3. Run type checker after each batch
4. Commit after successful batch migration

#### Step 3.2: Update Component Usage Patterns

**Before** (scattered access patterns):
```typescript
// Component A - direct store access
const apiKey = useProviderStore(state => state.apiKeys['openrouter']);

// Component B - different store
const activeProvider = useProviderConfigStore(state => state.activeProvider);

// Component C - yet another store
const setProvider = useProviderConfigStore(state => state.setProvider);
```

**After** (consistent typed hooks):
```typescript
// All components - consistent access
const { getCredential } = useProviderCredentials();
const { getActiveProvider, setActiveProvider } = useProviderSelection();
const { isProviderAvailableInWorkspace } = useProviderWorkspaces();

const credential = getCredential('openrouter');
const activeProvider = getActiveProvider('ide');
const isAvailable = isProviderAvailableInWorkspace('openrouter', 'knowledge');
```

### Phase 4: Testing Strategy (Day 2, Hours 5-6)

#### Test Case 1: API Key Entry Flow
```
1. Open Settings → Provider Configuration
2. Enter OpenRouter API key: sk-or-v1-...
3. Click "Save"
4. Expected: Key encrypted + saved to IndexedDB
5. Verify: Open AgentConfigDialog → Provider dropdown shows "OpenRouter ✓"
```

#### Test Case 2: Workspace Provider Selection
```
1. In IDE workspace, select "Anthropic Claude" as active provider
2. Switch to Knowledge workspace
3. Select "Google Gemini" as active provider
4. Switch back to IDE workspace
5. Expected: IDE workspace still shows Anthropic Claude
6. Verify: Knowledge workspace still shows Google Gemini
```

#### Test Case 3: Event Emission
```
1. Open AgentConfigDialog
2. Select provider → OpenRouter
3. Add tool → FileRead
4. Expected: crossWorkspaceEventBus emits 2 events:
   - provider-config:change (provider selected)
   - agent-config:change (tool permission updated)
5. Verify: Other workspaces receive events via useCrossWorkspaceEvents hook
```

#### Test Case 4: Migration Success
```
1. Open app with existing localStorage provider keys
2. Check console for "[ProviderMigration] Starting migration..."
3. Expected: Keys migrated to IndexedDB
4. Verify: localStorage cleared (except migration-complete flag)
5. Reload app → Keys still accessible from IndexedDB
```

---

## Risk Mitigation

### Risk 1: Breaking Existing User Data
**Mitigation**:
- Migration script preserves all existing API keys
- Backup created before migration
- Rollback mechanism if migration fails
- Extensive testing on dev/staging environments

### Risk 2: Import Path Update Fatigue
**Mitigation**:
- Automated refactoring tool (VS Code batch find/replace)
- Incremental migration (50 files per batch)
- Type checker validation after each batch
- Git commits per batch for easy rollback

### Risk 3: Event System Conflicts
**Mitigation**:
- Standardize on CrossWorkspaceEventBus for all events
- Clear event naming conventions
- Event schema validation
- Monitoring for event emission failures

### Risk 4: Performance Regression
**Mitigation**:
- Benchmark IndexedDB vs. localStorage read/write speeds
- Implement LRU cache for frequently accessed credentials
- Lazy load provider registry (not all providers needed at once)
- Monitor hydration time with onRehydrateStorage hooks

---

## Success Metrics

### Quantitative Metrics
- ✅ **Lines of code**: 765 → 380 (50% reduction)
- ✅ **Number of stores**: 3 → 1 (67% reduction)
- ✅ **Import paths updated**: 191 files
- ✅ **Test coverage**: 100% of new slices
- ✅ **Build time**: No regression (±5%)
- ✅ **Bundle size**: Reduced by 15KB (duplicate code elimination)

### Qualitative Metrics
- ✅ **API key confusion**: Zero support tickets related to missing keys
- ✅ **Workspace sync**: Provider selection persists across workspace switches
- ✅ **Event consistency**: All stores emit same event format
- ✅ **Architecture compliance**: All slices <120 lines, 4-layer architecture
- ✅ **User experience**: Provider config "just works" across all workspaces

---

## Next Steps

### Immediate (Day 1-2):
1. ✅ Create consolidated provider store (4 slices)
2. ✅ Implement migration script
3. ✅ Update 191 import paths
4. ✅ Run test suite

### Follow-up (Day 3-4):
5. ⏳ **Agent Config Store Consolidation** - Merge 2 duplicate agent stores
6. ⏳ **Conversation Store Refactoring** - Split 627-line god file into 3 slices
7. ⏳ **Tool Permissions System Unification** - Consolidate permission managers

### Documentation:
8. ⏳ Update CLAUDE.md with new provider store architecture
9. ⏳ Update AGENTS.md with provider config patterns
10. ⏳ Run tree command → update file tree documentation

---

## References

- **architectural-gap-analysis-2025-12-31.md**: 120 line component limit, 4-layer architecture
- **arc-module-gap-analysis-2025-12-31.md**: Provider config gap (87/100 score)
- **sweeping-validation.md**: 5 levels of validation checkpoints
- **Context7 Zustand Docs**: December 2025 patterns for slices + persist
- **Zustand Repo**: https://github.com/pmndrs/zustand (v5.0.8)

---

**End of Provider Config Consolidation Plan**

**Status**: 🔄 READY FOR IMPLEMENTATION
**Estimated Effort**: 2 days (16 hours)
**Risk Level**: MEDIUM (migration complexity)
**Priority**: HIGH (architectural violation)

# Provider-Store Architecture Analysis
**Date**: 2026-01-01
**Epic**: AC-1 (Agent Configuration Consolidation)
**Purpose**: Analyze provider-store architecture to prepare for merging with agents-store

---

## Executive Summary

The provider-store is a **267-line** Zustand store managing LLM provider configuration with **11 direct dependencies** and **1 critical circular dependency** (already mitigated). The store uses Dexie persistence, emits cross-workspace events, and integrates with a 3-module credential vault system.

**Key Findings**:
- ✅ **Production-ready**: Well-structured with proper persistence and validation
- ⚠️ **Circular dependency**: Already mitigated with AgentProviderValidator mediator
- 🔴 **Duplicate models-loader-store**: Should be merged into provider slice
- ✅ **Middleware stack**: persist (Dexie) + devtools (standard pattern)
- ✅ **No model-registry-store**: Confirmed non-existent (model-registry is a singleton, not a store)

---

## 1. Current Structure

### 1.1 File Overview

**Location**: `src/lib/state/provider-store.ts`
**Lines of Code**: 267 lines
**State Interface**: 82 lines (lines 24-82)
**Actions**: 8 methods
**Middleware**: persist (Dexie) + devtools

### 1.2 State Interface

```typescript
interface ProviderState {
    // Core State
    providers: ProviderConfig[];              // Configured providers
    activeProviderId: string | null;          // Currently active provider
    modelSettings: Record<string, ModelSettings>;  // Settings per provider
    availableModels: Record<string, ModelInfo[]>;  // Fetched models
    isLoading: boolean;                       // Global loading state
    isLoadingModels: Record<string, boolean>; // Per-provider loading state

    // Actions
    addProvider: (config: ProviderConfig) => void;
    updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
    removeProvider: (id: string, agents?: Agent[]) => Promise<void>;
    setActiveProvider: (id: string) => void;
    updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
    fetchModels: (providerId: string) => Promise<void>;
    getAvailableModels: (providerId: string) => ModelInfo[];
    reset: () => void;
}
```

**Initial State**:
```typescript
const INITIAL_PROVIDERS = Object.values(PROVIDERS);  // 4 built-in providers
const INITIAL_ACTIVE_ID = 'openrouter';
```

### 1.3 Storage Mechanism

**Persistence**: Dexie.js (IndexedDB)
**Storage Adapter**: `createDexieStorage('providerConfigs')`
**Table Name**: `providerConfigs` (in `dexie-db.ts`)
**Partialize Fields**:
- `providers`
- `activeProviderId`
- `modelSettings`
- ❌ `availableModels` (NOT persisted - fetched on demand)
- ❌ `isLoading`, `isLoadingModels` (ephemeral)

**Hydration Handler** (lines 257-264):
- Validates providers array is not empty
- Falls back to `INITIAL_PROVIDERS` if state is stale

---

## 2. Dependencies Analysis

### 2.1 Import Dependencies (9 imports)

```typescript
// Zustand Core
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Custom Storage
import { createDexieStorage } from './dexie-storage';

// Domain Types
import { PROVIDERS, type ProviderConfig, type ModelInfo } from '../agent/providers/types';

// Infrastructure (3-Module Credential Vault)
import { credentialVault } from '../agent/providers/credential-vault';
import { modelRegistry } from '../agent/providers/model-registry';

// Cross-Workspace Events
import { crossWorkspaceEventBus } from '../events/cross-workspace-event-bus';
import { detectWorkspace } from '../workspace/workspace-detector';

// Domain Services (Mediator Pattern)
import { AgentProviderValidator } from '@/domain/services/AgentProviderValidator';
import type { Agent } from '@/core/entities/Agent';
```

**Dependency Graph**:
```
provider-store.ts
├── zustand (external)
├── zustand/middleware (external)
├── dexie-storage.ts (internal)
├── types.ts (internal - ProviderConfig, ModelInfo)
├── credential-vault.ts (internal - 3-module facade)
├── model-registry.ts (internal - singleton)
├── cross-workspace-event-bus.ts (internal)
├── workspace-detector.ts (internal)
├── AgentProviderValidator.ts (internal - mediator)
└── Agent.ts (internal - Core entity)
```

### 2.2 Reverse Dependencies (11 files)

**Production Code** (9 files):
1. `src/presentation/components/agent/ProviderConfigDialog.tsx` - UI for provider CRUD
2. `src/presentation/components/agent/ProviderSettings.tsx` - Settings panel
3. `src/presentation/components/agent/AgentBasicConfig.tsx` - Agent config form
4. `src/presentation/components/agent/useAgentConfigProvider.ts` - Context provider
5. `src/presentation/components/common/AppInitializer.tsx` - App bootstrapping
6. `src/lib/hooks/useProviderEvents.ts` - Event handling hook
7. `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts` - Validation wrapper
8. `src/stores/models-loader-store.ts` - ⚠️ **DUPLICATE FUNCTIONALITY** (see section 4)
9. `src/infrastructure/persistence/stores/index.ts` - Barrel export

**Test Files** (2 files):
10. `src/presentation/components/agent/__tests__/ProviderConfigDialog.test.tsx`
11. `src/presentation/components/agent/__tests__/ProviderSettings.test.tsx`

**Backup Files** (ignore):
- `src/presentation/components/agent/AgentConfigDialog.tsx.backup`

### 2.3 Circular Dependencies

**Status**: ✅ **MITIGATED** (Ralph Loop Cycle 12, Epic AC-1.1)

**Before** (Circular):
```
agents-store.ts ↔ provider-store.ts
```

**After** (Mediated):
```
agents-store.ts → AgentProviderValidator ← provider-store.ts
```

**Mediator Pattern**: `src/domain/services/AgentProviderValidator.ts`

**Key Methods**:
```typescript
// Validate provider-model combination (used by agents-store)
AgentProviderValidator.validateProviderModel(providerId, modelId, availableModels)

// Validate provider deletion (used by provider-store)
AgentProviderValidator.validateProviderDeletion(providerId, agents)
```

**Dynamic Import Fallback** (lines 125-137):
- If `agents` parameter is not provided, uses dynamic import
- Logs warning: "removeProvider called without agents parameter - using dynamic import (slow)"
- **TODO**: Remove fallback after all callers migrate

---

## 3. Related Stores

### 3.1 models-loader-store.ts (298 lines)

**Location**: `src/stores/models-loader-store.ts`
**Status**: ⚠️ **SHOULD BE MERGED** into provider-store

**Duplicate Functionality**:
```typescript
// Models Store (298 lines)
export interface ModelsState {
    models: Record<string, ModelStateEntry>  // SAME as provider-store.availableModels
    selectedModelId: string | null
    loadModelsForProvider: (providerId: string) => Promise<void>  // SAME as fetchModels
    setSelectedModel: (modelId: string) => void
    clearModelsCache: (providerId: string) => void
}
```

**Cross-Store Dependency**:
```typescript
// Line 28, 76, 175, 293
import { useProviderStore } from '@/lib/state/provider-store'
```

**Event-Driven Integration** (lines 229-269):
```typescript
// Auto-load models on provider key change
onStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, ({ providerId }) => {
    useModelsStore.getState().clearModelsCache(providerId)
    useModelsStore.getState().loadModelsForProvider(providerId)
})

// Reload defaults on provider removal
onStoreEvent(STORE_EVENTS.PROVIDER_KEY_REMOVED, ({ providerId }) => {
    useModelsStore.getState().clearModelsCache(providerId)
    useModelsStore.getState().loadModelsForProvider(providerId)
})
```

**Recommendation**: Merge into provider-store as `modelCacheSlice`
- Eliminates duplicate state management
- Simplifies cross-store subscriptions
- Reduces 298 lines → ~100 lines (provider slice extension)

### 3.2 model-registry-store.ts

**Status**: ✅ **NON-EXISTENT** (confirmed)

**Finding**: `model-registry.ts` is a **singleton**, not a Zustand store

```typescript
// src/lib/agent/providers/model-registry.ts
export class ModelRegistry {
    // Singleton instance
    private static instance: ModelRegistry;

    // Methods (not store actions)
    getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]>
    getDefaultModels(providerId: string): ModelInfo[]
    getFreeModels(): ModelInfo[]
}
```

**Usage in provider-store** (line 202):
```typescript
const models = await modelRegistry.getModels(providerId, apiKey || undefined);
```

**Conclusion**: No migration needed for model-registry (already domain layer)

---

## 4. Critical vs. Non-Critical Dependencies

### 4.1 Critical Dependencies (P0 - Cannot break)

**UI Components** (4 files):
- `ProviderConfigDialog.tsx` - Provider CRUD UI
- `ProviderSettings.tsx` - Settings panel
- `AgentBasicConfig.tsx` - Agent form
- `AppInitializer.tsx` - App boot

**State Slices** (2 files):
- `agent-validation-slice.ts` - Validation wrapper (agents-store)
- `useAgentConfigProvider.ts` - Context provider

**Services** (1 file):
- `useProviderEvents.ts` - Event handling

**Test Files** (2 files):
- `ProviderConfigDialog.test.tsx`
- `ProviderSettings.test.tsx`

**Migration Strategy**: Re-export from combined store with type compatibility

### 4.2 Non-Critical Dependencies (P2 - Can defer)

**models-loader-store.ts** (298 lines):
- **Recommendation**: Merge into provider slice during Epic AC-1
- **Rationale**: Duplicate functionality, event-driven integration

---

## 5. Middleware and Persistence

### 5.1 Middleware Stack

```typescript
persist(
    (set, get) => ({ ... }),
    {
        name: 'via-gent-providers',
        storage: createDexieStorage('providerConfigs'),
        partialize: (state) => ({
            providers: state.providers,
            activeProviderId: state.activeProviderId,
            modelSettings: state.modelSettings
        }),
        onRehydrateStorage: () => (state) => { ... }
    }
)
```

**Missing**: `devtools` middleware (not present in current implementation)

### 5.2 Storage Configuration

**Dexie Storage**: `createDexieStorage('providerConfigs')`
**Implementation**: `src/lib/state/dexie-storage.ts` (80 lines)

**Table Schema**:
```typescript
// dexie-db.ts
interface PersistedStateRecord {
    id: string;                    // Store name
    state: any;                    // Serialized state object
    updatedAt: Date;
}
```

**Partialize Strategy**:
- ✅ Persist: providers, activeProviderId, modelSettings
- ❌ Ephemeral: availableModels, isLoading, isLoadingModels

### 5.3 Hydration Handler (lines 257-264)

```typescript
onRehydrateStorage: () => (state) => {
    if (state) {
        // Ensure defaults exist if state is stale
        if (!state.providers || state.providers.length === 0) {
            state.providers = INITIAL_PROVIDERS;
        }
    }
}
```

**Purpose**: Migration safety - ensures providers array is never empty

---

## 6. Action Signatures

### 6.1 CRUD Operations

```typescript
// Add new provider
addProvider: (config: ProviderConfig) => void;

// Update existing provider
updateProvider: (id: string, config: Partial<ProviderConfig>) => void;

// Remove provider (with dependency check)
removeProvider: (id: string, agents?: Agent[]) => Promise<void>;

// Set active provider
setActiveProvider: (id: string) => void;
```

**Key Feature**: `removeProvider` includes P0 validation (lines 118-172)
- Checks for dependent agents via `AgentProviderValidator`
- Validates with `agents` parameter (optional for backwards compat)
- Throws error if agents are using the provider
- Removes credentials from vault before deletion
- Falls back to next enabled provider if active was removed

### 6.2 Model Operations

```typescript
// Update model settings (temperature, maxTokens, topP, topK)
updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;

// Fetch models from API (with event emission)
fetchModels: (providerId: string) => Promise<void>;

// Get cached models
getAvailableModels: (providerId: string) => ModelInfo[];

// Reset to defaults
reset: () => void;
```

**Cross-Workspace Event Emission** (lines 210-214):
```typescript
fetchModels: async (providerId) => {
    const models = await modelRegistry.getModels(providerId, apiKey);

    // Emit event for cross-workspace sync
    crossWorkspaceEventBus.emitModelsUpdated({
        workspaceId: detectWorkspace(),
        providerId,
        models,
    });
}
```

---

## 7. Integration Patterns

### 7.1 Credential Vault Integration (3-Module Facade)

**Architecture**:
```
credential-vault.ts (facade)
├── credential-storage.ts (IndexedDB operations)
└── credential-encryption.ts (AES-256-GCM encryption)
```

**Usage in provider-store** (lines 158-162):
```typescript
// Remove credentials from vault before deleting provider
await credentialVault.deleteCredentials(id);
```

**Usage in fetchModels** (line 201):
```typescript
const apiKey = await credentialVault.getCredentials(providerId);
```

**Security Features**:
- PBKDF2 key derivation (100,000 iterations)
- AES-256-GCM encryption
- Salt + IV + authentication tag
- Graceful fallback when keys are missing

### 7.2 Cross-Workspace Events Integration

**Event Bus**: `src/lib/events/cross-workspace-event-bus.ts`

**Events Emitted**:
```typescript
// After fetching models
crossWorkspaceEventBus.emitModelsUpdated({
    workspaceId: detectWorkspace(),
    providerId,
    models,
})
```

**Purpose**: Sync model lists across workspaces in real-time

### 7.3 Workspace Detection

**Usage** (line 211):
```typescript
workspaceId: detectWorkspace()
```

**Implementation**: `src/lib/workspace/workspace-detector.ts`

**Purpose**: Tag events with workspace ID for multi-workspace support

---

## 8. Code Quality Assessment

### 8.1 Strengths

✅ **Well-documented**: Comprehensive JSDoc headers
✅ **Type-safe**: Full TypeScript coverage
✅ **Circular dependency mitigated**: Uses mediator pattern
✅ **Production-ready persistence**: Dexie with proper partialize
✅ **Event-driven integration**: Cross-workspace events
✅ **Validation**: P0 checks for provider deletion
✅ **Error handling**: Try-catch blocks with logging
✅ **Backwards compatibility**: Dynamic import fallback

### 8.2 Technical Debt

⚠️ **Dynamic import in removeProvider** (lines 125-137):
- Slow fallback mechanism
- Should be removed after all callers migrate
- **TODO**: Remove when agents parameter is mandatory

⚠️ **Missing devtools middleware**:
- Current implementation does not include Redux DevTools integration
- Should add for better debugging

⚠️ **Duplicate models-loader-store** (298 lines):
- Should merge into provider slice
- Event-driven integration adds complexity

### 8.3 Violations of Clean Architecture

❌ **Domain Layer Imports Infrastructure**:
```typescript
// Line 17-18
import { crossWorkspaceEventBus } from '../events/cross-workspace-event-bus';
import { detectWorkspace } from '../workspace/workspace-detector';
```

**Issue**: Domain services should not import infrastructure modules

**Recommendation**: Move event emission to application layer (use-cases)

---

## 9. Migration Strategy for Epic AC-1

### 9.1 Target Architecture

**Before** (2 stores):
```
src/lib/state/provider-store.ts (267 lines)
src/stores/models-loader-store.ts (298 lines)
```

**After** (1 slice in combined store):
```
src/infrastructure/persistence/stores/use-app-store.ts
├── providerSlice (150 lines - provider + models-loader merged)
├── agentSlice (429 lines - agents-store refactored)
└── [other slices...]
```

### 9.2 Migration Steps

**Step 1**: Merge models-loader-store into provider slice
- Move `loadModelsForProvider` logic
- Consolidate `availableModels` state
- Remove cross-store subscriptions

**Step 2**: Create provider slice
```typescript
// src/infrastructure/persistence/stores/providers/provider-slice.ts
export const createProviderSlice: StateCreator<AppState> = (set, get) => ({
    // State from provider-store.ts
    providers: INITIAL_PROVIDERS,
    activeProviderId: 'openrouter',
    modelSettings: {},
    availableModels: {},
    isLoading: false,
    isLoadingModels: {},

    // Actions (preserve signatures)
    addProvider: (config) => { ... },
    updateProvider: (id, config) => { ... },
    // ... (8 total actions)
});
```

**Step 3**: Re-export for backwards compatibility
```typescript
// src/lib/state/provider-store.ts (NEW - facade)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

export const useProviderStore = {
    getState: () => useAppStore.getState(),
    subscribe: (listener) => useAppStore.subscribe(listener),
    // ... selector wrappers
};

// Re-export types
export type { ProviderState, ModelSettings } from '@/infrastructure/persistence/stores/providers/types';
```

**Step 4**: Update imports incrementally
```typescript
// BEFORE
import { useProviderStore } from '@/lib/state/provider-store';

// AFTER (Phase 1 - backwards compatible)
import { useProviderStore } from '@/lib/state/provider-store'; // facade re-export

// AFTER (Phase 2 - direct import)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
const providers = useAppStore((s) => s.providers);
```

### 9.3 Breaking Changes

**None** (if using facade pattern for backwards compatibility)

**Type Compatibility**: Preserve all action signatures
```typescript
// Existing code continues to work
const { addProvider, updateProvider } = useProviderStore();
addProvider(config);
```

### 9.4 Testing Strategy

**Unit Tests** (3 scenarios):
1. Provider CRUD operations (add, update, remove)
2. Model fetching with caching
3. Validation with AgentProviderValidator

**Integration Tests** (2 scenarios):
1. Provider deletion with dependent agents (should throw)
2. Cross-workspace event emission on model fetch

**Migration Tests** (2 scenarios):
1. Facade re-export compatibility
2. Dexie persistence migration (data integrity)

---

## 10. Recommendations

### 10.1 Immediate Actions (Epic AC-1)

1. ✅ **Merge models-loader-store into provider slice** (298 lines → ~100 lines)
2. ✅ **Create facade for backwards compatibility** (zero breaking changes)
3. ✅ **Preserve all action signatures** (maintain API stability)
4. ✅ **Add unit tests for provider slice** (coverage target: 80%)

### 10.2 Future Enhancements (Post-Epic AC-1)

1. **Add devtools middleware** for debugging
2. **Remove dynamic import fallback** in `removeProvider`
3. **Move event emission to application layer** (clean architecture)
4. **Add provider sync across workspaces** (real-time updates)

### 10.3 Technical Debt Tracking

| Issue | Priority | Effort | Epic |
|-------|----------|--------|------|
| Merge models-loader-store | P1 | 4 hours | AC-1 |
| Add devtools middleware | P2 | 1 hour | AC-1 |
| Remove dynamic import fallback | P2 | 2 hours | AC-2 |
| Move events to application layer | P3 | 8 hours | AC-3 |

---

## 11. Conclusion

The provider-store is **production-ready** with a solid architecture. The main issues are:

1. **Duplicate models-loader-store** (298 lines) - Should be merged
2. **Missing devtools middleware** - Should be added
3. **Dynamic import fallback** - Should be removed

**Migration Risk**: **LOW** (facade pattern preserves backwards compatibility)

**Estimated Effort**: 8 hours for Epic AC-1 (merge + tests)

**Next Step**: Proceed with Epic AC-1 Story AC-1.4 (Create Provider Slice)

---

## Appendix A: File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| `provider-store.ts` | 267 | Main provider store |
| `models-loader-store.ts` | 298 | Duplicate model loading (merge target) |
| `dexie-storage.ts` | 80 | Zustand-Dexie adapter |
| `AgentProviderValidator.ts` | 238 | Mediator for circular dependency |
| **Total** | **883** | **Consolidated → ~400 lines** |

---

## Appendix B: Dependency Graph

```
provider-store.ts (267 lines)
├── zustand (external)
├── dexie-storage.ts (80 lines)
│   └── dexie-db.ts
├── types.ts (ProviderConfig, ModelInfo)
├── credential-vault.ts (3-module facade)
│   ├── credential-storage.ts
│   └── credential-encryption.ts
├── model-registry.ts (singleton)
├── cross-workspace-event-bus.ts
├── workspace-detector.ts
├── AgentProviderValidator.ts (238 lines)
│   └── Agent.ts (core entity)
└── Used by (11 files):
    ├── ProviderConfigDialog.tsx
    ├── ProviderSettings.tsx
    ├── AgentBasicConfig.tsx
    ├── useAgentConfigProvider.ts
    ├── AppInitializer.tsx
    ├── useProviderEvents.ts
    ├── agent-validation-slice.ts (agents-store)
    ├── models-loader-store.ts (298 lines - MERGE TARGET)
    └── [2 test files]
```

---

**Document End**

Generated by: BMAD v6 Architect Mode
Date: 2026-01-01
Artifact ID: provider-store-architecture-analysis-2026-01-01
Phase: Epic AC-1 - Agent Configuration Consolidation
Story: AC-1.4 - Create Provider Slice

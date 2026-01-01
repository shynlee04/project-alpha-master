# Provider-Store Dependency Diagram
**Visual Architecture Analysis**

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROVIDER-STORE.TS (267 lines)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ State:                                                                      │
│   - providers: ProviderConfig[]                                             │
│   - activeProviderId: string | null                                         │
│   - modelSettings: Record<string, ModelSettings>                            │
│   - availableModels: Record<string, ModelInfo[]>                            │
│   - isLoading: boolean                                                      │
│   - isLoadingModels: Record<string, boolean>                                │
│                                                                             │
│ Actions (8):                                                                │
│   - addProvider()                                                           │
│   - updateProvider()                                                        │
│   - removeProvider() ← P0 VALIDATION (AgentProviderValidator)               │
│   - setActiveProvider()                                                     │
│   - updateModelSettings()                                                   │
│   - fetchModels() ← EMIT CROSS-WORKSPACE EVENTS                             │
│   - getAvailableModels()                                                    │
│   - reset()                                                                 │
│                                                                             │
│ Middleware:                                                                 │
│   - persist (Dexie storage)                                                 │
│   - onRehydrateStorage (migration safety)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Imports (9 dependencies)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPENDENCY LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ZUSTAND (External)                                                │   │
│  │  - create                                                          │   │
│  │  - persist, createJSONStorage (middleware)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CUSTOM STORAGE (Internal)                                         │   │
│  │  dexie-storage.ts → dexie-db.ts                                    │   │
│  │  - createDexieStorage('providerConfigs')                           │   │
│  │  - getItem, setItem, removeItem (IndexedDB operations)             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DOMAIN TYPES (Internal)                                           │   │
│  │  types.ts                                                           │   │
│  │  - ProviderConfig                                                   │   │
│  │  - ModelInfo                                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  3-MODULE CREDENTIAL VAULT (Internal)                               │   │
│  │  credential-vault.ts (facade)                                       │   │
│  │  ├─ credential-storage.ts (IndexedDB)                               │   │
│  │  └─ credential-encryption.ts (AES-256-GCM)                          │   │
│  │                                                                     │   │
│  │  Methods:                                                           │   │
│  │  - getCredentials(providerId)                                       │   │
│  │  - storeCredentials(providerId, apiKey)                             │   │
│  │  - deleteCredentials(providerId) ← used in removeProvider()         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MODEL REGISTRY (Internal - Singleton, NOT a store)                 │   │
│  │  model-registry.ts                                                  │   │
│  │  - getModels(providerId, apiKey) ← used in fetchModels()            │   │
│  │  - getDefaultModels(providerId)                                     │   │
│  │  - getFreeModels()                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CROSS-WORKSPACE EVENTS (Internal)                                  │   │
│  │  cross-workspace-event-bus.ts                                       │   │
│  │  - emitModelsUpdated() ← called after fetchModels()                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WORKSPACE DETECTOR (Internal)                                      │   │
│  │  workspace-detector.ts                                              │   │
│  │  - detectWorkspace() ← tags events with workspace ID                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MEDIATOR PATTERN (Domain Service)                                  │   │
│  │  AgentProviderValidator.ts (238 lines)                              │   │
│  │                                                                     │   │
│  │  BREAKS CIRCULAR DEPENDENCY:                                        │   │
│  │  agents-store.ts → AgentProviderValidator ← provider-store.ts       │   │
│  │                                                                     │   │
│  │  Methods:                                                           │   │
│  │  - validateProviderModel(providerId, modelId, availableModels)      │   │
│  │    ↓ Used by agents-store (agent-validation-slice.ts)              │   │
│  │  - validateProviderDeletion(providerId, agents)                     │   │
│  │    ↓ Used by provider-store (removeProvider action)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CORE ENTITY (Domain Layer)                                         │   │
│  │  Agent.ts                                                           │   │
│  │  - Used by AgentProviderValidator.validateProviderDeletion()        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Reverse Dependencies (Who Uses Provider-Store?)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CONSUMERS OF PROVIDER-STORE (11 files)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CRITICAL (P0) - 7 Files                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  UI COMPONENTS (3 files)                                            │   │
│  │  ├─ ProviderConfigDialog.tsx → addProvider, updateProvider,          │   │
│  │  │                                 fetchModels                      │   │
│  │  ├─ ProviderSettings.tsx       → providers, activeProviderId,        │   │
│  │  │                                 removeProvider                   │   │
│  │  └─ AgentBasicConfig.tsx       → providers, activeProviderId         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STATE/CONTEXT (2 files)                                            │   │
│  │  ├─ useAgentConfigProvider.ts   → Provider configuration context    │   │
│  │  └─ agent-validation-slice.ts   → availableModels (validation)      │   │
│  │                                    (part of agents-store)            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  INITIALIZATION (1 file)                                            │   │
│  │  └─ AppInitializer.tsx          → Bootstraps provider store         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SERVICES (1 file)                                                 │   │
│  │  └─ useProviderEvents.ts        → Provider event handling           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  NON-CRITICAL (P2) - 1 File                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DUPLICATE STORE (MERGE TARGET)                                     │   │
│  │  models-loader-store.ts (298 lines)                                 │   │
│  │                                                                     │   │
│  │  DUPLICATE FUNCTIONALITY:                                           │   │
│  │  - models: Record<string, ModelStateEntry>                          │   │
│  │    SAME AS → availableModels (provider-store)                       │   │
│  │  - loadModelsForProvider(providerId)                                │   │
│  │    SAME AS → fetchModels(providerId) (provider-store)               │   │
│  │                                                                     │   │
│  │  CROSS-STORE DEPENDENCY:                                            │   │
│  │  Line 28, 76, 175, 293: import { useProviderStore }                 │   │
│  │  Line 76: useProviderStore.getState().providers.find(...)           │   │
│  │  Line 175: useProviderStore.getState().activeProviderId             │   │
│  │  Line 293: useProviderStore(s => s.activeProviderId)                │   │
│  │                                                                     │   │
│  │  EVENT-DRIVEN INTEGRATION:                                          │   │
│  │  - Subscribes to PROVIDER_KEY_SET → reloads models                  │   │
│  │  - Subscribes to PROVIDER_KEY_REMOVED → reloads defaults            │   │
│  │  - Subscribes to PROVIDER_SELECTED → auto-load if needed            │   │
│  │                                                                     │   │
│  │  ⚠️  SHOULD BE MERGED INTO PROVIDER-STORE                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  TESTS (2 files)                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ├─ ProviderConfigDialog.test.tsx                                   │   │
│  │  └─ ProviderSettings.test.tsx                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Circular Dependency Resolution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              CIRCULAR DEPENDENCY MITIGATION (Ralph Loop Cycle 12)           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BEFORE (Circular):                                                         │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │   agents-store.ts       │◄────────┤   provider-store.ts     │           │
│  │                         │─────────▶│                         │           │
│  │  "Import provider-store │         │  "Import agents-store   │           │
│  │   to validate agents"   │         │   to check providers"   │           │
│  └─────────────────────────┘         └─────────────────────────┘           │
│           ▼                                  ▲                              │
│           │                                  │                              │
│           │     agents ↔ providers (tight coupling)                        │
│           └──────────────────────────────────┘                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AFTER (Mediated):                                                          │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │   agents-store.ts       │         │   provider-store.ts     │           │
│  │                         │         │                         │           │
│  │  Action: removeAgent    │         │  Action: removeProvider │           │
│  │    ↓                    │         │    ↓                    │           │
│  │  "Call mediator to      │         │  "Call mediator to      │           │
│  │   validate deletion"    │         │   validate deletion"    │           │
│  └──────────┬──────────────┘         └──────────┬──────────────┘           │
│             │                                  │                          │
│             │    Both depend on mediator       │                          │
│             ▼                                  ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              AgentProviderValidator.ts (Mediator)                    │   │
│  │                                                                     │   │
│  │  DOMAIN SERVICE (Layer 2) - Pure functions, no side effects         │   │
│  │                                                                     │   │
│  │  Methods:                                                           │   │
│  │  1. validateProviderModel(providerId, modelId, availableModels)     │   │
│  │     ↓ Called by agents-store (agent-validation-slice.ts)            │   │
│  │     ↓ Validates model belongs to provider's available models        │   │
│  │                                                                     │   │
│  │  2. validateProviderDeletion(providerId, agents)                    │   │
│  │     ↓ Called by provider-store (removeProvider action)              │   │
│  │     ↓ Validates no agents are using the provider                   │   │
│  │     ↓ Throws error if dependent agents exist                        │   │
│  │                                                                     │   │
│  │  3. validateAgentUpdate(agentId, newProviderId, newModelId, ...)    │   │
│  │     ↓ Convenience method for agent updates                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  BENEFITS:                                                                  │
│  ✅ Unidirectional dependencies (agents → mediator ← provider)             │
│  ✅ Testable (pure functions, no store dependencies)                       │
│  ✅ Reusable (mediator can be used by any store/service)                  │
│  ✅ Zero runtime overhead (static class, compile-time checks)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Migration Target Architecture (Epic AC-1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TARGET ARCHITECTURE (After Epic AC-1)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BEFORE (2 stores, 565 lines):                                             │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │  provider-store.ts      │         │  models-loader-store.ts │           │
│  │  (267 lines)            │    +    │  (298 lines)            │           │
│  │                         │         │                         │           │
│  │  providers              │         │  models (DUPLICATE)     │           │
│  │  activeProviderId       │         │  loadModels (DUPLICATE) │           │
│  │  modelSettings          │         │  event subscriptions    │           │
│  │  availableModels        │◄├───────┤  (cross-store deps)    │           │
│  │  fetchModels            │  DUPL   │                         │           │
│  └─────────────────────────┘         └─────────────────────────┘           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AFTER (1 slice in combined store, ~400 lines):                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │          use-app-store.ts (Combined Zustand Store)                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │ providerSlice (~400 lines)                                   │  │   │
│  │  │                                                               │  │   │
│  │  │  State from provider-store.ts:                              │  │   │
│  │  │  - providers: ProviderConfig[]                              │  │   │
│  │  │  - activeProviderId: string | null                          │  │   │
│  │  │  - modelSettings: Record<string, ModelSettings>             │  │   │
│  │  │  - availableModels: Record<string, ModelInfo[]>             │  │   │
│  │  │                                                               │  │   │
│  │  │  State from models-loader-store.ts (MERGED):                │  │   │
│  │  │  - selectedModelId: string | null                           │  │   │
│  │  │  - modelCache: Record<string, ModelStateEntry>              │  │   │
│  │  │                                                               │  │   │
│  │  │  Actions (8 from provider-store + 3 from models-loader):    │  │   │
│  │  │  - addProvider, updateProvider, removeProvider              │  │   │
│  │  │  - setActiveProvider, updateModelSettings                   │  │   │
│  │  │  - fetchModels, getAvailableModels, reset                   │  │   │
│  │  │  - setSelectedModel, loadModelsForProvider (merged)         │  │   │
│  │  │  - clearModelsCache (merged)                                │  │   │
│  │  │                                                               │  │   │
│  │  │  Event subscriptions (internal to slice):                   │  │   │
│  │  │  - PROVIDER_KEY_SET → reload models                         │  │   │
│  │  │  - PROVIDER_KEY_REMOVED → reload defaults                   │  │   │
│  │  │  - PROVIDER_SELECTED → auto-load if needed                  │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │ agentSlice (429 lines - from agents-store.ts)                │  │   │
│  │  │                                                               │  │   │
│  │  │  5 sub-slices:                                                │  │   │
│  │  │  - agentCrudSlice                                            │  │   │
│  │  │  - agentValidationSlice ← uses AgentProviderValidator        │  │   │
│  │  │  - agentSelectionSlice                                       │  │   │
│  │  │  - agentWorkspaceSlice                                       │  │   │
│  │  │  - agentOrchestrationSlice                                   │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │ [other slices...]                                             │  │   │
│  │  │ - ragSlice                                                    │  │   │
│  │  │ - toolPermissionSlice                                         │  │   │
│  │  │ - orchestrationSlice                                          │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  Middleware:                                                        │   │
│  │  - persist (Dexie)                                                  │   │
│  │  - devtools (NEW)                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FACADE LAYER (Backwards Compatibility)                            │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  src/lib/state/provider-store.ts (NEW - facade)                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ import { useAppStore } from '@/infrastructure/.../use-app-store'│ │   │
│  │  │                                                              │   │   │
│  │  │ export const useProviderStore = {                            │   │   │
│  │  │   getState: () => useAppStore.getState(),                    │   │   │
│  │  │   subscribe: (listener) => useAppStore.subscribe(listener),  │   │   │
│  │  │   // Selector wrappers                                       │   │   │
│  │  │   providers: () => useAppStore(s => s.providers),            │   │   │
│  │  │   activeProviderId: () => useAppStore(s => s.activeProviderId),│ │   │
│  │  │   // ... action wrappers                                     │   │   │
│  │  │ };                                                            │   │   │
│  │  │                                                              │   │   │
│  │  │ // Re-export types                                           │   │   │
│  │  │ export type { ProviderState, ModelSettings } from '.../types';│ │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  RESULT: ZERO BREAKING CHANGES                                      │   │
│  │  - Existing imports continue to work                               │   │
│  │  - All 11 consumer files unchanged                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROVIDER STORE DATA FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PROVIDER CRUD FLOW:                                                     │
│     ┌──────────────────┐                                                   │
│     │ ProviderConfigDialog│                                                 │
│     │ (UI Component)    │                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ addProvider(config) / updateProvider(id, config)             │
│              ▼                                                             │
│     ┌──────────────────┐                                                   │
│     │ useProviderStore │                                                   │
│     │ (Facade)         │                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ Dexie persist (partialize: providers, activeProviderId)      │
│              ▼                                                             │
│     ┌──────────────────┐                                                   │
│     │ IndexedDB        │                                                   │
│     │ (providerConfigs │                                                   │
│     │  table)          │                                                   │
│     └──────────────────┘                                                   │
│                                                                             │
│  2. MODEL FETCHING FLOW:                                                    │
│     ┌──────────────────┐                                                   │
│     │ ProviderSettings │                                                   │
│     │ (UI Component)   │                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ fetchModels(providerId)                                      │
│              ▼                                                             │
│     ┌──────────────────┐                                                   │
│     │ useProviderStore │                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ 1. Get API key from credential-vault                        │
│              │ 2. Call model-registry.getModels(providerId, apiKey)        │
│              ▼                                                             │
│     ┌──────────────────┐       ┌──────────────────────┐                    │
│     │ credential-vault │       │  model-registry      │                    │
│     │ (3 modules)      │       │  (singleton)         │                    │
│     └────────┬─────────┘       └────────┬─────────────┘                    │
│              │                            │                                 │
│              │ apiKey                     │ models                          │
│              └────────┬───────────────────┘                                 │
│                       ▼                                                     │
│            ┌──────────────────┐                                            │
│            │ useProviderStore │                                            │
│            │                 │                                            │
│            │ Update state:   │                                            │
│            │ availableModels │                                            │
│            │ = {            │                                            │
│            │   [providerId] │                                            │
│            │   : models     │                                            │
│            │ }              │                                            │
│            └────────┬────────┘                                            │
│                     │                                                      │
│                     │ 3. Emit cross-workspace event                        │
│                     ▼                                                      │
│         ┌──────────────────────────┐                                       │
│         │ crossWorkspaceEventBus   │                                       │
│         │                          │                                       │
│         │ emitModelsUpdated({      │                                       │
│         │   workspaceId,           │                                       │
│         │   providerId,            │                                       │
│         │   models                 │                                       │
│         │ })                       │                                       │
│         └──────────────────────────┘                                       │
│                                                                             │
│  3. PROVIDER DELETION FLOW (P0 VALIDATION):                                 │
│     ┌──────────────────┐                                                   │
│     │ ProviderSettings │                                                   │
│     │ (UI Component)   │                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ removeProvider(id, agents)                                  │
│              ▼                                                             │
│     ┌──────────────────┐                                                   │
│     │ useProviderStore │                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ 1. Call AgentProviderValidator                              │
│              ▼                                                             │
│     ┌──────────────────────────┐                                           │
│     │ AgentProviderValidator   │                                           │
│     │ (Mediator - Pure Func)   │                                           │
│     │                          │                                           │
│     │ validateProviderDeletion(│                                           │
│     │   providerId,            │                                           │
│     │   agents                 │                                           │
│     │ )                        │                                           │
│     │                          │                                           │
│     │ IF dependent agents exist │                                           │
│     │   → THROW ERROR          │                                           │
│     │ ELSE → continue          │                                           │
│     └────────┬─────────────────┘                                           │
│              │                                                             │
│              │ 2. Delete credentials from vault                            │
│              ▼                                                             │
│     ┌──────────────────┐                                                   │
│     │ credential-vault │                                                   │
│     │ deleteCredentials│                                                   │
│     └────────┬─────────┘                                                   │
│              │                                                             │
│              │ 3. Update state (remove from providers array)                │
│              ▼                                                             │
│     ┌──────────────────┐                                                   │
│     │ useProviderStore │                                                   │
│     │                 │                                                   │
│     │ Set state:      │                                                   │
│     │ providers =     │                                                   │
│     │   providers     │                                                   │
│     │   .filter(p     │                                                   │
│     │     !== id)     │                                                   │
│     └──────────────────┘                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Document End**

Generated: 2026-01-01
Epic: AC-1 - Agent Configuration Consolidation
Artifact: provider-store-dependency-diagram-2026-01-01.md

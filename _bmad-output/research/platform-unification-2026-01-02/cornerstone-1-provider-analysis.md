---
name: Cornerstone 1 Analysis - LLM Provider & Key Configuration
iteration: 1
created: 2026-01-02T13:30:00+07:00
cornerstone: 1
focus: LLM Provider & Key Configuration Single Source of Truth
---

# Cornerstone 1: LLM Provider & Key Configuration - Deep Analysis

**Iteration:** 1
**Date:** 2026-01-02
**Status:** ✅ Analysis Complete
**Focus:** Establish Single Source of Truth for LLM Provider Configuration

---

## Executive Summary

### Current State: PARTIALLY CENTRALIZED (60% Complete)

**Good News:**
- ✅ Unified store exists (`use-app-store.ts`) with December 2025 Zustand patterns
- ✅ Credential vault with AES-256-GCM encryption implemented
- ✅ Provider adapter factory supports 4+ providers (OpenAI, OpenRouter, Anthropic, Gemini)
- ✅ Provider domain entity well-defined in `src/core/entities/Provider.ts`
- ✅ Provider slices modularized (3 slices: CRUD, Models, Utils)

**Critical Gaps:**
- ❌ API keys stored in provider state (NOT using credential vault)
- ❌ No Dexie persistence (using localStorage for provider state)
- ❌ Models don't auto-load on API key save (no reactive model fetching)
- ❌ Provider state not reactive across workspaces
- ❌ 3 separate store directories still exist (fragmentation)

**Assessment:** Foundation is solid, but needs **API key migration to credential vault** and **Dexie persistence** to become true Single Source of Truth.

---

## Current Architecture Analysis

### Layer 1: Domain Layer (✅ WELL-DESIGNED)

**File:** `src/core/entities/Provider.ts`

```typescript
export interface LLMProvider {
  // Identity
  id: string;
  name: string;
  providerType: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

  // Configuration
  baseUrl: string;
  isHardcoded: boolean;  // TRUE for built-in providers (readonly URL)
  apiKey: string;        // Encrypted in storage
  isEnabled: boolean;

  // Models
  models: ProviderModel[];

  // Capabilities
  capabilities: ProviderCapabilities;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**Assessment:** Excellent domain entity design. `isHardcoded` flag correctly enforces readonly URLs for built-in providers.

---

### Layer 2: Infrastructure (Credential Vault) (✅ PRODUCTION-READY)

**File:** `src/lib/agent/providers/credential-vault.ts`

**Features:**
- AES-256-GCM encryption for API keys
- PBKDF2 key derivation (100,000 iterations)
- IndexedDB storage via `CredentialStorage`
- Graceful fallback when localStorage keys corrupted
- Singleton pattern: `credentialVault`

**Security:** EXCELLENT (10/10)
- Encryption compliance verified
- Salt + IV + authentication tag properly used
- Master key encrypted and stored
- Vault initialization validation

**Assessment:** Production-ready credential vault. NOT being used for provider API keys (CRITICAL GAP).

---

### Layer 3: Provider Adapter Factory (✅ WELL-IMPLEMENTED)

**File:** `src/lib/agent/providers/provider-adapter.ts`

**Supported Providers:**
1. **OpenAI** - Native OpenAI API
2. **OpenRouter** - OpenAI-compatible with custom headers
3. **Anthropic** - Native Anthropic API (via `anthropic-adapter.ts`)
4. **Gemini** - Google Gemini API
5. **OpenAI-Compatible** - Custom endpoints (LM Studio, Ollama, etc.)

**Factory Pattern:**
```typescript
export class ProviderAdapterFactory {
  createAdapter(providerId: string, config: CustomAdapterConfig): ExtendedProviderAdapter
  getAdapter(providerId: string): ProviderAdapter | undefined
  testConnection(providerId, apiKey): Promise<ConnectionTestResult>
  getModels(providerId): Promise<ProviderModel[]>
}
```

**Assessment:** Well-designed factory. Supports 4 built-in providers + custom providers.

---

### Layer 4: State Management (⚠️ PARTIALLY IMPLEMENTED)

**File:** `src/infrastructure/persistence/stores/use-app-store.ts`

**Architecture:** December 2025 Zustand Pattern (Single Bounded Store)
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // 5 Agent Slices
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),

      // 3 Provider Slices
      ...createProviderCrudSlice(...a),
      ...createProviderModelsSlice(...a),
      ...createProviderUtilsSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('appState')),
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
    }
  )
)
```

**Persistence Strategy:**
- ✅ Uses Dexie for persistence (GOOD)
- ✅ Selective partialize (only persisting agents, providers, activeProviderId)
- ❌ **CRITICAL BUG:** `apiKey` stored in provider state (should use credential vault)

**Provider CRUD Slice** (`provider-crud-slice.ts`):
```typescript
const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: '',  // ❌ SHOULD NOT BE HERE - Use credential vault!
    models: [],
    enabled: true,
  },
  // ... more providers
];
```

**Assessment:** Store structure is good, but **API keys stored in provider state instead of credential vault** is a security and architectural violation.

---

## Fragmentation Analysis

### Store Directory Fragmentation (CRITICAL ISSUE)

**3 Separate Store Locations:**

1. **`src/stores/`** (Legacy)
   - 8 files (mostly empty, DEPRECATED)

2. **`src/lib/state/`** (Transitional)
   - 25 stores (some still in use)
   - `conversation-store.ts` (626 lines) - God store
   - `knowledge-store.ts` (718 lines) - God store

3. **`src/infrastructure/persistence/stores/`** (New Architecture)
   - 38+ stores (modern, using Dexie)
   - `use-app-store.ts` (281 lines) - Unified store ✅
   - Provider slices modularized ✅

**Impact:**
- Developers don't know which store location to use
- Duplicate stores across locations
- No clear single source of truth

**Recommendation:** Migrate all stores to `src/infrastructure/persistence/stores/` and deprecate other locations.

---

### Provider State Fragmentation (HIGH PRIORITY BUG)

**Problem:** API keys stored in THREE places:

1. **Provider Config State** (`use-app-store.ts`)
   ```typescript
   providers: [{
     id: 'openrouter',
     apiKey: 'sk-...', // ❌ INSECURE! Should be in credential vault
   }]
   ```

2. **Credential Vault** (`credential-vault.ts`)
   ```typescript
   await credentialVault.storeCredentials('openrouter', 'sk-...');
   // ✅ SECURE! But not integrated with provider state
   ```

3. **Hardcoded Provider Config** (`types.ts`)
   ```typescript
   export const PROVIDERS: Record<string, ProviderConfig> = {
     openrouter: { ... }
   };
   ```

**Impact:**
- Security risk: API keys in localStorage (even if encrypted by Zustand persist)
- Synchronization issues: Keys can differ between locations
- No single source of truth for API keys

**Root Cause:** Provider state was created before credential vault existed. Never migrated.

---

## Gap Analysis

### Gap 1: API Keys Not in Credential Vault (P0 - SECURITY)

**Current Behavior:**
- User saves API key in Provider Settings dialog
- Key stored in `use-app-store.ts` providers array
- Zustand persist encrypts and saves to IndexedDB
- Key loaded into memory on app startup

**Desired Behavior:**
- User saves API key in Provider Settings dialog
- Key immediately encrypted and stored in credential vault
- Provider state stores ONLY provider ID, name, enabled status
- Key retrieved from vault on-demand when creating adapter

**Implementation Required:**
1. Remove `apiKey` from ProviderConfig interface
2. Add `hasApiKey: boolean` flag to ProviderConfig
3. Update Provider UI to use `credentialVault.storeCredentials()`
4. Update `provider-adapter.ts` to fetch keys from vault
5. Migration script: Move existing keys from provider state to vault

---

### Gap 2: No Reactive Model Loading (P0 - UX)

**Current Behavior:**
- User saves API key
- User must manually click "Load Models" button
- Models don't automatically load

**Desired Behavior:**
- User saves API key → `storeCredentials()` resolves
- System immediately calls `adapter.getModels()`
- Models automatically populate in provider state
- UI shows loading indicator during model fetch

**Implementation Required:**
1. Add `loadModelsOnSave: true` flag to provider config
2. In `provider-crud-slice.ts`, after `addProvider()` or `updateProvider()` with apiKey:
   ```typescript
   if (config.apiKey) {
     await credentialVault.storeCredentials(providerId, config.apiKey);
     const models = await providerAdapterFactory.getModels(providerId);
     // Update provider state with models
   }
   ```

---

### Gap 3: Provider State Not Reactive Across Workspaces (P1)

**Current Behavior:**
- User adds API key in Settings workspace
- User switches to IDE workspace
- Agent selector doesn't show updated provider immediately
- Requires page refresh

**Desired Behavior:**
- User adds API key in Settings
- Provider state updates immediately (Zustand reactivity)
- All workspaces see updated provider instantly
- No refresh required

**Root Cause:** Zustand store IS reactive, but individual components may not be using selectors correctly.

**Investigation Required:**
- Audit all components using `useAppStore`
- Ensure they use individual selectors: `useAppStore(s => s.providers)`
- Replace any destructuring: `const { providers } = useAppStore()` ❌

---

### Gap 4: Missing Dexie Persistence for Provider History (P2)

**Current Behavior:**
- Provider changes only persisted in app-state
- No audit trail of provider configuration changes
- Can't rollback to previous provider config

**Desired Behavior:**
- Every provider change (add/update/remove) logged to Dexie
- Provider version history (like Git)
- Rollback capability

**Implementation Required:**
1. Create `provider-history` table in Dexie schema
2. Add middleware to `use-app-store` to log changes
3. Create UI for viewing/rolling back provider history

---

## Target Architecture

### Cornerstone 1 Target State (Single Source of Truth)

```typescript
// ========================================================
// DOMAIN LAYER (src/core/entities/Provider.ts)
// ========================================================

export interface LLMProvider {
  // Identity
  id: string;
  name: string;
  providerType: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

  // Configuration (NO apiKey here!)
  baseUrl: string;
  isHardcoded: boolean;  // TRUE for built-in providers (readonly URL)
  isEnabled: boolean;
  hasApiKey: boolean;    // NEW: Flag indicating if key exists in vault

  // Models (auto-loaded on API key save)
  models: ProviderModel[];
  lastModelFetchAt?: Date;  // NEW: Track when models were last loaded

  // Capabilities
  capabilities: ProviderCapabilities;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ========================================================
// INFRASTRUCTURE LAYER (src/infrastructure/persistence/stores/providers/)
// ========================================================

// Single unified store (use-app-store.ts)
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Provider CRUD (NO apiKey in state!)
      providers: LLMProvider[],  // ✅ API keys NOT stored here

      // Actions
      addProvider: (config: Omit<LLMProvider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
      updateProvider: (id: string, config: Partial<LLMProvider>) => Promise<void>;
      removeProvider: (id: string) => Promise<void>;

      // API Key Management (uses credential vault)
      saveApiKey: (providerId: string, apiKey: string) => Promise<void>;  // NEW
      removeApiKey: (providerId: string) => Promise<void>;                // NEW
      hasApiKey: (providerId: string) => boolean;                         // NEW

      // Model Management (auto-loading)
      loadModels: (providerId: string) => Promise<void>;
      refreshAllModels: () => Promise<void>;
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('appState'),
      partialize: (state) => ({
        providers: state.providers,  // ✅ No API keys in persisted state
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
    }
  )
);

// ========================================================
// CREDENTIAL VAULT INTEGRATION
// ========================================================

// Provider state uses credential vault for API keys
export class ProviderService {
  async saveApiKey(providerId: string, apiKey: string): Promise<void> {
    // 1. Store in credential vault (encrypted)
    await credentialVault.storeCredentials(providerId, apiKey);

    // 2. Update provider state (set hasApiKey = true)
    useAppStore.getState().updateProvider(providerId, {
      hasApiKey: true,
      lastModelFetchAt: new Date(),
    });

    // 3. Auto-load models
    const models = await providerAdapterFactory.getModels(providerId);
    useAppStore.getState().updateProvider(providerId, { models });
  }

  async getApiKey(providerId: string): Promise<string | null> {
    return credentialVault.getCredentials(providerId);
  }
}
```

---

## Implementation Plan (Ralph Wiggum Target A)

### Phase 1: API Key Migration to Credential Vault (6-8 hours)

**Story A-1:** Remove `apiKey` from ProviderConfig
- [ ] Create `ProviderConfigV2` without `apiKey` field
- [ ] Add `hasApiKey: boolean` flag
- [ ] Update type definitions
- [ ] Run TypeScript check: `pnpm tsc --noEmit`

**Story A-2:** Migrate existing keys to credential vault
- [ ] Create migration script in `src/lib/init/migrate-api-keys.ts`
- [ ] Read all providers from `use-app-store`
- [ ] For each provider with `apiKey`:
    - [ ] Encrypt and store in credential vault
    - [ ] Remove `apiKey` from provider state
    - [ ] Set `hasApiKey: true`
- [ ] Test migration with seeded data

**Story A-3:** Update Provider UI to use credential vault
- [ ] Update `ProviderConfigDialog.tsx` to call `credentialVault.storeCredentials()`
- [ ] Update `ProviderSettings.tsx` to check `credentialVault.hasCredentials()`
- [ ] Update `provider-adapter.ts` to fetch keys from vault
- [ ] Test: Save API key → Verify stored in vault → Verify retrieved correctly

### Phase 2: Reactive Model Loading (4-6 hours)

**Story A-4:** Auto-load models on API key save
- [ ] Add `loadModels()` method to provider service
- [ ] Call `loadModels()` after `saveApiKey()`
- [ ] Add loading indicator to UI
- [ ] Test: Save API key → Models auto-populate

**Story A-5:** Reactive provider updates across workspaces
- [ ] Audit all components using `useAppStore`
- [ ] Replace destructuring with individual selectors
- [ ] Test: Add API key in Settings → Check IDE workspace → Verify models available

### Phase 3: Store Consolidation (8-10 hours)

**Story A-6:** Migrate all stores to unified location
- [ ] Audit all store files across 3 directories
- [ ] Migrate `src/lib/state/` stores to `src/infrastructure/persistence/stores/`
- [ ] Migrate `src/stores/` stores (deprecate)
- [ ] Update all imports
- [ ] Delete old store directories
- [ ] Run full test suite: `pnpm test`

---

## Validation Criteria

### Completion Checklist

**Cornerstone 1 Complete When:**
- [ ] API keys stored ONLY in credential vault (not in provider state)
- [ ] Provider state reactive across all 4 workspaces
- [ ] Models auto-load on API key save
- [ ] All providers consolidated in `use-app-store.ts`
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] All tests passing: `pnpm test`
- [ ] Manual test: Add API key in Settings → Models available in IDE immediately
- [ ] Security audit: No API keys in localStorage or IndexedDB (only encrypted in vault)

---

## Dependencies & Integration Points

### Upstream Dependencies (Must Complete First)

None - Cornerstone 1 is foundation for other cornerstones.

### Downstream Dependencies (Depend on Cornerstone 1)

- **Cornerstone 2** (Agent Vault): Agents depend on providers for model selection
- **Cornerstone 3** (Conversations): Chat depends on provider configuration
- **Cornerstone 5** (RAG Pipeline): Embedding depends on provider API keys

---

## Risk Assessment

### High-Risk Areas

1. **API Key Migration (P0)**
   - Risk: Data loss if migration fails
   - Mitigation: Backup before migration, test with seed data first
   - Rollback: Keep old provider state until migration verified

2. **Store Consolidation (P1)**
   - Risk: Breaking imports across codebase
   - Mitigation: Incremental migration, test after each file moved
   - Rollback: Git revert after each migration batch

3. **Reactive Model Loading (P1)**
   - Risk: Slow model fetching blocks UI
   - Mitigation: Async loading with progress indicators
   - Rollback: Revert to manual model loading if UX poor

---

## Open Questions

1. **Custom Provider Support:** Should users be able to add custom OpenAI-compatible providers beyond the 4 built-ins?
   - **Decision:** YES, but only if OpenAI-compatible format
   - **Implementation:** Add "Add Custom Provider" button in Provider Settings

2. **Provider History:** Should we implement provider version history (rollback capability)?
   - **Decision:** DEFER to Phase 2 (P2 priority)
   - **Reasoning:** Nice-to-have, not blocking for MVP

3. **Model Caching:** Should we cache fetched models in Dexie for faster startup?
   - **Decision:** YES, implement in Phase 2
   - **Reasoning:** Reduces API calls on startup, improves UX

---

## Next Steps

**Iteration 2:** Begin Story A-1 (Remove `apiKey` from ProviderConfig)
- Create `ProviderConfigV2` interface
- Update type definitions
- Run TypeScript validation

**Iteration 3:** Begin Story A-2 (Migration script)
- Create migration script
- Test with seed data
- Verify encryption working

**Iteration 4:** Begin Story A-3 (Update Provider UI)
- Update ProviderConfigDialog.tsx
- Update ProviderSettings.tsx
- Test end-to-end

---

**Generated:** Iteration 1
**Status:** ✅ Analysis Complete
**Next:** Cornerstone 2 Analysis (Agent Configuration Vault)

---
title: ADR-001: Provider Store Consolidation
status: Proposed
date: 2026-01-02
iteration: 6
cornerstone: 1
priority: P0 (Security)
---

# ADR-001: Provider Store Consolidation

**Status:** Proposed
**Date:** 2026-01-02
**Iteration:** 6
**Cornerstone:** 1 - Provider Configuration
**Priority:** P0 (Security)
**Estimated Effort:** 18-24 hours

---

## Context

### Current State (INSECURE)

**Critical Security Issue:** API keys are stored in provider state instead of encrypted credential vault.

**Evidence:**
```typescript
// src/infrastructure/persistence/stores/use-app-store.ts

const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    apiKey: 'sk-...', // ❌ STORED IN PROVIDER STATE (INSECURE!)
    models: [],
    enabled: true,
  },
];
```

**Problems:**
1. **Security Risk:** API keys potentially exposed in localStorage (even if encrypted by Zustand persist)
2. **Architectural Violation:** Credential vault exists but not being used
3. **No Key Rotation:** No mechanism to rotate compromised keys
4. **Synchronization Issues:** Keys can exist in multiple places (provider state, credential vault, hardcoded config)

### Current Architecture

```
┌─────────────────────────────────────────────┐
│ Provider State (use-app-store.ts)          │
│                                             │
│ providers: [{                               │
│   id: 'openrouter',                         │
│   apiKey: 'sk-...',  ❌ INSECURE!           │
│   models: [],                               │
│ }]                                          │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ Zustand Persist                             │
│                                             │
│ Encrypted storage → IndexedDB              │
│ ❌ Still in provider state!                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Credential Vault (credential-vault.ts)      │
│                                             │
│ ✅ AES-256-GCM encryption                  │
│ ✅ PBKDF2 key derivation                   │
│ ❌ NOT BEING USED!                         │
└─────────────────────────────────────────────┘
```

**Gap Analysis:** From `cornerstone-1-provider-analysis.md`
- Provider health score: **60%** (needs security fix)
- God stores: 0 ✅
- Store locations: 1 unified ✅
- Max file size: <400 ✅
- **CRITICAL:** API keys not in credential vault ❌

---

## Decision

**Migrate API keys from provider state to encrypted credential vault.**

### Target State (SECURE)

```typescript
// src/core/entities/Provider.ts

export interface LLMProvider {
  // Identity
  id: string;
  name: string;
  providerType: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

  // Configuration (NO apiKey here!)
  baseUrl: string;
  isHardcoded: boolean;
  isEnabled: boolean;
  hasApiKey: boolean;    // ✅ NEW: Flag only (not the key itself)

  // Models (auto-loaded)
  models: ProviderModel[];
  lastModelFetchAt?: Date;

  // Capabilities
  capabilities: ProviderCapabilities;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Target Architecture

```
┌─────────────────────────────────────────────┐
│ Provider State (use-app-store.ts)          │
│                                             │
│ providers: [{                               │
│   id: 'openrouter',                         │
│   hasApiKey: true,  ✅ FLAG ONLY            │
│   models: [],                               │
│ }]                                          │
└─────────────────────────────────────────────┘
           │
           ▼ (on-demand)
┌─────────────────────────────────────────────┐
│ Credential Vault (credential-vault.ts)      │
│                                             │
│ ✅ AES-256-GCM encryption                  │
│ ✅ PBKDF2 key derivation (100k iterations) │
│ ✅ Keys encrypted at rest                  │
│ ✅ Retrieved on-demand                     │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ IndexedDB (Encrypted Storage)              │
│                                             │
│ Keys encrypted before storage              │
│ Only master key encrypted in localStorage  │
└─────────────────────────────────────────────┘
```

**Key Changes:**
1. Remove `apiKey` from `ProviderConfig` interface
2. Add `hasApiKey: boolean` flag
3. Store/retrieve keys via credential vault
4. Auto-load models after API key save
5. Implement key rotation mechanism

---

## Consequences

### Benefits

1. **Security Improvement** ✅
   - API keys encrypted with AES-256-GCM
   - Keys at rest in IndexedDB (not localStorage)
   - No keys in provider state (zero exposure risk)

2. **Architectural Consistency** ✅
   - Single source of truth for credentials
   - Provider state lightweight (metadata only)
   - Credential vault used as designed

3. **Key Rotation** ✅
   - Implement rotation mechanism
   - Audit log of key operations
   - Zero-downtime rotation

4. **Compliance** ✅
   - Meets security best practices
   - Reduces attack surface
   - Easier security audits

### Drawbacks

1. **Migration Complexity** ⚠️
   - Requires migration script
   - Risk of data loss if migration fails
   - Testing overhead

2. **UI Changes Required** ⚠️
   - Update ProviderConfigDialog
   - Update ProviderSettings
   - Update agent configuration UI

3. **Breaking Changes** ⚠️
   - ProviderConfig interface changes
   - Updates to provider-adapter.ts
   - Potential component re-renders

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Data loss during migration** | Low | Catastrophic | - Backup before migration<br>- Test with seed data<br>- Verify record counts<br>- Provide rollback mechanism |
| **API key exposure during migration** | Low | Critical | - Generate new encryption keys<br>- Re-encrypt all keys<br>- Audit log all operations<br>- Zero-downtime migration |
| **UI breaks after interface change** | Medium | High | - Incremental UI updates<br>- Run TypeScript check after each change<br>- Manual testing |
| **Performance degradation** | Low | Medium | - Vault has fast lookups (<10ms)<br>- Keys cached in memory<br>- No noticeable UX impact |

---

## Implementation Plan

### Phase 1: Type Changes (2-3 hours)

**Step 1.1:** Create new ProviderConfigV2 interface
```typescript
// src/infrastructure/persistence/stores/providers/provider-types.ts

export interface ProviderConfigV2 {
  id: string;
  name: string;
  type: string;
  baseURL: string;
  isHardcoded: boolean;
  enabled: boolean;
  hasApiKey: boolean;      // ✅ NEW
  models: ProviderModel[];
  lastModelFetchAt?: Date; // ✅ NEW
}
```

**Step 1.2:** Update type definitions
- [ ] Update `src/core/entities/Provider.ts`
- [ ] Update `src/infrastructure/persistence/stores/providers/provider-types.ts`
- [ ] Update `src/lib/agent/providers/types.ts`
- [ ] Run `pnpm tsc --noEmit` to verify

**Step 1.3:** Mark old interface as deprecated
```typescript
/**
 * @deprecated Use ProviderConfigV2 (without apiKey field)
 */
export interface ProviderConfig {
  // ... old fields
  apiKey: string; // @deprecated
}
```

### Phase 2: Migration Script (4-6 hours)

**Step 2.1:** Create migration script
```typescript
// src/lib/init/migrate-api-keys-to-vault.ts

import { credentialVault } from '../agent/providers/credential-vault';
import { useAppStore } from '../../infrastructure/persistence/stores/use-app-store';

export async function migrateApiKeysToVault(): Promise<void> {
  const providers = useAppStore.getState().providers;

  for (const provider of providers) {
    if ('apiKey' in provider && provider.apiKey) {
      console.log(`[Migration] Migrating API key for ${provider.id}`);

      try {
        // 1. Store in credential vault (encrypted)
        await credentialVault.storeCredentials(provider.id, provider.apiKey);

        // 2. Update provider state (remove apiKey, set hasApiKey)
        useAppStore.getState().updateProvider(provider.id, {
          hasApiKey: true,
          // @ts-expect-error - removing deprecated field
          apiKey: undefined,
        });

        console.log(`[Migration] ✅ Successfully migrated ${provider.id}`);
      } catch (error) {
        console.error(`[Migration] ❌ Failed to migrate ${provider.id}:`, error);
        throw error;
      }
    }
  }

  console.log('[Migration] ✅ All API keys migrated to credential vault');
}
```

**Step 2.2:** Add migration to app initialization
```typescript
// src/main.tsx

import { migrateApiKeysToVault } from './lib/init/migrate-api-keys-to-vault';

async function initializeApp() {
  // Run migration on app startup
  await migrateApiKeysToVault();

  // Rest of initialization...
}
```

**Step 2.3:** Test migration
- [ ] Seed test data with API keys
- [ ] Run migration script
- [ ] Verify keys in credential vault
- [ ] Verify provider state updated
- [ ] Verify zero data loss

### Phase 3: UI Updates (6-8 hours)

**Step 3.1:** Update ProviderConfigDialog
```typescript
// src/presentation/components/agent/ProviderConfigDialog.tsx

const handleSaveApiKey = async (providerId: string, apiKey: string) => {
  try {
    // 1. Store in credential vault
    await credentialVault.storeCredentials(providerId, apiKey);

    // 2. Update provider state (flag only)
    updateProvider(providerId, {
      hasApiKey: true,
    });

    // 3. Auto-load models
    const models = await providerAdapterFactory.getModels(providerId);
    updateProvider(providerId, { models });

    toast.success('API key saved successfully');
  } catch (error) {
    toast.error('Failed to save API key');
  }
};
```

**Step 3.2:** Update ProviderSettings
- [ ] Add "Has API Key" badge display
- [ ] Add "Remove API Key" button
- [ ] Add "Load Models" button (manual refresh)
- [ ] Add loading indicators

**Step 3.3:** Update AgentConfigDialog
- [ ] Check `hasApiKey` flag instead of `apiKey` field
- [ ] Show providers with API keys only
- [ ] Add warning if no providers have keys

**Step 3.4:** Update provider-adapter.ts
```typescript
// src/lib/agent/providers/provider-adapter.ts

export class ProviderAdapterFactory {
  async createAdapter(providerId: string): Promise<ProviderAdapter> {
    const provider = useAppStore.getState().providers.find(p => p.id === providerId);

    if (!provider || !provider.hasApiKey) {
      throw new Error(`Provider ${providerId} not configured or missing API key`);
    }

    // Fetch API key from credential vault
    const apiKey = await credentialVault.getCredentials(providerId);

    if (!apiKey) {
      throw new Error(`API key not found in credential vault for ${providerId}`);
    }

    // Create adapter with API key
    return this.createAdapterInternal(providerId, apiKey);
  }
}
```

### Phase 4: Auto-Load Models (3-4 hours)

**Step 4.1:** Implement auto-loading
```typescript
// src/infrastructure/persistence/stores/providers/provider-crud-slice.ts

const saveApiKey: State['saveApiKey'] = async (providerId: string, apiKey: string) => {
  // 1. Store in credential vault
  await credentialVault.storeCredentials(providerId, apiKey);

  // 2. Update provider state
  set((state) => ({
    providers: state.providers.map(p =>
      p.id === providerId
        ? { ...p, hasApiKey: true, lastModelFetchAt: new Date() }
        : p
    ),
  }));

  // 3. Auto-load models
  try {
    const models = await providerAdapterFactory.getModels(providerId);
    set((state) => ({
      providers: state.providers.map(p =>
        p.id === providerId ? { ...p, models } : p
      ),
    }));
  } catch (error) {
    console.error(`[Provider] Failed to auto-load models for ${providerId}:`, error);
  }
};
```

**Step 4.2:** Add loading indicators
- [ ] Show spinner during model fetch
- [ ] Show "Loading models..." message
- [ ] Handle model fetch errors gracefully

### Phase 5: Key Rotation (3-4 hours)

**Step 5.1:** Implement rotation mechanism
```typescript
// src/lib/agent/providers/credential-vault.ts

export class CredentialVault {
  /**
   * Rotate API key for a provider
   * @param providerId - Provider identifier
   * @param oldKey - Old API key (for verification)
   * @param newKey - New API key
   */
  async rotateCredentials(providerId: string, oldKey: string, newKey: string): Promise<void> {
    // 1. Verify old key matches
    const currentKey = await this.getCredentials(providerId);
    if (currentKey !== oldKey) {
      throw new Error('Old key does not match');
    }

    // 2. Store new key
    await this.storeCredentials(providerId, newKey);

    // 3. Audit log
    await this.auditLog(providerId, 'KEY_ROTATED', {
      timestamp: new Date(),
      keyPrefix: newKey.substring(0, 7) + '...',
    });
  }
}
```

**Step 5.2:** Add rotation UI
- [ ] Add "Rotate API Key" button in ProviderSettings
- [ ] Show dialog for old/new key input
- [ ] Display rotation success/error messages

### Phase 6: Testing & Validation (2-3 hours)

**Test Coverage:**

1. **Migration Tests**
   - [ ] Test migration with existing API keys
   - [ ] Test migration with no API keys
   - [ ] Test migration with corrupted keys
   - [ ] Verify zero data loss

2. **UI Tests**
   - [ ] Test saving API key in ProviderConfigDialog
   - [ ] Test removing API key
   - [ ] Test auto-loading models
   - [ ] Test provider selection in AgentConfigDialog

3. **Integration Tests**
   - [ ] Test agent chat with migrated keys
   - [ ] Test provider adapter creation
   - [ ] Test cross-workspace reactivity

4. **Security Tests**
   - [ ] Verify no keys in localStorage
   - [ ] Verify keys encrypted in IndexedDB
   - [ ] Test key rotation

---

## Rollback Strategy

### If Migration Fails

**Step 1:** Keep backup of provider state before migration
```typescript
// Backup provider state
const backup = useAppStore.getState().providers;
localStorage.setItem('provider-state-backup', JSON.stringify(backup));
```

**Step 2:** Restore from backup if migration fails
```typescript
// Restore backup
const backup = JSON.parse(localStorage.getItem('provider-state-backup'));
useAppStore.getState().setProviders(backup);
```

**Step 3:** Revert UI changes
- Git revert ProviderConfigDialog.tsx
- Git revert ProviderSettings.tsx
- Git revert provider-adapter.ts

**Step 4:** Verify rollback
- [ ] Run `pnpm tsc --noEmit` (should pass)
- [ ] Run `pnpm test` (should pass)
- [ ] Manual test: Agent chat works with old keys

### Zero-Downtime Migration

**Approach:** Perform migration during app initialization (before UI renders)

```typescript
// src/main.tsx

export async function initializeApp() {
  // 1. Show loading screen
  showMigrationScreen();

  try {
    // 2. Run migration (non-blocking if keys already migrated)
    await migrateApiKeysToVault();

    // 3. Hide loading screen, show app
    hideMigrationScreen();
  } catch (error) {
    // 4. Log error, show error message, allow app to run with old state
    console.error('[Migration] Failed:', error);
    showMigrationError(error);
  }
}
```

---

## Migration Checklist

### Pre-Migration

- [ ] Backup IndexedDB (export all data)
- [ ] Backup provider state to localStorage
- [ ] Create migration script
- [ ] Test migration with seed data
- [ ] Document migration steps

### During Migration

- [ ] Run migration script
- [ ] Verify record counts before/after
- [ ] Check console for errors
- [ ] Test key retrieval from vault
- [ ] Verify provider state updated

### Post-Migration

- [ ] Verify no API keys in localStorage
- [ ] Verify API keys encrypted in IndexedDB
- [ ] Test agent chat functionality
- [ ] Test model auto-loading
- [ ] Test key rotation
- [ ] Run full test suite: `pnpm test`
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Manual testing across all 4 workspaces

### Sign-Off

- [ ] Security audit: No keys exposed
- [ ] Performance audit: No degradation
- [ ] User acceptance: UX unchanged
- [ ] Documentation updated

---

## Related ADRs

- **ADR-002:** Agent Vault Architecture (depends on Cornerstone 1 completion)
- **ADR-003:** Conversation Thread Schema (independent)
- **ADR-004:** Project Workspace Binding (independent)
- **ADR-005:** RAG Pipeline Design (independent)
- **ADR-006:** Workspace State Sharing (independent)

---

## References

- **Phase 1 Analysis:** `cornerstone-1-provider-analysis.md`
- **Credential Vault:** `src/lib/agent/providers/credential-vault.ts`
- **Provider Adapter:** `src/lib/agent/providers/provider-adapter.ts`
- **Current Store:** `src/infrastructure/persistence/stores/use-app-store.ts`

---

## Open Questions

1. **Should we delete old `apiKey` field immediately or keep as deprecated?**
   - **Decision:** Delete immediately after migration verified
   - **Reasoning:** Prevents accidental use of insecure field

2. **Should we enforce key rotation periodically (e.g., every 90 days)?**
   - **Decision:** NO - leave to user discretion
   - **Reasoning:** Provider rotation policies vary, auto-rotation would break workflows

3. **Should we implement key versioning (for rollback capability)?**
   - **Decision:** DEFER to Phase 2 (P2 priority)
   - **Reasoning:** Nice-to-have, not blocking for security fix

---

**Status:** Proposed
**Next Step:** Implementation Phase 1 (Type Changes)
**Estimated Completion:** Iterations 31-35 (Sprint 1)

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 2 - ADR Creation)
**Review Status:** Pending stakeholder approval

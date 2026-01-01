---
title: Story 3.2 Implementation Plan - Provider API Key Migration
status: Ready for Implementation
date: 2026-01-02
iteration: 32
story: 3.2
priority: P0 (CRITICAL SECURITY)
estimated: 18-24 hours
---

# Story 3.2: Migrate Provider API Keys - IMPLEMENTATION PLAN

**Status:** Ready for Implementation
**Date:** 2026-01-02
**Iteration:** 32
**Story:** 3.2 (Provider API Key Migration)
**Priority:** P0 (CRITICAL SECURITY)
**Estimated Effort:** 18-24 hours (6 phases)

---

## Executive Summary

**Critical Security Issue:** API keys are stored in provider state (`ProviderConfig.apiKey: string`) instead of the encrypted credential vault (`credential-vault.ts` with AES-256-GCM encryption).

**Risk Level:** **CATASTROPHIC** (data loss potential) + **CRITICAL** (key exposure)

**Decision:** Create comprehensive implementation plan **before** making changes to ensure:
1. Zero data loss during migration
2. Zero API key exposure
3. Complete rollback strategy
4. Full visibility into affected files

---

## Current Architecture Analysis

### Files Using `ProviderConfig` Interface

**Core Type Definitions (3 files):**
1. `src/core/entities/Provider.ts` (60 lines)
   - `LLMProvider` interface with `apiKey: string` on line 15
   - Domain entity, not state

2. `src/infrastructure/persistence/stores/providers/types.ts` (207 lines)
   - `ProviderConfig` interface with `apiKey: string` on line 35
   - `ModelInfo`, `ModelSettings`, `ModelStateEntry` interfaces
   - Complete `ProviderState` interface

3. `src/lib/agent/providers/types.ts` (need to read)
   - Provider adapter types
   - May reference `apiKey` field

**Provider Slices (3 files):**
4. `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts` (207 lines)
   - `INITIAL_PROVIDERS` array (lines 29-66) with `apiKey: ''` for each provider
   - `addProvider`, `updateProvider`, `removeProvider` actions

5. `src/infrastructure/persistence/stores/providers/provider-models-slice.ts` (need to read)
   - Model fetching logic
   - May reference `apiKey` for API calls

6. `src/infrastructure/persistence/stores/providers/provider-utils-slice.ts` (need to read)
   - Provider utility functions
   - May reference `apiKey` field

**UI Components (4 files):**
7. `src/presentation/components/agent/ProviderConfigDialog.tsx` (need to read)
   - Provider configuration dialog
   - API key input field
   - Save/Remove API key buttons

8. `src/presentation/components/agent/ProviderSettings.tsx` (need to read)
   - Provider settings UI
   - Display API key status
   - Manage API keys

9. `src/presentation/components/agent/ApiKeyInputSection.tsx` (need to read)
   - API key input component
   - Validation, masking, save functionality

10. `src/presentation/components/agent/AgentConfigDialog.tsx` (need to read)
    - Agent configuration dialog
    - Provider selection dropdown
    - May check for `apiKey` field

**Provider Adapter (1 file):**
11. `src/lib/agent/providers/provider-adapter.ts` (need to read)
    - Provider adapter factory
    - Creates adapters with API keys
    - Currently reads `apiKey` from provider state

**Migration Script (1 file to create):**
12. `src/lib/init/migrate-api-keys-to-vault.ts` (new file)
    - Migration script to move keys from provider state to vault
    - Backup, verification, rollback mechanisms

**App Initialization (1 file to modify):**
13. `src/main.tsx` (need to read)
    - Add migration call during app initialization
    - Show migration loading screen
    - Handle migration errors

---

## Implementation Phases (6 Phases)

### Phase 1: Type Changes (2-3 hours)

**Objective:** Remove `apiKey` from `ProviderConfig`, add `hasApiKey` flag

**Files to Modify:**
1. `src/core/entities/Provider.ts`
2. `src/infrastructure/persistence/stores/providers/types.ts`
3. `src/lib/agent/providers/types.ts` (if needed)

**Changes Required:**

```typescript
// BEFORE (INSECURE):
export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseURL: string;
  apiKey: string;        // ❌ REMOVE THIS
  models: ModelInfo[];
  enabled: boolean;
}

// AFTER (SECURE):
export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseURL: string;
  hasApiKey: boolean;    // ✅ ADD THIS (flag only)
  models: ModelInfo[];
  enabled: boolean;
  lastModelFetchAt?: number;  // ✅ ADD THIS (timestamp)
}
```

**Step-by-Step:**
- [ ] 1.1: Update `ProviderConfig` in `types.ts` (remove `apiKey`, add `hasApiKey`)
- [ ] 1.2: Update `LLMProvider` in `Provider.ts` (same changes)
- [ ] 1.3: Update `INITIAL_PROVIDERS` in `provider-crud-slice.ts` (set `hasApiKey: false`)
- [ ] 1.4: Run `pnpm tsc --noEmit` to see compilation errors
- [ ] 1.5: Document all TypeScript errors (will fix in Phase 3)

**Expected TypeScript Errors:** ~50-100 errors (all references to `apiKey` field)

---

### Phase 2: Migration Script (4-6 hours)

**Objective:** Create script to migrate existing API keys to credential vault

**Files to Create:**
1. `src/lib/init/migrate-api-keys-to-vault.ts` (new file)

**Migration Logic:**

```typescript
/**
 * Migration Script: Move API Keys from Provider State to Credential Vault
 *
 * Process:
 * 1. Check if migration already run (hasApiKey flag exists)
 * 2. Backup provider state to localStorage
 * 3. For each provider with apiKey:
 *    a. Store key in credential vault (encrypted)
 *    b. Update provider state (hasApiKey: true, apiKey: undefined)
 * 4. Verify all keys migrated
 * 5. Log success/failure
 */

import { credentialVault } from '../agent/providers/credential-vault';
import { useAppStore } from '../../infrastructure/persistence/stores/use-app-store';

export async function migrateApiKeysToVault(): Promise<{
  success: boolean;
  migrated: number;
  failed: string[];
  errors: any[];
}> {
  console.log('[Migration] Starting API key migration to credential vault...');

  // Check if already migrated
  const providers = useAppStore.getState().providers;
  const alreadyMigrated = providers.every(p => 'hasApiKey' in p);
  if (alreadyMigrated) {
    console.log('[Migration] Already migrated, skipping...');
    return { success: true, migrated: 0, failed: [], errors: [] };
  }

  // Backup provider state
  const backup = JSON.stringify(providers);
  try {
    localStorage.setItem('provider-state-backup', backup);
    console.log('[Migration] ✅ Backup created');
  } catch (error) {
    console.error('[Migration] ❌ Backup failed:', error);
    return { success: false, migrated: 0, failed: [], errors: [error] };
  }

  // Migrate each provider
  let migrated = 0;
  const failed: string[] = [];
  const errors: any[] = [];

  for (const provider of providers) {
    // Check if provider has apiKey field (old format)
    if ('apiKey' in provider && (provider as any).apiKey) {
      const apiKey = (provider as any).apiKey;

      // Skip empty keys
      if (!apiKey || apiKey === '') {
        console.log(`[Migration] Skipping ${provider.id} (no API key)`);
        useAppStore.getState().updateProvider(provider.id, {
          hasApiKey: false,
        });
        continue;
      }

      try {
        console.log(`[Migration] Migrating API key for ${provider.id}...`);

        // 1. Store in credential vault (encrypted with AES-256-GCM)
        await credentialVault.storeCredentials(provider.id, apiKey);

        // 2. Update provider state (remove apiKey, set hasApiKey)
        useAppStore.getState().updateProvider(provider.id, {
          hasApiKey: true,
          // @ts-expect-error - removing deprecated field
          apiKey: undefined,
        } as any);

        migrated++;
        console.log(`[Migration] ✅ Successfully migrated ${provider.id}`);
      } catch (error) {
        console.error(`[Migration] ❌ Failed to migrate ${provider.id}:`, error);
        failed.push(provider.id);
        errors.push({ providerId: provider.id, error });
      }
    } else {
      // Provider already in new format (no apiKey)
      useAppStore.getState().updateProvider(provider.id, {
        hasApiKey: false,
      });
    }
  }

  // Summary
  if (failed.length > 0) {
    console.error(`[Migration] ❌ Migration incomplete: ${failed.length} failed`, failed);
    return { success: false, migrated, failed, errors };
  }

  console.log(`[Migration] ✅ Successfully migrated ${migrated} providers`);
  return { success: true, migrated, failed: [], errors: [] };
}

/**
 * Rollback Migration (if migration failed)
 */
export async function rollbackMigration(): Promise<void> {
  console.log('[Rollback] Restoring provider state from backup...');

  const backup = localStorage.getItem('provider-state-backup');
  if (!backup) {
    throw new Error('No backup found');
  }

  const providers = JSON.parse(backup);
  useAppStore.getState().setProviders?.(providers);

  console.log('[Rollback] ✅ Provider state restored');
}
```

**Files to Modify:**
2. `src/main.tsx` (add migration call)

```typescript
// In main.tsx or app initialization
import { migrateApiKeysToVault } from './lib/init/migrate-api-keys-to-vault';

async function initializeApp() {
  // Show migration screen
  document.getElementById('app-loading')?.classList.remove('hidden');

  try {
    // Run migration (non-blocking if already migrated)
    const result = await migrateApiKeysToVault();

    if (!result.success) {
      console.error('[Init] Migration failed, but continuing...', result.failed);
      // Show warning to user but allow app to run
    }

    // Hide migration screen, show app
    document.getElementById('app-loading')?.classList.add('hidden');
  } catch (error) {
    console.error('[Init] Migration error:', error);
    // Show error message, allow app to run
    document.getElementById('app-loading')?.classList.add('hidden');
  }

  // Rest of initialization...
}
```

**Step-by-Step:**
- [ ] 2.1: Create `migrate-api-keys-to-vault.ts`
- [ ] 2.2: Add migration call to `main.tsx`
- [ ] 2.3: Test migration with seed data (mock API keys)
- [ ] 2.4: Verify keys in credential vault (use DevTools → Application → IndexedDB)
- [ ] 2.5: Verify provider state updated (no `apiKey` field, `hasApiKey: true`)
- [ ] 2.6: Test rollback mechanism
- [ ] 2.7: Document migration process for users

---

### Phase 3: UI Updates (6-8 hours)

**Objective:** Update all UI components to use `hasApiKey` flag instead of `apiKey` field

**Files to Modify:**
1. `src/presentation/components/agent/ProviderConfigDialog.tsx`
2. `src/presentation/components/agent/ProviderSettings.tsx`
3. `src/presentation/components/agent/ApiKeyInputSection.tsx`
4. `src/presentation/components/agent/AgentConfigDialog.tsx`

**Changes Required:**

#### 3.1: ProviderConfigDialog

```typescript
// BEFORE:
const handleSaveApiKey = async (providerId: string, apiKey: string) => {
  updateProvider(providerId, { apiKey });
  toast.success('API key saved');
};

// AFTER:
const handleSaveApiKey = async (providerId: string, apiKey: string) => {
  try {
    // 1. Store in credential vault (encrypted)
    await credentialVault.storeCredentials(providerId, apiKey);

    // 2. Update provider state (flag only)
    updateProvider(providerId, { hasApiKey: true });

    // 3. Auto-load models
    const models = await fetchModels(providerId);
    updateProvider(providerId, { models, lastModelFetchAt: Date.now() });

    toast.success('API key saved successfully');
  } catch (error) {
    toast.error('Failed to save API key');
  }
};

const handleRemoveApiKey = async (providerId: string) => {
  try {
    // 1. Remove from credential vault
    await credentialVault.deleteCredentials(providerId);

    // 2. Update provider state
    updateProvider(providerId, { hasApiKey: false });

    toast.success('API key removed');
  } catch (error) {
    toast.error('Failed to remove API key');
  }
};
```

#### 3.2: ProviderSettings

```typescript
// Add "Has API Key" badge:
{provider.hasApiKey ? (
  <Badge variant="outline" className="bg-green-500/20 text-green-500">
    API Key Configured
  </Badge>
) : (
  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500">
    No API Key
  </Badge>
)}
```

#### 3.3: ApiKeyInputSection

```typescript
// Update to check hasApiKey instead of apiKey field:
const hasKey = provider.hasApiKey;

// Save handler updates to use credential vault
// (see ProviderConfigDialog example above)
```

#### 3.4: AgentConfigDialog

```typescript
// Filter providers to only show those with API keys:
const availableProviders = providers.filter(p => p.hasApiKey);

// Show warning if no providers have keys:
{availableProviders.length === 0 && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>No API Keys Configured</AlertTitle>
    <AlertDescription>
      Please configure at least one provider API key in Settings.
    </AlertDescription>
  </Alert>
)}
```

**Step-by-Step:**
- [ ] 3.1: Update `ProviderConfigDialog.tsx` (save/remove handlers, auto-load models)
- [ ] 3.2: Update `ProviderSettings.tsx` (hasApiKey badge, remove button)
- [ ] 3.3: Update `ApiKeyInputSection.tsx` (use credential vault)
- [ ] 3.4: Update `AgentConfigDialog.tsx` (filter by hasApiKey)
- [ ] 3.5: Run `pnpm tsc --noEmit` (should have zero errors)
- [ ] 3.6: Manual test: Save API key in ProviderConfigDialog
- [ ] 3.7: Manual test: Remove API key
- [ ] 3.8: Manual test: Verify key stored in IndexedDB (encrypted)

---

### Phase 4: Auto-Load Models (3-4 hours)

**Objective:** Automatically load provider models after API key save

**Files to Modify:**
1. `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts`
2. `src/lib/agent/providers/provider-adapter.ts`

**Changes Required:**

```typescript
// In provider-crud-slice.ts, add new action:
saveApiKey: async (providerId: string, apiKey: string) => {
  // 1. Store in credential vault
  await credentialVault.storeCredentials(providerId, apiKey);

  // 2. Update provider state
  set((state) => ({
    providers: state.providers.map(p =>
      p.id === providerId
        ? { ...p, hasApiKey: true, lastModelFetchAt: Date.now() }
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
}
```

**Step-by-Step:**
- [ ] 4.1: Add `saveApiKey` action to `provider-crud-slice.ts`
- [ ] 4.2: Update `ProviderConfigDialog` to use `saveApiKey` action
- [ ] 4.3: Add loading indicators (spinner, "Loading models...")
- [ ] 4.4: Handle model fetch errors gracefully
- [ ] 4.5: Manual test: Save API key → Models auto-load

---

### Phase 5: Key Rotation (3-4 hours)

**Objective:** Implement key rotation mechanism

**Files to Modify:**
1. `src/lib/agent/providers/credential-vault.ts` (add rotateCredentials method)
2. `src/presentation/components/agent/ProviderSettings.tsx` (add rotation UI)

**Changes Required:**

```typescript
// In credential-vault.ts:
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
```

**Step-by-Step:**
- [ ] 5.1: Add `rotateCredentials` method to `credential-vault.ts`
- [ ] 5.2: Add "Rotate API Key" button in `ProviderSettings.tsx`
- [ ] 5.3: Create rotation dialog (old key + new key inputs)
- [ ] 5.4: Display success/error messages
- [ ] 5.5: Manual test: Rotate API key
- [ ] 5.6: Verify old key no longer works
- [ ] 5.7: Verify new key works

---

### Phase 6: Testing & Validation (2-3 hours)

**Objective:** Comprehensive testing to ensure zero data loss and zero security issues

**Test Coverage:**

#### 6.1: Migration Tests

```typescript
// Test: Migration with existing API keys
it('should migrate API keys to vault', async () => {
  // 1. Setup: Create provider with apiKey
  const provider = { id: 'test', apiKey: 'sk-test-123' };
  useAppStore.getState().addProvider(provider);

  // 2. Run migration
  const result = await migrateApiKeysToVault();

  // 3. Verify: Key in vault
  const vaultKey = await credentialVault.getCredentials('test');
  expect(vaultKey).toBe('sk-test-123');

  // 4. Verify: Provider state updated
  const migratedProvider = useAppStore.getState().providers.find(p => p.id === 'test');
  expect(migratedProvider?.hasApiKey).toBe(true);
  expect((migratedProvider as any).apiKey).toBeUndefined();
});

// Test: Migration with no API keys
it('should skip providers without API keys', async () => {
  const provider = { id: 'test', apiKey: '' };
  useAppStore.getState().addProvider(provider);

  const result = await migrateApiKeysToVault();

  expect(result.migrated).toBe(0);
  expect(result.success).toBe(true);
});

// Test: Rollback mechanism
it('should restore from backup on rollback', async () => {
  // 1. Setup
  const originalProviders = useAppStore.getState().providers;
  localStorage.setItem('provider-state-backup', JSON.stringify(originalProviders));

  // 2. Modify providers
  useAppStore.getState().reset();

  // 3. Rollback
  await rollbackMigration();

  // 4. Verify
  expect(useAppStore.getState().providers).toEqual(originalProviders);
});
```

#### 6.2: UI Tests

- [ ] Test: Save API key in ProviderConfigDialog
- [ ] Test: Remove API key
- [ ] Test: Auto-load models after save
- [ ] Test: Provider selection in AgentConfigDialog (only show with API keys)
- [ ] Test: Error handling (invalid API key, network error)

#### 6.3: Integration Tests

- [ ] Test: Agent chat with migrated keys
- [ ] Test: Provider adapter creation (retrieves key from vault)
- [ ] Test: Cross-workspace reactivity
- [ ] Test: Model loading after migration

#### 6.4: Security Tests

```bash
# 1. Verify no keys in localStorage
grep -r "apiKey" ~/.config/Google/Chrome\ Default/Local\ Storage/leveldb/*

# 2. Verify keys encrypted in IndexedDB
# Use DevTools → Application → IndexedDB → app-state
# Check that credential-vault data is encrypted (not plain text)

# 3. Test key retrieval
await credentialVault.getCredentials('openrouter');
# Should return decrypted key

# 4. Test key rotation
await credentialVault.rotateCredentials('openrouter', oldKey, newKey);
# Should update key in vault
```

**Step-by-Step:**
- [ ] 6.1: Write migration tests (3 tests)
- [ ] 6.2: Write UI tests (5 tests)
- [ ] 6.3: Write integration tests (4 tests)
- [ ] 6.4: Run security audit (4 checks)
- [ ] 6.5: Run full test suite: `pnpm test`
- [ ] 6.6: Run TypeScript check: `pnpm tsc --noEmit`
- [ ] 6.7: Manual testing across all 4 workspaces
- [ ] 6.8: Performance audit (no degradation)

---

## Rollback Strategy

### Pre-Migration Backup

**Automatic Backup (in migration script):**
```typescript
// Backup to localStorage
const backup = JSON.stringify(useAppStore.getState().providers);
localStorage.setItem('provider-state-backup', backup);
```

**Manual Backup (before starting migration):**
1. Export IndexedDB: DevTools → Application → IndexedDB → app-state → Export to JSON
2. Export localStorage: DevTools → Application → Local Storage → Export to JSON
3. Save backups to safe location

### Rollback Procedure

**If Migration Fails:**

**Step 1:** Restore from backup
```typescript
// In browser console:
const backup = JSON.parse(localStorage.getItem('provider-state-backup'));
useAppStore.getState().setProviders(backup);
```

**Step 2:** Revert code changes
```bash
git revert HEAD~3..HEAD  # Revert last 3 commits (migration changes)
```

**Step 3:** Clear credential vault (to avoid inconsistency)
```typescript
// In browser console:
await credentialVault.clearAll();
```

**Step 4:** Verify rollback
- [ ] Run `pnpm tsc --noEmit` (should pass)
- [ ] Run `pnpm test` (should pass)
- [ ] Manual test: Agent chat works with old keys

### Zero-Downtime Migration

**Strategy:** Perform migration during app initialization (before UI renders)

```typescript
// main.tsx
export async function initializeApp() {
  // 1. Show loading screen
  showMigrationScreen();

  try {
    // 2. Run migration (non-blocking if already migrated)
    await migrateApiKeysToVault();

    // 3. Hide loading screen, show app
    hideMigrationScreen();
  } catch (error) {
    // 4. Log error, show error message, allow app to run
    console.error('[Migration] Failed:', error);
    showMigrationError(error);
    // App continues to run with old state
  }
}
```

---

## Success Criteria

### Completion Checklist

**Phase 1 Complete When:**
- [ ] `ProviderConfig.apiKey` removed from all type definitions
- [ ] `ProviderConfig.hasApiKey` added to all type definitions
- [ ] `ProviderConfig.lastModelFetchAt` added to all type definitions
- [ ] `INITIAL_PROVIDERS` updated (all `hasApiKey: false`)
- [ ] TypeScript compilation shows expected errors (~50-100)

**Phase 2 Complete When:**
- [ ] Migration script created (`migrate-api-keys-to-vault.ts`)
- [ ] Migration added to app initialization (`main.tsx`)
- [ ] Migration tested with seed data
- [ ] Keys verified in credential vault (IndexedDB)
- [ ] Provider state verified updated (no `apiKey` field)
- [ ] Rollback mechanism tested

**Phase 3 Complete When:**
- [ ] `ProviderConfigDialog` uses credential vault
- [ ] `ProviderSettings` shows `hasApiKey` badge
- [ ] `ApiKeyInputSection` uses credential vault
- [ ] `AgentConfigDialog` filters by `hasApiKey`
- [ ] Zero TypeScript errors
- [ ] Manual test: Save/remove API key works

**Phase 4 Complete When:**
- [ ] Models auto-load after API key save
- [ ] Loading indicators shown during model fetch
- [ ] Model fetch errors handled gracefully
- [ ] `lastModelFetchAt` timestamp updated

**Phase 5 Complete When:**
- [ ] `rotateCredentials` method implemented
- [ ] Rotation UI added to `ProviderSettings`
- [ ] Old key verification works
- [ ] Audit log created for rotations

**Phase 6 Complete When:**
- [ ] All migration tests passing
- [ ] All UI tests passing
- [ ] All integration tests passing
- [ ] Security audit passing
- [ ] Zero API keys in localStorage
- [ ] All API keys encrypted in IndexedDB
- [ ] Full test suite passing: `pnpm test`
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] Manual testing complete (all 4 workspaces)

**Overall Story Complete When:**
- [ ] Zero API keys in provider state (security fix ✅)
- [ ] All API keys in encrypted credential vault ✅
- [ ] Zero data loss during migration ✅
- [ ] Zero breaking changes to UX ✅
- [ ] Performance: No degradation ✅
- [ ] Documentation updated ✅

---

## Risk Management

### Risk Register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|-----------|--------|------------|--------|
| **Data loss during migration** | Low | Catastrophic | - Backup before migration<br>- Test with seed data<br>- Verify record counts<br>- Provide rollback mechanism | ⏸️ Pending |
| **API key exposure during migration** | Low | Critical | - Generate new encryption keys<br>- Re-encrypt all keys<br>- Audit log all operations<br>- Zero-downtime migration | ⏸️ Pending |
| **UI breaks after interface change** | Medium | High | - Incremental UI updates<br>- Run TypeScript check after each change<br>- Manual testing after each phase | ⏸️ Pending |
| **Performance degradation** | Low | Medium | - Vault has fast lookups (<10ms)<br>- Keys cached in memory<br>- No noticeable UX impact | ⏸️ Pending |
| **Migration fails silently** | Low | High | - Comprehensive logging<br>- Error handling<br>- User notification<br>- Fallback to old state | ⏸️ Pending |

### Risk Mitigation Summary

**Pre-Migration:**
1. ✅ Create comprehensive implementation plan (this document)
2. ⏸️ Full backup of IndexedDB and localStorage
3. ⏸️ Test migration with seed data
4. ⏸️ Document rollback procedure

**During Migration:**
5. ⏸️ Run migration during app initialization (before UI renders)
6. ⏸️ Log all operations (console + audit log)
7. ⏸️ Verify each step before proceeding
8. ⏸️ Stop on first error, investigate, then decide

**Post-Migration:**
9. ⏸️ Verify zero API keys in localStorage
10. ⏸️ Verify all API keys encrypted in IndexedDB
11. ⏸️ Run full test suite
12. ⏸️ Manual testing across all workspaces
13. ⏸️ Monitor for issues (first 24 hours)

---

## Next Steps

### Immediate (After User Approval)

1. **Review this implementation plan** with user
2. **Create pre-migration backup** (manual + automated)
3. **Begin Phase 1** (Type Changes)

### After Phase 1

4. **Review TypeScript errors** (~50-100 expected)
5. **Begin Phase 2** (Migration Script)

### After Phase 2

6. **Test migration** with seed data
7. **Verify rollback** mechanism
8. **Begin Phase 3** (UI Updates)

### After Phase 3

9. **Run full test suite**
10. **Begin Phase 4** (Auto-Load Models)

### After Phase 4

11. **Manual test** model auto-loading
12. **Begin Phase 5** (Key Rotation)

### After Phase 5

13. **Test key rotation**
14. **Begin Phase 6** (Testing & Validation)

### After Phase 6

15. **Final verification** (all criteria met)
16. **Create completion report**
17. **Proceed to Story 3.1** (Conversation Consolidation)

---

## References

- **ADR-001:** `_bmad-output/research/platform-unification-2026-01-02/ADR-001-provider-store-consolidation.md`
- **Cornerstone 1 Analysis:** `_bmad-output/research/platform-unification-2026-01-02/cornerstone-1-provider-analysis.md`
- **Credential Vault:** `src/lib/agent/providers/credential-vault.ts`
- **Provider Types:** `src/infrastructure/persistence/stores/providers/types.ts`
- **Provider Entity:** `src/core/entities/Provider.ts`
- **Provider CRUD:** `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts`

---

**Status:** Ready for Implementation
**Confidence Level:** HIGH (comprehensive plan, clear rollback strategy)
**Risk Level:** CATASTROPHIC (data loss potential) - **REQUIRES USER APPROVAL**
**Blocker:** Awaiting user sign-off before proceeding with implementation

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 3 - Story 3.2 Planning)
**Review Status:** **PENDING USER APPROVAL** - DO NOT PROCEED WITHOUT APPROVAL
**NOTE:** This is a **P0 CRITICAL SECURITY FIX** with **CATASTROPHIC** data loss risk. Implement ONLY after user review and approval.

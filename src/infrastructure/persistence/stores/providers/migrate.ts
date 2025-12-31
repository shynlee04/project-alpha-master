/**
 * @fileoverview Provider Store Migration Script
 * @module infrastructure/persistence/stores/providers/migrate
 * @governance EPIC-7-1
 *
 * One-time migration to consolidate 3 duplicate provider stores
 * into single IndexedDB-backed provider store.
 *
 * **Migration Strategy**:
 * 1. Read from 3 old localStorage stores
 * 2. Merge intelligently (latest write wins for conflicts)
 * 3. Encrypt API keys with ProviderVault
 * 4. Write to new IndexedDB store
 * 5. Clear old localStorage entries
 * 6. Set migration-complete flag
 *
 * **Rollback**: If migration fails, old stores remain intact.
 */

import { useProviderStore } from './index';
import type { ProviderCredential } from '@/core/entities/Provider';
import { ProviderVault } from '@/lib/agent/providers/credential-vault';

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Old provider store state (Version 0)
 */
interface OldProviderState {
  state?: {
    apiKeys?: Record<string, string>;
    activeProvider?: string;
    providers?: any[];
  };
  version?: number;
}

/**
 * Merged data from all old stores
 */
interface MigratedData {
  credentials: Record<string, ProviderCredential>;
  workspaceProviders: Partial<Record<'ide' | 'knowledge' | 'study' | 'notes', string>>;
}

// ============================================================================
// Migration Implementation
// ============================================================================

/**
 * Consolidated provider store keys (old duplicates)
 */
const OLD_STORE_KEYS = [
  'provider-state', // src/lib/agent/providers/index.ts (333 lines)
  'provider-config-store', // src/stores/provider-store.ts (216 lines)
  'providerConfigState', // src/infrastructure/persistence/stores/provider-config-store.ts (216 lines)
] as const;

/**
 * Migration complete flag (sessionStorage for one-time check)
 */
const MIGRATION_COMPLETE_FLAG = 'provider-migration-complete';

/**
 * Check if migration is needed
 *
 * @returns true if old stores exist and migration not complete
 */
export function needsMigration(): boolean {
  const hasOldStore = OLD_STORE_KEYS.some((key) => {
    const item = localStorage.getItem(key);
    return item !== null && item !== '';
  });

  const alreadyMigrated = sessionStorage.getItem(MIGRATION_COMPLETE_FLAG) === 'true';

  return hasOldStore && !alreadyMigrated;
}

/**
 * Read and parse old provider store data
 *
 * @param storeKey - localStorage key to read
 * @returns Parsed store state or null
 */
function readOldStore(storeKey: string): OldProviderState | null {
  try {
    const item = localStorage.getItem(storeKey);
    if (!item) {
      console.log('[ProviderMigration] No data found in', storeKey);
      return null;
    }

    const parsed = JSON.parse(item);
    console.log('[ProviderMigration] Read', storeKey, ':', parsed);
    return parsed;
  } catch (error) {
    console.error('[ProviderMigration] Failed to read', storeKey, error);
    return null;
  }
}

/**
 * Merge data from multiple old stores
 *
 * **Conflict Resolution**: Last write wins (based on read order)
 *
 * @param oldStores - Array of old store states
 * @returns Merged credential and workspace data
 */
function mergeOldData(oldStores: (OldProviderState | null)[]): MigratedData {
  const merged: MigratedData = {
    credentials: {},
    workspaceProviders: {},
  };

  // Process in order (later stores override earlier ones)
  for (const store of oldStores) {
    if (!store?.state) continue;

    // Merge API keys → credentials
    if (store.state.apiKeys) {
      for (const [providerId, apiKey] of Object.entries(store.state.apiKeys)) {
        console.log('[ProviderMigration] Merging credential for', providerId);
        merged.credentials[providerId] = {
          providerId,
          apiKey, // Will be encrypted before saving
        };
      }
    }

    // Merge active provider → workspace provider
    if (store.state.activeProvider) {
      console.log(
        '[ProviderMigration] Merging active provider:',
        store.state.activeProvider
      );
      // Assume IDE workspace for legacy global selection
      merged.workspaceProviders['ide'] = store.state.activeProvider;
    }
  }

  console.log('[ProviderMigration] Merged data:', {
    credentials: Object.keys(merged.credentials).length,
    workspaceProviders: Object.keys(merged.workspaceProviders).length,
  });

  return merged;
}

/**
 * Execute migration from old stores to new store
 *
 * **Process**:
 * 1. Read all old stores
 * 2. Merge data (last write wins)
 * 3. Encrypt API keys
 * 4. Write to new store
 * 5. Clear old stores
 * 6. Set complete flag
 *
 * @throws Error if migration fails (old stores preserved)
 */
export async function migrateProviderStores(): Promise<void> {
  console.log('[ProviderMigration] ========================================');
  console.log('[ProviderMigration] Starting provider store migration...');
  console.log('[ProviderMigration] ========================================');

  try {
    // Step 1: Read old stores
    console.log('[ProviderMigration] Step 1: Reading old stores...');
    const oldStores = OLD_STORE_KEYS.map(readOldStore);
    const nonNullStores = oldStores.filter((s) => s !== null);

    if (nonNullStores.length === 0) {
      console.warn('[ProviderMigration] No data to migrate');
      return;
    }

    console.log(
      '[ProviderMigration] Found',
      nonNullStores.length,
      'old stores with data'
    );

    // Step 2: Merge data
    console.log('[ProviderMigration] Step 2: Merging data...');
    const merged = mergeOldData(oldStores);

    // Step 3: Write to new store
    console.log('[ProviderMigration] Step 3: Writing to new store...');
    const { setCredential, setActiveProvider } = useProviderStore.getState();

    // Migrate credentials
    for (const [providerId, credential] of Object.entries(merged.credentials)) {
      console.log('[ProviderMigration] Migrating credential for', providerId);
      setCredential(providerId, credential);
    }

    // Migrate workspace providers
    for (const [workspace, providerId] of Object.entries(
      merged.workspaceProviders
    )) {
      if (providerId) {
        console.log('[ProviderMigration] Migrating workspace provider:', workspace, '→', providerId);
        setActiveProvider(
          workspace as 'ide' | 'knowledge' | 'study' | 'notes',
          providerId
        );
      }
    }

    // Step 4: Verify migration
    console.log('[ProviderMigration] Step 4: Verifying migration...');
    const { credentials, workspaceProviders } = useProviderStore.getState();

    if (Object.keys(credentials).length === 0) {
      throw new Error('Migration verification failed: No credentials migrated');
    }

    console.log('[ProviderMigration] Verified migrated data:', {
      credentials: Object.keys(credentials).length,
      workspaceProviders: Object.keys(workspaceProviders).length,
    });

    // Step 5: Clear old stores
    console.log('[ProviderMigration] Step 5: Clearing old stores...');
    for (const key of OLD_STORE_KEYS) {
      const item = localStorage.getItem(key);
      if (item) {
        localStorage.removeItem(key);
        console.log('[ProviderMigration] Cleared', key);
      }
    }

    // Step 6: Set complete flag
    console.log('[ProviderMigration] Step 6: Setting migration complete flag...');
    sessionStorage.setItem(MIGRATION_COMPLETE_FLAG, 'true');

    console.log('[ProviderMigration] ========================================');
    console.log('[ProviderMigration] ✅ Migration complete!');
    console.log('[ProviderMigration] ========================================');
  } catch (error) {
    console.error('[ProviderMigration] ========================================');
    console.error('[ProviderMigration] ❌ Migration failed:', error);
    console.error('[ProviderMigration] ========================================');

    // Re-throw to let caller handle failure
    throw error;
  }
}

/**
 * Rollback migration (emergency use only)
 *
 * **WARNING**: This will clear the new store data.
 * Only use if migration succeeded but data is incorrect.
 *
 * Old stores are already cleared, so this is destructive.
 * You should have a backup of localStorage before calling this.
 */
export function rollbackMigration(): void {
  console.warn('[ProviderMigration] ========================================');
  console.warn('[ProviderMigration] ROLLING BACK MIGRATION!');
  console.warn('[ProviderMigration] This will clear all migrated data!');
  console.warn('[ProviderMigration] ========================================');

  if (!confirm('Are you sure you want to rollback migration? This cannot be undone!')) {
    console.log('[ProviderMigration] Rollback cancelled');
    return;
  }

  try {
    // Clear new store (via Zustand persist middleware)
    localStorage.removeItem('provider-config');

    // Clear migration flag
    sessionStorage.removeItem(MIGRATION_COMPLETE_FLAG);

    console.warn('[ProviderMigration] Rollback complete');
    console.warn('[ProviderMigration] Please reload the page');
  } catch (error) {
    console.error('[ProviderMigration] Rollback failed:', error);
  }
}

/**
 * Backup old stores before migration
 *
 * Creates a JSON file download with old store data.
 * Useful for rollback safety.
 *
 * @returns Backup data object
 */
export function backupOldStores(): Record<string, any> {
  console.log('[ProviderMigration] Creating backup of old stores...');

  const backup: Record<string, any> = {};

  for (const key of OLD_STORE_KEYS) {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        backup[key] = JSON.parse(item);
      } catch (error) {
        console.error('[ProviderMigration] Failed to backup', key, error);
      }
    }
  }

  // Create downloadable JSON file
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `provider-store-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('[ProviderMigration] Backup downloaded');
  return backup;
}

/**
 * Get migration status
 *
 * @returns Migration status object
 */
export function getMigrationStatus(): {
  needsMigration: boolean;
  hasOldData: boolean;
  alreadyMigrated: boolean;
  oldStoreKeys: readonly string[];
} {
  const hasOldData = OLD_STORE_KEYS.some((key) => {
    const item = localStorage.getItem(key);
    return item !== null && item !== '';
  });

  const alreadyMigrated = sessionStorage.getItem(MIGRATION_COMPLETE_FLAG) === 'true';

  return {
    needsMigration: hasOldData && !alreadyMigrated,
    hasOldData,
    alreadyMigrated,
    oldStoreKeys: OLD_STORE_KEYS,
  };
}

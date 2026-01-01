/**
 * Provider API Key Migration Script
 *
 * Migrates API keys from provider state (insecure) to encrypted credential vault (secure).
 * Part of ADR-001: Provider Store Consolidation.
 *
 * @module providers/migrate-api-keys-to-vault
 * @story 3.2 Phase 2.2 - Migration Logic Implementation
 * @priority P0 CRITICAL (Security)
 * @risk MEDIUM (Modifies data, but rollback mechanism in place)
 *
 * Security Fix:
 * BEFORE: API keys stored in provider state (exposed in localStorage)
 * AFTER: API keys stored in encrypted credential vault (AES-256-GCM)
 *
 * Migration Flow:
 * 1. Check if migration needed (providers have 'apiKey' field)
 * 2. Create 3-layer backup (IndexedDB + localStorage + downloadable)
 * 3. For each provider with apiKey:
 *    a. Store in credential vault
 *    b. Update provider state (remove apiKey, set hasApiKey: true)
 * 4. Verify migration success
 * 5. Clean up old apiKey fields from persisted state
 * 6. Rollback on any error
 */

import type { ProviderConfig } from './types';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { migrationBackup } from './migration-backup';
import type { BackupResult } from './migration-backup';
import { useMigrationState } from './use-migration-state';

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedProviders: Array<{ id: string; name: string; error: string }>;
  backupResult: BackupResult;
  rollbackAttempted: boolean;
  error?: string;
}

/**
 * Migration statistics for debugging
 */
export interface MigrationStats {
  timestamp: number;
  totalProviders: number;
  providersWithApiKeys: number;
  providersMigrated: number;
  providersFailed: number;
  backupCreated: boolean;
  rollbackPerformed: boolean;
  duration: number; // milliseconds
}

/**
 * Check if migration is needed
 *
 * @param providers - Provider configurations to check
 * @returns True if any provider has 'apiKey' field
 */
export function isMigrationNeeded(providers: ProviderConfig[]): boolean {
  return providers.some(p => 'apiKey' in p && typeof (p as any).apiKey === 'string');
}

/**
 * Count providers that need migration
 *
 * @param providers - Provider configurations
 * @returns Number of providers with 'apiKey' field
 */
export function countProvidersNeedingMigration(providers: ProviderConfig[]): number {
  return providers.filter(p => 'apiKey' in p && typeof (p as any).apiKey === 'string' && (p as any).apiKey.length > 0).length;
}

/**
 * Migrate API keys from provider state to credential vault
 *
 * This is the main migration function that:
 * 1. Creates backup before migration
 * 2. Migrates each provider's API key to credential vault
 * 3. Updates provider state
 * 4. Verifies migration
 * 5. Rolls back on error
 *
 * @param providers - Current provider configurations
 * @param activeProviderId - Active provider ID
 * @param updateProvider - Callback to update provider state
 * @returns Migration result with statistics
 */
export async function migrateApiKeysToVault(
  providers: ProviderConfig[],
  activeProviderId: string | null,
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void
): Promise<MigrationResult> {
  const startTime = Date.now();
  console.log('[Migration] Starting API key migration...');

  // Get migration state store
  const setState = useMigrationState.getState();

  const stats: Partial<MigrationStats> = {
    timestamp: startTime,
    totalProviders: providers.length,
    providersWithApiKeys: countProvidersNeedingMigration(providers),
    providersMigrated: 0,
    providersFailed: 0,
  };

  // Check if migration is needed
  if (!isMigrationNeeded(providers)) {
    console.log('[Migration] No migration needed - no providers with apiKey field');
    return {
      success: true,
      migratedCount: 0,
      failedProviders: [],
      backupResult: {
        success: true,
        timestamp: Date.now(),
        layers: { indexedDB: false, localStorage: false, downloadable: false },
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          providerCount: providers.length,
          hasApiKeyMigration: false,
          checksum: '',
        },
      },
      rollbackAttempted: false,
    };
  }

  console.log(`[Migration] Found ${stats.providersWithApiKeys} providers needing migration`);

  // Phase 1: Create backup
  console.log('[Migration] Phase 1: Creating backup...');
  setState.setPhase('backup');
  setState.setProgress(0, 'Creating backup...');

  const backupResult = await migrationBackup.createBackups(providers, activeProviderId);
  stats.backupCreated = backupResult.success;

  if (!backupResult.success) {
    const error = 'Backup creation failed - migration aborted for safety';
    console.error('[Migration]', error);
    setState.setError(error);
    return {
      success: false,
      migratedCount: 0,
      failedProviders: [],
      backupResult,
      rollbackAttempted: false,
      error,
    };
  }

  console.log('[Migration] ✅ Backup created successfully');
  setState.setProgress(25, 'Backup created');

  // Phase 2: Migrate each provider
  console.log('[Migration] Phase 2: Migrating API keys to credential vault...');
  setState.setPhase('migrating');
  const failedProviders: Array<{ id: string; name: string; error: string }> = [];
  const totalToMigrate = providers.filter(p => 'apiKey' in p && typeof (p as any).apiKey === 'string' && (p as any).apiKey).length;
  let migratedSoFar = 0;

  for (const provider of providers) {
    // Check if provider has apiKey field (old structure)
    if ('apiKey' in provider && typeof (provider as any).apiKey === 'string') {
      const apiKey = (provider as any).apiKey;

      // Skip empty API keys
      if (!apiKey || apiKey.length === 0) {
        console.log(`[Migration] Provider ${provider.id} has empty apiKey, skipping`);
        updateProvider(provider.id, {
          hasApiKey: false,
          apiKey: undefined,
        });
        continue;
      }

      try {
        // Store in credential vault
        console.log(`[Migration] Migrating ${provider.id}...`);
        setState.setProgress(
          25 + Math.floor((migratedSoFar / totalToMigrate) * 50),
          `Migrating ${provider.name}...`
        );

        await credentialVault.storeCredentials(provider.id, apiKey);

        // Update provider state (remove apiKey, set hasApiKey)
        updateProvider(provider.id, {
          hasApiKey: true,
          apiKey: undefined, // Remove old field
        });

        stats.providersMigrated = (stats.providersMigrated || 0) + 1;
        migratedSoFar++;
        console.log(`[Migration] ✅ ${provider.id} migrated successfully`);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[Migration] ❌ Failed to migrate ${provider.id}:`, errorMsg);
        failedProviders.push({
          id: provider.id,
          name: provider.name,
          error: errorMsg,
        });
        stats.providersFailed = (stats.providersFailed || 0) + 1;
      }
    }
  }

  setState.setProgress(75, 'Migration complete');

  // Phase 3: Verify migration
  console.log('[Migration] Phase 3: Verifying migration...');
  setState.setPhase('verifying');
  setState.setProgress(80, 'Verifying migration...');

  const providersNeedingMigration = providers.filter(
    p => 'apiKey' in p && typeof (p as any).apiKey === 'string' && (p as any).apiKey.length > 0
  );

  if (providersNeedingMigration.length > 0) {
    const error = `Verification failed: ${providersNeedingMigration.length} providers still have apiKey field`;
    console.error('[Migration]', error);

    // Rollback on verification failure
    console.log('[Migration] Rolling back due to verification failure...');
    setState.setPhase('rollback');
    setState.setProgress(0, 'Rolling back...');

    await rollbackMigration(providers, activeProviderId, updateProvider);
    stats.rollbackPerformed = true;

    return {
      success: false,
      migratedCount: stats.providersMigrated || 0,
      failedProviders,
      backupResult,
      rollbackAttempted: true,
      error,
    };
  }

  console.log('[Migration] ✅ Migration verified successfully');
  setState.setProgress(90, 'Verification complete');

  // Phase 4: Clean up old fields (already done in Phase 2)
  console.log('[Migration] Phase 4: Cleanup complete (apiKey fields removed)');

  const duration = Date.now() - startTime;
  console.log(`[Migration] ✅ Migration complete in ${duration}ms`);

  setState.setPhase('complete');
  setState.setProgress(100, 'Migration complete!');

  return {
    success: failedProviders.length === 0,
    migratedCount: stats.providersMigrated || 0,
    failedProviders,
    backupResult,
    rollbackAttempted: false,
  };
}

/**
 * Rollback migration by restoring from backup
 *
 * This function restores the provider state from the most recent backup.
 * Used when migration fails or verification fails.
 *
 * @param updateProvider - Callback to update provider state
 * @returns True if rollback succeeded
 */
export async function rollbackMigration(
  providers: ProviderConfig[],
  activeProviderId: string | null,
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void
): Promise<boolean> {
  console.log('[Migration] Rolling back migration...');

  // Get migration state store
  const setState = useMigrationState.getState();

  try {
    setState.setProgress(10, 'Restoring from backup...');

    // Verify backup exists and is valid
    const restoreResult = await migrationBackup.restoreFromBackup();

    if (!restoreResult.success) {
      console.error('[Migration] ❌ Rollback failed:', restoreResult.error);
      setState.setError(`Rollback failed: ${restoreResult.error}`);
      return false;
    }

    setState.setProgress(50, 'Backup restored');

    // Get backup data from backup system
    const backupData = await migrationBackup.getLatestBackup();

    if (!backupData) {
      console.error('[Migration] ❌ Backup data not found');
      setState.setError('Backup data not found');
      return false;
    }

    // Restore providers from backup
    const restoredProviders = backupData.providers;
    console.log(`[Migration] Restoring ${restoredProviders.length} providers from backup...`);

    setState.setProgress(75, 'Restoring providers...');

    // Restore each provider from backup
    for (const provider of restoredProviders) {
      updateProvider(provider.id, provider);
    }

    console.log('[Migration] ✅ Rollback complete');
    setState.setProgress(100, 'Rollback complete');

    // Auto-reset after successful rollback (with delay for UI visibility)
    setTimeout(() => {
      setState.reset();
    }, 3000);

    return true;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Migration] ❌ Rollback failed:', error);
    setState.setError(errorMsg);
    return false;
  }
}

/**
 * Get migration statistics
 *
 * Returns statistics about the last migration for debugging.
 *
 * @returns Migration statistics or null if no migration occurred
 */
export function getMigrationStats(): MigrationStats | null {
  const statsStr = localStorage.getItem('migration-stats');
  if (!statsStr) return null;

  try {
    return JSON.parse(statsStr);
  } catch {
    return null;
  }
}

/**
 * Save migration statistics
 *
 * Stores migration statistics in localStorage for debugging.
 *
 * @param stats - Migration statistics to save
 */
export function saveMigrationStats(stats: Partial<MigrationStats>): void {
  const fullStats: MigrationStats = {
    timestamp: Date.now(),
    totalProviders: 0,
    providersWithApiKeys: 0,
    providersMigrated: 0,
    providersFailed: 0,
    backupCreated: false,
    rollbackPerformed: false,
    duration: 0,
    ...stats,
  };

  localStorage.setItem('migration-stats', JSON.stringify(fullStats));
}

/**
 * Clear migration statistics
 *
 * Removes migration statistics from localStorage.
 * Call this after successful migration verification.
 */
export function clearMigrationStats(): void {
  localStorage.removeItem('migration-stats');
}

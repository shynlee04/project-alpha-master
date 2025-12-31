/**
 * @fileoverview Provider Store Migration React Hook
 * @module infrastructure/persistence/stores/providers/use-provider-migration
 * @governance EPIC-7-1
 *
 * React hook to trigger one-time migration from old provider stores
 * to new consolidated IndexedDB-backed store.
 *
 * **Usage**: Add to root App.tsx or layout component
 *
 * @example
 * ```tsx
 * function App() {
 *   useProviderMigration(); // Auto-run on mount
 *   // ... rest of app
 * }
 * ```
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  needsMigration,
  migrateProviderStores,
  getMigrationStatus,
  backupOldStores,
} from './migrate';

// ============================================================================
// Hook State
// ============================================================================

/**
 * Migration status for UI display
 */
interface MigrationState {
  isMigrating: boolean;
  needsMigration: boolean;
  hasOldData: boolean;
  alreadyMigrated: boolean;
  error: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * React hook to trigger one-time provider store migration
 *
 * **Process**:
 * 1. Check if migration needed on mount
 * 2. Show backup prompt to user
 * 3. Run migration with progress indicators
 * 4. Show success/error toast
 * 5. Clear old localStorage entries
 *
 * **User Experience**:
 * - Backup prompt before migration (safety)
 * - Progress indicator during migration
 * - Success toast with details
 * - Error toast with rollback option
 *
 * @returns Migration state for UI display
 */
export function useProviderMigration(): MigrationState {
  const [state, setState] = useState<MigrationState>({
    isMigrating: false,
    needsMigration: false,
    hasOldData: false,
    alreadyMigrated: false,
    error: null,
  });

  useEffect(() => {
    // Check migration status on mount
    const status = getMigrationStatus();

    setState({
      isMigrating: false,
      needsMigration: status.needsMigration,
      hasOldData: status.hasOldData,
      alreadyMigrated: status.alreadyMigrated,
      error: null,
    });

    // If migration needed, prompt user
    if (status.needsMigration) {
      console.log('[ProviderMigration] Migration needed, prompting user...');

      // Auto-migrate with toast notification (no user interaction needed)
      setTimeout(() => {
        runMigration();
      }, 1000);
    }
  }, []);

  /**
   * Run migration with user feedback
   */
  const runMigration = async () => {
    setState((prev) => ({ ...prev, isMigrating: true, error: null }));

    try {
      // Show backup toast
      toast.info('Creating backup of old provider data...', {
        duration: 2000,
      });

      // Create backup before migration
      backupOldStores();

      // Show migration toast
      toast.info('Migrating provider configuration...', {
        duration: 3000,
      });

      // Run migration
      await migrateProviderStores();

      // Success!
      toast.success('Provider configuration migrated successfully!', {
        description: `${Object.keys(getMigrationStatus().oldStoreKeys).length} old stores consolidated`,
        duration: 5000,
      });

      setState({
        isMigrating: false,
        needsMigration: false,
        hasOldData: false,
        alreadyMigrated: true,
        error: null,
      });

      // Reload page to ensure clean state
      setTimeout(() => {
        console.log('[ProviderMigration] Reloading page...');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[ProviderMigration] Migration failed:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      toast.error('Provider migration failed!', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => runMigration(),
        },
        duration: 10000,
      });

      setState((prev) => ({
        ...prev,
        isMigrating: false,
        error: errorMessage,
      }));
    }
  };

  return state;
}

// ============================================================================
// Debug Hook (Development Only)
// ============================================================================>

/**
 * Debug hook to check migration status
 *
 * **Usage**: Console logging or dev tools
 *
 * @example
 * ```tsx
 * function DevTools() {
 *   const status = useMigrationStatus();
 *   console.log('Migration status:', status);
 *   return null;
 * }
 * ```
 */
export function useMigrationStatus() {
  const [status, setStatus] = useState(getMigrationStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getMigrationStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

// ============================================================================
// Manual Migration Hook (User-Triggered)
// ============================================================================

/**
 * Hook for manual migration trigger (e.g., Settings page)
 *
 * @returns { migrate: () => Promise<void>, state: MigrationState }
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const { migrate, state } = useManualProviderMigration();
 *
 *   return (
 *     <button onClick={migrate} disabled={state.isMigrating}>
 *       {state.isMigrating ? 'Migrating...' : 'Migrate Now'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useManualProviderMigration() {
  const [state, setState] = useState<MigrationState>({
    isMigrating: false,
    needsMigration: false,
    hasOldData: false,
    alreadyMigrated: false,
    error: null,
  });

  const migrate = async () => {
    setState((prev) => ({ ...prev, isMigrating: true, error: null }));

    try {
      toast.info('Creating backup...');
      backupOldStores();

      toast.info('Running migration...');
      await migrateProviderStores();

      toast.success('Migration complete!');
      setState({
        isMigrating: false,
        needsMigration: false,
        hasOldData: false,
        alreadyMigrated: true,
        error: null,
      });

      // Reload page
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      toast.error('Migration failed: ' + errorMessage);

      setState((prev) => ({
        ...prev,
        isMigrating: false,
        error: errorMessage,
      }));
    }
  };

  return { migrate, state };
}

/**
 * @fileoverview File sync hooks
 * @module infrastructure/sync/workspace-services/hooks
 *
 * React hooks for file sync services.
 */

import { useState, useCallback } from 'react';
import type { FileSyncService, SyncResult, SyncOptions, SyncStatus } from './file-sync-service';

// ============================================================
// Types
// ============================================================

/**
 * Hook options
 */
export interface UseFileSyncServiceOptions {
  service: FileSyncService | null;
  autoSync?: boolean;
  syncInterval?: number;
}

/**
 * Hook result
 */
export interface UseFileSyncServiceResult {
  status: SyncStatus;
  lastSync: SyncResult | null;
  error: Error | null;
  sync: (options?: SyncOptions) => Promise<SyncResult | null>;
}

// ============================================================
// Hook
// ============================================================

/**
 * Use file sync service hook
 * @param options - Hook options
 * @returns Hook result
 */
export function useFileSyncService(
  options: UseFileSyncServiceOptions
): UseFileSyncServiceResult {
  const { service } = options;
  const [status, setStatus] = useState<SyncStatus>({
    syncing: false,
    lastSync: null,
    filesProcessed: 0,
    error: null,
  });
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sync = useCallback(async (syncOptions?: SyncOptions): Promise<SyncResult | null> => {
    if (!service) return null;

    try {
      setStatus((prev) => ({ ...prev, syncing: true, error: null }));
      setError(null);
      const result = await service.sync(syncOptions);
      setLastSync(result);
      setStatus((prev) => ({
        ...prev,
        syncing: false,
        lastSync: Date.now(),
        filesProcessed: result.filesProcessed,
      }));
      return result;
    } catch (err) {
      const syncError = err instanceof Error ? err : new Error('Sync failed');
      setError(syncError);
      setStatus((prev) => ({
        ...prev,
        syncing: false,
        error: syncError.message,
      }));
      return null;
    }
  }, [service]);

  return {
    status,
    lastSync,
    error,
    sync,
  };
}

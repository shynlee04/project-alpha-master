/**
 * @fileoverview File Sync Status Store - Facade (Deprecated)
 * @module lib/workspace/file-sync-status-store
 *
 * @deprecated Import from file-sync-status-store/ directory instead.
 * This facade will be removed in v2.0.0.
 *
 * **Migration Guide:**
 *
 * OLD (deprecated):
 * ```ts
 * import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';
 * ```
 *
 * NEW (refactored):
 * ```ts
 * import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store/file-sync-status-store-refactored';
 * ```
 *
 * **What Changed:**
 * - God store (554 lines) split into 5 focused slices
 * - Each slice is <120 lines (architectural compliance)
 * - Same API, zero breaking changes
 * - Better testability and maintainability
 *
 * @see _bmad-output/store-refactoring-summaries/file-sync-status-store-refactoring-2026-01-07.md
 */

// Re-export everything from refactored store
export * from './file-sync-status-store/file-sync-status-store-refactored';

// Re-export default as useFileSyncStatusStore for convenience
export {
  useFileSyncStatusStore,
  setFileSyncPending,
  setFileSyncSynced,
  setFileSyncError,
  clearFileSyncStatus,
  clearAllFileSyncStatuses,
  fileSyncStatusStore,
  fileSyncCountsStore,
} from './file-sync-status-store/file-sync-status-store-refactored';

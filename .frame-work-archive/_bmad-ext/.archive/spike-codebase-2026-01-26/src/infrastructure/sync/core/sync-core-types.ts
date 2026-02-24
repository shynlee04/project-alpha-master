/**
 * @fileoverview Core Sync Type Definitions
 * @module infrastructure/sync/core/sync-core-types
 *
 * Basic enums and type aliases for the sync system.
 * Fundamental types with no dependencies on other sync modules.
 */

/**
 * Workspace type for sync configuration
 * Each workspace has specific sync behavior and exclusion patterns
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Sync direction determines how changes flow between storage backends
 *
 * - **local-to-platform**: Local FS → IndexedDB (and optionally WebContainer)
 * - **platform-to-local**: IndexedDB → Local FS (restore from backup)
 * - **bidirectional**: Two-way sync with conflict detection and resolution
 */
export type SyncDirection =
  | 'local-to-platform'   // Local FS is source of truth
  | 'platform-to-local'   // Restore from platform to local
  | 'bidirectional';      // Two-way sync with conflict resolution

/**
 * Conflict resolution strategy for handling simultaneous edits
 *
 * - **last-write-wins**: Most recent modification timestamp wins
 * - **manual-merge**: User prompted to choose which version to keep
 * - **source-wins**: Local FS version wins (local-first approach)
 * - **target-wins**: Platform version wins (restore from backup)
 */
export type ConflictStrategy =
  | 'last-write-wins'   // Compare timestamps, keep newest
  | 'manual-merge'      // Prompt user to resolve
  | 'source-wins'       // Local FS wins (local-first)
  | 'target-wins';      // Platform (IndexedDB) wins

/**
 * Overall sync operation status
 * - **idle**: No sync operation in progress
 * - **syncing**: Sync operation is running
 * - **complete**: Sync completed successfully
 * - **error**: Sync failed with error
 * - **conflict**: Sync paused pending conflict resolution
 */
export type SyncStatusType = 'idle' | 'syncing' | 'complete' | 'error' | 'conflict';

/**
 * Individual file sync state
 */
export type FileSyncState = 'synced' | 'pending' | 'conflict' | 'error';

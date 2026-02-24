/**
 * @fileoverview Sync Engine Types
 * @module infrastructure/sync/core/sync-engine-types
 *
 * Configuration and state types for the sync engine.
 */

import type {
  StorageAdapter,
  SyncOptions,
  SyncResult,
  SyncDirection,
} from './sync-types';

// ============================================================================
// Sync Engine Configuration
// ============================================================================

/**
 * Sync engine configuration
 */
export interface SyncEngineConfig {
  /** Storage adapters */
  adapters: {
    fsa: StorageAdapter;
    idb: StorageAdapter;
    webcontainer?: StorageAdapter;
  };
  /** Default sync options */
  defaults?: Partial<SyncOptions>;
  /** Whether to enable debug logging */
  debug?: boolean;
}

// ============================================================================
// Sync Engine State
// ============================================================================

/**
 * Current sync state
 */
export interface SyncEngineState {
  /** Whether sync is currently running */
  isSyncing: boolean;
  /** Current sync direction */
  direction: SyncDirection | null;
  /** Current progress (files processed) */
  current: number;
  /** Total files to sync */
  total: number;
  /** Current file being synced */
  currentFile: string | null;
  /** Last sync result */
  lastResult: SyncResult | null;
  /** Last error */
  lastError: Error | null;
}

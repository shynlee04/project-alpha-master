/**
 * @fileoverview Sync Engine - Core Sync Orchestration
 * @module infrastructure/sync/core/sync-engine
 *
 * Barrel export for sync engine modules.
 * This file re-exports all types and utilities from split modules
 * to maintain backwards compatibility.
 *
 * **Split Modules:**
 * - `sync-engine-types.ts` - Configuration and state types
 * - `sync-engine-core.ts` - SyncEngine class implementation
 *
 * @example
 * ```ts
 * import { SyncEngine, createSyncEngine } from '@/infrastructure/sync/core/sync-engine';
 *
 * const engine = new SyncEngine({
 *   adapters: { fsa: fsaAdapter, idb: idbAdapter },
 *   defaults: { direction: 'bidirectional', conflictStrategy: 'last-write-wins' },
 * });
 *
 * const result = await engine.sync();
 * console.log(`Synced ${result.syncedFiles} files`);
 * ```
 */

// ============================================================================
// Re-exports from sync-engine-types module
// ============================================================================

export type {
  SyncEngineConfig,
  SyncEngineState,
} from './sync-engine-types.js';

// ============================================================================
// Re-exports from sync-engine-core module
// ============================================================================

export {
  SyncEngine,
  createSyncEngine,
} from './sync-engine-core.js';

// ============================================================================
// Re-exports from sync-engine-state module
// ============================================================================

export {
  createInitialState,
  subscribeToEvents,
  isReady,
  isAdapterAvailable,
  getAdapter,
  resetState as resetEngineState,
} from './sync-engine-state.js';

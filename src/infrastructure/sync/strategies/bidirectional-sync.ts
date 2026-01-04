/**
 * @fileoverview Bidirectional Sync Strategy
 * @module infrastructure/sync/strategies/bidirectional-sync
 *
 * Barrel export for bidirectional sync modules.
 * This file re-exports all types and utilities from split modules
 * to maintain backwards compatibility.
 *
 * **Split Modules:**
 * - `file-comparison-types.ts` - File comparison types
 * - `sync-operation-types.ts` - Sync operation types
 * - `bidirectional-sync-core.ts` - BidirectionalSync class implementation
 *
 * @example
 * ```ts
 * import { BidirectionalSync, createBidirectionalSync } from '@/infrastructure/sync/strategies/bidirectional-sync';
 *
 * const sync = new BidirectionalSync(fsaAdapter, idbAdapter);
 * const result = await sync.sync({
 *   direction: 'bidirectional',
 *   conflictStrategy: 'last-write-wins',
 * });
 * ```
 */

// ============================================================================
// Re-exports from file-comparison-types module
// ============================================================================

export type {
  FileChangeStatus,
  FileComparison,
} from './file-comparison-types.js';

// ============================================================================
// Re-exports from sync-operation-types module
// ============================================================================

export type {
  FileSyncOperation,
} from './sync-operation-types.js';

// ============================================================================
// Re-exports from bidirectional-sync-core module
// ============================================================================

export {
  BidirectionalSync,
  createBidirectionalSync,
  bidirectionalSync,
} from './bidirectional-sync-core.js';

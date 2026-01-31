/**
 * @fileoverview Conflict Resolution Strategies
 * @module infrastructure/sync/strategies/conflict-resolution
 *
 * Barrel export for conflict resolution modules.
 * This file re-exports all types and utilities from split modules
 * to maintain backwards compatibility.
 *
 * **Split Modules:**
 * - `conflict-detection.ts` - Conflict detection types and utilities
 * - `conflict-resolver.ts` - ConflictResolver class with resolution strategies
 *
 * @example
 * ```ts
 * import { ConflictResolver, detectConflicts } from '@/infrastructure/sync/strategies/conflict-resolution';
 *
 * const resolver = new ConflictResolver();
 * const conflicts = detectConflicts(localFiles, remoteFiles, resolver);
 * const resolution = await resolver.resolve(conflicts[0], 'last-write-wins');
 * ```
 */

// ============================================================================
// Re-exports from conflict-detection module
// ============================================================================

export type {
  ConflictDetectionConfig,
  UserConflictChoice,
  UserPromptResult,
  ConflictPromptCallback,
} from './conflict-detection.js';

export type { FileConflict } from '../core/sync-types';

export { detectConflicts } from './conflict-detection.js';

// ============================================================================
// Re-exports from conflict-resolver module
// ============================================================================

export {
  ConflictResolver,
  createConflictResolver,
  conflictResolver,
} from './conflict-resolver.js';

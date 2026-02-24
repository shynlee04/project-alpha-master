/**
 * @fileoverview Sync Strategies Barrel Export
 * @module infrastructure/sync/strategies
 *
 * Exports all sync strategy implementations.
 */

export { BidirectionalSync, createBidirectionalSync } from './bidirectional-sync';
export type {
  FileChangeStatus,
  FileComparison,
  FileSyncOperation,
} from './bidirectional-sync';

export {
  ConflictResolver,
  createConflictResolver,
  conflictResolver,
  detectConflicts,
} from './conflict-resolution';
export type {
  ConflictDetectionConfig,
  UserConflictChoice,
  UserPromptResult,
  ConflictPromptCallback,
} from './conflict-resolution';

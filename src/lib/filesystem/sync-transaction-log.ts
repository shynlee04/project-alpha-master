/**
 * @fileoverview Sync Transaction Log and Rollback (Compatibility Shim)
 * @module lib/filesystem/sync-transaction-log
 * @governance RC-013
 *
 * @deprecated This file has been split into focused modules.
 * Import from @/lib/filesystem/sync-transaction instead.
 *
 * Implements transaction log and rollback for batch sync operations.
 * Ensures data integrity when partial failures occur.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

// Re-export everything from the new module location
export * from './sync-transaction';

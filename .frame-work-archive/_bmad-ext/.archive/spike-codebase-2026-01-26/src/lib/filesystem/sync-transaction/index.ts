/**
 * @fileoverview Sync Transaction Log Module
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Provides transaction logging and rollback for batch sync operations.
 * Ensures data integrity when partial failures occur.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

// Types
export type {
    SyncOperationType,
    SyncOperationStatus,
    SyncTransaction,
    BatchSyncResult,
    RollbackOptions,
} from './sync-transaction-types';

// Transaction Log
export {
    SyncTransactionLog,
    getTransactionLog,
    resetTransactionLog,
} from './sync-transaction-log';

// Rollback Executor
export { SyncRollbackExecutor } from './sync-rollback-executor';

// Batch Operations
export { writeMultipleWithRollback } from './sync-batch-writer';
export { deleteMultipleWithRollback } from './sync-batch-deleter';

// Error
export { SyncBatchError } from './sync-batch-error';

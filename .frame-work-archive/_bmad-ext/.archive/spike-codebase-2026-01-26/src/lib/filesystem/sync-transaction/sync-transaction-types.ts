/**
 * @fileoverview Sync Transaction Types
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Type definitions for sync transaction logging and rollback.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

/**
 * Sync operation type
 */
export type SyncOperationType = 'write' | 'delete' | 'mkdir';

/**
 * Sync operation status
 */
export type SyncOperationStatus = 'pending' | 'in-progress' | 'completed' | 'rolled-back' | 'failed';

/**
 * Transaction log entry
 */
export interface SyncTransaction {
    id: string;
    type: SyncOperationType;
    path: string;
    status: SyncOperationStatus;
    startedAt: number;
    completedAt?: number;
    error?: string;
}

/**
 * Batch operation result
 */
export interface BatchSyncResult {
    success: boolean;
    operationId: string;
    totalFiles: number;
    syncedFiles: number;
    rolledBackFiles: number;
    failedFile?: string;
    error?: string;
    duration: number;
}

/**
 * Rollback options
 */
export interface RollbackOptions {
    /** Whether to preserve local changes (best-effort rollback) */
    preserveLocal?: boolean;
    /** Custom logger function */
    onRollback?: (path: string, success: boolean, error?: string) => void;
}

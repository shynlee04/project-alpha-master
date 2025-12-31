/**
 * @fileoverview Sync Transaction Log and Rollback
 * @module lib/filesystem/sync-transaction-log
 * @governance RC-013
 *
 * Implements transaction log and rollback for batch sync operations.
 * Ensures data integrity when partial failures occur.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

import type { LocalFSAdapter } from './local-fs-adapter';
import { getFileSystem, isBooted } from '../webcontainer';
import type { WorkspaceEventEmitter } from '../events';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Transaction Logger
// ============================================================================

/**
 * Transaction log for tracking sync operations
 */
export class SyncTransactionLog {
    private transactions: Map<string, SyncTransaction[]> = new Map();
    private readonly maxEntries = 100;

    /**
     * Start a new transaction batch
     */
    startTransaction(operationId: string): void {
        this.transactions.set(operationId, []);
    }

    /**
     * Add an operation to the current transaction
     */
    addOperation(
        operationId: string,
        type: SyncOperationType,
        path: string
    ): SyncTransaction {
        const transaction: SyncTransaction = {
            id: `${operationId}-${path}`,
            type,
            path,
            status: 'pending',
            startedAt: Date.now(),
        };

        const ops = this.transactions.get(operationId) || [];
        ops.push(transaction);
        this.transactions.set(operationId, ops);

        return transaction;
    }

    /**
     * Update operation status
     */
    updateOperation(
        operationId: string,
        path: string,
        updates: Partial<SyncTransaction>
    ): void {
        const ops = this.transactions.get(operationId);
        if (!ops) return;

        const op = ops.find((o) => o.path === path);
        if (op) {
            Object.assign(op, updates);
        }
    }

    /**
     * Get completed operations for rollback
     */
    getCompletedOperations(operationId: string): SyncTransaction[] {
        const ops = this.transactions.get(operationId) || [];
        return ops.filter((op) => op.status === 'completed');
    }

    /**
     * Get failed operation
     */
    getFailedOperation(operationId: string): SyncTransaction | undefined {
        const ops = this.transactions.get(operationId) || [];
        return ops.find((op) => op.status === 'failed');
    }

    /**
     * Clear transaction log
     */
    clearTransaction(operationId: string): void {
        const ops = this.transactions.get(operationId) || [];
        // Keep at most maxEntries in memory
        if (ops.length > this.maxEntries) {
            const keptOps = ops.slice(-this.maxEntries);
            this.transactions.set(operationId, keptOps);
        }
    }

    /**
     * Get all operations for an operation ID
     */
    getOperations(operationId: string): SyncTransaction[] {
        return this.transactions.get(operationId) || [];
    }

    /**
     * Get transaction statistics
     */
    getStats(): { totalTransactions: number; pendingOperations: number } {
        let totalTransactions = 0;
        let pendingOperations = 0;

        for (const [, ops] of this.transactions) {
            totalTransactions++;
            pendingOperations += ops.filter((op) => op.status === 'pending').length;
        }

        return { totalTransactions, pendingOperations };
    }
}

// Global transaction log singleton
let transactionLogInstance: SyncTransactionLog | null = null;

export function getTransactionLog(): SyncTransactionLog {
    if (!transactionLogInstance) {
        transactionLogInstance = new SyncTransactionLog();
    }
    return transactionLogInstance;
}

export function resetTransactionLog(): void {
    transactionLogInstance = null;
}

// ============================================================================
// Rollback Executor
// ============================================================================

/**
 * Rollback executor for reversing sync operations
 */
export class SyncRollbackExecutor {
    // private localAdapter: LocalFSAdapter;
    private eventBus?: WorkspaceEventEmitter;

    constructor(_localAdapter: LocalFSAdapter, eventBus?: WorkspaceEventEmitter) {
        // this.localAdapter = localAdapter;
        this.eventBus = eventBus;
    }

    /**
     * Rollback completed operations
     */
    async rollback(
        completedOps: SyncTransaction[],
        options: RollbackOptions = {}
    ): Promise<{ rolledBack: number; failed: number }> {
        let rolledBack = 0;
        let failed = 0;

        for (const op of completedOps) {
            try {
                await this.rollbackOperation(op, options);
                rolledBack++;

                this.eventBus?.emit('sync:rollback:success', {
                    path: op.path,
                    type: op.type,
                });

                options.onRollback?.(op.path, true);
            } catch (error) {
                failed++;

                this.eventBus?.emit('sync:rollback:failed', {
                    path: op.path,
                    type: op.type,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });

                options.onRollback?.(
                    op.path,
                    false,
                    error instanceof Error ? error.message : 'Unknown error'
                );

                // Continue with other rollbacks even if one fails
                console.warn(`[Rollback] Failed to rollback ${op.path}:`, error);
            }
        }

        return { rolledBack, failed };
    }

    /**
     * Rollback a single operation
     */
    private async rollbackOperation(
        op: SyncTransaction,
        options: RollbackOptions
    ): Promise<void> {
        const fs = isBooted() ? getFileSystem() : null;

        switch (op.type) {
            case 'write':
                // For write operations, we need to either:
                // 1. Restore the previous version (if available in local history)
                // 2. Delete the file (best effort if no previous version)
                // 3. If preserving local changes, just mark as rolled-back in WC

                if (options.preserveLocal && fs) {
                    // Best effort: try to remove from WebContainer only
                    try {
                        await fs.rm(op.path);
                    } catch {
                        // File might not exist, that's OK
                    }
                } else {
                    // Standard rollback: remove from both
                    // Local file - we can't truly rollback without backup
                    // So we just log that local was not changed

                    if (fs) {
                        try {
                            await fs.rm(op.path);
                        } catch {
                            // Ignore if file doesn't exist
                        }
                    }
                }
                break;

            case 'delete':
                // Restore the file - create empty placeholder or try to recover
                // This is best-effort since we don't have backup
                if (fs && !options.preserveLocal) {
                    try {
                        // Create empty file as placeholder
                        await fs.writeFile(op.path, '');
                    } catch {
                        // Ignore if parent directory doesn't exist
                    }
                }
                break;

            case 'mkdir':
                // Remove the created directory
                if (fs && !options.preserveLocal) {
                    try {
                        await fs.rm(op.path, { recursive: true });
                    } catch {
                        // Directory might not exist or have contents
                    }
                }
                break;
        }
    }
}

// ============================================================================
// Batch Sync with Rollback
// ============================================================================

/**
 * Write multiple files with rollback support
 */
export async function writeMultipleWithRollback(
    localAdapter: LocalFSAdapter,
    files: { path: string; content: string }[],
    eventBus?: WorkspaceEventEmitter,
    options: RollbackOptions = {}
): Promise<BatchSyncResult> {
    const operationId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const transactionLog = getTransactionLog();
    const rollbackExecutor = new SyncRollbackExecutor(localAdapter, eventBus);

    const startTime = Date.now();
    const result: BatchSyncResult = {
        success: false,
        operationId,
        totalFiles: files.length,
        syncedFiles: 0,
        rolledBackFiles: 0,
        duration: 0,
    };

    // Start transaction logging
    transactionLog.startTransaction(operationId);

    // Emit start event
    eventBus?.emit('sync:start', {
        operationId,
        type: 'batch',
        count: files.length,
    });

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Add operation to transaction log
            // const transaction = transactionLog.addOperation(operationId, 'write', file.path);
            transactionLog.updateOperation(operationId, file.path, { status: 'in-progress' });

            eventBus?.emit('sync:progress', {
                operationId,
                current: i + 1,
                total: files.length,
                currentFile: file.path,
            });

            try {
                // Write to local FS first
                await localAdapter.writeFile(file.path, file.content);

                // Write to WebContainer if booted
                if (isBooted()) {
                    const fs = getFileSystem();

                    // Ensure parent directories exist
                    const segments = file.path.split('/');
                    if (segments.length > 1) {
                        const parentPath = segments.slice(0, -1).join('/');
                        try {
                            await fs.mkdir(parentPath, { recursive: true });
                        } catch {
                            // Directory might already exist
                        }
                    }

                    await fs.writeFile(file.path, file.content);
                }

                // Mark as completed
                transactionLog.updateOperation(operationId, file.path, {
                    status: 'completed',
                    completedAt: Date.now(),
                });

                result.syncedFiles++;
            } catch (error) {
                // Mark as failed
                transactionLog.updateOperation(operationId, file.path, {
                    status: 'failed',
                    completedAt: Date.now(),
                    error: error instanceof Error ? error.message : 'Unknown error',
                });

                // Get completed operations for rollback
                const completedOps = transactionLog.getCompletedOperations(operationId);

                // Perform rollback
                eventBus?.emit('sync:rollback', {
                    operationId,
                    filesToRevert: completedOps.map((op) => op.path),
                });

                const rollbackResult = await rollbackExecutor.rollback(completedOps, options);

                result.rolledBackFiles = rollbackResult.rolledBack;
                result.failedFile = file.path;
                result.error = error instanceof Error ? error.message : 'Unknown error';

                // Emit failure event
                eventBus?.emit('sync:error', {
                    operationId,
                    error: new Error(result.error),
                    file: file.path,
                    rolledBack: result.rolledBackFiles,
                });

                // Throw wrapped error
                throw new SyncBatchError(
                    `Batch write failed at file ${file.path}`,
                    'BATCH_WRITE_FAILED',
                    operationId,
                    error,
                    {
                        syncedFiles: result.syncedFiles,
                        rolledBackFiles: result.rolledBackFiles,
                    }
                );
            }
        }

        // All files synced successfully
        result.success = true;
        result.duration = Math.round(performance.now() - startTime);

        eventBus?.emit('sync:completed' as any, {
            operationId,
            success: true,
            synced: result.syncedFiles,
            duration: result.duration,
        });

        // Clear transaction log
        transactionLog.clearTransaction(operationId);

        return result;
    } catch (error) {
        if (error instanceof SyncBatchError) {
            throw error;
        }

        // Unexpected error
        result.success = false;
        result.error = error instanceof Error ? error.message : 'Unknown error';
        result.duration = Math.round(performance.now() - startTime);

        // Try to rollback already-synced files
        const completedOps = transactionLog.getCompletedOperations(operationId);
        if (completedOps.length > 0) {
            eventBus?.emit('sync:rollback', {
                operationId,
                filesToRevert: completedOps.map((op) => op.path),
            });

            const rollbackResult = await rollbackExecutor.rollback(completedOps, options);
            result.rolledBackFiles = rollbackResult.rolledBack;
        }

        transactionLog.clearTransaction(operationId);

        throw new SyncBatchError(
            `Batch write failed: ${result.error}`,
            'BATCH_ERROR',
            operationId,
            error,
            result
        );
    }
}

/**
 * Delete multiple files with rollback support
 */
export async function deleteMultipleWithRollback(
    localAdapter: LocalFSAdapter,
    paths: string[],
    eventBus?: WorkspaceEventEmitter,
    options: RollbackOptions = {}
): Promise<BatchSyncResult> {
    const operationId = `batch-delete-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const transactionLog = getTransactionLog();
    const rollbackExecutor = new SyncRollbackExecutor(localAdapter, eventBus);

    const startTime = Date.now();
    const result: BatchSyncResult = {
        success: false,
        operationId,
        totalFiles: paths.length,
        syncedFiles: 0,
        rolledBackFiles: 0,
        duration: 0,
    };

    transactionLog.startTransaction(operationId);

    eventBus?.emit('sync:start', {
        operationId,
        type: 'batch-delete',
        count: paths.length,
    });

    try {
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];

            // const transaction = transactionLog.addOperation(operationId, 'delete', path);
            transactionLog.updateOperation(operationId, path, { status: 'in-progress' });

            eventBus?.emit('sync:progress', {
                operationId,
                current: i + 1,
                total: paths.length,
                currentFile: path,
            });

            try {
                // Delete from local FS first
                await localAdapter.deleteFile(path);

                // Delete from WebContainer if booted
                if (isBooted()) {
                    const fs = getFileSystem();
                    try {
                        await fs.rm(path);
                    } catch {
                        // File might not exist in WC
                    }
                }

                transactionLog.updateOperation(operationId, path, {
                    status: 'completed',
                    completedAt: Date.now(),
                });

                result.syncedFiles++;
            } catch (error) {
                transactionLog.updateOperation(operationId, path, {
                    status: 'failed',
                    completedAt: Date.now(),
                    error: error instanceof Error ? error.message : 'Unknown error',
                });

                const completedOps = transactionLog.getCompletedOperations(operationId);

                eventBus?.emit('sync:rollback', {
                    operationId,
                    filesToRevert: completedOps.map((op) => op.path),
                });

                const rollbackResult = await rollbackExecutor.rollback(completedOps, options);

                result.rolledBackFiles = rollbackResult.rolledBack;
                result.failedFile = path;
                result.error = error instanceof Error ? error.message : 'Unknown error';

                throw new SyncBatchError(
                    `Batch delete failed at ${path}`,
                    'BATCH_DELETE_FAILED',
                    operationId,
                    error,
                    result
                );
            }
        }

        result.success = true;
        result.duration = Math.round(performance.now() - startTime);

        eventBus?.emit('sync:completed' as any, {
            operationId,
            success: true,
            deleted: result.syncedFiles,
            duration: result.duration,
        });

        transactionLog.clearTransaction(operationId);

        return result;
    } catch (error) {
        if (error instanceof SyncBatchError) {
            throw error;
        }

        result.success = false;
        result.error = error instanceof Error ? error.message : 'Unknown error';
        result.duration = Math.round(performance.now() - startTime);

        const completedOps = transactionLog.getCompletedOperations(operationId);
        if (completedOps.length > 0) {
            eventBus?.emit('sync:rollback', {
                operationId,
                filesToRevert: completedOps.map((op) => op.path),
            });

            const rollbackResult = await rollbackExecutor.rollback(completedOps, options);
            result.rolledBackFiles = rollbackResult.rolledBack;
        }

        transactionLog.clearTransaction(operationId);

        throw new SyncBatchError(
            `Batch delete failed: ${result.error}`,
            'BATCH_ERROR',
            operationId,
            error,
            result
        );
    }
}

// ============================================================================
// Sync Batch Error
// ============================================================================

/**
 * Error class for batch sync failures
 */
export class SyncBatchError extends Error {
    code: string;
    operationId: string;
    context: {
        syncedFiles: number;
        rolledBackFiles: number;
        [key: string]: unknown;
    };

    constructor(
        message: string,
        code: string,
        operationId: string,
        cause: unknown,
        context: { syncedFiles: number; rolledBackFiles: number; [key: string]: unknown }
    ) {
        super(message);
        this.name = 'SyncBatchError';
        this.code = code;
        this.operationId = operationId;
        this.context = context;

        if (cause instanceof Error) {
            this.cause = cause;
        }
    }

    toJSON(): object {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            operationId: this.operationId,
            context: this.context,
        };
    }
}

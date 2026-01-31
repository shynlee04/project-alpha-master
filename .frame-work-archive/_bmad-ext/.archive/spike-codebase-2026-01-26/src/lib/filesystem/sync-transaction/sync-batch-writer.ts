/**
 * @fileoverview Sync Batch Writer
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Batch file write operations with rollback support.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

import type { LocalFSAdapter } from '../local-fs-adapter';
import { getFileSystem, isBooted } from '../../webcontainer';
import type { WorkspaceEventEmitter } from '../../events';
import type { BatchSyncResult, RollbackOptions } from './sync-transaction-types';
import { getTransactionLog } from './sync-transaction-log';
import { SyncRollbackExecutor } from './sync-rollback-executor';
import { SyncBatchError } from './sync-batch-error';

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
    (eventBus as any)?.emit('sync:start', {
        fileCount: files.length,
        direction: 'to-wc',
        operationId,
    });

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Add operation to transaction log
            // const transaction = transactionLog.addOperation(operationId, 'write', file.path);
            transactionLog.updateOperation(operationId, file.path, { status: 'in-progress' });

            (eventBus as any)?.emit('sync:progress', {
                current: i + 1,
                total: files.length,
                currentFile: file.path,
                operationId,
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
                (eventBus as any)?.emit('sync:rollback', {
                    transactionId: operationId,
                    initiator: 'system',
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
                transactionId: operationId,
                initiator: 'system',
                reason: result.error,
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
            {
                syncedFiles: result.syncedFiles,
                rolledBackFiles: result.rolledBackFiles,
            }
        );
    }
}

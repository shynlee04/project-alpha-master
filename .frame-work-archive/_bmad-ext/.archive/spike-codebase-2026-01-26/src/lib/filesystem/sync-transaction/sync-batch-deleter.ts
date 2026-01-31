/**
 * @fileoverview Sync Batch Deleter
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Batch file delete operations with rollback support.
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
        fileCount: paths.length,
        direction: 'to-local',
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
                    transactionId: operationId,
                    initiator: 'system',
                    reason: error instanceof Error ? error.message : 'Unknown error',
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
                    {
                        syncedFiles: result.syncedFiles,
                        rolledBackFiles: result.rolledBackFiles,
                    }
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
                transactionId: operationId,
                initiator: 'system',
                reason: result.error,
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
            {
                syncedFiles: result.syncedFiles,
                rolledBackFiles: result.rolledBackFiles,
            }
        );
    }
}

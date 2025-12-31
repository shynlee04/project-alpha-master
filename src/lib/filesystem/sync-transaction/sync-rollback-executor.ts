/**
 * @fileoverview Sync Rollback Executor
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Rollback executor for reversing sync operations.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

import type { LocalFSAdapter } from '../local-fs-adapter';
import { getFileSystem, isBooted } from '../../webcontainer';
import type { WorkspaceEventEmitter } from '../../events';
import type { SyncTransaction, RollbackOptions } from './sync-transaction-types';

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

                (this.eventBus as any)?.emit('sync:rollback:success', {
                    transactionId: this.transactionId,
                    filesReverted: 1,
                    path: op.path,
                    type: op.type,
                });

                options.onRollback?.(op.path, true);
            } catch (error) {
                failed++;

                (this.eventBus as any)?.emit('sync:rollback:failed', {
                    transactionId: this.transactionId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    path: op.path,
                    type: op.type,
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

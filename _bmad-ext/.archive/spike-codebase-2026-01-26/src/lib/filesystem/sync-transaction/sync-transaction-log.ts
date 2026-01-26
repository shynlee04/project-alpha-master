/**
 * @fileoverview Sync Transaction Log
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Transaction log for tracking sync operations.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

import type { SyncTransaction } from './sync-transaction-types';

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
        type: SyncTransaction['type'],
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

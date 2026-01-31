/**
 * @fileoverview Sync Batch Error
 * @module lib/filesystem/sync-transaction
 * @governance RC-013
 *
 * Error class for batch sync failures.
 *
 * @story rc-013-sync-rollback
 * @priority HIGH (HIGH-010)
 */

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

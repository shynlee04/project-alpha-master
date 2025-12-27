/**
 * @fileoverview File Lock for Concurrent File Operations
 * @module lib/agent/facades/file-lock
 * 
 * Provides file-level locking for AI agent file operations.
 * Prevents concurrent modifications to the same file by multiple agents.
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1B - Add Concurrency Control to FileToolsFacade
 */

/**
 * Error thrown when lock acquisition times out
 */
export class FileLockTimeoutError extends Error {
    public readonly path: string;
    public readonly timeout: number;

    constructor(path: string, timeout: number) {
        super(`Lock timeout (${timeout}ms) acquiring lock for: ${path}`);
        this.name = 'FileLockTimeoutError';
        this.path = path;
        this.timeout = timeout;
    }
}

/**
 * Lock information for tracking active locks
 */
interface LockInfo {
    promise: Promise<void>;
    resolver: () => void;
    acquiredAt: number;
}

/**
 * FileLock - File-level mutex for agent operations
 * 
 * Provides per-file locking to prevent concurrent modifications.
 * Uses a Map to track active locks per file path.
 * 
 * @example
 * ```typescript
 * const lock = new FileLock();
 * const acquiredAt = await lock.acquire('src/app.tsx');
 * try {
 *   await writeFile('src/app.tsx', content);
 * } finally {
 *   lock.release('src/app.tsx');
 * }
 * ```
 */
export class FileLock {
    private locks = new Map<string, LockInfo>();
    private readonly defaultTimeout: number;

    /**
     * Create a new FileLock instance
     * @param defaultTimeout - Default timeout in milliseconds (default: 30000)
     */
    constructor(defaultTimeout = 30000) {
        this.defaultTimeout = defaultTimeout;
    }

    /**
     * Acquire a lock for the given file path
     * @param path - File path to lock
     * @param timeout - Timeout in milliseconds (optional, uses default)
     * @returns Timestamp when lock was acquired
     * @throws FileLockTimeoutError if lock cannot be acquired within timeout
     */
    async acquire(path: string, timeout?: number): Promise<number> {
        const lockTimeout = timeout ?? this.defaultTimeout;
        const existing = this.locks.get(path);

        // If there's an existing lock, wait for it or timeout
        if (existing) {
            const timeoutPromise = this.createTimeoutPromise(path, lockTimeout);
            await Promise.race([existing.promise, timeoutPromise]);

            // After waiting, check if lock is still held
            if (this.locks.has(path)) {
                throw new FileLockTimeoutError(path, lockTimeout);
            }
        }

        // Create new lock
        let resolver: () => void;
        const promise = new Promise<void>((resolve) => {
            resolver = resolve;
        });

        const acquiredAt = Date.now();
        this.locks.set(path, {
            promise,
            resolver: resolver!,
            acquiredAt,
        });

        return acquiredAt;
    }

    /**
     * Release a lock for the given file path
     * @param path - File path to unlock
     * @returns Timestamp when lock was released, or null if no lock existed
     */
    release(path: string): number | null {
        const lockInfo = this.locks.get(path);
        if (lockInfo) {
            lockInfo.resolver();
            this.locks.delete(path);
            return Date.now();
        }
        return null;
    }

    /**
     * Check if a file is currently locked
     * @param path - File path to check
     */
    isLocked(path: string): boolean {
        return this.locks.has(path);
    }

    /**
     * Get lock info for a file (for debugging)
     * @param path - File path to check
     */
    getLockInfo(path: string): { acquiredAt: number } | null {
        const info = this.locks.get(path);
        if (info) {
            return { acquiredAt: info.acquiredAt };
        }
        return null;
    }

    /**
     * Create a promise that rejects after timeout
     */
    private createTimeoutPromise(path: string, timeout: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new FileLockTimeoutError(path, timeout));
            }, timeout);
        });
    }
}

/**
 * Shared FileLock instance for agent operations
 * Can be imported directly or created fresh for testing
 */
export const fileLock = new FileLock();

/**
 * Factory function to create a FileLock with custom timeout
 */
export function createFileLock(defaultTimeout = 30000): FileLock {
    return new FileLock(defaultTimeout);
}

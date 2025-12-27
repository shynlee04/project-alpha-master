/**
 * @fileoverview FileLock Unit Tests
 * @module lib/agent/facades/__tests__/file-lock.test
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1B - Add Concurrency Control to FileToolsFacade
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileLock, FileLockTimeoutError, createFileLock } from '../file-lock';

describe('FileLock', () => {
    let lock: FileLock;

    beforeEach(() => {
        lock = new FileLock(100); // Short timeout for tests
    });

    describe('acquire', () => {
        it('should acquire lock and return timestamp', async () => {
            const beforeAcquire = Date.now();
            const acquiredAt = await lock.acquire('test.txt');
            const afterAcquire = Date.now();

            expect(acquiredAt).toBeGreaterThanOrEqual(beforeAcquire);
            expect(acquiredAt).toBeLessThanOrEqual(afterAcquire);
        });

        it('should mark file as locked after acquire', async () => {
            expect(lock.isLocked('test.txt')).toBe(false);
            await lock.acquire('test.txt');
            expect(lock.isLocked('test.txt')).toBe(true);
        });

        it('should allow acquiring lock on different files', async () => {
            await lock.acquire('file1.txt');
            await lock.acquire('file2.txt');

            expect(lock.isLocked('file1.txt')).toBe(true);
            expect(lock.isLocked('file2.txt')).toBe(true);
        });
    });

    describe('release', () => {
        it('should release lock and return timestamp', async () => {
            await lock.acquire('test.txt');
            const beforeRelease = Date.now();
            const releasedAt = lock.release('test.txt');
            const afterRelease = Date.now();

            expect(releasedAt).toBeGreaterThanOrEqual(beforeRelease);
            expect(releasedAt).toBeLessThanOrEqual(afterRelease);
        });

        it('should mark file as unlocked after release', async () => {
            await lock.acquire('test.txt');
            expect(lock.isLocked('test.txt')).toBe(true);

            lock.release('test.txt');
            expect(lock.isLocked('test.txt')).toBe(false);
        });

        it('should return null when releasing non-existent lock', () => {
            const result = lock.release('nonexistent.txt');
            expect(result).toBeNull();
        });
    });

    describe('concurrent access', () => {
        it('should wait for lock to be released before acquiring', async () => {
            const events: string[] = [];

            // First acquire
            await lock.acquire('test.txt');
            events.push('first-acquired');

            // Start second acquire (will wait)
            const secondAcquire = lock.acquire('test.txt')
                .then(() => events.push('second-acquired'))
                .catch(() => events.push('second-failed'));

            // Wait a bit then release first lock
            await new Promise(r => setTimeout(r, 10));
            events.push('releasing-first');
            lock.release('test.txt');

            // Wait for second to complete
            await secondAcquire;

            expect(events).toEqual([
                'first-acquired',
                'releasing-first',
                'second-acquired'
            ]);
        });
    });

    describe('timeout', () => {
        it('should throw FileLockTimeoutError when timeout exceeded', async () => {
            await lock.acquire('test.txt');

            // Try to acquire with very short timeout
            try {
                await lock.acquire('test.txt', 50);
                expect.fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(FileLockTimeoutError);
                expect((error as FileLockTimeoutError).path).toBe('test.txt');
                expect((error as FileLockTimeoutError).timeout).toBe(50);
            }
        });

        it('should use default timeout if not specified', async () => {
            const shortTimeoutLock = new FileLock(10);
            await shortTimeoutLock.acquire('test.txt');

            await expect(shortTimeoutLock.acquire('test.txt'))
                .rejects.toThrow(FileLockTimeoutError);
        });
    });

    describe('getLockInfo', () => {
        it('should return lock info for locked file', async () => {
            const acquiredAt = await lock.acquire('test.txt');
            const info = lock.getLockInfo('test.txt');

            expect(info).not.toBeNull();
            expect(info?.acquiredAt).toBe(acquiredAt);
        });

        it('should return null for unlocked file', () => {
            const info = lock.getLockInfo('test.txt');
            expect(info).toBeNull();
        });
    });
});

describe('FileLockTimeoutError', () => {
    it('should have correct properties', () => {
        const error = new FileLockTimeoutError('path/to/file.txt', 5000);

        expect(error.name).toBe('FileLockTimeoutError');
        expect(error.path).toBe('path/to/file.txt');
        expect(error.timeout).toBe(5000);
        expect(error.message).toContain('5000ms');
        expect(error.message).toContain('path/to/file.txt');
    });
});

describe('createFileLock', () => {
    it('should create FileLock with default timeout', () => {
        const lock = createFileLock();
        expect(lock).toBeInstanceOf(FileLock);
    });

    it('should create FileLock with custom timeout', () => {
        const lock = createFileLock(60000);
        expect(lock).toBeInstanceOf(FileLock);
    });
});

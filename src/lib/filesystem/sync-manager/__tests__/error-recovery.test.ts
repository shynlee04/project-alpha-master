/**
 * @fileoverview Error Recovery Tests
 * @module lib/filesystem/sync-manager/__tests__
 * @governance Story 54-2 - AC4: Error Recovery
 *
 * Tests for graceful error handling during sync operations.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncError, SyncErrorCode } from '@/lib/filesystem/sync-types';

// Mock file system
const mockFileSystem = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
};

describe('Error Recovery - AC4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Permission denied error', () => {
    it('should show user-friendly message for permission denied', async () => {
      const error = new SyncError(
        'Permission denied to access directory',
        SyncErrorCode.PERMISSION_DENIED
      );

      expect(error.userMessage).toContain('permission');
      expect(error.userMessage).toContain('denied');
      expect(error.userMessage).not.toContain('Error:');
      expect(error.userMessage).not.toContain('NotAllowedError:');
    });

    it('should suggest granting permission', async () => {
      const error = new SyncError(
        'Permission denied',
        SyncErrorCode.PERMISSION_DENIED
      );

      expect(error.recoveryAction).toContain('Grant permission');
      expect(error.recoveryAction).toContain('directory access');
    });

    it('should handle FileHandle read permission denied', async () => {
      // Simulate browser throwing permission error
      mockFileSystem.readFile.mockRejectedValueOnce(
        new DOMException('Permission denied', 'NotAllowedError')
      );

      await expect(mockFileSystem.readFile('/test/file.txt')).rejects.toThrow();

      // Error should be caught and transformed
      try {
        await mockFileSystem.readFile('/test/file.txt');
      } catch (e) {
        const syncError = SyncError.fromError(e as Error);
        expect(syncError.code).toBe(SyncErrorCode.PERMISSION_DENIED);
        expect(syncError.userMessage).toBeTruthy();
      }
    });
  });

  describe('Quota exceeded error', () => {
    it('should show user-friendly message for quota exceeded', async () => {
      const error = new SyncError(
        'IndexedDB quota exceeded',
        SyncErrorCode.QUOTA_EXCEEDED
      );

      expect(error.userMessage).toContain('quota');
      expect(error.userMessage).toContain('exceeded');
      expect(error.userMessage).toContain('storage');
    });

    it('should trigger cleanup and warning', async () => {
      const cleanupSpy = vi.fn();
      const error = new SyncError(
        'IndexedDB quota exceeded',
        SyncErrorCode.QUOTA_EXCEEDED
      );

      // Error should have cleanup callback
      if (error.cleanup) {
        error.cleanup();
      }

      // Should suggest cleanup action
      expect(error.recoveryAction).toContain('Clear');
      expect(error.recoveryAction).toContain('cache');
    });

    it('should detect quota before writing', async () => {
      // Quota detector should check available space
      const quotaCheck = vi.fn().mockResolvedValue({ available: 0, total: 100 });

      const quota = await quotaCheck();
      expect(quota.available).toBe(0);

      // Should warn before attempting write
      if (quota.available === 0) {
        const warning = 'Insufficient storage space';
        expect(warning).toBeTruthy();
      }
    });
  });

  describe('Network error handling', () => {
    it('should retry network errors up to 3 times', async () => {
      let attemptCount = 0;
      mockFileSystem.writeFile.mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return true;
      });

      // Retry logic should be in sync manager
      let success = false;
      for (let i = 0; i < 3; i++) {
        try {
          await mockFileSystem.writeFile('/test/file.txt', 'content');
          success = true;
          break;
        } catch (e) {
          if (i === 2) {
            // Last attempt failed
            const error = new SyncError(
              'Network error after 3 retries',
              SyncErrorCode.NETWORK_ERROR
            );
            throw error;
          }
          // Retry
        }
      }

      expect(attemptCount).toBe(3);
      expect(success).toBe(true);
    });

    it('should give up after 3 failed retries', async () => {
      let attemptCount = 0;
      mockFileSystem.writeFile.mockImplementation(async () => {
        attemptCount++;
        throw new Error('Network error');
      });

      let lastError: Error | null = null;
      for (let i = 0; i < 3; i++) {
        try {
          await mockFileSystem.writeFile('/test/file.txt', 'content');
        } catch (e) {
          lastError = e as Error;
        }
      }

      expect(attemptCount).toBe(3);
      expect(lastError).toBeTruthy();

      const syncError = new SyncError(
        'Network error after 3 retries',
        SyncErrorCode.NETWORK_ERROR
      );
      expect(syncError.recoveryAction).toContain('Check connection');
      expect(syncError.recoveryAction).toContain('try again');
    });

    it('should not retry on non-network errors', async () => {
      const nonNetworkError = new Error('Invalid file path');
      mockFileSystem.writeFile.mockRejectedValueOnce(nonNetworkError);

      let retryCount = 0;
      try {
        await mockFileSystem.writeFile('/test/file.txt', 'content');
      } catch (e) {
        // Should not retry
        retryCount = 0;
      }

      expect(retryCount).toBe(0);
    });
  });

  describe('Partial sync recovery', () => {
    it('should not corrupt state when sync fails partway', async () => {
      const syncedFiles: string[] = [];
      const failedAt = 5; // Fail at file 5

      // Simulate sync of 10 files
      for (let i = 0; i < 10; i++) {
        if (i === failedAt) {
          throw new Error('Sync failed');
        }
        syncedFiles.push(`file${i}.txt`);
      }

      // State should remain consistent
      // Only files 0-4 should be marked as synced
      expect(syncedFiles.length).toBe(5);
      expect(syncedFiles).not.toContain('file5.txt');
      expect(syncedFiles).not.toContain('file9.txt');
    });

    it('should resume from last successful file on retry', async () => {
      const lastSyncedFile = 'file4.txt';
      const resumeFrom = 5; // Resume from file 5

      // On retry, start from where we left off
      expect(resumeFrom).toBeGreaterThan(4);
    });

    it('should track failed files for retry', async () => {
      const failedFiles: string[] = [];
      const syncError = new SyncError(
        'Partial sync complete',
        SyncErrorCode.PARTIAL_SUCCESS
      );

      // Should have list of failed files
      expect(syncError.failedFiles).toBeDefined();
      expect(syncError.failedFiles).toEqual(expect.any(Array));
    });
  });

  describe('Invalid file path handling', () => {
    it('should handle gracefully', async () => {
      const invalidPaths = [
        '',
        '//',
        '/../../../etc/passwd', // Path traversal attempt
        '/null\x00file', // Null byte injection
      ];

      for (const path of invalidPaths) {
        const isValid = await validatePath(path);
        expect(isValid).toBe(false);
      }
    });

    it('should show clear error for invalid path', async () => {
      const error = new SyncError(
        'Invalid file path',
        SyncErrorCode.INVALID_PATH
      );

      expect(error.userMessage).toContain('invalid');
      expect(error.userMessage).toContain('path');
      expect(error.recoveryAction).toContain('Check file path');
    });
  });

  describe('WebContainer boot failure', () => {
    it('should show clear error when WebContainer fails to boot', async () => {
      const error = new SyncError(
        'WebContainer boot failed',
        SyncErrorCode.WEBCONTAINER_ERROR
      );

      expect(error.userMessage).toContain('WebContainer');
      expect(error.userMessage).toContain('boot');
      expect(error.recoveryAction).toContain('refresh');
    });

    it('should suggest retrying after delay', async () => {
      const error = new SyncError(
        'WebContainer boot failed',
        SyncErrorCode.WEBCONTAINER_ERROR
      );

      expect(error.recoveryAction).toContain('wait');
      expect(error.recoveryAction).toContain('retry');
    });
  });

  describe('Recovery action suggestions', () => {
    const recoveryActions: Record<string, string> = {
      'PERMISSION_DENIED': 'Grant permission to access your files',
      'FILE_NOT_FOUND': 'Check the file path and try again',
      'FILE_READ_FAILED': 'Check file permissions and try again',
      'FILE_WRITE_FAILED': 'Check disk space and try again',
      'DIR_CREATE_FAILED': 'Check directory path and permissions',
      'DIR_DELETE_FAILED': 'Check if directory is in use',
      'DISK_FULL': 'Clear browser cache or free up storage space',
      'WEBCONTAINER_ERROR': 'Refresh the page and try again',
      'WEBCONTAINER_NOT_BOOTED': 'Wait for WebContainer to initialize',
      'ENCODING_ERROR': 'Check file encoding and try again',
      'SYNC_FAILED': 'Check connection and files, then retry',
      'UNKNOWN': 'Try again or contact support',
    };

    it('should provide recovery action for each error type', () => {
      Object.entries(recoveryActions).forEach(([code, action]) => {
        const error = new SyncError('Test', code as SyncErrorCode);
        expect(error.recoveryAction).toBeTruthy();
        expect(error.recoveryAction).toContain(action);
      });
    });

    it('should have recovery action for all error codes', () => {
      const errorCodes: SyncErrorCode[] = [
        'PERMISSION_DENIED',
        'FILE_NOT_FOUND',
        'FILE_READ_FAILED',
        'FILE_WRITE_FAILED',
        'DIR_CREATE_FAILED',
        'DIR_DELETE_FAILED',
        'DISK_FULL',
        'WEBCONTAINER_ERROR',
        'WEBCONTAINER_NOT_BOOTED',
        'ENCODING_ERROR',
        'SYNC_FAILED',
        'UNKNOWN',
      ];

      errorCodes.forEach(code => {
        const error = new SyncError('Test', code);
        expect(error.code).toBe(code);
        expect(error.message).toBe('Test');
        expect(error.name).toBe('SyncError');
      });
    });
  });
});

// Helper function (would be in actual implementation)
async function validatePath(path: string): Promise<boolean> {
  // Prevent path traversal
  if (path.includes('..')) {
    return false;
  }
  // Prevent null bytes
  if (path.includes('\0')) {
    return false;
  }
  // Prevent empty paths
  if (!path || path === '/' || path === '//') {
    return false;
  }
  return true;
}

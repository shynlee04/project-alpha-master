/**
 * @fileoverview Sync Status Visibility Tests
 * @module lib/filesystem/sync-manager/__tests__
 * @governance Story 54-2 - AC1: Sync Status Visibility
 *
 * Tests for user-facing sync status indicators and progress feedback.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';

// Mock LocalFSAdapter
vi.mock('@/lib/filesystem/local-fs-adapter', () => ({
  LocalFSAdapter: {
    requestDirectoryAccess: vi.fn(),
  },
}));

// Mock WebContainer
vi.mock('@webcontainer/api', () => ({
  WebContainer: {
    boot: vi.fn(),
  },
}));

describe('Sync Status Visibility - AC1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Syncing indicator', () => {
    it('should show "Syncing..." indicator during sync', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      // Start sync
      act(() => {
        result.current.startSync();
      });

      // Should show syncing state
      expect(result.current.isSyncing).toBe(true);
      expect(result.current.status).toBe('syncing');
    });

    it('should not show syncing indicator when sync is complete', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.completeSync(100);
      });

      expect(result.current.isSyncing).toBe(false);
      expect(result.current.status).toBe('complete');
    });

    it('should not show syncing indicator when sync fails', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.failSync(new Error('Permission denied'));
      });

      expect(result.current.isSyncing).toBe(false);
      expect(result.current.status).toBe('error');
    });
  });

  describe('Progress bar', () => {
    it('should show files processed / total files', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.updateProgress(25, 100); // 25 of 100 files
      });

      expect(result.current.filesProcessed).toBe(25);
      expect(result.current.totalFiles).toBe(100);
      expect(result.current.progressPercent).toBe(25);
    });

    it('should calculate progress percentage correctly', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.updateProgress(50, 100);
      });

      expect(result.current.progressPercent).toBe(50);

      act(() => {
        result.current.updateProgress(75, 100);
      });

      expect(result.current.progressPercent).toBe(75);
    });

    it('should handle zero total files', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.updateProgress(0, 0);
      });

      expect(result.current.progressPercent).toBe(0);
    });

    it('should cap progress at 100%', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.updateProgress(100, 100);
      });

      expect(result.current.progressPercent).toBe(100);

      // Edge case: more processed than total
      act(() => {
        result.current.updateProgress(150, 100);
      });

      expect(result.current.progressPercent).toBe(100);
    });
  });

  describe('Sync complete message', () => {
    it('should show "Sync complete: X files" message', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.completeSync(250);
      });

      expect(result.current.status).toBe('complete');
      expect(result.current.message).toContain('250');
      expect(result.current.message).toContain('files');
    });

    it('should show "1 file" singular when syncing one file', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        result.current.completeSync(1);
      });

      expect(result.current.message).toContain('1 file');
    });

    it('should show elapsed time for sync', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      act(() => {
        result.current.startSync();
        // Simulate sync taking time
        vi.advanceTimersByTime(1500);
        result.current.completeSync(100);
      });

      expect(result.current.elapsedTime).toBeGreaterThan(0);
    });
  });

  describe('Error message display', () => {
    it('should show clear error message if sync fails', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      const error = new Error('Permission denied to access directory');

      act(() => {
        result.current.startSync();
        result.current.failSync(error);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('Permission denied');
    });

    it('should show user-friendly quota exceeded message', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      const error = new Error('QuotaExceededError: IndexedDB quota exceeded');

      act(() => {
        result.current.startSync();
        result.current.failSync(error);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.userMessage).toContain('quota');
      expect(result.current.userMessage).toContain('exceeded');
    });

    it('should show user-friendly permission denied message', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      const error = new Error('NotAllowedError: User denied permission');

      act(() => {
        result.current.startSync();
        result.current.failSync(error);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.userMessage).toContain('permission');
    });

    it('should suggest recovery action for each error type', async () => {
      const { result } = renderHook(() => useFileSyncStatusStore());

      const error = new Error('NotAllowedError: User denied permission');

      act(() => {
        result.current.startSync();
        result.current.failSync(error);
      });

      expect(result.current.recoveryAction).toBeTruthy();
      expect(result.current.recoveryAction).toContain('Grant permission');
    });
  });
});

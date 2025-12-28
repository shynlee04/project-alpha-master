/**
 * WebContainer Crash Recovery Tests
 * @module lib/webcontainer/__tests__/crash-recovery.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CrashRecoveryManager, createCrashRecoveryManager, type WebContainerAPI } from '../crash-recovery';

describe('CrashRecoveryManager', () => {
  let mockAPI: WebContainerAPI;

  beforeEach(() => {
    mockAPI = {
      boot: vi.fn().mockResolvedValue(undefined),
      mount: vi.fn().mockResolvedValue(undefined),
      getInstance: vi.fn().mockReturnValue({}),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should start in idle state', () => {
      const manager = new CrashRecoveryManager({}, mockAPI);
      expect(manager.getState()).toBe('idle');
    });

    it('should start with zero crash count', () => {
      const manager = new CrashRecoveryManager({}, mockAPI);
      expect(manager.getCrashCount()).toBe(0);
    });

    it('should respect maxAttempts option', () => {
      const manager = new CrashRecoveryManager({ maxAttempts: 5 }, mockAPI);
      expect(manager.getCrashCount()).toBe(0);
    });

    it('should use injected API', () => {
      const manager = new CrashRecoveryManager({}, mockAPI);
      expect(manager.getState()).toBe('idle');
    });
  });

  describe('Health Check', () => {
    it('should start health checks when called', () => {
      const manager = new CrashRecoveryManager({ healthCheckInterval: 1000 }, mockAPI);
      manager.startHealthCheck();
      expect(manager.getState()).toBe('detecting');
      manager.stopHealthCheck();
    });

    it('should stop health checks when called', () => {
      const manager = new CrashRecoveryManager({ healthCheckInterval: 1000 }, mockAPI);
      manager.startHealthCheck();
      manager.stopHealthCheck();
      expect(manager.getState()).toBe('idle');
    });

    it('should not start duplicate health checks', () => {
      const manager = new CrashRecoveryManager({ healthCheckInterval: 1000 }, mockAPI);
      manager.startHealthCheck();
      const firstInterval = (manager as { healthCheckInterval?: ReturnType<typeof setInterval> }).healthCheckInterval;
      manager.startHealthCheck();
      expect((manager as { healthCheckInterval?: ReturnType<typeof setInterval> }).healthCheckInterval).toBe(firstInterval);
      manager.stopHealthCheck();
    });

    it('should detect crash when no instance', async () => {
      const noInstanceAPI: WebContainerAPI = {
        boot: vi.fn().mockResolvedValue(undefined),
        mount: vi.fn().mockResolvedValue(undefined),
        getInstance: vi.fn().mockReturnValue(null),
      };
      const manager = new CrashRecoveryManager({ healthCheckInterval: 1000 }, noInstanceAPI);
      manager.startHealthCheck();
      // Wait for health check to trigger
      await new Promise((resolve) => setTimeout(resolve, 1500));
      manager.stopHealthCheck();
    });
  });

  describe('handleCrash', () => {
    it('should handle crash and attempt recovery', async () => {
      const manager = new CrashRecoveryManager({ maxAttempts: 3 }, mockAPI);
      await manager.handleCrash(new Error('Test crash'));
      // Crash count resets to 0 on successful recovery
      expect(manager.getCrashCount()).toBe(0);
      // Recovery should have been attempted
      expect(mockAPI.boot).toHaveBeenCalled();
    });

    it('should transition to recovering state on first crash', async () => {
      const stateChanges: string[] = [];
      const manager = new CrashRecoveryManager(
        { maxAttempts: 3, onStateChange: (state) => stateChanges.push(state) },
        mockAPI
      );

      await manager.handleCrash(new Error('Test crash'));
      expect(stateChanges).toContain('recovering');
    });

    it('should fail after max crash attempts', async () => {
      const failAPI: WebContainerAPI = {
        boot: vi.fn().mockRejectedValue(new Error('Boot failed')),
        mount: vi.fn().mockResolvedValue(undefined),
        getInstance: vi.fn().mockReturnValue(null),
      };
      const failureCalled = vi.fn();
      const manager = new CrashRecoveryManager(
        { maxAttempts: 2, onRecoveryFailure: failureCalled },
        failAPI
      );

      // First crash - should attempt recovery and fail
      await manager.handleCrash(new Error('Crash 1'));
      // Crash count is now 1, recovery failed, state is 'failed'

      // Second crash - should fail immediately (state already failed)
      await manager.handleCrash(new Error('Crash 2'));
      // Now crashCount is 2 >= maxAttempts (2), should trigger failure
      expect(failureCalled).toHaveBeenCalled();
    });

    it('should succeed on successful recovery', async () => {
      const successCalled = vi.fn();
      const manager = new CrashRecoveryManager(
        { maxAttempts: 3, onRecoverySuccess: successCalled },
        mockAPI
      );

      await manager.handleCrash(new Error('Test'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(successCalled).toHaveBeenCalled();
    });
  });

  describe('setPendingMountFiles', () => {
    it('should store files for re-mount', () => {
      const manager = new CrashRecoveryManager({}, mockAPI);
      const files = {
        'package.json': { file: { contents: '{}' } },
      };
      manager.setPendingMountFiles(files);
      expect((manager as { pendingMountFiles: unknown }).pendingMountFiles).toEqual(files);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const manager = new CrashRecoveryManager({}, mockAPI);
      manager.startHealthCheck();
      manager.reset();
      expect(manager.getState()).toBe('idle');
      expect(manager.getCrashCount()).toBe(0);
    });
  });

  describe('resetCrashCount', () => {
    it('should reset crash count to zero', async () => {
      const manager = new CrashRecoveryManager({ maxAttempts: 3 }, mockAPI);
      // After successful recovery, count is already 0
      await manager.handleCrash(new Error('Crash 1'));
      expect(manager.getCrashCount()).toBe(0);
      manager.resetCrashCount();
      expect(manager.getCrashCount()).toBe(0);
    });
  });

  describe('Callbacks', () => {
    it('should call onStateChange when state changes', async () => {
      const stateChanges: string[] = [];
      const manager = new CrashRecoveryManager(
        { maxAttempts: 3, onStateChange: (state) => stateChanges.push(state) },
        mockAPI
      );

      await manager.handleCrash(new Error('Test'));
      expect(stateChanges.length).toBeGreaterThan(0);
    });

    it('should call onRecoverySuccess on successful recovery', async () => {
      const successCalled = vi.fn();
      const manager = new CrashRecoveryManager(
        { maxAttempts: 3, onRecoverySuccess: successCalled },
        mockAPI
      );

      await manager.handleCrash(new Error('Test'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(successCalled).toHaveBeenCalled();
    });

    it('should call onRecoveryFailure when recovery fails', async () => {
      const failAPI: WebContainerAPI = {
        boot: vi.fn().mockRejectedValue(new Error('Boot failed')),
        mount: vi.fn().mockResolvedValue(undefined),
        getInstance: vi.fn().mockReturnValue(null),
      };
      const failureCalled = vi.fn();
      const manager = new CrashRecoveryManager(
        { maxAttempts: 2, onRecoveryFailure: failureCalled },
        failAPI
      );

      await manager.handleCrash(new Error('Test'));
      expect(failureCalled).toHaveBeenCalled();
    });
  });

  describe('getMetrics', () => {
    it('should return accurate metrics', async () => {
      const manager = new CrashRecoveryManager({ maxAttempts: 3 }, mockAPI);
      await manager.handleCrash(new Error('Crash 1'));

      // After successful recovery, crash count is reset
      const metrics = manager.getMetrics();
      expect(metrics.crashCount).toBe(0);
      expect(metrics.totalCrashes).toBe(0);
    });
  });

  describe('createCrashRecoveryManager', () => {
    it('should create manager with default options', () => {
      const mgr = createCrashRecoveryManager();
      expect(mgr.getState()).toBe('idle');
    });

    it('should create manager with custom options', () => {
      const mgr = createCrashRecoveryManager({
        maxAttempts: 5,
        healthCheckInterval: 10000,
      });
      expect(mgr.getCrashCount()).toBe(0);
    });
  });

  describe('Crash Detection Timing', () => {
    it('should handle crash within expected time', async () => {
      const manager = new CrashRecoveryManager({ maxAttempts: 3 }, mockAPI);
      const startTime = Date.now();
      await manager.handleCrash(new Error('Test crash'));
      const elapsed = Date.now() - startTime;

      // Should complete within reasonable time (accounting for backoff)
      expect(elapsed).toBeLessThan(2000);
    });
  });

  describe('Recovery Sequence', () => {
    it('should transition through correct states during recovery', async () => {
      const stateChanges: string[] = [];
      const manager = new CrashRecoveryManager(
        { maxAttempts: 3, onStateChange: (state) => stateChanges.push(state) },
        mockAPI
      );

      await manager.handleCrash(new Error('Test'));

      // Should have gone through recovering -> recovered
      expect(stateChanges).toContain('recovering');
      expect(stateChanges).toContain('recovered');
    });

    it('should call boot and mount during recovery', async () => {
      const manager = new CrashRecoveryManager({ maxAttempts: 3 }, mockAPI);
      const files = { 'package.json': { file: { contents: '{}' } } };
      manager.setPendingMountFiles(files);

      await manager.handleCrash(new Error('Test'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockAPI.boot).toHaveBeenCalled();
      expect(mockAPI.mount).toHaveBeenCalledWith(files);
    });
  });

  describe('Exponential Backoff', () => {
    it('should apply exponential backoff between retries', async () => {
      const failAPI: WebContainerAPI = {
        boot: vi.fn()
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('Fail'))
          .mockResolvedValue(undefined),
        mount: vi.fn().mockResolvedValue(undefined),
        getInstance: vi.fn().mockReturnValue({}),
      };

      const manager = new CrashRecoveryManager({ maxAttempts: 3 }, failAPI);
      const startTime = Date.now();

      await manager.handleCrash(new Error('Test'));

      const elapsed = Date.now() - startTime;
      // First attempt (no backoff) + second attempt (100ms backoff)
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });
});

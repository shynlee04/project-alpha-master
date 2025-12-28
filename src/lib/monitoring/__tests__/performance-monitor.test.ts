/**
 * Performance Monitor Tests
 * @module lib/monitoring/__tests__/performance-monitor.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerformanceMonitor,
  getPerformanceMonitor,
  resetPerformanceMonitor,
} from '../performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    resetPerformanceMonitor();
    monitor = new PerformanceMonitor();
  });

  describe('Initial State', () => {
    it('should start with empty metrics', () => {
      const summary = monitor.getSummary();
      expect(summary.bootTime.current).toBe(0);
      expect(summary.bootTime.avg).toBe(0);
    });

    it('should have default metric configurations', () => {
      expect(monitor.isTargetMet('webcontainer_boot')).toBe(true);
      expect(monitor.isTargetMet('file_sync')).toBe(true);
    });
  });

  describe('record', () => {
    it('should record a metric with correct properties', () => {
      monitor.record({
        name: 'test_operation',
        duration: 100,
        target: 200,
      });

      const history = monitor.getHistory('test_operation');
      expect(history).toHaveLength(1);
      expect(history[0].name).toBe('test_operation');
      expect(history[0].duration).toBe(100);
      expect(history[0].target).toBe(200);
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    it('should calculate status as good when within target', () => {
      monitor.record({
        name: 'test_operation',
        duration: 100,
        target: 200,
      });

      const history = monitor.getHistory('test_operation');
      expect(history[0].status).toBe('good');
    });

    it('should calculate status as warning when over target but under threshold', () => {
      monitor.record({
        name: 'test_operation',
        duration: 250,
        target: 200, // 125% of target
      });

      const history = monitor.getHistory('test_operation');
      expect(history[0].status).toBe('warning');
    });

    it('should calculate status as critical when over threshold', () => {
      monitor.record({
        name: 'test_operation',
        duration: 400,
        target: 200, // 200% of target
      });

      const history = monitor.getHistory('test_operation');
      expect(history[0].status).toBe('critical');
    });

    it('should accumulate multiple metrics', () => {
      monitor.record({ name: 'test', duration: 100, target: 200 });
      monitor.record({ name: 'test', duration: 200, target: 200 });
      monitor.record({ name: 'test', duration: 300, target: 200 });

      const history = monitor.getHistory('test');
      expect(history).toHaveLength(3);
    });

    it('should limit history size to 1000 entries', () => {
      // Record 1005 metrics
      for (let i = 0; i < 1005; i++) {
        monitor.record({ name: 'test', duration: 100, target: 200 });
      }

      const history = monitor.getHistory('test');
      expect(history.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('startMeasure', () => {
    it('should measure operation duration', async () => {
      const endMeasure = monitor.startMeasure('measured_operation');

      // Simulate some async work
      await new Promise((resolve) => setTimeout(resolve, 20));

      endMeasure();

      const history = monitor.getHistory('measured_operation');
      expect(history).toHaveLength(1);
      // Allow some tolerance for timing
      expect(history[0].duration).toBeGreaterThanOrEqual(15);
    });

    it('should return cleanup function that records metric', () => {
      const endMeasure = monitor.startMeasure('cleanup_test');
      endMeasure();

      const history = monitor.getHistory('cleanup_test');
      expect(history).toHaveLength(1);
    });
  });

  describe('getSummary', () => {
    it('should return comprehensive summary', () => {
      // Record some metrics
      monitor.record({ name: 'webcontainer_boot', duration: 3000, target: 5000 });
      monitor.record({ name: 'webcontainer_boot', duration: 4000, target: 5000 });
      monitor.record({ name: 'file_sync', duration: 100, target: 500 });
      monitor.record({ name: 'memory_usage', duration: 50000000, target: 100000000 });

      const summary = monitor.getSummary();

      expect(summary.bootTime.current).toBe(4000);
      expect(summary.bootTime.avg).toBe(3500);
      expect(summary.bootTime.target).toBe(5000);
      expect(summary.fileSyncLatency.p50).toBe(100);
      expect(summary.fileSyncLatency.target).toBe(500);
      expect(summary.memoryUsage.current).toBe(50000000);
    });
  });

  describe('getHistory', () => {
    it('should return all history when no duration specified', () => {
      monitor.record({ name: 'test', duration: 100, target: 200 });
      monitor.record({ name: 'test', duration: 200, target: 200 });

      const history = monitor.getHistory('test');
      expect(history).toHaveLength(2);
    });

    it('should filter by duration', async () => {
      // Record old metric
      monitor.record({ name: 'test', duration: 100, target: 200 });

      // Wait for 1.1 seconds to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Record recent metric
      monitor.record({ name: 'test', duration: 200, target: 200 });

      // Get history from 1 second ago
      const history = monitor.getHistory('test', 1000);
      expect(history).toHaveLength(1);
      expect(history[0].duration).toBe(200);
    });
  });

  describe('isTargetMet', () => {
    it('should return true when no metrics recorded', () => {
      expect(monitor.isTargetMet('new_metric')).toBe(true);
    });

    it('should return true when latest metric is good', () => {
      monitor.record({ name: 'test', duration: 100, target: 200 });
      expect(monitor.isTargetMet('test')).toBe(true);
    });

    it('should return false when latest metric is critical', () => {
      monitor.record({ name: 'test', duration: 400, target: 200 });
      expect(monitor.isTargetMet('test')).toBe(false);
    });

    it('should return true for warning status', () => {
      monitor.record({ name: 'test', duration: 250, target: 200 });
      expect(monitor.isTargetMet('test')).toBe(true);
    });
  });

  describe('getAverage', () => {
    it('should return 0 when no metrics', () => {
      expect(monitor.getAverage('test')).toBe(0);
    });

    it('should calculate correct average', () => {
      monitor.record({ name: 'test', duration: 100, target: 200 });
      monitor.record({ name: 'test', duration: 200, target: 200 });
      monitor.record({ name: 'test', duration: 300, target: 200 });

      expect(monitor.getAverage('test')).toBe(200);
    });
  });

  describe('getP99', () => {
    it('should return 0 when no metrics', () => {
      expect(monitor.getP99('test')).toBe(0);
    });

    it('should return approximately 99th percentile', () => {
      // Record values 1-100
      for (let i = 1; i <= 100; i++) {
        monitor.record({ name: 'test', duration: i, target: 200 });
      }

      // p99 of 1-100 should be 99 (at index 98)
      expect(monitor.getP99('test')).toBe(99);
    });
  });

  describe('getP50', () => {
    it('should return 0 when no metrics', () => {
      expect(monitor.getP50('test')).toBe(0);
    });

    it('should return median value', () => {
      // Record values 1-10
      for (let i = 1; i <= 10; i++) {
        monitor.record({ name: 'test', duration: i, target: 200 });
      }

      // p50 of 1-10 is 5 (lower median at index 4)
      expect(monitor.getP50('test')).toBe(5);
    });
  });

  describe('configureMetric', () => {
    it('should allow custom configuration', () => {
      monitor.configureMetric('custom_metric', {
        target: 100,
        warningThreshold: 2.0,
      });

      monitor.record({ name: 'custom_metric', duration: 150, target: 100 });

      const history = monitor.getHistory('custom_metric');
      expect(history[0].status).toBe('warning'); // 150% of target, below 200% threshold
    });
  });

  describe('clear', () => {
    it('should clear all metrics', () => {
      monitor.record({ name: 'test', duration: 100, target: 200 });
      monitor.record({ name: 'test2', duration: 200, target: 200 });

      monitor.clear();

      expect(monitor.getHistory('test')).toHaveLength(0);
      expect(monitor.getHistory('test2')).toHaveLength(0);
    });
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = getPerformanceMonitor();
      const instance2 = getPerformanceMonitor();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton', () => {
      const instance1 = getPerformanceMonitor();
      instance1.record({ name: 'test', duration: 100, target: 200 });

      resetPerformanceMonitor();

      const instance2 = getPerformanceMonitor();
      expect(instance2).not.toBe(instance1);
      expect(instance2.getHistory('test')).toHaveLength(0);
    });
  });
});

/**
 * Performance Monitor
 * @module lib/monitoring/performance-monitor
 *
 * Tracks performance metrics for NFR validation.
 */

export type MetricStatus = 'good' | 'warning' | 'critical';

export interface PerformanceMetric {
  name: string;
  duration: number;
  target: number;
  timestamp: Date;
  status: MetricStatus;
}

export interface PerformanceSummary {
  bootTime: { current: number; avg: number; target: number };
  fileSyncLatency: { p50: number; p99: number; target: number };
  memoryUsage: { current: number; peak: number };
  idbQueryTime: { avg: number; target: number };
}

export interface MetricConfig {
  name: string;
  target: number;
  warningThreshold: number; // percentage of target for warning status
}

const DEFAULT_CONFIG: MetricConfig = {
  name: '',
  target: 1000,
  warningThreshold: 1.5, // 50% over target = warning
};

const MAX_HISTORY_SIZE = 100;

/**
 * Performance Monitor for tracking and validating NFR metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private configs: Map<string, MetricConfig> = new Map();
  private peakMemory = 0;

  constructor() {
    // Initialize default metric configs
    this.configureMetric('webcontainer_boot', { target: 5000, warningThreshold: 1.5 });
    this.configureMetric('file_sync', { target: 500, warningThreshold: 1.5 });
    this.configureMetric('file_save', { target: 500, warningThreshold: 1.5 });
    this.configureMetric('idb_query', { target: 100, warningThreshold: 1.5 });
    this.configureMetric('agent_ttft', { target: 1000, warningThreshold: 1.5 });
  }

  /**
   * Configure a metric with custom target and thresholds
   */
  configureMetric(name: string, config: Partial<MetricConfig>): void {
    const fullConfig: MetricConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      name,
    };
    this.configs.set(name, fullConfig);
  }

  /**
   * Start measuring an operation - returns a cleanup function
   */
  startMeasure(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.record({ name, duration });
    };
  }

  /**
   * Record a performance metric
   */
  record(data: Omit<PerformanceMetric, 'timestamp' | 'status'>): void {
    const config = this.configs.get(data.name) || {
      name: data.name,
      target: data.target,
      warningThreshold: 1.5,
    };
    const status = this.calculateStatus(data.duration, config);

    const metric: PerformanceMetric = {
      ...data,
      timestamp: new Date(),
      status,
    };

    // Get existing metrics for this name
    const history = this.metrics.get(data.name) || [];
    history.push(metric);

    // Keep only the last MAX_HISTORY_SIZE entries
    if (history.length > MAX_HISTORY_SIZE) {
      history.shift();
    }

    this.metrics.set(data.name, history);

    // Update memory peak if this is memory metric
    if (data.name === 'memory_usage') {
      if (data.duration > this.peakMemory) {
        this.peakMemory = data.duration;
      }
    }

    // Log warning if critical
    if (status === 'critical') {
      console.warn(`[Performance] Critical: ${data.name} exceeded target (${data.duration}ms > ${config.target}ms)`);
    }
  }

  /**
   * Get the current summary of all metrics
   */
  getSummary(): PerformanceSummary {
    return {
      bootTime: this.getBootTimeSummary(),
      fileSyncLatency: this.getFileSyncLatencySummary(),
      memoryUsage: this.getMemoryUsageSummary(),
      idbQueryTime: this.getIdbQueryTimeSummary(),
    };
  }

  /**
   * Get historical data for a specific metric
   */
  getHistory(name: string, duration?: number): PerformanceMetric[] {
    const history = this.metrics.get(name) || [];

    if (duration === undefined) {
      return history;
    }

    const cutoff = Date.now() - duration;
    return history.filter((m) => m.timestamp.getTime() > cutoff);
  }

  /**
   * Check if NFR target is met (status is good or warning)
   */
  isTargetMet(name: string): boolean {
    const history = this.metrics.get(name);
    if (!history || history.length === 0) {
      return true; // No data means target is met by default
    }

    const latest = history[history.length - 1];
    return latest.status !== 'critical';
  }

  /**
   * Get the average value for a metric
   */
  getAverage(name: string): number {
    const history = this.metrics.get(name);
    if (!history || history.length === 0) {
      return 0;
    }

    const sum = history.reduce((acc, m) => acc + m.duration, 0);
    return sum / history.length;
  }

  /**
   * Get the p99 value for a metric
   */
  getP99(name: string): number {
    const history = this.metrics.get(name);
    if (!history || history.length === 0) {
      return 0;
    }

    const sorted = [...history].map((m) => m.duration).sort((a, b) => a - b);
    const index = Math.min(Math.floor((sorted.length - 1) * 0.99), sorted.length - 1);
    return sorted[index] || 0;
  }

  /**
   * Get the p50 (median) value for a metric
   */
  getP50(name: string): number {
    const history = this.metrics.get(name);
    if (!history || history.length === 0) {
      return 0;
    }

    const sorted = [...history].map((m) => m.duration).sort((a, b) => a - b);
    const index = Math.floor((sorted.length - 1) * 0.5);
    return sorted[index] || 0;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.peakMemory = 0;
  }

  /**
   * Calculate status based on duration and target
   */
  private calculateStatus(duration: number, config: MetricConfig): MetricStatus {
    const ratio = duration / config.target;

    if (ratio <= 1) {
      return 'good';
    } else if (ratio < config.warningThreshold) {
      return 'warning';
    } else {
      return 'critical';
    }
  }

  private getBootTimeSummary() {
    const avg = this.getAverage('webcontainer_boot');
    const history = this.metrics.get('webcontainer_boot') || [];
    const current = history.length > 0 ? history[history.length - 1].duration : 0;
    const config = this.configs.get('webcontainer_boot');

    return {
      current,
      avg,
      target: config?.target || 5000,
    };
  }

  private getFileSyncLatencySummary() {
    return {
      p50: this.getP50('file_sync'),
      p99: this.getP99('file_sync'),
      target: this.configs.get('file_sync')?.target || 500,
    };
  }

  private getMemoryUsageSummary() {
    const history = this.metrics.get('memory_usage') || [];
    const current = history.length > 0 ? history[history.length - 1].duration : 0;

    return {
      current,
      peak: this.peakMemory,
    };
  }

  private getIdbQueryTimeSummary() {
    return {
      avg: this.getAverage('idb_query'),
      target: this.configs.get('idb_query')?.target || 100,
    };
  }
}

// Singleton instance
let instance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!instance) {
    instance = new PerformanceMonitor();
  }
  return instance;
}

export function resetPerformanceMonitor(): void {
  instance = null;
}
